export default class LazyResolver {
  constructor( kernel ) {
    this.kernel = kernel;
    this.pattern = /\.\.\.$/;
  }

  resolve( name, target ) {
    if ( this.pattern.test( name ) ) {
      return () => {
        // Only resolve things once the promise is awaited on.
        var promise = Promise.resolve();
        promise.then = ( ...args ) => {
          name = name.substr( 0, name.length - 3 );
          var promise = Promise.resolve()
            .then( () => this.kernel.invokeAsync( target, [ name, dep => dep ] ) )
          return promise.then.apply( promise, args );
        };
        return promise;
      };
    }
  }
};
