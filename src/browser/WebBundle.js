import Bundle from '../common/Bundle';
import loadFontAsync from './util/loadFontAsync';
import loadScriptAsync from './util/loadScriptAsync';
import loadStyleAsync from './util/loadStyleAsync';

export default class WebBundle extends Bundle {
  /**
   * @param {ScriptParams} script
   * @returns {Promise.<*>}
   */
  loadScriptAsync( script ) {
    return loadScriptAsync( script );
  }

  /**
   * @param {StyleParams} style
   * @returns {Promise}
   */
  loadStyleAsync( style ) {
    return loadStyleAsync( style );
  }

  /**
   * @param {FontParams} font
   * @returns {Promise}
   */
  async loadFontAsync( font ) {
    var webFont = await this.resolveAsync( 'webfont' );
    var webFont = window.WebFont;
    if ( !webFont ) {
      webFont = await this.loadScriptAsync({
        url: 'https://ajax.googleapis.com/ajax/libs/webfont/1.5.18/webfont.js',
        get: () => window.WebFont
      });
    }
    await loadFontAsync( webFont, font );
  }

  /**
   * @param {String} name
   * @param {FontParams} font
   */
  registerFont( name, font ) {
    this._registerFont( name, font, false );
  }

  /**
   * @param {String} name
   * @param {FontParams} font
   */
  registerInternalFont( name, font ) {
    this._registerFont( name, font, true );
  }

  /**
   * @param {String} name
   * @param {ScriptParams} script
   */
  registerScript( name, script ) {
    this._registerScript( name, script, false );
  }

  /**
   * @param {String} name
   * @param {ScriptParams} script
   */
  registerInternalScript( name, script ) {
    this._registerScript( name, script, true );
  }

  /**
   * @param {String} name
   * @param {StyleParams}
   */
  registerInternalStyle( name, style ) {
    var promise;
    this.registerAsyncResolver({
      resolveAsync: async ( target ) => {
        if ( name === target ) {
          if ( !promise ) {
            promise = this.loadStyleAsync( style ).then( () => {
              this.register( name );
              return () => {};
            });
          }
          return promise;
        }
      }
    }, true );
  }

  /**
   * @param {String} name
   * @param {ScriptParams} script
   * @param {Boolean} isInternal
   */
  _registerScript( name, script, isInternal ) {
    var promise;
    this.registerAsyncResolver({
      resolveAsync: async ( target ) => {
        if ( name === target ) {
          if ( !promise ) {
            promise = this.loadScriptAsync( script ).then( instance => {
              this.register( name, instance );
              return () => instance;
            });
          }
          return promise;
        }
      }
    }, isInternal );
  }

  /**
   * @param {String} name
   * @param {FontParams} font
   * @param {Boolean} isInternal
   */
  _registerFont( name, font, isInternal ) {
    var promise;
    this.registerAsyncResolver({
      resolveAsync: async ( target ) => {
        if ( name === target ) {
          if ( !promise ) {
            promise = this.loadFontAsync( font ).then( () => {
              this.register( name );
              return () => {};
            });
          }
          return promise;
        }
      }
    }, isInternal );
  }
};
