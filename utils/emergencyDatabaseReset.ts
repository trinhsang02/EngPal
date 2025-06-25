import { databaseManager } from '../services/databaseManager';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

/**
 * Emergency database reset utility
 * Use this when the database is completely stuck
 */
export class EmergencyDatabaseReset {
    /**
     * Nuclear option: Delete the database file and force full reset
     */
    static async nukeDatabase(): Promise<boolean> {
        try {
            console.log('🚨 EMERGENCY: Starting nuclear database reset...');

            // 1. Force reset the database manager
            await databaseManager.forceReset();
            console.log('✅ Database manager reset completed');

            // 2. Delete the physical database file (if not on web)
            if (Platform.OS !== 'web') {
                const dbPath = `${FileSystem.documentDirectory}SQLite/oxford_words_v2.db`;
                try {
                    const dbExists = await FileSystem.getInfoAsync(dbPath);
                    if (dbExists.exists) {
                        await FileSystem.deleteAsync(dbPath);
                        console.log('✅ Physical database file deleted');
                    } else {
                        console.log('ℹ️ Database file does not exist');
                    }
                } catch (deleteError) {
                    console.log('⚠️ Could not delete database file:', deleteError);
                    // Continue anyway
                }
            }

            // 3. Reinitialize everything
            console.log('🔄 Reinitializing database...');
            await databaseManager.initialize();

            if (databaseManager.isReady()) {
                console.log('✅ EMERGENCY RESET SUCCESSFUL! Database is ready.');
                return true;
            } else {
                console.log('❌ Emergency reset failed - database still not ready');
                return false;
            }

        } catch (error) {
            console.error('💥 EMERGENCY RESET FAILED:', error);
            return false;
        }
    }

    /**
     * Soft reset: Just reset the database manager without deleting files
     */
    static async softReset(): Promise<boolean> {
        try {
            console.log('🔄 Starting soft database reset...');

            await databaseManager.forceReset();
            await databaseManager.initialize();

            if (databaseManager.isReady()) {
                console.log('✅ Soft reset successful!');
                return true;
            } else {
                console.log('❌ Soft reset failed');
                return false;
            }
        } catch (error) {
            console.error('💥 Soft reset failed:', error);
            return false;
        }
    }

    /**
     * Get current database status
     */
    static getStatus() {
        const state = databaseManager.getState();
        console.log('📊 Database Status:', {
            isInitialized: state.isInitialized,
            isInitializing: state.isInitializing,
            error: state.error,
            retryCount: state.retryCount,
            isReady: databaseManager.isReady()
        });
        return state;
    }

    /**
     * Wait for database to be ready with timeout
     */
    static async waitForReady(timeoutMs: number = 30000): Promise<boolean> {
        console.log(`⏳ Waiting for database to be ready (timeout: ${timeoutMs}ms)...`);
        const isReady = await databaseManager.waitForReady(timeoutMs);

        if (isReady) {
            console.log('✅ Database is ready!');
        } else {
            console.log('❌ Database failed to become ready within timeout');
        }

        return isReady;
    }
}

// Export convenience functions for direct console use
export const nukeDatabase = () => EmergencyDatabaseReset.nukeDatabase();
export const softResetDatabase = () => EmergencyDatabaseReset.softReset();
export const getDatabaseStatus = () => EmergencyDatabaseReset.getStatus();
export const waitForDatabaseReady = (timeout?: number) => EmergencyDatabaseReset.waitForReady(timeout);

// Make it available globally for debugging (only in development)
if (__DEV__) {
    (global as any).emergencyDB = {
        nuke: nukeDatabase,
        softReset: softResetDatabase,
        status: getDatabaseStatus,
        waitForReady: waitForDatabaseReady
    };

    console.log('🛠️ Emergency database utilities available globally:');
    console.log('   emergencyDB.nuke() - Nuclear reset (deletes DB file)');
    console.log('   emergencyDB.softReset() - Soft reset (keeps DB file)');
    console.log('   emergencyDB.status() - Get current status');
    console.log('   emergencyDB.waitForReady() - Wait for database to be ready');
}

export default EmergencyDatabaseReset; 