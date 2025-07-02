import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Dimensions,
    StatusBar,
    ActivityIndicator,
    Alert,
    Modal,
    FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { useColorScheme } from '../../hooks/useColorScheme';
import { Story, Chapter } from '../../types/story';
import mangadexService from '../../services/mangadexService';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface MangaDexReaderProps {
    story: Story;
    onClose: () => void;
    onChapterSelect: (chapter: Chapter) => void;
}

interface ChapterListProps {
    chapters: Chapter[];
    onChapterSelect: (chapter: Chapter) => void;
    currentChapter?: Chapter;
    onClose: () => void;
}

const ChapterList: React.FC<ChapterListProps> = ({
    chapters,
    onChapterSelect,
    currentChapter,
    onClose
}) => {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={true}
            onRequestClose={onClose}
        >
            <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.8)' }]}>
                <View style={[styles.chapterListContainer, { backgroundColor: colors.background }]}>
                    <View style={styles.chapterListHeader}>
                        <Text style={[styles.chapterListTitle, { color: colors.text }]}>
                            Chapters
                        </Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color={colors.text} />
                        </TouchableOpacity>
                    </View>

                    <FlatList
                        data={chapters}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={[
                                    styles.chapterItem,
                                    currentChapter?.id === item.id && { backgroundColor: colors.tint }
                                ]}
                                onPress={() => {
                                    onChapterSelect(item);
                                    onClose();
                                }}
                            >
                                <Text style={[styles.chapterTitle, { color: colors.text }]}>
                                    {item.title}
                                </Text>
                                <Text style={[styles.chapterInfo, { color: colors.tabIconDefault }]}>
                                    {item.wordCount} words • {item.difficulty}
                                </Text>
                            </TouchableOpacity>
                        )}
                        showsVerticalScrollIndicator={false}
                    />
                </View>
            </View>
        </Modal>
    );
};

const MangaDexReader: React.FC<MangaDexReaderProps> = ({
    story,
    onClose,
    onChapterSelect
}) => {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];

    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);
    const [chapterPages, setChapterPages] = useState<string[]>([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [loading, setLoading] = useState(true);
    const [showChapterList, setShowChapterList] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [readingMode, setReadingMode] = useState<'vertical' | 'horizontal'>('vertical');

    const scrollViewRef = useRef<ScrollView>(null);
    const controlsTimeoutRef = useRef<number | null>(null);

    useEffect(() => {
        loadChapters();
    }, [story]);

    useEffect(() => {
        if (chapters.length > 0 && !currentChapter) {
            setCurrentChapter(chapters[0]);
        }
    }, [chapters]);

    useEffect(() => {
        if (currentChapter) {
            loadChapterPages();
        }
    }, [currentChapter]);

    const loadChapters = async () => {
        try {
            setLoading(true);
            const mangaChapters = await mangadexService.getMangaChapters(story.id, {
                order: { chapter: 'asc' },
                translatedLanguage: ['en']
            });
            setChapters(mangaChapters);

            if (mangaChapters.length === 0) {
                Alert.alert('Thông báo', 'Truyện này hiện không có chapter tiếng Anh để đọc.');
            } else if (mangaChapters[0].id.includes('mock-') || mangaChapters[0].id.includes('-ch')) {
                // Hiển thị thông báo khi sử dụng demo data
                Alert.alert(
                    'Demo Mode',
                    'Hiển thị demo chapters do API bị chặn. Chức năng đọc truyện vẫn hoạt động bình thường.',
                    [{ text: 'OK' }]
                );
            }
        } catch (error) {
            console.error('Error loading chapters:', error);
            if (error instanceof Error && error.message.includes('Network request failed')) {
                Alert.alert('Lỗi mạng', 'Không thể kết nối tới MangaDx. Sử dụng demo chapters để thử nghiệm.');
            } else {
                Alert.alert('Lỗi', 'Không thể tải danh sách chapter. Sử dụng demo chapters.');
            }
        } finally {
            setLoading(false);
        }
    };

    const loadChapterPages = async () => {
        if (!currentChapter) return;

        try {
            setLoading(true);
            const pages = await mangadexService.getChapterPages(currentChapter.id);

            if (pages && pages.length > 0) {
                setChapterPages(pages);
                setCurrentPage(0);

                // Kiểm tra nếu đang sử dụng demo pages
                if (pages[0].includes('placeholder.com')) {
                    Alert.alert('Demo Mode', 'Hiển thị demo pages do API bị chặn. Chức năng đọc hoạt động bình thường.');
                }
            } else if (currentChapter.content && currentChapter.content.startsWith('http')) {
                Alert.alert('Thông báo', 'Chapter này chỉ có thể đọc trên trang ngoài:\n' + currentChapter.content);
            } else {
                Alert.alert('Thông báo', 'Chapter này không có trang ảnh. Hiển thị demo pages để thử nghiệm.');
                // Sử dụng demo pages từ service
                const demoPages = [
                    'https://via.placeholder.com/800x1200/CCCCCC/FFFFFF?text=Demo+Page+1',
                    'https://via.placeholder.com/800x1200/DDDDDD/FFFFFF?text=Demo+Page+2',
                    'https://via.placeholder.com/800x1200/EEEEEE/FFFFFF?text=Demo+Page+3'
                ];
                setChapterPages(demoPages);
                setCurrentPage(0);
            }
        } catch (error) {
            console.error('Error loading chapter pages:', error);
            if (error instanceof Error && error.message.includes('Network request failed')) {
                Alert.alert('Lỗi mạng', 'Không thể kết nối tới MangaDx. Hiển thị demo pages.');
            } else if (error instanceof Error && error.message.includes('No pages found')) {
                Alert.alert('Thông báo', 'Chapter này không có trang ảnh. Hiển thị demo pages.');
            } else {
                Alert.alert('Lỗi', 'Không thể tải trang truyện. Hiển thị demo pages.');
            }

            // Luôn hiển thị demo pages khi có lỗi
            const demoPages = [
                'https://via.placeholder.com/800x1200/CCCCCC/FFFFFF?text=Demo+Page+1',
                'https://via.placeholder.com/800x1200/DDDDDD/FFFFFF?text=Demo+Page+2',
                'https://via.placeholder.com/800x1200/EEEEEE/FFFFFF?text=Demo+Page+3'
            ];
            setChapterPages(demoPages);
            setCurrentPage(0);
        } finally {
            setLoading(false);
        }
    };

    const showControlsTemporarily = () => {
        setShowControls(true);
        if (controlsTimeoutRef.current) {
            clearTimeout(controlsTimeoutRef.current);
        }
        controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
    };

    const handlePageChange = (direction: 'next' | 'prev') => {
        if (direction === 'next' && currentPage < chapterPages.length - 1) {
            setCurrentPage(currentPage + 1);
        } else if (direction === 'prev' && currentPage > 0) {
            setCurrentPage(currentPage - 1);
        }
        showControlsTemporarily();
    };

    const handleChapterChange = (direction: 'next' | 'prev') => {
        if (!currentChapter) return;

        const currentIndex = chapters.findIndex(ch => ch.id === currentChapter.id);
        if (direction === 'next' && currentIndex < chapters.length - 1) {
            setCurrentChapter(chapters[currentIndex + 1]);
        } else if (direction === 'prev' && currentIndex > 0) {
            setCurrentChapter(chapters[currentIndex - 1]);
        }
    };

    const handleScreenPress = () => {
        showControlsTemporarily();
    };

    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.tint} />
                <Text style={[styles.loadingText, { color: colors.text }]}>
                    Loading...
                </Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: 'black' }]}>
            <StatusBar hidden />

            {/* Chapter Pages */}
            <ScrollView
                ref={scrollViewRef}
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                onTouchStart={handleScreenPress}
            >
                {chapterPages.map((pageUrl, index) => (
                    <Image
                        key={index}
                        source={{ uri: pageUrl }}
                        style={styles.pageImage}
                        resizeMode="contain"
                    />
                ))}
            </ScrollView>

            {/* Top Controls */}
            {showControls && (
                <View style={[styles.topControls, { backgroundColor: 'rgba(0,0,0,0.8)' }]}>
                    <TouchableOpacity onPress={onClose} style={styles.controlButton}>
                        <Ionicons name="close" size={24} color="white" />
                    </TouchableOpacity>

                    <View style={styles.titleContainer}>
                        <Text style={styles.storyTitle} numberOfLines={1}>
                            {story.title}
                        </Text>
                        <Text style={styles.chapterTitle} numberOfLines={1}>
                            {currentChapter?.title}
                        </Text>
                    </View>

                    <TouchableOpacity
                        onPress={() => setShowChapterList(true)}
                        style={styles.controlButton}
                    >
                        <Ionicons name="list" size={24} color="white" />
                    </TouchableOpacity>
                </View>
            )}

            {/* Bottom Controls */}
            {showControls && (
                <View style={[styles.bottomControls, { backgroundColor: 'rgba(0,0,0,0.8)' }]}>
                    <View style={styles.pageControls}>
                        <TouchableOpacity
                            onPress={() => handleChapterChange('prev')}
                            disabled={chapters.findIndex(ch => ch.id === currentChapter?.id) <= 0}
                            style={styles.controlButton}
                        >
                            <Ionicons name="chevron-back" size={24} color="white" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => handlePageChange('prev')}
                            disabled={currentPage <= 0}
                            style={styles.controlButton}
                        >
                            <Ionicons name="arrow-back" size={24} color="white" />
                        </TouchableOpacity>

                        <Text style={styles.pageInfo}>
                            {currentPage + 1} / {chapterPages.length}
                        </Text>

                        <TouchableOpacity
                            onPress={() => handlePageChange('next')}
                            disabled={currentPage >= chapterPages.length - 1}
                            style={styles.controlButton}
                        >
                            <Ionicons name="arrow-forward" size={24} color="white" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => handleChapterChange('next')}
                            disabled={chapters.findIndex(ch => ch.id === currentChapter?.id) >= chapters.length - 1}
                            style={styles.controlButton}
                        >
                            <Ionicons name="chevron-forward" size={24} color="white" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.modeControls}>
                        <TouchableOpacity
                            onPress={() => setReadingMode('vertical')}
                            style={[
                                styles.modeButton,
                                readingMode === 'vertical' && { backgroundColor: colors.tint }
                            ]}
                        >
                            <Ionicons name="list" size={20} color="white" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => setReadingMode('horizontal')}
                            style={[
                                styles.modeButton,
                                readingMode === 'horizontal' && { backgroundColor: colors.tint }
                            ]}
                        >
                            <Ionicons name="grid" size={20} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {/* Chapter List Modal */}
            {showChapterList && (
                <ChapterList
                    chapters={chapters}
                    currentChapter={currentChapter ?? undefined}
                    onChapterSelect={setCurrentChapter}
                    onClose={() => setShowChapterList(false)}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        alignItems: 'center',
    },
    pageImage: {
        width: screenWidth,
        height: screenHeight * 0.8,
        marginVertical: 2,
    },
    topControls: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        paddingTop: 50,
    },
    bottomControls: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 16,
        paddingVertical: 12,
        paddingBottom: 30,
    },
    controlButton: {
        padding: 8,
    },
    titleContainer: {
        flex: 1,
        marginHorizontal: 16,
    },
    storyTitle: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    chapterTitle: {
        color: 'white',
        fontSize: 14,
        opacity: 0.8,
    },
    pageControls: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    pageInfo: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
    },
    modeControls: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 16,
    },
    modeButton: {
        padding: 8,
        borderRadius: 4,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    chapterListContainer: {
        height: '70%',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 16,
    },
    chapterListHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    chapterListTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    closeButton: {
        padding: 4,
    },
    chapterItem: {
        padding: 16,
        borderRadius: 8,
        marginBottom: 8,
    },
    chapterTitle1: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 4,
    },
    chapterInfo: {
        fontSize: 12,
    },
});

export default MangaDexReader; 