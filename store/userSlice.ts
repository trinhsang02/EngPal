import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types
export type UserLevel = 'beginner' | 'Elementary' | 'Intermediate' | 'Upper-Intermediate' | 'Advanced' | 'Proficient';

export interface User {
    id: string;
    email: string;
    name: string;
    level: UserLevel;
    isLoggedIn: boolean;
    lastLogin?: Date;
    progress?: {
        completedLessons: number;
        totalLessons: number;
        streak: number;
    };
}

interface UserState {
    user: User | null;
    settings: {
        language: 'en' | 'vi';
        theme: 'light' | 'dark';
        notifications: boolean;
    };
}

const initialState: UserState = {
    user: null,
    settings: {
        language: 'en',
        theme: 'light',
        notifications: true,
    },
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        login: (state, action: PayloadAction<Omit<User, 'isLoggedIn'>>) => {
            state.user = {
                ...action.payload,
                isLoggedIn: true,
                lastLogin: new Date(),
            };
            // Save to AsyncStorage
            AsyncStorage.setItem('user', JSON.stringify(state.user));
        },
        logout: (state) => {
            if (state.user) {
                state.user.isLoggedIn = false;
                // Clear AsyncStorage
                AsyncStorage.removeItem('user');
            }
        },
        updateLevel: (state, action: PayloadAction<UserLevel>) => {
            if (state.user) {
                state.user.level = action.payload;
                // Save to AsyncStorage
                AsyncStorage.setItem('user', JSON.stringify(state.user));
            }
        },
        updateProgress: (state, action: PayloadAction<User['progress']>) => {
            if (state.user) {
                state.user.progress = action.payload;
                // Save to AsyncStorage
                AsyncStorage.setItem('user', JSON.stringify(state.user));
            }
        },
        updateLanguage: (state, action: PayloadAction<'en' | 'vi'>) => {
            state.settings.language = action.payload;
            AsyncStorage.setItem('settings', JSON.stringify(state.settings));
        },
        toggleNotifications: (state) => {
            state.settings.notifications = !state.settings.notifications;
            AsyncStorage.setItem('settings', JSON.stringify(state.settings));
        },
        // Add action to load saved state
        loadSavedState: (state, action: PayloadAction<{ user: User | null; settings: UserState['settings'] }>) => {
            state.user = action.payload.user;
            state.settings = action.payload.settings;
        },
    },
});

// Load saved state when app starts
export const loadSavedState = () => async (dispatch: any) => {
    try {
        const [userStr, settingsStr] = await Promise.all([
            AsyncStorage.getItem('user'),
            AsyncStorage.getItem('settings')
        ]);

        const user = userStr ? JSON.parse(userStr) : null;
        const settings = settingsStr ? JSON.parse(settingsStr) : initialState.settings;

        dispatch(userSlice.actions.loadSavedState({ user, settings }));
    } catch (error) {
        console.error('Error loading saved state:', error);
    }
};

export const { login, logout, updateLevel, updateProgress, updateLanguage, toggleNotifications } = userSlice.actions;
export default userSlice.reducer; 