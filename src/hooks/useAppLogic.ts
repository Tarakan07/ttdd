import { useCallback, useMemo } from 'react';
import { DayOfWeek, Task } from '../types';
import { useTasks } from './useTasks';
import { useTaskModal } from './useTaskModal';

/**
 * Хук для управления логикой главного экрана приложения
 * Объединяет логику задач и модального окна
 */
export const useAppLogic = (selectedDay: DayOfWeek) => {
  const { weekTasks, addTask, updateTask, deleteTask, toggleTask } = useTasks();
  const { modalVisible, editingTask, openModal, closeModal } = useTaskModal();

  const currentTasks = useMemo(
    () => weekTasks[selectedDay],
    [weekTasks, selectedDay],
  );

  const handleAddTask = useCallback(() => {
    openModal(null);
  }, [openModal]);

  const handleEditTask = useCallback(
    (task: Task) => {
      openModal(task);
    },
    [openModal],
  );

  const handleSaveTask = useCallback(
    (task: Task) => {
      if (editingTask) {
        updateTask(selectedDay, task);
      } else {
        addTask(selectedDay, task);
      }
      closeModal();
    },
    [editingTask, selectedDay, addTask, updateTask, closeModal],
  );

  const handleDeleteTask = useCallback(
    (taskId: string) => {
      deleteTask(selectedDay, taskId);
    },
    [selectedDay, deleteTask],
  );

  const handleToggleTask = useCallback(
    (taskId: string) => {
      toggleTask(selectedDay, taskId);
    },
    [selectedDay, toggleTask],
  );

  return {
    currentTasks,
    modalVisible,
    editingTask,
    handleAddTask,
    handleEditTask,
    handleSaveTask,
    handleDeleteTask,
    handleToggleTask,
    closeModal,
  };
};

