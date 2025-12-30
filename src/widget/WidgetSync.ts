import { NativeModules, DeviceEventEmitter } from 'react-native';

const { WidgetSync } = NativeModules;

export interface WidgetTask {
  id: string;
  text: string;
  completed: boolean;
  important: boolean;
  day: string;
}

class WidgetSyncModule {
  constructor() {
    // DeviceEventEmitter используется напрямую в addTaskUpdateListener
  }

  /**
   * Синхронизирует все задачи с виджетом
   */
  async syncTasks(tasks: WidgetTask[]): Promise<boolean> {
    if (!WidgetSync) {
      console.warn('WidgetSync module is not available');
      return false;
    }
    try {
      return await WidgetSync.syncTasks(tasks);
    } catch (error) {
      console.error('Error syncing tasks to widget:', error);
      return false;
    }
  }

  /**
   * Переключает статус выполнения задачи
   */
  async toggleTask(taskId: string): Promise<boolean> {
    if (!WidgetSync) {
      console.warn('WidgetSync module is not available');
      return false;
    }
    try {
      return await WidgetSync.toggleTask(taskId);
    } catch (error) {
      console.error('Error toggling task in widget:', error);
      return false;
    }
  }

  /**
   * Получает задачи на сегодня из виджета
   */
  async getTodayTasks(): Promise<WidgetTask[]> {
    if (!WidgetSync) {
      console.warn('WidgetSync module is not available');
      return [];
    }
    try {
      return await WidgetSync.getTodayTasks();
    } catch (error) {
      console.error('Error getting today tasks from widget:', error);
      return [];
    }
  }

  /**
   * Подписывается на события обновления задач из виджета
   */
  addTaskUpdateListener(callback: (taskId: string) => void) {
    const subscription = DeviceEventEmitter.addListener('TaskUpdated', (data: { taskId: string }) => {
      callback(data.taskId);
    });
    return subscription;
  }
}

export default new WidgetSyncModule();

