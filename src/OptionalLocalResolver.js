export default class OptionalLocalResolver {
  constructor( kernel ) {
    this.kernel = kernel;
    this.pattern = /\?$/;
  }

  /**
   * @param {String} name
   * @param {Object} locals
   */
  resolve( name, locals ) {
    if ( this.pattern.test( name ) ) {
      name = name.substr( 0, name.length - 1 );
      return locals[ name ];
    }
  }
};
