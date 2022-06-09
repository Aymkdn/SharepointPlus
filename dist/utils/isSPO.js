"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js-stable/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.default = isSPO;

var _typeof2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/typeof"));

var _endsWith = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/ends-with"));

var _slice = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/slice"));

/**
 * @name isSPO
 * @category utils
 * @function
 * @description Return TRUE if the SharePoint is SharePoint Online
 * @param {Object} settings
 *   @param {String} [settings.url=current] To check another URL
 * @return {Boolean} Return TRUE if it's SPO or FALSE if not, or NULL is not able to determine it
 *
 * @note You can force an URL to be seen as SPO by defining the global variable _SP_ISSPO['url to check']=true
 */
function isSPO(settings) {
  var _context;

  settings = settings || {};
  var url = (0, _slice.default)(_context = (settings.url || this.url || window.location.href).split("/")).call(_context, 0, 3).join("/"); // check global variable

  if (typeof global._SP_ISSPO[url] === "boolean") return global._SP_ISSPO[url]; // check .sharepoint.com in URL

  if ((0, _endsWith.default)(url).call(url, '.sharepoint.com')) return true; // check _spPageContextInfo

  if ((0, _typeof2.default)(global._spPageContextInfo) === "object") return global._spPageContextInfo.isSPO || false;
  return null;
}

module.exports = exports.default;