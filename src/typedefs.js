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
 * @property {ResolveHandler.resolve} resolve
 */

/**
 * @typedef AsyncResolveHandler
 * @property {AsyncResolveHandler.resolveAsync} resolveAsync
 */

/**
 * @typedef RedirectHandler
 * @property {RedirectHandler.redirect} redirect
 */

/**
 * @name ResolveHandler.resolve
 * @function
 * @param {String} name
 * @param {String} [target] The name of the target being resolved for.
 * @returns {Factory|undefined}
 */

/**
 * @name AsyncResolveHandler.resolveAsync
 * @function
 * @param {String} name
 * @param {String} [target] The name of the target being resolved for.
 * @returns {Promise.<Factory|undefined>}
 */

/**
 * @name RedirectHandler.redirect
 * @function
 * @param {String} name
 * @param {String} [target] The name of the target being resolved for.
 * @returns {String|undefined}
 */

/**
 * @typedef {Object} LinkerDelegate
 * @property {LinkerDelegate.recipeForName} recipeForName
 * @property {LinkerDelegate.recipesByNameAsync} recipesByNameAsync
 * @property {LinkerDelegate.resolveName} resolveName
 */

/**
 * @name LinkerDelegate.recipeForName
 * @function
 * @param {String} name
 * @param {String} [target]
 * @returns {Recipe}
 */

/**
 * @name LinkerDelegate.recipesByNameAsync
 * @function
 * @param {Array.<String>} names
 * @param {String} [target]
 * @returns {Promise.<Object.<String, Recipe>>}
 */

/**
 * @name LinkerDelegate.resolveName
 * @function
 * @param {String} name
 * @returns {String}
 */
