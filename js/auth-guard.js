// Authentication guard for protected pages
document.addEventListener('DOMContentLoaded', () => {

    // --- API Configuration ---
    const API_BASE_URL = '/api';

    const checkAuth = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            redirectToLogin();
            return false;
        }

        try {
            // Verify token with backend
            const response = await fetch(`${API_BASE_URL}/auth/verify`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Invalid token');
            }

            return true;
        } catch (error) {
            console.error('Auth verification failed:', error);
            localStorage.removeItem('token');
            redirectToLogin();
            return false;
        }
    };

    const redirectToLogin = () => {
        const currentPath = window.location.pathname;
        if (currentPath !== '/login' && currentPath !== '/signup') {
            window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
        }
    };

    const updateAuthUI = () => {
        const token = localStorage.getItem('token');
        const authLinks = document.querySelectorAll('.auth-link');
        const userLinks = document.querySelectorAll('.user-link');
        const logoutBtn = document.querySelector('.logout-btn');

        if (token) {
            // User is logged in
            authLinks.forEach(link => link.style.display = 'none');
            userLinks.forEach(link => link.style.display = 'block');
            if (logoutBtn) logoutBtn.style.display = 'block';
        } else {
            // User is not logged in
            authLinks.forEach(link => link.style.display = 'block');
            userLinks.forEach(link => link.style.display = 'none');
            if (logoutBtn) logoutBtn.style.display = 'none';
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('cart');
        localStorage.removeItem('wishlist');
        window.location.href = '/';
    };

    // Event listeners
    document.body.addEventListener('click', (e) => {
        if (e.target.classList.contains('logout-btn')) {
            logout();
        }
    });

    // Initialize
    updateAuthUI();
    
    // Check auth for protected pages
    const protectedPages = ['/profile', '/cart', '/wishlist', '/orders'];
    const currentPath = window.location.pathname;
    
    if (protectedPages.some(page => currentPath.startsWith(page))) {
        checkAuth();
    }
}); 
