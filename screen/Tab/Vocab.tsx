import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Alert,
  TextInput,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useOxfordDatabase } from '../../hooks/useOxfordDatabase';
import { Word } from '../../services/oxfordDatabase';

const Vocab: React.FC = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const {
    isLoading,
    error,
    words,
    searchWords,
    getAllWords,
    updateMasteredStatus,
    clearError,
  } = useOxfordDatabase();

  const handleLoadWords = useCallback(async () => {
    try {
      console.log('Vocab: Loading all words...');
      const result = await getAllWords();
      console.log('Vocab: Loaded', result.length, 'words');

      // Log first few words to see their mastered status
      if (result.length > 0) {
        console.log('Vocab: First 3 words loaded:');
        result.slice(0, 3).forEach((word, index) => {
          console.log(`Word ${index + 1}: ${word.word}, mastered: ${word.mastered} (type: ${typeof word.mastered})`);
        });
      }
    } catch (err) {
      console.error('Vocab: Failed to load words:', err);
    }
  }, [getAllWords]);

  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      await searchWords(query.trim());
    } else {
      await getAllWords();
    }
  }, [searchWords, getAllWords]);

  // Load all words on first render after database is ready
  useEffect(() => {
    const loadWordsWhenReady = async () => {
      // Wait a bit for database initialization to complete
      setTimeout(() => {
        handleLoadWords();
      }, 100);
    };

    loadWordsWhenReady();
  }, [handleLoadWords]);

  // Refresh data when screen is focused
  useFocusEffect(
    useCallback(() => {
      if (searchQuery.trim()) {
        handleSearch(searchQuery);
      } else {
        handleLoadWords();
      }
    }, [searchQuery, handleSearch, handleLoadWords])
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      if (searchQuery.trim()) {
        await searchWords(searchQuery.trim());
      } else {
        await getAllWords();
      }
    } catch (err) {
      console.error('Refresh failed:', err);
    } finally {
      setRefreshing(false);
    }
  }, [searchQuery, searchWords, getAllWords]);

  const handleToggleMastered = useCallback(async (wordId: number, currentStatus: boolean) => {
    console.log('Toggling mastered status for word:', wordId, 'from', currentStatus, 'to', !currentStatus);

    try {
      const success = await updateMasteredStatus(wordId, !currentStatus);
      if (success) {
        console.log('Successfully updated mastered status for word:', wordId);
      } else {
        console.log('Failed to update mastered status for word:', wordId);
        Alert.alert('Error', 'Failed to update word status');
      }
    } catch (err) {
      console.error('Failed to update mastered status:', err);
      Alert.alert('Error', 'Failed to update word status');
    }
  }, [updateMasteredStatus]);

  const handleWordPress = useCallback((word: Word) => {
    console.log('Navigating to word detail for:', word.word, 'ID:', word.id);
    (navigation as any).navigate('VocabDetail', { wordId: word.id });
  }, [navigation]);

  const renderWordItem = useCallback(({ item }: { item: Word }) => (
    <TouchableOpacity
      onPress={() => handleWordPress(item)}
      style={styles.wordItem}
    >
      <View style={styles.wordContent}>
        <View style={styles.wordInfo}>
          <Text style={styles.wordText}>
            {item.word}
          </Text>
          <Text style={styles.posText}>
            {item.pos}
          </Text>
          {item.phonetic_text && (
            <Text style={styles.phoneticText}>
              {item.phonetic_text}
            </Text>
          )}
        </View>
        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation(); // Prevent word item press
            handleToggleMastered(item.id, item.mastered);
          }}
          style={item.mastered ? styles.starButtonMastered : styles.starButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name={item.mastered ? "star" : "star-outline"}
            size={24}
            color={item.mastered ? "#FCD34D" : "#D1D5DB"}
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  ), [handleWordPress, handleToggleMastered]);

  const keyExtractor = useCallback((item: Word) => item.id.toString(), []);

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={64} color="#EF4444" />
        <Text style={styles.errorTitle}>
          Oops! Something went wrong
        </Text>
        <Text style={styles.errorMessage}>
          {error}
        </Text>
        <TouchableOpacity
          onPress={() => {
            clearError();
            handleLoadWords();
          }}
          style={styles.retryButton}
        >
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="black" />
        <Text style={styles.backText}>Vocabulary</Text>
      </TouchableOpacity>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search vocabulary..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={handleSearch}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => handleSearch('')}
              style={styles.clearButton}
            >
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Word Count */}
      <View style={styles.countContainer}>
        <Text style={styles.countText}>
          {words.length} {searchQuery ? 'results' : 'words'}
          {searchQuery && ` for "${searchQuery}"`}
        </Text>
      </View>

      {isLoading && words.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading vocabulary...</Text>
        </View>
      ) : (
        <FlatList
          data={words}
          renderItem={renderWordItem}
          keyExtractor={keyExtractor}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#3B82F6']}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="search" size={64} color="#D1D5DB" />
              <Text style={styles.emptyTitle}>
                {searchQuery ? 'No words found' : 'No vocabulary available'}
              </Text>
              <Text style={styles.emptyMessage}>
                {searchQuery
                  ? 'Try searching with different keywords'
                  : 'Check your internet connection and try again'
                }
              </Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={10}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    marginLeft: 10,
    marginBottom: 4,
    alignSelf: 'flex-start',
  },
  backText: {
    color: 'black',
    fontSize: 25,
    marginLeft: 10,
    fontWeight: 'bold',
  },
  searchContainer: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    padding: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  clearButton: {
    marginLeft: 8,
    padding: 4,
  },
  countContainer: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  countText: {
    fontSize: 14,
    color: '#6B7280',
  },
  wordItem: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  wordContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  wordInfo: {
    flex: 1,
  },
  wordText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  posText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  phoneticText: {
    fontSize: 14,
    color: '#3B82F6',
    marginTop: 4,
  },
  starButton: {
    marginLeft: 16,
    padding: 8,
  },
  starButtonMastered: {
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#6B7280',
    marginTop: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
  },
  emptyMessage: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default Vocab;
