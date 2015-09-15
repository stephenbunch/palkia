import {
  Kernel,
  ServiceNotFoundError,
  InvalidOperationError
} from '../src/node';

describe( 'Kernel', function() {
  describe( '.resolve( name )', function() {
    it( 'should resolve a service', function() {
      var kernel = new Kernel();
      kernel.register( 'foo', 2 );
      expect( kernel.resolve( 'foo' ) ).to.equal( 2 );
    });

    it( 'should throw an error if a service does not exist', function() {
      var kernel = new Kernel();
      expect( function() {
        kernel.resolve( 'foo' );
      }).to.throw( ServiceNotFoundError );
    });

    it( 'should throw an error if a service contains a circular dependency', function() {
      var kernel = new Kernel();
      kernel.registerFactory( 'foo', [ 'bar', () => {} ]);
      kernel.registerFactory( 'bar', [ 'foo', () => {} ]);
      expect( function() {
        kernel.resolve( 'foo' );
      }).to.throw( InvalidOperationError );
    });

    it( 'should maintain the parent node when using lazy resolution', async function() {
      var kernel = new Kernel();
      var handler = sinon.stub().returns( () => 2 );

      kernel.registerFactory( 'baz', [ 'qux', qux => qux ] );
      kernel.delegate( 'qux', handler );
      expect( kernel.resolve( 'baz' ) ).to.equal( 2 );
      expect( handler ).to.have.been.calledWith( 'qux', {
        name: 'baz',
        isChildNode: true
      });

      expect( kernel.resolve( 'qux' ) ).to.equal( 2 );
      expect( handler ).to.have.been.calledWith( 'qux', {
        name: null,
        isChildNode: false
      });

      kernel.registerFactory( 'foo', [ 'bar...', bar => bar ] );
      var lazyBar = kernel.resolve( 'foo' );
      kernel.delegateAsync( 'bar', handler );

      expect( await lazyBar ).to.equal( 2 );
      expect( handler ).to.have.been.calledWith( 'bar', {
        name: 'foo',
        isChildNode: true
      });

      lazyBar = kernel.resolve( 'bar...' );
      expect( await lazyBar ).to.equal( 2 );
      expect( handler ).to.have.been.calledWith( 'bar', {
        name: null,
        isChildNode: false
      });
    });
  });

  describe( '.registerFactory( name, factory )', function() {
    it( 'should take a function', function() {
      var kernel = new Kernel();
      kernel.registerFactory( 'foo', () => 2 );
      expect( kernel.resolve( 'foo' ) ).to.equal( 2 );
    });

    it( 'should take an array', function() {
      var kernel = new Kernel();
      kernel.register( 'bar', 2 );
      kernel.registerFactory( 'foo', [ 'bar', bar => bar * bar ]);
      expect( kernel.resolve( 'foo' ) ).to.equal( 4 );
    });

    it( 'should parse the $inject property on the function if it exists', function() {
      var kernel = new Kernel();
      kernel.register( 'bar', 2 );
      var factory = bar => bar * bar;
      factory.$inject = [ 'bar' ];
      kernel.registerFactory( 'foo', factory );
      expect( kernel.resolve( 'foo' ) ).to.equal( 4 );
    });
  });

  describe( '.registerFactoryAsSingleton( name, factory )', function() {
    it( 'should cache the returned value for all future requests', function() {
      var kernel = new Kernel();
      kernel.registerFactoryAsSingleton( 'foo', () => {
        return {};
      });
      expect( kernel.resolve( 'foo' ) ).to.equal( kernel.resolve( 'foo' ) );
    });

    it( 'should not defer dependency resolution', function() {
      var kernel = new Kernel();
      kernel.registerFactoryAsSingleton( 'foo', [ 'bar', bar => {
        return {};
      }]);
      var handler = sinon.stub().returns( () => 2 );
      kernel.delegate( 'bar', handler );
      var factory = kernel.factoryFor( 'foo' );
      expect( handler ).to.have.been.called;
      expect( factory() ).to.equal( factory() );
    });
  });

  describe( '.invoke( [name], target, [locals] )', function() {
    it( 'should run the target passing in any dependencies', function() {
      var kernel = new Kernel();
      kernel.register( 'foo', 2 );
      expect(
        kernel.invoke(
          [ 'foo', 'bar', ( foo, bar ) => foo + bar ],
          { bar: 3 }
        )
      ).to.equal( 5 );
    });
  });

  describe( '.factoryFor( name )', function() {
    it( 'should return a factory that resolves the specified service', function() {
      var kernel = new Kernel();
      kernel.register( 'foo', 2 );
      var factory = kernel.factoryFor( 'foo' );
      expect( factory() ).to.equal( 2 );
    });
  });

  describe( '.delegateNamespace', function() {
    it( 'should register a kernel to provide resolutions for the specified namespace', async function() {
      var a = new Kernel();
      var b = new Kernel();
      var syncHandler = sinon.stub().returns( () => 2 );
      var asyncHandler = sinon.stub().returns( Promise.resolve( () => 3 ) );
      b.delegate( 'foo', syncHandler );
      b.delegateAsync( 'bar', asyncHandler );
      a.delegateNamespace( 'b:', b );
      expect( a.resolve( 'b:foo' ) ).to.equal( 2 );
      expect( await a.resolveAsync( 'b:bar' ) ).to.equal( 3 );
    });
  });

  describe( '.registerAlias( aliasName, originalName )', function() {
    it( 'should register an alias', function() {
      var kernel = new Kernel();
      kernel.registerAlias( 'foo', 'bar' );
      kernel.register( 'bar', 2 );
      expect( kernel.resolve( 'foo' ) ).to.equal( 2 );
    });
  });

  describe( '.registerAsyncFactoryAsSingleton( name, factory )', function() {
    it( 'should register an async delegate whose value is cached', async function() {
      var kernel = new Kernel();
      kernel.registerAsyncFactoryAsSingleton( 'foo', () => Promise.resolve( 2 ) );
      kernel.registerAsyncFactoryAsSingleton( 'bar', [ 'foo', foo => Promise.resolve( foo * 5 ) ]);
      expect( await kernel.resolveAsync( 'bar' ) ).to.equal( 10 );

      kernel.registerAsyncFactoryAsSingleton( 'baz', () => Promise.resolve( {} ) );
      expect( await kernel.resolveAsync( 'baz' ) ).to.equal( await kernel.resolveAsync( 'baz' ) );
    });

    it( 'should be invoked as a child', async function() {
      var kernel = new Kernel();
      kernel.asyncResolvers.push({
        async resolveAsync( name, namedNode ) {
          if ( name === 'foo', namedNode.isChildNode ) {
            return () => 2;
          }
        }
      });
      kernel.registerAsyncFactoryAsSingleton( 'bar', [ 'foo', x => x ] );
      expect( await kernel.resolveAsync( 'bar' ) ).to.equal( 2 );
    });
  });
});
