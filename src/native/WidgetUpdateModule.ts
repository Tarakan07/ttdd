import { NativeModules } from 'react-native';

const { WidgetUpdateModule } = NativeModules;

export const updateWidget = (): void => {
  if (WidgetUpdateModule) {
    WidgetUpdateModule.updateWidget();
  }
};

