const gulp = require('gulp');
const babel = require('gulp-babel');
const fs = require('fs-extra');

const clean = () => {
  return fs.rm('./dist', { recursive: true, force: true })
};

const compile = () => {
  return gulp.src(['src/**/*.js', '!src/**/*.test.js'])
    .pipe(babel({
      presets: ['@babel/env'],
      minified: true,
    }))
    .pipe(gulp.dest('dist'));
};

const copyDefTypes = () => {
  return fs.copy('./src/index.d.ts', './dist/index.d.ts')
}

exports.build = gulp.series(
  clean,
  compile,
  copyDefTypes
);
