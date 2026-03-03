/**
 * Mobile Menu Component for IQuizPros
 * Handles hamburger menu toggle, overlay, and touch events.
 * Requires the header HTML to already be in the DOM before initialize() is called.
 */

window.QuizProsMobileMenu = (function() {
  'use strict';

  /**
   * Initialize mobile menu event listeners.
   * Called by header.js after the header HTML has been injected.
   */
  function initialize() {
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const headerNav = document.querySelector('.header-nav');
    const mobileMenuOverlay = document.querySelector('.mobile-menu-overlay');

    if (!mobileMenuToggle || !headerNav || !mobileMenuOverlay) {
      return;
    }

    function toggleMobileMenu(e) {
      if (e) e.preventDefault();
      headerNav.classList.toggle('active');
      mobileMenuOverlay.classList.toggle('active');

      if (headerNav.classList.contains('active')) {
        mobileMenuToggle.innerHTML = '<i class="fas fa-times"></i>';
      } else {
        mobileMenuToggle.innerHTML = '<i class="fas fa-bars"></i>';
      }
    }

    function closeMobileMenu(e) {
      if (e) e.preventDefault();
      headerNav.classList.remove('active');
      mobileMenuOverlay.classList.remove('active');
      mobileMenuToggle.innerHTML = '<i class="fas fa-bars"></i>';
    }

    // Toggle on click and touch
    mobileMenuToggle.addEventListener('click', toggleMobileMenu);
    mobileMenuToggle.addEventListener('touchend', function(e) {
      e.preventDefault();
      toggleMobileMenu(e);
    });

    // Close when overlay is tapped/clicked
    mobileMenuOverlay.addEventListener('click', closeMobileMenu);
    mobileMenuOverlay.addEventListener('touchend', closeMobileMenu);
  }

  return { initialize: initialize };
})();
