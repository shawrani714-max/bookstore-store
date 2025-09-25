document.addEventListener('DOMContentLoaded', () => {
    const mainContent = document.getElementById('main-content');
    const orderItemsList = document.getElementById('order-items-list');
    const summaryItemsList = document.getElementById('summary-items-list');
    const placeOrderBtn = document.getElementById('place-order-btn');
    const addressForm = document.getElementById('checkout-address-form');
    const paymentForm = document.getElementById('checkout-payment-form');
    const paymentMethodSelect = document.getElementById('payment-method');
    const cardDetails = document.getElementById('card-details');
    const couponInput = document.getElementById('coupon-code');
    const applyCouponBtn = document.getElementById('apply-coupon-btn');
    const couponMessage = document.getElementById('coupon-message');
    const orderNotes = document.getElementById('order-notes');
    const orderMessage = document.getElementById('order-message');
    // Summary fields
    const summarySubtotal = document.getElementById('summary-subtotal');
    const summaryShipping = document.getElementById('summary-shipping');
    const summaryDiscount = document.getElementById('summary-discount');
    const summaryTotal = document.getElementById('summary-total');

    let cartItems = [];
    let coupon = { code: '', discount: 0 };
    let shipping = 0;

    // Fetch cart from backend
    async function fetchCart() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/cart', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to fetch cart');
            const data = await response.json();
            cartItems = (data.data && data.data.items) ? data.data.items : [];
            renderOrderItems();
            renderSummary();
        } catch (err) {
            orderItemsList.innerHTML = '<div class="alert alert-danger text-center">Failed to load cart.</div>';
            if (summaryItemsList) summaryItemsList.innerHTML = '';
        }
    }

    // Render cart items in review section
    function renderOrderItems() {
        if (!orderItemsList) return;
        if (cartItems.length === 0) {
            orderItemsList.innerHTML = '<p class="text-muted">Your cart is empty.</p>';
            placeOrderBtn.disabled = true;
            return;
        }
        orderItemsList.innerHTML = cartItems.map(item => `
            <div class="d-flex justify-content-between align-items-center mb-2">
                <span>${item.book.title} x${item.quantity}</span>
                <span>₹${(item.price * item.quantity).toFixed(2)}</span>
            </div>
        `).join('');
        placeOrderBtn.disabled = false;
    }

    // Render summary sidebar
    function renderSummary() {
        if (!summaryItemsList) return;
        let subtotal = 0;
        summaryItemsList.innerHTML = cartItems.map(item => {
            subtotal += item.price * item.quantity;
            return `<div class="d-flex justify-content-between align-items-center mb-2">
                <span>${item.book.title} x${item.quantity}</span>
                <span>₹${(item.price * item.quantity).toFixed(2)}</span>
            </div>`;
        }).join('');
        // Shipping logic
        shipping = subtotal > 500 ? 0 : 50;
        // Discount logic
        const discount = coupon.discount || 0;
        // Update summary fields
        if (summarySubtotal) summarySubtotal.textContent = `₹${subtotal.toFixed(2)}`;
        if (summaryShipping) summaryShipping.textContent = shipping === 0 ? 'Free' : `₹${shipping.toFixed(2)}`;
        if (summaryDiscount) summaryDiscount.textContent = `₹${discount.toFixed(2)}`;
        if (summaryTotal) summaryTotal.textContent = `₹${(subtotal + shipping - discount).toFixed(2)}`;
    }

    // Coupon logic (mock)
    applyCouponBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        const code = couponInput.value.trim().toUpperCase();
        
        if (!code) {
            couponMessage.textContent = 'Please enter a coupon code.';
            couponMessage.style.display = 'block';
            couponMessage.className = 'mt-2 text-danger';
            return;
        }

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                couponMessage.textContent = 'Please login to apply coupons.';
                couponMessage.style.display = 'block';
                couponMessage.className = 'mt-2 text-danger';
                return;
            }

            // Calculate subtotal for coupon validation
            let subtotal = 0;
            cartItems.forEach(item => {
                subtotal += item.price * item.quantity;
            });

            const response = await fetch('/api/coupons/validate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    code: code,
                    subtotal: subtotal
                })
            });

            const data = await response.json();

            if (data.success) {
                coupon = { 
                    code: code, 
                    discount: data.data.discountAmount,
                    type: data.data.type,
                    percentage: data.data.percentage
                };
                couponMessage.textContent = `Coupon applied! ${data.data.type === 'percentage' ? `${data.data.percentage}% off` : `₹${data.data.discountAmount} off`}.`;
                couponMessage.style.display = 'block';
                couponMessage.className = 'mt-2 text-success';
            } else {
                coupon = { code: '', discount: 0 };
                couponMessage.textContent = data.message || 'Invalid coupon code.';
                couponMessage.style.display = 'block';
                couponMessage.className = 'mt-2 text-danger';
            }
        } catch (error) {
            console.error('Error applying coupon:', error);
            coupon = { code: '', discount: 0 };
            couponMessage.textContent = 'Failed to apply coupon. Please try again.';
            couponMessage.style.display = 'block';
            couponMessage.className = 'mt-2 text-danger';
        }
        
        renderSummary();
    });

    // Payment method switching
    paymentMethodSelect.addEventListener('change', (e) => {
        if (e.target.value === 'card') {
            cardDetails.style.display = 'block';
        } else {
            cardDetails.style.display = 'none';
        }
    });
    // Initial state
    if (paymentMethodSelect.value !== 'card') cardDetails.style.display = 'none';

    // Validate forms
    function validateForms() {
        return addressForm.checkValidity() && (paymentMethodSelect.value !== 'card' || paymentForm.checkValidity());
    }

    // Place order handler
    placeOrderBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        orderMessage.textContent = '';
        if (!validateForms()) {
            addressForm.reportValidity();
            if (paymentMethodSelect.value === 'card') paymentForm.reportValidity();
            return;
        }

        // Fetch full book details for each cart item
        const token = localStorage.getItem('token');
        const bookDetails = await Promise.all(
            cartItems.map(item =>
                fetch(`/api/books/${item.book._id}`, {
                    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
                })
                .then(res => res.json())
                .then(data => data.data)
            )
        );
        console.log('Book details fetched:', bookDetails);

        // Build items array with all required fields
        const items = cartItems.map((item, idx) => ({
            book: item.book._id,
            title: bookDetails[idx].book.title,
            author: bookDetails[idx].book.author,
            coverImage: bookDetails[idx].book.coverImage,
            quantity: item.quantity,
            price: item.price
        }));

        // Calculate subtotal, shipping, discount, total
        let subtotal = 0;
        cartItems.forEach(item => {
            subtotal += item.price * item.quantity;
        });
        const discount = coupon.discount || 0;
        const shippingCost = subtotal > 500 ? 0 : 50;
        const total = subtotal + shippingCost - discount;
        // Generate a random order number
        const orderNumber = 'ORD' + Math.floor(100000 + Math.random() * 900000);
        const orderData = {
            shippingAddress: {
                fullName: addressForm.name.value,
                phone: addressForm.phone.value,
                street: addressForm.address.value,
                city: addressForm.city.value,
                zipCode: addressForm.zipCode.value,
                state: addressForm.state.value,
                country: addressForm.country.value
            },
            paymentMethod: paymentMethodSelect.value,
            payment: {
                card: paymentForm.card ? paymentForm.card.value : '',
                expiry: paymentForm.expiry ? paymentForm.expiry.value : '',
                cvv: paymentForm.cvv ? paymentForm.cvv.value : ''
            },
            coupon: coupon.code,
            subtotal,
            total,
            orderNumber,
            items
        };
        placeOrderBtn.disabled = true;
        placeOrderBtn.textContent = 'Placing Order...';
        try {
            const response = await fetch('/api/orders/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` })
                },
                body: JSON.stringify(orderData)
            });
            if (!response.ok) throw new Error('Order failed');
            // Success!
            window.location.href = 'order-success.html';
        } catch (err) {
            orderMessage.innerHTML = '<div class="alert alert-danger text-center">Order failed. Please try again.</div>';
            placeOrderBtn.disabled = false;
            placeOrderBtn.textContent = 'Place Order';
        }
    });

    // Initial render
    fetchCart();
    if (mainContent) mainContent.classList.remove('hidden');
    document.body.classList.remove('body-hidden');
}); 
