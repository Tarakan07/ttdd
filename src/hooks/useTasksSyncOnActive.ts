import { AppState } from "react-native";
import { getWidgetTasksJson } from "../native/WidgetTasksModule";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect } from "react";

const STORAGE_KEY = "@weekly_planner_tasks";

export function useTasksSyncOnActive(loadFromStorage: (raw: string | null) => void) {
  useEffect(() => {
    const sub = AppState.addEventListener("change", async (state) => {
      if (state === "active") {
        const widgetRaw = await getWidgetTasksJson();
        if (widgetRaw) {
          await AsyncStorage.setItem(STORAGE_KEY, widgetRaw);
          loadFromStorage(widgetRaw);
          return;
        }
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        loadFromStorage(raw);
      }
    });

    return () => sub.remove();
  }, [loadFromStorage]);
}