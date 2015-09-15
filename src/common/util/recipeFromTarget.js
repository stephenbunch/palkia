import Recipe from '../Recipe';

/**
 * @param {Target} target
 * @returns {Recipe}
 */
export default function( target ) {
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
