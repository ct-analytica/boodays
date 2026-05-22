import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { ColorScheme, PIXEL_FONT } from '../constants/theme';

const WORK_SECS = 25 * 60;
const BREAK_SECS = 5 * 60;
const DOT_COUNT = 10;

type Mode = 'work' | 'break';

const createStyles = (c: ColorScheme) =>
  StyleSheet.create({
    container: { alignItems: 'center', paddingVertical: 12 },
    modeLabel: {
      fontFamily: PIXEL_FONT,
      fontSize: 8,
      color: c.gold,
      letterSpacing: 2,
      marginBottom: 12,
    },
    dotsRow: { flexDirection: 'row', gap: 6, marginBottom: 14 },
    dot: { width: 10, height: 10 },
    dotEmpty: { backgroundColor: c.bgCardLight, borderWidth: 1, borderColor: c.border },
    dotWork: { backgroundColor: c.pink },
    dotBreak: { backgroundColor: c.teal },
    time: {
      fontFamily: PIXEL_FONT,
      fontSize: 36,
      color: c.white,
      letterSpacing: 3,
      marginBottom: 16,
      textShadowColor: c.purple,
      textShadowOffset: { width: 3, height: 3 },
      textShadowRadius: 0,
    },
    btns: { flexDirection: 'row', gap: 12 },
    btn: { paddingHorizontal: 16, paddingVertical: 10, borderWidth: 3 },
    btnStart: { backgroundColor: c.purple, borderColor: c.purpleLight },
    btnPause: { backgroundColor: c.pinkLight, borderColor: c.pink },
    btnReset: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderWidth: 3,
      backgroundColor: c.bgCard,
      borderColor: c.border,
    },
    btnText: { fontFamily: PIXEL_FONT, fontSize: 8, color: c.white },
  });

export const PomodoroTimer: React.FC = () => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [mode, setMode] = useState<Mode>('work');
  const [seconds, setSeconds] = useState(WORK_SECS);
  const [running, setRunning] = useState(false);

  const secondsRef = useRef(seconds);
  const modeRef = useRef(mode);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  secondsRef.current = seconds;
  modeRef.current = mode;

  useEffect(() => {
    if (!running) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      if (secondsRef.current <= 1) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        const next: Mode = modeRef.current === 'work' ? 'break' : 'work';
        setMode(next);
        setSeconds(next === 'work' ? WORK_SECS : BREAK_SECS);
        setRunning(false);
      } else {
        setSeconds(s => s - 1);
      }
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  const toggle = () => setRunning(r => !r);
  const reset = () => {
    setRunning(false);
    setMode('work');
    setSeconds(WORK_SECS);
  };

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');
  const total = mode === 'work' ? WORK_SECS : BREAK_SECS;
  const filled = Math.round(((total - seconds) / total) * DOT_COUNT);

  return (
    <View style={styles.container}>
      <Text style={styles.modeLabel}>{mode === 'work' ? '* FOCUS *' : '~ BREAK ~'}</Text>
      <View style={styles.dotsRow}>
        {Array.from({ length: DOT_COUNT }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i < filled
                ? mode === 'work'
                  ? styles.dotWork
                  : styles.dotBreak
                : styles.dotEmpty,
            ]}
          />
        ))}
      </View>
      <Text style={styles.time}>{mm}:{ss}</Text>
      <View style={styles.btns}>
        <TouchableOpacity
          style={[styles.btn, running ? styles.btnPause : styles.btnStart]}
          onPress={toggle}
        >
          <Text style={styles.btnText}>{running ? 'PAUSE' : 'START'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnReset} onPress={reset}>
          <Text style={styles.btnText}>RESET</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
