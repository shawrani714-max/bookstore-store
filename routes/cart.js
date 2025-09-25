const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Book = require('../models/Book');
const { protect } = require('../middleware/auth');

// @route   GET /api/cart
// @desc    Get user's cart
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        let cart = await Cart.findOne({ user: req.user.id }).populate('items.book');
        
        if (!cart) {
            cart = new Cart({ user: req.user.id, items: [] });
            await cart.save();
        }
        
        res.json({
            success: true,
            data: cart
        });
    } catch (error) {
        console.error('Cart get error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   POST /api/cart/add
// @desc    Add item to cart
// @access  Private
router.post('/add', protect, async (req, res) => {
    try {
        const { bookId, quantity = 1 } = req.body;
        
        // Validate book exists
        const book = await Book.findById(bookId);
        if (!book) {
            return res.status(404).json({
                success: false,
                message: 'Book not found'
            });
        }
        
        // Debug logging
        console.log('Book found:', book);
        console.log('Book price:', book.price);
        if (!book.price && book.price !== 0) {
            console.error('Book price is missing for bookId:', bookId);
            return res.status(400).json({
                success: false,
                message: 'Book price is missing or invalid in the database.'
            });
        }
        
        let cart = await Cart.findOne({ user: req.user.id });
        
        if (!cart) {
            cart = new Cart({ user: req.user.id, items: [] });
        }
        
        // Check if book already in cart
        const existingItem = cart.items.find(item => item.book.toString() === bookId);
        
        if (existingItem) {
            existingItem.quantity += quantity;
            existingItem.price = book.price;
            if (book.originalPrice) existingItem.originalPrice = book.originalPrice;
            if (book.discount) existingItem.discount = book.discount;
        } else {
            cart.items.push({
                book: bookId,
                quantity,
                price: book.price,
                originalPrice: book.originalPrice,
                discount: book.discount || 0
            });
        }
        console.log('Cart before save:', cart);
        
        await cart.save();
        await cart.populate('items.book');
        
        res.json({
            success: true,
            data: cart
        });
    } catch (error) {
        console.error('Cart add error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   PUT /api/cart/update
// @desc    Update cart item quantity
// @access  Private
router.put('/update', protect, async (req, res) => {
    try {
        const { bookId, quantity } = req.body;
        
        if (quantity < 1) {
            return res.status(400).json({
                success: false,
                message: 'Quantity must be at least 1'
            });
        }
        
        const cart = await Cart.findOne({ user: req.user.id });
        
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }
        
        const item = cart.items.find(item => item.book.toString() === bookId);
        
        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Item not found in cart'
            });
        }
        
        item.quantity = quantity;
        await cart.save();
        await cart.populate('items.book');
        
        res.json({
            success: true,
            data: cart
        });
    } catch (error) {
        console.error('Cart update error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   DELETE /api/cart/:bookId
// @desc    Remove item from cart
// @access  Private
router.delete('/:bookId', protect, async (req, res) => {
    try {
        const { bookId } = req.params;
        
        const cart = await Cart.findOne({ user: req.user.id });
        
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }
        
        cart.items = cart.items.filter(item => item.book.toString() !== bookId);
        await cart.save();
        await cart.populate('items.book');
        
        res.json({
            success: true,
            data: cart
        });
    } catch (error) {
        console.error('Cart remove error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   DELETE /api/cart
// @desc    Clear entire cart
// @access  Private
router.delete('/', protect, async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user.id });
        
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }
        
        cart.items = [];
        await cart.save();
        
        res.json({
            success: true,
            message: 'Cart cleared successfully'
        });
    } catch (error) {
        console.error('Cart clear error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

module.exports = router; 
