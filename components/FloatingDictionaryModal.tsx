import React, { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Word, WordDetail } from '@/services/oxfordDatabase';
import OxfordDatabaseService from '@/services/oxfordDatabase';
import { MaterialIcons } from '@expo/vector-icons';

interface FloatingDictionaryModalProps {
    visible: boolean;
    onClose: () => void;
}

const FloatingDictionaryModal: React.FC<FloatingDictionaryModalProps> = ({ visible, onClose }) => {
    const [query, setQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Word[]>([]);
    const [selectedWord, setSelectedWord] = useState<WordDetail | null>(null);
    const [loading, setLoading] = useState(false);
    const [searching, setSearching] = useState(false);

    const oxfordService = OxfordDatabaseService.getInstance();

    const handleSearch = async () => {
        if (!query.trim()) return;

        setSearching(true);
        setSelectedWord(null);

        try {
            const results = await oxfordService.searchWords(query.trim());
            setSearchResults(results);
        } catch (error) {
            console.error('Search error:', error);
            setSearchResults([]);
        } finally {
            setSearching(false);
        }
    };

    const handleWordSelect = async (word: Word) => {
        setLoading(true);
        try {
            const wordDetail = await oxfordService.getWordDetail(word.id);
            setSelectedWord(wordDetail);
            setSearchResults([]); // Hide search results when showing detail
        } catch (error) {
            console.error('Word detail error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        setSelectedWord(null);
        // Don't clear search results, just show them again
    };

    const renderSearchResults = () => (
        <ScrollView style={styles.resultsContainer}>
            <Text style={styles.resultsTitle}>
                Tìm thấy {searchResults.length} từ
            </Text>
            {searchResults.map((word) => (
                <TouchableOpacity
                    key={word.id}
                    style={styles.wordItem}
                    onPress={() => handleWordSelect(word)}
                >
                    <View style={styles.wordHeader}>
                        <Text style={styles.wordText}>{word.word}</Text>
                        <Text style={styles.posText}>({word.pos})</Text>
                    </View>
                    {word.phonetic_text && (
                        <Text style={styles.phoneticText}>{word.phonetic_text}</Text>
                    )}
                    <MaterialIcons name="chevron-right" size={20} color="#999" />
                </TouchableOpacity>
            ))}
        </ScrollView>
    );

    const renderWordDetail = () => {
        if (!selectedWord) return null;

        return (
            <ScrollView style={styles.detailContainer}>
                <View style={styles.detailHeader}>
                    <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                        <MaterialIcons name="arrow-back" size={24} color="#4285F4" />
                    </TouchableOpacity>
                    <View style={styles.wordInfo}>
                        <Text style={styles.wordTitle}>{selectedWord.word}</Text>
                        <Text style={styles.posTitle}>({selectedWord.pos})</Text>
                    </View>
                </View>

                {selectedWord.phonetic_text && (
                    <Text style={styles.phoneticDetail}>{selectedWord.phonetic_text}</Text>
                )}

                {selectedWord.senses.map((sense, index) => (
                    <View key={sense.id} style={styles.senseContainer}>
                        <Text style={styles.senseNumber}>{index + 1}.</Text>
                        <View style={styles.senseContent}>
                            <Text style={styles.definition}>{sense.definition}</Text>
                            {sense.examples.map((example, exIndex) => (
                                <Text key={example.id} style={styles.example}>
                                    • {example.example}
                                </Text>
                            ))}
                        </View>
                    </View>
                ))}
            </ScrollView>
        );
    };

    const resetModal = () => {
        setQuery('');
        setSearchResults([]);
        setSelectedWord(null);
        setLoading(false);
        setSearching(false);
    };

    const handleClose = () => {
        resetModal();
        onClose();
    };

    if (!visible) return null;

    return (
        <Modal transparent visible={visible} animationType="fade">
            <View style={styles.overlay}>
                <View style={styles.floating}>
                    <View style={styles.header}>
                        <Text style={styles.title}>
                            {selectedWord ? 'Chi tiết từ' : 'Dictionary'}
                        </Text>
                        <TouchableOpacity onPress={handleClose}>
                            <Text style={styles.close}>×</Text>
                        </TouchableOpacity>
                    </View>

                    {!selectedWord && (
                        <View style={styles.searchContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="Nhập từ cần tra..."
                                value={query}
                                onChangeText={setQuery}
                                onSubmitEditing={handleSearch}
                                autoFocus
                            />
                            <TouchableOpacity
                                style={styles.searchButton}
                                onPress={handleSearch}
                                disabled={searching || !query.trim()}
                            >
                                {searching ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <MaterialIcons name="search" size={20} color="#fff" />
                                )}
                            </TouchableOpacity>
                        </View>
                    )}

                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#4285F4" />
                            <Text style={styles.loadingText}>Đang tải chi tiết...</Text>
                        </View>
                    ) : selectedWord ? (
                        renderWordDetail()
                    ) : searchResults.length > 0 ? (
                        renderSearchResults()
                    ) : query && !searching ? (
                        <View style={styles.noResultsContainer}>
                            <MaterialIcons name="search-off" size={48} color="#ccc" />
                            <Text style={styles.noResultsText}>
                                Không tìm thấy từ "{query}"
                            </Text>
                        </View>
                    ) : null}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    floating: {
        width: '90%',
        maxHeight: '80%',
        backgroundColor: '#fff',
        borderRadius: 16,
        elevation: 10,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    title: {
        fontWeight: 'bold',
        fontSize: 18,
        color: '#333',
    },
    close: {
        fontSize: 24,
        color: '#888',
        padding: 4,
        fontWeight: 'bold',
    },
    searchContainer: {
        flexDirection: 'row',
        padding: 16,
        gap: 8,
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
    searchButton: {
        backgroundColor: '#4285F4',
        borderRadius: 8,
        padding: 12,
        justifyContent: 'center',
        alignItems: 'center',
        minWidth: 48,
    },
    resultsContainer: {
        maxHeight: 400,
        padding: 16,
    },
    resultsTitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 12,
        fontWeight: '500',
    },
    wordItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    wordHeader: {
        flex: 1,
    },
    wordText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    posText: {
        fontSize: 12,
        color: '#666',
        fontStyle: 'italic',
    },
    phoneticText: {
        fontSize: 12,
        color: '#4285F4',
        marginTop: 2,
    },
    detailContainer: {
        maxHeight: 500,
        padding: 16,
    },
    detailHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    backButton: {
        marginRight: 12,
        padding: 4,
    },
    wordInfo: {
        flex: 1,
    },
    wordTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    posTitle: {
        fontSize: 14,
        color: '#666',
        fontStyle: 'italic',
    },
    phoneticDetail: {
        fontSize: 16,
        color: '#4285F4',
        marginBottom: 16,
        fontStyle: 'italic',
    },
    senseContainer: {
        flexDirection: 'row',
        marginBottom: 16,
        alignItems: 'flex-start',
    },
    senseNumber: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#4285F4',
        marginRight: 8,
        marginTop: 2,
    },
    senseContent: {
        flex: 1,
    },
    definition: {
        fontSize: 16,
        color: '#333',
        lineHeight: 22,
        marginBottom: 8,
    },
    example: {
        fontSize: 14,
        color: '#666',
        fontStyle: 'italic',
        lineHeight: 20,
        marginBottom: 4,
        paddingLeft: 8,
    },
    loadingContainer: {
        padding: 32,
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        color: '#666',
        fontSize: 14,
    },
    noResultsContainer: {
        padding: 32,
        alignItems: 'center',
    },
    noResultsText: {
        marginTop: 12,
        color: '#666',
        fontSize: 16,
        textAlign: 'center',
    },
});

export default FloatingDictionaryModal; 