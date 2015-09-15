import {
  Kernel,
  ServiceNotFoundError
} from '../src/node';

describe( 'OptionalLocalResolver', function() {
  it( 'should return locals when they exist', function() {
    var kernel = new Kernel();
    var target = [ 'foo?', foo => foo ];
    var locals = { foo: 2 };
    expect( kernel.invoke( target, locals ) ).to.equal( 2 );
  });
});
