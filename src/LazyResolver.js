export default class LazyResolver {
  constructor( kernel ) {
    this.kernel = kernel;
    this.pattern = /\.\.\.$/;
  }

  /**
   * @param {String} name
   * @param {NamedNode} [namedNode]
   */
  resolve( name, namedNode ) {
    if ( this.pattern.test( name ) ) {
      name = name.substr( 0, name.length - 3 );
      var promise;
      return () => {
        if ( !promise ) {
          promise = Promise.resolve();
          let promise2;
          // Only resolve things once the promise is awaited on.
          promise.then = ( ...args ) => {
            if ( !promise2 ) {
              // Make sure we only resolve this once no matter how many times
              // the promise is awaited on.
              promise2 = Promise.resolve().then( () => {
                var target = [ name, dep => dep ];
                if ( namedNode && namedNode.isChildNode ) {
                  return this.kernel.invokeAsChildAsync( namedNode.name, target );
                } else {
                  return this.kernel.invokeAsync( target );
                }
              });
            }
            return promise2.then.apply( promise2, args );
          };
        }
        return promise;
      };
    }
  }
};
