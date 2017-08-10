var express = require('express'),
	app = express(),
	mongojs = require('mongojs'),
	db = mongojs('contactlist', ['contactlist']),
	db2 = mongojs('productlist', ['productlist']),
	bodyParser = require('body-parser');

app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json());

//  contact list  --------------------------------------------------------------------------------

app.get('/contactlist', function (req, res) {
	console.log("I received a GET request")

	db.contactlist.find(function (err, docs) {
		console.log(docs);
		res.json(docs);
	});
});

app.post('/contactlist', function (req, res) {
	console.log(req.body);

	// insert the input data into the db
	// and send the new data from the db back to the controller
	db.contactlist.insert(req.body, function (err, doc) {
		res.json(doc);
	});
});

app.delete('/contactlist/:id', function (req, res) {
	var id = req.params.id;
	console.log(id);
	db.contactlist.remove({
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

// start the server
app.listen(3000);
console.log("Server running on port 3000");


/********************************************************************/
//app.get('/', function (req, res) {
//	res.send("Hello world from server.js")
//});
