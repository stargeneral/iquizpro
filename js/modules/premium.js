/**
 * QuizProsPremium — Premium subscription module
 *
 * Responsibilities:
 *  - Track current user's subscription tier (free / premium / unlimited)
 *  - Gate access to premium quiz IDs
 *  - Show upgrade modal when a free user attempts gated content
 *  - Redirect to Stripe Payment Link with Firebase UID as client_reference_id
 *  - Render premium badges on quiz cards
 *
 * Does NOT handle Stripe webhooks (server-side, see functions/index.js).
 */

window.QuizProsPremium = (function() {
  'use strict';

  const config  = window.QuizProsConfig;
  const utils   = window.QuizProsUtils;

  // ---------------------------------------------------------------------------
  // Private state
  // ---------------------------------------------------------------------------
  let currentTier = 'free';  // 'free' | 'premium' | 'unlimited'
  let expiresAt   = null;
  let _initialized = false;

  // ---------------------------------------------------------------------------
  // Admin bypass — checked at call time so it works after sign-in
  // ---------------------------------------------------------------------------
  function _isAdmin() {
    try {
      if (!config.admin || !config.admin.uid) return false;
      var user = (typeof firebase !== 'undefined') && firebase.auth && firebase.auth().currentUser;
      return !!(user && user.uid === config.admin.uid);
    } catch (e) { return false; }
  }

  // ---------------------------------------------------------------------------
  // Initialise
  // ---------------------------------------------------------------------------
  function initialize() {
    if (_initialized) return;
    _initialized = true;

    utils.logger.info('QuizProsPremium: initializing');

    // Load tier from UserManager if available
    _syncFromUserManager();

    // Listen for auth / premium changes
    document.addEventListener('quizpros:user:premiumUpdated', function(e) {
      _applyStatus(e.detail);
    });
    document.addEventListener('quizpros:user:signedOut', function() {
      _resetStatus();
    });

    utils.logger.debug('QuizProsPremium: initialized, tier=' + currentTier);
  }

  function _syncFromUserManager() {
    if (!window.QuizProsUserManager) return;
    const status = window.QuizProsUserManager.getPremiumStatus();
    if (status && status.hasPremium) {
      currentTier = status.tier || 'premium';
      expiresAt   = status.expiresAt || null;
    }
  }

  function _applyStatus(status) {
    if (!status) return;
    currentTier = status.tier || 'free';
    expiresAt   = status.expiresAt || null;
    utils.logger.info('QuizProsPremium: tier updated to ' + currentTier);
    _dispatchEvent('statusUpdated', { tier: currentTier, expiresAt });
  }

  function _resetStatus() {
    currentTier = 'free';
    expiresAt   = null;
    _dispatchEvent('statusReset');
  }

  function _dispatchEvent(name, data) {
    document.dispatchEvent(new CustomEvent('quizpros:premium:' + name, {
      detail: data || {},
      bubbles: true
    }));
  }

  // ---------------------------------------------------------------------------
  // Access checks
  // ---------------------------------------------------------------------------

  /** Returns true if subscription is active (not expired). */
  function hasPremiumAccess() {
    if (_isAdmin()) return true;  // admin always has full access
    if (currentTier === 'free') return false;
    if (!expiresAt) return true; // no expiry = Stripe manages it server-side
    return new Date() < new Date(expiresAt);
  }

  /** Returns true if user can access the requested tier level. */
  function hasTierAccess(requiredTier) {
    if (_isAdmin()) return true;  // admin has access to every tier
    if (!hasPremiumAccess()) return false;
    const tiers = ['free', 'premium', 'pro', 'unlimited', 'enterprise'];
    return tiers.indexOf(currentTier) >= tiers.indexOf(requiredTier);
  }

  /**
   * Returns true if a quiz ID requires a paid subscription.
   * @param {string} quizId
   */
  function requiresPremium(quizId) {
    const gated = (config.premium && config.premium.gatedQuizIds) || [];
    return gated.includes(quizId);
  }

  /**
   * Check access for a quiz. If access is denied, show the upgrade modal.
   * @param {string} quizId
   * @returns {boolean} true = user may proceed
   */
  function checkQuizAccess(quizId) {
    if (!requiresPremium(quizId)) return true;
    if (_isAdmin()) return true;  // admin bypasses all quiz gates
    if (hasTierAccess('premium')) return true;
    showUpgradeModal(quizId);
    return false;
  }

  function getCurrentTier()    { return _isAdmin() ? 'enterprise' : currentTier; }
  function getExpirationDate() { return hasPremiumAccess() ? expiresAt : null; }

  function getDaysRemaining() {
    if (!hasPremiumAccess() || !expiresAt) return 0;
    const diff = new Date(expiresAt) - new Date();
    return Math.max(0, Math.ceil(diff / 86400000));
  }

  // ---------------------------------------------------------------------------
  // Upgrade modal
  // ---------------------------------------------------------------------------

  /**
   * Show an upgrade modal prompting the user to go to the pricing page.
   * @param {string} [quizId] - optional quiz that triggered the gate
   */
  function showUpgradeModal(quizId) {
    const existing = document.getElementById('premium-upgrade-modal');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'premium-upgrade-modal';
    overlay.style.cssText = [
      'position:fixed;inset:0;background:rgba(0,0,0,.55);',
      'display:flex;align-items:center;justify-content:center;',
      'z-index:99999;opacity:0;transition:opacity .25s'
    ].join('');

    overlay.innerHTML = `
      <div style="background:#fff;border-radius:16px;padding:2.5rem 2rem;max-width:420px;width:90%;
                  text-align:center;box-shadow:0 20px 60px rgba(0,0,0,.25);">
        <div style="font-size:3rem;margin-bottom:.75rem;">👑</div>
        <h2 style="margin-bottom:.5rem;color:#333;font-size:1.6rem;">Premium Content</h2>
        <p style="color:#666;margin-bottom:1.5rem;line-height:1.6;">
          ${quizId ? 'This quiz requires a Premium subscription.' : 'This feature requires a Premium subscription.'}
          Unlock 200 AI quiz generations/month, premium quizzes, quiz history and more.
        </p>
        <a href="/premium.html" id="upgrade-modal-cta"
           style="display:block;background:linear-gradient(135deg,#25d366,#128c7e);
                  color:#fff;padding:.9rem 2rem;border-radius:8px;text-decoration:none;
                  font-weight:600;font-size:1.05rem;margin-bottom:.8rem;">
          View Premium Plans
        </a>
        <button id="upgrade-modal-close"
                style="background:none;border:none;color:#aaa;font-size:.95rem;cursor:pointer;">
          Maybe later
        </button>
      </div>`;

    document.body.appendChild(overlay);

    // Animate in
    requestAnimationFrame(() => { overlay.style.opacity = '1'; });

    const close = () => {
      overlay.style.opacity = '0';
      setTimeout(() => overlay.remove(), 250);
    };

    overlay.addEventListener('click', function(e) { if (e.target === overlay) close(); });
    overlay.querySelector('#upgrade-modal-close').addEventListener('click', close);

    utils.analytics && utils.analytics.trackEvent &&
      utils.analytics.trackEvent(config.analytics.categories.premium, 'UpgradeModalShown', quizId || 'generic');
  }

  // ---------------------------------------------------------------------------
  // Payment Link redirect
  // ---------------------------------------------------------------------------

  /**
   * Redirect the current user to a Stripe Payment Link for the given tier.
   * Attaches client_reference_id (Firebase UID) so the webhook can link the payment.
   * @param {'premium'|'unlimited'} tier
   */
  function redirectToPaymentLink(tier) {
    const links = (config.stripe && config.stripe.paymentLinks) || {};
    const baseUrl = links[tier];

    if (!baseUrl || baseUrl.includes('REPLACE_WITH')) {
      utils.logger.warn('QuizProsPremium: Payment Link not configured for tier ' + tier);
      window.location.href = '/premium.html';
      return;
    }

    // Require sign-in
    if (!firebase || !firebase.auth) {
      window.location.href = '/premium.html';
      return;
    }

    const user = firebase.auth().currentUser;
    if (!user) {
      // Redirect to premium page; user will sign in there first
      window.location.href = '/premium.html';
      return;
    }

    const url = new URL(baseUrl);
    url.searchParams.set('client_reference_id', user.uid);
    if (user.email) url.searchParams.set('prefilled_email', user.email);

    // Track premium upgrade conversion intent
    try {
      if (window.QuizProsAnalytics && window.QuizProsAnalytics.trackPremiumUpgrade) {
        window.QuizProsAnalytics.trackPremiumUpgrade();
      }
    } catch (e) { /* non-fatal */ }

    window.location.href = url.toString();
  }

  // ---------------------------------------------------------------------------
  // Premium badge helpers
  // ---------------------------------------------------------------------------

  function createPremiumBadge(size) {
    size = size || 'medium';
    const badge = document.createElement('span');
    badge.className = 'premium-badge premium-badge-' + size;
    badge.innerHTML = size === 'small'
      ? '<i class="fas fa-crown"></i>'
      : '<i class="fas fa-crown"></i> Premium';
    return badge;
  }

  function addPremiumBadge(element, position, size) {
    if (!element) return;
    position = position || 'top-right';
    size     = size     || 'small';
    const badge = createPremiumBadge(size);
    badge.classList.add('premium-badge-' + position);
    element.classList.add('premium-badge-container');
    element.appendChild(badge);
  }

  /**
   * Apply premium gating to an element.
   * If user has access: adds a badge. If not: overlays a lock and CTA.
   */
  function checkPremiumContent(element, contentId, contentType, requiredTier) {
    if (!element) return false;
    requiredTier = requiredTier || 'premium';

    if (hasTierAccess(requiredTier)) {
      addPremiumBadge(element, 'top-right', 'small');
      return true;
    }

    const overlay = document.createElement('div');
    overlay.className = 'premium-locked-overlay';
    overlay.innerHTML = `
      <div class="premium-locked-content">
        <div class="premium-lock-icon"><i class="fas fa-lock"></i></div>
        <div class="premium-lock-text">Premium</div>
        <button class="premium-unlock-btn">Unlock</button>
      </div>`;

    element.classList.add('premium-locked-container');
    element.appendChild(overlay);

    overlay.querySelector('.premium-unlock-btn').addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      showUpgradeModal(contentId);
      utils.analytics && utils.analytics.trackEvent &&
        utils.analytics.trackEvent(config.analytics.categories.premium, 'UnlockAttempt',
          (contentType || 'content') + ':' + (contentId || ''));
    });

    return false;
  }

  // ---------------------------------------------------------------------------
  // Legacy showSignupModal (kept for backward compat; wraps showUpgradeModal)
  // ---------------------------------------------------------------------------
  function showSignupModal(tier) {
    showUpgradeModal(null);
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------
  return {
    initialize,
    hasPremiumAccess,
    hasTierAccess,
    requiresPremium,
    checkQuizAccess,
    getCurrentTier,
    getExpirationDate,
    getDaysRemaining,
    showUpgradeModal,
    showSignupModal,        // backward compat
    redirectToPaymentLink,
    createPremiumBadge,
    addPremiumBadge,
    checkPremiumContent,
    isPremiumEnabled: hasPremiumAccess  // legacy alias
  };
})();

// Auto-initialize
document.addEventListener('DOMContentLoaded', function() {
  if (window.QuizProsPremium) {
    window.QuizProsPremium.initialize();
  }
});
