import mysql from 'mysql2/promise';
import config from '../config/config';

/**
 * Clears all data from the database by truncating all tables.
 * This script should be run before seeding the database to avoid conflicts.
 */
async function clearDatabase() {
    const connection = await mysql.createConnection(config.database);

    try {
        console.log('Starting database cleanup...');
        
        // Disable foreign key checks to allow truncation in any order
        await connection.query('SET FOREIGN_KEY_CHECKS = 0');
        console.log('Foreign key checks disabled');

        // List of all tables in the correct order (child tables first, then parent tables)
        const tables = [
            'messages',
            'thread_users',
            'threads',
            'posts',
            'band_styles',
            'user_styles',
            'user_instruments',
            'band_members',
            'instruments',
            'musical_styles',
            'bands',
            'users'
        ];

        // Truncate each table
        for (const table of tables) {
            try {
                await connection.query(`TRUNCATE TABLE ${table}`);
                console.log(`✓ Truncated table: ${table}`);
            } catch (error: any) {
                // If table doesn't exist, just log and continue
                if (error.code === 'ER_NO_SUCH_TABLE') {
                    console.log(`⚠ Table ${table} does not exist, skipping...`);
                } else {
                    console.error(`✗ Error truncating table ${table}:`, error.message);
                }
            }
        }

        // Re-enable foreign key checks
        await connection.query('SET FOREIGN_KEY_CHECKS = 1');
        console.log('Foreign key checks re-enabled');

        // Reset AUTO_INCREMENT counters
        for (const table of tables) {
            try {
                await connection.query(`ALTER TABLE ${table} AUTO_INCREMENT = 1`);
                console.log(`✓ Reset AUTO_INCREMENT for: ${table}`);
            } catch (error: any) {
                if (error.code !== 'ER_NO_SUCH_TABLE') {
                    console.log(`⚠ Could not reset AUTO_INCREMENT for ${table}:`, error.message);
                }
            }
        }

        console.log('\n✅ Database cleanup completed successfully!');
        console.log('You can now run your seed file without conflicts.');

    } catch (error) {
        console.error('❌ Error during database cleanup:', error);
        throw error;
    } finally {
        await connection.end();
        console.log('Database connection closed.');
    }
}

// Run the script if called directly
if (require.main === module) {
    clearDatabase()
        .then(() => {
            process.exit(0);
        })
        .catch((error) => {
            console.error('Fatal error:', error);
            process.exit(1);
        });
}

export default clearDatabase;
