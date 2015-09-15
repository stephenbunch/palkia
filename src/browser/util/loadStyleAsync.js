import GLOBAL from '../GLOBAL';
import loadStyle from './loadStyle';
import moveStyleToTop from './moveStyleToTop';
import styleIsLoaded from './styleIsLoaded';

/**
 * @param {StyleParams} style
 * @returns {Promise}
 */
export default async function( style ) {
  if ( !styleIsLoaded( style.match ) ) {
    var url = typeof style.url === 'function' ? style.url() : style.url;
    if ( !GLOBAL.pending[ url ] ) {
      GLOBAL.pending[ url ] = new Promise( resolve => {
        loadStyle( url, () => {
          if ( !styleIsLoaded( style.match ) ) {
            console.warn(
              `A style was successfully loaded from ${ url }, but the ` +
              `match expression returned false.`
            );
          }
          moveStyleToTop( url, style.order );
          resolve();
        });
      });
    }
    await GLOBAL.pending[ url ];
    delete GLOBAL.pending[ url ];
  }
};
