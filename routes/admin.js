const express = require('express');
const router = express.Router();
const protectAdmin = require('../middleware/adminAuth');
const logger = require('../utils/logger');

// Paginated and searchable users
router.get('/users', protectAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const search = req.query.search || '';
    const query = search ? {
      $or: [
        { email: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } }
      ]
    } : {};
    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .skip((page-1)*limit)
      .limit(limit)
      .sort({ createdAt: -1 });
    res.json({ users, totalPages: Math.ceil(total/limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to load users', error: err.message });
  }
});

// Paginated and searchable orders
router.get('/orders', protectAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const search = req.query.search || '';
    const query = search ? {
      $or: [
        { _id: { $regex: search, $options: 'i' } },
        { userName: { $regex: search, $options: 'i' } },
        { status: { $regex: search, $options: 'i' } }
      ]
    } : {};
    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .skip((page-1)*limit)
      .limit(limit)
      .sort({ createdAt: -1 });
    res.json({ orders, totalPages: Math.ceil(total/limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to load orders', error: err.message });
  }
});
// Audit log API
const AuditLog = require('../models/AuditLog');

// Log an admin action
async function logAdminAction(action, details, req) {
  try {
    await AuditLog.create({
      action,
      details,
      admin: req.user?.email || 'unknown'
    });
  } catch (err) {
    // Silent fail
  }
}

// Get audit log
router.get('/audit-log', protectAdmin, async (req, res) => {
  try {
    const logs = await AuditLog.find().sort({ timestamp: -1 }).limit(100);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to load audit log', error: err.message });
  }
});
// Page management API
const Page = require('../models/Page');

// Get all pages
router.get('/pages', protectAdmin, async (req, res) => {
  try {
    const pages = await Page.find().sort({ order: 1 });
    res.json(pages);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to load pages', error: err.message });
  }
});

// Add new page
router.post('/pages', protectAdmin, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || typeof name !== 'string' || !/^[a-zA-Z0-9 _-]{2,32}$/.test(name)) {
      return res.status(400).json({ success: false, message: 'Invalid page name.' });
    }
    if (await Page.findOne({ name })) return res.status(400).json({ success: false, message: 'Page already exists' });
    const order = await Page.countDocuments();
    const page = await Page.create({ name, order });
    res.json({ success: true, page });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to add page', error: err.message });
  }
});

// Rename page
router.put('/pages/:id/rename', protectAdmin, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || typeof name !== 'string' || !/^[a-zA-Z0-9 _-]{2,32}$/.test(name)) {
      return res.status(400).json({ success: false, message: 'Invalid page name.' });
    }
    const page = await Page.findById(req.params.id);
    if (!page) return res.status(404).json({ success: false, message: 'Page not found' });
    page.name = name;
    await page.save();
    res.json({ success: true, page });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to rename page', error: err.message });
  }
});

// Hide/show page
router.put('/pages/:id/visible', protectAdmin, async (req, res) => {
  try {
    const { visible } = req.body;
    if (typeof visible !== 'boolean') {
      return res.status(400).json({ success: false, message: 'Invalid visibility value.' });
    }
    const page = await Page.findById(req.params.id);
    if (!page) return res.status(404).json({ success: false, message: 'Page not found' });
    page.visible = visible;
    await page.save();
    res.json({ success: true, page });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update visibility', error: err.message });
  }
});

// Delete page
router.delete('/pages/:id', protectAdmin, async (req, res) => {
  try {
    await Page.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete page', error: err.message });
  }
});

// Reorder pages
router.put('/pages/reorder', protectAdmin, async (req, res) => {
  try {
    const { order } = req.body; // [{id, order}, ...]
    if (!Array.isArray(order)) {
      return res.status(400).json({ success: false, message: 'Invalid order array.' });
    }
    for (const item of order) {
      if (!item.id || typeof item.order !== 'number') continue;
      await Page.findByIdAndUpdate(item.id, { order: item.order });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to reorder pages', error: err.message });
  }
});
// Admin authentication middleware
// Dashboard stats (real data)
const User = require('../models/User');
const Order = require('../models/Order');
const Book = require('../models/Book');

// ...existing code...

// Get all books (for admin panel)
router.get('/books', protectAdmin, async (req, res) => {
  try {
    const books = await Book.find({});
    res.json(books);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch books', error: err.message });
  }
});

// Delete a book by ID
router.delete('/books/:id', protectAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    if (!id || !/^[a-fA-F0-9]{24}$/.test(id)) {
      return res.status(400).json({ success: false, message: 'Invalid book ID.' });
    }
    const book = await Book.findByIdAndDelete(id);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete book', error: err.message });
  }
});
router.get('/stats', protectAdmin, async (req, res) => {
  try {
    const [users, books, orders, revenueAgg] = await Promise.all([
      User.countDocuments({}),
      Book.countDocuments({}),
      Order.countDocuments({}),
      Order.aggregate([
        { $match: { $or: [ { paymentStatus: 'completed' }, { status: 'delivered' } ] } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ])
    ]);

    const revenue = revenueAgg && revenueAgg[0] ? revenueAgg[0].total : 0;

    res.json({
      success: true,
      users,
      books,
      orders,
      revenue
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to load stats', error: err.message });
  }
});

// TODO: Add routes for managing books, users, orders, analytics, settings
// Theme settings model
const mongoose = require('mongoose');
const themeSchema = new mongoose.Schema({
  primaryColor: { type: String, default: '#e94e77' },
  accentColor: { type: String, default: '#ff6b9d' },
  bgColor: { type: String, default: '#ffffff' },
  cardColor: { type: String, default: '#fff' },
  fontSettings: {
    headerFont: { type: String, default: 'Poppins' },
    contentFont: { type: String, default: 'Poppins' },
    sidebarFont: { type: String, default: 'Poppins' }
  }
});
const Theme = mongoose.models.Theme || mongoose.model('Theme', themeSchema);

// Get theme settings
router.get('/theme', async (req, res) => {
  try {
    let theme = await Theme.findOne();
    if (!theme) theme = await Theme.create({});
    res.json({
      primaryColor: theme.primaryColor,
      accentColor: theme.accentColor,
      bgColor: theme.bgColor,
      cardColor: theme.cardColor,
      fontSettings: theme.fontSettings || {
        headerFont: 'Poppins',
        contentFont: 'Poppins',
        sidebarFont: 'Poppins'
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to load theme', error: err.message });
  }
});

// Update theme settings
router.post('/theme', protectAdmin, async (req, res) => {
  try {
    const { primaryColor, accentColor, bgColor, cardColor, fontSettings } = req.body;
    // Validate colors (hex)
    const hexColor = /^#[0-9A-Fa-f]{6}$/;
    if (primaryColor && !hexColor.test(primaryColor)) return res.status(400).json({ success: false, message: 'Invalid primary color.' });
    if (accentColor && !hexColor.test(accentColor)) return res.status(400).json({ success: false, message: 'Invalid accent color.' });
    if (bgColor && !hexColor.test(bgColor)) return res.status(400).json({ success: false, message: 'Invalid background color.' });
    if (cardColor && !hexColor.test(cardColor)) return res.status(400).json({ success: false, message: 'Invalid card color.' });
    // Validate font settings
    if (fontSettings) {
      const fontName = /^[a-zA-Z0-9 _-]{2,32}$/;
      for (const key of ['headerFont', 'contentFont', 'sidebarFont']) {
        if (fontSettings[key] && !fontName.test(fontSettings[key])) {
          return res.status(400).json({ success: false, message: `Invalid font name for ${key}.` });
        }
      }
    }
    await logAdminAction('Update Theme', JSON.stringify(req.body), req);
    let theme = await Theme.findOne();
    if (!theme) theme = await Theme.create({});
    theme.primaryColor = primaryColor || theme.primaryColor;
    theme.accentColor = accentColor || theme.accentColor;
    theme.bgColor = bgColor || theme.bgColor;
    theme.cardColor = cardColor || theme.cardColor;
    if (fontSettings) {
      theme.fontSettings = fontSettings;
    }
    await theme.save();
    res.json({ success: true, theme });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to save theme', error: err.message });
  }
});
// Banner management
const Banner = require('../models/Banner');
const { uploadSingle, handleUploadError, processUpload } = require('../middleware/upload');

// List banners
router.get('/banners', protectAdmin, async (req, res) => {
  try {
    logger.info('Fetching banners for admin', { adminId: req.admin._id });
    const banners = await Banner.find().sort({ order: 1, createdAt: -1 });
    logger.info('Banners fetched successfully', { count: banners.length });
    res.json({ success: true, data: banners });
  } catch (error) {
    logger.error('Failed to fetch banners', { error: error.message, adminId: req.admin._id });
    res.status(500).json({ success: false, message: 'Failed to fetch banners' });
  }
});

// Create banner
router.post('/banners', protectAdmin, uploadSingle, handleUploadError, processUpload, async (req, res) => {
  try {
    let imageUrl = req.body.imageUrl;
    let publicId;
    if (!imageUrl && req.file) {
      const cloudinary = require('../src/config/cloudinary');
      const base64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      const result = await cloudinary.uploadImage(base64, 'bookworld-india/banners');
      if (!result.success) return res.status(400).json({ success: false, message: result.error || 'Upload failed' });
      imageUrl = result.url;
      publicId = result.public_id;
    }
    if (!imageUrl) return res.status(400).json({ success: false, message: 'Banner image is required' });
    const { title, subtitle, ctaText, ctaLink, order, active, overlay, textColor, ctaColor, ctaBg } = req.body;
    const banner = await Banner.create({ title, subtitle, ctaText, ctaLink, imageUrl, publicId, overlay: overlay === 'true' || overlay === true, textColor: textColor || '#ffffff', ctaColor: ctaColor || '#ffffff', ctaBg: ctaBg || '#e94e77', order: Number(order)||0, active: active !== 'false' });
    res.json({ success: true, data: banner });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create banner', error: err.message });
  }
});

// Update banner
router.put('/banners/:id', protectAdmin, uploadSingle, handleUploadError, processUpload, async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) return res.status(404).json({ success: false, message: 'Banner not found' });

    if (req.file) {
      const cloudinary = require('../src/config/cloudinary');
      const base64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      const result = await cloudinary.uploadImage(base64, 'bookworld-india/banners');
      if (!result.success) return res.status(400).json({ success: false, message: result.error || 'Upload failed' });
      banner.imageUrl = result.url;
      banner.publicId = result.public_id;
    }

    ['title','subtitle','ctaText','ctaLink','textColor','ctaColor','ctaBg'].forEach(k => {
      if (typeof req.body[k] !== 'undefined') banner[k] = req.body[k];
    });
    if (typeof req.body.order !== 'undefined') banner.order = Number(req.body.order) || 0;
    if (typeof req.body.active !== 'undefined') banner.active = req.body.active === 'true' || req.body.active === true;
    if (typeof req.body.overlay !== 'undefined') banner.overlay = req.body.overlay === 'true' || req.body.overlay === true;

    await banner.save();
    res.json({ success: true, data: banner });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update banner', error: err.message });
  }
});

// Delete banner
router.delete('/banners/:id', protectAdmin, async (req, res) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);
    if (!banner) return res.status(404).json({ success: false, message: 'Banner not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete banner', error: err.message });
  }
});

// Reorder banners
router.put('/banners/reorder', protectAdmin, async (req, res) => {
  try {
    const { order } = req.body; // [{id, order}]
    if (!Array.isArray(order)) return res.status(400).json({ success:false, message:'Invalid order array' });
    for (const item of order) {
      if (!item.id) continue;
      await Banner.findByIdAndUpdate(item.id, { order: Number(item.order)||0 });
    }
    res.json({ success:true });
  } catch (err) {
    res.status(500).json({ success:false, message:'Failed to reorder banners' });
  }
});
// Analytics route for admin panel
router.get('/analytics', protectAdmin, async (req, res) => {
  try {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Total sales and revenue
    const totalRevenueAgg = await Order.aggregate([
      { $match: { paymentStatus: 'completed' } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);
    const totalRevenue = totalRevenueAgg[0]?.total || 0;

    // Number of orders (daily, weekly, monthly)
    const dailyOrders = await Order.countDocuments({ createdAt: { $gte: startOfDay } });
    const weeklyOrders = await Order.countDocuments({ createdAt: { $gte: startOfWeek } });
    const monthlyOrders = await Order.countDocuments({ createdAt: { $gte: startOfMonth } });

    // Top-selling books/items
    const topBooksAgg = await Order.aggregate([
      { $unwind: '$items' },
      { $group: { _id: '$items.book', count: { $sum: '$items.quantity' } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    const topBooks = await Book.find({ _id: { $in: topBooksAgg.map(b => b._id) } }, 'title author');

    // User growth statistics
    const userGrowthAgg = await User.aggregate([
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    // Order status breakdown
    const statusAgg = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Revenue trends (last 30 days)
    const revenueTrendAgg = await Order.aggregate([
      { $match: { paymentStatus: 'completed', createdAt: { $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30) } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, total: { $sum: '$total' } } },
      { $sort: { _id: 1 } }
    ]);

    // Geographic distribution
    const geoAgg = await Order.aggregate([
      { $group: { _id: '$shippingAddress.city', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      totalRevenue,
      dailyOrders,
      weeklyOrders,
      monthlyOrders,
      topBooks,
      userGrowth: userGrowthAgg,
      orderStatus: statusAgg,
      revenueTrend: revenueTrendAgg,
      geoDistribution: geoAgg
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to load analytics', error: err.message });
  }
});
// ...existing code...

// Bulk product import/update via Excel
const multer = require('multer');
const XLSX = require('xlsx');

const upload = multer({ storage: multer.memoryStorage() });

router.post('/books/bulk-upload', protectAdmin, upload.single('excel'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  // Validate file type (Excel)
  if (!req.file.originalname.match(/\.(xlsx|xls)$/i)) {
    return res.status(400).json({ success: false, message: 'Invalid file type. Only Excel files allowed.' });
  }
  try {
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const products = XLSX.utils.sheet_to_json(sheet);
    let added = 0, updated = 0, errors = [];
    for (const prod of products) {
      // Validate product fields
      if (!prod.ISBN && !prod.title) {
        errors.push({ row: prod, error: 'Missing ISBN or title' });
        continue;
      }
      if (prod.title && (typeof prod.title !== 'string' || prod.title.length < 2 || prod.title.length > 128)) {
        errors.push({ row: prod, error: 'Invalid title' });
        continue;
      }
      if (prod.ISBN && (typeof prod.ISBN !== 'string' || prod.ISBN.length < 8 || prod.ISBN.length > 20)) {
        errors.push({ row: prod, error: 'Invalid ISBN' });
        continue;
      }
      // Try to find by ISBN or title
      let book = await Book.findOne({ $or: [ { ISBN: prod.ISBN }, { title: prod.title } ] });
      const notifyRestock = require('../utils/notifyRestock');
      if (book) {
        // Track previous stock
        const prevStock = book.stockQuantity;
        Object.assign(book, prod);
        await book.save();
        updated++;
        // Notify if restocked
        if (typeof prod.stockQuantity !== 'undefined' && prevStock === 0 && book.stockQuantity > 0) {
          notifyRestock(book);
        }
      } else {
        // Add new book
        const newBook = await Book.create(prod);
        added++;
        // Notify if restocked
        if (typeof prod.stockQuantity !== 'undefined' && prod.stockQuantity > 0) {
          notifyRestock(newBook);
        }
      }
    }
    res.json({ success: true, added, updated, errors });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error processing file', error: err.message });
  }
});

const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

// Admin login endpoint (kept above export)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password required' });
  }
  const admin = await Admin.findOne({ email: email.toLowerCase(), isActive: true });
  if (!admin) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
  const isMatch = await admin.correctPassword(password, admin.password);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
  // Generate JWT
  const token = jwt.sign({ id: admin._id, role: admin.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
  admin.updateLastLogin();
  res.json({ success: true, token, admin: { id: admin._id, email: admin.email, role: admin.role, name: admin.fullName } });
});

module.exports = router;