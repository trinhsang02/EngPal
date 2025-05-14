import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";

export function Header() {
    const navigation = useNavigation();
    const [notificationCount, setNotificationCount] = useState(4);
    
    return (
    <View style={styles.container}>
        <View style={styles.header}>
            <Text style={styles.appName}>EngPal</Text>
            <View style={styles.headerRight}>
                <TouchableOpacity onPress={() => navigation.navigate('Notification' as never)}>  
                    <Ionicons name="notifications-outline" size={28} color="#333" />
                </TouchableOpacity>
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                        {notificationCount}
                    </Text>
                </View>
            </View>
        </View>
    </View>
    )
}

const styles = StyleSheet.create({
    container: { backgroundColor: '#fff' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    appName: { fontSize: 28, fontWeight: 'bold', color: '#4285F4' },
    headerRight: { position: 'relative' },
    badge: { position: 'absolute', top: -6, right: -6, backgroundColor: 'red', borderRadius: 8, paddingHorizontal: 4 },
    badgeText: { color: '#fff', fontSize: 12 },
});