import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Habit, DailyRecord } from '../types';
import { getTodayEST } from '../utils/dateUtils';

const POOL_KEY    = '@boodays_habit_pool';
const HISTORY_KEY = '@boodays_history_v2';
const MAX_HISTORY = 90;

const DEFAULT_POOL: Habit[] = [
  { id: 'h1', name: 'leatherworking' },
  { id: 'h2', name: 'woodworking' },
  { id: 'h3', name: 'flash cards' },
  { id: 'h4', name: 'read' },
  { id: 'h5', name: 'research interest' },
];

interface HabitCtx {
  pool: Habit[];
  todayRecord: DailyRecord | null;
  history: DailyRecord[];
  addHabit: (name: string) => Promise<void>;
  removeHabit: (id: string) => Promise<void>;
  setTodaySelected: (ids: string[]) => Promise<void>;
  toggleComplete: (id: string) => Promise<void>;
}

const HabitContext = createContext<HabitCtx>({} as HabitCtx);

const upsertHistory = (history: DailyRecord[], record: DailyRecord): DailyRecord[] => {
  const idx = history.findIndex(r => r.date === record.date);
  const next = idx >= 0
    ? history.map((r, i) => i === idx ? record : r)
    : [record, ...history];
  return next.slice(0, MAX_HISTORY);
};

export const HabitProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pool, setPool]       = useState<Habit[]>(DEFAULT_POOL);
  const [history, setHistory] = useState<DailyRecord[]>([]);

  const today = getTodayEST();
  const todayRecord = history.find(r => r.date === today) ?? null;

  useEffect(() => {
    (async () => {
      const [p, h] = await Promise.all([
        AsyncStorage.getItem(POOL_KEY),
        AsyncStorage.getItem(HISTORY_KEY),
      ]);
      if (p) setPool(JSON.parse(p));
      if (h) setHistory(JSON.parse(h));
    })();
  }, []);

  const savePool = useCallback(async (next: Habit[]) => {
    setPool(next);
    await AsyncStorage.setItem(POOL_KEY, JSON.stringify(next));
  }, []);

  const saveHistory = useCallback(async (next: DailyRecord[]) => {
    setHistory(next);
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  }, []);

  const addHabit = useCallback(async (name: string) => {
    const next = [...pool, { id: Date.now().toString(), name: name.trim() }];
    await savePool(next);
  }, [pool, savePool]);

  const removeHabit = useCallback(async (id: string) => {
    await savePool(pool.filter(h => h.id !== id));
  }, [pool, savePool]);

  const setTodaySelected = useCallback(async (ids: string[]) => {
    const record: DailyRecord = {
      date: today,
      selectedIds: ids,
      completedIds: todayRecord?.completedIds.filter(c => ids.includes(c)) ?? [],
    };
    await saveHistory(upsertHistory(history, record));
  }, [today, todayRecord, history, saveHistory]);

  const toggleComplete = useCallback(async (id: string) => {
    if (!todayRecord) return;
    const completedIds = todayRecord.completedIds.includes(id)
      ? todayRecord.completedIds.filter(c => c !== id)
      : [...todayRecord.completedIds, id];
    await saveHistory(upsertHistory(history, { ...todayRecord, completedIds }));
  }, [todayRecord, history, saveHistory]);

  return (
    <HabitContext.Provider value={{ pool, todayRecord, history, addHabit, removeHabit, setTodaySelected, toggleComplete }}>
      {children}
    </HabitContext.Provider>
  );
};

export const useHabits = () => useContext(HabitContext);
