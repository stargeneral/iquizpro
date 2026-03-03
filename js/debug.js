// Debug script to track network request errors and handle configuration issues
(function() {
  console.log('Debug script loaded');
  
  // Ensure minimal configuration exists to prevent the errors we're seeing
  window.appConfig = window.appConfig || {};
  window.appConfig.logging = window.appConfig.logging || {
    logLevel: 'debug',
    enableRemoteLogging: false,
    logToConsole: true,
    includeTimestamp: true
  };
  window.appConfig.auth = window.appConfig.auth || {
    persistenceMode: 'local'
  };
  
  // Your existing network monitoring code
  // Monitor all fetch requests
  const originalFetch = window.fetch;
  window.fetch = function() {
    console.log('Fetch request:', arguments[0]);
    return originalFetch.apply(this, arguments)
      .catch(error => {
        console.error('Fetch error:', arguments[0], error);
        throw error;
      });
  };

  // Monitor XMLHttpRequest
  const originalXHROpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function() {
    this.addEventListener('error', () => {
      console.error('XHR error:', arguments[1]);
    });
    return originalXHROpen.apply(this, arguments);
  };

  // Log all network errors with full URLs
  window.addEventListener('error', function(event) {
    if (event.target && (event.target.tagName === 'LINK' || event.target.tagName === 'SCRIPT' || event.target.tagName === 'IMG')) {
      console.error('Resource loading error:', event.target.tagName, event.target.src || event.target.href);
    }
  }, true);
  
  // Add special 404 monitor
  const originalCreateElement = document.createElement;
  document.createElement = function(tagName) {
    const element = originalCreateElement.call(document, tagName);
    if (tagName.toLowerCase() === 'script' || tagName.toLowerCase() === 'link' || tagName.toLowerCase() === 'img') {
      element.addEventListener('error', function(e) {
        console.error('404 Error for:', this.src || this.href);
      });
    }
    return element;
  };
})();