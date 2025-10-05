// Enhanced Admin Orders Management System
class AdminOrdersManager {
    constructor() {
        this.orders = [];
        this.filteredOrders = [];
        this.currentFilters = {};
        this.selectedOrders = new Set();
        this.token = localStorage.getItem('adminToken');
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadOrders();
    }

    setupEventListeners() {
        // Search input
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', this.debounce(() => {
                this.performSearch();
            }, 300));
        }

        // Filter dropdowns
        const filterSelects = ['status-filter', 'payment-filter', 'date-filter', 'amount-filter', 'customer-filter'];
        filterSelects.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('change', () => {
                    this.applyFilters();
                });
            }
        });

        // Date filter change
        const dateFilter = document.getElementById('date-filter');
        if (dateFilter) {
            dateFilter.addEventListener('change', (e) => {
                if (e.target.value === 'custom') {
                    document.getElementById('custom-date-range').style.display = 'block';
                } else {
                    document.getElementById('custom-date-range').style.display = 'none';
                }
                this.applyFilters();
            });
        }

        // Custom date inputs
        const customDateInputs = ['from-date', 'to-date'];
        customDateInputs.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('change', () => {
                    this.applyFilters();
                });
            }
        });

        // Bulk action select
        const bulkActionSelect = document.getElementById('bulk-action-select');
        if (bulkActionSelect) {
            bulkActionSelect.addEventListener('change', (e) => {
                const bulkActionBtn = document.querySelector('.bulk-action-btn');
                if (bulkActionBtn) {
                    bulkActionBtn.disabled = !e.target.value || this.selectedOrders.size === 0;
                }
            });
        }
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    async loadOrders() {
        try {
            this.showLoading();
            
            // For demo purposes, create sample orders
            this.orders = this.generateSampleOrders();
            this.filteredOrders = [...this.orders];
            
            this.renderOrders();
            this.updateOrdersCount();
            
        } catch (error) {
            console.error('Error loading orders:', error);
            this.showError('Failed to load orders');
        }
    }

    generateSampleOrders() {
        const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
        const paymentMethods = ['card', 'upi', 'netbanking', 'cod'];
        const customers = [
            { name: 'John Doe', email: 'john@example.com', phone: '+91 9876543210' },
            { name: 'Jane Smith', email: 'jane@example.com', phone: '+91 9876543211' },
            { name: 'Mike Johnson', email: 'mike@example.com', phone: '+91 9876543212' },
            { name: 'Sarah Wilson', email: 'sarah@example.com', phone: '+91 9876543213' },
            { name: 'David Brown', email: 'david@example.com', phone: '+91 9876543214' }
        ];

        const books = [
            { title: 'The Great Gatsby', price: 299, author: 'F. Scott Fitzgerald' },
            { title: 'To Kill a Mockingbird', price: 399, author: 'Harper Lee' },
            { title: '1984', price: 349, author: 'George Orwell' },
            { title: 'Pride and Prejudice', price: 279, author: 'Jane Austen' },
            { title: 'The Catcher in the Rye', price: 329, author: 'J.D. Salinger' }
        ];

        const orders = [];
        for (let i = 1; i <= 25; i++) {
            const customer = customers[Math.floor(Math.random() * customers.length)];
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
            const itemCount = Math.floor(Math.random() * 3) + 1;
            
            const items = [];
            let totalAmount = 0;
            
            for (let j = 0; j < itemCount; j++) {
                const book = books[Math.floor(Math.random() * books.length)];
                const quantity = Math.floor(Math.random() * 2) + 1;
                const itemTotal = book.price * quantity;
                totalAmount += itemTotal;
                
                items.push({
                    _id: `item_${i}_${j}`,
                    title: book.title,
                    author: book.author,
                    price: book.price,
                    quantity: quantity,
                    total: itemTotal,
                    status: status
                });
            }

            const orderDate = new Date();
            orderDate.setDate(orderDate.getDate() - Math.floor(Math.random() * 30));

            orders.push({
                _id: `order_${i}`,
                orderNumber: `ORD${String(i).padStart(4, '0')}`,
                customer: customer,
                items: items,
                status: status,
                paymentMethod: paymentMethod,
                totalAmount: totalAmount,
                createdAt: orderDate,
                updatedAt: orderDate
            });
        }

        return orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    performSearch() {
        const searchTerm = document.getElementById('search-input').value.toLowerCase();
        
        if (!searchTerm) {
            this.applyFilters();
            return;
        }

        this.filteredOrders = this.orders.filter(order => {
            return (
                order.orderNumber.toLowerCase().includes(searchTerm) ||
                order.customer.name.toLowerCase().includes(searchTerm) ||
                order.customer.email.toLowerCase().includes(searchTerm) ||
                order.customer.phone.includes(searchTerm)
            );
        });

        this.renderOrders();
        this.updateOrdersCount();
    }

    applyQuickFilter(filterType) {
        // Update active quick filter button
        document.querySelectorAll('.quick-filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filterType}"]`).classList.add('active');

        // Apply the filter
        this.currentFilters = {};
        
        if (filterType === 'all') {
            this.filteredOrders = [...this.orders];
        } else if (['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(filterType)) {
            this.currentFilters.status = filterType;
            this.filteredOrders = this.orders.filter(order => order.status === filterType);
        } else if (filterType === 'today') {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            this.filteredOrders = this.orders.filter(order => {
                const orderDate = new Date(order.createdAt);
                orderDate.setHours(0, 0, 0, 0);
                return orderDate.getTime() === today.getTime();
            });
        } else if (filterType === 'week') {
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            this.filteredOrders = this.orders.filter(order => new Date(order.createdAt) >= weekAgo);
        }

        this.renderOrders();
        this.updateOrdersCount();
    }

    applyFilters() {
        const statusFilter = document.getElementById('status-filter').value;
        const paymentFilter = document.getElementById('payment-filter').value;
        const dateFilter = document.getElementById('date-filter').value;
        const amountFilter = document.getElementById('amount-filter').value;
        const customerFilter = document.getElementById('customer-filter').value;

        this.currentFilters = {
            status: statusFilter,
            payment: paymentFilter,
            date: dateFilter,
            amount: amountFilter,
            customer: customerFilter
        };

        this.filteredOrders = this.orders.filter(order => {
            // Status filter
            if (statusFilter && order.status !== statusFilter) return false;

            // Payment method filter
            if (paymentFilter && order.paymentMethod !== paymentFilter) return false;

            // Date filter
            if (dateFilter && dateFilter !== 'custom') {
                const orderDate = new Date(order.createdAt);
                const now = new Date();
                
                switch (dateFilter) {
                    case 'today':
                        if (orderDate.toDateString() !== now.toDateString()) return false;
                        break;
                    case 'yesterday':
                        const yesterday = new Date(now);
                        yesterday.setDate(yesterday.getDate() - 1);
                        if (orderDate.toDateString() !== yesterday.toDateString()) return false;
                        break;
                    case 'week':
                        const weekAgo = new Date(now);
                        weekAgo.setDate(weekAgo.getDate() - 7);
                        if (orderDate < weekAgo) return false;
                        break;
                    case 'month':
                        const monthAgo = new Date(now);
                        monthAgo.setMonth(monthAgo.getMonth() - 1);
                        if (orderDate < monthAgo) return false;
                        break;
                    case 'quarter':
                        const quarterAgo = new Date(now);
                        quarterAgo.setMonth(quarterAgo.getMonth() - 3);
                        if (orderDate < quarterAgo) return false;
                        break;
                    case 'year':
                        const yearAgo = new Date(now);
                        yearAgo.setFullYear(yearAgo.getFullYear() - 1);
                        if (orderDate < yearAgo) return false;
                        break;
                }
            }

            // Custom date range
            if (dateFilter === 'custom') {
                const fromDate = document.getElementById('from-date').value;
                const toDate = document.getElementById('to-date').value;
                
                if (fromDate) {
                    const from = new Date(fromDate);
                    if (new Date(order.createdAt) < from) return false;
                }
                
                if (toDate) {
                    const to = new Date(toDate);
                    to.setHours(23, 59, 59, 999);
                    if (new Date(order.createdAt) > to) return false;
                }
            }

            // Amount filter
            if (amountFilter) {
                const amount = order.totalAmount;
                switch (amountFilter) {
                    case '0-500':
                        if (amount > 500) return false;
                        break;
                    case '500-1000':
                        if (amount < 500 || amount > 1000) return false;
                        break;
                    case '1000-5000':
                        if (amount < 1000 || amount > 5000) return false;
                        break;
                    case '5000+':
                        if (amount < 5000) return false;
                        break;
                }
            }

            return true;
        });

        this.renderOrders();
        this.updateOrdersCount();
    }

    clearAllFilters() {
        // Reset all filter inputs
        document.getElementById('search-input').value = '';
        document.getElementById('status-filter').value = '';
        document.getElementById('payment-filter').value = '';
        document.getElementById('date-filter').value = '';
        document.getElementById('amount-filter').value = '';
        document.getElementById('customer-filter').value = '';
        document.getElementById('from-date').value = '';
        document.getElementById('to-date').value = '';
        
        // Hide custom date range
        document.getElementById('custom-date-range').style.display = 'none';
        
        // Reset quick filters
        document.querySelectorAll('.quick-filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector('[data-filter="all"]').classList.add('active');
        
        // Clear current filters
        this.currentFilters = {};
        this.filteredOrders = [...this.orders];
        
        this.renderOrders();
        this.updateOrdersCount();
    }

    renderOrders() {
        const ordersList = document.getElementById('orders-list');
        if (!ordersList) return;

        if (this.filteredOrders.length === 0) {
            ordersList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <h3>No orders found</h3>
                    <p>Try adjusting your search criteria or filters</p>
                </div>
            `;
            return;
        }

        ordersList.innerHTML = this.filteredOrders.map(order => this.createOrderCard(order)).join('');
        
        // Add event listeners for order actions
        this.setupOrderActionListeners();
    }

    createOrderCard(order) {
        const statusClass = `status-${order.status}`;
        const statusText = order.status.charAt(0).toUpperCase() + order.status.slice(1);
        const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        return `
            <div class="order-card" data-order-id="${order._id}">
                <div class="order-header">
                    <div class="order-info">
                        <h3 class="order-number">Order #${order.orderNumber}</h3>
                        <p class="order-date">${orderDate}</p>
                        <div class="customer-info">
                            <strong>${order.customer.name}</strong><br>
                            ${order.customer.email} | ${order.customer.phone}
                        </div>
                    </div>
                    <div class="order-status">
                        <span class="status-badge ${statusClass}">${statusText}</span>
                        <div class="order-amount">₹${order.totalAmount.toLocaleString()}</div>
                    </div>
                </div>
                
                <div class="order-items">
                    ${order.items.map(item => `
                        <div class="order-item">
                            <div class="item-info">
                                <div class="item-title">${item.title}</div>
                                <div class="item-details">
                                    by ${item.author} | Qty: ${item.quantity} | ₹${item.total}
                                </div>
                            </div>
                            <div class="item-actions">
                                <button class="item-action-btn btn-fulfill" onclick="adminOrdersManager.fulfillItem('${order._id}', '${item._id}')">
                                    Fulfill
                                </button>
                                <button class="item-action-btn btn-refund" onclick="adminOrdersManager.refundItem('${order._id}', '${item._id}')">
                                    Refund
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="order-actions">
                    <button class="action-btn btn-view" onclick="adminOrdersManager.viewOrderDetails('${order._id}')">
                        <i class="fas fa-eye me-1"></i>View Details
                    </button>
                    <button class="action-btn btn-edit" onclick="adminOrdersManager.editOrder('${order._id}')">
                        <i class="fas fa-edit me-1"></i>Edit Order
                    </button>
                    <button class="action-btn btn-cancel" onclick="adminOrdersManager.cancelOrder('${order._id}')">
                        <i class="fas fa-times me-1"></i>Cancel
                    </button>
                </div>
            </div>
        `;
    }

    setupOrderActionListeners() {
        // Add checkbox for bulk selection
        this.filteredOrders.forEach(order => {
            const orderCard = document.querySelector(`[data-order-id="${order._id}"]`);
            if (orderCard) {
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.className = 'order-checkbox';
                checkbox.value = order._id;
                checkbox.addEventListener('change', (e) => {
                    if (e.target.checked) {
                        this.selectedOrders.add(order._id);
                    } else {
                        this.selectedOrders.delete(order._id);
                    }
                    this.updateBulkActionButton();
                });
                
                const orderHeader = orderCard.querySelector('.order-header');
                if (orderHeader) {
                    orderHeader.insertBefore(checkbox, orderHeader.firstChild);
                }
            }
        });
    }

    updateBulkActionButton() {
        const bulkActionBtn = document.querySelector('.bulk-action-btn');
        const bulkActionSelect = document.getElementById('bulk-action-select');
        
        if (bulkActionBtn && bulkActionSelect) {
            bulkActionBtn.disabled = !bulkActionSelect.value || this.selectedOrders.size === 0;
        }
    }

    updateOrdersCount() {
        const countElement = document.getElementById('orders-count');
        if (countElement) {
            countElement.textContent = this.filteredOrders.length;
        }
    }

    showLoading() {
        const ordersList = document.getElementById('orders-list');
        if (ordersList) {
            ordersList.innerHTML = `
                <div class="loading">
                    <div class="loading-spinner"></div>
                    Loading orders...
                </div>
            `;
        }
    }

    showError(message) {
        const ordersList = document.getElementById('orders-list');
        if (ordersList) {
            ordersList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Error</h3>
                    <p>${message}</p>
                </div>
            `;
        }
    }

    // Order Actions
    async fulfillItem(orderId, itemId) {
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            this.showMessage('Item fulfilled successfully!', 'success');
            this.loadOrders(); // Refresh orders
        } catch (error) {
            this.showMessage('Failed to fulfill item', 'error');
        }
    }

    async refundItem(orderId, itemId) {
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            this.showMessage('Refund processed successfully!', 'success');
            this.loadOrders(); // Refresh orders
        } catch (error) {
            this.showMessage('Failed to process refund', 'error');
        }
    }

    viewOrderDetails(orderId) {
        const order = this.orders.find(o => o._id === orderId);
        if (order) {
            // Open order details modal or navigate to details page
            alert(`Viewing details for order ${order.orderNumber}`);
        }
    }

    editOrder(orderId) {
        const order = this.orders.find(o => o._id === orderId);
        if (order) {
            // Open edit order modal or navigate to edit page
            alert(`Editing order ${order.orderNumber}`);
        }
    }

    cancelOrder(orderId) {
        if (confirm('Are you sure you want to cancel this order?')) {
            // Simulate API call
            this.showMessage('Order cancelled successfully!', 'success');
            this.loadOrders(); // Refresh orders
        }
    }

    executeBulkAction() {
        const action = document.getElementById('bulk-action-select').value;
        const selectedCount = this.selectedOrders.size;
        
        if (!action || selectedCount === 0) return;

        switch (action) {
            case 'update-status':
                this.showBulkStatusUpdateModal();
                break;
            case 'export-selected':
                this.exportSelectedOrders();
                break;
            case 'send-notifications':
                this.sendBulkNotifications();
                break;
            case 'add-notes':
                this.showBulkNotesModal();
                break;
        }
    }

    showBulkStatusUpdateModal() {
        const newStatus = prompt('Enter new status (pending, processing, shipped, delivered, cancelled):');
        if (newStatus && ['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(newStatus)) {
            this.showMessage(`Updated status for ${this.selectedOrders.size} orders to ${newStatus}`, 'success');
            this.selectedOrders.clear();
            this.updateBulkActionButton();
            this.loadOrders();
        }
    }

    exportSelectedOrders() {
        const selectedOrdersData = this.orders.filter(order => this.selectedOrders.has(order._id));
        this.exportOrdersToCSV(selectedOrdersData, 'selected-orders');
        this.showMessage(`Exported ${selectedOrdersData.length} orders`, 'success');
    }

    sendBulkNotifications() {
        this.showMessage(`Sent notifications to ${this.selectedOrders.size} customers`, 'success');
    }

    showBulkNotesModal() {
        const note = prompt('Enter note to add to selected orders:');
        if (note) {
            this.showMessage(`Added note to ${this.selectedOrders.size} orders`, 'success');
        }
    }

    exportOrders() {
        this.exportOrdersToCSV(this.filteredOrders, 'all-orders');
        this.showMessage(`Exported ${this.filteredOrders.length} orders`, 'success');
    }

    exportOrdersToCSV(orders, filename) {
        const headers = ['Order Number', 'Customer Name', 'Email', 'Phone', 'Status', 'Payment Method', 'Total Amount', 'Date'];
        const csvContent = [
            headers.join(','),
            ...orders.map(order => [
                order.orderNumber,
                order.customer.name,
                order.customer.email,
                order.customer.phone,
                order.status,
                order.paymentMethod,
                order.totalAmount,
                new Date(order.createdAt).toLocaleDateString()
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    showMessage(message, type) {
        // Create a simple notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 24px;
            border-radius: 6px;
            color: white;
            font-weight: 500;
            z-index: 1000;
            background: ${type === 'success' ? '#059669' : '#ef4444'};
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 3000);
    }
}

// Global functions for HTML onclick handlers
window.applyQuickFilter = function(filterType) {
    adminOrdersManager.applyQuickFilter(filterType);
};

window.clearAllFilters = function() {
    adminOrdersManager.clearAllFilters();
};

window.performSearch = function() {
    adminOrdersManager.performSearch();
};

window.executeBulkAction = function() {
    adminOrdersManager.executeBulkAction();
};

window.exportOrders = function() {
    adminOrdersManager.exportOrders();
};

// Initialize the admin orders manager
let adminOrdersManager;
document.addEventListener('DOMContentLoaded', function() {
    adminOrdersManager = new AdminOrdersManager();
});