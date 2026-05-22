import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { useTheme } from '../context/ThemeContext';
import { ColorScheme, PIXEL_FONT } from '../constants/theme';

// Handle notifications when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

interface Entry {
  id: string;
  time: string;
  label: string;
}

const STORAGE_KEY = '@boodays_itinerary_v1';

const DEFAULT_ENTRIES: Entry[] = [
  { id: '1', time: '05:30', label: 'wake up' },
  { id: '2', time: '07:30', label: 'arrive at work' },
  { id: '3', time: '16:00', label: 'leave work' },
  { id: '4', time: '17:30', label: 'tend to the garden' },
  { id: '5', time: '18:30', label: 'eat dinner' },
  { id: '6', time: '19:00', label: 'study' },
  { id: '7', time: '20:00', label: 'read' },
];

const scheduleAll = async (entries: Entry[]) => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    for (const entry of entries) {
      const parts = entry.time.split(':');
      const hour = parseInt(parts[0], 10);
      const minute = parseInt(parts[1], 10);
      if (isNaN(hour) || isNaN(minute)) continue;
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '👻 BOO DAYS',
          body: `${entry.time} — ${entry.label}`,
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
          hour,
          minute,
          repeats: true,
        },
      });
    }
  } catch (e) {
    console.warn('Notification scheduling error:', e);
  }
};

const createStyles = (c: ColorScheme) =>
  StyleSheet.create({
    container: { paddingVertical: 12 },
    title: {
      fontFamily: PIXEL_FONT,
      fontSize: 9,
      color: c.teal,
      letterSpacing: 3,
      marginBottom: 14,
      textAlign: 'center',
    },
    notifBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.bgCardLight,
      borderWidth: 1,
      borderColor: c.border,
      padding: 8,
      marginBottom: 10,
      gap: 8,
    },
    notifText: {
      fontFamily: PIXEL_FONT,
      fontSize: 6,
      color: c.textMuted,
      flex: 1,
    },
    notifBtn: {
      backgroundColor: c.border,
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    notifBtnText: {
      fontFamily: PIXEL_FONT,
      fontSize: 6,
      color: c.white,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      paddingHorizontal: 4,
      borderBottomWidth: 1,
      borderBottomColor: c.bgCardLight,
    },
    rowTime: { fontFamily: PIXEL_FONT, fontSize: 8, color: c.pink, width: 50 },
    rowLabel: {
      fontFamily: PIXEL_FONT,
      fontSize: 7,
      color: c.text,
      flex: 1,
      marginHorizontal: 8,
    },
    rowActions: { flexDirection: 'row', gap: 8 },
    actionBtn: { padding: 4 },
    editText: { fontSize: 14, color: c.purpleLight },
    deleteText: { fontSize: 14, color: c.pink },
    addBtn: {
      marginTop: 14,
      alignSelf: 'center',
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderWidth: 2,
      borderColor: c.teal,
      backgroundColor: c.bgCard,
    },
    addBtnText: { fontFamily: PIXEL_FONT, fontSize: 8, color: c.teal },
    overlay: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: 'rgba(10,0,21,0.85)',
    },
    modalBox: {
      backgroundColor: c.bgCard,
      borderTopWidth: 3,
      borderLeftWidth: 3,
      borderRightWidth: 3,
      borderColor: c.border,
      padding: 20,
      paddingBottom: 36,
    },
    modalTitle: {
      fontFamily: PIXEL_FONT,
      fontSize: 9,
      color: c.white,
      marginBottom: 20,
      textAlign: 'center',
      letterSpacing: 2,
    },
    inputLabel: {
      fontFamily: PIXEL_FONT,
      fontSize: 7,
      color: c.textMuted,
      marginBottom: 6,
    },
    input: {
      backgroundColor: c.bgCardLight,
      borderWidth: 2,
      borderColor: c.border,
      color: c.white,
      fontFamily: PIXEL_FONT,
      fontSize: 9,
      padding: 10,
      marginBottom: 16,
    },
    modalBtns: { flexDirection: 'row', gap: 12, marginTop: 4 },
    saveBtn: {
      flex: 1,
      backgroundColor: c.purple,
      borderWidth: 2,
      borderColor: c.purpleLight,
      paddingVertical: 12,
      alignItems: 'center',
    },
    saveBtnText: { fontFamily: PIXEL_FONT, fontSize: 8, color: c.white },
    cancelBtn: {
      flex: 1,
      backgroundColor: c.bgCardLight,
      borderWidth: 2,
      borderColor: c.border,
      paddingVertical: 12,
      alignItems: 'center',
    },
    cancelBtnText: { fontFamily: PIXEL_FONT, fontSize: 8, color: c.text },
  });

export const Itinerary: React.FC = () => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [entries, setEntries] = useState<Entry[]>([]);
  const [notifStatus, setNotifStatus] = useState<'unknown' | 'granted' | 'denied'>('unknown');
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<Entry | null>(null);
  const [timeInput, setTimeInput] = useState('');
  const [labelInput, setLabelInput] = useState('');

  // Load entries + check notification permission
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        setEntries(raw ? JSON.parse(raw) : DEFAULT_ENTRIES);
      } catch {
        setEntries(DEFAULT_ENTRIES);
      }
      const { status } = await Notifications.getPermissionsAsync();
      setNotifStatus(status === 'granted' ? 'granted' : 'denied');
    })();
  }, []);

  const requestNotifPermission = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status === 'granted') {
      setNotifStatus('granted');
      await scheduleAll(entries);
    } else {
      setNotifStatus('denied');
    }
  };

  const persist = useCallback(
    async (next: Entry[]) => {
      setEntries(next);
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {}
      if (notifStatus === 'granted') {
        await scheduleAll(next);
      }
    },
    [notifStatus]
  );

  const openAdd = () => {
    setEditing(null);
    setTimeInput('');
    setLabelInput('');
    setModalVisible(true);
  };

  const openEdit = (entry: Entry) => {
    setEditing(entry);
    setTimeInput(entry.time);
    setLabelInput(entry.label);
    setModalVisible(true);
  };

  const handleSave = () => {
    if (!timeInput.trim() || !labelInput.trim()) return;
    let next: Entry[];
    if (editing) {
      next = entries.map(e =>
        e.id === editing.id
          ? { ...e, time: timeInput.trim(), label: labelInput.trim() }
          : e
      );
    } else {
      next = [
        ...entries,
        { id: Date.now().toString(), time: timeInput.trim(), label: labelInput.trim() },
      ];
    }
    next.sort((a, b) => a.time.localeCompare(b.time));
    persist(next);
    setModalVisible(false);
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete?', 'Remove this entry?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => persist(entries.filter(e => e.id !== id)),
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>TODAY'S PLAN</Text>

      {notifStatus !== 'granted' && (
        <View style={styles.notifBanner}>
          <Text style={styles.notifText}>
            {notifStatus === 'denied'
              ? 'Enable notifications in Settings'
              : 'Get reminders for your schedule?'}
          </Text>
          {notifStatus === 'unknown' && (
            <TouchableOpacity style={styles.notifBtn} onPress={requestNotifPermission}>
              <Text style={styles.notifBtnText}>ENABLE</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {entries.map(entry => (
        <View key={entry.id} style={styles.row}>
          <Text style={styles.rowTime}>{entry.time}</Text>
          <Text style={styles.rowLabel} numberOfLines={1}>
            {entry.label}
          </Text>
          <View style={styles.rowActions}>
            <TouchableOpacity onPress={() => openEdit(entry)} style={styles.actionBtn}>
              <Text style={styles.editText}>✎</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDelete(entry.id)} style={styles.actionBtn}>
              <Text style={styles.deleteText}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
        <Text style={styles.addBtnText}>+ ADD ENTRY</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.overlay}
        >
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>{editing ? 'EDIT ENTRY' : 'NEW ENTRY'}</Text>
            <Text style={styles.inputLabel}>TIME (HH:MM)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 07:30"
              placeholderTextColor={colors.textMuted}
              value={timeInput}
              onChangeText={setTimeInput}
              keyboardType="numbers-and-punctuation"
              maxLength={5}
            />
            <Text style={styles.inputLabel}>EVENT</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. morning walk"
              placeholderTextColor={colors.textMuted}
              value={labelInput}
              onChangeText={setLabelInput}
              maxLength={40}
            />
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
