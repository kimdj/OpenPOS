// Copyright (c) 2017 David Kim
// This program is licensed under the "MIT License".
// Please see the file COPYING in the source
// distribution of this software for license terms.
//
// Este servidor agora funciona como uma API pura, consumida pelo front-end
// React (pasta openpos-frontend, rodando separadamente via Vite). As antigas
// views Handlebars (login/register) foram substituídas por telas React
// equivalentes, então express-handlebars não é mais necessário aqui.
//
// routes/auth-api.js  -> login, registro e logout em JSON
// routes/api.js       -> produtos, vendas e estatísticas (protegido por sessão)

require('dotenv').config();

var express = require('express'),
	app = express(),
	cookieParser = require('cookie-parser'),
	session = require('express-session'),
	passport = require('passport'),
	api = require('./routes/api'),
	authApi = require('./routes/auth-api'),
	publicApi = require('./routes/public-api'),
	mongoose = require('mongoose'),
	db = mongoose.connection;

// Precisa ser registrada antes de qualquer rota que use req.user (routes/auth-api.js
// registra a estratégia 'local' do Passport como efeito colateral do require).
require('./routes/passport-config');

// -------------------- Database connection --------------------
var MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/OpenPOS';

mongoose.connect(MONGO_URI);

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', function () {
	console.log('Connected to MongoDB');
});

// setup body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// -------------------- CORS (dev) --------------------
// O front-end React roda em outra porta durante o desenvolvimento
// (Vite, geralmente localhost:5173). O proxy do Vite (ver vite.config.js
// no projeto do front-end) faz o navegador enxergar tudo como "mesma
// origem" — este CORS aqui é uma segunda camada de segurança, útil caso
// alguém rode o front sem o proxy (ex: apontando direto pra API).
var FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';
app.use(function (req, res, next) {
	res.header('Access-Control-Allow-Origin', FRONTEND_ORIGIN);
	res.header('Access-Control-Allow-Credentials', 'true');
	res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
	res.header('Access-Control-Allow-Headers', 'Content-Type');
	if (req.method === 'OPTIONS') {
		return res.sendStatus(204);
	}
	next();
});

// setup an express session
app.use(session({
	secret: process.env.SESSION_SECRET || 'change-me-in-.env',
	saveUninitialized: true,
	resave: true,
	cookie: {
		sameSite: 'lax'
	}
}));

// init passport
app.use(passport.initialize());
app.use(passport.session());

// -------------------- Routes --------------------
app.use('/api/auth', authApi);     // login/registro/logout em JSON (sem exigir sessão)
app.use('/api/public', publicApi); // loja do cliente: vitrine e compra (sem sessão)
app.use('/api', api);              // produtos, vendas e estatísticas (exige sessão)

app.get('/', function (req, res) {
	res.json({ message: 'OpenPOS API rodando. O front-end React roda separadamente (npm run dev na pasta openpos-frontend).' });
});

// set the port
app.set('port', (process.env.PORT || 3000));

// start the server — só quando executado diretamente (npm start / npm run dev).
// Quando importado pelos testes, o app é exportado sem abrir a porta.
if (require.main === module) {
	app.listen(app.get('port'), function () {
		console.log('Server running on port ' + app.get('port'));
	});
}

module.exports = app;
