import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { DayOfWeek } from '../types';
import { DAY_SHORT_NAMES } from '../utils/constants';

interface DaySelectorProps {
  selectedDay: DayOfWeek;
  onSelectDay: (day: DayOfWeek) => void;
}

const DAYS: DayOfWeek[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

export const DaySelector: React.FC<DaySelectorProps> = ({
  selectedDay,
  onSelectDay,
}) => {
  return (
    <View style={styles.container}>
      {DAYS.map(day => (
        <DayButton
          key={day}
          day={day}
          isSelected={selectedDay === day}
          onSelect={onSelectDay}
        />
      ))}
    </View>
  );
};

interface DayButtonProps {
  day: DayOfWeek;
  isSelected: boolean;
  onSelect: (day: DayOfWeek) => void;
}

const DayButton: React.FC<DayButtonProps> = ({ day, isSelected, onSelect }) => {
  const handlePress = useCallback(() => {
    onSelect(day);
  }, [day, onSelect]);

  return (
    <TouchableOpacity
      style={[styles.dayButton, isSelected && styles.dayButtonSelected]}
      onPress={handlePress}>
      <Text
        style={[styles.dayText, isSelected && styles.dayTextSelected]}>
        {DAY_SHORT_NAMES[day]}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    gap: 4,
  },
  dayButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  dayButtonSelected: {
    backgroundColor: '#6366f1',
  },
  dayText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  dayTextSelected: {
    color: '#fff',
  },
});

