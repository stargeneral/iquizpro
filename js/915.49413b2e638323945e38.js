"use strict";(self.webpackChunkiquizpros=self.webpackChunkiquizpros||[]).push([[915],{8915:(n,e,t)=>{
t.r(e);
t.d(e,{"AuthModal":()=>r});

class r {
  constructor(authService) {
    this.authService = authService;
    this._overlay = null;
  }

  show({onSuccess, onCancel} = {}) {
    const existing = document.getElementById('live-auth-modal-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'live-auth-modal-overlay';
    overlay.style.cssText = [
      'position:fixed;inset:0;background:rgba(0,0,0,.6);',
      'display:flex;align-items:center;justify-content:center;',
      'z-index:99999;font-family:system-ui,sans-serif;'
    ].join('');

    overlay.innerHTML = `
      <div style="background:#fff;border-radius:14px;padding:2rem 1.75rem;max-width:380px;
                  width:90%;box-shadow:0 20px 60px rgba(0,0,0,.3);">
        <h2 style="margin:0 0 .4rem;font-size:1.4rem;color:#1a1a1a;">Sign In Required</h2>
        <p style="margin:0 0 1.25rem;color:#666;font-size:.9rem;line-height:1.5;">
          Sign in to start your live presentation.
        </p>
        <div id="live-auth-error" style="display:none;background:#fef2f2;color:#dc2626;
             border:1px solid #fecaca;border-radius:6px;padding:.6rem .8rem;
             margin-bottom:.9rem;font-size:.85rem;"></div>
        <input id="live-auth-email" type="email" placeholder="Email address"
          style="width:100%;box-sizing:border-box;padding:.7rem .9rem;border:1px solid #d1d5db;
                 border-radius:8px;font-size:.95rem;margin-bottom:.6rem;outline:none;" />
        <input id="live-auth-password" type="password" placeholder="Password"
          style="width:100%;box-sizing:border-box;padding:.7rem .9rem;border:1px solid #d1d5db;
                 border-radius:8px;font-size:.95rem;margin-bottom:1rem;outline:none;" />
        <button id="live-auth-submit"
          style="width:100%;background:#4F46E5;color:#fff;padding:.75rem;border:none;
                 border-radius:8px;font-size:1rem;font-weight:600;cursor:pointer;
                 margin-bottom:.6rem;">
          Sign In
        </button>
        <button id="live-auth-google"
          style="width:100%;background:#fff;color:#333;padding:.7rem;border:1px solid #d1d5db;
                 border-radius:8px;font-size:.95rem;cursor:pointer;margin-bottom:.8rem;
                 display:flex;align-items:center;justify-content:center;gap:.5rem;">
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>
        <button id="live-auth-cancel-btn"
          style="background:none;border:none;color:#9ca3af;font-size:.85rem;
                 cursor:pointer;width:100%;padding:.4rem;">
          Cancel
        </button>
      </div>`;

    document.body.appendChild(overlay);

    const close = (user) => {
      overlay.remove();
      if (user) { onSuccess && onSuccess(user); }
      else       { onCancel  && onCancel();  }
    };

    const showError = (msg) => {
      const el = overlay.querySelector('#live-auth-error');
      el.textContent = msg;
      el.style.display = 'block';
    };

    const setLoading = (loading) => {
      const btn = overlay.querySelector('#live-auth-submit');
      btn.disabled = loading;
      btn.textContent = loading ? 'Signing in…' : 'Sign In';
    };

    overlay.querySelector('#live-auth-submit').addEventListener('click', async () => {
      const email    = overlay.querySelector('#live-auth-email').value.trim();
      const password = overlay.querySelector('#live-auth-password').value;
      if (!email || !password) { showError('Please enter email and password.'); return; }
      setLoading(true);
      try {
        const cred = await this.authService.signInWithEmailAndPassword(email, password);
        close(cred.user);
      } catch (err) {
        setLoading(false);
        const msgs = {
          'auth/user-not-found':            'Invalid email or password.',
          'auth/wrong-password':            'Invalid email or password.',
          'auth/invalid-credential':        'Invalid email or password.',
          'auth/invalid-login-credentials': 'Invalid email or password.',
          'auth/too-many-requests':         'Too many attempts. Please try again later.',
          'auth/network-request-failed':    'Network error. Check your connection.'
        };
        showError(msgs[err.code] || err.message || 'Sign in failed. Please try again.');
      }
    });

    overlay.querySelector('#live-auth-password').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') overlay.querySelector('#live-auth-submit').click();
    });

    overlay.querySelector('#live-auth-google').addEventListener('click', async () => {
      try {
        const provider = new window.firebase.auth.GoogleAuthProvider();
        const cred = await this.authService.signInWithPopup(provider);
        close(cred.user);
      } catch (err) {
        if (err.code !== 'auth/popup-closed-by-user') {
          showError(err.message || 'Google sign-in failed.');
        }
      }
    });

    overlay.querySelector('#live-auth-cancel-btn').addEventListener('click', () => close(null));
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(null); });

    // Auto-focus email field
    setTimeout(() => {
      const emailInput = overlay.querySelector('#live-auth-email');
      if (emailInput) emailInput.focus();
    }, 50);
  }
}

}}]);
