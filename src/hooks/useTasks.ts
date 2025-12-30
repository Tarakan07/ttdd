import { useState, useEffect, useCallback } from 'react';
import { DayOfWeek, Task, WeekTasks } from '../types';
import { loadTasks, saveTasks } from '../utils/storage';

/**
 * Хук для управления задачами
 * Все данные автоматически сохраняются в AsyncStorage (локальная база данных)
 * При загрузке приложения данные автоматически восстанавливаются из AsyncStorage
 */
export const useTasks = () => {
  const [weekTasks, setWeekTasks] = useState<WeekTasks>({
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
    sunday: [],
  });
  const [loading, setLoading] = useState(true);

  // Загружаем данные из AsyncStorage при инициализации
  useEffect(() => {
    const initTasks = async () => {
      const tasks = await loadTasks(); // Загрузка из AsyncStorage
      setWeekTasks(tasks);
      setLoading(false);
    };
    initTasks();
  }, []);

  // Добавляет задачу и сохраняет в AsyncStorage
  const addTask = useCallback(
    async (day: DayOfWeek, task: Task) => {
      setWeekTasks(prevTasks => {
        const newTasks = {
          ...prevTasks,
          [day]: [...prevTasks[day], task],
        };
        saveTasks(newTasks).catch(() => {
          console.error('Failed to save tasks to AsyncStorage');
        });
        return newTasks;
      });
    },
    [],
  );

  // Обновляет задачу и сохраняет в AsyncStorage
  const updateTask = useCallback(
    async (day: DayOfWeek, task: Task) => {
      setWeekTasks(prevTasks => {
        const newTasks = {
          ...prevTasks,
          [day]: prevTasks[day].map(t => (t.id === task.id ? task : t)),
        };
        saveTasks(newTasks).catch(() => {
          console.error('Failed to save tasks to AsyncStorage');
        });
        return newTasks;
      });
    },
    [],
  );

  // Удаляет задачу и сохраняет в AsyncStorage
  const deleteTask = useCallback(
    async (day: DayOfWeek, taskId: string) => {
      setWeekTasks(prevTasks => {
        const newTasks = {
          ...prevTasks,
          [day]: prevTasks[day].filter(t => t.id !== taskId),
        };
        saveTasks(newTasks).catch(() => {
          console.error('Failed to save tasks to AsyncStorage');
        });
        return newTasks;
      });
    },
    [],
  );

  // Переключает статус выполнения задачи и сохраняет в AsyncStorage
  const toggleTask = useCallback(
    async (day: DayOfWeek, taskId: string) => {
      setWeekTasks(prevTasks => {
        const newTasks = {
          ...prevTasks,
          [day]: prevTasks[day].map(t =>
            t.id === taskId ? { ...t, completed: !t.completed } : t,
          ),
        };
        saveTasks(newTasks).catch(() => {
          console.error('Failed to save tasks to AsyncStorage');
        });
        return newTasks;
      });
    },
    [],
  );

  return {
    weekTasks,
    loading,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
  };
};

