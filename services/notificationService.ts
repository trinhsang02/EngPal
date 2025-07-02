import axios from 'axios';
import { API_CONFIG } from './api';

// Types
export interface NotificationSetting {
    enable: boolean;
}

export interface PushTokenRequest {
    token: string;
}

export interface NotificationHistory {
    id: string;
    appName: string;
    time: string;
    greeting: string;
    message: string;
}

// API instance
const api = axios.create(API_CONFIG);

// Get notification setting
export const getNotificationSetting = async (): Promise<NotificationSetting> => {
    try {
        const response = await api.get<NotificationSetting>(`${API_CONFIG.baseURL}/api/user/notification-setting`);
        return response.data;
    } catch (error: any) {
        console.error('Error fetching notification setting:', error);
        // Return default setting if API fails
        return { enable: true };
    }
};

// Update notification setting
export const updateNotificationSetting = async (enable: boolean): Promise<void> => {
    try {
        await api.post(`${API_CONFIG.baseURL}/api/user/notification-setting`, { enable });
    } catch (error: any) {
        if (error?.response?.data?.message) {
            throw new Error(error.response.data.message);
        }
        throw new Error('Failed to update notification setting');
    }
};

// Save push token
export const savePushToken = async (token: string): Promise<void> => {
    try {
        await api.post(`${API_CONFIG.baseURL}/api/user/push-token`, { token });
    } catch (error: any) {
        console.error('Error saving push token:', error);
        // Don't throw error for push token saving as it's not critical
    }
};

// Get notification history (real API call)
export const getNotificationHistory = async (): Promise<NotificationHistory[]> => {
    try {
        const response = await api.get<NotificationHistory[]>(`${API_CONFIG.baseURL}/api/user/notification-history`);
        return response.data;
    } catch (error: any) {
        console.error('Error fetching notification history:', error);
        // Return empty array if API fails
        return [];
    }
};

// Test notification (for development)
export const sendTestNotification = async (userId: number, title: string, body: string): Promise<void> => {
    try {
        await api.post(`${API_CONFIG.baseURL}/api/notify/test`, {
            user_id: userId,
            title,
            body,
        });
    } catch (error: any) {
        if (error?.response?.data?.message) {
            throw new Error(error.response.data.message);
        }
        throw new Error('Failed to send test notification');
    }
}; 