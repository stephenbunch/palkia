import Bundle from '../common/Bundle';

export default class NodeBundle extends Bundle {
  static create(Bundle, deps) {
    let bundle = new NodeBundle();
    return bundle.invoke(Bundle, deps);
  }

  static createAsync(Bundle, deps) {
    let bundle = new NodeBundle();
    return bundle.invokeAsync(Bundle, deps);
  }

  registerDirectory( dirname, options ) {
    var glob = require( 'glob' );
    var path = require( 'path' );
    dirname = path.resolve( dirname );
    var files = glob.sync( '**/*.+(js|jsx)', {
      cwd: dirname
    });
    var modules = {};
    for ( let file of files ) {
      let name = file.substr( 0, file.length - path.extname( file ).length );
      modules[ name ] = require( dirname + '/' + file );
      modules[ name ] = modules[ name ] && modules[ name ].default || modules[ name ];
    }
    this.registerModules( modules, options );
  }
};
