const mongoose = require('mongoose');

// Make sure your MONGO_URI uses the 'bookstore' database, not 'test'.
const dbURI = process.env.MONGO_URI;

const connectDB = async () => {
  try {
    await mongoose.connect(dbURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully!');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    console.log('Please ensure MongoDB is running or check your connection string.');
    // Don't exit the process - let the app run without database for now
    // process.exit(1);
  }
};

module.exports = connectDB; 