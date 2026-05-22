import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { ColorScheme, PIXEL_FONT } from '../constants/theme';
import { getESTMinutes } from '../utils/dateUtils';

const DAY_START = 5 * 60 + 30;  // 05:30
const DAY_END   = 23 * 60;      // 23:00
const BLOCKS    = 20;

const getProgress = () => {
  const mins = getESTMinutes();
  return Math.min(1, Math.max(0, (mins - DAY_START) / (DAY_END - DAY_START)));
};

const createStyles = (c: ColorScheme) =>
  StyleSheet.create({
    container: { paddingVertical: 6 },
    row: { flexDirection: 'row', gap: 3 },
    block: { flex: 1, height: 10 },
    blockFilled: { backgroundColor: c.teal },
    blockCurrent: { backgroundColor: c.gold },
    blockEmpty: { backgroundColor: c.bgCardLight, borderWidth: 1, borderColor: c.border },
    labels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
    label: { fontFamily: PIXEL_FONT, fontSize: 5, color: c.textMuted },
  });

export const DayProgress: React.FC = () => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [progress, setProgress] = useState(getProgress);

  useEffect(() => {
    const id = setInterval(() => setProgress(getProgress()), 60_000);
    return () => clearInterval(id);
  }, []);

  const filled = Math.floor(progress * BLOCKS);
  const pct = Math.round(progress * 100);

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {Array.from({ length: BLOCKS }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.block,
              i < filled
                ? styles.blockFilled
                : i === filled
                  ? styles.blockCurrent
                  : styles.blockEmpty,
            ]}
          />
        ))}
      </View>
      <View style={styles.labels}>
        <Text style={styles.label}>05:30</Text>
        <Text style={styles.label}>{pct}% through the day</Text>
        <Text style={styles.label}>23:00</Text>
      </View>
    </View>
  );
};
