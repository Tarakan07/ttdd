# Виджет для Android

Этот модуль предоставляет функциональность виджета для отображения задач на сегодняшний день.

## Использование

### 1. Интеграция в существующий код

Добавьте синхронизацию с виджетом в ваш хук управления задачами:

```typescript
import { useWidgetSync } from './src/widget/useWidgetSync';

// В вашем useAppLogic или аналогичном хуке:
const { syncTasks } = useWidgetSync();

// При сохранении/изменении задач:
const handleSaveTask = async (task: Task) => {
  // ... ваша логика сохранения в AsyncStorage
  const allTasks = await getAllTasksFromStorage();
  await syncTasks(allTasks); // Синхронизируем с виджетом
};

const handleToggleTask = async (taskId: string) => {
  // ... ваша логика переключения
  const allTasks = await getAllTasksFromStorage();
  await syncTasks(allTasks); // Синхронизируем с виджетом
};
```

### 2. Структура данных задачи

Задача должна иметь следующую структуру:

```typescript
interface Task {
  id: string;
  text: string;
  completed: boolean;
  important: boolean;
  day: string; // 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
}
```

### 3. Автоматическая синхронизация

Виджет автоматически обновляется при:

- Изменении задач в приложении (через `syncTasks`)
- Переключении задачи в виджете (автоматически синхронизируется обратно в приложение)

## Добавление виджета на домашний экран

1. Долгий тап на домашнем экране Android
2. Выберите "Виджеты"
3. Найдите "ToDo"
4. Перетащите виджет на домашний экран

## Особенности

- Виджет показывает только задачи на сегодняшний день
- Максимум 5 задач отображается в виджете
- Можно отмечать задачи как выполненные прямо в виджете
- Показываются пометки важных задач (звездочка)
- Изменения синхронизируются в обе стороны
