const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: './config.env' });

// Import database connection
const connectDB = require('./config/database');

// Import middleware
const { errorHandler, notFound } = require('./middleware/error');

// Import routes
const authRoutes = require('./routes/auth');
const bookRoutes = require('./routes/books');
const cartRoutes = require('./routes/cart');
const wishlistRoutes = require('./routes/wishlist');
const orderRoutes = require('./routes/orders');
const couponRoutes = require('./routes/coupons');
const reviewRoutes = require('./routes/reviews');

// Initialize express app
const app = express();

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://fonts.googleapis.com",
        "https://cdn.jsdelivr.net",
        "https://cdnjs.cloudflare.com"
      ],
      fontSrc: [
        "'self'",
        "https://fonts.gstatic.com",
        "https://cdn.jsdelivr.net",
        "https://cdnjs.cloudflare.com"
      ],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://widget.cloudinary.com"],
      connectSrc: ["'self'", "https://api.cloudinary.com"]
    }
  }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
  ? [
      'https://bookstore-5iz9.onrender.com', // your Render domain
      'https://yourdomain.com', 
      'https://www.yourdomain.com'
    ]
  : [
      'http://localhost:3000', 
      'http://localhost:5000', 
      'http://127.0.0.1:5500'
    ],
}));

// Compression middleware
app.use(compression());

// Static files - serve from correct directories
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/favicon.ico', express.static(path.join(__dirname, 'images', 'favicon.ico')));

// Serve static files from project root (HTML files are at root)
app.use(express.static(__dirname));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Bookworld India API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API root info
app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Bookworld India API',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      books: '/api/books',
      cart: '/api/cart',
      wishlist: '/api/wishlist',
      orders: '/api/orders',
      coupons: '/api/coupons',
      reviews: '/api/reviews',
      admin: '/api/admin',
      affiliate: '/api/affiliate',
      orderAdmin: '/api/order-admin'
    }
  });
});

// API Routes
const orderAdminRoutes = require('./routes/order-admin');
app.use('/api/order-admin', orderAdminRoutes);
const affiliateRoutes = require('./routes/affiliate');
app.use('/api/affiliate', affiliateRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/reviews', reviewRoutes);
// Register admin API route
const adminRoutes = require('./routes/admin');
app.use('/api/admin', adminRoutes);

// Serve HTML pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/shop', (req, res) => {
  res.sendFile(path.join(__dirname, 'shop.html'));
});

app.get('/cart', (req, res) => {
  res.sendFile(path.join(__dirname, 'cart.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'signup.html'));
});

app.get('/profile', (req, res) => {
  res.sendFile(path.join(__dirname, 'profile.html'));
});

app.get('/wishlist', (req, res) => {
  res.sendFile(path.join(__dirname, 'wishlist.html'));
});

app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, 'about.html'));
});

app.get('/contact', (req, res) => {
  res.sendFile(path.join(__dirname, 'contact.html'));
});

app.get('/blog', (req, res) => {
  res.sendFile(path.join(__dirname, 'blog.html'));
});

app.get('/book.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'book.html'));
});

app.get('/blog-detail.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'blog-detail.html'));
});

app.get('/order-success.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'order-success.html'));
});

app.get('/view-orders.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'view-orders.html'));
});

// Serve affiliate dashboard
app.get('/affiliate', (req, res) => {
  res.sendFile(path.join(__dirname, 'affiliate.html'));
});

// Serve admin order management page
app.get('/admin-orders', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin-orders.html'));
});

// Serve admin panel HTML
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// ...removed console.log...
app.get('/checkout.html', (req, res) => {
  // ...removed console.log...
  res.sendFile(path.join(__dirname, 'checkout.html'));
});

// 404 handler
app.use(notFound);

// Error handler (must be last)
app.use(errorHandler);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  // Close server & exit process
  process.exit(1);
});

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, '0.0.0.0', () => {
});

module.exports = app; 
