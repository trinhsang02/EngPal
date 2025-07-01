import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useOxfordDatabase } from '../../hooks/useOxfordDatabase';

export default function StudyingScreen() {
  const navigation = useNavigation();
  const {
    getStudyStatistics,
    getRecentWords,
    initializeDatabase,
    isDbReady
  } = useOxfordDatabase();

  const [studyData, setStudyData] = useState({
    learnedToday: 0,
    dailyGoal: 20,
    wordsToReview: 0,
    memoryLevels: [] as Array<{ level: number; count: number; label: string }>,
    totalWords: 0,
    masteredWords: 0,
  });
  const [recentWords, setRecentWords] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadStudyData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [statistics, recent] = await Promise.all([
        getStudyStatistics(),
        getRecentWords(5)
      ]);

      setStudyData({
        ...statistics,
        dailyGoal: 20
      });
      setRecentWords(recent.map(word => word.word));
    } catch (error) {
      console.error('Error loading study data:', error);
      Alert.alert('Error', 'Failed to load study data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [getStudyStatistics, getRecentWords]);

  useEffect(() => {
    if (isDbReady) {
      loadStudyData();
    } else {
      initializeDatabase();
    }
  }, [isDbReady, loadStudyData, initializeDatabase]);

  // Refresh data when screen is focused
  useFocusEffect(
    useCallback(() => {
      if (isDbReady) {
        loadStudyData();
      }
    }, [isDbReady, loadStudyData])
  );

  const handleStartReview = () => {
    if (studyData.wordsToReview === 0) {
      Alert.alert('No Words to Review', 'You have no words due for review right now. Try learning new words first!');
      return;
    }
    (navigation as any).navigate('FlashCardSession', {
      sessionType: 'review',
      wordCount: studyData.wordsToReview
    });
  };

  const handleLearnNew = () => {
    (navigation as any).navigate('FlashCardSession', {
      sessionType: 'new',
      wordCount: 10
    });
  };

  const handleMixedPractice = () => {
    (navigation as any).navigate('FlashCardSession', {
      sessionType: 'mixed',
      wordCount: 15
    });
  };

  const handleWordPress = (word: string) => {
    // Navigate to word detail or vocab list filtered by this word
    (navigation as any).navigate('Vocab');
  };

  const progress = studyData.learnedToday / studyData.dailyGoal;

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={styles.loadingText}>Loading your progress...</Text>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <View style={styles.headerTopRow}>
            <ThemedText style={styles.headerTitle}>EngPal</ThemedText>
            <View style={styles.headerIcons}>
              <TouchableOpacity>
                <View>
                  <Ionicons name="notifications-outline" size={24} color="white" />
                  <View style={styles.notificationBadge}>
                    <Text style={styles.notificationText}>4</Text>
                  </View>
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={{ marginLeft: 16 }}>
                <MaterialCommunityIcons name="format-letter-case" size={28} color="white" />
              </TouchableOpacity>
            </View>
          </View>
          <ThemedText style={styles.headerSubtitle}>
            Học ít - Nhớ sâu từ vựng với phương pháp khoa học{' '}
            <ThemedText style={{ fontWeight: 'bold' }}>Spaced Repetition </ThemedText>
            <Ionicons name="information-circle-outline" size={16} color="white" />
          </ThemedText>
        </View>

        {/* Main Content Area */}
        <View style={styles.contentArea}>
          {/* Stats Card */}
          <View style={styles.card}>
            <View style={styles.statsHeader}>
              <View>
                <ThemedText style={styles.cardTitle}>Đã học hôm nay</ThemedText>
                <ThemedText style={styles.statsCount}>
                  <Text style={styles.learnedCount}>{studyData.learnedToday}</Text>
                  /{studyData.dailyGoal}
                </ThemedText>
              </View>
              {/* Simple Circular Progress */}
              <View style={styles.progressContainer}>
                <View style={[styles.progressRing, { transform: [{ rotate: `${progress * 360}deg` }] }]} />
                <View style={styles.progressRingBackground} />
                <Text style={styles.progressText}>{Math.round(progress * 100)}%</Text>
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{studyData.totalWords}</Text>
                <Text style={styles.statLabel}>Total Words</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{studyData.masteredWords}</Text>
                <Text style={styles.statLabel}>Mastered</Text>
              </View>
            </View>

            <View style={styles.separator} />
            <ThemedText style={styles.cardTitle}>Cấp độ nhớ</ThemedText>
            <View style={styles.barChartContainer}>
              {studyData.memoryLevels.map((level, index) => {
                // Calculate max count for proportional height
                const maxCount = Math.max(...studyData.memoryLevels.map(l => l.count), 1);
                const barHeight = Math.max((level.count / maxCount) * 50, 8); // Max height 50, min height 8

                return (
                  <View key={index} style={styles.barContainer}>
                    <ThemedText style={styles.barLabelTop}>{level.count}</ThemedText>
                    <View style={[
                      styles.bar,
                      {
                        height: barHeight,
                        backgroundColor: level.count > 0 ? '#4A90E2' : '#E5E7EB'
                      }
                    ]} />
                    <ThemedText style={styles.barLabelBottom}>{level.label}</ThemedText>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Review Card */}
          <View style={[styles.card, styles.reviewCard]}>
            <View style={styles.reviewTextContainer}>
              {/* <Ionicons name="information-circle" size={20} color="#4A90E2" style={{ marginRight: 8 }} /> */}
              <ThemedText style={styles.reviewTitle}>
                {studyData.wordsToReview > 0 ? 'Đã đến lúc ôn tập' : 'Không có từ cần ôn tập'}
              </ThemedText>
              <ThemedText style={styles.reviewCount}>{studyData.wordsToReview} từ</ThemedText>
              <TouchableOpacity
                style={[styles.reviewButton, studyData.wordsToReview === 0 && styles.reviewButtonDisabled]}
                onPress={handleStartReview}
                disabled={studyData.wordsToReview === 0}
              >
                <Text style={[styles.reviewButtonText, studyData.wordsToReview === 0 && styles.reviewButtonTextDisabled]}>
                  {studyData.wordsToReview > 0 ? 'Ôn tập ngay' : 'Không có từ'}
                </Text>
              </TouchableOpacity>
            </View>
            <Image source={require('@/assets/images/homework.png')} style={styles.reviewImage} resizeMode="contain" />
          </View>

          {/* Flashcard Session Options */}
          <View style={styles.card}>
            <ThemedText style={styles.cardTitle}>Phiên học Flashcard</ThemedText>
            <View style={styles.sessionOptionsContainer}>
              <TouchableOpacity style={styles.sessionOption} onPress={handleLearnNew}>
                <View style={[styles.sessionIconContainer, { backgroundColor: '#10B981' }]}>
                  <Ionicons name="add-circle" size={24} color="white" />
                </View>
                <Text style={styles.sessionOptionTitle}>Học từ mới</Text>
                <Text style={styles.sessionOptionDesc}>10 từ mới</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.sessionOption} onPress={handleStartReview}>
                <View style={[styles.sessionIconContainer, { backgroundColor: '#F59E0B' }]}>
                  <Ionicons name="refresh-circle" size={24} color="white" />
                </View>
                <Text style={styles.sessionOptionTitle}>Ôn tập</Text>
                <Text style={styles.sessionOptionDesc}>{studyData.wordsToReview} từ</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.sessionOption} onPress={handleMixedPractice}>
                <View style={[styles.sessionIconContainer, { backgroundColor: '#8B5CF6' }]}>
                  <Ionicons name="shuffle" size={24} color="white" />
                </View>
                <Text style={styles.sessionOptionTitle}>Luyện tập</Text>
                <Text style={styles.sessionOptionDesc}>Trộn lẫn</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Recent Words */}
          <View style={styles.recentWordsContainer}>
            {/* <ThemedText style={styles.recentWordsTitle}>Các từ gần đây</ThemedText> */}
            {recentWords.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
                {recentWords.map((word, index) => (
                  <TouchableOpacity key={index} style={styles.wordChip} onPress={() => handleWordPress(word)}>
                    <ThemedText style={styles.wordChipText}>{word}</ThemedText>
                    <Ionicons name="open-outline" size={16} color="#4A90E2" />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : (
              <View style={styles.emptyRecentWords}>
                <Text style={styles.emptyRecentText}>Bắt đầu học để xem các từ gần đây</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  scrollContainer: {
    paddingBottom: 30,
  },
  headerContainer: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 70,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    right: -4,
    top: -4,
    backgroundColor: 'red',
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: 'white',
    fontSize: 16,
    marginTop: 8,
    opacity: 0.9,
  },
  contentArea: {
    marginTop: -50,
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  statsCount: {
    fontSize: 20,
    color: '#888',
    marginTop: 4,
  },
  learnedCount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  progressContainer: {
    width: 60,
    height: 60,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressRingBackground: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 6,
    borderColor: '#EAEAEA',
    position: 'absolute',
  },
  progressRing: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 6,
    borderColor: '#4A90E2',
    position: 'absolute',
    borderLeftColor: 'transparent',
    borderBottomColor: 'transparent',
    borderRightColor: 'transparent',
  },
  progressText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  separator: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 15,
  },
  barChartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    marginTop: 15,
    paddingHorizontal: 10,
    height: 100,
    backgroundColor: '#FAFBFC',
    borderRadius: 8,
    paddingVertical: 10,
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
    maxWidth: 50,
  },
  barLabelTop: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 6,
    fontWeight: '600',
  },
  bar: {
    width: 20,
    borderRadius: 3,
    marginBottom: 8,
    minHeight: 8,
  },
  barLabelBottom: {
    fontSize: 9,
    color: '#374151',
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 12,
  },
  reviewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 25,
  },
  reviewTextContainer: {
    flex: 1,
  },
  reviewTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  reviewCount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4A90E2',
    marginVertical: 8,
  },
  reviewButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    alignSelf: 'flex-start',
  },
  reviewButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  reviewButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  reviewButtonTextDisabled: {
    color: '#6B7280',
  },
  reviewImage: {
    width: 100,
    height: 100,
  },
  sessionOptionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  sessionOption: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 5,
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
  },
  sessionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  sessionOptionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  sessionOptionDesc: {
    fontSize: 12,
    color: '#6B7280',
  },
  recentWordsContainer: {
    marginTop: 10,
  },
  recentWordsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  wordChip: {
    backgroundColor: '#E9F2FF',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  wordChipText: {
    color: '#4A90E2',
    fontWeight: '600',
    fontSize: 16,
    marginRight: 8,
  },
  emptyRecentWords: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: 'center',
  },
  emptyRecentText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
});