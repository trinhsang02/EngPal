import React, { useState, useEffect } from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    FlatList,
    Image,
    ActivityIndicator,
    Alert,
    Dimensions,
} from 'react-native';
import { Story } from '../../types/story';
import { Colors } from '../../constants/Colors';
import { useColorScheme } from '../../hooks/useColorScheme';
import mangadexService from '../../services/mangadexService';

interface StoryReaderProps {
    story: Story;
    chapterId: string;
    onClose: () => void;
}

const { width: screenWidth } = Dimensions.get('window');

export default function StoryReader({ story, chapterId, onClose }: StoryReaderProps) {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    
    const [pages, setPages] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const [showControls, setShowControls] = useState(true);
    const [chapterInfo, setChapterInfo] = useState<any>(null);

    useEffect(() => {
        const loadPages = async () => {
            try {
                setLoading(true);

                // Lấy thông tin chapter
                const info = await mangadexService.getChapterInfo(chapterId);
                setChapterInfo(info);

                const pageUrls = await mangadexService.getChapterPages(chapterId);
                if (pageUrls.length === 0) {
                    Alert.alert(
                        'No Pages Found',
                        'This chapter has no readable pages available.',
                        [{ text: 'OK', onPress: onClose }]
                    );
                    return;
                }
                setPages(pageUrls);
            } catch (error) {
                console.error('Error loading chapter pages:', error);
                Alert.alert(
                    'Error',
                    'Failed to load chapter pages. Please try again.',
                    [{ text: 'OK', onPress: onClose }]
                );
            } finally {
                setLoading(false);
            }
        };
        loadPages();
    }, [chapterId, onClose]);

    const handlePagePress = () => {
        setShowControls(!showControls);
    };

    const goToPreviousPage = () => {
        if (currentPage > 0) {
            setCurrentPage(currentPage - 1);
        }
    };

    const goToNextPage = () => {
        if (currentPage < pages.length - 1) {
            setCurrentPage(currentPage + 1);
        }
    };

    const renderPage = ({ item, index }: { item: string; index: number }) => (
        <TouchableOpacity
            style={styles.pageContainer}
            onPress={handlePagePress}
            activeOpacity={1}
        >
            <Image
                source={{ uri: item }}
                style={styles.pageImage}
                resizeMode="contain"
                onError={(error) => {
                    console.error('Error loading page image:', error);
                }}
            />
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <Modal visible={true} animationType="fade">
                <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
                    <ActivityIndicator size="large" color={colors.tint} />
                    <Text style={[styles.loadingText, { color: colors.text }]}>
                        Loading chapter...
                    </Text>
                </View>
            </Modal>
        );
    }

    return (
        <Modal visible={true} animationType="fade">
            <View style={[styles.container, { backgroundColor: '#000' }]}>
                {/* Header Controls */}
                <View style={[styles.header, { backgroundColor: colors.background + 'E6' }]}>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Text style={[styles.closeText, { color: '#fff' }]}>← Back</Text>
                    </TouchableOpacity>
                    <View style={styles.titleContainer}>
                        <Text style={[styles.storyTitle, { color: '#fff', fontSize: 18 }]} numberOfLines={1}>
                            {story.title}
                        </Text>
                        <Text style={[styles.chapterTitle, { color: '#fff', fontSize: 15 }]} numberOfLines={1}>
                            {chapterInfo?.title || `Chapter ${chapterInfo?.chapter || chapterId}`}
                        </Text>
                        {chapterInfo?.scanlationGroup ? (
                            <Text style={[styles.groupText, { color: '#fff' }]}>
                                {chapterInfo.scanlationGroup}
                            </Text>
                        ) : null}
                    </View>
                    <View style={{ width: 60 }} />
                </View>

                {/* Pages */}
                <FlatList
                    data={pages}
                    renderItem={renderPage}
                    keyExtractor={(item, index) => index.toString()}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onMomentumScrollEnd={(event) => {
                        const page = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
                        setCurrentPage(page);
                    }}
                    getItemLayout={(data, index) => ({
                        length: screenWidth,
                        offset: screenWidth * index,
                        index,
                    })}
                />

                {/* Footer: chỉ còn số trang */}
                <View style={[styles.footer, { backgroundColor: colors.background + 'E6', justifyContent: 'center' }]}>
                    <Text style={[styles.pageText, { color: '#fff', fontSize: 16 }]}>
                        {currentPage + 1} / {pages.length}
                    </Text>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 50,
        paddingBottom: 12,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
    },
    closeButton: {
        paddingVertical: 8,
        paddingRight: 16,
    },
    closeText: {
        fontSize: 16,
        fontWeight: '600',
    },
    titleContainer: {
        flex: 1,
        alignItems: 'center',
    },
    storyTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
    },
    chapterTitle: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 2,
    },
    groupText: {
        fontSize: 13,
        fontWeight: '400',
        marginBottom: 2,
    },
    menuButton: {
        padding: 8,
        marginLeft: 8,
    },
    infoBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#222',
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    infoBtn: { color: '#fff', fontSize: 13 },
    pageContainer: {
        width: screenWidth,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    pageImage: {
        width: screenWidth,
        flex: 1,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        paddingBottom: 34,
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 10,
    },
    navButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        minWidth: 80,
        alignItems: 'center',
    },
    navButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    },
    pageIndicator: {
        flex: 1,
        alignItems: 'center',
    },
    pageText: {
        fontSize: 14,
        fontWeight: '500',
    },
});
