import _parseInt from "@babel/runtime-corejs3/core-js-stable/parse-int";
import _Promise from "@babel/runtime-corejs3/core-js-stable/promise";
import _sliceInstanceProperty from "@babel/runtime-corejs3/core-js-stable/instance/slice";
import ajax from './ajax.js';
/**
  @name $SP().hasREST
  @function
  @category utils
  @description Verify if the website supports REST API (Sharepoint 2013 and later)
  @param {Object} settings
    @param {String} [settings.url=current] To check another URL (or if you need on a Node server)
  @return {Promise} A resolved Promise that gives TRUE or FALSE
*/

export default function hasREST(settings) {
  var _context;

  settings = settings || {};

  var url = _sliceInstanceProperty(_context = (settings.url || this.url || window.location.href).split("/")).call(_context, 0, 3).join("/"); // check cache


  if (typeof global._SP_CACHE_HASREST[url] === "boolean") {
    return _Promise.resolve(global._SP_CACHE_HASREST[url]);
  }

  var hasREST,
      needAjax = settings.url || !global._SP_ISBROWSER || typeof SP === "undefined" ? true : false;

  if (!needAjax) {
    if (typeof SP !== "undefined" && SP.ClientSchemaVersions) {
      // eslint-disable-line
      // cache
      hasREST = _parseInt(SP.ClientSchemaVersions.currentVersion) > 14; // eslint-disable-line

      global._SP_CACHE_HASREST[url] = hasREST;
      return _Promise.resolve(hasREST);
    } else needAjax = true;
  }

  if (needAjax) {
    return ajax.call(this, {
      url: url + "/_api/web/Url"
    }).then(function () {
      global._SP_CACHE_HASREST[url] = true;
      return _Promise.resolve(true);
    })["catch"](function () {
      global._SP_CACHE_HASREST[url] = false;
      return _Promise.resolve(false);
    });
  } else {
    global._SP_CACHE_HASREST[url] = false;
    return _Promise.resolve(false);
  }
}