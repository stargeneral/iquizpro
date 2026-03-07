# Android Debug App — Development Plan

## Purpose

A native Android debug app that loads **https://iquizpro.com** inside a WebView and provides full
visibility into what happens during the Firebase sign-in flow on Android devices. This resolves the
inability to directly observe the mobile auth failure that reproduces on real Android hardware but
not in desktop Chrome DevTools.

---

## Problem Being Solved

Users cannot sign in on Android mobile browsers. The sign-in button shows "Signing in…" and either:
- Stays frozen until the 45-second timeout fires, OR
- Shows "Sign-in timed out. Check your connection." even on a strong network.

Desktop Chrome DevTools cannot reproduce the issue. The debug app gives us a controlled environment
where we can:
1. See every console.log / console.error from the page
2. See every network request to Firebase Auth endpoints
3. Observe exactly when/if `firebase.auth()` becomes ready
4. Compare behaviour with and without the `async` attribute on firebase-auth-compat.js

---

## Technology Choice

**Native Android (Kotlin) with WebView**

Rationale:
- `WebViewClient.shouldInterceptRequest()` — low-level access to every HTTP request
- `WebChromeClient.onConsoleMessage()` — captures all `console.log/warn/error` from the page
- `WebView.addJavascriptInterface()` — page can call Android code directly via `window.Android.*`
- APK can be side-loaded on any Android device for immediate testing
- No Node/npm install needed; Android Studio handles everything
- Minimum SDK: API 24 (Android 7.0) — covers 95%+ of Android devices in use

**Alternative considered:** React Native + react-native-webview — ruled out because `shouldInterceptRequest` is not exposed by the React Native WebView bridge, making raw network interception impossible.

---

## Architecture Overview

```
MainActivity
  ├── DebugWebView (full-screen WebView)
  │     ├── WebViewClient — intercepts requests, logs to DebugLog
  │     ├── WebChromeClient — captures console messages
  │     └── JavascriptInterface "Android" — page can push structured events
  ├── DebugOverlay (draggable floating panel, shown/hidden via FAB)
  │     ├── LogListView — scrollable log entries (colour-coded by level)
  │     ├── FilterBar — All / Auth / Network / Error
  │     └── Toolbar — Copy All, Clear, Export to File
  └── DebugLog (in-memory ring buffer, max 2000 entries)
        └── Entry { timestamp, level, category, message }
```

---

## Phase Breakdown

### Phase 1 — Basic WebView Shell
**Goal:** App loads iquizpro.com, captures all console output and shows it in a scrollable overlay.
**Output:** Working APK that can be installed on a test device.

### Phase 2 — Network Interception
**Goal:** Every request/response to Firebase Auth (`identitytoolkit.googleapis.com`, `securetoken.googleapis.com`) is logged with URL, method, response code, and latency.
**Output:** Can see whether the auth SDK is even making network calls.

### Phase 3 — Auth SDK Probing
**Goal:** Inject JavaScript on page load that polls `window.QuizProsAuthManager`, `window.firebase`, and `firebase.auth()` readiness, and reports them via `window.Android.log()`.
**Output:** Exact timeline showing when each auth SDK object becomes available.

### Phase 4 — Export & Share
**Goal:** "Export" button writes the full log to `/sdcard/Download/iquizpro-debug-[date].txt` and optionally opens the Android Share sheet.
**Output:** Log file can be shared directly from the device for analysis.

---

## Deliverables per Phase

Each phase produces:
- Working Android Studio project (zipped or pushed to a GitHub repo)
- `PHASE[N]_HANDOFF.md` describing what was built and what to check
- `PHASE[N+1]_PROMPT.md` ready to paste into a new chat

---

## Directory Structure (target)

```
debug-app/
  app/
    src/main/
      java/com/iquizpros/debugapp/
        MainActivity.kt
        DebugWebView.kt
        DebugLog.kt
        DebugOverlayFragment.kt
        JavascriptBridge.kt
        NetworkInterceptor.kt
      res/
        layout/
          activity_main.xml
          fragment_debug_overlay.xml
          item_log_entry.xml
        values/
          strings.xml
          colors.xml
      AndroidManifest.xml
  build.gradle (app)
  build.gradle (project)
  settings.gradle
docs/
  PHASE1_HANDOFF.md
  PHASE2_HANDOFF.md
  ...
```

---

## Key Technical Notes for Implementer

### WebView settings required
```kotlin
with(webView.settings) {
    javaScriptEnabled = true
    domStorageEnabled = true          // Firebase Auth uses localStorage
    databaseEnabled = true
    mixedContentMode = WebSettings.MIXED_CONTENT_NEVER_ALLOW
    userAgentString = webView.settings.userAgentString  // keep default UA
}
```

### Console log capture
```kotlin
webView.webChromeClient = object : WebChromeClient() {
    override fun onConsoleMessage(msg: ConsoleMessage): Boolean {
        DebugLog.add(msg.messageLevel().toLevel(), "JS", msg.message())
        return true
    }
}
```

### Network interception (API 21+)
```kotlin
webView.webViewClient = object : WebViewClient() {
    override fun shouldInterceptRequest(view: WebView, request: WebResourceRequest): WebResourceResponse? {
        val url = request.url.toString()
        if (url.contains("identitytoolkit") || url.contains("securetoken")) {
            DebugLog.add(Level.NETWORK, "Auth", "${request.method} $url")
        }
        return null  // null = let WebView handle normally
    }
}
```

### JavaScript bridge
```kotlin
webView.addJavascriptInterface(JavascriptBridge(debugLog), "Android")
// Page can then call: window.Android.log('info', 'Auth SDK ready')
```

### Inject probe script after page load
```kotlin
override fun onPageFinished(view: WebView, url: String) {
    view.evaluateJavascript(PROBE_SCRIPT, null)
}
```

---

## Success Criteria

The debug app is considered complete when a tester can:
1. Install APK on an Android device
2. Tap "Sign In" on iquizpro.com
3. See in the debug overlay exactly:
   - Whether `firebase.auth()` was ready before the button was tapped
   - Whether any network request was made to `identitytoolkit.googleapis.com`
   - The exact error (if any) returned by Firebase
4. Export the log and share it in one tap

---

## Out of Scope

- iOS version (use Safari Web Inspector via USB cable for iOS)
- Publishing to Google Play Store
- Supporting self-signed certificates or local dev servers
- Modifying iquizpro.com source code via the app
