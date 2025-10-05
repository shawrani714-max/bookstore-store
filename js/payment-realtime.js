/**
 * Real-time Payment Features
 * Provides real-time payment status updates, notifications, and live tracking
 */

class PaymentRealtime {
    constructor() {
        this.socket = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
        this.setupRealtimeFeatures();
    }

    setupRealtimeFeatures() {
        this.initializeWebSocket();
        this.setupPaymentStatusUpdates();
        this.setupLiveNotifications();
        this.setupPaymentTracking();
        this.setupRealTimeValidation();
        this.setupLiveChat();
        this.setupPaymentAlerts();
    }

    // WebSocket initialization
    initializeWebSocket() {
        try {
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const wsUrl = `${protocol}//${window.location.host}/ws/payment`;
            
            this.socket = new WebSocket(wsUrl);
            
            this.socket.onopen = () => {
                console.log('Payment WebSocket connected');
                this.isConnected = true;
                this.reconnectAttempts = 0;
                this.onConnectionEstablished();
            };
            
            this.socket.onmessage = (event) => {
                this.handleWebSocketMessage(event);
            };
            
            this.socket.onclose = () => {
                console.log('Payment WebSocket disconnected');
                this.isConnected = false;
                this.onConnectionLost();
            };
            
            this.socket.onerror = (error) => {
                console.error('Payment WebSocket error:', error);
                this.onConnectionError(error);
            };
            
        } catch (error) {
            console.error('Failed to initialize WebSocket:', error);
            this.fallbackToPolling();
        }
    }

    onConnectionEstablished() {
        // Send authentication
        this.authenticateWebSocket();
        
        // Subscribe to payment updates
        this.subscribeToPaymentUpdates();
        
        // Show connection status
        this.showConnectionStatus('connected');
    }

    onConnectionLost() {
        this.showConnectionStatus('disconnected');
        this.attemptReconnection();
    }

    onConnectionError(error) {
        console.error('WebSocket connection error:', error);
        this.showConnectionStatus('error');
    }

    authenticateWebSocket() {
        const token = localStorage.getItem('token');
        if (token) {
            this.sendMessage({
                type: 'auth',
                token: token
            });
        }
    }

    subscribeToPaymentUpdates() {
        this.sendMessage({
            type: 'subscribe',
            channel: 'payment_updates'
        });
    }

    // Real-time payment status updates
    setupPaymentStatusUpdates() {
        this.paymentStatusHandlers = {
            'payment_initiated': this.handlePaymentInitiated.bind(this),
            'payment_processing': this.handlePaymentProcessing.bind(this),
            'payment_success': this.handlePaymentSuccess.bind(this),
            'payment_failed': this.handlePaymentFailed.bind(this),
            'payment_cancelled': this.handlePaymentCancelled.bind(this),
            'payment_refunded': this.handlePaymentRefunded.bind(this)
        };
    }

    handleWebSocketMessage(event) {
        try {
            const message = JSON.parse(event.data);
            const handler = this.paymentStatusHandlers[message.type];
            
            if (handler) {
                handler(message.data);
            } else {
                console.log('Unknown message type:', message.type);
            }
        } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
        }
    }

    handlePaymentInitiated(data) {
        this.showPaymentStatus('Payment initiated', 'info', data);
        this.updatePaymentProgress(10);
    }

    handlePaymentProcessing(data) {
        this.showPaymentStatus('Processing payment...', 'processing', data);
        this.updatePaymentProgress(50);
        this.startProcessingAnimation();
    }

    handlePaymentSuccess(data) {
        this.showPaymentStatus('Payment successful!', 'success', data);
        this.updatePaymentProgress(100);
        this.stopProcessingAnimation();
        this.showSuccessAnimation();
        
        // Redirect to success page after delay
        setTimeout(() => {
            window.location.href = '/order-success.html';
        }, 2000);
    }

    handlePaymentFailed(data) {
        this.showPaymentStatus('Payment failed', 'error', data);
        this.updatePaymentProgress(0);
        this.stopProcessingAnimation();
        this.showErrorAnimation();
        this.showRetryOptions(data);
    }

    handlePaymentCancelled(data) {
        this.showPaymentStatus('Payment cancelled', 'warning', data);
        this.updatePaymentProgress(0);
        this.stopProcessingAnimation();
    }

    handlePaymentRefunded(data) {
        this.showPaymentStatus('Payment refunded', 'info', data);
        this.updatePaymentProgress(0);
    }

    // Live notifications
    setupLiveNotifications() {
        this.notificationQueue = [];
        this.setupNotificationPermission();
        this.setupNotificationStyles();
    }

    setupNotificationPermission() {
        if ('Notification' in window) {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    this.notificationsEnabled = true;
                }
            });
        }
    }

    setupNotificationStyles() {
        const style = document.createElement('style');
        style.id = 'realtime-notification-styles';
        style.textContent = `
            .realtime-notification {
                position: fixed;
                top: 20px;
                right: 20px;
                max-width: 350px;
                background: white;
                border-radius: 12px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
                z-index: 10000;
                animation: slideInRight 0.3s ease;
                border-left: 4px solid #2563eb;
            }
            
            .realtime-notification.success {
                border-left-color: #10b981;
            }
            
            .realtime-notification.error {
                border-left-color: #ef4444;
            }
            
            .realtime-notification.warning {
                border-left-color: #f59e0b;
            }
            
            .realtime-notification.info {
                border-left-color: #3b82f6;
            }
            
            .notification-content {
                padding: 16px;
                display: flex;
                align-items: flex-start;
                gap: 12px;
            }
            
            .notification-icon {
                font-size: 20px;
                margin-top: 2px;
            }
            
            .notification-text h4 {
                margin: 0 0 4px 0;
                font-size: 14px;
                font-weight: 600;
                color: #1f2937;
            }
            
            .notification-text p {
                margin: 0;
                font-size: 12px;
                color: #6b7280;
            }
            
            .notification-close {
                background: none;
                border: none;
                color: #9ca3af;
                cursor: pointer;
                padding: 4px;
                margin-left: auto;
            }
            
            .payment-progress {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 4px;
                background: #e5e7eb;
                z-index: 10001;
            }
            
            .payment-progress-bar {
                height: 100%;
                background: linear-gradient(90deg, #2563eb, #3b82f6);
                transition: width 0.3s ease;
                width: 0%;
            }
            
            .processing-animation {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                z-index: 10002;
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 24px;
                border-radius: 12px;
                text-align: center;
            }
            
            .processing-spinner {
                width: 40px;
                height: 40px;
                border: 3px solid #f3f3f3;
                border-top: 3px solid #2563eb;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 16px;
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
    }

    showPaymentStatus(message, type, data) {
        // Show browser notification
        if (this.notificationsEnabled) {
            this.showBrowserNotification(message, type);
        }
        
        // Show in-app notification
        this.showInAppNotification(message, type, data);
        
        // Update payment status in UI
        this.updatePaymentStatusUI(message, type);
    }

    showBrowserNotification(message, type) {
        if ('Notification' in window && Notification.permission === 'granted') {
            const notification = new Notification('Payment Update', {
                body: message,
                icon: '/images/logo.png',
                tag: 'payment-update'
            });
            
            notification.onclick = () => {
                window.focus();
                notification.close();
            };
        }
    }

    showInAppNotification(message, type, data) {
        const notification = document.createElement('div');
        notification.className = `realtime-notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">
                    <i class="fas ${this.getNotificationIcon(type)}"></i>
                </div>
                <div class="notification-text">
                    <h4>Payment Update</h4>
                    <p>${message}</p>
                    ${data ? `<small>${JSON.stringify(data)}</small>` : ''}
                </div>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle',
            processing: 'fa-spinner fa-spin'
        };
        return icons[type] || 'fa-info-circle';
    }

    updatePaymentStatusUI(message, type) {
        const statusElement = document.getElementById('payment-status');
        if (statusElement) {
            statusElement.textContent = message;
            statusElement.className = `payment-status ${type}`;
        }
    }

    // Payment progress tracking
    updatePaymentProgress(percentage) {
        let progressBar = document.querySelector('.payment-progress-bar');
        if (!progressBar) {
            const progressContainer = document.createElement('div');
            progressContainer.className = 'payment-progress';
            progressContainer.innerHTML = '<div class="payment-progress-bar"></div>';
            document.body.appendChild(progressContainer);
            progressBar = progressContainer.querySelector('.payment-progress-bar');
        }
        
        progressBar.style.width = percentage + '%';
        
        if (percentage === 100) {
            setTimeout(() => {
                progressBar.parentElement.remove();
            }, 2000);
        }
    }

    startProcessingAnimation() {
        const animation = document.createElement('div');
        animation.className = 'processing-animation';
        animation.id = 'processing-animation';
        animation.innerHTML = `
            <div class="processing-spinner"></div>
            <h4>Processing Payment...</h4>
            <p>Please wait while we process your payment</p>
        `;
        
        document.body.appendChild(animation);
    }

    stopProcessingAnimation() {
        const animation = document.getElementById('processing-animation');
        if (animation) {
            animation.remove();
        }
    }

    showSuccessAnimation() {
        const animation = document.createElement('div');
        animation.className = 'success-animation';
        animation.innerHTML = `
            <div class="success-content">
                <i class="fas fa-check-circle"></i>
                <h3>Payment Successful!</h3>
            </div>
        `;
        
        document.body.appendChild(animation);
        
        setTimeout(() => {
            animation.remove();
        }, 3000);
    }

    showErrorAnimation() {
        const animation = document.createElement('div');
        animation.className = 'error-animation';
        animation.innerHTML = `
            <div class="error-content">
                <i class="fas fa-exclamation-circle"></i>
                <h3>Payment Failed</h3>
            </div>
        `;
        
        document.body.appendChild(animation);
        
        setTimeout(() => {
            animation.remove();
        }, 3000);
    }

    // Payment tracking
    setupPaymentTracking() {
        this.trackingData = {
            startTime: Date.now(),
            steps: [],
            interactions: [],
            errors: []
        };
        
        this.trackPaymentStart();
        this.trackUserInteractions();
        this.trackFormChanges();
    }

    trackPaymentStart() {
        this.trackingData.steps.push({
            step: 'payment_started',
            timestamp: Date.now(),
            data: {
                method: this.getSelectedPaymentMethod(),
                amount: this.getOrderAmount()
            }
        });
        
        this.sendTrackingData();
    }

    trackUserInteractions() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('.payment-method, .payment-form, .payment-button')) {
                this.trackingData.interactions.push({
                    type: 'click',
                    target: e.target.tagName,
                    timestamp: Date.now(),
                    data: {
                        method: e.target.dataset.method,
                        field: e.target.name
                    }
                });
            }
        });
    }

    trackFormChanges() {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.addEventListener('input', (e) => {
                this.trackingData.interactions.push({
                    type: 'input',
                    field: e.target.name,
                    timestamp: Date.now(),
                    value: e.target.value.length
                });
            });
        });
    }

    sendTrackingData() {
        if (this.isConnected) {
            this.sendMessage({
                type: 'tracking',
                data: this.trackingData
            });
        }
    }

    // Real-time validation
    setupRealTimeValidation() {
        this.setupCardValidation();
        this.setupUPIValidation();
        this.setupAmountValidation();
    }

    setupCardValidation() {
        const cardNumberField = document.querySelector('input[name="cardNumber"]');
        if (cardNumberField) {
            cardNumberField.addEventListener('input', (e) => {
                this.validateCardNumber(e.target.value);
            });
        }
        
        const cvvField = document.querySelector('input[name="cvv"]');
        if (cvvField) {
            cvvField.addEventListener('input', (e) => {
                this.validateCVV(e.target.value);
            });
        }
        
        const expiryField = document.querySelector('input[name="expiry"]');
        if (expiryField) {
            expiryField.addEventListener('input', (e) => {
                this.validateExpiry(e.target.value);
            });
        }
    }

    validateCardNumber(number) {
        const isValid = this.luhnCheck(number);
        this.showValidationResult('cardNumber', isValid, 'Invalid card number');
    }

    validateCVV(cvv) {
        const isValid = /^[0-9]{3,4}$/.test(cvv);
        this.showValidationResult('cvv', isValid, 'Invalid CVV');
    }

    validateExpiry(expiry) {
        const isValid = /^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(expiry);
        this.showValidationResult('expiry', isValid, 'Invalid expiry date');
    }

    setupUPIValidation() {
        const upiField = document.querySelector('input[name="upiId"]');
        if (upiField) {
            upiField.addEventListener('input', (e) => {
                this.validateUPI(e.target.value);
            });
        }
    }

    validateUPI(upiId) {
        const isValid = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+$/.test(upiId);
        this.showValidationResult('upiId', isValid, 'Invalid UPI ID');
    }

    setupAmountValidation() {
        const amountField = document.querySelector('input[name="amount"]');
        if (amountField) {
            amountField.addEventListener('input', (e) => {
                this.validateAmount(e.target.value);
            });
        }
    }

    validateAmount(amount) {
        const isValid = parseFloat(amount) > 0 && parseFloat(amount) <= 100000;
        this.showValidationResult('amount', isValid, 'Invalid amount');
    }

    showValidationResult(fieldName, isValid, errorMessage) {
        const field = document.querySelector(`[name="${fieldName}"]`);
        if (field) {
            field.classList.toggle('is-valid', isValid);
            field.classList.toggle('is-invalid', !isValid);
            
            // Show/hide error message
            let errorElement = field.parentNode.querySelector('.validation-error');
            if (!isValid && !errorElement) {
                errorElement = document.createElement('div');
                errorElement.className = 'validation-error';
                field.parentNode.appendChild(errorElement);
            }
            
            if (errorElement) {
                errorElement.textContent = isValid ? '' : errorMessage;
            }
        }
    }

    luhnCheck(cardNumber) {
        let sum = 0;
        let isEven = false;
        
        for (let i = cardNumber.length - 1; i >= 0; i--) {
            let digit = parseInt(cardNumber[i]);
            
            if (isEven) {
                digit *= 2;
                if (digit > 9) {
                    digit -= 9;
                }
            }
            
            sum += digit;
            isEven = !isEven;
        }
        
        return sum % 10 === 0;
    }

    // Live chat support
    setupLiveChat() {
        this.chatWidget = this.createChatWidget();
        this.setupChatWebSocket();
    }

    createChatWidget() {
        const widget = document.createElement('div');
        widget.className = 'live-chat-widget';
        widget.innerHTML = `
            <div class="chat-toggle" onclick="this.toggleChat()">
                <i class="fas fa-comments"></i>
                <span class="chat-badge">1</span>
            </div>
            <div class="chat-window" style="display: none;">
                <div class="chat-header">
                    <h4>Payment Support</h4>
                    <button class="chat-close" onclick="this.closeChat()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="chat-messages"></div>
                <div class="chat-input">
                    <input type="text" placeholder="Type your message...">
                    <button onclick="this.sendMessage()">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(widget);
        return widget;
    }

    setupChatWebSocket() {
        // Setup separate WebSocket for chat
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const chatWsUrl = `${protocol}//${window.location.host}/ws/chat`;
        
        this.chatSocket = new WebSocket(chatWsUrl);
        
        this.chatSocket.onmessage = (event) => {
            this.handleChatMessage(event);
        };
    }

    handleChatMessage(event) {
        const message = JSON.parse(event.data);
        this.displayChatMessage(message);
    }

    displayChatMessage(message) {
        const messagesContainer = this.chatWidget.querySelector('.chat-messages');
        const messageElement = document.createElement('div');
        messageElement.className = `chat-message ${message.sender}`;
        messageElement.innerHTML = `
            <div class="message-content">${message.text}</div>
            <div class="message-time">${new Date(message.timestamp).toLocaleTimeString()}</div>
        `;
        
        messagesContainer.appendChild(messageElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Payment alerts
    setupPaymentAlerts() {
        this.setupFraudAlerts();
        this.setupSecurityAlerts();
        this.setupSystemAlerts();
    }

    setupFraudAlerts() {
        // Monitor for suspicious activity
        this.monitorSuspiciousActivity();
    }

    monitorSuspiciousActivity() {
        // Check for rapid payment attempts
        let paymentAttempts = 0;
        const timeWindow = 60000; // 1 minute
        
        setInterval(() => {
            if (paymentAttempts > 3) {
                this.triggerFraudAlert('Rapid payment attempts detected');
            }
            paymentAttempts = 0;
        }, timeWindow);
        
        // Track payment attempts
        document.addEventListener('paymentAttempt', () => {
            paymentAttempts++;
        });
    }

    triggerFraudAlert(message) {
        this.showAlert('Fraud Alert', message, 'error');
        this.sendMessage({
            type: 'fraud_alert',
            message: message,
            timestamp: Date.now()
        });
    }

    setupSecurityAlerts() {
        // Monitor for security issues
        this.monitorSecurityIssues();
    }

    monitorSecurityIssues() {
        // Check for insecure connections
        if (location.protocol !== 'https:') {
            this.showAlert('Security Warning', 'Connection is not secure', 'warning');
        }
        
        // Check for suspicious user agent
        if (this.isSuspiciousUserAgent()) {
            this.showAlert('Security Warning', 'Suspicious activity detected', 'warning');
        }
    }

    isSuspiciousUserAgent() {
        const userAgent = navigator.userAgent;
        const suspiciousPatterns = [
            /bot/i,
            /crawler/i,
            /spider/i,
            /scraper/i
        ];
        
        return suspiciousPatterns.some(pattern => pattern.test(userAgent));
    }

    setupSystemAlerts() {
        // Monitor system status
        this.monitorSystemStatus();
    }

    monitorSystemStatus() {
        // Check payment gateway status
        this.checkPaymentGatewayStatus();
        
        // Check server status
        this.checkServerStatus();
    }

    checkPaymentGatewayStatus() {
        fetch('/api/payment-gateway/status')
            .then(response => response.json())
            .then(data => {
                if (!data.healthy) {
                    this.showAlert('System Alert', 'Payment gateway is experiencing issues', 'warning');
                }
            })
            .catch(error => {
                this.showAlert('System Alert', 'Unable to check payment gateway status', 'error');
            });
    }

    checkServerStatus() {
        fetch('/api/health')
            .then(response => response.json())
            .then(data => {
                if (!data.healthy) {
                    this.showAlert('System Alert', 'Server is experiencing issues', 'warning');
                }
            })
            .catch(error => {
                this.showAlert('System Alert', 'Unable to check server status', 'error');
            });
    }

    showAlert(title, message, type) {
        const alert = document.createElement('div');
        alert.className = `payment-alert ${type}`;
        alert.innerHTML = `
            <div class="alert-content">
                <h4>${title}</h4>
                <p>${message}</p>
                <button class="alert-close" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        document.body.appendChild(alert);
        
        setTimeout(() => {
            if (alert.parentElement) {
                alert.remove();
            }
        }, 10000);
    }

    // Connection management
    attemptReconnection() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            this.reconnectDelay *= 2; // Exponential backoff
            
            setTimeout(() => {
                console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
                this.initializeWebSocket();
            }, this.reconnectDelay);
        } else {
            this.fallbackToPolling();
        }
    }

    fallbackToPolling() {
        console.log('Falling back to polling for payment updates');
        this.startPolling();
    }

    startPolling() {
        this.pollingInterval = setInterval(() => {
            this.pollPaymentStatus();
        }, 5000); // Poll every 5 seconds
    }

    stopPolling() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
        }
    }

    pollPaymentStatus() {
        const paymentId = this.getCurrentPaymentId();
        if (paymentId) {
            fetch(`/api/payments/${paymentId}/status`)
                .then(response => response.json())
                .then(data => {
                    this.handlePaymentStatusUpdate(data);
                })
                .catch(error => {
                    console.error('Failed to poll payment status:', error);
                });
        }
    }

    handlePaymentStatusUpdate(data) {
        const handler = this.paymentStatusHandlers[data.status];
        if (handler) {
            handler(data);
        }
    }

    // Utility methods
    sendMessage(message) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(message));
        }
    }

    showConnectionStatus(status) {
        const statusElement = document.getElementById('connection-status');
        if (statusElement) {
            statusElement.textContent = status;
            statusElement.className = `connection-status ${status}`;
        }
    }

    getSelectedPaymentMethod() {
        const selectedMethod = document.querySelector('input[name="paymentMethod"]:checked');
        return selectedMethod ? selectedMethod.value : null;
    }

    getOrderAmount() {
        const totalElement = document.getElementById('summary-total');
        if (!totalElement) return 0;
        
        const amountText = totalElement.textContent.replace('₹', '').replace(',', '');
        return parseFloat(amountText) || 0;
    }

    getCurrentPaymentId() {
        return sessionStorage.getItem('currentPaymentId');
    }

    showRetryOptions(data) {
        const retryContainer = document.createElement('div');
        retryContainer.className = 'payment-retry-options';
        retryContainer.innerHTML = `
            <div class="retry-content">
                <h4>Payment Failed</h4>
                <p>${data.message || 'Your payment could not be processed'}</p>
                <div class="retry-buttons">
                    <button class="btn btn-primary" onclick="this.retryPayment()">Retry Payment</button>
                    <button class="btn btn-outline-secondary" onclick="this.changePaymentMethod()">Change Payment Method</button>
                    <button class="btn btn-outline-secondary" onclick="this.contactSupport()">Contact Support</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(retryContainer);
    }

    retryPayment() {
        // Retry payment logic
        const form = document.getElementById('payment-form');
        if (form) {
            form.submit();
        }
    }

    changePaymentMethod() {
        // Show payment method selection
        document.querySelectorAll('.payment-form').forEach(form => {
            form.style.display = 'none';
        });
        
        const methodSelection = document.getElementById('payment-method-selection');
        if (methodSelection) {
            methodSelection.style.display = 'block';
        }
    }

    contactSupport() {
        // Open support chat
        this.chatWidget.querySelector('.chat-toggle').click();
    }

    // Cleanup
    destroy() {
        if (this.socket) {
            this.socket.close();
        }
        
        if (this.chatSocket) {
            this.chatSocket.close();
        }
        
        this.stopPolling();
    }
}

// Export for use in other modules
window.PaymentRealtime = PaymentRealtime;
