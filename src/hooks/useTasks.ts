import { useState, useEffect, useCallback } from 'react';
import { DayOfWeek, Task, WeekTasks } from '../types';
import { loadTasks, saveTasks } from '../utils/storage';
import { useTasksSyncOnActive } from './useTasksSyncOnActive';
import { useWidgetSync } from '../widget/useWidgetSync';

/**
 * Хук для управления задачами
 * Все данные автоматически сохраняются в AsyncStorage (локальная база данных)
 * При загрузке приложения данные автоматически восстанавливаются из AsyncStorage
 */
export const useTasks = () => {
  const { syncTasks } = useWidgetSync((updatedTasks) => {
    // Обновляем состояние при изменении из виджета
    setWeekTasks(updatedTasks);
  });
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

  // Функция для загрузки данных из raw строки (для синхронизации)
  const loadFromRaw = useCallback((raw: string | null) => {
    if (!raw) {
      setWeekTasks({
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
        saturday: [],
        sunday: [],
      });
      return;
    }

    try {
      const parsed = JSON.parse(raw);
      const days: DayOfWeek[] = [
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
        'saturday',
        'sunday',
      ];

      // Валидация структуры
      if (parsed && typeof parsed === 'object' && days.every(day => Array.isArray(parsed[day]))) {
        setWeekTasks(parsed);
      }
    } catch (error) {
      console.error('Error parsing tasks from raw string:', error);
    }
  }, []);

  // Синхронизация при активации приложения
  useTasksSyncOnActive(loadFromRaw);

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
        saveTasks(newTasks)
          .then(() => syncTasks(newTasks))
          .catch(() => {
            console.error('Failed to save tasks to AsyncStorage');
          });
        return newTasks;
      });
    },
    [syncTasks],
  );

  // Обновляет задачу и сохраняет в AsyncStorage
  const updateTask = useCallback(
    async (day: DayOfWeek, task: Task) => {
      setWeekTasks(prevTasks => {
        const newTasks = {
          ...prevTasks,
          [day]: prevTasks[day].map(t => (t.id === task.id ? task : t)),
        };
        saveTasks(newTasks)
          .then(() => syncTasks(newTasks))
          .catch(() => {
            console.error('Failed to save tasks to AsyncStorage');
          });
        return newTasks;
      });
    },
    [syncTasks],
  );

  // Удаляет задачу и сохраняет в AsyncStorage
  const deleteTask = useCallback(
    async (day: DayOfWeek, taskId: string) => {
      setWeekTasks(prevTasks => {
        const newTasks = {
          ...prevTasks,
          [day]: prevTasks[day].filter(t => t.id !== taskId),
        };
        saveTasks(newTasks)
          .then(() => syncTasks(newTasks))
          .catch(() => {
            console.error('Failed to save tasks to AsyncStorage');
          });
        return newTasks;
      });
    },
    [syncTasks],
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
        saveTasks(newTasks)
          .then(() => syncTasks(newTasks))
          .catch(() => {
            console.error('Failed to save tasks to AsyncStorage');
          });
        return newTasks;
      });
    },
    [syncTasks],
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

