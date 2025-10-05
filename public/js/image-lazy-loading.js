/**
 * Image Lazy Loading Utility
 * Optimizes page load performance by loading images only when they're needed
 */

class ImageLazyLoader {
  constructor(options = {}) {
    this.options = {
      rootMargin: '50px 0px',
      threshold: 0.1,
      placeholder: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PC9zdmc+',
      loadingClass: 'lazy-loading',
      loadedClass: 'lazy-loaded',
      errorClass: 'lazy-error',
      ...options
    };
    
    this.observer = null;
    this.init();
  }

  init() {
    // Check if IntersectionObserver is supported
    if (!('IntersectionObserver' in window)) {
      // Fallback: load all images immediately
      this.loadAllImages();
      return;
    }

    // Create intersection observer
    this.observer = new IntersectionObserver(
      this.handleIntersection.bind(this),
      {
        rootMargin: this.options.rootMargin,
        threshold: this.options.threshold
      }
    );

    // Observe all lazy images
    this.observeImages();
  }

  observeImages() {
    const lazyImages = document.querySelectorAll('img[data-src]');
    lazyImages.forEach(img => {
      this.observer.observe(img);
    });
  }

  handleIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        this.loadImage(entry.target);
        this.observer.unobserve(entry.target);
      }
    });
  }

  loadImage(img) {
    // Add loading class
    img.classList.add(this.options.loadingClass);
    
    // Set placeholder
    if (!img.src || img.src === '') {
      img.src = this.options.placeholder;
    }

    // Create new image to preload
    const imageLoader = new Image();
    
    imageLoader.onload = () => {
      // Image loaded successfully
      img.src = imageLoader.src;
      img.classList.remove(this.options.loadingClass);
      img.classList.add(this.options.loadedClass);
      
      // Remove data-src attribute
      img.removeAttribute('data-src');
      
      // Trigger custom event
      img.dispatchEvent(new CustomEvent('lazyLoaded', {
        detail: { img }
      }));
    };

    imageLoader.onerror = () => {
      // Image failed to load
      img.classList.remove(this.options.loadingClass);
      img.classList.add(this.options.errorClass);
      
      // Set error placeholder
      img.src = this.getErrorPlaceholder();
      
      // Trigger custom event
      img.dispatchEvent(new CustomEvent('lazyError', {
        detail: { img }
      }));
    };

    // Start loading
    imageLoader.src = img.dataset.src;
  }

  loadAllImages() {
    const lazyImages = document.querySelectorAll('img[data-src]');
    lazyImages.forEach(img => {
      this.loadImage(img);
    });
  }

  getErrorPlaceholder() {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBmb3VuZDwvdGV4dD48L3N2Zz4=';
  }

  // Public method to add new images to observe
  observe(img) {
    if (this.observer) {
      this.observer.observe(img);
    } else {
      this.loadImage(img);
    }
  }

  // Public method to refresh observer
  refresh() {
    if (this.observer) {
      this.observer.disconnect();
      this.observeImages();
    }
  }

  // Public method to destroy observer
  destroy() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
}

// Responsive Image Lazy Loader
class ResponsiveImageLazyLoader extends ImageLazyLoader {
  constructor(options = {}) {
    super(options);
    this.breakpoints = {
      mobile: 480,
      tablet: 768,
      desktop: 1024,
      large: 1200
    };
  }

  getResponsiveSrc(img) {
    const dataSrc = img.dataset.src;
    if (!dataSrc) return null;

    const screenWidth = window.innerWidth;
    let size = 'large';

    if (screenWidth <= this.breakpoints.mobile) {
      size = 'mobile';
    } else if (screenWidth <= this.breakpoints.tablet) {
      size = 'tablet';
    } else if (screenWidth <= this.breakpoints.desktop) {
      size = 'desktop';
    }

    // Check if responsive sources are available
    const responsiveSrc = img.dataset[`src${size.charAt(0).toUpperCase() + size.slice(1)}`];
    return responsiveSrc || dataSrc;
  }

  loadImage(img) {
    // Add loading class
    img.classList.add(this.options.loadingClass);
    
    // Set placeholder
    if (!img.src || img.src === '') {
      img.src = this.options.placeholder;
    }

    // Get responsive source
    const src = this.getResponsiveSrc(img);
    if (!src) {
      this.handleImageError(img);
      return;
    }

    // Create new image to preload
    const imageLoader = new Image();
    
    imageLoader.onload = () => {
      // Image loaded successfully
      img.src = imageLoader.src;
      img.classList.remove(this.options.loadingClass);
      img.classList.add(this.options.loadedClass);
      
      // Remove data-src attributes
      img.removeAttribute('data-src');
      Object.keys(this.breakpoints).forEach(size => {
        img.removeAttribute(`data-src${size.charAt(0).toUpperCase() + size.slice(1)}`);
      });
      
      // Trigger custom event
      img.dispatchEvent(new CustomEvent('lazyLoaded', {
        detail: { img, src }
      }));
    };

    imageLoader.onerror = () => {
      this.handleImageError(img);
    };

    // Start loading
    imageLoader.src = src;
  }

  handleImageError(img) {
    // Image failed to load
    img.classList.remove(this.options.loadingClass);
    img.classList.add(this.options.errorClass);
    
    // Set error placeholder
    img.src = this.getErrorPlaceholder();
    
    // Trigger custom event
    img.dispatchEvent(new CustomEvent('lazyError', {
      detail: { img }
    }));
  }
}

// Progressive Image Loading
class ProgressiveImageLoader extends ImageLazyLoader {
  constructor(options = {}) {
    super({
      placeholder: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PC9zdmc+',
      ...options
    });
  }

  loadImage(img) {
    // Add loading class
    img.classList.add(this.options.loadingClass);
    
    // Set placeholder
    if (!img.src || img.src === '') {
      img.src = this.options.placeholder;
    }

    const dataSrc = img.dataset.src;
    const lowQualitySrc = img.dataset.lowQualitySrc;

    // Load low quality image first if available
    if (lowQualitySrc) {
      const lowQualityLoader = new Image();
      
      lowQualityLoader.onload = () => {
        img.src = lowQualityLoader.src;
        img.classList.add('progressive-loaded');
        
        // Then load high quality image
        this.loadHighQualityImage(img, dataSrc);
      };

      lowQualityLoader.onerror = () => {
        // If low quality fails, try high quality directly
        this.loadHighQualityImage(img, dataSrc);
      };

      lowQualityLoader.src = lowQualitySrc;
    } else {
      // No low quality image, load high quality directly
      this.loadHighQualityImage(img, dataSrc);
    }
  }

  loadHighQualityImage(img, src) {
    const highQualityLoader = new Image();
    
    highQualityLoader.onload = () => {
      // High quality image loaded
      img.src = highQualityLoader.src;
      img.classList.remove(this.options.loadingClass);
      img.classList.add(this.options.loadedClass);
      
      // Remove data attributes
      img.removeAttribute('data-src');
      img.removeAttribute('data-low-quality-src');
      
      // Trigger custom event
      img.dispatchEvent(new CustomEvent('lazyLoaded', {
        detail: { img, src }
      }));
    };

    highQualityLoader.onerror = () => {
      // High quality image failed
      img.classList.remove(this.options.loadingClass);
      img.classList.add(this.options.errorClass);
      
      // Set error placeholder
      img.src = this.getErrorPlaceholder();
      
      // Trigger custom event
      img.dispatchEvent(new CustomEvent('lazyError', {
        detail: { img }
      }));
    };

    highQualityLoader.src = src;
  }
}

// Initialize lazy loading when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Initialize different types of lazy loaders
  window.imageLazyLoader = new ImageLazyLoader();
  window.responsiveImageLazyLoader = new ResponsiveImageLazyLoader();
  window.progressiveImageLoader = new ProgressiveImageLoader();

  // Add CSS for loading states
  const style = document.createElement('style');
  style.textContent = `
    .lazy-loading {
      opacity: 0.7;
      transition: opacity 0.3s ease;
    }
    
    .lazy-loaded {
      opacity: 1;
      transition: opacity 0.3s ease;
    }
    
    .lazy-error {
      opacity: 0.5;
    }
    
    .progressive-loaded {
      filter: blur(5px);
      transition: filter 0.3s ease;
    }
    
    .lazy-loaded.progressive-loaded {
      filter: blur(0);
    }
  `;
  document.head.appendChild(style);
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ImageLazyLoader,
    ResponsiveImageLazyLoader,
    ProgressiveImageLoader
  };
}
