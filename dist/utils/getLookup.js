"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js-stable/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.default = getLookup;

var _slice = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/slice"));

/**
  @name $SP().getLookup
  @function
  @category utils
  @description Split the ID and Value
  @param {String} str The string to split
  @return {Object} .id returns the ID (or an array of IDs), and .value returns the value (or an array of values)
  @example
  $SP().getLookup("328;#Foo"); // --> {id:"328", value:"Foo"}
  $SP().getLookup("328;#Foo;#191;#Other Value"); // --> {id:["328", "191"], value:["Foo", "Other Value"]}
  $SP().getLookup("328"); // --> {id:"328", value:"328"}
*/
function getLookup(str) {
  if (!str) return {
    id: "",
    value: ""
  };
  var a = str.split(";#");
  if (a.length <= 2) return {
    id: a[0],
    value: typeof a[1] === "undefined" ? a[0] : a[1]
  };else {
    var _context;

    // we have several lookups
    return {
      id: (0, _slice.default)(_context = str.replace(/([0-9]+;#)([^;]+)/g, "$1").replace(/;#;#/g, ",")).call(_context, 0, -2).split(","),
      value: str.replace(/([0-9]+;#)([^;]+)/g, "$2").split(";#")
    };
  }
}

module.exports = exports.default;