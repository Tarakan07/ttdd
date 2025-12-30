import React, { useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ListRenderItem } from 'react-native';
import { Task } from '../types';
import { TaskItem } from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  onToggle: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onToggle,
  onEdit,
  onDelete,
}) => {
  const keyExtractor = useCallback((item: Task) => item.id, []);

  const renderItem = useCallback<ListRenderItem<Task>>(
    ({ item }) => (
      <TaskItem
        task={item}
        onToggle={onToggle}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    ),
    [onToggle, onEdit, onDelete],
  );

  if (tasks.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Нет задач на этот день</Text>
        <Text style={styles.emptySubtext}>Добавьте задачу, нажав кнопку ниже</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={tasks}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      contentContainerStyle={styles.list}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#bbb',
  },
});

