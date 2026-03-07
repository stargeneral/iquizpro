# Debug App — Phase 3 Handoff

**Date:** 2026-03-04
**Phase:** 3 — Export, Freeze, Starred, Summary Panel, Full Network Coverage
**Status:** ✅ Complete — all files written, app ready to build in Android Studio

---

## What Was Built

Phase 3 turned the Phase 2 log viewer into a fully featured debug console:

| Feature | Description |
|---------|-------------|
| **Summary bar** | One-liner at top of overlay: auth status, network count, error count, warn count, frozen indicator, star count |
| **Freeze mode** | ⏸ Freeze button halts live log refresh; display stays static. FAB turns red. ▶ Live resumes. |
| **Starred entries** | Long-press any log entry to star/unstar it; starred entries get `⭐` prefix + yellow tint |
| **Starred filter** | ⭐ Starred button shows only starred entries; ✦ All returns to full list |
| **Export** | Writes `iquizpro_debug_YYYYMMDD_HHmmss.txt` to Downloads, opens Android Share sheet |
| **Copy All** | Copies all entries (with header) to clipboard |
| **RTDB coverage** | `firebasedatabase.app` + `firebaseio.com` now intercepted, tagged `[RTDB]` |
| **Functions coverage** | `cloudfunctions.net` now intercepted, tagged `[Functions]` |

---

## Files Changed

### `NetworkInterceptor.kt`
- Added `RTDB_HOSTS` list: `firebasedatabase.app`, `firebaseio.com`
- Added `FUNCTIONS_HOSTS` list: `cloudfunctions.net`
- Expanded `WATCH_HOSTS` to include both new groups
- Category detection uses `when`-destructuring to `(LogLevel, String)` pairs:
  - RTDB → `LogLevel.NETWORK`, category `"RTDB"`
  - Functions → `LogLevel.NETWORK`, category `"Functions"`

### `LogEntry.kt`
- Added `var starred: Boolean = false`
- Field is `var` (not `val`) so it can be mutated in-place without replacing the list entry

### `LogAdapter.kt`
- Added `var onStarToggle: ((LogEntry) -> Unit)?` callback; wired to long-press on `itemView`
- Starred entries: `⭐ ` prefix + `#33FFF9C4` yellow-tint background on `itemView`
- Text colors updated for readability on the `#E6000000` dark overlay:

  | Level | Colour | Name |
  |-------|--------|------|
  | INFO | `#E0E0E0` | near-white |
  | WARN | `#FFB74D` | amber 300 |
  | ERROR | `#EF5350` | red 400 |
  | NETWORK | `#64B5F6` | blue 300 |
  | AUTH | `#81C784` | green 300 |

### `activity_main.xml`
- Overlay height: 280dp → **320dp**
- Added `TextView id="text_summary"` (28dp, monospace 10sp, `#1AFFFFFF` bg) at top of overlay
- Added 1dp divider below summary bar
- Kept RecyclerView with `layout_weight=1`
- Kept Button row 1: `btn_copy_all | btn_clear | btn_export`
- Added **Button row 2**: `btn_freeze` (blue `#64B5F6`) | `btn_starred` (amber `#FFB74D`)

### `strings.xml`
```xml
<string name="btn_freeze">⏸ Freeze</string>
<string name="btn_freeze_active">▶ Live</string>
<string name="btn_starred">⭐ Starred</string>
<string name="btn_starred_active">✦ All</string>
```

### `res/xml/file_paths.xml` ← NEW
FileProvider path declaration for API 24-28 export:
```xml
<paths>
    <external-path name="downloads" path="Download/" />
</paths>
```

### `AndroidManifest.xml`
- `WRITE_EXTERNAL_STORAGE` permission already present with `maxSdkVersion="28"` ✅
- Added `<provider>` block for `androidx.core.content.FileProvider` with `${applicationId}.fileprovider` authority

### `MainActivity.kt` — full rewrite
Key additions over Phase 2:

**New views wired:**
```kotlin
textSummary = findViewById(R.id.text_summary)
btnFreeze   = findViewById(R.id.btn_freeze)
btnStarred  = findViewById(R.id.btn_starred)
```

**`refreshDisplay()`** — single source of truth for display updates:
```
all entries → filter by showStarredOnly → submitList() → scrollToEnd()
                                        → buildSummary() → textSummary.text
```

**`buildSummary(entries)`** — produces:
```
●AUTH  NET:42  ERR:3  WARN:1  [FROZEN]  [★5]
```
Auth dot is `●` if any AUTH entry mentions "signed" or "login", otherwise `○`.

**Freeze toggle:**
- `isFrozen = true` → `DebugLog.onChange` callback exits early (display frozen)
- FAB `backgroundTintList` set to `#EF5350` (red) while frozen, `#25d366` (green) when live
- Button text: `⏸ Freeze` ↔ `▶ Live`

**Starred filter toggle:**
- `showStarredOnly = true` → `refreshDisplay()` calls `entries.filter { it.starred }`
- Button text: `⭐ Starred` ↔ `✦ All`

**Star mutation:**
```kotlin
logAdapter.onStarToggle = { entry ->
    entry.starred = !entry.starred   // mutates the shared LogEntry object
    runOnUiThread { refreshDisplay() }
}
```

**Export flow:**
```
exportLog()
  └─ API < 29? → check / request WRITE_EXTERNAL_STORAGE permission
       └─ onRequestPermissionsResult → performExport() if granted
  └─ API 29+  → performExport() directly

performExport()
  ├─ API 29+ : MediaStore.Downloads.insert() → openOutputStream() → write
  └─ API <29 : File(Downloads dir) → writeText() → FileProvider.getUriForFile()
  └─ Intent.ACTION_SEND → createChooser("Share debug log")
```

**Export file format:**
```
=== iQuizPros Debug Log ===
Device : Google Pixel 6
Android: 14 (API 34)
Time   : 2026-03-04 21:47:03
Entries: 87
===========================
[21:47:01.123] [AUTH] [Auth] ⭐ POST https://identitytoolkit.googleapis.com/…
[21:47:01.456] [INFO] [JS] Sign-in complete
…
```

**Clear resets all state:**
```kotlin
isFrozen = false
showStarredOnly = false
btnFreeze.text  = getString(R.string.btn_freeze)
btnStarred.text = getString(R.string.btn_starred)
fabDebug.backgroundTintList = ColorStateList.valueOf(Color.parseColor("#25d366"))
```

---

## Network Coverage — Full Matrix (after Phase 3)

| Host | Category tag | Level |
|------|-------------|-------|
| `identitytoolkit.googleapis.com` | Auth | AUTH |
| `securetoken.googleapis.com` | Auth | AUTH |
| `firestore.googleapis.com` | Network | NETWORK |
| `firebase.googleapis.com` | Network | NETWORK |
| `firebasedatabase.app` | RTDB | NETWORK |
| `firebaseio.com` | RTDB | NETWORK |
| `cloudfunctions.net` | Functions | NETWORK |
| `iquizpro.com` | Network | NETWORK |
| `quizpros.web.app` | Network | NETWORK |
| `quizpros.firebaseapp.com` | Network | NETWORK |

All Firebase services are now covered. Console (JS) capture was always 100%.

---

## How to Build

1. Open `docs/development/debug app/debug-app/` in Android Studio
2. **Sync Gradle** (the project hasn't changed its `build.gradle` — dependencies already present)
3. **Run** on a physical device (USB debugging on) or emulator
4. The FAB (green ⓘ button, bottom-right) opens/closes the overlay

---

## Known Gaps / Possible Phase 4

| Item | Notes |
|------|-------|
| Filter by category | Could add a chip row (JS / Auth / RTDB / Functions / Network / System) |
| Filter by level | ERROR-only view for quick triage |
| Max entries cap | Currently unlimited; could cap at 2 000 entries with a ring buffer |
| WebSocket frames | `shouldInterceptRequest` only sees HTTP; WS frames (RTDB realtime) are invisible |
| Response body | `shouldInterceptRequest` returns `null` (pass-through); response body not captured |

The WebSocket gap is structural — Android WebView does not expose WS frames through any public API. RTDB _connection establishment_ (the HTTP upgrade handshake) is visible; subsequent socket frames are not.

---

## Pre-existing Dashboard Issues (separate from debug app)

Identified during Phase 2 log analysis. Not fixed by the debug app — requires changes to the main web app:

1. **`listUserQuizzes` FirebaseError: INTERNAL** — Cloud Function throwing unhandled exception. Check Firebase Console → Functions → Logs for stack trace.

2. **Missing Firestore composite index** — `sessionArchive` collection needs `presenterId ASC` + `completedAt DESC`. Firebase Console shows a direct link in the error to create the index automatically.
