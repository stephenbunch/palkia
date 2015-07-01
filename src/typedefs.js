/**
 * A string, regex, or matcher function to match on service names.
 * @typedef {String|RegExp|Function} Pattern
 */

/**
 * A function to be invoked, or an array where the last element is a function
 * and the rest of the elements are the names of dependencies to be injected.
 * If target is a function, the $inject property may also be used. See
 * https://docs.angularjs.org/api/auto/service/$injector
 * @typedef {Array|Function} Factory
 */

/**
 * @typedef ResolveHandler
 * @property {ResolveFunction} resolve
 */

/**
 * @typedef AsyncResolveHandler
 * @property {AsyncResolveFunction} resolveAsync
 */

/**
 * @typedef RedirectHandler
 * @property {RedirectFunction} redirect
 */

/**
 * @callback ResolveFunction
 * @param {String} name
 * @param {String} [target] The name of the target being resolved for.
 * @returns {Factory|undefined}
 */

/**
 * @callback AsyncResolveFunction
 * @param {String} name
 * @param {String} [target] The name of the target being resolved for.
 * @returns {Promise.<Factory|undefined>}
 */

/**
 * @callback RedirectFunction
 * @param {String} name
 * @param {String} [target] The name of the target being resolved for.
 * @returns {String|undefined}
 */

/**
 * @typedef {Object} LinkerDelegate
 * @property {Function} recipeForName
 * @property {Function} recipesByNameAsync
 */
