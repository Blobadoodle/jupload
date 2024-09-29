import 'dotenv/config';
import express from 'express';
import path from 'path';
import routes from './routes.js';
import morgan from 'morgan';
import passport from 'passport';
import localStrategy from './auth.js';
import session from 'express-session';

const __dirname = path.resolve();

const port = process.env.PORT || 3000;
const app = express();
const env = app.get('env');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(session({
	secret: process.env.SESSION_SECRET,
	resave: false,
	saveUninitialized: true,
	cookie: { maxAge: 365 * 24 * 60 * 60 * 1000 } // 1 Year
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(morgan(env === 'development' ? 'dev' : 'tiny'));
app.use('/', routes);
app.set('view engine', 'ejs');

passport.use(localStrategy);

app.listen(port, () => {
	console.log(`Listening on port ${port}. Environment: '${env}'. URL: '${process.env.URL}'`);
});