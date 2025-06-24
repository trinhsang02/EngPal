import React, { useState, useEffect } from 'react';
import {
    View,
    TextInput,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    StyleSheet,
} from 'react-native';
import { useOxfordDatabase } from '../../hooks/useOxfordDatabase';
import { Word, WordDetail } from '../../services/oxfordDatabase';
import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';

interface WordSearchProps {
    onWordSelect?: (word: WordDetail) => void;
}

export const WordSearch: React.FC<WordSearchProps> = ({ onWordSelect }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Word[]>([]);
    const [selectedWord, setSelectedWord] = useState<WordDetail | null>(null);
    const [isSearching, setIsSearching] = useState(false);

    const {
        isDbReady,
        isLoading,
        error,
        initializeDatabase,
        searchWords,
        getWordDetail,
        clearError,
    } = useOxfordDatabase();

    // Initialize database when component mounts
    useEffect(() => {
        if (!isDbReady) {
            initializeDatabase();
        }
    }, [isDbReady, initializeDatabase]);

    // Show error if any
    useEffect(() => {
        if (error) {
            Alert.alert('Error', error, [
                { text: 'OK', onPress: clearError }
            ]);
        }
    }, [error, clearError]);

    // Search words
    const handleSearch = async (query: string) => {
        if (!query.trim() || !isDbReady) {
            setSearchResults([]);
            return;
        }

        try {
            setIsSearching(true);
            const results = await searchWords(query);
            setSearchResults(results);
        } catch (err) {
            console.error('Search error:', err);
        } finally {
            setIsSearching(false);
        }
    };

    // Select word
    const handleWordSelect = async (word: Word) => {
        try {
            const wordDetails = await getWordDetail(word.id);
            if (wordDetails) {
                setSelectedWord(wordDetails);
                onWordSelect?.(wordDetails);
            }
        } catch (err) {
            console.error('Error getting word details:', err);
        }
    };

    const renderWordItem = ({ item }: { item: Word }) => (
        <TouchableOpacity
            style={styles.wordItem}
            onPress={() => handleWordSelect(item)}
        >
            <ThemedText style={styles.wordText}>{item.word}</ThemedText>
            <ThemedText style={styles.posText}>{item.pos}</ThemedText>
            {item.phonetic_text && (
                <ThemedText style={styles.phoneticText}>{item.phonetic_text}</ThemedText>
            )}
        </TouchableOpacity>
    );

    const renderWordDetails = () => {
        if (!selectedWord) return null;

        return (
            <View style={styles.wordDetails}>
                <View style={styles.wordHeader}>
                    <ThemedText style={styles.selectedWordText}>{selectedWord.word}</ThemedText>
                    <ThemedText style={styles.selectedPosText}>{selectedWord.pos}</ThemedText>
                    {selectedWord.phonetic_text && (
                        <ThemedText style={styles.selectedPhoneticText}>
                            {selectedWord.phonetic_text}
                        </ThemedText>
                    )}
                </View>

                <FlatList
                    data={selectedWord.senses}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item: sense }) => (
                        <View style={styles.senseContainer}>
                            <ThemedText style={styles.definitionText}>
                                {sense.definition}
                            </ThemedText>
                            {sense.examples.map((example, index) => (
                                <View key={index} style={styles.exampleContainer}>
                                    <ThemedText style={styles.exampleText}>
                                        • {example.example}
                                    </ThemedText>
                                </View>
                            ))}
                        </View>
                    )}
                />
            </View>
        );
    };

    if (!isDbReady && isLoading) {
        return (
            <ThemedView style={styles.loadingContainer}>
                <ActivityIndicator size="large" />
                <ThemedText style={styles.loadingText}>Initializing database...</ThemedText>
            </ThemedView>
        );
    }

    return (
        <ThemedView style={styles.container}>
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search for a word..."
                    value={searchQuery}
                    onChangeText={(text) => {
                        setSearchQuery(text);
                        handleSearch(text);
                    }}
                />
                {isSearching && (
                    <ActivityIndicator style={styles.searchLoader} size="small" />
                )}
            </View>

            {selectedWord ? (
                <View style={styles.resultsContainer}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => setSelectedWord(null)}
                    >
                        <ThemedText style={styles.backButtonText}>← Back to search</ThemedText>
                    </TouchableOpacity>
                    {renderWordDetails()}
                </View>
            ) : (
                <View style={styles.resultsContainer}>
                    {searchResults.length > 0 && (
                        <ThemedText style={styles.resultsTitle}>
                            Search Results ({searchResults.length})
                        </ThemedText>
                    )}
                    <FlatList
                        data={searchResults}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={renderWordItem}
                        showsVerticalScrollIndicator={false}
                    />
                </View>
            )}
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    searchInput: {
        flex: 1,
        height: 44,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 12,
        fontSize: 16,
        backgroundColor: '#fff',
    },
    searchLoader: {
        marginLeft: 8,
    },
    resultsContainer: {
        flex: 1,
    },
    resultsTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    wordItem: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    wordText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    posText: {
        fontSize: 14,
        color: '#666',
        fontStyle: 'italic',
    },
    phoneticText: {
        fontSize: 14,
        color: '#888',
    },
    backButton: {
        marginBottom: 16,
    },
    backButtonText: {
        fontSize: 16,
        color: '#007AFF',
    },
    wordDetails: {
        flex: 1,
    },
    wordHeader: {
        marginBottom: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    selectedWordText: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    selectedPosText: {
        fontSize: 16,
        color: '#666',
        fontStyle: 'italic',
        marginTop: 4,
    },
    selectedPhoneticText: {
        fontSize: 16,
        color: '#888',
        marginTop: 4,
    },
    senseContainer: {
        marginBottom: 16,
    },
    definitionText: {
        fontSize: 16,
        lineHeight: 24,
        marginBottom: 8,
    },
    exampleContainer: {
        marginLeft: 16,
        marginBottom: 4,
    },
    exampleText: {
        fontSize: 14,
        color: '#555',
        fontStyle: 'italic',
    },
}); 