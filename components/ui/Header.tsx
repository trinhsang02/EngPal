import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export function Header() {
    return (
    <View style={styles.container}>
        <View style={styles.header}>
            <Text style={styles.appName}>EngPal</Text>
            <View style={styles.headerRight}>
                <Ionicons name="notifications-outline" size={28} color="#333" />
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                        4
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