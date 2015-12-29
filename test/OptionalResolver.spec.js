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

  it( 'should work with async resolutions', async function() {
    var kernel = new Kernel();
    expect( await kernel.resolveAsync( 'foo?' ) ).to.equal( undefined );
    kernel.registerAsyncFactory( 'foo', [ 'bar', bar => bar ] );
    kernel.registerAsyncFactoryAsSingleton( 'bar', () => Promise.resolve( 2 ) );
    expect( await kernel.resolveAsync( 'foo?' ) ).to.equal( 2 );
    kernel.unregister( 'foo' );
    await expect( kernel.resolveAsync( 'foo' ) )
      .to.eventually.be.rejectedWith( ServiceNotFoundError );
  });
});
