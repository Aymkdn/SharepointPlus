"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js-stable/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.default = hasREST;

var _parseInt2 = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/parse-int"));

var _promise = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/promise"));

var _slice = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/slice"));

var _ajax = _interopRequireDefault(require("./ajax.js"));

/**
  @name $SP().hasREST
  @function
  @category utils
  @description Verify if the website supports REST API (Sharepoint 2013 and later)
  @param {Object} settings
    @param {String} [settings.url=current] To check another URL (or if you need on a Node server)
  @return {Promise} A resolved Promise that gives TRUE or FALSE
*/
function hasREST(settings) {
  var _context;

  settings = settings || {};
  var url = (0, _slice.default)(_context = (settings.url || this.url || window.location.href).split("/")).call(_context, 0, 3).join("/"); // check cache

  if (typeof global._SP_CACHE_HASREST[url] === "boolean") {
    return _promise.default.resolve(global._SP_CACHE_HASREST[url]);
  }

  var hasREST,
      needAjax = settings.url || !global._SP_ISBROWSER || typeof SP === "undefined" ? true : false;

  if (!needAjax) {
    if (typeof SP !== "undefined" && SP.ClientSchemaVersions) {
      // eslint-disable-line
      // cache
      hasREST = (0, _parseInt2.default)(SP.ClientSchemaVersions.currentVersion) > 14; // eslint-disable-line

      global._SP_CACHE_HASREST[url] = hasREST;
      return _promise.default.resolve(hasREST);
    } else needAjax = true;
  }

  if (needAjax) {
    return _ajax.default.call(this, {
      url: url + "/_api/web/Url"
    }).then(function () {
      global._SP_CACHE_HASREST[url] = true;
      return _promise.default.resolve(true);
    }).catch(function () {
      global._SP_CACHE_HASREST[url] = false;
      return _promise.default.resolve(false);
    });
  } else {
    global._SP_CACHE_HASREST[url] = false;
    return _promise.default.resolve(false);
  }
}

module.exports = exports.default;