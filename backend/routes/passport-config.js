// Configuração do Passport, extraída de routes/users.js (onde estava
// misturada com as rotas Handlebars antigas). Carregada uma vez no
// server.js, antes de qualquer rota que dependa de req.user.

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/user');

passport.use(new LocalStrategy(
	async function (username, password, done) {
		try {
			var user = await User.getUserByUsername(username);
			if (!user) {
				return done(null, false, { message: 'Unknown User' });
			}

			var isMatch = await User.comparePassword(password, user.password);
			if (isMatch) {
				return done(null, user);
			} else {
				return done(null, false, { message: 'Invalid password' });
			}
		} catch (err) {
			return done(err);
		}
	}));

passport.serializeUser(function (user, done) {
	done(null, user.id);
});

passport.deserializeUser(async function (id, done) {
	try {
		var user = await User.getUserById(id);
		done(null, user);
	} catch (err) {
		done(err);
	}
});

module.exports = passport;
