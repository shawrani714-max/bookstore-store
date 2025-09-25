const { sendMail } = require('./emailService');
const User = require('../models/User');

async function notifyOrderItemAction(order, item, action) {
  const user = await User.findById(order.user);
  if (!user) return;
  let subject = '', html = '';
  switch (action) {
    case 'fulfilled':
      subject = `Your book has been shipped: ${item.title}`;
      html = `<p>Your book <strong>${item.title}</strong> from order #${order.orderNumber} has been shipped/fulfilled.</p>`;
      break;
    case 'refunded':
      subject = `Refund processed for: ${item.title}`;
      html = `<p>Your book <strong>${item.title}</strong> from order #${order.orderNumber} has been refunded. Amount: ₹${item.refundAmount}</p>`;
      break;
    case 'requested':
      subject = `Extra payment requested for: ${item.title}`;
      html = `<p>We need an additional payment of ₹${item.extraPaymentRequested} for <strong>${item.title}</strong> in order #${order.orderNumber}. Please complete payment to proceed.</p>`;
      break;
    default:
      return;
  }
  await sendMail({
    to: user.email,
    subject,
    html
  });
}

module.exports = { notifyOrderItemAction };
