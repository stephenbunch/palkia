export default class Recipe {
  /**
   * @param {Object} [defaults]
   */
  constructor( defaults ) {
    defaults = defaults || {};

    /**
     * @type {String|null}
     */
    this.name = defaults.name || null;

    /**
     * @type {Function}
     */
    this.create = defaults.create;

    /**
     * An ingredient can be the name of a service or a factory.
     * @type {Array.<String|Factory|Recipe>}
     */
    this.ingredients = ( defaults.ingredients || [] ).slice();
  }

  /**
   * @returns {Recipe}
   */
  clone() {
    return new Recipe( this );
  }
};
