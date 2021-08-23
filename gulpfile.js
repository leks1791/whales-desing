const { src, dest, watch, parallel, series } = require('gulp')
const concat = require('gulp-concat')
const scss = require('gulp-sass')
const browserSync = require('browser-sync').create()
const uglify = require('gulp-uglify-es').default
const autoprefixer = require('gulp-autoprefixer')
const imagemin = require('gulp-imagemin')
const del = require('del')

function images() {
   return src('src/img/**/*')
      .pipe(imagemin([
         imagemin.gifsicle({ interlaced: true }),
         imagemin.mozjpeg({ quality: 75, progressive: true }),
         imagemin.optipng({ optimizationLevel: 5 }),
         imagemin.svgo({
            plugins: [
               { removeViewBox: true },
               { cleanupIDs: false }
            ]
         })
      ]))
      .pipe(dest('dist/img'))
}

function cleanDist() {
   return del('dist')
}

function scripts() {
   return src([
      'src/js/main.js'
   ])
      .pipe(concat('main.min.js'))
      .pipe(uglify())
      .pipe(dest('src/js'))
      .pipe(browserSync.stream())
}

function browsersync() {
   browserSync.init({
      server: {
         baseDir: 'src/'
      }
   });
}

function styles() {
   return src('src/scss/style.sass')
      .pipe(scss({ outputStyle: 'compressed' }))
      .pipe(concat('style.min.css'))
      .pipe(autoprefixer({
         overrideBrowserslist: ['last 10 version']
      }))
      .pipe(dest('src/css'))
      .pipe(browserSync.stream())
}
function build() {
   return src([
      'src/css/style.min.css',
      'src/fonts/**/*',
      'src/js/main.min.js',
      'src/*.html'
   ], { base: 'src' })
      .pipe(dest('dist'))
}

function watching() {
   watch(['src/scss/**/*.sass'], styles)
   watch(['src/js/**/*.js', '!src/js/main.min.js'], scripts)
   watch("src/*.html").on('change', browserSync.reload)
}

exports.styles = styles
exports.watching = watching
exports.browsersync = browsersync
exports.scripts = scripts
exports.images = images
exports.cleanDist = cleanDist

exports.build = series(cleanDist, images, build)
exports.default = parallel(styles, scripts, browsersync, watching)