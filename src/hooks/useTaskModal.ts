import { useState, useCallback } from 'react';
import { Task } from '../types';

export const useTaskModal = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const openModal = useCallback((task: Task | null = null) => {
    setEditingTask(task);
    setModalVisible(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalVisible(false);
    setEditingTask(null);
  }, []);

  return {
    modalVisible,
    editingTask,
    openModal,
    closeModal,
  };
};

