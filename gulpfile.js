var gulp = require('gulp');
var gutil = require('gulp-util');

gulp.task('name', function () {
	// implementation of the task
});

/*
gulp.task('copy', function () {
	gulp.src('index.html')
		.pipe(gulp.dest('assets'))
});
*/



gulp.task('log', function () {
	gutil.log('== My Log Task ==')
});

/*
var sass = require('gulp-sass');

gulp.task('sass', function() {
  gulp.src('styles/main.scss')
  .pipe(sass({style: 'expanded'}))
    .on('error', gutil.log)
  .pipe(gulp.dest('assets'))
});
*/


// minify and concatenate all JavaScript files together so that the server loads the page faster
var uglify = require('gulp-uglify'),
	concat = require('gulp-concat');

//gulp.task('js', function () {
//	gulp.src('scripts/*.js')
//		.pipe(uglify())
//		.pipe(concat('script.js'))
//		.pipe(gulp.dest('assets'))
//});

// main task
gulp.task('default', ['log']);

// listen for a change and automatically do all the processing tasks
//gulp.task('watch', function () {
//	gulp.watch('scripts/hello.coffee', ['coffee']);
//	gulp.watch('scripts/*.js', ['js']);
//	gulp.watch('styles/main.scss', ['sass']);
//});


// create a server and setup live reload
// live reload automatically reloads the browser to reflect changes in the code
/*
var connect = require('gulp-connect');

gulp.task('connect', function () {
	connect.server({
		root: '.',
		livereload: true
	})
});

gulp.task('html', function () {
  gulp.src('./app/*.html')
    .pipe(connect.reload());
});
 
gulp.task('watch', function () {
  gulp.watch(['./app/*.html'], ['html']);
});
 
gulp.task('default', ['connect', 'watch']);
*/

// start the database and web server
var exec = require('child_process').exec;

gulp.task('start', function (cb) {
	exec('mongod --dbpath ./data/db', function (err, stdout, stderr) {
		console.log("Starting mongod");
		console.log(stdout);
		console.log(stderr);
		cb(err);
	});
	exec('node server.js', function (err, stdout, stderr) {
		console.log("Starting server.js");
		console.log(stdout);
		console.log(stderr);
		cb(err);
	});
})
