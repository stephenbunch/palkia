/**
 * @param {MatchParams} match
 * @returns {Boolean}
 */
export default function( match ) {
  var elem = document.createElement( 'div' );
  elem.style.position = 'absolute';
  elem.style.top = '0';
  elem.style.left = '-9999px';
  match.classList.forEach( className => elem.classList.add( className ) );
  document.body.appendChild( elem );
  var style = window.getComputedStyle( elem );
  var result = true;
  for ( let prop in match.props ) {
    if ( style.getPropertyValue( prop ) !== match.props[ prop ] ) {
      result = false;
      break;
    }
  }
  document.body.removeChild( elem );
  return result;
};
