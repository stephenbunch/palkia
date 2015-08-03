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
    return value => value === pattern;
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
 * @param {Target} target
 * @returns {Recipe}
 */
export function recipeFromTarget( target ) {
  var deps;
  if ( typeof target === 'function' ) {
    deps = target.$inject || [];
  } else {
    deps = target.slice();
    target = deps.pop();
  }
  return new Recipe({
    create: target,
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
 * @param {Target} target
 */
export function validateTarget( target ) {
  if ( typeof target !== 'function' ) {
    if ( typeOf( target ) !== 'array' ) {
      throw new Error( 'Expected target to be an array or function.' );
    }
    if ( typeof target[ target.length - 1 ] !== 'function' ) {
      throw new Error( 'The last element of an array target should be a function.' );
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
