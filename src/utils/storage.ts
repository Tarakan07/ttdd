import AsyncStorage from '@react-native-async-storage/async-storage';
import { WeekTasks, DayOfWeek } from '../types';
import { updateWidget } from '../native/WidgetUpdateModule';
import { getWidgetTasksJson, setWidgetTasksJson } from '../native/WidgetTasksModule';

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
    // 1) Пытаемся прочитать из нативного хранилища виджета (Android)
    const widgetJson = await getWidgetTasksJson();
    if (widgetJson) {
      const parsed = JSON.parse(widgetJson);
      if (validateWeekTasks(parsed)) {
        // держим AsyncStorage в синке, чтобы апп всегда работал даже без виджета
        await AsyncStorage.setItem(STORAGE_KEY, widgetJson);
        return parsed;
      }
    }

    // 2) Фолбэк: обычный AsyncStorage
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (validateWeekTasks(parsed)) {
        // синкаем виджет стор, чтобы виджет мог читать без доступа к внутренностям AsyncStorage
        await setWidgetTasksJson(data);
        return parsed;
      } else {
        console.warn('Invalid data structure, using empty tasks');
      }
    }
  } catch (error) {
    console.error('Error loading tasks:', error);
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
    // Сначала синкаем нативный стор виджета (Android)
    await setWidgetTasksJson(jsonData);
    // Обновляем виджет после сохранения
    updateWidget();
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
    await setWidgetTasksJson(JSON.stringify(createEmptyWeekTasks()));
    updateWidget();
  } catch (error) {
    console.error('Error clearing tasks from storage:', error);
  }
};

