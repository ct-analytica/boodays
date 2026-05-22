import React, { useState, useEffect, useMemo } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { ColorScheme, PIXEL_FONT } from '../constants/theme';

const getESTTime = () =>
  new Date().toLocaleTimeString('en-US', {
    timeZone: 'America/New_York',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

const getESTDate = () =>
  new Date().toLocaleDateString('en-US', {
    timeZone: 'America/New_York',
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

const createStyles = (c: ColorScheme) =>
  StyleSheet.create({
    container: { alignItems: 'center', paddingVertical: 16 },
    time: {
      fontFamily: PIXEL_FONT,
      fontSize: 28,
      color: c.white,
      letterSpacing: 2,
      textShadowColor: c.purple,
      textShadowOffset: { width: 2, height: 2 },
      textShadowRadius: 0,
    },
    date: {
      fontFamily: PIXEL_FONT,
      fontSize: 7,
      color: c.purpleLight,
      marginTop: 12,
      letterSpacing: 1,
    },
    tz: {
      fontFamily: PIXEL_FONT,
      fontSize: 8,
      color: c.pink,
      marginTop: 6,
      letterSpacing: 4,
    },
  });

export const Clock: React.FC = () => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [time, setTime] = useState(getESTTime);
  const [date, setDate] = useState(getESTDate);

  useEffect(() => {
    const id = setInterval(() => {
      setTime(getESTTime());
      setDate(getESTDate());
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.time}>{time}</Text>
      <Text style={styles.date}>{date}</Text>
      <Text style={styles.tz}>EST</Text>
    </View>
  );
};
