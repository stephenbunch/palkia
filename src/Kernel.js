import { matchFromPattern, recipeFromFactory, validateFactory } from './util';
import Registry from './Registry';
import Linker from './Linker';
import AmdResolver from './AmdResolver';
import CommonJsResolver from './CommonJsResolver';
import LazyResolver from './LazyResolver';

export default class Kernel {
  constructor() {
    this.registry = new Registry();
    this.linker = new Linker();
    this.linker.delegate = this.registry;
    this.registry.resolvers.push( new LazyResolver( this ) );
  }

  /**
   * @param {Object} [options]
   * @returns {Kernel}
   */
  useModules( options ) {
    options = options || {};
    if ( typeof define === 'function' && define.amd ) {
      this.registry.asyncResolvers.push(
        new AmdResolver( options.requireContext || global.requirejs )
      );
    } else if ( typeof exports === 'object' ) {
      this.registry.resolvers.push(
        new CommonJsResolver( options.baseDir )
      );
    }
    return this;
  }

  /**
   * @param {Boolean} [enable]
   * @returns {Kernel}
   */
  returnNullOnMissing( enable = true ) {
    this.registry.nullOnMissing = enable;
    return this;
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
   * @param {String} [name] Optional name of the target.
   * @param {Factory} target
   * @param {Object.<String, *>} [locals]
   * @returns {*}
   */
  invoke( name, target, locals ) {
    return this.factoryFrom( name, target, locals )();
  }

  /**
   * @param {String} [name] Optional name of the target.
   * @param {Factory} target
   * @param {Object.<String, *>} [locals]
   * @returns {Promise}
   */
  invokeAsync( name, target, locals ) {
    return this.factoryFromAsync( name, target, locals )
      .then( factory => factory() );
  }

  /**
   * @param {String} [name] Optional name of the target.
   * @param {Factory} target
   * @param {Object.<String, *>} [locals]
   * @returns {Function}
   */
  factoryFrom( name, target, locals ) {
    return this.linker.factoryFromRecipe(
      this._recipeFromArgs( name, target, locals )
    );
  }

  /**
   * @param {String} [name] Optional name of the target.
   * @param {Factory} target
   * @param {Object.<String, *>} [locals]
   * @returns {Promise.<Function>}
   */
  factoryFromAsync( name, target, locals ) {
    return this.linker.factoryFromRecipeAsync(
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
   * @param {Factory} factory
   */
  registerFactory( name, factory ) {
    validateFactory( factory );
    this.registry.factories[ name ] = factory;
  }

  /**
   * Registers a factory with the kernel who's value will be cached for all
   * future requests.
   * @param {String} name
   * @param {Factory} factory
   */
  registerFactoryAsSingleton( name, factory ) {
    validateFactory( factory );
    var instance;
    var recipe = recipeFromFactory( factory );
    this.registry.factories[ name ] = recipe.ingredients.concat( ( ...args ) => {
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
    this.registry.redirects.push({
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
    this.registry.resolvers.push({
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
    this.registry.asyncResolvers.push({
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
    this.registry.resolvers.push({
      resolve( name ) {
        if ( match( name ) ) {
          return kernel.factoryFor( name );
        }
      }
    });
    this.registry.asyncResolvers.push({
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
    var match = matchFromPattern( new RegExp( `^${ namespace }` ) );
    this.registry.resolvers.push({
      resolve( name ) {
        if ( match( name ) ) {
          return kernel.factoryFor( name.substr( namespace.length ) );
        }
      }
    });
    this.registry.asyncResolvers.push({
      resolveAsync( name ) {
        return Promise.resolve().then( () => {
          if ( match( name ) ) {
            return kernel.factoryForAsync( name.substr( namespace.length ) );
          }
        });
      }
    });
  }

  /**
   * @param {String} [name] Optional name of the target.
   * @param {Factory} target
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
    var recipe = recipeFromFactory( target );
    recipe.name = name || null;
    recipe.ingredients = recipe.ingredients.map( x => {
      if ( locals[ x ] ) {
        return () => locals[ x ]
      };
      return x;
    });
    return recipe;
  }
};
