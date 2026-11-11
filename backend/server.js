// Copyright (c) 2017 David Kim
// This program is licensed under the "MIT License".
// Please see the file COPYING in the source
// distribution of this software for license terms.

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
	routes = require('./routes/index'),
	users = require('./routes/users'),
	mongo = require('mongodb'),
	mongoose = require('mongoose'),
	db = mongoose.connection;


// init express
var app = express();

// connect to a local database
//mongoose.connect('mongodb://localhost/loginapp');

// or, connect to MongoDB's Atlas (a cloud-hosted MongoDB service)
var username = "djk3"
var password = "Da72vid87!"
var uri = "mongodb://" + username + ":" + password + "@openposcluster-shard-00-00-zb2uf.mongodb.net:27017,openposcluster-shard-00-01-zb2uf.mongodb.net:27017,openposcluster-shard-00-02-zb2uf.mongodb.net:27017/OpenPOS?ssl=true&replicaSet=OpenPOSCluster-shard-0&authSource=admin";
mongoose.connect(uri, {
	useMongoClient: true
});
var db1 = mongoose.connection;
db1.on('error', console.error.bind(console, 'connection error:'));
db1.once('open', function () {
	console.log("Connected to MongoDB Atlas");
});

// define a mongoose schema
var productSchema = mongoose.Schema({
	name: String,
	price: String,
	category: String,
	user: String
});

// define a mongoose model
var Products = mongoose.model('products', productSchema, 'products');

// setup view engine
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs({
	defaultLayout: 'layout'
}));
app.set('view engine', 'handlebars');

// setup bodyParser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	//	extended: false
	extended: true
}));
app.use(cookieParser());

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

// -------------------- END - Express routing for product CRUD operations --------------------

// username variable
var uname = "";

function isEmpty(str) {
	return (!str || 0 === str.length);
}

// find products from db
app.get('/productlist', function (req, res) {

	// make sure uname is set to the login username
	if (typeof req["user"].username === 'undefined') {
		uname = req["user"].user;
	}

	if (isEmpty(uname)) {
		uname = req["user"].username;
	} else if (!isEmpty(req['user'].username) && (uname !== req['user'].username)) {
		uname = req['user'].username;
	}

	// find all products (documents) belonging to the user
	console.log(uname, "just logged into OpenPOS");
	Products.find({
		user: uname
	}, function (err, docs) {
		console.log("Finding all docs for", uname + ":\n", docs);
		res.json(docs);
	});
});

// add product from db
app.post('/productlist', function (req, res) {
	console.log("Item requested to be added to the db: ", req.body);

	// create a new product using the data sent from the client
	var p = new Products(req.body);

	// save the new product to the db
	p.save(function (err, doc) {
		if (err) {
			return console.error(err)
		} else {
			console.log("Saving p to db: ", doc);
			res.json(doc);
		}
	});
});

// delete product from db
app.delete('/productlist/:id', function (req, res) {

	// get the product id
	var id = req.params.id;
	console.log("Removing item - id: " + id);

	// remove the product from the db
	Products.remove({
		_id: id
	}, function (err, doc) {
		res.json(doc);
	});
});

// -------------------- START - Express routing for product CRUD operations --------------------

// setup static routes
app.use(express.static(__dirname + '/public'));

// setup routes
app.use('/', routes);
app.use('/users', users);

// set the port
app.set('port', (process.env.PORT || 3000));

// start the server
app.listen(app.get('port'), function () {
	console.log('Server running on port ' + app.get('port'));
});
