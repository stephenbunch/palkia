export default class AmdResolver {
  constructor( requireContext ) {
    this.requireContext = requireContext;
  }

  /**
   * @param {String} name
   */
  resolveAsync( name ) {
    return new Promise( ( resolve, reject ) => {
      this.requireContext( [ name ], resolve, reject );
    });
  }
};
