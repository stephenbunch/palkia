import { matchFromPattern, recipeFromFactory, validateFactory } from './util';
import Registry from './Registry';
import Linker from './Linker';
import AmdResolver from './AmdResolver';
import CommonJsResolver from './CommonJsResolver';

export default class Kernel {
  constructor() {
    this._registry = new Registry();
    this._linker = new Linker();
    this._linker.delegate = this._registry;
    this._registry.delegate = this._linker;
  }

  /**
   * @param {Object} [options]
   * @returns {Kernel}
   */
  useModules( options ) {
    options = options || {};
    var resolver;
    if ( typeof define === 'function' && define.amd ) {
      resolver = new AmdResolver( options.requireContext || global.requirejs );
      this._registry.asyncResolvers.push( name => resolver.resolveAsync( name ) );
    } else if ( typeof exports === 'object' ) {
      resolver = new CommonJsResolver( options.baseDir );
      this._registry.resolvers.push( name => resolver.resolve( name ) );
    }
    return this;
  }

  /**
   * @param {Boolean} [enable]
   * @returns {Kernel}
   */
  returnNullOnMissing( enable = true ) {
    this._registry.nullOnMissing = enable;
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
    return this._linker.factoryFromRecipe(
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
    return this._linker.factoryFromRecipeAsync(
      this._recipeFromArgs( name, target, locals )
    );
  }

  /**
   * @param {String} name
   * @returns {Function}
   */
  factoryFor( name ) {
    return this.factoryFrom([ name, dep => dep ])
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
    this._registry.factories[ name ] = factory;
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
    this._registry.factories[ name ] = () => {
      if ( instance === undefined ) {
        instance = this.factoryFrom( factory )();
      }
      return instance;
    };
  }

  /**
   * Unregisters a service.
   * @param {String} name
   */
  unregister( name ) {
    delete this._registry.factories[ name ];
  }

  /**
   * Registers a redirect handler.
   * @param {Pattern} pattern
   * @param {RedirectHandler} handler
   */
  redirect( pattern, handler ) {
    var match = matchFromPattern( pattern );
    this._registry.redirects.push( function( name, target ) {
      if ( match( name ) ) {
        return handler( name, target );
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
    this._registry.resolvers.push( function( name, target ) {
      if ( match( name ) ) {
        return handler( name, target );
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
    this._registry.asyncResolvers.push( function( name, target ) {
      return Promise.resolve().then( () => {
        if ( match( name ) ) {
          return handler( name, target );
        }
      });
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
    if ( typeof name !== 'string' ) {
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