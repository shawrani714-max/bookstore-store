const express = require('express');
const router = express.Router();
// Admin authentication middleware
const protectAdmin = require('../middleware/adminAuth');

// Dashboard stats
router.get('/stats', protectAdmin, async (req, res) => {
  // TODO: Replace with real stats
  res.json({
    users: 120,
    books: 340,
    orders: 56,
    revenue: 12345
  });
});

// TODO: Add routes for managing books, users, orders, analytics, settings

// Bulk product import/update via Excel
const multer = require('multer');
const XLSX = require('xlsx');
const Book = require('../models/Book');

const upload = multer({ storage: multer.memoryStorage() });

router.post('/books/bulk-upload', protectAdmin, upload.single('excel'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  try {
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const products = XLSX.utils.sheet_to_json(sheet);
    let added = 0, updated = 0, errors = [];
    for (const prod of products) {
      if (!prod.ISBN && !prod.title) {
        errors.push({ row: prod, error: 'Missing ISBN or title' });
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

module.exports = router;
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

// Admin login endpoint
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
