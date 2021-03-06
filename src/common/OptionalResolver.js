export default class OptionalResolver {
  constructor( kernel ) {
    this.kernel = kernel;
    this.pattern = /\?$/;
  }

  /**
   * @param {String} name
   */
  resolve( name ) {
    if ( this.pattern.test( name ) ) {
      name = name.substr( 0, name.length - 1 );
      if ( this.kernel.targetForName( name ) ) {
        return this.kernel.factoryFor( name );
      } else {
        return () => undefined;
      }
    }
  }

  resolveAsync( name ) {
    if ( this.pattern.test( name ) ) {
      name = name.substr( 0, name.length - 1 );
      if ( this.kernel.asyncTargetForName( name ) ) {
        return this.kernel.factoryForAsync( name );
      } else {
        return Promise.resolve( () => undefined );
      }
    } else {
      return Promise.resolve();
    }
  }
};
