const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// Đường dẫn đến thư mục chứa các file JSON
const JSON_DIR = path.join(__dirname, '../assets/json/oxford_words');
const DB_V2_PATH = path.join(__dirname, '../assets/oxford_words_v2.db');

// Tạo database và các bảng
function createDatabase() {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(DB_V2_PATH, (err) => {
            if (err) {
                reject(err);
                return;
            }
            console.log('Connected to SQLite database.');
        });

        // Tạo bảng words
        db.run(`
            CREATE TABLE IF NOT EXISTS words (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                word TEXT UNIQUE NOT NULL,
                pos TEXT,
                phonetic TEXT,
                phonetic_text TEXT,
                phonetic_am TEXT,
                phonetic_am_text TEXT,
                mastered INTEGER NOT NULL DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `, (err) => {
            if (err) {
                reject(err);
                return;
            }
            console.log('Words table created successfully.');
        });

        // Tạo bảng senses
        db.run(`
            CREATE TABLE IF NOT EXISTS senses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                word_id INTEGER NOT NULL,
                definition TEXT NOT NULL,
                sense_order INTEGER NOT NULL,
                FOREIGN KEY (word_id) REFERENCES words (id) ON DELETE CASCADE
            )
        `, (err) => {
            if (err) {
                reject(err);
                return;
            }
            console.log('Senses table created successfully.');
        });

        // Tạo bảng examples
        db.run(`
            CREATE TABLE IF NOT EXISTS examples (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                sense_id INTEGER NOT NULL,
                cf TEXT,
                x TEXT NOT NULL,
                example_order INTEGER NOT NULL,
                FOREIGN KEY (sense_id) REFERENCES senses (id) ON DELETE CASCADE
            )
        `, (err) => {
            if (err) {
                reject(err);
                return;
            }
            console.log('Examples table created successfully.');
        });

        // Tạo learning_stats table for spaced repetition
        db.exec(`
            CREATE TABLE IF NOT EXISTS learning_stats (
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
            );
        `);

        // Tạo indexes để tối ưu hiệu suất tìm kiếm
        db.run('CREATE INDEX IF NOT EXISTS idx_words_word ON words(word)', (err) => {
            if (err) {
                console.log('Error creating word index:', err);
            }
        });

        db.run('CREATE INDEX IF NOT EXISTS idx_senses_word_id ON senses(word_id)', (err) => {
            if (err) {
                console.log('Error creating sense index:', err);
            }
        });

        db.run('CREATE INDEX IF NOT EXISTS idx_examples_sense_id ON examples(sense_id)', (err) => {
            if (err) {
                console.log('Error creating example index:', err);
            }
        });

        console.log('Tables created successfully');

        resolve(db);
    });
}

// Chèn dữ liệu từ một file JSON
async function insertWordData(db, jsonData) {
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            reject(new Error('Database operation timeout'));
        }, 60000); // 60 second timeout

        db.serialize(() => {
            db.run('BEGIN TRANSACTION');

            let processedWords = 0;
            let totalWords = jsonData.length;

            if (totalWords === 0) {
                clearTimeout(timeout);
                db.run('COMMIT', () => resolve());
                return;
            }

            jsonData.forEach((wordData, wordIndex) => {
                // Chèn từ
                db.run(`
                    INSERT OR REPLACE INTO words (word, pos, phonetic, phonetic_text, phonetic_am, phonetic_am_text)
                    VALUES (?, ?, ?, ?, ?, ?)
                `, [
                    wordData.word || '',
                    wordData.pos || '',
                    wordData.phonetic || '',
                    wordData.phonetic_text || '',
                    wordData.phonetic_am || '',
                    wordData.phonetic_am_text || ''
                ], function (err) {
                    if (err) {
                        console.error('Error inserting word:', wordData.word, err);
                    }

                    const wordId = this.lastID;

                    // Chèn các nghĩa (đơn giản hóa)
                    if (wordData.senses && Array.isArray(wordData.senses) && wordData.senses.length > 0) {
                        let sensesToProcess = Math.min(wordData.senses.length, 5); // Limit to 5 senses max
                        let sensesProcessed = 0;

                        wordData.senses.slice(0, 5).forEach((sense, senseIndex) => {
                            if (sense && sense.definition) {
                                db.run(`
                                    INSERT INTO senses (word_id, definition, sense_order)
                                    VALUES (?, ?, ?)
                                `, [
                                    wordId,
                                    sense.definition.substring(0, 500), // Limit definition length
                                    senseIndex + 1
                                ], function (err) {
                                    if (err) {
                                        console.error('Error inserting sense:', err);
                                    } else {
                                        const senseId = this.lastID;

                                        // Chèn ví dụ (tối đa 3 ví dụ mỗi nghĩa)
                                        if (sense.examples && Array.isArray(sense.examples)) {
                                            sense.examples.slice(0, 3).forEach((example, exampleIndex) => {
                                                if (example && example.x) {
                                                    db.run(`
                                                        INSERT INTO examples (sense_id, cf, x, example_order)
                                                        VALUES (?, ?, ?, ?)
                                                    `, [
                                                        senseId,
                                                        (example.cf || '').substring(0, 200),
                                                        example.x.substring(0, 300),
                                                        exampleIndex + 1
                                                    ]);
                                                }
                                            });
                                        }
                                    }

                                    sensesProcessed++;
                                    if (sensesProcessed === sensesToProcess) {
                                        processedWords++;
                                        if (processedWords % 100 === 0) {
                                            console.log(`Processed ${processedWords} words...`);
                                        }

                                        if (processedWords === totalWords) {
                                            clearTimeout(timeout);
                                            db.run('COMMIT', (err) => {
                                                if (err) {
                                                    reject(err);
                                                } else {
                                                    resolve();
                                                }
                                            });
                                        }
                                    }
                                });
                            } else {
                                sensesProcessed++;
                                if (sensesProcessed === sensesToProcess) {
                                    processedWords++;
                                    if (processedWords % 100 === 0) {
                                        console.log(`Processed ${processedWords} words...`);
                                    }

                                    if (processedWords === totalWords) {
                                        clearTimeout(timeout);
                                        db.run('COMMIT', (err) => {
                                            if (err) {
                                                reject(err);
                                            } else {
                                                resolve();
                                            }
                                        });
                                    }
                                }
                            }
                        });
                    } else {
                        // Không có senses
                        processedWords++;
                        if (processedWords % 100 === 0) {
                            console.log(`Processed ${processedWords} words...`);
                        }

                        if (processedWords === totalWords) {
                            clearTimeout(timeout);
                            db.run('COMMIT', (err) => {
                                if (err) {
                                    reject(err);
                                } else {
                                    resolve();
                                }
                            });
                        }
                    }
                });
            });
        });
    });
}

// Xử lý tất cả các file JSON
async function processAllJsonFiles() {
    try {
        const db = await createDatabase();

        // Đọc tất cả các file JSON trong thư mục
        const files = fs.readdirSync(JSON_DIR)
            .filter(file => file.endsWith('.json'))
            .sort();

        console.log(`Found ${files.length} JSON files to process.`);

        let totalWordsProcessed = 0;

        for (const file of files) {
            console.log(`Processing ${file}...`);
            const filePath = path.join(JSON_DIR, file);

            try {
                const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                console.log(`File ${file} contains ${jsonData.length} words`);

                await insertWordData(db, jsonData);
                totalWordsProcessed += jsonData.length;

                console.log(`Completed processing ${file} - Total words so far: ${totalWordsProcessed}`);
            } catch (fileError) {
                console.error(`Error processing ${file}:`, fileError);
                // Continue with next file instead of stopping
                continue;
            }
        }

        console.log(`\n=== PROCESSING COMPLETE ===`);
        console.log(`Total files processed: ${files.length}`);
        console.log(`Total words processed: ${totalWordsProcessed}`);

        // Đóng database
        db.close((err) => {
            if (err) {
                console.error('Error closing database:', err);
            } else {
                console.log('Database connection closed.');
                console.log(`Database created successfully at: ${DB_V2_PATH}`);
            }
        });

    } catch (error) {
        console.error('Error processing files:', error);
        process.exit(1);
    }
}

// Chạy script
if (require.main === module) {
    processAllJsonFiles();
}

module.exports = {
    createDatabase,
    insertWordData,
    processAllJsonFiles
}; 