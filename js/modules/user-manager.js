/**
 * User Manager Module for IQuizPros
 * Handles user authentication, profiles, and premium access
 */

window.QuizProsUserManager = (function() {
  // Private variables
  const config = window.QuizProsConfig;
  const utils = window.QuizProsUtils;
  const storage = window.QuizProsStorage;
  
  // User state
  let currentUser = null;
  let isAuthenticated = false;
  let premiumStatus = {
    hasPremium: false,
    tier: null,
    expiresAt: null
  };
  
  // Quiz history
  let quizHistory = [];
  
  /**
   * Initialize the user manager
   */
  function initialize() {
    utils.logger.info('Initializing user manager');
    
    // Load user data from storage
    loadUserData();
    
    // Set up event listeners
    setupEventListeners();
    
    utils.logger.debug('User manager initialized');
  }
  
  /**
   * Set up event listeners
   */
  function setupEventListeners() {
    // Listen for storage changes
    window.addEventListener('storage', function(event) {
      if (event.key === 'user_data') {
        loadUserData();
      }
    });
    
    // Listen for premium status changes
    document.addEventListener('quizpros:premium:subscribed', function(event) {
      updatePremiumStatus(event.detail);
    });
    
    // Listen for authentication changes
    document.addEventListener('quizpros:auth:signed_in', function(event) {
      handleSignIn(event.detail);
    });
    
    document.addEventListener('quizpros:auth:signed_out', function() {
      handleSignOut();
    });
  }
  
  /**
   * Load user data from storage
   */
  function loadUserData() {
    try {
      // Load user data
      const userData = storage.getLocalItem('user_data');
      
      if (userData) {
        currentUser = userData.user || null;
        isAuthenticated = !!currentUser;
        premiumStatus = userData.premium || {
          hasPremium: false,
          tier: null,
          expiresAt: null
        };
        quizHistory = userData.quizHistory || [];
        
        utils.logger.debug('Loaded user data from storage');
      } else {
        utils.logger.debug('No user data found in storage');
      }
    } catch (error) {
      utils.logger.error('Error loading user data:', error);
    }
  }
  
  /**
   * Save user data to storage
   */
  function saveUserData() {
    try {
      const userData = {
        user: currentUser,
        premium: premiumStatus,
        quizHistory: quizHistory
      };
      
      storage.setLocalItem('user_data', userData);
      utils.logger.debug('Saved user data to storage');
    } catch (error) {
      utils.logger.error('Error saving user data:', error);
    }
  }
  
  /**
   * Handle user sign in
   * @param {Object} user - User data
   */
  function handleSignIn(user) {
    currentUser = user;
    isAuthenticated = true;
    
    // Save user data
    saveUserData();
    
    // Dispatch event
    dispatchEvent('authenticated', user);
    
    utils.logger.info('User signed in:', user.id);
  }
  
  /**
   * Handle user sign out
   */
  function handleSignOut() {
    currentUser = null;
    isAuthenticated = false;
    premiumStatus = {
      hasPremium: false,
      tier: null,
      expiresAt: null
    };
    
    // Save user data
    saveUserData();
    
    // Dispatch event
    dispatchEvent('signedOut');
    
    utils.logger.info('User signed out');
  }
  
  /**
   * Update premium status
   * @param {Object} status - Premium status
   */
  function updatePremiumStatus(status) {
    premiumStatus = {
      hasPremium: true,
      tier: status.tier || 'basic',
      expiresAt: status.expiresAt || null
    };
    
    // Save user data
    saveUserData();
    
    // Dispatch event
    dispatchEvent('premiumUpdated', premiumStatus);
    
    utils.logger.info('Premium status updated:', premiumStatus);
  }
  
  /**
   * Dispatch a custom event
   * @param {string} eventName - Event name
   * @param {Object} data - Event data
   */
  function dispatchEvent(eventName, data = {}) {
    const event = new CustomEvent(`quizpros:user:${eventName}`, {
      detail: data,
      bubbles: true
    });
    
    document.dispatchEvent(event);
  }
  
  /**
   * Add event listener
   * @param {string} eventName - Event name
   * @param {Function} callback - Event callback
   */
  function addEventListener(eventName, callback) {
    document.addEventListener(`quizpros:user:${eventName}`, callback);
  }
  
  /**
   * Remove event listener
   * @param {string} eventName - Event name
   * @param {Function} callback - Event callback
   */
  function removeEventListener(eventName, callback) {
    document.removeEventListener(`quizpros:user:${eventName}`, callback);
  }
  
  /**
   * Check if user has premium access
   * @returns {boolean} Whether user has premium access
   */
  function hasPremiumAccess() {
    // Check if premium status is valid
    if (!premiumStatus.hasPremium) {
      return false;
    }
    
    // Check if premium has expired
    if (premiumStatus.expiresAt) {
      const now = new Date();
      const expiresAt = new Date(premiumStatus.expiresAt);
      
      if (now > expiresAt) {
        // Premium has expired
        premiumStatus.hasPremium = false;
        saveUserData();
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * Check if user has access to a specific quiz
   * @param {string} quizId - Quiz ID
   * @returns {boolean} Whether user has access to the quiz
   */
  function hasQuizAccess(quizId) {
    // Get quiz data
    const topics = window.QuizProsTopics ? window.QuizProsTopics.getTopics() : [];
    const quiz = topics.find(t => t.id === quizId);
    
    // If quiz doesn't exist or isn't premium, allow access
    if (!quiz || !quiz.isPremium) {
      return true;
    }
    
    // Check if user has premium access
    if (!hasPremiumAccess()) {
      return false;
    }
    
    // Check if user's premium tier is sufficient
    if (quiz.premiumTier === 'plus' && premiumStatus.tier !== 'plus') {
      return false;
    }
    
    return true;
  }
  
  /**
   * Save quiz result to history
   * @param {string} quizId - Quiz ID
   * @param {Object} result - Quiz result
   */
  function saveQuizResult(quizId, result) {
    // Add timestamp if not provided
    if (!result.timestamp) {
      result.timestamp = new Date().toISOString();
    }
    
    // Add quiz ID if not provided
    if (!result.quizId) {
      result.quizId = quizId;
    }
    
    // Add to history
    quizHistory.unshift({
      quizId,
      result,
      userId: currentUser ? currentUser.id : null
    });
    
    // Limit history size
    if (quizHistory.length > 50) {
      quizHistory = quizHistory.slice(0, 50);
    }
    
    // Save user data (localStorage)
    saveUserData();

    // Also write to Firestore for authenticated users (powers premium dashboard)
    _writeQuizHistoryToFirestore(quizId, result);

    utils.logger.debug(`Saved quiz result for ${quizId}`);
  }

  /**
   * Write a quiz history entry to Firestore users/{uid}/quizHistory/{docId}.
   * Silently no-ops when user is unauthenticated or Firebase is unavailable.
   * @private
   */
  function _writeQuizHistoryToFirestore(quizId, result) {
    try {
      if (!window.firebase || !firebase.auth || !firebase.firestore) return;
      const user = firebase.auth().currentUser;
      if (!user) return;

      const entry = {
        quizId:          quizId,
        quizTitle:       result.quizTitle || quizId,
        score:           result.score !== undefined ? result.score : null,
        total:           result.total || null,
        personalityType: result.personalityType || null,
        completedAt:     firebase.firestore.FieldValue.serverTimestamp()
      };

      firebase.firestore()
        .collection('users').doc(user.uid)
        .collection('quizHistory')
        .add(entry)
        .then(function() {
          utils.logger.debug('Quiz history written to Firestore for uid=' + user.uid);
        })
        .catch(function(err) {
          utils.logger.warn('Firestore quizHistory write failed (non-critical):', err);
        });
    } catch (err) {
      utils.logger.warn('_writeQuizHistoryToFirestore error (non-critical):', err);
    }
  }
  
  /**
   * Get quiz history
   * @param {string} quizId - Quiz ID (optional)
   * @returns {Array} Quiz history
   */
  function getQuizHistory(quizId) {
    if (quizId) {
      return quizHistory.filter(item => item.quizId === quizId);
    }
    
    return [...quizHistory];
  }
  
  /**
   * Clear quiz history
   */
  function clearQuizHistory() {
    quizHistory = [];
    saveUserData();
    utils.logger.debug('Cleared quiz history');
  }
  
  /**
   * Show premium signup modal
   * @param {string} tier - Premium tier to show
   */
  function showPremiumSignup(tier = 'basic') {
    // Check if premium module is available
    if (window.QuizProsPremium && window.QuizProsPremium.showSignupModal) {
      window.QuizProsPremium.showSignupModal(tier);
      return;
    }
    
    // Fallback: create a simple modal
    const modalHTML = `
      <div class="premium-modal">
        <div class="premium-modal-content">
          <div class="premium-modal-header">
            <h2>Upgrade to Premium ${tier.charAt(0).toUpperCase() + tier.slice(1)}</h2>
            <button class="premium-modal-close">&times;</button>
          </div>
          <div class="premium-modal-body">
            <div class="premium-features">
              <h3>Premium Features</h3>
              <ul>
                ${config.premium.tiers[tier].features.map(feature => `<li>${feature}</li>`).join('')}
              </ul>
            </div>
            <div class="premium-pricing">
              <div class="premium-price">
                <span class="currency">$</span>
                <span class="amount">${config.premium.tiers[tier].price}</span>
                <span class="period">/month</span>
              </div>
            </div>
          </div>
          <div class="premium-modal-footer">
            <button class="premium-subscribe-btn">Subscribe Now</button>
            <button class="premium-cancel-btn">Maybe Later</button>
          </div>
        </div>
      </div>
    `;
    
    // Create modal element
    const modalElement = document.createElement('div');
    modalElement.className = 'premium-modal-container';
    modalElement.innerHTML = modalHTML;
    document.body.appendChild(modalElement);
    
    // Add event listeners
    const closeBtn = modalElement.querySelector('.premium-modal-close');
    const cancelBtn = modalElement.querySelector('.premium-cancel-btn');
    const subscribeBtn = modalElement.querySelector('.premium-subscribe-btn');
    
    // Close modal function
    const closeModal = () => {
      modalElement.classList.add('closing');
      setTimeout(() => {
        document.body.removeChild(modalElement);
      }, 300);
    };
    
    // Add event listeners
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    
    // Subscribe button
    subscribeBtn.addEventListener('click', () => {
      // For demo purposes, simulate successful subscription
      updatePremiumStatus({
        tier: tier,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
      });
      
      // Show success message
      modalElement.innerHTML = `
        <div class="premium-modal">
          <div class="premium-modal-content">
            <div class="premium-modal-header">
              <h2>Subscription Successful!</h2>
              <button class="premium-modal-close">&times;</button>
            </div>
            <div class="premium-modal-body">
              <div class="premium-success">
                <div class="premium-success-icon">✓</div>
                <p>Thank you for subscribing to Premium ${tier.charAt(0).toUpperCase() + tier.slice(1)}!</p>
                <p>Your premium features are now active.</p>
              </div>
            </div>
            <div class="premium-modal-footer">
              <button class="premium-close-btn">Start Exploring</button>
            </div>
          </div>
        </div>
      `;
      
      // Add event listeners to new buttons
      modalElement.querySelector('.premium-modal-close').addEventListener('click', closeModal);
      modalElement.querySelector('.premium-close-btn').addEventListener('click', closeModal);
      
      // Track subscription event using safe analytics wrapper
      utils.analytics.trackEvent(
        config.analytics.categories.premium,
        'Subscribed',
        tier
      );
    });
    
    // Show modal with animation
    setTimeout(() => {
      modalElement.classList.add('visible');
    }, 10);
  }
  
  // Public API
  return {
    initialize: initialize,
    hasPremiumAccess: hasPremiumAccess,
    hasQuizAccess: hasQuizAccess,
    saveQuizResult: saveQuizResult,
    getQuizHistory: getQuizHistory,
    clearQuizHistory: clearQuizHistory,
    showPremiumSignup: showPremiumSignup,
    addEventListener: addEventListener,
    removeEventListener: removeEventListener,
    
    // For debugging
    getCurrentUser: function() {
      return currentUser;
    },
    getPremiumStatus: function() {
      return { ...premiumStatus };
    }
  };
})();

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  QuizProsUserManager.initialize();
});
