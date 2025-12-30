package com.todo.widget

import org.json.JSONArray
import org.json.JSONObject

data class Task(
    val id: String,
    val text: String,
    val completed: Boolean,
    val important: Boolean,
    val day: String
) {
    fun toJson(): JSONObject {
        return JSONObject().apply {
            put("id", id)
            put("text", text)
            put("completed", completed)
            put("important", important)
            put("day", day)
        }
    }

    companion object {
        fun fromJson(json: JSONObject): Task? {
            return try {
                Task(
                    id = json.optString("id", "").takeIf { it.isNotEmpty() } ?: return null,
                    text = json.optString("text", "").takeIf { it.isNotEmpty() } ?: return null,
                    completed = json.optBoolean("completed", false),
                    important = json.optBoolean("important", false),
                    day = json.optString("day", "").takeIf { it.isNotEmpty() } ?: return null
                )
            } catch (e: Exception) {
                null
            }
        }
    }
}

object TaskUtils {
    private const val PREFS_NAME = "todo_widget_prefs"
    private const val KEY_TASKS = "tasks"
    private const val KEY_LAST_UPDATE = "last_update"

    fun saveTasks(context: android.content.Context, tasks: List<Task>) {
        val prefs = context.getSharedPreferences(PREFS_NAME, android.content.Context.MODE_PRIVATE)
        val jsonArray = JSONArray()
        tasks.forEach { task ->
            jsonArray.put(task.toJson())
        }
        prefs.edit()
            .putString(KEY_TASKS, jsonArray.toString())
            .putLong(KEY_LAST_UPDATE, System.currentTimeMillis())
            .apply()
    }

    fun loadTasks(context: android.content.Context): List<Task> {
        val prefs = context.getSharedPreferences(PREFS_NAME, android.content.Context.MODE_PRIVATE)
        val tasksJson = prefs.getString(KEY_TASKS, null) ?: return emptyList()
        
        return try {
            val jsonArray = JSONArray(tasksJson)
            val tasks = mutableListOf<Task>()
            for (i in 0 until jsonArray.length()) {
                val task = Task.fromJson(jsonArray.getJSONObject(i))
                if (task != null) {
                    tasks.add(task)
                }
            }
            tasks
        } catch (e: Exception) {
            emptyList()
        }
    }

    fun getTodayTasks(context: android.content.Context): List<Task> {
        val allTasks = loadTasks(context)
        val today = getTodayDayName()
        return allTasks.filter { it.day == today }
    }

    fun toggleTask(context: android.content.Context, taskId: String): Boolean {
        val tasks = loadTasks(context).toMutableList()
        val taskIndex = tasks.indexOfFirst { it.id == taskId }
        if (taskIndex != -1) {
            val task = tasks[taskIndex]
            tasks[taskIndex] = task.copy(completed = !task.completed)
            saveTasks(context, tasks)
            return true
        }
        return false
    }

    private fun getTodayDayName(): String {
        val calendar = java.util.Calendar.getInstance()
        val dayOfWeek = calendar.get(java.util.Calendar.DAY_OF_WEEK)
        return when (dayOfWeek) {
            java.util.Calendar.MONDAY -> "monday"
            java.util.Calendar.TUESDAY -> "tuesday"
            java.util.Calendar.WEDNESDAY -> "wednesday"
            java.util.Calendar.THURSDAY -> "thursday"
            java.util.Calendar.FRIDAY -> "friday"
            java.util.Calendar.SATURDAY -> "saturday"
            java.util.Calendar.SUNDAY -> "sunday"
            else -> "monday"
        }
    }
}

