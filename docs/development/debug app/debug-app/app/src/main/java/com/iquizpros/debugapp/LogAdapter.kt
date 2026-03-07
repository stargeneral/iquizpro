package com.iquizpros.debugapp

import android.graphics.Color
import android.graphics.Typeface
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView

class LogAdapter : RecyclerView.Adapter<LogAdapter.ViewHolder>() {

    private var items: List<LogEntry> = emptyList()

    /** Called when the user long-presses an entry; MainActivity toggles entry.starred. */
    var onStarToggle: ((LogEntry) -> Unit)? = null

    class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val textView: TextView = view.findViewById(R.id.text_log_entry)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_log_entry, parent, false)
        return ViewHolder(view)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val entry = items[position]

        val star = if (entry.starred) "⭐ " else ""
        holder.textView.text = "[${entry.timestamp}] [${entry.category}] $star${entry.message}"
        holder.textView.setTextColor(colorForLevel(entry.level))
        holder.textView.typeface = Typeface.MONOSPACE
        holder.textView.textSize = 11f

        // Starred entries get a subtle yellow tint on the dark background
        holder.itemView.setBackgroundColor(
            if (entry.starred) Color.parseColor("#33FFF9C4") else Color.TRANSPARENT
        )

        // Long-press toggles the star; caller (MainActivity) refreshes the display
        holder.itemView.setOnLongClickListener {
            onStarToggle?.invoke(entry)
            true
        }
    }

    override fun getItemCount(): Int = items.size

    fun submitList(entries: List<LogEntry>) {
        items = entries
        notifyDataSetChanged()
    }

    /**
     * Colours chosen for readability on the dark (#E6000000) overlay background.
     * Using Material Design "200" variants for NETWORK and AUTH; bright primaries for
     * WARN and ERROR; near-white for INFO.
     */
    private fun colorForLevel(level: LogLevel): Int = when (level) {
        LogLevel.INFO    -> Color.parseColor("#E0E0E0")   // near-white — general messages
        LogLevel.WARN    -> Color.parseColor("#FFB74D")   // amber 300
        LogLevel.ERROR   -> Color.parseColor("#EF5350")   // red 400
        LogLevel.NETWORK -> Color.parseColor("#64B5F6")   // blue 300
        LogLevel.AUTH    -> Color.parseColor("#81C784")   // green 300
    }
}
