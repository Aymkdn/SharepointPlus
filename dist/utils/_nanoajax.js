"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js-stable/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports["default"] = _nanoajax;

/**
 * @ignore
 * source: https://github.com/yanatan16/nanoajax
 * changes:
 *   1) Added 'onprogress'
 *   2) Added 'getXHR'
 */
var reqfields = ['responseType', 'withCredentials', 'timeout', 'onprogress']; // Simple and small ajax function
// Takes a parameters object and a callback function
// Parameters:
//  - url: string, required
//  - headers: object of `{header_name: header_value, ...}`
//  - body:
//      + string (sets content type to 'application/x-www-form-urlencoded' if not set in headers)
//      + FormData (doesn't set content type so that browser will set as appropriate)
//  - method: 'GET', 'POST', etc. Defaults to 'GET' or 'POST' based on body
//  - cors: If your using cross-origin, you will need this true for IE8-9
//
// The following parameters are passed onto the xhr object.
// IMPORTANT NOTE: The caller is responsible for compatibility checking.
//  - responseType: string, various compatability, see xhr docs for enum options
//  - withCredentials: boolean, IE10+, CORS only
//  - timeout: long, ms timeout, IE8+
//  - onprogress: callback, IE10+
//
// Callback function prototype:
//  - statusCode from request
//    + Possibly null or 0 (i.e. falsy) if an error occurs
//  - response
//    + if responseType set and supported by browser, this is an object of some type (see docs)
//    + otherwise if request completed, this is the string text of the response
//    + if request is aborted, this is "Abort"
//    + if request times out, this is "Timeout"
//    + if request errors before completing (probably a CORS issue), this is "Error"
//  - request object
//
// Returns the request object. So you can call .abort() or other methods
//

function _nanoajax(params, callback) {
  // Any variable used more than once is var'd here because
  // minification will munge the variables whereas it can't munge
  // the object access.
  var headers = params.headers || {},
      body = params.body,
      method = params.method || (body ? 'POST' : 'GET'),
      called = false;
  var req = getRequest(params.cors);

  function cb(statusCode, responseText) {
    return function () {
      if (!called) {
        callback(req.status === undefined ? statusCode : req.status, req.status === 0 ? "Error" : req.response || req.responseText || responseText, req);
        called = true;
      }
    };
  }

  req.open(method, params.url, true);
  var success = req.onload = cb(200);

  req.onreadystatechange = function () {
    if (req.readyState === 4) success();
  };

  req.onerror = cb(null, 'Error');
  req.ontimeout = cb(null, 'Timeout');
  req.onabort = cb(null, 'Abort');

  if (body) {
    setDefault(headers, 'X-Requested-With', 'XMLHttpRequest');

    if (!global.FormData || !(body instanceof global.FormData)) {
      setDefault(headers, 'Content-Type', 'application/x-www-form-urlencoded');
    }
  }

  for (var i = 0, len = reqfields.length, field; i < len; i++) {
    field = reqfields[i];
    if (params[field] !== undefined) req[field] = params[field];
  }

  for (field in headers) {
    req.setRequestHeader(field, headers[field]);
  }

  if (params.onprogress) {
    if (method.toUpperCase() === 'GET') req.addEventListener("progress", params.onprogress, !1);else req.upload.addEventListener("progress", params.onprogress, !1);
  }

  if (params.getXHR) params.getXHR(req);
  req.send(body);
  return req;
}

function getRequest(cors) {
  // XDomainRequest is only way to do CORS in IE 8 and 9
  // But XDomainRequest isn't standards-compatible
  // Notably, it doesn't allow cookies to be sent or set by servers
  // IE 10+ is standards-compatible in its XMLHttpRequest
  // but IE 10 can still have an XDomainRequest object, so we don't want to use it
  if (cors && global.XDomainRequest && !/MSIE 1/.test(navigator.userAgent)) return new global.XDomainRequest();
  if (global.XMLHttpRequest) return new XMLHttpRequest();
}

function setDefault(obj, key, value) {
  obj[key] = obj[key] || value;
}

module.exports = exports.default;