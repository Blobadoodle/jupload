import db from '../db.js';
import fs from 'fs';
import path from 'path';

const __dirname = path.resolve();
const uploadsPath = path.join(__dirname, 'uploads');

export async function checkExpirationSingle(row) {
	if(Date.now() > row.expiresAt) {
		fs.unlinkSync(path.join(uploadsPath, row.id));

		await new Promise(resolve => {
			db.run('DELETE FROM files WHERE id = ?', [row.id], (err) => {
				if(err)
					throw err;
			
				resolve();
			})
		})
		return false;
	}

	return true;
}

export function checkExpirationAll() {
	const timeStamp = Date.now();


	db.all('SELECT id FROM files WHERE expiresAt < ?', [timeStamp], (err, rows) => {
		for(const row of rows) {
			const id = row.id;

			fs.unlinkSync(path.join(uploadsPath, id));
		}
	});

	db.run('DELETE FROM files WHERE expiresAt < ?', [timeStamp]);
} 