/**
 * Storage Utilities for IQuizPros
 * Provides functions for working with localStorage and sessionStorage
 */

window.QuizProsStorage = (function() {
  // Private variables
  const config = window.QuizProsConfig;
  const utils = window.QuizProsUtils;
  
  // Storage availability flags
  let isLocalStorageAvailable = false;
  let isSessionStorageAvailable = false;
  
  // Storage prefix to avoid conflicts
  const storagePrefix = 'quizpros_';
  
  /**
   * Initialize storage utilities
   */
  function initialize() {
    utils.logger.info('Initializing storage utilities');
    
    // Check storage availability
    isLocalStorageAvailable = checkStorageAvailability('localStorage');
    isSessionStorageAvailable = checkStorageAvailability('sessionStorage');
    
    utils.logger.debug(`Storage availability - Local: ${isLocalStorageAvailable}, Session: ${isSessionStorageAvailable}`);
    
    // Set up event listeners
    setupEventListeners();
    
    utils.logger.debug('Storage utilities initialized');
  }
  
  /**
   * Check if a storage type is available
   * @param {string} type - Storage type ('localStorage' or 'sessionStorage')
   * @returns {boolean} Whether the storage is available
   */
  function checkStorageAvailability(type) {
    try {
      const storage = window[type];
      const testKey = `${storagePrefix}test`;
      storage.setItem(testKey, 'test');
      storage.removeItem(testKey);
      return true;
    } catch (e) {
      utils.logger.warn(`${type} is not available:`, e);
      return false;
    }
  }
  
  /**
   * Set up event listeners
   */
  function setupEventListeners() {
    // Listen for storage events
    window.addEventListener('storage', function(event) {
      // Only handle our own keys
      if (event.key && event.key.startsWith(storagePrefix)) {
        utils.logger.debug(`Storage event: ${event.key} changed`);
      }
    });
  }
  
  /**
   * Get a prefixed key
   * @param {string} key - Original key
   * @returns {string} Prefixed key
   */
  function getPrefixedKey(key) {
    return `${storagePrefix}${key}`;
  }
  
  /**
   * Set an item in localStorage
   * @param {string} key - Item key
   * @param {*} value - Item value
   * @returns {boolean} Whether the operation was successful
   */
  function setLocalItem(key, value) {
    if (!isLocalStorageAvailable) {
      utils.logger.warn('localStorage is not available');
      return false;
    }
    
    try {
      const prefixedKey = getPrefixedKey(key);
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(prefixedKey, serializedValue);
      return true;
    } catch (error) {
      utils.logger.error(`Error setting localStorage item ${key}:`, error);
      return false;
    }
  }
  
  /**
   * Get an item from localStorage
   * @param {string} key - Item key
   * @returns {*} Item value or null if not found
   */
  function getLocalItem(key) {
    if (!isLocalStorageAvailable) {
      utils.logger.warn('localStorage is not available');
      return null;
    }
    
    try {
      const prefixedKey = getPrefixedKey(key);
      const serializedValue = localStorage.getItem(prefixedKey);
      
      if (serializedValue === null) {
        return null;
      }
      
      return JSON.parse(serializedValue);
    } catch (error) {
      utils.logger.error(`Error getting localStorage item ${key}:`, error);
      return null;
    }
  }
  
  /**
   * Remove an item from localStorage
   * @param {string} key - Item key
   * @returns {boolean} Whether the operation was successful
   */
  function removeLocalItem(key) {
    if (!isLocalStorageAvailable) {
      utils.logger.warn('localStorage is not available');
      return false;
    }
    
    try {
      const prefixedKey = getPrefixedKey(key);
      localStorage.removeItem(prefixedKey);
      return true;
    } catch (error) {
      utils.logger.error(`Error removing localStorage item ${key}:`, error);
      return false;
    }
  }
  
  /**
   * Set an item in sessionStorage
   * @param {string} key - Item key
   * @param {*} value - Item value
   * @returns {boolean} Whether the operation was successful
   */
  function setSessionItem(key, value) {
    if (!isSessionStorageAvailable) {
      utils.logger.warn('sessionStorage is not available');
      return false;
    }
    
    try {
      const prefixedKey = getPrefixedKey(key);
      const serializedValue = JSON.stringify(value);
      sessionStorage.setItem(prefixedKey, serializedValue);
      return true;
    } catch (error) {
      utils.logger.error(`Error setting sessionStorage item ${key}:`, error);
      return false;
    }
  }
  
  /**
   * Get an item from sessionStorage
   * @param {string} key - Item key
   * @returns {*} Item value or null if not found
   */
  function getSessionItem(key) {
    if (!isSessionStorageAvailable) {
      utils.logger.warn('sessionStorage is not available');
      return null;
    }
    
    try {
      const prefixedKey = getPrefixedKey(key);
      const serializedValue = sessionStorage.getItem(prefixedKey);
      
      if (serializedValue === null) {
        return null;
      }
      
      return JSON.parse(serializedValue);
    } catch (error) {
      utils.logger.error(`Error getting sessionStorage item ${key}:`, error);
      return null;
    }
  }
  
  /**
   * Remove an item from sessionStorage
   * @param {string} key - Item key
   * @returns {boolean} Whether the operation was successful
   */
  function removeSessionItem(key) {
    if (!isSessionStorageAvailable) {
      utils.logger.warn('sessionStorage is not available');
      return false;
    }
    
    try {
      const prefixedKey = getPrefixedKey(key);
      sessionStorage.removeItem(prefixedKey);
      return true;
    } catch (error) {
      utils.logger.error(`Error removing sessionStorage item ${key}:`, error);
      return false;
    }
  }
  
  /**
   * Clear all items with our prefix from localStorage
   * @returns {boolean} Whether the operation was successful
   */
  function clearLocalStorage() {
    if (!isLocalStorageAvailable) {
      utils.logger.warn('localStorage is not available');
      return false;
    }
    
    try {
      // Get all keys with our prefix
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith(storagePrefix)) {
          keys.push(key);
        }
      }
      
      // Remove all keys
      keys.forEach(key => localStorage.removeItem(key));
      
      utils.logger.debug(`Cleared ${keys.length} items from localStorage`);
      return true;
    } catch (error) {
      utils.logger.error('Error clearing localStorage:', error);
      return false;
    }
  }
  
  /**
   * Clear all items with our prefix from sessionStorage
   * @returns {boolean} Whether the operation was successful
   */
  function clearSessionStorage() {
    if (!isSessionStorageAvailable) {
      utils.logger.warn('sessionStorage is not available');
      return false;
    }
    
    try {
      // Get all keys with our prefix
      const keys = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key.startsWith(storagePrefix)) {
          keys.push(key);
        }
      }
      
      // Remove all keys
      keys.forEach(key => sessionStorage.removeItem(key));
      
      utils.logger.debug(`Cleared ${keys.length} items from sessionStorage`);
      return true;
    } catch (error) {
      utils.logger.error('Error clearing sessionStorage:', error);
      return false;
    }
  }
  
  /**
   * Get all items with our prefix from localStorage
   * @returns {Object} All items
   */
  function getAllLocalItems() {
    if (!isLocalStorageAvailable) {
      utils.logger.warn('localStorage is not available');
      return {};
    }
    
    try {
      const items = {};
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        
        if (key.startsWith(storagePrefix)) {
          const unprefixedKey = key.substring(storagePrefix.length);
          items[unprefixedKey] = getLocalItem(unprefixedKey);
        }
      }
      
      return items;
    } catch (error) {
      utils.logger.error('Error getting all localStorage items:', error);
      return {};
    }
  }
  
  /**
   * Get all items with our prefix from sessionStorage
   * @returns {Object} All items
   */
  function getAllSessionItems() {
    if (!isSessionStorageAvailable) {
      utils.logger.warn('sessionStorage is not available');
      return {};
    }
    
    try {
      const items = {};
      
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        
        if (key.startsWith(storagePrefix)) {
          const unprefixedKey = key.substring(storagePrefix.length);
          items[unprefixedKey] = getSessionItem(unprefixedKey);
        }
      }
      
      return items;
    } catch (error) {
      utils.logger.error('Error getting all sessionStorage items:', error);
      return {};
    }
  }
  
  /**
   * Get the total size of localStorage items with our prefix
   * @returns {number} Size in bytes
   */
  function getLocalStorageSize() {
    if (!isLocalStorageAvailable) {
      utils.logger.warn('localStorage is not available');
      return 0;
    }
    
    try {
      let size = 0;
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        
        if (key.startsWith(storagePrefix)) {
          size += key.length + localStorage.getItem(key).length;
        }
      }
      
      return size;
    } catch (error) {
      utils.logger.error('Error getting localStorage size:', error);
      return 0;
    }
  }
  
  /**
   * Get the total size of sessionStorage items with our prefix
   * @returns {number} Size in bytes
   */
  function getSessionStorageSize() {
    if (!isSessionStorageAvailable) {
      utils.logger.warn('sessionStorage is not available');
      return 0;
    }
    
    try {
      let size = 0;
      
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        
        if (key.startsWith(storagePrefix)) {
          size += key.length + sessionStorage.getItem(key).length;
        }
      }
      
      return size;
    } catch (error) {
      utils.logger.error('Error getting sessionStorage size:', error);
      return 0;
    }
  }
  
  /**
   * Check if an item exists in localStorage
   * @param {string} key - Item key
   * @returns {boolean} Whether the item exists
   */
  function hasLocalItem(key) {
    if (!isLocalStorageAvailable) {
      utils.logger.warn('localStorage is not available');
      return false;
    }
    
    try {
      const prefixedKey = getPrefixedKey(key);
      return localStorage.getItem(prefixedKey) !== null;
    } catch (error) {
      utils.logger.error(`Error checking localStorage item ${key}:`, error);
      return false;
    }
  }
  
  /**
   * Check if an item exists in sessionStorage
   * @param {string} key - Item key
   * @returns {boolean} Whether the item exists
   */
  function hasSessionItem(key) {
    if (!isSessionStorageAvailable) {
      utils.logger.warn('sessionStorage is not available');
      return false;
    }
    
    try {
      const prefixedKey = getPrefixedKey(key);
      return sessionStorage.getItem(prefixedKey) !== null;
    } catch (error) {
      utils.logger.error(`Error checking sessionStorage item ${key}:`, error);
      return false;
    }
  }
  
  // Public API
  return {
    initialize: initialize,
    isLocalStorageAvailable: isLocalStorageAvailable,
    isSessionStorageAvailable: isSessionStorageAvailable,
    setLocalItem: setLocalItem,
    getLocalItem: getLocalItem,
    removeLocalItem: removeLocalItem,
    setSessionItem: setSessionItem,
    getSessionItem: getSessionItem,
    removeSessionItem: removeSessionItem,
    clearLocalStorage: clearLocalStorage,
    clearSessionStorage: clearSessionStorage,
    getAllLocalItems: getAllLocalItems,
    getAllSessionItems: getAllSessionItems,
    getLocalStorageSize: getLocalStorageSize,
    getSessionStorageSize: getSessionStorageSize,
    hasLocalItem: hasLocalItem,
    hasSessionItem: hasSessionItem
  };
})();

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  QuizProsStorage.initialize();
});
