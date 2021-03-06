require( 'babel-polyfill' );

var gulp = require( 'gulp' );
var arceus = require( 'arceus' );

gulp.task( 'make', function() {
  return arceus.js.babelify({
    source: 'src/**/*',
    outdir: 'dist'
  });
});

gulp.task( 'clean', function() {
  return arceus.util.deleteAsync( 'dist' );
});

gulp.task( 'test:node', function() {
  return arceus.test.nodeAsync( 'test/**/*.spec.js' );
});

gulp.task( 'test:browser', function() {
  return arceus.test.karmaAsync( 'test/**/*.spec.js', {
    browsers: [ 'PhantomJS' ]
  });
});

gulp.task( 'test', [ 'test:node', 'test:browser' ] );

gulp.task( 'watch', function() {
  arceus.js.babelifyWatch({
    source: 'src/**/*',
    outdir: 'dist',
    callback() {
      arceus.util.log( 'build succeeded' );
    }
  });
});

gulp.task( 'bundle', function() {
  return arceus.js.bundle({
    entry: 'src/browser/index.js',
    outfile: 'bundle/palkia.js',
    config: {
      browserify: {
        standalone: 'Palkia'
      }
    }
  });
});

gulp.task( 'default', function() {
  return arceus.util.gulpAsync( gulp, 'clean', 'make', 'bundle' );
});
