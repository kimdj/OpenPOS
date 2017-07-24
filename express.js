var express = require('express');  // require () is a Node.js built-in function that loads modules; the concept is similar to imports/includes
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var exphbs = require('express-handlebars');
var expressValidator = require('express-validator');
var flash = require('connect-flash');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongo = require('mongodb');
var mongoose = require('mongoose');

// setup a connection with the database running locally on the default port (27017)
mongoose.connect('mongodb://localhost/loginapp');
var db = mongoose.connection;

// define the routes
var routes = require('./routes/index');
var users = require('./routes/users');

// init an express app
var app = express();

// block the header from containing information about the server (for security)
app.disable('x-powered-by');

// setup the handlebars view engine
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs({
	defaultLayout: 'layout'
}));
app.set('view engine', 'handlebars');

// BodyParser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: false
}));
app.use(cookieParser());

// Set Static Folder
app.use(express.static(path.join(__dirname, 'public')));



// TESTING
app.get('/about', function(req, res) {
	res.send("HELLO WORLD!");
});



// Express Session
app.use(session({
	secret: 'secret',
	saveUninitialized: true,
	resave: true
}));

// Passport init
app.use(passport.initialize());
app.use(passport.session());

// Express Validator
app.use(expressValidator({
	errorFormatter: function (param, msg, value) {
		var namespace = param.split('.'),
			root = namespace.shift(),
			formParam = root;

		while (namespace.length) {
			formParam += '[' + namespace.shift() + ']';
		}
		return {
			param: formParam,
			msg: msg,
			value: value
		};
	}
}));

// Connect Flash
app.use(flash());

// Global Vars
app.use(function (req, res, next) {
	res.locals.success_msg = req.flash('success_msg');
	res.locals.error_msg = req.flash('error_msg');
	res.locals.error = req.flash('error');
	res.locals.user = req.user || null;
	next();
});



app.use('/', routes);
app.use('/users', users);

// Set Port
app.set('port', (process.env.PORT || 3000));

app.listen(app.get('port'), function () {
	console.log('Server started on port ' + app.get('port'));
});

// raw handlebars  ==>  {{{{ title }}}} instead of {{ title }} to avoid conflict w/ Angular syntax
/*Handlebars.registerHelper('raw', function (options) {
	return options.fn(this);
});*/
