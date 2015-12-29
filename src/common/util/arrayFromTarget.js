export default function( target ) {
  var deps;
  if ( typeof target === 'function' ) {
    deps = target.$inject || [];
  } else {
    deps = target.slice();
    target = deps.pop();
  }
  return deps.concat([ target ]);
};
