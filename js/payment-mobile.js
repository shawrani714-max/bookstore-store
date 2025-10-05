/**
 * Mobile Payment Optimization
 * Optimizes payment experience for mobile devices
 */

class PaymentMobile {
    constructor() {
        this.isMobile = this.detectMobile();
        this.touchSupport = this.detectTouchSupport();
        this.setupMobileOptimizations();
    }

    detectMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    detectTouchSupport() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }

    setupMobileOptimizations() {
        if (this.isMobile) {
            this.optimizeForMobile();
            this.setupTouchOptimizations();
            this.setupMobileUI();
            this.setupMobilePaymentMethods();
            this.setupMobileValidation();
            this.setupMobileSecurity();
        }
    }

    // Mobile UI optimizations
    optimizeForMobile() {
        // Add mobile-specific CSS
        this.addMobileStyles();
        
        // Optimize viewport
        this.optimizeViewport();
        
        // Setup mobile navigation
        this.setupMobileNavigation();
        
        // Optimize form layout
        this.optimizeFormLayout();
    }

    addMobileStyles() {
        const style = document.createElement('style');
        style.id = 'mobile-payment-styles';
        style.textContent = `
            /* Mobile Payment Styles */
            @media (max-width: 768px) {
                .payment-container {
                    padding: 16px;
                    margin: 0;
                }
                
                .payment-method {
                    padding: 16px;
                    margin-bottom: 12px;
                    border-radius: 12px;
                    min-height: 60px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                
                .payment-method input[type="radio"] {
                    width: 20px;
                    height: 20px;
                    margin: 0;
                }
                
                .payment-method label {
                    font-size: 16px;
                    font-weight: 500;
                    flex: 1;
                }
                
                .payment-form {
                    padding: 20px;
                    border-radius: 16px;
                    background: #f8f9fa;
                }
                
                .form-group {
                    margin-bottom: 20px;
                }
                
                .form-control {
                    height: 48px;
                    font-size: 16px;
                    border-radius: 8px;
                    border: 2px solid #e0e0e0;
                    padding: 12px 16px;
                }
                
                .form-control:focus {
                    border-color: #2563eb;
                    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
                }
                
                .btn {
                    height: 48px;
                    font-size: 16px;
                    font-weight: 600;
                    border-radius: 8px;
                    padding: 12px 24px;
                }
                
                .btn-primary {
                    background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
                    border: none;
                    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
                }
                
                .btn-primary:active {
                    transform: translateY(1px);
                    box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
                }
                
                .payment-summary {
                    position: sticky;
                    bottom: 0;
                    background: white;
                    border-top: 1px solid #e0e0e0;
                    padding: 16px;
                    box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.1);
                }
                
                .payment-summary .total {
                    font-size: 18px;
                    font-weight: 700;
                    color: #2563eb;
                }
                
                .mobile-payment-methods {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 12px;
                    margin-bottom: 20px;
                }
                
                .mobile-payment-method {
                    padding: 16px;
                    border: 2px solid #e0e0e0;
                    border-radius: 12px;
                    text-align: center;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                
                .mobile-payment-method.selected {
                    border-color: #2563eb;
                    background: #f8f9ff;
                }
                
                .mobile-payment-method i {
                    font-size: 24px;
                    color: #2563eb;
                    margin-bottom: 8px;
                }
                
                .mobile-payment-method span {
                    display: block;
                    font-size: 14px;
                    font-weight: 500;
                }
                
                .upi-methods {
                    display: grid;
                    grid-template-columns: 1fr 1fr 1fr;
                    gap: 8px;
                    margin-top: 16px;
                }
                
                .upi-method {
                    padding: 12px;
                    border: 1px solid #e0e0e0;
                    border-radius: 8px;
                    text-align: center;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                
                .upi-method.selected {
                    border-color: #2563eb;
                    background: #f8f9ff;
                }
                
                .upi-method img {
                    width: 32px;
                    height: 32px;
                    margin-bottom: 4px;
                }
                
                .upi-method span {
                    font-size: 12px;
                    color: #666;
                }
                
                .mobile-keyboard-optimized {
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    background: white;
                    padding: 16px;
                    border-top: 1px solid #e0e0e0;
                    z-index: 1000;
                }
                
                .mobile-keyboard-optimized .btn {
                    width: 100%;
                    margin-bottom: 8px;
                }
                
                .mobile-payment-success {
                    text-align: center;
                    padding: 40px 20px;
                }
                
                .mobile-payment-success i {
                    font-size: 64px;
                    color: #10b981;
                    margin-bottom: 20px;
                }
                
                .mobile-payment-success h2 {
                    font-size: 24px;
                    font-weight: 700;
                    color: #1f2937;
                    margin-bottom: 12px;
                }
                
                .mobile-payment-success p {
                    font-size: 16px;
                    color: #6b7280;
                    margin-bottom: 24px;
                }
            }
        `;
        document.head.appendChild(style);
    }

    optimizeViewport() {
        // Ensure proper viewport meta tag
        let viewport = document.querySelector('meta[name="viewport"]');
        if (!viewport) {
            viewport = document.createElement('meta');
            viewport.name = 'viewport';
            document.head.appendChild(viewport);
        }
        viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
    }

    setupMobileNavigation() {
        // Add mobile-specific navigation
        const mobileNav = document.createElement('div');
        mobileNav.className = 'mobile-payment-nav';
        mobileNav.innerHTML = `
            <div class="mobile-nav-content">
                <button class="mobile-nav-back" onclick="history.back()">
                    <i class="fas fa-arrow-left"></i>
                </button>
                <h1 class="mobile-nav-title">Payment</h1>
                <button class="mobile-nav-help" onclick="this.showHelp()">
                    <i class="fas fa-question-circle"></i>
                </button>
            </div>
        `;
        
        const container = document.querySelector('.payment-container');
        if (container) {
            container.insertBefore(mobileNav, container.firstChild);
        }
    }

    optimizeFormLayout() {
        // Optimize form for mobile input
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            // Add mobile-specific attributes
            form.setAttribute('autocomplete', 'on');
            form.setAttribute('novalidate', 'false');
            
            // Optimize input fields
            const inputs = form.querySelectorAll('input, select, textarea');
            inputs.forEach(input => {
                this.optimizeInputForMobile(input);
            });
        });
    }

    optimizeInputForMobile(input) {
        // Set appropriate input types for mobile keyboards
        switch (input.name) {
            case 'cardNumber':
                input.type = 'tel';
                input.inputMode = 'numeric';
                input.pattern = '[0-9]*';
                break;
            case 'cvv':
                input.type = 'tel';
                input.inputMode = 'numeric';
                input.pattern = '[0-9]*';
                break;
            case 'expiry':
                input.type = 'tel';
                input.inputMode = 'numeric';
                input.pattern = '[0-9]*';
                break;
            case 'phone':
                input.type = 'tel';
                input.inputMode = 'tel';
                break;
            case 'email':
                input.type = 'email';
                input.inputMode = 'email';
                break;
        }
        
        // Add mobile-specific attributes
        input.setAttribute('autocomplete', 'on');
        input.setAttribute('autocorrect', 'off');
        input.setAttribute('autocapitalize', 'off');
        input.setAttribute('spellcheck', 'false');
    }

    // Touch optimizations
    setupTouchOptimizations() {
        // Increase touch targets
        this.increaseTouchTargets();
        
        // Add touch feedback
        this.addTouchFeedback();
        
        // Optimize gestures
        this.optimizeGestures();
    }

    increaseTouchTargets() {
        // Ensure minimum touch target size of 44px
        const touchElements = document.querySelectorAll('button, input, select, a, .clickable');
        touchElements.forEach(element => {
            const rect = element.getBoundingClientRect();
            if (rect.width < 44 || rect.height < 44) {
                element.style.minWidth = '44px';
                element.style.minHeight = '44px';
                element.style.padding = '12px';
            }
        });
    }

    addTouchFeedback() {
        // Add touch feedback for interactive elements
        const interactiveElements = document.querySelectorAll('button, .payment-method, .clickable');
        interactiveElements.forEach(element => {
            element.addEventListener('touchstart', () => {
                element.style.transform = 'scale(0.98)';
                element.style.opacity = '0.8';
            });
            
            element.addEventListener('touchend', () => {
                element.style.transform = 'scale(1)';
                element.style.opacity = '1';
            });
        });
    }

    optimizeGestures() {
        // Prevent zoom on double tap
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (e) => {
            const now = (new Date()).getTime();
            if (now - lastTouchEnd <= 300) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        }, false);
        
        // Optimize swipe gestures
        this.setupSwipeGestures();
    }

    setupSwipeGestures() {
        let startX, startY, endX, endY;
        
        document.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        });
        
        document.addEventListener('touchend', (e) => {
            endX = e.changedTouches[0].clientX;
            endY = e.changedTouches[0].clientY;
            
            const diffX = startX - endX;
            const diffY = startY - endY;
            
            // Horizontal swipe
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
                if (diffX > 0) {
                    // Swipe left - next step
                    this.handleSwipeLeft();
                } else {
                    // Swipe right - previous step
                    this.handleSwipeRight();
                }
            }
        });
    }

    handleSwipeLeft() {
        // Move to next payment step
        const currentStep = document.querySelector('.payment-step.active');
        if (currentStep) {
            const nextStep = currentStep.nextElementSibling;
            if (nextStep && nextStep.classList.contains('payment-step')) {
                this.switchToStep(nextStep);
            }
        }
    }

    handleSwipeRight() {
        // Move to previous payment step
        const currentStep = document.querySelector('.payment-step.active');
        if (currentStep) {
            const prevStep = currentStep.previousElementSibling;
            if (prevStep && prevStep.classList.contains('payment-step')) {
                this.switchToStep(prevStep);
            }
        }
    }

    switchToStep(step) {
        // Hide current step
        document.querySelectorAll('.payment-step').forEach(s => s.classList.remove('active'));
        
        // Show new step
        step.classList.add('active');
        
        // Update progress indicator
        this.updateProgressIndicator();
    }

    updateProgressIndicator() {
        const steps = document.querySelectorAll('.payment-step');
        const activeStep = document.querySelector('.payment-step.active');
        const activeIndex = Array.from(steps).indexOf(activeStep);
        
        const progress = ((activeIndex + 1) / steps.length) * 100;
        const progressBar = document.querySelector('.progress-bar');
        if (progressBar) {
            progressBar.style.width = progress + '%';
        }
    }

    // Mobile UI setup
    setupMobileUI() {
        // Create mobile payment methods grid
        this.createMobilePaymentMethods();
        
        // Setup mobile keyboard optimization
        this.setupMobileKeyboardOptimization();
        
        // Create mobile payment success screen
        this.createMobilePaymentSuccess();
    }

    createMobilePaymentMethods() {
        const container = document.getElementById('payment-methods');
        if (!container) return;
        
        const mobileMethods = document.createElement('div');
        mobileMethods.className = 'mobile-payment-methods';
        mobileMethods.innerHTML = `
            <div class="mobile-payment-method" data-method="upi">
                <i class="fas fa-mobile-alt"></i>
                <span>UPI</span>
            </div>
            <div class="mobile-payment-method" data-method="card">
                <i class="fas fa-credit-card"></i>
                <span>Card</span>
            </div>
            <div class="mobile-payment-method" data-method="netbanking">
                <i class="fas fa-university"></i>
                <span>Net Banking</span>
            </div>
            <div class="mobile-payment-method" data-method="cod">
                <i class="fas fa-money-bill-wave"></i>
                <span>COD</span>
            </div>
        `;
        
        container.appendChild(mobileMethods);
        
        // Add click handlers
        mobileMethods.querySelectorAll('.mobile-payment-method').forEach(method => {
            method.addEventListener('click', () => {
                this.selectMobilePaymentMethod(method);
            });
        });
    }

    selectMobilePaymentMethod(methodElement) {
        // Remove previous selection
        document.querySelectorAll('.mobile-payment-method').forEach(m => {
            m.classList.remove('selected');
        });
        
        // Select current method
        methodElement.classList.add('selected');
        
        // Show method-specific form
        const method = methodElement.dataset.method;
        this.showMobilePaymentForm(method);
    }

    showMobilePaymentForm(method) {
        // Hide all forms
        document.querySelectorAll('.payment-form').forEach(form => {
            form.style.display = 'none';
        });
        
        // Show relevant form
        const form = document.getElementById(`${method}-form`);
        if (form) {
            form.style.display = 'block';
        }
        
        // Add UPI methods if UPI is selected
        if (method === 'upi') {
            this.showUPIMethods();
        }
    }

    showUPIMethods() {
        const upiContainer = document.createElement('div');
        upiContainer.className = 'upi-methods';
        upiContainer.innerHTML = `
            <div class="upi-method" data-provider="gpay">
                <img src="/images/gpay.png" alt="Google Pay">
                <span>Google Pay</span>
            </div>
            <div class="upi-method" data-provider="phonepe">
                <img src="/images/phonepe.png" alt="PhonePe">
                <span>PhonePe</span>
            </div>
            <div class="upi-method" data-provider="paytm">
                <img src="/images/paytm.png" alt="Paytm">
                <span>Paytm</span>
            </div>
        `;
        
        const upiForm = document.getElementById('upi-form');
        if (upiForm) {
            upiForm.appendChild(upiContainer);
        }
        
        // Add click handlers
        upiContainer.querySelectorAll('.upi-method').forEach(method => {
            method.addEventListener('click', () => {
                this.selectUPIMethod(method);
            });
        });
    }

    selectUPIMethod(methodElement) {
        // Remove previous selection
        document.querySelectorAll('.upi-method').forEach(m => {
            m.classList.remove('selected');
        });
        
        // Select current method
        methodElement.classList.add('selected');
        
        // Open UPI app
        const provider = methodElement.dataset.provider;
        this.openUPIApp(provider);
    }

    openUPIApp(provider) {
        const upiId = document.getElementById('upi-id').value;
        const amount = this.getOrderAmount();
        
        const upiUrls = {
            gpay: `gpay://upi/pay?pa=${upiId}&pn=Bookworld&am=${amount}&cu=INR`,
            phonepe: `phonepe://pay?pa=${upiId}&pn=Bookworld&am=${amount}&cu=INR`,
            paytm: `paytm://pay?pa=${upiId}&pn=Bookworld&am=${amount}&cu=INR`
        };
        
        const url = upiUrls[provider];
        if (url) {
            window.location.href = url;
        }
    }

    setupMobileKeyboardOptimization() {
        // Show keyboard-optimized buttons when keyboard is visible
        const keyboardOptimized = document.createElement('div');
        keyboardOptimized.className = 'mobile-keyboard-optimized';
        keyboardOptimized.style.display = 'none';
        keyboardOptimized.innerHTML = `
            <button class="btn btn-primary" onclick="this.submitPayment()">
                Complete Payment
            </button>
            <button class="btn btn-outline-secondary" onclick="this.hideKeyboard()">
                Hide Keyboard
            </button>
        `;
        
        document.body.appendChild(keyboardOptimized);
        
        // Show/hide based on keyboard visibility
        this.detectKeyboardVisibility(keyboardOptimized);
    }

    detectKeyboardVisibility(keyboardOptimized) {
        let initialHeight = window.innerHeight;
        
        window.addEventListener('resize', () => {
            const currentHeight = window.innerHeight;
            const heightDifference = initialHeight - currentHeight;
            
            if (heightDifference > 150) {
                // Keyboard is visible
                keyboardOptimized.style.display = 'block';
            } else {
                // Keyboard is hidden
                keyboardOptimized.style.display = 'none';
            }
        });
    }

    createMobilePaymentSuccess() {
        const successContainer = document.createElement('div');
        successContainer.className = 'mobile-payment-success';
        successContainer.style.display = 'none';
        successContainer.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <h2>Payment Successful!</h2>
            <p>Your order has been placed successfully.</p>
            <button class="btn btn-primary" onclick="this.viewOrder()">
                View Order
            </button>
        `;
        
        document.body.appendChild(successContainer);
    }

    // Mobile payment methods
    setupMobilePaymentMethods() {
        // Optimize for mobile payment methods
        this.optimizeUPIForMobile();
        this.optimizeCardForMobile();
        this.optimizeNetBankingForMobile();
        this.optimizeCODForMobile();
    }

    optimizeUPIForMobile() {
        // Add UPI-specific mobile optimizations
        const upiForm = document.getElementById('upi-form');
        if (upiForm) {
            // Add UPI ID suggestions
            this.addUPISuggestions(upiForm);
            
            // Add UPI QR code option
            this.addUPIQRCode(upiForm);
        }
    }

    addUPISuggestions(form) {
        const suggestions = document.createElement('div');
        suggestions.className = 'upi-suggestions';
        suggestions.innerHTML = `
            <h5>Popular UPI Apps</h5>
            <div class="upi-apps">
                <button class="upi-app" data-app="gpay">
                    <img src="/images/gpay.png" alt="Google Pay">
                    <span>Google Pay</span>
                </button>
                <button class="upi-app" data-app="phonepe">
                    <img src="/images/phonepe.png" alt="PhonePe">
                    <span>PhonePe</span>
                </button>
                <button class="upi-app" data-app="paytm">
                    <img src="/images/paytm.png" alt="Paytm">
                    <span>Paytm</span>
                </button>
            </div>
        `;
        
        form.appendChild(suggestions);
    }

    addUPIQRCode(form) {
        const qrSection = document.createElement('div');
        qrSection.className = 'upi-qr-section';
        qrSection.innerHTML = `
            <h5>Scan QR Code</h5>
            <div class="qr-code">
                <img src="/api/qr/upi" alt="UPI QR Code">
            </div>
            <p>Scan this QR code with any UPI app to pay</p>
        `;
        
        form.appendChild(qrSection);
    }

    optimizeCardForMobile() {
        // Add card-specific mobile optimizations
        const cardForm = document.getElementById('card-form');
        if (cardForm) {
            // Add card scanner
            this.addCardScanner(cardForm);
            
            // Add card type detection
            this.addCardTypeDetection(cardForm);
        }
    }

    addCardScanner(form) {
        const scannerButton = document.createElement('button');
        scannerButton.type = 'button';
        scannerButton.className = 'btn btn-outline-primary card-scanner-btn';
        scannerButton.innerHTML = '<i class="fas fa-camera"></i> Scan Card';
        scannerButton.onclick = () => this.scanCard();
        
        const cardNumberField = form.querySelector('input[name="cardNumber"]');
        if (cardNumberField) {
            cardNumberField.parentNode.appendChild(scannerButton);
        }
    }

    scanCard() {
        // In a real implementation, this would use a card scanning library
        alert('Card scanning feature would be implemented here');
    }

    addCardTypeDetection(form) {
        const cardNumberField = form.querySelector('input[name="cardNumber"]');
        if (cardNumberField) {
            cardNumberField.addEventListener('input', (e) => {
                const cardType = this.detectCardType(e.target.value);
                this.showCardType(cardType);
            });
        }
    }

    detectCardType(number) {
        if (number.startsWith('4')) return 'visa';
        if (number.startsWith('5')) return 'mastercard';
        if (number.startsWith('3')) return 'amex';
        return 'unknown';
    }

    showCardType(type) {
        let typeIndicator = document.getElementById('card-type-indicator');
        if (!typeIndicator) {
            typeIndicator = document.createElement('div');
            typeIndicator.id = 'card-type-indicator';
            typeIndicator.className = 'card-type-indicator';
            document.querySelector('#card-form .form-group').appendChild(typeIndicator);
        }
        
        const typeNames = {
            visa: 'Visa',
            mastercard: 'Mastercard',
            amex: 'American Express'
        };
        
        typeIndicator.textContent = typeNames[type] || '';
    }

    optimizeNetBankingForMobile() {
        // Add net banking mobile optimizations
        const netBankingForm = document.getElementById('netbanking-form');
        if (netBankingForm) {
            // Add bank search
            this.addBankSearch(netBankingForm);
            
            // Add popular banks
            this.addPopularBanks(netBankingForm);
        }
    }

    addBankSearch(form) {
        const searchField = document.createElement('input');
        searchField.type = 'text';
        searchField.className = 'form-control bank-search';
        searchField.placeholder = 'Search for your bank...';
        searchField.addEventListener('input', (e) => {
            this.filterBanks(e.target.value);
        });
        
        form.insertBefore(searchField, form.firstChild);
    }

    addPopularBanks(form) {
        const popularBanks = document.createElement('div');
        popularBanks.className = 'popular-banks';
        popularBanks.innerHTML = `
            <h5>Popular Banks</h5>
            <div class="bank-grid">
                <button class="bank-option" data-bank="HDFC">
                    <img src="/images/hdfc.png" alt="HDFC Bank">
                    <span>HDFC Bank</span>
                </button>
                <button class="bank-option" data-bank="ICICI">
                    <img src="/images/icici.png" alt="ICICI Bank">
                    <span>ICICI Bank</span>
                </button>
                <button class="bank-option" data-bank="SBI">
                    <img src="/images/sbi.png" alt="State Bank of India">
                    <span>State Bank of India</span>
                </button>
                <button class="bank-option" data-bank="AXIS">
                    <img src="/images/axis.png" alt="Axis Bank">
                    <span>Axis Bank</span>
                </button>
            </div>
        `;
        
        form.appendChild(popularBanks);
    }

    filterBanks(query) {
        const banks = document.querySelectorAll('.bank-option');
        banks.forEach(bank => {
            const bankName = bank.textContent.toLowerCase();
            if (bankName.includes(query.toLowerCase())) {
                bank.style.display = 'block';
            } else {
                bank.style.display = 'none';
            }
        });
    }

    optimizeCODForMobile() {
        // Add COD-specific mobile optimizations
        const codForm = document.getElementById('cod-form');
        if (codForm) {
            // Add delivery time selection
            this.addDeliveryTimeSelection(codForm);
            
            // Add delivery instructions
            this.addDeliveryInstructions(codForm);
        }
    }

    addDeliveryTimeSelection(form) {
        const timeSelection = document.createElement('div');
        timeSelection.className = 'delivery-time-selection';
        timeSelection.innerHTML = `
            <h5>Preferred Delivery Time</h5>
            <div class="time-slots">
                <button class="time-slot" data-time="morning">Morning (9 AM - 12 PM)</button>
                <button class="time-slot" data-time="afternoon">Afternoon (12 PM - 5 PM)</button>
                <button class="time-slot" data-time="evening">Evening (5 PM - 8 PM)</button>
            </div>
        `;
        
        form.appendChild(timeSelection);
    }

    addDeliveryInstructions(form) {
        const instructionsField = document.createElement('textarea');
        instructionsField.className = 'form-control';
        instructionsField.placeholder = 'Any special delivery instructions?';
        instructionsField.rows = 3;
        
        const instructionsGroup = document.createElement('div');
        instructionsGroup.className = 'form-group';
        instructionsGroup.innerHTML = '<label>Delivery Instructions</label>';
        instructionsGroup.appendChild(instructionsField);
        
        form.appendChild(instructionsGroup);
    }

    // Mobile validation
    setupMobileValidation() {
        // Add mobile-specific validation
        this.addMobileFormValidation();
        this.addMobileErrorHandling();
    }

    addMobileFormValidation() {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                if (!this.validateMobileForm(form)) {
                    e.preventDefault();
                    this.showMobileValidationErrors(form);
                }
            });
        });
    }

    validateMobileForm(form) {
        let isValid = true;
        const fields = form.querySelectorAll('input[required], select[required]');
        
        fields.forEach(field => {
            if (!field.value.trim()) {
                field.classList.add('is-invalid');
                isValid = false;
            } else {
                field.classList.remove('is-invalid');
            }
        });
        
        return isValid;
    }

    showMobileValidationErrors(form) {
        const errors = form.querySelectorAll('.is-invalid');
        if (errors.length > 0) {
            errors[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
            errors[0].focus();
        }
    }

    addMobileErrorHandling() {
        // Add mobile-specific error handling
        this.setupMobileErrorMessages();
        this.setupMobileRetryLogic();
    }

    setupMobileErrorMessages() {
        // Create mobile error message container
        const errorContainer = document.createElement('div');
        errorContainer.className = 'mobile-error-container';
        errorContainer.style.display = 'none';
        document.body.appendChild(errorContainer);
    }

    setupMobileRetryLogic() {
        // Add retry logic for mobile-specific errors
        this.setupNetworkRetry();
        this.setupPaymentRetry();
    }

    setupNetworkRetry() {
        // Retry on network errors
        window.addEventListener('online', () => {
            this.showNetworkRestored();
        });
        
        window.addEventListener('offline', () => {
            this.showNetworkLost();
        });
    }

    showNetworkRestored() {
        const message = document.createElement('div');
        message.className = 'mobile-network-message success';
        message.innerHTML = '<i class="fas fa-wifi"></i> Network connection restored';
        document.body.appendChild(message);
        
        setTimeout(() => message.remove(), 3000);
    }

    showNetworkLost() {
        const message = document.createElement('div');
        message.className = 'mobile-network-message error';
        message.innerHTML = '<i class="fas fa-wifi"></i> Network connection lost';
        document.body.appendChild(message);
    }

    setupPaymentRetry() {
        // Add payment retry logic
        this.setupPaymentRetryButton();
    }

    setupPaymentRetryButton() {
        const retryButton = document.createElement('button');
        retryButton.className = 'btn btn-primary mobile-retry-btn';
        retryButton.innerHTML = '<i class="fas fa-redo"></i> Retry Payment';
        retryButton.style.display = 'none';
        retryButton.onclick = () => this.retryPayment();
        
        document.body.appendChild(retryButton);
    }

    retryPayment() {
        // Retry payment logic
        const form = document.getElementById('payment-form');
        if (form) {
            form.submit();
        }
    }

    // Mobile security
    setupMobileSecurity() {
        // Add mobile-specific security measures
        this.addMobileSecurityHeaders();
        this.addMobileFraudDetection();
        this.addMobileBiometricAuth();
    }

    addMobileSecurityHeaders() {
        // Add security headers for mobile
        const meta = document.createElement('meta');
        meta.httpEquiv = 'Content-Security-Policy';
        meta.content = "default-src 'self'; script-src 'self' 'unsafe-inline' https://checkout.razorpay.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.razorpay.com;";
        document.head.appendChild(meta);
    }

    addMobileFraudDetection() {
        // Add mobile-specific fraud detection
        this.detectMobileFraud();
    }

    detectMobileFraud() {
        // Check for suspicious mobile behavior
        const suspiciousPatterns = [
            this.detectJailbrokenDevice(),
            this.detectEmulator(),
            this.detectSuspiciousApps()
        ];
        
        if (suspiciousPatterns.some(pattern => pattern)) {
            this.flagSuspiciousActivity();
        }
    }

    detectJailbrokenDevice() {
        // Check for jailbreak indicators
        return false; // Mock implementation
    }

    detectEmulator() {
        // Check for emulator indicators
        return false; // Mock implementation
    }

    detectSuspiciousApps() {
        // Check for suspicious apps
        return false; // Mock implementation
    }

    flagSuspiciousActivity() {
        // Flag suspicious activity
        console.warn('Suspicious mobile activity detected');
    }

    addMobileBiometricAuth() {
        // Add biometric authentication for mobile
        if (this.supportsBiometricAuth()) {
            this.setupBiometricAuth();
        }
    }

    supportsBiometricAuth() {
        return 'credentials' in navigator && 'create' in navigator.credentials;
    }

    setupBiometricAuth() {
        // Setup biometric authentication
        const biometricButton = document.createElement('button');
        biometricButton.className = 'btn btn-outline-primary biometric-auth-btn';
        biometricButton.innerHTML = '<i class="fas fa-fingerprint"></i> Use Biometric';
        biometricButton.onclick = () => this.authenticateBiometric();
        
        const authContainer = document.getElementById('auth-container');
        if (authContainer) {
            authContainer.appendChild(biometricButton);
        }
    }

    authenticateBiometric() {
        // Authenticate using biometric
        if (navigator.credentials) {
            navigator.credentials.create({
                publicKey: {
                    challenge: new Uint8Array(32),
                    rp: { name: 'Bookworld' },
                    user: {
                        id: new Uint8Array(16),
                        name: 'user@bookworld.com',
                        displayName: 'User'
                    },
                    pubKeyCredParams: [{ alg: -7, type: 'public-key' }],
                    authenticatorSelection: {
                        authenticatorAttachment: 'platform'
                    }
                }
            }).then(credential => {
                console.log('Biometric authentication successful');
            }).catch(error => {
                console.error('Biometric authentication failed:', error);
            });
        }
    }

    // Utility methods
    getOrderAmount() {
        const totalElement = document.getElementById('summary-total');
        if (!totalElement) return 0;
        
        const amountText = totalElement.textContent.replace('₹', '').replace(',', '');
        return parseFloat(amountText) || 0;
    }

    showHelp() {
        // Show mobile help
        const helpModal = document.createElement('div');
        helpModal.className = 'mobile-help-modal';
        helpModal.innerHTML = `
            <div class="help-content">
                <h3>Payment Help</h3>
                <p>Need help with payment? Here are some common solutions:</p>
                <ul>
                    <li>Ensure you have a stable internet connection</li>
                    <li>Check your payment method details</li>
                    <li>Try a different payment method</li>
                    <li>Contact support if issues persist</li>
                </ul>
                <button class="btn btn-primary" onclick="this.close()">Close</button>
            </div>
        `;
        
        document.body.appendChild(helpModal);
    }
}

// Export for use in other modules
window.PaymentMobile = PaymentMobile;
