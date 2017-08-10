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
	db = mongoose.connection,
	db1 = mongojs('contactlist', ['contactlist']),
	db2 = mongojs('productlist', ['productlist']),
	routes = require('./routes/index'),
	users = require('./routes/users');


// init express
var app = express();

// connect to the database
mongoose.connect('mongodb://localhost/loginapp');

// view engine
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs({
	defaultLayout: 'layout'
}));
app.set('view engine', 'handlebars');

// setup bodyParser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: false
}));
app.use(cookieParser());

// set static folder
app.use(express.static(__dirname + "/public"));
//app.use(express.static(path.join(__dirname, 'public')));

// setup an express session
app.use(session({
	secret: 'secret',
	saveUninitialized: true,
	resave: true
}));

// init passport
app.use(passport.initialize());
app.use(passport.session());

// setup express validator
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

// connect flash
app.use(flash());

// global vars
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



// setup routes
app.use('/', routes);
app.use('/users', users);

// set the port
app.set('port', (process.env.PORT || 3000));

// start the server
app.listen(app.get('port'), function () {
	console.log('Server running on port ' + app.get('port'));
});
