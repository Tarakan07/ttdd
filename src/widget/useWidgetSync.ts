import { useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import WidgetSync, { WidgetTask } from './WidgetSync';
import { WeekTasks, DayOfWeek } from '../types';

const TASKS_STORAGE_KEY = '@weekly_planner_tasks';

/**
 * Хук для синхронизации задач с виджетом
 * Используйте этот хук в вашем useAppLogic или аналогичном хуке
 */
// Преобразует WeekTasks в плоский список для виджета
const convertWeekTasksToWidgetTasks = (weekTasks: WeekTasks): WidgetTask[] => {
  const widgetTasks: WidgetTask[] = [];
  const days: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  days.forEach(day => {
    weekTasks[day].forEach(task => {
      widgetTasks.push({
        id: task.id,
        text: task.text,
        completed: task.completed,
        important: task.priority === 'important',
        day: day,
      });
    });
  });

  return widgetTasks;
};

export function useWidgetSync(onTasksUpdated?: (tasks: WeekTasks) => void) {
  // Синхронизирует все задачи с виджетом
  const syncAllTasks = useCallback(async () => {
    try {
      const tasksJson = await AsyncStorage.getItem(TASKS_STORAGE_KEY);
      if (tasksJson) {
        const weekTasks: WeekTasks = JSON.parse(tasksJson);
        const widgetTasks = convertWeekTasksToWidgetTasks(weekTasks);
        await WidgetSync.syncTasks(widgetTasks);
      }
    } catch (error) {
      console.error('Error syncing tasks to widget:', error);
    }
  }, []);

  // Синхронизирует задачи при изменении
  const syncTasks = useCallback(async (weekTasks: WeekTasks) => {
    try {
      // Сохраняем в AsyncStorage
      await AsyncStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(weekTasks));
      // Преобразуем и синхронизируем с виджетом
      const widgetTasks = convertWeekTasksToWidgetTasks(weekTasks);
      await WidgetSync.syncTasks(widgetTasks);
    } catch (error) {
      console.error('Error syncing tasks:', error);
    }
  }, []);

  // Обработка обновления задачи из виджета
  useEffect(() => {
    const subscription = WidgetSync.addTaskUpdateListener(async (taskId: string) => {
      try {
        // Получаем все задачи из AsyncStorage
        const tasksJson = await AsyncStorage.getItem(TASKS_STORAGE_KEY);
        if (tasksJson) {
          const weekTasks: WeekTasks = JSON.parse(tasksJson);
          const days: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

          // Ищем задачу по ID во всех днях
          for (const day of days) {
            const taskIndex = weekTasks[day].findIndex(t => t.id === taskId);
            if (taskIndex !== -1) {
              // Переключаем статус задачи
              weekTasks[day][taskIndex] = {
                ...weekTasks[day][taskIndex],
                completed: !weekTasks[day][taskIndex].completed,
              };
              // Сохраняем обратно
              await AsyncStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(weekTasks));
              // Обновляем виджет
              const widgetTasks = convertWeekTasksToWidgetTasks(weekTasks);
              await WidgetSync.syncTasks(widgetTasks);
              // Уведомляем о обновлении задач
              if (onTasksUpdated) {
                onTasksUpdated(weekTasks);
              }
              break;
            }
          }
        }
      } catch (error) {
        console.error('Error handling widget task update:', error);
      }
    });

    // Синхронизируем при монтировании
    syncAllTasks();

    return () => {
      subscription.remove();
    };
  }, [syncAllTasks, onTasksUpdated]);

  return {
    syncTasks,
    syncAllTasks,
  };
}

