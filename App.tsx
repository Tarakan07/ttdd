import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { DayOfWeek } from './src/types';
import { DAY_NAMES } from './src/utils/constants';
import { DaySelector } from './src/components/DaySelector';
import { TaskList } from './src/components/TaskList';
import { TaskModal } from './src/components/TaskModal';
import { useAppLogic } from './src/hooks/useAppLogic';

const App: React.FC = () => {
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('monday');

  const {
    currentTasks,
    modalVisible,
    editingTask,
    handleAddTask,
    handleEditTask,
    handleSaveTask,
    handleDeleteTask,
    handleToggleTask,
    closeModal,
  } = useAppLogic(selectedDay);

  const handleSelectDay = useCallback((day: DayOfWeek) => {
    setSelectedDay(day);
  }, []);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
        <View style={styles.header}>
          <Text style={styles.title}>Еженедельник</Text>
          <Text style={styles.subtitle}>{DAY_NAMES[selectedDay]}</Text>
        </View>

        <DaySelector
          selectedDay={selectedDay}
          onSelectDay={handleSelectDay}
        />

        <TaskList
          tasks={currentTasks}
          onToggle={handleToggleTask}
          onEdit={handleEditTask}
          onDelete={handleDeleteTask}
        />

        <SafeAreaView edges={['bottom']} style={styles.addButtonContainer}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddTask}
            activeOpacity={0.8}>
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </SafeAreaView>

        <TaskModal
          visible={modalVisible}
          task={editingTask}
          onSave={handleSaveTask}
          onClose={closeModal}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    paddingTop: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 18,
    color: '#6366f1',
    fontWeight: '600',
  },
  addButtonContainer: {
    position: 'absolute',
    right: 20,
    bottom: 0,
  },
  addButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#6366f1',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  addButtonText: {
    fontSize: 32,
    color: '#fff',
    fontWeight: '300',
    lineHeight: 36,
  },
});

export default App;

