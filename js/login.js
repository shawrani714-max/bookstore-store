document.addEventListener('DOMContentLoaded', () => {

    // --- API Configuration ---
    const API_BASE_URL = '/api';

    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const loginBtn = document.getElementById('login-btn');
    const forgotPasswordLink = document.getElementById('forgot-password-link');
    const forgotPasswordModal = new bootstrap.Modal(document.getElementById('forgotPasswordModal'));
    const forgotPasswordForm = document.getElementById('forgot-password-form');
    const forgotPasswordMessage = document.getElementById('forgot-password-message');

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
                throw new Error(data.message || 'Login failed');
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
        if (loginBtn) {
            loginBtn.disabled = loading;
            loginBtn.innerHTML = loading ? 
                '<i class="fas fa-spinner fa-spin me-2"></i>Logging in...' : 
                'Login';
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        
        const email = emailInput.value.trim();
        const password = passwordInput.value;

        // Basic validation
        if (!email || !password) {
            showToast('Please fill in all fields', 'error');
            return;
        }

        if (!email.includes('@')) {
            showToast('Please enter a valid email', 'error');
            return;
        }

        setLoading(true);

        try {
            const response = await apiCall('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });

            // Store token
            localStorage.setItem('token', response.data.token);
            
            // Store user info
            localStorage.setItem('user', JSON.stringify(response.data.user));

            showToast('Login successful! Redirecting...', 'success');

            // Redirect to profile page
            setTimeout(() => {
                window.location.href = '/profile';
            }, 1500);

        } catch (error) {
            showToast(error.message || 'Login failed. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

    // --- Event Listeners ---

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Enter key to submit
    [emailInput, passwordInput].forEach(input => {
        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    handleLogin(e);
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

    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', (e) => {
            e.preventDefault();
            forgotPasswordMessage.textContent = '';
            forgotPasswordForm.reset();
            forgotPasswordModal.show();
        });
    }

    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('forgot-email').value.trim();
            if (!email) return;
            forgotPasswordMessage.textContent = 'Sending reset link...';
            try {
                const response = await fetch('/api/auth/forgot-password', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email })
                });
                if (!response.ok) throw new Error('Failed to send reset link');
                forgotPasswordMessage.textContent = 'If an account exists for this email, a password reset link has been sent.';
            } catch (err) {
                forgotPasswordMessage.textContent = 'Failed to send reset link. Please try again.';
            }
        });
    }
}); 