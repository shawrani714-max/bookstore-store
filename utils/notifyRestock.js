const Wishlist = require('../models/Wishlist');
const Order = require('../models/Order');
const User = require('../models/User');
const emailService = require('./emailService');

async function notifyRestock(book) {
  // Find users with this book in their wishlist
  const wishlists = await Wishlist.find({ 'items.book': book._id }).populate('user');
  const wishlistUsers = wishlists.map(w => w.user);

  // Find users who ordered this book and were refunded
  const refundedOrders = await Order.find({
    'items.book': book._id,
    paymentStatus: 'refunded'
  }).populate('user');
  const refundedUsers = refundedOrders.map(o => o.user);

  // Merge and deduplicate users
  const allUsers = [...wishlistUsers, ...refundedUsers].filter(Boolean);
  const uniqueUsers = Array.from(new Set(allUsers.map(u => u._id.toString()))).map(id => allUsers.find(u => u._id.toString() === id));

  // Send email to each user
  for (const user of uniqueUsers) {
    await emailService.sendMail({
      to: user.email,
      subject: `Book Available: ${book.title}`,
      html: `<p>Good news! The book <strong>${book.title}</strong> is now back in stock. <a href="/book/${book._id}">View Book</a></p>`
    });
  }
}

module.exports = notifyRestock;