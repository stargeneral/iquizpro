/**
 * General Utilities for IQuizPros
 * Provides common utility functions used throughout the application
 */

window.QuizProsUtils = (function() {
  // Private variables
  const config = window.QuizProsConfig;
  
  /**
   * Logger utility with different log levels
   */
  const logger = {
    debug: function(...args) {
      if (config.features.debug || config.features.logLevel === 'debug') {
        console.debug('[IQuizPros]', ...args);
      }
    },
    
    info: function(...args) {
      if (config.features.debug || ['debug', 'info'].includes(config.features.logLevel)) {
        console.info('[IQuizPros]', ...args);
      }
    },
    
    warn: function(...args) {
      if (config.features.debug || ['debug', 'info', 'warn'].includes(config.features.logLevel)) {
        console.warn('[IQuizPros]', ...args);
      }
    },
    
    error: function(...args) {
      console.error('[IQuizPros]', ...args);
    }
  };
  
  /**
   * Performance measurement utility
   */
  const performance = {
    measures: {},
    
    /**
     * Start measuring performance
     * @param {string} name - Name of the measurement
     */
    startMeasure: function(name) {
      if (!window.performance || !window.performance.now) {
        return;
      }
      
      this.measures[name] = {
        start: window.performance.now(),
        end: null
      };
    },
    
    /**
     * End measuring performance and log the result
     * @param {string} name - Name of the measurement
     * @returns {number|null} The duration in milliseconds, or null if measurement failed
     */
    endMeasure: function(name) {
      if (!window.performance || !window.performance.now || !this.measures[name]) {
        return null;
      }
      
      this.measures[name].end = window.performance.now();
      const duration = this.measures[name].end - this.measures[name].start;
      
      logger.debug(`Performance [${name}]: ${duration.toFixed(2)}ms`);
      
      // Track performance using our safe analytics wrapper
      analytics.trackPerformance(name, Math.round(duration));
      
      return duration;
    },
    
    /**
     * Get all performance measures
     * @returns {Object} All performance measures
     */
    getAllMeasures: function() {
      return this.measures;
    }
  };
  
  /**
   * Generate a random ID
   * @param {number} length - Length of the ID (default: 8)
   * @returns {string} Random ID
   */
  function generateId(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let id = '';
    
    for (let i = 0; i < length; i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return id;
  }
  
  /**
   * Format a date
   * @param {Date|string} date - Date to format
   * @param {string} format - Format string (default: 'YYYY-MM-DD')
   * @returns {string} Formatted date
   */
  function formatDate(date, format = 'YYYY-MM-DD') {
    const d = typeof date === 'string' ? new Date(date) : date;
    
    if (!(d instanceof Date) || isNaN(d)) {
      return '';
    }
    
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    
    return format
      .replace('YYYY', year)
      .replace('MM', month)
      .replace('DD', day)
      .replace('HH', hours)
      .replace('mm', minutes)
      .replace('ss', seconds);
  }
  
  /**
   * Format a number as a percentage
   * @param {number} value - Value to format
   * @param {number} decimals - Number of decimal places (default: 0)
   * @returns {string} Formatted percentage
   */
  function formatPercentage(value, decimals = 0) {
    return `${(value * 100).toFixed(decimals)}%`;
  }
  
  /**
   * Format a number as currency
   * @param {number} value - Value to format
   * @param {string} currency - Currency code (default: 'USD')
   * @param {string} locale - Locale (default: 'en-US')
   * @returns {string} Formatted currency
   */
  function formatCurrency(value, currency = 'USD', locale = 'en-US') {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency
    }).format(value);
  }
  
  /**
   * Shuffle an array (Fisher-Yates algorithm)
   * @param {Array} array - Array to shuffle
   * @returns {Array} Shuffled array
   */
  function shuffleArray(array) {
    const newArray = [...array];
    
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    
    return newArray;
  }
  
  /**
   * Debounce a function
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in milliseconds
   * @returns {Function} Debounced function
   */
  function debounce(func, wait = 300) {
    let timeout;
    
    return function(...args) {
      const context = this;
      clearTimeout(timeout);
      
      timeout = setTimeout(() => {
        func.apply(context, args);
      }, wait);
    };
  }
  
  /**
   * Throttle a function
   * @param {Function} func - Function to throttle
   * @param {number} limit - Limit in milliseconds
   * @returns {Function} Throttled function
   */
  function throttle(func, limit = 300) {
    let inThrottle;
    
    return function(...args) {
      const context = this;
      
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        
        setTimeout(() => {
          inThrottle = false;
        }, limit);
      }
    };
  }
  
  /**
   * Deep clone an object
   * @param {Object} obj - Object to clone
   * @returns {Object} Cloned object
   */
  function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }
    
    if (obj instanceof Date) {
      return new Date(obj);
    }
    
    if (obj instanceof Array) {
      return obj.map(item => deepClone(item));
    }
    
    if (obj instanceof Object) {
      const copy = {};
      
      Object.keys(obj).forEach(key => {
        copy[key] = deepClone(obj[key]);
      });
      
      return copy;
    }
    
    return obj;
  }
  
  /**
   * Get URL parameters
   * @param {string} url - URL to parse (default: current URL)
   * @returns {Object} URL parameters
   */
  function getUrlParams(url = window.location.href) {
    const params = {};
    const queryString = url.split('?')[1];
    
    if (!queryString) {
      return params;
    }
    
    queryString.split('&').forEach(param => {
      const [key, value] = param.split('=');
      params[decodeURIComponent(key)] = decodeURIComponent(value || '');
    });
    
    return params;
  }
  
  /**
   * Build a URL with parameters
   * @param {string} baseUrl - Base URL
   * @param {Object} params - URL parameters
   * @returns {string} URL with parameters
   */
  function buildUrl(baseUrl, params = {}) {
    const url = new URL(baseUrl, window.location.origin);
    
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        url.searchParams.append(key, params[key]);
      }
    });
    
    return url.toString();
  }
  
  /**
   * Sanitize HTML to prevent XSS
   * @param {string} html - HTML to sanitize
   * @returns {string} Sanitized HTML
   */
  function sanitizeHtml(html) {
    const temp = document.createElement('div');
    temp.textContent = html;
    return temp.innerHTML;
  }
  
  /**
   * Create a share URL for WhatsApp
   * @param {string} text - Text to share
   * @param {string} url - URL to share
   * @returns {string} WhatsApp share URL
   */
  function createWhatsAppShareUrl(text, url = window.location.href) {
    const shareText = encodeURIComponent(`${text} ${url}`);
    return `https://wa.me/?text=${shareText}`;
  }
  
  /**
   * Create a share URL for Twitter/X
   * @param {string} text - Text to share
   * @param {string} url - URL to share
   * @param {string} hashtags - Hashtags (comma-separated)
   * @returns {string} Twitter share URL
   */
  function createTwitterShareUrl(text, url = window.location.href, hashtags = '') {
    const params = {
      text: text,
      url: url
    };
    
    if (hashtags) {
      params.hashtags = hashtags;
    }
    
    return buildUrl('https://twitter.com/intent/tweet', params);
  }
  
  /**
   * Create a share URL for Facebook
   * @param {string} url - URL to share
   * @returns {string} Facebook share URL
   */
  function createFacebookShareUrl(url = window.location.href) {
    return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  }
  
  /**
   * Check if the device is mobile
   * @returns {boolean} Whether the device is mobile
   */
  function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }
  
  /**
   * Check if the device is online
   * @returns {boolean} Whether the device is online
   */
  function isOnline() {
    return navigator.onLine;
  }
  
  /**
   * Get the browser language
   * @returns {string} Browser language
   */
  function getBrowserLanguage() {
    return navigator.language || navigator.userLanguage || 'en-US';
  }
  
  /**
   * Get the device type
   * @returns {string} Device type ('mobile', 'tablet', or 'desktop')
   */
  function getDeviceType() {
    const ua = navigator.userAgent;
    
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
      return 'tablet';
    }
    
    if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
      return 'mobile';
    }
    
    return 'desktop';
  }
  
  /**
   * Handle errors and log them
   * @param {Error} error - Error to handle
   * @param {string} context - Error context
   * @param {boolean} rethrow - Whether to rethrow the error
   */
  function handleError(error, context = 'general', rethrow = false) {
    logger.error(`Error in ${context}:`, error);
    
    // Track error using our safe analytics wrapper
    analytics.trackError(
      context,
      error.message,
      {
        stack: error.stack,
        name: error.name
      }
    );
    
    if (rethrow) {
      throw error;
    }
  }
  
  /**
   * Image utility functions
   */
  const imageUtils = {
    /**
     * Preload an image
     * @param {string} src - Image source URL
     * @returns {Promise} Promise that resolves when the image is loaded
     */
    preloadImage: function(src) {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = (e) => reject(new Error(`Failed to load image: ${src}`));
        img.src = src;
      });
    },
    
    /**
     * Get a fallback image URL
     * @param {string} type - Type of fallback image
     * @returns {string} Fallback image URL
     */
    getFallbackImageUrl: function(type) {
      if (!config || !config.paths || !config.paths.defaultImages) {
        return 'assets/images/default-personality.webp';
      }
      
      switch (type) {
        case 'personality':
          return config.paths.defaultImages.personalityQuiz;
        case 'zodiac':
          return config.paths.defaultImages.zodiacWheel;
        case 'spirit-animal':
          return config.paths.defaultImages.spiritAnimal;
        default:
          return config.paths.defaultImages.personalityQuiz;
      }
    },
    
    /**
     * Check if an image exists
     * @param {string} url - Image URL
     * @returns {Promise<boolean>} Promise that resolves to true if the image exists
     */
    imageExists: function(url) {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = url;
      });
    }
  };
  
  /**
   * DOM utility functions
   */
  const domUtils = {
    /**
     * Set the inner HTML of an element safely
     * @param {string|HTMLElement} element - Element ID or element
     * @param {string} html - HTML content
     * @returns {HTMLElement|null} The element or null if not found
     */
    setInnerHTML: function(element, html) {
      const el = typeof element === 'string' ? document.getElementById(element) : element;
      
      if (!el) {
        logger.warn(`Element not found: ${element}`);
        return null;
      }
      
      try {
        el.innerHTML = html;
        return el;
      } catch (error) {
        logger.error(`Error setting innerHTML: ${error.message}`);
        return null;
      }
    },
    
    /**
     * Toggle the display of an element
     * @param {string|HTMLElement} element - Element ID or element
     * @param {boolean} show - Whether to show or hide the element
     * @returns {HTMLElement|null} The element or null if not found
     */
    toggleElementDisplay: function(element, show) {
      const el = typeof element === 'string' ? document.getElementById(element) : element;
      
      if (!el) {
        logger.warn(`Element not found: ${element}`);
        return null;
      }
      
      try {
        el.style.display = show ? 'block' : 'none';
        return el;
      } catch (error) {
        logger.error(`Error toggling element display: ${error.message}`);
        return null;
      }
    },
    
    /**
     * Create an element with attributes and content
     * @param {string} tag - Tag name
     * @param {Object} attributes - Element attributes
     * @param {string|HTMLElement} content - Element content
     * @returns {HTMLElement} The created element
     */
    createElement: function(tag, attributes = {}, content = '') {
      const element = document.createElement(tag);
      
      // Set attributes
      Object.entries(attributes).forEach(([key, value]) => {
        if (key === 'className') {
          element.className = value;
        } else if (key === 'style' && typeof value === 'object') {
          Object.entries(value).forEach(([prop, val]) => {
            element.style[prop] = val;
          });
        } else {
          element.setAttribute(key, value);
        }
      });
      
      // Set content
      if (content) {
        if (typeof content === 'string') {
          element.innerHTML = content;
        } else if (content instanceof HTMLElement) {
          element.appendChild(content);
        }
      }
      
      return element;
    },
    
    /**
     * Add event listeners to elements
     * @param {string|HTMLElement|NodeList} elements - Element(s) to add listeners to
     * @param {string} event - Event name
     * @param {Function} callback - Event callback
     * @param {Object} options - Event options
     */
    addEventListeners: function(elements, event, callback, options = {}) {
      let els = elements;
      
      // Convert string to element
      if (typeof elements === 'string') {
        els = document.querySelectorAll(elements);
      }
      
      // Convert single element to array
      if (els instanceof HTMLElement) {
        els = [els];
      }
      
      // Add listeners to all elements
      if (els instanceof NodeList || Array.isArray(els)) {
        Array.from(els).forEach(el => {
          el.addEventListener(event, callback, options);
        });
      }
    },
    
    /**
     * Remove event listeners from elements
     * @param {string|HTMLElement|NodeList} elements - Element(s) to remove listeners from
     * @param {string} event - Event name
     * @param {Function} callback - Event callback
     * @param {Object} options - Event options
     */
    removeEventListeners: function(elements, event, callback, options = {}) {
      let els = elements;
      
      // Convert string to element
      if (typeof elements === 'string') {
        els = document.querySelectorAll(elements);
      }
      
      // Convert single element to array
      if (els instanceof HTMLElement) {
        els = [els];
      }
      
      // Remove listeners from all elements
      if (els instanceof NodeList || Array.isArray(els)) {
        Array.from(els).forEach(el => {
          el.removeEventListener(event, callback, options);
        });
      }
    },
    
    /**
     * Find elements by selector
     * @param {string} selector - CSS selector
     * @param {HTMLElement} parent - Parent element (default: document)
     * @returns {NodeList} Found elements
     */
    findElements: function(selector, parent = document) {
      return parent.querySelectorAll(selector);
    },
    
    /**
     * Find a single element by selector
     * @param {string} selector - CSS selector
     * @param {HTMLElement} parent - Parent element (default: document)
     * @returns {HTMLElement|null} Found element or null
     */
    findElement: function(selector, parent = document) {
      return parent.querySelector(selector);
    }
  };
  
  /**
   * Safe analytics wrapper to prevent errors
   */
  const analytics = {
    trackEvent: function(category, action, label, value, params) {
      try {
        if (window.QuizProsAnalytics && typeof window.QuizProsAnalytics.trackEvent === 'function') {
          window.QuizProsAnalytics.trackEvent(category, action, label, value, params);
        } else {
          logger.debug(`Analytics event (not sent): ${category} / ${action} / ${label || 'no label'}`);
        }
      } catch (error) {
        logger.error('Error tracking event:', error);
      }
      return true; // Always return true to prevent errors in calling code
    },
    trackPageView: function(title, path) {
      try {
        if (window.QuizProsAnalytics && typeof window.QuizProsAnalytics.trackPageView === 'function') {
          window.QuizProsAnalytics.trackPageView(title, path);
        } else {
          logger.debug(`Analytics page view (not sent): ${title || 'no title'} / ${path || 'no path'}`);
        }
      } catch (error) {
        logger.error('Error tracking page view:', error);
      }
      return true; // Always return true to prevent errors in calling code
    },
    trackError: function(context, message, details) {
      try {
        if (window.QuizProsAnalytics && typeof window.QuizProsAnalytics.trackError === 'function') {
          window.QuizProsAnalytics.trackError(context, message, details);
        } else {
          logger.debug(`Analytics error (not sent): ${context || 'no context'} / ${message || 'no message'}`);
        }
      } catch (error) {
        logger.error('Error tracking error event:', error);
      }
      return true; // Always return true to prevent errors in calling code
    },
    trackPerformance: function(name, value, params) {
      try {
        if (window.QuizProsAnalytics && typeof window.QuizProsAnalytics.trackPerformance === 'function') {
          window.QuizProsAnalytics.trackPerformance(name, value, params);
        } else {
          logger.debug(`Analytics performance (not sent): ${name || 'no name'} / ${value || 'no value'}`);
        }
      } catch (error) {
        logger.error('Error tracking performance:', error);
      }
      return true; // Always return true to prevent errors in calling code
    }
  };

  // Public API
  return {
    logger: logger,
    performance: performance,
    analytics: analytics, // Add analytics wrapper to public API
    generateId: generateId,
    formatDate: formatDate,
    formatPercentage: formatPercentage,
    formatCurrency: formatCurrency,
    shuffleArray: shuffleArray,
    debounce: debounce,
    throttle: throttle,
    deepClone: deepClone,
    getUrlParams: getUrlParams,
    buildUrl: buildUrl,
    sanitizeHtml: sanitizeHtml,
    createWhatsAppShareUrl: createWhatsAppShareUrl,
    createTwitterShareUrl: createTwitterShareUrl,
    createFacebookShareUrl: createFacebookShareUrl,
    isMobileDevice: isMobileDevice,
    isOnline: isOnline,
    getBrowserLanguage: getBrowserLanguage,
    getDeviceType: getDeviceType,
    handleError: handleError,
    domUtils: domUtils,
    imageUtils: imageUtils
  };
})();

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  // Nothing to initialize for now
});
