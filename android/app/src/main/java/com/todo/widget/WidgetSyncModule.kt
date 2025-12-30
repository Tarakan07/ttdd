package com.todo.widget

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap
import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Intent
import android.content.Context

class WidgetSyncModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    
    companion object {
        private var instance: WidgetSyncModule? = null
        
        fun sendTaskUpdateEvent(context: Context, taskId: String) {
            instance?.sendEvent(taskId)
        }
    }
    
    init {
        instance = this
    }

    override fun getName(): String {
        return "WidgetSync"
    }

    @ReactMethod
    fun syncTasks(tasks: ReadableArray, promise: Promise) {
        try {
            val taskList = mutableListOf<Task>()
            for (i in 0 until tasks.size()) {
                val taskMap = tasks.getMap(i) ?: continue
                val taskId = taskMap.getString("id") ?: continue
                val taskText = taskMap.getString("text") ?: continue
                val taskDay = taskMap.getString("day") ?: continue
                
                // Пропускаем задачи с пустыми обязательными полями
                if (taskId.isEmpty() || taskText.isEmpty() || taskDay.isEmpty()) {
                    android.util.Log.w("WidgetSyncModule", "Skipping task with empty required fields")
                    continue
                }
                
                val task = Task(
                    id = taskId,
                    text = taskText,
                    completed = taskMap.getBoolean("completed"),
                    important = taskMap.getBoolean("important"),
                    day = taskDay
                )
                taskList.add(task)
            }
            
            android.util.Log.d("WidgetSyncModule", "Syncing ${taskList.size} tasks to widget")
            TaskUtils.saveTasks(reactApplicationContext, taskList)
            // Обновляем виджет асинхронно, чтобы не блокировать UI
            android.os.Handler(android.os.Looper.getMainLooper()).postDelayed({
                updateWidget()
            }, 100) // Небольшая задержка для избежания конфликтов
            promise.resolve(true)
        } catch (e: Exception) {
            android.util.Log.e("WidgetSyncModule", "Error syncing tasks", e)
            promise.reject("SYNC_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun toggleTask(taskId: String, promise: Promise) {
        try {
            val success = TaskUtils.toggleTask(reactApplicationContext, taskId)
            if (success) {
                updateWidget()
                promise.resolve(true)
            } else {
                promise.reject("TOGGLE_ERROR", "Task not found")
            }
        } catch (e: Exception) {
            promise.reject("TOGGLE_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun getTodayTasks(promise: Promise) {
        try {
            val tasks = TaskUtils.getTodayTasks(reactApplicationContext)
            val tasksArray = com.facebook.react.bridge.Arguments.createArray()
            tasks.forEach { task ->
                val taskMap = com.facebook.react.bridge.Arguments.createMap()
                taskMap.putString("id", task.id)
                taskMap.putString("text", task.text)
                taskMap.putBoolean("completed", task.completed)
                taskMap.putBoolean("important", task.important)
                taskMap.putString("day", task.day)
                tasksArray.pushMap(taskMap)
            }
            promise.resolve(tasksArray)
        } catch (e: Exception) {
            promise.reject("GET_TASKS_ERROR", e.message, e)
        }
    }

    private fun updateWidget() {
        try {
            val intent = Intent(reactApplicationContext, TodoAppWidgetProvider::class.java).apply {
                action = AppWidgetManager.ACTION_APPWIDGET_UPDATE
            }
            val ids = AppWidgetManager.getInstance(reactApplicationContext)
                .getAppWidgetIds(ComponentName(reactApplicationContext, TodoAppWidgetProvider::class.java))
            if (ids.isNotEmpty()) {
                intent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, ids)
                reactApplicationContext.sendBroadcast(intent)
                android.util.Log.d("WidgetSyncModule", "Widget update broadcast sent for ${ids.size} widgets")
            } else {
                android.util.Log.d("WidgetSyncModule", "No widgets to update")
            }
        } catch (e: Exception) {
            android.util.Log.e("WidgetSyncModule", "Error updating widget", e)
        }
    }
    
    private fun sendEvent(taskId: String) {
        val params: WritableMap = Arguments.createMap().apply {
            putString("taskId", taskId)
        }
        reactApplicationContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit("TaskUpdated", params)
    }
}

