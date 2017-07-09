var gulp = require('gulp');

var assetsDev = 'assets/';
var assetsProd = 'src/';

var appDev = 'dev/';
var appProd = 'app/';

/* Mixed */
var ext_replace = require('gulp-ext-replace');

/* CSS */
var postcss = require('gulp-postcss');
var sourcemaps = require('gulp-sourcemaps');
var autoprefixer = require('autoprefixer');
var precss = require('precss');
var cssnano = require('cssnano');

/* JS & TS */
var jsuglify = require('gulp-uglify');
var typescript = require('gulp-typescript');

/* Images */
var imagemin = require('gulp-imagemin');
notify: false
var tsProject = typescript.createProject('tsconfig.json');

/* MongoDB */
var exec = require('child_process').exec;

/**********************************************************************/

gulp.task('build-css', function () {
	return gulp.src(assetsDev + 'scss/*.scss')
		.pipe(sourcemaps.init())
		.pipe(postcss([precss, autoprefixer, cssnano]))
		.pipe(sourcemaps.write())
		.pipe(ext_replace('.css'))
		.pipe(gulp.dest(assetsProd + 'css/'));
});

gulp.task('build-ts', function () {
	return gulp.src(appDev + '**/*.ts')
		.pipe(sourcemaps.init())
		.pipe(typescript(tsProject))
		.pipe(sourcemaps.write())
		//.pipe(jsuglify())
		.pipe(gulp.dest(appProd));
});

gulp.task('build-img', function () {
	return gulp.src(assetsDev + 'img/**/*')
		.pipe(imagemin({
			progressive: true
		}))
		.pipe(gulp.dest(assetsProd + 'img/'));
});

gulp.task('build-html', function () {
	return gulp.src(appDev + '**/*.html')
		.pipe(gulp.dest(appProd));
});

gulp.task('watch', function () {
	gulp.watch(appDev + '**/*.ts', ['build-ts']);
	gulp.watch(assetsDev + 'scss/**/*.scss', ['build-css']);
	gulp.watch(assetsDev + 'img/*', ['build-img']);
});

gulp.task('default', ['watch', 'build-ts', 'build-css']);

gulp.task("mongo-start", function () {
	var command = "mongod --fork --dbpath " + paths.dbDir + "/ --logpath " + paths.dbLogs + "/mongo.log";
	mkdirs(paths.dbDir);
	mkdirs(paths.dbLogs);
	runCommand(command);
});

gulp.task("mongo-stop", function () {
	var command = 'mongo admin --eval "db.shutdownServer();"'
	runCommand(command);
});

/* MongoDB */
function runCommand(command) {
  return function (cb) {
    exec(command, function (err, stdout, stderr) {
      console.log(stdout);
      console.log(stderr);
      cb(err);
    });
  };
}

// Database tasks
gulp.task('start-mongo', runCommand('docker run --rm --name mongo-dev -p 27017:27017 mongo'));
gulp.task('start-mongo-viewer', runCommand('docker run --rm --name mongo-express-dev --link mongo-dev:mongo -p 8081:8081 mongo-express'));
