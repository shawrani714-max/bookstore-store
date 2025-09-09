// bookstore/seedBooks.js

const mongoose = require('mongoose');
const Book = require('./models/Book');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/bookstore';

const books = [
  {
    title: "The Alchemist",
    slug: "the-alchemist",
    author: "Paulo Coelho",
    publisher: "HarperCollins",
    isbn: "9780061122415",
    pages: 198,
    language: "English",
    dimensions: { length: 20.3, width: 13.5, height: 2.1 },
    weight: 227,
    description: "A journey of self-discovery and following your dreams.",
    price: 299,
    category: "Fiction",
    coverImage: "/images/book1.jpg",
    averageRating: 4.7,
    totalReviews: 1200,
    isFeatured: true,
    stockQuantity: 50
  },
  {
    title: "Sapiens: A Brief History of Humankind",
    slug: "sapiens-a-brief-history-of-humankind",
    author: "Yuval Noah Harari",
    publisher: "Penguin Random House",
    isbn: "9780099590088",
    pages: 464,
    language: "English",
    dimensions: { length: 19.8, width: 12.9, height: 3.2 },
    weight: 350,
    description: "A thought-provoking exploration of human history.",
    price: 399,
    category: "Non-Fiction",
    coverImage: "/images/book2.jpg",
    averageRating: 4.8,
    totalReviews: 2100,
    isFeatured: true,
    stockQuantity: 40
  },
  {
    title: "To Kill a Mockingbird",
    slug: "to-kill-a-mockingbird",
    author: "Harper Lee",
    publisher: "J.B. Lippincott & Co.",
    isbn: "9780060935467",
    pages: 336,
    language: "English",
    dimensions: { length: 19.8, width: 12.9, height: 3.2 },
    weight: 320,
    description: "A classic novel of racism and injustice in the Deep South.",
    price: 249,
    category: "Fiction",
    coverImage: "/images/book3.jpg",
    averageRating: 4.9,
    totalReviews: 3200,
    isFeatured: true,
    stockQuantity: 30
  },
  {
    title: "1984",
    slug: "1984",
    author: "George Orwell",
    publisher: "Secker & Warburg",
    isbn: "9780451524935",
    pages: 336,
    language: "English",
    dimensions: { length: 19.8, width: 12.9, height: 3.2 },
    weight: 310,
    description: "A dystopian novel about totalitarianism and surveillance.",
    price: 199,
    category: "Fiction",
    coverImage: "/images/book4.jpg",
    averageRating: 4.8,
    totalReviews: 2800,
    isFeatured: true,
    stockQuantity: 25
  },
  {
    title: "The Power of Habit",
    slug: "the-power-of-habit",
    author: "Charles Duhigg",
    publisher: "Random House",
    isbn: "9780812981605",
    pages: 320,
    language: "English",
    dimensions: { length: 19.8, width: 12.9, height: 3.2 },
    weight: 300,
    description: "Why we do what we do in life and business.",
    price: 350,
    category: "Non-Fiction",
    coverImage: "/images/book5.jpg",
    averageRating: 4.6,
    totalReviews: 950,
    isFeatured: false,
    stockQuantity: 20
  },
  {
    title: "Becoming",
    slug: "becoming",
    author: "Michelle Obama",
    publisher: "Crown Publishing Group",
    isbn: "9781524763138",
    pages: 320,
    language: "English",
    dimensions: { length: 19.8, width: 12.9, height: 3.2 },
    weight: 340,
    description: "The memoir of the former First Lady of the United States.",
    price: 399,
    category: "Biography",
    coverImage: "/images/book6.jpg",
    averageRating: 4.9,
    totalReviews: 2100,
    isFeatured: false,
    stockQuantity: 15
  },
  {
    title: "The Lord of the Rings",
    slug: "the-lord-of-the-rings",
    author: "J.R.R. Tolkien",
    publisher: "Allen & Unwin",
    isbn: "9780544003415",
    pages: 1216,
    language: "English",
    dimensions: { length: 19.8, width: 12.9, height: 3.2 },
    weight: 900,
    description: "An epic fantasy adventure in Middle-earth.",
    price: 499,
    category: "Fantasy",
    coverImage: "/images/book7.jpg",
    averageRating: 4.9,
    totalReviews: 4100,
    isFeatured: false,
    stockQuantity: 10
  },
  {
    title: "Atomic Habits",
    slug: "atomic-habits",
    author: "James Clear",
    publisher: "Penguin Random House",
    isbn: "9780735211292",
    pages: 320,
    language: "English",
    dimensions: { length: 19.8, width: 12.9, height: 3.2 },
    weight: 280,
    description: "An easy & proven way to build good habits & break bad ones.",
    price: 299,
    category: "Non-Fiction",
    coverImage: "/images/book8.jpg",
    averageRating: 4.8,
    totalReviews: 1800,
    isFeatured: false,
    stockQuantity: 35
  }
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    await Book.deleteMany({});
    await Book.insertMany(books);
    console.log('Sample books inserted!');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();