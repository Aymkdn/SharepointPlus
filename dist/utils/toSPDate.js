"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js-stable/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports["default"] = toSPDate;

var _typeof2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/typeof"));

/**
  @name $SP().toSPDate
  @function
  @category utils
  @description Change a Date object into a Sharepoint date string
  @param {Date} dateObject The Date object you want to convert
  @param {Date} [includeTime=false] By default the time is not returned (if the time appears then the WHERE clause will do a time comparison)
  @return {String} the equivalent string for the Date object passed

  @example
  $SP().toSPDate(new Date(2012,9,31), true); // --> "2012-10-31T00:00:00Z"
  $SP().toSPDate(new Date(2012,9,31)); // --> "2012-10-31"
*/
function toSPDate(oDate, includeTime) {
  if (!oDate || (0, _typeof2["default"])(oDate) !== "object" || typeof oDate.getFullYear !== "function") return ""; // "oDate instanceof Date" returns false for an unknown reason

  var pad = function pad(p_str) {
    if (p_str.toString().length == 1) {
      p_str = '0' + p_str;
    }

    return p_str;
  };

  var month = pad(oDate.getMonth() + 1);
  var day = pad(oDate.getDate());
  var year = oDate.getFullYear();
  var hours = pad(oDate.getHours());
  var minutes = pad(oDate.getMinutes());
  var seconds = pad(oDate.getSeconds());
  return year + "-" + month + "-" + day + (includeTime ? "T" + hours + ":" + minutes + ":" + seconds + "Z" : "");
}

module.exports = exports.default;