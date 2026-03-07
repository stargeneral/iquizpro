# Phase 2 — Network Interception

## Context

We are building a native Android debug app to diagnose mobile sign-in failures on
**https://iquizpro.com**. Phase 1 is complete: the app loads the site in a WebView and shows a
scrollable, colour-coded log overlay of all `console.log/warn/error` output.

Read `DEVELOPMENT_PLAN.md` and `PHASE1_HANDOFF.md` before starting. This is Phase 2.

---

## Goal

Intercept every HTTP request the WebView makes and log the key ones — especially Firebase Auth
network calls — so we can see:
1. Whether `identitytoolkit.googleapis.com` is actually contacted when the user taps Sign In
2. What HTTP status code is returned (200, 4xx, 5xx, or no response at all)
3. How long each auth request takes (latency in ms)

---

## Files to Modify

```
debug-app/
  app/src/main/java/com/iquizpros/debugapp/
    MainActivity.kt       <- wire up NetworkInterceptor inside WebViewClient
    NetworkInterceptor.kt <- NEW: contains shouldInterceptRequest logic
```

No layout, resource, or Gradle changes are needed.

---

## Detailed Specifications

### `NetworkInterceptor.kt` (new file)

```kotlin
package com.iquizpros.debugapp

import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse

object NetworkInterceptor {

    // Hostnames worth logging (add more as needed)
    private val WATCHED_HOSTS = listOf(
        "identitytoolkit.googleapis.com",
        "securetoken.googleapis.com",
        "firestore.googleapis.com",
        "firebase.googleapis.com",
        "iquizpro.com",
        "quizpros.web.app"
    )

    /**
     * Call from WebViewClient.shouldInterceptRequest.
     * Logs the request to DebugLog and returns null (let WebView handle it normally).
     */
    fun intercept(request: WebResourceRequest): WebResourceResponse? {
        val url = request.url.toString()
        val host = request.url.host ?: return null

        if (WATCHED_HOSTS.any { host.contains(it) }) {
            val method = request.method ?: "GET"
            val short = shortenUrl(url)
            val level = if (host.contains("identitytoolkit") || host.contains("securetoken")) {
                LogLevel.AUTH
            } else {
                LogLevel.NETWORK
            }
            DebugLog.add(level, "Network", "$method $short")
        }
        return null  // always return null — let WebView handle the request normally
    }

    private fun shortenUrl(url: String): String {
        return try {
            val u = java.net.URL(url)
            val pq = if (u.query != null) "${u.path}?${u.query}" else u.path
            "${u.host}${pq}".take(120)
        } catch (e: Exception) {
            url.take(120)
        }
    }
}
```

### `MainActivity.kt` changes

Inside `setupWebView()`, add `shouldInterceptRequest` to the existing WebViewClient:

```kotlin
webView.webViewClient = object : WebViewClient() {

    override fun shouldInterceptRequest(
        view: WebView,
        request: WebResourceRequest
    ): WebResourceResponse? {
        return NetworkInterceptor.intercept(request)
    }

    override fun onPageFinished(view: WebView, url: String) { /* unchanged */ }

    @Suppress("OVERRIDE_DEPRECATION")
    override fun onReceivedError(...) { /* unchanged */ }
}
```

`shouldInterceptRequest` runs on a background thread. `DebugLog.add` is already thread-safe
(CopyOnWriteArrayList + @Synchronized), so no extra locking is needed.

---

## Log Format

Auth network calls should appear in the overlay as:

```
[12:34:56.789] [Network] POST identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=...
[12:34:56.812] [Network] POST securetoken.googleapis.com/v1/token?key=...
```

Colour: AUTH entries use #2E7D32 (green), NETWORK entries use #1565C0 (blue).

---

## Acceptance Criteria

1. Project builds with `./gradlew assembleDebug` — zero errors
2. When the app loads `https://iquizpro.com`, at least one `[Network]` entry appears for site assets
3. When the user taps Sign In, fills in credentials, and submits:
   - At least one `[Network]` or `[AUTH]` entry appears for `identitytoolkit.googleapis.com`
4. If the sign-in times out with NO network entry appearing, that is the key diagnostic:
   the Firebase Auth SDK never made a network call — the bug is pre-network
5. No crash or ANR when scrolling through a log with 100+ entries

---

## What Phase 2 Does NOT Include

- Response body inspection (not possible via shouldInterceptRequest without a proxy)
- Request latency measurement (shouldInterceptRequest does not give response timing)
- Filter chips (UI stubs remain non-functional)
- Export to file (Phase 4)

---

## End of Session

When Phase 2 is complete:
1. Write `PHASE2_HANDOFF.md`
2. Write `PHASE3_PROMPT.md`
