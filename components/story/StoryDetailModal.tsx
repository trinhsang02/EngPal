import React from 'react';
import {
    Modal,
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
} from 'react-native';
import { Story } from '../../types/story';
import { Colors } from '../../constants/Colors';
import { useColorScheme } from '../../hooks/useColorScheme';
import FloatingDictionaryModal from '../FloatingDictionaryModal';
import FloatingButton from '../FloatingButton';

interface StoryDetailModalProps {
    story: Story | null;
    visible: boolean;
    onClose: () => void;
    onStartReading: (story: Story, chapterId: string) => void;
    chapters?: any[]; // Thêm prop này
}

export default function StoryDetailModal({
    story,
    visible,
    onClose,
    onStartReading,
    chapters,
}: StoryDetailModalProps) {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const [dictionaryModalVisible, setDictionaryModalVisible] = React.useState(false);

    // Đặt useMemo ở đây, KHÔNG đặt sau if (!story)
    const groupedChapters = React.useMemo(() => {
        if (!Array.isArray(chapters)) return {};
        const groups: { [chapterNumber: string]: any[] } = {};
        chapters.forEach((ch) => {
            const chapNum = ch.chapter || 'Oneshot';
            if (!groups[chapNum]) groups[chapNum] = [];
            groups[chapNum].push(ch);
        });
        return Object.entries(groups)
            .sort((a, b) => parseFloat(b[0]) - parseFloat(a[0]))
            .reduce<{ [chapterNumber: string]: any[] }>((acc, [k, v]) => ({ ...acc, [k]: v }), {});
    }, [chapters]);

    // Sau đó mới kiểm tra điều kiện
    if (!story) return null;

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Text style={[styles.closeText, { color: colors.tint }]}>✕</Text>
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>Manga Details</Text>
                    <View style={styles.headerSpacer} />
                </View>

                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    {/* Cover and Title Section */}
                    <View style={styles.topSection}>
                        <Image source={{ uri: story.cover }} style={styles.cover} />
                        <View style={styles.titleSection}>
                            <Text style={[styles.title, { color: colors.text }]}>
                                {story.title}
                            </Text>
                            <Text style={[styles.author, { color: colors.text + '80' }]}>
                                by {story.author}
                            </Text>
                            <View style={styles.ratingRow}>
                                <Text style={styles.star}>⭐</Text>
                                <Text style={[styles.rating, { color: colors.text }]}>
                                    {story.rating.toFixed(1)}
                                </Text>
                                <View style={[styles.statusBadge, {
                                    backgroundColor: story.status === 'Completed' ? '#4CAF50' : '#FF9800'
                                }]}>
                                    <Text style={styles.statusText}>{story.status}</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.actionButtons}>
                        <TouchableOpacity
                            style={[styles.primaryButton, { backgroundColor: colors.tint }]}
                            onPress={() => {
                                // Lấy chương đầu tiên nếu có
                                const firstChapterId = Array.isArray(chapters) && chapters.length > 0 ? chapters[0].id : '';
                                onStartReading(story, firstChapterId);
                            }}
                        >
                            <Text style={styles.primaryButtonText}>Start Reading</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.secondaryButton, { borderColor: colors.tint }]}
                        >
                            <Text style={[styles.secondaryButtonText, { color: colors.tint }]}>
                                Add to Library
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Description */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>
                            Description
                        </Text>
                        <Text style={[styles.description, { color: colors.text + '80' }]}>
                            {story.description}
                        </Text>
                    </View>

                    {/* Tags */}
                    {story.tags.length > 0 && (
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>
                                Tags
                            </Text>
                            <View style={styles.tagsContainer}>
                                {story.tags.map((tag, index) => (
                                    <View
                                        key={index}
                                        style={[styles.tag, { backgroundColor: colors.tint + '20' }]}
                                    >
                                        <Text style={[styles.tagText, { color: colors.tint }]}>
                                            {tag}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Chapters List */}
                    {Object.keys(groupedChapters).length > 0 ? (
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>
                                Chapters
                            </Text>
                            <View>
                                {Object.entries(groupedChapters).map(([chapterNum, chapterList]) => (
                                    <View key={chapterNum} style={{ marginBottom: 16 }}>
                                        <Text style={{ fontWeight: 'bold', color: colors.text, marginBottom: 4 }}>
                                            Chapter {chapterNum}
                                        </Text>
                                        {(chapterList as any[]).map((chapter: any, idx: number) => (
                                            <TouchableOpacity
                                                key={chapter.id}
                                                style={{
                                                    marginBottom: 6,
                                                    padding: 8,
                                                    borderRadius: 6,
                                                    backgroundColor: colors.background,
                                                    borderWidth: 1,
                                                    borderColor: colors.tint + '30',
                                                }}
                                                onPress={() => onStartReading(story, chapter.id)}
                                            >
                                                <Text style={{ color: colors.text }}>
                                                    {chapter.translatedLanguage?.toUpperCase() || '??'} • {chapter.scanlationGroup || 'Unknown Group'}
                                                </Text>
                                                <Text style={{ color: colors.text + '80', fontSize: 12 }}>
                                                    {chapter.title ? chapter.title : ''}
                                                    {chapter.publishAt ? ` • ${new Date(chapter.publishAt).toLocaleDateString()}` : ''}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                ))}
                            </View>
                        </View>
                    ) : (
                        // Nếu không có danh sách chương, hiển thị số chương như cũ
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>
                                Statistics
                            </Text>
                            <View style={styles.statsContainer}>
                                <View style={styles.statItem}>
                                    <Text style={[styles.statValue, { color: colors.text }]}>
                                        {story.chapters}
                                    </Text>
                                    <Text style={[styles.statLabel, { color: colors.text + '60' }]}>
                                        Chapters
                                    </Text>
                                </View>
                                <View style={styles.statItem}>
                                    <Text style={[styles.statValue, { color: colors.text }]}>
                                        {story.readCount}
                                    </Text>
                                    <Text style={[styles.statLabel, { color: colors.text + '60' }]}>
                                        Reads
                                    </Text>
                                </View>
                                <View style={styles.statItem}>
                                    <Text style={[styles.statValue, { color: colors.text }]}>
                                        {story.level}
                                    </Text>
                                    <Text style={[styles.statLabel, { color: colors.text + '60' }]}>
                                        Level
                                    </Text>
                                </View>
                            </View>
                        </View>
                    )}
                </ScrollView>
            </View>

            {/* Floating Dictionary - rendered inside modal to work with this modal */}
            <FloatingButton onPress={() => setDictionaryModalVisible(true)} />
            <FloatingDictionaryModal
                visible={dictionaryModalVisible}
                onClose={() => setDictionaryModalVisible(false)}
            />
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 60,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    closeButton: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    closeText: {
        fontSize: 18,
        fontWeight: '600',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    headerSpacer: {
        width: 44,
    },
    content: {
        flex: 1,
        padding: 16,
    },
    topSection: {
        flexDirection: 'row',
        marginBottom: 24,
    },
    cover: {
        width: 120,
        height: 180,
        borderRadius: 8,
        marginRight: 16,
    },
    titleSection: {
        flex: 1,
        justifyContent: 'space-between',
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        lineHeight: 26,
        marginBottom: 4,
    },
    author: {
        fontSize: 16,
        marginBottom: 12,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    star: {
        fontSize: 16,
    },
    rating: {
        fontSize: 16,
        fontWeight: '600',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    primaryButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    primaryButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    secondaryButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 2,
        alignItems: 'center',
    },
    secondaryButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 12,
    },
    description: {
        fontSize: 14,
        lineHeight: 20,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    tag: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    tagText: {
        fontSize: 12,
        fontWeight: '500',
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        textTransform: 'uppercase',
    },
});
