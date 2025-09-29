const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Book = require('../models/Book');
const { protect } = require('../middleware/auth');

// @route   GET /api/orders
// @desc    Get user's orders
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user.id })
            .populate('items.book')
            .sort({ createdAt: -1 });
        
        res.json({
            success: true,
            data: orders
        });
    } catch (error) {
        console.error('Orders get error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   GET /api/orders/:id
// @desc    Get specific order
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('items.book');
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }
        
        // Check if user owns this order
        if (order.user.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }
        
        res.json({
            success: true,
            data: order
        });
    } catch (error) {
        console.error('Order get error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   POST /api/orders
// @desc    Create new order from cart
// @access  Private
router.post('/', protect, async (req, res) => {
    console.log('ORDER BODY:', req.body);
    try {
        const {
            shippingAddress,
            paymentMethod,
            payment,
            coupon,
            subtotal,
            total,
            orderNumber,
            items
        } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No items provided'
            });
        }

        const order = new Order({
            user: req.user.id,
            shippingAddress,
            paymentMethod,
            payment,
            couponCode: coupon,
            subtotal,
            total,
            orderNumber,
            items,
            status: 'pending'
        });

        await order.save();
        await order.populate('items.book');

        // Track affiliate if present (supports body, query, or header)
        const affiliateCode = req.body.affiliateCode || req.query.affiliate || req.headers['x-affiliate-code'];
        if (affiliateCode) {
            const User = require('../models/User');
            const affiliate = await User.findOne({ 'affiliate.code': affiliateCode });
            if (affiliate && affiliate.affiliate && affiliate.affiliate.isActive) {
                affiliate.affiliate.referredOrders.push(order._id);
                const commission = (affiliate.affiliate.commissionRate || 0.05) * order.total;
                affiliate.affiliate.totalEarnings += commission;
                await affiliate.save();
            }
        }

        // Clear user's cart
        await Cart.findOneAndUpdate(
            { user: req.user.id },
            { items: [] }
        );

        res.json({
            success: true,
            data: order
        });
    } catch (error) {
        console.error('Order create error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order status (admin only)
// @access  Private
router.put('/:id/status', protect, async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
        
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }
        
        const order = await Order.findById(req.params.id);
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }
        
        order.status = status;
        await order.save();
        await order.populate('items.book');
        
        res.json({
            success: true,
            data: order
        });
    } catch (error) {
        console.error('Order status update error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   POST /api/orders/:id/cancel
// @desc    Cancel order
// @access  Private
router.post('/:id/cancel', protect, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }
        
        // Check if user owns this order
        if (order.user.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }
        
        // Check if order can be cancelled
        if (order.status === 'delivered' || order.status === 'cancelled') {
            return res.status(400).json({
                success: false,
                message: 'Order cannot be cancelled'
            });
        }
        
        order.status = 'cancelled';
        await order.save();
        await order.populate('items.book');
        
        res.json({
            success: true,
            data: order
        });
    } catch (error) {
        console.error('Order cancel error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

module.exports = router; 