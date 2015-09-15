/**
 * @param {String} url
 * @param {Function} success
 */
export default function( url, success ) {
  var link = document.createElement( 'link' );
  link.href = url;
  link.rel = 'stylesheet';
  link.type = 'text/css';
  link.onload = () => {
    link.onload = null;
    success();
  };
  document.head.appendChild( link );
};
