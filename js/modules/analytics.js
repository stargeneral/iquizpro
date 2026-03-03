/**
 * Analytics Module for IQuizPros
 * Provides Google Analytics 4 integration and event tracking
 */

window.QuizProsAnalytics = (function() {
  // Private variables
  const config = window.QuizProsConfig || { features: {}, analytics: { categories: {} } };
  const utils = window.QuizProsUtils || { 
    logger: { 
      info: console.info.bind(console, '[IQuizPros]'),
      debug: console.debug.bind(console, '[IQuizPros]'),
      warn: console.warn.bind(console, '[IQuizPros]'),
      error: console.error.bind(console, '[IQuizPros]')
    },
    isOnline: () => navigator.onLine
  };
  const storage = window.QuizProsStorage || {
    getLocalItem: () => null,
    setLocalItem: () => false,
    removeLocalItem: () => false
  };
  
  // Tracking state
  let trackingEnabled = false;
  let consentGiven = false;
  let offlineQueue = [];
  let sessionId = '';
  let clientId = '';
  
  /**
   * Initialize the analytics module
   */
  function initialize() {
    utils.logger.info('Initializing analytics module');
    
    // Generate session ID
    sessionId = generateSessionId();
    
    // Get or generate client ID
    clientId = getClientId();
    
    // Check if analytics is enabled in config
    if (!config.features.enableAnalytics) {
      utils.logger.debug('Analytics disabled in config');
      return;
    }
    
    // Check for consent if required
    if (config.cookieConsent && config.cookieConsent.requiredForAnalytics) {
      // Listen for consent events
      document.addEventListener('quizpros:consent:updated', handleConsentUpdate);
      
      // Check if consent module is available
      if (window.QuizProsCookieConsent) {
        consentGiven = window.QuizProsCookieConsent.hasConsentFor('analytics');
      }
    } else {
      // Consent not required
      consentGiven = true;
    }
    
    // Enable tracking if consent given
    if (consentGiven) {
      enableTracking();
    }
    
    // Load offline events
    loadOfflineEvents();
    
    // Set up event listeners
    setupEventListeners();
    
    utils.logger.debug('Analytics module initialized');
  }
  
  /**
   * Generate a session ID
   * @returns {string} Session ID
   */
  function generateSessionId() {
    return 'session_' + Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15) + 
           '_' + Date.now();
  }
  
  /**
   * Get or generate client ID
   * @returns {string} Client ID
   */
  function getClientId() {
    // Try to get existing client ID from storage
    let id = storage.getLocalItem('analytics_client_id');
    
    if (!id) {
      // Generate new client ID
      id = 'client_' + Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15) + 
           '_' + Date.now();
      
      // Save to storage
      storage.setLocalItem('analytics_client_id', id);
    }
    
    return id;
  }
  
  /**
   * Handle consent update event
   * @param {Event} event - Consent event
   */
  function handleConsentUpdate(event) {
    const consentData = event.detail;
    
    if (consentData && consentData.choices) {
      consentGiven = consentData.choices.analytics === true;
      
      if (consentGiven) {
        enableTracking();
      } else {
        disableTracking();
      }
    }
  }
  
  /**
   * Set up event listeners
   */
  function setupEventListeners() {
    // Listen for online/offline events
    window.addEventListener('online', function() {
      utils.logger.debug('Device is online, processing offline events');
      processOfflineEvents();
    });
    
    window.addEventListener('offline', function() {
      utils.logger.debug('Device is offline, events will be queued');
    });
    
    // Track page views
    window.addEventListener('popstate', trackPageView);
    
    // Track errors
    window.addEventListener('error', function(event) {
      trackError('JavaScript', event.message, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    });
    
    // Track unhandled promise rejections
    window.addEventListener('unhandledrejection', function(event) {
      trackError('Promise', event.reason.message || 'Unhandled rejection', {
        stack: event.reason.stack
      });
    });
  }
  
  /**
   * Enable tracking
   */
  function enableTracking() {
    if (trackingEnabled) return;
    
    trackingEnabled = true;
    
    // Initialize Google Analytics
    initializeGA();
    
    // Track initial page view
    trackPageView();
    
    // Process any offline events
    processOfflineEvents();
    
    utils.logger.debug('Analytics tracking enabled');
  }
  
  /**
   * Disable tracking
   */
  function disableTracking() {
    trackingEnabled = false;
    utils.logger.debug('Analytics tracking disabled');
  }
  
  /**
   * Initialize Google Analytics
   */
  function initializeGA() {
    // Check if GA is already initialized
    if (window.gtag) {
      utils.logger.debug('Google Analytics already initialized');
      return;
    }
    
    // Create GA script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${config.analytics.gaTrackingId}`;
    
    // Add script to page
    document.head.appendChild(script);
    
    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    window.gtag = function() {
      window.dataLayer.push(arguments);
    };
    
    // Configure GA
    window.gtag('js', new Date());
    window.gtag('config', config.analytics.gaTrackingId, {
      send_page_view: false, // We'll track page views manually
      anonymize_ip: true,
      cookie_flags: 'SameSite=None;Secure'
    });
    
    // Set consent mode if available
    if (window.QuizProsCookieConsent) {
      const consentChoices = window.QuizProsCookieConsent.getConsentChoices();
      
      window.gtag('consent', 'default', {
        'analytics_storage': consentChoices.analytics ? 'granted' : 'denied',
        'ad_storage': consentChoices.marketing ? 'granted' : 'denied',
        'functionality_storage': consentChoices.preferences ? 'granted' : 'denied',
        'personalization_storage': consentChoices.preferences ? 'granted' : 'denied',
        'security_storage': 'granted' // Always allowed
      });
    }
    
    utils.logger.debug('Google Analytics initialized');
  }
  
  /**
   * Track a page view
   */
  function trackPageView() {
    if (!trackingEnabled) return;
    
    const pageTitle = document.title;
    const pagePath = window.location.pathname + window.location.search;
    
    // Track page view with GA
    if (window.gtag) {
      window.gtag('event', 'page_view', {
        page_title: pageTitle,
        page_path: pagePath,
        send_to: config.analytics.gaTrackingId
      });
      
      utils.logger.debug(`Tracked page view: ${pagePath}`);
    } else {
      // Queue for later if GA not loaded
      queueEvent('page_view', {
        page_title: pageTitle,
        page_path: pagePath
      });
    }
  }
  
  /**
   * Track an event
   * @param {string} category - Event category
   * @param {string} action - Event action
   * @param {string} label - Event label (optional)
   * @param {number} value - Event value (optional)
   * @param {Object} params - Additional parameters (optional)
   */
  function trackEvent(category, action, label, value, params = {}) {
    if (!trackingEnabled) return;
    
    // Build event parameters
    const eventParams = {
      event_category: category,
      event_action: action,
      ...params
    };
    
    // Add label if provided
    if (label) {
      eventParams.event_label = label;
    }
    
    // Add value if provided
    if (typeof value === 'number') {
      eventParams.value = value;
    }
    
    // Add session and client IDs
    eventParams.session_id = sessionId;
    eventParams.client_id = clientId;
    
    // Track event with GA
    if (window.gtag && utils.isOnline()) {
      window.gtag('event', action, eventParams);
      
      utils.logger.debug(`Tracked event: ${category} / ${action}${label ? ' / ' + label : ''}`);
    } else {
      // Queue for later if offline or GA not loaded
      queueEvent(action, eventParams);
    }
  }
  
  /**
   * Track an error
   * @param {string} context - Error context
   * @param {string} message - Error message
   * @param {Object} details - Error details (optional)
   */
  function trackError(context, message, details = {}) {
    if (!trackingEnabled) return;
    
    trackEvent(
      config.analytics.categories.error,
      'Error',
      context,
      null,
      {
        error_message: message,
        ...details
      }
    );
  }
  
  /**
   * Track performance metric
   * @param {string} name - Metric name
   * @param {number} value - Metric value
   * @param {Object} params - Additional parameters (optional)
   */
  function trackPerformance(name, value, params = {}) {
    if (!trackingEnabled) return;
    
    trackEvent(
      config.analytics.categories.performance,
      'Performance',
      name,
      value,
      params
    );
  }
  
  /**
   * Queue an event for later processing
   * @param {string} eventName - Event name
   * @param {Object} eventParams - Event parameters
   */
  function queueEvent(eventName, eventParams) {
    // Add timestamp
    const event = {
      name: eventName,
      params: eventParams,
      timestamp: new Date().toISOString()
    };
    
    // Add to queue
    offlineQueue.push(event);
    
    // Save queue to storage
    saveOfflineEvents();
    
    utils.logger.debug(`Queued event: ${eventName}`);
  }
  
  /**
   * Save offline events to storage
   */
  function saveOfflineEvents() {
    if (offlineQueue.length === 0) return;
    
    try {
      storage.setLocalItem('analytics_offline_events', offlineQueue);
      utils.logger.debug(`Saved ${offlineQueue.length} offline events`);
    } catch (error) {
      utils.logger.error('Error saving offline events:', error);
      
      // If storage is full, keep only the most recent events
      if (error.name === 'QuotaExceededError') {
        offlineQueue = offlineQueue.slice(-50); // Keep last 50 events
        try {
          storage.setLocalItem('analytics_offline_events', offlineQueue);
        } catch (e) {
          // If still failing, clear the queue
          offlineQueue = [];
        }
      }
    }
  }
  
  /**
   * Load offline events from storage
   */
  function loadOfflineEvents() {
    try {
      const events = storage.getLocalItem('analytics_offline_events');
      
      if (events && Array.isArray(events)) {
        offlineQueue = events;
        utils.logger.debug(`Loaded ${offlineQueue.length} offline events`);
      }
    } catch (error) {
      utils.logger.error('Error loading offline events:', error);
    }
  }
  
  /**
   * Process offline events
   */
  function processOfflineEvents() {
    if (!trackingEnabled || !utils.isOnline() || !window.gtag) return;
    
    if (offlineQueue.length === 0) return;
    
    utils.logger.debug(`Processing ${offlineQueue.length} offline events`);
    
    // Process each event
    offlineQueue.forEach(event => {
      window.gtag('event', event.name, event.params);
    });
    
    // Clear queue
    offlineQueue = [];
    
    // Update storage
    storage.setLocalItem('analytics_offline_events', []);
    
    utils.logger.debug('Offline events processed');
  }
  
  // ─── Quiz-specific GA4 event helpers (Phase 7 — 7.1) ─────────────────────

  /**
   * Track quiz start event
   * @param {string} topicId   - Quiz topic / template ID
   * @param {string} quizType  - 'personality' | 'knowledge' | 'generated'
   */
  function trackQuizStart(topicId, quizType) {
    if (!trackingEnabled) return;
    if (window.gtag) {
      window.gtag('event', 'quiz_start', {
        topic_id:  topicId,
        quiz_type: quizType || 'knowledge',
        session_id: sessionId
      });
    } else {
      queueEvent('quiz_start', { topic_id: topicId, quiz_type: quizType || 'knowledge', session_id: sessionId });
    }
  }

  /**
   * Track quiz completion event
   * @param {string} topicId    - Quiz topic / template ID
   * @param {number} score      - Final numeric score (0 for personality quizzes)
   * @param {number} timeTaken  - Seconds taken to complete
   */
  function trackQuizComplete(topicId, score, timeTaken) {
    if (!trackingEnabled) return;
    if (window.gtag) {
      window.gtag('event', 'quiz_complete', {
        topic_id:   topicId,
        score:      score,
        time_taken: timeTaken,
        session_id: sessionId
      });
    } else {
      queueEvent('quiz_complete', { topic_id: topicId, score: score, time_taken: timeTaken, session_id: sessionId });
    }
  }

  /**
   * Track quiz abandonment event
   * @param {string} topicId         - Quiz topic / template ID
   * @param {number} questionReached - Last question index reached (0-based)
   */
  function trackQuizAbandon(topicId, questionReached) {
    if (!trackingEnabled) return;
    if (window.gtag) {
      window.gtag('event', 'quiz_abandon', {
        topic_id:         topicId,
        question_reached: questionReached,
        session_id:       sessionId
      });
    } else {
      queueEvent('quiz_abandon', { topic_id: topicId, question_reached: questionReached, session_id: sessionId });
    }
  }

  /**
   * Track a single question being answered
   * @param {string}  topicId       - Quiz topic / template ID
   * @param {number}  questionIndex - 0-based question index
   * @param {number}  timeSpent     - Seconds taken to answer
   * @param {boolean} correct       - Whether the answer was correct (null for personality)
   */
  function trackQuestionAnswered(topicId, questionIndex, timeSpent, correct) {
    if (!trackingEnabled) return;
    if (window.gtag) {
      window.gtag('event', 'question_answered', {
        topic_id:       topicId,
        question_index: questionIndex,
        time_spent:     timeSpent,
        correct:        correct,
        session_id:     sessionId
      });
    } else {
      queueEvent('question_answered', { topic_id: topicId, question_index: questionIndex, time_spent: timeSpent, correct: correct, session_id: sessionId });
    }
  }

  /**
   * Track a new user registration (conversion_signup)
   */
  function trackSignup() {
    if (!trackingEnabled) return;
    if (window.gtag) {
      window.gtag('event', 'conversion_signup', { session_id: sessionId });
    } else {
      queueEvent('conversion_signup', { session_id: sessionId });
    }
  }

  /**
   * Track a free user upgrading to premium (conversion_premium)
   */
  function trackPremiumUpgrade() {
    if (!trackingEnabled) return;
    if (window.gtag) {
      window.gtag('event', 'conversion_premium', { session_id: sessionId });
    } else {
      queueEvent('conversion_premium', { session_id: sessionId });
    }
  }

  /**
   * Track an application error (for use by QuizProsErrorReporter)
   * @param {string} errorMessage - Error message
   * @param {string} context      - Context / module where the error occurred
   */
  function trackAppError(errorMessage, context) {
    if (!trackingEnabled) return;
    if (window.gtag) {
      window.gtag('event', 'app_error', {
        error_message: String(errorMessage).slice(0, 150),
        error_context: context || 'unknown',
        session_id:    sessionId
      });
    } else {
      queueEvent('app_error', { error_message: String(errorMessage).slice(0, 150), error_context: context || 'unknown', session_id: sessionId });
    }
  }

  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Clear all analytics data
   */
  function clearAnalyticsData() {
    // Clear offline queue
    offlineQueue = [];
    
    // Clear storage
    storage.removeLocalItem('analytics_offline_events');
    
    // Generate new session ID
    sessionId = generateSessionId();
    
    utils.logger.debug('Analytics data cleared');
  }
  
  // Public API
  return {
    initialize: initialize,
    enableTracking: enableTracking,
    disableTracking: disableTracking,
    trackPageView: trackPageView,
    trackEvent: trackEvent,
    trackError: trackError,
    trackPerformance: trackPerformance,
    processOfflineEvents: processOfflineEvents,
    clearAnalyticsData: clearAnalyticsData,
    trackQuizStart: trackQuizStart,
    trackQuizComplete: trackQuizComplete,
    trackQuizAbandon: trackQuizAbandon,
    trackQuestionAnswered: trackQuestionAnswered,
    trackSignup: trackSignup,
    trackPremiumUpgrade: trackPremiumUpgrade,
    trackAppError: trackAppError,

    // For debugging
    getSessionId: function() {
      return sessionId;
    },
    getClientId: function() {
      return clientId;
    },
    getOfflineQueue: function() {
      return [...offlineQueue];
    }
  };
})();

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  QuizProsAnalytics.initialize();
});
