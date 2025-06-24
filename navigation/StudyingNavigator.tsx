import { Stack } from 'expo-router'
import React from 'react'
import { RootStackParamList } from './Navigation';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomePage from '@/screen/Tab/HomePage';
import Setting from '@/screen/Tab/Setting';
import StudyingScreen from '@/screen/Tab/Studying';
import FlashCardSession from '@/screen/Resources/FlashCardSession';

export default function StudyingNavigators() {
    const Stack = createNativeStackNavigator<RootStackParamList>();
    return (
        <Stack.Navigator initialRouteName="StudyingHome" screenOptions={{ headerShown: false }}>
            <Stack.Screen name="StudyingHome" component={StudyingScreen} />
            <Stack.Screen
                name="FlashCardSession"
                component={FlashCardSession}
                options={{
                    headerShown: false,
                    gestureEnabled: false, // Prevent swipe back during session
                }}
            />
            {/* <Stack.Screen name="Setting" component={Setting}  /> */}
        </Stack.Navigator>
    )
}
