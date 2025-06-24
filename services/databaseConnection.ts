import * as SQLite from 'expo-sqlite';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

class DatabaseConnection {
    private static instance: DatabaseConnection;
    private dbConnection: SQLite.SQLiteDatabase | null = null;
    private dbName: string = 'oxford_words_v2.db';
    private isInitialized: boolean = false;
    private initializationPromise: Promise<void> | null = null;

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
            // Connection should already be established during initialization
            return this.dbConnection;
        }

        // This should not happen if initialization was successful
        throw new Error('DatabaseConnection: No database connection available after initialization');
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
            console.log('DatabaseConnection: Initial connection created successfully');

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
            // Use the same connection instead of opening a new one
            if (!this.dbConnection) {
                this.dbConnection = await SQLite.openDatabaseAsync(this.dbName);
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
        } catch (error) {
            console.error('DatabaseConnection: Error ensuring mastered column:', error);
            // Don't throw error here as the database might still work
        }
    }

    private async ensureLearningStatsTable(): Promise<void> {
        try {
            // Use the same connection instead of opening a new one
            if (!this.dbConnection) {
                this.dbConnection = await SQLite.openDatabaseAsync(this.dbName);
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
        } catch (error) {
            console.error('DatabaseConnection: Error ensuring learning stats table:', error);
            // Don't throw error here as the database might still work
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
                console.error('DatabaseConnection: Error closing database connection:', error);
            } finally {
                this.dbConnection = null;
                this.isInitialized = false;
            }
        }
    }

    /**
     * Check if database is ready
     */
    isReady(): boolean {
        return this.isInitialized && this.dbConnection !== null;
    }
}

export default DatabaseConnection; 