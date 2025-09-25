// view-orders.js
// Fetch and display user orders on the View Orders page

document.addEventListener('DOMContentLoaded', async () => {
    const API_BASE_URL = '/api';
    const ordersList = document.getElementById('orders-list');

    // Helper to show a message
    function showMessage(message, type = 'info') {
        ordersList.innerHTML = `<div class="alert alert-${type} text-center">${message}</div>`;
    }

    // Fetch orders from backend
    async function loadOrders() {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                showMessage('You must be logged in to view your orders.', 'warning');
                return;
            }
            const response = await fetch(`${API_BASE_URL}/orders`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to fetch orders');
            const data = await response.json();
            renderOrders(data.data || []);
        } catch (error) {
            showMessage('Failed to load orders.', 'danger');
        }
    }

    // Render orders in the orders-list div
    function renderOrders(orders) {
        if (!orders.length) {
            ordersList.innerHTML = `
                <div class="text-center py-5">
                    <i class="fas fa-shopping-bag fa-3x text-muted mb-3"></i>
                    <h4>No orders yet</h4>
                    <p class="text-muted">Start shopping to see your orders here!</p>
                    <a href="/shop" class="btn btn-primary">Start Shopping</a>
                </div>
            `;
            return;
        }
        ordersList.innerHTML = orders.map(order => `
            <div class="order-card mb-4">
                <div class="order-header d-flex justify-content-between align-items-center">
                    <div>
                        <div class="order-status">${order.status}</div>
                        <div class="order-date">Placed on ${new Date(order.createdAt).toLocaleDateString()}</div>
                        <div class="order-number">Order #${order.orderNumber || order._id.slice(-8)}</div>
                    </div>
                    <div class="order-total fw-bold">Total: ₹${order.total}</div>
                </div>
                <ul class="order-items-list">
                    ${order.items.map(item => `
                        <li>
                            <span>${item.book?.title || 'Book'} x${item.quantity}</span>
                            <span>₹${(item.price * item.quantity).toFixed(2)}</span>
                        </li>
                    `).join('')}
                </ul>
            </div>
        `).join('');
    }

    // Initial load
    loadOrders();
}); 
