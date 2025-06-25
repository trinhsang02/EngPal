import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Modal, Image } from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { Header } from '../../components/ui/Header';
import { RootStackParamList } from '../../navigation/Navigation';
import { loadVocabByLetter } from '@/utils/vocabLoader';
import { Vocab } from '@/types/vocab';
import * as Speech from 'expo-speech';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/store';
import { useOxfordDatabase } from '../../hooks/useOxfordDatabase';
import { useFocusEffect } from '@react-navigation/native';
import LearningGoalModal from '../../components/ui/LearningGoalModal';
import { setGoal, setTodayProgress, loadLearningGoal, checkAndUpdateStreak } from '../../store/userSlice';

const recentTags = ['truffle', 'moisture fresh', 'moisture', 'w...'];
const resources = [
  { label: 'Vocabulary', icon: <MaterialIcons name="menu-book" size={34} color="#fff" />, color: '#FFB300', destination: 'Vocabulary' },
  { label: 'Bài tập', icon: <MaterialIcons name="assignment" size={34} color="#fff" />, color: '#00B8D4', destination: 'Exercise' },
  { label: 'Ngữ pháp', icon: <FontAwesome5 name="graduation-cap" size={34} color="#fff" />, color: '#AB47BC', destination: 'Grammar' },
  { label: 'Review', icon: <Ionicons name="checkmark-circle" size={34} color="#fff" />, color: '#00C853', destination: 'Review' },
  { label: 'Tư vấn', icon: <Ionicons name="chatbubble-ellipses" size={34} color="#fff" />, color: '#00C853', destination: 'Chat' },
  { label: 'Game', icon: <FontAwesome5 name="gamepad" size={34} color="#fff" />, color: '#7E57C2', destination: 'Game' },
  { label: 'News', icon: <Ionicons name="chatbubble-ellipses" size={34} color="#fff" />, color: '#00C853', destination: 'Chat' },
  { label: 'Listening', icon: <Ionicons name="chatbubble-ellipses" size={34} color="#fff" />, color: '#00C853', destination: 'Chat' },
  // Add more as needed
];

export default function HomePage({ navigation }: { navigation: any }) {
  const user = useSelector((state: RootState) => state.user.user);
  const dispatch = useDispatch();
  const [search, setSearch] = useState('');
  const [result, setResult] = useState<Vocab | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [goalModalVisible, setGoalModalVisible] = useState(false);
  const [wordsToReview, setWordsToReview] = useState<number>(0);
  const [learnedToday, setLearnedToday] = useState<number>(0);
  const { getStudyStatistics } = useOxfordDatabase();

  useFocusEffect(
    React.useCallback(() => {
      const fetchStats = async () => {
        try {
          const stats = await getStudyStatistics();
          setWordsToReview(stats.wordsToReview || 0);
          setLearnedToday(stats.learnedToday || 0);
          dispatch(setTodayProgress(stats.learnedToday || 0));
          // Check and update streak when screen is focused
          dispatch(checkAndUpdateStreak());
        } catch (error) {
          setWordsToReview(0);
          setLearnedToday(0);
          dispatch(setTodayProgress(0));
        }
      };
      fetchStats();
    }, [getStudyStatistics])
  );

  useEffect(() => {
    dispatch(loadLearningGoal() as any);
  }, [dispatch]);

  const handleSearch = () => {
    if (search.length > 0) {
      const vocab = loadVocabByLetter(search[0]).find(
        (v: Vocab) => v.word.toLowerCase() === search.toLowerCase()
      );
      if (vocab) {
        setResult(vocab);
        setModalVisible(true);
      } else {
        setResult(null);
        setModalVisible(false);
      }
    } else {
      setResult(null);
      setModalVisible(false);
    }
  };

  const handleOpenGoalModal = () => {
    setGoalModalVisible(true);
  };

  const handleSetGoal = (newGoal: number) => {
    dispatch(setGoal(newGoal));
  };

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
          <TextInput
            style={styles.input}
            placeholder="Tra từ điển"
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={handleSearch}
          />
          <Ionicons name="mic-outline" size={20} color="#888" />
        </View>
        <View style={styles.tagsRow}>
          {recentTags.map(tag => (
            <View key={tag} style={styles.tag}><Text>{tag}</Text></View>
          ))}
        </View>
      </View>

      {/* Popup tra từ điển */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'flex-end', alignItems: 'center' }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 24, width: '85%', alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontWeight: 'bold', fontSize: 22 }}>{result?.word}</Text>
              <TouchableOpacity onPress={() => Speech.speak(result?.word || '')} style={{ marginLeft: 8 }}>
                <Ionicons name="volume-high" size={24} color="#2196f3" />
              </TouchableOpacity>
            </View>
            <Text style={{ color: '#2196f3', fontWeight: 'bold', marginBottom: 4 }}>
              {result?.pos?.toUpperCase()}
            </Text>
            <Text style={{ fontStyle: 'italic', color: '#888', marginBottom: 8 }}>{result?.phonetic_text}</Text>
            <View>
              {result?.senses?.map((sense, idx) => (
                <Text key={idx} style={{ marginTop: 4, fontSize: 16 }}>- {sense.definition}</Text>
              ))}
            </View>

            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={{ color: '#2196f3', marginTop: 16, fontWeight: 'bold' }}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Review Reminder */}
      {user?.isLoggedIn ? (
        <View style={[styles.reviewBox, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}>
          <View>
            <Text style={styles.reviewTitle}>{wordsToReview === 0 ? "Không có từ cần ôn tập" : "Đã đến lúc ôn tập"}</Text>
            <Text style={styles.reviewCount}>{wordsToReview} từ</Text>
            <TouchableOpacity
              style={[styles.reviewBtn, { backgroundColor: wordsToReview === 0 ? 'grey' : '#4285F4' }]}
              disabled={wordsToReview === 0}
              onPress={() => navigation.navigate('Studying' as keyof RootStackParamList)}
            >
              <Text style={styles.reviewBtnText}>{wordsToReview > 0 ? 'Ôn tập ngay' : 'Không có từ'}</Text>
            </TouchableOpacity>
          </View>
          <Image
            source={require('../../assets/images/homework.png')}
            style={{ width: 150, height: 150, marginLeft: 12 }}
            resizeMode="contain"
          />
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
            <TouchableOpacity
              key={idx}
              style={styles.resourceItem}
              onPress={() => navigation.navigate(res.destination as keyof RootStackParamList)}
            >
              <View style={[styles.iconCircle, { backgroundColor: res.color }]}>
                {res.icon}
              </View>
              <Text style={styles.resourceLabel}>{res.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={handleOpenGoalModal}>
        <Ionicons name="flame" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Learning Goal Modal */}
      <LearningGoalModal
        visible={goalModalVisible}
        onClose={() => setGoalModalVisible(false)}
        learnedToday={learnedToday}
      />
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
  reviewBtn: { backgroundColor: '#4285F4', borderRadius: 10, paddingHorizontal: 32, paddingVertical: 12 },
  reviewBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  link: { color: '#4285F4', fontSize: 14 },
  resourcesGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  resourceItem: {
    width: '24%',
    alignItems: 'center',
    marginBottom: 16,
  },
  resourceLabel: {
    color: '#333',
    fontWeight: 'bold',
    marginTop: 4,
  },
  fab: { position: 'absolute', bottom: -50, right: 24, backgroundColor: '#00CFFF', borderRadius: 32, width: 56, height: 56, alignItems: 'center', justifyContent: 'center', elevation: 4 },
  loginPrompt: { alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  loginText: { color: '#333', marginBottom: 16 },
  loginBtn: { backgroundColor: '#4285F4', borderRadius: 24, paddingHorizontal: 32, paddingVertical: 12 },
  loginBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});