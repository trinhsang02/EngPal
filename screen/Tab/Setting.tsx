import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Switch, ScrollView, Platform } from 'react-native';
import { MaterialIcons, FontAwesome5, Ionicons, FontAwesome, Entypo, Feather } from '@expo/vector-icons';
import { Header } from '../../components/ui/Header';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/Navigation';
import DateTimePicker from '@react-native-community/datetimepicker';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Setting'>;

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

interface SettingItemProps {
  icon: React.ReactNode;
  text: string;
  onPress: () => void;
}

const SettingItem: React.FC<SettingItemProps> = ({ icon, text, onPress }) => (
  <TouchableOpacity style={styles.settingItem} onPress={onPress}>
    {icon}
    <Text style={styles.settingText}>{text}</Text>
    <MaterialIcons name="keyboard-arrow-right" size={28} color="#bbb" style={styles.settingArrow} />
  </TouchableOpacity>
);

const SETTINGS = [
  {
    icon: <MaterialIcons name="language" size={22} color="#1ABC9C" style={styles.settingIcon} />,
    text: 'Ngôn ngữ mẹ đẻ',
    screen: 'Language' as const,
  },
  {
    icon: <FontAwesome5 name="graduation-cap" size={20} color="#FF914D" style={styles.settingIcon} />,
    text: 'Trình độ',
    screen: 'Level' as const,
  },
  {
    icon: <Entypo name="flag" size={22} color="#3EC6E0" style={styles.settingIcon} />,
    text: 'Mục tiêu học',
    screen: 'Goal' as const,
  },
  {
    icon: <Feather name="grid" size={22} color="#1A56DB" style={styles.settingIcon} />,
    text: 'Các chủ đề',
    screen: 'Topics' as const,
  },
];

const INFO_SETTINGS = [
  {
    icon: <MaterialIcons name="info" size={22} color="#9B4DFF" style={styles.settingIcon} />,
    text: 'Điều khoản sử dụng',
    screen: 'Terms' as const,
  },
  {
    icon: <MaterialIcons name="privacy-tip" size={22} color="#1ABC9C" style={styles.settingIcon} />,
    text: 'Chính sách bảo mật',
    screen: 'Privacy' as const,
  },
  {
    icon: <FontAwesome5 name="phone" size={20} color="#FF914D" style={styles.settingIcon} />,
    text: 'Contact us',
    screen: 'Contact' as const,
  },
];

function formatTime(date: Date) {
  const h = date.getHours().toString().padStart(2, '0');
  const m = date.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
}

export default function SettingsScreen() {
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const now = new Date();
  const [reminderTime, setReminderTime] = useState(new Date(now.setHours(21, 30, 0, 0)));
  const [showTimePicker, setShowTimePicker] = useState(false);
  const navigation = useNavigation<NavigationProp>();

  const onChangeTime = (event: any, selectedDate?: Date) => {
    setShowTimePicker(false);
    if (selectedDate) {
      const newTime = new Date(reminderTime);
      newTime.setHours(selectedDate.getHours());
      newTime.setMinutes(selectedDate.getMinutes());
      newTime.setSeconds(0);
      newTime.setMilliseconds(0);
      setReminderTime(newTime);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}

      <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
        <View style={{ padding: 16, backgroundColor: '#ffffff' }}>
          <Header />
        </View>
        {/* User Card */}
        <TouchableOpacity
          style={styles.userCard}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('UserDetail', { name: 'User', email: 'abc@gmail.com', id: '1234567890' })}
        >
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
        {SETTINGS.map((setting, index) => (
          <SettingItem
            key={index}
            icon={setting.icon}
            text={setting.text}
            onPress={() => navigation.navigate(setting.screen)}
          />
        ))}

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
          <TouchableOpacity
            style={styles.reminderTimeRow}
            onPress={() => setShowTimePicker(true)}
          >
            <Text style={styles.reminderTimeLabel}>Đặt giờ</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.reminderTime}>{formatTime(reminderTime)}</Text>
              <MaterialIcons name="keyboard-arrow-right" size={24} color="#bbb" />
            </View>
          </TouchableOpacity>
          <Text style={styles.reminderNote}>
            Bạn đang tắt thông báo nên không thể nhận được thông báo nhắc học. Bấm vào đây để mở lại
          </Text>
        </View>
        {showTimePicker && (
          <DateTimePicker
            value={reminderTime}
            mode="time"
            is24Hour={true}
            display={Platform.OS === 'ios' ? 'spinner' : 'clock'}
            onChange={onChangeTime}
          />
        )}

        {/* Information Section */}
        <Text style={styles.sectionTitle}>Thông tin</Text>
        {INFO_SETTINGS.map((setting, index) => (
          <SettingItem
            key={index}
            icon={setting.icon}
            text={setting.text}
            onPress={() => navigation.navigate(setting.screen)}
          />
        ))}
      </ScrollView>
    </View>
  );
}