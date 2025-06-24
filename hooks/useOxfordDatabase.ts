import { useState, useEffect, useCallback } from 'react';
import OxfordDatabaseService, { Word, WordDetail } from '../services/oxfordDatabase';
import FlashCardDatabaseService, { FlashCardWord, StudyStatistics } from '../services/flashCardDatabase';

export const useOxfordDatabase = () => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isDbReady, setIsDbReady] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [words, setWords] = useState<Word[]>([]);
    const [currentWord, setCurrentWord] = useState<WordDetail | null>(null);

    const dbService = OxfordDatabaseService.getInstance();
    const flashCardService = FlashCardDatabaseService.getInstance();

    const initializeDatabase = useCallback(async () => {
        try {
            console.log('Hook: Starting database initialization');
            setIsLoading(true);
            setError(null);
            await dbService.initDatabase();
            await flashCardService.initializeTables();
            setIsDbReady(true);
            console.log('Hook: Database initialization completed');
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Database initialization failed';
            setError(errorMessage);
            setIsDbReady(false);
            console.error('Database initialization error:', err);
        } finally {
            console.log('Hook: Database initialization finally block - setting isLoading to false');
            setIsLoading(false);
        }
    }, []);

    const searchWords = useCallback(async (query: string) => {
        try {
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
            console.log('Hook: Starting getAllWords, setting isLoading to true');
            setIsLoading(true);
            setError(null);

            console.log('Hook: Calling dbService.getAllWords()');
            const results = await dbService.getAllWords();
            console.log('Hook: Received results:', results.length, 'words');

            setWords(results);
            console.log('Hook: Updated words state, setting isLoading to false');
            return results;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to get words';
            setError(errorMessage);
            console.error('Get all words error:', err);
            return [];
        } finally {
            console.log('Hook: Finally block - setting isLoading to false');
            setIsLoading(false);
        }
    }, []);

    const getWordDetail = useCallback(async (wordId: number) => {
        try {
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
            const result = await flashCardService.getRecentWords(limit);
            return result;
        } catch (err) {
            console.error('Hook: Error getting recent words:', err);
            setError(err instanceof Error ? err.message : 'Failed to get recent words');
            throw err;
        }
    }, []);

    // Initialize database on mount
    useEffect(() => {
        let isMounted = true;

        const initDB = async () => {
            if (isMounted) {
                await initializeDatabase();
            }
        };

        initDB();

        return () => {
            isMounted = false;
        };
    }, []); // Remove initializeDatabase from dependencies to prevent re-initialization

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
    };
}; 