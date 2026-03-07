/**
 * Header Component for IQuizPros
 * Provides header UI and navigation functionality
 */

window.QuizProsHeader = (function() {
  // Private variables
  const config = window.QuizProsConfig;
  const utils = window.QuizProsUtils;
  
  /**
   * Initialize the header component
   */
  function initializeHeader() {
    utils.logger.info('Initializing header component');
    
    // Check if header already exists
    if (document.querySelector('.site-header')) {
      utils.logger.debug('Header already exists, skipping initialization');
      return;
    }
    
    // Create header element
    const header = createHeader();
    
    // Add header to page
    const firstChild = document.body.firstChild;
    if (firstChild) {
      document.body.insertBefore(header, firstChild);
    } else {
      document.body.appendChild(header);
    }
    
      // Wait for DOM to fully render before setting up event listeners
    setTimeout(() => {
      setupEventListeners();
    }, 100);
    
    utils.logger.debug('Header component initialized');
  }
  
  /**
   * Create the header element
   * @returns {HTMLElement} Header element
   */
  function createHeader() {
    const header = document.createElement('header');
    header.className = 'site-header';
    
    // Create header content
    header.innerHTML = `
      <div class="header-container">
        <div class="header-logo">
          <a href="/app" class="logo-link">
            <span class="logo-text">${config.app.name}</span>
          </a>
        </div>
        
        <button id="mobile-menu-toggle" class="mobile-menu-toggle" aria-label="Toggle mobile menu">
          <i class="fas fa-bars"></i>
        </button>
        
        <nav class="header-nav">
          <ul class="nav-list">
            <li class="nav-item"><a href="/app" class="nav-link">Home</a></li>
            <li class="nav-item dropdown">
              <a href="#" class="nav-link dropdown-toggle">Quizzes <i class="fas fa-chevron-down"></i></a>
              <ul class="dropdown-menu">
                <li><a href="/app" class="dropdown-item">All Quizzes</a></li>
                <li><a href="/app#personality-section" class="dropdown-item">Personality</a></li>
                <li><a href="/app#knowledge-section" class="dropdown-item">Knowledge</a></li>
                <li><a href="/premium.html" class="dropdown-item premium-item"><i class="fas fa-crown"></i> Premium Quizzes</a></li>
              </ul>
            </li>
            <li class="nav-item"><a href="/premium.html" class="nav-link">Premium</a></li>
            <li class="nav-item dropdown">
              <a href="#" class="nav-link dropdown-toggle">Company <i class="fas fa-chevron-down"></i></a>
              <ul class="dropdown-menu">
                <li><a href="/about.html" class="dropdown-item">About Us</a></li>
                <li><a href="/contact-page.html" class="dropdown-item">Contact</a></li>
                <li><a href="/privacy-policy.html" class="dropdown-item">Privacy Policy</a></li>
                <li><a href="/terms-of-use.html" class="dropdown-item">Terms of Use</a></li>
              </ul>
            </li>
            <li class="nav-item dropdown">
              <a href="#" class="nav-link dropdown-toggle">Connect <i class="fas fa-chevron-down"></i></a>
              <ul class="dropdown-menu">
                <li><a href="https://facebook.com" target="_blank" class="dropdown-item"><i class="fab fa-facebook"></i> Facebook</a></li>
                <li><a href="https://twitter.com" target="_blank" class="dropdown-item"><i class="fab fa-twitter"></i> Twitter</a></li>
                <li><a href="https://instagram.com" target="_blank" class="dropdown-item"><i class="fab fa-instagram"></i> Instagram</a></li>
              </ul>
            </li>
          </ul>
        </nav>
        
        <div class="header-actions">
          <button id="theme-toggle" class="theme-toggle" aria-label="Toggle dark mode">
            <i class="fas fa-moon"></i>
          </button>
          
          <div class="user-menu">
            <button id="user-menu-toggle" class="user-menu-toggle">
              <i class="fas fa-user-circle"></i>
            </button>
            <div class="user-dropdown">
              <div class="user-dropdown-header">
                <div class="user-info">
                  <span class="user-name">Guest</span>
                  <span class="user-status">Not signed in</span>
                </div>
              </div>
              <div class="user-dropdown-body">
                <a href="#" id="sign-in-button" class="user-dropdown-item">
                  <i class="fas fa-sign-in-alt"></i> Sign In
                </a>
                <a href="/premium.html" class="user-dropdown-item premium-item">
                  <i class="fas fa-crown"></i> Upgrade to Premium
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="mobile-menu-overlay"></div>
    `;
    
    return header;
  }
  
  /**
   * Set up event listeners for header interactions
   */
  function setupEventListeners() {
    // Mobile menu toggle — delegated to mobile-menu.js
    if (window.QuizProsMobileMenu) {
      window.QuizProsMobileMenu.initialize();
    }
    
    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', toggleTheme);
    }

    // ── System dark-mode auto-detection (prefers-color-scheme) ──────────────
    // Apply saved preference or system preference on load
    _applyThemePreference();

    // Listen for system preference changes (user switches OS dark mode)
    if (window.matchMedia) {
      var sysDarkMQ = window.matchMedia('(prefers-color-scheme: dark)');
      try {
        sysDarkMQ.addEventListener('change', function(e) {
          // Only react if user has NOT set a manual preference
          var stored = window.QuizProsStorage
            ? window.QuizProsStorage.getLocalItem('theme_preference')
            : localStorage.getItem('theme_preference');
          if (!stored) _applyThemePreference();
        });
      } catch (e) {
        // Safari < 14 uses deprecated addListener
        try { sysDarkMQ.addListener(function() { _applyThemePreference(); }); } catch (e2) {}
      }
    }

    // ── Bottom navigation active state ──────────────────────────────────────
    _initBottomNav();

    // User menu toggle
    const userMenuToggle = document.getElementById('user-menu-toggle');
    if (userMenuToggle) {
      userMenuToggle.addEventListener('click', toggleUserMenu);
    }
    
    // Sign in button
    const signInButton = document.getElementById('sign-in-button');
    if (signInButton) {
      signInButton.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Check if Firebase Auth UI is available
        if (window.QuizProsAuthUI && typeof window.QuizProsAuthUI.showSignInModal === 'function') {
          window.QuizProsAuthUI.showSignInModal();
        } else {
          // Fall back to original sign in modal
          showSignInModal();
        }
      });
    }
    
    // Close user menu when clicking outside
    document.addEventListener('click', function(e) {
      const userMenu = document.querySelector('.user-menu');
      const userMenuToggle = document.getElementById('user-menu-toggle');
      
      if (userMenu && userMenuToggle && !userMenu.contains(e.target) && e.target !== userMenuToggle) {
        userMenu.classList.remove('active');
      }
    });
    
    // Dropdown menus - Add touch support
    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
    dropdownToggles.forEach(toggle => {
      const handleDropdownToggle = function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        // Toggle dropdown
        const parent = this.parentElement;
        parent.classList.toggle('active');
        
        // Close other dropdowns
        dropdownToggles.forEach(otherToggle => {
          if (otherToggle !== this) {
            otherToggle.parentElement.classList.remove('active');
          }
        });
      };
      
      // Add both click and touch events
      toggle.addEventListener('click', handleDropdownToggle);
      toggle.addEventListener('touchend', function(e) {
        e.preventDefault();
        handleDropdownToggle.call(this, e);
      });
    });
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', function(e) {
      const dropdowns = document.querySelectorAll('.dropdown');
      
      dropdowns.forEach(dropdown => {
        const toggle = dropdown.querySelector('.dropdown-toggle');
        
        if (!dropdown.contains(e.target) && e.target !== toggle) {
          dropdown.classList.remove('active');
        }
      });
    });
    
    // Auth state events are handled by auth-manager.js — no duplicate listeners here.

    // Listen for premium status changes
    if (window.QuizProsPremium) {
      document.addEventListener('quizpros:premium:statusUpdated', updatePremiumStatus);
      document.addEventListener('quizpros:premium:statusReset', resetPremiumStatus);
    }
  }
  
  /**
   * Apply theme based on stored preference OR system preference.
   * - If user manually chose 'dark' → add dark-mode, remove light-mode-forced
   * - If user manually chose 'light' → remove dark-mode, add light-mode-forced
   * - If no preference → follow system preference
   */
  function _applyThemePreference() {
    var stored = window.QuizProsStorage
      ? window.QuizProsStorage.getLocalItem('theme_preference')
      : localStorage.getItem('theme_preference');
    var body = document.body;
    var themeToggle = document.getElementById('theme-toggle');

    if (stored === 'dark') {
      body.classList.add('dark-mode');
      body.classList.remove('light-mode-forced');
      if (themeToggle) themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    } else if (stored === 'light') {
      body.classList.remove('dark-mode');
      body.classList.add('light-mode-forced');
      if (themeToggle) themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    } else {
      // No preference — follow OS
      var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        body.classList.add('dark-mode');
        body.classList.remove('light-mode-forced');
        if (themeToggle) themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
      } else {
        body.classList.remove('dark-mode');
        body.classList.remove('light-mode-forced');
        if (themeToggle) themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
      }
    }
  }

  /**
   * Set the active state on the mobile bottom navigation based on current URL.
   */
  function _initBottomNav() {
    var bottomNav = document.getElementById('bottom-nav');
    if (!bottomNav) return;
    var path = window.location.pathname;
    var items = bottomNav.querySelectorAll('.bottom-nav-item');
    items.forEach(function(item) {
      var href = item.getAttribute('href') || '';
      if (href === '/' && (path === '/' || path === '/app')) {
        item.classList.add('active');
      } else if (href !== '/' && path.startsWith(href.split('#')[0])) {
        item.classList.add('active');
      }
    });
  }

  /**
   * Toggle dark/light theme
   */
  function toggleTheme() {
    const body = document.body;
    const themeToggle = document.getElementById('theme-toggle');
    const isDarkMode = body.classList.contains('dark-mode');
    
    // Toggle dark mode class
    body.classList.toggle('dark-mode');

    // Manage light-mode-forced (prevents system @media from overriding manual choice)
    if (isDarkMode) {
      // Switching to light — force light so system dark-mode CSS doesn't kick in
      body.classList.add('light-mode-forced');
    } else {
      body.classList.remove('light-mode-forced');
    }

    // Update icon
    if (themeToggle) {
      if (isDarkMode) {
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
      } else {
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
      }
    }

    // Save preference to storage
    if (window.QuizProsStorage) {
      window.QuizProsStorage.setLocalItem('theme_preference', isDarkMode ? 'light' : 'dark');
    } else {
      try { localStorage.setItem('theme_preference', isDarkMode ? 'light' : 'dark'); } catch (e) {}
    }
    
    // Update feature flag
    if (window.QuizProsFeatureFlags) {
      window.QuizProsFeatureFlags.setFlag('darkMode', !isDarkMode);
    }
    
    // Track theme change
    if (window.QuizProsAnalytics) {
      window.QuizProsAnalytics.trackEvent(
        config.analytics.categories.navigation,
        'ThemeChanged',
        isDarkMode ? 'light' : 'dark'
      );
    }
  }
  
  /**
   * Toggle user menu
   */
  function toggleUserMenu() {
    const userMenu = document.querySelector('.user-menu');
    
    if (userMenu) {
      userMenu.classList.toggle('active');
    }
  }
  
  /**
   * Show sign in modal
   * This version is compatible with Firebase Auth
   */
  function showSignInModal() {
    // If Firebase Auth UI is available, use it
    if (window.QuizProsAuthUI && typeof window.QuizProsAuthUI.showSignInModal === 'function') {
      window.QuizProsAuthUI.showSignInModal();
      return;
    }
    
    // Create modal HTML
    const modalHTML = `
      <div class="auth-modal">
        <div class="auth-modal-content">
          <div class="auth-modal-header">
            <h2>Sign In</h2>
            <button class="auth-modal-close">&times;</button>
          </div>
          <div class="auth-modal-body">
            <div class="auth-options">
              <button class="auth-option guest-option">
                <i class="fas fa-user"></i>
                <span>Continue as Guest</span>
              </button>
              <button class="auth-option google-option">
                <i class="fab fa-google"></i>
                <span>Sign in with Google</span>
              </button>
              <button class="auth-option facebook-option">
                <i class="fab fa-facebook"></i>
                <span>Sign in with Facebook</span>
              </button>
            </div>
            <div class="auth-note">
              <p>Sign in to save your quiz results and access premium features.</p>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Create modal element
    const modalElement = document.createElement('div');
    modalElement.className = 'auth-modal-container';
    modalElement.innerHTML = modalHTML;
    document.body.appendChild(modalElement);
    
    // Add event listeners
    const closeBtn = modalElement.querySelector('.auth-modal-close');
    const guestBtn = modalElement.querySelector('.guest-option');
    const googleBtn = modalElement.querySelector('.google-option');
    const facebookBtn = modalElement.querySelector('.facebook-option');
    
    // Close modal function
    const closeModal = () => {
      modalElement.classList.add('closing');
      setTimeout(() => {
        document.body.removeChild(modalElement);
      }, 300);
    };
    
    // Add event listeners
    closeBtn.addEventListener('click', closeModal);
    
    // Guest option
    guestBtn.addEventListener('click', () => {
      closeModal();
      
      // Track event
      if (window.QuizProsAnalytics) {
        window.QuizProsAnalytics.trackEvent(
          config.analytics.categories.navigation,
          'GuestContinue'
        );
      }
    });
    
    // Google option
    googleBtn.addEventListener('click', () => {
      // If Firebase Auth is available, use it
      if (window.QuizProsAuth && typeof window.QuizProsAuth.signInWithGoogle === 'function') {
        closeModal();
        window.QuizProsAuth.signInWithGoogle()
          .catch(error => {
            console.error('Google sign in error:', error);
          });
        return;
      }
      
      // Fallback to demo sign in
      const userData = {
        id: 'user_' + Math.random().toString(36).substr(2, 9),
        displayName: 'Demo User',
        email: 'demo@example.com',
        provider: 'google'
      };
      
      // Dispatch sign in event
      const event = new CustomEvent('quizpros:auth:signed_in', {
        detail: userData,
        bubbles: true
      });
      
      document.dispatchEvent(event);
      
      closeModal();
      
      // Track event
      if (window.QuizProsAnalytics) {
        window.QuizProsAnalytics.trackEvent(
          config.analytics.categories.navigation,
          'SignIn',
          'Google'
        );
      }
    });
    
    // Facebook option
    facebookBtn.addEventListener('click', () => {
      // For demo purposes, simulate successful sign in
      const userData = {
        id: 'user_' + Math.random().toString(36).substr(2, 9),
        displayName: 'Demo User',
        email: 'demo@example.com',
        provider: 'facebook'
      };
      
      // Dispatch sign in event
      const event = new CustomEvent('quizpros:auth:signed_in', {
        detail: userData,
        bubbles: true
      });
      
      document.dispatchEvent(event);
      
      closeModal();
      
      // Track event
      if (window.QuizProsAnalytics) {
        window.QuizProsAnalytics.trackEvent(
          config.analytics.categories.navigation,
          'SignIn',
          'Facebook'
        );
      }
    });
    
    // Show modal with animation
    setTimeout(() => {
      modalElement.classList.add('visible');
    }, 10);
  }
  
  /**
   * Update user menu after authentication
   * @param {Event} event - Authentication event
   */
  function updateUserMenu(event) {
    const userData = event.detail;
    
    // Update user menu
    const userNameElement = document.querySelector('.user-name');
    const userStatusElement = document.querySelector('.user-status');
    const userDropdownBody = document.querySelector('.user-dropdown-body');
    
    if (userNameElement && userData) {
      userNameElement.textContent = userData.displayName || (userData.email ? userData.email.split('@')[0] : 'User');
    }
    
    if (userStatusElement) {
      userStatusElement.textContent = 'Signed In';
    }
    
    if (userDropdownBody) {
      userDropdownBody.innerHTML = `
        <a href="#" id="view-profile-button" class="user-dropdown-item">
          <i class="fas fa-user"></i> View Profile
        </a>
        <a href="#" id="view-results-button" class="user-dropdown-item">
          <i class="fas fa-history"></i> Quiz History
        </a>
        <a href="/premium.html" class="user-dropdown-item premium-item">
          <i class="fas fa-crown"></i> Upgrade to Premium
        </a>
        <a href="#" id="sign-out-button" class="user-dropdown-item">
          <i class="fas fa-sign-out-alt"></i> Sign Out
        </a>
      `;
      
      // Add event listener for sign out button
      const signOutButton = document.getElementById('sign-out-button');
      if (signOutButton) {
        signOutButton.addEventListener('click', function(e) {
          e.preventDefault();

          // Use Firebase Auth if available
          if (window.QuizProsAuth && typeof window.QuizProsAuth.signOut === 'function') {
            window.QuizProsAuth.signOut();
          } else {
            // Fallback to original event dispatch
            const event = new CustomEvent('quizpros:auth:signed_out', {
              bubbles: true
            });

            document.dispatchEvent(event);
          }

          // Track event
          if (window.QuizProsAnalytics) {
            window.QuizProsAnalytics.trackEvent(
              config.analytics.categories.navigation,
              'SignOut'
            );
          }
        });
      }

      // View Profile button
      const viewProfileButton = document.getElementById('view-profile-button');
      if (viewProfileButton) {
        viewProfileButton.addEventListener('click', function(e) {
          e.preventDefault();
          _showProfileModal();
        });
      }

      // Quiz History button
      const viewResultsButton = document.getElementById('view-results-button');
      if (viewResultsButton) {
        viewResultsButton.addEventListener('click', function(e) {
          e.preventDefault();
          _showHistoryModal();
        });
      }
    }
  }

  function _showProfileModal() {
    const user = window.QuizProsAuth ? window.QuizProsAuth.getCurrentUser() : null;
    if (!user) return;
    const history = window.QuizProsUserManager ? window.QuizProsUserManager.getQuizHistory() : [];
    const tier = (window.QuizProsPremium && window.QuizProsPremium.getPremiumStatus && window.QuizProsPremium.getPremiumStatus()?.isPremium) ? 'Premium' : 'Free';
    _showModal('Your Profile', `
      <div style="text-align:center;padding:1rem 0 1.5rem;">
        <div style="width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,#25d366,#128c7e);
                    display:flex;align-items:center;justify-content:center;font-size:1.8rem;color:#fff;
                    margin:0 auto 1rem;">
          ${(user.displayName || user.email || 'U')[0].toUpperCase()}
        </div>
        <h3 style="margin:0 0 .25rem;font-size:1.2rem;">${user.displayName || 'User'}</h3>
        <p style="margin:0;color:#777;font-size:.9rem;">${user.email || ''}</p>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1rem;">
        <div style="background:#f8f9fa;border-radius:10px;padding:1rem;text-align:center;">
          <div style="font-size:1.6rem;font-weight:700;color:#25d366;">${history.length}</div>
          <div style="font-size:.8rem;color:#777;">Quizzes Taken</div>
        </div>
        <div style="background:#f8f9fa;border-radius:10px;padding:1rem;text-align:center;">
          <div style="font-size:1.6rem;font-weight:700;color:#25d366;">${tier}</div>
          <div style="font-size:.8rem;color:#777;">Account Type</div>
        </div>
      </div>
      ${tier === 'Free' ? `<a href="/premium.html" style="display:block;text-align:center;background:linear-gradient(135deg,#25d366,#128c7e);
        color:#fff;padding:.7rem;border-radius:8px;text-decoration:none;font-weight:600;font-size:.9rem;">
        Upgrade to Premium 👑</a>` : ''}
    `);
  }

  function _showHistoryModal() {
    const history = window.QuizProsUserManager ? window.QuizProsUserManager.getQuizHistory() : [];
    let bodyHtml;
    if (history.length === 0) {
      bodyHtml = '<p style="text-align:center;color:#777;padding:2rem 0;">No quiz history yet. Take a quiz to see your results here!</p>';
    } else {
      bodyHtml = '<div style="max-height:360px;overflow-y:auto;">' + history.slice(0, 20).map(item => {
        const date = item.completedAt ? new Date(item.completedAt).toLocaleDateString() : '';
        const score = item.score != null ? `${item.score}%` : '—';
        const name  = item.quizName || item.quizId || 'Quiz';
        return `<div style="display:flex;justify-content:space-between;align-items:center;
                  padding:.7rem 0;border-bottom:1px solid #f0f0f0;">
          <div>
            <div style="font-weight:600;font-size:.95rem;">${name}</div>
            <div style="font-size:.8rem;color:#aaa;">${date}</div>
          </div>
          <div style="font-weight:700;color:#25d366;font-size:1rem;">${score}</div>
        </div>`;
      }).join('') + '</div>';
    }
    _showModal('Quiz History', bodyHtml);
  }

  function _showModal(title, bodyHtml) {
    const existing = document.getElementById('header-modal-overlay');
    if (existing) existing.remove();
    const overlay = document.createElement('div');
    overlay.id = 'header-modal-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.5);display:flex;' +
      'align-items:center;justify-content:center;z-index:99999;font-family:system-ui,sans-serif;';
    overlay.innerHTML = `
      <div style="background:#fff;border-radius:14px;padding:1.5rem;max-width:420px;width:90%;
                  box-shadow:0 20px 60px rgba(0,0,0,.25);max-height:90vh;overflow-y:auto;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;">
          <h2 style="margin:0;font-size:1.2rem;">${title}</h2>
          <button id="header-modal-close" style="background:none;border:none;font-size:1.4rem;
            cursor:pointer;color:#aaa;line-height:1;">&times;</button>
        </div>
        ${bodyHtml}
      </div>`;
    document.body.appendChild(overlay);
    overlay.querySelector('#header-modal-close').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
  }
  
  /**
   * Reset user menu after sign out
   */
  function resetUserMenu() {
    // Reset user menu
    const userNameElement = document.querySelector('.user-name');
    const userStatusElement = document.querySelector('.user-status');
    const userDropdownBody = document.querySelector('.user-dropdown-body');
    
    if (userNameElement) {
      userNameElement.textContent = 'Guest';
    }
    
    if (userStatusElement) {
      userStatusElement.textContent = 'Not signed in';
    }
    
    if (userDropdownBody) {
      userDropdownBody.innerHTML = `
        <a href="#" id="sign-in-button" class="user-dropdown-item">
          <i class="fas fa-sign-in-alt"></i> Sign In
        </a>
        <a href="/premium.html" class="user-dropdown-item premium-item">
          <i class="fas fa-crown"></i> Upgrade to Premium
        </a>
      `;
      
      // Add event listener for sign in button
      const signInButton = document.getElementById('sign-in-button');
      if (signInButton) {
        signInButton.addEventListener('click', function(e) {
          e.preventDefault();
          
          // Use Firebase Auth UI if available
          if (window.QuizProsAuthUI && typeof window.QuizProsAuthUI.showSignInModal === 'function') {
            window.QuizProsAuthUI.showSignInModal();
          } else {
            showSignInModal();
          }
        });
      }
    }
  }
  
  /**
   * Update premium status in header
   * @param {Event} event - Premium status event
   */
  function updatePremiumStatus(event) {
    const premiumStatus = event.detail;
    
    // Add premium badge to user menu
    const userMenu = document.querySelector('.user-menu');
    
    if (userMenu && !userMenu.querySelector('.premium-badge')) {
      // Create premium badge
      const badge = document.createElement('div');
      badge.className = 'premium-badge premium-badge-small';
      badge.innerHTML = '<i class="fas fa-crown"></i>';
      
      // Add badge to user menu
      userMenu.appendChild(badge);
    }
    
    // Update premium menu items
    const premiumItems = document.querySelectorAll('.premium-item');
    
    premiumItems.forEach(item => {
      item.innerHTML = `<i class="fas fa-crown"></i> Premium Dashboard`;
      item.href = '/premium/dashboard.html';
    });
  }
  
  /**
   * Reset premium status in header
   */
  function resetPremiumStatus() {
    // Remove premium badge from user menu
    const userMenu = document.querySelector('.user-menu');
    const premiumBadge = userMenu?.querySelector('.premium-badge');
    
    if (premiumBadge) {
      premiumBadge.remove();
    }
    
    // Reset premium menu items
    const premiumItems = document.querySelectorAll('.premium-item');
    
    premiumItems.forEach(item => {
      item.innerHTML = `<i class="fas fa-crown"></i> Upgrade to Premium`;
      item.href = '/premium.html';
    });
  }
  
  // Public API
  return {
    initializeHeader: initializeHeader,
    showSignInModal: showSignInModal,
    toggleTheme: toggleTheme,
    
    // Additional methods for Firebase Auth integration
    updateUserMenu: updateUserMenu,
    resetUserMenu: resetUserMenu
  };
})();

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  // Header will be initialized by the main app.js
  QuizProsHeader.initializeHeader();
});