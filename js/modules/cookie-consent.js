/**
 * Cookie Consent Module for IQuizPros
 * Provides GDPR-compliant cookie consent functionality
 */

window.QuizProsCookieConsent = (function() {
  // Private variables
  const config = window.QuizProsConfig;
  const utils = window.QuizProsUtils;
  const storage = window.QuizProsStorage;
  
  // Consent state
  let consentGiven = false;
  let consentChoices = {
    necessary: true, // Always required
    preferences: false,
    analytics: false,
    marketing: false
  };
  
  // Banner element
  let bannerElement = null;
  
  /**
   * Initialize the cookie consent module
   */
  function initialize() {
    utils.logger.info('Initializing cookie consent module');
    
    // Load consent from storage
    loadConsent();
    
    // Show banner if consent not given
    if (!consentGiven) {
      // Delay banner to avoid immediate popup
      setTimeout(showConsentBanner, config.timing.cookieBannerDelay || 800);
    } else {
      // Apply saved consent choices
      applyConsent();
    }
    
    utils.logger.debug('Cookie consent module initialized');
  }
  
  /**
   * Load consent from storage
   */
  function loadConsent() {
    try {
      const savedConsent = storage.getLocalItem('cookie_consent');
      
      if (savedConsent) {
        consentGiven = true;
        consentChoices = { ...consentChoices, ...savedConsent.choices };
        
        utils.logger.debug('Loaded consent from storage:', consentChoices);
      } else {
        utils.logger.debug('No saved consent found');
      }
    } catch (error) {
      utils.logger.error('Error loading consent:', error);
    }
  }
  
  /**
   * Save consent to storage
   */
  function saveConsent() {
    try {
      const consentData = {
        version: config.cookieConsent.version,
        timestamp: new Date().toISOString(),
        choices: consentChoices
      };
      
      storage.setLocalItem('cookie_consent', consentData);
      utils.logger.debug('Saved consent to storage:', consentData);
    } catch (error) {
      utils.logger.error('Error saving consent:', error);
    }
  }
  
  /**
   * Apply consent choices
   */
  function applyConsent() {
    // Apply analytics consent
    if (window.QuizProsAnalytics) {
      if (consentChoices.analytics) {
        window.QuizProsAnalytics.enableTracking();
      } else {
        window.QuizProsAnalytics.disableTracking();
      }
    }
    
    // Apply marketing consent (for future use)
    
    // Dispatch consent event
    dispatchConsentEvent();
  }
  
  /**
   * Dispatch consent event
   */
  function dispatchConsentEvent() {
    const event = new CustomEvent('quizpros:consent:updated', {
      detail: {
        consentGiven,
        choices: { ...consentChoices }
      },
      bubbles: true
    });
    
    document.dispatchEvent(event);
  }
  
  /**
   * Show the consent banner
   */
  function showConsentBanner() {
    // Check if banner already exists
    if (bannerElement) {
      bannerElement.style.display = 'block';
      return;
    }
    
    // Create banner element
    bannerElement = document.createElement('div');
    bannerElement.className = 'cookie-consent-banner';
    bannerElement.setAttribute('role', 'dialog');
    bannerElement.setAttribute('aria-labelledby', 'cookie-consent-title');
    
    // Create banner content
    bannerElement.innerHTML = `
      <div class="cookie-consent-container">
        <div class="cookie-consent-content">
          <h2 id="cookie-consent-title">Cookie Preferences</h2>
          <p>We use cookies to enhance your experience, analyze site usage, and assist in our marketing efforts. By clicking "Accept All", you consent to our use of cookies.</p>
          
          <div class="cookie-consent-actions">
            <button id="cookie-accept-all" class="consent-btn primary">Accept All</button>
            <button id="cookie-reject-all" class="consent-btn secondary">Reject All</button>
            <button id="cookie-customize" class="consent-btn tertiary">Customize</button>
          </div>
          
          <div class="cookie-consent-footer">
            <a href="privacy-policy.html" class="consent-link">Privacy Policy</a>
            <a href="cookie-policy.html" class="consent-link">Cookie Policy</a>
          </div>
        </div>
      </div>
    `;
    
    // Add to page
    document.body.appendChild(bannerElement);
    
    // Add event listeners
    setupBannerEventListeners();
    
    // Track banner shown
    if (window.QuizProsAnalytics) {
      window.QuizProsAnalytics.trackEvent(
        config.analytics.categories.consent,
        'BannerShown',
        'Initial'
      );
    }
  }
  
  /**
   * Set up event listeners for the consent banner
   */
  function setupBannerEventListeners() {
    // Accept all button
    const acceptAllButton = document.getElementById('cookie-accept-all');
    if (acceptAllButton) {
      acceptAllButton.addEventListener('click', function() {
        acceptAllCookies();
        hideBanner();
        
        // Track event
        if (window.QuizProsAnalytics) {
          window.QuizProsAnalytics.trackEvent(
            config.analytics.categories.consent,
            'AcceptAll'
          );
        }
      });
    }
    
    // Reject all button
    const rejectAllButton = document.getElementById('cookie-reject-all');
    if (rejectAllButton) {
      rejectAllButton.addEventListener('click', function() {
        rejectAllCookies();
        hideBanner();
        
        // Track event
        if (window.QuizProsAnalytics) {
          window.QuizProsAnalytics.trackEvent(
            config.analytics.categories.consent,
            'RejectAll'
          );
        }
      });
    }
    
    // Customize button
    const customizeButton = document.getElementById('cookie-customize');
    if (customizeButton) {
      customizeButton.addEventListener('click', function() {
        showCookieSettings();
        
        // Track event
        if (window.QuizProsAnalytics) {
          window.QuizProsAnalytics.trackEvent(
            config.analytics.categories.consent,
            'OpenSettings',
            'Banner'
          );
        }
      });
    }
  }
  
  /**
   * Hide the consent banner
   */
  function hideBanner() {
    if (bannerElement) {
      bannerElement.classList.add('hiding');
      
      setTimeout(() => {
        bannerElement.style.display = 'none';
        bannerElement.classList.remove('hiding');
      }, 300);
    }
  }
  
  /**
   * Accept all cookies
   */
  function acceptAllCookies() {
    consentGiven = true;
    consentChoices = {
      necessary: true,
      preferences: true,
      analytics: true,
      marketing: true
    };
    
    saveConsent();
    applyConsent();
  }
  
  /**
   * Reject all cookies except necessary ones
   */
  function rejectAllCookies() {
    consentGiven = true;
    consentChoices = {
      necessary: true,
      preferences: false,
      analytics: false,
      marketing: false
    };
    
    saveConsent();
    applyConsent();
  }
  
  /**
   * Show cookie settings modal
   */
  function showCookieSettings() {
    // Hide banner if visible
    hideBanner();
    
    // Create modal HTML
    const modalHTML = `
      <div class="cookie-settings-modal">
        <div class="cookie-settings-content">
          <div class="cookie-settings-header">
            <h2>Cookie Settings</h2>
            <button class="cookie-settings-close">&times;</button>
          </div>
          <div class="cookie-settings-body">
            <p>Manage your cookie preferences. Necessary cookies are always enabled.</p>
            
            <div class="cookie-settings-options">
              ${Object.entries(config.cookieConsent.categories).map(([key, category]) => `
                <div class="cookie-option">
                  <div class="cookie-option-header">
                    <label class="cookie-switch">
                      <input type="checkbox" name="cookie-${key}" ${key === 'necessary' ? 'checked disabled' : consentChoices[key] ? 'checked' : ''}>
                      <span class="cookie-slider"></span>
                    </label>
                    <h3>${category.name}</h3>
                  </div>
                  <p>${category.description}</p>
                </div>
              `).join('')}
            </div>
          </div>
          <div class="cookie-settings-footer">
            <button class="cookie-settings-save">${config.cookieConsent.texts.savePreferences}</button>
          </div>
        </div>
      </div>
    `;
    
    // Create modal element
    const modalElement = document.createElement('div');
    modalElement.className = 'cookie-settings-container';
    modalElement.innerHTML = modalHTML;
    document.body.appendChild(modalElement);
    
    // Add event listeners
    const closeBtn = modalElement.querySelector('.cookie-settings-close');
    const saveBtn = modalElement.querySelector('.cookie-settings-save');
    
    // Close modal function
    const closeModal = () => {
      modalElement.classList.add('closing');
      setTimeout(() => {
        document.body.removeChild(modalElement);
      }, 300);
    };
    
    // Add event listeners
    closeBtn.addEventListener('click', closeModal);
    
    // Save button
    saveBtn.addEventListener('click', () => {
      // Get selected options
      const preferences = modalElement.querySelector('input[name="cookie-preferences"]').checked;
      const analytics = modalElement.querySelector('input[name="cookie-analytics"]').checked;
      const marketing = modalElement.querySelector('input[name="cookie-marketing"]').checked;
      
      // Update consent choices
      consentGiven = true;
      consentChoices = {
        necessary: true,
        preferences: preferences,
        analytics: analytics,
        marketing: marketing
      };
      
      // Save and apply consent
      saveConsent();
      applyConsent();
      
      // Close modal
      closeModal();
      
      // Track event
      if (window.QuizProsAnalytics) {
        window.QuizProsAnalytics.trackEvent(
          config.analytics.categories.consent,
          'SavePreferences',
          `analytics:${analytics},marketing:${marketing},preferences:${preferences}`
        );
      }
    });
    
    // Show modal with animation
    setTimeout(() => {
      modalElement.classList.add('visible');
    }, 10);
  }
  
  /**
   * Check if consent has been given
   * @returns {boolean} Whether consent has been given
   */
  function hasConsent() {
    return consentGiven;
  }
  
  /**
   * Check if a specific consent category has been accepted
   * @param {string} category - Consent category
   * @returns {boolean} Whether the category has been accepted
   */
  function hasConsentFor(category) {
    return consentGiven && consentChoices[category] === true;
  }
  
  /**
   * Get all consent choices
   * @returns {Object} Consent choices
   */
  function getConsentChoices() {
    return { ...consentChoices };
  }
  
  /**
   * Reset consent
   */
  function resetConsent() {
    consentGiven = false;
    consentChoices = {
      necessary: true,
      preferences: false,
      analytics: false,
      marketing: false
    };
    
    // Remove from storage
    storage.removeLocalItem('cookie_consent');
    
    // Show banner again
    showConsentBanner();
    
    // Apply consent
    applyConsent();
  }
  
  // Public API
  return {
    initialize: initialize,
    showConsentBanner: showConsentBanner,
    showCookieSettings: showCookieSettings,
    acceptAllCookies: acceptAllCookies,
    rejectAllCookies: rejectAllCookies,
    resetConsent: resetConsent,
    hasConsent: hasConsent,
    hasConsentFor: hasConsentFor,
    getConsentChoices: getConsentChoices
  };
})();

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  QuizProsCookieConsent.initialize();
});
