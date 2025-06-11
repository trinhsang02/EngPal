import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, UserContextType, UserLevel } from '../types/user';

const UserContext = createContext<UserContextType | undefined>(undefined);

const STORAGE_KEY = '@user_data';

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);

    // Load user data from storage when app starts
    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        try {
            const userData = await AsyncStorage.getItem(STORAGE_KEY);
            if (userData) {
                setUser(JSON.parse(userData));
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    };

    const saveUserData = async (userData: User) => {
        try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
        } catch (error) {
            console.error('Error saving user data:', error);
        }
    };

    const login = async (userData: Omit<User, 'isLoggedIn'>) => {
        const newUser: User = {
            ...userData,
            isLoggedIn: true,
            lastLogin: new Date(),
        };
        setUser(newUser);
        await saveUserData(newUser);
    };

    const logout = async () => {
        if (user) {
            const updatedUser = { ...user, isLoggedIn: false };
            setUser(updatedUser);
            await saveUserData(updatedUser);
        }
    };

    const updateUserLevel = async (level: UserLevel) => {
        if (user) {
            const updatedUser = { ...user, level };
            setUser(updatedUser);
            await saveUserData(updatedUser);
        }
    };

    const updateProgress = async (progress: User['progress']) => {
        if (user) {
            const updatedUser = { ...user, progress };
            setUser(updatedUser);
            await saveUserData(updatedUser);
        }
    };

    return (
        <UserContext.Provider
            value={{
                user,
                login,
                logout,
                updateUserLevel,
                updateProgress,
            }}
        >
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};
