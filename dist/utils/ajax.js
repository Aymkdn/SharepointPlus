"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js-stable/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports["default"] = ajax;

var _regenerator = _interopRequireDefault(require("@babel/runtime-corejs3/regenerator"));

var _slice = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/slice"));

var _includes = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/includes"));

var _promise = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/promise"));

var _indexOf = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/index-of"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/asyncToGenerator"));

var _getRequestDigest = _interopRequireDefault(require("./getRequestDigest.js"));

var _nanoajax = _interopRequireDefault(require("./_nanoajax.js"));

/**
 * @name $SP().ajax
 * @function
 * @category utils
 * @description Permits to do an Ajax request based on https://github.com/yanatan16/nanoajax for Browsers, and https://github.com/s-KaiNet/sp-request for NodeKJ
 * @param {Object} settings (See options below)
 *   @param {String} settings.url The url to call
 *   @param {String} [settings.method="GET"|"POST"] The HTTP Method ("GET" or "POST" if "body" is provided)
 *   @param {Object} [settings.headers] the headers
 *   @param {String} [settings.body] The data to send to the server
 *   @param {Function} [settings.onprogress=function(event){}] Show the download/upload progress (within browser only)
 *   @param {Function} [settings.getXHR=function(xhr){}] Pass the XMLHttpRequest object as a parameter (within browser only)
 * @return {Promise} resolve(responseText||responseXML), reject({response, statusCode, responseText})
 *
 * @example
 * // for a regular request
 * $SP().ajax({url:'https://my.web.site'}).then(function(data) { console.log(data) })
 *
 * // if the URL contains /_api/ and if "Accept", "Content-Type" or "X-RequestDigest", then they are auto-defined
 *
 * // (in browser) manipulate xhr for specific needs, like reading a remote file (based on https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Sending_and_Receiving_Binary_Data)
 * $SP().ajax({url:'https://url.com/file.png', getXHR:function(xhr){ xhr.responseType = 'arraybuffer' }}).then(function(data) {
 *   // ArrayBuffer result
 *   var blob = new Blob([data], {type: "image/png"});
 *   fileReader.readAsArrayBuffer(blob);
 * })
 *
 * // (in browser) show progress on download, and cancel the download after 5 seconds
 * var _xhr;
 * $SP().ajax({
 *   url:'https://server/files/video.mp4',
 *   getXHR:function(xhr) {
 *     _xhr = xhr;
 *     xhr.responseType = 'arraybuffer'
 *   },
 *   onprogress:function(event) {
 *     console.log(event.loaded+" / "+event.total)
 *   }
 * });
 * setTimeout(function() { _xhr.abort() }, 5000); // abort after 5 seconds
 *
 * // (in Node) to get the Buffer from a remote file we could use `encoding:null`
 * // ATTENTION: it will only work if the file is located on a Sharepoint; for other remote files, please use another library like `request`
 * sp.ajax({url:'https://my.web.site/lib/file.pdf', encoding:null}).then(data => {
 *   // 'data' is a Buffer
 * })
 *
 * // for a CORS/cross-domain request you may need to use 'false' for 'Content-Type'
 * // ATTENTION: it will only work if the file is located on a Sharepoint; for other remote files, please use another library like `request`
 * $SP().ajax({url:'https://my.cross-domain.web/site', headers:{"Content-Type":false}}).then(function(data) { console.log(data) })
 */
function ajax(_x) {
  return _ajax.apply(this, arguments);
}

function _ajax() {
  _ajax = (0, _asyncToGenerator2["default"])(
  /*#__PURE__*/
  _regenerator["default"].mark(function _callee(settings) {
    var _context, _context2, _context4, addRequestDigest, _context3, requestDigest, ret, code, responseText, request, _context5, body, _requestDigest, _context6, cookie, opts, stg, response, _context7, _context8, DOMParser, result, _context9;

    return _regenerator["default"].wrap(function _callee$(_context10) {
      while (1) {
        switch (_context10.prev = _context10.next) {
          case 0:
            settings.headers = settings.headers || {};
            _context10.prev = 1;
            addRequestDigest = false; // add "Accept": "application/json;odata=verbose" for headers if there is "_api/" in URL, except for "_api/web/Url"

            if ((0, _indexOf["default"])(_context = settings.url.toLowerCase()).call(_context, "/_api/") > -1 && (0, _indexOf["default"])(_context2 = settings.url.toLowerCase()).call(_context2, "_api/web/url") === -1) {
              if (typeof settings.headers["Accept"] === "undefined") settings.headers.Accept = "application/json;odata=" + global._SP_JSON_ACCEPT;
              if (typeof settings.headers["Content-Type"] === "undefined") settings.headers["Content-Type"] = "application/json;odata=" + global._SP_JSON_ACCEPT;

              if (typeof settings.headers["X-RequestDigest"] === "undefined" && (0, _indexOf["default"])(_context3 = settings.url).call(_context3, "contextinfo") === -1) {
                addRequestDigest = true;
              }
            } // if "_vti_bin/client.svc/ProcessQuery" we want to add the RequestDigest


            if ((0, _indexOf["default"])(_context4 = settings.url.toLowerCase()).call(_context4, "_vti_bin/client.svc/processquery") > -1 && typeof settings.headers["X-RequestDigest"] === "undefined") {
              addRequestDigest = true;
            }

            if (!addRequestDigest) {
              _context10.next = 11;
              break;
            }

            _context10.next = 8;
            return _getRequestDigest["default"].call(this, {
              url: settings.url.toLowerCase().split("_api")[0]
            });

          case 8:
            requestDigest = _context10.sent;
            settings.headers["X-RequestDigest"] = requestDigest;
            return _context10.abrupt("return", ajax.call(this, settings));

          case 11:
            // use XML as the default content type
            if (typeof settings.headers["Content-Type"] === "undefined") settings.headers["Content-Type"] = "text/xml; charset=utf-8"; // check if it's NodeJS

            if (!global._SP_ISBROWSER) {
              _context10.next = 36;
              break;
            }

            // IE will return an "400 Bad Request" if it's a POST with no body
            if (settings.method === "POST" && !settings.body) settings.body = ""; // eslint-disable-next-line

            _context10.next = 16;
            return new _promise["default"](function (prom_res) {
              (0, _nanoajax["default"])(settings, function (code, responseText, request) {
                prom_res({
                  code: code,
                  responseText: responseText,
                  request: request
                });
              });
            });

          case 16:
            ret = _context10.sent;
            code = ret.code, responseText = ret.responseText, request = ret.request;

            if (!(code >= 200 && code < 300 && responseText !== "Error" && responseText !== "Abort" && responseText !== "Timeout")) {
              _context10.next = 24;
              break;
            }

            body = !request.responseType || request.responseType === 'document' ? request.responseXML || request.responseText : responseText;
            if ((0, _indexOf["default"])(_context5 = request.getResponseHeader("Content-Type") || "").call(_context5, "/json") > -1 && typeof body === "string") body = JSON.parse(body); // parse JSON

            return _context10.abrupt("return", _promise["default"].resolve(body));

          case 24:
            if (!(code == 403 && (0, _includes["default"])(responseText).call(responseText, "security validation for this page is invalid"))) {
              _context10.next = 33;
              break;
            }

            // then we retry
            delete settings.headers["X-RequestDigest"];
            _context10.next = 28;
            return _getRequestDigest["default"].call(this, {
              cache: false
            });

          case 28:
            _requestDigest = _context10.sent;
            settings.headers["X-RequestDigest"] = _requestDigest;
            return _context10.abrupt("return", ajax.call(this, settings));

          case 33:
            return _context10.abrupt("return", _promise["default"].reject({
              statusCode: code,
              responseText: responseText,
              request: request
            }));

          case 34:
            _context10.next = 80;
            break;

          case 36:
            if (!(this.module_sprequest === null)) {
              _context10.next = 51;
              break;
            }

            if (!(this.credentialOptions !== null)) {
              _context10.next = 41;
              break;
            }

            this.module_sprequest = require('sp-request').create(this.credentialOptions);
            _context10.next = 51;
            break;

          case 41:
            if (!(typeof this.authMethod.cookie === 'function')) {
              _context10.next = 50;
              break;
            }

            _context10.next = 44;
            return this.authMethod.cookie();

          case 44:
            cookie = _context10.sent;
            cookie = cookie.split(';')[0];
            this.module_sprequest = require('request-promise');
            settings.headers.cookie = cookie;
            _context10.next = 51;
            break;

          case 50:
            throw "[SharepointPlus 'ajax'] please use `$SP().auth()` to provide your authentication method first";

          case 51:
            if (settings.headers['Content-Type'] && (0, _indexOf["default"])(_context6 = settings.headers['Content-Type']).call(_context6, 'xml') > -1) settings.headers['Accept'] = 'application/xml, text/xml, */*; q=0.01';
            if (!settings.method) settings.method = typeof settings.body !== "undefined" ? "POST" : "GET";
            if (settings.method.toUpperCase() === "POST" && typeof settings.body !== "undefined") settings.headers['Content-Length'] = Buffer.byteLength(settings.body); // add User Agent

            settings.headers['User-Agent'] = 'SharepointPlus'; //'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:52.0) Gecko/20100101 Firefox/52.0';

            opts = {
              json: false,
              method: settings.method,
              strictSSL: false,
              headers: settings.headers,
              jar: true,
              resolveWithFullResponse: true
            };
            if (settings.body) opts.body = settings.body;
            if (this.proxyweb) opts.proxy = this.proxyweb; // looks like the Content-Length creates some issues

            if (opts.headers) delete opts.headers["Content-Length"]; // check if we have some other parameters

            for (stg in settings) {
              if (Object.prototype.hasOwnProperty.call(settings, stg) && !opts[stg]) opts[stg] = settings[stg];
            }

            _context10.next = 62;
            return this.module_sprequest(settings.url, opts);

          case 62:
            response = _context10.sent;

            if (!(response.statusCode === 200 && response.statusMessage !== "Error" && response.statusMessage !== "Abort" && response.statusMessage !== "Timeout")) {
              _context10.next = 74;
              break;
            }

            if (!((0, _indexOf["default"])(_context7 = response.headers['content-type'] || "").call(_context7, 'xml') > -1 && (0, _slice["default"])(_context8 = response.body).call(_context8, 0, 5) === '<?xml')) {
              _context10.next = 70;
              break;
            }

            DOMParser = require('xmldom').DOMParser;
            result = new DOMParser().parseFromString(response.body);
            return _context10.abrupt("return", _promise["default"].resolve(result));

          case 70:
            if ((0, _indexOf["default"])(_context9 = response.headers['content-type'] || "").call(_context9, 'json') > -1 && typeof response.body === "string") response.body = JSON.parse(response.body);
            return _context10.abrupt("return", _promise["default"].resolve(response.body));

          case 72:
            _context10.next = 80;
            break;

          case 74:
            if (!(response.statusCode === 403)) {
              _context10.next = 79;
              break;
            }

            // we need to reauthenticate
            this.module_sprequest === null;
            return _context10.abrupt("return", ajax.call(this, settings));

          case 79:
            return _context10.abrupt("return", _promise["default"].reject({
              response: response,
              statusCode: response.statusCode,
              responseText: response.body
            }));

          case 80:
            _context10.next = 85;
            break;

          case 82:
            _context10.prev = 82;
            _context10.t0 = _context10["catch"](1);
            return _context10.abrupt("return", _promise["default"].reject({
              error: _context10.t0,
              statusCode: _context10.t0.statusCode,
              response: _context10.t0.response,
              responseText: _context10.t0.response ? _context10.t0.response.body : ''
            }));

          case 85:
          case "end":
            return _context10.stop();
        }
      }
    }, _callee, this, [[1, 82]]);
  }));
  return _ajax.apply(this, arguments);
}

module.exports = exports.default;