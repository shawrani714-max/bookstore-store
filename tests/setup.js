const mongoose = require('mongoose');

// Setup test database
beforeAll(async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/bookworld-test';
  
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

// Cleanup after each test
afterEach(async () => {
  const collections = mongoose.connection.collections;
  
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

// Close database connection after all tests
afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.MONGO_URI = 'mongodb://localhost:27017/test';
process.env.REDIS_HOST = 'localhost';
process.env.REDIS_PORT = '6379';
process.env.CLOUDINARY_CLOUD_NAME = 'test-cloud';
process.env.CLOUDINARY_API_KEY = 'test-key';
process.env.CLOUDINARY_API_SECRET = 'test-secret';
process.env.EMAIL_USER = 'test@example.com';
process.env.EMAIL_PASS = 'test-password';
process.env.FRONTEND_URL = 'http://localhost:3000';

// Mock external services
jest.mock('../config/redis', () => ({
  cacheService: {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    delPattern: jest.fn(),
    healthCheck: jest.fn(() => Promise.resolve(true))
  }
}));

jest.mock('../config/cloudinary', () => ({
  uploadImage: jest.fn(() => Promise.resolve({
    success: true,
    url: 'https://test-cloudinary.com/test-image.jpg'
  }))
}));

jest.mock('../utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn()
}));

// Global test utilities
global.testUtils = {
  createTestUser: async (User, userData = {}) => {
    const defaultUser = {
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      password: 'password123',
      ...userData
    };
    
    return await User.create(defaultUser);
  },
  
  createTestBook: async (Book, bookData = {}) => {
    const defaultBook = {
      title: 'Test Book',
      author: 'Test Author',
      isbn: '1234567890123',
      description: 'Test description',
      category: 'Fiction',
      price: 299,
      stockQuantity: 10,
      coverImage: 'https://test-image.com/book.jpg',
      ...bookData
    };
    
    return await Book.create(defaultBook);
  },
  
  createTestOrder: async (Order, orderData = {}) => {
    const defaultOrder = {
      orderNumber: 'ORD123456789',
      user: orderData.user || new mongoose.Types.ObjectId(),
      items: [{
        book: orderData.book || new mongoose.Types.ObjectId(),
        title: 'Test Book',
        author: 'Test Author',
        quantity: 1,
        price: 299
      }],
      subtotal: 299,
      total: 299,
      shippingAddress: {
        fullName: 'Test User',
        phone: '1234567890',
        street: '123 Test St',
        city: 'Test City',
        state: 'Test State',
        zipCode: '12345',
        country: 'India'
      },
      paymentMethod: 'online',
      ...orderData
    };
    
    return await Order.create(defaultOrder);
  },
  
  generateAuthToken: (user) => {
    const jwt = require('jsonwebtoken');
    return jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  }
};
