import { combinePaths } from '../common/util';

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
    return require( combinePaths( this.baseDir, name ) );
  }
};
