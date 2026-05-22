import React, { useMemo } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFonts, PressStart2P_400Regular } from '@expo-google-fonts/press-start-2p';

import { ThemeProvider, useTheme } from './context/ThemeContext';
import { ColorScheme, PALETTE_LABELS, PIXEL_FONT } from './constants/theme';
import { Clock } from './components/Clock';
import { PomodoroTimer } from './components/PomodoroTimer';
import { Itinerary } from './components/Itinerary';
import { Ghost, Cat, Mushroom } from './components/PixelSprites';

// ─── sub-components ──────────────────────────────────────────────────────────

const PixelDivider: React.FC<{ color: string }> = ({ color }) => (
  <View style={dividerStyles.row}>
    {Array.from({ length: 20 }).map((_, i) => (
      <View key={i} style={[dividerStyles.block, { backgroundColor: color, opacity: i % 2 === 0 ? 1 : 0.35 }]} />
    ))}
  </View>
);
const dividerStyles = StyleSheet.create({
  row: { flexDirection: 'row', height: 4, overflow: 'hidden' },
  block: { flex: 1, marginHorizontal: 1 },
});

const createStyles = (c: ColorScheme) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.bg },
    loading: { flex: 1, backgroundColor: '#1a0a2e' },
    scroll: { flex: 1 },
    content: { paddingHorizontal: 16, paddingVertical: 24, gap: 16 },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 4,
    },
    headerCenter: { alignItems: 'center' },
    appTitle: {
      fontFamily: PIXEL_FONT,
      fontSize: 22,
      color: c.pink,
      letterSpacing: 4,
      textShadowColor: c.purple,
      textShadowOffset: { width: 3, height: 3 },
      textShadowRadius: 0,
    },
    appTitleSub: {
      fontFamily: PIXEL_FONT,
      fontSize: 10,
      color: c.purpleLight,
      letterSpacing: 6,
      marginTop: 4,
    },
    spritesRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'flex-end',
      paddingVertical: 6,
    },
    card: { backgroundColor: c.bgCard, borderWidth: 3, padding: 16 },
    sectionLabel: {
      fontFamily: PIXEL_FONT,
      fontSize: 7,
      color: c.textMuted,
      letterSpacing: 3,
      textAlign: 'center',
      marginBottom: 4,
    },
    paletteRow: { alignItems: 'center', marginTop: 4 },
    paletteBtn: {
      borderWidth: 2,
      borderColor: c.border,
      backgroundColor: c.bgCard,
      paddingHorizontal: 14,
      paddingVertical: 8,
    },
    paletteBtnText: {
      fontFamily: PIXEL_FONT,
      fontSize: 7,
      color: c.gold,
      letterSpacing: 1,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      paddingTop: 8,
      paddingBottom: 8,
    },
    footerText: { fontFamily: PIXEL_FONT, fontSize: 8, color: c.purplePale },
  });

// ─── inner app (needs theme context) ─────────────────────────────────────────

const Inner: React.FC = () => {
  const { colors, palette, togglePalette } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="light" />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <Ghost pixelSize={5} />
          <View style={styles.headerCenter}>
            <Text style={styles.appTitle}>BOO</Text>
            <Text style={styles.appTitleSub}>DAYS</Text>
          </View>
          <Cat pixelSize={5} />
        </View>

        {/* Sprite row */}
        <View style={styles.spritesRow}>
          <Ghost pixelSize={3} />
          <Mushroom pixelSize={4} />
          <Ghost pixelSize={3} />
          <Mushroom pixelSize={4} />
          <Ghost pixelSize={3} />
        </View>

        {/* Palette toggle */}
        <View style={styles.paletteRow}>
          <TouchableOpacity style={styles.paletteBtn} onPress={togglePalette}>
            <Text style={styles.paletteBtnText}>{PALETTE_LABELS[palette]}</Text>
          </TouchableOpacity>
        </View>

        <PixelDivider color={colors.border} />

        {/* Clock */}
        <View style={[styles.card, { borderColor: colors.purpleLight }]}>
          <Text style={styles.sectionLabel}>* TIME *</Text>
          <Clock />
        </View>

        <PixelDivider color={colors.border} />

        {/* Pomodoro */}
        <View style={[styles.card, { borderColor: colors.pink }]}>
          <Text style={styles.sectionLabel}>* POMODORO *</Text>
          <PomodoroTimer />
        </View>

        <PixelDivider color={colors.border} />

        {/* Itinerary */}
        <View style={[styles.card, { borderColor: colors.teal }]}>
          <Itinerary />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Ghost pixelSize={3} />
          <Text style={styles.footerText}>( ˶ˆ꒳ˆ˵ )</Text>
          <Mushroom pixelSize={3} />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

// ─── root ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [fontsLoaded] = useFonts({ PressStart2P_400Regular });

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: '#1a0a2e' }} />;
  }

  return (
    <ThemeProvider>
      <Inner />
    </ThemeProvider>
  );
}
