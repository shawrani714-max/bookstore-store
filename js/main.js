document.addEventListener('DOMContentLoaded', () => {

    // --- API Configuration ---
    const API_BASE_URL = '/api';
    
    // --- Core Functions for localStorage ---
    const getFromStorage = (key) => JSON.parse(localStorage.getItem(key)) || [];
    const saveToStorage = (key, data) => localStorage.setItem(key, JSON.stringify(data));

    let cart = getFromStorage('cart');
    let wishlist = getFromStorage('wishlist');

    // --- Affiliate Tracking ---
    const trackAffiliate = () => {
        const urlParams = new URLSearchParams(window.location.search);
        const affiliateCode = urlParams.get('ref');
        
        if (affiliateCode) {
            // Store affiliate code in localStorage for the session
            localStorage.setItem('affiliateCode', affiliateCode);
            
            // Track affiliate click
            fetch(`${API_BASE_URL}/affiliate/track`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    affiliateCode,
                    referrer: document.referrer,
                    userAgent: navigator.userAgent,
                    timestamp: new Date().toISOString()
                })
            }).catch(error => console.log('Affiliate tracking failed:', error));
            
            // Show affiliate notification
            showToast(`You were referred by an affiliate! Use code ${affiliateCode} for special offers.`, 'info');
        }
    };

    // Initialize affiliate tracking
    trackAffiliate();

    // --- API Helper Functions ---
    const apiCall = async (endpoint, options = {}) => {
        try {
            const token = localStorage.getItem('token');
            const affiliateCode = localStorage.getItem('affiliateCode');
            
            const headers = {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` }),
                ...(affiliateCode && { 'X-Affiliate-Code': affiliateCode }),
                ...options.headers
            };
            
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                headers,
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

    // --- Toast Notification System ---
    const showToast = (message, type = 'success') => {
        const toast = document.createElement('div');
        toast.className = `toast-notification ${type}`;
        toast.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'} me-2"></i>
            ${message}
        `;
        document.body.appendChild(toast);
        
        // Show toast
        setTimeout(() => toast.classList.add('show'), 100);
        
        // Remove toast after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => document.body.removeChild(toast), 300);
        }, 3000);
    };

    // --- UI Update Functions ---
    const updateCartCount = () => {
        const cartCount = document.getElementById('cart-count');
        // Always get the latest cart from localStorage
        const cart = getFromStorage('cart');
        if (cartCount) {
            cartCount.textContent = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        }
    };

    const updateWishlistCount = () => {
        const wishlistCount = document.getElementById('wishlist-count');
        // Always get the latest wishlist from localStorage
        const wishlist = getFromStorage('wishlist');
        if (wishlistCount) {
            wishlistCount.textContent = wishlist.length;
        }
    };
    
    // --- Render Featured Books ---
    const renderFeaturedBooks = async () => {
        const featuredGrid = document.getElementById('featured-books-grid');
        if (!featuredGrid) return;
        
        try {
            // Fetch featured books from API
            const response = await apiCall('/books/featured');
            const featuredBooks = response.data.books || [];
            const wishlist = getFromStorage('wishlist');

            featuredGrid.innerHTML = featuredBooks.map(book => {
                const isInWishlist = wishlist.includes(book._id);
                const heartIcon = isInWishlist ? 'fas' : 'far';
                const heartStyle = isInWishlist ? 'style="color: #e94e77;"' : '';
                return `
                <div class="col-lg-3 col-md-4 col-sm-6 mb-4">
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
                        <div class="book-card-actions">
                            <button class="btn btn-primary btn-sm add-to-cart-btn">Add to Cart</button>
                            <button class="btn btn-outline-danger btn-sm add-to-wishlist-btn">
                                <i class="${heartIcon} fa-heart" ${heartStyle}></i>
                            </button>
                        </div>
                    </div>
                </div>
                `;
            }).join('');
        } catch (error) {
            console.error('Failed to load featured books:', error);
            featuredGrid.innerHTML = '<div class="col-12 text-center"><p>Failed to load featured books</p></div>';
        }
    };

    const getStarRating = (rating) => {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        
        return '★'.repeat(fullStars) + (hasHalfStar ? '☆' : '') + '☆'.repeat(emptyStars);
    };

    // --- Event Listeners ---

    // Add to Cart / Wishlist
    document.body.addEventListener('click', async (e) => {
        const bookCard = e.target.closest('.book-card');
        if (!bookCard) return;

        const bookId = bookCard.dataset.id;

        if (e.target.classList.contains('add-to-cart-btn')) {
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

            // Update local cart
            const existingItem = cart.find(item => item.id === bookId);
            if (existingItem) {
                existingItem.quantity++;
            } else {
                cart.push({ id: bookId, quantity: 1 });
            }
            saveToStorage('cart', cart);
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
                showToast('Please login/signup to add items', 'error');
                return;
            }

            // Always get the latest wishlist from localStorage
            let wishlist = getFromStorage('wishlist');
            const index = wishlist.indexOf(bookId);
            if (index > -1) {
                // Remove from wishlist
                await apiCall(`/wishlist/${bookId}`, { method: 'DELETE' });
                wishlist.splice(index, 1);
                if (heartIcon) {
                    heartIcon.classList.replace('fas', 'far');
                    heartIcon.style.color = '';
                }
                showToast('Removed from wishlist 💔', 'info');
            } else {
                // Add to wishlist only if not already present
                await apiCall('/wishlist/add', {
                    method: 'POST',
                    body: JSON.stringify({ bookId })
                });
                if (!wishlist.includes(bookId)) {
                    wishlist.push(bookId);
                }
                if (heartIcon) {
                    heartIcon.classList.replace('far', 'fas');
                    heartIcon.style.color = '#e94e77'; // Pink color
                }
                showToast('Added to wishlist! ❤️', 'success');
            }
            saveToStorage('wishlist', wishlist);
            updateWishlistCount();
        } catch (error) {
            showToast('Failed to update wishlist', 'error');
        }
    };

    // --- Search Functionality ---
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');

    const performSearch = () => {
        const query = searchInput.value.toLowerCase().trim();
        if (!query) return;

        // Store search query and redirect to shop page
        sessionStorage.setItem('searchQuery', query);
        window.location.href = '/shop';
    };

    if (searchButton) {
        searchButton.addEventListener('click', performSearch);
    }

    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }

    // Back to Top Button
    const backToTopBtn = document.getElementById('back-to-top-btn');
    window.onscroll = () => {
        if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
            backToTopBtn.style.display = "block";
        } else {
            backToTopBtn.style.display = "none";
        }
    };
    backToTopBtn.addEventListener('click', () => {
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
    });

    // Newsletter Popup (show once per session)
    const newsletterPopup = document.getElementById('newsletter-popup');
    const closePopupBtn = document.querySelector('.popup-close-btn');

    if (newsletterPopup && !sessionStorage.getItem('newsletterShown')) {
        setTimeout(() => {
            newsletterPopup.style.display = 'flex';
            sessionStorage.setItem('newsletterShown', 'true');
        }, 1000);
    }

    if (closePopupBtn) {
        closePopupBtn.addEventListener('click', () => {
            newsletterPopup.style.display = 'none';
        });
    }

    // Newsletter form submission
    const newsletterForm = document.querySelector('#newsletter-popup form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = newsletterForm.querySelector('input[type="email"]').value;
            if (email) {
                showToast('Thank you for subscribing! 📧', 'success');
                newsletterForm.reset();
                newsletterPopup.style.display = 'none';
            }
        });
    }

    // Search Bar Toggle
    const searchIcon = document.querySelector('.search-icon');
    const searchBar = document.querySelector('.search-bar-container');
    if (searchIcon && searchBar) {
        searchIcon.addEventListener('click', (e) => {
            e.preventDefault();
            searchBar.style.display = searchBar.style.display === 'none' ? 'block' : 'none';
            if (searchBar.style.display === 'block') {
                searchInput.focus();
            }
        });
    }

    // --- Scroll Animations ---
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    // Observe all fade-in elements
    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

    // --- Theme settings loader for website ---
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
            if (settings.buttonColor) root.style.setProperty('--button-color', settings.buttonColor);
            if (settings.headingColor) root.style.setProperty('--heading-color', settings.headingColor);
            try { localStorage.setItem('adminThemeSettings', JSON.stringify(settings)); } catch (_) {}
        } catch (e) {
            // fallback: do nothing, use default CSS
        }
    }

    // Load theme settings on every page load
    loadThemeSettingsForSite();

    // --- Hero banners ---
    async function renderHeroBanners() {
        try {
            const res = await fetch('/api/banners');
            const { success, data } = await res.json();
            if (!success || !Array.isArray(data) || data.length === 0) return;
            const hero = document.querySelector('.hero-section');
            if (!hero) return;
            hero.innerHTML = `
                <div class="hero-slider">
                    ${data.map((b, i) => `
                        <div class="hero-slide${i===0?' active':''}" style="--bg:url('data:image/gif;base64,R0lGODlhAQABAAAAACw=')">
                            ${b.overlay ? `<div style=\"position:absolute;inset:0;background:linear-gradient(135deg, rgba(0,0,0,.45), rgba(0,0,0,.25))\"></div>` : ''}
                            <img src="${b.imageUrl || ''}" alt="" loading="lazy" style="display:none" onload="this.parentElement.style.setProperty('--bg', 'url(\'${b.imageUrl || ''}\')');this.remove();" />
                            <div class="container text-center" style="position:relative;color:${b.textColor || '#fff'};">
                                ${b.title ? `<h1 class="display-3 fw-bold mb-3" style="color:${b.textColor || '#fff'}">${b.title}</h1>` : ''}
                                ${b.subtitle ? `<p class="lead mb-4" style="color:${b.textColor || '#fff'}">${b.subtitle}</p>` : ''}
                                ${b.ctaText && b.ctaLink ? `<a href="${b.ctaLink}" class="btn btn-primary btn-lg" style="color:${b.ctaColor||'#fff'};background:${b.ctaBg||'var(--primary-color)'}">${b.ctaText}</a>` : ''}
                            </div>
                        </div>
                    `).join('')}
                    <button class="hero-prev" aria-label="Previous">‹</button>
                    <button class="hero-next" aria-label="Next">›</button>
                    <div class="hero-dots">${data.map((_,i)=>`<button class="hero-dot${i===0?' active':''}" aria-label="Go to slide ${i+1}"></button>`).join('')}</div>
                </div>`;

            // Basic slider logic
            const slides = Array.from(hero.querySelectorAll('.hero-slide'));
            const dots = Array.from(hero.querySelectorAll('.hero-dot'));
            let idx = 0;
            const show = (n) => {
                slides.forEach((s, i) => s.classList.toggle('active', i === n));
                if (dots.length) dots.forEach((d,i)=>d.classList.toggle('active', i===n));
            };
            const next = () => { idx = (idx + 1) % slides.length; show(idx); };
            const prev = () => { idx = (idx - 1 + slides.length) % slides.length; show(idx); };
            hero.querySelector('.hero-next').addEventListener('click', next);
            hero.querySelector('.hero-prev').addEventListener('click', prev);
            let timer = setInterval(next, 5000);
            const reset = () => { clearInterval(timer); timer = setInterval(next, 5000); };
            hero.querySelector('.hero-next').addEventListener('click', reset);
            hero.querySelector('.hero-prev').addEventListener('click', reset);
            if (dots.length) dots.forEach((d,i)=> d.addEventListener('click', ()=>{ idx=i; show(idx); reset(); }));

            // Swipe support
            let startX=null; let swiping=false;
            hero.addEventListener('touchstart', (e)=>{ startX = e.touches[0].clientX; swiping=true; }, {passive:true});
            hero.addEventListener('touchend', (e)=>{ if(!swiping) return; const dx = e.changedTouches[0].clientX - startX; if (Math.abs(dx) > 40) { dx<0 ? next() : prev(); reset(); } swiping=false; startX=null; });
        } catch (_) {}
    }

    // --- Initializations ---
    renderHeroBanners();
    renderFeaturedBooks();
    updateCartCount();
    updateWishlistCount();

    // Wishlist icon click handler for homepage featured books
    document.addEventListener('click', async (e) => {
        if (e.target.closest('.add-to-wishlist-btn')) {
            const bookCard = e.target.closest('.book-card');
            if (!bookCard) return;
            const bookId = bookCard.dataset.id;
            const heartIcon = bookCard.querySelector('.add-to-wishlist-btn i');
            await toggleWishlist(bookId, heartIcon);
        }
    });

    // Check for search results on shop page
    if (window.location.pathname.includes('shop.html')) {
        const searchResults = sessionStorage.getItem('searchResults');
        const searchQuery = sessionStorage.getItem('searchQuery');
        
        if (searchResults && searchQuery) {
            // Clear the stored search data
            sessionStorage.removeItem('searchResults');
            sessionStorage.removeItem('searchQuery');
            
            // Show search results notification
            setTimeout(() => {
                showToast(`Showing results for "${searchQuery}"`, 'info');
            }, 1000);
        }
    }
});