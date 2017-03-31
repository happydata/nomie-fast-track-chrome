let gulp = require('gulp');
let webpack = require('gulp-webpack');
let sass = require('gulp-sass');


gulp.task('build', ['move', 'webpack-app', 'webpack-background','sass'], function() {

});

gulp.task('dev', ['build'], function() {
	gulp.watch('./src/sass/**/*', ['sass']);
	gulp.watch('./src/**/*.js', ['webpack-app']);
	gulp.watch('./src/background.js', ['webpack-background']);
	gulp.watch('./src/nomie-fast-track.html', ['move']);
	gulp.watch('./src/manifest.json', ['move']);
});

gulp.task('move', function() {
	var actions = [];
	actions.push(gulp.src(['./src/nomie-fast-track.html']).pipe(gulp.dest('chrome/')));
	actions.push(gulp.src(['./manifest.json']).pipe(gulp.dest('chrome/')));
	actions.push(gulp.src(['./icons/**/*',]).pipe(gulp.dest('chrome/icons')));
	actions.push(gulp.src(['./_locales/**/*',]).pipe(gulp.dest('chrome/_locales')));
	return Promise.all(actions);
});

const BabelLoaderConfig
    = {
        loader  : 'babel-loader',
        test    : /\.js$/,
        exclude : /node_modules/,
        query   : {
            presets : [ 'latest', 'stage-2' ]
        }
    }
const VueLoaderConfig
    = {
        loader  : 'vue-loader',
        test    : /\.vue$/,
        exclude : /node_modules/
    }



gulp.task('webpack-app', function() {
  return gulp.src(['src/nomie-fast-track.js'])
    .pipe(webpack({
			output : {
				path: __dirname + "/chrome",
				filename: 'nomie-fast-track.js'
			},
			resolve: {
			  alias: {
			    vue: 'vue/dist/vue.js'
			  }
			},
			module: {
            loaders: [
								BabelLoaderConfig,
                VueLoaderConfig

            ]
        }
		}))
    .pipe(gulp.dest('chrome/'));
});

gulp.task('webpack-background', function() {
  return gulp.src(['src/background.js'])
    .pipe(webpack({
			output : {
				path: __dirname + "/chrome",
				filename: 'background.js'
			},
			module: {
            loaders: [
                VueLoaderConfig
            ]
        }
		}))
    .pipe(gulp.dest('chrome/'));
});

gulp.task('sass', function () {
  return gulp.src('./src/sass/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('chrome/'));
});
