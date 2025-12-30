package com.todo.widget

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

class WidgetUpdateReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == "com.todo.widget.TASK_UPDATED") {
            val taskId = intent.getStringExtra("task_id")
            if (taskId != null) {
                // Отправляем событие через WidgetSyncModule
                WidgetSyncModule.sendTaskUpdateEvent(context, taskId)
            }
        }
    }
}

