const userNameElement = document.getElementById('user-name');
const userEmailElement = document.getElementById('user-email');
const userBioElement = document.getElementById('user-bio');
const userProfileImageElement = document.getElementById('user-profile-image');
const logoutButton = document.getElementById('logout-button');

// Add null checks for all elements
if (!userNameElement) console.warn('user-name element not found');
if (!userEmailElement) console.warn('user-email element not found');
if (!userBioElement) console.warn('user-bio element not found');
if (!userProfileImageElement) console.warn('user-profile-image element not found');
if (!logoutButton) console.warn('logout-button element not found');

// Settings form elements
const fullNameInput = document.getElementById('fullName');
const emailInput = document.getElementById('email');
const bioTextarea = document.getElementById('bio');

// Add null checks for settings elements
if (!fullNameInput) console.warn('fullName element not found');
if (!emailInput) console.warn('email element not found');
if (!bioTextarea) console.warn('bio element not found');

const defaultAvatar = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzY2NjY2NiIgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiPjxjaXJjbGUgY3g9IjEyIiBjeT0iOCIgcj0iNCIvPjxwYXRoIGQ9Ik0xMiAxNGMtMy4zIDAtNiAxLjUtNiAzLjV2NGgxMnYtNGMwLTIuMS0yLjctMy41LTYtMy41eiIvPjwvc3ZnPg==`;

// This is a placeholder, as Firebase Auth doesn't store a bio by default.
// This would typically be fetched from a database like Firestore.
const bio = "I am a web developer"; 

// Don't populate with default data to prevent flash
// Real data will be loaded via fetchUserProfile()

if (logoutButton) {
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
}

document.addEventListener('DOMContentLoaded', async () => {
    const userNameElement = document.getElementById('user-name');
    const userEmailElement = document.getElementById('user-email');
    const userProfileImageElement = document.getElementById('user-profile-image');

    // ========================================
    // ADDRESS MANAGEMENT SYSTEM - PROFILE PAGE
    // ========================================

    let savedAddresses = [];
    let currentEditIndex = null;

    // Initialize address system
    function initializeAddressSystem() {
        console.log('Initializing profile address system...');
        
        // Load saved addresses
        loadSavedAddresses();
        
        // Setup event listeners
        setupAddressEventListeners();
        
        // Display addresses when addresses section is shown
        setupSectionNavigation();
    }

    // Load saved addresses from localStorage
    function loadSavedAddresses() {
        const saved = localStorage.getItem('savedAddresses');
        if (saved) {
            savedAddresses = JSON.parse(saved);
            console.log('Loaded saved addresses:', savedAddresses.length);
        } else {
            savedAddresses = [];
            console.log('No saved addresses found');
        }
    }

    // Setup event listeners for address management
    function setupAddressEventListeners() {
        // Add New Address button
        const addNewBtn = document.getElementById('add-new-address-profile-btn');
        if (addNewBtn) {
            addNewBtn.addEventListener('click', () => showAddressModal('add'));
        }

        // Modal close button
        const closeModalBtn = document.getElementById('close-modal-btn');
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', closeAddressModal);
        }

        // Modal cancel button
        const cancelBtn = document.getElementById('modal-cancel-btn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', closeAddressModal);
        }

        // Save address button
        const saveBtn = document.getElementById('modal-save-address-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', saveAddress);
        }

        // Close modal when clicking outside
        const modal = document.getElementById('address-form-modal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    closeAddressModal();
                }
            });
        }
    }

    // Setup section navigation to load addresses when needed
    function setupSectionNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const section = item.getAttribute('data-section');
                if (section === 'addresses') {
                    displayAddresses();
                }
            });
        });
    }

    // Setup event listeners for address buttons
    function setupAddressButtonListeners() {
        // Edit buttons
        const editButtons = document.querySelectorAll('.edit-address-btn');
        editButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const index = parseInt(e.target.closest('.edit-address-btn').getAttribute('data-address-index'));
                console.log('Edit button clicked for index:', index);
                editAddressProfile(index);
            });
        });

        // Delete buttons
        const deleteButtons = document.querySelectorAll('.delete-address-btn');
        deleteButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const index = parseInt(e.target.closest('.delete-address-btn').getAttribute('data-address-index'));
                console.log('Delete button clicked for index:', index);
                deleteAddressProfile(index);
            });
        });
    }

    // Display saved addresses
    function displayAddresses() {
        const addressesList = document.getElementById('addresses-list');
        if (!addressesList) return;

        if (savedAddresses.length === 0) {
            addressesList.innerHTML = `
                <div class="empty-addresses-profile">
                    <i class="fas fa-map-marker-alt"></i>
                    <h5>No Saved Addresses</h5>
                    <p>You haven't saved any addresses yet. Add your first address to get started.</p>
                </div>
            `;
        } else {
            addressesList.innerHTML = savedAddresses.map((address, index) => `
                <div class="address-card" data-address-id="${index}">
                    <div class="address-card-header">
                        <div>
                            <div class="address-name">${address.name}</div>
                            <span class="address-type">Home</span>
                        </div>
                    </div>
                    <div class="address-details">
                        ${address.address}<br>
                        ${address.city}, ${address.state} ${address.zipCode}<br>
                        ${address.country}
                    </div>
                    <div class="address-phone">
                        <i class="fas fa-phone me-1"></i>${address.phone}
                    </div>
                    ${address.deliveryInstructions ? `
                        <div class="address-instructions">
                            <i class="fas fa-comment-alt me-1"></i>
                            ${address.deliveryInstructions}
                        </div>
                    ` : ''}
                    <div class="address-actions">
                        <button type="button" class="btn btn-outline-primary edit-address-btn" data-address-index="${index}">
                            <i class="fas fa-edit me-1"></i>Edit
                        </button>
                        <button type="button" class="btn btn-outline-danger delete-address-btn" data-address-index="${index}">
                            <i class="fas fa-trash me-1"></i>Delete
                        </button>
                    </div>
                </div>
            `).join('');
            
            // Add event listeners to the newly created buttons
            setupAddressButtonListeners();
        }
    }

    // Show address modal
    function showAddressModal(mode = 'add', addressData = null) {
        console.log('showAddressModal called with mode:', mode, 'data:', addressData);
        
        const modal = document.getElementById('address-form-modal');
        const title = document.getElementById('modal-title');
        
        if (!modal) {
            console.error('Modal element not found!');
            return;
        }

        if (mode === 'add') {
            title.textContent = 'Add New Address';
            clearAddressForm();
        } else if (mode === 'edit') {
            title.textContent = 'Edit Address';
            fillAddressForm(addressData);
        }

        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    // Close address modal
    function closeAddressModal() {
        const modal = document.getElementById('address-form-modal');
        if (modal) {
            modal.classList.remove('show');
            document.body.style.overflow = '';
            clearAddressForm();
            currentEditIndex = null;
        }
    }

    // Clear address form
    function clearAddressForm() {
        const form = document.getElementById('profile-address-form');
        if (form) {
            form.reset();
            
            // Clear validation states
            form.querySelectorAll('.form-control').forEach(field => {
                field.classList.remove('is-valid', 'is-invalid');
            });
            
            // Hide error messages
            form.querySelectorAll('.form-text').forEach(error => {
                error.classList.add('d-none');
            });
        }
    }

    // Fill address form with data
    function fillAddressForm(addressData) {
        console.log('fillAddressForm called with:', addressData);
        
        if (!addressData) {
            console.log('No address data provided');
            return;
        }

        const fields = {
            'modal-name': addressData.name || '',
            'modal-phone': addressData.phone || '',
            'modal-address': addressData.address || '',
            'modal-city': addressData.city || '',
            'modal-zipCode': addressData.zipCode || '',
            'modal-state': addressData.state || '',
            'modal-country': addressData.country || '',
            'modal-delivery-instructions': addressData.deliveryInstructions || ''
        };

        Object.entries(fields).forEach(([fieldId, value]) => {
            const element = document.getElementById(fieldId);
            if (element) {
                element.value = value;
            } else {
                console.error(`Element ${fieldId} not found!`);
            }
        });
    }

    // Save address
    function saveAddress() {
        console.log('Saving address...');
        
        // Validate form
        const isValid = validateAddressForm();
        
        if (isValid) {
            // Get form data
            const formData = getFormData();
            
            if (currentEditIndex !== null) {
                // Edit existing address
                savedAddresses[currentEditIndex] = formData;
                console.log('Address updated');
            } else {
                // Add new address
                savedAddresses.push(formData);
                console.log('Address added');
            }
            
            // Save to localStorage
            localStorage.setItem('savedAddresses', JSON.stringify(savedAddresses));
            
            // Close modal and refresh display
            closeAddressModal();
            displayAddresses();
            
            // Show success message
            showMessage('Address saved successfully!', 'success');
        }
    }

    // Validate address form
    function validateAddressForm() {
        const requiredFields = ['modal-name', 'modal-phone', 'modal-address', 'modal-city', 'modal-zipCode', 'modal-state', 'modal-country'];
        let isValid = true;

        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field && !field.value.trim()) {
                isValid = false;
                field.classList.add('is-invalid');
                showFieldError(fieldId.replace('modal-', ''), 'This field is required');
            }
        });

        return isValid;
    }

    // Get form data
    function getFormData() {
        return {
            name: document.getElementById('modal-name')?.value || '',
            phone: document.getElementById('modal-phone')?.value || '',
            address: document.getElementById('modal-address')?.value || '',
            city: document.getElementById('modal-city')?.value || '',
            zipCode: document.getElementById('modal-zipCode')?.value || '',
            state: document.getElementById('modal-state')?.value || '',
            country: document.getElementById('modal-country')?.value || '',
            deliveryInstructions: document.getElementById('modal-delivery-instructions')?.value || '',
            savedAt: new Date().toISOString()
        };
    }

    // Show field error
    function showFieldError(fieldId, message) {
        const errorElement = document.getElementById(`modal-${fieldId}-error`);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.remove('d-none');
        }
    }

    // Show message
    function showMessage(message, type = 'info') {
        // Create a simple message display
        const messageDiv = document.createElement('div');
        messageDiv.className = `alert alert-${type === 'success' ? 'success' : 'info'} alert-dismissible fade show position-fixed`;
        messageDiv.style.cssText = 'top: 20px; right: 20px; z-index: 10001; min-width: 300px;';
        messageDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(messageDiv);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 3000);
    }

    // Global functions for address management
    window.editAddressProfile = function(index) {
        console.log('Edit button clicked for index:', index);
        console.log('Saved addresses:', savedAddresses);
        
        if (savedAddresses[index]) {
            console.log('Address data:', savedAddresses[index]);
            currentEditIndex = index;
            showAddressModal('edit', savedAddresses[index]);
        } else {
            console.error('Address not found at index:', index);
        }
    };

    window.deleteAddressProfile = function(index) {
        showDeleteConfirmation(index);
    };

    // Show custom delete confirmation modal
    function showDeleteConfirmation(index) {
        // Create modal overlay
        const overlay = document.createElement('div');
        overlay.className = 'delete-confirmation-overlay';
        overlay.innerHTML = `
            <div class="delete-confirmation-modal">
                <div class="delete-confirmation-header">
                    <h4><i class="fas fa-exclamation-triangle me-2"></i>Delete Address</h4>
                </div>
                <div class="delete-confirmation-body">
                    <p>Are you sure you want to delete this address?</p>
                    <p class="text-muted">This action cannot be undone.</p>
                </div>
                <div class="delete-confirmation-actions">
                    <button type="button" class="btn btn-outline-secondary" id="cancel-delete-btn">
                        <i class="fas fa-times me-2"></i>Cancel
                    </button>
                    <button type="button" class="btn btn-danger" id="confirm-delete-btn">
                        <i class="fas fa-trash me-2"></i>Delete Address
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
        document.body.style.overflow = 'hidden';

        // Add event listeners
        document.getElementById('cancel-delete-btn').addEventListener('click', () => {
            document.body.removeChild(overlay);
            document.body.style.overflow = '';
        });

        document.getElementById('confirm-delete-btn').addEventListener('click', () => {
            savedAddresses.splice(index, 1);
            localStorage.setItem('savedAddresses', JSON.stringify(savedAddresses));
            displayAddresses();
            showMessage('Address deleted successfully!', 'success');
            document.body.removeChild(overlay);
            document.body.style.overflow = '';
        });

        // Close on overlay click
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                document.body.removeChild(overlay);
                document.body.style.overflow = '';
            }
        });
    }

    // Initialize address system
    initializeAddressSystem();
    const userBioElement = document.getElementById('user-bio');
    const fullNameInput = document.getElementById('fullName');
    const emailInput = document.getElementById('email');
    const bioTextarea = document.getElementById('bio');
    const logoutButton = document.getElementById('logout-button');
    const defaultAvatar = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzY2NjY2NiIgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiPjxjaXJjbGUgY3g9IjEyIiBjeT0iOCIgcj0iNCIvPjxwYXRoIGQ9Ik0xMiAxNGMtMy4zIDAtNiAxLjUtNiAzLjV2NGgxMnYtNGMwLTIuMS0yLjctMy41LTYtMy41eiIvPjwvc3ZnPg==`;

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
            if (userBioElement) {
                userBioElement.innerHTML = `<strong>Bio:</strong> ${user.bio || ''}`;
            }
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

    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('token');
            window.location.href = '/login';
        });
    }

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

    // Theme settings loader for profile page
    async function loadThemeSettingsForSite() {
      try {
        const res = await fetch('/api/admin/theme');
        if (!res.ok) throw new Error('Failed to load theme');
        const settings = await res.json();
        const root = document.documentElement;
        root.style.setProperty('--primary-color', settings.primaryColor);
        root.style.setProperty('--accent-color', settings.accentColor);
        root.style.setProperty('--bg-color', settings.bgColor);
        root.style.setProperty('--card-color', settings.cardColor);
      } catch (e) {
        // fallback: do nothing, use default CSS
      }
    }

    // Load theme settings on every page load
    loadThemeSettingsForSite();

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
                    // Success message is now handled by custom modal in profile.html
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