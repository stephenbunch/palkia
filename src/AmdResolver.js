export default class AmdResolver {
  constructor( requireContext ) {
    this.requireContext = requireContext;
  }

  resolveAsync( name ) {
    return new Promise( ( resolve, reject ) => {
      this.requireContext( [ name ], resolve, reject );
    });
  }
};
