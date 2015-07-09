import Recipe from './Recipe';
import Component from './Component';
import { when, recipeFromFactory } from './util';
import InvalidOperationError from './InvalidOperationError';

export default class Linker {
  constructor() {
    /**
     * @type {LinkerDelegate}
     */
    this.delegate = null;
  }

  /**
   * @param {Recipe} recipe
   * @returns {Function}
   */
  factoryFromRecipe( recipe ) {
    var component = this._componentFromRecipe( recipe );
    var stack = [ component ];
    while ( stack.length > 0 ) {
      let component = stack.shift();
      component.recipe.ingredients.forEach( ( ingredient, index ) => {
        var recipe =
          typeof ingredient === 'string' ?
          this.delegate.recipeForName( ingredient, component.recipe.name ) :
          recipeFromFactory( ingredient );
        var child = this._makeChildComponent( component, recipe, index );
        stack.push( child );
      });
    }
    return this._factoryFromComponent( component );
  }

  /**
   * @param {Recipe} recipe
   * @returns {Promise.<Function>}
   */
  factoryFromRecipeAsync( recipe ) {
    return Promise.resolve().then( () => {
      var component = this._componentFromRecipe( recipe );
      var resolve = component => {
        return this.delegate.recipesByNameAsync(
          component.recipe.ingredients.filter( x => typeof x === 'string' ),
          component.recipe.name
        ).then( recipes => {
          return when(
            component.recipe.ingredients.map( ( ingredient, index ) => {
              var recipe =
                typeof ingredient === 'string' ?
                recipes[ ingredient ] :
                recipeFromFactory( ingredient );
              return this._makeChildComponent( component, recipe, index );
            }).map( resolve )
          );
        });
      };
      return resolve( component ).then( () => {
        return this._factoryFromComponent( component );
      });
    });
  }

  /**
   * @param {Component} component
   * @returns {Function}
   */
  _factoryFromComponent( component ) {
    var components = [];
    var stack = [ component ];
    while ( stack.length > 0 ) {
      let cmp = stack.shift();
      components.push( cmp );
      stack = stack.concat( cmp.children );
    }
    components.reverse().pop();

    return ( ...args ) => {
      var i = 0, len = components.length;
      for ( ; i < len; i++ ) {
        let cmp = components[ i ];
        cmp.parent.prep[ cmp.order ] = cmp.recipe.create.apply( undefined, cmp.prep );
        cmp.prep = [];
      }
      args = component.prep.concat( args );
      component.prep = [];
      return component.recipe.create.apply( undefined, args );
    };
  }

  /**
   * @param {Component} parent
   * @param {Recipe} recipe
   * @param {Number} position
   * @returns {Component}
   */
  _makeChildComponent( parent, recipe, position ) {
    var child = new Component( recipe );
    child.parent = parent;
    child.order = position;
    parent.children[ position ] = child;
    this._checkForCircularDependency( child );
    return child;
  }

  /**
   * @param {Component} component
   */
  _checkForCircularDependency( component ) {
    var node = component.parent;
    var last = component;
    while ( node ) {
      if ( node.recipe.name !== null && node.recipe.name === component.recipe.name ) {
        throw new InvalidOperationError( `Detected circular dependency to '${ component.recipe.name }' through '${ last.recipe.name }'.` );
      }
      last = node;
      node = node.parent;
    }
  }

  /**
   * @param {Recipe} recipe
   * @returns {Component}
   */
  _componentFromRecipe( recipe ) {
    var component = new Component( recipe );
    component.recipe.ingredients = component.recipe.ingredients.map( ingredient => {
      if ( typeof ingredient === 'string' ) {
        return this.delegate.resolveName( ingredient, component.recipe.name )
      } else {
        return ingredient;
      }
    });
    return component;
  }
}
