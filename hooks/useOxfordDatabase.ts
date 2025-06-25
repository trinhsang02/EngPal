import { useState, useEffect, useCallback } from 'react';
import OxfordDatabaseService, { Word, WordDetail } from '../services/oxfordDatabase';
import FlashCardDatabaseService, { FlashCardWord, StudyStatistics } from '../services/flashCardDatabase';
import { databaseManager } from '../services/databaseManager';

export const useOxfordDatabase = () => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isDbReady, setIsDbReady] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [words, setWords] = useState<Word[]>([]);
    const [currentWord, setCurrentWord] = useState<WordDetail | null>(null);

    const dbService = OxfordDatabaseService.getInstance();
    const flashCardService = FlashCardDatabaseService.getInstance();

    // Initialize database using the global manager
    const initializeDatabase = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            await databaseManager.initialize();

            // Check if initialization was successful
            if (databaseManager.isReady()) {
                setIsDbReady(true);
            } else {
                const state = databaseManager.getState();
                throw new Error(state.error || 'Database initialization failed');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Database initialization failed';
            setError(errorMessage);
            setIsDbReady(false);
            console.error('Database initialization error:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Subscribe to database manager state changes
    useEffect(() => {
        const unsubscribe = databaseManager.subscribe((state) => {
            setIsDbReady(state.isInitialized && databaseManager.isReady());
            setIsLoading(state.isInitializing);
            setError(state.error);
        });

        return unsubscribe;
    }, []);

    const searchWords = useCallback(async (query: string) => {
        try {
            // Ensure database is ready
            if (!databaseManager.isReady()) {
                await databaseManager.waitForReady();
            }

            setIsLoading(true);
            setError(null);
            const results = await dbService.searchWords(query);
            setWords(results);
            return results;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Search failed';
            setError(errorMessage);
            console.error('Search error:', err);
            return [];
        } finally {
            setIsLoading(false);
        }
    }, []);

    const getAllWords = useCallback(async () => {
        try {
            // Ensure database is ready
            if (!databaseManager.isReady()) {
                const isReady = await databaseManager.waitForReady();
                if (!isReady) {
                    throw new Error('Database failed to become ready');
                }
            }

            setIsLoading(true);
            setError(null);

            const results = await dbService.getAllWords();
            setWords(results);
            return results;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to get words';
            setError(errorMessage);
            console.error('Get all words error:', err);
            return [];
        } finally {
            setIsLoading(false);
        }
    }, []);

    const getWordDetail = useCallback(async (wordId: number) => {
        try {
            // Ensure database is ready
            if (!databaseManager.isReady()) {
                await databaseManager.waitForReady();
            }

            setIsLoading(true);
            setError(null);
            const result = await dbService.getWordDetail(wordId);
            setCurrentWord(result);
            return result;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to get word details';
            setError(errorMessage);
            console.error('Get word detail error:', err);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const updateMasteredStatus = useCallback(async (wordId: number, isMastered: boolean) => {
        try {
            // Ensure database is ready
            if (!databaseManager.isReady()) {
                await databaseManager.waitForReady();
            }

            await dbService.updateWordMasteredStatus(wordId, isMastered);

            // Update local state
            setWords(prevWords =>
                prevWords.map(word =>
                    word.id === wordId ? { ...word, mastered: isMastered } : word
                )
            );

            if (currentWord && currentWord.id === wordId) {
                setCurrentWord(prev => prev ? { ...prev, mastered: isMastered } : null);
            }

            return true;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to update mastered status';
            setError(errorMessage);
            console.error('Update mastered status error:', err);
            return false;
        }
    }, [currentWord]);

    const getRandomWords = useCallback(async (count: number = 10) => {
        try {
            // Ensure database is ready
            if (!databaseManager.isReady()) {
                await databaseManager.waitForReady();
            }

            setIsLoading(true);
            setError(null);
            const results = await dbService.getRandomWords(count);
            return results;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to get random words';
            setError(errorMessage);
            console.error('Get random words error:', err);
            return [];
        } finally {
            setIsLoading(false);
        }
    }, []);

    const getWordsForReview = useCallback(async (limit: number = 20): Promise<FlashCardWord[]> => {
        try {
            // Ensure database is ready
            if (!databaseManager.isReady()) {
                await databaseManager.waitForReady();
            }

            const result = await flashCardService.getWordsForReview(limit);
            return result;
        } catch (err) {
            console.error('Hook: Error getting words for review:', err);
            setError(err instanceof Error ? err.message : 'Failed to get words for review');
            throw err;
        }
    }, []);

    const getNewWordsForLearning = useCallback(async (limit: number = 10): Promise<FlashCardWord[]> => {
        try {
            // Ensure database is ready
            if (!databaseManager.isReady()) {
                await databaseManager.waitForReady();
            }

            const result = await flashCardService.getNewWordsForLearning(limit);
            return result;
        } catch (err) {
            console.error('Hook: Error getting new words for learning:', err);
            setError(err instanceof Error ? err.message : 'Failed to get new words for learning');
            throw err;
        }
    }, []);

    const getMixedWordsForPractice = useCallback(async (limit: number = 15): Promise<FlashCardWord[]> => {
        try {
            // Ensure database is ready
            if (!databaseManager.isReady()) {
                await databaseManager.waitForReady();
            }

            const result = await flashCardService.getMixedWordsForPractice(limit);
            return result;
        } catch (err) {
            console.error('Hook: Error getting mixed words for practice:', err);
            setError(err instanceof Error ? err.message : 'Failed to get mixed words for practice');
            throw err;
        }
    }, []);

    const updateLearningStats = useCallback(async (wordId: number, isCorrect: boolean) => {
        try {
            // Ensure database is ready
            if (!databaseManager.isReady()) {
                await databaseManager.waitForReady();
            }

            const result = await flashCardService.updateLearningStats(wordId, isCorrect);
            if (result) {
                // Refresh current words list if it exists
                if (words.length > 0) {
                    const updatedWords = await dbService.getAllWords();
                    setWords(updatedWords);
                }
            }
            return result;
        } catch (err) {
            console.error('Hook: Error updating learning stats:', err);
            setError(err instanceof Error ? err.message : 'Failed to update learning stats');
            throw err;
        }
    }, [words.length]);

    const getStudyStatistics = useCallback(async (): Promise<StudyStatistics> => {
        try {
            // Ensure database is ready
            if (!databaseManager.isReady()) {
                await databaseManager.waitForReady();
            }

            const result = await flashCardService.getStudyStatistics();
            return result;
        } catch (err) {
            console.error('Hook: Error getting study statistics:', err);
            setError(err instanceof Error ? err.message : 'Failed to get study statistics');
            throw err;
        }
    }, []);

    const getRecentWords = useCallback(async (limit: number = 5) => {
        try {
            // Ensure database is ready
            if (!databaseManager.isReady()) {
                await databaseManager.waitForReady();
            }

            const result = await flashCardService.getRecentWords(limit);
            return result;
        } catch (err) {
            console.error('Hook: Error getting recent words:', err);
            setError(err instanceof Error ? err.message : 'Failed to get recent words');
            throw err;
        }
    }, []);

    // Manual recovery function using the database manager
    const recoverDatabase = useCallback(async () => {
        try {
            console.log('Hook: Manual database recovery initiated');
            setIsLoading(true);
            setError(null);

            await databaseManager.forceReset();
            await databaseManager.initialize();

            console.log('Hook: Manual database recovery completed');
            return true;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Database recovery failed';
            setError(errorMessage);
            console.error('Database recovery error:', err);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Initialize database on mount - but only once globally
    useEffect(() => {
        let isMounted = true;

        const initDB = async () => {
            if (isMounted && !databaseManager.getState().isInitialized && !databaseManager.getState().isInitializing) {
                console.log('Hook: First mount - requesting database initialization');
                await initializeDatabase();
            }
        };

        initDB();

        return () => {
            isMounted = false;
        };
    }, []); // Only run once on mount

    return {
        // State
        isLoading,
        isDbReady,
        error,
        words,
        currentWord,

        // Actions
        searchWords,
        getAllWords,
        getWordDetail,
        updateMasteredStatus,
        getRandomWords,
        initializeDatabase,

        // FlashCard Actions
        getWordsForReview,
        getNewWordsForLearning,
        getMixedWordsForPractice,
        updateLearningStats,
        getStudyStatistics,
        getRecentWords,

        // Clear states
        clearError: () => setError(null),
        clearWords: () => setWords([]),
        clearCurrentWord: () => setCurrentWord(null),

        // Manual recovery
        recoverDatabase,
    };
}; 