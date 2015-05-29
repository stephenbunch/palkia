import Recipe from './Recipe';
import {
  recipeFromFactory,
  when,
  distinct,
  validateFactory
} from './util';
import ServiceNotFoundError from './ServiceNotFoundError';
import InvalidOperationError from './InvalidOperationError';

/**
 * @callback ResolveHandler
 * @param {String} name
 * @param {String} [target] The name of the target being resolved for.
 * @returns {Factory|undefined}
 */

 /**
  * @callback AsyncResolveHandler
  * @param {String} name
  * @param {String} [target] The name of the target being resolved for.
  * @returns {Promise.<Factory|undefined>}
  */

/**
 * @callback RedirectHandler
 * @param {String} name
 * @param {String} [target] The name of the target being resolved for.
 * @returns {String|undefined}
 */

export default class Registry {
  constructor() {
    /**
     * @type {Object.<String, Factory>}
     */
    this.factories = {};

    /**
     * @type {Array.<ResolveHandler>}
     */
    this.resolvers = [];

    /**
     * @type {Array.<RedirectHandler}
     */
    this.redirects = [];

    /**
     * @type {Array.<AsyncResolveHandler}
     */
    this.asyncResolvers = [];

    /**
     * @type {Boolean}
     */
    this.nullOnMissing = false;
  }

  /**
   * @param {String} name
   * @param {String|null} target
   * @returns {Recipe}
   */
  recipeForName( name, target ) {
    var recipe = this._recipeFromNameForTarget( name, target );
    return this._recipeFromFactory(
      recipe,
      this._locateFactory( recipe.name, target )
    );
  }

  /**
   * @param {Array.<String>} names
   * @param {String|null} target
   * @returns {Promise.<Object.<String, Recipe>>}
   */
  recipesByNameAsync( names, target ) {
    var recipes = distinct( names ).map( name => {
      return this._recipeFromNameForTarget( name, target );
    });
    return when(
      recipes.map( recipe => this._locateFactoryAsync( recipe.name, target ) )
    ).then( factories => {
      return recipes.reduce( ( result, recipe, index ) => {
        recipe = this._recipeFromFactory( recipe, factories[ index ] );
        result[ recipe.name ] = recipe;
        return result;
      }, {} );
    });
  }

  /**
   * @param {String} name
   * @param {String|null} target
   * @returns {String}
   */
  _resolveName( name, target ) {
    var initial = name;
    var history = [];
    while ( true ) {
      if ( history.indexOf( name ) > -1 ) {
        throw new InvalidOperationError( `Redirect loop encountered while resolving '${ initial }' for '${ target || '' }'` );
      } else {
        history.push( name );
      }
      let result = this.redirects.reduce(
        ( acc, handler ) => acc || handler( name, target ),
        null
      );
      if ( !result ) {
        return name;
      } else {
        name = result;
      }
    }
  }

  /**
   * @param {String} recipe
   * @param {String|null} target
   * @returns {Recipe}
   */
  _recipeFromNameForTarget( name, target ) {
    var recipe = new Recipe();
    if ( /\.\.\.$/.test( name ) ) {
      recipe.lazy = true;
      name = name.substr( 0, name.length - 3 );
    }
    recipe.name = this._resolveName( name, target );
    return recipe;
  }

  /**
   * Returns a new recipe by combining the first recipe with the details from
   * the factory.
   * @param {Recipe} recipe
   * @param {Factory} factory
   * @returns {Recipe}
   */
  _recipeFromFactory( recipe, factory ) {
    var { ingredients, create } = recipeFromFactory( factory );
    var { name, lazy } = recipe;
    return new Recipe({
      name: name,
      create: create,
      ingredients: ingredients,
      lazy: lazy
    });
  }

  /**
   * @param {String} name
   * @param {String|null} target
   * @returns {Factory}
   */
  _locateFactory( name, target ) {
    if ( this.factories[ name ] ) {
      return this.factories[ name ];
    }
    var factory = this.resolvers.reduce( ( factory, handler ) => {
      return factory || handler( name, target );
    }, null );
    if ( !factory ) {
      if ( this.nullOnMissing ) {
        factory = () => null;
      } else {
        throw new ServiceNotFoundError( `Could not locate service '${ name }' for '${ target || '' }'` );
      }
    } else {
      validateFactory( factory );
    }
    return factory;
  }

  /**
   * @param {String} name
   * @param {String|null} target
   * @returns {Promise.<Factory>}
   */
  _locateFactoryAsync( name, target ) {
    var resolvers = this.asyncResolvers.slice();
    return Promise.resolve().then( () => {
      return (
        function next() {
          var resolver = resolvers.shift();
          if ( resolver ) {
            return resolver( name, target ).then( factory => {
              return factory || next();
            });
          }
        }
      ).call( this );
    }).then( factory => {
      if ( factory ) {
        validateFactory( factory );
        return factory;
      }
      return this._locateFactory( name, target );
    });
  }
};
