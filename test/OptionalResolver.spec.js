import {
  Kernel,
  ServiceNotFoundError
} from '../src/node';

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
});
