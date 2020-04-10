"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js-stable/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports["default"] = whoami;

var _people = _interopRequireDefault(require("./people.js"));

/**
  @name $SP().whoami
  @function
  @category people
  @description Find the current user's details like manager, email, colleagues, ...

  @param {Object} [setup] Options (see below)
    @param {String} [setup.url='current website'] The website url
  @return {Promise} resolve(people), reject(error)

  @example
  $SP().whoami({url:"http://my.si.te/subdir/"}).then(function(people) {
    for (var i=0; i &lt; people.length; i++) console.log(people[i]+" = "+people[people[i]]);
  });
*/
function whoami(setup) {
  return _people["default"].call(this, "", setup);
}

module.exports = exports.default;