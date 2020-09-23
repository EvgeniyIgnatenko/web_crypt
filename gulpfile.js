/* eslint-disable multiline-comment-style */
/* eslint-disable arrow-parens */
/* eslint-disable object-property-newline */
/* eslint-disable array-bracket-newline */
/* eslint-disable array-element-newline */
/* eslint-disable function-paren-newline */
/* eslint-disable sort-keys */
/* eslint-disable comma-dangle */
/* eslint-disable require-await */
/* eslint-disable eol-last */
/* eslint-disable dot-location */
/* eslint-disable object-curly-spacing */
/* eslint-disable require-jsdoc */
/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

const { task, series, parallel, src, dest, watch } = require('gulp');
const sass = require('gulp-sass');
const browserSync = require('browser-sync');
const notify = require('gulp-notify');
const cssnano = require('cssnano');
const rename = require('gulp-rename');
const postcss = require('gulp-postcss');
const csscomb = require('gulp-csscomb');
const autoprefixer = require('autoprefixer');
const mqpacker = require('css-mqpacker');
const sortCSSmq = require('sort-css-media-queries');

const PATH = {
  scssFile: './assets/scss/style.scss',
  scssFiles: './assets/scss/**/*.scss',
  scssFolder: './assets/scss',
  cssFiles: './assets/css/*.css',
  cssFolder: './assets/css',
  cssExclude: '!./assets/css/*.min.css',
  htmlFiles: './*.html',
};

const plugins = [
  autoprefixer({
    overrideBrowserslist: ['last 5 versions', '> 0.1%'],
    cascade: true,
  }),
  mqpacker({ sort: sortCSSmq }),
];

function scss() {
  return src(PATH.scssFile)
    .pipe(sass({ outputStyle: 'expanded' }).on('error', sass.logError))
    .pipe(postcss(plugins))
    .pipe(dest(PATH.cssFolder))
    .pipe(notify({ message: 'Compiled!', sound: false }))
    .pipe(browserSync.reload({ stream: true }));
}

function scssMin() {
  const extendedPlugins = plugins.concat([cssnano({ preset: 'default' })]);

  return src(PATH.scssFile)
    .pipe(sass({ outputStyle: 'expanded' }).on('error', sass.logError))
    .pipe(postcss(extendedPlugins))
    .pipe(rename({ suffix: '.min' }))
    .pipe(dest(PATH.cssFolder))
    .pipe(notify({ message: 'Compiled!', sound: false }));
}

function cssMin() {
  return src([PATH.cssFiles, PATH.cssExclude])
    .pipe(postcss([cssnano({ preset: 'default' })]))
    .pipe(rename({ suffix: '.min' }))
    .pipe(dest(PATH.cssFolder));
}

function scssDev() {
  return src(PATH.scssFile, { sourcemaps: true })
    .pipe(sass({ outputStyle: 'expanded' }).on('error', sass.logError))
    .pipe(dest(PATH.cssFolder, { sourcemaps: 'true' }));
}

function comb() {
  return src(PATH.scssFiles)
    .pipe(csscomb().on('error', notify.onError(err => `File: ${err.message}`)))
    .pipe(dest(PATH.scssFolder));
}

function syncInit() {
  browserSync({
    server: {
      baseDir: './',
    },
    notify: false,
  });
}

async function sync() {
  browserSync.reload();
}

function watchFiles() {
  syncInit();
  watch(PATH.scssFiles, series(scss));
  watch(PATH.htmlFiles, series(sync));
}

task('scss', series(scss, scssMin));
task('min', scssMin);
task('dev', scssDev);
task('comb', comb);
task('watch', watchFiles);
