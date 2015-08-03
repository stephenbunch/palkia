import { matchFromPattern, recipeFromTarget, validateTarget } from './util';
import Registry from './Registry';
import Linker from './Linker';
import AmdResolver from './AmdResolver';
import CommonJsResolver from './CommonJsResolver';
import LazyResolver from './LazyResolver';
import Recipe from './Recipe';

export default class Kernel {
  constructor() {
    this._registry = new Registry();
    this._linker = new Linker();
    this._linker.delegate = this._registry;
    this._registry.resolvers.push( new LazyResolver( this ) );
  }

  /**
   * @returns {Array.<ResolveHandler>}
   */
  get resolvers() {
    return this._registry.resolvers;
  }

  /**
   * @param {Array.<ResolveHandler>} value
   */
  set resolvers( value ) {
    this._registry.resolvers = value;
  }

  /**
   * @returns {Array.<AsyncResolveHandler}
   */
  get asyncResolvers() {
    return this._registry.asyncResolvers;
  }

  /**
   * @param {Array.<AsyncResolveHandler} value
   */
  set asyncResolvers( value ) {
    this._registry.asyncResolvers = value;
  }

  /**
   * @returns {Array.<RedirectHandler}
   */
  get redirects() {
    return this._registry.redirects;
  }

  /**
   * @param {Array.<RedirectHandler} value
   */
  set redirects( value ) {
    this._registry.redirects = value;
  }

  /**
   * Resolves a named service.
   * @param {String} name
   * @returns {*}
   */
  resolve( name ) {
    return this.invoke([ name, dep => dep ]);
  }

  /**
   * Resolves a named service asynchronously.
   * @param {String} name
   * @returns {Promise}
   */
  resolveAsync( name ) {
    return this.invokeAsync([ name, dep => dep ]);
  }

  /**
   * Invokes a target, optionally specifying the name of the target.
   *
   * Targets can be named or unnamed. Targets can reference other targets by
   * name, registered or unregistered, and they can also contain inline targets.
   * When a target's dependency targets are resolved, its name is made available
   * to the dependency resolvers.
   *
   * @param {String} [name] Optional name of the target.
   * @param {Target} target
   * @param {Object.<String, *>} [locals]
   * @returns {*}
   */
  invoke( name, target, locals ) {
    return this.factoryFrom( name, target, locals )();
  }

  /**
   * Invokes the target as a child node.
   *
   * What is a child node? Let's say we have a target 'A' which has a dependency
   * 'B' which has its own dependency 'C'. The object graph would look like
   * this: A > B > C. In this case, A is the top level node while and B and C
   * are both child nodes. Defining this distinction between top level and child
   * allows us to write different rules for resolving each. For example, we
   * might want the ability to have private modules. With this distinction, we
   * can easily write a rule that says, "If module X is a top level node, hide
   * all resolutions whose names begin with an underscore (_)."
   *
   * Invoking a target as a child allows us to invoke B without having any
   * knowledge of A. In other words, it allows us to resolve a target as if it
   * were a child node rather than a top level node.
   *
   * @param {String} [name] Optional name of the target.
   * @param {Target} target
   * @param {Object.<String, *>} [locals]
   * @returns {*}
   */
  invokeAsChild( name, target, locals ) {
    var recipe = this._recipeFromArgs( name, target, locals );
    recipe = new Recipe({
      create: x => x,
      ingredients: [ recipe ]
    });
    return this._linker.factoryFromRecipe( recipe )();
  }

  /**
   * @param {String} [name] Optional name of the target.
   * @param {Target} target
   * @param {Object.<String, *>} [locals]
   * @returns {Promise.<*>}
   */
  invokeAsync( name, target, locals ) {
    return this.factoryFromAsync( name, target, locals )
      .then( factory => factory() );
  }

  /**
   * Invokes the target as a child node asynchronously.
   * @param {String} [name] Optional name of the target.
   * @param {Target} target
   * @param {Object.<String, *>} [locals]
   * @returns {Promise.<*>}
   */
  invokeAsChildAsync( name, target, locals ) {
    var recipe = this._recipeFromArgs( name, target, locals );
    recipe = new Recipe({
      create: x => x,
      ingredients: [ recipe ]
    });
    return this._linker.factoryFromRecipeAsync( recipe )
      .then( factory => factory() );
  }

  /**
   * @param {String} [name] Optional name of the target.
   * @param {Target} target
   * @param {Object.<String, *>} [locals]
   * @returns {Function}
   */
  factoryFrom( name, target, locals ) {
    return this._linker.factoryFromRecipe(
      this._recipeFromArgs( name, target, locals )
    );
  }

  /**
   * @param {String} [name] Optional name of the target.
   * @param {Target} target
   * @param {Object.<String, *>} [locals]
   * @returns {Promise.<Function>}
   */
  factoryFromAsync( name, target, locals ) {
    return this._linker.factoryFromRecipeAsync(
      this._recipeFromArgs( name, target, locals )
    );
  }

  /**
   * @param {String} name
   * @returns {Function}
   */
  factoryFor( name ) {
    return this.factoryFrom([ name, dep => dep ]);
  }

  /**
   * @param {String} name
   * @returns {Promise.<Function>}
   */
  factoryForAsync( name ) {
    return this.factoryFromAsync([ name, dep => dep ]);
  }

  /**
   * Registers a value with the kernel.
   * @param {String} name
   * @param {*} value
   */
  register( name, value ) {
    this.registerFactory( name, () => value );
  }

  /**
   * Registers a factory with the kernel.
   * @param {String} name
   * @param {Target} factory
   */
  registerFactory( name, factory ) {
    validateTarget( factory );
    this._registry.targets[ name ] = factory;
  }

  /**
   * Registers a factory with the kernel who's value will be cached for all
   * future requests.
   * @param {String} name
   * @param {Target} target
   */
  registerFactoryAsSingleton( name, factory ) {
    validateTarget( factory );
    var instance;
    var recipe = recipeFromTarget( factory );
    this._registry.targets[ name ] = recipe.ingredients.concat( ( ...args ) => {
      if ( instance === undefined ) {
        instance = recipe.create.apply( undefined, args );
      }
      return instance;
    });
  }

  /**
   * Registers an alias.
   * @param {String} name
   * @param {String} originalName
   */
  registerAlias( aliasName, originalName ) {
    this.redirect( aliasName, () => originalName );
  }

  /**
   * Registers a redirect handler.
   * @param {Pattern} pattern
   * @param {RedirectHandler} handler
   */
  redirect( pattern, handler ) {
    var match = matchFromPattern( pattern );
    this._registry.redirects.push({
      redirect( name, target ) {
        if ( match( name ) ) {
          return handler( name, target );
        }
      }
    });
  }

  /**
   * Registers a resolver.
   * @param {Pattern} pattern
   * @param {ResolveHandler} handler
   */
  delegate( pattern, handler ) {
    var match = matchFromPattern( pattern );
    this._registry.resolvers.push({
      resolve( name, target ) {
        if ( match( name ) ) {
          return handler( name, target );
        }
      }
    });
  }

  /**
   * Registers an async resolver.
   * @param {Pattern} pattern
   * @param {AsyncResolveHandler} handler
   */
  delegateAsync( pattern, handler ) {
    var match = matchFromPattern( pattern );
    this._registry.asyncResolvers.push({
      resolveAsync( name, target ) {
        return Promise.resolve().then( () => {
          if ( match( name ) ) {
            return handler( name, target );
          }
        });
      }
    });
  }

  /**
   * Registers another kernel to provide resolutions.
   * @param {Pattern} pattern
   * @param {Kernel} kernel
   */
  delegateTo( pattern, kernel ) {
    var match = matchFromPattern( pattern );
    this._registry.resolvers.push({
      resolve( name ) {
        if ( match( name ) ) {
          return kernel.factoryFor( name );
        }
      }
    });
    this._registry.asyncResolvers.push({
      resolveAsync( name ) {
        return Promise.resolve().then( () => {
          if ( match( name ) ) {
            return kernel.factoryForAsync( name );
          }
        });
      }
    });
  }

  /**
   * Registers another kernel to provide resolutions for the specified
   * namespace.
   * @param {String} namespace
   * @param {Kernel} kernel
   */
  delegateNamespace( namespace, kernel ) {
    this._registry.resolvers.push({
      resolve( name ) {
        if ( name.startsWith( namespace ) ) {
          return kernel.factoryFor( name.substr( namespace.length ) );
        }
      }
    });
    this._registry.asyncResolvers.push({
      resolveAsync( name ) {
        return Promise.resolve().then( () => {
          if ( name.startsWith( namespace ) ) {
            return kernel.factoryForAsync( name.substr( namespace.length ) );
          }
        });
      }
    });
  }

  /**
   * @param {String} name
   * @returns {Target|undefined}
   */
  targetFromName( name ) {
    return this._registry.targets[ name ];
  }

  /**
   * @param {String} [name] Optional name of the parent node.
   * @param {Target} target
   * @param {Object.<String, *>} [locals]
   *   If present, dependencies are read from this object first before the
   *   kernel is consulted.
   * @returns {Recipe}
   */
  _recipeFromArgs( name, target, locals ) {
    if ( name && typeof name !== 'string' ) {
      locals = target;
      target = name;
      name = null;
    }
    locals = locals || {};
    var recipe = recipeFromTarget( target );
    recipe.name = name || recipe.name;
    recipe.ingredients = recipe.ingredients.map( x => {
      if ( locals[ x ] ) {
        return () => locals[ x ]
      };
      return x;
    });
    return recipe;
  }
};
