(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Dialga = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AmdResolver = (function () {
  function AmdResolver(requireContext) {
    _classCallCheck(this, AmdResolver);

    this.requireContext = requireContext;
  }

  /**
   * @param {String} name
   */

  _createClass(AmdResolver, [{
    key: "resolveAsync",
    value: function resolveAsync(name) {
      var _this = this;

      return new Promise(function (resolve, reject) {
        _this.requireContext([name], resolve, reject);
      });
    }
  }]);

  return AmdResolver;
})();

exports["default"] = AmdResolver;
;
module.exports = exports["default"];
},{}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _Kernel = require('./Kernel');

var _Kernel2 = _interopRequireDefault(_Kernel);

var _utilArrayFromTarget = require('./util/arrayFromTarget');

var _utilArrayFromTarget2 = _interopRequireDefault(_utilArrayFromTarget);

var Bundle = (function () {
  function Bundle(name) {
    _classCallCheck(this, Bundle);

    this.name = name;
    this._kernel = new _Kernel2['default']();
    this._modules = [];
  }

  _createClass(Bundle, [{
    key: 'listModules',
    value: function listModules() {
      return this._modules.slice();
    }
  }, {
    key: 'register',
    value: function register(name, value) {
      this._kernel.register(name, value);
    }
  }, {
    key: 'registerLazy',
    value: function registerLazy(name, value) {
      this._kernel.registerLazy(name, value);
    }
  }, {
    key: 'registerFactory',
    value: function registerFactory(name, factory) {
      this._kernel.registerFactory(name, factory);
    }
  }, {
    key: 'registerFactoryAsSingleton',
    value: function registerFactoryAsSingleton(name, factory) {
      this._kernel.registerFactoryAsSingleton(name, factory);
    }
  }, {
    key: 'registerAsyncFactoryAsSingleton',
    value: function registerAsyncFactoryAsSingleton(name, factory) {
      this._kernel.registerAsyncFactoryAsSingleton(name, factory);
    }
  }, {
    key: 'resolve',
    value: function resolve(name) {
      return this._kernel.resolve(name);
    }
  }, {
    key: 'resolveAsync',
    value: function resolveAsync(name) {
      return this._kernel.resolveAsync(name);
    }
  }, {
    key: 'invoke',
    value: function invoke(name, target, locals) {
      return this._kernel.invoke(name, target, locals);
    }
  }, {
    key: 'invokeAsync',
    value: function invokeAsync(name, target, locals) {
      return this._kernel.invokeAsync(name, target, locals);
    }
  }, {
    key: 'registerModules',
    value: function registerModules(modules) {
      var _this = this;

      var _ref = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      var _ref$ignore = _ref.ignore;
      var ignore = _ref$ignore === undefined ? [] : _ref$ignore;
      var _ref$asyncModules = _ref.asyncModules;
      var asyncModules = _ref$asyncModules === undefined ? false : _ref$asyncModules;
      var _ref$namespace = _ref.namespace;
      var namespace = _ref$namespace === undefined ? '' : _ref$namespace;
      var _ref$transform = _ref.transform;
      var transform = _ref$transform === undefined ? null : _ref$transform;
      var _ref$transformAsync = _ref.transformAsync;
      var transformAsync = _ref$transformAsync === undefined ? null : _ref$transformAsync;

      var _loop = function (key) {
        try {
          var _ret2 = (function () {
            // Skip ignored paths.
            var skip = false;
            _iteratorNormalCompletion = true;
            _didIteratorError = false;
            _iteratorError = undefined;

            try {
              for (_iterator = ignore[Symbol.iterator](); !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var path = _step.value;

                if (/\/$/.test(path)) {
                  if (key.startsWith(path)) {
                    skip = true;
                    break;
                  }
                } else {
                  if (key === path) {
                    skip = true;
                    break;
                  }
                }
              }
            } catch (err) {
              _didIteratorError = true;
              _iteratorError = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion && _iterator['return']) {
                  _iterator['return']();
                }
              } finally {
                if (_didIteratorError) {
                  throw _iteratorError;
                }
              }
            }

            if (skip) {
              return {
                v: 'continue'
              };
            }

            var segments = key.split('/');
            var fullName = namespace + key;
            var shortName = segments[segments.length - 1];

            var factory = modules[key];

            var f = (0, _utilArrayFromTarget2['default'])(modules[key]);
            var deps = f.slice(0, f.length - 1);
            f = f[f.length - 1];

            if (asyncModules) {
              (function () {
                var t = transformAsync || transform;
                if (t) {
                  factory = [].concat(_toConsumableArray(deps), [function () {
                    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                      args[_key] = arguments[_key];
                    }

                    return Promise.resolve().then(function () {
                      return f.apply(undefined, args);
                    }).then(function (instance) {
                      return t({ name: key, instance: instance });
                    });
                  }]);
                }
              })();
            } else if (transform) {
              factory = [].concat(_toConsumableArray(deps), [function () {
                for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                  args[_key2] = arguments[_key2];
                }

                return transform({
                  name: key,
                  instance: f.apply(undefined, args)
                });
              }]);
            }

            if (asyncModules) {
              _this._kernel.registerAsyncFactoryAsSingleton(fullName, factory);
            } else {
              _this._kernel.registerFactoryAsSingleton(fullName, factory);
            }

            // Mimic the node convention where requiring a directory requires the
            // index file.
            if (key.endsWith('/index')) {
              _this._kernel.registerAlias(fullName.replace(/\/index$/, ''), fullName);
            }

            // Modules that begin with '_' are treated as internal modules, meaning
            // they cannot be resolved from the kernel directly.

            // In other words, when we register a module that begins with '_' like
            // '_Foo', register an alias 'Foo' -> '_Foo', but only enable the alias
            // when the module is being resolved as a dependency of another module
            // within the kernel. This means when we try to do a
            // kernel.resolve( 'Foo' ), we get a ServiceNotFoundError, but if we have
            // a service 'Bar' that depends on 'Foo', the resolution works.

            if (/^_/.test(shortName)) {
              (function () {
                var segs = segments.slice();
                segs.pop();
                segs.push(shortName.substr(1));
                var preferredName = namespace + segs.join('/');
                _this._kernel.redirects.push({
                  redirect: function redirect(name, namedNode) {
                    if (namedNode && namedNode.isChildNode && name === preferredName) {
                      return fullName;
                    }
                  }
                });
              })();
            }

            _this._modules.push(fullName);
          })();

          if (typeof _ret2 === 'object') return _ret2.v;
        } catch (err) {
          throw new Error('Module registration failed for "' + key + '" because [' + err.message + ']');
        }
      };

      for (var key in modules) {
        var _iteratorNormalCompletion;

        var _didIteratorError;

        var _iteratorError;

        var _iterator, _step;

        var _ret = _loop(key);

        if (_ret === 'continue') continue;
      }
    }

    /**
     * @param {String} fromNamespace
     * @param {Bundle} toBundle
     * @param {String} [toNamespace=""]
     */
  }, {
    key: 'registerLink',
    value: function registerLink(fromNamespace, toBundle) {
      var toNamespace = arguments.length <= 2 || arguments[2] === undefined ? '' : arguments[2];

      this._registerLink(fromNamespace, toBundle, toNamespace, false);
    }

    /**
     * @param {String} fromNamespace
     * @param {Bundle} toBundle
     * @param {String} [toNamespace=""]
     */
  }, {
    key: 'registerInternalLink',
    value: function registerInternalLink(fromNamespace, toBundle) {
      var toNamespace = arguments.length <= 2 || arguments[2] === undefined ? '' : arguments[2];

      this._registerLink(fromNamespace, toBundle, toNamespace, true);
    }

    /**
     * @param {String} name
     * @param {Bundle} toBundle
     * @param {String} [toName]
     */
  }, {
    key: 'delegate',
    value: function delegate(name, toBundle, toName) {
      this._delegate(name, toBundle, toName || name, false);
    }

    /**
     * @param {String} name
     * @param {Bundle} toBundle
     * @param {String} [toName]
     */
  }, {
    key: 'delegateInternal',
    value: function delegateInternal(name, toBundle, toName) {
      this._delegate(name, toBundle, toName || name, true);
    }
  }, {
    key: 'registerResolver',
    value: function registerResolver(resolver, isInternal) {
      this.resolvers.push({
        resolve: function resolve(name, namedNode) {
          if (!isInternal || namedNode && namedNode.isChildNode) {
            return resolver.resolve(name, namedNode);
          }
        }
      });
    }
  }, {
    key: 'registerAsyncResolver',
    value: function registerAsyncResolver(resolver, isInternal) {
      var _this2 = this;

      this.asyncResolvers.push({
        resolveAsync: function resolveAsync(name, namedNode) {
          return regeneratorRuntime.async(function resolveAsync$(context$3$0) {
            while (1) switch (context$3$0.prev = context$3$0.next) {
              case 0:
                if (!(!isInternal || namedNode && namedNode.isChildNode)) {
                  context$3$0.next = 2;
                  break;
                }

                return context$3$0.abrupt('return', resolver.resolveAsync(name, namedNode));

              case 2:
              case 'end':
                return context$3$0.stop();
            }
          }, null, _this2);
        }
      });
    }

    /**
     * @param {String} fromNamespace
     * @param {Bundle} toBundle
     * @param {String} toNamespace
     * @param {Boolean} isInternal
     */
  }, {
    key: '_registerLink',
    value: function _registerLink(fromNamespace, toBundle, toNamespace, isInternal) {
      var _this3 = this;

      this.registerResolver({
        resolve: function resolve(name) {
          if (name.startsWith(fromNamespace)) {
            return toBundle._kernel.factoryFor(toNamespace + name.substr(fromNamespace.length));
          }
        }
      }, isInternal);
      this.registerAsyncResolver({
        resolveAsync: function resolveAsync(name) {
          return regeneratorRuntime.async(function resolveAsync$(context$3$0) {
            while (1) switch (context$3$0.prev = context$3$0.next) {
              case 0:
                if (!name.startsWith(fromNamespace)) {
                  context$3$0.next = 2;
                  break;
                }

                return context$3$0.abrupt('return', toBundle._kernel.factoryForAsync(toNamespace + name.substr(fromNamespace.length)));

              case 2:
              case 'end':
                return context$3$0.stop();
            }
          }, null, _this3);
        }
      }, isInternal);
    }

    /**
     * @param {String} name
     * @param {Bundle} toBundle
     * @param {String} toName
     * @param {Boolean} isInternal
     */
  }, {
    key: '_delegate',
    value: function _delegate(name, toBundle, toName, isInternal) {
      var _this4 = this;

      var key = '_' + name;
      this._kernel.registerFactory(name, [key, function (x) {
        return x;
      }]);
      this.registerResolver({
        resolve: function resolve(target) {
          if (key === target) {
            return toBundle._kernel.factoryFor(toName);
          }
        }
      }, isInternal);
      this.registerAsyncResolver({
        resolveAsync: function resolveAsync(target) {
          return regeneratorRuntime.async(function resolveAsync$(context$3$0) {
            while (1) switch (context$3$0.prev = context$3$0.next) {
              case 0:
                if (!(key === target)) {
                  context$3$0.next = 2;
                  break;
                }

                return context$3$0.abrupt('return', toBundle._kernel.factoryForAsync(toName));

              case 2:
              case 'end':
                return context$3$0.stop();
            }
          }, null, _this4);
        }
      });
    }
  }, {
    key: 'resolvers',
    get: function get() {
      return this._kernel.resolvers;
    }
  }, {
    key: 'asyncResolvers',
    get: function get() {
      return this._kernel.asyncResolvers;
    }
  }, {
    key: 'redirects',
    get: function get() {
      return this._kernel.redirects;
    }
  }, {
    key: 'localResolvers',
    get: function get() {
      return this._kernel.localResolvers;
    }
  }]);

  return Bundle;
})();

exports['default'] = Bundle;
;
module.exports = exports['default'];
},{"./Kernel":6,"./util/arrayFromTarget":15}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _util = require('./util');

var CommonJsResolver = (function () {
  /**
   * @param {String} name
   */

  function CommonJsResolver(baseDir) {
    _classCallCheck(this, CommonJsResolver);

    this.baseDir = baseDir;
  }

  /**
   * @param {String} name
   */

  _createClass(CommonJsResolver, [{
    key: 'resolve',
    value: function resolve(name) {
      return require((0, _util.combinePaths)(this.baseDir, name));
    }
  }]);

  return CommonJsResolver;
})();

exports['default'] = CommonJsResolver;
;
module.exports = exports['default'];
},{"./util":18}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Component =

/**
 * @param {Recipe} recipe
 */
function Component(recipe) {
  _classCallCheck(this, Component);

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
};

exports["default"] = Component;
;
module.exports = exports["default"];
},{}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var InvalidOperationError = (function (_Error) {
  _inherits(InvalidOperationError, _Error);

  function InvalidOperationError(message) {
    _classCallCheck(this, InvalidOperationError);

    _get(Object.getPrototypeOf(InvalidOperationError.prototype), 'constructor', this).call(this);
    this.name = 'InvalidOperationError';
    this.message = message;
  }

  return InvalidOperationError;
})(Error);

exports['default'] = InvalidOperationError;
;
module.exports = exports['default'];
},{}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _AmdResolver = require('./AmdResolver');

var _AmdResolver2 = _interopRequireDefault(_AmdResolver);

var _CommonJsResolver = require('./CommonJsResolver');

var _CommonJsResolver2 = _interopRequireDefault(_CommonJsResolver);

var _LazyResolver = require('./LazyResolver');

var _LazyResolver2 = _interopRequireDefault(_LazyResolver);

var _Linker = require('./Linker');

var _Linker2 = _interopRequireDefault(_Linker);

var _OptionalResolver = require('./OptionalResolver');

var _OptionalResolver2 = _interopRequireDefault(_OptionalResolver);

var _OptionalLocalResolver = require('./OptionalLocalResolver');

var _OptionalLocalResolver2 = _interopRequireDefault(_OptionalLocalResolver);

var _Recipe = require('./Recipe');

var _Recipe2 = _interopRequireDefault(_Recipe);

var _Registry = require('./Registry');

var _Registry2 = _interopRequireDefault(_Registry);

var _util = require('./util');

var Kernel = (function () {
  function Kernel() {
    _classCallCheck(this, Kernel);

    this._registry = new _Registry2['default']();
    this._linker = new _Linker2['default']();
    this._linker.delegate = this._registry;
    this._registry.resolvers.push(new _LazyResolver2['default'](this));
    this._registry.resolvers.push(new _OptionalResolver2['default'](this));
    this._registry.asyncResolvers.push(new _OptionalResolver2['default'](this));
    this.localResolvers = [new _OptionalLocalResolver2['default'](this)];
  }

  /**
   * @returns {Array.<ResolveHandler>}
   */

  _createClass(Kernel, [{
    key: 'resolve',

    /**
     * Resolves a named service.
     * @param {String} name
     * @returns {*}
     */
    value: function resolve(name) {
      return this.invoke([name, function (dep) {
        return dep;
      }]);
    }

    /**
     * Resolves a named service asynchronously.
     * @param {String} name
     * @returns {Promise}
     */
  }, {
    key: 'resolveAsync',
    value: function resolveAsync(name) {
      return this.invokeAsync([name, function (dep) {
        return dep;
      }]);
    }

    /**
     * Invokes a target, optionally specifying the name of the target.
     *
     * Targets can be named or unnamed. Targets can reference other targets by
     * name, registered or unregistered, and they can also contain inline targets.
     * When a target's dependency targets are resolved, its name is made available
     * to the dependency resolvers.
     *
     * @param {String} [name] Optional name of the target.
     * @param {Target} target
     * @param {Object.<String, *>} [locals]
     * @returns {*}
     */
  }, {
    key: 'invoke',
    value: function invoke(name, target, locals) {
      return this.factoryFrom(name, target, locals)();
    }

    /**
     * Invokes the target as a child node.
     *
     * What is a child node? Let's say we have a target 'A' which has a dependency
     * 'B' which has its own dependency 'C'. The object graph would look like
     * this: A > B > C. In this case, A is the top level node while and B and C
     * are both child nodes. Defining this distinction between top level and child
     * allows us to write different rules for resolving each. For example, we
     * might want the ability to have private modules. With this distinction, we
     * can easily write a rule that says, "If module X is a top level node, hide
     * all resolutions whose names begin with an underscore (_)."
     *
     * Invoking a target as a child allows us to invoke B without having any
     * knowledge of A. In other words, it allows us to resolve a target as if it
     * were a child node rather than a top level node.
     *
     * @param {String} [name] Optional name of the target.
     * @param {Target} target
     * @param {Object.<String, *>} [locals]
     * @returns {*}
     */
  }, {
    key: 'invokeChild',
    value: function invokeChild(name, target, locals) {
      return this.factoryFromChild(name, target, locals)();
    }

    /**
     * @param {String} [name] Optional name of the target.
     * @param {Target} target
     * @param {Object.<String, *>} [locals]
     * @returns {Promise.<*>}
     */
  }, {
    key: 'invokeAsync',
    value: function invokeAsync(name, target, locals) {
      return this.factoryFromAsync(name, target, locals).then(function (factory) {
        return factory();
      });
    }

    /**
     * Invokes the target as a child node asynchronously.
     * @param {String} [name] Optional name of the target.
     * @param {Target} target
     * @param {Object.<String, *>} [locals]
     * @returns {Promise.<*>}
     */
  }, {
    key: 'invokeChildAsync',
    value: function invokeChildAsync(name, target, locals) {
      return this.factoryFromChildAsync(name, target, locals).then(function (factory) {
        return factory();
      });
    }

    /**
     * @param {String} [name] Optional name of the target.
     * @param {Target} target
     * @param {Object.<String, *>} [locals]
     * @returns {Function}
     */
  }, {
    key: 'factoryFrom',
    value: function factoryFrom(name, target, locals) {
      return this._linker.factoryFromRecipe(this._recipeFromArgs(name, target, locals));
    }

    /**
     * @param {String} [name] Optional name of the target.
     * @param {Target} target
     * @param {Object.<String, *>} [locals]
     * @returns {Promise.<Function>}
     */
  }, {
    key: 'factoryFromAsync',
    value: function factoryFromAsync(name, target, locals) {
      return this._linker.factoryFromRecipeAsync(this._recipeFromArgs(name, target, locals));
    }
  }, {
    key: 'factoryFromChild',
    value: function factoryFromChild(name, target, locals) {
      return this._linker.factoryFromRecipe(this._childRecipeFromArgs(name, target, locals));
    }
  }, {
    key: 'factoryFromChildAsync',
    value: function factoryFromChildAsync(name, target, locals) {
      return this._linker.factoryFromRecipeAsync(this._childRecipeFromArgs(name, target, locals));
    }

    /**
     * @param {String} name
     * @returns {Function}
     */
  }, {
    key: 'factoryFor',
    value: function factoryFor(name) {
      return this.factoryFrom([name, function (dep) {
        return dep;
      }]);
    }

    /**
     * @param {String} name
     * @returns {Promise.<Function>}
     */
  }, {
    key: 'factoryForAsync',
    value: function factoryForAsync(name) {
      return this.factoryFromAsync([name, function (dep) {
        return dep;
      }]);
    }

    /**
     * Registers a value with the kernel.
     * @param {String} name
     * @param {*} value
     */
  }, {
    key: 'register',
    value: function register(name, value) {
      this.registerFactory(name, function () {
        return value;
      });
    }
  }, {
    key: 'registerLazy',
    value: function registerLazy(name, value) {
      this.registerAsyncFactoryAsSingleton(name, function () {
        return value;
      });
    }

    /**
     * Unregisters a name from the kernel.
     * @param {String} name
     */
  }, {
    key: 'unregister',
    value: function unregister(name) {
      delete this._registry.targets[name];
      delete this._registry.asyncTargets[name];
    }

    /**
     * Registers a factory with the kernel.
     * @param {String} name
     * @param {Target} factory
     */
  }, {
    key: 'registerFactory',
    value: function registerFactory(name, factory) {
      (0, _util.validateTarget)(factory);
      this._registry.targets[name] = factory;
    }

    /**
     * Registers a factory with the kernel who's value will be cached for all
     * future requests.
     * @param {String} name
     * @param {Target} factory
     */
  }, {
    key: 'registerFactoryAsSingleton',
    value: function registerFactoryAsSingleton(name, factory) {
      (0, _util.validateTarget)(factory);
      this._registry.targets[name] = this._singletonFactory(factory);
    }

    /**
     * Registers an async factory with the kernel.
     * @param {String} name
     * @param {AsyncFactory} factory
     */
  }, {
    key: 'registerAsyncFactory',
    value: function registerAsyncFactory(name, factory) {
      (0, _util.validateTarget)(factory);
      this._registry.asyncTargets[name] = this._asyncFactory(name, factory);
    }

    /**
     * Registers an async factory as an async delegate.
     * @param {String} name
     * @param {AsyncFactory} factory
     */
  }, {
    key: 'registerAsyncFactoryAsSingleton',
    value: function registerAsyncFactoryAsSingleton(name, factory) {
      (0, _util.validateTarget)(factory);
      factory = this._asyncFactory(name, factory);
      var instance;
      this._registry.asyncTargets[name] = function () {
        if (instance === undefined) {
          instance = factory();
        }
        return instance;
      };
    }

    /**
     * Registers an alias.
     * @param {String} name
     * @param {String} originalName
     */
  }, {
    key: 'registerAlias',
    value: function registerAlias(aliasName, originalName) {
      this._registry.redirects.push({
        redirect: function redirect(name) {
          if (name === aliasName) {
            return originalName;
          }
        }
      });
    }

    /**
     * Registers a resolver.
     * @param {Pattern} pattern
     * @param {ResolveHandler} handler
     */
  }, {
    key: 'delegate',
    value: function delegate(pattern, handler) {
      var match = (0, _util.matchFromPattern)(pattern);
      this._registry.resolvers.push({
        resolve: function resolve(name, namedNode) {
          if (match(name)) {
            return handler(name, namedNode);
          }
        }
      });
    }

    /**
     * Registers an async resolver.
     * @param {Pattern} pattern
     * @param {AsyncResolveHandler} handler
     */
  }, {
    key: 'delegateAsync',
    value: function delegateAsync(pattern, handler) {
      var match = (0, _util.matchFromPattern)(pattern);
      this._registry.asyncResolvers.push({
        resolveAsync: function resolveAsync(name, namedNode) {
          return Promise.resolve().then(function () {
            if (match(name)) {
              return handler(name, namedNode);
            }
          });
        }
      });
    }

    /**
     * Registers another kernel to provide resolutions for the specified
     * namespace.
     * @param {String} namespace
     * @param {Kernel} kernel
     */
  }, {
    key: 'delegateNamespace',
    value: function delegateNamespace(namespace, kernel) {
      this._registry.resolvers.push({
        resolve: function resolve(name) {
          if (name.startsWith(namespace)) {
            return kernel.factoryFor(name.substr(namespace.length));
          }
        }
      });
      this._registry.asyncResolvers.push({
        resolveAsync: function resolveAsync(name) {
          return Promise.resolve().then(function () {
            if (name.startsWith(namespace)) {
              return kernel.factoryForAsync(name.substr(namespace.length));
            }
          });
        }
      });
    }

    /**
     * @param {String} name
     * @returns {Target|undefined}
     */
  }, {
    key: 'targetForName',
    value: function targetForName(name) {
      return this._registry.targets[name];
    }

    /**
     * @param {String} name
     * @returns {AsyncTarget|undefined}
     */
  }, {
    key: 'asyncTargetForName',
    value: function asyncTargetForName(name) {
      var _this = this;

      if (this._registry.asyncTargets[name]) {
        return this._registry.asyncTargets[name];
      } else if (this._registry.targets[name]) {
        var _ret = (function () {
          var target = _this._registry.targets[name];
          return {
            v: function () {
              return Promise.resolve(target);
            }
          };
        })();

        if (typeof _ret === 'object') return _ret.v;
      }
    }

    /**
     * @param {String} [name] Optional name of the parent node.
     * @param {Target} target
     * @param {Object.<String, *>} [locals]
     *   If present, dependencies are read from this object first before the
     *   kernel is consulted.
     * @returns {Recipe}
     */
  }, {
    key: '_recipeFromArgs',
    value: function _recipeFromArgs(name, target, locals) {
      var _this2 = this;

      if (name && typeof name !== 'string') {
        locals = target;
        target = name;
        name = null;
      }
      var recipe = (0, _util.recipeFromTarget)(target);
      recipe.name = name || recipe.name;
      if (locals) {
        recipe.ingredients = recipe.ingredients.map(function (x) {
          var local = locals[x];
          if (local === undefined) {
            local = _this2.localResolvers.reduce(function (value, handler) {
              if (value === undefined) {
                return handler.resolve(x, locals);
              } else {
                return value;
              }
            }, undefined);
          }
          if (local !== undefined) {
            return function () {
              return local;
            };
          } else {
            return x;
          }
        });
      }
      return recipe;
    }
  }, {
    key: '_childRecipeFromArgs',
    value: function _childRecipeFromArgs(name, target, locals) {
      return new _Recipe2['default']({
        create: function create(x) {
          return x;
        },
        ingredients: [this._recipeFromArgs(name, target, locals)]
      });
    }
  }, {
    key: '_singletonFactory',
    value: function _singletonFactory(factory) {
      var instance;
      var recipe = (0, _util.recipeFromTarget)(factory);
      return recipe.ingredients.concat(function () {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        if (instance === undefined) {
          instance = recipe.create.apply(undefined, args);
        }
        return instance;
      });
    }
  }, {
    key: '_asyncFactory',
    value: function _asyncFactory(name, factory) {
      var _this3 = this;

      var recipe = (0, _util.recipeFromTarget)(factory);
      return function () {
        return _this3.invokeChildAsync(name, recipe.ingredients.concat([function () {
          for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            args[_key2] = arguments[_key2];
          }

          return Promise.resolve().then(function () {
            return recipe.create.apply(undefined, args);
          }).then(function (value) {
            return function () {
              return value;
            };
          });
        }]));
      };
    }
  }, {
    key: 'resolvers',
    get: function get() {
      return this._registry.resolvers;
    },

    /**
     * @param {Array.<ResolveHandler>} value
     */
    set: function set(value) {
      this._registry.resolvers = value;
    }

    /**
     * @returns {Array.<AsyncResolveHandler}
     */
  }, {
    key: 'asyncResolvers',
    get: function get() {
      return this._registry.asyncResolvers;
    },

    /**
     * @param {Array.<AsyncResolveHandler} value
     */
    set: function set(value) {
      this._registry.asyncResolvers = value;
    }

    /**
     * @returns {Array.<RedirectHandler}
     */
  }, {
    key: 'redirects',
    get: function get() {
      return this._registry.redirects;
    },

    /**
     * @param {Array.<RedirectHandler} value
     */
    set: function set(value) {
      this._registry.redirects = value;
    }
  }]);

  return Kernel;
})();

exports['default'] = Kernel;
;
module.exports = exports['default'];
},{"./AmdResolver":1,"./CommonJsResolver":3,"./LazyResolver":7,"./Linker":8,"./OptionalLocalResolver":9,"./OptionalResolver":10,"./Recipe":11,"./Registry":12,"./util":18}],7:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var LazyResolver = (function () {
  function LazyResolver(kernel) {
    _classCallCheck(this, LazyResolver);

    this.kernel = kernel;
    this.pattern = /\.\.\.$/;
  }

  /**
   * @param {String} name
   * @param {NamedNode} [namedNode]
   */

  _createClass(LazyResolver, [{
    key: "resolve",
    value: function resolve(name, namedNode) {
      var _this = this;

      if (this.pattern.test(name)) {
        name = name.substr(0, name.length - 3);
        var promise;
        return function () {
          if (!promise) {
            (function () {
              promise = Promise.resolve();
              var promise2 = undefined;
              // Only resolve things once the promise is awaited on.
              promise.then = function () {
                for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                  args[_key] = arguments[_key];
                }

                if (!promise2) {
                  // Make sure we only resolve this once no matter how many times
                  // the promise is awaited on.
                  promise2 = Promise.resolve().then(function () {
                    var target = [name, function (dep) {
                      return dep;
                    }];
                    if (namedNode && namedNode.isChildNode) {
                      return _this.kernel.invokeChildAsync(namedNode.name, target);
                    } else {
                      return _this.kernel.invokeAsync(target);
                    }
                  });
                }
                return promise2.then.apply(promise2, args);
              };
            })();
          }
          return promise;
        };
      }
    }
  }]);

  return LazyResolver;
})();

exports["default"] = LazyResolver;
;
module.exports = exports["default"];
},{}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _Recipe = require('./Recipe');

var _Recipe2 = _interopRequireDefault(_Recipe);

var _Component = require('./Component');

var _Component2 = _interopRequireDefault(_Component);

var _util = require('./util');

var _InvalidOperationError = require('./InvalidOperationError');

var _InvalidOperationError2 = _interopRequireDefault(_InvalidOperationError);

var Linker = (function () {
  function Linker() {
    _classCallCheck(this, Linker);

    /**
     * @type {LinkerDelegate}
     */
    this.delegate = null;
  }

  /**
   * @param {Recipe} recipe
   * @returns {Function}
   */

  _createClass(Linker, [{
    key: 'factoryFromRecipe',
    value: function factoryFromRecipe(recipe) {
      var _this = this;

      var component = this._componentFromRecipe(recipe);
      var stack = [component];

      var _loop = function () {
        var component = stack.shift();
        component.recipe.ingredients.forEach(function (ingredient, index) {
          var recipe;
          if (typeof ingredient === 'string') {
            recipe = _this.delegate.recipeForName(ingredient, {
              name: component.recipe.name,
              isChildNode: !!component.parent
            });
          } else if (ingredient instanceof _Recipe2['default']) {
            recipe = ingredient;
          } else {
            recipe = (0, _util.recipeFromTarget)(ingredient);
          }
          var child = _this._makeChildComponent(component, recipe, index);
          stack.push(child);
        });
      };

      while (stack.length > 0) {
        _loop();
      }
      return this._factoryFromComponent(component);
    }

    /**
     * @param {Recipe} recipe
     * @returns {Promise.<Function>}
     */
  }, {
    key: 'factoryFromRecipeAsync',
    value: function factoryFromRecipeAsync(recipe) {
      var _this2 = this;

      return Promise.resolve().then(function () {
        var component = _this2._componentFromRecipe(recipe);
        var resolve = function resolve(component) {
          return _this2.delegate.recipesByNameAsync(component.recipe.ingredients.filter(function (x) {
            return typeof x === 'string';
          }), {
            name: component.recipe.name,
            isChildNode: !!component.parent
          }).then(function (recipes) {
            return Promise.all(component.recipe.ingredients.map(function (ingredient, index) {
              var recipe;
              if (typeof ingredient === 'string') {
                recipe = recipes[ingredient];
              } else if (ingredient instanceof _Recipe2['default']) {
                recipe = ingredient;
              } else {
                recipe = (0, _util.recipeFromTarget)(ingredient);
              }
              return _this2._makeChildComponent(component, recipe, index);
            }).map(resolve));
          });
        };
        return resolve(component).then(function () {
          return _this2._factoryFromComponent(component);
        });
      });
    }

    /**
     * @param {Component} component
     * @returns {Function}
     */
  }, {
    key: '_factoryFromComponent',
    value: function _factoryFromComponent(component) {
      var components = [];
      var stack = [component];
      while (stack.length > 0) {
        var cmp = stack.shift();
        components.push(cmp);
        stack = stack.concat(cmp.children);
      }
      components.reverse().pop();

      return function () {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        var i = 0,
            len = components.length;
        for (; i < len; i++) {
          var cmp = components[i];
          cmp.parent.prep[cmp.order] = cmp.recipe.create.apply(undefined, cmp.prep);
          cmp.prep = [];
        }
        args = component.prep.concat(args);
        component.prep = [];
        return component.recipe.create.apply(undefined, args);
      };
    }

    /**
     * @param {Component} parent
     * @param {Recipe} recipe
     * @param {Number} position
     * @returns {Component}
     */
  }, {
    key: '_makeChildComponent',
    value: function _makeChildComponent(parent, recipe, position) {
      var child = this._componentFromRecipe(recipe, {
        parent: parent,
        order: position
      });
      parent.children[position] = child;
      this._checkForCircularDependency(child);
      return child;
    }

    /**
     * @param {Component} component
     */
  }, {
    key: '_checkForCircularDependency',
    value: function _checkForCircularDependency(component) {
      var node = component.parent;
      var last = component;
      while (node) {
        if (node.recipe.name !== null && node.recipe.name === component.recipe.name) {
          throw new _InvalidOperationError2['default']('Detected circular dependency to \'' + component.recipe.name + '\' through \'' + last.recipe.name + '\'.');
        }
        last = node;
        node = node.parent;
      }
    }

    /**
     * @param {Recipe} recipe
     * @param {Object} [defaults]
     * @returns {Component}
     */
  }, {
    key: '_componentFromRecipe',
    value: function _componentFromRecipe(recipe, defaults) {
      var _this3 = this;

      var component = new _Component2['default'](recipe);
      if (defaults) {
        component.parent = defaults.parent;
        component.order = defaults.order;
      }
      component.recipe.ingredients = component.recipe.ingredients.map(function (ingredient) {
        if (typeof ingredient === 'string') {
          return _this3.delegate.resolveName(ingredient, {
            name: component.recipe.name,
            isChildNode: !!component.parent
          });
        } else {
          return ingredient;
        }
      });
      return component;
    }
  }]);

  return Linker;
})();

exports['default'] = Linker;
module.exports = exports['default'];
},{"./Component":4,"./InvalidOperationError":5,"./Recipe":11,"./util":18}],9:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var OptionalLocalResolver = (function () {
  function OptionalLocalResolver(kernel) {
    _classCallCheck(this, OptionalLocalResolver);

    this.kernel = kernel;
    this.pattern = /\?$/;
  }

  /**
   * @param {String} name
   * @param {Object} locals
   */

  _createClass(OptionalLocalResolver, [{
    key: "resolve",
    value: function resolve(name, locals) {
      if (this.pattern.test(name)) {
        name = name.substr(0, name.length - 1);
        return locals[name];
      }
    }
  }]);

  return OptionalLocalResolver;
})();

exports["default"] = OptionalLocalResolver;
;
module.exports = exports["default"];
},{}],10:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var OptionalResolver = (function () {
  function OptionalResolver(kernel) {
    _classCallCheck(this, OptionalResolver);

    this.kernel = kernel;
    this.pattern = /\?$/;
  }

  /**
   * @param {String} name
   */

  _createClass(OptionalResolver, [{
    key: "resolve",
    value: function resolve(name) {
      if (this.pattern.test(name)) {
        name = name.substr(0, name.length - 1);
        if (this.kernel.targetForName(name)) {
          return this.kernel.factoryFor(name);
        } else {
          return function () {
            return undefined;
          };
        }
      }
    }
  }, {
    key: "resolveAsync",
    value: function resolveAsync(name) {
      if (this.pattern.test(name)) {
        name = name.substr(0, name.length - 1);
        if (this.kernel.asyncTargetForName(name)) {
          return this.kernel.factoryForAsync(name);
        } else {
          return Promise.resolve(function () {
            return undefined;
          });
        }
      } else {
        return Promise.resolve();
      }
    }
  }]);

  return OptionalResolver;
})();

exports["default"] = OptionalResolver;
;
module.exports = exports["default"];
},{}],11:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Recipe = (function () {
  /**
   * @param {Object} [defaults]
   */

  function Recipe(defaults) {
    _classCallCheck(this, Recipe);

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
     * @type {Array.<String|Target|Recipe>}
     */
    this.ingredients = (defaults.ingredients || []).slice();
  }

  /**
   * @returns {Recipe}
   */

  _createClass(Recipe, [{
    key: "clone",
    value: function clone() {
      return new Recipe(this);
    }
  }]);

  return Recipe;
})();

exports["default"] = Recipe;
;
module.exports = exports["default"];
},{}],12:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _Recipe = require('./Recipe');

var _Recipe2 = _interopRequireDefault(_Recipe);

var _util = require('./util');

var _ServiceNotFoundError = require('./ServiceNotFoundError');

var _ServiceNotFoundError2 = _interopRequireDefault(_ServiceNotFoundError);

var _InvalidOperationError = require('./InvalidOperationError');

var _InvalidOperationError2 = _interopRequireDefault(_InvalidOperationError);

var Registry = (function () {
  function Registry() {
    _classCallCheck(this, Registry);

    /**
     * @type {Object.<String, Target>}
     */
    this.targets = {};

    /**
     * @type {Object.<String, AsyncTarget>}
     */
    this.asyncTargets = {};

    /**
     * @type {Array.<ResolveHandler>}
     */
    this.resolvers = [];

    /**
     * @type {Array.<AsyncResolveHandler}
     */
    this.asyncResolvers = [];

    /**
     * @type {Array.<RedirectHandler}
     */
    this.redirects = [];
  }

  /**
   * @param {String} name
   * @param {NamedNode} [namedNode]
   * @returns {Recipe}
   */

  _createClass(Registry, [{
    key: 'recipeForName',
    value: function recipeForName(name, namedNode) {
      return this._recipeFromTarget(name, this._locateTarget(name, namedNode));
    }

    /**
     * @param {Array.<String>} names
     * @param {NamedNode} [namedNode]
     * @returns {Promise.<Object.<String, Recipe>>}
     */
  }, {
    key: 'recipesByNameAsync',
    value: function recipesByNameAsync(names, namedNode) {
      var _this = this;

      names = (0, _util.distinct)(names);
      return Promise.all(names.map(function (name) {
        return _this._locateTargetAsync(name, namedNode);
      })).then(function (targets) {
        var recipes = {};
        for (var i = 0; i < names.length; i++) {
          var _name = names[i];
          recipes[_name] = _this._recipeFromTarget(_name, targets[i]);
        }
        return recipes;
      });
    }

    /**
     * @param {String} name
     * @param {NamedNode} [namedNode]
     * @returns {String}
     */
  }, {
    key: 'resolveName',
    value: function resolveName(name, namedNode) {
      var initial = name;
      var history = [];
      while (true) {
        if (history.indexOf(name) > -1) {
          throw new _InvalidOperationError2['default']('Redirect loop encountered while resolving \'' + name + '\' for \'' + initial + '\'');
        } else {
          history.push(name);
        }
        var result = this.redirects.reduce(function (acc, handler) {
          return acc || handler.redirect(name, namedNode);
        }, null);
        if (!result) {
          return name;
        } else {
          name = result;
        }
      }
    }

    /**
     * Returns a new recipe by combining the first recipe with the details from
     * the target.
     * @param {String} name
     * @param {Target} target
     * @returns {Recipe}
     */
  }, {
    key: '_recipeFromTarget',
    value: function _recipeFromTarget(name, target) {
      var _recipeFromTarget2 = (0, _util.recipeFromTarget)(target);

      var ingredients = _recipeFromTarget2.ingredients;
      var create = _recipeFromTarget2.create;

      return new _Recipe2['default']({
        name: name,
        create: create,
        ingredients: ingredients
      });
    }

    /**
     * @param {String} name
     * @param {NamedNode} [namedNode]
     * @returns {Target}
     */
  }, {
    key: '_locateTarget',
    value: function _locateTarget(name, namedNode) {
      if (this.targets[name]) {
        return this.targets[name];
      }
      var target = this.resolvers.reduce(function (target, handler) {
        return target || handler.resolve(name, namedNode);
      }, null);
      if (target === undefined) {
        var message = 'Could not locate service \'' + name + '\'';
        if (namedNode && namedNode.name) {
          message += ' for \'' + namedNode.name + '\'';
        }
        throw new _ServiceNotFoundError2['default'](message);
      } else {
        (0, _util.validateTarget)(target);
      }
      return target;
    }

    /**
     * @param {String} name
     * @param {NamedNode} [namedNode]
     * @returns {Promise.<Target>}
     */
  }, {
    key: '_locateTargetAsync',
    value: function _locateTargetAsync(name, namedNode) {
      var _this2 = this;

      if (this.asyncTargets[name]) {
        return this.asyncTargets[name]();
      }
      if (this.targets[name]) {
        return this.targets[name];
      }
      var resolvers = this.asyncResolvers.slice();
      var next = function next() {
        var resolver = resolvers.shift();
        if (resolver) {
          return resolver.resolveAsync(name, namedNode).then(function (target) {
            return target || next();
          });
        }
      };
      return Promise.resolve().then(next).then(function (target) {
        if (target === undefined) {
          return _this2._locateTarget(name, namedNode);
        } else {
          (0, _util.validateTarget)(target);
        }
        return target;
      });
    }
  }]);

  return Registry;
})();

exports['default'] = Registry;
;
module.exports = exports['default'];
},{"./InvalidOperationError":5,"./Recipe":11,"./ServiceNotFoundError":13,"./util":18}],13:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ServiceNotFoundError = (function (_Error) {
  _inherits(ServiceNotFoundError, _Error);

  function ServiceNotFoundError(message) {
    _classCallCheck(this, ServiceNotFoundError);

    _get(Object.getPrototypeOf(ServiceNotFoundError.prototype), 'constructor', this).call(this);
    this.name = 'ServiceNotFoundError';
    this.message = message;
  }

  return ServiceNotFoundError;
})(Error);

exports['default'] = ServiceNotFoundError;
;
module.exports = exports['default'];
},{}],14:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _AmdResolver = require('./AmdResolver');

var _AmdResolver2 = _interopRequireDefault(_AmdResolver);

var _Bundle = require('./Bundle');

var _Bundle2 = _interopRequireDefault(_Bundle);

var _CommonJsResolver = require('./CommonJsResolver');

var _CommonJsResolver2 = _interopRequireDefault(_CommonJsResolver);

var _InvalidOperationError = require('./InvalidOperationError');

var _InvalidOperationError2 = _interopRequireDefault(_InvalidOperationError);

var _Kernel = require('./Kernel');

var _Kernel2 = _interopRequireDefault(_Kernel);

var _LazyResolver = require('./LazyResolver');

var _LazyResolver2 = _interopRequireDefault(_LazyResolver);

var _ServiceNotFoundError = require('./ServiceNotFoundError');

var _ServiceNotFoundError2 = _interopRequireDefault(_ServiceNotFoundError);

exports['default'] = {
  AmdResolver: _AmdResolver2['default'],
  Bundle: _Bundle2['default'],
  CommonJsResolver: _CommonJsResolver2['default'],
  InvalidOperationError: _InvalidOperationError2['default'],
  Kernel: _Kernel2['default'],
  LazyResolver: _LazyResolver2['default'],
  ServiceNotFoundError: _ServiceNotFoundError2['default']
};
module.exports = exports['default'];
},{"./AmdResolver":1,"./Bundle":2,"./CommonJsResolver":3,"./InvalidOperationError":5,"./Kernel":6,"./LazyResolver":7,"./ServiceNotFoundError":13}],15:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

exports['default'] = function (target) {
  var deps;
  if (typeof target === 'function') {
    deps = target.$inject || [];
  } else {
    deps = target.slice();
    target = deps.pop();
  }
  return deps.concat([target]);
};

;
module.exports = exports['default'];
},{}],16:[function(require,module,exports){
/**
 * Safely combines multiple path segments.
 * @param {...String} paths
 * @returns {String}
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

exports['default'] = function () {
  for (var _len = arguments.length, paths = Array(_len), _key = 0; _key < _len; _key++) {
    paths[_key] = arguments[_key];
  }

  return paths.map(function (path, index) {
    return index === 0 ? path.replace(/\/$/, '') : path.replace(/(^\/|\/$)/g, '');
  }).join('/');
};

;
module.exports = exports['default'];
},{}],17:[function(require,module,exports){
/**
 * @param {Array} items
 * @returns {Array}
 */
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports["default"] = function (items) {
  return items.reduce(function (acc, item) {
    if (acc.indexOf(item) === -1) {
      return acc.concat([item]);
    }
    return acc;
  }, []);
};

;
module.exports = exports["default"];
},{}],18:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _arrayFromTarget = require('./arrayFromTarget');

var _arrayFromTarget2 = _interopRequireDefault(_arrayFromTarget);

var _combinePaths = require('./combinePaths');

var _combinePaths2 = _interopRequireDefault(_combinePaths);

var _distinct = require('./distinct');

var _distinct2 = _interopRequireDefault(_distinct);

var _matchFromPattern = require('./matchFromPattern');

var _matchFromPattern2 = _interopRequireDefault(_matchFromPattern);

var _recipeFromTarget = require('./recipeFromTarget');

var _recipeFromTarget2 = _interopRequireDefault(_recipeFromTarget);

var _validateTarget = require('./validateTarget');

var _validateTarget2 = _interopRequireDefault(_validateTarget);

exports['default'] = {
  arrayFromTarget: _arrayFromTarget2['default'],
  combinePaths: _combinePaths2['default'],
  distinct: _distinct2['default'],
  matchFromPattern: _matchFromPattern2['default'],
  recipeFromTarget: _recipeFromTarget2['default'],
  validateTarget: _validateTarget2['default']
};
module.exports = exports['default'];
},{"./arrayFromTarget":15,"./combinePaths":16,"./distinct":17,"./matchFromPattern":19,"./recipeFromTarget":20,"./validateTarget":21}],19:[function(require,module,exports){
/**
 * @param {Pattern} pattern
 * @returns {Function}
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

exports['default'] = function (pattern) {
  if (typeof pattern === 'function') {
    return pattern;
  }
  if (typeof pattern === 'string') {
    return function (value) {
      return value === pattern;
    };
  }
  return function (value) {
    return pattern.test(value);
  };
};

;
module.exports = exports['default'];
},{}],20:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _Recipe = require('../Recipe');

var _Recipe2 = _interopRequireDefault(_Recipe);

var _arrayFromTarget = require('./arrayFromTarget');

var _arrayFromTarget2 = _interopRequireDefault(_arrayFromTarget);

/**
 * @param {Target} target
 * @returns {Recipe}
 */

exports['default'] = function (target) {
  target = (0, _arrayFromTarget2['default'])(target);
  return new _Recipe2['default']({
    create: target[target.length - 1],
    ingredients: target.slice(0, target.length - 1)
  });
};

;
module.exports = exports['default'];
},{"../Recipe":11,"./arrayFromTarget":15}],21:[function(require,module,exports){
/**
 * @param {Target} target
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

exports['default'] = function (target) {
  if (typeof target !== 'function') {
    if (!Array.isArray(target)) {
      throw new Error('Expected target to be an array or function.');
    }
    if (typeof target[target.length - 1] !== 'function') {
      throw new Error('The last element of an array target should be a function.');
    }
  }
};

;
module.exports = exports['default'];
},{}]},{},[14])(14)
});
//# sourceMappingURL=dialga.js.map?a3ad173f421da77b140dd6d6c9fcf240abe4488b
