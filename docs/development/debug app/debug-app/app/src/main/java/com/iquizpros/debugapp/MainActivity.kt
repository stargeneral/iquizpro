package com.iquizpros.debugapp

import android.Manifest
import android.content.ClipData
import android.content.ClipboardManager
import android.content.ContentValues
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Color
import android.content.res.ColorStateList
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.Environment
import android.provider.MediaStore
import android.view.KeyEvent
import android.view.View
import android.view.inputmethod.EditorInfo
import android.view.inputmethod.InputMethodManager
import android.webkit.ConsoleMessage
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import android.widget.Toast
import androidx.activity.OnBackPressedCallback
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import androidx.core.content.FileProvider
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.google.android.material.floatingactionbutton.FloatingActionButton
import java.io.File
import java.io.OutputStream
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class MainActivity : AppCompatActivity() {

    // ── Views ─────────────────────────────────────────────────────────────────
    private lateinit var webView: WebView
    private lateinit var urlBar: EditText
    private lateinit var btnGo: Button
    private lateinit var lockIcon: TextView
    private lateinit var fabDebug: FloatingActionButton
    private lateinit var debugOverlay: View
    private lateinit var recyclerLogs: RecyclerView
    private lateinit var textSummary: TextView
    private lateinit var btnCopyAll: Button
    private lateinit var btnClear: Button
    private lateinit var btnExport: Button
    private lateinit var btnFreeze: Button
    private lateinit var btnStarred: Button
    private lateinit var logAdapter: LogAdapter

    // ── State ─────────────────────────────────────────────────────────────────

    /** When true, new log entries do not refresh the RecyclerView. Display is frozen. */
    private var isFrozen = false

    /** When true, only starred entries are shown in the RecyclerView. */
    private var showStarredOnly = false

    /** Tracks the current page URL for the summary bar and lock icon. */
    private var currentUrl: String = "https://iquizpro.com"

    private val PERM_WRITE_STORAGE = 1001

    // Probe script: confirms the JS bridge is alive.
    // Console capture is handled entirely by WebChromeClient.onConsoleMessage.
    private val probeScript = """
        (function() {
            if (window.Android) {
                window.Android.log('info', 'System', 'Bridge OK — ' + location.href);
            }
        })();
    """.trimIndent()

    // ── Lifecycle ─────────────────────────────────────────────────────────────

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        webView      = findViewById(R.id.webview_main)
        urlBar       = findViewById(R.id.edit_url)
        btnGo        = findViewById(R.id.btn_go)
        lockIcon     = findViewById(R.id.text_lock)
        fabDebug     = findViewById(R.id.fab_debug)
        debugOverlay = findViewById(R.id.debug_overlay)
        recyclerLogs = findViewById(R.id.recycler_logs)
        textSummary  = findViewById(R.id.text_summary)
        btnCopyAll   = findViewById(R.id.btn_copy_all)
        btnClear     = findViewById(R.id.btn_clear)
        btnExport    = findViewById(R.id.btn_export)
        btnFreeze    = findViewById(R.id.btn_freeze)
        btnStarred   = findViewById(R.id.btn_starred)

        setupLogList()
        setupWebView()
        setupUrlBar()
        setupOverlayButtons()
        setupFab()
        setupBackNavigation()

        DebugLog.add(LogLevel.INFO, "System", "WebView Debugger started")

        // Load the default URL that is pre-filled in the URL bar
        val startUrl = urlBar.text.toString().trim()
        if (startUrl.isNotEmpty()) {
            navigateTo(startUrl)
        }
    }

    // ── URL bar ───────────────────────────────────────────────────────────────

    private fun setupUrlBar() {
        // Keyboard "Go" / "Enter" action
        urlBar.setOnEditorActionListener { _, actionId, event ->
            val isGo    = actionId == EditorInfo.IME_ACTION_GO
            val isEnter = event?.keyCode == KeyEvent.KEYCODE_ENTER &&
                          event.action == KeyEvent.ACTION_DOWN
            if (isGo || isEnter) {
                navigateTo(urlBar.text.toString())
                true
            } else {
                false
            }
        }

        // Go button
        btnGo.setOnClickListener {
            navigateTo(urlBar.text.toString())
        }
    }

    /**
     * Navigates the WebView to [rawUrl].
     * - If it already has a scheme → use as-is
     * - If it looks like a domain (contains a dot) → prepend https://
     * - Otherwise → send to Google search
     */
    private fun navigateTo(rawUrl: String) {
        val trimmed = rawUrl.trim()
        if (trimmed.isEmpty()) return

        val url = when {
            trimmed.startsWith("http://") ||
            trimmed.startsWith("https://") -> trimmed
            trimmed.contains(".")          -> "https://$trimmed"
            else -> "https://www.google.com/search?q=${Uri.encode(trimmed)}"
        }

        dismissKeyboard()
        DebugLog.add(LogLevel.INFO, "Nav", "→ $url")
        webView.loadUrl(url)
    }

    /**
     * Called from onPageFinished to sync the URL bar and lock icon with the
     * page that actually loaded (handles redirects).
     */
    private fun updateUrlBar(url: String) {
        currentUrl = url
        val isSecure = url.startsWith("https://")
        lockIcon.text = if (isSecure) "🔒" else "🔓"
        lockIcon.setTextColor(if (isSecure) Color.parseColor("#81C784") else Color.parseColor("#EF5350"))
        urlBar.setText(url)
        urlBar.clearFocus()
    }

    private fun dismissKeyboard() {
        val imm = getSystemService(Context.INPUT_METHOD_SERVICE) as InputMethodManager
        imm.hideSoftInputFromWindow(urlBar.windowToken, 0)
        urlBar.clearFocus()
    }

    // ── Log list ──────────────────────────────────────────────────────────────

    private fun setupLogList() {
        logAdapter = LogAdapter()
        recyclerLogs.layoutManager = LinearLayoutManager(this).also { it.stackFromEnd = true }
        recyclerLogs.adapter = logAdapter

        logAdapter.onStarToggle = { entry ->
            entry.starred = !entry.starred
            runOnUiThread { refreshDisplay() }
        }

        DebugLog.onChange = {
            if (!isFrozen) {
                runOnUiThread { refreshDisplay() }
            }
        }
    }

    /**
     * Rebuilds the visible list and updates the summary bar.
     * Must always be called on the UI thread.
     */
    private fun refreshDisplay() {
        val all   = DebugLog.entries()
        val shown = if (showStarredOnly) all.filter { it.starred } else all
        logAdapter.submitList(shown)
        if (shown.isNotEmpty()) {
            recyclerLogs.scrollToPosition(shown.size - 1)
        }
        textSummary.text = buildSummary(all)
    }

    /**
     * One-liner summary for the summary bar.
     * Example: "iquizpro.com  ●AUTH  NET:42  ERR:3  WARN:1  [FROZEN]"
     */
    private fun buildSummary(entries: List<LogEntry>): String {
        val domain = try {
            java.net.URL(currentUrl).host.removePrefix("www.")
        } catch (e: Exception) { "—" }

        val authOk = entries.any {
            it.level == LogLevel.AUTH &&
            (it.message.contains("signed", ignoreCase = true) ||
             it.message.contains("login",  ignoreCase = true) ||
             it.message.contains("token",  ignoreCase = true))
        }
        val authDot   = if (authOk) "●AUTH" else "○AUTH"
        val netCount  = entries.count { it.level == LogLevel.NETWORK }
        val errCount  = entries.count { it.level == LogLevel.ERROR }
        val warnCount = entries.count { it.level == LogLevel.WARN }
        val starCount = entries.count { it.starred }

        val parts = mutableListOf(domain, authDot, "NET:$netCount", "ERR:$errCount", "WARN:$warnCount")
        if (isFrozen)      parts += "[FROZEN]"
        if (starCount > 0) parts += "[★$starCount]"
        return parts.joinToString("  ")
    }

    // ── WebView ───────────────────────────────────────────────────────────────

    private fun setupWebView() {
        with(webView.settings) {
            javaScriptEnabled  = true
            domStorageEnabled  = true
            databaseEnabled    = true
            allowFileAccess    = false
            allowContentAccess = false
        }

        webView.addJavascriptInterface(JavascriptBridge(DebugLog), "Android")

        webView.webChromeClient = object : WebChromeClient() {
            override fun onConsoleMessage(consoleMessage: ConsoleMessage): Boolean {
                val level = when (consoleMessage.messageLevel()) {
                    ConsoleMessage.MessageLevel.WARNING -> LogLevel.WARN
                    ConsoleMessage.MessageLevel.ERROR   -> LogLevel.ERROR
                    else                                -> LogLevel.INFO
                }
                DebugLog.add(level, "JS", consoleMessage.message())
                return true
            }
        }

        webView.webViewClient = object : WebViewClient() {

            override fun shouldInterceptRequest(
                view: WebView,
                request: WebResourceRequest
            ): WebResourceResponse? = NetworkInterceptor.intercept(request)

            override fun onPageFinished(view: WebView, url: String) {
                super.onPageFinished(view, url)
                runOnUiThread { updateUrlBar(url) }
                DebugLog.add(LogLevel.INFO, "Nav", "Loaded: $url")
                view.evaluateJavascript(probeScript, null)
            }

            @Suppress("OVERRIDE_DEPRECATION")
            override fun onReceivedError(
                view: WebView,
                errorCode: Int,
                description: String,
                failingUrl: String
            ) {
                DebugLog.add(
                    LogLevel.ERROR,
                    "Nav",
                    "Load error $errorCode: $description ($failingUrl)"
                )
            }
        }
    }

    // ── Overlay buttons ───────────────────────────────────────────────────────

    private fun setupOverlayButtons() {

        // Copy All — full log with header (all entries, ignores starred filter)
        btnCopyAll.setOnClickListener {
            val text = buildLogText(DebugLog.entries())
            val clipboard = getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
            clipboard.setPrimaryClip(ClipData.newPlainText("webview-debug", text))
            Toast.makeText(this, "Copied ${DebugLog.entries().size} entries", Toast.LENGTH_SHORT).show()
        }

        // Clear — wipes log and resets freeze/starred state
        btnClear.setOnClickListener {
            DebugLog.clear()
            isFrozen        = false
            showStarredOnly = false
            btnFreeze.text  = getString(R.string.btn_freeze)
            btnStarred.text = getString(R.string.btn_starred)
            fabDebug.backgroundTintList = ColorStateList.valueOf(Color.parseColor("#25d366"))
            runOnUiThread { refreshDisplay() }
        }

        // Export — write to Downloads and open share sheet
        btnExport.setOnClickListener { exportLog() }

        // Freeze / Live — halts live log refresh
        btnFreeze.setOnClickListener {
            isFrozen = !isFrozen
            btnFreeze.text = getString(
                if (isFrozen) R.string.btn_freeze_active else R.string.btn_freeze
            )
            fabDebug.backgroundTintList = ColorStateList.valueOf(
                Color.parseColor(if (isFrozen) "#EF5350" else "#25d366")
            )
            if (!isFrozen) runOnUiThread { refreshDisplay() }
        }

        // Starred / All — filters to starred entries only
        btnStarred.setOnClickListener {
            showStarredOnly = !showStarredOnly
            btnStarred.text = getString(
                if (showStarredOnly) R.string.btn_starred_active else R.string.btn_starred
            )
            runOnUiThread { refreshDisplay() }
        }
    }

    // ── FAB ───────────────────────────────────────────────────────────────────

    private fun setupFab() {
        fabDebug.setOnClickListener {
            if (debugOverlay.visibility == View.VISIBLE) {
                debugOverlay.visibility = View.GONE
            } else {
                debugOverlay.visibility = View.VISIBLE
                runOnUiThread { refreshDisplay() }
            }
        }
    }

    // ── Back navigation ───────────────────────────────────────────────────────

    private fun setupBackNavigation() {
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (webView.canGoBack()) {
                    webView.goBack()
                } else {
                    isEnabled = false
                    onBackPressedDispatcher.onBackPressed()
                }
            }
        })
    }

    // ── Export ────────────────────────────────────────────────────────────────

    private fun exportLog() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q) {
            if (ContextCompat.checkSelfPermission(
                    this, Manifest.permission.WRITE_EXTERNAL_STORAGE
                ) != PackageManager.PERMISSION_GRANTED
            ) {
                ActivityCompat.requestPermissions(
                    this,
                    arrayOf(Manifest.permission.WRITE_EXTERNAL_STORAGE),
                    PERM_WRITE_STORAGE
                )
                return
            }
        }
        performExport()
    }

    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<out String>,
        grantResults: IntArray
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == PERM_WRITE_STORAGE) {
            if (grantResults.isNotEmpty() && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                performExport()
            } else {
                Toast.makeText(this, "Storage permission denied — cannot export", Toast.LENGTH_LONG).show()
            }
        }
    }

    private fun performExport() {
        val timestamp = SimpleDateFormat("yyyyMMdd_HHmmss", Locale.US).format(Date())
        val domain    = try { java.net.URL(currentUrl).host.replace(".", "_") } catch (e: Exception) { "site" }
        val fileName  = "debug_${domain}_$timestamp.txt"
        val logText   = buildLogText(DebugLog.entries())

        try {
            val uri: Uri = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                val values = ContentValues().apply {
                    put(MediaStore.Downloads.DISPLAY_NAME, fileName)
                    put(MediaStore.Downloads.MIME_TYPE,    "text/plain")
                    put(MediaStore.Downloads.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS)
                }
                val insertUri = contentResolver.insert(
                    MediaStore.Downloads.EXTERNAL_CONTENT_URI, values
                ) ?: throw IllegalStateException("MediaStore.insert returned null")
                contentResolver.openOutputStream(insertUri)?.use { stream: OutputStream ->
                    stream.write(logText.toByteArray(Charsets.UTF_8))
                }
                insertUri
            } else {
                val dir  = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS)
                val file = File(dir, fileName)
                file.writeText(logText, Charsets.UTF_8)
                FileProvider.getUriForFile(this, "$packageName.fileprovider", file)
            }

            val shareIntent = Intent(Intent.ACTION_SEND).apply {
                type = "text/plain"
                putExtra(Intent.EXTRA_STREAM,  uri)
                putExtra(Intent.EXTRA_SUBJECT, "WebView debug log — $domain — $timestamp")
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
            }
            startActivity(Intent.createChooser(shareIntent, "Share debug log"))

        } catch (e: Exception) {
            DebugLog.add(LogLevel.ERROR, "System", "Export failed: ${e.message}")
            Toast.makeText(this, "Export failed: ${e.message}", Toast.LENGTH_LONG).show()
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private fun buildLogText(entries: List<LogEntry>): String {
        val header = buildString {
            appendLine("=== WebView Debugger Log ===")
            appendLine("Site   : $currentUrl")
            appendLine("Device : ${android.os.Build.MANUFACTURER} ${android.os.Build.MODEL}")
            appendLine("Android: ${android.os.Build.VERSION.RELEASE} (API ${android.os.Build.VERSION.SDK_INT})")
            appendLine("Time   : ${SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.US).format(Date())}")
            appendLine("Entries: ${entries.size}")
            appendLine("============================")
        }
        val body = entries.joinToString("\n") { entry ->
            val star = if (entry.starred) "⭐ " else ""
            "[${entry.timestamp}] [${entry.level.name}] [${entry.category}] $star${entry.message}"
        }
        return header + body
    }
}
