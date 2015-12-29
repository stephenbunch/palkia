import Recipe from './Recipe';
import {
  recipeFromTarget,
  distinct,
  validateTarget
} from './util';
import ServiceNotFoundError from './ServiceNotFoundError';
import InvalidOperationError from './InvalidOperationError';

export default class Registry {
  constructor() {
    /**
     * @type {Object.<String, Target>}
     */
    this.targets = {};

    /**
     * @type {Object.<String, AsyncTarget>}
     */
    this.asyncTargets = {};

    /**
     * @type {Array.<ResolveHandler>}
     */
    this.resolvers = [];

    /**
     * @type {Array.<AsyncResolveHandler}
     */
    this.asyncResolvers = [];

    /**
     * @type {Array.<RedirectHandler}
     */
    this.redirects = [];
  }

  /**
   * @param {String} name
   * @param {NamedNode} [namedNode]
   * @returns {Recipe}
   */
  recipeForName( name, namedNode ) {
    return this._recipeFromTarget(
      name,
      this._locateTarget( name, namedNode )
    );
  }

  /**
   * @param {Array.<String>} names
   * @param {NamedNode} [namedNode]
   * @returns {Promise.<Object.<String, Recipe>>}
   */
  recipesByNameAsync( names, namedNode ) {
    names = distinct( names );
    return Promise.all(
      names.map( name => this._locateTargetAsync( name, namedNode ) )
    ).then( targets => {
      var recipes = {};
      for ( let i = 0; i < names.length; i++ ) {
        let name = names[ i ];
        recipes[ name ] = this._recipeFromTarget( name, targets[ i ] );
      }
      return recipes;
    });
  }

  /**
   * @param {String} name
   * @param {NamedNode} [namedNode]
   * @returns {String}
   */
  resolveName( name, namedNode ) {
    var initial = name;
    var history = [];
    while ( true ) {
      if ( history.indexOf( name ) > -1 ) {
        throw new InvalidOperationError( `Redirect loop encountered while resolving '${ name }' for '${ initial }'` );
      } else {
        history.push( name );
      }
      let result = this.redirects.reduce(
        ( acc, handler ) => acc || handler.redirect( name, namedNode ),
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
   * the target.
   * @param {String} name
   * @param {Target} target
   * @returns {Recipe}
   */
  _recipeFromTarget( name, target ) {
    var { ingredients, create } = recipeFromTarget( target );
    return new Recipe({
      name: name,
      create: create,
      ingredients: ingredients
    });
  }

  /**
   * @param {String} name
   * @param {NamedNode} [namedNode]
   * @returns {Target}
   */
  _locateTarget( name, namedNode ) {
    if ( this.targets[ name ] ) {
      return this.targets[ name ];
    }
    var target = this.resolvers.reduce( ( target, handler ) => {
      return target || handler.resolve( name, namedNode );
    }, null );
    if ( target === undefined ) {
      let message = `Could not locate service '${ name }'`;
      if ( namedNode && namedNode.name ) {
        message += ` for '${ namedNode.name }'`;
      }
      throw new ServiceNotFoundError( message );
    } else {
      validateTarget( target );
    }
    return target;
  }

  /**
   * @param {String} name
   * @param {NamedNode} [namedNode]
   * @returns {Promise.<Target>}
   */
  _locateTargetAsync( name, namedNode ) {
    if ( this.asyncTargets[ name ] ) {
      return this.asyncTargets[ name ]();
    }
    if ( this.targets[ name ] ) {
      return this.targets[ name ];
    }
    var resolvers = this.asyncResolvers.slice();
    var next = () => {
      var resolver = resolvers.shift();
      if ( resolver ) {
        return resolver.resolveAsync( name, namedNode ).then( target => {
          return target || next();
        });
      }
    };
    return Promise.resolve().then( next ).then( target => {
      if ( target === undefined ) {
        return this._locateTarget( name, namedNode );
      } else {
        validateTarget( target );
      }
      return target;
    });
  }
};
