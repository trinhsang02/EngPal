import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { useColorScheme } from '../../hooks/useColorScheme';

interface StoryFiltersProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    selectedLevel: string;
    onLevelChange: (level: string) => void;
    selectedGenre: string;
    onGenreChange: (genre: string) => void;
    showFilters: boolean;
    onToggleFilters: () => void;
    viewMode: 'grid' | 'list';
    onViewModeChange: (mode: 'grid' | 'list') => void;
}

const levels = ['All', 'Beginner', 'Intermediate', 'Advanced'];
const genres = ['All', 'Fantasy', 'Romance', 'Adventure', 'Drama', 'Mystery', 'Classic'];

export const StoryFilters: React.FC<StoryFiltersProps> = ({
    searchQuery,
    onSearchChange,
    selectedLevel,
    onLevelChange,
    selectedGenre,
    onGenreChange,
    showFilters,
    onToggleFilters,
    viewMode,
    onViewModeChange,
}) => {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];

    return (
        <View>
            {/* Search and View Mode */}
            <View style={styles.searchContainer}>
                <View style={[styles.searchBar, { backgroundColor: colorScheme === 'dark' ? '#2A2A2A' : '#F5F5F5' }]}>
                    <Ionicons name="search" size={20} color={colors.icon} />
                    <TextInput
                        style={[styles.searchInput, { color: colors.text }]}
                        placeholder="Search stories..."
                        placeholderTextColor={colors.icon}
                        value={searchQuery}
                        onChangeText={onSearchChange}
                    />
                    <TouchableOpacity onPress={onToggleFilters}>
                        <Ionicons name="filter" size={20} color={colors.icon} />
                    </TouchableOpacity>
                </View>

                <View style={styles.viewModeContainer}>
                    <TouchableOpacity
                        style={[styles.viewModeButton, viewMode === 'grid' && styles.viewModeActive]}
                        onPress={() => onViewModeChange('grid')}
                    >
                        <Ionicons name="grid" size={20} color={viewMode === 'grid' ? colors.tint : colors.icon} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.viewModeButton, viewMode === 'list' && styles.viewModeActive]}
                        onPress={() => onViewModeChange('list')}
                    >
                        <Ionicons name="list" size={20} color={viewMode === 'list' ? colors.tint : colors.icon} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Filters */}
            {showFilters && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
                    <Text style={[styles.filterLabel, { color: colors.text }]}>Level:</Text>
                    {levels.map((level) => (
                        <TouchableOpacity
                            key={level}
                            style={[
                                styles.filterChip,
                                selectedLevel === level && { backgroundColor: colors.tint }
                            ]}
                            onPress={() => onLevelChange(level)}
                        >
                            <Text style={[
                                styles.filterChipText,
                                selectedLevel === level && { color: '#fff' }
                            ]}>
                                {level}
                            </Text>
                        </TouchableOpacity>
                    ))}

                    <Text style={[styles.filterLabel, { color: colors.text }]}>Genre:</Text>
                    {genres.map((genre) => (
                        <TouchableOpacity
                            key={genre}
                            style={[
                                styles.filterChip,
                                selectedGenre === genre && { backgroundColor: colors.tint }
                            ]}
                            onPress={() => onGenreChange(genre)}
                        >
                            <Text style={[
                                styles.filterChipText,
                                selectedGenre === genre && { color: '#fff' }
                            ]}>
                                {genre}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 12,
        gap: 12,
    },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 16,
    },
    viewModeContainer: {
        flexDirection: 'row',
        backgroundColor: '#F5F5F5',
        borderRadius: 8,
        padding: 2,
    },
    viewModeButton: {
        padding: 8,
        borderRadius: 6,
    },
    viewModeActive: {
        backgroundColor: '#fff',
    },
    filtersContainer: {
        paddingHorizontal: 16,
        paddingBottom: 12,
    },
    filterLabel: {
        fontSize: 14,
        fontWeight: '600',
        marginRight: 8,
        alignSelf: 'center',
    },
    filterChip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: '#F5F5F5',
        marginRight: 8,
    },
    filterChipText: {
        fontSize: 12,
        color: '#666',
    },
}); 