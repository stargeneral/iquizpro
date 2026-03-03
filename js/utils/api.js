/**
 * API Utilities for IQuizPros
 * Provides functions for making API requests and handling responses
 */

window.QuizProsAPI = (function() {
  // Private variables
  const config = window.QuizProsConfig;
  const utils = window.QuizProsUtils;
  const storage = window.QuizProsStorage;
  
  // Track pending requests
  const pendingRequests = new Map();
  
  /**
   * Make an API request
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Request options
   * @param {string} options.method - HTTP method (GET, POST, PUT, DELETE)
   * @param {Object} options.data - Request data
   * @param {Object} options.headers - Request headers
   * @param {number} options.timeout - Request timeout in milliseconds
   * @param {boolean} options.cache - Whether to cache the response
   * @param {boolean} options.offlineSupport - Whether to support offline mode
   * @returns {Promise} Promise that resolves with the response data
   */
  async function request(endpoint, options = {}) {
    const defaultOptions = {
      method: 'GET',
      data: null,
      headers: {},
      timeout: config.api.timeout || 10000,
      cache: false,
      offlineSupport: config.features.offlineSupport,
      retries: 2
    };

    const requestOptions = { ...defaultOptions, ...options };
    const url = endpoint.startsWith('http') ? endpoint : `${config.api.baseUrl}${endpoint}`;
    const cacheKey = `api_cache_${url}_${JSON.stringify(requestOptions.data)}`;
    
    // Check if we're offline and offline support is enabled
    if (!utils.isOnline() && requestOptions.offlineSupport) {
      utils.logger.warn(`Device is offline, using cached data for: ${url}`);
      
      // Try to get cached response
      const cachedResponse = storage.getLocalItem(cacheKey);
      if (cachedResponse) {
        return cachedResponse;
      }
      
      // Store request for later if it's not a GET request
      if (requestOptions.method !== 'GET') {
        storeOfflineRequest(url, requestOptions);
      }
      
      throw new Error('Device is offline and no cached data available');
    }
    
    // Generate request ID for tracking
    const requestId = utils.generateId();
    const maxAttempts = 1 + Math.max(0, requestOptions.retries || 0);

    // Create fetch options (shared across attempts)
    const fetchOptions = {
      method: requestOptions.method,
      headers: {
        'Content-Type': 'application/json',
        ...requestOptions.headers
      }
    };
    if (requestOptions.method !== 'GET' && requestOptions.data) {
      fetchOptions.body = JSON.stringify(requestOptions.data);
    }

    let lastError;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      // Exponential back-off: 0ms, 1000ms, 2000ms …
      if (attempt > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        utils.logger.debug(`Retrying request (attempt ${attempt + 1}/${maxAttempts}): ${url}`);
      }

      pendingRequests.set(requestId, { url, options: requestOptions });

      try {
        // Create timeout promise per attempt
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => {
            reject(new Error(`Request timeout after ${requestOptions.timeout}ms`));
          }, requestOptions.timeout);
        });

        const response = await Promise.race([fetch(url, fetchOptions), timeoutPromise]);

        // HTTP 4xx/5xx — definitive failure, do not retry
        if (!response.ok) {
          pendingRequests.delete(requestId);
          throw new Error(`API request failed with status ${response.status}: ${response.statusText}`);
        }

        // Parse response
        const contentType = response.headers.get('content-type');
        let data;
        if (contentType && contentType.includes('application/json')) {
          data = await response.json();
        } else {
          data = await response.text();
        }

        // Cache response if needed
        if (requestOptions.cache && requestOptions.method === 'GET') {
          storage.setLocalItem(cacheKey, data);
        }

        pendingRequests.delete(requestId);
        return data;

      } catch (error) {
        pendingRequests.delete(requestId);
        lastError = error;

        // Do not retry on definitive HTTP errors (status-based) or offline
        const isHttpError = error.message && error.message.startsWith('API request failed with status');
        if (isHttpError || attempt === maxAttempts - 1) break;

        utils.logger.warn(`Request failed (attempt ${attempt + 1}), will retry: ${error.message}`);
      }
    }

    // All attempts exhausted — handle error
    utils.logger.error(`API request error for ${url}:`, lastError);

    if (utils.analytics && utils.analytics.trackError) {
      utils.analytics.trackError('API', lastError.message, {
        url,
        method: requestOptions.method
      });
    }

    if (requestOptions.offlineSupport) {
      const cachedResponse = storage.getLocalItem(cacheKey);
      if (cachedResponse) {
        utils.logger.warn(`Using cached data for failed request: ${url}`);
        return cachedResponse;
      }
      if (requestOptions.method !== 'GET') {
        storeOfflineRequest(url, requestOptions);
      }
    }

    throw lastError;
  }
  
  /**
   * Make a GET request
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Request options
   * @returns {Promise} Promise that resolves with the response data
   */
  function get(endpoint, options = {}) {
    return request(endpoint, { ...options, method: 'GET' });
  }
  
  /**
   * Make a POST request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request data
   * @param {Object} options - Request options
   * @returns {Promise} Promise that resolves with the response data
   */
  function post(endpoint, data, options = {}) {
    return request(endpoint, { ...options, method: 'POST', data });
  }
  
  /**
   * Make a PUT request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request data
   * @param {Object} options - Request options
   * @returns {Promise} Promise that resolves with the response data
   */
  function put(endpoint, data, options = {}) {
    return request(endpoint, { ...options, method: 'PUT', data });
  }
  
  /**
   * Make a DELETE request
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Request options
   * @returns {Promise} Promise that resolves with the response data
   */
  function del(endpoint, options = {}) {
    return request(endpoint, { ...options, method: 'DELETE' });
  }
  
  /**
   * Store an offline request for later processing
   * @param {string} url - Request URL
   * @param {Object} options - Request options
   */
  function storeOfflineRequest(url, options) {
    if (!config.features.offlineSupport) return;
    
    try {
      // Get existing offline requests
      const offlineRequests = storage.getLocalItem('offline_requests') || [];
      
      // Add new request
      offlineRequests.push({
        url,
        options,
        timestamp: new Date().toISOString()
      });
      
      // Save updated offline requests
      storage.setLocalItem('offline_requests', offlineRequests);
      
      utils.logger.debug(`Stored offline request for later: ${options.method} ${url}`);
    } catch (error) {
      utils.logger.error('Error storing offline request:', error);
    }
  }
  
  /**
   * Process offline requests when back online
   */
  function processOfflineRequests() {
    if (!config.features.offlineSupport) return;
    
    try {
      // Get offline requests
      const offlineRequests = storage.getLocalItem('offline_requests') || [];
      
      if (offlineRequests.length === 0) {
        return;
      }
      
      utils.logger.info(`Processing ${offlineRequests.length} offline requests`);
      
      // Process each request
      offlineRequests.forEach(async (req) => {
        try {
          await request(req.url, req.options);
          utils.logger.debug(`Successfully processed offline request: ${req.options.method} ${req.url}`);
        } catch (error) {
          utils.logger.error(`Error processing offline request: ${req.options.method} ${req.url}`, error);
        }
      });
      
      // Clear offline requests
      storage.setLocalItem('offline_requests', []);
    } catch (error) {
      utils.logger.error('Error processing offline requests:', error);
    }
  }
  
  /**
   * Cancel all pending requests
   */
  function cancelAllRequests() {
    utils.logger.info(`Cancelling ${pendingRequests.size} pending requests`);
    pendingRequests.clear();
  }
  
  /**
   * Load a JSON file
   * @param {string} path - File path
   * @returns {Promise} Promise that resolves with the JSON data
   */
  async function loadJSON(path) {
    try {
      utils.logger.debug(`Loading JSON file: ${path}`);
      
      const response = await fetch(path);
      
      if (!response.ok) {
        throw new Error(`Failed to load JSON file: ${path} (${response.status})`);
      }
      
      return await response.json();
    } catch (error) {
      utils.logger.error(`Error loading JSON file ${path}:`, error);
      throw error;
    }
  }
  
  // Listen for online/offline events
  window.addEventListener('online', () => {
    utils.logger.info('Device is back online, processing offline requests');
    processOfflineRequests();
  });
  
  window.addEventListener('offline', () => {
    utils.logger.warn('Device is offline, requests will be queued');
  });
  
  // Public API
  return {
    request: request,
    get: get,
    post: post,
    put: put,
    delete: del,
    loadJSON: loadJSON,
    processOfflineRequests: processOfflineRequests,
    cancelAllRequests: cancelAllRequests
  };
})();

// No auto-initialization since this is just a utility module
