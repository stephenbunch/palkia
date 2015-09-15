/**
 * Safely combines multiple path segments.
 * @param {...String} paths
 * @returns {String}
 */
export default function( ...paths ) {
  return paths.map( function( path, index ) {
    return index === 0 ? path.replace( /\/$/, '' ) : path.replace( /(^\/|\/$)/g, '' );
  }).join( '/' );
};
