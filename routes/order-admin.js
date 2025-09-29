const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { protect, adminOnly } = require('../middleware/auth');

// 1. Partial Fulfillment: Mark specific items as fulfilled
router.put('/:orderId/items/:itemId/fulfill', protect, adminOnly, async (req, res) => {
  const order = await Order.findById(req.params.orderId);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  const item = order.items.id(req.params.itemId);
  if (!item) return res.status(404).json({ success: false, message: 'Order item not found' });
  item.status = 'fulfilled';
  await order.save();
  // Email notification
  const { notifyOrderItemAction } = require('../utils/orderEmailNotifications');
  notifyOrderItemAction(order, item, 'fulfilled');
  res.json({ success: true, item });
});

// 2. Refund: Refund specific items
router.put('/:orderId/items/:itemId/refund', protect, adminOnly, async (req, res) => {
  const { refundAmount } = req.body;
  const order = await Order.findById(req.params.orderId);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  const item = order.items.id(req.params.itemId);
  if (!item) return res.status(404).json({ success: false, message: 'Order item not found' });
  item.status = 'refunded';
  item.refundAmount = refundAmount || item.price;
  item.paymentStatus = 'refunded';
  await order.save();
  // Email notification
  const { notifyOrderItemAction } = require('../utils/orderEmailNotifications');
  notifyOrderItemAction(order, item, 'refunded');
  res.json({ success: true, item });
});

// 3. Extra Payment Request: Request additional payment for specific items
router.put('/:orderId/items/:itemId/request-payment', protect, adminOnly, async (req, res) => {
  const { extraAmount } = req.body;
  const order = await Order.findById(req.params.orderId);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  const item = order.items.id(req.params.itemId);
  if (!item) return res.status(404).json({ success: false, message: 'Order item not found' });
  item.extraPaymentRequested = extraAmount;
  item.paymentStatus = 'requested';
  await order.save();
  // Email notification
  const { notifyOrderItemAction } = require('../utils/orderEmailNotifications');
  notifyOrderItemAction(order, item, 'requested');
  res.json({ success: true, item });
});

module.exports = router;