import {
  Kernel,
  ServiceNotFoundError
} from '../src/index';

describe( 'OptionalResolver', function() {
  it( 'should return undefined if the optional syntax is used and the value is unregistered', function() {
    var kernel = new Kernel();
    expect( kernel.resolve( 'foo?' ) ).to.equal( undefined );
    kernel.register( 'foo', 2 );
    expect( kernel.resolve( 'foo?' ) ).to.equal( 2 );
    kernel.unregister( 'foo' );
    expect( function() {
      kernel.resolve( 'foo' );
    }).to.throw( ServiceNotFoundError );
  });

  it( 'should return locals when they exist', function() {
    var kernel = new Kernel();
    var target = [ 'foo?', foo => foo ];
    var locals = { foo: 2 };
    expect( kernel.invoke( target, locals ) ).to.equal( 2 );
  });
});
