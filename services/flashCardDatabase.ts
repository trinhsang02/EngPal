import DatabaseConnection from './databaseConnection';
import { Word, Sense, Example } from './oxfordDatabase';

export interface WordLearningStats {
    id: number;
    word_id: number;
    memory_level: number; // 0-6 levels
    due_date: string;
    created_at: string;
    updated_at: string;
    times_seen: number;
    times_correct: number;
    last_interval: number; // days
}

export interface FlashCardWord extends Word {
    learning_stats?: WordLearningStats;
    senses?: Sense[];
}

export interface StudyStatistics {
    learnedToday: number;
    wordsToReview: number;
    memoryLevels: Array<{ level: number; count: number; label: string }>;
    totalWords: number;
    masteredWords: number;
}

export interface SessionStats {
    totalWords: number;
    correctAnswers: number;
    wrongAnswers: number;
    accuracy: number;
    sessionType: 'review' | 'new' | 'mixed';
}

// Database operation wrapper to handle locking
class DatabaseOperationQueue {
    private static instance: DatabaseOperationQueue;
    private operationQueue: Array<{
        operation: () => Promise<any>;
        resolve: (value: any) => void;
        reject: (error: any) => void;
    }> = [];
    private isProcessing = false;

    public static getInstance(): DatabaseOperationQueue {
        if (!DatabaseOperationQueue.instance) {
            DatabaseOperationQueue.instance = new DatabaseOperationQueue();
        }
        return DatabaseOperationQueue.instance;
    }

    async execute<T>(operation: () => Promise<T>): Promise<T> {
        return new Promise((resolve, reject) => {
            this.operationQueue.push({ operation, resolve, reject });
            this.processQueue();
        });
    }

    private async processQueue(): Promise<void> {
        if (this.isProcessing || this.operationQueue.length === 0) {
            return;
        }

        this.isProcessing = true;

        while (this.operationQueue.length > 0) {
            const { operation, resolve, reject } = this.operationQueue.shift()!;

            try {
                const result = await this.executeWithRetry(operation);
                resolve(result);
            } catch (error) {
                reject(error);
            }

            // Small delay between operations to prevent rapid database access
            await new Promise(resolve => setTimeout(resolve, 50));
        }

        this.isProcessing = false;
    }

    private async executeWithRetry<T>(operation: () => Promise<T>, maxRetries = 3): Promise<T> {
        let lastError: any;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return await operation();
            } catch (error: any) {
                lastError = error;

                if (error.message?.includes('database is locked') && attempt < maxRetries) {
                    await new Promise(resolve => setTimeout(resolve, 100 * attempt)); // Exponential backoff
                    continue;
                }

                throw error;
            }
        }

        throw lastError;
    }
}

class FlashCardDatabaseService {
    private static instance: FlashCardDatabaseService;
    private dbConnection: DatabaseConnection;
    private dbQueue: DatabaseOperationQueue;

    constructor() {
        this.dbConnection = DatabaseConnection.getInstance();
        this.dbQueue = DatabaseOperationQueue.getInstance();
    }

    public static getInstance(): FlashCardDatabaseService {
        if (!FlashCardDatabaseService.instance) {
            FlashCardDatabaseService.instance = new FlashCardDatabaseService();
        }
        return FlashCardDatabaseService.instance;
    }

    /**
     * Initialize database tables
     */
    async initializeTables(): Promise<void> {
        await this.dbConnection.initializeDatabase();
    }

    /**
     * Get words that are due for review
     */
    async getWordsForReview(limit: number = 20): Promise<FlashCardWord[]> {
        return this.dbQueue.execute(async () => {
            const db = await this.dbConnection.getConnection();
            const today = new Date().toISOString().split('T')[0];

            const result = await db.getAllAsync(`
                SELECT w.*, ls.id as learning_id, ls.memory_level, ls.due_date, 
                       ls.times_seen, ls.times_correct, ls.last_interval
                FROM words w
                JOIN learning_stats ls ON w.id = ls.word_id
                WHERE ls.due_date <= ? 
                    AND (w.mastered = 0 OR w.mastered IS NULL)
                    AND ls.times_seen > 0
                ORDER BY ls.due_date ASC, ls.memory_level ASC
                LIMIT ?
            `, [today, limit]);

            return this.enrichWordsWithSenses(result);
        });
    }

    /**
     * Get new words for learning (not yet studied)
     */
    async getNewWordsForLearning(limit: number = 10): Promise<FlashCardWord[]> {
        return this.dbQueue.execute(async () => {
            const db = await this.dbConnection.getConnection();

            const result = await db.getAllAsync(`
                SELECT w.* FROM words w
                LEFT JOIN learning_stats ls ON w.id = ls.word_id
                WHERE ls.word_id IS NULL 
                    AND (w.mastered = 0 OR w.mastered IS NULL)
                ORDER BY RANDOM()
                LIMIT ?
            `, [limit]);

            return this.enrichWordsWithSenses(result);
        });
    }

    /**
     * Get mixed words for practice (combination of new and review)
     */
    async getMixedWordsForPractice(limit: number = 15): Promise<FlashCardWord[]> {
        return this.dbQueue.execute(async () => {
            const db = await this.dbConnection.getConnection();
            const today = new Date().toISOString().split('T')[0];

            const reviewLimit = Math.floor(limit * 0.7); // 70% review words
            const newLimit = limit - reviewLimit; // 30% new words

            // Optimized query using CTE for better performance
            const result = await db.getAllAsync(`
                WITH review_words AS (
                    SELECT w.id, w.word, w.pos, w.phonetic, w.phonetic_text, 
                           w.phonetic_am, w.phonetic_am_text, w.mastered,
                           ls.id as learning_id, ls.memory_level, ls.due_date, 
                           ls.times_seen, ls.times_correct, ls.last_interval,
                           'review' as word_type
                    FROM words w
                    JOIN learning_stats ls ON w.id = ls.word_id
                    WHERE ls.due_date <= ? 
                        AND (w.mastered = 0 OR w.mastered IS NULL)
                        AND ls.times_seen > 0
                    ORDER BY RANDOM()
                    LIMIT ?
                ),
                new_words AS (
                    SELECT w.id, w.word, w.pos, w.phonetic, w.phonetic_text, 
                           w.phonetic_am, w.phonetic_am_text, w.mastered,
                           NULL as learning_id, 0 as memory_level, NULL as due_date,
                           0 as times_seen, 0 as times_correct, 0 as last_interval,
                           'new' as word_type
                    FROM words w
                    LEFT JOIN learning_stats ls ON w.id = ls.word_id
                    WHERE ls.word_id IS NULL 
                        AND (w.mastered = 0 OR w.mastered IS NULL)
                    ORDER BY RANDOM()
                    LIMIT ?
                ),
                combined_words AS (
                    SELECT * FROM review_words
                    UNION ALL
                    SELECT * FROM new_words
                )
                SELECT * FROM combined_words
                ORDER BY word_type, RANDOM()
            `, [today, reviewLimit, newLimit]);

            // Process results in a single pass
            return this.enrichWordsWithSenses(result);
        });
    }

    /**
     * Update learning statistics for a word with transaction support and retry logic
     */
    async updateLearningStats(wordId: number, isCorrect: boolean): Promise<boolean> {
        return this.dbQueue.execute(async () => {
            const db = await this.dbConnection.getConnection();

            // Use a transaction to ensure atomicity and prevent locking
            await db.withTransactionAsync(async () => {
                // Get current stats
                const currentStats = await db.getFirstAsync(`
                    SELECT * FROM learning_stats WHERE word_id = ?
                `, [wordId]) as WordLearningStats | null;

                const now = new Date().toISOString();

                if (!currentStats) {
                    // First time learning this word
                    const memoryLevel = isCorrect ? 1 : 0;
                    const nextInterval = isCorrect ? 1 : 0; // Show again today if wrong, tomorrow if correct
                    const dueDate = new Date(Date.now() + nextInterval * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

                    await db.runAsync(`
                        INSERT INTO learning_stats (
                            word_id, memory_level, due_date, created_at, updated_at,
                            times_seen, times_correct, last_interval
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    `, [wordId, memoryLevel, dueDate, now, now, 1, isCorrect ? 1 : 0, nextInterval]);
                } else {
                    // Update existing stats
                    let newMemoryLevel = currentStats.memory_level;
                    let nextInterval = currentStats.last_interval;

                    if (isCorrect) {
                        // Correct answer - increase memory level and interval
                        newMemoryLevel = Math.min(6, currentStats.memory_level + 1);
                        nextInterval = this.calculateNextInterval(newMemoryLevel);
                    } else {
                        // Wrong answer - reset to level 0
                        newMemoryLevel = 0;
                        nextInterval = 0;
                    }

                    const dueDate = new Date(Date.now() + nextInterval * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

                    await db.runAsync(`
                        UPDATE learning_stats 
                        SET memory_level = ?, due_date = ?, updated_at = ?,
                            times_seen = times_seen + 1, 
                            times_correct = times_correct + ?,
                            last_interval = ?
                        WHERE word_id = ?
                    `, [newMemoryLevel, dueDate, now, isCorrect ? 1 : 0, nextInterval, wordId]);

                    // Tự động set mastered nếu memory_level đạt 6
                    if (newMemoryLevel === 6) {
                        await db.runAsync(`
                            UPDATE words SET mastered = 1 WHERE id = ?
                        `, [wordId]);
                    }
                }
            });

            return true;
        }).catch(error => {
            console.error('Error updating learning stats:', error);
            return false;
        });
    }

    /**
     * Get comprehensive study statistics
     */
    async getStudyStatistics(): Promise<StudyStatistics> {
        return this.dbQueue.execute(async () => {
            const today = new Date().toISOString().split('T')[0];
            const db = await this.dbConnection.getConnection();

            // Words learned today (first time seen or reviewed)
            const learnedTodayResult = await db.getFirstAsync(`
                SELECT COUNT(*) as count FROM learning_stats 
                WHERE DATE(created_at) = ?
            `, [today]) as { count: number };

            // Words due for review (only words that have been studied before)
            const reviewResult = await db.getFirstAsync(`
                SELECT COUNT(*) as count FROM learning_stats ls
                JOIN words w ON ls.word_id = w.id
                WHERE ls.due_date <= ? 
                    AND (w.mastered = 0 OR w.mastered IS NULL)
                    AND ls.times_seen > 0
            `, [today]) as { count: number };

            // Memory level distribution
            const memoryLevelsResult = await db.getAllAsync(`
                SELECT 
                    COALESCE(ls.memory_level, 0) as level,
                    COUNT(*) as count
                FROM words w
                LEFT JOIN learning_stats ls ON w.id = ls.word_id
                WHERE (w.mastered = 0 OR w.mastered IS NULL)
                GROUP BY COALESCE(ls.memory_level, 0)
                ORDER BY level
            `) as Array<{ level: number; count: number }>;

            // Total and mastered words
            const totalResult = await db.getFirstAsync(`
                SELECT COUNT(*) as count FROM words
            `) as { count: number };

            const masteredResult = await db.getFirstAsync(`
                SELECT COUNT(*) as count FROM words WHERE mastered = 1
            `) as { count: number };

            // Format memory levels with labels
            const memoryLevels = Array.from({ length: 7 }, (_, i) => {
                const found = memoryLevelsResult.find(m => m.level === i);
                const labels = ['New', '1', '2', '3', '4', '5', 'Mastered'];
                return {
                    level: i,
                    count: found?.count || 0,
                    label: labels[i]
                };
            });

            return {
                learnedToday: learnedTodayResult.count,
                wordsToReview: reviewResult.count,
                memoryLevels,
                totalWords: totalResult.count,
                masteredWords: masteredResult.count
            };
        });
    }

    /**
     * Get recently studied words
     */
    async getRecentWords(limit: number = 5): Promise<Word[]> {
        const db = await this.dbConnection.getConnection();

        const result = await db.getAllAsync(`
            SELECT w.* FROM words w
            JOIN learning_stats ls ON w.id = ls.word_id
            ORDER BY ls.updated_at DESC
            LIMIT ?
        `, [limit]);

        return result.map(this.mapRowToWord);
    }

    /**
     * Get learning progress for a specific word
     */
    async getWordLearningStats(wordId: number): Promise<WordLearningStats | null> {
        const db = await this.dbConnection.getConnection();

        const result = await db.getFirstAsync(`
            SELECT * FROM learning_stats WHERE word_id = ?
        `, [wordId]) as WordLearningStats | null;

        return result;
    }

    /**
     * Reset learning progress for a word (useful for re-learning)
     */
    async resetWordProgress(wordId: number): Promise<boolean> {
        const db = await this.dbConnection.getConnection();

        try {
            await db.runAsync(`
                DELETE FROM learning_stats WHERE word_id = ?
            `, [wordId]);

            return true;
        } catch (error) {
            console.error('Error resetting word progress:', error);
            return false;
        }
    }

    /**
     * Get session statistics for analytics
     */
    async getSessionStats(sessionType: 'review' | 'new' | 'mixed', startTime: Date): Promise<SessionStats> {
        const db = await this.dbConnection.getConnection();
        const startTimeStr = startTime.toISOString();

        const result = await db.getFirstAsync(`
            SELECT 
                COUNT(*) as total_words,
                SUM(CASE WHEN times_correct > 0 THEN 1 ELSE 0 END) as correct_answers,
                COUNT(*) - SUM(CASE WHEN times_correct > 0 THEN 1 ELSE 0 END) as wrong_answers
            FROM learning_stats 
            WHERE updated_at >= ?
        `, [startTimeStr]) as any;

        const totalWords = result.total_words || 0;
        const correctAnswers = result.correct_answers || 0;
        const wrongAnswers = result.wrong_answers || 0;
        const accuracy = totalWords > 0 ? (correctAnswers / totalWords) * 100 : 0;

        return {
            totalWords,
            correctAnswers,
            wrongAnswers,
            accuracy,
            sessionType
        };
    }

    /**
     * Private helper methods
     */
    private async enrichWordsWithSenses(wordRows: any[]): Promise<FlashCardWord[]> {
        const db = await this.dbConnection.getConnection();
        const wordsWithSenses: FlashCardWord[] = [];

        for (const wordRow of wordRows) {
            const senses = await db.getAllAsync(`
                SELECT id, definition, word_id 
                FROM senses 
                WHERE word_id = ?
                ORDER BY sense_order
                LIMIT 1
            `, [wordRow.id]);

            // Get examples for the first sense
            let sensesWithExamples: Sense[] = [];
            if (senses.length > 0) {
                const senseRow = senses[0] as any;
                const examples = await db.getAllAsync(`
                    SELECT id, x as example, sense_id 
                    FROM examples 
                    WHERE sense_id = ?
                    ORDER BY example_order
                    LIMIT 1
                `, [senseRow.id]);

                sensesWithExamples = [{
                    id: senseRow.id,
                    definition: senseRow.definition,
                    word_id: senseRow.word_id,
                    examples: examples as Example[]
                }];
            }

            wordsWithSenses.push({
                ...this.mapRowToWord(wordRow),
                senses: sensesWithExamples,
                learning_stats: wordRow.learning_id ? {
                    id: wordRow.learning_id,
                    word_id: wordRow.id,
                    memory_level: wordRow.memory_level,
                    due_date: wordRow.due_date,
                    created_at: '',
                    updated_at: '',
                    times_seen: wordRow.times_seen,
                    times_correct: wordRow.times_correct,
                    last_interval: wordRow.last_interval
                } : undefined
            });
        }

        return wordsWithSenses;
    }

    private calculateNextInterval(memoryLevel: number): number {
        // Spaced repetition intervals (in days)
        const intervals = [0, 1, 3, 7, 14, 30, 90]; // Level 0-6
        return intervals[Math.min(memoryLevel, intervals.length - 1)];
    }

    private mapRowToWord(row: any): Word {
        return {
            id: row.id,
            word: row.word,
            pos: row.pos,
            phonetic: row.phonetic,
            phonetic_text: row.phonetic_text,
            phonetic_am: row.phonetic_am,
            phonetic_am_text: row.phonetic_am_text,
            mastered: !!row.mastered,
        };
    }
}

export default FlashCardDatabaseService; 