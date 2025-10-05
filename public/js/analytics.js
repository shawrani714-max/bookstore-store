/**
 * Client-side Analytics Tracking
 * Tracks user interactions and sends data to analytics service
 */

class ClientAnalytics {
  constructor() {
    this.userId = null;
    this.sessionId = this.generateSessionId();
    this.pageStartTime = Date.now();
    this.isInitialized = false;
    
    this.init();
  }

  init() {
    // Get user ID from localStorage or session
    this.userId = localStorage.getItem('userId') || sessionStorage.getItem('userId');
    
    // Track page view
    this.trackPageView();
    
    // Track user interactions
    this.trackUserInteractions();
    
    // Track performance
    this.trackPerformance();
    
    this.isInitialized = true;
  }

  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Track page view
  trackPageView() {
    const page = window.location.pathname + window.location.search;
    const title = document.title;
    
    this.sendEvent('pageview', {
      page: page,
      title: title,
      referrer: document.referrer,
      sessionId: this.sessionId,
      timestamp: new Date().toISOString()
    });
  }

  // Track user interactions
  trackUserInteractions() {
    // Track clicks on important elements
    document.addEventListener('click', (event) => {
      const target = event.target;
      const element = target.closest('[data-track]');
      
      if (element) {
        const trackData = element.dataset.track;
        const trackType = element.dataset.trackType || 'click';
        
        this.trackEvent(trackType, {
          element: trackData,
          text: target.textContent?.trim(),
          href: target.href,
          className: target.className
        });
      }
    });

    // Track form submissions
    document.addEventListener('submit', (event) => {
      const form = event.target;
      if (form.dataset.track) {
        this.trackEvent('form_submit', {
          form: form.dataset.track,
          action: form.action,
          method: form.method
        });
      }
    });

    // Track scroll depth
    this.trackScrollDepth();

    // Track time on page
    this.trackTimeOnPage();
  }

  // Track scroll depth
  trackScrollDepth() {
    let maxScrollDepth = 0;
    const scrollThresholds = [25, 50, 75, 90, 100];
    const trackedThresholds = new Set();

    const trackScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollDepth = Math.round((scrollTop / documentHeight) * 100);

      if (scrollDepth > maxScrollDepth) {
        maxScrollDepth = scrollDepth;
      }

      scrollThresholds.forEach(threshold => {
        if (scrollDepth >= threshold && !trackedThresholds.has(threshold)) {
          trackedThresholds.add(threshold);
          this.trackEvent('scroll_depth', {
            depth: threshold,
            page: window.location.pathname
          });
        }
      });
    };

    window.addEventListener('scroll', this.throttle(trackScroll, 1000));
  }

  // Track time on page
  trackTimeOnPage() {
    const trackTime = () => {
      const timeOnPage = Date.now() - this.pageStartTime;
      
      this.trackEvent('time_on_page', {
        time: timeOnPage,
        page: window.location.pathname
      });
    };

    // Track on page unload
    window.addEventListener('beforeunload', trackTime);
    
    // Track every 30 seconds
    setInterval(trackTime, 30000);
  }

  // Track performance metrics
  trackPerformance() {
    if ('performance' in window) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          const perfData = performance.getEntriesByType('navigation')[0];
          
          if (perfData) {
            this.trackEvent('page_performance', {
              loadTime: perfData.loadEventEnd - perfData.loadEventStart,
              domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
              firstPaint: this.getFirstPaint(),
              page: window.location.pathname
            });
          }
        }, 1000);
      });
    }
  }

  // Get first paint time
  getFirstPaint() {
    if ('performance' in window) {
      const paintEntries = performance.getEntriesByType('paint');
      const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
      return firstPaint ? firstPaint.startTime : null;
    }
    return null;
  }

  // Track custom event
  trackEvent(eventName, parameters = {}) {
    this.sendEvent('event', {
      event: eventName,
      ...parameters,
      sessionId: this.sessionId,
      timestamp: new Date().toISOString()
    });
  }

  // Track e-commerce events
  trackPurchase(orderData) {
    this.trackEvent('purchase', {
      transaction_id: orderData.orderNumber,
      value: orderData.total,
      currency: 'INR',
      items: orderData.items
    });
  }

  trackAddToCart(bookData) {
    this.trackEvent('add_to_cart', {
      item_id: bookData._id,
      item_name: bookData.title,
      item_category: 'Books',
      value: bookData.price,
      currency: 'INR'
    });
  }

  trackRemoveFromCart(bookData) {
    this.trackEvent('remove_from_cart', {
      item_id: bookData._id,
      item_name: bookData.title,
      item_category: 'Books',
      value: bookData.price,
      currency: 'INR'
    });
  }

  trackAddToWishlist(bookData) {
    this.trackEvent('add_to_wishlist', {
      item_id: bookData._id,
      item_name: bookData.title,
      item_category: 'Books',
      value: bookData.price,
      currency: 'INR'
    });
  }

  trackRemoveFromWishlist(bookData) {
    this.trackEvent('remove_from_wishlist', {
      item_id: bookData._id,
      item_name: bookData.title,
      item_category: 'Books',
      value: bookData.price,
      currency: 'INR'
    });
  }

  trackSearch(query, resultsCount) {
    this.trackEvent('search', {
      search_term: query,
      results_count: resultsCount
    });
  }

  trackBookView(bookData) {
    this.trackEvent('view_item', {
      item_id: bookData._id,
      item_name: bookData.title,
      item_category: 'Books',
      value: bookData.price,
      currency: 'INR'
    });
  }

  // Send event to analytics service
  async sendEvent(type, data) {
    try {
      const response = await fetch('/api/analytics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        console.warn('Analytics tracking failed:', response.statusText);
      }
    } catch (error) {
      console.warn('Analytics tracking error:', error);
    }
  }

  // Throttle function
  throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  // Set user ID
  setUserId(userId) {
    this.userId = userId;
    localStorage.setItem('userId', userId);
  }

  // Clear user ID
  clearUserId() {
    this.userId = null;
    localStorage.removeItem('userId');
  }
}

// Initialize analytics when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.clientAnalytics = new ClientAnalytics();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ClientAnalytics;
}
