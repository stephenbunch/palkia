/**
 * A string, regex, or matcher function to match on service names.
 * @typedef {String|RegExp|Function} Pattern
 */

/**
 * A function to be invoked, or an array where the last element is a function
 * and the rest of the elements are the names of dependencies to be injected.
 * @typedef {Array.<String|Target|Function>|Function} Target
 */

/**
 * @name AsyncTarget
 * @function
 * @returns {Promise.<Target>}
 */

/**
 * An async function to be invoked, or an array where the last element is an
 * async function and the rest of the elements are the names of dependencies to
 * be injected.
 * @typedef {Array.<String|Target|Function>|Function} AsyncFactory
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
 * @param {NamedNode} [namedNode]
 * @returns {Target|undefined}
 */

/**
 * @typedef NamedNode
 * @property {String} name
 * @property {Boolean} isChildNode
 */

/**
 * @name AsyncResolveHandler.resolveAsync
 * @function
 * @param {String} name
 * @param {NamedNode} [namedNode]
 * @returns {Promise.<Target|undefined>}
 */

/**
 * @name RedirectHandler.redirect
 * @function
 * @param {String} name
 * @param {NamedNode} [namedNode]
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
 * @param {NamedNode} [namedNode]
 * @returns {Recipe}
 */

/**
 * @name LinkerDelegate.recipesByNameAsync
 * @function
 * @param {Array.<String>} names
 * @param {NamedNode} [namedNode]
 * @returns {Promise.<Object.<String, Recipe>>}
 */

/**
 * @name LinkerDelegate.resolveName
 * @function
 * @param {String} name
 * @param {NamedNode} [namedNode]
 * @returns {String}
 */
