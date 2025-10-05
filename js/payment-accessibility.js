/**
 * Payment Accessibility Improvements
 * Ensures payment system is accessible to users with disabilities
 */

class PaymentAccessibility {
    constructor() {
        this.setupAccessibilityFeatures();
        this.setupKeyboardNavigation();
        this.setupScreenReaderSupport();
        this.setupHighContrastMode();
        this.setupVoiceControl();
        this.setupMotorImpairmentSupport();
    }

    setupAccessibilityFeatures() {
        this.addAccessibilityStyles();
        this.setupARIALabels();
        this.setupFocusManagement();
        this.setupErrorAnnouncements();
        this.setupProgressAnnouncements();
    }

    addAccessibilityStyles() {
        const style = document.createElement('style');
        style.id = 'payment-accessibility-styles';
        style.textContent = `
            /* Accessibility Styles */
            .sr-only {
                position: absolute;
                width: 1px;
                height: 1px;
                padding: 0;
                margin: -1px;
                overflow: hidden;
                clip: rect(0, 0, 0, 0);
                white-space: nowrap;
                border: 0;
            }
            
            .focus-visible {
                outline: 2px solid #2563eb;
                outline-offset: 2px;
            }
            
            .high-contrast {
                filter: contrast(150%) brightness(120%);
            }
            
            .payment-form fieldset {
                border: 2px solid #e0e0e0;
                border-radius: 8px;
                padding: 16px;
                margin-bottom: 20px;
            }
            
            .payment-form legend {
                font-weight: 600;
                padding: 0 8px;
                color: #1f2937;
            }
            
            .form-group {
                margin-bottom: 20px;
            }
            
            .form-label {
                display: block;
                margin-bottom: 8px;
                font-weight: 500;
                color: #374151;
            }
            
            .form-control {
                width: 100%;
                padding: 12px 16px;
                border: 2px solid #d1d5db;
                border-radius: 8px;
                font-size: 16px;
                line-height: 1.5;
            }
            
            .form-control:focus {
                border-color: #2563eb;
                box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
                outline: none;
            }
            
            .form-control.is-invalid {
                border-color: #dc2626;
            }
            
            .form-control.is-valid {
                border-color: #059669;
            }
            
            .validation-error {
                color: #dc2626;
                font-size: 14px;
                margin-top: 4px;
            }
            
            .validation-success {
                color: #059669;
                font-size: 14px;
                margin-top: 4px;
            }
            
            .payment-method {
                border: 2px solid #e0e0e0;
                border-radius: 8px;
                padding: 16px;
                margin-bottom: 12px;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .payment-method:hover {
                border-color: #2563eb;
                background-color: #f8f9ff;
            }
            
            .payment-method:focus {
                border-color: #2563eb;
                box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
                outline: none;
            }
            
            .payment-method.selected {
                border-color: #2563eb;
                background-color: #f8f9ff;
            }
            
            .payment-method input[type="radio"] {
                margin-right: 12px;
                transform: scale(1.2);
            }
            
            .btn {
                padding: 12px 24px;
                border: 2px solid transparent;
                border-radius: 8px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                min-height: 44px;
                min-width: 44px;
            }
            
            .btn:focus {
                outline: 2px solid #2563eb;
                outline-offset: 2px;
            }
            
            .btn-primary {
                background-color: #2563eb;
                color: white;
            }
            
            .btn-primary:hover {
                background-color: #1d4ed8;
            }
            
            .btn-secondary {
                background-color: #6b7280;
                color: white;
            }
            
            .btn-secondary:hover {
                background-color: #4b5563;
            }
            
            .skip-link {
                position: absolute;
                top: -40px;
                left: 6px;
                background: #2563eb;
                color: white;
                padding: 8px;
                text-decoration: none;
                border-radius: 4px;
                z-index: 10000;
            }
            
            .skip-link:focus {
                top: 6px;
            }
            
            .payment-progress {
                margin-bottom: 24px;
            }
            
            .progress-bar {
                width: 100%;
                height: 8px;
                background-color: #e5e7eb;
                border-radius: 4px;
                overflow: hidden;
            }
            
            .progress-fill {
                height: 100%;
                background-color: #2563eb;
                transition: width 0.3s ease;
            }
            
            .progress-text {
                text-align: center;
                margin-top: 8px;
                font-size: 14px;
                color: #6b7280;
            }
            
            .payment-summary {
                background-color: #f9fafb;
                border: 2px solid #e5e7eb;
                border-radius: 8px;
                padding: 20px;
                margin-bottom: 24px;
            }
            
            .summary-item {
                display: flex;
                justify-content: space-between;
                margin-bottom: 8px;
            }
            
            .summary-total {
                font-weight: 700;
                font-size: 18px;
                color: #1f2937;
                border-top: 2px solid #e5e7eb;
                padding-top: 8px;
                margin-top: 8px;
            }
            
            .error-message {
                background-color: #fef2f2;
                border: 2px solid #fecaca;
                color: #dc2626;
                padding: 16px;
                border-radius: 8px;
                margin-bottom: 20px;
            }
            
            .success-message {
                background-color: #f0fdf4;
                border: 2px solid #bbf7d0;
                color: #059669;
                padding: 16px;
                border-radius: 8px;
                margin-bottom: 20px;
            }
            
            .loading-spinner {
                display: inline-block;
                width: 20px;
                height: 20px;
                border: 2px solid #f3f3f3;
                border-top: 2px solid #2563eb;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            /* High contrast mode */
            @media (prefers-contrast: high) {
                .payment-form {
                    border: 3px solid #000;
                }
                
                .form-control {
                    border: 3px solid #000;
                }
                
                .btn {
                    border: 3px solid #000;
                }
            }
            
            /* Reduced motion */
            @media (prefers-reduced-motion: reduce) {
                * {
                    animation-duration: 0.01ms !important;
                    animation-iteration-count: 1 !important;
                    transition-duration: 0.01ms !important;
                }
            }
            
            /* Large text support */
            @media (min-resolution: 192dpi) {
                .form-control {
                    font-size: 18px;
                }
                
                .btn {
                    font-size: 18px;
                }
            }
        `;
        document.head.appendChild(style);
    }

    setupARIALabels() {
        this.addARIALabels();
        this.setupARIAStates();
        this.setupARIAProperties();
        this.setupARIALiveRegions();
    }

    addARIALabels() {
        // Add ARIA labels to form elements
        const form = document.getElementById('payment-form');
        if (form) {
            form.setAttribute('aria-label', 'Payment form');
            form.setAttribute('role', 'form');
        }

        // Add ARIA labels to payment methods
        const paymentMethods = document.querySelectorAll('.payment-method');
        paymentMethods.forEach((method, index) => {
            method.setAttribute('role', 'radio');
            method.setAttribute('aria-checked', 'false');
            method.setAttribute('aria-labelledby', `payment-method-${index}-label`);
            
            const label = method.querySelector('label');
            if (label) {
                label.id = `payment-method-${index}-label`;
            }
        });

        // Add ARIA labels to form fields
        const formFields = document.querySelectorAll('input, select, textarea');
        formFields.forEach(field => {
            if (!field.getAttribute('aria-label') && !field.getAttribute('aria-labelledby')) {
                const label = document.querySelector(`label[for="${field.id}"]`);
                if (label) {
                    field.setAttribute('aria-labelledby', label.id);
                } else {
                    field.setAttribute('aria-label', field.placeholder || field.name);
                }
            }
        });
    }

    setupARIAStates() {
        // Setup ARIA states for interactive elements
        this.setupARIAExpanded();
        this.setupARIASelected();
        this.setupARIAInvalid();
        this.setupARIADisabled();
    }

    setupARIAExpanded() {
        const collapsibleElements = document.querySelectorAll('[data-toggle="collapse"]');
        collapsibleElements.forEach(element => {
            element.setAttribute('aria-expanded', 'false');
            element.addEventListener('click', () => {
                const isExpanded = element.getAttribute('aria-expanded') === 'true';
                element.setAttribute('aria-expanded', !isExpanded);
            });
        });
    }

    setupARIASelected() {
        const selectableElements = document.querySelectorAll('.payment-method');
        selectableElements.forEach(element => {
            element.addEventListener('click', () => {
                // Remove selected state from siblings
                selectableElements.forEach(sibling => {
                    sibling.setAttribute('aria-selected', 'false');
                    sibling.classList.remove('selected');
                });
                
                // Set selected state for current element
                element.setAttribute('aria-selected', 'true');
                element.classList.add('selected');
            });
        });
    }

    setupARIAInvalid() {
        const formFields = document.querySelectorAll('input, select, textarea');
        formFields.forEach(field => {
            field.addEventListener('blur', () => {
                const isValid = this.validateField(field);
                field.setAttribute('aria-invalid', !isValid);
            });
        });
    }

    setupARIADisabled() {
        const disabledElements = document.querySelectorAll('[disabled]');
        disabledElements.forEach(element => {
            element.setAttribute('aria-disabled', 'true');
        });
    }

    setupARIAProperties() {
        // Setup ARIA properties
        this.setupARIADescribedBy();
        this.setupARIARequired();
        this.setupARIAHidden();
    }

    setupARIADescribedBy() {
        const formFields = document.querySelectorAll('input, select, textarea');
        formFields.forEach(field => {
            const helpText = field.parentNode.querySelector('.help-text');
            if (helpText) {
                const helpId = `help-${field.id}`;
                helpText.id = helpId;
                field.setAttribute('aria-describedby', helpId);
            }
        });
    }

    setupARIARequired() {
        const requiredFields = document.querySelectorAll('[required]');
        requiredFields.forEach(field => {
            field.setAttribute('aria-required', 'true');
        });
    }

    setupARIAHidden() {
        const hiddenElements = document.querySelectorAll('[style*="display: none"], .hidden');
        hiddenElements.forEach(element => {
            element.setAttribute('aria-hidden', 'true');
        });
    }

    setupARIALiveRegions() {
        // Create live regions for dynamic content
        this.createLiveRegion('status', 'polite');
        this.createLiveRegion('errors', 'assertive');
        this.createLiveRegion('progress', 'polite');
    }

    createLiveRegion(id, politeness) {
        const region = document.createElement('div');
        region.id = `live-region-${id}`;
        region.setAttribute('aria-live', politeness);
        region.setAttribute('aria-atomic', 'true');
        region.className = 'sr-only';
        document.body.appendChild(region);
    }

    announceToScreenReader(message, region = 'status') {
        const liveRegion = document.getElementById(`live-region-${region}`);
        if (liveRegion) {
            liveRegion.textContent = message;
            // Clear after announcement
            setTimeout(() => {
                liveRegion.textContent = '';
            }, 1000);
        }
    }

    // Keyboard navigation
    setupKeyboardNavigation() {
        this.setupTabNavigation();
        this.setupArrowKeyNavigation();
        this.setupEscapeKeyHandling();
        this.setupEnterKeyHandling();
        this.setupSpaceKeyHandling();
    }

    setupTabNavigation() {
        // Ensure proper tab order
        const focusableElements = document.querySelectorAll(
            'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        focusableElements.forEach((element, index) => {
            element.setAttribute('tabindex', index + 1);
        });

        // Handle tab navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                this.handleTabNavigation(e);
            }
        });
    }

    handleTabNavigation(e) {
        const focusableElements = document.querySelectorAll(
            'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        if (e.shiftKey) {
            // Shift + Tab (backward)
            if (document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            }
        } else {
            // Tab (forward)
            if (document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        }
    }

    setupArrowKeyNavigation() {
        // Arrow key navigation for payment methods
        const paymentMethods = document.querySelectorAll('.payment-method');
        paymentMethods.forEach((method, index) => {
            method.addEventListener('keydown', (e) => {
                switch (e.key) {
                    case 'ArrowDown':
                    case 'ArrowRight':
                        e.preventDefault();
                        const nextIndex = (index + 1) % paymentMethods.length;
                        paymentMethods[nextIndex].focus();
                        break;
                    case 'ArrowUp':
                    case 'ArrowLeft':
                        e.preventDefault();
                        const prevIndex = index === 0 ? paymentMethods.length - 1 : index - 1;
                        paymentMethods[prevIndex].focus();
                        break;
                }
            });
        });
    }

    setupEscapeKeyHandling() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.handleEscapeKey(e);
            }
        });
    }

    handleEscapeKey(e) {
        // Close modals, dropdowns, etc.
        const modals = document.querySelectorAll('.modal.show');
        modals.forEach(modal => {
            modal.classList.remove('show');
            modal.setAttribute('aria-hidden', 'true');
        });

        // Return focus to trigger element
        const triggerElement = document.querySelector('[aria-expanded="true"]');
        if (triggerElement) {
            triggerElement.focus();
        }
    }

    setupEnterKeyHandling() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.handleEnterKey(e);
            }
        });
    }

    handleEnterKey(e) {
        const target = e.target;
        
        // Handle Enter key on payment methods
        if (target.classList.contains('payment-method')) {
            target.click();
        }
        
        // Handle Enter key on buttons
        if (target.tagName === 'BUTTON') {
            target.click();
        }
        
        // Handle Enter key on form submission
        if (target.tagName === 'INPUT' && target.type === 'submit') {
            const form = target.closest('form');
            if (form) {
                form.submit();
            }
        }
    }

    setupSpaceKeyHandling() {
        document.addEventListener('keydown', (e) => {
            if (e.key === ' ') {
                this.handleSpaceKey(e);
            }
        });
    }

    handleSpaceKey(e) {
        const target = e.target;
        
        // Prevent default space behavior on buttons
        if (target.tagName === 'BUTTON') {
            e.preventDefault();
            target.click();
        }
        
        // Handle space key on payment methods
        if (target.classList.contains('payment-method')) {
            e.preventDefault();
            target.click();
        }
    }

    // Screen reader support
    setupScreenReaderSupport() {
        this.setupScreenReaderAnnouncements();
        this.setupScreenReaderNavigation();
        this.setupScreenReaderForms();
        this.setupScreenReaderTables();
    }

    setupScreenReaderAnnouncements() {
        // Announce form validation
        this.setupValidationAnnouncements();
        
        // Announce payment progress
        this.setupProgressAnnouncements();
        
        // Announce payment status
        this.setupStatusAnnouncements();
    }

    setupValidationAnnouncements() {
        const formFields = document.querySelectorAll('input, select, textarea');
        formFields.forEach(field => {
            field.addEventListener('blur', () => {
                const isValid = this.validateField(field);
                const message = isValid ? 
                    `${field.name} is valid` : 
                    `${field.name} has an error: ${this.getFieldError(field)}`;
                
                this.announceToScreenReader(message, 'errors');
            });
        });
    }

    setupProgressAnnouncements() {
        const progressBar = document.querySelector('.progress-fill');
        if (progressBar) {
            const observer = new MutationObserver(() => {
                const width = progressBar.style.width;
                const percentage = parseInt(width);
                this.announceToScreenReader(`Payment progress: ${percentage}%`, 'progress');
            });
            
            observer.observe(progressBar, { attributes: true, attributeFilter: ['style'] });
        }
    }

    setupStatusAnnouncements() {
        // Announce payment status changes
        this.setupPaymentStatusAnnouncements();
    }

    setupPaymentStatusAnnouncements() {
        const statusElement = document.getElementById('payment-status');
        if (statusElement) {
            const observer = new MutationObserver(() => {
                const status = statusElement.textContent;
                this.announceToScreenReader(`Payment status: ${status}`, 'status');
            });
            
            observer.observe(statusElement, { childList: true, subtree: true });
        }
    }

    setupScreenReaderNavigation() {
        // Add skip links
        this.addSkipLinks();
        
        // Add landmarks
        this.addLandmarks();
        
        // Add headings
        this.addHeadings();
    }

    addSkipLinks() {
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.className = 'skip-link';
        skipLink.textContent = 'Skip to main content';
        document.body.insertBefore(skipLink, document.body.firstChild);
    }

    addLandmarks() {
        // Add main landmark
        const mainContent = document.getElementById('main-content') || document.querySelector('main');
        if (mainContent) {
            mainContent.setAttribute('role', 'main');
        }
        
        // Add navigation landmark
        const navigation = document.querySelector('nav');
        if (navigation) {
            navigation.setAttribute('role', 'navigation');
        }
        
        // Add form landmark
        const form = document.getElementById('payment-form');
        if (form) {
            form.setAttribute('role', 'form');
        }
    }

    addHeadings() {
        // Ensure proper heading hierarchy
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        headings.forEach((heading, index) => {
            if (!heading.id) {
                heading.id = `heading-${index}`;
            }
        });
    }

    setupScreenReaderForms() {
        // Setup form accessibility
        this.setupFormLabels();
        this.setupFormInstructions();
        this.setupFormValidation();
    }

    setupFormLabels() {
        const formFields = document.querySelectorAll('input, select, textarea');
        formFields.forEach(field => {
            if (!field.getAttribute('aria-label') && !field.getAttribute('aria-labelledby')) {
                const label = document.querySelector(`label[for="${field.id}"]`);
                if (label) {
                    field.setAttribute('aria-labelledby', label.id);
                } else {
                    field.setAttribute('aria-label', field.placeholder || field.name);
                }
            }
        });
    }

    setupFormInstructions() {
        const form = document.getElementById('payment-form');
        if (form) {
            const instructions = document.createElement('div');
            instructions.id = 'form-instructions';
            instructions.className = 'sr-only';
            instructions.textContent = 'Please fill out all required fields. Use Tab to navigate between fields.';
            form.insertBefore(instructions, form.firstChild);
            
            form.setAttribute('aria-describedby', 'form-instructions');
        }
    }

    setupFormValidation() {
        const form = document.getElementById('payment-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                const isValid = this.validateForm(form);
                if (!isValid) {
                    e.preventDefault();
                    this.announceToScreenReader('Please correct the errors in the form', 'errors');
                }
            });
        }
    }

    setupScreenReaderTables() {
        // Setup table accessibility
        const tables = document.querySelectorAll('table');
        tables.forEach(table => {
            table.setAttribute('role', 'table');
            
            const headers = table.querySelectorAll('th');
            headers.forEach(header => {
                header.setAttribute('scope', 'col');
            });
            
            const rows = table.querySelectorAll('tr');
            rows.forEach(row => {
                row.setAttribute('role', 'row');
            });
        });
    }

    // High contrast mode
    setupHighContrastMode() {
        this.detectHighContrastMode();
        this.setupHighContrastToggle();
        this.setupHighContrastStyles();
    }

    detectHighContrastMode() {
        // Detect system high contrast mode
        if (window.matchMedia('(prefers-contrast: high)').matches) {
            document.body.classList.add('high-contrast');
        }
        
        // Listen for changes
        window.matchMedia('(prefers-contrast: high)').addEventListener('change', (e) => {
            if (e.matches) {
                document.body.classList.add('high-contrast');
            } else {
                document.body.classList.remove('high-contrast');
            }
        });
    }

    setupHighContrastToggle() {
        const toggle = document.createElement('button');
        toggle.id = 'high-contrast-toggle';
        toggle.className = 'btn btn-secondary';
        toggle.textContent = 'High Contrast';
        toggle.setAttribute('aria-label', 'Toggle high contrast mode');
        
        toggle.addEventListener('click', () => {
            document.body.classList.toggle('high-contrast');
            const isEnabled = document.body.classList.contains('high-contrast');
            toggle.textContent = isEnabled ? 'Normal Contrast' : 'High Contrast';
            this.announceToScreenReader(
                isEnabled ? 'High contrast mode enabled' : 'High contrast mode disabled'
            );
        });
        
        // Add to page
        const header = document.querySelector('header') || document.body;
        header.appendChild(toggle);
    }

    setupHighContrastStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .high-contrast {
                filter: contrast(150%) brightness(120%);
            }
            
            .high-contrast .payment-form {
                border: 3px solid #000;
                background: #fff;
            }
            
            .high-contrast .form-control {
                border: 3px solid #000;
                background: #fff;
                color: #000;
            }
            
            .high-contrast .btn {
                border: 3px solid #000;
                background: #fff;
                color: #000;
            }
            
            .high-contrast .btn-primary {
                background: #000;
                color: #fff;
            }
        `;
        document.head.appendChild(style);
    }

    // Voice control support
    setupVoiceControl() {
        this.setupVoiceCommands();
        this.setupVoiceFeedback();
        this.setupVoiceNavigation();
    }

    setupVoiceCommands() {
        // Setup voice commands for payment
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            this.setupSpeechRecognition();
        }
    }

    setupSpeechRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
        
        recognition.onresult = (event) => {
            const command = event.results[event.results.length - 1][0].transcript.toLowerCase();
            this.handleVoiceCommand(command);
        };
        
        // Start recognition
        recognition.start();
    }

    handleVoiceCommand(command) {
        if (command.includes('select payment method')) {
            this.handleVoiceSelectPaymentMethod(command);
        } else if (command.includes('fill form')) {
            this.handleVoiceFillForm(command);
        } else if (command.includes('submit payment')) {
            this.handleVoiceSubmitPayment();
        } else if (command.includes('go back')) {
            this.handleVoiceGoBack();
        }
    }

    handleVoiceSelectPaymentMethod(command) {
        if (command.includes('card')) {
            this.selectPaymentMethod('card');
        } else if (command.includes('upi')) {
            this.selectPaymentMethod('upi');
        } else if (command.includes('net banking')) {
            this.selectPaymentMethod('netbanking');
        } else if (command.includes('cash on delivery')) {
            this.selectPaymentMethod('cod');
        }
    }

    handleVoiceFillForm(command) {
        // Extract field and value from command
        const fieldMatch = command.match(/fill (\w+) with (.+)/);
        if (fieldMatch) {
            const fieldName = fieldMatch[1];
            const value = fieldMatch[2];
            this.fillFormField(fieldName, value);
        }
    }

    handleVoiceSubmitPayment() {
        const submitButton = document.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.click();
        }
    }

    handleVoiceGoBack() {
        window.history.back();
    }

    selectPaymentMethod(method) {
        const methodElement = document.querySelector(`[data-method="${method}"]`);
        if (methodElement) {
            methodElement.click();
            this.announceToScreenReader(`${method} payment method selected`);
        }
    }

    fillFormField(fieldName, value) {
        const field = document.querySelector(`[name="${fieldName}"]`);
        if (field) {
            field.value = value;
            field.dispatchEvent(new Event('input'));
            this.announceToScreenReader(`${fieldName} filled with ${value}`);
        }
    }

    setupVoiceFeedback() {
        // Provide voice feedback for actions
        this.setupVoiceAnnouncements();
    }

    setupVoiceAnnouncements() {
        // Announce important events
        this.announcePaymentEvents();
    }

    announcePaymentEvents() {
        // Announce payment method selection
        document.addEventListener('paymentMethodSelected', (e) => {
            this.announceToScreenReader(`${e.detail.method} payment method selected`);
        });
        
        // Announce form validation
        document.addEventListener('formValidated', (e) => {
            const message = e.detail.isValid ? 'Form is valid' : 'Form has errors';
            this.announceToScreenReader(message, 'errors');
        });
        
        // Announce payment status
        document.addEventListener('paymentStatusChanged', (e) => {
            this.announceToScreenReader(`Payment status: ${e.detail.status}`);
        });
    }

    setupVoiceNavigation() {
        // Setup voice navigation commands
        this.setupNavigationCommands();
    }

    setupNavigationCommands() {
        // Voice commands for navigation
        const navigationCommands = {
            'go to next step': () => this.navigateToNextStep(),
            'go to previous step': () => this.navigateToPreviousStep(),
            'go to payment methods': () => this.navigateToPaymentMethods(),
            'go to form': () => this.navigateToForm(),
            'go to summary': () => this.navigateToSummary()
        };
        
        this.navigationCommands = navigationCommands;
    }

    navigateToNextStep() {
        const currentStep = document.querySelector('.payment-step.active');
        if (currentStep) {
            const nextStep = currentStep.nextElementSibling;
            if (nextStep) {
                this.switchToStep(nextStep);
            }
        }
    }

    navigateToPreviousStep() {
        const currentStep = document.querySelector('.payment-step.active');
        if (currentStep) {
            const prevStep = currentStep.previousElementSibling;
            if (prevStep) {
                this.switchToStep(prevStep);
            }
        }
    }

    navigateToPaymentMethods() {
        const paymentMethods = document.getElementById('payment-methods');
        if (paymentMethods) {
            paymentMethods.focus();
        }
    }

    navigateToForm() {
        const form = document.getElementById('payment-form');
        if (form) {
            form.focus();
        }
    }

    navigateToSummary() {
        const summary = document.getElementById('payment-summary');
        if (summary) {
            summary.focus();
        }
    }

    switchToStep(step) {
        // Hide current step
        document.querySelectorAll('.payment-step').forEach(s => s.classList.remove('active'));
        
        // Show new step
        step.classList.add('active');
        
        // Focus first element in new step
        const firstElement = step.querySelector('input, button, select, textarea');
        if (firstElement) {
            firstElement.focus();
        }
        
        // Announce step change
        const stepName = step.dataset.step || 'step';
        this.announceToScreenReader(`Now on ${stepName}`);
    }

    // Motor impairment support
    setupMotorImpairmentSupport() {
        this.setupLargeClickTargets();
        this.setupDragAndDrop();
        this.setupTouchSupport();
        this.setupSwitchControl();
    }

    setupLargeClickTargets() {
        // Ensure minimum click target size of 44px
        const clickableElements = document.querySelectorAll('button, a, input[type="checkbox"], input[type="radio"]');
        clickableElements.forEach(element => {
            const rect = element.getBoundingClientRect();
            if (rect.width < 44 || rect.height < 44) {
                element.style.minWidth = '44px';
                element.style.minHeight = '44px';
                element.style.padding = '12px';
            }
        });
    }

    setupDragAndDrop() {
        // Setup drag and drop for file uploads
        const fileInputs = document.querySelectorAll('input[type="file"]');
        fileInputs.forEach(input => {
            const dropZone = input.parentNode;
            dropZone.addEventListener('dragover', (e) => {
                e.preventDefault();
                dropZone.classList.add('drag-over');
            });
            
            dropZone.addEventListener('dragleave', () => {
                dropZone.classList.remove('drag-over');
            });
            
            dropZone.addEventListener('drop', (e) => {
                e.preventDefault();
                dropZone.classList.remove('drag-over');
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    input.files = files;
                    input.dispatchEvent(new Event('change'));
                }
            });
        });
    }

    setupTouchSupport() {
        // Setup touch-friendly interactions
        this.setupTouchTargets();
        this.setupTouchGestures();
        this.setupTouchFeedback();
    }

    setupTouchTargets() {
        // Ensure touch targets are at least 44px
        const touchElements = document.querySelectorAll('.payment-method, .btn, input, select, textarea');
        touchElements.forEach(element => {
            element.style.minHeight = '44px';
            element.style.minWidth = '44px';
        });
    }

    setupTouchGestures() {
        // Setup touch gestures for navigation
        let startX, startY;
        
        document.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        });
        
        document.addEventListener('touchend', (e) => {
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            
            const diffX = startX - endX;
            const diffY = startY - endY;
            
            // Swipe left - next step
            if (Math.abs(diffX) > Math.abs(diffY) && diffX > 50) {
                this.navigateToNextStep();
            }
            
            // Swipe right - previous step
            if (Math.abs(diffX) > Math.abs(diffY) && diffX < -50) {
                this.navigateToPreviousStep();
            }
        });
    }

    setupTouchFeedback() {
        // Provide visual feedback for touch interactions
        const touchElements = document.querySelectorAll('.payment-method, .btn');
        touchElements.forEach(element => {
            element.addEventListener('touchstart', () => {
                element.style.transform = 'scale(0.95)';
                element.style.opacity = '0.8';
            });
            
            element.addEventListener('touchend', () => {
                element.style.transform = 'scale(1)';
                element.style.opacity = '1';
            });
        });
    }

    setupSwitchControl() {
        // Setup switch control support
        this.setupSwitchNavigation();
        this.setupSwitchActivation();
    }

    setupSwitchNavigation() {
        // Setup switch navigation for motor-impaired users
        let currentIndex = 0;
        const focusableElements = document.querySelectorAll(
            'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        // Auto-advance focus
        setInterval(() => {
            if (focusableElements.length > 0) {
                focusableElements[currentIndex].focus();
                currentIndex = (currentIndex + 1) % focusableElements.length;
            }
        }, 3000); // Advance every 3 seconds
    }

    setupSwitchActivation() {
        // Setup switch activation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                const activeElement = document.activeElement;
                if (activeElement) {
                    activeElement.click();
                }
            }
        });
    }

    // Focus management
    setupFocusManagement() {
        this.setupFocusTrapping();
        this.setupFocusIndicators();
        this.setupFocusOrder();
    }

    setupFocusTrapping() {
        // Trap focus within modals
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.addEventListener('keydown', (e) => {
                if (e.key === 'Tab') {
                    this.trapFocus(modal, e);
                }
            });
        });
    }

    trapFocus(container, e) {
        const focusableElements = container.querySelectorAll(
            'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        if (e.shiftKey) {
            if (document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            }
        } else {
            if (document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        }
    }

    setupFocusIndicators() {
        // Ensure focus indicators are visible
        const style = document.createElement('style');
        style.textContent = `
            *:focus {
                outline: 2px solid #2563eb;
                outline-offset: 2px;
            }
            
            .focus-visible {
                outline: 2px solid #2563eb;
                outline-offset: 2px;
            }
        `;
        document.head.appendChild(style);
    }

    setupFocusOrder() {
        // Ensure logical focus order
        const focusableElements = document.querySelectorAll(
            'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        focusableElements.forEach((element, index) => {
            element.setAttribute('tabindex', index + 1);
        });
    }

    // Error announcements
    setupErrorAnnouncements() {
        this.setupFormErrorAnnouncements();
        this.setupPaymentErrorAnnouncements();
        this.setupSystemErrorAnnouncements();
    }

    setupFormErrorAnnouncements() {
        const form = document.getElementById('payment-form');
        if (form) {
            form.addEventListener('invalid', (e) => {
                const field = e.target;
                const errorMessage = this.getFieldError(field);
                this.announceToScreenReader(`${field.name} error: ${errorMessage}`, 'errors');
            });
        }
    }

    setupPaymentErrorAnnouncements() {
        // Announce payment errors
        document.addEventListener('paymentError', (e) => {
            this.announceToScreenReader(`Payment error: ${e.detail.message}`, 'errors');
        });
    }

    setupSystemErrorAnnouncements() {
        // Announce system errors
        window.addEventListener('error', (e) => {
            this.announceToScreenReader(`System error: ${e.message}`, 'errors');
        });
    }

    // Utility methods
    validateField(field) {
        const value = field.value.trim();
        const type = field.type;
        const required = field.hasAttribute('required');
        
        if (required && !value) {
            return false;
        }
        
        switch (type) {
            case 'email':
                return !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
            case 'tel':
                return !value || /^[0-9]{10}$/.test(value);
            case 'url':
                return !value || /^https?:\/\/.+/.test(value);
            default:
                return true;
        }
    }

    getFieldError(field) {
        const value = field.value.trim();
        const type = field.type;
        const required = field.hasAttribute('required');
        
        if (required && !value) {
            return 'This field is required';
        }
        
        switch (type) {
            case 'email':
                if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    return 'Please enter a valid email address';
                }
                break;
            case 'tel':
                if (value && !/^[0-9]{10}$/.test(value)) {
                    return 'Please enter a valid phone number';
                }
                break;
        }
        
        return '';
    }

    validateForm(form) {
        const fields = form.querySelectorAll('input[required], select[required], textarea[required]');
        let isValid = true;
        
        fields.forEach(field => {
            if (!this.validateField(field)) {
                field.classList.add('is-invalid');
                isValid = false;
            } else {
                field.classList.remove('is-invalid');
            }
        });
        
        return isValid;
    }
}

// Export for use in other modules
window.PaymentAccessibility = PaymentAccessibility;
