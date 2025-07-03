import React, { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet, StatusBar, Alert, FlatList, View, Text, TextInput } from 'react-native';
import { Header } from '../../components/ui/Header';
import { Colors } from '../../constants/Colors';
import { useColorScheme } from '../../hooks/useColorScheme';
import { Story } from '../../types/story';
import { mangadexService } from '../../services/mangadexService';
import StoryCard from '../../components/story/StoryCard';
import StoryDetailModal from '../../components/story/StoryDetailModal';
import StoryReader from '../../components/story/StoryReader';
// import FloatingDictionaryModal from '../../components/FloatingDictionaryModal';
// import FloatingButton from '../../components/FloatingButton';

export default function StoryScreen({ navigation }: { navigation: any }) {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];

    const [filteredStories, setFilteredStories] = useState<Story[]>([]);
    const [selectedStory, setSelectedStory] = useState<Story | null>(null);
    const [showStoryModal, setShowStoryModal] = useState(false);
    const [showReader, setShowReader] = useState(false);
    const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedChapters, setSelectedChapters] = useState<any[]>([]);
    const [searchKeyword, setSearchKeyword] = useState('');
    // const [dictionaryModalVisible, setDictionaryModalVisible] = useState(false);

    const loadInitialData = async () => {
        try {
            setLoading(true);
            console.log('🔍 Starting to load latest updated manga...');

            // Test connection first
            const connectionTest = await mangadexService.testConnection();
            console.log('🌐 Connection test result:', connectionTest);

            // Đổi sang lấy latest update
            const latestStories = await mangadexService.getRecentlyUpdatedManga(20);
            console.log('📚 Loaded stories count:', latestStories.length);

            if (latestStories.length > 0) {
                setFilteredStories(latestStories);
            } else {
                console.warn('⚠️ No stories returned from API');
            }
        } catch (error) {
            console.error('❌ Error loading stories:', error);
            Alert.alert(
                'Connection Error',
                'Unable to connect to MangaDX. Please try again later.',
                [
                    { text: 'Retry', onPress: loadInitialData },
                    { text: 'Cancel' }
                ]
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadInitialData();
    }, []);

    const handleStoryPress = async (story: Story) => {
        setSelectedStory(story);
        setShowStoryModal(true);

        // Lấy danh sách chapter từ API
        const chapters = await mangadexService.getMangaChapters(story.id, {
            limit: 100, // hoặc số lượng bạn muốn
            order: { chapter: 'desc' }
        });
        setSelectedChapters(chapters);
    };

    const handleStartReading = async (story: Story) => {
        setSelectedStory(story);
        setShowStoryModal(false);

        try {
            const chapters = await mangadexService.getMangaChapters(story.id, {
                limit: 10,
                order: { chapter: 'asc' }
            });

            for (const chapter of chapters) {
                const pages = await mangadexService.getChapterPages(chapter.id);
                if (pages && pages.length > 0) {
                    setSelectedChapterId(chapter.id);
                    setShowReader(true);
                    return;
                }
            }

            Alert.alert('No Available Chapters', 'This manga has no readable chapters available.');
        } catch {
            Alert.alert('Error', 'Failed to load chapters.');
        }
    };

    // Hàm tìm kiếm
    const handleSearch = async () => {
        setLoading(true);
        try {
            const results = await mangadexService.searchManga({ title: searchKeyword, limit: 20 });
            setFilteredStories(results);
        } catch (error) {
            Alert.alert('Search Error', 'Failed to search manga.');
        }
        setLoading(false);
    };

    const renderEmptyState = () => {
        if (loading) {
            return (
                <View style={styles.centerContainer}>
                    <Text style={[styles.emptyText, { color: colors.text }]}>
                        Loading manga...
                    </Text>
                </View>
            );
        }

        return (
            <View style={styles.centerContainer}>
                <Text style={[styles.emptyText, { color: colors.text }]}>
                    No manga available
                </Text>
                <Text
                    style={[styles.retryText, { color: colors.tint }]}
                    onPress={loadInitialData}
                >
                    Tap to retry
                </Text>
            </View>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />

            {/* <Header /> */}

            <TextInput
                style={{
                    backgroundColor: colors.background,
                    color: colors.text,
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    margin: 10,
                    borderWidth: 1,
                    borderColor: colors.tint,
                }}
                placeholder="Search manga..."
                placeholderTextColor={colors.text + '80'}
                value={searchKeyword}
                onChangeText={setSearchKeyword}
                onSubmitEditing={handleSearch}
                returnKeyType="search"
            />

            <FlatList
                data={filteredStories}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <StoryCard story={item} onPress={handleStoryPress} />
                )}
                numColumns={2}
                contentContainerStyle={styles.listContent}
                columnWrapperStyle={filteredStories.length > 0 ? styles.row : undefined}
                refreshing={loading}
                onRefresh={loadInitialData}
                ListEmptyComponent={renderEmptyState}
            />

            <StoryDetailModal
                story={selectedStory}
                visible={showStoryModal}
                onClose={() => setShowStoryModal(false)}
                onStartReading={(story, chapterId) => {
                    setShowStoryModal(false);
                    setSelectedChapterId(chapterId);
                    setShowReader(true);
                }}
                chapters={selectedChapters}
            />

            {showReader && selectedStory && selectedChapterId && (
                <StoryReader
                    story={selectedStory}
                    chapterId={selectedChapterId}
                    onClose={() => {
                        setShowReader(false);      // Đóng reader
                        setShowStoryModal(true);   // Hiện lại Manga Detail
                    }}
                />
            )}

            {/* Floating Dictionary - rendered after story modals to ensure higher z-index */}
            {/* <FloatingButton onPress={() => setDictionaryModalVisible(true)} />
            <FloatingDictionaryModal
                visible={dictionaryModalVisible}
                onClose={() => setDictionaryModalVisible(false)}
            /> */}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
    },
    listContent: {
        paddingBottom: 24,
        flexGrow: 1,
    },
    row: {
        justifyContent: 'space-between',
        paddingHorizontal: 4,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 300,
    },
    emptyText: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 10,
    },
    retryText: {
        fontSize: 14,
        textDecorationLine: 'underline',
    },
});
