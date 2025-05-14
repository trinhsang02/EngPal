import { Stack } from 'expo-router'
import React from 'react'
import { RootStackParamList } from './navigation';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomePage from '@/screen/Tab/HomePage';
import Setting from '@/screen/Tab/Setting';
import StudyingScreen from '@/screen/Tab/Studying';

export default function StudyingNavigators() {
    const Stack = createNativeStackNavigator<RootStackParamList>();
    return (
        <Stack.Navigator initialRouteName="StudyingHome" screenOptions={{ headerShown: false }}>
            <Stack.Screen name="StudyingHome" component={StudyingScreen} />
            {/* <Stack.Screen name="Setting" component={Setting}  /> */}
        </Stack.Navigator>
    )
}
