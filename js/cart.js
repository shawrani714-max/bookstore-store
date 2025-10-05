document.addEventListener('DOMContentLoaded', () => {

    // --- API Configuration ---
    const API_BASE_URL = '/api';

    const cartItemsContainer = document.getElementById('cart-items');
    const cartSummary = document.getElementById('cart-summary');
    const emptyCartMessage = document.getElementById('empty-cart-message');
    const cartCountBadge = document.getElementById('cart-count');

    let cartItems = [];
    let appliedCoupon = null;
    let discountAmount = 0;

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
                    <img src="${item.book.coverImage || '../images/book1.jpg'}" alt="${item.book.title}" class="cart-item-image">
                    <div class="cart-item-details">
                        <div class="cart-item-info">
                            <h5>${item.book.title}</h5>
                            <p class="cart-item-author">by ${item.book.author || 'Unknown Author'}</p>
                            <p class="cart-item-price">₹${item.book.price}</p>
                        </div>
                        <div class="cart-item-controls">
                            <div class="quantity-controls">
                                <button class="quantity-btn" data-action="decrease" data-id="${item.book._id}">-</button>
                                <input type="number" class="quantity-input" value="${item.quantity}" min="1" max="99" data-id="${item.book._id}">
                                <button class="quantity-btn" data-action="increase" data-id="${item.book._id}">+</button>
                            </div>
                            <div class="cart-item-actions">
                                <button class="save-for-later-btn" data-id="${item.book._id}" title="Save for Later">
                                    <i class="fas fa-bookmark"></i>
                                    <span>Save for Later</span>
                                </button>
                                <button class="remove-item-btn" data-id="${item.book._id}" title="Remove Item">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                            <div class="cart-item-total">₹${(item.book.price * item.quantity).toFixed(2)}</div>
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

        // Update individual elements instead of innerHTML
        document.getElementById('cart-subtotal').textContent = `₹${subtotal.toFixed(2)}`;
        document.getElementById('shipping-cost').textContent = shipping === 0 ? 'Free' : `₹${shipping.toFixed(2)}`;
        document.getElementById('tax-amount').textContent = `₹${(subtotal * 0.18).toFixed(2)}`;
        
        const finalTotal = subtotal + shipping + (subtotal * 0.18) - discountAmount;
        document.getElementById('cart-total').textContent = `₹${finalTotal.toFixed(2)}`;

        // Show/hide discount row
        const discountRow = document.getElementById('discount-row');
        const discountAmountEl = document.getElementById('discount-amount');
        
        if (discountAmount > 0) {
            discountRow.style.display = 'flex';
            discountAmountEl.textContent = `-₹${discountAmount.toFixed(2)}`;
        } else {
            discountRow.style.display = 'none';
        }
        // Disable the button if cart is empty
        const checkoutBtn = document.getElementById('checkout-btn');
        if (checkoutBtn && cartItems.length === 0) {
            checkoutBtn.classList.add('disabled');
            checkoutBtn.setAttribute('tabindex', '-1');
            checkoutBtn.setAttribute('aria-disabled', 'true');
            checkoutBtn.style.pointerEvents = 'none';
        }
    };

    const updateQuantity = async (bookId, action, setQuantity = null) => {
        try {
            const item = cartItems.find(item => item.book._id === bookId);
            if (!item) return;

            let newQuantity = item.quantity;
            if (action === 'increase') {
                newQuantity = Math.min(item.quantity + 1, 99);
            } else if (action === 'decrease') {
                newQuantity = Math.max(1, item.quantity - 1);
            } else if (action === 'set' && setQuantity !== null) {
                newQuantity = Math.max(1, Math.min(setQuantity, 99));
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

    const clearCart = async () => {
        try {
            // Clear all items from cart
            for (const item of cartItems) {
                await apiCall(`/cart/${item.book._id}`, { method: 'DELETE' });
            }

            cartItems = [];
            appliedCoupon = null;
            discountAmount = 0;
            localStorage.setItem('cart', JSON.stringify([]));
            renderCart();
            updateCartCount();
            showToast('Cart cleared successfully!', 'success');
        } catch (error) {
            showToast('Failed to clear cart', 'error');
        }
    };

    const applyCoupon = async (couponCode) => {
        try {
            // Mock coupon validation - in real app, this would call your API
            const validCoupons = {
                'WELCOME10': { discount: 10, type: 'percentage', minAmount: 500 },
                'SAVE50': { discount: 50, type: 'fixed', minAmount: 1000 },
                'FREESHIP': { discount: 0, type: 'shipping', minAmount: 0 }
            };

            const coupon = validCoupons[couponCode.toUpperCase()];
            if (!coupon) {
                throw new Error('Invalid coupon code');
            }

            const subtotal = cartItems.reduce((total, item) => total + (item.book.price * item.quantity), 0);
            if (subtotal < coupon.minAmount) {
                throw new Error(`Minimum order amount of ₹${coupon.minAmount} required`);
            }

            // Calculate discount
            if (coupon.type === 'percentage') {
                discountAmount = (subtotal * coupon.discount) / 100;
            } else if (coupon.type === 'fixed') {
                discountAmount = Math.min(coupon.discount, subtotal);
            } else if (coupon.type === 'shipping') {
                discountAmount = 0; // Free shipping handled separately
            }

            appliedCoupon = { code: couponCode.toUpperCase(), ...coupon };
            showCouponMessage('Coupon applied successfully!', 'success');
            updateCartSummary();
            
        } catch (error) {
            showCouponMessage(error.message, 'error');
        }
    };

    const removeCoupon = () => {
        appliedCoupon = null;
        discountAmount = 0;
        document.getElementById('coupon-code').value = '';
        showCouponMessage('', '');
        updateCartSummary();
    };

    const showCouponMessage = (message, type) => {
        const messageEl = document.getElementById('coupon-message');
        messageEl.textContent = message;
        messageEl.className = `coupon-message ${type}`;
        
        if (message && type === 'success') {
            setTimeout(() => {
                messageEl.textContent = '';
                messageEl.className = 'coupon-message';
            }, 3000);
        }
    };

    const saveForLater = async (bookId) => {
        try {
            const item = cartItems.find(item => item.book._id === bookId);
            if (!item) return;

            // Add to wishlist (mock implementation)
            await apiCall('/wishlist/add', {
                method: 'POST',
                body: JSON.stringify({ bookId })
            });

            // Remove from cart
            await removeItem(bookId);
            showToast('Item saved for later!', 'success');
            
        } catch (error) {
            showToast('Failed to save item for later', 'error');
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
            // Check if cart is empty
            if (cartItems.length === 0) {
                showToast('Your cart is empty!', 'error');
                return;
            }

            // Check if user is logged in
            const token = localStorage.getItem('token');
            if (!token) {
                showToast('Please login to proceed to checkout', 'error');
                // Redirect to login page
                setTimeout(() => {
                    window.location.href = '../login';
                }, 1500);
                return;
            }

            // Store cart data for checkout page
            const checkoutData = {
                items: cartItems,
                appliedCoupon: appliedCoupon,
                discountAmount: discountAmount,
                subtotal: cartItems.reduce((sum, item) => sum + (item.book.price * item.quantity), 0),
                shipping: cartItems.reduce((sum, item) => sum + (item.book.price * item.quantity), 0) > 500 ? 0 : 50,
                tax: cartItems.reduce((sum, item) => sum + (item.book.price * item.quantity), 0) * 0.18
            };

            // Store checkout data in sessionStorage
            sessionStorage.setItem('checkoutData', JSON.stringify(checkoutData));

            // Redirect to checkout page
            window.location.href = '/checkout.html';
            
        } catch (error) {
            console.error('Checkout error:', error);
            showToast('Failed to proceed to checkout', 'error');
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

    // Quantity controls and item actions
    document.body.addEventListener('click', async (e) => {
        // Clear cart button
        if (e.target.id === 'clear-cart-btn') {
            if (confirm('Are you sure you want to clear all items from your cart?')) {
                await clearCart();
            }
            return;
        }

        // Quantity buttons
        if (e.target.classList.contains('quantity-btn')) {
            const bookId = e.target.dataset.id;
            const action = e.target.dataset.action;
            await updateQuantity(bookId, action);
            return;
        }

        // Save for later button
        if (e.target.classList.contains('save-for-later-btn') || e.target.closest('.save-for-later-btn')) {
            const bookId = e.target.dataset.id || e.target.closest('.save-for-later-btn').dataset.id;
            await saveForLater(bookId);
            return;
        }

        // Remove item button
        if (e.target.classList.contains('remove-item-btn') || e.target.closest('.remove-item-btn')) {
            const bookId = e.target.dataset.id || e.target.closest('.remove-item-btn').dataset.id;
            await removeItem(bookId);
            return;
        }
    });

    // Quantity input change
    document.body.addEventListener('change', async (e) => {
        if (e.target.classList.contains('quantity-input')) {
            const bookId = e.target.dataset.id;
            const newQuantity = parseInt(e.target.value);
            if (newQuantity > 0 && newQuantity <= 99) {
                await updateQuantity(bookId, 'set', newQuantity);
            } else {
                // Reset to previous value if invalid
                e.target.value = cartItems.find(item => item.book._id === bookId)?.quantity || 1;
            }
        }
    });

    // Apply coupon button
    document.body.addEventListener('click', async (e) => {
        if (e.target.id === 'apply-coupon') {
            const couponCode = document.getElementById('coupon-code').value.trim();
            if (couponCode) {
                await applyCoupon(couponCode);
            } else {
                showCouponMessage('Please enter a coupon code', 'error');
            }
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