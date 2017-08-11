var express = require('express');
var app = express();
var router = express.Router();

// Get Homepage
router.get('/', ensureAuthenticated, function (req, res) {
	res.render('index', {
		username: req.user.username
	});

//	console.log("SERVER SAYS: ", req.user.username);
});

function ensureAuthenticated(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	} else {
		//req.flash('error_msg','You are not logged in');
		res.redirect('/users/login');
	}
}

module.exports = router;
