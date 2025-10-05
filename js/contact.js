// ========================================
// ENHANCED CONTACT PAGE FUNCTIONALITY
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('Contact page loaded successfully');
    
    // Initialize contact form
    initializeContactForm();
    
    // Setup form validation
    setupFormValidation();
    
    // Setup form submission
    setupFormSubmission();
});

// Initialize contact form
function initializeContactForm() {
    const contactForm = document.getElementById('contact-form');
    if (!contactForm) {
        console.warn('Contact form not found');
        return;
    }
    
    console.log('Contact form initialized');
    
    // Add loading state to submit button
    const submitBtn = document.getElementById('submit-btn');
    if (submitBtn) {
        submitBtn.addEventListener('click', function(e) {
            e.preventDefault();
            handleFormSubmission();
        });
    }
}

// Setup form validation
function setupFormValidation() {
    const requiredFields = ['contact-name', 'contact-email', 'contact-subject', 'contact-message'];
    
    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            // Real-time validation on blur
            field.addEventListener('blur', function() {
                validateField(this);
            });
            
            // Clear validation on input
            field.addEventListener('input', function() {
                clearFieldValidation(this);
            });
        }
    });
}

// Validate individual field
function validateField(field) {
    const value = field.value.trim();
    const fieldId = field.id;
    let isValid = true;
    let errorMessage = '';
    
    // Required field validation
    if (field.hasAttribute('required') && !value) {
        isValid = false;
        errorMessage = 'This field is required';
    }
    
    // Email validation
    if (fieldId === 'contact-email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid email address';
        }
    }
    
    // Name validation
    if (fieldId === 'contact-name' && value) {
        if (value.length < 2) {
            isValid = false;
            errorMessage = 'Name must be at least 2 characters long';
        }
    }
    
    // Message validation
    if (fieldId === 'contact-message' && value) {
        if (value.length < 10) {
            isValid = false;
            errorMessage = 'Message must be at least 10 characters long';
        }
    }
    
    // Update field appearance
    if (isValid) {
        field.classList.remove('is-invalid');
        field.classList.add('is-valid');
        showValidationIcon(fieldId, 'valid');
        hideFieldError(fieldId);
    } else {
        field.classList.remove('is-valid');
        field.classList.add('is-invalid');
        showValidationIcon(fieldId, 'invalid');
        showFieldError(fieldId, errorMessage);
    }
    
    return isValid;
}

// Clear field validation
function clearFieldValidation(field) {
    field.classList.remove('is-valid', 'is-invalid');
    const fieldId = field.id;
    hideValidationIcon(fieldId);
    hideFieldError(fieldId);
}

// Show validation icon
function showValidationIcon(fieldId, type) {
    const validIcon = document.getElementById(fieldId.replace('contact-', '') + '-valid');
    const invalidIcon = document.getElementById(fieldId.replace('contact-', '') + '-invalid');
    
    if (type === 'valid' && validIcon) {
        validIcon.classList.remove('d-none');
        if (invalidIcon) invalidIcon.classList.add('d-none');
    } else if (type === 'invalid' && invalidIcon) {
        invalidIcon.classList.remove('d-none');
        if (validIcon) validIcon.classList.add('d-none');
    }
}

// Hide validation icon
function hideValidationIcon(fieldId) {
    const validIcon = document.getElementById(fieldId.replace('contact-', '') + '-valid');
    const invalidIcon = document.getElementById(fieldId.replace('contact-', '') + '-invalid');
    
    if (validIcon) validIcon.classList.add('d-none');
    if (invalidIcon) invalidIcon.classList.add('d-none');
}

// Show field error
function showFieldError(fieldId, message) {
    const errorElement = document.getElementById(fieldId.replace('contact-', '') + '-error');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.remove('d-none');
    }
}

// Hide field error
function hideFieldError(fieldId) {
    const errorElement = document.getElementById(fieldId.replace('contact-', '') + '-error');
    if (errorElement) {
        errorElement.classList.add('d-none');
    }
}

// Handle form submission
function handleFormSubmission() {
    console.log('Handling form submission...');
    
    const form = document.getElementById('contact-form');
    const submitBtn = document.getElementById('submit-btn');
    
    if (!form || !submitBtn) {
        console.error('Form or submit button not found');
        return;
    }
    
    // Validate all required fields
    const requiredFields = ['contact-name', 'contact-email', 'contact-subject', 'contact-message'];
    let isFormValid = true;
    
    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field && !validateField(field)) {
            isFormValid = false;
        }
    });
    
    if (!isFormValid) {
        showMessage('Please fill in all required fields correctly.', 'error');
        return;
    }
    
    // Show loading state
    setSubmitButtonLoading(true);
    
    // Simulate form submission (replace with actual API call)
    setTimeout(() => {
        // Get form data
        const formData = getFormData();
        console.log('Form data:', formData);
        
        // Simulate successful submission
        setSubmitButtonLoading(false);
        showMessage('Thank you for your message! We\'ll get back to you within 24 hours.', 'success');
        form.reset();
        clearAllValidation();
        
    }, 2000); // 2 second delay to simulate API call
}

// Get form data
function getFormData() {
    return {
        name: document.getElementById('contact-name')?.value || '',
        email: document.getElementById('contact-email')?.value || '',
        phone: document.getElementById('contact-phone')?.value || '',
        subject: document.getElementById('contact-subject')?.value || '',
        message: document.getElementById('contact-message')?.value || '',
        timestamp: new Date().toISOString()
    };
}

// Set submit button loading state
function setSubmitButtonLoading(loading) {
    const submitBtn = document.getElementById('submit-btn');
    if (!submitBtn) return;
    
    if (loading) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Sending...';
        submitBtn.classList.add('loading');
    } else {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-paper-plane me-2"></i>Send Message';
        submitBtn.classList.remove('loading');
    }
}

// Clear all validation
function clearAllValidation() {
    const fields = ['contact-name', 'contact-email', 'contact-phone', 'contact-subject', 'contact-message'];
    
    fields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            clearFieldValidation(field);
        }
    });
}

// Show message
function showMessage(message, type = 'info') {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.contact-message');
    existingMessages.forEach(msg => msg.remove());
    
    // Create message element
    const messageDiv = document.createElement('div');
    messageDiv.className = `contact-message alert alert-${type === 'success' ? 'success' : type === 'error' ? 'danger' : 'info'} alert-dismissible fade show position-fixed`;
    messageDiv.style.cssText = 'top: 20px; right: 20px; z-index: 10001; min-width: 300px; max-width: 500px;';
    messageDiv.innerHTML = `
        <div class="d-flex align-items-center">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'} me-2"></i>
            ${message}
        </div>
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(messageDiv);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.parentNode.removeChild(messageDiv);
        }
    }, 5000);
}

// Setup form submission (alternative method)
function setupFormSubmission() {
    const form = document.getElementById('contact-form');
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        handleFormSubmission();
    });
}

// Add some interactive effects
document.addEventListener('DOMContentLoaded', function() {
    // Add hover effects to contact cards
    const contactCards = document.querySelectorAll('.contact-card');
    contactCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Add click effects to contact links
    const contactLinks = document.querySelectorAll('.contact-link');
    contactLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Add ripple effect
            const ripple = document.createElement('span');
            ripple.className = 'ripple';
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
});

console.log('Contact page JavaScript loaded successfully');
