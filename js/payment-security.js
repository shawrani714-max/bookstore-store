/**
 * Enhanced Payment Security and Validation
 * Provides comprehensive security measures for payment processing
 */

class PaymentSecurity {
    constructor() {
        this.setupSecurityMeasures();
        this.validators = this.initializeValidators();
    }

    setupSecurityMeasures() {
        // Tokenization
        this.enableTokenization();
        
        // Fraud detection
        this.setupFraudDetection();
        
        // Rate limiting
        this.setupRateLimiting();
        
        // Encryption
        this.setupEncryption();
    }

    initializeValidators() {
        return {
            card: {
                number: /^[0-9]{13,19}$/,
                expiry: /^(0[1-9]|1[0-2])\/([0-9]{2})$/,
                cvv: /^[0-9]{3,4}$/,
                name: /^[a-zA-Z\s]{2,50}$/
            },
            upi: {
                id: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+$/
            },
            netbanking: {
                bankCode: /^[A-Z]{4}$/
            }
        };
    }

    // Enhanced payment validation with real-time feedback
    validatePaymentDetails(method, details) {
        const validator = this.validators[method];
        if (!validator) {
            throw new Error(`Unsupported payment method: ${method}`);
        }

        const errors = [];
        const warnings = [];

        switch (method) {
            case 'card':
                return this.validateCardDetails(details, errors, warnings);
            case 'upi':
                return this.validateUPIDetails(details, errors, warnings);
            case 'netbanking':
                return this.validateNetBankingDetails(details, errors, warnings);
            case 'cod':
                return { isValid: true, errors: [], warnings: [] };
            default:
                throw new Error(`Unknown payment method: ${method}`);
        }
    }

    validateCardDetails(details, errors, warnings) {
        const { number, expiry, cvv, name } = details;

        // Card number validation
        if (!this.validators.card.number.test(number)) {
            errors.push('Invalid card number format');
        } else if (!this.luhnCheck(number)) {
            errors.push('Invalid card number');
        }

        // Expiry validation
        if (!this.validators.card.expiry.test(expiry)) {
            errors.push('Invalid expiry date format (MM/YY)');
        } else if (this.isCardExpired(expiry)) {
            errors.push('Card has expired');
        }

        // CVV validation
        if (!this.validators.card.cvv.test(cvv)) {
            errors.push('Invalid CVV');
        }

        // Name validation
        if (!this.validators.card.name.test(name)) {
            errors.push('Invalid cardholder name');
        }

        // Additional security checks
        if (this.isKnownFraudulentCard(number)) {
            errors.push('Card not accepted');
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            cardType: this.detectCardType(number)
        };
    }

    validateUPIDetails(details, errors, warnings) {
        const { upiId } = details;

        if (!this.validators.upi.id.test(upiId)) {
            errors.push('Invalid UPI ID format');
        }

        // Check for common UPI providers
        const upiProviders = ['@paytm', '@gpay', '@phonepe', '@bhim', '@ybl', '@okaxis'];
        const hasValidProvider = upiProviders.some(provider => upiId.toLowerCase().includes(provider));
        
        if (!hasValidProvider) {
            warnings.push('Unrecognized UPI provider');
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }

    validateNetBankingDetails(details, errors, warnings) {
        const { bankCode } = details;

        if (!this.validators.netbanking.bankCode.test(bankCode)) {
            errors.push('Invalid bank code');
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }

    // Luhn algorithm for card number validation
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

    // Detect card type
    detectCardType(cardNumber) {
        const patterns = {
            visa: /^4[0-9]{12}(?:[0-9]{3})?$/,
            mastercard: /^5[1-5][0-9]{14}$/,
            amex: /^3[47][0-9]{13}$/,
            discover: /^6(?:011|5[0-9]{2})[0-9]{12}$/,
            diners: /^3[0689][0-9]{12}$/
        };

        for (const [type, pattern] of Object.entries(patterns)) {
            if (pattern.test(cardNumber)) {
                return type;
            }
        }

        return 'unknown';
    }

    // Check if card is expired
    isCardExpired(expiry) {
        const [month, year] = expiry.split('/');
        const expiryDate = new Date(2000 + parseInt(year), parseInt(month) - 1);
        const currentDate = new Date();
        
        return expiryDate < currentDate;
    }

    // Fraud detection
    detectFraud(paymentData, userBehavior) {
        const riskFactors = [];

        // Check for suspicious patterns
        if (this.isHighValueTransaction(paymentData.amount)) {
            riskFactors.push('high_value');
        }

        if (this.isRapidTransaction(userBehavior)) {
            riskFactors.push('rapid_transaction');
        }

        if (this.isUnusualLocation(userBehavior)) {
            riskFactors.push('unusual_location');
        }

        const riskScore = this.calculateRiskScore(riskFactors);
        
        return {
            isFraudulent: riskScore > 0.8,
            riskScore,
            riskFactors
        };
    }

    calculateRiskScore(riskFactors) {
        const weights = {
            high_value: 0.3,
            rapid_transaction: 0.4,
            unusual_location: 0.3
        };

        return riskFactors.reduce((score, factor) => {
            return score + (weights[factor] || 0);
        }, 0);
    }

    isHighValueTransaction(amount) {
        return amount > 50000; // ₹50,000 threshold
    }

    isRapidTransaction(userBehavior) {
        const recentTransactions = userBehavior.recentTransactions || [];
        const now = new Date();
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
        
        const recentCount = recentTransactions.filter(t => 
            new Date(t.timestamp) > oneHourAgo
        ).length;

        return recentCount > 5;
    }

    isUnusualLocation(userBehavior) {
        // This would typically check against user's usual locations
        // For now, return false as we don't have location data
        return false;
    }

    isKnownFraudulentCard(cardNumber) {
        // In a real implementation, this would check against a fraud database
        // For now, return false
        return false;
    }

    // Tokenization
    async tokenizeCardData(cardData) {
        try {
            // In a real implementation, this would use a payment gateway's tokenization API
            // For now, we'll create a mock token
            const token = await this.createMockToken(cardData);
            return token;
        } catch (error) {
            throw new Error('Tokenization failed: ' + error.message);
        }
    }

    async createMockToken(cardData) {
        // Mock tokenization - in real implementation, use payment gateway
        const tokenData = {
            last4: cardData.number.slice(-4),
            expiry: cardData.expiry,
            cardType: this.detectCardType(cardData.number),
            token: 'tok_' + Math.random().toString(36).substr(2, 9)
        };

        return new Promise(resolve => {
            setTimeout(() => resolve(tokenData), 1000);
        });
    }

    // Rate limiting
    setupRateLimiting() {
        this.rateLimits = {
            paymentAttempts: new Map(),
            maxAttempts: 5,
            timeWindow: 15 * 60 * 1000 // 15 minutes
        };
    }

    checkRateLimit(userId) {
        const now = Date.now();
        const userAttempts = this.rateLimits.paymentAttempts.get(userId) || [];
        
        // Remove old attempts
        const recentAttempts = userAttempts.filter(
            timestamp => now - timestamp < this.rateLimits.timeWindow
        );

        if (recentAttempts.length >= this.rateLimits.maxAttempts) {
            return {
                allowed: false,
                retryAfter: this.rateLimits.timeWindow - (now - recentAttempts[0])
            };
        }

        // Add current attempt
        recentAttempts.push(now);
        this.rateLimits.paymentAttempts.set(userId, recentAttempts);

        return { allowed: true };
    }

    // Encryption
    setupEncryption() {
        // In a real implementation, use proper encryption libraries
        this.encryptionKey = 'mock-encryption-key';
    }

    encryptSensitiveData(data) {
        // Mock encryption - in real implementation, use proper encryption
        return btoa(JSON.stringify(data));
    }

    decryptSensitiveData(encryptedData) {
        // Mock decryption - in real implementation, use proper decryption
        return JSON.parse(atob(encryptedData));
    }

    // Security headers and CSP
    setupSecurityHeaders() {
        // Add security headers for payment pages
        const meta = document.createElement('meta');
        meta.httpEquiv = 'Content-Security-Policy';
        meta.content = "default-src 'self'; script-src 'self' 'unsafe-inline' https://checkout.razorpay.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.razorpay.com;";
        document.head.appendChild(meta);
    }

    // PCI DSS compliance helpers
    isPCICompliant() {
        // Check if the implementation meets PCI DSS requirements
        const checks = {
            noCardDataStorage: !this.storesCardData(),
            secureTransmission: this.usesSecureTransmission(),
            accessControl: this.hasAccessControl(),
            networkSecurity: this.hasNetworkSecurity(),
            regularTesting: this.hasRegularTesting()
        };

        return Object.values(checks).every(check => check);
    }

    storesCardData() {
        // Check if card data is being stored inappropriately
        return false; // Should be false for PCI compliance
    }

    usesSecureTransmission() {
        // Check if using HTTPS
        return location.protocol === 'https:';
    }

    hasAccessControl() {
        // Check if proper access controls are in place
        return true; // Mock implementation
    }

    hasNetworkSecurity() {
        // Check if network security measures are in place
        return true; // Mock implementation
    }

    hasRegularTesting() {
        // Check if regular security testing is performed
        return true; // Mock implementation
    }
}

// Export for use in other modules
window.PaymentSecurity = PaymentSecurity;
