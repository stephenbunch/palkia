(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Dialga = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*
 * classList.js: Cross-browser full element.classList implementation.
 * 2014-07-23
 *
 * By Eli Grey, http://eligrey.com
 * Public Domain.
 * NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
 */

/*global self, document, DOMException */

/*! @source http://purl.eligrey.com/github/classList.js/blob/master/classList.js*/

/* Copied from MDN:
 * https://developer.mozilla.org/en-US/docs/Web/API/Element/classList
 */

if ("document" in window.self) {

  // Full polyfill for browsers with no classList support
  if (!("classList" in document.createElement("_"))) {

  (function (view) {

    "use strict";

    if (!('Element' in view)) return;

    var
        classListProp = "classList"
      , protoProp = "prototype"
      , elemCtrProto = view.Element[protoProp]
      , objCtr = Object
      , strTrim = String[protoProp].trim || function () {
        return this.replace(/^\s+|\s+$/g, "");
      }
      , arrIndexOf = Array[protoProp].indexOf || function (item) {
        var
            i = 0
          , len = this.length
        ;
        for (; i < len; i++) {
          if (i in this && this[i] === item) {
            return i;
          }
        }
        return -1;
      }
      // Vendors: please allow content code to instantiate DOMExceptions
      , DOMEx = function (type, message) {
        this.name = type;
        this.code = DOMException[type];
        this.message = message;
      }
      , checkTokenAndGetIndex = function (classList, token) {
        if (token === "") {
          throw new DOMEx(
              "SYNTAX_ERR"
            , "An invalid or illegal string was specified"
          );
        }
        if (/\s/.test(token)) {
          throw new DOMEx(
              "INVALID_CHARACTER_ERR"
            , "String contains an invalid character"
          );
        }
        return arrIndexOf.call(classList, token);
      }
      , ClassList = function (elem) {
        var
            trimmedClasses = strTrim.call(elem.getAttribute("class") || "")
          , classes = trimmedClasses ? trimmedClasses.split(/\s+/) : []
          , i = 0
          , len = classes.length
        ;
        for (; i < len; i++) {
          this.push(classes[i]);
        }
        this._updateClassName = function () {
          elem.setAttribute("class", this.toString());
        };
      }
      , classListProto = ClassList[protoProp] = []
      , classListGetter = function () {
        return new ClassList(this);
      }
    ;
    // Most DOMException implementations don't allow calling DOMException's toString()
    // on non-DOMExceptions. Error's toString() is sufficient here.
    DOMEx[protoProp] = Error[protoProp];
    classListProto.item = function (i) {
      return this[i] || null;
    };
    classListProto.contains = function (token) {
      token += "";
      return checkTokenAndGetIndex(this, token) !== -1;
    };
    classListProto.add = function () {
      var
          tokens = arguments
        , i = 0
        , l = tokens.length
        , token
        , updated = false
      ;
      do {
        token = tokens[i] + "";
        if (checkTokenAndGetIndex(this, token) === -1) {
          this.push(token);
          updated = true;
        }
      }
      while (++i < l);

      if (updated) {
        this._updateClassName();
      }
    };
    classListProto.remove = function () {
      var
          tokens = arguments
        , i = 0
        , l = tokens.length
        , token
        , updated = false
        , index
      ;
      do {
        token = tokens[i] + "";
        index = checkTokenAndGetIndex(this, token);
        while (index !== -1) {
          this.splice(index, 1);
          updated = true;
          index = checkTokenAndGetIndex(this, token);
        }
      }
      while (++i < l);

      if (updated) {
        this._updateClassName();
      }
    };
    classListProto.toggle = function (token, force) {
      token += "";

      var
          result = this.contains(token)
        , method = result ?
          force !== true && "remove"
        :
          force !== false && "add"
      ;

      if (method) {
        this[method](token);
      }

      if (force === true || force === false) {
        return force;
      } else {
        return !result;
      }
    };
    classListProto.toString = function () {
      return this.join(" ");
    };

    if (objCtr.defineProperty) {
      var classListPropDesc = {
          get: classListGetter
        , enumerable: true
        , configurable: true
      };
      try {
        objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
      } catch (ex) { // IE 8 doesn't support enumerable:true
        if (ex.number === -0x7FF5EC54) {
          classListPropDesc.enumerable = false;
          objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
        }
      }
    } else if (objCtr[protoProp].__defineGetter__) {
      elemCtrProto.__defineGetter__(classListProp, classListGetter);
    }

    }(window.self));

    } else {
    // There is full or partial native classList support, so just check if we need
    // to normalize the add/remove and toggle APIs.

    (function () {
      "use strict";

      var testElement = document.createElement("_");

      testElement.classList.add("c1", "c2");

      // Polyfill for IE 10/11 and Firefox <26, where classList.add and
      // classList.remove exist but support only one argument at a time.
      if (!testElement.classList.contains("c2")) {
        var createMethod = function(method) {
          var original = DOMTokenList.prototype[method];

          DOMTokenList.prototype[method] = function(token) {
            var i, len = arguments.length;

            for (i = 0; i < len; i++) {
              token = arguments[i];
              original.call(this, token);
            }
          };
        };
        createMethod('add');
        createMethod('remove');
      }

      testElement.classList.toggle("c3", false);

      // Polyfill for IE 10 and Firefox <24, where classList.toggle does not
      // support the second argument.
      if (testElement.classList.contains("c3")) {
        var _toggle = DOMTokenList.prototype.toggle;

        DOMTokenList.prototype.toggle = function(token, force) {
          if (1 in arguments && !this.contains(token) === !force) {
            return force;
          } else {
            return _toggle.call(this, token);
          }
        };

      }

      testElement = null;
    }());
  }
}

},{}],2:[function(require,module,exports){
/*!
  * $script.js JS loader & dependency manager
  * https://github.com/ded/script.js
  * (c) Dustin Diaz 2014 | License MIT
  */

(function (name, definition) {
  if (typeof module != 'undefined' && module.exports) module.exports = definition()
  else if (typeof define == 'function' && define.amd) define(definition)
  else this[name] = definition()
})('$script', function () {
  var doc = document
    , head = doc.getElementsByTagName('head')[0]
    , s = 'string'
    , f = false
    , push = 'push'
    , readyState = 'readyState'
    , onreadystatechange = 'onreadystatechange'
    , list = {}
    , ids = {}
    , delay = {}
    , scripts = {}
    , scriptpath
    , urlArgs

  function every(ar, fn) {
    for (var i = 0, j = ar.length; i < j; ++i) if (!fn(ar[i])) return f
    return 1
  }
  function each(ar, fn) {
    every(ar, function (el) {
      return !fn(el)
    })
  }

  function $script(paths, idOrDone, optDone) {
    paths = paths[push] ? paths : [paths]
    var idOrDoneIsDone = idOrDone && idOrDone.call
      , done = idOrDoneIsDone ? idOrDone : optDone
      , id = idOrDoneIsDone ? paths.join('') : idOrDone
      , queue = paths.length
    function loopFn(item) {
      return item.call ? item() : list[item]
    }
    function callback() {
      if (!--queue) {
        list[id] = 1
        done && done()
        for (var dset in delay) {
          every(dset.split('|'), loopFn) && !each(delay[dset], loopFn) && (delay[dset] = [])
        }
      }
    }
    setTimeout(function () {
      each(paths, function loading(path, force) {
        if (path === null) return callback()
        
        if (!force && !/^https?:\/\//.test(path) && scriptpath) {
          path = (path.indexOf('.js') === -1) ? scriptpath + path + '.js' : scriptpath + path;
        }
        
        if (scripts[path]) {
          if (id) ids[id] = 1
          return (scripts[path] == 2) ? callback() : setTimeout(function () { loading(path, true) }, 0)
        }

        scripts[path] = 1
        if (id) ids[id] = 1
        create(path, callback)
      })
    }, 0)
    return $script
  }

  function create(path, fn) {
    var el = doc.createElement('script'), loaded
    el.onload = el.onerror = el[onreadystatechange] = function () {
      if ((el[readyState] && !(/^c|loade/.test(el[readyState]))) || loaded) return;
      el.onload = el[onreadystatechange] = null
      loaded = 1
      scripts[path] = 2
      fn()
    }
    el.async = 1
    el.src = urlArgs ? path + (path.indexOf('?') === -1 ? '?' : '&') + urlArgs : path;
    head.insertBefore(el, head.lastChild)
  }

  $script.get = create

  $script.order = function (scripts, id, done) {
    (function callback(s) {
      s = scripts.shift()
      !scripts.length ? $script(s, id, done) : $script(s, callback)
    }())
  }

  $script.path = function (p) {
    scriptpath = p
  }
  $script.urlArgs = function (str) {
    urlArgs = str;
  }
  $script.ready = function (deps, ready, req) {
    deps = deps[push] ? deps : [deps]
    var missing = [];
    !each(deps, function (dep) {
      list[dep] || missing[push](dep);
    }) && every(deps, function (dep) {return list[dep]}) ?
      ready() : !function (key) {
      delay[key] = delay[key] || []
      delay[key][push](ready)
      req && req(missing)
    }(deps.join('|'))
    return $script
  }

  $script.done = function (idOrDone) {
    $script([null], idOrDone)
  }

  return $script
});

},{}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AmdResolver = function () {
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
}();

exports.default = AmdResolver;
;

},{}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = {
  uid: 0,
  pending: {}
};

},{}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Bundle2 = require('../common/Bundle');

var _Bundle3 = _interopRequireDefault(_Bundle2);

var _loadFontAsync2 = require('./util/loadFontAsync');

var _loadFontAsync3 = _interopRequireDefault(_loadFontAsync2);

var _loadScriptAsync2 = require('./util/loadScriptAsync');

var _loadScriptAsync3 = _interopRequireDefault(_loadScriptAsync2);

var _loadStyleAsync2 = require('./util/loadStyleAsync');

var _loadStyleAsync3 = _interopRequireDefault(_loadStyleAsync2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var WebBundle = function (_Bundle) {
  _inherits(WebBundle, _Bundle);

  function WebBundle() {
    _classCallCheck(this, WebBundle);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(WebBundle).apply(this, arguments));
  }

  _createClass(WebBundle, [{
    key: 'loadScriptAsync',


    /**
     * @param {ScriptParams} script
     * @returns {Promise.<*>}
     */
    value: function loadScriptAsync(script) {
      return (0, _loadScriptAsync3.default)(script);
    }

    /**
     * @param {StyleParams} style
     * @returns {Promise}
     */

  }, {
    key: 'loadStyleAsync',
    value: function loadStyleAsync(style) {
      return (0, _loadStyleAsync3.default)(style);
    }

    /**
     * @param {FontParams} font
     * @returns {Promise}
     */

  }, {
    key: 'loadFontAsync',
    value: function () {
      var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(font) {
        var webFont;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return this.resolveAsync('webfont?');

              case 2:
                _context.t0 = _context.sent;

                if (_context.t0) {
                  _context.next = 5;
                  break;
                }

                _context.t0 = window.WebFont;

              case 5:
                webFont = _context.t0;

                if (webFont) {
                  _context.next = 10;
                  break;
                }

                _context.next = 9;
                return this.loadScriptAsync({
                  url: 'https://ajax.googleapis.com/ajax/libs/webfont/1.5.18/webfont.js',
                  get: function get() {
                    return window.WebFont;
                  }
                });

              case 9:
                webFont = _context.sent;

              case 10:
                _context.next = 12;
                return (0, _loadFontAsync3.default)(webFont, font);

              case 12:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function loadFontAsync(_x) {
        return ref.apply(this, arguments);
      }

      return loadFontAsync;
    }()

    /**
     * @param {String} name
     * @param {FontParams} font
     */

  }, {
    key: 'registerFont',
    value: function registerFont(name, font) {
      this._registerFont(name, font, false);
    }

    /**
     * @param {String} name
     * @param {FontParams} font
     */

  }, {
    key: 'registerInternalFont',
    value: function registerInternalFont(name, font) {
      this._registerFont(name, font, true);
    }

    /**
     * @param {String} name
     * @param {ScriptParams} script
     */

  }, {
    key: 'registerScript',
    value: function registerScript(name, script) {
      this._registerScript(name, script, false);
    }

    /**
     * @param {String} name
     * @param {ScriptParams} script
     */

  }, {
    key: 'registerInternalScript',
    value: function registerInternalScript(name, script) {
      this._registerScript(name, script, true);
    }

    /**
     * @param {String} name
     * @param {StyleParams} style
     */

  }, {
    key: 'registerStyle',
    value: function registerStyle(name, style) {
      this._registerStyle(name, style, false);
    }

    /**
     * @param {String} name
     * @param {StyleParams} style
     */

  }, {
    key: 'registerInternalStyle',
    value: function registerInternalStyle(name, style) {
      this._registerStyle(name, style, true);
    }

    /**
     * @param {String} name
     * @param {StyleParams} style
     * @param {Boolean} isInternal
     */

  }, {
    key: '_registerStyle',
    value: function _registerStyle(name, style, isInternal) {
      var _this2 = this;

      var promise;
      this.registerAsyncResolver({
        resolveAsync: function () {
          var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(target) {
            return regeneratorRuntime.wrap(function _callee2$(_context2) {
              while (1) {
                switch (_context2.prev = _context2.next) {
                  case 0:
                    if (!(name === target)) {
                      _context2.next = 3;
                      break;
                    }

                    if (!promise) {
                      promise = _this2.loadStyleAsync(style).then(function () {
                        _this2.register(name);
                        return function () {};
                      });
                    }
                    return _context2.abrupt('return', promise);

                  case 3:
                  case 'end':
                    return _context2.stop();
                }
              }
            }, _callee2, _this2);
          }));

          return function resolveAsync(_x2) {
            return ref.apply(this, arguments);
          };
        }()
      }, isInternal);
    }

    /**
     * @param {String} name
     * @param {ScriptParams} script
     * @param {Boolean} isInternal
     */

  }, {
    key: '_registerScript',
    value: function _registerScript(name, script, isInternal) {
      var _this3 = this;

      var promise;
      this.registerAsyncResolver({
        resolveAsync: function () {
          var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(target) {
            return regeneratorRuntime.wrap(function _callee3$(_context3) {
              while (1) {
                switch (_context3.prev = _context3.next) {
                  case 0:
                    if (!(name === target)) {
                      _context3.next = 3;
                      break;
                    }

                    if (!promise) {
                      promise = _this3.loadScriptAsync(script).then(function (instance) {
                        _this3.register(name, instance);
                        return function () {
                          return instance;
                        };
                      });
                    }
                    return _context3.abrupt('return', promise);

                  case 3:
                  case 'end':
                    return _context3.stop();
                }
              }
            }, _callee3, _this3);
          }));

          return function resolveAsync(_x3) {
            return ref.apply(this, arguments);
          };
        }()
      }, isInternal);
    }

    /**
     * @param {String} name
     * @param {FontParams} font
     * @param {Boolean} isInternal
     */

  }, {
    key: '_registerFont',
    value: function _registerFont(name, font, isInternal) {
      var _this4 = this;

      var promise;
      this.registerAsyncResolver({
        resolveAsync: function () {
          var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee4(target) {
            return regeneratorRuntime.wrap(function _callee4$(_context4) {
              while (1) {
                switch (_context4.prev = _context4.next) {
                  case 0:
                    if (!(name === target)) {
                      _context4.next = 3;
                      break;
                    }

                    if (!promise) {
                      promise = _this4.loadFontAsync(font).then(function () {
                        _this4.register(name);
                        return function () {};
                      });
                    }
                    return _context4.abrupt('return', promise);

                  case 3:
                  case 'end':
                    return _context4.stop();
                }
              }
            }, _callee4, _this4);
          }));

          return function resolveAsync(_x4) {
            return ref.apply(this, arguments);
          };
        }()
      }, isInternal);
    }
  }], [{
    key: 'create',
    value: function create(Bundle, deps) {
      var bundle = new WebBundle();
      return bundle.invoke(Bundle, deps);
    }
  }, {
    key: 'createAsync',
    value: function createAsync(Bundle, deps) {
      var bundle = new WebBundle();
      return bundle.invokeAsync(Bundle, deps);
    }
  }]);

  return WebBundle;
}(_Bundle3.default);

exports.default = WebBundle;
;

},{"../common/Bundle":15,"./util/loadFontAsync":9,"./util/loadScriptAsync":10,"./util/loadStyleAsync":12}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AmdResolver = exports.WebBundle = undefined;

var _common = require('../common');

Object.keys(_common).forEach(function (key) {
  if (key === "default") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _common[key];
    }
  });
});

require('classlist-polyfill');

var _WebBundle2 = require('./WebBundle');

var _WebBundle3 = _interopRequireDefault(_WebBundle2);

var _AmdResolver2 = require('./AmdResolver');

var _AmdResolver3 = _interopRequireDefault(_AmdResolver2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.WebBundle = _WebBundle3.default;
exports.AmdResolver = _AmdResolver3.default;

},{"../common":26,"./AmdResolver":3,"./WebBundle":5,"classlist-polyfill":1}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (name, testString) {
  var elem = document.createElement('div');
  var text = document.createTextNode(testString || 'BESbswy');
  elem.appendChild(text);
  elem.style.position = 'absolute';
  elem.style.top = '0';
  elem.style.left = '-9999px';
  elem.style.fontFamily = 'monospace';
  elem.style.fontSize = '72px';
  document.body.appendChild(elem);
  var width1 = elem.offsetWidth;
  elem.style.fontFamily = '\'' + name + '\', monospace';
  var width2 = elem.offsetWidth;
  document.body.removeChild(elem);
  return width1 !== width2;
};

; /**
   * @param {String} name
   * @returns {Boolean}
   */

},{}],8:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (family) {
  var link = document.querySelector("link[href$=\"" + family + "\"]");
  return link && link.href;
};

; /**
   * @param {String} family
   * @returns {String|null}
   */

},{}],9:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _fontIsLoaded = require('./fontIsLoaded');

var _fontIsLoaded2 = _interopRequireDefault(_fontIsLoaded);

var _hrefForGoogleFont = require('./hrefForGoogleFont');

var _hrefForGoogleFont2 = _interopRequireDefault(_hrefForGoogleFont);

var _moveStyleToTop = require('./moveStyleToTop');

var _moveStyleToTop2 = _interopRequireDefault(_moveStyleToTop);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

/**
 * @param {WebFont} webFont
 * @param {FontParams} font
 * @returns {Promise}
 */

exports.default = function () {
  var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(webFont, font) {
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if ((0, _fontIsLoaded2.default)(font.name, font.testString)) {
              _context.next = 3;
              break;
            }

            _context.next = 3;
            return new Promise(function (resolve) {
              var _config;

              var url;
              var family = font.family || font.name;
              var config = (_config = {}, _defineProperty(_config, font.provider, {
                families: [family]
              }), _defineProperty(_config, 'active', function active() {
                if (!(0, _fontIsLoaded2.default)(font.name, font.testString)) {
                  console.warn('A font was successfully loaded, but the font could not be ' + ('detected. Perhaps the font name "' + font.name + '" is wrong?'));
                }
                switch (font.provider) {
                  case 'custom':
                    (0, _moveStyleToTop2.default)(url, font.order);
                    break;
                  case 'google':
                    var href = (0, _hrefForGoogleFont2.default)(family.replace(/ /g, '+'));
                    if (href) {
                      (0, _moveStyleToTop2.default)(href, font.order);
                    }
                    break;
                }
                resolve();
              }), _config);
              if (font.provider === 'custom') {
                url = typeof font.url === 'function' ? font.url() : font.url;
                config.custom.urls = [url];
                config.custom.testStrings = _defineProperty({}, font.name, font.testString);
              }
              webFont.load(config);
            });

          case 3:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  return function (_x, _x2) {
    return ref.apply(this, arguments);
  };
}();

},{"./fontIsLoaded":7,"./hrefForGoogleFont":8,"./moveStyleToTop":13}],10:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _scriptjs = require('scriptjs');

var _scriptjs2 = _interopRequireDefault(_scriptjs);

var _GLOBAL = require('../GLOBAL');

var _GLOBAL2 = _interopRequireDefault(_GLOBAL);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

/**
 * @param {ScriptParams} script
 * @returns {Promise}
 */

exports.default = function () {
  var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(script) {
    var _this = this;

    var instance, result;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            try {
              instance = script.get();
            } catch (err) {}

            if (instance) {
              _context2.next = 3;
              break;
            }

            return _context2.delegateYield(regeneratorRuntime.mark(function _callee() {
              var url;
              return regeneratorRuntime.wrap(function _callee$(_context) {
                while (1) {
                  switch (_context.prev = _context.next) {
                    case 0:
                      url = typeof script.url === 'function' ? script.url() : script.url;

                      if (!_GLOBAL2.default.pending[url]) {
                        _GLOBAL2.default.pending[url] = new Promise(function (resolve) {
                          if (script.callback) {
                            (function () {
                              var callbackName = 'arceus_callback_' + ++_GLOBAL2.default.uid;
                              window[callbackName] = function () {
                                delete window[callbackName];
                                resolve();
                              };
                              (0, _scriptjs2.default)(url + '&callback=' + callbackName);
                            })();
                          } else {
                            (0, _scriptjs2.default)(url, function () {
                              resolve();
                            });
                          }
                        });
                      }
                      _context.next = 4;
                      return _GLOBAL2.default.pending[url];

                    case 4:
                      delete _GLOBAL2.default.pending[url];
                      instance = script.get();

                      if (instance) {
                        _context.next = 8;
                        break;
                      }

                      throw new Error('A script was loaded successfully from ' + url + ', but the ' + 'module returned undefined. Perhaps the \'get\' function is wrong?');

                    case 8:
                    case 'end':
                      return _context.stop();
                  }
                }
              }, _callee, _this);
            })(), 't0', 3);

          case 3:
            if (!(typeof script.initAsync === 'function')) {
              _context2.next = 8;
              break;
            }

            _context2.next = 6;
            return script.initAsync(instance);

          case 6:
            result = _context2.sent;

            if (result !== undefined) {
              instance = result;
            }

          case 8:
            return _context2.abrupt('return', instance);

          case 9:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, this);
  }));

  return function (_x) {
    return ref.apply(this, arguments);
  };
}();

},{"../GLOBAL":4,"scriptjs":2}],11:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (url, success) {
  var link = document.createElement('link');
  link.href = url;
  link.rel = 'stylesheet';
  link.type = 'text/css';
  link.onload = function () {
    link.onload = null;
    success();
  };
  document.head.appendChild(link);
};

; /**
   * @param {String} url
   * @param {Function} success
   */

},{}],12:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _GLOBAL = require('../GLOBAL');

var _GLOBAL2 = _interopRequireDefault(_GLOBAL);

var _loadStyle = require('./loadStyle');

var _loadStyle2 = _interopRequireDefault(_loadStyle);

var _moveStyleToTop = require('./moveStyleToTop');

var _moveStyleToTop2 = _interopRequireDefault(_moveStyleToTop);

var _styleIsLoaded = require('./styleIsLoaded');

var _styleIsLoaded2 = _interopRequireDefault(_styleIsLoaded);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

/**
 * @param {StyleParams} style
 * @returns {Promise}
 */

exports.default = function () {
  var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(style) {
    var url;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (!(!style.match || !(0, _styleIsLoaded2.default)(style.match))) {
              _context.next = 6;
              break;
            }

            url = typeof style.url === 'function' ? style.url() : style.url;

            if (!_GLOBAL2.default.pending[url]) {
              _GLOBAL2.default.pending[url] = new Promise(function (resolve) {
                (0, _loadStyle2.default)(url, function () {
                  if (style.match && !(0, _styleIsLoaded2.default)(style.match)) {
                    console.warn('A style was successfully loaded from ' + url + ', but the ' + 'match expression returned false.');
                  }
                  (0, _moveStyleToTop2.default)(url, style.order);
                  resolve();
                });
              });
            }
            _context.next = 5;
            return _GLOBAL2.default.pending[url];

          case 5:
            delete _GLOBAL2.default.pending[url];

          case 6:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  return function (_x) {
    return ref.apply(this, arguments);
  };
}();

},{"../GLOBAL":4,"./loadStyle":11,"./moveStyleToTop":13,"./styleIsLoaded":14}],13:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (href, order) {
  order = order || 0;
  var style = queryFirst('link[href=\'' + href + '\'][rel=stylesheet]');
  style.setAttribute('data-order', order);
  if (order === 0) {
    insertBefore(style, queryFirst('link[rel=stylesheet]:not([href=\'' + href + '\'])'));
  } else {
    var stylesWithOrder = queryAll('link[rel=stylesheet][data-order]:not([href=\'' + href + '\'])');
    if (stylesWithOrder.length > 0) {
      var stylesThatComeLater = filter(stylesWithOrder, function (x) {
        return parseInt(x.getAttribute('data-order'), 10) > order;
      });
      if (stylesThatComeLater.length > 0) {
        insertBefore(style, first(stylesThatComeLater));
      } else {
        insertAfter(style, last(stylesWithOrder));
      }
    } else {
      insertBefore(style, queryFirst('link[rel=stylesheet]:not([href=\'' + href + '\'])'));
    }
  }
};

;

/**
 * @param {Node} newNode
 * @param {Node} referenceNode
 */
/**
 * Moves the stylesheet with the specified href to the top of the cascade.
 * @param {String} href
 * @param {Number} [order]
 */
function insertBefore(newNode, referenceNode) {
  referenceNode.parentNode.insertBefore(newNode, referenceNode);
}

/**
 * @param {Node} newNode
 * @param {Node} referenceNode
 */
function insertAfter(newNode, referenceNode) {
  referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

/**
 * @param {Array} array
 * @returns {*}
 */
function first(array) {
  return array[0];
}

/**
 * @param {Array} array
 * @returns {*}
 */
function last(array) {
  return array[array.length - 1];
}

/**
 * @param {ArrayLike} array
 * @returns {Array}
 */
function filter(array, callback) {
  return Array.prototype.filter.call(array, callback);
}

/**
 * @param {String} selector
 * @returns {Element}
 */
function queryFirst(selector) {
  return document.querySelector(selector);
}

/**
 * @param {String} selector
 * @returns {NodeList}
 */
function queryAll(selector) {
  return document.querySelectorAll(selector);
}

},{}],14:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (match) {
  var elem = document.createElement('div');
  elem.style.position = 'absolute';
  elem.style.top = '0';
  elem.style.left = '-9999px';
  match.classList.forEach(function (className) {
    return elem.classList.add(className);
  });
  document.body.appendChild(elem);
  var style = window.getComputedStyle(elem);
  var result = true;
  for (var prop in match.props) {
    if (style.getPropertyValue(prop) !== match.props[prop]) {
      result = false;
      break;
    }
  }
  document.body.removeChild(elem);
  return result;
};

; /**
   * @param {MatchParams} match
   * @returns {Boolean}
   */

},{}],15:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Kernel = require('./Kernel');

var _Kernel2 = _interopRequireDefault(_Kernel);

var _arrayFromTarget = require('./util/arrayFromTarget');

var _arrayFromTarget2 = _interopRequireDefault(_arrayFromTarget);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Bundle = function () {
  function Bundle(name) {
    _classCallCheck(this, Bundle);

    this.name = name;
    this._kernel = new _Kernel2.default();
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

      var _loop = function _loop(key) {
        try {
          var _ret2 = function () {
            // Skip ignored paths.
            var skip = false;
            if (ignore instanceof RegExp) {
              skip = ignore.test(key);
            } else {
              var _iteratorNormalCompletion = true;
              var _didIteratorError = false;
              var _iteratorError = undefined;

              try {
                for (var _iterator = ignore[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
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
                  if (!_iteratorNormalCompletion && _iterator.return) {
                    _iterator.return();
                  }
                } finally {
                  if (_didIteratorError) {
                    throw _iteratorError;
                  }
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

            var f = (0, _arrayFromTarget2.default)(modules[key]);
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
          }();

          if ((typeof _ret2 === 'undefined' ? 'undefined' : _typeof(_ret2)) === "object") return _ret2.v;
        } catch (err) {
          throw new Error('Module registration failed for "' + key + '" because [' + err.message + ']');
        }
      };

      for (var key in modules) {
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
     * @param {String} fromNamespace
     * @param {function(): Bundle} toBundleFactory
     * @param {String} [toNamespace=""]
     */

  }, {
    key: 'registerLinkFactory',
    value: function registerLinkFactory(fromNamespace, toBundleFactory) {
      var toNamespace = arguments.length <= 2 || arguments[2] === undefined ? '' : arguments[2];

      return this._registerLinkFactory(fromNamespace, toBundleFactory, toNamespace, false);
    }

    /**
     * @param {String} fromNamespace
     * @param {function(): Bundle} toBundleFactory
     * @param {String} [toNamespace=""]
     */

  }, {
    key: 'registerInternalLinkFactory',
    value: function registerInternalLinkFactory(fromNamespace, toBundleFactory) {
      var toNamespace = arguments.length <= 2 || arguments[2] === undefined ? '' : arguments[2];

      return this._registerLinkFactory(fromNamespace, toBundleFactory, toNamespace, true);
    }

    /**
     * @param {String} fromNamespace
     * @param {function(): Promise.<Bundle>} toBundleAsyncFactory
     * @param {String} [toNamespace=""]
     */

  }, {
    key: 'registerAsyncLinkFactory',
    value: function registerAsyncLinkFactory(fromNamespace, toBundleAsyncFactory) {
      var toNamespace = arguments.length <= 2 || arguments[2] === undefined ? '' : arguments[2];

      this._registerAsyncLinkFactory(fromNamespace, toBundleAsyncFactory, toNamespace, false);
    }

    /**
     * @param {String} fromNamespace
     * @param {function(): Promise.<Bundle>} toBundleAsyncFactory
     * @param {String} [toNamespace=""]
     */

  }, {
    key: 'registerInternalAsyncLinkFactory',
    value: function registerInternalAsyncLinkFactory(fromNamespace, toBundleAsyncFactory) {
      var toNamespace = arguments.length <= 2 || arguments[2] === undefined ? '' : arguments[2];

      this._registerAsyncLinkFactory(fromNamespace, toBundleAsyncFactory, toNamespace, true);
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
        resolveAsync: function () {
          var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(name, namedNode) {
            return regeneratorRuntime.wrap(function _callee$(_context) {
              while (1) {
                switch (_context.prev = _context.next) {
                  case 0:
                    if (!(!isInternal || namedNode && namedNode.isChildNode)) {
                      _context.next = 2;
                      break;
                    }

                    return _context.abrupt('return', resolver.resolveAsync(name, namedNode));

                  case 2:
                  case 'end':
                    return _context.stop();
                }
              }
            }, _callee, _this2);
          }));

          return function resolveAsync(_x8, _x9) {
            return ref.apply(this, arguments);
          };
        }()
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
        resolveAsync: function () {
          var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(name) {
            return regeneratorRuntime.wrap(function _callee2$(_context2) {
              while (1) {
                switch (_context2.prev = _context2.next) {
                  case 0:
                    if (!name.startsWith(fromNamespace)) {
                      _context2.next = 2;
                      break;
                    }

                    return _context2.abrupt('return', toBundle._kernel.factoryForAsync(toNamespace + name.substr(fromNamespace.length)));

                  case 2:
                  case 'end':
                    return _context2.stop();
                }
              }
            }, _callee2, _this3);
          }));

          return function resolveAsync(_x10) {
            return ref.apply(this, arguments);
          };
        }()
      }, isInternal);
    }

    /**
     * @param {String} fromNamespace
     * @param {function(): Bundle} toBundleFactory
     * @param {String} toNamespace
     * @param {Boolean} isInternal
     */

  }, {
    key: '_registerLinkFactory',
    value: function _registerLinkFactory(fromNamespace, toBundleFactory, toNamespace, isInternal) {
      var _this4 = this;

      var bundle = void 0;
      this.registerResolver({
        resolve: function resolve(name) {
          if (name.startsWith(fromNamespace)) {
            if (!bundle) {
              bundle = toBundleFactory();
            }
            return bundle._kernel.factoryFor(toNamespace + name.substr(fromNamespace.length));
          }
        }
      }, isInternal);
      this.registerAsyncResolver({
        resolveAsync: function () {
          var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(name) {
            return regeneratorRuntime.wrap(function _callee3$(_context3) {
              while (1) {
                switch (_context3.prev = _context3.next) {
                  case 0:
                    if (!name.startsWith(fromNamespace)) {
                      _context3.next = 3;
                      break;
                    }

                    if (!bundle) {
                      bundle = toBundleFactory();
                    }
                    return _context3.abrupt('return', bundle._kernel.factoryForAsync(toNamespace + name.substr(fromNamespace.length)));

                  case 3:
                  case 'end':
                    return _context3.stop();
                }
              }
            }, _callee3, _this4);
          }));

          return function resolveAsync(_x11) {
            return ref.apply(this, arguments);
          };
        }()
      }, isInternal);
    }

    /**
     * @param {String} fromNamespace
     * @param {function(): Promise.<Bundle>} toBundleAsyncFactory
     * @param {String} toNamespace
     * @param {Boolean} isInternal
     */

  }, {
    key: '_registerAsyncLinkFactory',
    value: function _registerAsyncLinkFactory(fromNamespace, toBundleAsyncFactory, toNamespace, isInternal) {
      var _this5 = this;

      var bundle = void 0;
      this.registerAsyncResolver({
        resolveAsync: function () {
          var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee4(name) {
            return regeneratorRuntime.wrap(function _callee4$(_context4) {
              while (1) {
                switch (_context4.prev = _context4.next) {
                  case 0:
                    if (!name.startsWith(fromNamespace)) {
                      _context4.next = 6;
                      break;
                    }

                    if (bundle) {
                      _context4.next = 5;
                      break;
                    }

                    _context4.next = 4;
                    return toBundleAsyncFactory();

                  case 4:
                    bundle = _context4.sent;

                  case 5:
                    return _context4.abrupt('return', bundle._kernel.factoryForAsync(toNamespace + name.substr(fromNamespace.length)));

                  case 6:
                  case 'end':
                    return _context4.stop();
                }
              }
            }, _callee4, _this5);
          }));

          return function resolveAsync(_x12) {
            return ref.apply(this, arguments);
          };
        }()
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
      var _this6 = this;

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
        resolveAsync: function () {
          var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee5(target) {
            return regeneratorRuntime.wrap(function _callee5$(_context5) {
              while (1) {
                switch (_context5.prev = _context5.next) {
                  case 0:
                    if (!(key === target)) {
                      _context5.next = 2;
                      break;
                    }

                    return _context5.abrupt('return', toBundle._kernel.factoryForAsync(toName));

                  case 2:
                  case 'end':
                    return _context5.stop();
                }
              }
            }, _callee5, _this6);
          }));

          return function resolveAsync(_x13) {
            return ref.apply(this, arguments);
          };
        }()
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
}();

exports.default = Bundle;
;

},{"./Kernel":18,"./util/arrayFromTarget":27}],16:[function(require,module,exports){
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

exports.default = Component;
;

},{}],17:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _extendableBuiltin(cls) {
  function ExtendableBuiltin() {
    var instance = Reflect.construct(cls, Array.from(arguments));
    Object.setPrototypeOf(instance, Object.getPrototypeOf(this));
    return instance;
  }

  ExtendableBuiltin.prototype = Object.create(cls.prototype, {
    constructor: {
      value: cls,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });

  if (Object.setPrototypeOf) {
    Object.setPrototypeOf(ExtendableBuiltin, cls);
  } else {
    ExtendableBuiltin.__proto__ = cls;
  }

  return ExtendableBuiltin;
}

var InvalidOperationError = function (_extendableBuiltin2) {
  _inherits(InvalidOperationError, _extendableBuiltin2);

  function InvalidOperationError(message) {
    _classCallCheck(this, InvalidOperationError);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(InvalidOperationError).call(this, message));

    _this.name = 'InvalidOperationError';
    _this.message = message;
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(_this, _this.constructor);
    } else {
      _this.stack = new Error(message).stack;
    }
    return _this;
  }

  return InvalidOperationError;
}(_extendableBuiltin(Error));

exports.default = InvalidOperationError;

},{}],18:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Kernel = function () {
  function Kernel() {
    _classCallCheck(this, Kernel);

    this._registry = new _Registry2.default();
    this._linker = new _Linker2.default();
    this._linker.delegate = this._registry;
    this._registry.resolvers.push(new _LazyResolver2.default(this));
    this._registry.resolvers.push(new _OptionalResolver2.default(this));
    this._registry.asyncResolvers.push(new _OptionalResolver2.default(this));
    this.localResolvers = [new _OptionalLocalResolver2.default(this)];
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
        var _ret = function () {
          var target = _this._registry.targets[name];
          return {
            v: function v() {
              return Promise.resolve(target);
            }
          };
        }();

        if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
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
      return new _Recipe2.default({
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
    }

    /**
     * @param {Array.<ResolveHandler>} value
     */
    ,
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
    }

    /**
     * @param {Array.<AsyncResolveHandler} value
     */
    ,
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
    }

    /**
     * @param {Array.<RedirectHandler} value
     */
    ,
    set: function set(value) {
      this._registry.redirects = value;
    }
  }]);

  return Kernel;
}();

exports.default = Kernel;
;

},{"./LazyResolver":19,"./Linker":20,"./OptionalLocalResolver":21,"./OptionalResolver":22,"./Recipe":23,"./Registry":24,"./util":30}],19:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var LazyResolver = function () {
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
              var promise2 = void 0;
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
}();

exports.default = LazyResolver;
;

},{}],20:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Recipe = require('./Recipe');

var _Recipe2 = _interopRequireDefault(_Recipe);

var _Component = require('./Component');

var _Component2 = _interopRequireDefault(_Component);

var _util = require('./util');

var _InvalidOperationError = require('./InvalidOperationError');

var _InvalidOperationError2 = _interopRequireDefault(_InvalidOperationError);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Linker = function () {
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

      var _loop = function _loop() {
        var component = stack.shift();
        component.recipe.ingredients.forEach(function (ingredient, index) {
          var recipe;
          if (typeof ingredient === 'string') {
            recipe = _this.delegate.recipeForName(ingredient, {
              name: component.recipe.name,
              isChildNode: !!component.parent
            });
          } else if (ingredient instanceof _Recipe2.default) {
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
              } else if (ingredient instanceof _Recipe2.default) {
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
          var _cmp = components[i];
          _cmp.parent.prep[_cmp.order] = _cmp.recipe.create.apply(undefined, _cmp.prep);
          _cmp.prep = [];
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
          throw new _InvalidOperationError2.default('Detected circular dependency to \'' + component.recipe.name + '\' through \'' + last.recipe.name + '\'.');
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

      var component = new _Component2.default(recipe);
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
}();

exports.default = Linker;

},{"./Component":16,"./InvalidOperationError":17,"./Recipe":23,"./util":30}],21:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var OptionalLocalResolver = function () {
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
}();

exports.default = OptionalLocalResolver;
;

},{}],22:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var OptionalResolver = function () {
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
}();

exports.default = OptionalResolver;
;

},{}],23:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Recipe = function () {
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
}();

exports.default = Recipe;
;

},{}],24:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Recipe = require('./Recipe');

var _Recipe2 = _interopRequireDefault(_Recipe);

var _util = require('./util');

var _ServiceNotFoundError = require('./ServiceNotFoundError');

var _ServiceNotFoundError2 = _interopRequireDefault(_ServiceNotFoundError);

var _InvalidOperationError = require('./InvalidOperationError');

var _InvalidOperationError2 = _interopRequireDefault(_InvalidOperationError);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Registry = function () {
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
          var name = names[i];
          recipes[name] = _this._recipeFromTarget(name, targets[i]);
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
          throw new _InvalidOperationError2.default('Redirect loop encountered while resolving \'' + name + '\' for \'' + initial + '\'');
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

      return new _Recipe2.default({
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
        throw new _ServiceNotFoundError2.default(message);
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
}();

exports.default = Registry;
;

},{"./InvalidOperationError":17,"./Recipe":23,"./ServiceNotFoundError":25,"./util":30}],25:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _extendableBuiltin(cls) {
  function ExtendableBuiltin() {
    var instance = Reflect.construct(cls, Array.from(arguments));
    Object.setPrototypeOf(instance, Object.getPrototypeOf(this));
    return instance;
  }

  ExtendableBuiltin.prototype = Object.create(cls.prototype, {
    constructor: {
      value: cls,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });

  if (Object.setPrototypeOf) {
    Object.setPrototypeOf(ExtendableBuiltin, cls);
  } else {
    ExtendableBuiltin.__proto__ = cls;
  }

  return ExtendableBuiltin;
}

var ServiceNotFoundError = function (_extendableBuiltin2) {
  _inherits(ServiceNotFoundError, _extendableBuiltin2);

  function ServiceNotFoundError(message) {
    _classCallCheck(this, ServiceNotFoundError);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(ServiceNotFoundError).call(this, message));

    _this.name = 'ServiceNotFoundError';
    _this.message = message;
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(_this, _this.constructor);
    } else {
      _this.stack = new Error(message).stack;
    }
    return _this;
  }

  return ServiceNotFoundError;
}(_extendableBuiltin(Error));

exports.default = ServiceNotFoundError;

},{}],26:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ServiceNotFoundError = exports.LazyResolver = exports.Kernel = exports.InvalidOperationError = exports.Bundle = undefined;

var _Bundle2 = require('./Bundle');

var _Bundle3 = _interopRequireDefault(_Bundle2);

var _InvalidOperationError2 = require('./InvalidOperationError');

var _InvalidOperationError3 = _interopRequireDefault(_InvalidOperationError2);

var _Kernel2 = require('./Kernel');

var _Kernel3 = _interopRequireDefault(_Kernel2);

var _LazyResolver2 = require('./LazyResolver');

var _LazyResolver3 = _interopRequireDefault(_LazyResolver2);

var _ServiceNotFoundError2 = require('./ServiceNotFoundError');

var _ServiceNotFoundError3 = _interopRequireDefault(_ServiceNotFoundError2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.Bundle = _Bundle3.default;
exports.InvalidOperationError = _InvalidOperationError3.default;
exports.Kernel = _Kernel3.default;
exports.LazyResolver = _LazyResolver3.default;
exports.ServiceNotFoundError = _ServiceNotFoundError3.default;

},{"./Bundle":15,"./InvalidOperationError":17,"./Kernel":18,"./LazyResolver":19,"./ServiceNotFoundError":25}],27:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (target) {
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

},{}],28:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function () {
  for (var _len = arguments.length, paths = Array(_len), _key = 0; _key < _len; _key++) {
    paths[_key] = arguments[_key];
  }

  return paths.map(function (path, index) {
    return index === 0 ? path.replace(/\/$/, '') : path.replace(/(^\/|\/$)/g, '');
  }).join('/');
};

; /**
   * Safely combines multiple path segments.
   * @param {...String} paths
   * @returns {String}
   */

},{}],29:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (items) {
  return items.reduce(function (acc, item) {
    if (acc.indexOf(item) === -1) {
      return acc.concat([item]);
    }
    return acc;
  }, []);
};

; /**
   * @param {Array} items
   * @returns {Array}
   */

},{}],30:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.validateTarget = exports.recipeFromTarget = exports.matchFromPattern = exports.distinct = exports.combinePaths = exports.arrayFromTarget = undefined;

var _arrayFromTarget2 = require('./arrayFromTarget');

var _arrayFromTarget3 = _interopRequireDefault(_arrayFromTarget2);

var _combinePaths2 = require('./combinePaths');

var _combinePaths3 = _interopRequireDefault(_combinePaths2);

var _distinct2 = require('./distinct');

var _distinct3 = _interopRequireDefault(_distinct2);

var _matchFromPattern2 = require('./matchFromPattern');

var _matchFromPattern3 = _interopRequireDefault(_matchFromPattern2);

var _recipeFromTarget2 = require('./recipeFromTarget');

var _recipeFromTarget3 = _interopRequireDefault(_recipeFromTarget2);

var _validateTarget2 = require('./validateTarget');

var _validateTarget3 = _interopRequireDefault(_validateTarget2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.arrayFromTarget = _arrayFromTarget3.default;
exports.combinePaths = _combinePaths3.default;
exports.distinct = _distinct3.default;
exports.matchFromPattern = _matchFromPattern3.default;
exports.recipeFromTarget = _recipeFromTarget3.default;
exports.validateTarget = _validateTarget3.default;

},{"./arrayFromTarget":27,"./combinePaths":28,"./distinct":29,"./matchFromPattern":31,"./recipeFromTarget":32,"./validateTarget":33}],31:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (pattern) {
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

; /**
   * @param {Pattern} pattern
   * @returns {Function}
   */

},{}],32:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (target) {
  target = (0, _arrayFromTarget2.default)(target);
  return new _Recipe2.default({
    create: target[target.length - 1],
    ingredients: target.slice(0, target.length - 1)
  });
};

var _Recipe = require('../Recipe');

var _Recipe2 = _interopRequireDefault(_Recipe);

var _arrayFromTarget = require('./arrayFromTarget');

var _arrayFromTarget2 = _interopRequireDefault(_arrayFromTarget);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

;

/**
 * @param {Target} target
 * @returns {Recipe}
 */

},{"../Recipe":23,"./arrayFromTarget":27}],33:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (target) {
  if (typeof target !== 'function') {
    if (!Array.isArray(target)) {
      throw new Error('Expected target to be an array or function.');
    }
    if (typeof target[target.length - 1] !== 'function') {
      throw new Error('The last element of an array target should be a function.');
    }
  }
};

; /**
   * @param {Target} target
   */

},{}]},{},[6])(6)
});
//# sourceMappingURL=dialga.js.map?f77cd22d572f048c6f3e798e6686d62843f202a8
