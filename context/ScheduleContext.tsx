import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Entry } from '../types';
import { isWeekendEST } from '../utils/dateUtils';
import { scheduleAllNotifications } from '../utils/notifications';

const WD_KEY = '@boodays_schedule_weekday';
const WE_KEY = '@boodays_schedule_weekend';

const DEFAULT_WEEKDAY: Entry[] = [
  { id: '1',  time: '05:30', label: 'wake up' },
  { id: '2',  time: '07:30', label: 'arrive at work' },
  { id: '3',  time: '16:00', label: 'leave work' },
  { id: '4',  time: '17:30', label: 'tend to the garden' },
  { id: '5',  time: '18:30', label: 'eat dinner' },
  { id: '6',  time: '19:00', label: 'study' },
  { id: '7',  time: '20:00', label: 'read' },
];

const DEFAULT_WEEKEND: Entry[] = [
  { id: 'w1', time: '07:00', label: 'wake up' },
  { id: 'w2', time: '09:00', label: 'morning coffee' },
  { id: 'w3', time: '10:00', label: 'creative project' },
  { id: 'w4', time: '12:30', label: 'lunch' },
  { id: 'w5', time: '14:00', label: 'outdoor time' },
  { id: 'w6', time: '18:30', label: 'eat dinner' },
  { id: 'w7', time: '20:00', label: 'read' },
];

interface ScheduleCtx {
  weekdayEntries: Entry[];
  weekendEntries: Entry[];
  todayEntries: Entry[];
  isWeekend: boolean;
  notifGranted: boolean;
  requestNotifPermission: () => Promise<void>;
  saveWeekday: (entries: Entry[]) => Promise<void>;
  saveWeekend: (entries: Entry[]) => Promise<void>;
}

const ScheduleContext = createContext<ScheduleCtx>({} as ScheduleCtx);

export const ScheduleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [weekdayEntries, setWeekday] = useState<Entry[]>(DEFAULT_WEEKDAY);
  const [weekendEntries, setWeekend] = useState<Entry[]>(DEFAULT_WEEKEND);
  const [notifGranted, setNotifGranted] = useState(false);
  const weekend = isWeekendEST();
  const todayEntries = weekend ? weekendEntries : weekdayEntries;

  // Refs so callbacks stay stable
  const wdRef = useRef(weekdayEntries);
  const weRef = useRef(weekendEntries);
  const notifRef = useRef(notifGranted);
  wdRef.current = weekdayEntries;
  weRef.current = weekendEntries;
  notifRef.current = notifGranted;

  useEffect(() => {
    (async () => {
      const [wd, we] = await Promise.all([
        AsyncStorage.getItem(WD_KEY),
        AsyncStorage.getItem(WE_KEY),
      ]);
      if (wd) setWeekday(JSON.parse(wd));
      if (we) setWeekend(JSON.parse(we));
      const { status } = await Notifications.getPermissionsAsync();
      setNotifGranted(status === 'granted');
    })();
  }, []);

  const requestNotifPermission = useCallback(async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status === 'granted') {
      setNotifGranted(true);
      await scheduleAllNotifications(wdRef.current, weRef.current);
    }
  }, []);

  const saveWeekday = useCallback(async (entries: Entry[]) => {
    setWeekday(entries);
    wdRef.current = entries;
    await AsyncStorage.setItem(WD_KEY, JSON.stringify(entries));
    if (notifRef.current) await scheduleAllNotifications(entries, weRef.current);
  }, []);

  const saveWeekend = useCallback(async (entries: Entry[]) => {
    setWeekend(entries);
    weRef.current = entries;
    await AsyncStorage.setItem(WE_KEY, JSON.stringify(entries));
    if (notifRef.current) await scheduleAllNotifications(wdRef.current, entries);
  }, []);

  return (
    <ScheduleContext.Provider
      value={{ weekdayEntries, weekendEntries, todayEntries, isWeekend: weekend,
               notifGranted, requestNotifPermission, saveWeekday, saveWeekend }}
    >
      {children}
    </ScheduleContext.Provider>
  );
};

export const useSchedule = () => useContext(ScheduleContext);
