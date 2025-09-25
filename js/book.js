document.addEventListener('DOMContentLoaded', () => {

    // --- API Configuration ---
    const API_BASE_URL = '/api';

    const bookDetailsContainer = document.getElementById('book-details-container');

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

    const getBookIdFromURL = () => {
        const params = new URLSearchParams(window.location.search);
        return params.get('id');
    };

    const getStarRating = (rating) => {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        
        return '★'.repeat(fullStars) + (hasHalfStar ? '☆' : '') + '☆'.repeat(emptyStars);
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

    const updateCartCount = () => {
        const cartCount = document.getElementById('cart-count');
        if (cartCount) {
            let count = parseInt(cartCount.textContent) || 0;
            cartCount.textContent = count + 1;
        }
    };

    const updateWishlistCount = (change) => {
        const wishlistCount = document.getElementById('wishlist-count');
        if (wishlistCount) {
            let count = parseInt(wishlistCount.textContent) || 0;
            wishlistCount.textContent = count + change;
        }
    };

    const addToCart = async (bookId) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                showToast('Please login/signup to add items to cart', 'error');
                return;
            }
            await apiCall('/cart/add', {
                method: 'POST',
                body: JSON.stringify({ bookId, quantity: 1 })
            });
            updateCartCount();
            showToast('Book added to cart! 🛒', 'success');
        } catch (error) {
            showToast('Failed to add to cart', 'error');
        }
    };

    const toggleWishlist = async (bookId, heartIcon) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                showToast('Please login to manage wishlist', 'error');
                return;
            }
            const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
            const index = wishlist.indexOf(bookId);
            if (index > -1) {
                await apiCall(`/wishlist/${bookId}`, { method: 'DELETE' });
                wishlist.splice(index, 1);
                if (heartIcon) {
                    heartIcon.classList.replace('fas', 'far');
                    heartIcon.style.color = '';
                }
                updateWishlistCount(-1);
            } else {
                await apiCall('/wishlist/add', {
                    method: 'POST',
                    body: JSON.stringify({ bookId })
                });
                wishlist.push(bookId);
                if (heartIcon) {
                    heartIcon.classList.replace('far', 'fas');
                    heartIcon.style.color = '#e94e77'; // Pink color
                }
                updateWishlistCount(1);
            }
            localStorage.setItem('wishlist', JSON.stringify(wishlist));
        } catch (error) {
            showToast('Failed to update wishlist', 'error');
        }
    };

    const attachButtonListeners = (bookId) => {
        const addToCartBtn = document.querySelector('.add-to-cart-btn');
        const addToWishlistBtn = document.querySelector('.add-to-wishlist-btn');
        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', () => addToCart(bookId));
        }
        if (addToWishlistBtn) {
            addToWishlistBtn.addEventListener('click', (e) => {
                const heartIcon = addToWishlistBtn.querySelector('i');
                toggleWishlist(bookId, heartIcon);
            });
        }
    };

    const renderBookDetails = (book) => {
        if (!bookDetailsContainer) return;
        document.title = `${book.title} - Bookworld India`;
        bookDetailsContainer.innerHTML = `
            <div class="col-md-5">
                <img src="${book.coverImage}" alt="${book.title}" class="book-details-img">
            </div>
            <div class="col-md-7 book-details-content">
                <h1 class="text-gradient">${book.title}</h1>
                <p class="lead">by ${book.author}</p>
                <div class="book-rating mb-3">
                    <span class="rating-stars">${getStarRating(book.averageRating)}</span>
                    <span class="rating-text ms-2">${book.averageRating} (${book.totalReviews} reviews)</span>
                </div>
                <p class="price">₹${book.price}</p>
                <p class="mb-4">${book.description}</p>
                <div class="d-flex gap-2 mt-4">
                    <button class="btn btn-primary btn-lg add-to-cart-btn" data-id="${book._id}">
                        <i class="fas fa-shopping-cart me-2"></i>Add to Cart
                    </button>
                    <button class="btn btn-outline-danger btn-lg add-to-wishlist-btn" data-id="${book._id}">
                        <i class="far fa-heart"></i> Add to Wishlist
                    </button>
                </div>
                <div class="mt-4">
                    <small class="text-muted">
                        <i class="fas fa-tag me-1"></i>Category: ${book.category.charAt(0).toUpperCase() + book.category.slice(1)}
                    </small>
                </div>
            </div>
        `;
        document.getElementById('main-content').classList.remove('hidden');
        document.body.classList.remove('body-hidden');
        attachButtonListeners(book._id);
    };

    const displayNotFound = () => {
        if (!bookDetailsContainer) return;
        bookDetailsContainer.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="fas fa-exclamation-triangle fa-3x text-muted mb-3"></i>
                <h2>Book not found!</h2>
                <p class="text-muted">Sorry, the book you are looking for does not exist.</p>
                <a href="/shop" class="btn btn-primary">Back to Shop</a>
            </div>
        `;
        document.getElementById('main-content').classList.remove('hidden');
        document.body.classList.remove('body-hidden');
    };

    const renderRelatedBooks = (books, currentBookId) => {
        const grid = document.getElementById('related-books-grid');
        if (!grid) return;
        if (!books.length) {
            grid.innerHTML = '<div class="col-12 text-center text-muted">No related books found.</div>';
            return;
        }
        // Get wishlist from localStorage
        const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
        grid.innerHTML = books
            .filter(book => book._id !== currentBookId)
            .slice(0, 4)
            .map(book => {
                const isInWishlist = wishlist.includes(book._id);
                const heartIcon = isInWishlist ? 'fas' : 'far';
                const heartStyle = isInWishlist ? 'style="color: #e94e77;"' : '';
                return `
                <div class="col-md-3 col-sm-6 mb-4">
                    <div class="book-card" data-id="${book._id}">
                        <a href="/book.html?id=${book._id}">
                            <img src="${book.coverImage}" alt="${book.title}" class="book-card-img">
                            <div class="book-card-body">
                                <h5 class="book-card-title">${book.title}</h5>
                                <p class="book-card-author">by ${book.author}</p>
                                <div class="book-rating">
                                    <span class="rating-stars">${getStarRating(book.averageRating)}</span>
                                </div>
                                <p class="book-card-price">₹${book.price}</p>
                            </div>
                        </a>
                        <div class="book-card-actions d-flex justify-content-between align-items-center mt-2">
                            <button class="btn btn-primary btn-sm add-to-cart-btn" data-id="${book._id}">Add to Cart</button>
                            <button class="btn btn-outline-danger btn-sm add-to-wishlist-btn" data-id="${book._id}">
                                <i class="${heartIcon} fa-heart" ${heartStyle}></i>
                            </button>
                        </div>
                    </div>
                </div>
                `;
            }).join('');
        // Add event listeners for Add to Cart and Wishlist in related books
        grid.querySelectorAll('.add-to-cart-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();
                const bookId = btn.getAttribute('data-id');
                await addToCart(bookId);
            });
        });
        grid.querySelectorAll('.add-to-wishlist-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();
                const bookId = btn.getAttribute('data-id');
                const heartIcon = btn.querySelector('i');
                await toggleWishlist(bookId, heartIcon);
            });
        });
    };

    // --- Page Initialization ---
    const bookId = getBookIdFromURL();
    
    if (bookId) {
        // Set book ID for reviews manager
        window.currentBookId = bookId;
        
        // Fetch book details from API
        apiCall(`/books/${bookId}`)
            .then(response => {
                console.log('Book API response:', response);
                const book = response.data.book;
                if (book) {
                    renderBookDetails(book);
                    // Fetch related books by category, excluding the current book
                    apiCall(`/books?category=${book.category}`)
                        .then(relatedRes => {
                            const relatedBooks = relatedRes.data.books || [];
                            renderRelatedBooks(relatedBooks, book._id);
                        })
                        .catch(() => {
                            renderRelatedBooks([], book._id);
                        });
                } else {
                    displayNotFound();
                }
            })
            .catch(error => {
                displayNotFound();
            });
    } else {
        displayNotFound();
    }
}); 
