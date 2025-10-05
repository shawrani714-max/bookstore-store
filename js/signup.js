document.addEventListener('DOMContentLoaded', () => {

    // --- API Configuration ---
    const API_BASE_URL = '/api';

    const signupForm = document.getElementById('signup-form');
    const firstNameInput = document.getElementById('firstName');
    const lastNameInput = document.getElementById('lastName');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const phoneInput = document.getElementById('phone');
    const signupBtn = document.getElementById('signup-btn');

    // --- API Helper Functions ---
    const apiCall = async (endpoint, options = {}) => {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Signup failed');
            }
            
            return data;
        } catch (error) {
            console.error('API call failed:', error);
            throw error;
        }
    };

    const showToast = (message, type = 'success') => {
        const toast = document.createElement('div');
        toast.className = `toast-notification ${type}`;
        toast.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'} me-2"></i>
            ${message}
        `;
        document.body.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 100);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => document.body.removeChild(toast), 300);
        }, 3000);
    };

    const setLoading = (loading) => {
        if (signupBtn) {
            signupBtn.disabled = loading;
            signupBtn.innerHTML = loading ? 
                '<i class="fas fa-spinner fa-spin me-2"></i>Creating Account...' : 
                'Sign Up';
        }
    };

    const validateForm = () => {
        const firstName = firstNameInput.value.trim();
        const lastName = lastNameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        const phone = phoneInput.value.trim();

        // Check required fields
        if (!firstName || !lastName || !email || !password || !confirmPassword) {
            showToast('Please fill in all required fields', 'error');
            return false;
        }

        // Check name length
        if (firstName.length < 2 || lastName.length < 2) {
            showToast('First and last name must be at least 2 characters', 'error');
            return false;
        }

        // Check email format
        if (!email.includes('@') || !email.includes('.')) {
            showToast('Please enter a valid email address', 'error');
            return false;
        }

        // Check password length
        if (password.length < 6) {
            showToast('Password must be at least 6 characters long', 'error');
            return false;
        }

        // Check password match
        if (password !== confirmPassword) {
            showToast('Passwords do not match', 'error');
            return false;
        }

        // Check phone format (if provided)
        if (phone && !/^[0-9+\-\s()]+$/.test(phone)) {
            showToast('Please enter a valid phone number', 'error');
            return false;
        }

        return true;
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        const formData = {
            firstName: firstNameInput.value.trim(),
            lastName: lastNameInput.value.trim(),
            email: emailInput.value.trim(),
            password: passwordInput.value,
            phone: phoneInput.value.trim() || undefined
        };

        setLoading(true);

        try {
            const response = await apiCall('/auth/register', {
                method: 'POST',
                body: JSON.stringify(formData)
            });

            // Store token
            localStorage.setItem('token', response.data.token);
            
            // Store user info
            localStorage.setItem('user', JSON.stringify(response.data.user));

            showToast('Account created successfully! Redirecting...', 'success');

            // Redirect to profile page
            setTimeout(() => {
                window.location.href = '/profile';
            }, 1500);

        } catch (error) {
            showToast(error.message || 'Signup failed. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

    // --- Event Listeners ---

    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }

    // Enter key to submit
    [firstNameInput, lastNameInput, emailInput, passwordInput, confirmPasswordInput, phoneInput].forEach(input => {
        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    handleSignup(e);
                }
            });
        }
    });

    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
        const urlParams = new URLSearchParams(window.location.search);
        const redirect = urlParams.get('redirect') || '/';
        window.location.href = redirect;
    }
}); 