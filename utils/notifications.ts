import * as Notifications from 'expo-notifications';
import { Entry } from '../types';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// iOS weekday convention: 1=Sunday, 2=Monday … 7=Saturday
const MON_FRI = [2, 3, 4, 5, 6];
const SAT_SUN = [1, 7];

export const scheduleAllNotifications = async (
  weekday: Entry[],
  weekend: Entry[]
): Promise<void> => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    const pairs: [Entry[], number[]][] = [
      [weekday, MON_FRI],
      [weekend, SAT_SUN],
    ];
    for (const [entries, days] of pairs) {
      for (const entry of entries) {
        const [h, m] = entry.time.split(':').map(Number);
        if (isNaN(h) || isNaN(m)) continue;
        for (const weekdayNum of days) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: '👻 BOO DAYS',
              body: `${entry.time} — ${entry.label}`,
              sound: true,
            },
            trigger: {
              type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
              weekday: weekdayNum,
              hour: h,
              minute: m,
              repeats: true,
            },
          });
        }
      }
    }
  } catch (e) {
    console.warn('Notification error:', e);
  }
};
