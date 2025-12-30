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
        for (appWidgetId in appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId)
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
                val appWidgetManager = AppWidgetManager.getInstance(context)
                val appWidgetIds = appWidgetManager.getAppWidgetIds(
                    android.content.ComponentName(context, TodoAppWidgetProvider::class.java)
                )
                onUpdate(context, appWidgetManager, appWidgetIds)
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
        val tasks = TaskUtils.getTodayTasks(context)
        val views = RemoteViews(context.packageName, R.layout.widget_todo)

        if (tasks.isEmpty()) {
            views.setViewVisibility(R.id.widget_empty_text, View.VISIBLE)
            views.setViewVisibility(R.id.widget_tasks_container, View.GONE)
        } else {
            views.setViewVisibility(R.id.widget_empty_text, View.GONE)
            views.setViewVisibility(R.id.widget_tasks_container, View.VISIBLE)

            // Ограничиваем до 5 задач для виджета
            val displayTasks = tasks.take(5)
            
            // Показываем только первые 5 задач
            for (i in 0 until 5) {
                val taskLayoutId = when (i) {
                    0 -> R.id.widget_task_1
                    1 -> R.id.widget_task_2
                    2 -> R.id.widget_task_3
                    3 -> R.id.widget_task_4
                    4 -> R.id.widget_task_5
                    else -> null
                }

                if (i < displayTasks.size && taskLayoutId != null) {
                    val task = displayTasks[i]
                    views.setViewVisibility(taskLayoutId, View.VISIBLE)
                    
                    val checkboxId = when (i) {
                        0 -> R.id.widget_checkbox_1
                        1 -> R.id.widget_checkbox_2
                        2 -> R.id.widget_checkbox_3
                        3 -> R.id.widget_checkbox_4
                        4 -> R.id.widget_checkbox_5
                        else -> null
                    }
                    
                    val textId = when (i) {
                        0 -> R.id.widget_text_1
                        1 -> R.id.widget_text_2
                        2 -> R.id.widget_text_3
                        3 -> R.id.widget_text_4
                        4 -> R.id.widget_text_5
                        else -> null
                    }
                    
                    val importantId = when (i) {
                        0 -> R.id.widget_important_1
                        1 -> R.id.widget_important_2
                        2 -> R.id.widget_important_3
                        3 -> R.id.widget_important_4
                        4 -> R.id.widget_important_5
                        else -> null
                    }

                    if (checkboxId != null && textId != null && importantId != null) {
                        views.setBoolean(checkboxId, "setChecked", task.completed)
                        views.setTextViewText(textId, task.text)
                        
                        // Зачеркиваем текст если задача выполнена
                        if (task.completed) {
                            views.setInt(textId, "setPaintFlags", Paint.STRIKE_THRU_TEXT_FLAG or Paint.ANTI_ALIAS_FLAG)
                            views.setTextColor(textId, ContextCompat.getColor(context, android.R.color.darker_gray))
                        } else {
                            views.setInt(textId, "setPaintFlags", Paint.ANTI_ALIAS_FLAG)
                            views.setTextColor(textId, ContextCompat.getColor(context, android.R.color.black))
                        }
                        
                        // Показываем/скрываем индикатор важности
                        if (task.important) {
                            views.setViewVisibility(importantId, View.VISIBLE)
                        } else {
                            views.setViewVisibility(importantId, View.GONE)
                        }
                        
                        // Устанавливаем обработчик клика для переключения задачи
                        val toggleIntent = Intent(context, TodoAppWidgetProvider::class.java).apply {
                            action = "com.todo.widget.TOGGLE_TASK"
                            putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, appWidgetId)
                            putExtra("task_id", task.id)
                        }
                        val pendingIntent = android.app.PendingIntent.getBroadcast(
                            context,
                            task.id.hashCode(),
                            toggleIntent,
                            android.app.PendingIntent.FLAG_UPDATE_CURRENT or android.app.PendingIntent.FLAG_IMMUTABLE
                        )
                        views.setOnClickPendingIntent(checkboxId, pendingIntent)
                        views.setOnClickPendingIntent(textId, pendingIntent)
                    }
                } else if (taskLayoutId != null) {
                    views.setViewVisibility(taskLayoutId, View.GONE)
                }
            }
        }

        // Обработчик клика для открытия приложения
        val openAppIntent = context.packageManager.getLaunchIntentForPackage(context.packageName)
        val pendingIntent = android.app.PendingIntent.getActivity(
            context,
            0,
            openAppIntent,
            android.app.PendingIntent.FLAG_UPDATE_CURRENT or android.app.PendingIntent.FLAG_IMMUTABLE
        )
        views.setOnClickPendingIntent(R.id.widget_title, pendingIntent)

        appWidgetManager.updateAppWidget(appWidgetId, views)
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

