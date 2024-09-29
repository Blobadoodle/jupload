import pkg from 'sqlite3';
const sqlite3 = pkg.verbose();

const db = new sqlite3.Database('db.sqlite3');

// db.run(`
// 	CREATE TABLE files (
// 		id CHAR(5) NOT NULL PRIMARY KEY,
// 		fileName VARCHAR(255) NOT NULL,
// 		expiresAt INTEGER NOT NULL,
// 		fileSize INTEGER NOT NULL,
// 		mimeType TEXT NOT NULL
// 	)
// `);

export default db;