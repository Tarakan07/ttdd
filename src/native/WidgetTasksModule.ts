import { NativeModules, Platform } from 'react-native';

type WidgetTasksModuleType = {
  setTasksJson: (json: string) => void;
  getTasksJson: () => Promise<string | null>;
};

const mod = NativeModules.WidgetTasksModule as WidgetTasksModuleType | undefined;

export const setWidgetTasksJson = async (json: string): Promise<void> => {
  if (Platform.OS !== 'android') return;
  if (!mod?.setTasksJson) return;
  try {
    mod.setTasksJson(json);
  } catch {
    // ignore
  }
};

export const getWidgetTasksJson = async (): Promise<string | null> => {
  if (Platform.OS !== 'android') return null;
  if (!mod?.getTasksJson) return null;
  try {
    return await mod.getTasksJson();
  } catch {
    return null;
  }
};
