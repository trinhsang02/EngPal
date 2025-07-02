import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ScrollView,
    SafeAreaView,
    Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { useColorScheme } from '../../hooks/useColorScheme';
import { Story } from '../../types/story';

interface StoryDetailProps {
    story: Story | null;
    visible: boolean;
    onClose: () => void;
    onStartReading: (story: Story) => void;
    onViewChapters: (story: Story) => void;
}

export const StoryDetail: React.FC<StoryDetailProps> = ({
    story,
    visible,
    onClose,
    onStartReading,
    onViewChapters,
}) => {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];

    if (!story) return null;

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
                <View style={styles.modalHeader}>
                    <TouchableOpacity onPress={onClose}>
                        <Ionicons name="close" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.modalTitle, { color: colors.text }]}>Story Details</Text>
                    <TouchableOpacity>
                        <Ionicons name="bookmark-outline" size={24} color={colors.text} />
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalContent}>
                    <Image source={{ uri: story.cover }} style={styles.modalCover} />

                    <View style={styles.modalInfo}>
                        <Text style={[styles.modalStoryTitle, { color: colors.text }]}>
                            {story.title}
                        </Text>
                        <Text style={[styles.modalAuthor, { color: colors.icon }]}>
                            by {story.author}
                        </Text>

                        <View style={styles.modalStats}>
                            <View style={styles.statItem}>
                                <Ionicons name="star" size={16} color="#FFD700" />
                                <Text style={[styles.statText, { color: colors.text }]}>{story.rating}</Text>
                            </View>
                            <View style={styles.statItem}>
                                <Ionicons name="book-outline" size={16} color={colors.icon} />
                                <Text style={[styles.statText, { color: colors.text }]}>{story.chapters} chapters</Text>
                            </View>
                            <View style={styles.statItem}>
                                <Ionicons name="eye-outline" size={16} color={colors.icon} />
                                <Text style={[styles.statText, { color: colors.text }]}>{story.readCount.toLocaleString()}</Text>
                            </View>
                        </View>

                        <View style={styles.modalTags}>
                            {story.tags.map((tag: string, index: number) => (
                                <View key={index} style={styles.modalTag}>
                                    <Text style={styles.modalTagText}>{tag}</Text>
                                </View>
                            ))}
                        </View>

                        <Text style={[styles.modalDescription, { color: colors.text }]}>
                            {story.description}
                        </Text>

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={[styles.readButton, { backgroundColor: colors.tint }]}
                                onPress={() => onStartReading(story)}
                            >
                                <Ionicons name="play" size={20} color="#fff" />
                                <Text style={styles.readButtonText}>Start Reading</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.chapterButton, { borderColor: colors.tint }]}
                                onPress={() => onViewChapters(story)}
                            >
                                <Text style={[styles.chapterButtonText, { color: colors.tint }]}>
                                    View Chapters
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    modalContent: {
        flex: 1,
    },
    modalCover: {
        width: '100%',
        height: 200,
        resizeMode: 'cover',
    },
    modalInfo: {
        padding: 16,
    },
    modalStoryTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    modalAuthor: {
        fontSize: 16,
        marginBottom: 16,
    },
    modalStats: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 16,
        paddingVertical: 12,
        backgroundColor: '#F5F5F5',
        borderRadius: 8,
    },
    statItem: {
        alignItems: 'center',
        gap: 4,
    },
    statText: {
        fontSize: 14,
        fontWeight: '500',
    },
    modalTags: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 16,
    },
    modalTag: {
        backgroundColor: '#E3F2FD',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    modalTagText: {
        fontSize: 12,
        color: '#1976D2',
        fontWeight: '500',
    },
    modalDescription: {
        fontSize: 16,
        lineHeight: 24,
        marginBottom: 24,
    },
    modalActions: {
        gap: 12,
    },
    readButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 8,
        gap: 8,
    },
    readButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    chapterButton: {
        alignItems: 'center',
        paddingVertical: 16,
        borderRadius: 8,
        borderWidth: 2,
    },
    chapterButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
}); 