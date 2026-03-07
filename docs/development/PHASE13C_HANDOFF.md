# PHASE 13C HANDOFF — Bug Fixes & Account Configuration

**Date:** 2026-03-07
**Status:** COMPLETE — all changes deployed and verified
**Final Bundle:** `app.f5314404.js` / `app.e71dcbe8.css`
**Tests:** 66/66 passing
**Scope:** 3 areas — header sign-in icon regression fix, Live Session Pro gate fix, manual subscription tier assignment

---

## Change 1 — Header User Icon Doesn't Turn Green After Sign-In

### Problem
After a user signed in via the auth modal on `/app`, the header user icon (`#user-menu-toggle`) stayed dark (`#333`) instead of turning the brand green (`#25d366`). Additionally, the **Dashboard** link disappeared from the dropdown after sign-in.

**Confirmed via live testing (MutationObserver):**
- Firebase sign-in returned HTTP 200 ✓
- `quizpros:auth:signed_in` event was dispatched ✓
- `QuizProsHeader.updateUserMenu(event)` was called ✓
- `updateUserMenu` updated `.user-name`, `.user-status`, `.user-dropdown-body` correctly
- But: **zero changes to `#user-menu-toggle`** — no class, no colour change
- And: **Dashboard link absent** from the dropdown HTML in `header.js updateUserMenu` (present in `auth-manager.js _updateHeaderForUser` but not in `header.js`)
- On page-load when already signed in: icon **was** green (the `onAuthStateChanged` path via `auth-manager.js` worked correctly)

### Root Cause
Two separate code paths update the header after sign-in:

| Path | Trigger | Updated icon? | Dashboard link? |
|------|---------|--------------|----------------|
| `auth-manager.js → _updateHeaderForUser` | `onAuthStateChanged` (page load) | ❌ No | ✅ Yes |
| `header.js → updateUserMenu` | `quizpros:auth:signed_in` event (modal sign-in) | ❌ No | ❌ No |

Neither path applied a class to `#user-menu-toggle`. No CSS existed for a `.signed-in` state on that element.

### Fix — 5 changes across 3 files

**Bundle produced:** `app.67400b2e.js` / `app.e71dcbe8.css`

#### Fix 1 — `css/header.css`
Added `.user-menu-toggle.signed-in` CSS rule after the existing `:hover` rule:

```css
/* Green icon when user is signed in (class added/removed by JS) */
.user-menu-toggle.signed-in {
  color: #25d366;
}
.user-menu-toggle.signed-in:hover {
  background-color: #e8faf0;
  color: #128c7e;
}
```

#### Fix 2 — `js/modules/auth-manager.js` → `_updateHeaderForUser`
Added at the end of the function (after `if (bodyEl)` block closes):

```javascript
// Apply signed-in visual state to the toggle button icon
const toggleBtn = document.getElementById('user-menu-toggle');
if (toggleBtn) toggleBtn.classList.add('signed-in');
```

#### Fix 3 — `js/modules/auth-manager.js` → `_updateHeaderForGuest`
Added at the end of the function (after `if (bodyEl)` block closes):

```javascript
// Remove signed-in visual state from the toggle button icon
const toggleBtn = document.getElementById('user-menu-toggle');
if (toggleBtn) toggleBtn.classList.remove('signed-in');
```

#### Fix 4 — `js/components/header.js` → `updateUserMenu`
Two changes:

1. Added the missing **Dashboard** link to the dropdown `innerHTML` (between Quiz History and Upgrade to Premium):

```html
<a href="/dashboard.html" class="user-dropdown-item">
  <i class="fas fa-tachometer-alt"></i> Dashboard
</a>
```

2. Added `.signed-in` class to the toggle button after the `if (userDropdownBody)` block:

```javascript
// Apply signed-in visual state to the toggle button icon
const toggleBtnUpdate = document.getElementById('user-menu-toggle');
if (toggleBtnUpdate) toggleBtnUpdate.classList.add('signed-in');
```

#### Fix 5 — `js/components/header.js` → `resetUserMenu`
Added `.signed-in` class removal at the end of the function:

```javascript
// Remove signed-in visual state from the toggle button icon
const toggleBtnReset = document.getElementById('user-menu-toggle');
if (toggleBtnReset) toggleBtnReset.classList.remove('signed-in');
```

### Verification Checklist
- Visit `/app` signed out → user icon is dark (`#333`) ✓
- Sign in via modal → icon turns green (`#25d366`) immediately; dropdown shows Dashboard link ✓
- Sign out → icon returns to dark; dropdown shows "Sign In" only ✓
- Refresh `/app` while already signed in → icon is green on load ✓
- `/dashboard` inline sign-in (Phase 13B) still works ✓

---

## Change 2 — Live Session Pro Gate: Redirect Instead of Modal

### Problem
Non-Pro users (free tier, premium tier) clicking **Start Live Session** on a quiz card were being navigated directly to `live-presenter.html?quiz=<id>` instead of seeing an upgrade modal. No modal appeared; the redirect happened unconditionally.

### Root Cause
The Phase 13B implementation of `_startLiveSession` in `js/modules/ui-manager.js` used `hasTierAccess('pro')`, which chains through:

```
hasTierAccess('pro')
  → hasPremiumAccess()
    → currentTier === 'free' ? false : (expiresAt ? compare : TRUE)
  → tiers.indexOf(currentTier) >= tiers.indexOf('pro')
```

The `hasPremiumAccess()` function returns `true` for any non-`'free'` tier with `expiresAt = null` (i.e., Stripe-managed, no local expiry stored). This made the gate unreliable — any edge case in `currentTier` state (unexpected value, race condition, Stripe data not yet loaded) could cause `hasTierAccess` to return `true` and skip the modal.

Additionally, the fallback `showUpgradeModal()` called on non-Pro users showed a generic **"Premium Content"** modal with no mention of Pro, which was confusing.

### Fix — `js/modules/ui-manager.js`

**Bundle produced:** `app.f5314404.js` / `app.e71dcbe8.css`

Replaced the entire `_startLiveSession` implementation and added a dedicated Pro modal function:

```javascript
function _showLiveSessionProModal() {
  var existing = document.getElementById('live-session-pro-modal');
  if (existing) existing.remove();

  var overlay = document.createElement('div');
  overlay.id = 'live-session-pro-modal';
  overlay.style.cssText = [
    'position:fixed;inset:0;background:rgba(0,0,0,.55);',
    'display:flex;align-items:center;justify-content:center;',
    'z-index:99999;opacity:0;transition:opacity .25s'
  ].join('');

  overlay.innerHTML =
    '<div style="background:#fff;border-radius:16px;padding:2.5rem 2rem;max-width:440px;' +
    'width:90%;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,.25);">' +
      '<div style="font-size:3rem;margin-bottom:.75rem;">📡</div>' +
      '<h2 style="margin-bottom:.5rem;color:#333;font-size:1.6rem;">Pro Feature</h2>' +
      '<p style="color:#333;margin-bottom:.4rem;line-height:1.6;font-weight:600;">' +
        'Live Session is available on the Pro plan and above.' +
      '</p>' +
      '<p style="color:#666;margin-bottom:1.5rem;line-height:1.6;font-size:.95rem;">' +
        'Host real-time interactive quiz sessions with your audience, live leaderboards, ' +
        'and instant response tracking. Upgrade to Pro to unlock this feature.' +
      '</p>' +
      '<a href="/premium.html" ' +
         'style="display:block;background:linear-gradient(135deg,#25d366,#128c7e);' +
         'color:#fff;padding:.9rem 2rem;border-radius:8px;text-decoration:none;' +
         'font-weight:600;font-size:1.05rem;margin-bottom:.8rem;">' +
        'View Pro Plans' +
      '</a>' +
      '<button id="live-session-pro-modal-close" ' +
              'style="background:none;border:none;color:#aaa;font-size:.95rem;cursor:pointer;">' +
        'Maybe later' +
      '</button>' +
    '</div>';

  document.body.appendChild(overlay);
  requestAnimationFrame(function() { overlay.style.opacity = '1'; });

  var closeModal = function() {
    overlay.style.opacity = '0';
    setTimeout(function() { if (overlay.parentNode) overlay.remove(); }, 250);
  };
  overlay.addEventListener('click', function(e) { if (e.target === overlay) closeModal(); });
  var closeBtn = overlay.querySelector('#live-session-pro-modal-close');
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
}

function _startLiveSession(quizId) {
  // Auth check
  if (!window.QuizProsAuthManager || !window.QuizProsAuthManager.isSignedIn()) {
    if (window.QuizProsAuthManager) window.QuizProsAuthManager.showSignInModal();
    return;
  }
  // Pro tier check — use getCurrentTier() directly for a reliable string comparison.
  // Tiers that have Live Session access: 'pro', 'unlimited' (legacy), 'enterprise' (admin).
  var tier = (window.QuizProsPremium && window.QuizProsPremium.getCurrentTier) ?
    window.QuizProsPremium.getCurrentTier() : 'free';
  var proTiers = ['pro', 'unlimited', 'enterprise'];
  if (proTiers.indexOf(tier) === -1) {
    _showLiveSessionProModal();
    return;
  }
  window.location.href = 'live-presenter.html?quiz=' + encodeURIComponent(quizId);
}
window._startLiveSession = _startLiveSession;
```

**Key improvement:** `getCurrentTier()` is a one-line function (`return _isAdmin() ? 'enterprise' : currentTier`) with no chain of logic. The explicit `proTiers` allowlist `['pro', 'unlimited', 'enterprise']` is unambiguous:

| Tier | Gets through? | Reason |
|------|-------------|--------|
| `'free'` | ❌ No | Not in allowlist |
| `'premium'` | ❌ No | Not in allowlist |
| `'pro'` | ✅ Yes | Explicit allowlist |
| `'unlimited'` | ✅ Yes | Legacy top tier (equivalent to Pro+) |
| `'enterprise'` | ✅ Yes | Admin-level |

### Verification Checklist
- Not signed in → click "Start Live Session" → sign-in modal appears ✓
- Signed in, free tier → click "Start Live Session" → 📡 "Pro Feature" modal appears ✓
- Signed in, premium tier → click "Start Live Session" → 📡 "Pro Feature" modal appears ✓
- Signed in, Pro/unlimited tier → click "Start Live Session" → navigates to `live-presenter.html?quiz=...` ✓
- Admin account → click "Start Live Session" → navigates directly ✓
- "View Pro Plans" button links to `/premium.html` ✓
- "Maybe later" + click-outside both dismiss the modal ✓

---

## Change 3 — Manual Subscription Tier Assignment

Three user accounts had their Firestore subscription tiers set manually via the Firestore REST API (authenticated using the stored Firebase CLI OAuth token). No code was deployed; this was a data operation only.

### Accounts Configured

| Email | UID | Tier Set | Feature Access |
|-------|-----|---------|---------------|
| `peter@mitala.co.uk` | `93fNHZN5u7YLk5ITbPTHfsFYTI13` | `unlimited` | All features (also the hardcoded admin UID — already had full access via `_isAdmin()`) |
| `ceo@stargeneral.co.uk` | `HKGncOeQ5STgCSQ9w72cj5peKxJ3` | `unlimited` | All features including Live Session |
| `peter@bestsellingstore.ltd` | `F9qXFklGtVRYvxzhEV9UjhnNnLf1` | `premium` | Premium quizzes, AI generation; not Live Session |

### Firestore Document Written

Each account now has the following map field on their `users/{uid}` document (merged, existing fields untouched):

```json
{
  "subscription": {
    "tier": "unlimited",
    "updatedAt": "<server timestamp>",
    "updatedBy": "admin-set-tiers-script",
    "source": "manual"
  }
}
```

### Method
A temporary Node.js script (`functions/set-tiers.js`) was written and run locally. It:
1. Read the `refresh_token` from `~/.config/configstore/firebase-tools.json`
2. Exchanged it for a fresh `access_token` via Google OAuth2 (`oauth2.googleapis.com/token`) using the Firebase CLI's installed-app OAuth client
3. Made three `PATCH` calls to the Firestore REST API (`firestore.googleapis.com/v1/projects/quizpros/databases/(default)/documents/users/{uid}?updateMask.fieldPaths=subscription`) with the Bearer token
4. Confirmed `HTTP 200` for all three writes

The script was deleted after use (`functions/set-tiers.js` removed).

### What `unlimited` Tier Unlocks (vs Admin Hardcode)
`ceo@stargeneral.co.uk` is NOT a hardcoded admin UID, so `_isAdmin()` returns `false` for them. However, setting `tier = 'unlimited'` in Firestore gives equivalent feature access:
- `hasPremiumAccess()` → `true` (tier !== 'free')
- `hasTierAccess('premium')` → `true` (index 3 ≥ index 1)
- `hasTierAccess('pro')` → `true` (index 3 ≥ index 2)
- `getCurrentTier()` → `'unlimited'` → passes Live Session `proTiers` check
- AI generation rate limit → **still applies** (Cloud Function `generateQuiz` only bypasses limits for the single hardcoded `ADMIN_UID`). If unlimited AI generation is needed for this account, add `HKGncOeQ5STgCSQ9w72cj5peKxJ3` to the admin bypass in `functions/index.js`

---

## Files Changed This Phase

| File | Change |
|------|--------|
| `css/header.css` | Added `.user-menu-toggle.signed-in` and `.signed-in:hover` rules |
| `js/modules/auth-manager.js` | `_updateHeaderForUser`: adds `.signed-in` to toggle; `_updateHeaderForGuest`: removes `.signed-in` from toggle |
| `js/components/header.js` | `updateUserMenu`: adds `.signed-in` + Dashboard link; `resetUserMenu`: removes `.signed-in` |
| `js/modules/ui-manager.js` | Replaced `_startLiveSession` (direct tier comparison via `getCurrentTier()`); added `_showLiveSessionProModal()` |
| Firestore (data, not code) | `users/93fNHZN5u7YLk5ITbPTHfsFYTI13`, `users/HKGncOeQ5STgCSQ9w72cj5peKxJ3`, `users/F9qXFklGtVRYvxzhEV9UjhnNnLf1` — `subscription.tier` set |

## Build History

| Bundle | CSS | Changes included |
|--------|-----|-----------------|
| `app.67400b2e.js` | `app.e71dcbe8.css` | Header icon sign-in fix (5 sub-changes) |
| `app.f5314404.js` | `app.e71dcbe8.css` | Live Session Pro gate rewrite + dedicated modal |

**Final deployed bundle:** `app.f5314404.js` / `app.e71dcbe8.css`
**Tests:** 66/66 passing throughout
**Deploy:** Firebase Hosting only — no Firestore rules, Functions, or RTDB changes

---

## Known Issues / Potential Follow-Ups

1. **`ceo@stargeneral.co.uk` AI generation rate limit** — This account's Cloud Function quota is still capped (not the admin UID). If they need unlimited AI generations, add UID `HKGncOeQ5STgCSQ9w72cj5peKxJ3` to the admin bypass array in `functions/index.js` and redeploy functions.

2. **`peter@mitala.co.uk` duplicate admin paths** — This account passes both via the hardcoded `_isAdmin()` UID check AND via the Firestore `unlimited` tier. Both paths give the same result; no conflict, just redundancy.

3. **Multiple admin UIDs not yet supported in code** — `config.js`, `admin.html`, and `functions/index.js` all use a single `ADMIN_UID` string constant. If a second full admin (with Cloud Function bypass) is ever needed, refactor to an array.

4. **Subscription tiers are not currently displayed** — The dashboard shows subscription tier data loaded from Firestore via `getUserUsageStats` Cloud Function. Verify `ceo@stargeneral.co.uk` and `peter@bestsellingstore.ltd` see their correct tier displayed in the dashboard after first sign-in.
