/**
   * Set footer visibility - can be called from other parts of the application
   * @param {boolean} visible - Whether the footer should be visible
   */
function setFooterVisibility(visible) {
  const footer = document.querySelector('.site-footer');
  if (!footer) return;
  
  if (visible) {
    footer.classList.remove('footer-hidden');
  } else {
    footer.classList.add('footer-hidden');
  }
}/**
* Footer Component for IQuizPros
* Provides footer UI and functionality with responsive burger menu
*/

window.QuizProsFooter = (function() {
// Private variables
const config = window.QuizProsConfig || {};
const utils = window.QuizProsUtils || { logger: { info: console.log, debug: console.log } };

/**
 * Initialize the footer component
 */
function initializeFooter() {
  utils.logger.info('Initializing footer component');
  
  // Check if footer already exists
  if (document.querySelector('.site-footer')) {
    utils.logger.debug('Footer already exists, skipping initialization');
    return;
  }
  
  // Create footer element
  const footer = createFooter();
  
  // Add footer to page
  document.body.appendChild(footer);
  
  // Set up event listeners
  setupEventListeners();
  
  utils.logger.debug('Footer component initialized');
}

/**
 * Create the footer element with responsive structure
 * @returns {HTMLElement} Footer element
 */
function createFooter() {
  const footer = document.createElement('footer');
  footer.className = 'site-footer';
  
  // Create footer content with burger menu structure
  footer.innerHTML = `
    <div class="footer-container">
      <!-- Logo and Copyright Section -->
      <div class="footer-logo">
        <a href="/index.html" class="logo-link">
          <span class="logo-text">${config.app.name}</span>
        </a>
        <p class="footer-tagline">Discover yourself through quizzes</p>
      </div>
      
      <!-- Bottom Section with Copyright, Navigation, and Links -->
      <div class="footer-bottom">
        <div class="copyright">${config.app.copyright}</div>

        <div class="footer-menu-container">
          <!-- Compact Footer Navigation -->
          <div class="footer-compact-nav">
            <div class="footer-nav-item">
              <a href="#" class="footer-nav-link dropdown-toggle">
                Quizzes <i class="fas fa-chevron-down"></i>
              </a>
              <ul class="footer-dropdown-menu">
                <li><a href="/index.html" class="footer-dropdown-item">All Quizzes</a></li>
                <li><a href="/index.html#personality-section" class="footer-dropdown-item">Personality</a></li>
                <li><a href="/index.html#knowledge-section" class="footer-dropdown-item">Knowledge</a></li>
                <li><a href="/premium.html" class="footer-dropdown-item premium-item"><i class="fas fa-crown"></i> Premium</a></li>
              </ul>
            </div>
            <div class="footer-nav-item">
              <a href="#" class="footer-nav-link dropdown-toggle">
                Company <i class="fas fa-chevron-down"></i>
              </a>
              <ul class="footer-dropdown-menu">
                <li><a href="/about.html" class="footer-dropdown-item">About Us</a></li>
                <li><a href="/contact-page.html" class="footer-dropdown-item">Contact</a></li>
                <li><a href="/privacy-policy.html" class="footer-dropdown-item">Privacy Policy</a></li>
                <li><a href="/terms-of-use.html" class="footer-dropdown-item">Terms of Use</a></li>
              </ul>
            </div>
            <div class="footer-nav-item">
              <a href="#" class="footer-nav-link dropdown-toggle">
                Connect <i class="fas fa-chevron-down"></i>
              </a>
              <ul class="footer-dropdown-menu">
                <li><a href="https://facebook.com" target="_blank" class="footer-dropdown-item social-link"><i class="fab fa-facebook"></i> Facebook</a></li>
                <li><a href="https://twitter.com" target="_blank" class="footer-dropdown-item social-link"><i class="fab fa-twitter"></i> Twitter</a></li>
                <li><a href="https://instagram.com" target="_blank" class="footer-dropdown-item social-link"><i class="fab fa-instagram"></i> Instagram</a></li>
                <li><a href="https://linkedin.com" target="_blank" class="footer-dropdown-item social-link"><i class="fab fa-linkedin"></i> LinkedIn</a></li>
              </ul>
            </div>
          </div>

          <div class="footer-divider"></div>
          
          <!-- Legal Links -->
          <div class="footer-links">
            <a href="#" id="cookie-settings-link" class="footer-link">Cookie Settings</a>
            <a href="/privacy-policy.html" class="footer-link">Privacy Policy</a>
            <a href="/terms-of-use.html" class="footer-link">Terms of Use</a>
          </div>
        </div>
      </div>
      
      <!-- Mobile Footer Toggle Button -->
      <button class="mobile-footer-toggle" aria-label="Toggle footer menu">
        <i class="fas fa-bars"></i>
      </button>
    </div>
    
    <!-- Mobile Footer Overlay (Hidden by default) -->
    <div class="mobile-footer-overlay"></div>
  `;
  
  return footer;
}

/**
 * Set up event listeners for footer interactions
 */
function setupEventListeners() {
  // Cookie settings link
  const cookieSettingsLink = document.getElementById('cookie-settings-link');
  if (cookieSettingsLink) {
    cookieSettingsLink.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Show cookie settings if cookie consent module is available
      if (window.QuizProsCookieConsent && window.QuizProsCookieConsent.showCookieSettings) {
        window.QuizProsCookieConsent.showCookieSettings();
        
        // Track event
        if (window.QuizProsAnalytics) {
          window.QuizProsAnalytics.trackEvent(
            config.analytics.categories.consent,
            'OpenSettings',
            'Footer'
          );
        }
      }
    });
  }
  
  // Track social link clicks
  const socialLinks = document.querySelectorAll('.social-link');
  socialLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      // Track event
      if (window.QuizProsAnalytics) {
        const platform = this.textContent.trim();
        
        window.QuizProsAnalytics.trackEvent(
          config.analytics.categories.social,
          'SocialClick',
          platform
        );
      }
    });
  });
  
  // Mobile footer toggle functionality
  setupMobileFooter();
}

/**
 * Set up mobile footer menu functionality
 */
function setupMobileFooter() {
  // Get necessary elements
  const mobileFooterToggle = document.querySelector('.mobile-footer-toggle');
  const mobileFooterOverlay = document.querySelector('.mobile-footer-overlay');
  const footerNavItems = document.querySelectorAll('.footer-nav-item');
  
  if (mobileFooterToggle && mobileFooterOverlay) {
    // Handle dropdown toggles
    footerNavItems.forEach(item => {
      const link = item.querySelector('.footer-nav-link');
      if (link) {
        link.addEventListener('click', function(e) {
          e.preventDefault();
          
          // Close any open dropdowns
          footerNavItems.forEach(otherItem => {
            if (otherItem !== item) {
              otherItem.classList.remove('active');
            }
          });
          
          // Toggle this dropdown
          item.classList.toggle('active');
          
          // Toggle chevron direction
          const chevron = link.querySelector('.fa-chevron-down, .fa-chevron-up');
          if (chevron) {
            if (item.classList.contains('active')) {
              chevron.classList.remove('fa-chevron-down');
              chevron.classList.add('fa-chevron-up');
            } else {
              chevron.classList.remove('fa-chevron-up');
              chevron.classList.add('fa-chevron-down');
            }
          }
        });
      }
    });
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', function(e) {
      if (!e.target.closest('.footer-nav-item')) {
        footerNavItems.forEach(item => {
          item.classList.remove('active');
          const chevron = item.querySelector('.fa-chevron-up');
          if (chevron) {
            chevron.classList.remove('fa-chevron-up');
            chevron.classList.add('fa-chevron-down');
          }
        });
      }
    });
    
    // Handle window resize
    window.addEventListener('resize', function() {
      // Reset footer dropdowns
      footerNavItems.forEach(item => {
        item.classList.remove('active');
        const chevron = item.querySelector('.fa-chevron-up');
        if (chevron) {
          chevron.classList.remove('fa-chevron-up');
          chevron.classList.add('fa-chevron-down');
        }
      });
    });
  }
}

/**
 * Add a newsletter subscription form to the footer
 */
function addNewsletterForm() {
  // Check if footer exists
  const footerContainer = document.querySelector('.footer-container');
  if (!footerContainer) return;
  
  // Create newsletter section
  const newsletterSection = document.createElement('div');
  newsletterSection.className = 'footer-newsletter';
  newsletterSection.innerHTML = `
    <h4>Newsletter</h4>
    <p>Subscribe to get quiz updates and special offers</p>
    <form class="newsletter-form" id="newsletter-form">
      <div class="form-group">
        <input type="email" name="email" placeholder="Your email address" required>
        <button type="submit">Subscribe</button>
      </div>
      <div class="form-consent">
        <label>
          <input type="checkbox" name="consent" required>
          I agree to receive emails and accept the <a href="privacy-policy.html">Privacy Policy</a>
        </label>
      </div>
    </form>
  `;
  
  // Add to footer - insert before footer-bottom
  const footerBottom = footerContainer.querySelector('.footer-bottom');
  if (footerBottom) {
    footerContainer.insertBefore(newsletterSection, footerBottom);
  } else {
    footerContainer.appendChild(newsletterSection);
  }
  
  // Add event listener for form submission
  const form = document.getElementById('newsletter-form');
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Get email
      const email = this.querySelector('input[name="email"]').value;
      
      // Show success message
      this.innerHTML = `
        <div class="newsletter-success">
          <i class="fas fa-check-circle"></i>
          <p>Thank you for subscribing!</p>
        </div>
      `;
      
      // Track event
      if (window.QuizProsAnalytics) {
        window.QuizProsAnalytics.trackEvent(
          config.analytics.categories.navigation,
          'NewsletterSubscribe'
        );
      }
    });
  }
}

/**
 * Add a premium promotion to the footer
 */
function addPremiumPromotion() {
  // Check if footer exists and user doesn't have premium
  const footerContainer = document.querySelector('.footer-container');
  if (!footerContainer) return;
  
  // Check if user has premium
  const hasPremium = window.QuizProsPremium && window.QuizProsPremium.hasPremiumAccess();
  if (hasPremium) return;
  
  // Create premium promotion
  const premiumPromo = document.createElement('div');
  premiumPromo.className = 'footer-premium-promo';
  premiumPromo.innerHTML = `
    <div class="premium-promo-content">
      <div class="premium-promo-icon"><i class="fas fa-crown"></i></div>
      <div class="premium-promo-text">
        <h4>Upgrade to Premium</h4>
        <p>Get access to exclusive quizzes, detailed results, and more!</p>
      </div>
      <div class="premium-promo-action">
        <a href="/premium.html" class="premium-promo-button">Learn More</a>
      </div>
    </div>
  `;
  
  // Add to footer - insert before footer-bottom
  const footerBottom = footerContainer.querySelector('.footer-bottom');
  if (footerBottom) {
    footerContainer.insertBefore(premiumPromo, footerBottom);
  } else {
    footerContainer.appendChild(premiumPromo);
  }
  
  // Add event listener for premium button
  const promoButton = premiumPromo.querySelector('.premium-promo-button');
  if (promoButton) {
    promoButton.addEventListener('click', function(e) {
      // Track event
      if (window.QuizProsAnalytics) {
        window.QuizProsAnalytics.trackEvent(
          config.analytics.categories.premium,
          'PromoClick',
          'Footer'
        );
      }
    });
  }
}

/**
 * Update footer links based on current page
 */
function updateFooterLinks() {
  // Get current page path
  const currentPath = window.location.pathname;
  
  // Get all footer links
  const footerLinks = document.querySelectorAll('.footer-link, .footer-nav a, .footer-dropdown-item');
  
  // Update links
  footerLinks.forEach(link => {
    const href = link.getAttribute('href');
    
    // Skip links that are not relative or are anchors
    if (!href || href.startsWith('http') || href.startsWith('#')) {
      return;
    }
    
    // If we're in a subdirectory, adjust links
    if (currentPath.includes('/premium/')) {
      // We're in the premium directory, adjust links to go up one level
      if (!href.startsWith('../') && !href.startsWith('/')) {
        link.setAttribute('href', '../' + href);
      }
    }
  });
}

/**
 * Add CSS styles for the responsive footer
 */
function addFooterStyles() {
  // Check if styles already exist
  if (document.getElementById('footer-dynamic-styles')) return;
  
  // Create style element
  const style = document.createElement('style');
  style.id = 'footer-dynamic-styles';
  
  // Define responsive footer CSS
  style.textContent = `
    /* Footer Styles */
    .site-footer {
      background-color: #f8f9fa;
      padding: 40px 0 0;
      margin-top: 60px;
      border-top: 1px solid #e7e7e7;
    }
    
    .footer-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px;
      position: relative;
    }
    
    .footer-logo {
      margin-bottom: 30px;
    }
    
    .footer-logo .logo-link {
      display: inline-block;
      margin-bottom: 10px;
      text-decoration: none;
    }
    
    .footer-logo .logo-text {
      font-size: 1.8rem;
      font-weight: 700;
      color: #25d366;
    }
    
    .footer-tagline {
      color: #777;
      font-size: 1rem;
      margin: 0;
    }
    
    /* Footer Navigation - Compact Layout */
    .footer-compact-nav {
      display: flex;
      gap: 30px;
      align-items: center;
    }
    
    .footer-nav-item {
      position: relative;
    }
    
    .footer-nav-link {
      color: #555;
      font-weight: 500;
      font-size: 0.95rem;
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 5px;
      transition: color 0.2s ease;
    }
    
    .footer-nav-link:hover {
      color: #25d366;
    }
    
    .footer-nav-link i {
      font-size: 0.75rem;
    }
    
    /* Footer Dropdown Menu */
    .footer-dropdown-menu {
      position: absolute;
      bottom: 100%;
      left: 0;
      background-color: #fff;
      border-radius: 8px;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
      padding: 10px 0;
      min-width: 220px;
      opacity: 0;
      visibility: hidden;
      transform: translateY(10px);
      transition: all 0.3s ease;
      z-index: 100;
      list-style: none;
      margin: 0 0 10px 0;
    }
    
    .footer-nav-item:hover .footer-dropdown-menu {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }
    
    .footer-dropdown-item {
      display: block;
      padding: 8px 15px;
      color: #333;
      text-decoration: none;
      transition: all 0.2s ease;
      font-size: 0.95rem;
    }
    
    .footer-dropdown-item:hover {
      background-color: #f5f5f5;
      color: #25d366;
    }
    
    /* Newsletter form */
    .footer-newsletter {
      margin-bottom: 30px;
    }
    
    .newsletter-form .form-group {
      display: flex;
      margin-bottom: 10px;
    }
    
    .newsletter-form input[type="email"] {
      flex: 1;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px 0 0 4px;
      font-size: 0.9rem;
    }
    
    .newsletter-form button {
      padding: 10px 15px;
      background-color: #25d366;
      color: white;
      border: none;
      border-radius: 0 4px 4px 0;
      cursor: pointer;
      transition: background-color 0.2s ease;
    }
    
    .newsletter-form button:hover {
      background-color: #128c7e;
    }
    
    .form-consent {
      font-size: 0.8rem;
      color: #666;
    }
    
    .newsletter-success {
      text-align: center;
      padding: 15px;
    }
    
    .newsletter-success i {
      color: #25d366;
      font-size: 2rem;
      margin-bottom: 10px;
    }
    
    /* Premium Promo */
    .footer-premium-promo {
      margin-bottom: 30px;
      background: linear-gradient(135deg, #f9f9f9, #f0f0f0);
      border-radius: 8px;
      overflow: hidden;
    }
    
    .premium-promo-content {
      display: flex;
      align-items: center;
      padding: 20px;
      gap: 15px;
    }
    
    .premium-promo-icon {
      font-size: 1.5rem;
      color: #ffc107;
    }
    
    .premium-promo-text {
      flex: 1;
    }
    
    .premium-promo-text h4 {
      margin: 0 0 5px 0;
      color: #333;
    }
    
    .premium-promo-text p {
      margin: 0;
      font-size: 0.9rem;
      color: #666;
    }
    
    .premium-promo-button {
      padding: 8px 15px;
      background-color: #ffc107;
      color: #333;
      text-decoration: none;
      border-radius: 4px;
      font-weight: 600;
      font-size: 0.9rem;
      transition: all 0.2s ease;
    }
    
    .premium-promo-button:hover {
      background-color: #e0a800;
      transform: translateY(-2px);
    }
    
    /* Footer Bottom */
    .footer-bottom {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px 0;
      border-top: 1px solid #e7e7e7;
    }
    
    .copyright {
      font-size: 0.9rem;
      color: #777;
    }
    
    .footer-menu-container {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .footer-divider {
      width: 1px;
      height: 20px;
      background-color: #e0e0e0;
      margin: 0 10px;
    }
    
    .footer-links {
      display: flex;
      gap: 20px;
    }
    
    .footer-link {
      font-size: 0.9rem;
      color: #555;
      text-decoration: none;
      transition: color 0.2s ease;
    }
    
    .footer-link:hover {
      color: #25d366;
    }
    
    /* Mobile Menu Toggle */
    .mobile-footer-toggle {
      display: none;
      background: none;
      border: none;
      font-size: 1.5rem;
      color: #333;
      cursor: pointer;
      position: absolute;
      top: 10px;
      right: 20px;
      z-index: 101;
    }
    
    /* Mobile Overlay */
    .mobile-footer-overlay {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      z-index: 98;
    }
    
    /* Responsive Styles */
    @media (max-width: 992px) {
      .footer-nav-list {
        gap: 30px;
      }
    }
    
    @media (max-width: 768px) {
      .footer-container {
        padding: 0 15px;
      }
      
      .mobile-footer-toggle {
        display: block;
      }
      
      .mobile-footer-overlay.active {
        display: block;
      }
      
      /* Adjust footer bottom for mobile */
      .footer-bottom {
        flex-direction: column;
        gap: 15px;
        text-align: center;
        padding: 15px 0;
      }
      
      /* Stack everything in the menu container */
      .footer-menu-container {
        flex-direction: column;
        gap: 15px;
        width: 100%;
      }
      
      /* Hide the divider on mobile */
      .footer-divider {
        display: none;
      }
      
      /* Center the compact nav and make it wrap */
      .footer-compact-nav {
        flex-wrap: wrap;
        justify-content: center;
        gap: 20px;
      }
      
      /* Center the links */
      .footer-links {
        justify-content: center;
        flex-wrap: wrap;
      }
      
      /* Handle the dropdown menus */
      .footer-dropdown-menu {
        position: absolute;
        bottom: 100%;
        left: 50%;
        transform: translateX(-50%) translateY(10px);
        min-width: 200px;
        text-align: left;
      }
      
      .footer-nav-item.active .footer-dropdown-menu {
        transform: translateX(-50%) translateY(0);
      }
      
      /* Adjust link spacing */
      .footer-nav-link, .footer-link {
        padding: 5px;
      }
    }
    
    @media (max-width: 576px) {
      .site-footer {
        padding-top: 20px;
        margin-top: 40px;
      }
      
      .footer-logo {
        text-align: center;
      }
      
      .footer-logo .logo-text {
        font-size: 1.5rem;
      }
      
      .footer-tagline {
        font-size: 0.9rem;
      }
      
      .newsletter-form .form-group {
        flex-direction: column;
      }
      
      .newsletter-form input[type="email"] {
        border-radius: 4px;
        margin-bottom: 10px;
      }
      
      .newsletter-form button {
        border-radius: 4px;
        width: 100%;
      }
    }

    /* Sticky Footer Styles */
    html, body {
      height: 100%;
      margin: 0;
      padding: 0;
    }
    
    body {
      display: flex;
      flex-direction: column;
      min-height: 100vh; /* Use viewport height to ensure full page height */
    }
    
    /* Make main content area grow to push footer down */
    body > *:not(.site-footer) {
      flex: 1 0 auto; /* Grow and don't shrink */
    }
    
    /* Footer sits naturally at bottom of page flow — not sticky/fixed */
    .site-footer {
      flex-shrink: 0;
      width: 100%;
      box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.06);
      transition: opacity 0.3s ease;
    }

    /* Hide footer completely when in quiz play mode */
    .site-footer.hidden,
    .site-footer.footer-hidden {
      display: none !important;
    }

    /* Normal content bottom spacing */
    .quiz-container {
      padding-bottom: 20px;
    }

    #topic-selection-screen,
    #category-selection-screen {
      padding-bottom: 20px;
      margin-bottom: 0 !important;
    }
  `;
  
  // Add style to head
  document.head.appendChild(style);
}

/**
 * Set up sticky footer behavior
 */
function setupStickyFooterBehavior() {
  const footer = document.querySelector('.site-footer');
  if (!footer) return;
  
  utils.logger.info('Setting up sticky footer behavior');
  
  // Hide footer during quiz play
  function checkAndToggleFooterVisibility() {
    // Check if we're in quiz play mode (main-quiz-container is visible)
    const quizContainer = document.getElementById('main-quiz-container');
    const topicSelectionScreen = document.getElementById('topic-selection-screen');
    
    if (quizContainer && topicSelectionScreen) {
      // If main quiz container is visible and topic selection is hidden, we're in quiz play mode
      if (quizContainer.style.display !== 'none' && topicSelectionScreen.style.display === 'none') {
        footer.classList.add('footer-hidden');
      } else {
        footer.classList.remove('footer-hidden');
      }
    }
  }
  
  // Check visibility initially
  checkAndToggleFooterVisibility();
  
  // Set up a mutation observer to detect changes to the quiz containers
  const targetNodes = [
    document.getElementById('main-quiz-container'),
    document.getElementById('topic-selection-screen')
  ].filter(Boolean);
  
  if (targetNodes.length > 0) {
    const observer = new MutationObserver(function(mutations) {
      checkAndToggleFooterVisibility();
    });
    
    const config = { attributes: true, attributeFilter: ['style'] };
    targetNodes.forEach(node => {
      observer.observe(node, config);
    });
  }
  
  // Also check on navigation events
  window.addEventListener('hashchange', checkAndToggleFooterVisibility);
  
  // Get footer height for calculations
  const footerHeight = footer.offsetHeight;
  
  // Variables for scroll tracking
  let lastScrollTop = 0;
  
  // Throttle function to limit scroll event firing
  function throttle(callback, delay) {
    let previousCall = new Date().getTime();
    return function() {
      const time = new Date().getTime();
      
      if ((time - previousCall) >= delay) {
        previousCall = time;
        callback.apply(null, arguments);
      }
    };
  }
  
  // Handle scroll events
  const handleScroll = throttle(function() {
    // Don't process scroll events if footer is hidden for quiz play
    if (footer.classList.contains('footer-hidden')) {
      return;
    }
    
    const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
    
    // Determine scroll direction
    const scrollDirectionDown = currentScroll > lastScrollTop;
    
    // At bottom of page or scrolling up: show footer
    if (!scrollDirectionDown || 
        (window.innerHeight + currentScroll) >= document.documentElement.scrollHeight - 10) {
      footer.classList.remove('hidden');
    } else if (currentScroll > footerHeight && scrollDirectionDown) {
      // Hide footer when scrolling down and not at bottom
      footer.classList.add('hidden');
    }
    
    lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
  }, 100);
  
  // Add scroll event listener
  window.addEventListener('scroll', handleScroll);
  
  // Initial check
  handleScroll();
}

/**
 * Initialize all footer components
 */
function initializeFullFooter() {
  // Add footer styles
  addFooterStyles();
  
  // Initialize the base footer
  initializeFooter();
  
  // Add additional components
  setTimeout(function() {
    // Removed: addNewsletterForm();
    // Removed: addPremiumPromotion();
    updateFooterLinks();
    
    // Set up sticky footer behavior
    setupStickyFooterBehavior();
  }, 100);
}

// Public API
return {
  initializeFooter: initializeFooter,
  initializeFullFooter: initializeFullFooter,
  addNewsletterForm: addNewsletterForm,
  addPremiumPromotion: addPremiumPromotion,
  updateFooterLinks: updateFooterLinks,
  addFooterStyles: addFooterStyles,
  setupStickyFooterBehavior: setupStickyFooterBehavior,
  setFooterVisibility: setFooterVisibility
};
})();