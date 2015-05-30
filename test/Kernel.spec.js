import {
  Kernel,
  ServiceNotFoundError,
  InvalidOperationError
} from '../index';

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
      kernel.register( 'foo', 2 );
      var lazyFoo = kernel.resolve( 'foo...' );
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

  describe( '.redirect( pattern, handler )', function() {
    it( 'should register a redirect handler', function() {
      var kernel = new Kernel();
      kernel.redirect( 'foo', () => 'bar' );
      kernel.register( 'bar', 2 );
      expect( kernel.resolve( 'foo' ) ).to.equal( 2 );
    });
  });
});
