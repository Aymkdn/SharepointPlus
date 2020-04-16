"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js-stable/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.default = newGuid;

/**
  @name $SP().newGuid
  @function
  @category utils
  @description Create an unique GUID (based on Sharepoint function called SP.Guid.newGuid())
 */
function newGuid() {
  for (var a = "", c = 0; c < 32; c++) {
    var b = Math.floor(Math.random() * 16);

    switch (c) {
      case 8:
        a += "-";
        break;

      case 12:
        b = 4;
        a += "-";
        break;

      case 16:
        b = b & 3 | 8;
        a += "-";
        break;

      case 20:
        a += "-";
    }

    a += b.toString(16);
  }

  return a;
}

module.exports = exports.default;