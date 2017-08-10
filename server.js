var express = require('express'),
	app = express(),
	path = require('path'),
	cookieParser = require('cookie-parser'),
	bodyParser = require('body-parser'),
	exphbs = require('express-handlebars'),
	expressValidator = require('express-validator'),
	flash = require('connect-flash'),
	session = require('express-session'),
	passport = require('passport'),
	LocalStrategy = require('passport-local').Strategy,
	mongo = require('mongodb'),
	mongoose = require('mongoose'),
	mongojs = require('mongojs'),
	db1 = mongojs('contactlist', ['contactlist']),
	db2 = mongojs('productlist', ['productlist']);



mongoose.connect('mongodb://localhost/loginapp');
var db = mongoose.connection;

var routes = require('./routes/index');
var users = require('./routes/users');
app.use('/', routes);
app.use('/users', users);

// Init App
var app = express();

// View Engine
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
app.use(express.static(__dirname + "/public"));
//app.use(express.static(path.join(__dirname, 'public')));

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



//@#(*$&@(*#&@)($^*)($*%)(*$@&(@*#&%(*#@&$)(@#*_%*@#()*%&@#(*$^*&@#^$*&^$@%^&*^($*&@#)($&)(#@&*$)(//
//@#(*$&@(*#&@)($^*)($*%)(*$@&(@*#&%(*#@&$)(@#*_%*@#()*%&@#(*$^*&@#^$*&^$@%^&*^($*&@#)($&)(#@&*$)(//
//@#(*$&@(*#&@)($^*)($*%)(*$@&(@*#&%(*#@&$)(@#*_%*@#()*%&@#(*$^*&@#^$*&^$@%^&*^($*&@#)($&)(#@&*$)(//
//@#(*$&@(*#&@)($^*)($*%)(*$@&(@*#&%(*#@&$)(@#*_%*@#()*%&@#(*$^*&@#^$*&^$@%^&*^($*&@#)($&)(#@&*$)(//
//@#(*$&@(*#&@)($^*)($*%)(*$@&(@*#&%(*#@&$)(@#*_%*@#()*%&@#(*$^*&@#^$*&^$@%^&*^($*&@#)($&)(#@&*$)(//
//@#(*$&@(*#&@)($^*)($*%)(*$@&(@*#&%(*#@&$)(@#*_%*@#()*%&@#(*$^*&@#^$*&^$@%^&*^($*&@#)($&)(#@&*$)(//
//@#(*$&@(*#&@)($^*)($*%)(*$@&(@*#&%(*#@&$)(@#*_%*@#()*%&@#(*$^*&@#^$*&^$@%^&*^($*&@#)($&)(#@&*$)(//
//@#(*$&@(*#&@)($^*)($*%)(*$@&(@*#&%(*#@&$)(@#*_%*@#()*%&@#(*$^*&@#^$*&^$@%^&*^($*&@#)($&)(#@&*$)(//
//@#(*$&@(*#&@)($^*)($*%)(*$@&(@*#&%(*#@&$)(@#*_%*@#()*%&@#(*$^*&@#^$*&^$@%^&*^($*&@#)($&)(#@&*$)(//


//  contact list  --------------------------------------------------------------------------------

app.get('/contactlist', function (req, res) {
	console.log("I received a GET request")

	db1.contactlist.find(function (err, docs) {
		console.log(docs);
		res.json(docs);
	});
});

app.post('/contactlist', function (req, res) {
	console.log(req.body);

	// insert the input data into the db1
	// and send the new data from the db1 back to the controller
	db1.contactlist.insert(req.body, function (err, doc) {
		res.json(doc);
	});
});

app.delete('/contactlist/:id', function (req, res) {
	var id = req.params.id;
	console.log(id);
	db1.contactlist.remove({
		_id: mongojs.ObjectId(id)
	}, function (err, doc) {
		res.json(doc);
	});
});

//  contact list  --------------------------------------------------------------------------------


//  product list  --------------------------------------------------------------------------------

app.get('/productlist', function (req, res) {
	console.log("I received a GET request")

	db2.productlist.find(function (err, docs) {
		console.log(docs);
		res.json(docs);
	});
});

app.post('/productlist', function (req, res) {
	console.log(req.body);

	// insert the input data into the db
	// and send the new data from the db back to the controller
	db2.productlist.insert(req.body, function (err, doc) {
		res.json(doc);
	});
});

app.delete('/productlist/:id', function (req, res) {
	var id = req.params.id;
	console.log(id);
	db2.productlist.remove({
		_id: mongojs.ObjectId(id)
	}, function (err, doc) {
		res.json(doc);
	});
});

//  product list  --------------------------------------------------------------------------------




// set the port
app.set('port', (process.env.PORT || 3000));

// start the server
app.listen(app.get('port'), function () {
	console.log('Server running on port ' + app.get('port'));
});
