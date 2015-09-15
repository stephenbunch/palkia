/**
 * @param {Array} items
 * @returns {Array}
 */
export default function( items ) {
  return items.reduce( ( acc, item ) => {
    if ( acc.indexOf( item ) === -1 ) {
      return acc.concat( [ item ] );
    }
    return acc;
  }, [] );
};
