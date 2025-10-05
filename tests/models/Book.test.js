const Book = require('../../models/Book');

describe('Book Model', () => {
  beforeEach(async () => {
    await Book.deleteMany({});
  });

  describe('Book Creation', () => {
    it('should create a book with valid data', async () => {
      const bookData = {
        title: 'Test Book',
        author: 'Test Author',
        isbn: '1234567890123',
        description: 'Test description',
        category: 'Fiction',
        price: 299,
        stockQuantity: 10,
        coverImage: 'https://example.com/image.jpg'
      };

      const book = await Book.create(bookData);
      
      expect(book.title).toBe(bookData.title);
      expect(book.author).toBe(bookData.author);
      expect(book.isbn).toBe(bookData.isbn);
      expect(book.isActive).toBe(true);
    });

    it('should not create book without required fields', async () => {
      const bookData = {
        title: 'Test Book'
        // Missing required fields
      };

      await expect(Book.create(bookData)).rejects.toThrow();
    });

    it('should not create book with duplicate ISBN', async () => {
      const bookData = {
        title: 'Test Book',
        author: 'Test Author',
        isbn: '1234567890123',
        description: 'Test description',
        category: 'Fiction',
        price: 299,
        stockQuantity: 10,
        coverImage: 'https://example.com/image.jpg'
      };

      await Book.create(bookData);
      
      await expect(Book.create(bookData)).rejects.toThrow();
    });
  });

  describe('Book Virtuals', () => {
    let book;

    beforeEach(async () => {
      book = await Book.create({
        title: 'Test Book',
        author: 'Test Author',
        isbn: '1234567890123',
        description: 'Test description',
        category: 'Fiction',
        price: 299,
        originalPrice: 399,
        stockQuantity: 10,
        coverImage: 'https://example.com/image.jpg'
      });
    });

    it('should calculate discounted price correctly', () => {
      expect(book.discountedPrice).toBe(299);
    });

    it('should calculate discount percentage correctly', () => {
      expect(book.discountPercentage).toBe(25); // (399-299)/399 * 100
    });

    it('should show correct stock status', () => {
      expect(book.stockStatus).toBe('In Stock');
    });

    it('should show low stock status', async () => {
      book.stockQuantity = 3;
      book.lowStockThreshold = 5;
      await book.save();
      
      expect(book.stockStatus).toBe('Low Stock');
    });

    it('should show out of stock status', async () => {
      book.stockQuantity = 0;
      await book.save();
      
      expect(book.stockStatus).toBe('Out of Stock');
    });
  });

  describe('Book Static Methods', () => {
    beforeEach(async () => {
      // Create test books
      await Book.create({
        title: 'Fiction Book 1',
        author: 'Author 1',
        isbn: '1234567890123',
        description: 'Description 1',
        category: 'Fiction',
        price: 299,
        stockQuantity: 10,
        coverImage: 'https://example.com/image1.jpg',
        isFeatured: true
      });

      await Book.create({
        title: 'Non-Fiction Book 1',
        author: 'Author 2',
        isbn: '1234567890124',
        description: 'Description 2',
        category: 'Non-Fiction',
        price: 399,
        stockQuantity: 5,
        coverImage: 'https://example.com/image2.jpg',
        isBestSeller: true
      });
    });

    it('should find books by category', async () => {
      const fictionBooks = await Book.findByCategory('Fiction');
      
      expect(fictionBooks).toHaveLength(1);
      expect(fictionBooks[0].category).toBe('Fiction');
    });

    it('should find featured books', async () => {
      const featuredBooks = await Book.findFeatured();
      
      expect(featuredBooks).toHaveLength(1);
      expect(featuredBooks[0].isFeatured).toBe(true);
    });

    it('should find best sellers', async () => {
      const bestsellers = await Book.findBestSellers();
      
      expect(bestsellers).toHaveLength(1);
      expect(bestsellers[0].isBestSeller).toBe(true);
    });

    it('should search books', async () => {
      const searchResults = await Book.search('Fiction');
      
      expect(searchResults).toHaveLength(1);
      expect(searchResults[0].title).toContain('Fiction');
    });
  });

  describe('Book Instance Methods', () => {
    let book;

    beforeEach(async () => {
      book = await Book.create({
        title: 'Test Book',
        author: 'Test Author',
        isbn: '1234567890123',
        description: 'Test description',
        category: 'Fiction',
        price: 299,
        stockQuantity: 10,
        coverImage: 'https://example.com/image.jpg'
      });
    });

    it('should update stock correctly', async () => {
      await book.updateStock(5, 'subtract');
      
      expect(book.stockQuantity).toBe(5);
    });

    it('should reserve stock correctly', async () => {
      await book.reserveStock(3);
      
      expect(book.reservedQuantity).toBe(3);
      expect(book.availableStock).toBe(7);
    });

    it('should release reserved stock correctly', async () => {
      book.reservedQuantity = 5;
      await book.save();
      
      await book.releaseReservedStock(2);
      
      expect(book.reservedQuantity).toBe(3);
    });
  });
});
