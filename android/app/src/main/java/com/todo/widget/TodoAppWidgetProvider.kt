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
            
            val views = RemoteViews(context.packageName, R.layout.widget_todo_simple)
            
            // Скрываем все задачи сначала
            val taskViewIds = listOf(
                R.id.widget_task_1,
                R.id.widget_task_2,
                R.id.widget_task_3,
                R.id.widget_task_4,
                R.id.widget_task_5
            )
            taskViewIds.forEach { views.setViewVisibility(it, View.GONE) }
            
            if (tasks.isEmpty()) {
                // Показываем пустое состояние
                views.setViewVisibility(R.id.widget_tasks_container, View.GONE)
                views.setViewVisibility(R.id.widget_empty_text, View.VISIBLE)
            } else {
                // Показываем задачи
                views.setViewVisibility(R.id.widget_tasks_container, View.VISIBLE)
                views.setViewVisibility(R.id.widget_empty_text, View.GONE)
                
                val displayTasks = tasks.take(5)
                displayTasks.forEachIndexed { index, task ->
                    val taskViewId = taskViewIds[index]
                    views.setViewVisibility(taskViewId, View.VISIBLE)
                    
                    // Формируем текст задачи со смайликами
                    val emoji = if (task.important) "🔥" else "📝"
                    val status = if (task.completed) "✓" else "○"
                    val taskText = "$status $emoji ${task.text}"
                    
                    views.setTextViewText(taskViewId, taskText)
                    
                    // Зачеркиваем текст если задача выполнена
                    try {
                        if (task.completed) {
                            views.setInt(taskViewId, "setPaintFlags", Paint.STRIKE_THRU_TEXT_FLAG or Paint.ANTI_ALIAS_FLAG)
                            views.setTextColor(taskViewId, 0xFF808080.toInt()) // серый цвет
                        } else {
                            views.setInt(taskViewId, "setPaintFlags", Paint.ANTI_ALIAS_FLAG)
                            views.setTextColor(taskViewId, 0xFF000000.toInt()) // черный цвет
                        }
                    } catch (e: Exception) {
                        android.util.Log.w("TodoAppWidgetProvider", "Cannot set text style", e)
                    }
                    
                    // Устанавливаем обработчик клика для переключения задачи
                    val toggleIntent = Intent(context, TodoAppWidgetProvider::class.java).apply {
                        action = "com.todo.widget.TOGGLE_TASK"
                        putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, appWidgetId)
                        putExtra("task_id", task.id)
                    }
                    val requestCode = Math.abs((task.id.hashCode() + index * 1000) % Integer.MAX_VALUE)
                    val pendingIntent = android.app.PendingIntent.getBroadcast(
                        context,
                        requestCode,
                        toggleIntent,
                        android.app.PendingIntent.FLAG_UPDATE_CURRENT or android.app.PendingIntent.FLAG_IMMUTABLE
                    )
                    views.setOnClickPendingIntent(taskViewId, pendingIntent)
                }
            }

            // Обработчик клика для кнопки открытия приложения
            val openAppIntent = context.packageManager.getLaunchIntentForPackage(context.packageName)
            if (openAppIntent != null) {
                openAppIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)
                val pendingIntent = android.app.PendingIntent.getActivity(
                    context,
                    0,
                    openAppIntent,
                    android.app.PendingIntent.FLAG_UPDATE_CURRENT or android.app.PendingIntent.FLAG_IMMUTABLE
                )
                views.setOnClickPendingIntent(R.id.widget_open_app_button, pendingIntent)
            }

            android.util.Log.d("TodoAppWidgetProvider", "Calling updateAppWidget")
            appWidgetManager.updateAppWidget(appWidgetId, views)
            android.util.Log.d("TodoAppWidgetProvider", "Widget updated successfully")
        } catch (e: Exception) {
            android.util.Log.e("TodoAppWidgetProvider", "Error updating widget", e)
            e.printStackTrace()
            try {
                val errorViews = RemoteViews(context.packageName, R.layout.widget_todo_simple)
                errorViews.setViewVisibility(R.id.widget_tasks_container, View.GONE)
                errorViews.setViewVisibility(R.id.widget_empty_text, View.VISIBLE)
                errorViews.setTextViewText(R.id.widget_empty_text, "Ошибка: ${e.message}")
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

