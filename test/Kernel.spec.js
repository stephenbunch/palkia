import {
  Kernel,
  ServiceNotFoundError,
  InvalidOperationError
} from '../src/index';

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

    it( 'should return a promise if the lazy syntax is used', async function() {
      var kernel = new Kernel();
      var lazyFoo = kernel.resolve( 'foo...' );
      expect( lazyFoo ).to.be.a.instanceof( Promise )
      kernel.register( 'foo', 2 );
      expect( await lazyFoo ).to.equal( 2 );
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

  describe( '.unregister( name )', function() {
    it( 'should unregister a service', function() {
      var kernel = new Kernel();
      kernel.register( 'foo', 2 );
      kernel.unregister( 'foo' );
      expect( function() {
        kernel.resolve( 'foo' );
      }).to.throw( ServiceNotFoundError );
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

  describe( '.delegate( pattern, handler )', function() {
    it( 'should register a synchronous delegating handler', function() {
      var kernel = new Kernel();
      var handler = sinon.stub().returns( () => 2 );
      kernel.delegate( 'foo', handler );
      expect( kernel.invoke( 'thing', [ 'foo', foo => foo ] ) ).to.equal( 2 );
      expect( handler ).to.have.been.calledWith( 'foo', 'thing' );
    });
  });

  describe( '.delegateAsync( pattern, handler )', function() {
    it( 'should register an asynchronous delegating handler', async function() {
      var kernel = new Kernel();
      var handler = sinon.stub().returns( Promise.resolve( () => 2 ) );
      kernel.delegateAsync( 'foo', handler );
      expect( await kernel.resolveAsync( 'foo' ) ).to.equal( 2 );
    });

    it( 'should not run if a synchronous delegate can provide', async function() {
      var kernel = new Kernel();
      var syncHandler = sinon.stub().returns( () => 2 );
      var asyncHandler = sinon.stub().returns( Promise.reject( new Error( 'should not be called' ) ) );
      kernel.delegate( 'foo', syncHandler );
      kernel.delegateAsync( 'foo', asyncHandler );
      expect( await kernel.resolveAsync( 'foo' ) ).to.equal( 2 );
    });
  });

  describe( '.delegateTo( pattern, kernel )', function() {
    it( 'should register a kernel to provide resolutions', async function() {
      var a = new Kernel();
      var b = new Kernel();
      var syncHandler = sinon.stub().returns( () => 2 );
      var asyncHandler = sinon.stub().returns( Promise.resolve( () => 3 ) );
      b.delegate( 'foo', syncHandler );
      b.delegateAsync( 'bar', asyncHandler );
      a.delegateTo( /(foo|bar)/, b );
      expect( a.resolve( 'foo' ) ).to.equal( 2 );
      expect( await a.resolveAsync( 'bar' ) ).to.equal( 3 );
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

  describe( '.redirect( pattern, handler )', function() {
    it( 'should register a redirect handler', function() {
      var kernel = new Kernel();
      kernel.redirect( 'foo', () => 'bar' );
      kernel.register( 'bar', 2 );
      expect( kernel.resolve( 'foo' ) ).to.equal( 2 );
    });
  });
});
