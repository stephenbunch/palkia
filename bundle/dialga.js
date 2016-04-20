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
/**
 * lodash 3.2.0 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */
var baseAssign = require('lodash._baseassign'),
    createAssigner = require('lodash._createassigner'),
    keys = require('lodash.keys');

/**
 * A specialized version of `_.assign` for customizing assigned values without
 * support for argument juggling, multiple sources, and `this` binding `customizer`
 * functions.
 *
 * @private
 * @param {Object} object The destination object.
 * @param {Object} source The source object.
 * @param {Function} customizer The function to customize assigned values.
 * @returns {Object} Returns `object`.
 */
function assignWith(object, source, customizer) {
  var index = -1,
      props = keys(source),
      length = props.length;

  while (++index < length) {
    var key = props[index],
        value = object[key],
        result = customizer(value, source[key], key, object, source);

    if ((result === result ? (result !== value) : (value === value)) ||
        (value === undefined && !(key in object))) {
      object[key] = result;
    }
  }
  return object;
}

/**
 * Assigns own enumerable properties of source object(s) to the destination
 * object. Subsequent sources overwrite property assignments of previous sources.
 * If `customizer` is provided it is invoked to produce the assigned values.
 * The `customizer` is bound to `thisArg` and invoked with five arguments:
 * (objectValue, sourceValue, key, object, source).
 *
 * **Note:** This method mutates `object` and is based on
 * [`Object.assign`](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-object.assign).
 *
 * @static
 * @memberOf _
 * @alias extend
 * @category Object
 * @param {Object} object The destination object.
 * @param {...Object} [sources] The source objects.
 * @param {Function} [customizer] The function to customize assigned values.
 * @param {*} [thisArg] The `this` binding of `customizer`.
 * @returns {Object} Returns `object`.
 * @example
 *
 * _.assign({ 'user': 'barney' }, { 'age': 40 }, { 'user': 'fred' });
 * // => { 'user': 'fred', 'age': 40 }
 *
 * // using a customizer callback
 * var defaults = _.partialRight(_.assign, function(value, other) {
 *   return _.isUndefined(value) ? other : value;
 * });
 *
 * defaults({ 'user': 'barney' }, { 'age': 36 }, { 'user': 'fred' });
 * // => { 'user': 'barney', 'age': 36 }
 */
var assign = createAssigner(function(object, source, customizer) {
  return customizer
    ? assignWith(object, source, customizer)
    : baseAssign(object, source);
});

module.exports = assign;

},{"lodash._baseassign":3,"lodash._createassigner":5,"lodash.keys":9}],3:[function(require,module,exports){
/**
 * lodash 3.2.0 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */
var baseCopy = require('lodash._basecopy'),
    keys = require('lodash.keys');

/**
 * The base implementation of `_.assign` without support for argument juggling,
 * multiple sources, and `customizer` functions.
 *
 * @private
 * @param {Object} object The destination object.
 * @param {Object} source The source object.
 * @returns {Object} Returns `object`.
 */
function baseAssign(object, source) {
  return source == null
    ? object
    : baseCopy(source, keys(source), object);
}

module.exports = baseAssign;

},{"lodash._basecopy":4,"lodash.keys":9}],4:[function(require,module,exports){
/**
 * lodash 3.0.1 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */

/**
 * Copies properties of `source` to `object`.
 *
 * @private
 * @param {Object} source The object to copy properties from.
 * @param {Array} props The property names to copy.
 * @param {Object} [object={}] The object to copy properties to.
 * @returns {Object} Returns `object`.
 */
function baseCopy(source, props, object) {
  object || (object = {});

  var index = -1,
      length = props.length;

  while (++index < length) {
    var key = props[index];
    object[key] = source[key];
  }
  return object;
}

module.exports = baseCopy;

},{}],5:[function(require,module,exports){
/**
 * lodash 3.1.1 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */
var bindCallback = require('lodash._bindcallback'),
    isIterateeCall = require('lodash._isiterateecall'),
    restParam = require('lodash.restparam');

/**
 * Creates a function that assigns properties of source object(s) to a given
 * destination object.
 *
 * **Note:** This function is used to create `_.assign`, `_.defaults`, and `_.merge`.
 *
 * @private
 * @param {Function} assigner The function to assign values.
 * @returns {Function} Returns the new assigner function.
 */
function createAssigner(assigner) {
  return restParam(function(object, sources) {
    var index = -1,
        length = object == null ? 0 : sources.length,
        customizer = length > 2 ? sources[length - 2] : undefined,
        guard = length > 2 ? sources[2] : undefined,
        thisArg = length > 1 ? sources[length - 1] : undefined;

    if (typeof customizer == 'function') {
      customizer = bindCallback(customizer, thisArg, 5);
      length -= 2;
    } else {
      customizer = typeof thisArg == 'function' ? thisArg : undefined;
      length -= (customizer ? 1 : 0);
    }
    if (guard && isIterateeCall(sources[0], sources[1], guard)) {
      customizer = length < 3 ? undefined : customizer;
      length = 1;
    }
    while (++index < length) {
      var source = sources[index];
      if (source) {
        assigner(object, source, customizer);
      }
    }
    return object;
  });
}

module.exports = createAssigner;

},{"lodash._bindcallback":6,"lodash._isiterateecall":7,"lodash.restparam":8}],6:[function(require,module,exports){
/**
 * lodash 3.0.1 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */

/**
 * A specialized version of `baseCallback` which only supports `this` binding
 * and specifying the number of arguments to provide to `func`.
 *
 * @private
 * @param {Function} func The function to bind.
 * @param {*} thisArg The `this` binding of `func`.
 * @param {number} [argCount] The number of arguments to provide to `func`.
 * @returns {Function} Returns the callback.
 */
function bindCallback(func, thisArg, argCount) {
  if (typeof func != 'function') {
    return identity;
  }
  if (thisArg === undefined) {
    return func;
  }
  switch (argCount) {
    case 1: return function(value) {
      return func.call(thisArg, value);
    };
    case 3: return function(value, index, collection) {
      return func.call(thisArg, value, index, collection);
    };
    case 4: return function(accumulator, value, index, collection) {
      return func.call(thisArg, accumulator, value, index, collection);
    };
    case 5: return function(value, other, key, object, source) {
      return func.call(thisArg, value, other, key, object, source);
    };
  }
  return function() {
    return func.apply(thisArg, arguments);
  };
}

/**
 * This method returns the first argument provided to it.
 *
 * @static
 * @memberOf _
 * @category Utility
 * @param {*} value Any value.
 * @returns {*} Returns `value`.
 * @example
 *
 * var object = { 'user': 'fred' };
 *
 * _.identity(object) === object;
 * // => true
 */
function identity(value) {
  return value;
}

module.exports = bindCallback;

},{}],7:[function(require,module,exports){
/**
 * lodash 3.0.9 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */

/** Used to detect unsigned integer values. */
var reIsUint = /^\d+$/;

/**
 * Used as the [maximum length](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-number.max_safe_integer)
 * of an array-like value.
 */
var MAX_SAFE_INTEGER = 9007199254740991;

/**
 * The base implementation of `_.property` without support for deep paths.
 *
 * @private
 * @param {string} key The key of the property to get.
 * @returns {Function} Returns the new function.
 */
function baseProperty(key) {
  return function(object) {
    return object == null ? undefined : object[key];
  };
}

/**
 * Gets the "length" property value of `object`.
 *
 * **Note:** This function is used to avoid a [JIT bug](https://bugs.webkit.org/show_bug.cgi?id=142792)
 * that affects Safari on at least iOS 8.1-8.3 ARM64.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {*} Returns the "length" value.
 */
var getLength = baseProperty('length');

/**
 * Checks if `value` is array-like.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
 */
function isArrayLike(value) {
  return value != null && isLength(getLength(value));
}

/**
 * Checks if `value` is a valid array-like index.
 *
 * @private
 * @param {*} value The value to check.
 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
 */
function isIndex(value, length) {
  value = (typeof value == 'number' || reIsUint.test(value)) ? +value : -1;
  length = length == null ? MAX_SAFE_INTEGER : length;
  return value > -1 && value % 1 == 0 && value < length;
}

/**
 * Checks if the provided arguments are from an iteratee call.
 *
 * @private
 * @param {*} value The potential iteratee value argument.
 * @param {*} index The potential iteratee index or key argument.
 * @param {*} object The potential iteratee object argument.
 * @returns {boolean} Returns `true` if the arguments are from an iteratee call, else `false`.
 */
function isIterateeCall(value, index, object) {
  if (!isObject(object)) {
    return false;
  }
  var type = typeof index;
  if (type == 'number'
      ? (isArrayLike(object) && isIndex(index, object.length))
      : (type == 'string' && index in object)) {
    var other = object[index];
    return value === value ? (value === other) : (other !== other);
  }
  return false;
}

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This function is based on [`ToLength`](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength).
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 */
function isLength(value) {
  return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

/**
 * Checks if `value` is the [language type](https://es5.github.io/#x8) of `Object`.
 * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(1);
 * // => false
 */
function isObject(value) {
  // Avoid a V8 JIT bug in Chrome 19-20.
  // See https://code.google.com/p/v8/issues/detail?id=2291 for more details.
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

module.exports = isIterateeCall;

},{}],8:[function(require,module,exports){
/**
 * lodash 3.6.1 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */

/** Used as the `TypeError` message for "Functions" methods. */
var FUNC_ERROR_TEXT = 'Expected a function';

/* Native method references for those with the same name as other `lodash` methods. */
var nativeMax = Math.max;

/**
 * Creates a function that invokes `func` with the `this` binding of the
 * created function and arguments from `start` and beyond provided as an array.
 *
 * **Note:** This method is based on the [rest parameter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/rest_parameters).
 *
 * @static
 * @memberOf _
 * @category Function
 * @param {Function} func The function to apply a rest parameter to.
 * @param {number} [start=func.length-1] The start position of the rest parameter.
 * @returns {Function} Returns the new function.
 * @example
 *
 * var say = _.restParam(function(what, names) {
 *   return what + ' ' + _.initial(names).join(', ') +
 *     (_.size(names) > 1 ? ', & ' : '') + _.last(names);
 * });
 *
 * say('hello', 'fred', 'barney', 'pebbles');
 * // => 'hello fred, barney, & pebbles'
 */
function restParam(func, start) {
  if (typeof func != 'function') {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  start = nativeMax(start === undefined ? (func.length - 1) : (+start || 0), 0);
  return function() {
    var args = arguments,
        index = -1,
        length = nativeMax(args.length - start, 0),
        rest = Array(length);

    while (++index < length) {
      rest[index] = args[start + index];
    }
    switch (start) {
      case 0: return func.call(this, rest);
      case 1: return func.call(this, args[0], rest);
      case 2: return func.call(this, args[0], args[1], rest);
    }
    var otherArgs = Array(start + 1);
    index = -1;
    while (++index < start) {
      otherArgs[index] = args[index];
    }
    otherArgs[start] = rest;
    return func.apply(this, otherArgs);
  };
}

module.exports = restParam;

},{}],9:[function(require,module,exports){
/**
 * lodash 3.1.2 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */
var getNative = require('lodash._getnative'),
    isArguments = require('lodash.isarguments'),
    isArray = require('lodash.isarray');

/** Used to detect unsigned integer values. */
var reIsUint = /^\d+$/;

/** Used for native method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/* Native method references for those with the same name as other `lodash` methods. */
var nativeKeys = getNative(Object, 'keys');

/**
 * Used as the [maximum length](http://ecma-international.org/ecma-262/6.0/#sec-number.max_safe_integer)
 * of an array-like value.
 */
var MAX_SAFE_INTEGER = 9007199254740991;

/**
 * The base implementation of `_.property` without support for deep paths.
 *
 * @private
 * @param {string} key The key of the property to get.
 * @returns {Function} Returns the new function.
 */
function baseProperty(key) {
  return function(object) {
    return object == null ? undefined : object[key];
  };
}

/**
 * Gets the "length" property value of `object`.
 *
 * **Note:** This function is used to avoid a [JIT bug](https://bugs.webkit.org/show_bug.cgi?id=142792)
 * that affects Safari on at least iOS 8.1-8.3 ARM64.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {*} Returns the "length" value.
 */
var getLength = baseProperty('length');

/**
 * Checks if `value` is array-like.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
 */
function isArrayLike(value) {
  return value != null && isLength(getLength(value));
}

/**
 * Checks if `value` is a valid array-like index.
 *
 * @private
 * @param {*} value The value to check.
 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
 */
function isIndex(value, length) {
  value = (typeof value == 'number' || reIsUint.test(value)) ? +value : -1;
  length = length == null ? MAX_SAFE_INTEGER : length;
  return value > -1 && value % 1 == 0 && value < length;
}

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This function is based on [`ToLength`](http://ecma-international.org/ecma-262/6.0/#sec-tolength).
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 */
function isLength(value) {
  return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

/**
 * A fallback implementation of `Object.keys` which creates an array of the
 * own enumerable property names of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function shimKeys(object) {
  var props = keysIn(object),
      propsLength = props.length,
      length = propsLength && object.length;

  var allowIndexes = !!length && isLength(length) &&
    (isArray(object) || isArguments(object));

  var index = -1,
      result = [];

  while (++index < propsLength) {
    var key = props[index];
    if ((allowIndexes && isIndex(key, length)) || hasOwnProperty.call(object, key)) {
      result.push(key);
    }
  }
  return result;
}

/**
 * Checks if `value` is the [language type](https://es5.github.io/#x8) of `Object`.
 * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(1);
 * // => false
 */
function isObject(value) {
  // Avoid a V8 JIT bug in Chrome 19-20.
  // See https://code.google.com/p/v8/issues/detail?id=2291 for more details.
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

/**
 * Creates an array of the own enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects. See the
 * [ES spec](http://ecma-international.org/ecma-262/6.0/#sec-object.keys)
 * for more details.
 *
 * @static
 * @memberOf _
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keys(new Foo);
 * // => ['a', 'b'] (iteration order is not guaranteed)
 *
 * _.keys('hi');
 * // => ['0', '1']
 */
var keys = !nativeKeys ? shimKeys : function(object) {
  var Ctor = object == null ? undefined : object.constructor;
  if ((typeof Ctor == 'function' && Ctor.prototype === object) ||
      (typeof object != 'function' && isArrayLike(object))) {
    return shimKeys(object);
  }
  return isObject(object) ? nativeKeys(object) : [];
};

/**
 * Creates an array of the own and inherited enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects.
 *
 * @static
 * @memberOf _
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keysIn(new Foo);
 * // => ['a', 'b', 'c'] (iteration order is not guaranteed)
 */
function keysIn(object) {
  if (object == null) {
    return [];
  }
  if (!isObject(object)) {
    object = Object(object);
  }
  var length = object.length;
  length = (length && isLength(length) &&
    (isArray(object) || isArguments(object)) && length) || 0;

  var Ctor = object.constructor,
      index = -1,
      isProto = typeof Ctor == 'function' && Ctor.prototype === object,
      result = Array(length),
      skipIndexes = length > 0;

  while (++index < length) {
    result[index] = (index + '');
  }
  for (var key in object) {
    if (!(skipIndexes && isIndex(key, length)) &&
        !(key == 'constructor' && (isProto || !hasOwnProperty.call(object, key)))) {
      result.push(key);
    }
  }
  return result;
}

module.exports = keys;

},{"lodash._getnative":10,"lodash.isarguments":11,"lodash.isarray":12}],10:[function(require,module,exports){
/**
 * lodash 3.9.1 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */

/** `Object#toString` result references. */
var funcTag = '[object Function]';

/** Used to detect host constructors (Safari > 5). */
var reIsHostCtor = /^\[object .+?Constructor\]$/;

/**
 * Checks if `value` is object-like.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

/** Used for native method references. */
var objectProto = Object.prototype;

/** Used to resolve the decompiled source of functions. */
var fnToString = Function.prototype.toString;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
 * of values.
 */
var objToString = objectProto.toString;

/** Used to detect if a method is native. */
var reIsNative = RegExp('^' +
  fnToString.call(hasOwnProperty).replace(/[\\^$.*+?()[\]{}|]/g, '\\$&')
  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
);

/**
 * Gets the native function at `key` of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the method to get.
 * @returns {*} Returns the function if it's native, else `undefined`.
 */
function getNative(object, key) {
  var value = object == null ? undefined : object[key];
  return isNative(value) ? value : undefined;
}

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction(value) {
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in older versions of Chrome and Safari which return 'function' for regexes
  // and Safari 8 equivalents which return 'object' for typed array constructors.
  return isObject(value) && objToString.call(value) == funcTag;
}

/**
 * Checks if `value` is the [language type](https://es5.github.io/#x8) of `Object`.
 * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(1);
 * // => false
 */
function isObject(value) {
  // Avoid a V8 JIT bug in Chrome 19-20.
  // See https://code.google.com/p/v8/issues/detail?id=2291 for more details.
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

/**
 * Checks if `value` is a native function.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a native function, else `false`.
 * @example
 *
 * _.isNative(Array.prototype.push);
 * // => true
 *
 * _.isNative(_);
 * // => false
 */
function isNative(value) {
  if (value == null) {
    return false;
  }
  if (isFunction(value)) {
    return reIsNative.test(fnToString.call(value));
  }
  return isObjectLike(value) && reIsHostCtor.test(value);
}

module.exports = getNative;

},{}],11:[function(require,module,exports){
/**
 * lodash 3.0.7 (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright 2012-2016 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2016 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */

/** Used as references for various `Number` constants. */
var MAX_SAFE_INTEGER = 9007199254740991;

/** `Object#toString` result references. */
var argsTag = '[object Arguments]',
    funcTag = '[object Function]',
    genTag = '[object GeneratorFunction]';

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/** Built-in value references. */
var propertyIsEnumerable = objectProto.propertyIsEnumerable;

/**
 * The base implementation of `_.property` without support for deep paths.
 *
 * @private
 * @param {string} key The key of the property to get.
 * @returns {Function} Returns the new function.
 */
function baseProperty(key) {
  return function(object) {
    return object == null ? undefined : object[key];
  };
}

/**
 * Gets the "length" property value of `object`.
 *
 * **Note:** This function is used to avoid a [JIT bug](https://bugs.webkit.org/show_bug.cgi?id=142792)
 * that affects Safari on at least iOS 8.1-8.3 ARM64.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {*} Returns the "length" value.
 */
var getLength = baseProperty('length');

/**
 * Checks if `value` is likely an `arguments` object.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
 * @example
 *
 * _.isArguments(function() { return arguments; }());
 * // => true
 *
 * _.isArguments([1, 2, 3]);
 * // => false
 */
function isArguments(value) {
  // Safari 8.1 incorrectly makes `arguments.callee` enumerable in strict mode.
  return isArrayLikeObject(value) && hasOwnProperty.call(value, 'callee') &&
    (!propertyIsEnumerable.call(value, 'callee') || objectToString.call(value) == argsTag);
}

/**
 * Checks if `value` is array-like. A value is considered array-like if it's
 * not a function and has a `value.length` that's an integer greater than or
 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
 * @example
 *
 * _.isArrayLike([1, 2, 3]);
 * // => true
 *
 * _.isArrayLike(document.body.children);
 * // => true
 *
 * _.isArrayLike('abc');
 * // => true
 *
 * _.isArrayLike(_.noop);
 * // => false
 */
function isArrayLike(value) {
  return value != null &&
    !(typeof value == 'function' && isFunction(value)) && isLength(getLength(value));
}

/**
 * This method is like `_.isArrayLike` except that it also checks if `value`
 * is an object.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array-like object, else `false`.
 * @example
 *
 * _.isArrayLikeObject([1, 2, 3]);
 * // => true
 *
 * _.isArrayLikeObject(document.body.children);
 * // => true
 *
 * _.isArrayLikeObject('abc');
 * // => false
 *
 * _.isArrayLikeObject(_.noop);
 * // => false
 */
function isArrayLikeObject(value) {
  return isObjectLike(value) && isArrayLike(value);
}

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction(value) {
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 8 which returns 'object' for typed array constructors, and
  // PhantomJS 1.9 which returns 'function' for `NodeList` instances.
  var tag = isObject(value) ? objectToString.call(value) : '';
  return tag == funcTag || tag == genTag;
}

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This function is loosely based on [`ToLength`](http://ecma-international.org/ecma-262/6.0/#sec-tolength).
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 * @example
 *
 * _.isLength(3);
 * // => true
 *
 * _.isLength(Number.MIN_VALUE);
 * // => false
 *
 * _.isLength(Infinity);
 * // => false
 *
 * _.isLength('3');
 * // => false
 */
function isLength(value) {
  return typeof value == 'number' &&
    value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

/**
 * Checks if `value` is the [language type](https://es5.github.io/#x8) of `Object`.
 * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

module.exports = isArguments;

},{}],12:[function(require,module,exports){
/**
 * lodash 3.0.4 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */

/** `Object#toString` result references. */
var arrayTag = '[object Array]',
    funcTag = '[object Function]';

/** Used to detect host constructors (Safari > 5). */
var reIsHostCtor = /^\[object .+?Constructor\]$/;

/**
 * Checks if `value` is object-like.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

/** Used for native method references. */
var objectProto = Object.prototype;

/** Used to resolve the decompiled source of functions. */
var fnToString = Function.prototype.toString;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
 * of values.
 */
var objToString = objectProto.toString;

/** Used to detect if a method is native. */
var reIsNative = RegExp('^' +
  fnToString.call(hasOwnProperty).replace(/[\\^$.*+?()[\]{}|]/g, '\\$&')
  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
);

/* Native method references for those with the same name as other `lodash` methods. */
var nativeIsArray = getNative(Array, 'isArray');

/**
 * Used as the [maximum length](http://ecma-international.org/ecma-262/6.0/#sec-number.max_safe_integer)
 * of an array-like value.
 */
var MAX_SAFE_INTEGER = 9007199254740991;

/**
 * Gets the native function at `key` of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the method to get.
 * @returns {*} Returns the function if it's native, else `undefined`.
 */
function getNative(object, key) {
  var value = object == null ? undefined : object[key];
  return isNative(value) ? value : undefined;
}

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This function is based on [`ToLength`](http://ecma-international.org/ecma-262/6.0/#sec-tolength).
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 */
function isLength(value) {
  return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

/**
 * Checks if `value` is classified as an `Array` object.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
 * @example
 *
 * _.isArray([1, 2, 3]);
 * // => true
 *
 * _.isArray(function() { return arguments; }());
 * // => false
 */
var isArray = nativeIsArray || function(value) {
  return isObjectLike(value) && isLength(value.length) && objToString.call(value) == arrayTag;
};

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction(value) {
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in older versions of Chrome and Safari which return 'function' for regexes
  // and Safari 8 equivalents which return 'object' for typed array constructors.
  return isObject(value) && objToString.call(value) == funcTag;
}

/**
 * Checks if `value` is the [language type](https://es5.github.io/#x8) of `Object`.
 * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(1);
 * // => false
 */
function isObject(value) {
  // Avoid a V8 JIT bug in Chrome 19-20.
  // See https://code.google.com/p/v8/issues/detail?id=2291 for more details.
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

/**
 * Checks if `value` is a native function.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a native function, else `false`.
 * @example
 *
 * _.isNative(Array.prototype.push);
 * // => true
 *
 * _.isNative(_);
 * // => false
 */
function isNative(value) {
  if (value == null) {
    return false;
  }
  if (isFunction(value)) {
    return reIsNative.test(fnToString.call(value));
  }
  return isObjectLike(value) && reIsHostCtor.test(value);
}

module.exports = isArray;

},{}],13:[function(require,module,exports){
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

},{}],14:[function(require,module,exports){
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
},{}],15:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = {
  uid: 0,
  pending: {}
};
module.exports = exports["default"];
},{}],16:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _commonBundle = require('../common/Bundle');

var _commonBundle2 = _interopRequireDefault(_commonBundle);

var _utilLoadFontAsync = require('./util/loadFontAsync');

var _utilLoadFontAsync2 = _interopRequireDefault(_utilLoadFontAsync);

var _utilLoadScriptAsync = require('./util/loadScriptAsync');

var _utilLoadScriptAsync2 = _interopRequireDefault(_utilLoadScriptAsync);

var _utilLoadStyleAsync = require('./util/loadStyleAsync');

var _utilLoadStyleAsync2 = _interopRequireDefault(_utilLoadStyleAsync);

var WebBundle = (function (_Bundle) {
  _inherits(WebBundle, _Bundle);

  function WebBundle() {
    _classCallCheck(this, WebBundle);

    _get(Object.getPrototypeOf(WebBundle.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(WebBundle, [{
    key: 'loadScriptAsync',

    /**
     * @param {ScriptParams} script
     * @returns {Promise.<*>}
     */
    value: function loadScriptAsync(script) {
      return (0, _utilLoadScriptAsync2['default'])(script);
    }

    /**
     * @param {StyleParams} style
     * @returns {Promise}
     */
  }, {
    key: 'loadStyleAsync',
    value: function loadStyleAsync(style) {
      return (0, _utilLoadStyleAsync2['default'])(style);
    }

    /**
     * @param {FontParams} font
     * @returns {Promise}
     */
  }, {
    key: 'loadFontAsync',
    value: function loadFontAsync(font) {
      var webFont;
      return regeneratorRuntime.async(function loadFontAsync$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            context$2$0.next = 2;
            return regeneratorRuntime.awrap(this.resolveAsync('webfont?'));

          case 2:
            context$2$0.t0 = context$2$0.sent;

            if (context$2$0.t0) {
              context$2$0.next = 5;
              break;
            }

            context$2$0.t0 = window.WebFont;

          case 5:
            webFont = context$2$0.t0;

            if (webFont) {
              context$2$0.next = 10;
              break;
            }

            context$2$0.next = 9;
            return regeneratorRuntime.awrap(this.loadScriptAsync({
              url: 'https://ajax.googleapis.com/ajax/libs/webfont/1.5.18/webfont.js',
              get: function get() {
                return window.WebFont;
              }
            }));

          case 9:
            webFont = context$2$0.sent;

          case 10:
            context$2$0.next = 12;
            return regeneratorRuntime.awrap((0, _utilLoadFontAsync2['default'])(webFont, font));

          case 12:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this);
    }

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
        resolveAsync: function resolveAsync(target) {
          return regeneratorRuntime.async(function resolveAsync$(context$3$0) {
            var _this = this;

            while (1) switch (context$3$0.prev = context$3$0.next) {
              case 0:
                if (!(name === target)) {
                  context$3$0.next = 3;
                  break;
                }

                if (!promise) {
                  promise = this.loadStyleAsync(style).then(function () {
                    _this.register(name);
                    return function () {};
                  });
                }
                return context$3$0.abrupt('return', promise);

              case 3:
              case 'end':
                return context$3$0.stop();
            }
          }, null, _this2);
        }
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
      var _this4 = this;

      var promise;
      this.registerAsyncResolver({
        resolveAsync: function resolveAsync(target) {
          return regeneratorRuntime.async(function resolveAsync$(context$3$0) {
            var _this3 = this;

            while (1) switch (context$3$0.prev = context$3$0.next) {
              case 0:
                if (!(name === target)) {
                  context$3$0.next = 3;
                  break;
                }

                if (!promise) {
                  promise = this.loadScriptAsync(script).then(function (instance) {
                    _this3.register(name, instance);
                    return function () {
                      return instance;
                    };
                  });
                }
                return context$3$0.abrupt('return', promise);

              case 3:
              case 'end':
                return context$3$0.stop();
            }
          }, null, _this4);
        }
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
      var _this6 = this;

      var promise;
      this.registerAsyncResolver({
        resolveAsync: function resolveAsync(target) {
          return regeneratorRuntime.async(function resolveAsync$(context$3$0) {
            var _this5 = this;

            while (1) switch (context$3$0.prev = context$3$0.next) {
              case 0:
                if (!(name === target)) {
                  context$3$0.next = 3;
                  break;
                }

                if (!promise) {
                  promise = this.loadFontAsync(font).then(function () {
                    _this5.register(name);
                    return function () {};
                  });
                }
                return context$3$0.abrupt('return', promise);

              case 3:
              case 'end':
                return context$3$0.stop();
            }
          }, null, _this6);
        }
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
})(_commonBundle2['default']);

exports['default'] = WebBundle;
;
module.exports = exports['default'];
},{"../common/Bundle":26,"./util/loadFontAsync":20,"./util/loadScriptAsync":21,"./util/loadStyleAsync":23}],17:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _lodashAssign = require('lodash.assign');

var _lodashAssign2 = _interopRequireDefault(_lodashAssign);

require('classlist-polyfill');

var _common = require('../common');

var _common2 = _interopRequireDefault(_common);

var _WebBundle = require('./WebBundle');

var _WebBundle2 = _interopRequireDefault(_WebBundle);

var _AmdResolver = require('./AmdResolver');

var _AmdResolver2 = _interopRequireDefault(_AmdResolver);

exports['default'] = (0, _lodashAssign2['default'])({}, _common2['default'], {
  WebBundle: _WebBundle2['default'],
  AmdResolver: _AmdResolver2['default']
});
module.exports = exports['default'];
},{"../common":37,"./AmdResolver":14,"./WebBundle":16,"classlist-polyfill":1,"lodash.assign":2}],18:[function(require,module,exports){
/**
 * @param {String} name
 * @returns {Boolean}
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

exports['default'] = function (name, testString) {
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

;
module.exports = exports['default'];
},{}],19:[function(require,module,exports){
/**
 * @param {String} family
 * @returns {String|null}
 */
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports["default"] = function (family) {
  var link = document.querySelector("link[href$=\"" + family + "\"]");
  return link && link.href;
};

;
module.exports = exports["default"];
},{}],20:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _fontIsLoaded = require('./fontIsLoaded');

var _fontIsLoaded2 = _interopRequireDefault(_fontIsLoaded);

var _hrefForGoogleFont = require('./hrefForGoogleFont');

var _hrefForGoogleFont2 = _interopRequireDefault(_hrefForGoogleFont);

var _moveStyleToTop = require('./moveStyleToTop');

var _moveStyleToTop2 = _interopRequireDefault(_moveStyleToTop);

/**
 * @param {WebFont} webFont
 * @param {FontParams} font
 * @returns {Promise}
 */

exports['default'] = function callee$0$0(webFont, font) {
  return regeneratorRuntime.async(function callee$0$0$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        if ((0, _fontIsLoaded2['default'])(font.name, font.testString)) {
          context$1$0.next = 3;
          break;
        }

        context$1$0.next = 3;
        return regeneratorRuntime.awrap(new Promise(function (resolve) {
          var _config;

          var url;
          var family = font.family || font.name;
          var config = (_config = {}, _defineProperty(_config, font.provider, {
            families: [family]
          }), _defineProperty(_config, 'active', function active() {
            if (!(0, _fontIsLoaded2['default'])(font.name, font.testString)) {
              console.warn('A font was successfully loaded, but the font could not be ' + ('detected. Perhaps the font name "' + font.name + '" is wrong?'));
            }
            switch (font.provider) {
              case 'custom':
                (0, _moveStyleToTop2['default'])(url, font.order);
                break;
              case 'google':
                var href = (0, _hrefForGoogleFont2['default'])(family.replace(/ /g, '+'));
                if (href) {
                  (0, _moveStyleToTop2['default'])(href, font.order);
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
        }));

      case 3:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this);
};

module.exports = exports['default'];
},{"./fontIsLoaded":18,"./hrefForGoogleFont":19,"./moveStyleToTop":24}],21:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _scriptjs = require('scriptjs');

var _scriptjs2 = _interopRequireDefault(_scriptjs);

var _GLOBAL = require('../GLOBAL');

var _GLOBAL2 = _interopRequireDefault(_GLOBAL);

/**
 * @param {ScriptParams} script
 * @returns {Promise}
 */

exports['default'] = function callee$0$0(script) {
  var instance, result;
  return regeneratorRuntime.async(function callee$0$0$(context$1$0) {
    var _this = this;

    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        try {
          instance = script.get();
        } catch (err) {}

        if (instance) {
          context$1$0.next = 4;
          break;
        }

        context$1$0.next = 4;
        return regeneratorRuntime.awrap((function callee$1$0() {
          var url;
          return regeneratorRuntime.async(function callee$1$0$(context$2$0) {
            while (1) switch (context$2$0.prev = context$2$0.next) {
              case 0:
                url = typeof script.url === 'function' ? script.url() : script.url;

                if (!_GLOBAL2['default'].pending[url]) {
                  _GLOBAL2['default'].pending[url] = new Promise(function (resolve) {
                    if (script.callback) {
                      (function () {
                        var callbackName = 'arceus_callback_' + ++_GLOBAL2['default'].uid;
                        window[callbackName] = function () {
                          delete window[callbackName];
                          resolve();
                        };
                        (0, _scriptjs2['default'])(url + '&callback=' + callbackName);
                      })();
                    } else {
                      (0, _scriptjs2['default'])(url, function () {
                        resolve();
                      });
                    }
                  });
                }
                context$2$0.next = 4;
                return regeneratorRuntime.awrap(_GLOBAL2['default'].pending[url]);

              case 4:
                delete _GLOBAL2['default'].pending[url];
                instance = script.get();

                if (instance) {
                  context$2$0.next = 8;
                  break;
                }

                throw new Error('A script was loaded successfully from ' + url + ', but the ' + 'module returned undefined. Perhaps the \'get\' function is wrong?');

              case 8:
              case 'end':
                return context$2$0.stop();
            }
          }, null, _this);
        })());

      case 4:
        if (!(typeof script.initAsync === 'function')) {
          context$1$0.next = 9;
          break;
        }

        context$1$0.next = 7;
        return regeneratorRuntime.awrap(script.initAsync(instance));

      case 7:
        result = context$1$0.sent;

        if (result !== undefined) {
          instance = result;
        }

      case 9:
        return context$1$0.abrupt('return', instance);

      case 10:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this);
};

module.exports = exports['default'];
},{"../GLOBAL":15,"scriptjs":13}],22:[function(require,module,exports){
/**
 * @param {String} url
 * @param {Function} success
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

exports['default'] = function (url, success) {
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

;
module.exports = exports['default'];
},{}],23:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _GLOBAL = require('../GLOBAL');

var _GLOBAL2 = _interopRequireDefault(_GLOBAL);

var _loadStyle = require('./loadStyle');

var _loadStyle2 = _interopRequireDefault(_loadStyle);

var _moveStyleToTop = require('./moveStyleToTop');

var _moveStyleToTop2 = _interopRequireDefault(_moveStyleToTop);

var _styleIsLoaded = require('./styleIsLoaded');

var _styleIsLoaded2 = _interopRequireDefault(_styleIsLoaded);

/**
 * @param {StyleParams} style
 * @returns {Promise}
 */

exports['default'] = function callee$0$0(style) {
  var url;
  return regeneratorRuntime.async(function callee$0$0$(context$1$0) {
    while (1) switch (context$1$0.prev = context$1$0.next) {
      case 0:
        if (!(!style.match || !(0, _styleIsLoaded2['default'])(style.match))) {
          context$1$0.next = 6;
          break;
        }

        url = typeof style.url === 'function' ? style.url() : style.url;

        if (!_GLOBAL2['default'].pending[url]) {
          _GLOBAL2['default'].pending[url] = new Promise(function (resolve) {
            (0, _loadStyle2['default'])(url, function () {
              if (style.match && !(0, _styleIsLoaded2['default'])(style.match)) {
                console.warn('A style was successfully loaded from ' + url + ', but the ' + 'match expression returned false.');
              }
              (0, _moveStyleToTop2['default'])(url, style.order);
              resolve();
            });
          });
        }
        context$1$0.next = 5;
        return regeneratorRuntime.awrap(_GLOBAL2['default'].pending[url]);

      case 5:
        delete _GLOBAL2['default'].pending[url];

      case 6:
      case 'end':
        return context$1$0.stop();
    }
  }, null, this);
};

module.exports = exports['default'];
},{"../GLOBAL":15,"./loadStyle":22,"./moveStyleToTop":24,"./styleIsLoaded":25}],24:[function(require,module,exports){
/**
 * Moves the stylesheet with the specified href to the top of the cascade.
 * @param {String} href
 * @param {Number} [order]
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

exports['default'] = function (href, order) {
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
module.exports = exports['default'];
},{}],25:[function(require,module,exports){
/**
 * @param {MatchParams} match
 * @returns {Boolean}
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

exports['default'] = function (match) {
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

;
module.exports = exports['default'];
},{}],26:[function(require,module,exports){
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
            if (ignore instanceof RegExp) {
              skip = ignore.test(key);
            } else {
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
     * @param {String} fromNamespace
     * @param {function(): Bundle} toBundleFactory
     * @param {String} toNamespace
     * @param {Boolean} isInternal
     */
  }, {
    key: '_registerLinkFactory',
    value: function _registerLinkFactory(fromNamespace, toBundleFactory, toNamespace, isInternal) {
      var _this4 = this;

      var bundle = undefined;
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
        resolveAsync: function resolveAsync(name) {
          return regeneratorRuntime.async(function resolveAsync$(context$3$0) {
            while (1) switch (context$3$0.prev = context$3$0.next) {
              case 0:
                if (!name.startsWith(fromNamespace)) {
                  context$3$0.next = 3;
                  break;
                }

                if (!bundle) {
                  bundle = toBundleFactory();
                }
                return context$3$0.abrupt('return', bundle._kernel.factoryForAsync(toNamespace + name.substr(fromNamespace.length)));

              case 3:
              case 'end':
                return context$3$0.stop();
            }
          }, null, _this4);
        }
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

      var bundle = undefined;
      this.registerAsyncResolver({
        resolveAsync: function resolveAsync(name) {
          return regeneratorRuntime.async(function resolveAsync$(context$3$0) {
            while (1) switch (context$3$0.prev = context$3$0.next) {
              case 0:
                if (!name.startsWith(fromNamespace)) {
                  context$3$0.next = 6;
                  break;
                }

                if (bundle) {
                  context$3$0.next = 5;
                  break;
                }

                context$3$0.next = 4;
                return regeneratorRuntime.awrap(toBundleAsyncFactory());

              case 4:
                bundle = context$3$0.sent;

              case 5:
                return context$3$0.abrupt('return', bundle._kernel.factoryForAsync(toNamespace + name.substr(fromNamespace.length)));

              case 6:
              case 'end':
                return context$3$0.stop();
            }
          }, null, _this5);
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
          }, null, _this6);
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
},{"./Kernel":29,"./util/arrayFromTarget":38}],27:[function(require,module,exports){
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
},{}],28:[function(require,module,exports){
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
},{}],29:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

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
},{"./LazyResolver":30,"./Linker":31,"./OptionalLocalResolver":32,"./OptionalResolver":33,"./Recipe":34,"./Registry":35,"./util":41}],30:[function(require,module,exports){
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
},{}],31:[function(require,module,exports){
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
},{"./Component":27,"./InvalidOperationError":28,"./Recipe":34,"./util":41}],32:[function(require,module,exports){
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
},{}],33:[function(require,module,exports){
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
},{}],34:[function(require,module,exports){
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
},{}],35:[function(require,module,exports){
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
},{"./InvalidOperationError":28,"./Recipe":34,"./ServiceNotFoundError":36,"./util":41}],36:[function(require,module,exports){
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
},{}],37:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _Bundle = require('./Bundle');

var _Bundle2 = _interopRequireDefault(_Bundle);

var _InvalidOperationError = require('./InvalidOperationError');

var _InvalidOperationError2 = _interopRequireDefault(_InvalidOperationError);

var _Kernel = require('./Kernel');

var _Kernel2 = _interopRequireDefault(_Kernel);

var _LazyResolver = require('./LazyResolver');

var _LazyResolver2 = _interopRequireDefault(_LazyResolver);

var _ServiceNotFoundError = require('./ServiceNotFoundError');

var _ServiceNotFoundError2 = _interopRequireDefault(_ServiceNotFoundError);

exports['default'] = {
  Bundle: _Bundle2['default'],
  InvalidOperationError: _InvalidOperationError2['default'],
  Kernel: _Kernel2['default'],
  LazyResolver: _LazyResolver2['default'],
  ServiceNotFoundError: _ServiceNotFoundError2['default']
};
module.exports = exports['default'];
},{"./Bundle":26,"./InvalidOperationError":28,"./Kernel":29,"./LazyResolver":30,"./ServiceNotFoundError":36}],38:[function(require,module,exports){
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
},{}],39:[function(require,module,exports){
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
},{}],40:[function(require,module,exports){
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
},{}],41:[function(require,module,exports){
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
},{"./arrayFromTarget":38,"./combinePaths":39,"./distinct":40,"./matchFromPattern":42,"./recipeFromTarget":43,"./validateTarget":44}],42:[function(require,module,exports){
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
},{}],43:[function(require,module,exports){
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
},{"../Recipe":34,"./arrayFromTarget":38}],44:[function(require,module,exports){
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
},{}]},{},[17])(17)
});
//# sourceMappingURL=dialga.js.map?f9c52dd02af92402b35a2be592dab411a64c9251
