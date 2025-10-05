/**
 * Enhanced Payment User Experience
 * Provides smart payment suggestions, saved methods, and improved UX
 */

class PaymentUX {
    constructor() {
        this.savedMethods = this.loadSavedMethods();
        this.userPreferences = this.loadUserPreferences();
        this.paymentHistory = this.loadPaymentHistory();
        this.setupUXEnhancements();
    }

    setupUXEnhancements() {
        this.setupSmartSuggestions();
        this.setupSavedMethods();
        this.setupPaymentPreferences();
        this.setupQuickPay();
        this.setupPaymentAnimations();
    }

    // Smart payment method suggestions
    suggestPaymentMethod(orderAmount, userHistory = null) {
        const suggestions = [];
        const userHistoryData = userHistory || this.paymentHistory;

        // Amount-based suggestions
        if (orderAmount < 1000) {
            suggestions.push('upi', 'cod');
        } else if (orderAmount > 5000) {
            suggestions.push('card', 'netbanking');
        } else {
            suggestions.push('upi', 'card', 'netbanking');
        }

        // Consider user's previous payment preferences
        if (userHistoryData.mostUsed) {
            suggestions.unshift(userHistoryData.mostUsed);
        }

        // Consider user's device and location
        if (this.isMobileDevice()) {
            suggestions.unshift('upi');
        }

        // Remove duplicates while preserving order
        return [...new Set(suggestions)];
    }

    // Save payment method for future use
    async savePaymentMethod(method, details, isDefault = false) {
        try {
            const security = new PaymentSecurity();
            const encryptedDetails = security.encryptSensitiveData(details);
            
            const savedMethod = {
                id: this.generateMethodId(),
                type: method,
                displayName: this.getDisplayName(method, details),
                last4: this.getLast4Digits(details),
                expiry: method === 'card' ? details.expiry : null,
                isDefault,
                createdAt: new Date().toISOString(),
                lastUsed: new Date().toISOString()
            };

            // Store encrypted details separately
            await this.storeEncryptedMethod(savedMethod.id, encryptedDetails);
            
            // Add to saved methods
            this.savedMethods.push(savedMethod);
            
            // Update user preferences
            this.updateUserPreferences(method);
            
            // Save to localStorage
            this.saveToStorage();
            
            return savedMethod;

        } catch (error) {
            console.error('Error saving payment method:', error);
            throw error;
        }
    }

    // Load saved payment methods
    loadSavedMethods() {
        try {
            const saved = localStorage.getItem('savedPaymentMethods');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Error loading saved methods:', error);
            return [];
        }
    }

    // Load user preferences
    loadUserPreferences() {
        try {
            const preferences = localStorage.getItem('paymentPreferences');
            return preferences ? JSON.parse(preferences) : {
                preferredMethod: null,
                autoSave: true,
                quickPay: false,
                notifications: true
            };
        } catch (error) {
            console.error('Error loading preferences:', error);
            return {};
        }
    }

    // Load payment history
    loadPaymentHistory() {
        try {
            const history = localStorage.getItem('paymentHistory');
            return history ? JSON.parse(history) : {
                mostUsed: null,
                recentMethods: [],
                totalTransactions: 0,
                averageAmount: 0
            };
        } catch (error) {
            console.error('Error loading payment history:', error);
            return {};
        }
    }

    // Setup smart suggestions
    setupSmartSuggestions() {
        const suggestionContainer = document.getElementById('payment-suggestions');
        if (!suggestionContainer) return;

        // Show suggestions based on order amount
        const orderAmount = this.getOrderAmount();
        const suggestions = this.suggestPaymentMethod(orderAmount);

        suggestionContainer.innerHTML = suggestions.map(method => `
            <div class="payment-suggestion" data-method="${method}">
                <i class="fas ${this.getMethodIcon(method)}"></i>
                <span>${this.getMethodName(method)}</span>
                <small>${this.getSuggestionReason(method, orderAmount)}</small>
            </div>
        `).join('');

        // Add click handlers
        suggestionContainer.querySelectorAll('.payment-suggestion').forEach(suggestion => {
            suggestion.addEventListener('click', () => {
                this.selectSuggestedMethod(suggestion.dataset.method);
            });
        });
    }

    // Setup saved methods display
    setupSavedMethods() {
        const savedMethodsContainer = document.getElementById('saved-payment-methods');
        if (!savedMethodsContainer || this.savedMethods.length === 0) return;

        savedMethodsContainer.innerHTML = this.savedMethods.map(method => `
            <div class="saved-payment-method" data-method-id="${method.id}">
                <div class="method-info">
                    <i class="fas ${this.getMethodIcon(method.type)}"></i>
                    <div class="method-details">
                        <span class="method-name">${method.displayName}</span>
                        <small class="method-meta">${method.last4} • ${method.expiry || 'N/A'}</small>
                    </div>
                </div>
                <div class="method-actions">
                    <button class="btn btn-sm btn-primary use-method-btn">Use</button>
                    <button class="btn btn-sm btn-outline-danger delete-method-btn">Delete</button>
                </div>
            </div>
        `).join('');

        // Add event listeners
        savedMethodsContainer.querySelectorAll('.use-method-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const methodId = e.target.closest('.saved-payment-method').dataset.methodId;
                this.useSavedMethod(methodId);
            });
        });

        savedMethodsContainer.querySelectorAll('.delete-method-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const methodId = e.target.closest('.saved-payment-method').dataset.methodId;
                this.deleteSavedMethod(methodId);
            });
        });
    }

    // Setup payment preferences
    setupPaymentPreferences() {
        const preferencesContainer = document.getElementById('payment-preferences');
        if (!preferencesContainer) return;

        preferencesContainer.innerHTML = `
            <div class="preference-item">
                <label class="preference-label">
                    <input type="checkbox" id="auto-save-payment" ${this.userPreferences.autoSave ? 'checked' : ''}>
                    <span>Automatically save payment methods</span>
                </label>
            </div>
            <div class="preference-item">
                <label class="preference-label">
                    <input type="checkbox" id="quick-pay" ${this.userPreferences.quickPay ? 'checked' : ''}>
                    <span>Enable Quick Pay for future orders</span>
                </label>
            </div>
            <div class="preference-item">
                <label class="preference-label">
                    <input type="checkbox" id="payment-notifications" ${this.userPreferences.notifications ? 'checked' : ''}>
                    <span>Receive payment notifications</span>
                </label>
            </div>
        `;

        // Add event listeners
        preferencesContainer.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                this.updatePreference(e.target.id, e.target.checked);
            });
        });
    }

    // Setup Quick Pay functionality
    setupQuickPay() {
        if (!this.userPreferences.quickPay) return;

        const quickPayContainer = document.getElementById('quick-pay-container');
        if (!quickPayContainer) return;

        quickPayContainer.innerHTML = `
            <div class="quick-pay-section">
                <h5>Quick Pay</h5>
                <div class="quick-pay-methods">
                    ${this.savedMethods.filter(m => m.isDefault).map(method => `
                        <button class="quick-pay-btn" data-method-id="${method.id}">
                            <i class="fas ${this.getMethodIcon(method.type)}"></i>
                            <span>Pay with ${method.displayName}</span>
                        </button>
                    `).join('')}
                </div>
            </div>
        `;

        // Add event listeners
        quickPayContainer.querySelectorAll('.quick-pay-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const methodId = e.target.closest('.quick-pay-btn').dataset.methodId;
                this.processQuickPay(methodId);
            });
        });
    }

    // Setup payment animations
    setupPaymentAnimations() {
        // Add CSS for animations
        const style = document.createElement('style');
        style.textContent = `
            .payment-suggestion {
                padding: 12px;
                border: 1px solid #e0e0e0;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.3s ease;
                margin-bottom: 8px;
            }
            
            .payment-suggestion:hover {
                border-color: #2563eb;
                background-color: #f8f9ff;
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(37, 99, 235, 0.15);
            }
            
            .saved-payment-method {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 16px;
                border: 1px solid #e0e0e0;
                border-radius: 8px;
                margin-bottom: 12px;
                transition: all 0.3s ease;
            }
            
            .saved-payment-method:hover {
                border-color: #2563eb;
                box-shadow: 0 2px 8px rgba(37, 99, 235, 0.1);
            }
            
            .quick-pay-btn {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 12px 16px;
                border: 1px solid #2563eb;
                background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
                color: white;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.3s ease;
                margin-right: 8px;
                margin-bottom: 8px;
            }
            
            .quick-pay-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
            }
            
            .payment-processing {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 9999;
            }
            
            .processing-content {
                background: white;
                padding: 32px;
                border-radius: 12px;
                text-align: center;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
            }
            
            .processing-spinner {
                width: 48px;
                height: 48px;
                border: 4px solid #f3f3f3;
                border-top: 4px solid #2563eb;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 16px;
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }

    // Helper methods
    getOrderAmount() {
        const totalElement = document.getElementById('summary-total');
        if (!totalElement) return 0;
        
        const amountText = totalElement.textContent.replace('₹', '').replace(',', '');
        return parseFloat(amountText) || 0;
    }

    getMethodIcon(method) {
        const icons = {
            card: 'fa-credit-card',
            upi: 'fa-mobile-alt',
            netbanking: 'fa-university',
            cod: 'fa-money-bill-wave',
            wallet: 'fa-wallet'
        };
        return icons[method] || 'fa-credit-card';
    }

    getMethodName(method) {
        const names = {
            card: 'Credit/Debit Card',
            upi: 'UPI Payment',
            netbanking: 'Net Banking',
            cod: 'Cash on Delivery',
            wallet: 'Digital Wallet'
        };
        return names[method] || method;
    }

    getSuggestionReason(method, amount) {
        const reasons = {
            upi: amount < 1000 ? 'Quick & Easy' : 'Instant Payment',
            card: amount > 5000 ? 'Secure for Large Amounts' : 'Widely Accepted',
            netbanking: 'Direct Bank Transfer',
            cod: 'Pay on Delivery'
        };
        return reasons[method] || 'Recommended';
    }

    getDisplayName(method, details) {
        switch (method) {
            case 'card':
                return `**** ${details.number.slice(-4)}`;
            case 'upi':
                return details.upiId;
            case 'netbanking':
                return details.bankName || 'Net Banking';
            default:
                return this.getMethodName(method);
        }
    }

    getLast4Digits(details) {
        if (details.number) {
            return details.number.slice(-4);
        }
        return '****';
    }

    generateMethodId() {
        return 'method_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    // Action methods
    selectSuggestedMethod(method) {
        // Update UI to show selected method
        document.querySelectorAll('.payment-method').forEach(el => {
            el.classList.remove('selected');
        });
        
        const methodElement = document.querySelector(`[data-method="${method}"]`);
        if (methodElement) {
            methodElement.classList.add('selected');
            const radio = methodElement.querySelector('input[type="radio"]');
            if (radio) {
                radio.checked = true;
            }
        }

        // Show method-specific details
        this.showPaymentDetails(method);
    }

    async useSavedMethod(methodId) {
        try {
            const method = this.savedMethods.find(m => m.id === methodId);
            if (!method) {
                throw new Error('Payment method not found');
            }

            // Decrypt and use the method
            const encryptedDetails = await this.getEncryptedMethod(methodId);
            const security = new PaymentSecurity();
            const details = security.decryptSensitiveData(encryptedDetails);

            // Update last used
            method.lastUsed = new Date().toISOString();
            this.saveToStorage();

            // Process payment
            await this.processPaymentWithMethod(method.type, details);

        } catch (error) {
            console.error('Error using saved method:', error);
            this.showError('Failed to use saved payment method');
        }
    }

    async deleteSavedMethod(methodId) {
        if (!confirm('Are you sure you want to delete this payment method?')) {
            return;
        }

        try {
            // Remove from saved methods
            this.savedMethods = this.savedMethods.filter(m => m.id !== methodId);
            
            // Remove encrypted details
            await this.removeEncryptedMethod(methodId);
            
            // Save to storage
            this.saveToStorage();
            
            // Update UI
            this.setupSavedMethods();
            
            this.showSuccess('Payment method deleted successfully');

        } catch (error) {
            console.error('Error deleting saved method:', error);
            this.showError('Failed to delete payment method');
        }
    }

    async processQuickPay(methodId) {
        try {
            this.showProcessingAnimation();
            
            // Use saved method
            await this.useSavedMethod(methodId);
            
        } catch (error) {
            console.error('Quick pay error:', error);
            this.showError('Quick pay failed');
        } finally {
            this.hideProcessingAnimation();
        }
    }

    updatePreference(preferenceId, value) {
        switch (preferenceId) {
            case 'auto-save-payment':
                this.userPreferences.autoSave = value;
                break;
            case 'quick-pay':
                this.userPreferences.quickPay = value;
                break;
            case 'payment-notifications':
                this.userPreferences.notifications = value;
                break;
        }

        localStorage.setItem('paymentPreferences', JSON.stringify(this.userPreferences));
    }

    updateUserPreferences(method) {
        // Update payment history
        this.paymentHistory.recentMethods.unshift(method);
        this.paymentHistory.recentMethods = this.paymentHistory.recentMethods.slice(0, 5);
        
        // Update most used method
        const methodCounts = {};
        this.paymentHistory.recentMethods.forEach(m => {
            methodCounts[m] = (methodCounts[m] || 0) + 1;
        });
        
        this.paymentHistory.mostUsed = Object.keys(methodCounts).reduce((a, b) => 
            methodCounts[a] > methodCounts[b] ? a : b
        );

        localStorage.setItem('paymentHistory', JSON.stringify(this.paymentHistory));
    }

    // Storage methods
    async storeEncryptedMethod(methodId, encryptedDetails) {
        // In a real implementation, this would be stored securely on the server
        localStorage.setItem(`encrypted_method_${methodId}`, encryptedDetails);
    }

    async getEncryptedMethod(methodId) {
        return localStorage.getItem(`encrypted_method_${methodId}`);
    }

    async removeEncryptedMethod(methodId) {
        localStorage.removeItem(`encrypted_method_${methodId}`);
    }

    saveToStorage() {
        localStorage.setItem('savedPaymentMethods', JSON.stringify(this.savedMethods));
    }

    // UI methods
    showProcessingAnimation() {
        const overlay = document.createElement('div');
        overlay.className = 'payment-processing';
        overlay.id = 'payment-processing-overlay';
        overlay.innerHTML = `
            <div class="processing-content">
                <div class="processing-spinner"></div>
                <h4>Processing Payment...</h4>
                <p>Please wait while we process your payment</p>
            </div>
        `;
        document.body.appendChild(overlay);
    }

    hideProcessingAnimation() {
        const overlay = document.getElementById('payment-processing-overlay');
        if (overlay) {
            overlay.remove();
        }
    }

    showSuccess(message) {
        // Use existing toast system
        if (window.showToast) {
            window.showToast(message, 'success');
        }
    }

    showError(message) {
        // Use existing toast system
        if (window.showToast) {
            window.showToast(message, 'error');
        }
    }

    showPaymentDetails(method) {
        // Hide all payment details
        document.querySelectorAll('.payment-details').forEach(el => {
            el.style.display = 'none';
        });

        // Show relevant details
        const detailsElement = document.getElementById(`${method}-details`);
        if (detailsElement) {
            detailsElement.style.display = 'block';
        }
    }

    async processPaymentWithMethod(method, details) {
        // This would integrate with the PaymentGateway class
        const gateway = new PaymentGateway();
        const orderData = this.getOrderData();
        
        return await gateway.processPayment(method, orderData.total, details, orderData);
    }

    getOrderData() {
        // Get order data from checkout
        const checkoutData = JSON.parse(sessionStorage.getItem('checkoutData') || '{}');
        return {
            orderId: 'order_' + Date.now(),
            customerId: this.getCurrentUserId(),
            total: checkoutData.total || 0,
            items: checkoutData.items || []
        };
    }

    getCurrentUserId() {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        return user.id || 'anonymous';
    }
}

// Export for use in other modules
window.PaymentUX = PaymentUX;
