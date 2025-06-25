import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getTodayDate } from '../utils/streakHelper';

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

interface HistoryItem {
    date: string; // YYYY-MM-DD
    value: number;
}

interface UserState {
    user: User | null;
    settings: {
        language: 'en' | 'vi';
        theme: 'light' | 'dark';
        notifications: boolean;
    };
    // Learning Goal State - simplified
    learningGoal: number;
    todayProgress: number;
    streak: number;
    history: HistoryItem[];
    lastActivityDate: string;
}

const initialState: UserState = {
    user: null,
    settings: {
        language: 'en',
        theme: 'light',
        notifications: true,
    },
    learningGoal: 10,
    todayProgress: 0,
    streak: 0,
    history: [],
    lastActivityDate: getTodayDate(),
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
            AsyncStorage.setItem('user', JSON.stringify(state.user));
        },
        logout: (state) => {
            if (state.user) {
                state.user.isLoggedIn = false;
                AsyncStorage.removeItem('user');
            }
        },
        updateLevel: (state, action: PayloadAction<UserLevel>) => {
            if (state.user) {
                state.user.level = action.payload;
                AsyncStorage.setItem('user', JSON.stringify(state.user));
            }
        },
        updateProgress: (state, action: PayloadAction<User['progress']>) => {
            if (state.user) {
                state.user.progress = action.payload;
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
        loadSavedState: (state, action: PayloadAction<{ user: User | null; settings: UserState['settings'] }>) => {
            state.user = action.payload.user;
            state.settings = action.payload.settings;
        },

        // Simplified Learning Goal Actions
        setGoal: (state, action: PayloadAction<number>) => {
            state.learningGoal = action.payload;
            AsyncStorage.setItem('learningGoal', JSON.stringify({
                learningGoal: state.learningGoal,
                todayProgress: state.todayProgress,
                streak: state.streak,
                history: state.history,
                lastActivityDate: state.lastActivityDate
            }));
        },

        setTodayProgress: (state, action: PayloadAction<number>) => {
            const today = getTodayDate();

            // Check if it's a new day
            if (today !== state.lastActivityDate) {
                // If it's been more than 1 day, reset streak
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayStr = yesterday.toISOString().split('T')[0];

                if (state.lastActivityDate !== yesterdayStr) {
                    state.streak = 0;
                }

                // Reset for new day
                state.todayProgress = 0;
                state.lastActivityDate = today;
            }

            state.todayProgress = action.payload;

            // Check if goal is reached and increment streak
            if (state.todayProgress >= state.learningGoal && state.lastActivityDate === today) {
                // Update history
                const todayEntry = state.history.find(item => item.date === today);
                if (!todayEntry) {
                    // Only increment streak once per day
                    state.streak += 1;

                    // Add to history
                    state.history = [
                        ...state.history.filter(item => item.date !== today),
                        { date: today, value: state.todayProgress }
                    ].slice(-7); // Keep only last 7 days
                }
            }

            AsyncStorage.setItem('learningGoal', JSON.stringify({
                learningGoal: state.learningGoal,
                todayProgress: state.todayProgress,
                streak: state.streak,
                history: state.history,
                lastActivityDate: state.lastActivityDate
            }));
        },

        incrementProgress: (state) => {
            const today = getTodayDate();

            // Check if it's a new day
            if (today !== state.lastActivityDate) {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayStr = yesterday.toISOString().split('T')[0];

                if (state.lastActivityDate !== yesterdayStr) {
                    state.streak = 0;
                }

                state.todayProgress = 0;
                state.lastActivityDate = today;
            }

            state.todayProgress += 1;

            // Check if goal is reached for the first time today
            if (state.todayProgress >= state.learningGoal) {
                const todayEntry = state.history.find(item => item.date === today);
                if (!todayEntry) {
                    state.streak += 1;
                    state.history = [
                        ...state.history.filter(item => item.date !== today),
                        { date: today, value: state.todayProgress }
                    ].slice(-7);
                }
            }

            AsyncStorage.setItem('learningGoal', JSON.stringify({
                learningGoal: state.learningGoal,
                todayProgress: state.todayProgress,
                streak: state.streak,
                history: state.history,
                lastActivityDate: state.lastActivityDate
            }));
        },

        resetProgress: (state) => {
            state.todayProgress = 0;
            AsyncStorage.setItem('learningGoal', JSON.stringify({
                learningGoal: state.learningGoal,
                todayProgress: state.todayProgress,
                streak: state.streak,
                history: state.history,
                lastActivityDate: state.lastActivityDate
            }));
        },

        checkAndUpdateStreak: (state) => {
            const today = getTodayDate();

            if (today !== state.lastActivityDate) {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayStr = yesterday.toISOString().split('T')[0];

                // Reset streak if missed more than 1 day
                if (state.lastActivityDate !== yesterdayStr) {
                    state.streak = 0;
                }

                state.lastActivityDate = today;
                AsyncStorage.setItem('learningGoal', JSON.stringify({
                    learningGoal: state.learningGoal,
                    todayProgress: state.todayProgress,
                    streak: state.streak,
                    history: state.history,
                    lastActivityDate: state.lastActivityDate
                }));
            }
        },

        loadLearningGoalData: (state, action: PayloadAction<{
            learningGoal: number;
            todayProgress: number;
            streak: number;
            history: HistoryItem[];
            lastActivityDate: string;
        }>) => {
            state.learningGoal = action.payload.learningGoal;
            state.todayProgress = action.payload.todayProgress;
            state.streak = action.payload.streak;
            state.history = action.payload.history;
            state.lastActivityDate = action.payload.lastActivityDate;
        },
    },
});

// Async actions
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

export const loadLearningGoal = () => async (dispatch: any) => {
    try {
        const dataStr = await AsyncStorage.getItem('learningGoal');
        if (dataStr) {
            const data = JSON.parse(dataStr);
            dispatch(userSlice.actions.loadLearningGoalData({
                learningGoal: data.learningGoal || 10,
                todayProgress: data.todayProgress || 0,
                streak: data.streak || 0,
                history: data.history || [],
                lastActivityDate: data.lastActivityDate || getTodayDate(),
            }));
        }

        // Check streak after loading
        dispatch(userSlice.actions.checkAndUpdateStreak());
    } catch (error) {
        console.error('Error loading learning goal:', error);
    }
};

// Export actions
export const {
    login,
    logout,
    updateLevel,
    updateProgress,
    updateLanguage,
    toggleNotifications,
    setGoal,
    setTodayProgress,
    incrementProgress,
    resetProgress,
    checkAndUpdateStreak,
} = userSlice.actions;

export default userSlice.reducer; 