const request = require('supertest');
const app = require('../../server');
const Book = require('../../models/Book');
const User = require('../../models/User');

describe('Books Routes', () => {
  beforeEach(async () => {
    await Book.deleteMany({});
    await User.deleteMany({});
  });

  describe('GET /api/books', () => {
    beforeEach(async () => {
      // Create test books
      await global.testUtils.createTestBook(Book, { title: 'Book 1', price: 299 });
      await global.testUtils.createTestBook(Book, { title: 'Book 2', price: 399 });
    });

    it('should get all books', async () => {
      const response = await request(app)
        .get('/api/books')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.books).toHaveLength(2);
    });

    it('should filter books by category', async () => {
      await global.testUtils.createTestBook(Book, { 
        title: 'Fiction Book', 
        category: 'Fiction' 
      });

      const response = await request(app)
        .get('/api/books?category=Fiction')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.books).toHaveLength(1);
      expect(response.body.data.books[0].category).toBe('Fiction');
    });

    it('should search books by title', async () => {
      const response = await request(app)
        .get('/api/books?search=Book 1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.books).toHaveLength(1);
      expect(response.body.data.books[0].title).toBe('Book 1');
    });
  });

  describe('GET /api/books/:id', () => {
    let book;

    beforeEach(async () => {
      book = await global.testUtils.createTestBook(Book);
    });

    it('should get book by id', async () => {
      const response = await request(app)
        .get(`/api/books/${book._id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.book.title).toBe(book.title);
    });

    it('should return 404 for non-existent book', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .get(`/api/books/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/books', () => {
    let user, token;

    beforeEach(async () => {
      user = await global.testUtils.createTestUser(User, { isAdmin: true });
      token = global.testUtils.generateAuthToken(user);
    });

    it('should create book as admin', async () => {
      const bookData = {
        title: 'New Book',
        author: 'New Author',
        isbn: '1234567890123',
        description: 'New book description',
        category: 'Fiction',
        price: 299,
        stockQuantity: 10,
        coverImage: 'https://example.com/image.jpg'
      };

      const response = await request(app)
        .post('/api/books')
        .set('Authorization', `Bearer ${token}`)
        .send(bookData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.book.title).toBe(bookData.title);
    });

    it('should not create book without admin privileges', async () => {
      const regularUser = await global.testUtils.createTestUser(User, { isAdmin: false });
      const regularToken = global.testUtils.generateAuthToken(regularUser);

      const bookData = {
        title: 'New Book',
        author: 'New Author',
        isbn: '1234567890123',
        description: 'New book description',
        category: 'Fiction',
        price: 299,
        stockQuantity: 10,
        coverImage: 'https://example.com/image.jpg'
      };

      const response = await request(app)
        .post('/api/books')
        .set('Authorization', `Bearer ${regularToken}`)
        .send(bookData)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });
});
