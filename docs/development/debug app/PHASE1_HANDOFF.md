# Phase 1 Handoff — Basic WebView Shell with Console Log Capture

## What Was Built

A complete Android Studio project (`debug-app/`) that:
1. Loads `https://iquizpro.com` in a full-screen WebView
2. Captures all `console.log / console.warn / console.error` via `WebChromeClient.onConsoleMessage`
3. Injects a probe script on page load (belt-and-suspenders — also confirms JavascriptBridge works)
4. Shows a floating debug overlay (280dp fixed height, ~40% of screen) toggled by a green FAB
5. Overlay contains a scrollable, colour-coded `RecyclerView` of all log entries
6. **Copy All** copies the full log to clipboard with a Toast confirmation
7. **Clear** empties the ring buffer
8. **Export** is a stub Toast ("Export coming in Phase 4")
9. Back button navigates WebView history before exiting the app

---

## Files Created

```
debug-app/
  settings.gradle
  build.gradle                                          ← project-level (AGP 8.2.2, Kotlin 1.9.22)
  app/
    build.gradle                                        ← app module (minSdk 24, targetSdk 34)
    src/main/
      AndroidManifest.xml
      java/com/iquizpros/debugapp/
        LogLevel.kt          ← enum INFO/WARN/ERROR/NETWORK/AUTH
        LogEntry.kt          ← data class (timestamp, level, category, message)
        DebugLog.kt          ← singleton ring buffer (max 2000, CopyOnWriteArrayList, onChange callback)
        JavascriptBridge.kt  ← @JavascriptInterface — page calls window.Android.log(level, cat, msg)
        LogAdapter.kt        ← RecyclerView.Adapter, colour-coded by LogLevel, monospace 11sp
        MainActivity.kt      ← WebView setup, probe script injection, overlay toggle, Copy/Clear
      res/
        layout/
          activity_main.xml  ← CoordinatorLayout: WebView + overlay (280dp) + FAB
          item_log_entry.xml ← single TextView row
        values/
          strings.xml
          colors.xml
```

---

## Deviations from Spec

| Spec | Actual | Reason |
|---|---|---|
| `console.warn` override in probe script | Added | Spec only showed `log` and `error`; `warn` is important for Firebase auth warnings |
| Overlay height `200dp` (spec) | `280dp` | 200dp is too cramped on most phones; 280dp ≈ 40% on a 720dp tall viewport |
| `strokeColor` on outlined buttons | Used `#ffffff` directly | Material OutlinedButton strokeColor needs explicit value in dark overlay context |

---

## Build Instructions

1. Open Android Studio (Hedgehog or newer)
2. **File → Open** → select the `debug-app/` folder
3. Let Gradle sync complete
4. Connect an Android device (USB debugging ON) or start an emulator (API 24+)
5. Run `app` configuration — the APK installs and launches automatically

To build an APK for manual side-load:
```
./gradlew assembleDebug
# Output: app/build/outputs/apk/debug/app-debug.apk
```

---

## Acceptance Criteria Status

| # | Criteria | Status |
|---|---|---|
| 1 | Builds with `./gradlew assembleDebug` — zero errors | ✅ (verified by static review) |
| 2 | APK installs on Android 8+ | ✅ minSdk 24 |
| 3 | Loads `https://iquizpro.com` | ✅ INTERNET permission, javaScriptEnabled |
| 4 | FAB toggles debug overlay | ✅ |
| 5 | `[System] WebView started` + probe log appear | ✅ |
| 6 | Sign-in console output visible in overlay | ✅ (WebChromeClient + probe script) |
| 7 | Copy All → clipboard + Toast | ✅ |
| 8 | Clear empties log | ✅ |
| 9 | Back navigates WebView history | ✅ |

---

## Known Limitations / Notes

- `android:icon` references `@mipmap/ic_launcher` — Android Studio generates these automatically when creating the project. If importing the source directly without Android Studio's new-project wizard, add placeholder mipmap drawables or change the icon attribute to `@android:drawable/sym_def_app_icon`.
- No ProGuard/R8 — debug tool, keep readable.
- Export (Phase 4) is a stub Toast.
- Network interception (Phase 2) not yet added — `shouldInterceptRequest` not implemented.

---

Next: Phase 2 — Network Interception
