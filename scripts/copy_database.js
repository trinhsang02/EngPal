const fs = require('fs');
const path = require('path');

// Đường dẫn đến database file đã build
const DB_SOURCE = path.join(__dirname, '../assets/oxford_words_v2.db');
const DB_DEST = path.join(__dirname, '../assets/database/oxford_words_v2.db');

// Tạo thư mục database nếu chưa có
const dbDir = path.dirname(DB_DEST);
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
    console.log('Created database directory:', dbDir);
}

// Copy database file
try {
    if (fs.existsSync(DB_SOURCE)) {
        fs.copyFileSync(DB_SOURCE, DB_DEST);
        console.log('Database copied to assets successfully');
        console.log('Source:', DB_SOURCE);
        console.log('Destination:', DB_DEST);
    } else {
        console.error('Database file not found. Please run npm run build-database first.');
        process.exit(1);
    }
} catch (error) {
    console.error('Error copying database:', error);
    process.exit(1);
} 