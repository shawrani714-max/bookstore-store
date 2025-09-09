const userNameElement = document.getElementById('user-name');
const userEmailElement = document.getElementById('user-email');
const userBioElement = document.getElementById('user-bio');
const userProfileImageElement = document.getElementById('user-profile-image');
const logoutButton = document.getElementById('logout-button');

// Settings form elements
const fullNameInput = document.getElementById('fullName');
const emailInput = document.getElementById('email');
const bioTextarea = document.getElementById('bio');

const defaultAvatar = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2EwYTBhMCI+PHBhdGggZD0iTTEyIDEyYzIuMjEgMCA0LTEuNzkgNC00cy0xLjc5LTQtNC00LTQgMS43OS00IDQgMS43OSA0IDQgNHptMCAyYy0yLjY3IDAtOCAxLjM0LTggNHYyIDE2djJoMTZ2LTJjMC0yLjY2LTUuMzMtNC04LTR6Ii8+PC9zdmc+`;

// This is a placeholder, as Firebase Auth doesn't store a bio by default.
// This would typically be fetched from a database like Firestore.
const bio = "I am a web developer"; 

// Populate profile header
userNameElement.textContent = 'Anonymous';
userEmailElement.textContent = 'anonymous@example.com';
userProfileImageElement.src = defaultAvatar;
userProfileImageElement.alt = 'Anonymous';

// Populate main profile card
userBioElement.innerHTML = `<strong>Bio:</strong> ${bio}`;

// Populate settings form
if (fullNameInput) fullNameInput.value = 'Anonymous';
if (emailInput) emailInput.value = 'anonymous@example.com';
if (bioTextarea) bioTextarea.value = bio;

logoutButton.addEventListener('click', async () => {
    try {
        // This is a placeholder, as Firebase Auth doesn't store a bio by default.
        // This would typically be fetched from a database like Firestore.
        // await signOut(auth);
        window.location.href = 'login.html';
    } catch (error) {
        console.error('Logout failed:', error);
        alert('Logout failed. Please try again.');
    }
});

document.addEventListener('DOMContentLoaded', async () => {
    const userNameElement = document.getElementById('user-name');
    const userEmailElement = document.getElementById('user-email');
    const userProfileImageElement = document.getElementById('user-profile-image');
    const userBioElement = document.getElementById('user-bio');
    const fullNameInput = document.getElementById('fullName');
    const emailInput = document.getElementById('email');
    const bioTextarea = document.getElementById('bio');
    const logoutButton = document.getElementById('logout-button');
    const defaultAvatar = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2EwYTBhMCI+PHBhdGggZD0iTTEyIDEyYzIuMjEgMCA0LTEuNzkgNC00cy0xLjc5LTQtNC00LTQgMS43OS00IDQgMS43OSA0IDQgNHptMCAyYy0yLjY3IDAtOCAxLjM0LTggNHYyIDE2djJoMTZ2LTJjMC0yLjY2LTUuMzMtNC04LTR6Ii8+PC9zdmc+`;

    // Hide profile content by default
    const profileContent = document.getElementById('profile-content');
    if (profileContent) profileContent.style.display = 'none';

    // Fetch user profile from backend
    async function fetchUserProfile() {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '/login';
            return;
        }
        try {
            const response = await fetch('/api/auth/me', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) {
                throw new Error('Failed to fetch user profile');
            }
            const data = await response.json();
            const user = data.data.user;
            // Populate profile header
            userNameElement.textContent = user.firstName + (user.lastName ? ' ' + user.lastName : '');
            userEmailElement.textContent = user.email;
            userProfileImageElement.src = defaultAvatar;
            userProfileImageElement.alt = user.firstName;
            // Populate main profile card
            userBioElement.innerHTML = `<strong>Bio:</strong> ${user.bio || ''}`;
            // Populate settings form
            if (fullNameInput) fullNameInput.value = user.firstName + (user.lastName ? ' ' + user.lastName : '');
            if (emailInput) emailInput.value = user.email;
            if (bioTextarea) bioTextarea.value = user.bio || '';
            // Show profile content
            if (profileContent) profileContent.style.display = 'block';
        } catch (error) {
            console.error('Profile fetch error:', error);
            window.location.href = '/login';
        }
    }

    fetchUserProfile();

    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = '/login';
    });

    // --- API Configuration ---
    const API_BASE_URL = '/api';

    const profileForm = document.getElementById('profile-form');
    const passwordForm = document.getElementById('password-form');
    const ordersContainer = document.getElementById('orders-container');
    const userInfoContainer = document.getElementById('user-info');

    let currentUser = null;

    // --- API Helper Functions ---
    const apiCall = async (endpoint, options = {}) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` }),
                    ...options.headers
                },
                ...options
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API call failed:', error);
            throw error;
        }
    };

    const checkAuth = () => {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '/login';
            return false;
        }
        return true;
    };

    const loadUserProfile = async () => {
        try {
            const response = await apiCall('/auth/profile');
            currentUser = response.data;
            renderUserInfo();
        } catch (error) {
            console.error('Failed to load user profile:', error);
            showToast('Failed to load profile', 'error');
        }
    };

    const loadOrders = async () => {
        try {
            const response = await apiCall('/orders');
            const orders = response.data || [];
            renderOrders(orders);
        } catch (error) {
            console.error('Failed to load orders:', error);
            showToast('Failed to load orders', 'error');
        }
    };

    const renderUserInfo = () => {
        if (!currentUser || !userInfoContainer) return;

        const fullName = currentUser.firstName + (currentUser.lastName ? ' ' + currentUser.lastName : '');

        userInfoContainer.innerHTML = `
            <div class="user-info-card">
                <div class="user-avatar">
                    <i class="fas fa-user-circle fa-3x"></i>
                </div>
                <div class="user-details">
                    <h4>${fullName}</h4>
                    <p class="text-muted">${currentUser.email}</p>
                    <p class="text-muted">Member since ${new Date(currentUser.createdAt).toLocaleDateString()}</p>
                </div>
            </div>
        `;

        // Populate form fields
        if (profileForm) {
            const nameField = profileForm.querySelector('[name="name"]');
            if (nameField) nameField.value = fullName || '';
            const emailField = profileForm.querySelector('[name="email"]');
            if (emailField) emailField.value = currentUser.email || '';
            const phoneField = profileForm.querySelector('[name="phone"]');
            if (phoneField) phoneField.value = currentUser.phone || '';
            const addressField = profileForm.querySelector('[name="address"]');
            if (addressField) addressField.value = currentUser.address || '';
        }
    };

    const renderOrders = (orders) => {
        if (!ordersContainer) return;

        if (orders.length === 0) {
            ordersContainer.innerHTML = `
                <div class="text-center py-5">
                    <i class="fas fa-shopping-bag fa-3x text-muted mb-3"></i>
                    <h4>No orders yet</h4>
                    <p class="text-muted">Start shopping to see your orders here!</p>
                    <a href="/shop" class="btn btn-primary">Start Shopping</a>
                </div>
            `;
            return;
        }

        ordersContainer.innerHTML = orders.map(order => `
            <div class="order-card">
                <div class="order-header">
                    <div class="order-info">
                        <h5>Order #${order._id.slice(-8)}</h5>
                        <p class="text-muted">Placed on ${new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div class="order-status">
                        <span class="badge bg-${getStatusColor(order.status)}">${order.status}</span>
                    </div>
                </div>
                <div class="order-items">
                    ${order.items.map(item => `
                        <div class="order-item">
                            <img src="${item.book.coverImage}" alt="${item.book.title}" class="order-item-img">
                            <div class="order-item-details">
                                <h6>${item.book.title}</h6>
                                <p class="text-muted">by ${item.book.author}</p>
                                <p>Quantity: ${item.quantity}</p>
                            </div>
                            <div class="order-item-price">
                                <p>₹${item.price}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class="order-footer">
                    <div class="order-total">
                        <strong>Total: ₹${order.totalAmount}</strong>
                    </div>
                    <div class="order-actions">
                        <button class="btn btn-outline-primary btn-sm view-order-btn" data-id="${order._id}">
                            View Details
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    };

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'pending': return 'warning';
            case 'processing': return 'info';
            case 'shipped': return 'primary';
            case 'delivered': return 'success';
            case 'cancelled': return 'danger';
            default: return 'secondary';
        }
    };

    const updateProfile = async (formData) => {
        try {
            await apiCall('/auth/profile', {
                method: 'PUT',
                body: JSON.stringify(formData)
            });

            showToast('Profile updated successfully!', 'success');
            await loadUserProfile(); // Reload user data
        } catch (error) {
            showToast('Failed to update profile', 'error');
        }
    };

    const changePassword = async (formData) => {
        try {
            await apiCall('/auth/change-password', {
                method: 'PUT',
                body: JSON.stringify(formData)
            });

            showToast('Password changed successfully!', 'success');
            passwordForm.reset();
        } catch (error) {
            showToast('Failed to change password', 'error');
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('cart');
        localStorage.removeItem('wishlist');
        window.location.href = '/';
    };

    // Toast notification function
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

    // --- Event Listeners ---

    // Profile form submission
    if (profileForm) {
        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const token = localStorage.getItem('token');
            if (!token) {
                window.location.href = '/login';
                return;
            }
            const fullName = fullNameInput.value.trim();
            const [firstName, ...rest] = fullName.split(' ');
            const lastName = rest.join(' ');
            const bio = bioTextarea ? bioTextarea.value.trim() : '';
            try {
                const response = await fetch('/api/auth/profile', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ firstName, lastName, bio })
                });
                const data = await response.json();
                if (response.ok) {
                    alert('Profile updated successfully!');
                    fetchUserProfile();
                } else {
                    alert(data.message || 'Failed to update profile');
                }
            } catch (error) {
                alert('Failed to update profile');
            }
        });
    }

    // Password form submission
    if (passwordForm) {
        passwordForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(passwordForm);
            const data = Object.fromEntries(formData);
            
            if (data.newPassword !== data.confirmPassword) {
                showToast('Passwords do not match', 'error');
                return;
            }
            
            await changePassword(data);
        });
    }

    // Logout button
    document.body.addEventListener('click', (e) => {
        if (e.target.classList.contains('logout-btn')) {
            logout();
        }
    });

    // View order details
    document.body.addEventListener('click', (e) => {
        if (e.target.classList.contains('view-order-btn')) {
            const orderId = e.target.dataset.id;
            window.location.href = `/order/${orderId}`;
        }
    });

    // Initialize
    if (checkAuth()) {
        await loadUserProfile();
        await loadOrders();
        document.body.classList.remove('body-hidden');
    }
}); 