document.addEventListener('DOMContentLoaded', () => {
    // This script will be specific to the shop page functionality.

    // --- API Configuration ---
    const API_BASE_URL = '/api';

    const booksGrid = document.getElementById('shop-grid');
    const categoryFilter = document.getElementById('category-filter');
    const priceFilter = document.getElementById('price-filter');
    const sortSelect = document.getElementById('sort-filter');
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const priceValue = document.getElementById('price-value');
    const clearFiltersBtn = document.getElementById('clear-filters');

    let currentBooks = [];
    let filteredBooks = [];

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

    // Health check function
    const checkServerHealth = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/health`);
            if (!response.ok) return false;
            const data = await response.json();
            console.log('Server health check:', data);
            return data.success === true;
        } catch (error) {
            console.error('Server health check failed:', error);
            return false;
        }
    };

    const getStarRating = (rating) => {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        
        return '★'.repeat(fullStars) + (hasHalfStar ? '☆' : '') + '☆'.repeat(emptyStars);
    };

    const renderBooks = (books) => {
        console.log('Rendering books:', books);
        console.log('Books grid element:', booksGrid);
        
        if (!booksGrid) {
            console.error('Books grid element not found!');
            return;
        }

        if (books.length === 0) {
            console.log('No books to render');
            booksGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <h3>No books found</h3>
                    <p>Try adjusting your filters or search terms.</p>
                </div>
            `;
            document.getElementById('main-content').classList.remove('hidden');
            document.body.classList.remove('body-hidden');
            return;
        }

        console.log('Rendering', books.length, 'books');
        const booksHTML = books.map(book => {
            // Determine badge type
            let badge = '';
            if (book.isFeatured) {
                badge = '<span class="badge badge-featured">Featured</span>';
            } else if (book.isNewRelease) {
                badge = '<span class="badge badge-new">New</span>';
            } else if (book.isBestSeller) {
                badge = '<span class="badge badge-bestseller">Bestseller</span>';
            }

            // Stock status indicator
            let stockStatus = '';
            if (book.stockQuantity === 0) {
                stockStatus = '<span class="stock-status stock-out">Out of Stock</span>';
            } else if (book.stockQuantity <= 5) {
                stockStatus = '<span class="stock-status stock-low">Low Stock</span>';
            }

            // Calculate discount if original price exists
            let priceDisplay = `<div class="shop-book-card-price">₹${book.price}</div>`;
            if (book.originalPrice && book.originalPrice > book.price) {
                const discount = Math.round(((book.originalPrice - book.price) / book.originalPrice) * 100);
                priceDisplay = `
                    <div class="price-display">
                        <span class="current-price">₹${book.price}</span>
                        <span class="original-price">₹${book.originalPrice}</span>
                        <span class="discount-badge">-${discount}%</span>
                    </div>
                `;
            }

            // Check if book is in wishlist
            const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
            const isInWishlist = wishlist.includes(book._id);
            const heartIcon = isInWishlist ? 'fas' : 'far';

            const bookHTML = `
                <div class="shop-book-card" data-id="${book._id}">
                    ${badge}
                    ${stockStatus}
                    <a href="/book.html?id=${book._id}">
                        <img src="${book.coverImage}" alt="${book.title}" class="shop-book-card-img">
                        <div class="shop-book-card-body">
                            <div>
                                <h5 class="shop-book-card-title">${book.title}</h5>
                                <p class="shop-book-card-author">by ${book.author}</p>
                                <div class="shop-book-rating">
                                    <span class="shop-rating-stars">${getStarRating(book.averageRating)}</span>
                                </div>
                                ${priceDisplay}
                            </div>
                        </div>
                    </a>
                    <div class="shop-book-card-actions">
                        <button class="btn btn-primary btn-sm add-to-cart-btn" ${book.stockQuantity === 0 ? 'disabled' : ''}>
                            Add to Cart
                        </button>
                        <button class="btn btn-outline-danger btn-sm add-to-wishlist-btn">
                            <i class="${heartIcon} fa-heart"></i>
                        </button>
                    </div>
                </div>
            `;
            
            console.log(`Generated HTML for book ${book.title}:`, bookHTML);
            return bookHTML;
        }).join('');
        
        console.log('Generated HTML:', booksHTML);
        booksGrid.innerHTML = booksHTML;
        document.getElementById('main-content').classList.remove('hidden');
        document.body.classList.remove('body-hidden');
    };

    const filterBooks = () => {
        let filtered = [...currentBooks];

        // Category filter - get selected radio button
        const selectedCategoryRadio = document.querySelector('input[name="category"]:checked');
        const selectedCategory = selectedCategoryRadio ? selectedCategoryRadio.value : 'all';
        if (selectedCategory && selectedCategory !== 'all') {
            filtered = filtered.filter(book => book.category.toLowerCase() === selectedCategory.toLowerCase());
        }

        // Price filter
        const selectedPrice = priceFilter.value;
        if (selectedPrice) {
            filtered = filtered.filter(book => book.price <= selectedPrice);
        }

        // Rating filter - get selected radio button
        const selectedRatingRadio = document.querySelector('input[name="rating"]:checked');
        const selectedRating = selectedRatingRadio ? selectedRatingRadio.value : 'all';
        if (selectedRating && selectedRating !== 'all') {
            filtered = filtered.filter(book => book.averageRating >= parseInt(selectedRating));
        }

        // Search filter
        const searchQuery = searchInput ? searchInput.value.toLowerCase().trim() : '';
        if (searchQuery) {
            filtered = filtered.filter(book => 
                book.title.toLowerCase().includes(searchQuery) ||
                book.author.toLowerCase().includes(searchQuery) ||
                (book.category && book.category.toLowerCase().includes(searchQuery))
            );
        }

        // Sort
        const sortBy = sortSelect ? sortSelect.value : 'default';
        switch (sortBy) {
            case 'price-asc':
                filtered.sort((a, b) => a.price - b.price);
                break;
            case 'price-desc':
                filtered.sort((a, b) => b.price - a.price);
                break;
            case 'title-asc':
                filtered.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'title-desc':
                filtered.sort((a, b) => b.title.localeCompare(a.title));
                break;
            case 'rating-desc':
                filtered.sort((a, b) => b.averageRating - a.averageRating);
                break;
            default:
                // Default sort by featured/creation date
                filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }

        filteredBooks = filtered;
        renderBooks(filteredBooks);
        updateResultsCount();
    };

    const updateResultsCount = () => {
        const resultsCount = document.getElementById('results-count');
        if (resultsCount) {
            resultsCount.textContent = filteredBooks.length;
        }
    };

    const loadBooks = async () => {
        console.log('loadBooks function called');
        console.log('booksGrid element:', booksGrid);
        
        try {
            console.log('Checking server health...');
            const isHealthy = await checkServerHealth();
            console.log('Server health:', isHealthy);
            if (!isHealthy) {
                console.log('Server not healthy, but continuing...');
                // Don't throw error, just continue with mock data or show message
            }
        } catch (error) {
            console.error('Server health check failed:', error);
            // Continue anyway
        }
        
        try {
            console.log('Loading books...');
            
            // Show loading state
            if (booksGrid) {
                booksGrid.innerHTML = `
                    <div class="loading-state">
                        <div class="loading-spinner"></div>
                        <h3>Loading books...</h3>
                        <p>Please wait while we fetch your books.</p>
                    </div>
                `;
            }
            
            // Check server health first
            const isHealthy = await checkServerHealth();
            if (!isHealthy) {
                console.log('Server not available, using mock data');
                // Use mock data for testing
                currentBooks = [
                    {
                        _id: '1',
                        title: 'Sample Book 1',
                        author: 'Author 1',
                        price: 299,
                        image: '/images/book1.jpg',
                        category: 'fiction',
                        rating: 4.5,
                        description: 'A sample book for testing'
                    },
                    {
                        _id: '2',
                        title: 'Sample Book 2',
                        author: 'Author 2',
                        price: 399,
                        image: '/images/book2.jpg',
                        category: 'business',
                        rating: 4.2,
                        description: 'Another sample book for testing'
                    },
                    {
                        _id: '3',
                        title: 'Sample Book 3',
                        author: 'Author 3',
                        price: 199,
                        image: '/images/book3.jpg',
                        category: 'self-help',
                        rating: 4.8,
                        description: 'Third sample book for testing'
                    }
                ];
            } else {
                const response = await apiCall('/books');
                console.log('API Response:', response);
                currentBooks = response.data.books || [];
            }
            
            console.log('Current books:', currentBooks);
            
            filteredBooks = [...currentBooks];
            console.log('Filtered books:', filteredBooks);
            
            renderBooks(filteredBooks);
            updateResultsCount();
        } catch (error) {
            console.error('Failed to load books:', error);
            if (booksGrid) {
                booksGrid.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-exclamation-triangle"></i>
                        <h3>Failed to load books</h3>
                        <p>Please try again later.</p>
                        <p class="text-muted">Error: ${error.message}</p>
                    </div>
                `;
                document.getElementById('main-content').classList.remove('hidden');
                document.body.classList.remove('body-hidden');
            }
        }
    };

    // --- Event Listeners ---

    // Category filter changes
    document.querySelectorAll('input[name="category"]').forEach(radio => {
        radio.addEventListener('change', filterBooks);
    });

    // Rating filter changes
    document.querySelectorAll('input[name="rating"]').forEach(radio => {
        radio.addEventListener('change', filterBooks);
    });

    // Price filter changes
    if (priceFilter) {
        priceFilter.addEventListener('input', (e) => {
            if (priceValue) {
                priceValue.textContent = `₹${e.target.value}`;
            }
        });
        priceFilter.addEventListener('change', filterBooks);
    }

    // Sort changes
    if (sortSelect) {
        sortSelect.addEventListener('change', filterBooks);
    }

    // Search functionality
    if (searchButton) {
        searchButton.addEventListener('click', filterBooks);
    }
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                filterBooks();
            }
        });
    }

    // Clear filters
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', () => {
            // Reset all filters
            document.querySelectorAll('input[name="category"]').forEach(radio => {
                radio.checked = radio.value === 'all';
            });
            document.querySelectorAll('input[name="rating"]').forEach(radio => {
                radio.checked = radio.value === 'all';
            });
            if (priceFilter) {
                priceFilter.value = 500;
                if (priceValue) priceValue.textContent = '₹500';
            }
            if (sortSelect) sortSelect.value = 'default';
            if (searchInput) searchInput.value = '';
            
            filterBooks();
        });
    }

    // Add to Cart / Wishlist
    document.body.addEventListener('click', async (e) => {
        const bookCard = e.target.closest('.shop-book-card');
        if (!bookCard) return;

        const bookId = bookCard.dataset.id;

        if (e.target.classList.contains('add-to-cart-btn') || e.target.closest('.add-to-cart-btn')) {
            await addToCart(bookId);
        }
        if (e.target.classList.contains('add-to-wishlist-btn') || e.target.closest('.add-to-wishlist-btn')) {
            await toggleWishlist(bookId, e.target.closest('.add-to-wishlist-btn')?.querySelector('i'));
        }
    });

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

            // Update cart count in header
            const cartCount = document.getElementById('cart-count');
            if (cartCount) {
                const currentCount = parseInt(cartCount.textContent) || 0;
                cartCount.textContent = currentCount + 1;
            }

            showToast('Book added to cart! 🛒', 'success');
        } catch (error) {
            showToast('Failed to add to cart', 'error');
        }
    };

    const toggleWishlist = async (bookId, heartIcon) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                showToast('Please login/signup to add items', 'error');
                return;
            }

            const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
            const index = wishlist.indexOf(bookId);
            if (index > -1) {
                // Remove from wishlist
                await apiCall(`/wishlist/${bookId}`, { method: 'DELETE' });
                wishlist.splice(index, 1);
                if (heartIcon) {
                    heartIcon.classList.replace('fas', 'far');
                    heartIcon.style.color = '';
                    showToast('Removed from wishlist 💔', 'info');
                }
            } else {
                // Add to wishlist
                await apiCall('/wishlist/add', {
                    method: 'POST',
                    body: JSON.stringify({ bookId })
                });
                wishlist.push(bookId);
                if (heartIcon) {
                    heartIcon.classList.replace('far', 'fas');
                    heartIcon.style.color = '#e94e77'; // Pink color
                    showToast('Added to wishlist 💖', 'info');
                }
            }
            localStorage.setItem('wishlist', JSON.stringify(wishlist));
            // Update wishlist count in header
            const wishlistCount = document.getElementById('wishlist-count');
            if (wishlistCount) {
                wishlistCount.textContent = wishlist.length;
            }
        } catch (error) {
            showToast('Failed to update wishlist', 'error');
        }
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

    // Check for search query from homepage
    const searchQuery = sessionStorage.getItem('searchQuery');
    if (searchQuery && searchInput) {
        searchInput.value = searchQuery;
        sessionStorage.removeItem('searchQuery');
        filterBooks();
    }

    // Handle URL parameters for category filtering
    const handleURLParameters = () => {
        const urlParams = new URLSearchParams(window.location.search);
        const categoryParam = urlParams.get('category');
        const searchParam = urlParams.get('search');
        
        // Handle category parameter
        if (categoryParam) {
            // Set the category filter
            const categoryRadios = document.querySelectorAll('input[name="category"]');
            categoryRadios.forEach(radio => {
                if (radio.value.toLowerCase() === categoryParam.toLowerCase()) {
                    radio.checked = true;
                }
            });
            
            // If no exact match, try to find a similar category
            if (!document.querySelector('input[name="category"]:checked')) {
                const categoryMap = {
                    'fiction': 'fiction',
                    'business': 'business',
                    'self help': 'self-help',
                    'science': 'science'
                };
                
                const mappedCategory = categoryMap[categoryParam.toLowerCase()];
                if (mappedCategory) {
                    const matchingRadio = document.querySelector(`input[name="category"][value="${mappedCategory}"]`);
                    if (matchingRadio) {
                        matchingRadio.checked = true;
                    }
                }
            }
        }
        
        // Handle search parameter
        if (searchParam && searchInput) {
            searchInput.value = searchParam;
        }
        
        // Apply filters if any parameters were found
        if (categoryParam || searchParam) {
            filterBooks();
        }
    };

    // Initialize URL parameter handling
    handleURLParameters();

    // Initialize
    loadBooks();

    // Enhanced Filter sidebar toggle
    const filterBtn = document.getElementById('filter-toggle-btn');
    const filterSidebar = document.querySelector('.filter-sidebar');
    const filterBackdrop = document.querySelector('.filter-backdrop');
    const applyFiltersBtn = document.getElementById('apply-filters');
    
    if (filterBtn && filterSidebar && filterBackdrop) {
        function openSidebar() {
            console.log('Opening sidebar...');
            console.log('Before - filterSidebar classes:', filterSidebar.classList);
            filterSidebar.classList.add('open');
            filterBackdrop.classList.add('show');
            document.body.style.overflow = 'hidden';
            console.log('After - filterSidebar classes:', filterSidebar.classList);
            console.log('Filter sidebar computed style:', window.getComputedStyle(filterSidebar).left);
        }
        function closeSidebar() {
            filterSidebar.classList.remove('open');
            filterBackdrop.classList.remove('show');
            document.body.style.overflow = '';
        }
        
        filterBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            console.log('Filter button clicked!');
            console.log('Filter sidebar:', filterSidebar);
            console.log('Filter sidebar classes:', filterSidebar.classList);
            if (filterSidebar.classList.contains('open')) {
                console.log('Closing sidebar');
                closeSidebar();
            } else {
                console.log('Opening sidebar');
                openSidebar();
            }
        });
        
        filterBackdrop.addEventListener('click', closeSidebar);
        
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') closeSidebar();
        });
        
        const closeBtn = document.querySelector('.close-filter-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', closeSidebar);
        }
        
        // Apply filters button
        if (applyFiltersBtn) {
            applyFiltersBtn.addEventListener('click', () => {
                filterBooks();
                closeSidebar();
            });
        }
    }

    // Enhanced price range display
    const priceDisplay = document.getElementById('price-display');

    if (priceFilter && priceDisplay && priceValue) {
        priceFilter.addEventListener('input', () => {
            const value = priceFilter.value;
            priceValue.textContent = `₹${value}`;
            priceDisplay.textContent = `₹0 - ₹${value}`;
        });
    }

    // Author search functionality
    const authorSearch = document.getElementById('author-search');
    const authorFilter = document.getElementById('author-filter');

    if (authorSearch && authorFilter) {
        authorSearch.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const options = authorFilter.querySelectorAll('option');
            
            options.forEach(option => {
                if (option.value === 'all') return;
                const authorName = option.textContent.toLowerCase();
                option.style.display = authorName.includes(searchTerm) ? 'block' : 'none';
            });
        });
    }

    // Enhanced filter option interactions
    const filterOptions = document.querySelectorAll('.filter-option');
    filterOptions.forEach(option => {
        option.addEventListener('click', (e) => {
            const input = option.querySelector('input');
            if (input && input.type === 'radio') {
                input.checked = true;
                input.dispatchEvent(new Event('change'));
            } else if (input && input.type === 'checkbox') {
                input.checked = !input.checked;
                input.dispatchEvent(new Event('change'));
            }
        });
    });
}); 