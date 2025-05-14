import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, FlatList } from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { Header } from '../../components/ui/Header';
import { RootStackParamList } from '../../navigation/navigation';
import { useState } from 'react';


const recentTags = ['truffle', 'moisture fresh', 'moisture', 'w...'];
const resources = [
  { label: 'Vocabulary', icon: <MaterialIcons name="menu-book" size={24} color="#fff" />, color: '#FFB300', destination: 'Vocabulary' }, 
  { label: 'Bài tập', icon: <MaterialIcons name="assignment" size={24} color="#fff" />, color: '#00B8D4', destination: 'Exercise' }, 
  { label: 'Ngữ pháp', icon: <MaterialIcons name="check" size={24} color="#fff" />, color: '#AB47BC', destination: 'Grammar' },
  { label: 'Game', icon: <FontAwesome5 name="gamepad" size={24} color="#fff" />, color: '#7E57C2', destination: 'Game' },
  { label: 'Tư vấn', icon: <Ionicons name="chatbubble-ellipses" size={24} color="#fff" />, color: '#00C853', destination: 'Settings' },
  { label: 'Tư vấn', icon: <Ionicons name="chatbubble-ellipses" size={24} color="#fff" />, color: '#00C853', destination: 'Settings' },
  // Add more as needed
];

export default function HomePage({ navigation }: { navigation: any }) {
  // const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);      
  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <Header />

      {/* Dictionary Search */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Từ điển</Text>
          <Ionicons name="settings-outline" size={20} color="#888" />
        </View>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#888" />
          <TextInput style={styles.input} placeholder="Tra từ điển" />
          <Ionicons name="mic-outline" size={20} color="#888" />
        </View>
        <View style={styles.tagsRow}>
          {recentTags.map(tag => (
            <View key={tag} style={styles.tag}><Text>{tag}</Text></View>
          ))}
        </View>
      </View>

      {/* Review Reminder */}
      {isUserLoggedIn ? (
        <View style={styles.reviewBox}>
          <Text style={styles.reviewTitle}>Đã đến lúc ôn tập</Text>
          <Text style={styles.reviewCount}>5 từ</Text>
          <TouchableOpacity style={styles.reviewBtn}>
            <Text style={styles.reviewBtnText}>Ôn tập ngay</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.loginPrompt}>
          <Text style={styles.loginText}>Bạn chưa đăng nhập. Vui lòng đăng nhập để cá nhân hóa lộ trình học tập của bạn.</Text>
          <TouchableOpacity style={styles.loginBtn} onPress={() => navigation.navigate('SignIn')}>
            <Text style={styles.loginBtnText}>Đăng nhập</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Learning Resources */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Nguồn học</Text>
          <Text style={styles.link}>Cách học</Text>
        </View>
        <View style={styles.resourcesGrid}>
          {resources.map((res, idx) => (
            <TouchableOpacity key={idx} style={[styles.resourceItem, { backgroundColor: res.color }]} onPress={() => navigation.navigate(res.destination as keyof RootStackParamList)}>
              {res.icon}
              <Text style={styles.resourceLabel}>{res.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>


      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab}>
        <Ionicons name="flame" size={28} color="#fff" />
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold' },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f3f4', borderRadius: 8, padding: 8 },
  input: { flex: 1, marginHorizontal: 8 },
  tagsRow: { flexDirection: 'row', marginTop: 8, flexWrap: 'wrap' },
  tag: { backgroundColor: '#e0e0e0', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 4, marginRight: 8, marginBottom: 8 },
  reviewBox: { backgroundColor: '#f5faff', borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 24 },
  reviewTitle: { fontSize: 16, color: '#333', marginBottom: 4 },
  reviewCount: { color: 'red', fontWeight: 'bold', fontSize: 16, marginBottom: 8 },
  reviewBtn: { backgroundColor: '#4285F4', borderRadius: 24, paddingHorizontal: 32, paddingVertical: 12 },
  reviewBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  link: { color: '#4285F4', fontSize: 14 },
  resourcesGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  resourceItem: { width: '30%', aspectRatio: 1, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  resourceLabel: { color: '#fff', marginTop: 8, fontWeight: 'bold' },
  fab: { position: 'absolute', bottom: -50, right: 24, backgroundColor: '#00CFFF', borderRadius: 32, width: 56, height: 56, alignItems: 'center', justifyContent: 'center', elevation: 4 },
  loginPrompt: { alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  loginText: { color: '#333', marginBottom: 16 },
  loginBtn: { backgroundColor: '#4285F4', borderRadius: 24, paddingHorizontal: 32, paddingVertical: 12 },
  loginBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});