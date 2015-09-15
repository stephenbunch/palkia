/**
 * @param {String} name
 * @returns {Boolean}
 */
export default function( name, testString ) {
  var elem = document.createElement( 'div' );
  var text = document.createTextNode( testString || 'BESbswy' );
  elem.appendChild( text );
  elem.style.position = 'absolute';
  elem.style.top = '0';
  elem.style.left = '-9999px';
  elem.style.fontFamily = 'monospace';
  elem.style.fontSize = '72px';
  document.body.appendChild( elem );
  var width1 = elem.offsetWidth;
  elem.style.fontFamily = `'${ name }', monospace`;
  var width2 = elem.offsetWidth;
  document.body.removeChild( elem );
  return width1 !== width2;
};
