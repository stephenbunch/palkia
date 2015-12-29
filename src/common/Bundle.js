import Kernel from './Kernel';
import arrayFromTarget from './util/arrayFromTarget';

export default class Bundle {
  constructor( name ) {
    this.name = name;
    this._kernel = new Kernel();
    this._modules = [];
  }

  get resolvers() {
    return this._kernel.resolvers;
  }

  get asyncResolvers() {
    return this._kernel.asyncResolvers;
  }

  get redirects() {
    return this._kernel.redirects;
  }

  get localResolvers() {
    return this._kernel.localResolvers;
  }

  listModules() {
    return this._modules.slice();
  }

  register( name, value ) {
    this._kernel.register( name, value );
  }

  registerFactory( name, factory ) {
    this._kernel.registerFactory( name, factory );
  }

  registerFactoryAsSingleton( name, factory ) {
    this._kernel.registerFactoryAsSingleton( name, factory );
  }

  registerAsyncFactoryAsSingleton( name, factory ) {
    this._kernel.registerAsyncFactoryAsSingleton( name, factory );
  }

  resolve( name ) {
    return this._kernel.resolve( name );
  }

  resolveAsync( name ) {
    return this._kernel.resolveAsync( name );
  }

  invoke( name, target, locals ) {
    return this._kernel.invoke( name, target, locals );
  }

  invokeAsync( name, target, locals ) {
    return this._kernel.invokeAsync( name, target, locals );
  }

  registerModules(
    modules,
    {
      ignore = [],
      asyncModules = false,
      namespace = '',
      transform = null,
      transformAsync = null
    } = {}
  ) {
    for ( let key in modules ) {

      // Skip ignored paths.
      let skip = false;
      for ( let path of ignore ) {
        if ( /\/$/.test( path ) ) {
          if ( key.startsWith( path ) ) {
            skip = true;
            break;
          }
        } else {
          if ( key === path ) {
            skip = true;
            break;
          }
        }
      }
      if ( skip ) {
        continue;
      }

      let segments = key.split( '/' );
      let fullName = namespace + key;
      let shortName = segments[ segments.length - 1 ];

      let factory = modules[ key ];

      let f = arrayFromTarget( modules[ key ] );
      let deps = f.slice( 0, f.length - 1 );
      f = f[ f.length - 1 ];

      if ( asyncModules ) {
        let t = transformAsync || transform;
        if ( t ) {
          factory = [ ...deps, ( ...args ) =>
            Promise.resolve()
              .then( () => f.apply( undefined, args ) )
              .then( instance => t({ name: key, instance }) )
          ];
        }
      } else if ( transform ) {
        factory = [ ...deps, ( ...args ) =>
          transform({
            name: key,
            instance: f.apply( undefined, args )
          })
        ]
      }

      try {
        if ( asyncModules ) {
          this._kernel.registerAsyncFactoryAsSingleton( fullName, factory );
        } else {
          this._kernel.registerFactoryAsSingleton( fullName, factory );
        }
      } catch( err ) {
        throw new Error( `Module registration failed for "${ key }" because [${ err.message }]` );
      }

      // Mimic the node convention where requiring a directory requires the
      // index file.
      if ( key.endsWith( '/index' ) ) {
        this._kernel.registerAlias( fullName.replace( /\/index$/, '' ), fullName );
      }

      // Modules that begin with '_' are treated as internal modules, meaning
      // they cannot be resolved from the kernel directly.

      // In other words, when we register a module that begins with '_' like
      // '_Foo', register an alias 'Foo' -> '_Foo', but only enable the alias
      // when the module is being resolved as a dependency of another module
      // within the kernel. This means when we try to do a
      // kernel.resolve( 'Foo' ), we get a ServiceNotFoundError, but if we have
      // a service 'Bar' that depends on 'Foo', the resolution works.

      if ( /^_/.test( shortName ) ) {
        let segs = segments.slice();
        segs.pop();
        segs.push( shortName.substr( 1 ) );
        let preferredName = namespace + segs.join( '/' );
        this._kernel.redirects.push({
          redirect( name, namedNode ) {
            if ( namedNode && namedNode.isChildNode && name === preferredName ) {
              return fullName;
            }
          }
        });
      }

      this._modules.push( fullName );
    }
  }

  /**
   * @param {String} fromNamespace
   * @param {Bundle} toBundle
   * @param {String} [toNamespace=""]
   */
  registerLink( fromNamespace, toBundle, toNamespace = '' ) {
    this._registerLink( fromNamespace, toBundle, toNamespace, false );
  }

  /**
   * @param {String} fromNamespace
   * @param {Bundle} toBundle
   * @param {String} [toNamespace=""]
   */
  registerInternalLink( fromNamespace, toBundle, toNamespace = '' ) {
    this._registerLink( fromNamespace, toBundle, toNamespace, true );
  }

  /**
   * @param {String} name
   * @param {Bundle} toBundle
   * @param {String} [toName]
   */
  delegate( name, toBundle, toName ) {
    this._delegate( name, toBundle, toName || name, false );
  }

  /**
   * @param {String} name
   * @param {Bundle} toBundle
   * @param {String} [toName]
   */
  delegateInternal( name, toBundle, toName ) {
    this._delegate( name, toBundle, toName || name, true );
  }

  registerResolver( resolver, isInternal ) {
    this.resolvers.push({
      resolve: ( name, namedNode ) => {
        if ( !isInternal || namedNode && namedNode.isChildNode ) {
          return resolver.resolve( name, namedNode );
        }
      }
    });
  }

  registerAsyncResolver( resolver, isInternal ) {
    this.asyncResolvers.push({
      resolveAsync: async ( name, namedNode ) => {
        if ( !isInternal || namedNode && namedNode.isChildNode ) {
          return resolver.resolveAsync( name, namedNode );
        }
      }
    });
  }

  /**
   * @param {String} fromNamespace
   * @param {Bundle} toBundle
   * @param {String} toNamespace
   * @param {Boolean} isInternal
   */
  _registerLink( fromNamespace, toBundle, toNamespace, isInternal ) {
    this.registerResolver({
      resolve: ( name ) => {
        if ( name.startsWith( fromNamespace ) ) {
          return toBundle._kernel.factoryFor(
            toNamespace +
            name.substr( fromNamespace.length )
          );
        }
      }
    }, isInternal );
    this.registerAsyncResolver({
      resolveAsync: async ( name ) => {
        if ( name.startsWith( fromNamespace ) ) {
          return toBundle._kernel.factoryForAsync(
            toNamespace +
            name.substr( fromNamespace.length )
          );
        }
      }
    }, isInternal );
  }

  /**
   * @param {String} name
   * @param {Bundle} toBundle
   * @param {String} toName
   * @param {Boolean} isInternal
   */
  _delegate( name, toBundle, toName, isInternal ) {
    var key = `_${ name }`;
    this._kernel.registerFactory( name, [ key, x => x ] );
    this.registerResolver({
      resolve: ( target ) => {
        if ( key === target ) {
          return toBundle._kernel.factoryFor( toName );
        }
      }
    }, isInternal );
    this.registerAsyncResolver({
      resolveAsync: async ( target ) => {
        if ( key === target ) {
          return toBundle._kernel.factoryForAsync( toName );
        }
      }
    });
  }
};
