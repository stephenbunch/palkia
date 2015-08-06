export default class OptionalResolver {
  constructor( kernel ) {
    this.kernel = kernel;
    this.pattern = /\?$/;
  }

  /**
   * @param {String} name
   */
  resolve( name, _, locals ) {
    if ( this.pattern.test( name ) ) {
      name = name.substr( 0, name.length - 1 );
      if (
        typeof locals === 'object' &&
        locals !== null &&
        locals[ name ] !== undefined
      ) {
        return () => locals[ name ];
      } else if ( this.kernel.isNameRegistered( name ) ) {
        return this.kernel.factoryFor( name );
      } else {
        return () => undefined;
      }
    }
  }
};
