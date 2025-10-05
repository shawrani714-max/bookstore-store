/**
 * CDN Helper Utility
 * Provides client-side utilities for working with CDN assets
 */

class CDNHelper {
  constructor() {
    this.cdnBaseUrl = window.CDN_BASE_URL || '';
    this.fallbackEnabled = true;
    this.cache = new Map();
  }

  // Get CDN URL for an asset
  getCDNUrl(path) {
    if (!path) return '';
    
    // If path is already a full URL, return as is
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    
    // Remove leading slash if present
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    
    // Return CDN URL
    return this.cdnBaseUrl ? `${this.cdnBaseUrl}/${cleanPath}` : `/${cleanPath}`;
  }

  // Preload CDN assets
  async preloadAssets(assets) {
    const promises = assets.map(asset => this.preloadAsset(asset));
    return Promise.allSettled(promises);
  }

  // Preload single asset
  preloadAsset(asset) {
    return new Promise((resolve, reject) => {
      const url = this.getCDNUrl(asset.path);
      const link = document.createElement('link');
      
      link.rel = 'preload';
      link.href = url;
      link.as = asset.type || 'script';
      
      if (asset.crossorigin) {
        link.crossOrigin = asset.crossorigin;
      }
      
      link.onload = () => resolve({ asset, url, success: true });
      link.onerror = () => {
        if (this.fallbackEnabled) {
          // Try fallback URL
          this.loadFallbackAsset(asset).then(resolve).catch(reject);
        } else {
          reject({ asset, url, success: false });
        }
      };
      
      document.head.appendChild(link);
    });
  }

  // Load fallback asset
  async loadFallbackAsset(asset) {
    const fallbackUrl = asset.fallback || asset.path;
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      
      link.rel = 'preload';
      link.href = fallbackUrl;
      link.as = asset.type || 'script';
      
      link.onload = () => resolve({ asset, url: fallbackUrl, success: true, fallback: true });
      link.onerror = () => reject({ asset, url: fallbackUrl, success: false });
      
      document.head.appendChild(link);
    });
  }

  // Load CSS from CDN
  loadCSS(href, options = {}) {
    const {
      id = null,
      media = 'all',
      crossorigin = null,
      fallback = null
    } = options;

    return new Promise((resolve, reject) => {
      // Check if already loaded
      if (id && document.getElementById(id)) {
        resolve({ success: true, cached: true });
        return;
      }

      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = this.getCDNUrl(href);
      link.media = media;
      
      if (id) link.id = id;
      if (crossorigin) link.crossOrigin = crossorigin;
      
      link.onload = () => resolve({ success: true, url: link.href });
      link.onerror = () => {
        if (this.fallbackEnabled && fallback) {
          link.href = fallback;
          link.onload = () => resolve({ success: true, url: fallback, fallback: true });
          link.onerror = () => reject({ success: false, url: fallback });
        } else {
          reject({ success: false, url: link.href });
        }
      };
      
      document.head.appendChild(link);
    });
  }

  // Load JavaScript from CDN
  loadJS(src, options = {}) {
    const {
      id = null,
      async = true,
      defer = false,
      crossorigin = null,
      fallback = null
    } = options;

    return new Promise((resolve, reject) => {
      // Check if already loaded
      if (id && document.getElementById(id)) {
        resolve({ success: true, cached: true });
        return;
      }

      const script = document.createElement('script');
      script.src = this.getCDNUrl(src);
      script.async = async;
      script.defer = defer;
      
      if (id) script.id = id;
      if (crossorigin) script.crossOrigin = crossorigin;
      
      script.onload = () => resolve({ success: true, url: script.src });
      script.onerror = () => {
        if (this.fallbackEnabled && fallback) {
          script.src = fallback;
          script.onload = () => resolve({ success: true, url: fallback, fallback: true });
          script.onerror = () => reject({ success: false, url: fallback });
        } else {
          reject({ success: false, url: script.src });
        }
      };
      
      document.head.appendChild(script);
    });
  }

  // Load image from CDN with fallback
  loadImage(src, options = {}) {
    const {
      alt = '',
      fallback = null,
      lazy = false
    } = options;

    return new Promise((resolve, reject) => {
      const img = new Image();
      
      if (lazy) {
        img.loading = 'lazy';
      }
      
      img.onload = () => resolve({ success: true, url: img.src, element: img });
      img.onerror = () => {
        if (this.fallbackEnabled && fallback) {
          img.src = fallback;
          img.onload = () => resolve({ success: true, url: fallback, element: img, fallback: true });
          img.onerror = () => reject({ success: false, url: fallback, element: img });
        } else {
          reject({ success: false, url: img.src, element: img });
        }
      };
      
      img.src = this.getCDNUrl(src);
      img.alt = alt;
    });
  }

  // Batch load assets
  async loadAssets(assets) {
    const results = [];
    
    for (const asset of assets) {
      try {
        let result;
        
        switch (asset.type) {
          case 'css':
            result = await this.loadCSS(asset.src, asset.options);
            break;
          case 'js':
            result = await this.loadJS(asset.src, asset.options);
            break;
          case 'image':
            result = await this.loadImage(asset.src, asset.options);
            break;
          default:
            result = await this.preloadAsset(asset);
        }
        
        results.push({ asset, ...result });
      } catch (error) {
        results.push({ asset, success: false, error: error.message });
      }
    }
    
    return results;
  }

  // Get asset info from CDN
  async getAssetInfo(path) {
    try {
      const response = await fetch(`/api/cdn/info?path=${encodeURIComponent(path)}`);
      const data = await response.json();
      
      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.warn('Failed to get asset info:', error);
      return null;
    }
  }

  // Check if CDN is available
  async checkCDNHealth() {
    try {
      const response = await fetch('/api/cdn/health');
      const data = await response.json();
      
      return data.success ? data.data.cdn.healthy : false;
    } catch (error) {
      console.warn('CDN health check failed:', error);
      return false;
    }
  }

  // Optimize image URL for CDN
  optimizeImageUrl(url, options = {}) {
    const {
      width = null,
      height = null,
      quality = 85,
      format = 'auto',
      crop = 'fit'
    } = options;

    if (!url || !this.cdnBaseUrl) return url;

    // If it's already a CDN URL, add optimization parameters
    if (url.includes(this.cdnBaseUrl)) {
      const urlObj = new URL(url);
      const params = urlObj.searchParams;
      
      if (width) params.set('w', width);
      if (height) params.set('h', height);
      if (quality) params.set('q', quality);
      if (format !== 'auto') params.set('f', format);
      if (crop !== 'fit') params.set('c', crop);
      
      return urlObj.toString();
    }

    return url;
  }

  // Get responsive image URLs
  getResponsiveImageUrls(baseUrl, breakpoints = [320, 640, 1024, 1920]) {
    return breakpoints.map(width => ({
      width,
      url: this.optimizeImageUrl(baseUrl, { width, quality: 85 })
    }));
  }

  // Cache management
  clearCache() {
    this.cache.clear();
  }

  setCache(key, value) {
    this.cache.set(key, value);
  }

  getCache(key) {
    return this.cache.get(key);
  }

  // Enable/disable fallback
  setFallbackEnabled(enabled) {
    this.fallbackEnabled = enabled;
  }
}

// Create singleton instance
const cdnHelper = new CDNHelper();

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Set CDN base URL from meta tag or global variable
  const cdnMeta = document.querySelector('meta[name="cdn-base-url"]');
  if (cdnMeta) {
    cdnHelper.cdnBaseUrl = cdnMeta.content;
  }

  // Check CDN health
  cdnHelper.checkCDNHealth().then(healthy => {
    if (!healthy) {
      console.warn('CDN is not available, using fallback mode');
      cdnHelper.setFallbackEnabled(true);
    }
  });
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CDNHelper, cdnHelper };
}

// Make available globally
window.CDNHelper = CDNHelper;
window.cdnHelper = cdnHelper;
