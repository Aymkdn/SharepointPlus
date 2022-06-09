"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js-stable/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.default = cleanResult;

/**
  @name $SP().cleanResult
  @function
  @category lists
  @description clean a string returned by a GET (remove ";#" and "string;#" and null becomes "")

  @param {String} str The string to clean
  @param {String} [separator=";"] When it's a list we may want to have a different output (see examples)
  @return {String} the cleaned string

  @example
  $SP().cleanResult("15;#Paul"); // -> "Paul"
  $SP().cleanResult("string;#Paul"); // -> "Paul"
  $SP().cleanResult("string;#"); // -> ""
  $SP().cleanResult(";#Paul;#Jacques;#Aymeric;#"); // -> "Paul;Jacques;Aymeric"
  $SP().cleanResult(";#Paul;#Jacques;#Aymeric;#", ", "); // -> "Paul, Jacques, Aymeric"
  $SP().cleanResult("2022-01-19 00:00:00"); // -> "2022-01-19"
*/
function cleanResult(str, separator) {
  if (str === null || typeof str === "undefined") return "";
  separator = separator || ";";
  return typeof str === "string" ? str.replace(/^(string;|float;|datetime;)#?/, "").replace(/^(\d{4}-\d{2}-\d{2}) 00:00:00$/, "$1").replace(/;#-?[0-9]+;#/g, separator).replace(/^-?[0-9]+;#/, "").replace(/^;#|;#$/g, "").replace(/;#/g, separator) : str;
}

module.exports = exports.default;