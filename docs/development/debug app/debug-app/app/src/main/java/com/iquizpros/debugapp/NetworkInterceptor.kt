package com.iquizpros.debugapp

import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse

object NetworkInterceptor {

    /**
     * File extensions treated as static assets.
     * These are silently skipped — they flood the log with no debug value.
     * Toggle filterAssets = false in code to see them if ever needed.
     */
    private val ASSET_EXTENSIONS = setOf(
        "js", "css",
        "png", "jpg", "jpeg", "gif", "svg", "webp", "avif", "ico",
        "woff", "woff2", "ttf", "otf", "eot",
        "map"               // source-map files
    )

    var filterAssets: Boolean = true

    // ── Category matchers (checked in priority order) ────────────────────────

    private val AUTH_HOSTS = listOf(
        "identitytoolkit.googleapis.com",
        "securetoken.googleapis.com"
    )

    private val RTDB_HOSTS = listOf(
        "firebasedatabase.app",
        "firebaseio.com"
    )

    private val FUNCTIONS_HOSTS = listOf(
        "cloudfunctions.net"
    )

    private val API_HOST_FRAGMENTS = listOf(
        "googleapis.com",
        "firebase.google.com",
        "firebaseapp.com"
    )

    /**
     * Called from WebViewClient.shouldInterceptRequest (background thread).
     * DebugLog is thread-safe via CopyOnWriteArrayList + @Synchronized add().
     *
     * Always returns null so the WebView continues with the real request.
     */
    fun intercept(request: WebResourceRequest): WebResourceResponse? {
        val url  = request.url ?: return null
        val host = url.host   ?: return null

        // Silently drop static asset requests to keep the log readable
        if (filterAssets) {
            val path = url.path ?: ""
            val ext  = path.substringAfterLast('.', "").lowercase()
            if (ext in ASSET_EXTENSIONS) return null
        }

        val method = request.method ?: "GET"
        val short  = shortenUrl(url.toString())

        val (level, cat) = categorise(host)
        DebugLog.add(level, cat, "$method $short")

        return null
    }

    /**
     * Returns the (LogLevel, category-string) pair for a given host.
     * Checked in specificity order — most specific first.
     */
    private fun categorise(host: String): Pair<LogLevel, String> = when {
        AUTH_HOSTS.any      { host.contains(it) } -> LogLevel.AUTH    to "Auth"
        RTDB_HOSTS.any      { host.contains(it) } -> LogLevel.NETWORK to "RTDB"
        FUNCTIONS_HOSTS.any { host.contains(it) } -> LogLevel.NETWORK to "Functions"
        API_HOST_FRAGMENTS.any { host.contains(it) } -> LogLevel.NETWORK to "API"
        else                                       -> LogLevel.NETWORK to "Network"
    }

    private fun shortenUrl(url: String): String {
        return try {
            val u  = java.net.URL(url)
            val pq = if (u.query != null) "${u.path}?${u.query}" else u.path
            "${u.host}${pq}".take(140)
        } catch (e: Exception) {
            url.take(140)
        }
    }
}
