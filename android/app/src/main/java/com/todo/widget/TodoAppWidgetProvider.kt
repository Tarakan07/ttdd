package com.todo.widget

import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.widget.RemoteViews
import android.view.View
import android.graphics.Paint
import androidx.core.content.ContextCompat
import com.todo.R

class TodoAppWidgetProvider : AppWidgetProvider() {

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        android.util.Log.d("TodoAppWidgetProvider", "onUpdate called for ${appWidgetIds.size} widgets")
        for (appWidgetId in appWidgetIds) {
            try {
                updateAppWidget(context, appWidgetManager, appWidgetId)
            } catch (e: Exception) {
                android.util.Log.e("TodoAppWidgetProvider", "Error updating widget $appWidgetId in onUpdate", e)
            }
        }
    }

    override fun onReceive(context: Context, intent: Intent) {
        when (intent.action) {
            "com.todo.widget.TOGGLE_TASK" -> {
                val taskId = intent.getStringExtra("task_id")
                if (taskId != null) {
                    TaskUtils.toggleTask(context, taskId)
                    // Обновляем виджет
                    val appWidgetManager = AppWidgetManager.getInstance(context)
                    val appWidgetIds = appWidgetManager.getAppWidgetIds(
                        android.content.ComponentName(context, TodoAppWidgetProvider::class.java)
                    )
                    onUpdate(context, appWidgetManager, appWidgetIds)
                    
                    // Отправляем событие в React Native для синхронизации
                    sendTaskUpdateToRN(context, taskId)
                }
            }
            AppWidgetManager.ACTION_APPWIDGET_UPDATE -> {
                super.onReceive(context, intent)
                // Получаем ID виджетов из intent, если они есть
                val appWidgetIds = intent.getIntArrayExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS)
                    ?: AppWidgetManager.getInstance(context).getAppWidgetIds(
                        android.content.ComponentName(context, TodoAppWidgetProvider::class.java)
                    )
                if (appWidgetIds.isNotEmpty()) {
                    onUpdate(context, AppWidgetManager.getInstance(context), appWidgetIds)
                }
            }
            else -> {
                super.onReceive(context, intent)
            }
        }
    }

    private fun updateAppWidget(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetId: Int
    ) {
        try {
            android.util.Log.d("TodoAppWidgetProvider", "Updating widget, appWidgetId: $appWidgetId")
            val tasks = TaskUtils.getTodayTasks(context)
            android.util.Log.d("TodoAppWidgetProvider", "Found ${tasks.size} tasks for today")
            
            // Используем упрощенный layout для тестирования
            val views = RemoteViews(context.packageName, R.layout.widget_todo_simple)
            
            // УПРОЩЕННЫЙ ВИДЖЕТ - только текст, без checkbox
            val contentText = if (tasks.isEmpty()) {
                "Нет задач на сегодня"
            } else {
                val tasksList = tasks.take(5).mapIndexed { index, task ->
                    val status = if (task.completed) "✓" else "○"
                    val important = if (task.important) "⭐ " else ""
                    "$status $important${task.text}"
                }.joinToString("\n")
                tasksList
            }
            
            views.setTextViewText(R.id.widget_content, contentText)

            // Обработчик клика для открытия приложения
            val openAppIntent = context.packageManager.getLaunchIntentForPackage(context.packageName)
            if (openAppIntent != null) {
                openAppIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)
                val pendingIntent = android.app.PendingIntent.getActivity(
                    context,
                    0,
                    openAppIntent,
                    android.app.PendingIntent.FLAG_UPDATE_CURRENT or android.app.PendingIntent.FLAG_IMMUTABLE
                )
                views.setOnClickPendingIntent(R.id.widget_content, pendingIntent)
            }

            android.util.Log.d("TodoAppWidgetProvider", "Calling updateAppWidget (simple version)")
            appWidgetManager.updateAppWidget(appWidgetId, views)
            android.util.Log.d("TodoAppWidgetProvider", "Widget updated successfully")
        } catch (e: Exception) {
            android.util.Log.e("TodoAppWidgetProvider", "Error updating widget", e)
            e.printStackTrace()
            try {
                val errorViews = RemoteViews(context.packageName, R.layout.widget_todo_simple)
                errorViews.setTextViewText(R.id.widget_content, "Ошибка: ${e.message}")
                appWidgetManager.updateAppWidget(appWidgetId, errorViews)
            } catch (e2: Exception) {
                android.util.Log.e("TodoAppWidgetProvider", "Error showing error state", e2)
            }
        }
    }

    private fun sendTaskUpdateToRN(context: Context, taskId: String) {
        // Отправляем событие через BroadcastReceiver
        val updateIntent = Intent("com.todo.widget.TASK_UPDATED").apply {
            putExtra("task_id", taskId)
            setPackage(context.packageName)
        }
        context.sendBroadcast(updateIntent)
    }
}

