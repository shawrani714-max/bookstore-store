/**
 * Comprehensive Payment Error Handling and Recovery
 * Provides detailed error handling with user-friendly messages and recovery suggestions
 */

class PaymentErrorHandler {
    constructor() {
        this.errorCodes = this.initializeErrorCodes();
        this.recoveryActions = this.initializeRecoveryActions();
        this.setupErrorHandling();
    }

    initializeErrorCodes() {
        return {
            // Card-related errors
            'CARD_DECLINED': {
                message: 'Your card was declined. Please try a different card.',
                severity: 'error',
                category: 'card'
            },
            'INSUFFICIENT_FUNDS': {
                message: 'Insufficient funds. Please check your account balance.',
                severity: 'error',
                category: 'card'
            },
            'EXPIRED_CARD': {
                message: 'Your card has expired. Please use a different card.',
                severity: 'error',
                category: 'card'
            },
            'INVALID_CARD': {
                message: 'Invalid card details. Please check and try again.',
                severity: 'error',
                category: 'card'
            },
            'CARD_BLOCKED': {
                message: 'Your card is blocked. Please contact your bank.',
                severity: 'error',
                category: 'card'
            },

            // UPI-related errors
            'INVALID_UPI': {
                message: 'Invalid UPI ID. Please check and try again.',
                severity: 'error',
                category: 'upi'
            },
            'UPI_APP_NOT_FOUND': {
                message: 'UPI app not found. Please install a UPI app and try again.',
                severity: 'error',
                category: 'upi'
            },
            'UPI_PAYMENT_FAILED': {
                message: 'UPI payment failed. Please try again or use a different payment method.',
                severity: 'error',
                category: 'upi'
            },

            // Net banking errors
            'BANK_SERVER_ERROR': {
                message: 'Bank server is temporarily unavailable. Please try again later.',
                severity: 'error',
                category: 'netbanking'
            },
            'INVALID_BANK_CREDENTIALS': {
                message: 'Invalid bank credentials. Please check your login details.',
                severity: 'error',
                category: 'netbanking'
            },
            'BANK_MAINTENANCE': {
                message: 'Bank is under maintenance. Please try again later.',
                severity: 'warning',
                category: 'netbanking'
            },

            // Network and system errors
            'NETWORK_ERROR': {
                message: 'Network error. Please check your connection and try again.',
                severity: 'error',
                category: 'system'
            },
            'TIMEOUT_ERROR': {
                message: 'Payment request timed out. Please try again.',
                severity: 'error',
                category: 'system'
            },
            'SERVER_ERROR': {
                message: 'Server error. Please try again in a few minutes.',
                severity: 'error',
                category: 'system'
            },

            // Validation errors
            'VALIDATION_ERROR': {
                message: 'Please check your payment details and try again.',
                severity: 'error',
                category: 'validation'
            },
            'MISSING_FIELDS': {
                message: 'Please fill in all required fields.',
                severity: 'error',
                category: 'validation'
            },
            'INVALID_AMOUNT': {
                message: 'Invalid payment amount. Please refresh and try again.',
                severity: 'error',
                category: 'validation'
            },

            // Rate limiting
            'RATE_LIMIT_EXCEEDED': {
                message: 'Too many payment attempts. Please wait a few minutes before trying again.',
                severity: 'warning',
                category: 'security'
            },
            'FRAUD_DETECTED': {
                message: 'Suspicious activity detected. Please contact support.',
                severity: 'error',
                category: 'security'
            },

            // Gateway errors
            'GATEWAY_ERROR': {
                message: 'Payment gateway error. Please try again or use a different payment method.',
                severity: 'error',
                category: 'gateway'
            },
            'GATEWAY_TIMEOUT': {
                message: 'Payment gateway timeout. Please try again.',
                severity: 'error',
                category: 'gateway'
            },
            'GATEWAY_MAINTENANCE': {
                message: 'Payment gateway is under maintenance. Please try again later.',
                severity: 'warning',
                category: 'gateway'
            }
        };
    }

    initializeRecoveryActions() {
        return {
            'CARD_DECLINED': [
                'Try a different card',
                'Contact your bank',
                'Use UPI payment',
                'Try Cash on Delivery'
            ],
            'INSUFFICIENT_FUNDS': [
                'Check account balance',
                'Use a different payment method',
                'Try Cash on Delivery',
                'Add money to your account'
            ],
            'EXPIRED_CARD': [
                'Use a different card',
                'Update card details',
                'Use UPI payment',
                'Try Cash on Delivery'
            ],
            'INVALID_UPI': [
                'Check UPI ID format',
                'Use a different UPI ID',
                'Try card payment',
                'Use Cash on Delivery'
            ],
            'NETWORK_ERROR': [
                'Check internet connection',
                'Try again in a few minutes',
                'Use mobile data',
                'Contact support if issue persists'
            ],
            'RATE_LIMIT_EXCEEDED': [
                'Wait 15 minutes before trying again',
                'Use a different payment method',
                'Contact support for assistance'
            ],
            'GATEWAY_ERROR': [
                'Try again in a few minutes',
                'Use a different payment method',
                'Contact support if issue persists'
            ]
        };
    }

    setupErrorHandling() {
        // Global error handler for unhandled payment errors
        window.addEventListener('unhandledrejection', (event) => {
            if (event.reason instanceof PaymentError) {
                this.handlePaymentError(event.reason, { source: 'unhandledrejection' });
                event.preventDefault();
            }
        });

        // Setup error reporting
        this.setupErrorReporting();
    }

    // Main error handling method
    handlePaymentError(error, context = {}) {
        console.error('Payment Error:', error, context);

        // Get error details
        const errorDetails = this.getErrorDetails(error);
        
        // Log error for debugging
        this.logError(error, context);
        
        // Show user-friendly message
        this.showErrorMessage(errorDetails);
        
        // Suggest recovery actions
        this.suggestRecoveryActions(error.code);
        
        // Track error for analytics
        this.trackError(error, context);
        
        // Handle specific error types
        this.handleSpecificError(error, context);
    }

    getErrorDetails(error) {
        const errorCode = error.code || 'UNKNOWN_ERROR';
        const errorInfo = this.errorCodes[errorCode] || {
            message: 'An unexpected error occurred. Please try again.',
            severity: 'error',
            category: 'unknown'
        };

        return {
            code: errorCode,
            message: errorInfo.message,
            severity: errorInfo.severity,
            category: errorInfo.category,
            originalError: error.message,
            details: error.details
        };
    }

    showErrorMessage(errorDetails) {
        // Remove any existing error messages
        this.clearErrorMessages();

        // Create error message element
        const errorElement = document.createElement('div');
        errorElement.className = `payment-error-message ${errorDetails.severity}`;
        errorElement.innerHTML = `
            <div class="error-content">
                <div class="error-icon">
                    <i class="fas ${this.getErrorIcon(errorDetails.severity)}"></i>
                </div>
                <div class="error-text">
                    <h4>${this.getErrorTitle(errorDetails.severity)}</h4>
                    <p>${errorDetails.message}</p>
                    ${errorDetails.details ? `<small class="error-details">${errorDetails.details}</small>` : ''}
                </div>
                <button class="error-close" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        // Add to page
        const container = document.getElementById('payment-error-container') || document.body;
        container.appendChild(errorElement);

        // Auto-remove after 10 seconds for warnings
        if (errorDetails.severity === 'warning') {
            setTimeout(() => {
                if (errorElement.parentElement) {
                    errorElement.remove();
                }
            }, 10000);
        }

        // Add CSS if not already added
        this.addErrorStyles();
    }

    suggestRecoveryActions(errorCode) {
        const actions = this.recoveryActions[errorCode] || [
            'Try again',
            'Use a different payment method',
            'Contact support'
        ];

        // Create recovery actions element
        const actionsElement = document.createElement('div');
        actionsElement.className = 'payment-recovery-actions';
        actionsElement.innerHTML = `
            <div class="recovery-content">
                <h5>What you can do:</h5>
                <ul class="recovery-list">
                    ${actions.map(action => `<li>${action}</li>`).join('')}
                </ul>
                <div class="recovery-buttons">
                    <button class="btn btn-primary retry-payment-btn">Try Again</button>
                    <button class="btn btn-outline-secondary change-method-btn">Change Payment Method</button>
                    <button class="btn btn-outline-secondary contact-support-btn">Contact Support</button>
                </div>
            </div>
        `;

        // Add event listeners
        actionsElement.querySelector('.retry-payment-btn').addEventListener('click', () => {
            this.retryPayment();
        });

        actionsElement.querySelector('.change-method-btn').addEventListener('click', () => {
            this.showPaymentMethodSelection();
        });

        actionsElement.querySelector('.contact-support-btn').addEventListener('click', () => {
            this.contactSupport();
        });

        // Add to page
        const container = document.getElementById('payment-error-container') || document.body;
        container.appendChild(actionsElement);
    }

    handleSpecificError(error, context) {
        switch (error.code) {
            case 'RATE_LIMIT_EXCEEDED':
                this.handleRateLimitError(error, context);
                break;
            case 'FRAUD_DETECTED':
                this.handleFraudError(error, context);
                break;
            case 'NETWORK_ERROR':
                this.handleNetworkError(error, context);
                break;
            case 'GATEWAY_MAINTENANCE':
                this.handleMaintenanceError(error, context);
                break;
        }
    }

    handleRateLimitError(error, context) {
        // Show countdown timer
        this.showRateLimitCountdown(context.retryAfter || 900000); // 15 minutes default
    }

    handleFraudError(error, context) {
        // Block further payment attempts
        this.blockPaymentAttempts();
        
        // Show security warning
        this.showSecurityWarning();
        
        // Log security event
        this.logSecurityEvent(error, context);
    }

    handleNetworkError(error, context) {
        // Check network connectivity
        this.checkNetworkConnectivity();
        
        // Offer offline alternatives
        this.offerOfflineAlternatives();
    }

    handleMaintenanceError(error, context) {
        // Show maintenance notice
        this.showMaintenanceNotice();
        
        // Offer alternative payment methods
        this.offerAlternativeMethods();
    }

    // Recovery action methods
    retryPayment() {
        // Clear error messages
        this.clearErrorMessages();
        
        // Reset payment form
        this.resetPaymentForm();
        
        // Show payment form again
        this.showPaymentForm();
    }

    showPaymentMethodSelection() {
        // Clear error messages
        this.clearErrorMessages();
        
        // Show payment method selection
        const methodSelection = document.getElementById('payment-method-selection');
        if (methodSelection) {
            methodSelection.style.display = 'block';
        }
    }

    contactSupport() {
        // Open support chat or redirect to support page
        const supportUrl = '/contact?issue=payment&error=' + encodeURIComponent(this.lastError?.code || 'unknown');
        window.open(supportUrl, '_blank');
    }

    // Utility methods
    getErrorIcon(severity) {
        const icons = {
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        return icons[severity] || 'fa-exclamation-circle';
    }

    getErrorTitle(severity) {
        const titles = {
            error: 'Payment Error',
            warning: 'Payment Warning',
            info: 'Payment Information'
        };
        return titles[severity] || 'Payment Error';
    }

    clearErrorMessages() {
        document.querySelectorAll('.payment-error-message, .payment-recovery-actions').forEach(el => {
            el.remove();
        });
    }

    resetPaymentForm() {
        // Reset payment form fields
        document.querySelectorAll('#payment-form input, #payment-form select').forEach(field => {
            field.value = '';
            field.classList.remove('is-invalid');
        });
    }

    showPaymentForm() {
        const paymentForm = document.getElementById('payment-form');
        if (paymentForm) {
            paymentForm.style.display = 'block';
        }
    }

    // Error tracking and analytics
    logError(error, context) {
        const errorLog = {
            timestamp: new Date().toISOString(),
            error: {
                code: error.code,
                message: error.message,
                stack: error.stack
            },
            context,
            userAgent: navigator.userAgent,
            url: window.location.href,
            userId: this.getCurrentUserId()
        };

        // Send to error tracking service
        this.sendErrorToService(errorLog);
        
        // Store locally for debugging
        this.storeErrorLocally(errorLog);
    }

    trackError(error, context) {
        // Track error for analytics
        if (window.gtag) {
            window.gtag('event', 'payment_error', {
                error_code: error.code,
                error_category: this.getErrorDetails(error).category,
                payment_method: context.paymentMethod || 'unknown',
                order_amount: context.orderAmount || 0
            });
        }
    }

    sendErrorToService(errorLog) {
        // Send to error tracking service (e.g., Sentry, LogRocket)
        fetch('/api/errors/payment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(errorLog)
        }).catch(err => {
            console.error('Failed to send error to service:', err);
        });
    }

    storeErrorLocally(errorLog) {
        try {
            const errors = JSON.parse(localStorage.getItem('paymentErrors') || '[]');
            errors.push(errorLog);
            
            // Keep only last 10 errors
            if (errors.length > 10) {
                errors.splice(0, errors.length - 10);
            }
            
            localStorage.setItem('paymentErrors', JSON.stringify(errors));
        } catch (error) {
            console.error('Failed to store error locally:', error);
        }
    }

    // Network and connectivity methods
    checkNetworkConnectivity() {
        if (!navigator.onLine) {
            this.showOfflineMessage();
            return false;
        }
        return true;
    }

    showOfflineMessage() {
        const offlineMessage = document.createElement('div');
        offlineMessage.className = 'payment-offline-message';
        offlineMessage.innerHTML = `
            <div class="offline-content">
                <i class="fas fa-wifi"></i>
                <h4>You're Offline</h4>
                <p>Please check your internet connection and try again.</p>
                <button class="btn btn-primary" onclick="location.reload()">Retry</button>
            </div>
        `;
        
        document.body.appendChild(offlineMessage);
    }

    offerOfflineAlternatives() {
        const alternatives = document.createElement('div');
        alternatives.className = 'payment-offline-alternatives';
        alternatives.innerHTML = `
            <div class="alternatives-content">
                <h5>Offline Payment Options:</h5>
                <ul>
                    <li>Cash on Delivery</li>
                    <li>Bank Transfer</li>
                    <li>Visit our store</li>
                </ul>
            </div>
        `;
        
        document.body.appendChild(alternatives);
    }

    // Rate limiting methods
    showRateLimitCountdown(retryAfter) {
        const countdownElement = document.createElement('div');
        countdownElement.className = 'payment-rate-limit-countdown';
        countdownElement.innerHTML = `
            <div class="countdown-content">
                <i class="fas fa-clock"></i>
                <h4>Too Many Attempts</h4>
                <p>Please wait before trying again.</p>
                <div class="countdown-timer">
                    <span id="countdown-time">${Math.ceil(retryAfter / 1000)}</span> seconds
                </div>
            </div>
        `;
        
        document.body.appendChild(countdownElement);
        
        // Start countdown
        this.startCountdown(retryAfter, countdownElement);
    }

    startCountdown(duration, element) {
        let remaining = Math.ceil(duration / 1000);
        
        const timer = setInterval(() => {
            remaining--;
            const timeElement = element.querySelector('#countdown-time');
            if (timeElement) {
                timeElement.textContent = remaining;
            }
            
            if (remaining <= 0) {
                clearInterval(timer);
                element.remove();
            }
        }, 1000);
    }

    // Security methods
    blockPaymentAttempts() {
        // Block payment attempts for a period
        localStorage.setItem('paymentBlocked', JSON.stringify({
            blocked: true,
            until: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutes
        }));
    }

    showSecurityWarning() {
        const warning = document.createElement('div');
        warning.className = 'payment-security-warning';
        warning.innerHTML = `
            <div class="warning-content">
                <i class="fas fa-shield-alt"></i>
                <h4>Security Alert</h4>
                <p>Suspicious activity detected. Please contact support immediately.</p>
                <button class="btn btn-danger" onclick="window.open('/contact?issue=security', '_blank')">
                    Contact Support
                </button>
            </div>
        `;
        
        document.body.appendChild(warning);
    }

    logSecurityEvent(error, context) {
        const securityLog = {
            timestamp: new Date().toISOString(),
            type: 'fraud_detected',
            error: error.code,
            context,
            userAgent: navigator.userAgent,
            ip: 'unknown', // Would be filled by server
            userId: this.getCurrentUserId()
        };
        
        // Send to security monitoring service
        fetch('/api/security/events', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(securityLog)
        }).catch(err => {
            console.error('Failed to log security event:', err);
        });
    }

    // Maintenance methods
    showMaintenanceNotice() {
        const notice = document.createElement('div');
        notice.className = 'payment-maintenance-notice';
        notice.innerHTML = `
            <div class="notice-content">
                <i class="fas fa-tools"></i>
                <h4>Payment System Maintenance</h4>
                <p>Our payment system is currently under maintenance. Please try again later.</p>
                <div class="maintenance-info">
                    <p><strong>Expected completion:</strong> 2 hours</p>
                    <p><strong>Alternative:</strong> Cash on Delivery available</p>
                </div>
            </div>
        `;
        
        document.body.appendChild(notice);
    }

    offerAlternativeMethods() {
        const alternatives = document.createElement('div');
        alternatives.className = 'payment-alternative-methods';
        alternatives.innerHTML = `
            <div class="alternatives-content">
                <h5>Alternative Payment Methods:</h5>
                <div class="alternative-buttons">
                    <button class="btn btn-outline-primary" onclick="this.selectPaymentMethod('cod')">
                        Cash on Delivery
                    </button>
                    <button class="btn btn-outline-primary" onclick="this.selectPaymentMethod('bank_transfer')">
                        Bank Transfer
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(alternatives);
    }

    // Utility methods
    getCurrentUserId() {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        return user.id || 'anonymous';
    }

    addErrorStyles() {
        if (document.getElementById('payment-error-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'payment-error-styles';
        style.textContent = `
            .payment-error-message {
                position: fixed;
                top: 20px;
                right: 20px;
                max-width: 400px;
                background: white;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                z-index: 10000;
                animation: slideInRight 0.3s ease;
            }
            
            .payment-error-message.error {
                border-left: 4px solid #dc3545;
            }
            
            .payment-error-message.warning {
                border-left: 4px solid #ffc107;
            }
            
            .payment-error-message.info {
                border-left: 4px solid #17a2b8;
            }
            
            .error-content {
                display: flex;
                align-items: flex-start;
                padding: 16px;
                gap: 12px;
            }
            
            .error-icon {
                color: #dc3545;
                font-size: 20px;
                margin-top: 2px;
            }
            
            .error-text h4 {
                margin: 0 0 8px 0;
                color: #333;
                font-size: 16px;
            }
            
            .error-text p {
                margin: 0 0 8px 0;
                color: #666;
                font-size: 14px;
            }
            
            .error-details {
                color: #999;
                font-size: 12px;
            }
            
            .error-close {
                background: none;
                border: none;
                color: #999;
                cursor: pointer;
                padding: 4px;
                margin-left: auto;
            }
            
            .payment-recovery-actions {
                position: fixed;
                top: 80px;
                right: 20px;
                max-width: 400px;
                background: white;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                z-index: 10000;
                animation: slideInRight 0.3s ease;
            }
            
            .recovery-content {
                padding: 16px;
            }
            
            .recovery-content h5 {
                margin: 0 0 12px 0;
                color: #333;
                font-size: 14px;
            }
            
            .recovery-list {
                margin: 0 0 16px 0;
                padding-left: 20px;
                color: #666;
                font-size: 14px;
            }
            
            .recovery-list li {
                margin-bottom: 4px;
            }
            
            .recovery-buttons {
                display: flex;
                gap: 8px;
                flex-wrap: wrap;
            }
            
            .recovery-buttons .btn {
                font-size: 12px;
                padding: 6px 12px;
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
}

// Export for use in other modules
window.PaymentErrorHandler = PaymentErrorHandler;
