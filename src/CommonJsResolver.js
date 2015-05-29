import { pathCombine } from './util';

export default class CommonJsResolver {
  constructor( baseDir ) {
    this.baseDir = baseDir;
  }

  resolve( name ) {
    return require( pathCombine( this.baseDir, name ) );
  }
};
