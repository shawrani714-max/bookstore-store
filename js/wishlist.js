document.addEventListener('DOMContentLoaded', () => {

    // --- API Configuration ---
    const API_BASE_URL = '/api';

    const wishlistContainer = document.getElementById('wishlist-container');
    const emptyWishlistMessage = document.getElementById('empty-wishlist-message');
    const wishlistCountBadge = document.getElementById('wishlist-count');

    let wishlistItems = [];

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

    const loadWishlist = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                showEmptyWishlist();
                localStorage.setItem('wishlist', JSON.stringify([]));
                return;
            }

            const response = await apiCall('/wishlist');
            wishlistItems = response.data || [];
            localStorage.setItem('wishlist', JSON.stringify(wishlistItems.map(item => item.book._id)));
            renderWishlist();
        } catch (error) {
            console.error('Failed to load wishlist:', error);
            showEmptyWishlist();
            localStorage.setItem('wishlist', JSON.stringify([]));
        }
    };

    const renderWishlist = () => {
        if (wishlistItems.length === 0) {
            showEmptyWishlist();
            updateWishlistCount();
            return;
        }

        // Hide empty wishlist message
        if (emptyWishlistMessage) {
            emptyWishlistMessage.style.display = 'none';
        }

        // Render wishlist items
        if (wishlistContainer) {
            wishlistContainer.innerHTML = wishlistItems.map(item => `
                <div class="wishlist-item" data-id="${item.book._id}">
                    <div class="row align-items-center">
                        <div class="col-md-2 col-4">
                            <img src="${item.book.coverImage}" alt="${item.book.title}" class="wishlist-item-img">
                        </div>
                        <div class="col-md-4 col-8">
                            <h5 class="wishlist-item-title">${item.book.title}</h5>
                            <p class="wishlist-item-author">by ${item.book.author}</p>
                            <div class="book-rating">
                                <span class="rating-stars">${getStarRating(item.book.averageRating)}</span>
                                <span class="rating-text">(${item.book.totalReviews} reviews)</span>
                            </div>
                        </div>
                        <div class="col-md-2 col-6">
                            <p class="wishlist-item-price">₹${item.book.price}</p>
                        </div>
                        <div class="col-md-2 col-6">
                            <button class="btn btn-primary btn-sm add-to-cart-btn">
                                <i class="fas fa-shopping-cart me-1"></i>Add to Cart
                            </button>
                        </div>
                        <div class="col-md-2 col-6">
                            <button class="btn btn-outline-danger btn-sm remove-from-wishlist-btn">
                                <i class="fas fa-trash"></i> Remove
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
        }
        document.getElementById('main-content').classList.remove('hidden');
        document.body.classList.remove('body-hidden');
        updateWishlistCount();
    };

    const showEmptyWishlist = () => {
        if (wishlistContainer) {
            wishlistContainer.innerHTML = '';
        }
        if (emptyWishlistMessage) {
            emptyWishlistMessage.style.display = 'block';
        }
        document.getElementById('main-content').classList.remove('hidden');
        document.body.classList.remove('body-hidden');
        updateWishlistCount();
    };

    const addToCart = async (bookId) => {
        try {
            await apiCall('/cart/add', {
                method: 'POST',
                body: JSON.stringify({ bookId, quantity: 1 })
            });

            showToast('Book added to cart! 🛒', 'success');
        } catch (error) {
            showToast('Failed to add to cart', 'error');
        }
        updateWishlistCount();
    };

    const removeFromWishlist = async (bookId) => {
        try {
            await apiCall(`/wishlist/${bookId}`, { method: 'DELETE' });
            
            wishlistItems = wishlistItems.filter(item => item.book._id !== bookId);
            localStorage.setItem('wishlist', JSON.stringify(wishlistItems.map(item => item.book._id)));
            renderWishlist();
            showToast('Removed from wishlist', 'success');
        } catch (error) {
            showToast('Failed to remove from wishlist', 'error');
        }
        updateWishlistCount();
    };

    const getStarRating = (rating) => {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        
        return '★'.repeat(fullStars) + (hasHalfStar ? '☆' : '') + '☆'.repeat(emptyStars);
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

    // Update the wishlist count badge in the header
    const updateWishlistCount = () => {
        if (wishlistCountBadge) {
            wishlistCountBadge.textContent = wishlistItems.length;
        }
    };

    // --- Event Listeners ---

    // Add event listener for 'Continue Shopping' button
    const continueShoppingBtn = document.getElementById('continue-shopping-btn');
    if (continueShoppingBtn) {
        continueShoppingBtn.addEventListener('click', () => {
            window.location.href = '/';
        });
    }

    document.body.addEventListener('click', async (e) => {
        const wishlistItem = e.target.closest('.wishlist-item');
        if (!wishlistItem) return;

        const bookId = wishlistItem.dataset.id;

        if (e.target.classList.contains('add-to-cart-btn') || e.target.closest('.add-to-cart-btn')) {
            await addToCart(bookId);
        }

        if (e.target.classList.contains('remove-from-wishlist-btn') || e.target.closest('.remove-from-wishlist-btn')) {
            await removeFromWishlist(bookId);
        }
    });

    // Initialize
    loadWishlist();
    updateWishlistCount();
}); 
