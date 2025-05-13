import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, FlatList } from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { Header } from '../components/ui/Header';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/navigation';


const recentTags = ['truffle', 'moisture fresh', 'moisture', 'w...'];
const resources = [
  { label: 'ChatGPT', icon: <Ionicons name="chatbubble-ellipses" size={24} color="#fff" />, color: '#00C853', destination: 'Settings' },
  { label: 'Sách', icon: <Ionicons name="book" size={24} color="#fff" />, color: '#00B8D4', destination: 'Sách' },
  { label: 'Tin tức', icon: <MaterialIcons name="article" size={24} color="#fff" />, color: '#FFB300', destination: 'Vocabulary' },
  { label: 'Bài nghe', icon: <Ionicons name="headset" size={24} color="#fff" />, color: '#AB47BC', destination: 'Bài nghe' },
  { label: 'Game', icon: <FontAwesome5 name="gamepad" size={24} color="#fff" />, color: '#7E57C2', destination: 'Game' },
  // Add more as needed
];

export default function HomePage({ navigation }: { navigation: any }) {
  // const navigation = useNavigation<NavigationProp<RootStackParamList>>();
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
      <View style={styles.reviewBox}>
        <Text style={styles.reviewTitle}>Đã đến lúc ôn tập</Text>
        <Text style={styles.reviewCount}>5 từ</Text>
        <TouchableOpacity style={styles.reviewBtn}>
          <Text style={styles.reviewBtnText}>Ôn tập ngay</Text>
        </TouchableOpacity>
      </View>

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
  fab: { position: 'absolute', bottom: 24, right: 24, backgroundColor: '#00CFFF', borderRadius: 32, width: 56, height: 56, alignItems: 'center', justifyContent: 'center', elevation: 4 },
});