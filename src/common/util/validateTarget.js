/**
 * @param {Target} target
 */
export default function( target ) {
  if ( typeof target !== 'function' ) {
    if ( !Array.isArray( target ) ) {
      throw new Error( 'Expected target to be an array or function.' );
    }
    if ( typeof target[ target.length - 1 ] !== 'function' ) {
      throw new Error( 'The last element of an array target should be a function.' );
    }
  }
};
