import DatabaseConnection from './databaseConnection';

// Database types
export interface Word {
    id: number;
    word: string;
    pos: string;
    phonetic: string;
    phonetic_text: string;
    phonetic_am: string;
    phonetic_am_text: string;
    mastered: boolean;
}

export interface Sense {
    id: number;
    definition: string;
    word_id: number;
    examples: Example[];
}

export interface Example {
    id: number;
    example: string;
    sense_id: number;
}

export interface WordDetail extends Word {
    senses: Sense[];
}

// Add new interface for flashcard learning


class OxfordDatabaseService {
    private static instance: OxfordDatabaseService;
    private dbConnection: DatabaseConnection;

    constructor() {
        this.dbConnection = DatabaseConnection.getInstance();
    }

    public static getInstance(): OxfordDatabaseService {
        if (!OxfordDatabaseService.instance) {
            OxfordDatabaseService.instance = new OxfordDatabaseService();
        }
        return OxfordDatabaseService.instance;
    }

    async searchWords(query: string): Promise<Word[]> {
        return this.dbConnection.executeWithRetry(async () => {
            const db = await this.dbConnection.getConnection();
            const result = await db.getAllAsync(`
                SELECT id, word, pos, phonetic, phonetic_text, 
                       phonetic_am, phonetic_am_text, mastered
                FROM words 
                WHERE word LIKE ? 
                ORDER BY word ASC 
                LIMIT 50
            `, [`%${query}%`]);

            return result.map(this.mapRowToWord);
        });
    }

    async getAllWords(): Promise<Word[]> {
        return this.dbConnection.executeWithRetry(async () => {
            const db = await this.dbConnection.getConnection();
            const result = await db.getAllAsync(`
                SELECT id, word, pos, phonetic, phonetic_text, 
                       phonetic_am, phonetic_am_text, mastered
                FROM words 
                ORDER BY word ASC
            `);

            return result.map(this.mapRowToWord);
        });
    }

    async getWordDetail(wordId: number): Promise<WordDetail | null> {
        return this.dbConnection.executeWithRetry(async () => {
            const db = await this.dbConnection.getConnection();

            const wordResult = await db.getFirstAsync(`
                SELECT id, word, pos, phonetic, phonetic_text, 
                       phonetic_am, phonetic_am_text, mastered
                FROM words 
                WHERE id = ?
            `, [wordId]);

            if (!wordResult) {
                return null;
            }

            const sensesResult = await db.getAllAsync(`
                SELECT id, definition, word_id 
                FROM senses 
                WHERE word_id = ?
                ORDER BY sense_order
            `, [wordId]);

            const senses: Sense[] = [];
            for (const sense of sensesResult as any[]) {
                const examples = await db.getAllAsync(`
                    SELECT id, x as example, sense_id 
                    FROM examples 
                    WHERE sense_id = ?
                    ORDER BY example_order
                `, [sense.id]);

                senses.push({
                    id: sense.id,
                    definition: sense.definition,
                    word_id: sense.word_id,
                    examples: examples.map((ex: any) => ({
                        id: ex.id,
                        example: ex.example,
                        sense_id: ex.sense_id,
                    })),
                });
            }

            return {
                ...this.mapRowToWord(wordResult),
                senses,
            };
        });
    }

    async updateWordMasteredStatus(wordId: number, isMastered: boolean): Promise<boolean> {
        return this.dbConnection.executeWithRetry(async () => {
            const db = await this.dbConnection.getConnection();

            try {
                const result = await db.runAsync(
                    'UPDATE words SET mastered = ? WHERE id = ?',
                    [isMastered ? 1 : 0, wordId]
                );

                return result.changes > 0;
            } catch (error) {
                console.error('Error updating mastered status:', error);
                throw error;
            }
        });
    }

    async getRandomWords(count: number = 10): Promise<Word[]> {
        return this.dbConnection.executeWithRetry(async () => {
            const db = await this.dbConnection.getConnection();

            const result = await db.getAllAsync(`
                SELECT id, word, pos, phonetic, phonetic_text, 
                       phonetic_am, phonetic_am_text, mastered
                FROM words 
                ORDER BY RANDOM() 
                LIMIT ?
            `, [count]);

            return result.map(this.mapRowToWord);
        });
    }

    async getWordsMasteredStatus(wordIds: number[]): Promise<{ [key: number]: boolean }> {
        if (wordIds.length === 0) return {};

        return this.dbConnection.executeWithRetry(async () => {
            const db = await this.dbConnection.getConnection();

            const placeholders = wordIds.map(() => '?').join(',');
            const result = await db.getAllAsync(
                `SELECT id, mastered FROM words WHERE id IN (${placeholders})`,
                wordIds
            );

            const masteredStatus: { [key: number]: boolean } = {};
            result.forEach((row: any) => {
                masteredStatus[row.id] = !!row.mastered;
            });

            return masteredStatus;
        });
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

    // Simple initialization method that delegates to the singleton
    async initDatabase(): Promise<void> {
        await this.dbConnection.initializeDatabase();
    }

    // Check if database is ready
    isDbReady(): boolean {
        return this.dbConnection.isReady();
    }
}

export default OxfordDatabaseService; 