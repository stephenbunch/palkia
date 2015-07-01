import Recipe from './Recipe';

/**
 * @param {Pattern} pattern
 * @returns {Function}
 */
export function matchFromPattern( pattern ) {
  if ( typeof pattern === 'function' ) {
    return pattern;
  }
  if ( typeof pattern === 'string' ) {
    pattern = new RegExp( pattern.replace( '.', '\\.' ).replace( '*', '.*' ) );
  }
  return value => pattern.test( value );
};

/**
 * @param {Array.<Promise>} promises
 * @returns {Promise}
 */
export function when( promises ) {
  if ( promises.length === 0 ) {
    return Promise.resolve();
  }
  return new Promise( function( resolve, reject ) {
    var count = promises.length;
    var results = [];
    var signal = ( result, index ) => {
      results[ index ] = result;
      if ( --count === 0 ) {
        resolve( results );
      }
    };
    promises.forEach( ( promise, index ) => {
      promise.then( result => signal( result, index ), reject );
    });
  });
};

/**
 * @param {Factory} factory
 * @returns {Recipe}
 */
export function recipeFromFactory( factory ) {
  var deps;
  if ( typeof factory === 'function' ) {
    deps = factory.$inject || [];
  } else {
    deps = factory.slice();
    factory = deps.pop();
  }
  return new Recipe({
    create: factory,
    ingredients: deps
  });
};

/**
 * @param {Array} items
 * @returns {Array}
 */
export function distinct( items ) {
  return items.reduce( ( acc, item ) => {
    if ( acc.indexOf( item ) === -1 ) {
      return acc.concat( [ item ] );
    }
    return acc;
  }, [] );
};

/**
 * @param {Factory} factory
 */
export function validateFactory( factory ) {
  if ( typeof factory !== 'function' ) {
    if ( typeOf( factory ) !== 'array' ) {
      throw new Error( 'Expected factory to be an array or function.' );
    }
    if ( typeof factory[ factory.length - 1 ] !== 'function' ) {
      throw new Error( 'The last element of an array factory should be a function.' );
    }
  }
};

/**
 * Gets the internal JavaScript [[Class]] of an object.
 * http://perfectionkills.com/instanceof-considered-harmful-or-how-to-write-a-robust-isarray/
 * @param {*} object
 * @returns {String}
 */
export function typeOf( object ) {
  return Object.prototype.toString.call( object )
    .match( /^\[object\s(.*)\]$/ )[1].toLowerCase();
}

/**
 * Safely combines multiple path segments.
 * @param {...String} paths
 * @returns {String}
 */
export function pathCombine( ...paths ) {
  return paths.map( function( path, index ) {
    return index === 0 ? path.replace( /\/$/, '' ) : path.replace( /(^\/|\/$)/g, '' );
  }).join( '/' );
}
