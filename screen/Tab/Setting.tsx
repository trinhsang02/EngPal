import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Switch, ScrollView } from 'react-native';
import { MaterialIcons, FontAwesome5, Ionicons, FontAwesome, Entypo, Feather } from '@expo/vector-icons';
import { Header } from '../../components/ui/Header';


export default function SettingsScreen({ navigation }: { navigation: any }) {
  const [reminderEnabled, setReminderEnabled] = useState(false);
  return (
    <View style={styles.container}>
      {/* Header */}

      <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
      <View style={{ padding: 16, backgroundColor: '#ffffff' }}>
        <Header />
      </View>
        {/* User Card */}
        <TouchableOpacity style={styles.userCard} activeOpacity={0.8} onPress={() => navigation.navigate('UserDetail' , { name: 'User', email: 'abc@gmail.com', id: '1234567890' })}>
          <FontAwesome5 name="user-circle" size={60} color="#4F8EF7" style={styles.avatar} />
          <View style={{ flex: 1 }}>
            <Text style={styles.userName}>User</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
              <FontAwesome name="google" size={16} color="#4285F4" />
              <Text style={styles.userEmail}> abc@gmail.com</Text>
            </View>
            <Text style={styles.userId}>ID: 1234567890</Text>
          </View>
          <MaterialIcons name="keyboard-arrow-right" size={28} color="#bbb" />
        </TouchableOpacity>

        {/* Settings List */}
        <Text style={styles.sectionTitle}>Cài đặt</Text>
        <View style={styles.settingItem}>
          <MaterialIcons name="language" size={22} color="#1ABC9C" style={styles.settingIcon} />
          <Text style={styles.settingText}>Ngôn ngữ mẹ đẻ</Text>
          <MaterialIcons name="keyboard-arrow-right" size={28} color="#bbb" style={styles.settingArrow} />
        </View>
        <View style={styles.settingItem}>
          <FontAwesome5 name="graduation-cap" size={20} color="#FF914D" style={styles.settingIcon} />
          <Text style={styles.settingText}>Trình độ</Text>
          <MaterialIcons name="keyboard-arrow-right" size={28} color="#bbb" style={styles.settingArrow} />
        </View>
        <View style={styles.settingItem}>
          <Entypo name="flag" size={22} color="#3EC6E0" style={styles.settingIcon} />
          <Text style={styles.settingText}>Mục tiêu học</Text>
          <MaterialIcons name="keyboard-arrow-right" size={28} color="#bbb" style={styles.settingArrow} />
        </View>
        <View style={styles.settingItem}>
          <Feather name="grid" size={22} color="#1A56DB" style={styles.settingIcon} />
          <Text style={styles.settingText}>Các chủ đề</Text>
          <MaterialIcons name="keyboard-arrow-right" size={28} color="#bbb" style={styles.settingArrow} />
        </View>

        {/* Reminder Section */}
        <View style={styles.reminderSection}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MaterialIcons name="alarm" size={22} color="#F44336" style={styles.settingIcon} />
            <Text style={styles.reminderTitle}>Nhắc nhở</Text>
            <View style={{ flex: 1 }} />
            <Switch
              value={reminderEnabled}
              onValueChange={setReminderEnabled}
              trackColor={{ false: '#ccc', true: '#F44336' }}
              thumbColor={reminderEnabled ? '#F44336' : '#f4f3f4'}
            />
          </View>
          <View style={styles.reminderTimeRow}>
            <Text style={styles.reminderTimeLabel}>Đặt giờ</Text>
            <TouchableOpacity>
              <Text style={styles.reminderTime}>21:30</Text>
              <MaterialIcons name="keyboard-arrow-right" size={24} color="#bbb" />
            </TouchableOpacity>
          </View>
          <Text style={styles.reminderNote}>
            Bạn đang tắt thông báo nên không thể nhận được thông báo nhắc học. Bấm vào đây để mở lại
          </Text>
        </View>

        {/* Information Section */}
        <Text style={styles.sectionTitle}>Thông tin</Text>
        <View style={styles.settingItem}>
          <MaterialIcons name="info" size={22} color="#9B4DFF" style={styles.settingIcon} />
          <Text style={styles.settingText}>Điều khoản sử dụng</Text>
          <MaterialIcons name="keyboard-arrow-right" size={28} color="#bbb" style={styles.settingArrow} />
        </View>
        <View style={styles.settingItem}>
          <MaterialIcons name="privacy-tip" size={22} color="#1ABC9C" style={styles.settingIcon} />
          <Text style={styles.settingText}>Chính sách bảo mật</Text>
          <MaterialIcons name="keyboard-arrow-right" size={28} color="#bbb" style={styles.settingArrow} />
        </View>
        <View style={styles.settingItem}>
          <FontAwesome5 name="phone" size={20} color="#FF914D" style={styles.settingIcon} />
          <Text style={styles.settingText}>Contact us</Text>
          <MaterialIcons name="keyboard-arrow-right" size={28} color="#bbb" style={styles.settingArrow} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafbfc' },
  headerWrap: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingTop: 32, paddingBottom: 12, backgroundColor: '#fff' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#2563eb', flex: 1, textAlign: 'left', marginLeft: 16 },
  bellIcon: { position: 'absolute', right: 24, top: 36 },
  userCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, padding: 16, marginHorizontal: 16, marginTop: 8, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },
  avatar: { width: 56, height: 56, borderRadius: 28, marginRight: 16, backgroundColor: '#eee' },
  userName: { fontWeight: 'bold', fontSize: 18, color: '#2563eb' },
  userEmail: { fontSize: 14, color: '#444', marginLeft: 4 },
  userId: { fontSize: 13, color: '#888', marginTop: 2 },
  proSection: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 14, marginHorizontal: 16, marginBottom: 12, elevation: 1 },
  proText: { fontWeight: 'bold', fontSize: 17, color: '#222' },
  sectionTitle: { fontWeight: 'bold', fontSize: 16, color: '#888', marginLeft: 20, marginTop: 18, marginBottom: 8 },
  settingItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, padding: 14, marginHorizontal: 16, marginTop: 10, elevation: 1 },
  settingIcon: { marginRight: 16 },
  settingText: { fontSize: 16, color: '#222', flex: 1 },
  settingArrow: {},
  reminderSection: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginHorizontal: 16, marginTop: 18, elevation: 1 },
  reminderTitle: { fontWeight: 'bold', fontSize: 16, color: '#F44336', marginLeft: 8 },
  reminderTimeRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12, marginBottom: 4 },
  reminderTimeLabel: { fontWeight: 'bold', fontSize: 15, color: '#888', flex: 1 },
  reminderTime: { fontWeight: 'bold', fontSize: 16, color: '#222', marginRight: 4 },
  reminderNote: { fontSize: 13, color: '#888', marginTop: 8, fontStyle: 'italic' },
});