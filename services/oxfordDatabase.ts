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
    }

    async getAllWords(): Promise<Word[]> {
        const db = await this.dbConnection.getConnection();
        const result = await db.getAllAsync(`
            SELECT id, word, pos, phonetic, phonetic_text, 
                   phonetic_am, phonetic_am_text, mastered
            FROM words 
            ORDER BY word ASC
        `);

        console.log('Database: First 3 words from getAllWords:');
        result.slice(0, 3).forEach((row: any, index: number) => {
            console.log(`Word ${index + 1}: ${row.word}, mastered: ${row.mastered} (type: ${typeof row.mastered})`);
        });

        const words = result.map(this.mapRowToWord);
        console.log('Database: After mapping, first 3 words:');
        words.slice(0, 3).forEach((word, index) => {
            console.log(`Word ${index + 1}: ${word.word}, mastered: ${word.mastered} (type: ${typeof word.mastered})`);
        });

        return words;
    }

    async getWordDetail(wordId: number): Promise<WordDetail | null> {
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
            console.log(`Loading examples for sense ${sense.id}...`);
            const examples = await db.getAllAsync(`
                SELECT id, x as example, sense_id 
                FROM examples 
                WHERE sense_id = ?
                ORDER BY example_order
            `, [sense.id]);

            console.log(`Found ${examples.length} examples for sense ${sense.id}`);
            if (examples.length > 0) {
                console.log('First example:', examples[0]);
            }

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
    }

    async updateWordMasteredStatus(wordId: number, isMastered: boolean): Promise<boolean> {
        console.log('Database: Updating word', wordId, 'mastered status to', isMastered);

        const db = await this.dbConnection.getConnection();

        try {
            const result = await db.runAsync(
                'UPDATE words SET mastered = ? WHERE id = ?',
                [isMastered ? 1 : 0, wordId]
            );

            console.log('Database: Update result - changes:', result.changes, 'lastInsertRowId:', result.lastInsertRowId);

            if (result.changes > 0) {
                console.log('Database: Successfully updated mastered status for word', wordId);
                return true;
            } else {
                console.log('Database: No rows were updated for word', wordId);
                return false;
            }
        } catch (error) {
            console.error('Database: Error updating mastered status:', error);
            throw error;
        }
    }

    async getRandomWords(count: number = 10): Promise<Word[]> {
        const db = await this.dbConnection.getConnection();

        const result = await db.getAllAsync(`
            SELECT id, word, pos, phonetic, phonetic_text, 
                   phonetic_am, phonetic_am_text, mastered
            FROM words 
            ORDER BY RANDOM() 
            LIMIT ?
        `, [count]);

        return result.map(this.mapRowToWord);
    }

    async getWordsMasteredStatus(wordIds: number[]): Promise<{ [key: number]: boolean }> {
        if (wordIds.length === 0) return {};

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