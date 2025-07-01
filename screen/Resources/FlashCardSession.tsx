import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    Alert,
    Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useOxfordDatabase } from '../../hooks/useOxfordDatabase';
import { FlashCardWord } from '../../services/flashCardDatabase';
import FlashCard from '../../components/ui/FlashCard';
import OptimizedLoader from '../../components/ui/OptimizedLoader';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/store';
import { incrementProgress } from '../../store/userSlice';
import { getStreakStatus } from '../../utils/streakHelper';


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

    // Redux selectors and dispatch
    const dispatch = useDispatch();
    const streak = useSelector((state: RootState) => state.user.streak);

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
    const [previousStreak, setPreviousStreak] = useState(streak);
    const [isProcessing, setIsProcessing] = useState(false);

    // Memoize current word to prevent unnecessary re-renders
    const currentWord = useMemo(() => words[currentIndex] || null, [words, currentIndex]);

    // Memoize session type title
    const sessionTypeTitle = useMemo(() => {
        switch (params.sessionType) {
            case 'review': return 'Review Session';
            case 'new': return 'Learn New Words';
            case 'mixed': return 'Mixed Practice';
            default: return 'Flashcard Session';
        }
    }, [params.sessionType]);

    // Memoize accuracy calculation
    const accuracyPercentage = useMemo(() => {
        const attempted = sessionStats.correct + sessionStats.wrong;
        if (attempted === 0) return 0;
        return Math.round((sessionStats.correct / attempted) * 100);
    }, [sessionStats.correct, sessionStats.wrong]);

    // Memoize progress percentage
    const progressPercentage = useMemo(() => {
        if (words.length === 0) return 0;
        return ((currentIndex + 1) / words.length) * 100;
    }, [currentIndex, words.length]);

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
        } catch (err) {
            console.error('Error loading words:', err);

            Alert.alert(
                'Error',
                'Failed to load words for the session. Please try again.',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
        } finally {
            setIsLoading(false);
        }
    }, [params.sessionType, params.wordCount, getWordsForReview, getNewWordsForLearning, getMixedWordsForPractice, navigation]);

    // Optimize database initialization check
    useEffect(() => {
        if (isDbReady) {
            loadWords();
        } else {
            initializeDatabase();
        }
    }, [isDbReady]);

    // Track streak changes and show celebration
    useEffect(() => {
        if (streak > previousStreak && previousStreak > 0) {
            Alert.alert(
                '🎉 Chúc mừng!',
                `Bạn đã hoàn thành mục tiêu học tập hôm nay! ${getStreakStatus(streak)}`,
                [{ text: 'Tuyệt vời!', style: 'default' }]
            );
        }
        setPreviousStreak(streak);
    }, [streak, previousStreak]);

    const handleAnswer = useCallback(async (isCorrect: boolean) => {
        if (!currentWord || isProcessing) return;

        setIsProcessing(true);

        try {
            await updateLearningStats(currentWord.id, isCorrect);

            setSessionStats(prev => ({
                ...prev,
                correct: prev.correct + (isCorrect ? 1 : 0),
                wrong: prev.wrong + (isCorrect ? 0 : 1),
            }));

            // Track learning progress for new words only
            if (params.sessionType === 'new' || (params.sessionType === 'mixed' && !currentWord.learning_stats)) {
                // Increment progress in Redux
                dispatch(incrementProgress());
            }

            // Small delay to prevent rapid clicking
            setTimeout(() => {
                moveToNext();
                setIsProcessing(false);
            }, 300);
        } catch (error) {
            console.error('Error updating learning stats:', error);
            setIsProcessing(false);
            Alert.alert('Error', 'Failed to save your progress. Please try again.');
        }
    }, [currentWord, isProcessing, updateLearningStats, params.sessionType, dispatch]);

    const moveToNext = useCallback(() => {
        setShowAnswer(false);

        setCurrentIndex(prevIndex => {
            // console.log('moveToNext:', { prevIndex, wordsLength: words.length });
            if (prevIndex + 1 >= words.length) {
                // Session completed
                setShowResults(true);
                return prevIndex;
            } else {
                return prevIndex + 1;
            }
        });
    }, [words.length]);

    const handleSkip = useCallback(() => {
        setSessionStats(prev => ({ ...prev, skipped: prev.skipped + 1 }));
        moveToNext();
    }, [moveToNext]);

    const handleToggleAnswer = useCallback(() => {
        setShowAnswer(prev => !prev);
    }, []);

    const handleSessionComplete = useCallback(() => {
        setShowResults(false);
        navigation.goBack();
    }, [navigation]);

    const handleExitSession = useCallback(() => {
        Alert.alert(
            'Exit Session',
            'Are you sure you want to exit? Your progress will not be saved.',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Exit', style: 'destructive', onPress: () => navigation.goBack() },
            ]
        );
    }, [navigation]);

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <OptimizedLoader
                    isVisible={isLoading}
                    sessionType={params.sessionType}
                />
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
                    <Text style={styles.sessionTitle}>{sessionTypeTitle}</Text>
                    <Text style={styles.progressText}>
                        {currentIndex + 1} / {words.length}
                    </Text>
                </View>

                <View style={styles.accuracyContainer}>
                    <Text style={styles.accuracyText}>{accuracyPercentage}%</Text>
                </View>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressBarContainer}>
                <View
                    style={[
                        styles.progressBar,
                        { width: `${progressPercentage}%` }
                    ]}
                />
            </View>

            {/* FlashCard */}
            <View style={styles.cardContainer}>
                {currentWord && (
                    <FlashCard
                        word={currentWord}
                        onAnswer={handleAnswer}
                        onSkip={handleSkip}
                        showAnswer={showAnswer}
                        onToggleAnswer={handleToggleAnswer}
                        disabled={isProcessing}
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
                            <Text style={styles.resultsTitle}>Memory Progress</Text>
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
                                <Text style={styles.statLabel}>Remembered</Text>
                            </View>
                            <View style={styles.statItem}>
                                <Text style={[styles.statValue, { color: '#F59E0B' }]}>
                                    {sessionStats.wrong}
                                </Text>
                                <Text style={styles.statLabel}>Still learning</Text>
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
                            <Text style={styles.accuracyValue}>{accuracyPercentage}%</Text>
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
    loadingSubText: {
        marginTop: 8,
        fontSize: 14,
        color: '#9CA3AF',
        fontStyle: 'italic',
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