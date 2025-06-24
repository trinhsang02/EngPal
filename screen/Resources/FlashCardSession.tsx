import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    Alert,
    ActivityIndicator,
    Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useOxfordDatabase } from '../../hooks/useOxfordDatabase';
import { FlashCardWord } from '../../services/flashCardDatabase';
import FlashCard from '../../components/ui/FlashCard';

interface SessionStats {
    total: number;
    correct: number;
    wrong: number;
    skipped: number;
}

interface RouteParams {
    sessionType: 'review' | 'new' | 'mixed';
    wordCount?: number;
}

export default function FlashCardSession() {
    const navigation = useNavigation();
    const route = useRoute();
    const params = route.params as RouteParams;

    const {
        updateLearningStats,
        getWordsForReview,
        getNewWordsForLearning,
        getMixedWordsForPractice,
        initializeDatabase,
        isDbReady
    } = useOxfordDatabase();

    const [words, setWords] = useState<FlashCardWord[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [sessionStats, setSessionStats] = useState<SessionStats>({
        total: 0,
        correct: 0,
        wrong: 0,
        skipped: 0,
    });
    const [showResults, setShowResults] = useState(false);

    const loadWords = useCallback(async () => {
        try {
            setIsLoading(true);
            const wordCount = params.wordCount || 20;
            let loadedWords: FlashCardWord[] = [];

            switch (params.sessionType) {
                case 'review':
                    loadedWords = await getWordsForReview(wordCount);
                    break;
                case 'new':
                    loadedWords = await getNewWordsForLearning(wordCount);
                    break;
                case 'mixed':
                    loadedWords = await getMixedWordsForPractice(wordCount);
                    break;
            }

            if (loadedWords.length === 0) {
                Alert.alert(
                    'No Words Available',
                    'No words are available for this session type. Try adding more words or changing the session type.',
                    [{ text: 'OK', onPress: () => navigation.goBack() }]
                );
                return;
            }

            setWords(loadedWords);
            setSessionStats(prev => ({ ...prev, total: loadedWords.length }));
        } catch (error) {
            console.error('Error loading words:', error);
            Alert.alert(
                'Error',
                'Failed to load words for the session. Please try again.',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
        } finally {
            setIsLoading(false);
        }
    }, [params, getWordsForReview, getNewWordsForLearning, getMixedWordsForPractice, navigation]);

    useEffect(() => {
        if (isDbReady) {
            loadWords();
        } else {
            initializeDatabase();
        }
    }, [isDbReady, loadWords, initializeDatabase]);

    const handleAnswer = async (isCorrect: boolean) => {
        const currentWord = words[currentIndex];
        if (!currentWord) return;

        try {
            await updateLearningStats(currentWord.id, isCorrect);

            setSessionStats(prev => ({
                ...prev,
                correct: prev.correct + (isCorrect ? 1 : 0),
                wrong: prev.wrong + (isCorrect ? 0 : 1),
            }));

            moveToNext();
        } catch (error) {
            console.error('Error updating learning stats:', error);
            Alert.alert('Error', 'Failed to save your progress. Please try again.');
        }
    };

    const handleSkip = () => {
        setSessionStats(prev => ({ ...prev, skipped: prev.skipped + 1 }));
        moveToNext();
    };

    const moveToNext = () => {
        setShowAnswer(false);

        if (currentIndex + 1 >= words.length) {
            // Session completed
            setShowResults(true);
        } else {
            setCurrentIndex(prev => prev + 1);
        }
    };

    const handleToggleAnswer = () => {
        setShowAnswer(prev => !prev);
    };

    const handleSessionComplete = () => {
        setShowResults(false);
        navigation.goBack();
    };

    const handleExitSession = () => {
        Alert.alert(
            'Exit Session',
            'Are you sure you want to exit? Your progress will not be saved.',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Exit', style: 'destructive', onPress: () => navigation.goBack() },
            ]
        );
    };

    const getSessionTypeTitle = () => {
        switch (params.sessionType) {
            case 'review': return 'Review Session';
            case 'new': return 'Learn New Words';
            case 'mixed': return 'Mixed Practice';
            default: return 'Flashcard Session';
        }
    };

    const getAccuracyPercentage = () => {
        const attempted = sessionStats.correct + sessionStats.wrong;
        if (attempted === 0) return 0;
        return Math.round((sessionStats.correct / attempted) * 100);
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#4A90E2" />
                    <Text style={styles.loadingText}>Loading flashcards...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (words.length === 0) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.emptyContainer}>
                    <Ionicons name="school" size={64} color="#D1D5DB" />
                    <Text style={styles.emptyTitle}>No words available</Text>
                    <Text style={styles.emptyMessage}>
                        Try changing the session type or add more words to your vocabulary.
                    </Text>
                    <TouchableOpacity style={styles.goBackButton} onPress={() => navigation.goBack()}>
                        <Text style={styles.goBackButtonText}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={handleExitSession} style={styles.exitButton}>
                    <Ionicons name="close" size={24} color="#6B7280" />
                </TouchableOpacity>

                <View style={styles.headerCenter}>
                    <Text style={styles.sessionTitle}>{getSessionTypeTitle()}</Text>
                    <Text style={styles.progressText}>
                        {currentIndex + 1} / {words.length}
                    </Text>
                </View>

                <View style={styles.accuracyContainer}>
                    <Text style={styles.accuracyText}>{getAccuracyPercentage()}%</Text>
                </View>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressBarContainer}>
                <View
                    style={[
                        styles.progressBar,
                        { width: `${((currentIndex + 1) / words.length) * 100}%` }
                    ]}
                />
            </View>

            {/* FlashCard */}
            <View style={styles.cardContainer}>
                {words[currentIndex] && (
                    <FlashCard
                        word={words[currentIndex]}
                        onAnswer={handleAnswer}
                        onSkip={handleSkip}
                        showAnswer={showAnswer}
                        onToggleAnswer={handleToggleAnswer}
                    />
                )}
            </View>

            {/* Session Results Modal */}
            <Modal
                visible={showResults}
                animationType="slide"
                transparent={true}
                onRequestClose={handleSessionComplete}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.resultsContainer}>
                        <View style={styles.resultsHeader}>
                            <Ionicons name="trophy" size={48} color="#F59E0B" />
                            <Text style={styles.resultsTitle}>Session Complete!</Text>
                        </View>

                        <View style={styles.statsGrid}>
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>{sessionStats.total}</Text>
                                <Text style={styles.statLabel}>Total</Text>
                            </View>
                            <View style={styles.statItem}>
                                <Text style={[styles.statValue, { color: '#10B981' }]}>
                                    {sessionStats.correct}
                                </Text>
                                <Text style={styles.statLabel}>Correct</Text>
                            </View>
                            <View style={styles.statItem}>
                                <Text style={[styles.statValue, { color: '#F59E0B' }]}>
                                    {sessionStats.wrong}
                                </Text>
                                <Text style={styles.statLabel}>Wrong</Text>
                            </View>
                            <View style={styles.statItem}>
                                <Text style={[styles.statValue, { color: '#6B7280' }]}>
                                    {sessionStats.skipped}
                                </Text>
                                <Text style={styles.statLabel}>Skipped</Text>
                            </View>
                        </View>

                        <View style={styles.accuracyResult}>
                            <Text style={styles.accuracyLabel}>Accuracy</Text>
                            <Text style={styles.accuracyValue}>{getAccuracyPercentage()}%</Text>
                        </View>

                        <TouchableOpacity
                            style={styles.completeButton}
                            onPress={handleSessionComplete}
                        >
                            <Text style={styles.completeButtonText}>Continue</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#6B7280',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#374151',
        marginTop: 16,
        marginBottom: 8,
    },
    emptyMessage: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 24,
    },
    goBackButton: {
        backgroundColor: '#4A90E2',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    goBackButtonText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    exitButton: {
        padding: 8,
    },
    headerCenter: {
        alignItems: 'center',
    },
    sessionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#374151',
    },
    progressText: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 2,
    },
    accuracyContainer: {
        backgroundColor: '#EBF4FF',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    accuracyText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4A90E2',
    },
    progressBarContainer: {
        height: 4,
        backgroundColor: '#E5E7EB',
        marginHorizontal: 20,
        borderRadius: 2,
        marginTop: 8,
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#4A90E2',
        borderRadius: 2,
    },
    cardContainer: {
        flex: 1,
        paddingTop: 20,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    resultsContainer: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 30,
        width: '100%',
        maxWidth: 400,
        alignItems: 'center',
    },
    resultsHeader: {
        alignItems: 'center',
        marginBottom: 30,
    },
    resultsTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#374151',
        marginTop: 16,
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginBottom: 30,
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#374151',
    },
    statLabel: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 4,
    },
    accuracyResult: {
        backgroundColor: '#F0F9FF',
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 30,
    },
    accuracyLabel: {
        fontSize: 16,
        color: '#0369A1',
        marginBottom: 4,
    },
    accuracyValue: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#0369A1',
    },
    completeButton: {
        backgroundColor: '#4A90E2',
        paddingHorizontal: 40,
        paddingVertical: 16,
        borderRadius: 12,
        width: '100%',
    },
    completeButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
    },
}); 