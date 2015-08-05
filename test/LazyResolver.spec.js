import { Kernel } from '../src/index';

describe( 'LazyResolver', function() {
  it( 'should return a promise if the lazy syntax is used', async function() {
    var kernel = new Kernel();
    var lazyFoo = kernel.resolve( 'foo...' );
    var lazyFoo2 = kernel.resolve( 'foo...' );
    expect( lazyFoo ).to.be.a.instanceof( Promise );
    kernel.registerFactory( 'foo', () => {
      return {};
    });
    expect( await lazyFoo ).to.equal( await lazyFoo );
    expect( await lazyFoo ).to.not.equal( await lazyFoo2 );
  });
});
