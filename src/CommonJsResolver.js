import { pathCombine } from './util';

export default class CommonJsResolver {
  /**
   * @param {String} name
   */
  constructor( baseDir ) {
    this.baseDir = baseDir;
  }

  /**
   * @param {String} name
   */
  resolve( name ) {
    return require( pathCombine( this.baseDir, name ) );
  }
};
