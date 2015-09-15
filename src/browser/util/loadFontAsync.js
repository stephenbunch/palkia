import fontIsLoaded from './fontIsLoaded';
import hrefForGoogleFont from './hrefForGoogleFont';
import moveStyleToTop from './moveStyleToTop';

/**
 * @param {WebFont} webFont
 * @param {FontParams} font
 * @returns {Promise}
 */
export default async function( webFont, font ) {
  if ( !fontIsLoaded( font.name, font.testString ) ) {
    await new Promise( resolve => {
      var url;
      var family = font.family || font.name;
      var config = {
        [ font.provider ]: {
          families: [ family ]
        },
        active: () => {
          if ( !fontIsLoaded( font.name, font.testString ) ) {
            console.warn(
              `A font was successfully loaded, but the font could not be ` +
              `detected. Perhaps the font name "${ font.name }" is wrong?`
            );
          }
          switch ( font.provider ) {
            case 'custom':
              moveStyleToTop( url, font.order );
              break;
            case 'google':
              let href = hrefForGoogleFont( family.replace( / /g, '+' ) );
              if ( href ) {
                moveStyleToTop( href, font.order );
              }
              break;
          }
          resolve();
        }
      };
      if ( font.provider === 'custom' ) {
        url = typeof font.url === 'function' ? font.url() : font.url;
        config.custom.urls = [ url ];
        config.custom.testStrings = {
          [ font.name ]: font.testString
        };
      }
      webFont.load( config );
    });
  }
};
