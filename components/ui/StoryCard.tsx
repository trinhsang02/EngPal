import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { useColorScheme } from '../../hooks/useColorScheme';
import { Story } from '../../types/story';

const { width: screenWidth } = Dimensions.get('window');

interface StoryCardProps {
    story: Story;
    onPress: (story: Story) => void;
    viewMode: 'grid' | 'list';
}

export const StoryCard: React.FC<StoryCardProps> = ({ story, onPress, viewMode }) => {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];

    if (viewMode === 'grid') {
        return (
            <TouchableOpacity
                style={[styles.storyCard, { backgroundColor: colors.background }]}
                onPress={() => onPress(story)}
            >
                <View style={styles.coverContainer}>
                    <Image source={{ uri: story.cover }} style={styles.storyCover} />
                    <View style={styles.coverOverlay}>
                        <View style={styles.statusBadge}>
                            <Text style={styles.statusText}>{story.status}</Text>
                        </View>
                        <View style={styles.ratingBadge}>
                            <Ionicons name="star" size={12} color="#FFD700" />
                            <Text style={styles.ratingText}>{story.rating}</Text>
                        </View>
                    </View>
                </View>
                <View style={styles.storyInfo}>
                    <Text style={[styles.storyTitle, { color: colors.text }]} numberOfLines={2}>
                        {story.title}
                    </Text>
                    <Text style={[styles.storyAuthor, { color: colors.icon }]} numberOfLines={1}>
                        {story.author}
                    </Text>
                    <View style={styles.storyMeta}>
                        <Text style={[styles.chapterText, { color: colors.icon }]}>
                            {story.chapters} ch
                        </Text>
                        <Text style={[styles.levelText, { color: colors.tint }]}>
                            {story.level}
                        </Text>
                    </View>
                    <View style={styles.tagContainer}>
                        {story.tags.slice(0, 2).map((tag: string, index: number) => (
                            <View key={index} style={[styles.tag, { backgroundColor: colors.tint + '20' }]}>
                                <Text style={[styles.tagText, { color: colors.tint }]}>{tag}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity
            style={[styles.storyCardList, { backgroundColor: colors.background }]}
            onPress={() => onPress(story)}
        >
            <Image source={{ uri: story.cover }} style={styles.storyCoverList} />
            <View style={styles.storyInfoList}>
                <Text style={[styles.storyTitleList, { color: colors.text }]} numberOfLines={1}>
                    {story.title}
                </Text>
                <Text style={[styles.storyAuthorList, { color: colors.icon }]} numberOfLines={1}>
                    {story.author}
                </Text>
                <Text style={[styles.storyDescriptionList, { color: colors.icon }]} numberOfLines={2}>
                    {story.description}
                </Text>
                <View style={styles.storyMetaList}>
                    <View style={styles.ratingContainer}>
                        <Ionicons name="star" size={12} color="#FFD700" />
                        <Text style={[styles.ratingText, { color: colors.text }]}>{story.rating}</Text>
                    </View>
                    <Text style={[styles.chapterText, { color: colors.icon }]}>
                        {story.chapters} chapters
                    </Text>
                    <Text style={[styles.levelText, { color: colors.tint }]}>
                        {story.level}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    storyCard: {
        flex: 1,
        margin: 4,
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    coverContainer: {
        position: 'relative',
    },
    storyCover: {
        width: '100%',
        height: 120,
        resizeMode: 'cover',
    },
    coverOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        padding: 8,
    },
    statusBadge: {
        backgroundColor: 'rgba(0,0,0,0.7)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    statusText: {
        color: 'white',
        fontSize: 10,
        fontWeight: '500',
    },
    ratingBadge: {
        backgroundColor: 'rgba(0,0,0,0.7)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    storyInfo: {
        padding: 8,
    },
    storyTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
    },
    storyAuthor: {
        fontSize: 12,
        marginBottom: 6,
    },
    storyMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    ratingText: {
        fontSize: 12,
        fontWeight: '500',
    },
    chapterText: {
        fontSize: 11,
    },
    levelText: {
        fontSize: 11,
        fontWeight: '500',
    },
    tagContainer: {
        flexDirection: 'row',
        gap: 4,
    },
    tag: {
        backgroundColor: '#E3F2FD',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    tagText: {
        fontSize: 10,
        color: '#1976D2',
    },
    storyCardList: {
        flexDirection: 'row',
        marginBottom: 12,
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    storyCoverList: {
        width: 80,
        height: 120,
        resizeMode: 'cover',
    },
    storyInfoList: {
        flex: 1,
        padding: 12,
    },
    storyTitleList: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    storyAuthorList: {
        fontSize: 14,
        marginBottom: 6,
    },
    storyDescriptionList: {
        fontSize: 12,
        marginBottom: 8,
        lineHeight: 16,
    },
    storyMetaList: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
}); 