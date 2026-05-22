import React, { useState, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, Modal, TextInput,
  StyleSheet, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useSchedule } from '../context/ScheduleContext';
import { ColorScheme, PIXEL_FONT } from '../constants/theme';
import { Entry } from '../types';

const createStyles = (c: ColorScheme) =>
  StyleSheet.create({
    title: { fontFamily: PIXEL_FONT, fontSize: 9, color: c.teal, letterSpacing: 3, textAlign: 'center', marginBottom: 12 },
    // day tabs
    tabs: { flexDirection: 'row', marginBottom: 12, borderWidth: 2, borderColor: c.border },
    tab: { flex: 1, paddingVertical: 8, alignItems: 'center', backgroundColor: c.bgCard },
    tabActive: { backgroundColor: c.border },
    tabText: { fontFamily: PIXEL_FONT, fontSize: 6, color: c.textMuted },
    tabTextActive: { color: c.white },
    tabDot: { width: 5, height: 5, backgroundColor: c.gold, position: 'absolute', top: 3, right: 8 },
    // notification banner
    banner: { flexDirection: 'row', alignItems: 'center', backgroundColor: c.bgCardLight, borderWidth: 1, borderColor: c.border, padding: 8, marginBottom: 10, gap: 8 },
    bannerText: { fontFamily: PIXEL_FONT, fontSize: 6, color: c.textMuted, flex: 1 },
    bannerBtn: { backgroundColor: c.border, paddingHorizontal: 8, paddingVertical: 4 },
    bannerBtnText: { fontFamily: PIXEL_FONT, fontSize: 6, color: c.white },
    // entries
    row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 4, borderBottomWidth: 1, borderBottomColor: c.bgCardLight },
    rowTime: { fontFamily: PIXEL_FONT, fontSize: 8, color: c.pink, width: 50 },
    rowLabel: { fontFamily: PIXEL_FONT, fontSize: 7, color: c.text, flex: 1, marginHorizontal: 8 },
    rowActions: { flexDirection: 'row', gap: 8 },
    editText: { fontSize: 14, color: c.purpleLight },
    deleteText: { fontSize: 14, color: c.pink },
    addBtn: { marginTop: 14, alignSelf: 'center', paddingHorizontal: 14, paddingVertical: 10, borderWidth: 2, borderColor: c.teal, backgroundColor: c.bgCard },
    addBtnText: { fontFamily: PIXEL_FONT, fontSize: 8, color: c.teal },
    // modal
    overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(10,0,21,0.85)' },
    modalBox: { backgroundColor: c.bgCard, borderTopWidth: 3, borderLeftWidth: 3, borderRightWidth: 3, borderColor: c.border, padding: 20, paddingBottom: 36 },
    modalTitle: { fontFamily: PIXEL_FONT, fontSize: 9, color: c.white, marginBottom: 20, textAlign: 'center', letterSpacing: 2 },
    inputLabel: { fontFamily: PIXEL_FONT, fontSize: 7, color: c.textMuted, marginBottom: 6 },
    input: { backgroundColor: c.bgCardLight, borderWidth: 2, borderColor: c.border, color: c.white, fontFamily: PIXEL_FONT, fontSize: 9, padding: 10, marginBottom: 16 },
    modalBtns: { flexDirection: 'row', gap: 12, marginTop: 4 },
    saveBtn: { flex: 1, backgroundColor: c.purple, borderWidth: 2, borderColor: c.purpleLight, paddingVertical: 12, alignItems: 'center' },
    saveBtnText: { fontFamily: PIXEL_FONT, fontSize: 8, color: c.white },
    cancelBtn: { flex: 1, backgroundColor: c.bgCardLight, borderWidth: 2, borderColor: c.border, paddingVertical: 12, alignItems: 'center' },
    cancelBtnText: { fontFamily: PIXEL_FONT, fontSize: 8, color: c.text },
  });

export const Itinerary: React.FC = () => {
  const { colors } = useTheme();
  const { weekdayEntries, weekendEntries, isWeekend, notifGranted, requestNotifPermission, saveWeekday, saveWeekend } = useSchedule();
  const styles = useMemo(() => createStyles(colors), [colors]);

  // Tab: show today's schedule by default, user can switch to edit the other
  const [tab, setTab] = useState<'weekday' | 'weekend'>(isWeekend ? 'weekend' : 'weekday');
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<Entry | null>(null);
  const [timeInput, setTimeInput] = useState('');
  const [labelInput, setLabelInput] = useState('');

  const entries = tab === 'weekday' ? weekdayEntries : weekendEntries;
  const save = tab === 'weekday' ? saveWeekday : saveWeekend;

  const openAdd = () => { setEditing(null); setTimeInput(''); setLabelInput(''); setModalVisible(true); };
  const openEdit = (e: Entry) => { setEditing(e); setTimeInput(e.time); setLabelInput(e.label); setModalVisible(true); };

  const handleSave = () => {
    if (!timeInput.trim() || !labelInput.trim()) return;
    let next: Entry[];
    if (editing) {
      next = entries.map(e => e.id === editing.id ? { ...e, time: timeInput.trim(), label: labelInput.trim() } : e);
    } else {
      next = [...entries, { id: Date.now().toString(), time: timeInput.trim(), label: labelInput.trim() }];
    }
    next.sort((a, b) => a.time.localeCompare(b.time));
    save(next);
    setModalVisible(false);
  };

  const handleDelete = (id: string) =>
    Alert.alert('Delete?', 'Remove this entry?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => save(entries.filter(e => e.id !== id)) },
    ]);

  const isToday = (t: 'weekday' | 'weekend') => t === (isWeekend ? 'weekend' : 'weekday');

  return (
    <View>
      <Text style={styles.title}>TODAY'S PLAN</Text>

      {/* Weekday / Weekend tabs */}
      <View style={styles.tabs}>
        {(['weekday', 'weekend'] as const).map(t => (
          <TouchableOpacity key={t} style={[styles.tab, tab === t && styles.tabActive]} onPress={() => setTab(t)}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === 'weekday' ? 'MON–FRI' : 'SAT–SUN'}
            </Text>
            {isToday(t) && <View style={styles.tabDot} />}
          </TouchableOpacity>
        ))}
      </View>

      {/* Notification permission banner */}
      {!notifGranted && (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>Get daily reminders for your schedule?</Text>
          <TouchableOpacity style={styles.bannerBtn} onPress={requestNotifPermission}>
            <Text style={styles.bannerBtnText}>ENABLE</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Entries */}
      {entries.map(entry => (
        <View key={entry.id} style={styles.row}>
          <Text style={styles.rowTime}>{entry.time}</Text>
          <Text style={styles.rowLabel} numberOfLines={1}>{entry.label}</Text>
          <View style={styles.rowActions}>
            <TouchableOpacity onPress={() => openEdit(entry)} style={{ padding: 4 }}>
              <Text style={styles.editText}>✎</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDelete(entry.id)} style={{ padding: 4 }}>
              <Text style={styles.deleteText}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
        <Text style={styles.addBtnText}>+ ADD ENTRY</Text>
      </TouchableOpacity>

      {/* Add / Edit modal */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.overlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>{editing ? 'EDIT ENTRY' : 'NEW ENTRY'}</Text>
            <Text style={styles.inputLabel}>TIME (HH:MM)</Text>
            <TextInput style={styles.input} placeholder="e.g. 07:30" placeholderTextColor={colors.textMuted}
              value={timeInput} onChangeText={setTimeInput} keyboardType="numbers-and-punctuation" maxLength={5} />
            <Text style={styles.inputLabel}>EVENT</Text>
            <TextInput style={styles.input} placeholder="e.g. morning walk" placeholderTextColor={colors.textMuted}
              value={labelInput} onChangeText={setLabelInput} maxLength={40} />
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveBtnText}>SAVE</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelBtnText}>CANCEL</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};
