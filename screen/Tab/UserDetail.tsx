import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { Header } from '@/components/ui/Header';
import { MaterialIcons } from '@expo/vector-icons';

export default function UserDetailScreen() {
    const route = useRoute();
    const { name, email, id } = route.params as { name: string; email: string; id: string };

    return (
        <View style={{ flex: 1, backgroundColor: '#fafbfc' }}>
            <View style={styles.avatarSection}>
                <View style={styles.avatarWrap}>
                    <Image
                        source={require('@/assets/images/icon.png')}
                        style={styles.avatar}
                    />
                    <TouchableOpacity style={styles.editIcon}>
                        <MaterialIcons name="edit" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>
                <Text style={styles.userId}>ID {id}</Text>
            </View>
            <View style={styles.infoSection}>
                <Text style={styles.label}>TÊN</Text>
                <View style={styles.row}>
                    <Text style={styles.value}>{name}</Text>
                    <MaterialIcons name="edit" size={20} color="#bbb" style={{ marginLeft: 8 }} />
                </View>
                <Text style={styles.label}>KIỂU ĐĂNG NHẬP</Text>
                <View style={styles.row}>
                    <MaterialIcons name="email" size={20} color="#4285F4" />
                    <Text style={styles.value}>{email}</Text>
                </View>
            </View>
            <TouchableOpacity style={styles.logoutBtn}>
                <Text style={styles.logoutText}>ĐĂNG XUẤT</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteBtn}>
                <Text style={styles.deleteText}>Delete account</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    avatarSection: { alignItems: 'center', marginTop: 24, marginBottom: 16 },
    avatarWrap: { position: 'relative', marginBottom: 8 },
    avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#eee' },
    editIcon: {
        position: 'absolute', bottom: 0, right: 0,
        backgroundColor: '#2196f3', borderRadius: 16, padding: 4,
        borderWidth: 2, borderColor: '#fff'
    },
    userId: { fontSize: 16, color: '#888', marginTop: 4 },
    infoSection: { backgroundColor: '#fff', marginHorizontal: 0, padding: 20, borderRadius: 8 },
    label: { color: '#888', fontWeight: 'bold', marginTop: 16, marginBottom: 4 },
    row: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    value: { fontSize: 18, color: '#222' },
    logoutBtn: { marginTop: 32, alignItems: 'center' },
    logoutText: { color: '#d32f2f', fontWeight: 'bold', fontSize: 18 },
    deleteBtn: { marginTop: 16, alignItems: 'center' },
    deleteText: { color: '#d32f2f', fontSize: 16 },
});