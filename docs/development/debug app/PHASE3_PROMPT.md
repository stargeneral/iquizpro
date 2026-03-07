# Phase 3 — Export, Share, and Polish

## Context

Read `DEVELOPMENT_PLAN.md`, `PROMPT_FRAMEWORK.md`, and `PHASE2_HANDOFF.md` before starting.

Phase 2 added network interception and auth SDK probing. This final phase makes the log shareable
so findings from a real device can be sent to the developer for analysis.

---

## Goal

After this phase, a tester can:
1. Tap **Export** to write the full log to a `.txt` file in Downloads and share via Android
   Share sheet (WhatsApp, email, etc.)
2. See a **Summary panel** at the top of the overlay (auth SDK status, request count)
3. Use a **"Snapshot"** mode that freezes the log at the moment of a sign-in attempt (so
   the log doesn't keep scrolling during the freeze/hang)
4. Mark individual log entries as important (long-press → star ⭐) so they're easy to find
   when scrolling through 200+ entries

---

## Changes

### Expand NetworkInterceptor coverage (full app debug)

Add two missing host groups to `NetworkInterceptor.kt` so ALL app processes are visible,
not just auth and Firestore:

```kotlin
// In WATCH_HOSTS, add:
"firebasedatabase.app",    // Realtime Database — live presenter/audience sessions
"cloudfunctions.net",      // Cloud Functions — AI quiz gen, Stripe portal, usage stats
```

Tag Cloud Functions as `LogLevel.NETWORK` (blue) with category `"Functions"`.
Tag RTDB as `LogLevel.NETWORK` (blue) with category `"RTDB"`.

This means every `generateQuiz`, `listUserQuizzes`, `createPortalSession`, and every
live-presenter RTDB write will appear in the overlay, giving full visibility across
the entire application.

---

### Implement Export button

On Android 10+ (API 29+), use `MediaStore`:
```kotlin
val values = ContentValues().apply {
    put(MediaStore.Downloads.DISPLAY_NAME, "iquizpro-debug-${timestamp}.txt")
    put(MediaStore.Downloads.MIME_TYPE, "text/plain")
    put(MediaStore.Downloads.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS)
}
val uri = contentResolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values)!!
contentResolver.openOutputStream(uri)?.use { it.write(logText.toByteArray()) }
```

On Android 8-9 (API 26-28), use legacy `File` write to `Environment.getExternalStoragePublicDirectory(DIRECTORY_DOWNLOADS)`.

After writing, launch the Share sheet:
```kotlin
val shareIntent = Intent(Intent.ACTION_SEND).apply {
    type = "text/plain"
    putExtra(Intent.EXTRA_STREAM, uri)
    addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
}
startActivity(Intent.createChooser(shareIntent, "Share debug log"))
```

Log format (one line per entry):
```
[HH:mm:ss.SSS] [LEVEL] [CATEGORY] message
```

Header block at top of file:
```
iQuizPros Android Debug Log
Generated: <full ISO datetime>
Device: <Build.MODEL> (Android <Build.VERSION.RELEASE> / API <Build.VERSION.SDK_INT>)
URL: https://iquizpro.com
Total entries: N
---
```

### Summary panel

Insert a `TextView` above the filter chips showing a compact summary that updates live:
```
Auth: firebase ✓  auth() ✓  Manager ✓   Net: 3 req   Errors: 0
```

Computed from `DebugLog.entries()`:
- `firebase ✓/✗` — whether an AUTH entry with "window.firebase READY" exists
- `auth() ✓/✗` — whether an AUTH entry with "firebase.auth() READY" exists
- `Manager ✓/✗` — whether an AUTH entry with "QuizProsAuthManager READY" exists
- `Net: N req` — count of NETWORK entries
- `Errors: N` — count of ERROR entries

### Snapshot mode

Add a `FREEZE` toggle button (icon: pause ⏸). When active:
- `DebugLog.add()` still appends to the buffer
- The RecyclerView stops auto-refreshing (disconnects the onChange callback)
- The FAB badge shows a red dot to indicate freeze is active
- Tapping again resumes live updates and scrolls to bottom

Rationale: when sign-in hangs for 30 seconds, the log may keep receiving entries (timer ticks,
heartbeats) that push the important sign-in entries off-screen. Freeze at the moment of hang.

### Long-press to star entries

In `LogAdapter`, add `onLongClickListener` to item views:
- Toggle a `starred` flag on the `LogEntry` (add `var starred: Boolean = false`)
- Starred entries show a ⭐ prefix and `#FFF9C4` (light yellow) background
- Add a **Starred** filter chip that shows only starred entries

---

## Acceptance Criteria

1. Tapping Export writes a `.txt` file and opens the Android Share sheet
2. The file is readable in a text editor and contains all log entries
3. The header block shows device model, Android version, and timestamp
4. Summary panel shows correct counts and auth SDK status
5. Freeze button stops RecyclerView updates; unfreeze resumes them
6. Long-pressing an entry toggles the star and changes its background
7. Starred filter chip shows only starred entries
8. App handles `WRITE_EXTERNAL_STORAGE` permission request gracefully on API 28 and below
   (show `ActivityCompat.requestPermissions` before writing)

---

## End of Session

1. Update the Android Studio project
2. Write `PHASE3_HANDOFF.md`
3. Note any remaining issues or follow-up work in the handoff doc

---

## Post-Phase 3: How to Use This App to Debug iquizpros.com

1. Build and install APK on the test Android device
2. Open app → iquizpro.com loads
3. Wait for Summary panel to show `firebase ✓  auth() ✓  Manager ✓`
4. Tap **Sign In**, enter real credentials
5. If sign-in freezes:
   a. Tap Freeze ⏸ immediately
   b. Scroll the log to find `BUTTON CLICKED` entry
   c. Check `authReady=true/false`
   d. Check whether a NETWORK entry for `signInWithPassword` appears after the button click
   e. Long-press key entries to star them
6. Tap Export → share log via WhatsApp or email to developer
7. Developer reads the log and identifies exact failure point
