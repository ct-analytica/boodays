import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { useTheme } from '../context/ThemeContext';
import { ColorScheme, PIXEL_FONT } from '../constants/theme';
import { getMoonPhaseIndex, MOON_PHASE_NAMES } from '../utils/dateUtils';

// 8×8 pixel art for each moon phase.
// W = lit  D = dark shadow  _ = transparent (outside disc)
const buildPhases = (W: string, D: string): (string | null)[][][] => {
  const _ = null;
  return [
    // 0 New Moon
    [[_,_,D,D,D,D,_,_],[_,D,D,D,D,D,D,_],[D,D,D,D,D,D,D,D],[D,D,D,D,D,D,D,D],
     [D,D,D,D,D,D,D,D],[D,D,D,D,D,D,D,D],[_,D,D,D,D,D,D,_],[_,_,D,D,D,D,_,_]],
    // 1 Waxing Crescent
    [[_,_,D,D,D,D,_,_],[_,D,D,D,D,D,W,_],[D,D,D,D,D,D,W,W],[D,D,D,D,D,D,W,W],
     [D,D,D,D,D,D,W,W],[D,D,D,D,D,D,W,W],[_,D,D,D,D,D,W,_],[_,_,D,D,D,D,_,_]],
    // 2 First Quarter
    [[_,_,D,D,W,W,_,_],[_,D,D,D,W,W,W,_],[D,D,D,D,W,W,W,W],[D,D,D,D,W,W,W,W],
     [D,D,D,D,W,W,W,W],[D,D,D,D,W,W,W,W],[_,D,D,D,W,W,W,_],[_,_,D,D,W,W,_,_]],
    // 3 Waxing Gibbous
    [[_,_,W,W,W,W,_,_],[_,D,W,W,W,W,W,_],[D,D,W,W,W,W,W,W],[D,D,W,W,W,W,W,W],
     [D,D,W,W,W,W,W,W],[D,D,W,W,W,W,W,W],[_,D,W,W,W,W,W,_],[_,_,W,W,W,W,_,_]],
    // 4 Full Moon
    [[_,_,W,W,W,W,_,_],[_,W,W,W,W,W,W,_],[W,W,W,W,W,W,W,W],[W,W,W,W,W,W,W,W],
     [W,W,W,W,W,W,W,W],[W,W,W,W,W,W,W,W],[_,W,W,W,W,W,W,_],[_,_,W,W,W,W,_,_]],
    // 5 Waning Gibbous
    [[_,_,W,W,W,W,_,_],[_,W,W,W,W,W,D,_],[W,W,W,W,W,W,D,D],[W,W,W,W,W,W,D,D],
     [W,W,W,W,W,W,D,D],[W,W,W,W,W,W,D,D],[_,W,W,W,W,W,D,_],[_,_,W,W,W,W,_,_]],
    // 6 Last Quarter
    [[_,_,W,W,D,D,_,_],[_,W,W,W,D,D,D,_],[W,W,W,W,D,D,D,D],[W,W,W,W,D,D,D,D],
     [W,W,W,W,D,D,D,D],[W,W,W,W,D,D,D,D],[_,W,W,W,D,D,D,_],[_,_,W,W,D,D,_,_]],
    // 7 Waning Crescent
    [[_,_,D,D,D,D,_,_],[_,W,D,D,D,D,D,_],[W,W,D,D,D,D,D,D],[W,W,D,D,D,D,D,D],
     [W,W,D,D,D,D,D,D],[W,W,D,D,D,D,D,D],[_,W,D,D,D,D,D,_],[_,_,D,D,D,D,_,_]],
  ];
};

const MoonSprite: React.FC<{ phase: number; px: number; litColor: string; darkColor: string }> = ({
  phase, px, litColor, darkColor,
}) => {
  const pixels = useMemo(() => buildPhases(litColor, darkColor), [litColor, darkColor]);
  const grid = pixels[phase];
  return (
    <Svg width={8 * px} height={8 * px}>
      {grid.flatMap((row, y) =>
        row.map((color, x) =>
          color ? (
            <Rect key={`${x},${y}`} x={x * px} y={y * px} width={px} height={px} fill={color} />
          ) : null
        )
      )}
    </Svg>
  );
};

const createStyles = (c: ColorScheme) =>
  StyleSheet.create({
    container: { alignItems: 'center', gap: 4 },
    name: { fontFamily: PIXEL_FONT, fontSize: 5, color: c.textMuted, letterSpacing: 1 },
  });

export const MoonPhase: React.FC = () => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const phase = getMoonPhaseIndex();

  return (
    <View style={styles.container}>
      <MoonSprite phase={phase} px={5} litColor={colors.gold} darkColor={colors.bgCard} />
      <Text style={styles.name}>{MOON_PHASE_NAMES[phase]}</Text>
    </View>
  );
};
