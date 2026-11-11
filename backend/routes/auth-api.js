// Rotas de autenticação em JSON, consumidas pelo front-end React.
// Ficam separadas de routes/api.js porque aquele arquivo exige sessão ativa
// (router.use(ensureAuthenticatedApi)) — login e registro precisam do
// oposto: funcionar exatamente quando NÃO há sessão ainda.
//
// A estratégia local do Passport (bcrypt, serialize/deserialize) é
// registrada uma única vez em routes/passport-config.js, carregado pelo
// server.js antes destas rotas.

var express = require('express');
var router = express.Router();
var passport = require('passport');
var { body, validationResult } = require('express-validator');

var User = require('../models/user');

var registerValidators = [
	body('name', 'Name is required').notEmpty(),
	body('email', 'Email is required').notEmpty(),
	body('email', 'Email is not valid').isEmail(),
	body('username', 'Username is required').notEmpty(),
	body('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
	body('password2', 'Passwords do not match').custom(function (value, { req }) {
		return value === req.body.password;
	})
];

// POST /api/auth/register
router.post('/register', registerValidators, async function (req, res) {
	var errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ error: errors.array()[0].msg, errors: errors.array() });
	}

	try {
		var existing = await User.getUserByUsername(req.body.username);
		if (existing) {
			return res.status(409).json({ error: 'Username already taken' });
		}

		var newUser = new User({
			name: req.body.name,
			email: req.body.email,
			username: req.body.username,
			password: req.body.password
		});

		await User.createUser(newUser);
		res.status(201).json({ ok: true });
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Something went wrong while registering' });
	}
});

// POST /api/auth/login
router.post('/login', function (req, res, next) {
	passport.authenticate('local', function (err, user, info) {
		if (err) {
			console.error(err);
			return res.status(500).json({ error: 'Something went wrong' });
		}
		if (!user) {
			return res.status(401).json({ error: info?.message || 'Invalid username or password' });
		}
		req.logIn(user, function (err) {
			if (err) {
				console.error(err);
				return res.status(500).json({ error: 'Something went wrong' });
			}
			return res.json({ username: user.username, name: user.name });
		});
	})(req, res, next);
});

// POST /api/auth/logout
router.post('/logout', function (req, res) {
	req.logout(function (err) {
		if (err) {
			console.error(err);
			return res.status(500).json({ error: 'Something went wrong' });
		}
		res.json({ ok: true });
	});
});

module.exports = router;
