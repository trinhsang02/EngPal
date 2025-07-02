import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Modal,
    FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { useColorScheme } from '../../hooks/useColorScheme';

interface MangaDexSearchProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    selectedTags: string[];
    onTagsChange: (tags: string[]) => void;
    selectedStatus: string[];
    onStatusChange: (status: string[]) => void;
    selectedContentRating: string[];
    onContentRatingChange: (rating: string[]) => void;
    viewMode: 'grid' | 'list';
    onViewModeChange: (mode: 'grid' | 'list') => void;
    onSearch: () => void;
}

const AVAILABLE_TAGS = [
    'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Mystery',
    'Romance', 'Sci-Fi', 'Slice of Life', 'Supernatural', 'Thriller', 'Sports',
    'Psychological', 'Historical', 'Martial Arts', 'Mecha', 'Music', 'School Life',
    'Seinen', 'Shoujo', 'Shounen', 'Josei', 'Yaoi', 'Yuri', 'Harem', 'Isekai',
    'Magic', 'Military', 'Monsters', 'Parody', 'Police', 'Post-Apocalyptic',
    'Reincarnation', 'Reverse Harem', 'Samurai', 'Superhero', 'Time Travel',
    'Vampire', 'Video Games', 'Villainess', 'Virtual Reality', 'Zombies'
];

const STATUS_OPTIONS = [
    { value: 'ongoing', label: 'Ongoing' },
    { value: 'completed', label: 'Completed' },
    { value: 'hiatus', label: 'Hiatus' },
    { value: 'cancelled', label: 'Cancelled' }
];

const CONTENT_RATINGS = [
    { value: 'safe', label: 'Safe' },
    { value: 'suggestive', label: 'Suggestive' },
    { value: 'erotica', label: 'Erotica' },
    { value: 'pornographic', label: 'Pornographic' }
];

export const MangaDexSearch: React.FC<MangaDexSearchProps> = ({
    searchQuery,
    onSearchChange,
    selectedTags,
    onTagsChange,
    selectedStatus,
    onStatusChange,
    selectedContentRating,
    onContentRatingChange,
    viewMode,
    onViewModeChange,
    onSearch,
}) => {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];

    const [showFilters, setShowFilters] = useState(false);
    const [showTags, setShowTags] = useState(false);
    const [showStatus, setShowStatus] = useState(false);
    const [showContentRating, setShowContentRating] = useState(false);

    const toggleTag = (tag: string) => {
        if (selectedTags.includes(tag)) {
            onTagsChange(selectedTags.filter(t => t !== tag));
        } else {
            onTagsChange([...selectedTags, tag]);
        }
    };

    const toggleStatus = (status: string) => {
        if (selectedStatus.includes(status)) {
            onStatusChange(selectedStatus.filter(s => s !== status));
        } else {
            onStatusChange([...selectedStatus, status]);
        }
    };

    const toggleContentRating = (rating: string) => {
        if (selectedContentRating.includes(rating)) {
            onContentRatingChange(selectedContentRating.filter(r => r !== rating));
        } else {
            onContentRatingChange([...selectedContentRating, rating]);
        }
    };

    const clearAllFilters = () => {
        onTagsChange([]);
        onStatusChange([]);
        onContentRatingChange([]);
    };

    const hasActiveFilters = selectedTags.length > 0 || selectedStatus.length > 0 || selectedContentRating.length > 0;

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Search Bar */}
            <View style={[styles.searchContainer, { backgroundColor: colors.background }]}>
                <Ionicons name="search" size={20} color={colors.icon} style={styles.searchIcon} />
                <TextInput
                    style={[styles.searchInput, { color: colors.text }]}
                    placeholder="Search manga..."
                    placeholderTextColor={colors.icon}
                    value={searchQuery}
                    onChangeText={onSearchChange}
                    onSubmitEditing={onSearch}
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => onSearchChange('')}>
                        <Ionicons name="close-circle" size={20} color={colors.icon} />
                    </TouchableOpacity>
                )}
            </View>

            {/* Active Filters */}
            {hasActiveFilters && (
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.activeFiltersContainer}
                >
                    {selectedTags.map(tag => (
                        <View key={tag} style={[styles.activeFilter, { backgroundColor: colors.tint }]}>
                            <Text style={styles.activeFilterText}>{tag}</Text>
                            <TouchableOpacity onPress={() => toggleTag(tag)}>
                                <Ionicons name="close" size={14} color="white" />
                            </TouchableOpacity>
                        </View>
                    ))}
                    {selectedStatus.map(status => (
                        <View key={status} style={[styles.activeFilter, { backgroundColor: colors.tint }]}>
                            <Text style={styles.activeFilterText}>{status}</Text>
                            <TouchableOpacity onPress={() => toggleStatus(status)}>
                                <Ionicons name="close" size={14} color="white" />
                            </TouchableOpacity>
                        </View>
                    ))}
                    {selectedContentRating.map(rating => (
                        <View key={rating} style={[styles.activeFilter, { backgroundColor: colors.tint }]}>
                            <Text style={styles.activeFilterText}>{rating}</Text>
                            <TouchableOpacity onPress={() => toggleContentRating(rating)}>
                                <Ionicons name="close" size={14} color="white" />
                            </TouchableOpacity>
                        </View>
                    ))}
                    <TouchableOpacity onPress={clearAllFilters} style={styles.clearAllButton}>
                        <Text style={[styles.clearAllText, { color: colors.tint }]}>Clear All</Text>
                    </TouchableOpacity>
                </ScrollView>
            )}

            {/* Filter Buttons */}
            <View style={styles.filterButtons}>
                <TouchableOpacity
                    style={[styles.filterButton, { backgroundColor: colors.background }]}
                    onPress={() => setShowTags(true)}
                >
                    <Ionicons name="pricetag" size={16} color={colors.icon} />
                    <Text style={[styles.filterButtonText, { color: colors.text }]}>
                        Tags {selectedTags.length > 0 && `(${selectedTags.length})`}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.filterButton, { backgroundColor: colors.background }]}
                    onPress={() => setShowStatus(true)}
                >
                    <Ionicons name="time" size={16} color={colors.icon} />
                    <Text style={[styles.filterButtonText, { color: colors.text }]}>
                        Status {selectedStatus.length > 0 && `(${selectedStatus.length})`}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.filterButton, { backgroundColor: colors.background }]}
                    onPress={() => setShowContentRating(true)}
                >
                    <Ionicons name="shield" size={16} color={colors.icon} />
                    <Text style={[styles.filterButtonText, { color: colors.text }]}>
                        Rating {selectedContentRating.length > 0 && `(${selectedContentRating.length})`}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.viewModeButton, { backgroundColor: colors.background }]}
                    onPress={() => onViewModeChange(viewMode === 'grid' ? 'list' : 'grid')}
                >
                    <Ionicons
                        name={viewMode === 'grid' ? 'list' : 'grid'}
                        size={16}
                        color={colors.icon}
                    />
                </TouchableOpacity>
            </View>

            {/* Tags Modal */}
            <Modal
                visible={showTags}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowTags(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>Select Tags</Text>
                            <TouchableOpacity onPress={() => setShowTags(false)}>
                                <Ionicons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={AVAILABLE_TAGS}
                            keyExtractor={(item) => item}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.tagItem,
                                        selectedTags.includes(item) && { backgroundColor: colors.tint + '20' }
                                    ]}
                                    onPress={() => toggleTag(item)}
                                >
                                    <Text style={[styles.tagText, { color: colors.text }]}>{item}</Text>
                                    {selectedTags.includes(item) && (
                                        <Ionicons name="checkmark" size={16} color={colors.tint} />
                                    )}
                                </TouchableOpacity>
                            )}
                            showsVerticalScrollIndicator={false}
                        />
                    </View>
                </View>
            </Modal>

            {/* Status Modal */}
            <Modal
                visible={showStatus}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowStatus(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>Select Status</Text>
                            <TouchableOpacity onPress={() => setShowStatus(false)}>
                                <Ionicons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={STATUS_OPTIONS}
                            keyExtractor={(item) => item.value}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.tagItem,
                                        selectedStatus.includes(item.value) && { backgroundColor: colors.tint + '20' }
                                    ]}
                                    onPress={() => toggleStatus(item.value)}
                                >
                                    <Text style={[styles.tagText, { color: colors.text }]}>{item.label}</Text>
                                    {selectedStatus.includes(item.value) && (
                                        <Ionicons name="checkmark" size={16} color={colors.tint} />
                                    )}
                                </TouchableOpacity>
                            )}
                            showsVerticalScrollIndicator={false}
                        />
                    </View>
                </View>
            </Modal>

            {/* Content Rating Modal */}
            <Modal
                visible={showContentRating}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowContentRating(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>Select Content Rating</Text>
                            <TouchableOpacity onPress={() => setShowContentRating(false)}>
                                <Ionicons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={CONTENT_RATINGS}
                            keyExtractor={(item) => item.value}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.tagItem,
                                        selectedContentRating.includes(item.value) && { backgroundColor: colors.tint + '20' }
                                    ]}
                                    onPress={() => toggleContentRating(item.value)}
                                >
                                    <Text style={[styles.tagText, { color: colors.text }]}>{item.label}</Text>
                                    {selectedContentRating.includes(item.value) && (
                                        <Ionicons name="checkmark" size={16} color={colors.tint} />
                                    )}
                                </TouchableOpacity>
                            )}
                            showsVerticalScrollIndicator={false}
                        />
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginBottom: 12,
    },
    searchIcon: {
        marginRight: 12,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
    },
    activeFiltersContainer: {
        marginBottom: 12,
    },
    activeFilter: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        marginRight: 8,
    },
    activeFilterText: {
        color: 'white',
        fontSize: 12,
        marginRight: 6,
    },
    clearAllButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#ccc',
    },
    clearAllText: {
        fontSize: 12,
    },
    filterButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    filterButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        gap: 6,
    },
    viewModeButton: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    filterButtonText: {
        fontSize: 14,
        fontWeight: '500',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        height: '70%',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 16,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    tagItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginBottom: 4,
    },
    tagText: {
        fontSize: 16,
    },
});

export default MangaDexSearch; 