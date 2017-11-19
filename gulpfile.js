// Copyright (c) 2017 David Kim
// This program is licensed under the "MIT License".
// Please see the file COPYING in the source
// distribution of this software for license terms.

var gulp = require('gulp');
var gutil = require('gulp-util');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var nodemon = require('gulp-nodemon');

/*
// start a local mongodb instance, then start the server
var exec = require('child_process').exec;

gulp.task('mongod', function (cb) {
	exec('mongod --dbpath /data/db', function (err, stdout, stderr) {
		console.log('Starting mongod');
		console.log(stdout);
		console.log(stderr);
		cb(err);
	});
})

gulp.task('nodemon', ['mongod'], function (cb) {
	var callbackCalled = false;
	return nodemon({
		script: './server.js'
	}).on('start', function () {
		if (!callbackCalled) {
			callbackCalled = true;
			cb();
		}
	});
});
*/

// start the server
gulp.task('nodemon', function (cb) {
	var callbackCalled = false;
	return nodemon({
		script: './server.js'
	}).on('start', function () {
		if (!callbackCalled) {
			callbackCalled = true;
			cb();
		}
	});
});

// start browsersync
var bs1 = browserSync.create("proxy1");
gulp.task('browser-sync', ['nodemon'], function () {
	bs1.init({
		proxy: "http://localhost:3000",
		port: 3010,
		ui: {
			port: 3011
		},
		browser: ["google chrome", "safari"],
		open: false
	});
});

// default task
gulp.task('default', ['browser-sync'], function () {
	gulp.watch(["./views/*.handlebars"], reload);
});
