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

 /**
  * @typedef {Object} RegisteryDelegate
  * @property {Function} factoryFromRecipeAsync
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

    /**
     * @type {RegisteryDelegate}
     */
    this.delegate = null;
  }

  /**
   * @param {String} name
   * @param {String|null} target
   * @returns {Recipe}
   */
  recipeForName( name, target ) {
    name = this._resolveName( name, target );
    return this._recipeFromFactory(
      name,
      this._locateFactory( name, target )
    );
  }

  recipeForNameAsync( name, target ) {
    name = this._resolveName( name, target );
    return this._locateFactoryAsync( name, target ).then( factory => {
      return this._recipeFromFactory( name, factory );
    });
  }

  /**
   * @param {Array.<String>} names
   * @param {String|null} target
   * @returns {Promise.<Object.<String, Recipe>>}
   */
  recipesByNameAsync( names, target ) {
    names = distinct( names ).map( name => {
      return this._resolveName( name, target );
    });
    return when(
      names.map( name => this._locateFactoryAsync( name, target ) )
    ).then( factories => {
      var recipes = {};
      for ( let i = 0; i < names.length; i++ ) {
        recipes = this._recipeFromFactory( name, factories[ i ] );
      }
      return recipes;
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
   * Returns a new recipe by combining the first recipe with the details from
   * the factory.
   * @param {String} name
   * @param {Factory} factory
   * @returns {Recipe}
   */
  _recipeFromFactory( name, factory ) {
    var { ingredients, create } = recipeFromFactory( factory );
    return new Recipe({
      name: name,
      create: create,
      ingredients: ingredients
    });
  }

  /**
   * @param {String} name
   * @param {String|null} target
   * @returns {Factory}
   */
  _locateFactory( name, target ) {
    if ( this._isLazy( name ) ) {
      return this._factoryForLazy( name, target );
    }
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
    if ( this._isLazy( name ) ) {
      return Promise.resolve( this._factoryForLazy( name, target ) );
    }
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

  /**
   * @param {String} name
   * @returns {Boolean}
   */
  _isLazy( name ) {
    return /\.\.\.$/.test( name );
  }

  /**
   * @param {String} name
   * @returns {Factory}
   */
  _factoryForLazy( name, target ) {
    name = name.substr( 0, name.length - 3 );
    return () => {
      // Only resolve things once the promise is awaited on.
      var promise = Promise.resolve();
      promise.then = ( ...args ) => {
        var promise = Promise.resolve()
          .then( () => this.recipeForNameAsync( name, target ) )
          .then( recipe => this.delegate.factoryFromRecipeAsync( recipe ) )
          .then( factory => factory() );
        return promise.then.apply( promise, args );
      };
      return promise;
    };
  }
};
