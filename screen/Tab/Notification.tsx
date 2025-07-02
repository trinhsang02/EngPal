import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Switch, Alert, TouchableOpacity } from 'react-native';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { 
    getNotificationSetting, 
    updateNotificationSetting, 
    savePushToken, 
    getNotificationHistory,
    NotificationHistory 
} from '../../services/notificationService';
import Constants from 'expo-constants';

const notifications = [
    {
        id: '1',
        appName: '4English',
        time: '12 giờ trước',
        greeting: 'Hey User',
        message: 'You have 5 word(s) to review!',
    },
    {
        id: '2',
        appName: '4English',
        time: 'Hôm qua',
        greeting: 'Hey User',
        message: 'You have 5 word(s) to review!',
    },
];

const API_BASE_URL = 'http://localhost:8080'; // Thay đổi IP nếu cần

export default function NotificationScreen() {
    const [isNotificationEnabled, setIsNotificationEnabled] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [notifications, setNotifications] = useState<NotificationHistory[]>([]);

    useEffect(() => {
        // Chỉ đăng ký push notification nếu không phải Expo Go
        if (!Constants.appOwnership || Constants.appOwnership !== 'expo') {
            registerForPushNotificationsAsync();
        }
        fetchNotificationSetting();
        fetchNotificationHistory();
    }, []);

    // Lấy trạng thái notification setting từ backend
    const fetchNotificationSetting = async () => {
        try {
            const setting = await getNotificationSetting();
            setIsNotificationEnabled(setting.enable);
        } catch (error) {
            console.error('Error fetching notification setting:', error);
        }
    };

    // Lấy lịch sử notification
    const fetchNotificationHistory = async () => {
        try {
            const history = await getNotificationHistory();
            setNotifications(history);
        } catch (error) {
            console.error('Error fetching notification history:', error);
        }
    };

    // Cập nhật trạng thái notification setting
    const handleNotificationToggle = async (enabled: boolean) => {
        setIsLoading(true);
        try {
            await updateNotificationSetting(enabled);
            setIsNotificationEnabled(enabled);
            Alert.alert('Thành công', enabled ? 'Đã bật thông báo' : 'Đã tắt thông báo');
        } catch (error) {
            console.error('Error updating notification setting:', error);
            Alert.alert('Lỗi', 'Không thể cập nhật cài đặt thông báo');
        } finally {
            setIsLoading(false);
        }
    };

    // Đăng ký push notification
    const registerForPushNotificationsAsync = async () => {
        try {
            if (Platform.OS === 'android') {
                await Notifications.setNotificationChannelAsync('default', {
                    name: 'default',
                    importance: Notifications.AndroidImportance.MAX,
                });
            }

            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;
            
            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }
            
            if (finalStatus !== 'granted') {
                Alert.alert('Cần quyền', 'Cần quyền thông báo để nhận nhắc nhở học tập!');
                return;
            }

            const token = (await Notifications.getExpoPushTokenAsync()).data;
            console.log('Expo Push Token:', token);
            
            // Gửi token lên backend
            await savePushToken(token);
            
        } catch (error) {
            console.error('Error registering for push notifications:', error);
        }
    };

    return (
        <View style={styles.container}>
            {/* Notification Settings */}
            <View style={styles.settingsCard}>
                <Text style={styles.settingsTitle}>Cài đặt thông báo</Text>
                <View style={styles.settingRow}>
                    <Text style={styles.settingLabel}>Nhận thông báo học tập</Text>
                    <Switch
                        value={isNotificationEnabled}
                        onValueChange={handleNotificationToggle}
                        disabled={isLoading}
                    />
                </View>
            </View>

            {/* Header */}
            <Text style={styles.sectionTitle}>Lịch sử thông báo</Text>
            
            <FlatList
                data={notifications}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <View style={styles.row}>
                            <View style={{ flex: 1 }}>
                                <View style={styles.row}>
                                    <Text style={styles.appName}>{item.appName}</Text>
                                    <Text style={styles.time}>{item.time}</Text>
                                </View>
                                <Text style={styles.greeting}>{item.greeting}</Text>
                                <Text style={styles.message}>{item.message}</Text>
                            </View>
                        </View>
                    </View>
                )}
                contentContainerStyle={{ paddingBottom: 24 }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: '#f5f5f5' 
    },
    settingsCard: {
        backgroundColor: '#fff',
        margin: 12,
        padding: 16,
        borderRadius: 8,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    settingsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
        color: '#333',
    },
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    settingLabel: {
        fontSize: 16,
        color: '#333',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginHorizontal: 12,
        marginTop: 8,
        marginBottom: 8,
        color: '#333',
    },
    card: { 
        backgroundColor: '#fff', 
        borderRadius: 8, 
        padding: 16, 
        marginHorizontal: 12, 
        marginTop: 8, 
        elevation: 1, 
        borderWidth: 1, 
        borderColor: '#f2f2f2' 
    },
    row: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        marginBottom: 4 
    },
    icon: { 
        width: 40, 
        height: 40, 
        borderRadius: 20, 
        marginRight: 12, 
        backgroundColor: '#eee' 
    },
    appName: { 
        fontWeight: 'bold', 
        fontSize: 16, 
        marginRight: 8 
    },
    time: { 
        color: '#888', 
        fontSize: 13 
    },
    greeting: { 
        fontWeight: 'bold', 
        fontSize: 15, 
        marginTop: 2 
    },
    message: { 
        fontSize: 15, 
        color: '#222', 
        marginTop: 2 
    },
});