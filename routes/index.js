// Copyright (c) 2017 David Kim
// This program is licensed under the "MIT License".
// Please see the file COPYING in the source
// distribution of this software for license terms.

var express = require('express');
var app = express();
var router = express.Router();

// get homepage
router.get('/', ensureAuthenticated, function (req, res) {
	res.render('index', {
		username: req.user.username
	});
});

function ensureAuthenticated(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	} else {
		res.redirect('/users/login');
	}
}

module.exports = router;
