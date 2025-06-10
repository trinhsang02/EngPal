import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Xin quyền gửi thông báo
export async function requestNotificationPermission() {
    await Notifications.requestPermissionsAsync();
}

// Tạo notification channel cho Android
export async function configureNotificationChannel() {
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('reminder', {
            name: 'Reminders',
            importance: Notifications.AndroidImportance.HIGH,
            sound: 'default',
            description: 'Nhắc nhở học tiếng Anh hàng ngày',
            showBadge: true,
        });
    }
}

// Đặt notification lặp lại mỗi ngày
export async function scheduleDailyNotification(date: Date, notificationIdRef?: React.MutableRefObject<string | null>) {
    if (notificationIdRef && notificationIdRef.current) {
        await Notifications.cancelScheduledNotificationAsync(notificationIdRef.current);
    }
    const trigger = {
        type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
        hour: date.getHours(),
        minute: date.getMinutes(),
        repeats: true,
    } as any;
    const id = await Notifications.scheduleNotificationAsync({
        content: {
            title: 'Nhắc học',
            body: 'Đã đến giờ học tiếng Anh!',
            sound: 'default',
        },
        trigger,
    });
    if (notificationIdRef) notificationIdRef.current = id;
    return id;
}

// Hủy notification
export async function cancelNotification(notificationId: string) {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
} 