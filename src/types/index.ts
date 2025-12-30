export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export type TaskPriority = 'important' | 'normal';

export interface Task {
  id: string;
  text: string;
  priority: TaskPriority;
  completed: boolean;
}

export interface DayTasks {
  day: DayOfWeek;
  tasks: Task[];
}

export type WeekTasks = {
  [key in DayOfWeek]: Task[];
};

