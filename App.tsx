import React, { useMemo } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFonts, PressStart2P_400Regular } from '@expo-google-fonts/press-start-2p';

import { ThemeProvider, useTheme } from './context/ThemeContext';
import { ScheduleProvider } from './context/ScheduleContext';
import { HabitProvider } from './context/HabitContext';
import { ColorScheme, PALETTE_LABELS, PIXEL_FONT } from './constants/theme';

import { Clock }         from './components/Clock';
import { PomodoroTimer } from './components/PomodoroTimer';
import { Itinerary }     from './components/Itinerary';
import { HabitTracker }  from './components/HabitTracker';
import { UpNext }        from './components/UpNext';
import { DayProgress }   from './components/DayProgress';
import { MoonPhase }     from './components/MoonPhase';
import { Ghost, Cat, Mushroom } from './components/PixelSprites';

// ─── shared sub-components ────────────────────────────────────────────────────

const PixelDivider: React.FC<{ color: string }> = ({ color }) => (
  <View style={{ flexDirection: 'row', height: 4, overflow: 'hidden' }}>
    {Array.from({ length: 20 }).map((_, i) => (
      <View key={i} style={{ flex: 1, marginHorizontal: 1, backgroundColor: color, opacity: i % 2 === 0 ? 1 : 0.35 }} />
    ))}
  </View>
);

// ─── styles ───────────────────────────────────────────────────────────────────

const createStyles = (c: ColorScheme) =>
  StyleSheet.create({
    safe:    { flex: 1, backgroundColor: c.bg },
    scroll:  { flex: 1 },
    content: { paddingHorizontal: 16, paddingVertical: 24, gap: 14 },
    // header
    header:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    headerCenter: { alignItems: 'center' },
    appTitle: {
      fontFamily: PIXEL_FONT, fontSize: 22, color: c.pink, letterSpacing: 4,
      textShadowColor: c.purple, textShadowOffset: { width: 3, height: 3 }, textShadowRadius: 0,
    },
    appSub: { fontFamily: PIXEL_FONT, fontSize: 10, color: c.purpleLight, letterSpacing: 6, marginTop: 4 },
    spritesRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', paddingVertical: 4 },
    // palette toggle
    paletteRow: { alignItems: 'center' },
    paletteBtn: { borderWidth: 2, borderColor: c.border, backgroundColor: c.bgCard, paddingHorizontal: 14, paddingVertical: 7 },
    paletteBtnText: { fontFamily: PIXEL_FONT, fontSize: 7, color: c.gold, letterSpacing: 1 },
    // info row (moon + progress)
    infoCard: { backgroundColor: c.bgCard, borderWidth: 3, borderColor: c.borderAccent, padding: 12, gap: 10 },
    infoRow:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
    infoRight: { flex: 1 },
    // section cards
    card:         { backgroundColor: c.bgCard, borderWidth: 3, padding: 16 },
    sectionLabel: { fontFamily: PIXEL_FONT, fontSize: 7, color: c.textMuted, letterSpacing: 3, textAlign: 'center', marginBottom: 4 },
    // footer
    footer: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingVertical: 8 },
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

        {/* ── Header ── */}
        <View style={styles.header}>
          <Ghost pixelSize={5} />
          <View style={styles.headerCenter}>
            <Text style={styles.appTitle}>BOO</Text>
            <Text style={styles.appSub}>DAYS</Text>
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

        {/* ── Up Next banner ── */}
        <UpNext />

        <PixelDivider color={colors.border} />

        {/* ── Moon phase + Day progress ── */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <MoonPhase />
            <View style={styles.infoRight}>
              <DayProgress />
            </View>
          </View>
        </View>

        <PixelDivider color={colors.border} />

        {/* ── Clock ── */}
        <View style={[styles.card, { borderColor: colors.purpleLight }]}>
          <Text style={styles.sectionLabel}>* TIME *</Text>
          <Clock />
        </View>

        <PixelDivider color={colors.border} />

        {/* ── Pomodoro ── */}
        <View style={[styles.card, { borderColor: colors.pink }]}>
          <Text style={styles.sectionLabel}>* POMODORO *</Text>
          <PomodoroTimer />
        </View>

        <PixelDivider color={colors.border} />

        {/* ── Schedule ── */}
        <View style={[styles.card, { borderColor: colors.teal }]}>
          <Itinerary />
        </View>

        <PixelDivider color={colors.border} />

        {/* ── Habit tracker ── */}
        <View style={[styles.card, { borderColor: colors.gold }]}>
          <HabitTracker />
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
  if (!fontsLoaded) return <View style={{ flex: 1, backgroundColor: '#1a0a2e' }} />;

  return (
    <ThemeProvider>
      <ScheduleProvider>
        <HabitProvider>
          <Inner />
        </HabitProvider>
      </ScheduleProvider>
    </ThemeProvider>
  );
}
