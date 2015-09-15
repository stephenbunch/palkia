/**
 * @param {String} family
 * @returns {String|null}
 */
export default function( family ) {
  var link = document.querySelector( `link[href$="${ family }"]` );
  return link && link.href;
};
