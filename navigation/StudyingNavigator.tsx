import { Stack } from 'expo-router'
import React from 'react'
import { RootStackParamList } from './navigation';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomePage from '@/screen/HomePage';
import Setting from '@/screen/Setting';
import StudyingScreen from '@/screen/Tab/Studying';

export default function StudyingNavigators() {
    const Stack = createNativeStackNavigator<RootStackParamList>();
    return (
        <Stack.Navigator initialRouteName="Studying" screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Studying" component={StudyingScreen}  />  
            {/* <Stack.Screen name="Setting" component={Setting}  /> */}
        </Stack.Navigator>
    )
}
