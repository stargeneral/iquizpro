/**
 * Premium Badge Component for IQuizPros
 * Provides UI components for displaying premium status and badges
 */

window.QuizProsPremiumBadge = (function() {
  // Private variables
  const config = window.QuizProsConfig;
  const utils = window.QuizProsUtils;
  
  /**
   * Create a premium badge element
   * @param {Object} options - Badge options
   * @param {string} options.size - Badge size ('small', 'medium', 'large')
   * @param {string} options.position - Badge position ('top-right', 'top-left', 'bottom-right', 'bottom-left')
   * @param {string} options.text - Badge text (optional)
   * @param {string} options.tier - Premium tier ('basic', 'plus')
   * @returns {HTMLElement} Premium badge element
   */
  function createBadge(options = {}) {
    const defaultOptions = {
      size: 'medium',
      position: 'top-right',
      text: '',
      tier: 'basic'
    };
    
    const badgeOptions = { ...defaultOptions, ...options };
    
    // Create badge element
    const badge = document.createElement('div');
    badge.className = `premium-badge premium-badge-${badgeOptions.size} premium-badge-${badgeOptions.position} premium-badge-${badgeOptions.tier}`;
    
    // Add content based on size
    if (badgeOptions.size === 'small') {
      badge.innerHTML = '<i class="fas fa-crown"></i>';
    } else {
      badge.innerHTML = badgeOptions.text ? 
        `<i class="fas fa-crown"></i> ${badgeOptions.text}` : 
        '<i class="fas fa-crown"></i> Premium';
    }
    
    return badge;
  }
  
  /**
   * Add a premium badge to an element
   * @param {HTMLElement|string} element - Element or element ID to add badge to
   * @param {Object} options - Badge options
   * @returns {HTMLElement|null} The element with badge added, or null if element not found
   */
  function addBadgeTo(element, options = {}) {
    // Get element if string was provided
    const el = typeof element === 'string' ? document.getElementById(element) : element;
    
    if (!el) {
      utils.logger.warn(`Element not found: ${element}`);
      return null;
    }
    
    // Create badge
    const badge = createBadge(options);
    
    // Add badge to element
    el.classList.add('premium-badge-container');
    el.appendChild(badge);
    
    return el;
  }
  
  /**
   * Create a premium lock overlay for content
   * @param {Object} options - Overlay options
   * @param {string} options.tier - Required premium tier ('basic', 'plus')
   * @param {string} options.message - Custom message (optional)
   * @param {Function} options.onUnlock - Callback when unlock button is clicked (optional)
   * @returns {HTMLElement} Premium lock overlay element
   */
  function createLockOverlay(options = {}) {
    const defaultOptions = {
      tier: 'basic',
      message: '',
      onUnlock: null
    };
    
    const overlayOptions = { ...defaultOptions, ...options };
    
    // Create overlay element
    const overlay = document.createElement('div');
    overlay.className = 'premium-locked-overlay';
    
    // Default message if not provided
    const message = overlayOptions.message || `This content requires Premium ${overlayOptions.tier.charAt(0).toUpperCase() + overlayOptions.tier.slice(1)}`;
    
    // Create overlay content
    overlay.innerHTML = `
      <div class="premium-locked-content">
        <div class="premium-lock-icon"><i class="fas fa-lock"></i></div>
        <div class="premium-lock-text">${message}</div>
        <button class="premium-unlock-btn">Unlock Premium</button>
      </div>
    `;
    
    // Add event listener to unlock button
    const unlockBtn = overlay.querySelector('.premium-unlock-btn');
    unlockBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      // Call onUnlock callback if provided
      if (typeof overlayOptions.onUnlock === 'function') {
        overlayOptions.onUnlock(overlayOptions.tier);
      } else if (window.QuizProsPremium && window.QuizProsPremium.showSignupModal) {
        // Default behavior: show premium signup modal
        window.QuizProsPremium.showSignupModal(overlayOptions.tier);
      }
    });
    
    return overlay;
  }
  
  /**
   * Add a premium lock overlay to an element
   * @param {HTMLElement|string} element - Element or element ID to add overlay to
   * @param {Object} options - Overlay options
   * @returns {HTMLElement|null} The element with overlay added, or null if element not found
   */
  function addLockOverlayTo(element, options = {}) {
    // Get element if string was provided
    const el = typeof element === 'string' ? document.getElementById(element) : element;
    
    if (!el) {
      utils.logger.warn(`Element not found: ${element}`);
      return null;
    }
    
    // Create overlay
    const overlay = createLockOverlay(options);
    
    // Add overlay to element
    el.classList.add('premium-locked-container');
    el.appendChild(overlay);
    
    return el;
  }
  
  /**
   * Check if content is premium and show appropriate UI
   * @param {HTMLElement|string} element - Element or element ID to check
   * @param {string} contentId - Content ID
   * @param {string} contentType - Content type
   * @param {string} requiredTier - Required premium tier
   * @returns {boolean} Whether content is accessible
   */
  function checkPremiumContent(element, contentId, contentType, requiredTier = 'basic') {
    // Get element if string was provided
    const el = typeof element === 'string' ? document.getElementById(element) : element;
    
    if (!el) {
      utils.logger.warn(`Element not found: ${element}`);
      return false;
    }
    
    // Check if premium module is available
    if (window.QuizProsPremium) {
      // Check if user has access to this tier
      const hasAccess = window.QuizProsPremium.hasTierAccess(requiredTier);
      
      // If user has access, just add a badge
      if (hasAccess) {
        addBadgeTo(el, { size: 'small', tier: requiredTier });
        return true;
      }
      
      // If user doesn't have access, add locked overlay
      addLockOverlayTo(el, {
        tier: requiredTier,
        onUnlock: function(tier) {
          // Show premium signup modal
          if (window.QuizProsPremium.showSignupModal) {
            window.QuizProsPremium.showSignupModal(tier);
          }
          
          // Track event
          if (window.QuizProsAnalytics) {
            window.QuizProsAnalytics.trackEvent(
              config.analytics.categories.premium,
              'UnlockAttempt',
              `${contentType}:${contentId}`
            );
          }
        }
      });
      
      return false;
    } else {
      // If premium module is not available, assume content is accessible
      return true;
    }
  }
  
  /**
   * Create a premium feature tag
   * @param {string} text - Tag text
   * @param {string} tier - Premium tier ('basic', 'plus')
   * @returns {HTMLElement} Premium feature tag element
   */
  function createFeatureTag(text, tier = 'basic') {
    // Create tag element
    const tag = document.createElement('div');
    tag.className = `premium-feature-tag premium-feature-tag-${tier}`;
    tag.innerHTML = `<i class="fas fa-crown"></i> ${text}`;
    
    return tag;
  }
  
  // Public API
  return {
    createBadge: createBadge,
    addBadgeTo: addBadgeTo,
    createLockOverlay: createLockOverlay,
    addLockOverlayTo: addLockOverlayTo,
    checkPremiumContent: checkPremiumContent,
    createFeatureTag: createFeatureTag
  };
})();

// No auto-initialization since this is just a component library
