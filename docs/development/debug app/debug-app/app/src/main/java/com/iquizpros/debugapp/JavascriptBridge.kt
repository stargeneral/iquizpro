package com.iquizpros.debugapp

import android.webkit.JavascriptInterface

class JavascriptBridge(private val log: DebugLog) {

    @JavascriptInterface
    fun log(levelStr: String, category: String, message: String) {
        val level = when (levelStr.lowercase()) {
            "warn"    -> LogLevel.WARN
            "error"   -> LogLevel.ERROR
            "auth"    -> LogLevel.AUTH
            "network" -> LogLevel.NETWORK
            else      -> LogLevel.INFO
        }
        log.add(level, category, message)
    }
}
