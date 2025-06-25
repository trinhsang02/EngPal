import DatabaseConnection from './databaseConnection';
import OxfordDatabaseService from './oxfordDatabase';
import FlashCardDatabaseService from './flashCardDatabase';

interface DatabaseState {
    isInitializing: boolean;
    isInitialized: boolean;
    initializationPromise: Promise<void> | null;
    error: string | null;
    retryCount: number;
}

class DatabaseManager {
    private static instance: DatabaseManager;
    private state: DatabaseState = {
        isInitializing: false,
        isInitialized: false,
        initializationPromise: null,
        error: null,
        retryCount: 0
    };

    private dbConnection: DatabaseConnection;
    private oxfordService: OxfordDatabaseService;
    private flashCardService: FlashCardDatabaseService;
    private listeners: ((state: DatabaseState) => void)[] = [];

    private constructor() {
        this.dbConnection = DatabaseConnection.getInstance();
        this.oxfordService = OxfordDatabaseService.getInstance();
        this.flashCardService = FlashCardDatabaseService.getInstance();
    }

    public static getInstance(): DatabaseManager {
        if (!DatabaseManager.instance) {
            DatabaseManager.instance = new DatabaseManager();
        }
        return DatabaseManager.instance;
    }

    /**
     * Subscribe to database state changes
     */
    subscribe(listener: (state: DatabaseState) => void): () => void {
        this.listeners.push(listener);
        // Immediately call with current state
        listener({ ...this.state });

        // Return unsubscribe function
        return () => {
            const index = this.listeners.indexOf(listener);
            if (index > -1) {
                this.listeners.splice(index, 1);
            }
        };
    }

    /**
     * Notify all listeners of state changes
     */
    private notifyListeners(): void {
        this.listeners.forEach(listener => {
            try {
                listener({ ...this.state });
            } catch (error) {
                console.error('DatabaseManager: Error in listener:', error);
            }
        });
    }

    /**
     * Update state and notify listeners
     */
    private updateState(updates: Partial<DatabaseState>): void {
        this.state = { ...this.state, ...updates };
        this.notifyListeners();
    }

    /**
     * Initialize database - prevents concurrent initialization
     */
    async initialize(): Promise<void> {
        console.log('DatabaseManager: Initialize called');

        // If already initialized, return immediately
        if (this.state.isInitialized && this.dbConnection.isReady()) {
            console.log('DatabaseManager: Already initialized');
            return;
        }

        // If currently initializing, wait for that process to complete
        if (this.state.isInitializing && this.state.initializationPromise) {
            console.log('DatabaseManager: Initialization in progress, waiting...');
            await this.state.initializationPromise;
            return;
        }

        // Start new initialization
        console.log('DatabaseManager: Starting new initialization');
        this.updateState({
            isInitializing: true,
            error: null
        });

        const initPromise = this.performInitialization();
        this.updateState({ initializationPromise: initPromise });

        try {
            await initPromise;
        } finally {
            this.updateState({
                isInitializing: false,
                initializationPromise: null
            });
        }
    }

    /**
     * Perform the actual initialization
     */
    private async performInitialization(): Promise<void> {
        const maxRetries = 3;
        let lastError: any;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                console.log(`DatabaseManager: Initialization attempt ${attempt}/${maxRetries}`);

                // Step 1: Initialize database connection
                await this.dbConnection.initializeDatabase();
                console.log('DatabaseManager: Database connection initialized');

                // Step 2: Initialize flash card tables
                await this.flashCardService.initializeTables();
                console.log('DatabaseManager: FlashCard tables initialized');

                // Step 3: Test basic operations
                await this.testBasicOperations();
                console.log('DatabaseManager: Basic operations test passed');

                // Success!
                this.updateState({
                    isInitialized: true,
                    error: null,
                    retryCount: attempt - 1
                });

                console.log('DatabaseManager: Initialization completed successfully');
                return;

            } catch (error: any) {
                lastError = error;
                console.error(`DatabaseManager: Initialization attempt ${attempt} failed:`, error);

                // Try to recover from database lock errors
                if (error.message?.includes('database is locked') && attempt < maxRetries) {
                    console.log('DatabaseManager: Attempting database recovery...');
                    try {
                        await this.dbConnection.forceReset();
                        console.log('DatabaseManager: Database reset completed');
                        // Wait a bit before retrying
                        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
                    } catch (resetError) {
                        console.error('DatabaseManager: Reset failed:', resetError);
                    }
                } else if (attempt >= maxRetries) {
                    break;
                }
            }
        }

        // All attempts failed
        const errorMessage = lastError?.message || 'Database initialization failed after all attempts';
        this.updateState({
            isInitialized: false,
            error: errorMessage,
            retryCount: maxRetries
        });

        throw new Error(errorMessage);
    }

    /**
     * Test basic database operations
     */
    private async testBasicOperations(): Promise<void> {
        try {
            const db = await this.dbConnection.getConnection();
            await db.getFirstAsync('SELECT COUNT(*) as count FROM words LIMIT 1');
        } catch (error) {
            throw new Error(`Basic operations test failed: ${error}`);
        }
    }

    /**
     * Force reset the entire database system
     */
    async forceReset(): Promise<void> {
        console.log('DatabaseManager: Force reset initiated');

        this.updateState({
            isInitializing: false,
            isInitialized: false,
            initializationPromise: null,
            error: null,
            retryCount: 0
        });

        try {
            await this.dbConnection.forceReset();
            console.log('DatabaseManager: Force reset completed');
        } catch (error) {
            console.error('DatabaseManager: Force reset failed:', error);
            throw error;
        }
    }

    /**
     * Get current state
     */
    getState(): DatabaseState {
        return { ...this.state };
    }

    /**
     * Check if database is ready for operations
     */
    isReady(): boolean {
        return this.state.isInitialized && this.dbConnection.isReady();
    }

    /**
     * Wait for database to be ready
     */
    async waitForReady(timeout: number = 30000): Promise<boolean> {
        const startTime = Date.now();

        while (!this.isReady() && (Date.now() - startTime) < timeout) {
            if (!this.state.isInitializing && !this.state.isInitialized) {
                // Not initializing and not initialized - start initialization
                await this.initialize();
            } else if (this.state.isInitializing) {
                // Wait for initialization to complete
                await new Promise(resolve => setTimeout(resolve, 100));
            } else {
                break;
            }
        }

        return this.isReady();
    }
}

// Export singleton instance
export const databaseManager = DatabaseManager.getInstance();
export default DatabaseManager; 