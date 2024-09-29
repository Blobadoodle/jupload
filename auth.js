import LocalStrategy from 'passport-local';
import crypto from 'crypto';
import passport from 'passport';

passport.serializeUser((user, done) => {
	done(null, user);	
})

passport.deserializeUser((user, done) => {
	done(null, user);
});

export default new LocalStrategy((_username, password, done) => {
	const hash = crypto.createHash('sha256').update(password).digest('hex');

	return done(null, hash == process.env.PASSWORD);
});