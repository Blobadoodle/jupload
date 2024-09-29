import express from 'express';
import multer from 'multer';
import path from 'path';
import { nanoid } from 'nanoid';
import db from './db.js';
import { checkExpirationSingle } from './modules/expirationChecker.js';
import passport from 'passport';

const __dirname = path.resolve();
const uploadsPath = path.join(__dirname, 'uploads');

const router = express.Router();

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, uploadsPath);
	},
	filename: (req, file, cb) => {
		cb(null, nanoid(5));
	}
});
const upload = multer({ storage });

function formatBytes(bytes) {
	if (bytes === 0) return '0 Bytes';

	const k = 1024;
	const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	
	return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

router.get('/login', (req, res) => {
	console.log('What');
	return res.render('pages/login');
});

router.get('/:id', async (req, res) => {
	const id = req.params.id;

	if(id.length != 5)
		return res.status(404);

	db.get(`SELECT * FROM files WHERE id = ?`, [id], async (err, row) => {
		if(err) {
			console.error(err);
			return res.status(500);
		}

		if(row) {
			const notExpired = await checkExpirationSingle(row);

			if(notExpired) {
				row.fileSize = formatBytes(row.fileSize);

				return res.render('pages/file', { file: row });
			} else {
				return res.status(404).render('pages/404');
			}


		} else {
			return res.status(404).render('pages/404');
		}
	});
});


router.get('/:id/:filename', (req, res) => {
	const id = req.params.id;
	const filename = req.params.filename;

	if(id.length != 5)
		return res.status(404);

	db.get(`SELECT * FROM files WHERE id = ? AND fileName = ?`, [id, filename], (err, row) => {
		if(err) {
			console.error(err);
			return res.status(500);
		}

		if(row)
			return res.sendFile(path.join(uploadsPath, row.id));
		else
			return res.status(404);
	});
});

router.post('/api/v1/login', passport.authenticate('local', { failureRedirect: '/login' }), (req, res) => {
	console.log()
	res.redirect('/');
});

// Privileged pages beyond this point

router.all('*', (req, res, next) => {
	if(req.isAuthenticated())
		next();
	else
		res.redirect('/login');
});

router.get('/', (req, res) => {
	return res.render('pages/dashboard');
});

router.post('/api/v1/file', upload.single('file'), (req, res) => {

	const id = req.file.filename;
	const fileName = req.file.originalname;
	const expiresAt = Date.now() + (1000 * 60 * 60 * 24 * 3); // 3 days 
	console.log(Date.now());
	console.log(expiresAt);

	db.run('INSERT INTO files (id, fileName, expiresAt, fileSize, mimeType) VALUES (?, ?, ?, ?, ?)', [id, fileName , expiresAt, req.file.size, req.file.mimetype], (err) => {
		if(err) {
			console.error(err);
			return res.status(500);
		}

		res.redirect(`/${id}`);
	});
});


export default router;