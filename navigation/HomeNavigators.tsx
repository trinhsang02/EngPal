import { Stack } from 'expo-router'
import React from 'react'
import { RootStackParamList } from './Navigation';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomePage from '@/screen/Tab/HomePage';
import Setting from '@/screen/Tab/Setting';
import VocabScreen from '@/screen/Tab/Vocab';


export default function HomeNavigators() {
    const Stack = createNativeStackNavigator<RootStackParamList>();
    return (
        <Stack.Navigator initialRouteName="HomePage" screenOptions={{ headerShown: false }}>
            <Stack.Screen name="HomePage" component={HomePage} />
            <Stack.Screen name="Setting" component={Setting} />
            <Stack.Screen name="Vocabulary" component={VocabScreen} />
           
        </Stack.Navigator>
    )
}
