require( 'babel/register' )({
  stage: 0
});

var gulp = require( 'gulp' );
var arceus = require( 'arceus' );

gulp.task( 'make:src', function() {
  return arceus.js.babelify( 'src/**/*', 'dist' );
});

gulp.task( 'make', function() {
  return arceus.util.gulpAsync( gulp, 'clean', [ 'make:src' ] );
});

gulp.task( 'clean', function() {
  return arceus.util.deleteAsync( 'dist' );
});

gulp.task( 'test:node', function() {
  return arceus.test.nodeAsync( 'test/**/*.spec.js' );
});

gulp.task( 'test:browser', function() {
  return arceus.test.karmaAsync( 'test/**/*.spec.js' );
});

gulp.task( 'test', [ 'test:node', 'test:browser' ] );

gulp.task( 'watch', function() {
  arceus.util.watch( 'src/**/*', function() {
    arceus.util.gulpAsync( gulp, 'make:src' ).then( function() {
      return arceus.util.touchFileAsync( 'package.json' );
    }).catch( function( err ) {
      console.log( arceus.util.formatError( err ) );
    });
  });
});

gulp.task( 'default', function() {
  return arceus.util.gulpAsync( gulp, 'make' );
});
