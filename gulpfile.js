const gulp = require('gulp');
const babel = require('gulp-babel');
const fs = require('fs-extra');

const clean = () => {
  return fs.rm('./dist', { recursive: true, force: true })
};

const compile = () => {
  return gulp.src(['src/**/*.js', '!src/**/*.test.js'])
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(gulp.dest('dist'));
};

const copyDefTypes = () => {
  return Promise.all(
    ['index.d.ts', 'pipes.d.ts'].map(filename => fs.copy(`./src/${filename}`, `./dist/${filename}`))
  )
}

exports.build = gulp.series(
  clean,
  compile,
  copyDefTypes
);
