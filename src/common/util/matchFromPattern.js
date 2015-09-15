/**
 * @param {Pattern} pattern
 * @returns {Function}
 */
export default function( pattern ) {
  if ( typeof pattern === 'function' ) {
    return pattern;
  }
  if ( typeof pattern === 'string' ) {
    return value => value === pattern;
  }
  return value => pattern.test( value );
};
