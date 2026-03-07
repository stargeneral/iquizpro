# Prompt Framework — Android Debug App

This file defines the conventions used for all phase prompts and handoff documents in this project.
Follow these rules in every chat session.

---

## Session Start Protocol

At the start of each session:
1. Read `DEVELOPMENT_PLAN.md` (overall goals and architecture)
2. Read the most recent `PHASE[N]_HANDOFF.md` (what was built last)
3. Read the current phase prompt (`PHASE[N]_PROMPT.md`) as the session goal
4. **Do not** start coding until you have read all three

---

## Naming Conventions

### Package
`com.iquizpros.debugapp`

### Kotlin classes
| Class | Purpose |
|---|---|
| `MainActivity` | Single activity, hosts WebView + FAB + overlay |
| `DebugWebView` | Custom WebView subclass or helper, sets all WebView config |
| `DebugLog` | Singleton in-memory ring buffer (max 2000 entries) |
| `LogEntry` | Data class: `timestamp`, `level`, `category`, `message` |
| `LogLevel` | Enum: `INFO`, `WARN`, `ERROR`, `NETWORK`, `AUTH` |
| `DebugOverlayFragment` | Bottom sheet or floating panel showing log list |
| `JavascriptBridge` | `@JavascriptInterface` methods callable from page JS |
| `NetworkInterceptor` | Logic inside `shouldInterceptRequest` |

### Layout IDs
| ID | Element |
|---|---|
| `webview_main` | The full-screen WebView |
| `fab_debug` | Floating action button (shows/hides overlay) |
| `recycler_logs` | RecyclerView inside overlay |
| `btn_copy_all` | Copy all logs to clipboard |
| `btn_clear` | Clear log buffer |
| `btn_export` | Write log to file + share |
| `filter_all` / `filter_auth` / `filter_network` / `filter_error` | Filter chips |

---

## Phase Document Rules

### Prompt file (`PHASE[N]_PROMPT.md`)
- Must begin with **"# Phase N — [Title]"**
- Must list all files to be created or modified
- Must list explicit acceptance criteria (numbered list)
- Must NOT contain ambiguous instructions

### Handoff file (`PHASE[N]_HANDOFF.md`)
- Created at the END of a phase, before ending the session
- Must list: what was built, what changed, what was skipped and why
- Must list the full path of every file created or modified
- Must end with "Next: Phase [N+1]"

---

## Code Conventions

- Kotlin only (no Java)
- No third-party libraries except those bundled with Android SDK
  - Exception: OkHttp is NOT used — all interception is done via `WebViewClient`
- `DebugLog` must be thread-safe (use `@Synchronized` or `CopyOnWriteArrayList`)
- All timestamps: `System.currentTimeMillis()` formatted as `HH:mm:ss.SSS`
- Log entries displayed in a `RecyclerView` with `DiffUtil`
- Colours for log levels (defined in `colors.xml`):
  - INFO: `#212121` (dark grey)
  - WARN: `#F57C00` (amber)
  - ERROR: `#C62828` (red)
  - NETWORK: `#1565C0` (blue)
  - AUTH: `#2E7D32` (green)

---

## Build Configuration

- **minSdk:** 24 (Android 7.0)
- **targetSdk:** 34 (Android 14)
- **compileSdk:** 34
- **Language:** Kotlin 1.9+
- **Gradle plugin:** 8.x
- No Compose (use traditional XML layouts — simpler for a debug tool)
- No view binding required (use `findViewById`) unless implementer prefers ViewBinding

---

## Android Manifest Requirements

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"
    android:maxSdkVersion="28" />
<!-- Android 10+ uses MediaStore — no WRITE_EXTERNAL_STORAGE needed -->
```

`MainActivity` must set:
```xml
android:configChanges="orientation|screenSize"
android:windowSoftInputMode="adjustResize"
```

---

## Testing Protocol

After each phase:
1. Build in Android Studio — zero warnings at error level
2. Run on emulator (Pixel 6, API 33) — basic smoke test
3. Install APK on real Android device (any Android 8+) — primary validation
4. Navigate to https://iquizpro.com and tap "Sign In"
5. Verify debug overlay shows sign-in events
6. Screenshot the overlay and paste into the handoff doc

---

## What NOT to Build

- No account creation, no Firebase SDK in the app itself
- No analytics or crash reporting
- No ProGuard/R8 obfuscation (debug tool — keep it debuggable)
- No Play Store signing config
- No dark mode (not worth the effort for a debug tool)
- No network proxy / MITM (WebViewClient interception is sufficient)
