package com.iquizpros.debugapp

data class LogEntry(
    val timestamp: String,   // "HH:mm:ss.SSS"
    val level: LogLevel,
    val category: String,    // "JS", "Network", "Auth", "RTDB", "Functions", "System"
    val message: String,
    var starred: Boolean = false  // toggled by long-press in LogAdapter
)
