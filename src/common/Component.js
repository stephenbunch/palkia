export default class Component {

  /**
   * @param {Recipe} recipe
   */
  constructor( recipe ) {

    /**
     * @type {Recipe}
     */
    this.recipe = recipe.clone();

    /**
     * @type {Component}
     */
    this.parent = null;

    /**
     * @type {Number}
     */
    this.order = null;

    /**
     * @type {Array.<Component>}
     */
    this.children = [];

    /**
     * @type {Array}
     */
    this.prep = [];
  }
};
