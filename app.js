/**
 * Main Application Entry Point for IQuizPros
 * Initializes and coordinates all modules and components
 */

document.addEventListener('DOMContentLoaded', function() {
  // Initialize the application
  initApp();
});

/**
 * Initialize the application
 */
function initApp() {
  console.log('Initializing IQuizPros application');
  
  try {
    // Initialize configuration
    if (window.QuizProsConfig) {
      console.log(`IQuizPros v${window.QuizProsConfig.app.version} initializing`);
    } else {
      console.error('QuizProsConfig not found');
      return;
    }
    
    // Initialize utilities
    if (window.QuizProsUtils) {
      window.QuizProsUtils.logger.info('Application startup');
      window.QuizProsUtils.performance.startMeasure('appInitialization');
    } else {
      console.error('QuizProsUtils not found');
      return;
    }
    
    // Initialize storage (required by many other modules)
    if (window.QuizProsStorage) {
      console.log('Storage module available');
    } else {
      console.warn('QuizProsStorage not found, some features may be limited');
    }
    
    // Initialize feature flags
    if (window.QuizProsFeatureFlags) {
      window.QuizProsFeatureFlags.initialize();
    } else {
      console.warn('QuizProsFeatureFlags not found, using default features');
    }
    
    // Initialize topics (required by quiz engine)
    if (window.QuizProsTopics) {
      window.QuizProsTopics.initialize();
      // Directly initialize quiz templates after topics are initialized
      initializeQuizTemplates();
    } else {
      console.error('QuizProsTopics not found');
      return;
    }
    
    // Initialize audio
    if (window.QuizProsAudio) {
      window.QuizProsAudio.initialize();
    } else {
      console.warn('QuizProsAudio not found, audio features will be disabled');
    }
    
    // Initialize analytics
    if (window.QuizProsAnalytics) {
      window.QuizProsAnalytics.initialize();
      window.QuizProsAnalytics.trackPageView('App Loaded', window.location.pathname);
    } else {
      console.warn('QuizProsAnalytics not found, analytics will be disabled');
    }
    
    // Initialize user manager
    if (window.QuizProsUserManager) {
      window.QuizProsUserManager.initialize();
    } else {
      console.warn('QuizProsUserManager not found, user features will be limited');
    }
    
    // Initialize premium features
    if (window.QuizProsPremium) {
      window.QuizProsPremium.initialize();
    } else {
      console.warn('QuizProsPremium not found, premium features will be disabled');
    }
    
    // Initialize UI components
    if (window.QuizProsHeader) {
      window.QuizProsHeader.initializeHeader();
    }
    
    if (window.QuizProsFooter) {
      window.QuizProsFooter.initializeFooter();
    }
    
    // Initialize UI manager
    if (window.QuizProsUI) {
      window.QuizProsUI.init();
    } else {
      console.error('QuizProsUI not found');
      return;
    }
    
    // Initialize quiz engine
    if (window.QuizProsEngine) {
      window.QuizProsEngine.init();
    } else {
      console.error('QuizProsEngine not found');
      return;
    }
    
    console.log('Application initialization complete');
  } catch (error) {
    console.error('Error initializing application:', error);
  }

  // Add event listeners for navigation
  setupEventListeners();

  // Register service worker and show install prompt after first quiz completion
  _initServiceWorker();
  document.addEventListener('quizpros:quiz:completed', function() {
    // Delay slightly so the results screen is fully rendered first
    setTimeout(_showInstallPromptSheet, 2000);
  }, { once: true }); // only attach the first time

  // Phase 9 + 10.2: Daily challenge completion tracking
  document.addEventListener('quizpros:quiz:completed', function(e) {
    var quizId = e.detail && e.detail.quizId;
    if (!quizId || (e.detail && e.detail.isPersonality)) return;
    var correctCount = (e.detail && e.detail.correctCount != null) ? e.detail.correctCount : null;
    if (window.QuizProsUI && window.QuizProsUI.completeDailyChallenge) {
      window.QuizProsUI.completeDailyChallenge(quizId, correctCount);
    }
  });

  // End performance measurement
  if (window.QuizProsUtils) {
    window.QuizProsUtils.performance.endMeasure('appInitialization');
  }
}
// Add this to your app.js, just after initApp() is called
document.addEventListener('DOMContentLoaded', function() {
  // Give the app some time to initialize, then check if we're still on loading screen
  setTimeout(() => {
    // Fix: Use Array.from with filter instead of invalid :contains() selector
    const loadingMessages = Array.from(document.querySelectorAll('h3')).filter(el => 
      el.textContent.includes('Loading quiz topics...')
    );
    if (loadingMessages.length > 0) {
      console.log('Detected stuck loading screen, forcing UI refresh');
      
      // Hide any loading containers
      loadingMessages.forEach(el => {
        const container = el.closest('.loading-container, #loading-container, .loading-screen');
        if (container) container.style.display = 'none';
      });
      
      // Show the topic selection
      if (window.QuizProsUI && window.QuizProsUI.initTopicSelectionUI) {
        window.QuizProsUI.initTopicSelectionUI();
      }
    }
  }, 3000);
});
/**
 * Initialize quiz templates directly without API dependencies
 */
function initializeQuizTemplates() {
  console.log('Initializing quiz templates directly');
  
  try {
    if (!window.QuizProsTopics || !window.QuizProsTopics.registerQuizTemplate) {
      console.error('Topics module not available for template registration');
      return;
    }
    
    // Register basic image quiz templates directly
    const zodiacBasicInfo = {
      id: "zodiac-sign-quiz",
      name: "Discover Your True Zodiac Sign",
      description: "Your birth date may say one thing, but your personality reveals your true cosmic alignment",
      icon: "fas fa-star",
      isPersonality: true,
      isImageQuiz: true,
      category: "image-quizzes"
    };
    
    const spiritAnimalBasicInfo = {
      id: "spirit-animal-quiz",
      name: "Discover Your Spirit Animal",
      description: "Find the animal that resonates with your inner self",
      icon: "fas fa-paw",
      isPersonality: true,
      isImageQuiz: true,
      category: "image-quizzes"
    };
    
    // Register basic templates as fallback
    window.QuizProsTopics.registerQuizTemplate(zodiacBasicInfo, 'image-quizzes');
    window.QuizProsTopics.registerQuizTemplate(spiritAnimalBasicInfo, 'image-quizzes');
    console.log('Registered basic image quiz templates');
    
    // Register standard personality quizzes
    const personalityQuizzes = [
      {
        id: "leadership-style-quiz",
        name: "Leadership Style Assessment",
        description: "Discover your unique approach to leadership",
        icon: "fas fa-users",
        isPersonality: true,
        category: "professional"
      },
      {
        id: "learning-style-quiz",
        name: "Learning Style Profile",
        description: "Understand how you best absorb and process information",
        icon: "fas fa-book",
        isPersonality: true,
        category: "learning"
      },
      {
        id: "communication-language-quiz",
        name: "Communication Style",
        description: "Learn how you express yourself and connect with others",
        icon: "fas fa-comments",
        isPersonality: true,
        category: "relationships"
      }
    ];
    
    // Register all personality quizzes
    personalityQuizzes.forEach(quiz => {
      window.QuizProsTopics.registerQuizTemplate(quiz, quiz.category);
      console.log(`Registered ${quiz.name} template`);
    });
    
    // Try to load full templates from files using fetch API
    loadFullQuizTemplates();
    
    // Force refresh the topic selection UI after templates are loaded
    setTimeout(() => {
      if (window.QuizProsUI && window.QuizProsUI.initTopicSelectionUI) {
        console.log('Forcing UI refresh after template initialization');
        window.QuizProsUI.initTopicSelectionUI();
        
        // If we're stuck on the loading screen, try to hide it
        const loadingElements = [
          document.querySelector('.loading-container'),
          document.getElementById('loading-container'), 
          document.querySelector('.loading-screen'),
          document.getElementById('loading'),
          document.querySelector('.loading')
        ];
        
        loadingElements.forEach(element => {
          if (element) {
            console.log('Hiding loading element:', element);
            element.style.display = 'none';
          }
        });
        
        // Try to hide any loading text that might be showing
        const possibleLoadingText = document.querySelectorAll('h1, h2, h3, h4, p');
        possibleLoadingText.forEach(element => {
          if (element.textContent.includes('Loading quiz') || 
              element.textContent.includes('loading') || 
              element.textContent.includes('Loading')) {
            console.log('Hiding loading text element:', element);
            element.style.display = 'none';
            
            // Also try to hide the parent container
            if (element.parentElement) {
              element.parentElement.style.display = 'none';
            }
          }
        });
        
        // Show the topic selection screen
        const topicScreen = document.getElementById('topic-selection-screen');
        if (topicScreen) {
          console.log('Showing topic selection screen');
          topicScreen.style.display = 'block';
        }
      }
    }, 2000); // 2 second delay to ensure everything is loaded
    
  } catch (error) {
    console.error('Error in manual quiz template initialization:', error);
  }
}


/**
 * Load full quiz templates from JSON files
 */
function loadFullQuizTemplates() {
  console.log('Attempting to load full quiz templates from files');
  
  // Template files to load
  const templateFiles = [
    {path: 'templates/personality-quizzes/image-quizzes/zodiac-sign-quiz.json', category: 'image-quizzes'},
    {path: 'templates/personality-quizzes/image-quizzes/spirit-animal-quiz.json', category: 'image-quizzes'},
    {path: 'templates/personality-quizzes/professional/leadership-style-quiz.json', category: 'professional'},
    {path: 'templates/personality-quizzes/learning/learning-style-quiz.json', category: 'learning'},
    {path: 'templates/personality-quizzes/relationships/communication-language-quiz.json', category: 'relationships'},
    // Add missing quiz templates for self-discovery category
    {path: 'templates/personality-quizzes/self-discovery/historical-era-quiz.json', category: 'self-discovery'},
    {path: 'templates/personality-quizzes/self-discovery/tv-character-quiz.json', category: 'self-discovery'},
    // Add missing quiz template for lifestyle category
    {path: 'templates/personality-quizzes/lifestyle/city-personality-quiz.json', category: 'lifestyle'},
    // Phase 5B — new personality quizzes
    {path: 'templates/personality-quizzes/lifestyle/travel-personality-quiz.json', category: 'lifestyle'},
    {path: 'templates/personality-quizzes/relationships/love-language-quiz.json', category: 'relationships'},
    {path: 'templates/personality-quizzes/self-discovery/color-personality-quiz.json', category: 'self-discovery'},
    // Phase 5C — additional personality quizzes
    {path: 'templates/personality-quizzes/learning/music-taste-quiz.json', category: 'learning'},
    {path: 'templates/personality-quizzes/self-discovery/stress-response-quiz.json', category: 'self-discovery'},
    {path: 'templates/personality-quizzes/professional/work-life-balance-quiz.json', category: 'professional'}
  ];
  
  // Load each template file
  templateFiles.forEach(template => {
    fetch(template.path)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to load template: ${response.status} ${response.statusText}`);
        }
        return response.json();
      })
      .then(templateData => {
        // Register the template
        if (window.QuizProsTopics && window.QuizProsTopics.registerQuizTemplate) {
          window.QuizProsTopics.registerQuizTemplate(templateData, template.category);
          console.log(`Loaded and registered full template: ${templateData.name}`);
        }
      })
      .catch(error => {
        console.error(`Error loading template ${template.path}:`, error);
        console.log('Continuing with basic template registration only');
      });
  });
}

/**
 * Set up global event listeners
 */
function setupEventListeners() {
  // Listen for online/offline events
  window.addEventListener('online', handleOnlineStatus);
  window.addEventListener('offline', handleOfflineStatus);
  
  // Listen for visibility changes
  document.addEventListener('visibilitychange', handleVisibilityChange);
  
  // Listen for user events
  if (window.QuizProsUserManager) {
    window.QuizProsUserManager.addEventListener('authenticated', handleUserAuthenticated);
    window.QuizProsUserManager.addEventListener('signedOut', handleUserSignedOut);
  }
  
  // Listen for premium events
  if (window.QuizProsPremium) {
    document.addEventListener('quizpros:premium:subscribed', handlePremiumSubscribed);
  }
}

/**
 * Handle online status change
 */
function handleOnlineStatus() {
  console.log('Application is online');
  
  // Process any pending offline operations
  if (window.QuizProsAPI) {
    window.QuizProsAPI.processOfflineRequests();
  }
  
  if (window.QuizProsAnalytics) {
    window.QuizProsAnalytics.processOfflineEvents();
  }
  
  // Update UI to reflect online status
  document.body.classList.remove('offline-mode');

  var banner = document.getElementById('offline-banner');
  if (banner) banner.style.display = 'none';

  // Notify user if they were previously offline
  if (document.body.classList.contains('was-offline')) {
    document.body.classList.remove('was-offline');
    showNotification('You are back online!', 'success');
  }
}

/**
 * Handle offline status change
 */
function handleOfflineStatus() {
  console.log('Application is offline');
  
  // Update UI to reflect offline status
  document.body.classList.add('offline-mode');
  document.body.classList.add('was-offline');

  var banner = document.getElementById('offline-banner');
  if (banner) banner.style.display = 'block';

  // Notify user
  showNotification('You are currently offline. Some features may be limited.', 'warning');
}

/**
 * Handle visibility change
 */
function handleVisibilityChange() {
  if (document.visibilityState === 'visible') {
    console.log('Application is visible');
    
    // Refresh data if needed
    if (window.QuizProsUI) {
      if (typeof window.QuizProsUI.refreshContent === 'function') {
        window.QuizProsUI.refreshContent();
      }
    }
  } else {
    console.log('Application is hidden');
  }
}

/**
 * Handle user authenticated event
 * @param {Event} event - User authenticated event
 */
function handleUserAuthenticated(event) {
  const userData = event.detail;
  console.log('User authenticated:', userData);
  
  // Update UI for authenticated user
  if (window.QuizProsUI) {
    if (typeof window.QuizProsUI.updateForAuthenticatedUser === 'function') {
      window.QuizProsUI.updateForAuthenticatedUser(userData);
    }
  }
  
  // Track authentication event
  if (window.QuizProsAnalytics) {
    window.QuizProsAnalytics.trackEvent(
      'User',
      'Authenticated',
      userData.id
    );
  }
}

/**
 * Handle user signed out event
 */
function handleUserSignedOut() {
  console.log('User signed out');
  
  // Update UI for signed out user
  if (window.QuizProsUI) {
    if (typeof window.QuizProsUI.updateForSignedOutUser === 'function') {
      window.QuizProsUI.updateForSignedOutUser();
    }
  }
  
  // Track sign out event
  if (window.QuizProsAnalytics) {
    window.QuizProsAnalytics.trackEvent(
      'User',
      'SignedOut'
    );
  }
}

/**
 * Handle premium subscribed event
 * @param {Event} event - Premium subscribed event
 */
function handlePremiumSubscribed(event) {
  const subscriptionData = event.detail;
  console.log('Premium subscription activated:', subscriptionData);
  
  // Update UI for premium user
  if (window.QuizProsUI) {
    if (typeof window.QuizProsUI.updateForPremiumUser === 'function') {
      window.QuizProsUI.updateForPremiumUser(subscriptionData);
    }
  }
  
  // Track premium subscription event
  if (window.QuizProsAnalytics) {
    window.QuizProsAnalytics.trackEvent(
      'Premium',
      'Subscribed',
      subscriptionData.tier
    );
  }
  
  // Show success notification
  showNotification(`Premium ${subscriptionData.tier} activated successfully!`, 'success');
}

/**
 * Show a notification to the user
 * @param {string} message - Notification message
 * @param {string} type - Notification type ('success', 'warning', 'error', 'info')
 * @param {number} duration - Duration in milliseconds
 */
function showNotification(message, type = 'info', duration = 3000) {
  // Create notification element if it doesn't exist
  let notificationContainer = document.getElementById('notification-container');
  
  if (!notificationContainer) {
    notificationContainer = document.createElement('div');
    notificationContainer.id = 'notification-container';
    document.body.appendChild(notificationContainer);
  }
  
  // Create notification
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <div class="notification-message">${message}</div>
      <button class="notification-close">&times;</button>
    </div>
  `;
  
  // Add notification to container
  notificationContainer.appendChild(notification);
  
  // Add event listener for close button
  const closeButton = notification.querySelector('.notification-close');
  if (closeButton) {
    closeButton.addEventListener('click', function() {
      notification.classList.add('notification-hiding');
      setTimeout(() => {
        notification.remove();
      }, 300);
    });
  }
  
  // Auto-remove notification after duration
  setTimeout(() => {
    if (notification.parentNode) {
      notification.classList.add('notification-hiding');
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 300);
    }
  }, duration);
  
  // Show notification with animation
  setTimeout(() => {
    notification.classList.add('notification-visible');
  }, 10);
}

// ── PWA: Service Worker + Install Prompt ─────────────────────────────────────

// Capture beforeinstallprompt as early as possible (fires before DOMContentLoaded)
var _deferredInstallPrompt = null;
var _installPromptShown = false;

window.addEventListener('beforeinstallprompt', function(event) {
  event.preventDefault(); // Prevent mini-infobar on mobile Chrome
  _deferredInstallPrompt = event;
});

window.addEventListener('appinstalled', function() {
  _deferredInstallPrompt = null;
  if (window.QuizProsAnalytics && window.QuizProsAnalytics.trackEvent) {
    window.QuizProsAnalytics.trackEvent('PWA', 'installed', 'app_installed');
  }
  console.log('[PWA] App installed successfully');
});

/**
 * Register the service worker and set up background-sync message handler.
 */
function _initServiceWorker() {
  if (!('serviceWorker' in navigator)) return;

  navigator.serviceWorker.register('/sw.js').then(function(registration) {
    console.log('[SW] Registered, scope:', registration.scope);

    // Listen for messages from the service worker (e.g. background sync)
    navigator.serviceWorker.addEventListener('message', function(event) {
      if (event.data && event.data.type === 'SYNC_QUIZ_HISTORY') {
        _flushPendingQuizHistory();
      }
    });

    // When SW takes control (controllerchange), refresh the offline banner state
    navigator.serviceWorker.addEventListener('controllerchange', function() {
      var banner = document.getElementById('offline-banner');
      if (banner && !navigator.onLine) {
        // SW is now serving cached content — change message to "offline (cached)"
        var msg = banner.querySelector('.offline-message');
        if (msg) msg.textContent = 'You\'re offline — showing cached content.';
      }
    });
  }).catch(function(err) {
    console.warn('[SW] Registration failed:', err);
  });
}

/**
 * Show a dismissible "Add to Home Screen" bottom sheet.
 * Only shown once (respects localStorage dismissal flag).
 */
function _showInstallPromptSheet() {
  if (!_deferredInstallPrompt) return;
  if (_installPromptShown) return;
  if (localStorage.getItem('iqp_install_dismissed')) return;

  _installPromptShown = true;

  var sheet = document.createElement('div');
  sheet.id = 'pwa-install-sheet';
  sheet.style.cssText = [
    'position:fixed;bottom:0;left:0;right:0;z-index:9999',
    'background:#fff;border-top:3px solid #25d366',
    'padding:16px 20px;box-shadow:0 -4px 20px rgba(0,0,0,0.12)',
    'display:flex;align-items:center;gap:12px',
    'animation:slideUpFade .3s ease;font-family:inherit'
  ].join(';');

  sheet.innerHTML = [
    '<img src="/assets/icons/icon-192.png" alt="" width="40" height="40"',
    '  style="border-radius:8px;flex-shrink:0;">',
    '<div style="flex:1;min-width:0">',
    '  <strong style="display:block;font-size:0.9rem;color:#1a1a1a">Add iQuizPros to Home Screen</strong>',
    '  <span style="font-size:0.8rem;color:#666">Access quizzes offline, instantly</span>',
    '</div>',
    '<button id="pwa-install-btn" style="',
    '  background:linear-gradient(135deg,#25d366,#128c7e);color:#fff;',
    '  border:none;border-radius:8px;padding:8px 16px;',
    '  font-size:0.85rem;font-weight:600;cursor:pointer;white-space:nowrap">',
    '  Install',
    '</button>',
    '<button id="pwa-dismiss-btn" style="',
    '  background:none;border:none;padding:6px;cursor:pointer;',
    '  color:#999;font-size:1.2rem;line-height:1;flex-shrink:0" aria-label="Dismiss">',
    '  &times;',
    '</button>'
  ].join('');

  document.body.appendChild(sheet);

  document.getElementById('pwa-install-btn').addEventListener('click', function() {
    if (!_deferredInstallPrompt) return;
    _deferredInstallPrompt.prompt();
    _deferredInstallPrompt.userChoice.then(function(choice) {
      if (choice.outcome === 'accepted') {
        console.log('[PWA] User accepted install prompt');
      }
      _deferredInstallPrompt = null;
      sheet.remove();
    });
  });

  document.getElementById('pwa-dismiss-btn').addEventListener('click', function() {
    localStorage.setItem('iqp_install_dismissed', '1');
    sheet.remove();
  });

  // Auto-dismiss after 12 seconds
  setTimeout(function() {
    if (sheet.parentNode) sheet.remove();
  }, 12000);
}

/**
 * Flush any quiz history entries that were queued while offline.
 * Called when background sync fires (SW posts SYNC_QUIZ_HISTORY message).
 */
function _flushPendingQuizHistory() {
  try {
    var pending = JSON.parse(localStorage.getItem('iqp_pending_history') || '[]');
    if (!pending.length) return;

    var user = window.QuizProsAuthManager && window.QuizProsAuthManager.getCurrentUser
      ? window.QuizProsAuthManager.getCurrentUser()
      : null;
    if (!user) return; // Can't write to Firestore without auth

    pending.forEach(function(entry) {
      if (window.QuizProsUserManager && typeof window.QuizProsUserManager.saveQuizResult === 'function') {
        window.QuizProsUserManager.saveQuizResult(entry.quizId, entry.data);
      }
    });

    localStorage.removeItem('iqp_pending_history');
    console.log('[PWA] Flushed', pending.length, 'pending quiz history entries');
  } catch (e) {
    console.warn('[PWA] Failed to flush pending history:', e);
  }
}

// ── Retake AI Quiz ────────────────────────────────────────────────────────────
// If the URL contains ?retake={quizId} (set by dashboard.html "Retake" button),
// fetch the generated quiz from Firestore via Cloud Function and start it.
(function() {
  var retakeId = new URLSearchParams(window.location.search).get('retake');
  if (!retakeId) return;

  // Remove the param from the URL without reloading the page
  try {
    var cleanUrl = window.location.pathname + window.location.hash;
    window.history.replaceState({}, '', cleanUrl);
  } catch (e) { /* ignore */ }

  // Phase 6.3: Show confirmation modal before launching the retake quiz
  function showRetakeConfirmModal(quiz, onStart, onCancel) {
    var existing = document.getElementById('retake-confirm-modal');
    if (existing) existing.remove();

    var title    = quiz.title || 'AI Quiz';
    var topic    = quiz.topic || '';
    var qCount   = (quiz.questions && quiz.questions.length) || 0;

    var overlay = document.createElement('div');
    overlay.id = 'retake-confirm-modal';
    overlay.style.cssText = [
      'position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:99999;',
      'display:flex;align-items:center;justify-content:center;font-family:system-ui,sans-serif;'
    ].join('');

    overlay.innerHTML = [
      '<div style="background:#fff;border-radius:16px;padding:2rem;max-width:420px;width:90%;',
                 'box-shadow:0 8px 32px rgba(0,0,0,.25);text-align:center;">',
        '<div style="font-size:2.5rem;margin-bottom:.5rem;">📋</div>',
        '<h2 style="margin:0 0 .4rem;font-size:1.35rem;color:#1a1a1a;">' + _escRetake(title) + '</h2>',
        (topic ? '<p style="margin:0 0 1rem;color:#555;font-size:.95rem;">' + _escRetake(topic) + '</p>' : ''),
        '<p style="margin:0 0 1.5rem;color:#333;font-size:1rem;">',
          qCount + ' question' + (qCount !== 1 ? 's' : ''),
        '</p>',
        '<button id="retake-start-btn" style="',
          'background:linear-gradient(135deg,#25d366,#128c7e);color:#fff;border:none;',
          'padding:.75rem 2rem;border-radius:8px;font-size:1rem;font-weight:700;',
          'cursor:pointer;width:100%;margin-bottom:.75rem;">▶ Start Quiz</button>',
        '<button id="retake-cancel-btn" style="',
          'background:none;border:2px solid #ccc;color:#555;padding:.6rem 2rem;',
          'border-radius:8px;font-size:.95rem;cursor:pointer;width:100%;">Cancel</button>',
      '</div>'
    ].join('');

    document.body.appendChild(overlay);

    document.getElementById('retake-start-btn').addEventListener('click', function() {
      overlay.remove();
      onStart();
    });
    document.getElementById('retake-cancel-btn').addEventListener('click', function() {
      overlay.remove();
      onCancel();
    });
  }

  function _escRetake(str) {
    return String(str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function launchRetake(user) {
    if (!user) {
      console.warn('Retake: user not signed in, cannot load quiz');
      return;
    }
    try {
      var fns = firebase.app().functions('europe-west2');
      var getGeneratedQuiz = fns.httpsCallable('getGeneratedQuiz');
      getGeneratedQuiz({ quizId: retakeId })
        .then(function(result) {
          var quiz = result.data && result.data.quiz;
          if (!quiz) { throw new Error('No quiz data returned'); }
          // Phase 6.3: Show confirmation before launching
          showRetakeConfirmModal(
            quiz,
            function onStart() {
              if (window.QuizProsEngine && typeof window.QuizProsEngine.startGeneratedQuiz === 'function') {
                window.QuizProsEngine.startGeneratedQuiz(quiz);
              } else {
                console.error('Retake: QuizProsEngine.startGeneratedQuiz not available');
              }
            },
            function onCancel() {
              if (window.QuizProsEngine && typeof window.QuizProsEngine.resetAndReturn === 'function') {
                window.QuizProsEngine.resetAndReturn();
              }
            }
          );
        })
        .catch(function(err) {
          console.error('Retake: could not load quiz', err);
          if (window.QuizProsUtils && window.QuizProsUtils.showToast) {
            window.QuizProsUtils.showToast('Could not load quiz — it may have been deleted.', 'error');
          }
        });
    } catch (e) {
      console.error('Retake: firebase functions not available', e);
    }
  }

  // Wait for Firebase auth to resolve (handles both already-signed-in and fresh load)
  document.addEventListener('DOMContentLoaded', function() {
    if (typeof firebase !== 'undefined' && firebase.auth) {
      var unsubscribe = firebase.auth().onAuthStateChanged(function(user) {
        unsubscribe(); // one-time listener
        launchRetake(user);
      });
    }
  });
})();

// ─────────────────────────────────────────────────────────────────────────────
// Phase 10.6 — Quiz Embed IIFE
// Detects ?embed=1&quizId=<topicId> and auto-starts the requested quiz,
// hiding all chrome (header, footer, nav) for a clean iframe experience.
// ─────────────────────────────────────────────────────────────────────────────
(function() {
  var params = new URLSearchParams(window.location.search);
  if (params.get('embed') !== '1') return;
  var quizId = params.get('quizId');
  if (!quizId) return;

  // body.embed-mode is already set by the early inline script in index.template.html
  // (handles flash of non-embed content before JS runs).
  // Make sure it's set even if that script ran before <body> had the class.
  document.body.classList.add('embed-mode');

  // Poll for QuizProsEngine to be ready (modules load asynchronously)
  var attempts = 0;
  var maxAttempts = 100; // 10 seconds at 100ms intervals
  var pollTimer = setInterval(function() {
    attempts++;
    if (window.QuizProsEngine && typeof window.QuizProsEngine.startQuiz === 'function') {
      clearInterval(pollTimer);
      try {
        window.QuizProsEngine.startQuiz(quizId, true /* skipDifficultyPicker */);
      } catch (e) {
        console.error('Embed: startQuiz failed', e);
      }
    } else if (attempts >= maxAttempts) {
      clearInterval(pollTimer);
      console.error('Embed: QuizProsEngine not ready after 10s for quizId=' + quizId);
    }
  }, 100);
})();
