import * as SQLite from 'expo-sqlite';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

interface QueuedOperation {
    operation: () => Promise<any>;
    resolve: (value: any) => void;
    reject: (error: any) => void;
}

class DatabaseConnection {
    private static instance: DatabaseConnection;
    private dbConnection: SQLite.SQLiteDatabase | null = null;
    private dbName: string = 'oxford_words_v2.db';
    private isInitialized: boolean = false;
    private initializationPromise: Promise<void> | null = null;
    private operationQueue: QueuedOperation[] = [];
    private isProcessingQueue: boolean = false;
    private maxRetries: number = 3;
    private retryDelay: number = 100; // ms

    private constructor() { }

    public static getInstance(): DatabaseConnection {
        if (!DatabaseConnection.instance) {
            DatabaseConnection.instance = new DatabaseConnection();
        }
        return DatabaseConnection.instance;
    }

    /**
     * Get the database connection, creating it if necessary
     */
    async getConnection(): Promise<SQLite.SQLiteDatabase> {
        if (!this.isInitialized) {
            await this.initializeDatabase();
        }

        if (this.dbConnection) {
            return this.dbConnection;
        }

        throw new Error('DatabaseConnection: No database connection available after initialization');
    }

    /**
     * Execute a database operation with retry logic and queueing
     */
    async executeWithRetry<T>(operation: () => Promise<T>): Promise<T> {
        return new Promise((resolve, reject) => {
            this.operationQueue.push({
                operation,
                resolve,
                reject
            });

            if (!this.isProcessingQueue) {
                this.processQueue();
            }
        });
    }

    private async processQueue(): Promise<void> {
        if (this.isProcessingQueue || this.operationQueue.length === 0) {
            return;
        }

        this.isProcessingQueue = true;

        while (this.operationQueue.length > 0) {
            const queuedOp = this.operationQueue.shift();
            if (!queuedOp) continue;

            try {
                const result = await this.executeOperationWithRetry(queuedOp.operation);
                queuedOp.resolve(result);
            } catch (error) {
                queuedOp.reject(error);
            }
        }

        this.isProcessingQueue = false;
    }

    private async executeOperationWithRetry<T>(operation: () => Promise<T>): Promise<T> {
        let lastError: any;

        for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
            try {
                return await operation();
            } catch (error: any) {
                lastError = error;

                if (error.message?.includes('database is locked') && attempt < this.maxRetries) {
                    console.log(`DatabaseConnection: Retry attempt ${attempt}/${this.maxRetries} after database lock`);
                    await this.delay(this.retryDelay * attempt); // Exponential backoff
                    continue;
                }

                throw error;
            }
        }

        throw lastError;
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Initialize the database (copy from assets, create tables, etc.)
     */
    async initializeDatabase(): Promise<void> {
        if (this.isInitialized) {
            console.log('DatabaseConnection: Database already initialized');
            return;
        }

        if (this.initializationPromise) {
            console.log('DatabaseConnection: Database initialization in progress, waiting...');
            await this.initializationPromise;
            return;
        }

        this.initializationPromise = this.performInitialization();
        await this.initializationPromise;
    }

    private async performInitialization(): Promise<void> {
        try {
            console.log('DatabaseConnection: Starting database initialization...');

            // First, ensure database file exists
            await this.ensureDatabaseExists();

            // Create the connection once
            console.log('DatabaseConnection: Creating initial database connection...');
            this.dbConnection = await SQLite.openDatabaseAsync(this.dbName);

            // Enable WAL mode for better concurrency
            await this.dbConnection.execAsync('PRAGMA journal_mode = WAL;');
            await this.dbConnection.execAsync('PRAGMA synchronous = NORMAL;');
            await this.dbConnection.execAsync('PRAGMA cache_size = 10000;');
            await this.dbConnection.execAsync('PRAGMA temp_store = MEMORY;');

            console.log('DatabaseConnection: Database connection configured successfully');

            // Now ensure tables and columns exist
            await this.ensureMasteredColumn();
            await this.ensureLearningStatsTable();

            this.isInitialized = true;
            console.log('DatabaseConnection: Database initialized successfully');
        } catch (error) {
            console.error('DatabaseConnection: Database initialization failed:', error);
            this.isInitialized = false;
            this.dbConnection = null;
            throw error;
        } finally {
            this.initializationPromise = null;
        }
    }

    private async ensureDatabaseExists(): Promise<void> {
        if (Platform.OS === 'web') return;

        const dbPath = `${FileSystem.documentDirectory}SQLite/${this.dbName}`;

        try {
            // Check if database already exists in correct location
            const dbExists = await FileSystem.getInfoAsync(dbPath);
            if (dbExists.exists) {
                console.log('DatabaseConnection: Database already exists, skipping copy');
                return;
            }
        } catch (infoError) {
            console.log('DatabaseConnection: Could not check database info:', infoError);
        }

        console.log('DatabaseConnection: Copying database from assets...');
        await this.copyDatabaseFromAssets();
    }

    private async copyDatabaseFromAssets(): Promise<void> {
        try {
            const dbAsset = Asset.fromModule(require('../assets/database/oxford_words_v2.db'));
            await dbAsset.downloadAsync();

            if (!dbAsset.localUri) {
                throw new Error('Failed to download database asset');
            }

            const sqliteDir = `${FileSystem.documentDirectory}SQLite`;
            const dirInfo = await FileSystem.getInfoAsync(sqliteDir);
            if (!dirInfo.exists) {
                await FileSystem.makeDirectoryAsync(sqliteDir, { intermediates: true });
            }

            const dbPath = `${FileSystem.documentDirectory}SQLite/${this.dbName}`;
            await FileSystem.copyAsync({
                from: dbAsset.localUri,
                to: dbPath,
            });

            console.log('DatabaseConnection: Database copied successfully');
        } catch (error) {
            console.error('DatabaseConnection: Error copying database:', error);
            throw error;
        }
    }

    private async ensureMasteredColumn(): Promise<void> {
        try {
            await this.executeOperationWithRetry(async () => {
                // Don't create a new connection if one doesn't exist
                if (!this.dbConnection) {
                    throw new Error('Database connection not available during initialization');
                }

                // Check if mastered column exists
                const tableInfo = await this.dbConnection.getAllAsync('PRAGMA table_info(words)');
                const masteredColumn = tableInfo.find((col: any) => col.name === 'mastered');

                if (!masteredColumn) {
                    console.log('DatabaseConnection: Adding mastered column to words table...');
                    await this.dbConnection.runAsync('ALTER TABLE words ADD COLUMN mastered INTEGER NOT NULL DEFAULT 0');
                    console.log('DatabaseConnection: Mastered column added successfully');
                } else {
                    console.log('DatabaseConnection: Mastered column already exists');
                }
            });
        } catch (error) {
            console.error('DatabaseConnection: Error ensuring mastered column:', error);
        }
    }

    private async ensureLearningStatsTable(): Promise<void> {
        try {
            await this.executeOperationWithRetry(async () => {
                // Don't create a new connection if one doesn't exist
                if (!this.dbConnection) {
                    throw new Error('Database connection not available during initialization');
                }

                // Check if learning_stats table exists
                const tableExists = await this.dbConnection.getFirstAsync(
                    "SELECT name FROM sqlite_master WHERE type='table' AND name='learning_stats'"
                );

                if (!tableExists) {
                    console.log('DatabaseConnection: Creating learning_stats table...');
                    await this.dbConnection.runAsync(`
                        CREATE TABLE learning_stats (
                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                            word_id INTEGER NOT NULL,
                            memory_level INTEGER DEFAULT 0,
                            due_date TEXT,
                            created_at TEXT NOT NULL,
                            updated_at TEXT NOT NULL,
                            times_seen INTEGER DEFAULT 0,
                            times_correct INTEGER DEFAULT 0,
                            last_interval INTEGER DEFAULT 0,
                            FOREIGN KEY (word_id) REFERENCES words (id) ON DELETE CASCADE,
                            UNIQUE(word_id)
                        )
                    `);
                    console.log('DatabaseConnection: Learning stats table created successfully');
                } else {
                    console.log('DatabaseConnection: Learning stats table already exists');
                }
            });
        } catch (error) {
            console.error('DatabaseConnection: Error ensuring learning stats table:', error);
        }
    }

    /**
     * Close the database connection
     */
    async closeConnection(): Promise<void> {
        if (this.dbConnection) {
            try {
                await this.dbConnection.closeAsync();
                console.log('DatabaseConnection: Database connection closed');
            } catch (error) {
                console.error('DatabaseConnection: Error closing database:', error);
            } finally {
                this.dbConnection = null;
                this.isInitialized = false;
            }
        }
    }

    /**
     * Reset the connection (useful for testing or error recovery)
     */
    async resetConnection(): Promise<void> {
        await this.closeConnection();
        this.isInitialized = false;
        this.initializationPromise = null;
        await this.initializeDatabase();
    }

    /**
     * Check if the database is ready for operations
     */
    isReady(): boolean {
        return this.isInitialized && this.dbConnection !== null;
    }

    /**
     * Force reset the database connection state (useful for error recovery)
     */
    async forceReset(): Promise<void> {
        console.log('DatabaseConnection: Force resetting database state...');

        // Clear all queued operations
        this.operationQueue.forEach(op => {
            op.reject(new Error('Database reset - operation cancelled'));
        });
        this.operationQueue = [];
        this.isProcessingQueue = false;

        // Close existing connection
        if (this.dbConnection) {
            try {
                await this.dbConnection.closeAsync();
            } catch (error) {
                console.error('DatabaseConnection: Error during force close:', error);
            }
        }

        // Reset state
        this.dbConnection = null;
        this.isInitialized = false;
        this.initializationPromise = null;

        console.log('DatabaseConnection: Force reset completed');
    }

    /**
     * Get database connection status for debugging
     */
    getStatus(): { isInitialized: boolean; hasConnection: boolean; queueLength: number; isProcessing: boolean } {
        return {
            isInitialized: this.isInitialized,
            hasConnection: this.dbConnection !== null,
            queueLength: this.operationQueue.length,
            isProcessing: this.isProcessingQueue
        };
    }
}

export default DatabaseConnection; 