import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Story } from '../../types/story';
import { Colors } from '../../constants/Colors';
import { useColorScheme } from '../../hooks/useColorScheme';

interface StoryCardProps {
    story: Story;
    onPress: (story: Story) => void;
    viewMode?: 'grid' | 'list';
}

export default function StoryCard({ story, onPress, viewMode = 'grid' }: StoryCardProps) {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];

    const handlePress = () => {
        onPress(story);
    };

    if (viewMode === 'list') {
        return (
            <TouchableOpacity 
                style={[styles.listCard, { backgroundColor: colors.background, borderColor: colors.tabIconDefault + '30' }]} 
                onPress={handlePress}
            >
                <Image source={{ uri: story.cover }} style={styles.listCover} />
                <View style={styles.listContent}>
                    <Text style={[styles.listTitle, { color: colors.text }]} numberOfLines={2}>
                        {story.title}
                    </Text>
                    <Text style={[styles.listAuthor, { color: colors.tabIconDefault }]} numberOfLines={1}>
                        by {story.author}
                    </Text>
                    <Text style={[styles.listDescription, { color: colors.tabIconDefault }]} numberOfLines={3}>
                        {story.description}
                    </Text>
                    <View style={styles.listTags}>
                        {story.tags.slice(0, 3).map((tag, index) => (
                            <View key={index} style={[styles.tag, { backgroundColor: colors.tint + '20' }]}>
                                <Text style={[styles.tagText, { color: colors.tint }]}>{tag}</Text>
                            </View>
                        ))}
                    </View>
                    <View style={styles.listStats}>
                        <Text style={[styles.statText, { color: colors.tabIconDefault }]}>
                            ⭐ {story.rating}
                        </Text>
                        <Text style={[styles.statText, { color: colors.tabIconDefault }]}>
                            📖 {story.chapters} chapters
                        </Text>
                        <Text style={[styles.statText, { color: colors.tabIconDefault }]}>
                            {story.status}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity 
            style={[styles.gridCard, { backgroundColor: colors.background, borderColor: colors.text + '20' }]} 
            onPress={handlePress}
        >
            <Image source={{ uri: story.cover }} style={styles.gridCover} />
            <View style={styles.gridContent}>
                <Text style={[styles.gridTitle, { color: colors.text }]} numberOfLines={2}>
                    {story.title}
                </Text>
                <Text style={[styles.gridAuthor, { color: colors.tabIconDefault }]} numberOfLines={1}>
                    {story.author}
                </Text>
                <View style={styles.gridStats}>
                    <Text style={[styles.statText, { color: colors.tabIconDefault }]}>
                        ⭐ {story.rating}
                    </Text>
                    <Text style={[styles.statText, { color: colors.tabIconDefault }]}>
                        {story.status}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    // Grid view styles
    gridCard: {
        width: '48%',
        marginBottom: 16,
        borderRadius: 8,
        borderWidth: 1,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    gridCover: {
        width: '100%',
        height: 220,
        resizeMode: 'cover',
    },
    gridContent: {
        padding: 12,
    },
    gridTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 4,
        lineHeight: 18,
    },
    gridAuthor: {
        fontSize: 12,
        marginBottom: 8,
    },
    gridStats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    // List view styles
    listCard: {
        flexDirection: 'row',
        marginBottom: 16,
        borderRadius: 8,
        borderWidth: 1,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    listCover: {
        width: 120,
        height: 160,
        resizeMode: 'cover',
    },
    listContent: {
        flex: 1,
        padding: 12,
    },
    listTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
        lineHeight: 20,
    },
    listAuthor: {
        fontSize: 14,
        marginBottom: 8,
    },
    listDescription: {
        fontSize: 12,
        lineHeight: 16,
        marginBottom: 8,
    },
    listTags: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 8,
    },
    tag: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginRight: 6,
        marginBottom: 4,
    },
    tagText: {
        fontSize: 10,
        fontWeight: '600',
    },
    listStats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statText: {
        fontSize: 12,
        fontWeight: '500',
    },
});
