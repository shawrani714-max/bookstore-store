/**
 * Payment Gateway Integration
 * Handles integration with multiple payment gateways
 */

class PaymentGateway {
    constructor() {
        this.gateways = {
            razorpay: new RazorpayGateway(),
            payu: new PayUGateway(),
            paytm: new PaytmGateway()
        };
        this.currentGateway = 'razorpay'; // Default gateway
        this.setupGateway();
    }

    setupGateway() {
        // Load gateway scripts dynamically
        this.loadGatewayScripts();
    }

    async loadGatewayScripts() {
        const scripts = [
            'https://checkout.razorpay.com/v1/checkout.js',
            'https://secure.payu.in/_payment'
        ];

        for (const script of scripts) {
            await this.loadScript(script);
        }
    }

    loadScript(src) {
        return new Promise((resolve, reject) => {
            if (document.querySelector(`script[src="${src}"]`)) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    async processPayment(method, amount, details, orderData) {
        try {
            // Validate payment details first
            const security = new PaymentSecurity();
            const validation = security.validatePaymentDetails(method, details);
            
            if (!validation.isValid) {
                throw new PaymentError('Validation failed', 'VALIDATION_ERROR', validation.errors);
            }

            // Check rate limiting
            const userId = this.getCurrentUserId();
            const rateLimit = security.checkRateLimit(userId);
            if (!rateLimit.allowed) {
                throw new PaymentError('Rate limit exceeded', 'RATE_LIMIT_EXCEEDED');
            }

            // Create payment intent
            const paymentIntent = await this.createPaymentIntent(method, amount, orderData);
            
            // Handle different payment methods
            switch(method) {
                case 'card':
                    return await this.processCardPayment(paymentIntent, details);
                case 'upi':
                    return await this.processUPIPayment(paymentIntent, details);
                case 'netbanking':
                    return await this.processNetBanking(paymentIntent, details);
                case 'cod':
                    return await this.processCOD(paymentIntent, details);
                default:
                    throw new PaymentError('Unsupported payment method', 'UNSUPPORTED_METHOD');
            }
        } catch (error) {
            console.error('Payment processing error:', error);
            throw error;
        }
    }

    async createPaymentIntent(method, amount, orderData) {
        const paymentIntent = {
            id: this.generatePaymentId(),
            amount: amount * 100, // Convert to paise
            currency: 'INR',
            method,
            orderId: orderData.orderId,
            customerId: orderData.customerId,
            timestamp: new Date().toISOString()
        };

        // Store payment intent
        sessionStorage.setItem('paymentIntent', JSON.stringify(paymentIntent));
        
        return paymentIntent;
    }

    async processCardPayment(paymentIntent, cardDetails) {
        try {
            // Tokenize card data
            const security = new PaymentSecurity();
            const token = await security.tokenizeCardData(cardDetails);

            // Process with Razorpay
            const options = {
                key: this.getRazorpayKey(),
                amount: paymentIntent.amount,
                currency: paymentIntent.currency,
                name: 'Bookworld India',
                description: 'Book Purchase',
                order_id: paymentIntent.id,
                prefill: {
                    name: cardDetails.name,
                    email: this.getCurrentUserEmail(),
                    contact: this.getCurrentUserPhone()
                },
                notes: {
                    order_id: paymentIntent.orderId
                },
                theme: {
                    color: '#2563eb'
                },
                handler: (response) => {
                    this.handlePaymentSuccess(response, paymentIntent);
                },
                modal: {
                    ondismiss: () => {
                        this.handlePaymentCancellation(paymentIntent);
                    }
                }
            };

            const razorpay = new Razorpay(options);
            razorpay.open();

            return {
                success: true,
                paymentId: paymentIntent.id,
                gateway: 'razorpay'
            };

        } catch (error) {
            throw new PaymentError('Card payment failed', 'CARD_PAYMENT_FAILED', error.message);
        }
    }

    async processUPIPayment(paymentIntent, upiDetails) {
        try {
            const options = {
                key: this.getRazorpayKey(),
                amount: paymentIntent.amount,
                currency: paymentIntent.currency,
                name: 'Bookworld India',
                description: 'Book Purchase',
                order_id: paymentIntent.id,
                prefill: {
                    contact: this.getCurrentUserPhone(),
                    email: this.getCurrentUserEmail()
                },
                notes: {
                    order_id: paymentIntent.orderId,
                    upi_id: upiDetails.upiId
                },
                theme: {
                    color: '#2563eb'
                },
                handler: (response) => {
                    this.handlePaymentSuccess(response, paymentIntent);
                },
                modal: {
                    ondismiss: () => {
                        this.handlePaymentCancellation(paymentIntent);
                    }
                }
            };

            const razorpay = new Razorpay(options);
            razorpay.open();

            return {
                success: true,
                paymentId: paymentIntent.id,
                gateway: 'razorpay'
            };

        } catch (error) {
            throw new PaymentError('UPI payment failed', 'UPI_PAYMENT_FAILED', error.message);
        }
    }

    async processNetBanking(paymentIntent, bankDetails) {
        try {
            // For netbanking, redirect to bank's payment page
            const bankUrl = this.getBankPaymentUrl(bankDetails.bankCode);
            
            // Store payment intent for callback
            sessionStorage.setItem('netbankingPayment', JSON.stringify({
                paymentIntent,
                bankCode: bankDetails.bankCode
            }));

            // Redirect to bank payment page
            window.location.href = bankUrl;

        } catch (error) {
            throw new PaymentError('Net banking payment failed', 'NETBANKING_FAILED', error.message);
        }
    }

    async processCOD(paymentIntent, codDetails) {
        try {
            // For COD, just confirm the order
            const orderData = {
                paymentMethod: 'cod',
                paymentStatus: 'pending',
                paymentId: paymentIntent.id,
                amount: paymentIntent.amount / 100
            };

            // Create order
            const order = await this.createOrder(orderData);
            
            return {
                success: true,
                paymentId: paymentIntent.id,
                orderId: order.id,
                gateway: 'cod'
            };

        } catch (error) {
            throw new PaymentError('COD order creation failed', 'COD_FAILED', error.message);
        }
    }

    handlePaymentSuccess(response, paymentIntent) {
        console.log('Payment successful:', response);
        
        // Update payment status
        this.updatePaymentStatus(paymentIntent.id, 'completed', response);
        
        // Show success message
        this.showPaymentSuccess(response);
        
        // Redirect to success page
        setTimeout(() => {
            window.location.href = '/order-success.html';
        }, 2000);
    }

    handlePaymentCancellation(paymentIntent) {
        console.log('Payment cancelled:', paymentIntent);
        
        // Update payment status
        this.updatePaymentStatus(paymentIntent.id, 'cancelled');
        
        // Show cancellation message
        this.showPaymentCancellation();
    }

    async updatePaymentStatus(paymentId, status, response = null) {
        try {
            const token = localStorage.getItem('token');
            const updateData = {
                paymentId,
                status,
                response
            };

            const response = await fetch('/api/payments/update-status', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updateData)
            });

            if (!response.ok) {
                throw new Error('Failed to update payment status');
            }

        } catch (error) {
            console.error('Error updating payment status:', error);
        }
    }

    async createOrder(orderData) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(orderData)
            });

            if (!response.ok) {
                throw new Error('Failed to create order');
            }

            const result = await response.json();
            return result.data;

        } catch (error) {
            console.error('Error creating order:', error);
            throw error;
        }
    }

    showPaymentSuccess(response) {
        const message = document.createElement('div');
        message.className = 'payment-success-message';
        message.innerHTML = `
            <div class="success-content">
                <i class="fas fa-check-circle"></i>
                <h3>Payment Successful!</h3>
                <p>Your payment has been processed successfully.</p>
                <p>Payment ID: ${response.razorpay_payment_id}</p>
            </div>
        `;
        
        document.body.appendChild(message);
        
        setTimeout(() => {
            message.remove();
        }, 5000);
    }

    showPaymentCancellation() {
        const message = document.createElement('div');
        message.className = 'payment-cancellation-message';
        message.innerHTML = `
            <div class="cancellation-content">
                <i class="fas fa-times-circle"></i>
                <h3>Payment Cancelled</h3>
                <p>Your payment was cancelled. You can try again.</p>
            </div>
        `;
        
        document.body.appendChild(message);
        
        setTimeout(() => {
            message.remove();
        }, 5000);
    }

    getRazorpayKey() {
        // In production, this should come from environment variables
        return 'rzp_test_1234567890';
    }

    getBankPaymentUrl(bankCode) {
        const bankUrls = {
            'HDFC': 'https://netbanking.hdfcbank.com/netbanking/',
            'ICICI': 'https://infinity.icicibank.com/corp/AuthenticationController',
            'SBI': 'https://retail.onlinesbi.com/retail/login.htm',
            'AXIS': 'https://www.axisbank.com/retail/online-banking'
        };

        return bankUrls[bankCode] || bankUrls['HDFC'];
    }

    getCurrentUserId() {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        return user.id || 'anonymous';
    }

    getCurrentUserEmail() {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        return user.email || '';
    }

    getCurrentUserPhone() {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        return user.phone || '';
    }

    generatePaymentId() {
        return 'pay_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
}

// Razorpay Gateway Implementation
class RazorpayGateway {
    constructor() {
        this.name = 'Razorpay';
        this.supportedMethods = ['card', 'upi', 'netbanking', 'wallet'];
    }

    async processPayment(paymentData) {
        // Razorpay specific payment processing
        return {
            success: true,
            gateway: 'razorpay'
        };
    }
}

// PayU Gateway Implementation
class PayUGateway {
    constructor() {
        this.name = 'PayU';
        this.supportedMethods = ['card', 'upi', 'netbanking', 'wallet'];
    }

    async processPayment(paymentData) {
        // PayU specific payment processing
        return {
            success: true,
            gateway: 'payu'
        };
    }
}

// Paytm Gateway Implementation
class PaytmGateway {
    constructor() {
        this.name = 'Paytm';
        this.supportedMethods = ['card', 'upi', 'wallet'];
    }

    async processPayment(paymentData) {
        // Paytm specific payment processing
        return {
            success: true,
            gateway: 'paytm'
        };
    }
}

// Payment Error Class
class PaymentError extends Error {
    constructor(message, code, details = null) {
        super(message);
        this.name = 'PaymentError';
        this.code = code;
        this.details = details;
    }
}

// Export for use in other modules
window.PaymentGateway = PaymentGateway;
window.PaymentError = PaymentError;
