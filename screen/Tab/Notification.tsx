import React from 'react';
import { View, Text, StyleSheet, FlatList, Image } from 'react-native';

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

export default function NotificationScreen() {
    return (
        <View style={styles.container}>
            {/* Header */}
            <FlatList
                data={notifications}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <View style={styles.row}>

                            <View style={{ flex: 1 }}>
                                <View style={styles.row}>
                                    <Text style={styles.appName}>EngPal</Text>
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
    container: { flex: 1, backgroundColor: '#fff' },
    card: { backgroundColor: '#fff', borderRadius: 8, padding: 16, marginHorizontal: 12, marginTop: 12, elevation: 1, borderWidth: 1, borderColor: '#f2f2f2' },
    row: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
    icon: { width: 40, height: 40, borderRadius: 20, marginRight: 12, backgroundColor: '#eee' },
    appName: { fontWeight: 'bold', fontSize: 16, marginRight: 8 },
    time: { color: '#888', fontSize: 13 },
    greeting: { fontWeight: 'bold', fontSize: 15, marginTop: 2 },
    message: { fontSize: 15, color: '#222', marginTop: 2 },
});