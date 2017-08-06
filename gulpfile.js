// module dependencies
var gulp = require('gulp');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var nodemon = require('gulp-nodemon');
var exec = require('child_process').exec;

// browser-sync
gulp.task('browser-sync', ['db', 'web'], function () {
	browserSync.init(null, {
		proxy: "http://localhost:5000",
		//files: ["public/**/*.*"],
		files: ["express.js"],
		browser: "google chrome",
		port: 7000,
	});
});

// start the database
gulp.task('db', function (cb) {
	exec('mongod', function (err, stdout, stderr) {
		console.log(stdout);
		console.log(stderr);
		cb(err);
	});
});

// start web server
gulp.task('web', function (cb) {
	var called = false;
	return nodemon({
			script: 'express.js',
			ignore: [
      'gulpfile.js',
      'node_modules/'
    ]
		}).on('start', function () {
		if (!called) {
			called = true;
			cb();
		}
	})
	.on('restart', function () {
		setTimeout(function () {
			reload({
				stream: false
			});
		}, 1000);
	});
});

// main task
gulp.task('default', ['browser-sync'], function () {
	//gulp.task('default', ['db', 'web', 'browser-sync'], function () {
	gulp.watch(['public/*.html'], reload);
});








//
////// start the database
////var exec = require('child_process').exec;
////
////gulp.task('start', function (cb) {
////	exec('mongod', function (err, stdout, stderr) {
////		console.log(stdout);
////		console.log(stderr);
////		cb(err);
////	});
////	exec('node express', function (err, stdout, stderr) {
////		console.log(stdout);
////		console.log(stderr);
////		cb(err);
////	});
////});
////
////// static server
////gulp.task('browser-sync', function () {
////	browserSync.init({
////		server: {
////			baseDir: "./"
////		}
////	});
////});
//
//
//
//
//
//
//
//
//
//gulp.task('name', function () {
//	// implementation of the task
//});
//
///*
//gulp.task('copy', function () {
//	gulp.src('index.html')
//		.pipe(gulp.dest('assets'))
//});
//*/
//
//var gutil = require('gulp-util');
//
//gulp.task('log', function () {
//	gutil.log('== My Log Task ==')
//});
//
///*
//var sass = require('gulp-sass');
//
//gulp.task('sass', function() {
//  gulp.src('styles/main.scss')
//  .pipe(sass({style: 'expanded'}))
//    .on('error', gutil.log)
//  .pipe(gulp.dest('assets'))
//});
//*/
//
//
//// minify and concatenate all JavaScript files together so that the server loads the page faster
//var uglify = require('gulp-uglify'),
//	concat = require('gulp-concat');
//
//gulp.task('js', function () {
//	gulp.src('scripts/*.js')
//		.pipe(uglify())
//		.pipe(concat('script.js'))
//		.pipe(gulp.dest('assets'))
//});
//
//
//
//// listen for a change and automatically do all the processing tasks
//gulp.task('watch', function () {
//	gulp.watch('scripts/hello.coffee', ['coffee']);
//	gulp.watch('scripts/*.js', ['js']);
//	gulp.watch('styles/main.scss', ['sass']);
//});
//
//
//// create a server and setup live reload
//// live reload automatically reloads the browser to reflect changes in the code
///*
//var connect = require('gulp-connect');
//
//gulp.task('connect', function () {
//	connect.server({
//		root: '.',
//		livereload: true
//	})
//});
//
//gulp.task('html', function () {
//  gulp.src('./app/*.html')
//    .pipe(connect.reload());
//});
// 
//gulp.task('watch', function () {
//  gulp.watch(['./app/*.html'], ['html']);
//});
// 
//gulp.task('default', ['connect', 'watch']);
//*/
