import React, { useState, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, Modal, TextInput,
  ScrollView, StyleSheet, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useHabits } from '../context/HabitContext';
import { ColorScheme, PIXEL_FONT } from '../constants/theme';
import { getTodayEST } from '../utils/dateUtils';
import { DailyRecord } from '../types';

// ─── styles ──────────────────────────────────────────────────────────────────

const createStyles = (c: ColorScheme) =>
  StyleSheet.create({
    container: { paddingVertical: 4 },
    title: { fontFamily: PIXEL_FONT, fontSize: 9, color: c.pink, letterSpacing: 3, textAlign: 'center', marginBottom: 12 },
    // habit rows
    habitRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: c.bgCardLight },
    checkbox: { width: 14, height: 14, borderWidth: 2, borderColor: c.border, marginRight: 10, alignItems: 'center', justifyContent: 'center' },
    checkboxDone: { backgroundColor: c.teal, borderColor: c.teal },
    checkmark: { fontFamily: PIXEL_FONT, fontSize: 7, color: c.black },
    habitName: { fontFamily: PIXEL_FONT, fontSize: 7, color: c.text, flex: 1 },
    habitNameDone: { color: c.textMuted },
    // action buttons
    btnRow: { flexDirection: 'row', gap: 8, marginTop: 14, flexWrap: 'wrap', justifyContent: 'center' },
    btn: { paddingHorizontal: 10, paddingVertical: 8, borderWidth: 2, borderColor: c.border, backgroundColor: c.bgCard },
    btnText: { fontFamily: PIXEL_FONT, fontSize: 6, color: c.text },
    btnAccent: { borderColor: c.teal },
    btnAccentText: { color: c.teal },
    noFocus: { fontFamily: PIXEL_FONT, fontSize: 7, color: c.textMuted, textAlign: 'center', paddingVertical: 12 },
    summary: { fontFamily: PIXEL_FONT, fontSize: 7, color: c.gold, textAlign: 'center', marginBottom: 10 },
    // modal shared
    overlay: { flex: 1, backgroundColor: 'rgba(10,0,21,0.88)', justifyContent: 'flex-end' },
    modalBox: { backgroundColor: c.bgCard, borderTopWidth: 3, borderLeftWidth: 3, borderRightWidth: 3, borderColor: c.border, padding: 20, paddingBottom: 36, maxHeight: '85%' },
    modalTitle: { fontFamily: PIXEL_FONT, fontSize: 9, color: c.white, textAlign: 'center', letterSpacing: 2, marginBottom: 16 },
    modalScroll: { maxHeight: 320 },
    // select modal
    selectRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: c.bgCardLight },
    selectCheck: { width: 14, height: 14, borderWidth: 2, borderColor: c.border, marginRight: 10, alignItems: 'center', justifyContent: 'center' },
    selectCheckOn: { backgroundColor: c.purple, borderColor: c.purpleLight },
    selectLabel: { fontFamily: PIXEL_FONT, fontSize: 7, color: c.text, flex: 1 },
    // pool modal
    poolRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: c.bgCardLight },
    poolName: { fontFamily: PIXEL_FONT, fontSize: 7, color: c.text, flex: 1 },
    poolDel: { fontSize: 14, color: c.pink, padding: 4 },
    input: { backgroundColor: c.bgCardLight, borderWidth: 2, borderColor: c.border, color: c.white, fontFamily: PIXEL_FONT, fontSize: 9, padding: 10, marginTop: 12 },
    saveBtn: { backgroundColor: c.purple, borderWidth: 2, borderColor: c.purpleLight, paddingVertical: 12, alignItems: 'center', marginTop: 12 },
    saveBtnText: { fontFamily: PIXEL_FONT, fontSize: 8, color: c.white },
    doneBtn: { backgroundColor: c.bgCardLight, borderWidth: 2, borderColor: c.border, paddingVertical: 12, alignItems: 'center', marginTop: 8 },
    doneBtnText: { fontFamily: PIXEL_FONT, fontSize: 8, color: c.text },
    // history
    histDay: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: c.bgCardLight },
    histDate: { fontFamily: PIXEL_FONT, fontSize: 7, color: c.gold, marginBottom: 4 },
    histHabit: { fontFamily: PIXEL_FONT, fontSize: 6, color: c.text, paddingLeft: 8 },
    histNone: { fontFamily: PIXEL_FONT, fontSize: 6, color: c.textMuted, paddingLeft: 8 },
  });

// ─── history modal ────────────────────────────────────────────────────────────

const HistoryModal: React.FC<{ visible: boolean; onClose: () => void }> = ({ visible, onClose }) => {
  const { colors } = useTheme();
  const { pool, history } = useHabits();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const nameOf = (id: string) => pool.find(h => h.id === id)?.name ?? id;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          <Text style={styles.modalTitle}>HABIT HISTORY</Text>
          <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
            {history.length === 0 && (
              <Text style={styles.histNone}>No records yet — start checking off habits!</Text>
            )}
            {history.map(rec => (
              <View key={rec.date} style={styles.histDay}>
                <Text style={styles.histDate}>
                  {rec.date}  {rec.completedIds.length}/{rec.selectedIds.length} done
                </Text>
                {rec.selectedIds.map(id => (
                  <Text key={id} style={styles.histHabit}>
                    {rec.completedIds.includes(id) ? '✓' : '○'} {nameOf(id)}
                  </Text>
                ))}
                {rec.selectedIds.length === 0 && (
                  <Text style={styles.histNone}>  no focus selected</Text>
                )}
              </View>
            ))}
          </ScrollView>
          <TouchableOpacity style={styles.doneBtn} onPress={onClose}>
            <Text style={styles.doneBtnText}>CLOSE</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// ─── pool management modal ────────────────────────────────────────────────────

const PoolModal: React.FC<{ visible: boolean; onClose: () => void }> = ({ visible, onClose }) => {
  const { colors } = useTheme();
  const { pool, addHabit, removeHabit } = useHabits();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [input, setInput] = useState('');

  const handleAdd = async () => {
    if (!input.trim()) return;
    await addHabit(input);
    setInput('');
  };

  const handleRemove = (id: string, name: string) => {
    Alert.alert('Remove habit?', `Remove "${name}" from your pool?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeHabit(id) },
    ]);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.overlay}>
        <View style={styles.modalBox}>
          <Text style={styles.modalTitle}>MANAGE HABITS</Text>
          <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
            {pool.map(h => (
              <View key={h.id} style={styles.poolRow}>
                <Text style={styles.poolName}>{h.name}</Text>
                <TouchableOpacity onPress={() => handleRemove(h.id, h.name)}>
                  <Text style={styles.poolDel}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
          <TextInput
            style={styles.input}
            placeholder="new habit name..."
            placeholderTextColor={colors.textMuted}
            value={input}
            onChangeText={setInput}
            maxLength={40}
            onSubmitEditing={handleAdd}
          />
          <TouchableOpacity style={styles.saveBtn} onPress={handleAdd}>
            <Text style={styles.saveBtnText}>+ ADD</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.doneBtn} onPress={onClose}>
            <Text style={styles.doneBtnText}>DONE</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

// ─── focus selection modal ────────────────────────────────────────────────────

const SelectModal: React.FC<{ visible: boolean; onClose: () => void }> = ({ visible, onClose }) => {
  const { colors } = useTheme();
  const { pool, todayRecord, setTodaySelected } = useHabits();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [selected, setSelected] = useState<string[]>(todayRecord?.selectedIds ?? []);

  const toggle = (id: string) =>
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

  const handleSave = async () => {
    await setTodaySelected(selected);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          <Text style={styles.modalTitle}>TODAY'S FOCUS</Text>
          <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
            {pool.map(h => (
              <TouchableOpacity key={h.id} style={styles.selectRow} onPress={() => toggle(h.id)}>
                <View style={[styles.selectCheck, selected.includes(h.id) && styles.selectCheckOn]}>
                  {selected.includes(h.id) && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.selectLabel}>{h.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveBtnText}>SET FOCUS</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.doneBtn} onPress={onClose}>
            <Text style={styles.doneBtnText}>CANCEL</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// ─── main component ───────────────────────────────────────────────────────────

export const HabitTracker: React.FC = () => {
  const { colors } = useTheme();
  const { pool, todayRecord, toggleComplete } = useHabits();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [selectOpen, setSelectOpen] = useState(false);
  const [poolOpen,   setPoolOpen]   = useState(false);
  const [histOpen,   setHistOpen]   = useState(false);

  const selectedHabits = pool.filter(h => todayRecord?.selectedIds.includes(h.id));
  const doneCount = selectedHabits.filter(h => todayRecord?.completedIds.includes(h.id)).length;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>HABITS</Text>

      {selectedHabits.length > 0 && (
        <Text style={styles.summary}>{doneCount} / {selectedHabits.length} done today</Text>
      )}

      {selectedHabits.length === 0 ? (
        <Text style={styles.noFocus}>
          {todayRecord ? 'No habits selected — tap SET FOCUS' : 'Choose today\'s focus habits ↓'}
        </Text>
      ) : (
        selectedHabits.map(h => {
          const done = todayRecord?.completedIds.includes(h.id) ?? false;
          return (
            <TouchableOpacity key={h.id} style={styles.habitRow} onPress={() => toggleComplete(h.id)}>
              <View style={[styles.checkbox, done && styles.checkboxDone]}>
                {done && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={[styles.habitName, done && styles.habitNameDone]}>{h.name}</Text>
            </TouchableOpacity>
          );
        })
      )}

      <View style={styles.btnRow}>
        <TouchableOpacity style={[styles.btn, styles.btnAccent]} onPress={() => setSelectOpen(true)}>
          <Text style={[styles.btnText, styles.btnAccentText]}>SET FOCUS</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btn} onPress={() => setPoolOpen(true)}>
          <Text style={styles.btnText}>MANAGE</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btn} onPress={() => setHistOpen(true)}>
          <Text style={styles.btnText}>HISTORY</Text>
        </TouchableOpacity>
      </View>

      <SelectModal visible={selectOpen} onClose={() => setSelectOpen(false)} />
      <PoolModal   visible={poolOpen}   onClose={() => setPoolOpen(false)} />
      <HistoryModal visible={histOpen}  onClose={() => setHistOpen(false)} />
    </View>
  );
};
