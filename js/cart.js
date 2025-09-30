document.addEventListener('DOMContentLoaded', () => {

    // --- API Configuration ---
    const API_BASE_URL = '/api';

    const cartItemsContainer = document.getElementById('cart-items');
    const cartSummary = document.getElementById('cart-summary');
    const emptyCartMessage = document.getElementById('empty-cart-message');
    const cartCountBadge = document.getElementById('cart-count');

    let cartItems = [];

    // --- API Helper Functions ---
    const apiCall = async (endpoint, options = {}) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` }),
                    ...options.headers
                },
                ...options
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API call failed:', error);
            throw error;
        }
    };

    const loadCart = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                showEmptyCart();
                localStorage.setItem('cart', JSON.stringify([]));
                return;
            }

            const response = await apiCall('/cart');
            cartItems = (response.data && response.data.items) ? response.data.items : [];
            localStorage.setItem('cart', JSON.stringify(cartItems.map(item => ({ id: item.book._id, quantity: item.quantity }))));
            renderCart();
        } catch (error) {
            console.error('Failed to load cart:', error);
            showEmptyCart();
            localStorage.setItem('cart', JSON.stringify([]));
        }
    };

    const renderCart = () => {
        console.log('Rendering cart items:', cartItems);
        if (cartItems.length === 0) {
            showEmptyCart();
            updateCartCount();
            return;
        }

        // Hide empty cart message
        if (emptyCartMessage) {
            emptyCartMessage.style.display = 'none';
        }

        // Render cart items
        if (cartItemsContainer) {
            cartItemsContainer.innerHTML = cartItems.map(item => `
                <div class="cart-item" data-id="${item.book._id}">
                    <div class="row align-items-center">
                        <div class="col-md-2 col-4">
                            <img src="${item.book.coverImage}" alt="${item.book.title}" class="cart-item-img">
                        </div>
                        <div class="col-md-4 col-8">
                            <h5 class="cart-item-title">${item.book.title}</h5>
                            <p class="cart-item-author">by ${item.book.author}</p>
                            <p class="cart-item-price">₹${item.book.price}</p>
                        </div>
                        <div class="col-md-3 col-6">
                            <div class="quantity-controls">
                                <button class="btn btn-sm btn-outline-secondary quantity-btn" data-action="decrease">-</button>
                                <span class="quantity-display">${item.quantity}</span>
                                <button class="btn btn-sm btn-outline-secondary quantity-btn" data-action="increase">+</button>
                            </div>
                        </div>
                        <div class="col-md-2 col-3">
                            <p class="cart-item-total">₹${(item.book.price * item.quantity).toFixed(2)}</p>
                        </div>
                        <div class="col-md-1 col-3">
                            <button class="btn btn-sm btn-outline-danger remove-item-btn">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
        }

        // Update cart summary
        updateCartSummary();
        updateCartCount();
        document.getElementById('main-content').classList.remove('hidden');
        document.body.classList.remove('body-hidden');
    };

    const showEmptyCart = () => {
        if (cartItemsContainer) {
            cartItemsContainer.innerHTML = '';
        }
        if (emptyCartMessage) {
            emptyCartMessage.style.display = 'block';
        }
        if (cartSummary) {
            cartSummary.innerHTML = '';
        }
        document.getElementById('main-content').classList.remove('hidden');
        document.body.classList.remove('body-hidden');
        updateCartCount();
    };

    const updateCartSummary = () => {
        if (!cartSummary) return;

        const subtotal = cartItems.reduce((sum, item) => sum + (item.book.price * item.quantity), 0);
        const shipping = subtotal > 500 ? 0 : 50;
        const total = subtotal + shipping;

        cartSummary.innerHTML = `
            <div class="cart-summary-item">
                <span>Subtotal:</span>
                <span>₹${subtotal.toFixed(2)}</span>
            </div>
            <div class="cart-summary-item">
                <span>Shipping:</span>
                <span>${shipping === 0 ? 'Free' : `₹${shipping.toFixed(2)}`}</span>
            </div>
            <hr>
            <div class="cart-summary-item total">
                <span>Total:</span>
                <span>₹${total.toFixed(2)}</span>
            </div>
            <a href="/checkout.html" class="btn btn-primary w-100 mt-3" id="checkout-btn">Proceed to Checkout</a>
        `;
        // Disable the button if cart is empty
        const checkoutBtn = document.getElementById('checkout-btn');
        if (checkoutBtn && cartItems.length === 0) {
            checkoutBtn.classList.add('disabled');
            checkoutBtn.setAttribute('tabindex', '-1');
            checkoutBtn.setAttribute('aria-disabled', 'true');
            checkoutBtn.style.pointerEvents = 'none';
        }
    };

    const updateQuantity = async (bookId, action) => {
        try {
            const item = cartItems.find(item => item.book._id === bookId);
            if (!item) return;

            let newQuantity = item.quantity;
            if (action === 'increase') {
                newQuantity++;
            } else if (action === 'decrease') {
                newQuantity = Math.max(1, newQuantity - 1);
            }

            if (newQuantity === item.quantity) return;

            await apiCall('/cart/update', {
                method: 'PUT',
                body: JSON.stringify({ bookId, quantity: newQuantity })
            });

            item.quantity = newQuantity;
            localStorage.setItem('cart', JSON.stringify(cartItems.map(item => ({ id: item.book._id, quantity: item.quantity }))));
            renderCart();
            updateCartCount();
            showToast('Cart updated successfully!', 'success');
        } catch (error) {
            showToast('Failed to update cart', 'error');
        }
    };

    const removeItem = async (bookId) => {
        try {
            await apiCall(`/cart/${bookId}`, { method: 'DELETE' });
            
            cartItems = cartItems.filter(item => item.book._id !== bookId);
            localStorage.setItem('cart', JSON.stringify(cartItems.map(item => ({ id: item.book._id, quantity: item.quantity }))));
            renderCart();
            updateCartCount();
            showToast('Item removed from cart', 'success');
        } catch (error) {
            showToast('Failed to remove item', 'error');
        }
    };

    const checkout = async () => {
        try {
            const response = await apiCall('/orders', {
                method: 'POST',
                body: JSON.stringify({
                    items: cartItems.map(item => ({
                        bookId: item.book._id,
                        quantity: item.quantity,
                        price: item.book.price
                    }))
                })
            });

            showToast('Order placed successfully!', 'success');
            
            // Clear cart
            cartItems = [];
            localStorage.setItem('cart', JSON.stringify([]));
            renderCart();
            
            // Redirect to order confirmation
            setTimeout(() => {
                window.location.href = `/order/${response.data._id}`;
            }, 1500);
        } catch (error) {
            showToast('Failed to place order', 'error');
        }
    };

    // Toast notification function
    const showToast = (message, type = 'success') => {
        const toast = document.createElement('div');
        toast.className = `toast-notification ${type}`;
        toast.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'} me-2"></i>
            ${message}
        `;
        document.body.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 100);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => document.body.removeChild(toast), 300);
        }, 3000);
    };

    // --- Event Listeners ---

    // Quantity controls
    document.body.addEventListener('click', async (e) => {
        const cartItem = e.target.closest('.cart-item');
        if (!cartItem) return;

        const bookId = cartItem.dataset.id;

        if (e.target.classList.contains('quantity-btn')) {
            const action = e.target.dataset.action;
            await updateQuantity(bookId, action);
        }

        if (e.target.classList.contains('remove-item-btn') || e.target.closest('.remove-item-btn')) {
            await removeItem(bookId);
        }
    });

    // Checkout button
    document.body.addEventListener('click', async (e) => {
        if (e.target.classList.contains('checkout-btn')) {
            await checkout();
        }
    });

    // Update the cart count badge in the header
    const updateCartCount = () => {
        if (cartCountBadge) {
            const count = cartItems.reduce((sum, item) => sum + item.quantity, 0);
            cartCountBadge.textContent = count;
        }
    };

    // Initialize
    loadCart();
    updateCartCount();
}); 