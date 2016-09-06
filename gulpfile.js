'use strict';

const gulp = require('gulp');
const gulpLoadPlugins = require('gulp-load-plugins');
const closure = require('gulp-closure-compiler');
const del = require('del');
const merge = require('merge-stream');
const runSequence = require('run-sequence');

const $ = gulpLoadPlugins();

const DIST_DIR = 'dist';

function compileWithClosure(fileName) {
  return closure({
    compilerPath: 'node_modules/google-closure-compiler/compiler.jar',
    fileName: fileName,
    compilerFlags: {
      compilation_level: 'SIMPLE_OPTIMIZATIONS',
      // warning_level: 'VERBOSE',
      language_in: 'ECMASCRIPT6_STRICT',
      language_out: 'ECMASCRIPT5'
    }
  });
}

// Clean generated files.
gulp.task('clean', function() {
  del([`js/${DIST_DIR}`], {dot: true});
});

gulp.task('copy', function() {
  // let docs = gulp.src([
  //     'app/**/*.html',
  //     'app/**/nav.yaml',
  //     'app/**/blog.yaml',
  //     'app/**/authors.yaml',
  //     '!app/{bower_components,elements}/**',
  //     '!app/1.0/homepage/**',
  //    ], {base: 'app/'})
  //   .pipe(gulp.dest('dist'));

  // let gae = gulp.src([
  //     '{templates,lib}/**/*'
  //    ])
  //   .pipe(gulp.dest('dist'));

  // let bower = gulp.src([
  //     'app/bower_components/webcomponentsjs/webcomponents*.js'
  //   ], {base: 'app/'})
  //   .pipe(gulp.dest('dist'));

  let insersectionObserver = gulp.src([
      'node_modules/intersection-observer/intersection-observer.js'
    ])
    .pipe(gulp.dest(`js/${DIST_DIR}`));

  return merge(insersectionObserver);
});

// Run scripts through Closure compiler.
gulp.task('build', function() {
  let app = gulp.src([
    'js/app.js'
  ])
  .pipe(compileWithClosure('app.js'))
  .pipe($.rename({suffix: '.min'}))
  .pipe(gulp.dest(`js/${DIST_DIR}`));

  let indexPage = gulp.src([
    'js/pages/index.js'
  ])
  .pipe(compileWithClosure('index.js'))
  .pipe($.rename({suffix: '.min'}))
  .pipe(gulp.dest(`js/${DIST_DIR}/pages`));


  let insersectionObserver = gulp.src([
    `js/${DIST_DIR}/intersection-observer.js`
  ])
  .pipe(compileWithClosure('intersection-observer.js'))
  .pipe($.rename({suffix: '.min'}))
  .pipe(gulp.dest(`js/${DIST_DIR}`));

  return merge(app, insersectionObserver);
});

// Build production files.
gulp.task('default', ['clean'], cb => {
  runSequence('copy', 'build', cb);
});
