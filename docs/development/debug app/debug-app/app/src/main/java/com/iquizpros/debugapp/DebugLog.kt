package com.iquizpros.debugapp

import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.concurrent.CopyOnWriteArrayList

object DebugLog {

    private const val MAX_ENTRIES = 2000
    private val _entries = CopyOnWriteArrayList<LogEntry>()
    private val fmt = SimpleDateFormat("HH:mm:ss.SSS", Locale.US)

    var onChange: (() -> Unit)? = null

    @Synchronized
    fun add(level: LogLevel, category: String, message: String) {
        if (_entries.size >= MAX_ENTRIES) {
            _entries.removeAt(0)
        }
        val entry = LogEntry(
            timestamp = fmt.format(Date()),
            level = level,
            category = category,
            message = message
        )
        _entries.add(entry)
        onChange?.invoke()
    }

    @Synchronized
    fun clear() {
        _entries.clear()
        onChange?.invoke()
    }

    fun entries(): List<LogEntry> = _entries.toList()
}
