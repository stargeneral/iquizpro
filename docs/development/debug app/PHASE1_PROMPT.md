# Phase 1 — Basic WebView Shell with Console Log Capture

## Context

We are building a native Android debug app to diagnose mobile sign-in failures on
**https://iquizpro.com**. Users on Android cannot sign in — the button freezes or times out.
Desktop DevTools cannot reproduce the issue. This app gives us direct console + network visibility
on real Android hardware.

Read `DEVELOPMENT_PLAN.md` and `PROMPT_FRAMEWORK.md` before starting. This is Phase 1.

---

## Goal

Create a working Android Studio project that:
1. Opens `https://iquizpro.com` in a full-screen WebView
2. Captures all `console.log / console.warn / console.error` output from the page
3. Shows a floating debug overlay (toggle via FAB button) displaying a scrollable, colour-coded
   log of all captured output
4. Builds and installs cleanly on a real Android device (APK side-load)

---

## Files to Create

```
debug-app/
  app/
    src/main/
      java/com/iquizpros/debugapp/
        MainActivity.kt
        DebugLog.kt          (singleton ring buffer)
        LogEntry.kt          (data class)
        LogLevel.kt          (enum)
        JavascriptBridge.kt  (@JavascriptInterface for window.Android.log)
        LogAdapter.kt        (RecyclerView adapter)
      res/
        layout/
          activity_main.xml
          item_log_entry.xml
        values/
          strings.xml
          colors.xml
      AndroidManifest.xml
  build.gradle (app module)
  build.gradle (project root)
  settings.gradle
```

---

## Detailed Specifications

### `LogLevel.kt`
```kotlin
enum class LogLevel { INFO, WARN, ERROR, NETWORK, AUTH }
```

### `LogEntry.kt`
```kotlin
data class LogEntry(
    val timestamp: String,   // "HH:mm:ss.SSS"
    val level: LogLevel,
    val category: String,    // "JS", "Network", "Auth", "System"
    val message: String
)
```

### `DebugLog.kt`
- Singleton object
- `CopyOnWriteArrayList<LogEntry>` — max 2000 entries (drop oldest when full)
- `fun add(level: LogLevel, category: String, message: String)` — creates LogEntry with current
  timestamp and appends to list
- `fun clear()`
- `fun entries(): List<LogEntry>` — returns snapshot
- LiveData or callback support so the RecyclerView updates in real time:
  - Add `var onChange: (() -> Unit)? = null` callback; call it after every `add()` and `clear()`

### `JavascriptBridge.kt`
```kotlin
class JavascriptBridge(private val log: DebugLog) {
    @JavascriptInterface
    fun log(levelStr: String, category: String, message: String) {
        val level = when (levelStr.lowercase()) {
            "warn" -> LogLevel.WARN
            "error" -> LogLevel.ERROR
            "auth" -> LogLevel.AUTH
            "network" -> LogLevel.NETWORK
            else -> LogLevel.INFO
        }
        log.add(level, category, message)
    }
}
```

### `MainActivity.kt`

WebView setup:
```kotlin
with(webView.settings) {
    javaScriptEnabled = true
    domStorageEnabled = true
    databaseEnabled = true
    allowFileAccess = false
    allowContentAccess = false
}
webView.addJavascriptInterface(JavascriptBridge(DebugLog), "Android")
```

Console capture via WebChromeClient:
```kotlin
webView.webChromeClient = object : WebChromeClient() {
    override fun onConsoleMessage(consoleMessage: ConsoleMessage): Boolean {
        val level = when (consoleMessage.messageLevel()) {
            ConsoleMessage.MessageLevel.WARNING -> LogLevel.WARN
            ConsoleMessage.MessageLevel.ERROR -> LogLevel.ERROR
            else -> LogLevel.INFO
        }
        DebugLog.add(level, "JS", consoleMessage.message())
        return true
    }
}
```

Log "System: WebView started" entry before `loadUrl`.

### Debug Overlay

Implement as a `LinearLayout` (or `ConstraintLayout`) that is `GONE` by default. The FAB button
toggles it between `GONE` and `VISIBLE`.

The overlay should:
- Occupy the bottom 40% of the screen (use a `CoordinatorLayout` or fixed height `200dp`)
- Have a semi-transparent dark background (`#E6000000`)
- Contain a `RecyclerView` with `LogAdapter`
- Have three buttons at the bottom: **Copy All**, **Clear**, **Export** (Export can be a no-op stub
  in Phase 1)

### `LogAdapter.kt`
- `RecyclerView.Adapter<LogAdapter.ViewHolder>`
- Each row shows: `[HH:mm:ss.SSS] [CATEGORY] message`
- Text colour driven by `LogLevel`:
  - INFO → `#212121`
  - WARN → `#F57C00`
  - ERROR → `#C62828`
  - NETWORK → `#1565C0`
  - AUTH → `#2E7D32`
- Font: monospace (`Typeface.MONOSPACE`)
- Font size: 11sp
- `fun submitList(entries: List<LogEntry>)` — calls `DiffUtil.calculateDiff` or just
  `notifyDataSetChanged()` (acceptable in Phase 1)
- Auto-scroll to last entry after update: call `recycler.scrollToPosition(adapter.itemCount - 1)`

### Probe script (inject on page load)

In `WebViewClient.onPageFinished`, call:
```kotlin
webView.evaluateJavascript("""
    (function() {
        var orig = console.log;
        console.log = function() {
            var msg = Array.prototype.join.call(arguments, ' ');
            if (window.Android) window.Android.log('info', 'JS', msg);
            orig.apply(console, arguments);
        };
        var origErr = console.error;
        console.error = function() {
            var msg = Array.prototype.join.call(arguments, ' ');
            if (window.Android) window.Android.log('error', 'JS', msg);
            origErr.apply(console, arguments);
        };
        window.Android && window.Android.log('info', 'System', 'Probe script injected at ' + new Date().toISOString());
    })();
""".trimIndent(), null)
```

Note: `WebChromeClient.onConsoleMessage` already captures console output. The probe script is a
belt-and-suspenders supplement and also confirms the JavascriptBridge is working.

### AndroidManifest.xml

Required:
```xml
<uses-permission android:name="android.permission.INTERNET" />
```

MainActivity attributes:
```xml
android:configChanges="orientation|screenSize"
android:windowSoftInputMode="adjustResize"
```

---

## Acceptance Criteria

1. Project builds with `./gradlew assembleDebug` — zero errors
2. APK installs on Android 8+ device via ADB or manual APK install
3. Opening the app loads `https://iquizpro.com` (no blank screen, no SSL error)
4. FAB button in bottom-right corner toggles the debug overlay
5. When the page loads, at least these log entries appear in the overlay:
   - `[System] WebView started`
   - `[System] Probe script injected at ...`
   - Any `console.log` lines the page emits on load
6. Tapping "Sign In", filling in email/password and submitting shows the auth-related console
   output in the overlay (e.g., `[JS] Auth initialized` from `auth-manager.js`)
7. **Copy All** button copies all log text to clipboard (show a Toast "Copied to clipboard")
8. **Clear** button empties the log list
9. Back button on the device navigates back within WebView history (if history exists) or exits app

---

## What Phase 1 Does NOT Include

- Network request interception (Phase 2)
- Auth SDK probing (Phase 3)
- Export to file / Share (Phase 4)
- Filter chips (can be stubbed as non-functional buttons)

---

## End of Session

When Phase 1 is complete:
1. Zip the full project or push to a GitHub repo
2. Write `PHASE1_HANDOFF.md` (list every file created, any deviations from spec, build instructions)
3. This file (`PHASE1_PROMPT.md`) is the input — `PHASE2_PROMPT.md` is the output for the next chat
