import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { useColorScheme } from '../../hooks/useColorScheme';
import { StoryCard } from './StoryCard';
import { Story } from '../../types/story';

interface StoryListProps {
    stories: Story[];
    viewMode: 'grid' | 'list';
    onStoryPress: (story: Story) => void;
}

export const StoryList: React.FC<StoryListProps> = ({
    stories,
    viewMode,
    onStoryPress,
}) => {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];

    const renderStoryCard = ({ item }: { item: Story }) => (
        <StoryCard
            story={item}
            onPress={onStoryPress}
            viewMode={viewMode}
        />
    );

    return (
        <FlatList
            data={stories}
            renderItem={renderStoryCard}
            key={viewMode}
            numColumns={viewMode === 'grid' ? 2 : 1}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.storiesList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
                <View style={styles.emptyContainer}>
                    <Ionicons name="book-outline" size={64} color={colors.icon} />
                    <Text style={[styles.emptyText, { color: colors.text }]}>
                        No stories found
                    </Text>
                    <Text style={[styles.emptySubtext, { color: colors.icon }]}>
                        Try adjusting your search or filters
                    </Text>
                </View>
            }
        />
    );
};

const styles = StyleSheet.create({
    storiesList: {
        paddingHorizontal: 16,
        paddingBottom: 20,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 14,
        marginTop: 8,
    },
}); 