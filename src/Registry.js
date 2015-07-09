import Recipe from './Recipe';
import {
  recipeFromFactory,
  when,
  distinct,
  validateFactory
} from './util';
import ServiceNotFoundError from './ServiceNotFoundError';
import InvalidOperationError from './InvalidOperationError';

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
   * @param {String} [target]
   * @returns {Recipe}
   */
  recipeForName( name, target ) {
    return this._recipeFromFactory(
      name,
      this._locateFactory( name, target )
    );
  }

  /**
   * @param {Array.<String>} names
   * @param {String} [target]
   * @returns {Promise.<Object.<String, Recipe>>}
   */
  recipesByNameAsync( names, target ) {
    names = distinct( names );
    return when(
      names.map( name => this._locateFactoryAsync( name, target ) )
    ).then( factories => {
      var recipes = {};
      for ( let i = 0; i < names.length; i++ ) {
        let name = names[ i ];
        recipes[ name ] = this._recipeFromFactory( name, factories[ i ] );
      }
      return recipes;
    });
  }

  /**
   * @param {String} name
   * @param {String} [target]
   * @returns {String}
   */
  resolveName( name, target ) {
    var initial = name;
    var history = [];
    while ( true ) {
      if ( history.indexOf( name ) > -1 ) {
        throw new InvalidOperationError( `Redirect loop encountered while resolving '${ initial }' for '${ target || '' }'` );
      } else {
        history.push( name );
      }
      let result = this.redirects.reduce(
        ( acc, handler ) => acc || handler.redirect( name, target ),
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
    if ( this.factories[ name ] ) {
      return this.factories[ name ];
    }
    var factory = this.resolvers.reduce( ( factory, handler ) => {
      return factory || handler.resolve( name, target );
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
      try {
        // Search synchronous resolvers first.
        return this._locateFactory( name, target );
      } catch ( err ) {
        return (
          function next() {
            var resolver = resolvers.shift();
            if ( resolver ) {
              return resolver.resolveAsync( name, target ).then( factory => {
                return factory || next();
              });
            }
          }
        ).call( this );
      }
    }).then( factory => {
      if ( factory ) {
        validateFactory( factory );
        return factory;
      }
      return this._locateFactory( name, target );
    });
  }
};
