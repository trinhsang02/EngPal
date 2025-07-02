import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { Provider } from 'react-redux';
import { useEffect, useState } from 'react';
import { TouchableOpacity, Text } from 'react-native';

import { useColorScheme } from '@/hooks/useColorScheme';
import StackNavigator from '@/navigation/StackNavigation';
import { store } from '@/store/store';
import { loadSavedState } from '@/store/userSlice';
import FloatingDictionaryModal from '../components/FloatingDictionaryModal';
import FloatingButton from '../components/FloatingButton';

export default function App() {
    const colorScheme = useColorScheme();
    const [loaded] = useFonts({
        SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    });
    const [modalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        // Load saved state when app starts
        store.dispatch(loadSavedState());
    }, []);

    if (!loaded) {
        // Async font loading only occurs in development.
        return null;
    }

    return (
        <Provider store={store}>
            <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                <StackNavigator />
                <StatusBar style="auto" />
                <FloatingButton onPress={() => setModalVisible(true)} />
                <FloatingDictionaryModal visible={modalVisible} onClose={() => setModalVisible(false)} />
            </ThemeProvider>
        </Provider>
    );
}
