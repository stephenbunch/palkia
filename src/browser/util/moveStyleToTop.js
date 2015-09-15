/**
 * Moves the stylesheet with the specified href to the top of the cascade.
 * @param {String} href
 * @param {Number} [order]
 */
export default function( href, order ) {
  order = order || 0;
  var style = queryFirst( `link[href='${ href }'][rel=stylesheet]` );
  style.setAttribute( 'data-order', order );
  if ( order === 0 ) {
    insertBefore( style, queryFirst( `link[rel=stylesheet]:not([href='${ href }'])` ) );
  } else {
    var stylesWithOrder = queryAll( `link[rel=stylesheet][data-order]:not([href='${ href }'])` );
    if ( stylesWithOrder.length > 0 ) {
      var stylesThatComeLater = filter(
        stylesWithOrder,
        x => parseInt( x.getAttribute( 'data-order' ), 10 ) > order
      );
      if ( stylesThatComeLater.length > 0 ) {
        insertBefore( style, first( stylesThatComeLater ) );
      } else {
        insertAfter( style, last( stylesWithOrder ) );
      }
    } else {
      insertBefore( style, queryFirst( `link[rel=stylesheet]:not([href='${ href }'])` ) );
    }
  }
};

/**
 * @param {Node} newNode
 * @param {Node} referenceNode
 */
function insertBefore( newNode, referenceNode ) {
  referenceNode.parentNode.insertBefore( newNode, referenceNode );
}

/**
 * @param {Node} newNode
 * @param {Node} referenceNode
 */
function insertAfter( newNode, referenceNode ) {
  referenceNode.parentNode.insertBefore( newNode, referenceNode.nextSibling );
}

/**
 * @param {Array} array
 * @returns {*}
 */
function first( array ) {
  return array[0];
}

/**
 * @param {Array} array
 * @returns {*}
 */
function last( array ) {
  return array[ array.length - 1 ];
}

/**
 * @param {ArrayLike} array
 * @returns {Array}
 */
function filter( array, callback ) {
  return Array.prototype.filter.call( array, callback );
}

/**
 * @param {String} selector
 * @returns {Element}
 */
function queryFirst( selector ) {
  return document.querySelector( selector );
}

/**
 * @param {String} selector
 * @returns {NodeList}
 */
function queryAll( selector ) {
  return document.querySelectorAll( selector );
}
