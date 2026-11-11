// Copyright (c) 2017 David Kim
// This program is licensed under the "MIT License".
// Please see the file COPYING in the source
// distribution of this software for license terms.

var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

// user schema
var UserSchema = mongoose.Schema({
	username: {
		type: String,
		index: true
	},
	password: {
		type: String
	},
	email: {
		type: String
	},
	name: {
		type: String
	}
});

// expose the user schema as a module
var User = mongoose.model('User', UserSchema);

// NOTE: Mongoose 7+ dropped callback support entirely, so every method below
// is now Promise/async-await based instead of the old callback style.
// Calling code (routes/users.js) has been updated to match.

module.exports = User;

module.exports.createUser = async function (newUser) {
	var salt = await bcrypt.genSalt(10);
	newUser.password = await bcrypt.hash(newUser.password, salt);
	return newUser.save();
};

module.exports.getUserByUsername = function (username) {
	return User.findOne({ username: username });
};

module.exports.getUserById = function (id) {
	return User.findById(id);
};

module.exports.comparePassword = function (candidatePassword, hash) {
	return bcrypt.compare(candidatePassword, hash);
};
