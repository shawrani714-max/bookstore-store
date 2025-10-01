document.addEventListener('DOMContentLoaded', async () => {
    // Get elements
    const mainContent = document.getElementById('main-content');
    const orderItemsList = document.getElementById('summary-items-list');
    const continueToPaymentBtn = document.getElementById('continue-to-payment-btn');
    const addressForm = document.getElementById('checkout-address-form');
    const orderMessage = document.getElementById('order-message');

    // Summary fields
    const summarySubtotal = document.getElementById('summary-subtotal');
    const summaryShipping = document.getElementById('summary-shipping');
    const summaryDiscount = document.getElementById('summary-discount');
    const summaryTax = document.getElementById('summary-tax');
    const summaryTotal = document.getElementById('summary-total');
    const discountRow = document.getElementById('discount-row');

    // Payment method elements (will be used in payment step)
    // const paymentMethods = document.querySelectorAll('.payment-method');
    // const cardDetails = document.getElementById('card-details');
    // const upiDetails = document.getElementById('upi-details');
    // const codDetails = document.getElementById('cod-details');

    let checkoutData = null;
    let appliedCoupon = null;
    let discountAmount = 0;

    // Initialize checkout page
    async function initializeCheckout() {
        try {
            // Check if user is logged in
            const token = localStorage.getItem('token');
            if (!token) {
                showMessage('Please login to continue checkout', 'error');
                setTimeout(() => {
                    window.location.href = '/login.html';
                }, 2000);
                return;
            }

            // Load checkout data from sessionStorage (passed from cart page)
            const storedData = sessionStorage.getItem('checkoutData');
            if (!storedData) {
                showMessage('No checkout data found. Please return to cart.', 'error');
                setTimeout(() => {
                    window.location.href = '/cart.html';
                }, 2000);
                return;
            }

            checkoutData = JSON.parse(storedData);
            appliedCoupon = checkoutData.appliedCoupon;
            discountAmount = checkoutData.discountAmount;

            console.log('Loaded checkout data:', checkoutData);

            // Load user profile data
            await loadUserProfile();

            // Render order items and summary
            renderOrderItems();
            updateOrderSummary();
            
            // Debug: Check if prices are being calculated
            console.log('Initial order summary update completed');

            // Setup payment method handlers
            // setupPaymentMethodHandlers(); // Commented out - no payment methods in checkout step

            // Setup coupon handler
            // setupCouponHandler(); // Commented out - no coupon section in checkout step

            // Setup form handlers
            setupFormHandlers();

            // Show the page
            mainContent.classList.remove('hidden');
            document.body.classList.remove('body-hidden');

        } catch (error) {
            console.error('Error initializing checkout:', error);
            showMessage('Failed to load checkout data', 'error');
        }
    }

    // Load user profile data
    async function loadUserProfile() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/auth/profile', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const userData = await response.json();
                populateAddressForm(userData);
            }
        } catch (error) {
            console.error('Error loading user profile:', error);
        }
    }

    // Populate address form with user data
    function populateAddressForm(userData) {
        const nameField = document.getElementById('name');
        const phoneField = document.getElementById('phone');
        const addressField = document.getElementById('address');
        const cityField = document.getElementById('city');
        const stateField = document.getElementById('state');

        if (userData.name) nameField.value = userData.name;
        if (userData.phone) phoneField.value = userData.phone;
        if (userData.address) addressField.value = userData.address;
        if (userData.city) cityField.value = userData.city;
        if (userData.state) stateField.value = userData.state;
    }

    // Render order items in summary
    function renderOrderItems() {
        if (!checkoutData || !checkoutData.items) return;

        orderItemsList.innerHTML = '';

        checkoutData.items.forEach(item => {
            const orderItem = document.createElement('div');
            orderItem.className = 'order-item';
            orderItem.innerHTML = `
                <img src="${item.book.image || '/images/book1.jpg'}" 
                     alt="${item.book.title}" 
                     class="order-item-image"
                     onerror="this.src='/images/book1.jpg'">
                <div class="order-item-details">
                    <div class="order-item-title">${item.book.title}</div>
                    <div class="order-item-author">by ${item.book.author}</div>
                    <div class="order-item-quantity">Qty: ${item.quantity}</div>
                </div>
                <div class="order-item-price">₹${(item.book.price * item.quantity).toFixed(2)}</div>
            `;
            orderItemsList.appendChild(orderItem);
        });
    }

    // Update order summary totals
    function updateOrderSummary() {
        if (!checkoutData || !checkoutData.items) return;

        // Calculate subtotal
        const subtotal = checkoutData.items.reduce((sum, item) => {
            return sum + (item.book.price * item.quantity);
        }, 0);

        // Calculate shipping (free if over ₹500)
        const shipping = subtotal >= 500 ? 0 : 50;

        // Calculate tax (18% GST)
        const tax = subtotal * 0.18;

        // Calculate total
        const total = subtotal + shipping + tax - discountAmount;

        // Update display
        summarySubtotal.textContent = `₹${subtotal.toFixed(2)}`;
        summaryShipping.textContent = shipping === 0 ? 'Free' : `₹${shipping.toFixed(2)}`;
        summaryTax.textContent = `₹${tax.toFixed(2)}`;
        summaryTotal.textContent = `₹${total.toFixed(2)}`;

        // Show/hide discount row
        if (discountAmount > 0) {
            discountRow.style.display = 'flex';
            summaryDiscount.textContent = `-₹${discountAmount.toFixed(2)}`;
        } else {
            discountRow.style.display = 'none';
        }

        // Update checkout data
        checkoutData.subtotal = subtotal;
        checkoutData.shipping = shipping;
        checkoutData.tax = tax;
        checkoutData.total = total;
    }

    // Setup payment method handlers - COMMENTED OUT (not needed in checkout step)
    /*
    function setupPaymentMethodHandlers() {
        paymentMethods.forEach(method => {
            method.addEventListener('click', () => {
                // Remove selected class from all methods
                paymentMethods.forEach(m => m.classList.remove('selected'));
                
                // Add selected class to clicked method
                method.classList.add('selected');
                
                // Check the radio button
                const radio = method.querySelector('input[type="radio"]');
                radio.checked = true;
                
                // Show/hide payment details
                const methodType = method.dataset.method;
                showPaymentDetails(methodType);
            });
        });
    }
    */

    // Show payment details based on selected method - COMMENTED OUT (not needed in checkout step)
    /*
    function showPaymentDetails(methodType) {
        // Hide all payment details
        cardDetails.style.display = 'none';
        upiDetails.style.display = 'none';
        codDetails.style.display = 'none';

        // Show relevant payment details
        switch (methodType) {
            case 'card':
                cardDetails.style.display = 'block';
                break;
            case 'upi':
                upiDetails.style.display = 'block';
                break;
            case 'cod':
                codDetails.style.display = 'block';
                break;
        }
    }
    */

    // Setup coupon handler - COMMENTED OUT (not needed in checkout step)
    /*
    function setupCouponHandler() {
        applyCouponBtn.addEventListener('click', applyCoupon);
        couponInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                applyCoupon();
            }
        });
    }
    */

    // Apply coupon
    async function applyCoupon() {
        const couponCode = couponInput.value.trim();
        if (!couponCode) {
            showCouponMessage('Please enter a coupon code', 'error');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/coupons/apply', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ couponCode })
            });

            const result = await response.json();

            if (response.ok && result.success) {
                appliedCoupon = result.coupon;
                discountAmount = result.discountAmount;
                
                // Update checkout data
                checkoutData.appliedCoupon = appliedCoupon;
                checkoutData.discountAmount = discountAmount;
                
                showCouponMessage(`Coupon applied! You saved ₹${discountAmount.toFixed(2)}`, 'success');
                updateOrderSummary();
                
                // Disable coupon input
                couponInput.disabled = true;
                applyCouponBtn.disabled = true;
            } else {
                showCouponMessage(result.message || 'Invalid coupon code', 'error');
            }
        } catch (error) {
            console.error('Error applying coupon:', error);
            showCouponMessage('Failed to apply coupon', 'error');
        }
    }

    // Show coupon message
    function showCouponMessage(message, type) {
        couponMessage.textContent = message;
        couponMessage.className = `mt-2 ${type === 'success' ? 'text-success' : 'text-danger'}`;
        couponMessage.style.display = 'block';
        
        setTimeout(() => {
            couponMessage.style.display = 'none';
        }, 5000);
    }

    // Setup form handlers
    function setupFormHandlers() {
        console.log('Setting up form handlers...');
        console.log('continueToPaymentBtn:', continueToPaymentBtn);
        
        // Place order button - try multiple approaches
        if (continueToPaymentBtn) {
            continueToPaymentBtn.addEventListener('click', continueToPayment);
            console.log('Button event listener added successfully');
        } else {
            console.error('continueToPaymentBtn not found! Trying alternative approach...');
            // Try to find the button again
            const button = document.getElementById('continue-to-payment-btn');
            if (button) {
                button.addEventListener('click', continueToPayment);
                console.log('Button found with alternative approach and event listener added');
            } else {
                console.error('Button still not found with alternative approach');
            }
        }

        // Form validation
        if (addressForm) {
        addressForm.addEventListener('submit', (e) => e.preventDefault());
        }
    }

    // Show payment step (update progress and show payment content)
    function showPaymentStep() {
        console.log('Showing payment step...');
        
        // Update progress indicator
        const checkoutStep = document.querySelector('.progress-step:nth-child(2)');
        const paymentStep = document.querySelector('.progress-step:nth-child(3)');
        
        if (checkoutStep && paymentStep) {
            checkoutStep.classList.remove('active');
            checkoutStep.classList.add('completed');
            paymentStep.classList.add('active');
        }
        
        // Hide checkout content and show payment content
        const checkoutContent = document.querySelector('.checkout-vertical-layout');
        if (checkoutContent) {
            checkoutContent.innerHTML = `
                <div class="col-12">
                    <div class="checkout-section">
                        <div class="checkout-section-header">
                            <h3 class="checkout-section-title">
                                <i class="fas fa-credit-card"></i>
                                Payment Method
                            </h3>
                        </div>
                        <div class="checkout-section-body">
                            <div class="form-group">
                                <label class="form-label">Choose Payment Method</label>
                                <div class="payment-method" data-method="card">
                                    <input type="radio" name="payment-method" id="card-payment" value="card" checked>
                                    <label for="card-payment">
                                        <i class="fas fa-credit-card"></i>
                                        Credit/Debit Card
                                    </label>
                                </div>
                                <div class="payment-method" data-method="upi">
                                    <input type="radio" name="payment-method" id="upi-payment" value="upi">
                                    <label for="upi-payment">
                                        <i class="fas fa-mobile-alt"></i>
                                        UPI Payment
                                    </label>
                                </div>
                                <div class="payment-method" data-method="cod">
                                    <input type="radio" name="payment-method" id="cod-payment" value="cod">
                                    <label for="cod-payment">
                                        <i class="fas fa-money-bill-wave"></i>
                                        Cash on Delivery
                                    </label>
                                </div>
                            </div>
                            
                            <!-- Card Payment Details -->
                            <div id="card-details" class="payment-details">
                                <div class="form-group">
                                    <label for="card" class="form-label">Card Number</label>
                                    <input type="text" class="form-control" id="card" placeholder="1234 5678 9012 3456" maxlength="19">
                                </div>
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="form-group">
                                            <label for="expiry" class="form-label">Expiry Date</label>
                                            <input type="text" class="form-control" id="expiry" placeholder="MM/YY" maxlength="5">
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="form-group">
                                            <label for="cvv" class="form-label">CVV</label>
                                            <input type="text" class="form-control" id="cvv" placeholder="123" maxlength="4">
                                        </div>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label for="card-name" class="form-label">Cardholder Name</label>
                                    <input type="text" class="form-control" id="card-name" placeholder="Name on Card">
                                </div>
                            </div>

                            <!-- UPI Payment Details -->
                            <div id="upi-details" class="payment-details" style="display: none;">
                                <div class="form-group">
                                    <label for="upi-id" class="form-label">UPI ID</label>
                                    <input type="text" class="form-control" id="upi-id" placeholder="yourname@paytm">
                                </div>
                            </div>

                            <!-- COD Details -->
                            <div id="cod-details" class="payment-details" style="display: none;">
                                <div class="alert alert-info">
                                    <i class="fas fa-info-circle me-2"></i>
                                    Pay when your order arrives. Additional charges may apply.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="col-12">
                    <div class="order-summary-card">
                        <div class="order-summary-header">
                            <h3 class="order-summary-title">
                                <i class="fas fa-receipt"></i>
                                Order Summary
                            </h3>
                        </div>
                        <div class="order-summary-body">
                            <div id="summary-items-list" class="mb-4">
                                <!-- Summary items will be injected by JS -->
                            </div>

                            <div class="order-summary-totals mb-4">
                                <div class="summary-row">
                                    <span class="summary-label">Subtotal:</span>
                                    <span class="summary-value" id="summary-subtotal">₹0.00</span>
                                </div>
                                <div class="summary-row">
                                    <span class="summary-label">Shipping:</span>
                                    <span class="summary-value" id="summary-shipping">Free</span>
                                </div>
                                <div class="summary-row" id="discount-row" style="display: none;">
                                    <span class="summary-label">Discount:</span>
                                    <span class="summary-value" id="summary-discount">-₹0.00</span>
                                </div>
                                <div class="summary-row">
                                    <span class="summary-label">Tax (GST):</span>
                                    <span class="summary-value" id="summary-tax">₹0.00</span>
                                </div>
                                <div class="summary-row total">
                                    <span class="summary-label">Total:</span>
                                    <span class="summary-value" id="summary-total">₹0.00</span>
                                </div>
                            </div>

                            <button class="place-order-btn" id="place-order-btn" style="background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%) !important; background-color: #2563eb !important; border: none !important; color: white !important;">
                                <i class="fas fa-lock me-2"></i>
                                Place Order Securely
                            </button>
                            
                            <div id="order-message" class="mt-3"></div>

                            <div class="trust-badges">
                                <div class="trust-badge">
                                    <i class="fas fa-shipping-fast"></i>
                                    <span>Free Shipping on orders over ₹500</span>
                                </div>
                                <div class="trust-badge">
                                    <i class="fas fa-shield-alt"></i>
                                    <span>256-bit SSL Encryption</span>
                                </div>
                                <div class="trust-badge">
                                    <i class="fas fa-undo"></i>
                                    <span>Easy Returns & Exchanges</span>
                                </div>
                                <div class="trust-badge">
                                    <i class="fas fa-headset"></i>
                                    <span>24/7 Customer Support</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // Re-render order items and summary
            renderOrderItems();
            
            // Update summary with correct prices
            if (checkoutData && checkoutData.items) {
                updateOrderSummaryForPayment();
            }
            
            // Setup payment method handlers for the new content
            setupPaymentMethodHandlersForPayment();
        }
    }

    // Setup payment method handlers for payment step
    function setupPaymentMethodHandlersForPayment() {
        const paymentMethods = document.querySelectorAll('.payment-method');
        const cardDetails = document.getElementById('card-details');
        const upiDetails = document.getElementById('upi-details');
        const codDetails = document.getElementById('cod-details');
        
        if (paymentMethods.length > 0) {
            paymentMethods.forEach(method => {
                method.addEventListener('click', () => {
                    // Remove selected class from all methods
                    paymentMethods.forEach(m => m.classList.remove('selected'));
                    
                    // Add selected class to clicked method
                    method.classList.add('selected');
                    
                    // Check the radio button
                    const radio = method.querySelector('input[type="radio"]');
                    radio.checked = true;
                    
                    // Show/hide payment details
                    const methodType = method.dataset.method;
                    showPaymentDetailsForPayment(methodType);
                });
            });
            
            // Setup place order button
            const placeOrderBtn = document.getElementById('place-order-btn');
            if (placeOrderBtn) {
                // Force blue styling
                placeOrderBtn.style.background = 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)';
                placeOrderBtn.style.backgroundColor = '#2563eb';
                placeOrderBtn.style.border = 'none';
                placeOrderBtn.style.color = 'white';
                
                // Add hover event to keep it blue
                placeOrderBtn.addEventListener('mouseenter', function() {
                    this.style.background = 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)';
                    this.style.backgroundColor = '#1d4ed8';
                });
                
                placeOrderBtn.addEventListener('mouseleave', function() {
                    this.style.background = 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)';
                    this.style.backgroundColor = '#2563eb';
                });
                
                placeOrderBtn.addEventListener('click', placeOrder);
                console.log('Place order button styled and event listener added');
            }
        }
    }
    
    // Update order summary for payment step
    function updateOrderSummaryForPayment() {
        console.log('Updating order summary for payment step...');
        console.log('Checkout data:', checkoutData);
        
        if (!checkoutData || !checkoutData.items) {
            console.error('No checkout data available');
            return;
        }

        // Get the summary elements from the payment step
        const summarySubtotal = document.getElementById('summary-subtotal');
        const summaryShipping = document.getElementById('summary-shipping');
        const summaryDiscount = document.getElementById('summary-discount');
        const summaryTax = document.getElementById('summary-tax');
        const summaryTotal = document.getElementById('summary-total');
        const discountRow = document.getElementById('discount-row');

        if (!summarySubtotal) {
            console.error('Summary elements not found');
            return;
        }

        // Calculate subtotal
        const subtotal = checkoutData.items.reduce((sum, item) => {
            return sum + (item.book.price * item.quantity);
        }, 0);

        // Calculate shipping (free if over ₹500)
        const shipping = subtotal >= 500 ? 0 : 50;

        // Calculate tax (18% GST)
        const tax = subtotal * 0.18;

        // Calculate total
        const total = subtotal + shipping + tax - (checkoutData.discountAmount || 0);

        console.log('Calculated prices:', { subtotal, shipping, tax, total });

        // Update display
        summarySubtotal.textContent = `₹${subtotal.toFixed(2)}`;
        summaryShipping.textContent = shipping === 0 ? 'Free' : `₹${shipping.toFixed(2)}`;
        summaryTax.textContent = `₹${tax.toFixed(2)}`;
        summaryTotal.textContent = `₹${total.toFixed(2)}`;

        // Show/hide discount row
        if (checkoutData.discountAmount > 0) {
            discountRow.style.display = 'flex';
            summaryDiscount.textContent = `-₹${checkoutData.discountAmount.toFixed(2)}`;
        } else {
            discountRow.style.display = 'none';
        }
    }

    // Show payment details for payment step
    function showPaymentDetailsForPayment(methodType) {
        const cardDetails = document.getElementById('card-details');
        const upiDetails = document.getElementById('upi-details');
        const codDetails = document.getElementById('cod-details');
        
        // Hide all payment details
        if (cardDetails) cardDetails.style.display = 'none';
        if (upiDetails) upiDetails.style.display = 'none';
        if (codDetails) codDetails.style.display = 'none';

        // Show relevant payment details
        switch (methodType) {
            case 'card':
                if (cardDetails) cardDetails.style.display = 'block';
                break;
            case 'upi':
                if (upiDetails) upiDetails.style.display = 'block';
                break;
            case 'cod':
                if (codDetails) codDetails.style.display = 'block';
                break;
        }
    }

    // Continue to payment step
    async function continueToPayment() {
        console.log('continueToPayment function called!');
        try {
            // Validate address form
            if (!validateAddressForm()) {
                console.log('Address form validation failed');
                return;
            }
            console.log('Address form validation passed');

            // Save address data to sessionStorage for next step
            const addressData = {
                name: document.getElementById('name').value,
                phone: document.getElementById('phone').value,
                address: document.getElementById('address').value,
                city: document.getElementById('city').value,
                zipCode: document.getElementById('zipCode').value,
                state: document.getElementById('state').value,
                country: document.getElementById('country').value
            };
            
            sessionStorage.setItem('addressData', JSON.stringify(addressData));
            
            // Show success message
            showMessage('Address saved! Ready to proceed to payment.', 'success');
            
            // Navigate to payment step on same page
            setTimeout(() => {
                showPaymentStep();
            }, 1500);
            
        } catch (error) {
            console.error('Error continuing to payment:', error);
            showMessage('Error processing request. Please try again.', 'error');
        }
    }

    // Validate address form
    function validateAddressForm() {
        const requiredFields = ['name', 'phone', 'address', 'city', 'zipCode', 'state', 'country'];
        let isValid = true;

        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (!field || !field.value.trim()) {
                field.classList.add('is-invalid');
                isValid = false;
            } else {
                field.classList.remove('is-invalid');
            }
        });

        if (!isValid) {
            showMessage('Please fill in all required fields.', 'error');
        }

        return isValid;
    }

    // Place order - show confirmation step
    async function placeOrder() {
        console.log('Place order function called!');
        try {
            // Get payment method
            const selectedPaymentMethod = document.querySelector('input[name="payment-method"]:checked');
            if (!selectedPaymentMethod) {
                showMessage('Please select a payment method.', 'error');
                return;
            }

            // Show loading
            const placeOrderBtn = document.getElementById('place-order-btn');
            if (placeOrderBtn) {
            placeOrderBtn.disabled = true;
            placeOrderBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Processing...';
            }

            // Simulate processing time
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Show confirmation step
            showConfirmationStep(selectedPaymentMethod.value);

        } catch (error) {
            console.error('Error placing order:', error);
            showMessage('Failed to place order. Please try again.', 'error');
            
            // Reset button
            const placeOrderBtn = document.getElementById('place-order-btn');
            if (placeOrderBtn) {
            placeOrderBtn.disabled = false;
            placeOrderBtn.innerHTML = '<i class="fas fa-lock me-2"></i>Place Order Securely';
            }
        }
    }

    // Show confirmation step
    function showConfirmationStep(paymentMethod) {
        console.log('Showing confirmation step...');
        
        // Update progress indicator
        const paymentStep = document.querySelector('.progress-step:nth-child(3)');
        const confirmationStep = document.querySelector('.progress-step:nth-child(4)');
        
        if (paymentStep && confirmationStep) {
            paymentStep.classList.remove('active');
            paymentStep.classList.add('completed');
            confirmationStep.classList.add('active');
        }
        
        // Get address data from sessionStorage
        const addressData = JSON.parse(sessionStorage.getItem('addressData') || '{}');
        
        // Hide payment content and show confirmation content
        const checkoutContent = document.querySelector('.checkout-vertical-layout');
        if (checkoutContent) {
            checkoutContent.innerHTML = `
                <div class="col-12">
                    <div class="checkout-section">
                        <div class="checkout-section-header">
                            <h3 class="checkout-section-title">
                                <i class="fas fa-check-circle"></i>
                                Order Confirmation
                            </h3>
                        </div>
                        <div class="checkout-section-body">
                            <div class="alert alert-success mb-4">
                                <i class="fas fa-check-circle me-2"></i>
                                <strong>Order Placed Successfully!</strong> Your order has been confirmed and will be processed soon.
                            </div>
                            
                            <div class="row">
                                <div class="col-md-6">
                                    <h5><i class="fas fa-map-marker-alt me-2"></i>Shipping Address</h5>
                                    <div class="address-details">
                                        <p><strong>${addressData.name || 'N/A'}</strong></p>
                                        <p>${addressData.phone || 'N/A'}</p>
                                        <p>${addressData.address || 'N/A'}</p>
                                        <p>${addressData.city || 'N/A'}, ${addressData.state || 'N/A'} ${addressData.zipCode || 'N/A'}</p>
                                        <p>${addressData.country || 'India'}</p>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <h5><i class="fas fa-credit-card me-2"></i>Payment Method</h5>
                                    <div class="payment-details">
                                        <p><strong>${getPaymentMethodName(paymentMethod)}</strong></p>
                                        <p class="text-muted">Payment will be processed upon delivery</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="mt-4">
                                <h5><i class="fas fa-box me-2"></i>Order Items</h5>
                                <div id="confirmation-items-list">
                                    <!-- Order items will be injected by JS -->
                                </div>
                            </div>
                            
                            <div class="mt-4">
                                <div class="order-summary-totals">
                                    <div class="summary-row">
                                        <span class="summary-label">Subtotal:</span>
                                        <span class="summary-value">₹${checkoutData.subtotal?.toFixed(2) || '0.00'}</span>
                                    </div>
                                    <div class="summary-row">
                                        <span class="summary-label">Shipping:</span>
                                        <span class="summary-value">${checkoutData.shipping === 0 ? 'Free' : '₹' + checkoutData.shipping?.toFixed(2) || '0.00'}</span>
                                    </div>
                                    <div class="summary-row">
                                        <span class="summary-label">Tax (GST):</span>
                                        <span class="summary-value">₹${checkoutData.tax?.toFixed(2) || '0.00'}</span>
                                    </div>
                                    <div class="summary-row total">
                                        <span class="summary-label">Total:</span>
                                        <span class="summary-value">₹${checkoutData.total?.toFixed(2) || '0.00'}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="mt-4 text-center">
                                <button class="btn btn-primary btn-lg" onclick="window.location.href='../'">
                                    <i class="fas fa-home me-2"></i>
                                    Continue Shopping
                                </button>
                                <button class="btn btn-outline-primary btn-lg ms-3" id="download-invoice-btn">
                                    <i class="fas fa-download me-2"></i>
                                    Download Invoice
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // Render confirmation items
            renderConfirmationItems();
            
            // Setup download invoice button
            const downloadBtn = document.getElementById('download-invoice-btn');
            if (downloadBtn) {
                downloadBtn.addEventListener('click', function() {
                    console.log('Download invoice button clicked!');
                    downloadInvoice();
                });
                console.log('Download invoice button event listener added');
            }
        }
    }
    
    // Get payment method display name
    function getPaymentMethodName(method) {
        switch(method) {
            case 'card': return 'Credit/Debit Card';
            case 'upi': return 'UPI Payment';
            case 'cod': return 'Cash on Delivery';
            default: return method;
        }
    }
    
    // Render confirmation items
    function renderConfirmationItems() {
        const itemsList = document.getElementById('confirmation-items-list');
        if (!itemsList || !checkoutData || !checkoutData.items) return;

        itemsList.innerHTML = checkoutData.items.map(item => `
            <div class="order-item">
                <img src="${item.book.image}" alt="${item.book.title}" class="order-item-image">
                <div class="order-item-details">
                    <h6 class="order-item-title">${item.book.title}</h6>
                    <p class="order-item-author">by ${item.book.author}</p>
                    <span class="order-item-quantity">Qty: ${item.quantity}</span>
                </div>
                <div class="order-item-price">₹${(item.book.price * item.quantity).toFixed(2)}</div>
            </div>
        `).join('');
    }

    // Download invoice as PDF - Make it globally accessible
    window.downloadInvoice = function() {
        console.log('Download invoice function called!');
        
        // Get order data
        const addressData = JSON.parse(sessionStorage.getItem('addressData') || '{}');
        const orderDate = new Date().toLocaleDateString('en-IN');
        const orderTime = new Date().toLocaleTimeString('en-IN');
        const orderId = 'BW-' + Date.now().toString().slice(-8); // Generate order ID
        
        // Create invoice HTML content
        const invoiceHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Invoice - Bookworld India</title>
            <link rel="stylesheet" href="../css/invoice.css">
        </head>
        <body>
            <div class="invoice-container">
                <div class="header">
                    <div class="header-content">
                        <div class="logo-container">
                            <img src="../images/logo/BookWorld Log.png" alt="Bookworld India" class="logo">
                        </div>
                        <div class="invoice-title">INVOICE</div>
                        <div class="order-id">Order ID: ${orderId}</div>
                    </div>
                </div>
                <div class="content">
            
                    <div class="invoice-details">
                        <div class="company-info">
                            <h3>📚 From:</h3>
                            <p><strong>Bookworld India</strong><br>
                            📍 Mumbai, Maharashtra, India<br>
                            ✉️ support@bookworldindia.com<br>
                            📞 +91 98765 43210<br>
                            🌐 www.bookworldindia.com</p>
                        </div>
                        <div class="order-info">
                            <h3>👤 Bill To:</h3>
                            <p><strong>${addressData.name || 'Customer'}</strong><br>
                            📍 ${addressData.address || 'Address'}<br>
                            ${addressData.city || 'City'}, ${addressData.state || 'State'} ${addressData.zipCode || 'ZIP'}<br>
                            ${addressData.country || 'India'}<br>
                            📞 ${addressData.phone || 'N/A'}</p>
                        </div>
                    </div>
            
            <table class="items-table">
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Author</th>
                        <th>Quantity</th>
                        <th>Price</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${checkoutData.items.map(item => `
                        <tr>
                            <td>${item.book.title}</td>
                            <td>${item.book.author}</td>
                            <td>${item.quantity}</td>
                            <td>₹${item.book.price.toFixed(2)}</td>
                            <td>₹${(item.book.price * item.quantity).toFixed(2)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            
            <div class="totals">
                <table>
                    <tr>
                        <td>Subtotal:</td>
                        <td>₹${checkoutData.subtotal?.toFixed(2) || '0.00'}</td>
                    </tr>
                    <tr>
                        <td>Shipping:</td>
                        <td>${checkoutData.shipping === 0 ? 'Free' : '₹' + checkoutData.shipping?.toFixed(2) || '0.00'}</td>
                    </tr>
                    <tr>
                        <td>Tax (GST):</td>
                        <td>₹${checkoutData.tax?.toFixed(2) || '0.00'}</td>
                    </tr>
                    <tr class="total-row">
                        <td>Total:</td>
                        <td>₹${checkoutData.total?.toFixed(2) || '0.00'}</td>
                    </tr>
                </table>
            </div>
            
                <div class="footer">
                    <div class="thank-you">Thank you for your order!</div>
                    <p><strong>Order Date:</strong> ${orderDate} at ${orderTime}</p>
                    <p><strong>Customer Support:</strong> support@bookworldindia.com</p>
                    <p><em>This is an automated invoice. Please keep this for your records.</em></p>
                </div>
            </div>
        </div>
        </body>
        </html>
        `;
        
        try {
            console.log('Creating invoice window...');
            
            // Create a new window with the invoice content
            const printWindow = window.open('', '_blank', 'width=800,height=600');
            
            if (!printWindow) {
                throw new Error('Popup blocked. Please allow popups for this site.');
            }
            
            printWindow.document.write(invoiceHTML);
            printWindow.document.close();
            
            console.log('Invoice window created successfully');
            
            // Wait for content to load, then print
            printWindow.onload = function() {
                console.log('Print window loaded, showing print dialog...');
                printWindow.print();
                
                // Close window after a delay
                setTimeout(() => {
                    printWindow.close();
                }, 1000);
            };
            
            // Show success message
            showMessage('Invoice downloaded successfully!', 'success');
            
        } catch (error) {
            console.error('Error creating invoice:', error);
            showMessage('Error creating invoice: ' + error.message, 'error');
        }
    }

    // Validate forms (simplified for checkout step)
    function validateForms() {
        // Only validate address form in checkout step
        // Payment validation will be in payment step
        
        // Validate address form
        const requiredAddressFields = ['name', 'phone', 'address', 'city', 'zipCode', 'state'];
        for (const fieldName of requiredAddressFields) {
            const field = document.getElementById(fieldName);
            if (!field.value.trim()) {
                showMessage(`Please fill in the ${fieldName} field`, 'error');
                field.focus();
                return false;
            }
        }

        // Validate payment method
        const selectedPaymentMethod = document.querySelector('input[name="payment-method"]:checked');
        if (!selectedPaymentMethod) {
            showMessage('Please select a payment method', 'error');
            return false;
        }

        // Validate payment details based on method
        const methodType = selectedPaymentMethod.value;
        if (methodType === 'card') {
            const cardNumber = document.getElementById('card').value.trim();
            const expiry = document.getElementById('expiry').value.trim();
            const cvv = document.getElementById('cvv').value.trim();
            const cardName = document.getElementById('card-name').value.trim();
            
            if (!cardNumber || !expiry || !cvv || !cardName) {
                showMessage('Please fill in all card details', 'error');
                return false;
            }
        } else if (methodType === 'upi') {
            const upiId = document.getElementById('upi-id').value.trim();
            if (!upiId) {
                showMessage('Please enter your UPI ID', 'error');
                return false;
            }
        }

        return true;
    }

    // Get form data
    function getFormData(form) {
        const formData = new FormData(form);
        const data = {};
        for (const [key, value] of formData.entries()) {
            data[key] = value;
        }
        return data;
    }

    // Show message
    function showMessage(message, type) {
        orderMessage.textContent = message;
        orderMessage.className = `alert ${type === 'success' ? 'alert-success' : 'alert-danger'}`;
        orderMessage.style.display = 'block';
        
        setTimeout(() => {
            orderMessage.style.display = 'none';
        }, 5000);
    }

    // ========================================
    // ENHANCED ADDRESS FORM FUNCTIONALITY
    // ========================================

    // Enhanced Form Validation
    function setupEnhancedFormValidation() {
        const form = document.getElementById('checkout-address-form');
        if (!form) return;

        // Real-time validation for all fields
        const fields = ['name', 'phone', 'address', 'city', 'zipCode', 'state', 'country'];
        
        fields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.addEventListener('blur', () => validateField(field));
                field.addEventListener('input', () => {
                    // Clear validation on input
                    clearFieldValidation(field);
                    // Real-time formatting for phone and ZIP
                    if (fieldId === 'phone') formatPhoneNumber(field);
                    if (fieldId === 'zipCode') formatZipCode(field);
                });
            }
        });
    }

    // Field validation with visual feedback
    function validateField(field) {
        const fieldId = field.id;
        const value = field.value.trim();
        
        // Clear previous validation
        clearFieldValidation(field);
        
        let isValid = true;
        let errorMessage = '';

        switch (fieldId) {
            case 'name':
                isValid = value.length >= 2 && /^[a-zA-Z\s]+$/.test(value);
                errorMessage = isValid ? '' : 'Name must be at least 2 characters and contain only letters';
                break;
                
            case 'phone':
                const phoneRegex = /^[6-9]\d{9}$/;
                isValid = phoneRegex.test(value.replace(/\D/g, ''));
                errorMessage = isValid ? '' : 'Please enter a valid 10-digit mobile number';
                break;
                
            case 'address':
                isValid = value.length >= 10;
                errorMessage = isValid ? '' : 'Please enter a complete address (at least 10 characters)';
                break;
                
            case 'city':
                isValid = value.length >= 2 && /^[a-zA-Z\s]+$/.test(value);
                errorMessage = isValid ? '' : 'Please enter a valid city name';
                break;
                
            case 'zipCode':
                const zipRegex = /^\d{6}$/;
                isValid = zipRegex.test(value);
                errorMessage = isValid ? '' : 'Please enter a valid 6-digit PIN code';
                break;
                
            case 'state':
                isValid = value.length >= 2 && /^[a-zA-Z\s]+$/.test(value);
                errorMessage = isValid ? '' : 'Please enter a valid state name';
                break;
                
            case 'country':
                isValid = value.length > 0;
                errorMessage = isValid ? '' : 'Please select a country';
                break;
        }

        // Apply validation styling
        if (isValid) {
            field.classList.add('is-valid');
            field.classList.remove('is-invalid');
            showValidationIcon(fieldId, 'valid');
        } else {
            field.classList.add('is-invalid');
            field.classList.remove('is-valid');
            showValidationIcon(fieldId, 'invalid');
            showFieldError(fieldId, errorMessage);
        }

        // No delivery estimation needed

        return isValid;
    }

    // Clear field validation
    function clearFieldValidation(field) {
        field.classList.remove('is-valid', 'is-invalid');
        const fieldId = field.id;
        showValidationIcon(fieldId, 'none');
        hideFieldError(fieldId);
    }

    // Show validation icons
    function showValidationIcon(fieldId, type) {
        const validIcon = document.getElementById(`${fieldId}-valid`);
        const invalidIcon = document.getElementById(`${fieldId}-invalid`);
        
        if (validIcon && invalidIcon) {
            validIcon.classList.add('d-none');
            invalidIcon.classList.add('d-none');
            
            if (type === 'valid') {
                validIcon.classList.remove('d-none');
            } else if (type === 'invalid') {
                invalidIcon.classList.remove('d-none');
            }
        }
    }

    // Show field error message
    function showFieldError(fieldId, message) {
        const errorElement = document.getElementById(`${fieldId}-error`);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.remove('d-none');
        }
    }

    // Hide field error message
    function hideFieldError(fieldId) {
        const errorElement = document.getElementById(`${fieldId}-error`);
        if (errorElement) {
            errorElement.classList.add('d-none');
        }
    }

    // Smart Phone Number Formatting
    function formatPhoneNumber(field) {
        let value = field.value.replace(/\D/g, '');
        if (value.length > 10) value = value.substring(0, 10);
        
        // Format as user types
        if (value.length > 0) {
            if (value.length <= 3) {
                field.value = value;
            } else if (value.length <= 6) {
                field.value = value.substring(0, 3) + '-' + value.substring(3);
            } else {
                field.value = value.substring(0, 3) + '-' + value.substring(3, 6) + '-' + value.substring(6);
            }
        }
        
        // Add formatting indicator
        if (value.length === 10) {
            field.classList.add('formatting');
            setTimeout(() => field.classList.remove('formatting'), 2000);
        }
    }

    // Smart ZIP Code Formatting
    function formatZipCode(field) {
        let value = field.value.replace(/\D/g, '');
        if (value.length > 6) value = value.substring(0, 6);
        field.value = value;
        
        // Add formatting indicator
        if (value.length === 6) {
            field.classList.add('formatting');
            setTimeout(() => field.classList.remove('formatting'), 2000);
        }
    }

    // Setup Smart Formatting
    function setupSmartFormatting() {
        const phoneField = document.getElementById('phone');
        const zipField = document.getElementById('zipCode');
        
        if (phoneField) {
            phoneField.addEventListener('input', () => formatPhoneNumber(phoneField));
        }
        
        if (zipField) {
            zipField.addEventListener('input', () => formatZipCode(zipField));
        }
    }

    // Address Autocomplete (Mock implementation)
    function setupAddressAutocomplete() {
        const addressField = document.getElementById('address');
        if (!addressField) return;

        let timeoutId;
        
        addressField.addEventListener('input', (e) => {
            clearTimeout(timeoutId);
            const query = e.target.value.trim();
            
            if (query.length >= 3) {
                timeoutId = setTimeout(() => {
                    showAddressSuggestions(query);
                }, 300);
            } else {
                hideAddressSuggestions();
            }
        });

        // Hide suggestions when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('#address') && !e.target.closest('#address-suggestions')) {
                hideAddressSuggestions();
            }
        });
    }

    // Show address suggestions
    function showAddressSuggestions(query) {
        const suggestionsContainer = document.getElementById('address-suggestions');
        if (!suggestionsContainer) return;

        // Mock address suggestions
        const mockSuggestions = [
            {
                text: `${query}, Sector 17, Chandigarh`,
                details: 'Chandigarh, 160017, Punjab'
            },
            {
                text: `${query}, Connaught Place, New Delhi`,
                details: 'New Delhi, 110001, Delhi'
            },
            {
                text: `${query}, Marine Drive, Mumbai`,
                details: 'Mumbai, 400020, Maharashtra'
            }
        ].filter(suggestion => 
            suggestion.text.toLowerCase().includes(query.toLowerCase())
        );

        if (mockSuggestions.length > 0) {
            suggestionsContainer.innerHTML = mockSuggestions.map(suggestion => `
                <div class="address-suggestion-item" onclick="selectAddressSuggestion('${suggestion.text}', '${suggestion.details}')">
                    <div class="suggestion-text">${suggestion.text}</div>
                    <div class="suggestion-details">${suggestion.details}</div>
                </div>
            `).join('');
            suggestionsContainer.classList.remove('d-none');
        }
    }

    // Hide address suggestions
    function hideAddressSuggestions() {
        const suggestionsContainer = document.getElementById('address-suggestions');
        if (suggestionsContainer) {
            suggestionsContainer.classList.add('d-none');
        }
    }

    // Select address suggestion
    window.selectAddressSuggestion = function(address, details) {
        const addressField = document.getElementById('address');
        const parts = details.split(', ');
        
        if (addressField) {
            addressField.value = address;
            addressField.classList.add('is-valid');
        }
        
        // Auto-fill city, state, and ZIP if available
        if (parts.length >= 3) {
            const cityField = document.getElementById('city');
            const stateField = document.getElementById('state');
            const zipField = document.getElementById('zipCode');
            
            if (cityField) cityField.value = parts[0];
            if (stateField) stateField.value = parts[2];
            if (zipField) zipField.value = parts[1];
        }
        
        hideAddressSuggestions();
    };

    // Delivery estimation removed as requested

    // Save Address Functionality
    function saveAddressForFuture() {
        const saveCheckbox = document.getElementById('save-address');
        if (!saveCheckbox?.checked) return;

        const addressData = {
            name: document.getElementById('name')?.value,
            phone: document.getElementById('phone')?.value,
            address: document.getElementById('address')?.value,
            city: document.getElementById('city')?.value,
            zipCode: document.getElementById('zipCode')?.value,
            state: document.getElementById('state')?.value,
            country: document.getElementById('country')?.value,
            deliveryInstructions: document.getElementById('delivery-instructions')?.value,
            savedAt: new Date().toISOString()
        };

        // Save to localStorage
        const savedAddresses = JSON.parse(localStorage.getItem('savedAddresses') || '[]');
        savedAddresses.push(addressData);
        localStorage.setItem('savedAddresses', JSON.stringify(savedAddresses));
        
        console.log('Address saved for future use');
    }

    // ========================================
    // SAVED ADDRESS SELECTION SYSTEM
    // ========================================

    // Address Management Variables
    let selectedAddressId = null;
    let savedAddresses = [];

    // Initialize Address System
    function initializeAddressSystem() {
        console.log('Initializing address system...');
        
        // Load saved addresses from localStorage
        loadSavedAddresses();
        
        // Setup event listeners
        setupAddressEventListeners();
        
        // Display initial state
        displayAddressSelection();
    }

    // Load saved addresses from localStorage
    function loadSavedAddresses() {
        const saved = localStorage.getItem('savedAddresses');
        if (saved) {
            savedAddresses = JSON.parse(saved);
            console.log('Loaded saved addresses:', savedAddresses.length);
        } else {
            savedAddresses = [];
            console.log('No saved addresses found');
        }
    }

    // Setup event listeners for address system
    function setupAddressEventListeners() {
        // Add New Address button
        const addNewBtn = document.getElementById('add-new-address-btn');
        if (addNewBtn) {
            addNewBtn.addEventListener('click', showAddressForm);
        }

        // Back to addresses button
        const backBtn = document.getElementById('back-to-addresses-btn');
        if (backBtn) {
            backBtn.addEventListener('click', showAddressSelection);
        }

        // Cancel form button
        const cancelBtn = document.getElementById('cancel-form-btn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', showAddressSelection);
        }

        // Use this address button
        const useAddressBtn = document.getElementById('use-this-address-btn');
        if (useAddressBtn) {
            useAddressBtn.addEventListener('click', useNewAddress);
        }
    }

    // Display address selection (saved addresses + add new button)
    function displayAddressSelection() {
        const savedSection = document.getElementById('saved-addresses-section');
        const formSection = document.getElementById('address-form-section');
        const addressesList = document.getElementById('saved-addresses-list');

        if (savedSection) savedSection.style.display = 'block';
        if (formSection) formSection.style.display = 'none';

        if (addressesList) {
            if (savedAddresses.length === 0) {
                // Show empty state
                addressesList.innerHTML = `
                    <div class="empty-addresses-state">
                        <i class="fas fa-map-marker-alt"></i>
                        <h6>No Saved Addresses</h6>
                        <p>You haven't saved any addresses yet. Add your first address below.</p>
                    </div>
                `;
            } else {
                // Show saved addresses
                addressesList.innerHTML = savedAddresses.map((address, index) => `
                    <div class="saved-address-item" data-address-id="${index}">
                        <input type="radio" 
                               name="selectedAddress" 
                               value="${index}" 
                               class="saved-address-radio" 
                               id="address-${index}">
                        <div class="saved-address-content">
                            <div class="saved-address-name">${address.name}</div>
                            <div class="saved-address-details">
                                ${address.address}<br>
                                ${address.city}, ${address.state} ${address.zipCode}<br>
                                ${address.country}
                            </div>
                            <div class="saved-address-phone">
                                <i class="fas fa-phone me-1"></i>${address.phone}
                            </div>
                            ${address.deliveryInstructions ? `
                                <div class="saved-address-instructions mt-2">
                                    <small class="text-muted">
                                        <i class="fas fa-comment-alt me-1"></i>
                                        ${address.deliveryInstructions}
                                    </small>
                                </div>
                            ` : ''}
                            <div class="saved-address-actions">
                                <button type="button" class="btn btn-sm btn-outline-primary" onclick="editAddress(${index})">
                                    <i class="fas fa-edit me-1"></i>Edit
                                </button>
                                <button type="button" class="btn btn-sm btn-outline-danger" onclick="deleteAddress(${index})">
                                    <i class="fas fa-trash me-1"></i>Delete
                                </button>
                            </div>
                        </div>
                    </div>
                `).join('');

                // Add event listeners for address selection
                document.querySelectorAll('.saved-address-item').forEach(item => {
                    item.addEventListener('click', function() {
                        selectAddress(this);
                    });
                });

                // Add radio button change listeners
                document.querySelectorAll('.saved-address-radio').forEach(radio => {
                    radio.addEventListener('change', function() {
                        if (this.checked) {
                            selectedAddressId = parseInt(this.value);
                            updateSelectedAddress();
                            proceedWithSelectedAddress();
                        }
                    });
                });
            }
        }
    }

    // Select address visually
    function selectAddress(addressItem) {
        // Remove previous selection
        document.querySelectorAll('.saved-address-item').forEach(item => {
            item.classList.remove('selected');
        });

        // Add selection to clicked item
        addressItem.classList.add('selected');

        // Check the radio button
        const radio = addressItem.querySelector('.saved-address-radio');
        if (radio) {
            radio.checked = true;
            selectedAddressId = parseInt(radio.value);
            updateSelectedAddress();
            proceedWithSelectedAddress();
        }
    }

    // Update selected address in session storage
    function updateSelectedAddress() {
        if (selectedAddressId !== null && savedAddresses[selectedAddressId]) {
            const selectedAddress = savedAddresses[selectedAddressId];
            sessionStorage.setItem('selectedAddress', JSON.stringify(selectedAddress));
            console.log('Selected address updated:', selectedAddress);
        }
    }

    // Proceed with selected address
    function proceedWithSelectedAddress() {
        if (selectedAddressId !== null && savedAddresses[selectedAddressId]) {
            const selectedAddress = savedAddresses[selectedAddressId];
            
            // Update session storage
            sessionStorage.setItem('addressData', JSON.stringify(selectedAddress));
            
            // Show success message
            showMessage('Address selected successfully!', 'success');
            
            // Enable continue to payment button
            const continueBtn = document.getElementById('continue-to-payment-btn');
            if (continueBtn) {
                continueBtn.disabled = false;
                continueBtn.classList.remove('disabled');
            }
            
            console.log('Proceeding with address:', selectedAddress);
        }
    }

    // Show address form
    function showAddressForm() {
        const savedSection = document.getElementById('saved-addresses-section');
        const formSection = document.getElementById('address-form-section');

        if (savedSection) savedSection.style.display = 'none';
        if (formSection) formSection.style.display = 'block';

        // Clear form
        clearAddressForm();
    }

    // Show address selection
    function showAddressSelection() {
        const savedSection = document.getElementById('saved-addresses-section');
        const formSection = document.getElementById('address-form-section');

        if (savedSection) savedSection.style.display = 'block';
        if (formSection) formSection.style.display = 'none';

        // Clear form
        clearAddressForm();
    }

    // Clear address form
    function clearAddressForm() {
        const form = document.getElementById('checkout-address-form');
        if (form) {
            form.reset();
            
            // Clear validation states
            form.querySelectorAll('.form-control').forEach(field => {
                field.classList.remove('is-valid', 'is-invalid');
            });
            
            // Hide error messages
            document.querySelectorAll('.form-text').forEach(error => {
                error.classList.add('d-none');
            });
        }
    }

    // Use new address (from form)
    function useNewAddress() {
        console.log('Using new address from form...');
        
        // Validate form
        const isValid = validateAddressForm();
        
        if (isValid) {
            // Get form data
            const formData = getFormData();
            
            // Save to session storage
            sessionStorage.setItem('addressData', JSON.stringify(formData));
            
            // Save to localStorage if checkbox is checked
            const saveCheckbox = document.getElementById('save-address');
            if (saveCheckbox && saveCheckbox.checked) {
                saveAddressForFuture(formData);
            }
            
            // Show success message
            showMessage('Address saved and selected successfully!', 'success');
            
            // Return to address selection
            showAddressSelection();
            
            // Reload addresses to show new one
            loadSavedAddresses();
            displayAddressSelection();
            
            // Enable continue to payment button
            const continueBtn = document.getElementById('continue-to-payment-btn');
            if (continueBtn) {
                continueBtn.disabled = false;
                continueBtn.classList.remove('disabled');
            }
        }
    }

    // Validate address form
    function validateAddressForm() {
        const requiredFields = ['name', 'phone', 'address', 'city', 'zipCode', 'state', 'country'];
        let isValid = true;

        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field && !field.value.trim()) {
                isValid = false;
                field.classList.add('is-invalid');
                showFieldError(fieldId, 'This field is required');
            }
        });

        return isValid;
    }

    // Get form data
    function getFormData() {
        return {
            name: document.getElementById('name')?.value || '',
            phone: document.getElementById('phone')?.value || '',
            address: document.getElementById('address')?.value || '',
            city: document.getElementById('city')?.value || '',
            zipCode: document.getElementById('zipCode')?.value || '',
            state: document.getElementById('state')?.value || '',
            country: document.getElementById('country')?.value || '',
            deliveryInstructions: document.getElementById('delivery-instructions')?.value || '',
            savedAt: new Date().toISOString()
        };
    }

    // Save address for future use
    function saveAddressForFuture(addressData) {
        savedAddresses.push(addressData);
        localStorage.setItem('savedAddresses', JSON.stringify(savedAddresses));
        console.log('Address saved for future use');
    }

    // Edit address (global function)
    window.editAddress = function(index) {
        if (savedAddresses[index]) {
            const address = savedAddresses[index];
            
            // Show form
            showAddressForm();
            
            // Fill form with address data
            document.getElementById('name').value = address.name || '';
            document.getElementById('phone').value = address.phone || '';
            document.getElementById('address').value = address.address || '';
            document.getElementById('city').value = address.city || '';
            document.getElementById('zipCode').value = address.zipCode || '';
            document.getElementById('state').value = address.state || '';
            document.getElementById('country').value = address.country || '';
            document.getElementById('delivery-instructions').value = address.deliveryInstructions || '';
            
            // Store edit index
            document.getElementById('use-this-address-btn').setAttribute('data-edit-index', index);
        }
    };

    // Delete address (global function)
    window.deleteAddress = function(index) {
        if (confirm('Are you sure you want to delete this address?')) {
            savedAddresses.splice(index, 1);
            localStorage.setItem('savedAddresses', JSON.stringify(savedAddresses));
            displayAddressSelection();
            showMessage('Address deleted successfully!', 'success');
        }
    };

    // Initialize address system after checkout initialization
    initializeAddressSystem();

    // Initialize the checkout page
    await initializeCheckout();
});