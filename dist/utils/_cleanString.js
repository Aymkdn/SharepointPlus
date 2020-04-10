"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js-stable/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports["default"] = _cleanString;

/**
 * @ignore
 */
function _cleanString(str) {
  return str.replace(/&(?!amp;|lt;|gt;)/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

module.exports = exports.default;