import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Modal,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Task, TaskPriority } from '../types';

interface TaskModalProps {
  visible: boolean;
  task: Task | null;
  onSave: (task: Task) => void;
  onClose: () => void;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  visible,
  task,
  onSave,
  onClose,
}) => {
  const [text, setText] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('normal');

  useEffect(() => {
    if (task) {
      setText(task.text);
      setPriority(task.priority);
    } else {
      setText('');
      setPriority('normal');
    }
  }, [task, visible]);

  const handleSave = useCallback(() => {
    if (text.trim()) {
      onSave({
        id: task?.id || Date.now().toString(),
        text: text.trim(),
        priority,
        completed: task?.completed || false,
      });
      setText('');
      setPriority('normal');
    }
  }, [text, priority, task, onSave]);

  const handleSetNormal = useCallback(() => {
    setPriority('normal');
  }, []);

  const handleSetImportant = useCallback(() => {
    setPriority('important');
  }, []);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalContainer}>
        <SafeAreaView edges={['bottom']} style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            {task ? 'Редактировать задачу' : 'Новая задача'}
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Введите текст задачи..."
            value={text}
            onChangeText={setText}
            multiline
            autoFocus
          />

          <View style={styles.priorityContainer}>
            <Text style={styles.priorityLabel}>Приоритет:</Text>
            <View style={styles.priorityButtons}>
              <TouchableOpacity
                style={[
                  styles.priorityButton,
                  priority === 'normal' && styles.priorityButtonSelected,
                ]}
                onPress={handleSetNormal}>
                <Text
                  style={[
                    styles.priorityButtonText,
                    priority === 'normal' && styles.priorityButtonTextSelected,
                  ]}>
                  Обычная
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.priorityButton,
                  priority === 'important' && styles.priorityButtonSelected,
                  priority === 'important' && styles.priorityButtonImportant,
                ]}
                onPress={handleSetImportant}>
                <Text
                  style={[
                    styles.priorityButtonText,
                    priority === 'important' && styles.priorityButtonTextSelected,
                  ]}>
                  Важная
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}>
              <Text style={styles.cancelButtonText}>Отмена</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleSave}>
              <Text style={styles.saveButtonText}>Сохранить</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  priorityContainer: {
    marginBottom: 24,
  },
  priorityLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  priorityButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  priorityButton: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  priorityButtonSelected: {
    borderColor: '#6366f1',
    backgroundColor: '#6366f1',
  },
  priorityButtonImportant: {
    borderColor: '#ef4444',
    backgroundColor: '#ef4444',
  },
  priorityButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  priorityButtonTextSelected: {
    color: '#fff',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  saveButton: {
    backgroundColor: '#6366f1',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

