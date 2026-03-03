"use strict";(self.webpackChunkiquizpros=self.webpackChunkiquizpros||[]).push([[889],{4889:(n,e,t)=>{
t.r(e);
t.d(e,{"PremiumModal":()=>r});

class r {
  constructor() {
    this._overlay = null;
  }

  show({feature, onSuccess, onCancel} = {}) {
    const existing = document.getElementById('live-premium-modal-overlay');
    if (existing) existing.remove();

    const featureText = feature
      ? `The <strong>${feature}</strong> feature`
      : 'This feature';

    const overlay = document.createElement('div');
    overlay.id = 'live-premium-modal-overlay';
    overlay.style.cssText = [
      'position:fixed;inset:0;background:rgba(0,0,0,.6);',
      'display:flex;align-items:center;justify-content:center;',
      'z-index:99999;font-family:system-ui,sans-serif;'
    ].join('');

    overlay.innerHTML = `
      <div style="background:#fff;border-radius:14px;padding:2rem 1.75rem;max-width:400px;
                  width:90%;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,.3);">
        <div style="font-size:2.5rem;margin-bottom:.75rem;">👑</div>
        <h2 style="margin:0 0 .5rem;font-size:1.4rem;color:#1a1a1a;">Premium Required</h2>
        <p style="margin:0 0 1.5rem;color:#666;font-size:.9rem;line-height:1.5;">
          ${featureText} requires a Premium subscription.
          Unlock full access to all features including AI quiz generation and live presentations.
        </p>
        <a href="/premium.html" id="live-premium-upgrade-btn"
          style="display:block;background:linear-gradient(135deg,#667eea,#764ba2);
                 color:#fff;padding:.8rem 2rem;border-radius:8px;text-decoration:none;
                 font-weight:600;font-size:1rem;margin-bottom:.7rem;">
          View Premium Plans
        </a>
        <button id="live-premium-cancel-btn"
          style="background:none;border:none;color:#9ca3af;font-size:.85rem;
                 cursor:pointer;padding:.4rem;">
          Maybe later
        </button>
      </div>`;

    document.body.appendChild(overlay);

    const close = () => {
      overlay.remove();
      onCancel && onCancel();
    };

    overlay.querySelector('#live-premium-cancel-btn').addEventListener('click', close);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
  }
}

}}]);
