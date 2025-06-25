import DatabaseConnection from '../services/databaseConnection';
import OxfordDatabaseService from '../services/oxfordDatabase';
import FlashCardDatabaseService from '../services/flashCardDatabase';

export class DatabaseDebugger {
    private dbConnection: DatabaseConnection;
    private oxfordService: OxfordDatabaseService;
    private flashCardService: FlashCardDatabaseService;

    constructor() {
        this.dbConnection = DatabaseConnection.getInstance();
        this.oxfordService = OxfordDatabaseService.getInstance();
        this.flashCardService = FlashCardDatabaseService.getInstance();
    }

    /**
     * Get current database status
     */
    getStatus() {
        const status = this.dbConnection.getStatus();
        console.log('=== Database Status ===');
        console.log('Initialized:', status.isInitialized);
        console.log('Has Connection:', status.hasConnection);
        console.log('Queue Length:', status.queueLength);
        console.log('Is Processing:', status.isProcessing);
        console.log('Ready:', this.dbConnection.isReady());
        return status;
    }

    /**
     * Force reset the database and reinitialize
     */
    async forceReset() {
        console.log('=== Force Resetting Database ===');
        try {
            await this.dbConnection.forceReset();
            console.log('Force reset completed');

            console.log('Reinitializing database...');
            await this.dbConnection.initializeDatabase();
            console.log('Database reinitialized successfully');

            return true;
        } catch (error) {
            console.error('Force reset failed:', error);
            return false;
        }
    }

    /**
     * Test basic database operations
     */
    async testOperations() {
        console.log('=== Testing Database Operations ===');

        try {
            // Test 1: Check if database is ready
            console.log('Test 1: Database ready check');
            const isReady = this.dbConnection.isReady();
            console.log('Database ready:', isReady);

            if (!isReady) {
                console.log('Database not ready, attempting initialization...');
                await this.dbConnection.initializeDatabase();
            }

            // Test 2: Simple query
            console.log('Test 2: Simple word count query');
            const db = await this.dbConnection.getConnection();
            const countResult = await db.getFirstAsync('SELECT COUNT(*) as count FROM words');
            console.log('Word count:', countResult);

            // Test 3: Search functionality
            console.log('Test 3: Search functionality');
            const searchResults = await this.oxfordService.searchWords('hello');
            console.log('Search results for "hello":', searchResults.length, 'words');

            // Test 4: Random words
            console.log('Test 4: Random words');
            const randomWords = await this.oxfordService.getRandomWords(3);
            console.log('Random words:', randomWords.map(w => w.word));

            console.log('All tests passed!');
            return true;

        } catch (error) {
            console.error('Database test failed:', error);
            return false;
        }
    }

    /**
     * Run a complete database health check
     */
    async healthCheck() {
        console.log('=== Database Health Check ===');

        let issues = [];
        let score = 0;

        // Check 1: Status
        const status = this.getStatus();
        if (status.isInitialized && status.hasConnection) {
            score += 25;
            console.log('✓ Database connection is healthy');
        } else {
            issues.push('Database connection not healthy');
            console.log('✗ Database connection issues detected');
        }

        // Check 2: Queue health
        if (status.queueLength < 10) {
            score += 25;
            console.log('✓ Operation queue is healthy');
        } else {
            issues.push('Operation queue is backed up');
            console.log('✗ Operation queue has too many pending operations');
        }

        // Check 3: Basic operations
        try {
            const testPassed = await this.testOperations();
            if (testPassed) {
                score += 50;
                console.log('✓ Basic operations working');
            } else {
                issues.push('Basic operations failing');
                console.log('✗ Basic operations failing');
            }
        } catch (error) {
            issues.push('Basic operations error: ' + (error as Error).message);
            console.log('✗ Basic operations error:', (error as Error)  .message);
        }

        console.log(`\n=== Health Check Result ===`);
        console.log(`Score: ${score}/100`);
        if (issues.length > 0) {
            console.log('Issues found:');
            issues.forEach((issue, index) => {
                console.log(`${index + 1}. ${issue}`);
            });
        }

        if (score < 50) {
            console.log('\nRecommendation: Run forceReset() to fix database issues');
        }

        return { score, issues };
    }
}

// Export a singleton instance
export const databaseDebugger = new DatabaseDebugger();

// Helper functions for easy access
export const debugDatabase = () => databaseDebugger.getStatus();
export const resetDatabase = () => databaseDebugger.forceReset();
export const testDatabase = () => databaseDebugger.testOperations();
export const checkDatabaseHealth = () => databaseDebugger.healthCheck();

export default DatabaseDebugger; 