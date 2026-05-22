import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useSchedule } from '../context/ScheduleContext';
import { ColorScheme, PIXEL_FONT } from '../constants/theme';
import { getESTMinutes } from '../utils/dateUtils';

const getUpNext = (entries: { time: string; label: string }[]) => {
  const nowMins = getESTMinutes();
  const sorted = entries
    .map(e => {
      const [h, m] = e.time.split(':').map(Number);
      return { label: e.label, mins: h * 60 + m };
    })
    .filter(e => e.mins > nowMins)
    .sort((a, b) => a.mins - b.mins);

  if (!sorted.length) return null;
  const away = sorted[0].mins - nowMins;
  return { label: sorted[0].label, away };
};

const fmtCountdown = (mins: number): string => {
  if (mins < 1) return 'now!';
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
};

const createStyles = (c: ColorScheme) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.bgCard,
      borderWidth: 2,
      borderColor: c.borderAccent,
      paddingHorizontal: 12,
      paddingVertical: 8,
      gap: 10,
    },
    arrow: { fontFamily: PIXEL_FONT, fontSize: 8, color: c.gold },
    label: { fontFamily: PIXEL_FONT, fontSize: 7, color: c.text, flex: 1 },
    time: { fontFamily: PIXEL_FONT, fontSize: 8, color: c.gold },
    done: { fontFamily: PIXEL_FONT, fontSize: 7, color: c.teal, textAlign: 'center', paddingVertical: 6 },
  });

export const UpNext: React.FC = () => {
  const { colors } = useTheme();
  const { todayEntries } = useSchedule();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [info, setInfo] = useState(() => getUpNext(todayEntries));

  useEffect(() => {
    setInfo(getUpNext(todayEntries));
    const id = setInterval(() => setInfo(getUpNext(todayEntries)), 30_000);
    return () => clearInterval(id);
  }, [todayEntries]);

  if (!info) {
    return <Text style={styles.done}>✦ ALL DONE FOR TODAY ✦</Text>;
  }

  return (
    <View style={styles.row}>
      <Text style={styles.arrow}>▶</Text>
      <Text style={styles.label} numberOfLines={1}>{info.label}</Text>
      <Text style={styles.time}>in {fmtCountdown(info.away)}</Text>
    </View>
  );
};
