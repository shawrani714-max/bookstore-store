/**
 * Payment Performance Optimization
 * Optimizes payment processing performance and user experience
 */

class PaymentPerformance {
    constructor() {
        this.performanceMetrics = this.initializeMetrics();
        this.optimizationStrategies = this.initializeStrategies();
        this.setupPerformanceOptimizations();
    }

    initializeMetrics() {
        return {
            pageLoadTime: 0,
            paymentFormLoadTime: 0,
            paymentProcessingTime: 0,
            apiResponseTime: 0,
            imageLoadTime: 0,
            scriptLoadTime: 0,
            cssLoadTime: 0,
            totalBlockingTime: 0,
            firstContentfulPaint: 0,
            largestContentfulPaint: 0,
            cumulativeLayoutShift: 0
        };
    }

    initializeStrategies() {
        return {
            lazyLoading: true,
            codeSplitting: true,
            imageOptimization: true,
            caching: true,
            compression: true,
            minification: true,
            cdn: true,
            preloading: true,
            prefetching: true,
            serviceWorker: true
        };
    }

    setupPerformanceOptimizations() {
        this.measurePerformance();
        this.optimizeResourceLoading();
        this.optimizeImages();
        this.optimizeScripts();
        this.optimizeCSS();
        this.setupCaching();
        this.setupCompression();
        this.setupCDN();
        this.setupPreloading();
        this.setupServiceWorker();
        this.optimizePaymentFlow();
        this.setupPerformanceMonitoring();
    }

    // Performance measurement
    measurePerformance() {
        // Measure page load performance
        window.addEventListener('load', () => {
            this.measurePageLoadPerformance();
        });

        // Measure payment form performance
        this.measurePaymentFormPerformance();

        // Measure API performance
        this.measureAPIPerformance();

        // Measure user interactions
        this.measureUserInteractions();
    }

    measurePageLoadPerformance() {
        const navigation = performance.getEntriesByType('navigation')[0];
        if (navigation) {
            this.performanceMetrics.pageLoadTime = navigation.loadEventEnd - navigation.loadEventStart;
            this.performanceMetrics.firstContentfulPaint = this.getFirstContentfulPaint();
            this.performanceMetrics.largestContentfulPaint = this.getLargestContentfulPaint();
            this.performanceMetrics.cumulativeLayoutShift = this.getCumulativeLayoutShift();
        }

        // Measure resource loading times
        this.measureResourceLoadingTimes();

        // Send performance data
        this.sendPerformanceData();
    }

    measurePaymentFormPerformance() {
        const form = document.getElementById('payment-form');
        if (form) {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.entryType === 'measure' && entry.name.includes('payment')) {
                        this.performanceMetrics.paymentFormLoadTime = entry.duration;
                    }
                }
            });

            observer.observe({ entryTypes: ['measure'] });

            // Measure form rendering
            performance.mark('payment-form-start');
            // Form rendering happens here
            performance.mark('payment-form-end');
            performance.measure('payment-form-render', 'payment-form-start', 'payment-form-end');
        }
    }

    measureAPIPerformance() {
        // Intercept fetch requests
        const originalFetch = window.fetch;
        window.fetch = async (...args) => {
            const startTime = performance.now();
            const response = await originalFetch(...args);
            const endTime = performance.now();
            
            this.performanceMetrics.apiResponseTime = endTime - startTime;
            
            return response;
        };
    }

    measureUserInteractions() {
        // Measure click response time
        document.addEventListener('click', (e) => {
            if (e.target.closest('.payment-button, .payment-method')) {
                const startTime = performance.now();
                
                // Measure until next frame
                requestAnimationFrame(() => {
                    const endTime = performance.now();
                    this.trackInteractionPerformance('click', endTime - startTime);
                });
            }
        });

        // Measure form input response time
        document.addEventListener('input', (e) => {
            if (e.target.closest('#payment-form')) {
                const startTime = performance.now();
                
                // Measure validation time
                setTimeout(() => {
                    const endTime = performance.now();
                    this.trackInteractionPerformance('input', endTime - startTime);
                }, 0);
            }
        });
    }

    trackInteractionPerformance(type, duration) {
        if (!this.performanceMetrics.interactions) {
            this.performanceMetrics.interactions = {};
        }
        
        if (!this.performanceMetrics.interactions[type]) {
            this.performanceMetrics.interactions[type] = [];
        }
        
        this.performanceMetrics.interactions[type].push(duration);
    }

    getFirstContentfulPaint() {
        const paintEntries = performance.getEntriesByType('paint');
        const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
        return fcp ? fcp.startTime : 0;
    }

    getLargestContentfulPaint() {
        const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
        return lcpEntries.length > 0 ? lcpEntries[lcpEntries.length - 1].startTime : 0;
    }

    getCumulativeLayoutShift() {
        let clsValue = 0;
        const clsEntries = performance.getEntriesByType('layout-shift');
        
        for (const entry of clsEntries) {
            if (!entry.hadRecentInput) {
                clsValue += entry.value;
            }
        }
        
        return clsValue;
    }

    measureResourceLoadingTimes() {
        const resources = performance.getEntriesByType('resource');
        
        resources.forEach(resource => {
            if (resource.name.includes('.js')) {
                this.performanceMetrics.scriptLoadTime += resource.duration;
            } else if (resource.name.includes('.css')) {
                this.performanceMetrics.cssLoadTime += resource.duration;
            } else if (resource.name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) {
                this.performanceMetrics.imageLoadTime += resource.duration;
            }
        });
    }

    // Resource loading optimization
    optimizeResourceLoading() {
        this.optimizeScriptLoading();
        this.optimizeCSSLoading();
        this.optimizeFontLoading();
        this.optimizeThirdPartyResources();
    }

    optimizeScriptLoading() {
        // Defer non-critical scripts
        const scripts = document.querySelectorAll('script[src]');
        scripts.forEach(script => {
            if (!script.hasAttribute('defer') && !script.hasAttribute('async')) {
                // Check if script is critical
                if (!this.isCriticalScript(script.src)) {
                    script.defer = true;
                }
            }
        });

        // Load scripts on demand
        this.setupOnDemandScriptLoading();
    }

    isCriticalScript(src) {
        const criticalScripts = [
            'payment-security.js',
            'payment-gateway.js',
            'checkout.js'
        ];
        
        return criticalScripts.some(critical => src.includes(critical));
    }

    setupOnDemandScriptLoading() {
        // Load analytics script on demand
        this.loadScriptOnDemand('analytics.js', () => {
            // Load when user interacts with payment form
            const form = document.getElementById('payment-form');
            if (form) {
                form.addEventListener('focus', () => {
                    this.loadScript('/js/analytics.js');
                }, { once: true });
            }
        });

        // Load chart script on demand
        this.loadScriptOnDemand('chart.min.js', () => {
            // Load when admin dashboard is accessed
            if (window.location.pathname.includes('admin')) {
                this.loadScript('/js/chart.min.js');
            }
        });
    }

    loadScriptOnDemand(src, condition) {
        if (condition()) {
            this.loadScript(src);
        }
    }

    loadScript(src) {
        return new Promise((resolve, reject) => {
            if (document.querySelector(`script[src="${src}"]`)) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    optimizeCSSLoading() {
        // Inline critical CSS
        this.inlineCriticalCSS();

        // Defer non-critical CSS
        this.deferNonCriticalCSS();

        // Remove unused CSS
        this.removeUnusedCSS();
    }

    inlineCriticalCSS() {
        const criticalCSS = `
            .payment-container { display: block; }
            .payment-form { display: block; }
            .payment-method { display: block; }
            .btn { display: inline-block; }
        `;

        const style = document.createElement('style');
        style.textContent = criticalCSS;
        document.head.insertBefore(style, document.head.firstChild);
    }

    deferNonCriticalCSS() {
        const nonCriticalCSS = [
            'admin.css',
            'affiliate.css',
            'invoice.css'
        ];

        nonCriticalCSS.forEach(css => {
            const link = document.querySelector(`link[href*="${css}"]`);
            if (link) {
                link.media = 'print';
                link.onload = () => {
                    link.media = 'all';
                };
            }
        });
    }

    removeUnusedCSS() {
        // In a real implementation, this would use a tool like PurgeCSS
        // For now, we'll just remove obviously unused CSS
        const unusedSelectors = [
            '.admin-only',
            '.affiliate-only',
            '.invoice-only'
        ];

        if (!window.location.pathname.includes('admin')) {
            this.removeCSSSelectors(unusedSelectors);
        }
    }

    removeCSSSelectors(selectors) {
        // Remove unused CSS selectors
        selectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                element.style.display = 'none';
            });
        });
    }

    optimizeFontLoading() {
        // Preload critical fonts
        this.preloadFonts();

        // Use font-display: swap
        this.setupFontDisplaySwap();

        // Subset fonts
        this.setupFontSubsetting();
    }

    preloadFonts() {
        const criticalFonts = [
            '/fonts/roboto-regular.woff2',
            '/fonts/roboto-bold.woff2'
        ];

        criticalFonts.forEach(font => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = font;
            link.as = 'font';
            link.type = 'font/woff2';
            link.crossOrigin = 'anonymous';
            document.head.appendChild(link);
        });
    }

    setupFontDisplaySwap() {
        const style = document.createElement('style');
        style.textContent = `
            @font-face {
                font-family: 'Roboto';
                src: url('/fonts/roboto-regular.woff2') format('woff2');
                font-display: swap;
            }
        `;
        document.head.appendChild(style);
    }

    setupFontSubsetting() {
        // Use font subsetting to reduce font file size
        // This would typically be done at build time
    }

    optimizeThirdPartyResources() {
        // Optimize third-party scripts
        this.optimizeThirdPartyScripts();

        // Use resource hints
        this.setupResourceHints();
    }

    optimizeThirdPartyScripts() {
        // Load third-party scripts asynchronously
        const thirdPartyScripts = [
            'https://checkout.razorpay.com/v1/checkout.js',
            'https://www.googletagmanager.com/gtag/js'
        ];

        thirdPartyScripts.forEach(src => {
            const script = document.createElement('script');
            script.src = src;
            script.async = true;
            script.defer = true;
            document.head.appendChild(script);
        });
    }

    setupResourceHints() {
        // DNS prefetch
        this.addDNSPrefetch('checkout.razorpay.com');
        this.addDNSPrefetch('api.razorpay.com');

        // Preconnect
        this.addPreconnect('https://checkout.razorpay.com');
        this.addPreconnect('https://api.razorpay.com');

        // Prefetch
        this.addPrefetch('/api/books/featured');
        this.addPrefetch('/images/logo.png');
    }

    addDNSPrefetch(hostname) {
        const link = document.createElement('link');
        link.rel = 'dns-prefetch';
        link.href = `//${hostname}`;
        document.head.appendChild(link);
    }

    addPreconnect(url) {
        const link = document.createElement('link');
        link.rel = 'preconnect';
        link.href = url;
        document.head.appendChild(link);
    }

    addPrefetch(url) {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = url;
        document.head.appendChild(link);
    }

    // Image optimization
    optimizeImages() {
        this.setupLazyLoading();
        this.optimizeImageFormats();
        this.setupResponsiveImages();
        this.compressImages();
    }

    setupLazyLoading() {
        // Use Intersection Observer for lazy loading
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy-loading');
                    observer.unobserve(img);
                }
            });
        });

        // Observe all lazy images
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }

    optimizeImageFormats() {
        // Use WebP format when supported
        if (this.supportsWebP()) {
            this.convertImagesToWebP();
        }

        // Use AVIF format when supported
        if (this.supportsAVIF()) {
            this.convertImagesToAVIF();
        }
    }

    supportsWebP() {
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    }

    supportsAVIF() {
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        return canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0;
    }

    convertImagesToWebP() {
        document.querySelectorAll('img[src$=".jpg"], img[src$=".png"]').forEach(img => {
            const webpSrc = img.src.replace(/\.(jpg|png)$/, '.webp');
            img.src = webpSrc;
        });
    }

    convertImagesToAVIF() {
        document.querySelectorAll('img[src$=".jpg"], img[src$=".png"]').forEach(img => {
            const avifSrc = img.src.replace(/\.(jpg|png)$/, '.avif');
            img.src = avifSrc;
        });
    }

    setupResponsiveImages() {
        // Use srcset for responsive images
        document.querySelectorAll('img').forEach(img => {
            if (!img.hasAttribute('srcset')) {
                const src = img.src;
                const srcset = `
                    ${src.replace('.jpg', '-320w.jpg')} 320w,
                    ${src.replace('.jpg', '-640w.jpg')} 640w,
                    ${src.replace('.jpg', '-1024w.jpg')} 1024w,
                    ${src.replace('.jpg', '-1920w.jpg')} 1920w
                `;
                img.srcset = srcset;
                img.sizes = '(max-width: 320px) 320px, (max-width: 640px) 640px, (max-width: 1024px) 1024px, 1920px';
            }
        });
    }

    compressImages() {
        // Use image compression for uploaded images
        this.setupImageCompression();
    }

    setupImageCompression() {
        // This would typically use a library like compressorjs
        // For now, we'll just set up the structure
        const fileInputs = document.querySelectorAll('input[type="file"][accept*="image"]');
        fileInputs.forEach(input => {
            input.addEventListener('change', (e) => {
                this.compressImageFile(e.target.files[0]);
            });
        });
    }

    compressImageFile(file) {
        // Mock image compression
        console.log('Compressing image:', file.name);
        // In real implementation, use a compression library
    }

    // Caching optimization
    setupCaching() {
        this.setupBrowserCaching();
        this.setupApplicationCaching();
        this.setupCDNCaching();
    }

    setupBrowserCaching() {
        // Set cache headers for static resources
        this.setCacheHeaders();

        // Use ETags
        this.setupETags();

        // Use Last-Modified headers
        this.setupLastModified();
    }

    setCacheHeaders() {
        // This would typically be done server-side
        // For now, we'll just set up the structure
        const staticResources = [
            '/css/style.css',
            '/js/main.js',
            '/images/logo.png'
        ];

        staticResources.forEach(resource => {
            // Set cache headers
            this.setResourceCacheHeaders(resource);
        });
    }

    setResourceCacheHeaders(resource) {
        // Mock cache header setting
        console.log('Setting cache headers for:', resource);
    }

    setupETags() {
        // Use ETags for cache validation
        // This would typically be done server-side
    }

    setupLastModified() {
        // Use Last-Modified headers
        // This would typically be done server-side
    }

    setupApplicationCaching() {
        // Use localStorage for application data
        this.setupLocalStorageCaching();

        // Use sessionStorage for session data
        this.setupSessionStorageCaching();

        // Use IndexedDB for large data
        this.setupIndexedDBCaching();
    }

    setupLocalStorageCaching() {
        // Cache user preferences
        this.cacheUserPreferences();

        // Cache payment methods
        this.cachePaymentMethods();

        // Cache book data
        this.cacheBookData();
    }

    cacheUserPreferences() {
        const preferences = {
            theme: localStorage.getItem('theme'),
            language: localStorage.getItem('language'),
            currency: localStorage.getItem('currency')
        };

        // Cache for 24 hours
        const cacheKey = 'user_preferences';
        const cacheData = {
            data: preferences,
            timestamp: Date.now(),
            expiry: 24 * 60 * 60 * 1000 // 24 hours
        };

        localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    }

    cachePaymentMethods() {
        // Cache payment methods for faster loading
        const paymentMethods = document.querySelectorAll('.payment-method');
        const methodsData = Array.from(paymentMethods).map(method => ({
            id: method.dataset.method,
            name: method.textContent,
            icon: method.querySelector('i').className
        }));

        const cacheKey = 'payment_methods';
        const cacheData = {
            data: methodsData,
            timestamp: Date.now(),
            expiry: 60 * 60 * 1000 // 1 hour
        };

        localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    }

    cacheBookData() {
        // Cache featured books data
        fetch('/api/books/featured')
            .then(response => response.json())
            .then(data => {
                const cacheKey = 'featured_books';
                const cacheData = {
                    data: data,
                    timestamp: Date.now(),
                    expiry: 30 * 60 * 1000 // 30 minutes
                };

                localStorage.setItem(cacheKey, JSON.stringify(cacheData));
            });
    }

    setupSessionStorageCaching() {
        // Cache checkout data
        this.cacheCheckoutData();

        // Cache cart data
        this.cacheCartData();
    }

    cacheCheckoutData() {
        const checkoutData = {
            items: JSON.parse(sessionStorage.getItem('cart') || '[]'),
            total: this.calculateTotal(),
            shipping: this.calculateShipping(),
            tax: this.calculateTax()
        };

        sessionStorage.setItem('checkout_data', JSON.stringify(checkoutData));
    }

    cacheCartData() {
        const cartData = {
            items: JSON.parse(sessionStorage.getItem('cart') || '[]'),
            total: this.calculateTotal(),
            itemCount: this.getItemCount()
        };

        sessionStorage.setItem('cart_data', JSON.stringify(cartData));
    }

    setupIndexedDBCaching() {
        // Use IndexedDB for large data caching
        this.setupIndexedDB();
    }

    setupIndexedDB() {
        const request = indexedDB.open('PaymentCache', 1);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            
            // Create object stores
            if (!db.objectStoreNames.contains('books')) {
                db.createObjectStore('books', { keyPath: 'id' });
            }
            
            if (!db.objectStoreNames.contains('orders')) {
                db.createObjectStore('orders', { keyPath: 'id' });
            }
        };

        request.onsuccess = (event) => {
            this.db = event.target.result;
        };
    }

    setupCDNCaching() {
        // Use CDN for static resources
        this.setupCDNResources();
    }

    setupCDNResources() {
        const cdnResources = [
            'https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css',
            'https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js',
            'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
        ];

        cdnResources.forEach(resource => {
            this.loadCDNResource(resource);
        });
    }

    loadCDNResource(resource) {
        if (resource.endsWith('.css')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = resource;
            document.head.appendChild(link);
        } else if (resource.endsWith('.js')) {
            const script = document.createElement('script');
            script.src = resource;
            script.defer = true;
            document.head.appendChild(script);
        }
    }

    // Compression optimization
    setupCompression() {
        this.setupGzipCompression();
        this.setupBrotliCompression();
        this.setupImageCompression();
    }

    setupGzipCompression() {
        // Enable gzip compression for text resources
        // This would typically be done server-side
    }

    setupBrotliCompression() {
        // Enable Brotli compression for better compression ratios
        // This would typically be done server-side
    }

    // CDN optimization
    setupCDN() {
        this.setupCDNResources();
        this.setupCDNHealthCheck();
        this.setupCDNFailover();
    }

    setupCDNHealthCheck() {
        // Check CDN health
        setInterval(() => {
            this.checkCDNHealth();
        }, 60000); // Check every minute
    }

    checkCDNHealth() {
        fetch('https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css', {
            method: 'HEAD'
        })
        .then(response => {
            if (!response.ok) {
                this.handleCDNFailure();
            }
        })
        .catch(error => {
            this.handleCDNFailure();
        });
    }

    handleCDNFailure() {
        // Fallback to local resources
        this.loadLocalResources();
    }

    loadLocalResources() {
        // Load local copies of CDN resources
        const localResources = [
            '/css/bootstrap.min.css',
            '/js/bootstrap.bundle.min.js',
            '/css/font-awesome.min.css'
        ];

        localResources.forEach(resource => {
            this.loadLocalResource(resource);
        });
    }

    loadLocalResource(resource) {
        if (resource.endsWith('.css')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = resource;
            document.head.appendChild(link);
        } else if (resource.endsWith('.js')) {
            const script = document.createElement('script');
            script.src = resource;
            script.defer = true;
            document.head.appendChild(script);
        }
    }

    setupCDNFailover() {
        // Setup failover to different CDN providers
        this.setupCDNFailoverProviders();
    }

    setupCDNFailoverProviders() {
        const cdnProviders = [
            'https://cdn.jsdelivr.net',
            'https://cdnjs.cloudflare.com',
            'https://unpkg.com'
        ];

        this.cdnProviders = cdnProviders;
        this.currentCDNIndex = 0;
    }

    // Preloading optimization
    setupPreloading() {
        this.preloadCriticalResources();
        this.preloadUserIntent();
        this.preloadNextPage();
    }

    preloadCriticalResources() {
        // Preload critical resources
        const criticalResources = [
            '/css/style.css',
            '/js/main.js',
            '/js/checkout.js',
            '/images/logo.png'
        ];

        criticalResources.forEach(resource => {
            this.preloadResource(resource);
        });
    }

    preloadResource(resource) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = resource;
        
        if (resource.endsWith('.css')) {
            link.as = 'style';
        } else if (resource.endsWith('.js')) {
            link.as = 'script';
        } else if (resource.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) {
            link.as = 'image';
        }
        
        document.head.appendChild(link);
    }

    preloadUserIntent() {
        // Preload based on user behavior
        this.setupIntentPreloading();
    }

    setupIntentPreloading() {
        // Preload when user hovers over payment button
        const paymentButton = document.querySelector('.payment-button');
        if (paymentButton) {
            paymentButton.addEventListener('mouseenter', () => {
                this.preloadPaymentResources();
            });
        }

        // Preload when user focuses on payment form
        const paymentForm = document.getElementById('payment-form');
        if (paymentForm) {
            paymentForm.addEventListener('focus', () => {
                this.preloadPaymentResources();
            });
        }
    }

    preloadPaymentResources() {
        const paymentResources = [
            '/js/payment-gateway.js',
            '/js/payment-security.js',
            '/css/payment.css'
        ];

        paymentResources.forEach(resource => {
            this.preloadResource(resource);
        });
    }

    preloadNextPage() {
        // Preload likely next page
        this.setupNextPagePreloading();
    }

    setupNextPagePreloading() {
        // Preload order success page when payment is processing
        const paymentForm = document.getElementById('payment-form');
        if (paymentForm) {
            paymentForm.addEventListener('submit', () => {
                this.preloadResource('/order-success.html');
            });
        }
    }

    // Service Worker optimization
    setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            this.registerServiceWorker();
        }
    }

    registerServiceWorker() {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('Service Worker registered:', registration);
            })
            .catch(error => {
                console.error('Service Worker registration failed:', error);
            });
    }

    // Payment flow optimization
    optimizePaymentFlow() {
        this.optimizeFormValidation();
        this.optimizePaymentProcessing();
        this.optimizeErrorHandling();
        this.optimizeSuccessFlow();
    }

    optimizeFormValidation() {
        // Use debounced validation
        this.setupDebouncedValidation();

        // Use client-side validation
        this.setupClientSideValidation();

        // Use progressive validation
        this.setupProgressiveValidation();
    }

    setupDebouncedValidation() {
        const inputs = document.querySelectorAll('#payment-form input');
        inputs.forEach(input => {
            let timeout;
            input.addEventListener('input', () => {
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    this.validateField(input);
                }, 300);
            });
        });
    }

    validateField(field) {
        // Client-side validation
        const value = field.value;
        const type = field.type;
        const required = field.hasAttribute('required');

        let isValid = true;
        let errorMessage = '';

        if (required && !value) {
            isValid = false;
            errorMessage = 'This field is required';
        } else if (type === 'email' && value && !this.isValidEmail(value)) {
            isValid = false;
            errorMessage = 'Invalid email address';
        } else if (type === 'tel' && value && !this.isValidPhone(value)) {
            isValid = false;
            errorMessage = 'Invalid phone number';
        }

        this.showFieldValidation(field, isValid, errorMessage);
    }

    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    isValidPhone(phone) {
        return /^[0-9]{10}$/.test(phone);
    }

    showFieldValidation(field, isValid, errorMessage) {
        field.classList.toggle('is-valid', isValid);
        field.classList.toggle('is-invalid', !isValid);

        let errorElement = field.parentNode.querySelector('.validation-error');
        if (!isValid && !errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'validation-error';
            field.parentNode.appendChild(errorElement);
        }

        if (errorElement) {
            errorElement.textContent = errorMessage;
        }
    }

    setupClientSideValidation() {
        // Use HTML5 validation
        const form = document.getElementById('payment-form');
        if (form) {
            form.setAttribute('novalidate', 'false');
        }
    }

    setupProgressiveValidation() {
        // Validate fields as user progresses
        const fields = document.querySelectorAll('#payment-form input[required]');
        fields.forEach((field, index) => {
            field.addEventListener('blur', () => {
                this.validateField(field);
                this.checkFormProgress();
            });
        });
    }

    checkFormProgress() {
        const fields = document.querySelectorAll('#payment-form input[required]');
        const filledFields = Array.from(fields).filter(field => field.value.trim() !== '');
        const progress = (filledFields.length / fields.length) * 100;

        this.updateFormProgress(progress);
    }

    updateFormProgress(progress) {
        const progressBar = document.querySelector('.form-progress-bar');
        if (progressBar) {
            progressBar.style.width = progress + '%';
        }
    }

    optimizePaymentProcessing() {
        // Use optimistic updates
        this.setupOptimisticUpdates();

        // Use background processing
        this.setupBackgroundProcessing();

        // Use progress indicators
        this.setupProgressIndicators();
    }

    setupOptimisticUpdates() {
        // Update UI immediately, then sync with server
        const paymentButton = document.querySelector('.payment-button');
        if (paymentButton) {
            paymentButton.addEventListener('click', () => {
                this.showOptimisticUpdate();
            });
        }
    }

    showOptimisticUpdate() {
        // Show success state immediately
        const paymentForm = document.getElementById('payment-form');
        if (paymentForm) {
            paymentForm.style.opacity = '0.5';
            paymentForm.style.pointerEvents = 'none';
        }

        // Show processing indicator
        this.showProcessingIndicator();
    }

    showProcessingIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'processing-indicator';
        indicator.innerHTML = `
            <div class="spinner"></div>
            <p>Processing payment...</p>
        `;
        document.body.appendChild(indicator);
    }

    setupBackgroundProcessing() {
        // Use Web Workers for heavy processing
        this.setupWebWorkers();
    }

    setupWebWorkers() {
        // Use Web Worker for payment processing
        if (window.Worker) {
            this.paymentWorker = new Worker('/js/payment-worker.js');
            this.paymentWorker.onmessage = (e) => {
                this.handleWorkerMessage(e.data);
            };
        }
    }

    handleWorkerMessage(data) {
        switch (data.type) {
            case 'payment_processed':
                this.handlePaymentProcessed(data.result);
                break;
            case 'payment_failed':
                this.handlePaymentFailed(data.error);
                break;
        }
    }

    setupProgressIndicators() {
        // Show progress during payment processing
        this.setupPaymentProgress();
    }

    setupPaymentProgress() {
        const progressContainer = document.createElement('div');
        progressContainer.className = 'payment-progress-container';
        progressContainer.innerHTML = `
            <div class="progress-bar">
                <div class="progress-fill"></div>
            </div>
            <div class="progress-text">Processing payment...</div>
        `;
        document.body.appendChild(progressContainer);
    }

    optimizeErrorHandling() {
        // Use graceful error handling
        this.setupGracefulErrorHandling();

        // Use error recovery
        this.setupErrorRecovery();

        // Use error reporting
        this.setupErrorReporting();
    }

    setupGracefulErrorHandling() {
        // Handle errors gracefully without breaking the UI
        window.addEventListener('error', (e) => {
            this.handleGlobalError(e);
        });

        window.addEventListener('unhandledrejection', (e) => {
            this.handleUnhandledRejection(e);
        });
    }

    handleGlobalError(error) {
        console.error('Global error:', error);
        this.reportError(error);
    }

    handleUnhandledRejection(rejection) {
        console.error('Unhandled rejection:', rejection);
        this.reportError(rejection.reason);
    }

    setupErrorRecovery() {
        // Attempt to recover from errors
        this.setupErrorRecoveryStrategies();
    }

    setupErrorRecoveryStrategies() {
        // Retry failed requests
        this.setupRequestRetry();

        // Fallback to cached data
        this.setupCacheFallback();

        // Show user-friendly error messages
        this.setupUserFriendlyErrors();
    }

    setupRequestRetry() {
        // Retry failed API requests
        const originalFetch = window.fetch;
        window.fetch = async (...args) => {
            try {
                return await originalFetch(...args);
            } catch (error) {
                // Retry once
                return await originalFetch(...args);
            }
        };
    }

    setupCacheFallback() {
        // Fallback to cached data when API fails
        this.setupCacheFallbackStrategies();
    }

    setupCacheFallbackStrategies() {
        // Use cached data for critical information
        this.useCachedBookData();
        this.useCachedUserData();
    }

    useCachedBookData() {
        const cachedData = localStorage.getItem('featured_books');
        if (cachedData) {
            const { data, timestamp, expiry } = JSON.parse(cachedData);
            if (Date.now() - timestamp < expiry) {
                this.loadCachedBookData(data);
            }
        }
    }

    loadCachedBookData(data) {
        // Load cached book data
        console.log('Loading cached book data:', data);
    }

    useCachedUserData() {
        const cachedData = localStorage.getItem('user_preferences');
        if (cachedData) {
            const { data, timestamp, expiry } = JSON.parse(cachedData);
            if (Date.now() - timestamp < expiry) {
                this.loadCachedUserData(data);
            }
        }
    }

    loadCachedUserData(data) {
        // Load cached user data
        console.log('Loading cached user data:', data);
    }

    setupUserFriendlyErrors() {
        // Show user-friendly error messages
        this.setupErrorMessages();
    }

    setupErrorMessages() {
        const errorMessages = {
            'NETWORK_ERROR': 'Please check your internet connection and try again.',
            'PAYMENT_FAILED': 'Payment could not be processed. Please try a different payment method.',
            'SERVER_ERROR': 'Server is temporarily unavailable. Please try again later.'
        };

        this.errorMessages = errorMessages;
    }

    setupErrorReporting() {
        // Report errors to monitoring service
        this.setupErrorReportingService();
    }

    setupErrorReportingService() {
        // Send errors to monitoring service
        this.reportError = (error) => {
            const errorReport = {
                message: error.message,
                stack: error.stack,
                timestamp: new Date().toISOString(),
                url: window.location.href,
                userAgent: navigator.userAgent
            };

            fetch('/api/errors', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(errorReport)
            }).catch(err => {
                console.error('Failed to report error:', err);
            });
        };
    }

    optimizeSuccessFlow() {
        // Optimize success page loading
        this.setupSuccessPageOptimization();

        // Use success animations
        this.setupSuccessAnimations();

        // Use success notifications
        this.setupSuccessNotifications();
    }

    setupSuccessPageOptimization() {
        // Preload success page
        this.preloadSuccessPage();

        // Use success page caching
        this.setupSuccessPageCaching();
    }

    preloadSuccessPage() {
        // Preload success page resources
        const successResources = [
            '/order-success.html',
            '/css/success.css',
            '/js/success.js'
        ];

        successResources.forEach(resource => {
            this.preloadResource(resource);
        });
    }

    setupSuccessPageCaching() {
        // Cache success page for faster loading
        this.cacheSuccessPage();
    }

    cacheSuccessPage() {
        // Cache success page content
        const successContent = `
            <div class="success-page">
                <h1>Payment Successful!</h1>
                <p>Your order has been placed successfully.</p>
            </div>
        `;

        sessionStorage.setItem('success_page', successContent);
    }

    setupSuccessAnimations() {
        // Use success animations
        this.setupSuccessAnimationStyles();
    }

    setupSuccessAnimationStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .success-animation {
                animation: successPulse 0.6s ease-in-out;
            }
            
            @keyframes successPulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.1); }
                100% { transform: scale(1); }
            }
        `;
        document.head.appendChild(style);
    }

    setupSuccessNotifications() {
        // Use success notifications
        this.setupSuccessNotificationStyles();
    }

    setupSuccessNotificationStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .success-notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: #10b981;
                color: white;
                padding: 16px;
                border-radius: 8px;
                z-index: 10000;
                animation: slideInRight 0.3s ease;
            }
        `;
        document.head.appendChild(style);
    }

    // Performance monitoring
    setupPerformanceMonitoring() {
        this.setupRealTimeMonitoring();
        this.setupPerformanceAlerts();
        this.setupPerformanceReporting();
    }

    setupRealTimeMonitoring() {
        // Monitor performance in real-time
        this.setupPerformanceObserver();
    }

    setupPerformanceObserver() {
        const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                this.trackPerformanceEntry(entry);
            }
        });

        observer.observe({ entryTypes: ['navigation', 'resource', 'paint', 'layout-shift'] });
    }

    trackPerformanceEntry(entry) {
        switch (entry.entryType) {
            case 'navigation':
                this.trackNavigationPerformance(entry);
                break;
            case 'resource':
                this.trackResourcePerformance(entry);
                break;
            case 'paint':
                this.trackPaintPerformance(entry);
                break;
            case 'layout-shift':
                this.trackLayoutShiftPerformance(entry);
                break;
        }
    }

    trackNavigationPerformance(entry) {
        this.performanceMetrics.pageLoadTime = entry.loadEventEnd - entry.loadEventStart;
        this.performanceMetrics.domContentLoaded = entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart;
    }

    trackResourcePerformance(entry) {
        if (entry.name.includes('.js')) {
            this.performanceMetrics.scriptLoadTime += entry.duration;
        } else if (entry.name.includes('.css')) {
            this.performanceMetrics.cssLoadTime += entry.duration;
        } else if (entry.name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) {
            this.performanceMetrics.imageLoadTime += entry.duration;
        }
    }

    trackPaintPerformance(entry) {
        if (entry.name === 'first-contentful-paint') {
            this.performanceMetrics.firstContentfulPaint = entry.startTime;
        }
    }

    trackLayoutShiftPerformance(entry) {
        if (!entry.hadRecentInput) {
            this.performanceMetrics.cumulativeLayoutShift += entry.value;
        }
    }

    setupPerformanceAlerts() {
        // Alert when performance degrades
        this.setupPerformanceThresholds();
    }

    setupPerformanceThresholds() {
        const thresholds = {
            pageLoadTime: 3000, // 3 seconds
            firstContentfulPaint: 1500, // 1.5 seconds
            largestContentfulPaint: 2500, // 2.5 seconds
            cumulativeLayoutShift: 0.1 // 0.1
        };

        this.performanceThresholds = thresholds;
    }

    setupPerformanceReporting() {
        // Report performance data
        this.setupPerformanceReportingService();
    }

    setupPerformanceReportingService() {
        // Send performance data to monitoring service
        this.sendPerformanceData = () => {
            const performanceData = {
                metrics: this.performanceMetrics,
                thresholds: this.performanceThresholds,
                timestamp: new Date().toISOString(),
                url: window.location.href,
                userAgent: navigator.userAgent
            };

            fetch('/api/performance', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(performanceData)
            }).catch(error => {
                console.error('Failed to send performance data:', error);
            });
        };
    }

    // Utility methods
    calculateTotal() {
        const items = JSON.parse(sessionStorage.getItem('cart') || '[]');
        return items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    calculateShipping() {
        const total = this.calculateTotal();
        return total > 500 ? 0 : 50; // Free shipping over ₹500
    }

    calculateTax() {
        const total = this.calculateTotal();
        return total * 0.18; // 18% GST
    }

    getItemCount() {
        const items = JSON.parse(sessionStorage.getItem('cart') || '[]');
        return items.reduce((count, item) => count + item.quantity, 0);
    }
}

// Export for use in other modules
window.PaymentPerformance = PaymentPerformance;
