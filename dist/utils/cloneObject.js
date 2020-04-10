"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js-stable/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports["default"] = cloneObject;

var _isArray = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/array/is-array"));

var _typeof2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/typeof"));

/**
 * @name cloneObject
 * @category utils
 * @function
 * @description It will clone an object (source: https://stackoverflow.com/questions/122102/what-is-the-most-efficient-way-to-deep-clone-an-object-in-javascript/24248152#comment75410509_24248152)
 * @param {Boolean} [deep=false] If we want a deep clone
 * @param {Object} objectDestination The object that will be extended
 * @param {Object} objectSource The object the copy
 */
function cloneObject() {
  var to_add,
      name,
      copy_is_array,
      clone,
      target = arguments[0] || {},
      i = 1,
      length = arguments.length,
      deep = false; // Handle a deep copy situation.

  if (typeof target === 'boolean') {
    deep = target; // Skip the boolean and the target.

    target = arguments[i] || {}; // Use next object as first added.

    i++;
  } // Handle case when target is a string or something (possible in deep copy)


  if ((0, _typeof2["default"])(target) !== 'object' && typeof target !== 'function') {
    target = {};
  } // Loop trough arguments.


  for (false; i < length; i += 1) {
    // Only deal with non-null/undefined values
    if ((to_add = arguments[i]) !== null) {
      // Extend the base object.
      for (name in to_add) {
        // We do not wrap for loop into hasOwnProperty,
        // to access to all values of object.
        // Prevent never-ending loop.
        if (target === to_add[name] || typeof target[name] !== "undefined") {
          continue;
        } // Recurse if we're merging plain objects or arrays.


        if (deep && to_add[name] && (is_plain_object(to_add[name]) || (copy_is_array = (0, _isArray["default"])(to_add[name])))) {
          if (copy_is_array) {
            copy_is_array = false;
            clone = target[name] && (0, _isArray["default"])(target[name]) ? target[name] : [];
          } else {
            clone = target[name] && is_plain_object(target[name]) ? target[name] : {};
          } // Never move original objects, clone them.


          target[name] = cloneObject(deep, clone, to_add[name]);
        } // Don't bring in undefined values.
        else if (to_add[name] !== undefined) {
            target[name] = to_add[name];
          }
      }
    }
  }

  return target;
}
/**
 * Check to see if an object is a plain object
 * (created using "{}" or "new Object").
 * Forked from jQuery.
 * @ignore
 * @returns {boolean}
 */


function is_plain_object(obj) {
  // Not plain objects:
  // - Any object or value whose internal [[Class]] property is not "[object Object]"
  // - DOM nodes
  // - window
  if (obj === null || (0, _typeof2["default"])(obj) !== "object" || obj.nodeType || obj !== null && obj === obj.window) {
    return false;
  } // Support: Firefox <20
  // The try/catch suppresses exceptions thrown when attempting to access
  // the "constructor" property of certain host objects, i.e. |window.location|
  // https://bugzilla.mozilla.org/show_bug.cgi?id=814622


  try {
    if (obj.constructor && !this.hasOwnProperty.call(obj.constructor.prototype, "isPrototypeOf")) {
      return false;
    }
  } catch (e) {
    return false;
  } // If the function hasn't returned already, we're confident that
  // |obj| is a plain object, created by {} or constructed with new Object


  return true;
}

module.exports = exports.default;