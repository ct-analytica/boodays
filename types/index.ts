export interface Entry {
  id: string;
  time: string;
  label: string;
}

export interface Habit {
  id: string;
  name: string;
}

export interface DailyRecord {
  date: string;          // 'YYYY-MM-DD' in EST
  selectedIds: string[]; // which habits the user chose to focus on
  completedIds: string[]; // which were checked off
}
