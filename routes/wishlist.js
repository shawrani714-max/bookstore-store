const express = require('express');
const router = express.Router();
const Wishlist = require('../models/Wishlist');
const Book = require('../models/Book');
const { protect } = require('../middleware/auth');

// @route   GET /api/wishlist
// @desc    Get user's wishlist
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        let wishlist = await Wishlist.findOne({ user: req.user.id }).populate('items.book');
        
        if (!wishlist) {
            wishlist = new Wishlist({ user: req.user.id, items: [] });
            await wishlist.save();
        }
        
        res.json({
            success: true,
            data: wishlist.items
        });
    } catch (error) {
        console.error('Wishlist get error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   POST /api/wishlist/add
// @desc    Add book to wishlist
// @access  Private
router.post('/add', protect, async (req, res) => {
    try {
        const { bookId } = req.body;
        
        // Validate book exists
        const book = await Book.findById(bookId);
        if (!book) {
            return res.status(404).json({
                success: false,
                message: 'Book not found'
            });
        }
        
        let wishlist = await Wishlist.findOne({ user: req.user.id });
        
        if (!wishlist) {
            wishlist = new Wishlist({ user: req.user.id, items: [] });
        }
        
        // Check if book already in wishlist
        const existingItem = wishlist.items.find(item => item.book.toString() === bookId);
        
        if (existingItem) {
            return res.status(400).json({
                success: false,
                message: 'Book already in wishlist'
            });
        }
        
        wishlist.items.push({ book: bookId });
        await wishlist.save();
        await wishlist.populate('items.book');
        
        res.json({
            success: true,
            data: wishlist.items
        });
    } catch (error) {
        console.error('Wishlist add error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   DELETE /api/wishlist/:bookId
// @desc    Remove book from wishlist
// @access  Private
router.delete('/:bookId', protect, async (req, res) => {
    try {
        const { bookId } = req.params;
        
        const wishlist = await Wishlist.findOne({ user: req.user.id });
        
        if (!wishlist) {
            return res.status(404).json({
                success: false,
                message: 'Wishlist not found'
            });
        }
        
        wishlist.items = wishlist.items.filter(item => item.book.toString() !== bookId);
        await wishlist.save();
        await wishlist.populate('items.book');
        
        res.json({
            success: true,
            data: wishlist.items
        });
    } catch (error) {
        console.error('Wishlist remove error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   DELETE /api/wishlist
// @desc    Clear entire wishlist
// @access  Private
router.delete('/', protect, async (req, res) => {
    try {
        const wishlist = await Wishlist.findOne({ user: req.user.id });
        
        if (!wishlist) {
            return res.status(404).json({
                success: false,
                message: 'Wishlist not found'
            });
        }
        
        wishlist.items = [];
        await wishlist.save();
        
        res.json({
            success: true,
            message: 'Wishlist cleared successfully'
        });
    } catch (error) {
        console.error('Wishlist clear error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

module.exports = router; 