import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { useOxfordDatabase } from '@/hooks/useOxfordDatabase';
import { WordDetail } from '@/services/oxfordDatabase';

export const VocabDetail = ({ route }: any) => {
  const navigation = useNavigation();
  const { wordId } = route.params as { wordId: number };

  const {
    isLoading: dbLoading,
    error,
    getWordDetail,
    updateMasteredStatus,
    clearError
  } = useOxfordDatabase();

  const [wordDetails, setWordDetails] = useState<WordDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  // Fetch word details from database
  useEffect(() => {
    const fetchWordDetails = async () => {
      try {
        setIsLoading(true);
        const details = await getWordDetail(wordId);
        if (details) {
          setWordDetails(details);
        } else {
          Alert.alert('Not Found', 'Word not found in database');
        }
      } catch (error) {
        console.error('Failed to fetch word details:', error);
        Alert.alert('Error', 'Could not load word details. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchWordDetails();
  }, [wordId, getWordDetail]);

  // Hiển thị error nếu có
  useEffect(() => {
    if (error) {
      Alert.alert('Database Error', error, [
        { text: 'OK', onPress: clearError }
      ]);
    }
  }, [error, clearError]);

  async function playSound(uri: string) {
    if (!uri) {
      Alert.alert("No Sound", "Audio for this pronunciation is not available.");
      return;
    }
    console.log('Loading Sound:', uri);
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
      });
      const { sound } = await Audio.Sound.createAsync({ uri });
      setSound(sound);
      console.log('Playing Sound');
      await sound.playAsync();
    } catch (error) {
      console.error("Failed to play sound", error);
      Alert.alert("Error", "Could not play the sound.");
    }
  }

  useEffect(() => {
    return sound ? () => { sound.unloadAsync(); } : undefined;
  }, [sound]);

  const handleToggleMastered = async () => {
    if (!wordDetails) return;

    const newMasteredState = !wordDetails.mastered;
    try {
      await updateMasteredStatus(wordDetails.id, newMasteredState);
      setWordDetails(prev => prev ? { ...prev, mastered: newMasteredState } : null);
    } catch (error) {
      console.error("Failed to update status", error);
      Alert.alert("Error", "Could not update status. Please try again.");
    }
  };

  useEffect(() => {
    navigation.setOptions({
      title: '',
      headerRight: () => (
        <TouchableOpacity onPress={handleToggleMastered} style={{ marginRight: 15 }}>
          <MaterialIcons
            name={wordDetails?.mastered ? "star" : "star-border"}
            size={28}
            color={wordDetails?.mastered ? "#FFD700" : "#888"}
          />
        </TouchableOpacity>
      ),
    });
  }, [navigation, wordDetails?.mastered, handleToggleMastered]);

  if (dbLoading || isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={{ marginTop: 16, fontSize: 16, color: '#666' }}>
          {dbLoading ? 'Initializing database...' : 'Loading word details...'}
        </Text>
      </View>
    );
  }

  if (!wordDetails) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ fontSize: 18, color: '#666' }}>Word not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.headerSection}>
        <Text style={styles.word}>{wordDetails.word}</Text>
        <Text style={styles.pos}>{wordDetails.pos}</Text>

        <View style={styles.phoneticsContainer}>
          {wordDetails.phonetic_text && (
            <TouchableOpacity style={styles.phoneticRow} onPress={() => playSound(wordDetails.phonetic)}>
              <Text style={styles.phoneticLabel}>UK</Text>
              <Text style={styles.phoneticText}>{wordDetails.phonetic_text}</Text>
              <Ionicons name="volume-medium-outline" size={22} color="#4A90E2" />
            </TouchableOpacity>
          )}
          {wordDetails.phonetic_am_text && (
            <TouchableOpacity style={styles.phoneticRow} onPress={() => playSound(wordDetails.phonetic_am)}>
              <Text style={styles.phoneticLabel}>US</Text>
              <Text style={styles.phoneticText}>{wordDetails.phonetic_am_text}</Text>
              <Ionicons name="volume-medium-outline" size={22} color="#4A90E2" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {wordDetails.senses.map((sense: any, index: number) => (
        <View key={sense.id} style={styles.senseCard}>
          <Text style={styles.definition}>
            <Text style={styles.senseNumber}>{index + 1}. </Text>
            {sense.definition}
          </Text>
          {sense.examples?.map((example: any) => (
            <View key={example.id} style={styles.exampleContainer}>
              <Text style={styles.exampleText}>• {example.example}</Text>
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F8',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  headerSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  word: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2d3748',
  },
  pos: {
    fontSize: 18,
    fontStyle: 'italic',
    color: '#718096',
    marginTop: 4,
    marginBottom: 16,
  },
  phoneticsContainer: {
    marginTop: 8,
  },
  phoneticRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  phoneticLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A90E2',
    marginRight: 12,
    width: 30,
  },
  phoneticText: {
    fontSize: 18,
    color: '#4a5568',
    flex: 1,
  },
  senseCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  definition: {
    fontSize: 18,
    lineHeight: 28,
    color: '#2d3748',
    marginBottom: 16,
  },
  senseNumber: {
    fontWeight: 'bold',
  },
  exampleContainer: {
    marginLeft: 10,
    paddingLeft: 10,
    borderLeftWidth: 2,
    borderLeftColor: '#E2E8F0',
    marginBottom: 10,
  },
  exampleText: {
    fontSize: 16,
    color: '#4a5568',
    lineHeight: 24,
    fontStyle: 'italic',
  }
});
