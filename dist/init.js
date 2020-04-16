"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js-stable/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.default = spInit;

var _main = _interopRequireDefault(require("./main.js"));

function spInit(params) {
  return function () {
    var sp = new _main.default();
    sp.init(params);
    return sp;
  };
}

module.exports = exports.default;