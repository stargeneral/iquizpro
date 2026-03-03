/**
 * Unified Authentication Manager for IQuizPros
 * Consolidates all auth functionality from 10 legacy files into one module.
 *
 * Replaces:
 *   js/firebase-auth-fix.js, js/auth-service-fix-v2.js, js/auth-service-fix.js,
 *   js/auth-fix.js, js/auth-persistence-fix.js, js/auth-button-fix.js,
 *   js/direct-auth-fix.js, js/modules/auth-service.js,
 *   js/modules/auth-ui.js, js/modules/auth-helper.js,
 *   js/components/auth-header-integration.js
 *
 * Backward-compat facades exposed:
 *   window.QuizProsFirebase, window.QuizProsAuth, window.QuizProsAuthUI,
 *   window.QuizProsHeaderAuth, window.forceShowSignInModal,
 *   window.createEmergencySignInModal, window.triggerSignIn,
 *   window.directSignIn, window.directFirebaseSignIn, window.fixAuthButtons
 */

window.QuizProsAuthManager = (function () {
  'use strict';

  // ─── Logger ───────────────────────────────────────────────────────────────
  const log = {
    info:  (m, ...a) => console.info('[AUTH] ' + m, ...a),
    warn:  (m, ...a) => console.warn('[AUTH] ' + m, ...a),
    error: (m, ...a) => console.error('[AUTH] ' + m, ...a),
    debug: (m, ...a) => console.debug('[AUTH] ' + m, ...a)
  };

  // ─── Private State ─────────────────────────────────────────────────────────
  let _firebaseApp       = null;
  let _auth              = null;
  let _currentUser       = null;
  let _fbInitialized     = false;
  let _authInitialized   = false;
  let _modalsCreated     = false;
  let _googleInProgress  = false;

  // ─── Firebase Initialization ───────────────────────────────────────────────
  function _initFirebase() {
    if (_fbInitialized) return true;
    if (typeof firebase === 'undefined') { log.error('Firebase SDK not loaded'); return false; }

    const cfg = window.QuizProsConfig && window.QuizProsConfig.firebase;
    if (!cfg || !cfg.apiKey) { log.error('Firebase config not in QuizProsConfig'); return false; }

    try {
      if (!firebase.apps || !firebase.apps.length) {
        _firebaseApp = firebase.initializeApp(cfg);
        log.info('Firebase app initialized');
      } else {
        _firebaseApp = firebase.app();
        log.debug('Using existing Firebase app');
      }
      _fbInitialized = true;
      return true;
    } catch (e) {
      log.error('Firebase init failed:', e);
      return false;
    }
  }

  // ─── Auth Initialization ───────────────────────────────────────────────────

  function _doInitAuth() {
    try {
      _auth = firebase.auth();

      // Set LOCAL persistence so users stay signed in across page reloads
      _auth.setPersistence('local').catch(e => log.warn('setPersistence failed:', e));

      // Single onAuthStateChanged listener — all state flows from here
      _auth.onAuthStateChanged(_handleAuthStateChange);

      // Handle Google redirect result on every page load
      _auth.getRedirectResult()
        .then(result => { if (result && result.user) _googleInProgress = false; })
        .catch(e => { _googleInProgress = false; });

      _authInitialized = true;
      log.info('Auth initialized');
    } catch (e) {
      log.error('Auth init failed:', e);
    }
  }

  // Returns a promise that resolves to _auth once it is available, or rejects
  // after maxWaitMs. Used by signIn/signUp to tolerate the async SDK loading
  // window (Phase 11.6) without immediately rejecting on mobile devices where
  // JS parsing is slower and _auth may not be set for 500–1500ms after page load.
  function _waitForAuth(maxWaitMs) {
    if (_auth) return Promise.resolve(_auth);
    return new Promise(function(resolve, reject) {
      var elapsed = 0;
      var poll = setInterval(function() {
        elapsed += 50;
        if (_auth) {
          clearInterval(poll);
          resolve(_auth);
        } else if (elapsed >= maxWaitMs) {
          clearInterval(poll);
          var e = new Error('Auth not ready'); e.code = 'auth/not-ready';
          reject(e);
        }
      }, 50);
    });
  }

  // 11.6: Poll for firebase.auth availability (auth SDK may load async)
  function _waitForAuthAndInit(attempts) {
    if (typeof firebase !== 'undefined' && typeof firebase.auth === 'function') {
      _doInitAuth();
      return;
    }
    if (attempts <= 0) {
      log.warn('firebase.auth never became available after polling timeout');
      return;
    }
    setTimeout(function() { _waitForAuthAndInit(attempts - 1); }, 50);
  }

  function initialize() {
    if (_authInitialized) return true;
    if (!_initFirebase()) return false;

    if (typeof firebase.auth === 'function') {
      _doInitAuth();
    } else {
      // Auth SDK not yet parsed — poll up to 60 × 50ms = 3000ms as safety net.
      // (auth-compat script should be synchronous now, so this path should be rare.)
      log.info('firebase.auth not yet available, polling…');
      _waitForAuthAndInit(60);
    }
    return true;
  }

  // ─── Auth State Change Handler ─────────────────────────────────────────────
  function _handleAuthStateChange(user) {
    if (user) {
      _currentUser = {
        id:            user.uid,
        email:         user.email,
        displayName:   user.displayName || (user.email ? user.email.split('@')[0] : 'User'),
        photoURL:      user.photoURL,
        emailVerified: user.emailVerified,
        provider:      (user.providerData && user.providerData.length)
                         ? user.providerData[0].providerId : 'unknown'
      };
      log.info('Signed in:', _currentUser.email);

      _closeAllModals();
      _updateHeaderForUser(_currentUser);

      if (window.QuizProsAnalytics) {
        try { window.QuizProsAnalytics.trackEvent('Authentication', 'SignedIn', _currentUser.provider); } catch (_) {}
      }

      document.dispatchEvent(new CustomEvent('quizpros:auth:signed_in', {
        detail: _currentUser, bubbles: true
      }));
    } else {
      const wasSignedIn = !!_currentUser;
      _currentUser = null;
      log.info('Signed out');

      _updateHeaderForGuest();

      if (wasSignedIn) {
        document.dispatchEvent(new CustomEvent('quizpros:auth:signed_out', { bubbles: true }));
        if (window.QuizProsAnalytics) {
          try { window.QuizProsAnalytics.trackEvent('Authentication', 'SignedOut'); } catch (_) {}
        }
      }
    }
  }

  // ─── Auth Operations ───────────────────────────────────────────────────────
  function signIn(email, password) {
    if (!initialize()) {
      const e = new Error('Auth not initialized'); e.code = 'auth/not-ready';
      return Promise.reject(e);
    }
    // Wait up to 3 s for _auth to be set (mobile devices parse the async auth
    // SDK script more slowly, so _auth may not yet be available on form submit).
    return _waitForAuth(3000)
      .then(function(auth) {
        // setPersistence is already set in initialize(); calling it again here
        // adds unnecessary latency on mobile before signInWithEmailAndPassword.
        return auth.signInWithEmailAndPassword(email, password).then(cred => cred.user);
      })
      .catch(e => { log.error('signIn error:', e); throw e; });
  }

  function signUp(email, password, displayName) {
    if (!initialize()) {
      const e = new Error('Auth not initialized'); e.code = 'auth/not-ready';
      return Promise.reject(e);
    }
    return _waitForAuth(3000)
      .then(function(auth) {
        return auth.createUserWithEmailAndPassword(email, password)
          .then(cred => {
            // Track new user signup conversion
            try {
              if (window.QuizProsAnalytics && window.QuizProsAnalytics.trackSignup) {
                window.QuizProsAnalytics.trackSignup();
              }
            } catch (e) { /* non-fatal */ }
            if (displayName) return cred.user.updateProfile({ displayName }).then(() => cred.user);
            return cred.user;
          });
      })
      .catch(e => { log.error('signUp error:', e); throw e; });
  }

  function signInWithGoogle() {
    if (!initialize()) return Promise.reject(new Error('Auth not initialized'));
    if (_googleInProgress) return Promise.reject(new Error('Auth already in progress'));
    _googleInProgress = true;
    try {
      const provider = new firebase.auth.GoogleAuthProvider();
      return _auth.signInWithRedirect(provider)
        .catch(e => { _googleInProgress = false; log.error('Google sign-in error:', e); throw e; });
    } catch (e) {
      _googleInProgress = false;
      return Promise.reject(e);
    }
  }

  function signOut() {
    if (!initialize()) return Promise.reject(new Error('Auth not initialized'));
    return _auth.signOut().catch(e => { log.error('signOut error:', e); throw e; });
  }

  function sendPasswordResetEmail(email) {
    if (!initialize()) return Promise.reject(new Error('Auth not initialized'));
    return _auth.sendPasswordResetEmail(email);
  }

  function isSignedIn()    { return !!_currentUser; }
  function getCurrentUser() { return _currentUser; }

  // ─── Error Message Helper ──────────────────────────────────────────────────
  function _getErrorMessage(e) {
    const map = {
      'auth/user-not-found':            'Invalid email or password.',
      'auth/wrong-password':            'Invalid email or password.',
      'auth/invalid-credential':        'Invalid email or password.',
      'auth/invalid-login-credentials': 'Invalid email or password.',
      'auth/too-many-requests':    'Too many attempts. Please try again later.',
      'auth/network-request-failed': 'Network error. Check your connection.',
      'auth/email-already-in-use': 'An account with this email already exists.',
      'auth/weak-password':        'Password must be at least 6 characters.',
      'auth/invalid-email':        'Please enter a valid email address.',
      'auth/popup-closed-by-user': 'Sign-in was cancelled.',
      'auth/not-ready':            'Service is starting up — please try again in a moment.'
    };
    return map[e.code] || (e.message || 'An error occurred. Please try again.');
  }

  // ─── Modal HTML Templates ──────────────────────────────────────────────────
  function _signInModalHTML() {
    return `
<div id="sign-in-modal" class="auth-modal" style="display:none;">
  <div class="auth-modal-content">
    <div class="auth-modal-header">
      <h2>Sign In</h2>
      <button type="button" class="auth-modal-close" aria-label="Close">&times;</button>
    </div>
    <div class="auth-modal-body">
      <div id="sign-in-error" class="auth-error" style="display:none;"></div>
      <div class="auth-form">
        <div class="auth-form-group">
          <label for="sign-in-email">Email</label>
          <input type="email" id="sign-in-email" placeholder="Enter your email" autocomplete="email" required>
        </div>
        <div class="auth-form-group">
          <label for="sign-in-password">Password</label>
          <input type="password" id="sign-in-password" placeholder="Enter your password" autocomplete="current-password" required>
        </div>
        <div class="auth-form-actions">
          <button id="sign-in-submit" class="auth-button">Sign In</button>
        </div>
        <div class="auth-separator"><span>OR</span></div>
        <div class="auth-social-buttons">
          <button id="google-sign-in-button" class="auth-social-button google-button">
            <i class="fab fa-google"></i> Sign in with Google
          </button>
        </div>
      </div>
    </div>
    <div class="auth-modal-footer">
      <p>Don't have an account? <a href="#" id="show-sign-up-link">Sign Up</a></p>
      <p><a href="#" id="forgot-password-link">Forgot Password?</a></p>
    </div>
  </div>
</div>`;
  }

  function _signUpModalHTML() {
    return `
<div id="sign-up-modal" class="auth-modal" style="display:none;">
  <div class="auth-modal-content">
    <div class="auth-modal-header">
      <h2>Create Account</h2>
      <button type="button" class="auth-modal-close" aria-label="Close">&times;</button>
    </div>
    <div class="auth-modal-body">
      <div id="sign-up-error" class="auth-error" style="display:none;"></div>
      <div class="auth-form">
        <div class="auth-form-group">
          <label for="sign-up-name">Name</label>
          <input type="text" id="sign-up-name" placeholder="Enter your name" autocomplete="name">
        </div>
        <div class="auth-form-group">
          <label for="sign-up-email">Email</label>
          <input type="email" id="sign-up-email" placeholder="Enter your email" autocomplete="email" required>
        </div>
        <div class="auth-form-group">
          <label for="sign-up-password">Password</label>
          <input type="password" id="sign-up-password" placeholder="At least 6 characters" autocomplete="new-password" required>
        </div>
        <div class="auth-form-group">
          <label for="sign-up-confirm-password">Confirm Password</label>
          <input type="password" id="sign-up-confirm-password" placeholder="Repeat your password" autocomplete="new-password" required>
        </div>
        <div class="auth-form-actions">
          <button id="sign-up-button" class="auth-button">Sign Up</button>
        </div>
        <div class="auth-separator"><span>OR</span></div>
        <div class="auth-social-buttons">
          <button id="google-sign-up-button" class="auth-social-button google-button">
            <i class="fab fa-google"></i> Sign up with Google
          </button>
        </div>
      </div>
    </div>
    <div class="auth-modal-footer">
      <p>Already have an account? <a href="#" id="show-sign-in-link">Sign In</a></p>
    </div>
  </div>
</div>`;
  }

  function _forgotPasswordModalHTML() {
    return `
<div id="forgot-password-modal" class="auth-modal" style="display:none;">
  <div class="auth-modal-content">
    <div class="auth-modal-header">
      <h2>Reset Password</h2>
      <button type="button" class="auth-modal-close" aria-label="Close">&times;</button>
    </div>
    <div class="auth-modal-body">
      <div id="forgot-password-error" class="auth-error" style="display:none;"></div>
      <div id="forgot-password-success" class="auth-success" style="display:none;"></div>
      <div class="auth-form">
        <p>Enter your email and we'll send you a reset link.</p>
        <div class="auth-form-group">
          <label for="forgot-password-email">Email</label>
          <input type="email" id="forgot-password-email" placeholder="Enter your email" required>
        </div>
        <div class="auth-form-actions">
          <button id="forgot-password-button" class="auth-button">Send Reset Email</button>
        </div>
      </div>
    </div>
    <div class="auth-modal-footer">
      <p><a href="#" id="back-to-sign-in-link">Back to Sign In</a></p>
    </div>
  </div>
</div>`;
  }

  function _quizAccessModalHTML() {
    return `
<div id="quiz-access-info-modal" class="auth-modal" style="display:none;">
  <div class="auth-modal-content">
    <div class="auth-modal-header">
      <h2>Sign In Required</h2>
      <button type="button" class="auth-modal-close" aria-label="Close">&times;</button>
    </div>
    <div class="auth-modal-body">
      <div class="auth-info-message">
        <p>This quiz requires a free account.</p>
        <p>Creating an account lets you:</p>
        <ul style="text-align:left;margin:12px 0;">
          <li>Access all our free quizzes</li>
          <li>Save your quiz results</li>
          <li>Track your progress over time</li>
        </ul>
        <p>It only takes a moment to sign up!</p>
      </div>
    </div>
    <div class="auth-modal-footer" style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">
      <button id="proceed-to-sign-in" class="auth-button" style="width:auto;">Sign In</button>
      <button id="proceed-to-sign-up" class="auth-button" style="width:auto;background:#17a2b8;">Create Account</button>
    </div>
  </div>
</div>`;
  }

  // ─── Modal Event Binding ───────────────────────────────────────────────────
  function _bindModalEvents() {
    // Close buttons
    document.querySelectorAll('.auth-modal-close').forEach(btn => {
      btn.addEventListener('click', _closeAllModals);
    });

    // Click outside modal to close
    document.querySelectorAll('.auth-modal').forEach(modal => {
      modal.addEventListener('click', function (e) {
        if (e.target === this) _closeAllModals();
      });
    });

    // ── Sign In modal ────────────────────────────────────────────────────────
    const signInSubmit = document.getElementById('sign-in-submit');
    if (signInSubmit) {
      signInSubmit.addEventListener('click', _handleSignInSubmit);
    }

    const signInEmail = document.getElementById('sign-in-email');
    const signInPassword = document.getElementById('sign-in-password');
    if (signInEmail)    signInEmail.addEventListener('keydown',    e => { if (e.key === 'Enter') _handleSignInSubmit(e); });
    if (signInPassword) signInPassword.addEventListener('keydown', e => { if (e.key === 'Enter') _handleSignInSubmit(e); });

    const googleSignIn = document.getElementById('google-sign-in-button');
    if (googleSignIn) googleSignIn.addEventListener('click', _handleGoogleSignIn);

    const showSignUp = document.getElementById('show-sign-up-link');
    if (showSignUp) showSignUp.addEventListener('click', e => { e.preventDefault(); showSignUpModal(); });

    const forgotLink = document.getElementById('forgot-password-link');
    if (forgotLink) forgotLink.addEventListener('click', e => { e.preventDefault(); showForgotPasswordModal(); });

    // ── Sign Up modal ────────────────────────────────────────────────────────
    const signUpBtn = document.getElementById('sign-up-button');
    if (signUpBtn) signUpBtn.addEventListener('click', _handleSignUpSubmit);

    const googleSignUp = document.getElementById('google-sign-up-button');
    if (googleSignUp) googleSignUp.addEventListener('click', _handleGoogleSignIn);

    const showSignIn = document.getElementById('show-sign-in-link');
    if (showSignIn) showSignIn.addEventListener('click', e => { e.preventDefault(); showSignInModal(); });

    // ── Forgot Password modal ────────────────────────────────────────────────
    const forgotBtn = document.getElementById('forgot-password-button');
    if (forgotBtn) forgotBtn.addEventListener('click', _handleForgotPasswordSubmit);

    const backLink = document.getElementById('back-to-sign-in-link');
    if (backLink) backLink.addEventListener('click', e => { e.preventDefault(); showSignInModal(); });

    // ── Quiz Access modal ────────────────────────────────────────────────────
    const proceedSignIn = document.getElementById('proceed-to-sign-in');
    if (proceedSignIn) proceedSignIn.addEventListener('click', e => { e.preventDefault(); showSignInModal(); });

    const proceedSignUp = document.getElementById('proceed-to-sign-up');
    if (proceedSignUp) proceedSignUp.addEventListener('click', e => { e.preventDefault(); showSignUpModal(); });
  }

  // ─── Form Submit Handlers ──────────────────────────────────────────────────
  function _handleSignInSubmit(e) {
    e.preventDefault();
    const email = (document.getElementById('sign-in-email') || {}).value;
    const pass  = (document.getElementById('sign-in-password') || {}).value;
    const errEl = document.getElementById('sign-in-error');
    const btn   = document.getElementById('sign-in-submit');

    if (!email || !pass) {
      _showError(errEl, 'Please enter your email and password.');
      return;
    }

    _setButtonLoading(btn, true, 'Signing in…');
    _hideError(errEl);

    // 15-second timeout guard — resets the button if Firebase auth hangs on a
    // slow mobile network, preventing an unrecoverable "Signing in…" state.
    var _signInTimeout = setTimeout(function() {
      _setButtonLoading(btn, false, 'Sign In');
      _showError(errEl, 'Sign-in timed out. Check your connection and try again.');
    }, 15000);

    signIn(email, pass)
      .then(() => {
        clearTimeout(_signInTimeout);
        // Reset button before closing the modal — guards against any edge case
        // where the modal stays open (e.g. very slow onAuthStateChanged on iOS).
        _setButtonLoading(btn, false, 'Sign In');
        _closeAllModals();
      })
      .catch(err => {
        clearTimeout(_signInTimeout);
        _setButtonLoading(btn, false, 'Sign In');
        _showError(errEl, _getErrorMessage(err));
      });
  }

  function _handleSignUpSubmit(e) {
    e.preventDefault();
    const name  = (document.getElementById('sign-up-name') || {}).value;
    const email = (document.getElementById('sign-up-email') || {}).value;
    const pass  = (document.getElementById('sign-up-password') || {}).value;
    const pass2 = (document.getElementById('sign-up-confirm-password') || {}).value;
    const errEl = document.getElementById('sign-up-error');
    const btn   = document.getElementById('sign-up-button');

    if (!email || !pass) {
      _showError(errEl, 'Please fill in all required fields.');
      return;
    }
    if (pass !== pass2) {
      _showError(errEl, 'Passwords do not match.');
      return;
    }

    _setButtonLoading(btn, true, 'Creating account…');
    _hideError(errEl);

    // 15-second timeout guard — same pattern as sign-in to prevent stuck button
    // on slow mobile networks.
    var _signUpTimeout = setTimeout(function() {
      _setButtonLoading(btn, false, 'Sign Up');
      _showError(errEl, 'Account creation timed out. Check your connection and try again.');
    }, 15000);

    signUp(email, pass, name || null)
      .then(() => {
        clearTimeout(_signUpTimeout);
        _setButtonLoading(btn, false, 'Sign Up');
        _closeAllModals();
      })
      .catch(err => {
        clearTimeout(_signUpTimeout);
        _setButtonLoading(btn, false, 'Sign Up');
        _showError(errEl, _getErrorMessage(err));
      });
  }

  function _handleForgotPasswordSubmit(e) {
    e.preventDefault();
    const email   = (document.getElementById('forgot-password-email') || {}).value;
    const errEl   = document.getElementById('forgot-password-error');
    const succEl  = document.getElementById('forgot-password-success');
    const btn     = document.getElementById('forgot-password-button');

    if (!email) { _showError(errEl, 'Please enter your email address.'); return; }

    _setButtonLoading(btn, true, 'Sending…');
    _hideError(errEl);
    _hideError(succEl);

    sendPasswordResetEmail(email)
      .then(() => {
        _setButtonLoading(btn, false, 'Send Reset Email');
        if (succEl) {
          succEl.textContent = 'Reset email sent! Check your inbox.';
          succEl.style.display = 'block';
        }
      })
      .catch(err => {
        _setButtonLoading(btn, false, 'Send Reset Email');
        _showError(errEl, _getErrorMessage(err));
      });
  }

  function _handleGoogleSignIn(e) {
    e.preventDefault();
    const btn = e.currentTarget;
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Redirecting to Google…';
    signInWithGoogle().catch(err => {
      btn.disabled = false;
      btn.textContent = originalText;
      log.error('Google sign-in failed:', err);
    });
  }

  // ─── UI Helpers ────────────────────────────────────────────────────────────
  function _showError(el, msg) {
    if (!el) return;
    el.textContent = msg;
    el.style.display = 'block';
  }
  function _hideError(el) {
    if (!el) return;
    el.textContent = '';
    el.style.display = 'none';
  }
  function _setButtonLoading(btn, loading, text) {
    if (!btn) return;
    btn.disabled = loading;
    btn.textContent = text;
  }

  // ─── Modal Display ─────────────────────────────────────────────────────────
  function _ensureModals() {
    if (_modalsCreated && document.getElementById('sign-in-modal')) return;

    if (!document.getElementById('auth-modals-container')) {
      const c = document.createElement('div');
      c.id = 'auth-modals-container';
      document.body.appendChild(c);
    }
    const container = document.getElementById('auth-modals-container');

    if (!document.getElementById('sign-in-modal'))          container.insertAdjacentHTML('beforeend', _signInModalHTML());
    if (!document.getElementById('sign-up-modal'))          container.insertAdjacentHTML('beforeend', _signUpModalHTML());
    if (!document.getElementById('forgot-password-modal'))  container.insertAdjacentHTML('beforeend', _forgotPasswordModalHTML());
    if (!document.getElementById('quiz-access-info-modal')) container.insertAdjacentHTML('beforeend', _quizAccessModalHTML());

    _bindModalEvents();
    _modalsCreated = true;
    log.debug('Auth modals created');
  }

  function showSignInModal() {
    if (!document.body) { document.addEventListener('DOMContentLoaded', showSignInModal); return; }
    _ensureModals();
    _closeAllModals();
    const modal = document.getElementById('sign-in-modal');
    if (modal) {
      modal.style.display = 'flex';
      setTimeout(() => { const el = document.getElementById('sign-in-email'); if (el) el.focus(); }, 100);
    }
    return true;
  }

  function showSignUpModal() {
    if (!document.body) { document.addEventListener('DOMContentLoaded', showSignUpModal); return; }
    _ensureModals();
    _closeAllModals();
    const modal = document.getElementById('sign-up-modal');
    if (modal) {
      modal.style.display = 'flex';
      setTimeout(() => { const el = document.getElementById('sign-up-name'); if (el) el.focus(); }, 100);
    }
    return true;
  }

  function showForgotPasswordModal() {
    _ensureModals();
    _closeAllModals();
    const modal = document.getElementById('forgot-password-modal');
    if (modal) modal.style.display = 'flex';
    return true;
  }

  function showQuizAccessInfoModal() {
    if (!document.body) { document.addEventListener('DOMContentLoaded', showQuizAccessInfoModal); return; }
    _ensureModals();
    _closeAllModals();
    const modal = document.getElementById('quiz-access-info-modal');
    if (modal) modal.style.display = 'flex';
    return true;
  }

  function closeAuthModal() { _closeAllModals(); }

  function _closeAllModals() {
    document.querySelectorAll('.auth-modal').forEach(m => { m.style.display = 'none'; });
  }

  // ─── Header Integration ────────────────────────────────────────────────────
  function _updateHeaderForUser(user) {
    const nameEl   = document.querySelector('.user-name');
    const statusEl = document.querySelector('.user-status');
    const bodyEl   = document.querySelector('.user-dropdown-body');

    if (nameEl)   nameEl.textContent   = user.displayName;
    if (statusEl) statusEl.textContent = 'Signed In';

    if (bodyEl) {
      bodyEl.innerHTML = `
        <a href="#" id="view-profile-button" class="user-dropdown-item">
          <i class="fas fa-user"></i> View Profile
        </a>
        <a href="#" id="view-results-button" class="user-dropdown-item">
          <i class="fas fa-history"></i> Quiz History
        </a>
        <a href="/dashboard.html" class="user-dropdown-item">
          <i class="fas fa-tachometer-alt"></i> Dashboard
        </a>
        <a href="/premium.html" class="user-dropdown-item premium-item">
          <i class="fas fa-crown"></i> Upgrade to Premium
        </a>
        <a href="#" id="sign-out-button" class="user-dropdown-item">
          <i class="fas fa-sign-out-alt"></i> Sign Out
        </a>`;

      const signOutBtn = document.getElementById('sign-out-button');
      if (signOutBtn) {
        signOutBtn.addEventListener('click', e => {
          e.preventDefault();
          signOut().catch(err => log.error('Sign-out failed:', err));
        });
      }

      const profileBtn = document.getElementById('view-profile-button');
      if (profileBtn) {
        profileBtn.addEventListener('click', e => {
          e.preventDefault();
          _showProfileModal(user);
        });
      }

      const historyBtn = document.getElementById('view-results-button');
      if (historyBtn) {
        historyBtn.addEventListener('click', e => {
          e.preventDefault();
          _showHistoryModal();
        });
      }
    }
  }

  function _showProfileModal(user) {
    const history = window.QuizProsUserManager ? window.QuizProsUserManager.getQuizHistory() : [];
    const premiumStatus = window.QuizProsPremium && window.QuizProsPremium.getPremiumStatus && window.QuizProsPremium.getPremiumStatus();
    const tier = premiumStatus && premiumStatus.isPremium ? 'Premium' : 'Free';
    const initial = (user.displayName || user.email || 'U')[0].toUpperCase();
    _showInfoModal('Your Profile', `
      <div style="text-align:center;padding:1rem 0 1.5rem;">
        <div style="width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,#25d366,#128c7e);
                    display:flex;align-items:center;justify-content:center;font-size:1.8rem;color:#fff;
                    margin:0 auto 1rem;">${initial}</div>
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
      ${tier === 'Free' ? `<a href="/premium.html" style="display:block;text-align:center;
        background:linear-gradient(135deg,#25d366,#128c7e);color:#fff;padding:.7rem;border-radius:8px;
        text-decoration:none;font-weight:600;font-size:.9rem;">Upgrade to Premium 👑</a>` : ''}
    `);
  }

  function _showHistoryModal() {
    const history = window.QuizProsUserManager ? window.QuizProsUserManager.getQuizHistory() : [];
    let bodyHtml;
    if (history.length === 0) {
      bodyHtml = '<p style="text-align:center;color:#777;padding:2rem 0;">No quiz history yet. Take a quiz to see your results here!</p>';
    } else {
      bodyHtml = '<div style="max-height:360px;overflow-y:auto;">' +
        history.slice(0, 20).map(item => {
          const date  = item.completedAt ? new Date(item.completedAt).toLocaleDateString() : '';
          const score = item.score != null ? item.score + '%' : '—';
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
    _showInfoModal('Quiz History', bodyHtml);
  }

  function _showInfoModal(title, bodyHtml) {
    const existing = document.getElementById('auth-info-modal-overlay');
    if (existing) existing.remove();
    const overlay = document.createElement('div');
    overlay.id = 'auth-info-modal-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.5);display:flex;' +
      'align-items:center;justify-content:center;z-index:99999;font-family:system-ui,sans-serif;';
    overlay.innerHTML = `
      <div style="background:#fff;border-radius:14px;padding:1.5rem;max-width:420px;width:90%;
                  box-shadow:0 20px 60px rgba(0,0,0,.25);max-height:90vh;overflow-y:auto;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;">
          <h2 style="margin:0;font-size:1.2rem;">${title}</h2>
          <button id="auth-info-modal-close" style="background:none;border:none;font-size:1.4rem;
            cursor:pointer;color:#aaa;line-height:1;">&times;</button>
        </div>
        ${bodyHtml}
      </div>`;
    document.body.appendChild(overlay);
    overlay.querySelector('#auth-info-modal-close').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
  }

  function _updateHeaderForGuest() {
    const nameEl   = document.querySelector('.user-name');
    const statusEl = document.querySelector('.user-status');
    const bodyEl   = document.querySelector('.user-dropdown-body');

    if (nameEl)   nameEl.textContent   = 'Guest';
    if (statusEl) statusEl.textContent = 'Not signed in';

    if (bodyEl) {
      bodyEl.innerHTML = `
        <a href="#" id="header-sign-in-button" class="user-dropdown-item">
          <i class="fas fa-sign-in-alt"></i> Sign In
        </a>
        <a href="/premium.html" class="user-dropdown-item premium-item">
          <i class="fas fa-crown"></i> Upgrade to Premium
        </a>`;

      const headerSignIn = document.getElementById('header-sign-in-button');
      if (headerSignIn) {
        headerSignIn.addEventListener('click', e => { e.preventDefault(); showSignInModal(); });
      }
    }
  }

  // ─── Module Initialization ─────────────────────────────────────────────────
  (function _boot() {
    // Initialize Firebase + Auth immediately if config is available,
    // otherwise retry on DOMContentLoaded.
    if (!initialize()) {
      const retryOnReady = () => setTimeout(initialize, 200);
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', retryOnReady);
      } else {
        retryOnReady();
      }
    }

    // Bind the header sign-in override once the DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () {
        setTimeout(function () {
          _updateHeaderForGuest();
          // Override header.js showSignInModal if present
          if (window.QuizProsHeader && typeof window.QuizProsHeader.showSignInModal === 'function') {
            window.QuizProsHeader.showSignInModal = showSignInModal;
          }
        }, 300);
      });
    } else {
      setTimeout(function () {
        _updateHeaderForGuest();
        if (window.QuizProsHeader && typeof window.QuizProsHeader.showSignInModal === 'function') {
          window.QuizProsHeader.showSignInModal = showSignInModal;
        }
      }, 300);
    }
  })();

  // ─── Public API ────────────────────────────────────────────────────────────
  return {
    initialize,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    sendPasswordResetEmail,
    isSignedIn,
    getCurrentUser,
    handleRedirectResult: () => Promise.resolve(null), // handled automatically in initialize()

    // Modal API
    showSignInModal,
    showSignUpModal,
    showForgotPasswordModal,
    showQuizAccessInfoModal,
    closeAuthModal,

    // Header API
    updateHeaderForAuthenticatedUser: _updateHeaderForUser,
    updateHeaderForGuestUser:         _updateHeaderForGuest,
    overrideSignInModal:              () => {} // no-op: handled in _boot
  };
})();

// ─── Backward-Compatibility Facades ────────────────────────────────────────
// Keep all previously-relied-on globals pointing to the new module.

window.QuizProsFirebase = {
  initialize: () => window.QuizProsAuthManager.initialize(),
  getApp:     () => null
};

window.QuizProsAuth = window.QuizProsAuthManager;
window.QuizProsAuthUI = window.QuizProsAuthManager;
window.QuizProsHeaderAuth = window.QuizProsAuthManager;

// Helper function globals referenced by quiz-engine.js and other modules
window.forceShowSignInModal     = () => window.QuizProsAuthManager.showSignInModal();
window.createEmergencySignInModal = () => window.QuizProsAuthManager.showSignInModal();
window.triggerSignIn            = () => window.QuizProsAuthManager.showSignInModal();
window.directSignIn             = (email, password) => window.QuizProsAuthManager.signIn(email, password);
window.directFirebaseSignIn     = (email, password) =>
  window.QuizProsAuthManager.signIn(email, password).then(u => u);
window.fixAuthButtons           = () => {}; // no-op
window.debugAuth                = () => ({
  firebaseInitialized: !!window.QuizProsAuthManager.isSignedIn,
  signedIn:            window.QuizProsAuthManager.isSignedIn(),
  currentUser:         window.QuizProsAuthManager.getCurrentUser()
});
