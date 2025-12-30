import AsyncStorage from '@react-native-async-storage/async-storage';
import { WeekTasks, DayOfWeek } from '../types';

const STORAGE_KEY = '@weekly_planner_tasks';

// Валидация структуры данных
const validateWeekTasks = (data: any): data is WeekTasks => {
  if (!data || typeof data !== 'object') {
    return false;
  }
  const days: DayOfWeek[] = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
  ];
  return days.every(day => Array.isArray(data[day]));
};

// Создание пустой структуры данных
const createEmptyWeekTasks = (): WeekTasks => ({
  monday: [],
  tuesday: [],
  wednesday: [],
  thursday: [],
  friday: [],
  saturday: [],
  sunday: [],
});

/**
 * Загружает все задачи из AsyncStorage (локальная база данных)
 */
export const loadTasks = async (): Promise<WeekTasks> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (validateWeekTasks(parsed)) {
        return parsed;
      } else {
        console.warn('Invalid data structure, using empty tasks');
      }
    }
  } catch (error) {
    console.error('Error loading tasks from AsyncStorage:', error);
  }
  return createEmptyWeekTasks();
};

/**
 * Сохраняет все задачи в AsyncStorage (локальная база данных)
 */
export const saveTasks = async (tasks: WeekTasks): Promise<boolean> => {
  try {
    const jsonData = JSON.stringify(tasks);
    await AsyncStorage.setItem(STORAGE_KEY, jsonData);
    return true;
  } catch (error) {
    console.error('Error saving tasks to AsyncStorage:', error);
    return false;
  }
};

/**
 * Очищает все данные из AsyncStorage (для отладки)
 */
export const clearAllTasks = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing tasks from AsyncStorage:', error);
  }
};

