import loadScript from 'scriptjs';
import GLOBAL from '../GLOBAL';

/**
 * @param {ScriptParams} script
 * @returns {Promise}
 */
export default async function( script ) {
  let instance;
  try {
    if ( script.get ) {
      instance = script.get();
    }
  } catch ( err ) {}
  if ( !instance || !script.get ) {
    let url = typeof script.url === 'function' ? script.url() : script.url;
    if ( !GLOBAL.pending[ url ] ) {
      GLOBAL.pending[ url ] = new Promise( resolve => {
        if ( script.callback ) {
          let callbackName = 'arceus_callback_' + ( ++GLOBAL.uid );
          window[ callbackName ] = () => {
            delete window[ callbackName ];
            resolve();
          };
          loadScript( url + '&callback=' + callbackName );
        } else {
          loadScript( url, () => {
            resolve();
          });
        }
      });
    }
    await GLOBAL.pending[ url ];
    delete GLOBAL.pending[ url ];
    if ( script.get ) {
      instance = script.get();
      if ( !instance ) {
        throw new Error(
          `A script was loaded successfully from ${ url }, but the ` +
          `module returned undefined. Perhaps the 'get' function is wrong?`
        );
      }
    }
  }
  if ( typeof script.initAsync === 'function' ) {
    let result = await script.initAsync( instance );
    if ( result !== undefined ) {
      instance = result;
    }
  }
  return instance;
};
