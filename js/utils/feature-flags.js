/**
 * Feature Flags Utility for IQuizPros
 * Provides functionality for managing feature flags and A/B testing
 */

window.QuizProsFeatureFlags = (function() {
  // Private variables
  const config = window.QuizProsConfig;
  const utils = window.QuizProsUtils;
  const storage = window.QuizProsStorage;
  
  // Feature flags state
  let flags = {};
  let abTests = {};
  
  /**
   * Initialize feature flags
   */
  function initialize() {
    utils.logger.info('Initializing feature flags');
    
    // Load default flags from config
    if (config && config.features) {
      flags = { ...config.features };
      utils.logger.debug('Loaded default feature flags from config');
    }
    
    // Load saved flags from storage
    loadFlags();
    
    // Set up A/B tests
    setupABTests();
    
    utils.logger.debug('Feature flags initialized');
  }
  
  /**
   * Load flags from storage
   */
  function loadFlags() {
    try {
      const savedFlags = storage.getLocalItem('feature_flags');
      
      if (savedFlags) {
        // Merge saved flags with defaults
        flags = { ...flags, ...savedFlags };
        utils.logger.debug('Loaded feature flags from storage');
      }
    } catch (error) {
      utils.logger.error('Error loading feature flags:', error);
    }
  }
  
  /**
   * Save flags to storage
   */
  function saveFlags() {
    try {
      storage.setLocalItem('feature_flags', flags);
      utils.logger.debug('Saved feature flags to storage');
    } catch (error) {
      utils.logger.error('Error saving feature flags:', error);
    }
  }
  
  /**
   * Set up A/B tests
   */
  function setupABTests() {
    // Define A/B tests
    abTests = {
      newQuizLayout: {
        name: 'New Quiz Layout',
        variants: ['control', 'variant'],
        weights: [0.5, 0.5], // 50/50 split
        flagName: 'newQuizLayout'
      },
      enhancedResults: {
        name: 'Enhanced Results',
        variants: ['control', 'variant'],
        weights: [0.5, 0.5], // 50/50 split
        flagName: 'enhancedResults'
      }
    };
    
    // Assign variants for each test
    Object.keys(abTests).forEach(testId => {
      assignTestVariant(testId);
    });
  }
  
  /**
   * Assign a variant for an A/B test
   * @param {string} testId - Test ID
   */
  function assignTestVariant(testId) {
    const test = abTests[testId];
    if (!test) return;
    
    // Check if variant is already assigned
    const savedVariant = storage.getLocalItem(`ab_test_${testId}`);
    if (savedVariant) {
      // Use saved variant
      const variantIndex = test.variants.indexOf(savedVariant);
      if (variantIndex !== -1) {
        // Set flag based on variant
        if (test.flagName) {
          flags[test.flagName] = savedVariant === 'variant';
        }
        
        utils.logger.debug(`Using saved A/B test variant for ${testId}: ${savedVariant}`);
        return;
      }
    }
    
    // Assign new variant based on weights
    const random = Math.random();
    let cumulativeWeight = 0;
    let selectedVariant = test.variants[0]; // Default to first variant
    
    for (let i = 0; i < test.variants.length; i++) {
      cumulativeWeight += test.weights[i];
      if (random < cumulativeWeight) {
        selectedVariant = test.variants[i];
        break;
      }
    }
    
    // Save variant
    storage.setLocalItem(`ab_test_${testId}`, selectedVariant);
    
    // Set flag based on variant
    if (test.flagName) {
      flags[test.flagName] = selectedVariant === 'variant';
    }
    
    utils.logger.debug(`Assigned A/B test variant for ${testId}: ${selectedVariant}`);
    
    // Track assignment if analytics is available
    if (window.QuizProsAnalytics) {
      window.QuizProsAnalytics.trackEvent(
        'ABTest',
        'Assignment',
        `${testId}:${selectedVariant}`
      );
    }
  }
  
  /**
   * Check if a feature is enabled
   * @param {string} flagName - Feature flag name
   * @returns {boolean} Whether the feature is enabled
   */
  function isEnabled(flagName) {
    return flags[flagName] === true;
  }
  
  /**
   * Get the value of a feature flag
   * @param {string} flagName - Feature flag name
   * @returns {*} Feature flag value
   */
  function getFlag(flagName) {
    return flags[flagName];
  }
  
  /**
   * Set a feature flag
   * @param {string} flagName - Feature flag name
   * @param {*} value - Feature flag value
   */
  function setFlag(flagName, value) {
    flags[flagName] = value;
    saveFlags();
    
    // Dispatch event
    dispatchFlagEvent(flagName, value);
    
    utils.logger.debug(`Set feature flag ${flagName} to ${value}`);
  }
  
  /**
   * Toggle a boolean feature flag
   * @param {string} flagName - Feature flag name
   * @returns {boolean} New flag value
   */
  function toggleFlag(flagName) {
    const newValue = !flags[flagName];
    setFlag(flagName, newValue);
    return newValue;
  }
  
  /**
   * Reset a feature flag to its default value
   * @param {string} flagName - Feature flag name
   */
  function resetFlag(flagName) {
    if (config && config.features && flagName in config.features) {
      setFlag(flagName, config.features[flagName]);
    } else {
      // If no default, remove the flag
      delete flags[flagName];
      saveFlags();
    }
    
    utils.logger.debug(`Reset feature flag ${flagName} to default`);
  }
  
  /**
   * Reset all feature flags to their default values
   */
  function resetAllFlags() {
    if (config && config.features) {
      flags = { ...config.features };
      saveFlags();
    }
    
    utils.logger.debug('Reset all feature flags to defaults');
  }
  
  /**
   * Get all feature flags
   * @returns {Object} All feature flags
   */
  function getAllFlags() {
    return { ...flags };
  }
  
  /**
   * Get all A/B tests
   * @returns {Object} All A/B tests
   */
  function getAllTests() {
    const tests = {};
    
    Object.keys(abTests).forEach(testId => {
      const test = abTests[testId];
      const variant = storage.getLocalItem(`ab_test_${testId}`);
      
      tests[testId] = {
        name: test.name,
        variant: variant || 'unknown'
      };
    });
    
    return tests;
  }
  
  /**
   * Get the variant for an A/B test
   * @param {string} testId - Test ID
   * @returns {string|null} Test variant
   */
  function getTestVariant(testId) {
    if (!abTests[testId]) return null;
    return storage.getLocalItem(`ab_test_${testId}`);
  }
  
  /**
   * Override an A/B test variant
   * @param {string} testId - Test ID
   * @param {string} variant - Variant to set
   */
  function overrideTestVariant(testId, variant) {
    const test = abTests[testId];
    if (!test) return;
    
    if (test.variants.includes(variant)) {
      // Save variant
      storage.setLocalItem(`ab_test_${testId}`, variant);
      
      // Set flag based on variant
      if (test.flagName) {
        flags[test.flagName] = variant === 'variant';
        saveFlags();
      }
      
      utils.logger.debug(`Overrode A/B test variant for ${testId}: ${variant}`);
      
      // Track override if analytics is available
      if (window.QuizProsAnalytics) {
        window.QuizProsAnalytics.trackEvent(
          'ABTest',
          'Override',
          `${testId}:${variant}`
        );
      }
    } else {
      utils.logger.warn(`Invalid variant for test ${testId}: ${variant}`);
    }
  }
  
  /**
   * Reset an A/B test to assign a new random variant
   * @param {string} testId - Test ID
   */
  function resetTest(testId) {
    if (!abTests[testId]) return;
    
    // Remove saved variant
    storage.removeLocalItem(`ab_test_${testId}`);
    
    // Assign new variant
    assignTestVariant(testId);
    
    utils.logger.debug(`Reset A/B test ${testId}`);
  }
  
  /**
   * Dispatch a feature flag change event
   * @param {string} flagName - Feature flag name
   * @param {*} value - New flag value
   */
  function dispatchFlagEvent(flagName, value) {
    const event = new CustomEvent('quizpros:feature:changed', {
      detail: {
        flag: flagName,
        value: value
      },
      bubbles: true
    });
    
    document.dispatchEvent(event);
  }
  
  // Public API
  return {
    initialize: initialize,
    isEnabled: isEnabled,
    getFlag: getFlag,
    setFlag: setFlag,
    toggleFlag: toggleFlag,
    resetFlag: resetFlag,
    resetAllFlags: resetAllFlags,
    getAllFlags: getAllFlags,
    getAllTests: getAllTests,
    getTestVariant: getTestVariant,
    overrideTestVariant: overrideTestVariant,
    resetTest: resetTest
  };
})();

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  QuizProsFeatureFlags.initialize();
});
