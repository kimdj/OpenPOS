/*
we will structure here a series of possible responses depending on the URL requested
as we travel through the pipeline, we will perform needed actions using middleware functions
if a response is valid, we will display the correct view and if not we will handle errors.

this is our projects entry point
if you start the server by typing node express.js and then open the browser at localhost:3000 , you'll get a 404 error if you haven't defined any routes
*/

// what is require()?
// it is a Node.js built-in function that loads modules; the concept is similar to imports/includes

// import all Node.js modules
var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var path = require('path');
var handlebars = require('express-handlebars');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var flash = require('connect-flash');
var expressValidator = require('express-validator');
var session = require('express-session');
var parseurl = require('parseurl');

// setup a connection with the database running locally on the default port (27017)
mongoose.connect('mongodb://localhost/loginapp', {
	useMongoClient: true
});
var db = mongoose.connection;

// define the routes
var routes = require('./routes/index.js');
var users = require('./routes/users.js');

// initialize an express app
var app = express();

// block the header from containing information about the server (for security purposes)
app.disable('x-powered-by');

// set up handlebars:
// create a directory named views and then another named layouts in it
// create these files in the views directory and define the HTML in them:
// home.handlebars, about.handlebars, 404.handlebars and 500.handlebars

// set views to the path -> ./views
// in Node.js, __dirname is always the directory in which the currently executing script resides
app.set('views', path.join(__dirname, 'views'));

// define main.handlebars as the default layout
app.engine('handlebars', handlebars({
	defaultLayout: 'layout'
}));

// setup the handlebars view engine
app.set('view engine', 'handlebars');

// body-parser middleware
// required when using POST requests to parse encoded data
// npm install --save body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: false
}));

// import credentials which are used for secure cookies
// install the cookie middleware
// npm install --save cookie-parser
app.use(cookieParser());
//var credentials = require('./credentials.js');
//app.use(require('cookie-parser')(credentials.cookieSecret));

// express.static built-in middleware function allows the server to serve static files
app.use(express.static(path.join(__dirname, 'public')));

// express session
// storing session information can be done in a few ways:
// for development, we can work with a memory store
// stores the session id in a cookie and the session data on the server
// npm install --save express-session
app.use(session({
	// the secret string used to sign the session id cookie
	secret: 'secret',
	//secret: credentials.cookieSecret,

	// doesn't store data if a session is new and hasn't been modified
	saveUninitialized: true,

	// only save back to the session store if a change was made
	resave: true
}));

// passport init
app.use(passport.initialize());
app.use(passport.session());

// express validator
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

// define some routes
// app.get receives a path and a function and it defines our routes
// the path isn't case sensitive and doesn't care about trailing path information
// the req object represents the HTTP request and contains the query string, parameters, body, header
// the res object is the response Express sends when it receives a request
/*app.get('/', function (req, res) {

	// point at the login.handlebars view
	res.render('login');
});*/

// app.use() mounts the specified middleware function or functions at the specified path:
// the middleware function is executed when the base of the requested path matches path
app.use('/', routes);
app.use('/users', users);

// defines the port the server should run on
app.set('port', (process.env.PORT || 3000));

// starts a UNIX socket and listens for connections on the given path
// this method is identical to Node’s http.Server.listen()
app.listen(app.get('port'), function () {
	console.log('Server started on port ' +
		app.get('port') + '; press Ctrl-C to terminate');
});





// this is an example of middleware It receives a request object, response object and the next function
// as we look for the correct information to serve it executes and then next() says to continue down the pipeline
/*app.use(function (req, res, next) {
	console.log('Looking for URL : ' + req.url);
	next();
});

// you can also report and throw errors
app.get('/junk', function (req, res, next) {
	console.log('Tried to access /junk');
	throw new Error('/junk does\'t exist');
});

// catches the error and logs it and then continues down the pipeline
app.use(function (err, req, res, next) {
	console.log('Error : ' + err.message);
	next();
});


// if we want /about/contact we'd have to define it before this route
app.get('/about', function (req, res) {

	// point at the about.handlebars view
	// allow for the test specified in tests-about.js
	res.render('about');
});

// link to contact view
app.get('/contact', function (req, res) {

	// CSRF tokens are generated in cookie and form data and then they are verified when the user posts
	res.render('contact', {
		csrf: 'CSRF token here'
	});
});

// sent here after the form is processed
app.get('/thankyou', function (req, res) {
	res.render('thankyou');
});

// receive the contact form data and then redirect to thankyou.handlebars
// contact.handlebars calls process to process the form
app.post('/process', function (req, res) {
	console.log('Form : ' + req.query.form);
	console.log('CSRF token : ' + req.body._csrf);
	console.log('Email : ' + req.body.email);
	console.log('Question : ' + req.body.ques);
	res.redirect(303, '/thankyou');
});

// open file-upload.handlebars and store the current year and month
// when the form is submitted, the year and month will be passed
app.get('/file-upload', function (req, res) {
	var now = new Date();
	res.render('file-upload', {
		year: now.getFullYear(),
		month: now.getMonth()
	});
});

// file-upload.handlebars contains the form that calls here
app.post('/file-upload/:year/:month',
	function (req, res) {

		// parse a file that was uploaded
		var form = new formidable.IncomingForm();
		form.parse(req, function (err, fields, file) {
			if (err)
				return res.redirect(303, '/error');
			console.log('Received File');

			// output file information
			console.log(file);
			res.redirect(303, '/thankyou');
		});
	});

// demonstrate how to set a cookie
app.get('/cookie', function (req, res) {

	// set the key and value as well as expiration
	res.cookie('username', 'testUser', {
		expire: new Date() + 9999
	}).send('username has the value of : testUser');
});

// show stored cookies in the console
app.get('/listcookies', function (req, res) {
	console.log("Cookies : ", req.cookies);
	res.send('Look in console for cookies');
});

// delete a cookie
app.get('/deletecookie', function (req, res) {
	res.clearCookie('username');
	res.send('username Cookie Deleted');
});

// this is another example of middleware
app.use(function (req, res, next) {
	var views = req.session.views;

	// if no views initialize an empty array
	if (!views) {
		views = req.session.views = {};
	}

	// get the current path

	// parseurl provides info on the url of a request object
	// npm install --save parseurl

	var pathname = parseurl(req).pathname;

	// increment the value in the array using the path as the key
	views[pathname] = (views[pathname] || 0) + 1;

	// continue down the pipeline
	next();
});
*/



/*
// when this page is accessed get the correct value from the views array
app.get('/viewcount', function (req, res, next) {
	res.send('You viewed this page ' + req.session.views['/viewcount'] + ' times ');
});

// reading and writing to the file system
// import the File System module
// npm install --save fs
var fs = require("fs");

app.get('/readfile', function (req, res, next) {

	// read the file provided and either return the contents of the data, or an err
	fs.readFile('./public/randomfile.txt', function (err, data) {
		if (err) {
			return console.error(err);
		}
		res.send("The File : " + data.toString());
	});

});

// This writes and then reads from a file
app.get('/writefile', function (req, res, next) {

	// If the file doesn't exist it is created and then you add
	// the text provided in the 2nd parameter
	fs.writeFile('./public/randomfile2.txt',
		'More random text',
		function (err) {
			if (err) {
				return console.error(err);
			}
		});

	// Read the file like before
	fs.readFile('./public/randomfile2.txt', function (err, data) {
		if (err) {
			return console.error(err);
		}

		res.send("The File : " + data.toString());
	});
});

// defines a custom 404 Page and we use app.use because the request didn't match a route (must follow the routes)
app.use(function (req, res) {
	// define the content type
	res.type('text/html');

	// the default status is 200
	res.status(404);

	// point at the 404.handlebars view
	res.render('404');
});

// custom 500 Page
app.use(function (err, req, res, next) {
	console.error(err.stack);
	res.status(500);

	// point at the 500.handlebars view
	res.render('500');
});
*/

/*****************************************************************/

// raw handlebars  ==>  {{{{ title }}}} instead of {{ title }} to avoid conflict w/ Angular syntax
/*Handlebars.registerHelper('raw', function (options) {
	return options.fn(this);
});*/
