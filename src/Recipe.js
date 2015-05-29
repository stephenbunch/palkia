export default class Recipe {
  constructor( value ) {
    value = value || {};

    /**
     * @type {String|null}
     */
    this.name = value.name || null;

    /**
     * @type {Function}
     */
    this.create = value.create;

    /**
     * An ingredient can be the name of a service or a factory.
     * @type {Array.<String|Factory>}
     */
    this.ingredients = value.ingredients || [];

    /**
     * @type {Boolean}
     */
    this.lazy = value.lazy || false;
  }
};
