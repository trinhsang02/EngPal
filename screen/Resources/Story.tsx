// import React, { useState, useEffect } from 'react';
// import { SafeAreaView, StyleSheet, StatusBar, Alert } from 'react-native';
// import { Header } from '../../components/ui/Header';
// import MangaDexReader from '../../components/ui/MangaDexReader';
// import { Colors } from '../../constants/Colors';
// import { useColorScheme } from '../../hooks/useColorScheme';
// import { Story, Chapter } from '../../types/story';
// import mangadexService from '../../services/mangadexService';

// // Mock data for stories
// const mockStories: Story[] = [
//     {
//         id: '1',
//         title: 'The Little Prince',
//         author: 'Antoine de Saint-Exupéry',
//         cover: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400',
//         description: 'A timeless tale about a young prince who travels from planet to planet, learning about the nature of love and life.',
//         level: 'Intermediate',
//         chapters: 27,
//         rating: 4.8,
//         readCount: 15420,
//         tags: ['Fantasy', 'Philosophy', 'Adventure'],
//         status: 'Completed'
//     },
//     {
//         id: '2',
//         title: 'Alice in Wonderland',
//         author: 'Lewis Carroll',
//         cover: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
//         description: 'Follow Alice as she falls down a rabbit hole into a world of fantasy and imagination.',
//         level: 'Beginner',
//         chapters: 12,
//         rating: 4.6,
//         readCount: 12350,
//         tags: ['Fantasy', 'Adventure', 'Children'],
//         status: 'Completed'
//     },
//     {
//         id: '3',
//         title: 'The Great Gatsby',
//         author: 'F. Scott Fitzgerald',
//         cover: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400',
//         description: 'A story of decadence and excess, Gatsby explores the darker aspects of the Jazz Age.',
//         level: 'Advanced',
//         chapters: 9,
//         rating: 4.7,
//         readCount: 9870,
//         tags: ['Drama', 'Romance', 'Classic'],
//         status: 'Completed'
//     },
//     {
//         id: '4',
//         title: 'Pride and Prejudice',
//         author: 'Jane Austen',
//         cover: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=400',
//         description: 'A classic romance novel about the relationship between Elizabeth Bennet and Mr. Darcy.',
//         level: 'Advanced',
//         chapters: 61,
//         rating: 4.9,
//         readCount: 18760,
//         tags: ['Romance', 'Classic', 'Drama'],
//         status: 'Completed'
//     },
//     {
//         id: '5',
//         title: 'The Hobbit',
//         author: 'J.R.R. Tolkien',
//         cover: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
//         description: 'Bilbo Baggins embarks on an unexpected journey with thirteen dwarves and a wizard.',
//         level: 'Intermediate',
//         chapters: 19,
//         rating: 4.8,
//         readCount: 14230,
//         tags: ['Fantasy', 'Adventure', 'Epic'],
//         status: 'Completed'
//     },
// ];

// export default function StoryScreen({ navigation }: { navigation: any }) {
//     const colorScheme = useColorScheme();
//     const colors = Colors[colorScheme ?? 'light'];

//     const [stories, setStories] = useState<Story[]>([]);
//     const [filteredStories, setFilteredStories] = useState<Story[]>([]);
//     const [searchQuery, setSearchQuery] = useState('');
//     const [selectedTags, setSelectedTags] = useState<string[]>([]);
//     const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
//     const [selectedContentRating, setSelectedContentRating] = useState<string[]>(['safe', 'suggestive']);
//     const [selectedStory, setSelectedStory] = useState<Story | null>(null);
//     const [showStoryModal, setShowStoryModal] = useState(false);
//     const [showReader, setShowReader] = useState(false);
//     const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
//     const [loading, setLoading] = useState(true);

//     useEffect(() => {
//         loadStories();
//     }, []);

//     useEffect(() => {
//         filterStories();
//     }, [searchQuery, selectedTags, selectedStatus, selectedContentRating, stories]);

//     const loadStories = async () => {
//         try {
//             setLoading(true);

//             // Test connection first
//             console.log('Testing MangaDx connection...');
//             const testResult = await mangadexService.testConnection();
//             console.log('Connection test result:', testResult);            // Load popular manga from MangaDx
//             const popularStories = await mangadexService.getPopularManga(20);
//             console.log('Loaded stories count:', popularStories.length);
//             console.log('First story:', popularStories[0]);
//             console.log('First story chapters:', popularStories[0]?.chapters);
//             setStories(popularStories);

//             // Check if we got mock data (API is blocked)
//             if (popularStories.length > 0 && popularStories[0].id.startsWith('mock-')) {
//                 Alert.alert(
//                     'Demo Mode',
//                     'MangaDx API is currently blocked. Showing demo stories for testing purposes.',
//                     [{ text: 'OK' }]
//                 );
//             }
//         } catch (error) {
//             console.error('Error loading stories:', error);
//             // Fallback to mock data if API fails
//             setStories(mockStories);
//             Alert.alert(
//                 'Connection Error',
//                 'Unable to connect to MangaDx. Showing demo stories instead.',
//                 [{ text: 'OK' }]
//             );
//         } finally {
//             setLoading(false);
//         }
//     };

//     const filterStories = () => {
//         let filtered = stories;

//         if (searchQuery) {
//             filtered = filtered.filter(story =>
//                 story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
//                 story.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
//                 story.description.toLowerCase().includes(searchQuery.toLowerCase())
//             );
//         }

//         if (selectedTags.length > 0) {
//             filtered = filtered.filter(story =>
//                 selectedTags.some(tag => story.tags.includes(tag))
//             );
//         }

//         if (selectedStatus.length > 0) {
//             filtered = filtered.filter(story =>
//                 selectedStatus.includes(story.status.toLowerCase())
//             );
//         }

//         setFilteredStories(filtered);
//     };

//     const handleSearch = async () => {
//         try {
//             setLoading(true);
//             const searchResults = await mangadexService.searchManga(searchQuery, 20);
//             setStories(searchResults);
//         } catch (error) {
//             console.error('Error searching manga:', error);
//             Alert.alert('Error', 'Failed to search manga');
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleStoryPress = (story: Story) => {
//         setSelectedStory(story);
//         setShowStoryModal(true);
//     };

//     const handleStartReading = (story: Story) => {
//         setSelectedStory(story);
//         setShowStoryModal(false);
//         setShowReader(true);
//     };

//     const handleViewChapters = (story: Story) => {
//         // TODO: Navigate to chapters list screen
//         console.log('View chapters:', story.title);
//         setShowStoryModal(false);
//     };

//     const handleChapterSelect = (chapter: Chapter) => {
//         console.log('Selected chapter:', chapter.title);
//         // Handle chapter selection if needed
//     };

//     return (
//         <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
//             <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />

//             {/* Header */}
//             <Header />
//             {/* MangaDex Reader */}
//             {showReader && selectedStory && (
//                 <MangaDexReader
//                     story={selectedStory}
//                     onClose={() => setShowReader(false)}
//                     onChapterSelect={handleChapterSelect}
//                 />
//             )}
//         </SafeAreaView>
//     );
// }

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         padding: 10,
//     },
// });
