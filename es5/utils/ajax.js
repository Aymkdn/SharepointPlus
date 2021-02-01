import _regeneratorRuntime from "@babel/runtime-corejs3/regenerator";
import _sliceInstanceProperty from "@babel/runtime-corejs3/core-js-stable/instance/slice";
import _includesInstanceProperty from "@babel/runtime-corejs3/core-js-stable/instance/includes";
import _Promise from "@babel/runtime-corejs3/core-js-stable/promise";
import _indexOfInstanceProperty from "@babel/runtime-corejs3/core-js-stable/instance/index-of";
import _asyncToGenerator from "@babel/runtime-corejs3/helpers/esm/asyncToGenerator";
import getRequestDigest from './getRequestDigest.js';
import nanoajax from './_nanoajax.js';
/**
 * @name $SP().ajax
 * @function
 * @category utils
 * @description Permits to do an Ajax request based on https://github.com/yanatan16/nanoajax for Browsers, and https://github.com/s-KaiNet/sp-request for NodeJS
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

export default function ajax(_x) {
  return _ajax.apply(this, arguments);
}

function _ajax() {
  _ajax = _asyncToGenerator(
  /*#__PURE__*/
  _regeneratorRuntime.mark(function _callee(settings) {
    var _context, _context2, _context4, addRequestDigest, _context3, requestDigest, ret, code, responseText, request, _context5, body, _requestDigest, _context6, cookie, opts, stg, response, _context7, _context8, DOMParser, result, _context9;

    return _regeneratorRuntime.wrap(function _callee$(_context10) {
      while (1) {
        switch (_context10.prev = _context10.next) {
          case 0:
            settings.headers = settings.headers || {};
            _context10.prev = 1;
            addRequestDigest = false; // add "Accept": "application/json;odata=verbose" for headers if there is "_api/" in URL, except for "_api/web/Url"

            if (_indexOfInstanceProperty(_context = settings.url.toLowerCase()).call(_context, "/_api/") > -1 && _indexOfInstanceProperty(_context2 = settings.url.toLowerCase()).call(_context2, "_api/web/url") === -1) {
              if (typeof settings.headers["Accept"] === "undefined") settings.headers.Accept = "application/json;odata=" + global._SP_JSON_ACCEPT;
              if (typeof settings.headers["Content-Type"] === "undefined") settings.headers["Content-Type"] = "application/json;odata=" + global._SP_JSON_ACCEPT;

              if (typeof settings.headers["X-RequestDigest"] === "undefined" && _indexOfInstanceProperty(_context3 = settings.url).call(_context3, "contextinfo") === -1) {
                addRequestDigest = true;
              }
            } // if "_vti_bin/client.svc/ProcessQuery" we want to add the RequestDigest


            if (_indexOfInstanceProperty(_context4 = settings.url.toLowerCase()).call(_context4, "_vti_bin/client.svc/processquery") > -1 && typeof settings.headers["X-RequestDigest"] === "undefined") {
              addRequestDigest = true;
            }

            if (!addRequestDigest) {
              _context10.next = 11;
              break;
            }

            _context10.next = 8;
            return getRequestDigest.call(this, {
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
            return new _Promise(function (prom_res) {
              nanoajax(settings, function (code, responseText, request) {
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
            if (_indexOfInstanceProperty(_context5 = request.getResponseHeader("Content-Type") || "").call(_context5, "/json") > -1 && typeof body === "string") body = JSON.parse(body); // parse JSON

            return _context10.abrupt("return", _Promise.resolve(body));

          case 24:
            if (!(code == 403 && _includesInstanceProperty(responseText).call(responseText, "security validation for this page is invalid"))) {
              _context10.next = 33;
              break;
            }

            // then we retry
            delete settings.headers["X-RequestDigest"];
            _context10.next = 28;
            return getRequestDigest.call(this, {
              cache: false
            });

          case 28:
            _requestDigest = _context10.sent;
            settings.headers["X-RequestDigest"] = _requestDigest;
            return _context10.abrupt("return", ajax.call(this, settings));

          case 33:
            return _context10.abrupt("return", _Promise.reject({
              statusCode: code,
              responseText: responseText,
              request: request
            }));

          case 34:
            _context10.next = 81;
            break;

          case 36:
            if (!(this.module_sprequest === null)) {
              _context10.next = 52;
              break;
            }

            if (!(this.credentialOptions !== null)) {
              _context10.next = 42;
              break;
            }

            this.module_sprequest = eval("require('sp-request')"); // avoid Webpack to include it in web bundle

            this.module_sprequest = this.module_sprequest.create(this.credentialOptions);
            _context10.next = 52;
            break;

          case 42:
            if (!(typeof this.authMethod.cookie === 'function')) {
              _context10.next = 51;
              break;
            }

            _context10.next = 45;
            return this.authMethod.cookie();

          case 45:
            cookie = _context10.sent;
            cookie = cookie.split(';')[0];
            this.module_sprequest = eval("require('request-promise')"); // avoid Webpack to include it in web bundle

            settings.headers.cookie = cookie;
            _context10.next = 52;
            break;

          case 51:
            throw "[SharepointPlus 'ajax'] please use `$SP().auth()` to provide your authentication method first";

          case 52:
            if (settings.headers['Content-Type'] && _indexOfInstanceProperty(_context6 = settings.headers['Content-Type']).call(_context6, 'xml') > -1) settings.headers['Accept'] = 'application/xml, text/xml, */*; q=0.01';
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

            _context10.next = 63;
            return this.module_sprequest(settings.url, opts);

          case 63:
            response = _context10.sent;

            if (!(response.statusCode === 200 && response.statusMessage !== "Error" && response.statusMessage !== "Abort" && response.statusMessage !== "Timeout")) {
              _context10.next = 75;
              break;
            }

            if (!(_indexOfInstanceProperty(_context7 = response.headers['content-type'] || "").call(_context7, 'xml') > -1 && _sliceInstanceProperty(_context8 = response.body).call(_context8, 0, 5) === '<?xml')) {
              _context10.next = 71;
              break;
            }

            DOMParser = require('xmldom').DOMParser;
            result = new DOMParser().parseFromString(response.body);
            return _context10.abrupt("return", _Promise.resolve(result));

          case 71:
            if (_indexOfInstanceProperty(_context9 = response.headers['content-type'] || "").call(_context9, 'json') > -1 && typeof response.body === "string") response.body = JSON.parse(response.body);
            return _context10.abrupt("return", _Promise.resolve(response.body));

          case 73:
            _context10.next = 81;
            break;

          case 75:
            if (!(response.statusCode === 403)) {
              _context10.next = 80;
              break;
            }

            // we need to reauthenticate
            this.module_sprequest === null;
            return _context10.abrupt("return", ajax.call(this, settings));

          case 80:
            return _context10.abrupt("return", _Promise.reject({
              response: response,
              statusCode: response.statusCode,
              responseText: response.body
            }));

          case 81:
            _context10.next = 86;
            break;

          case 83:
            _context10.prev = 83;
            _context10.t0 = _context10["catch"](1);
            return _context10.abrupt("return", _Promise.reject({
              error: _context10.t0,
              statusCode: _context10.t0.statusCode,
              response: _context10.t0.response,
              responseText: _context10.t0.response ? _context10.t0.response.body : ''
            }));

          case 86:
          case "end":
            return _context10.stop();
        }
      }
    }, _callee, this, [[1, 83]]);
  }));
  return _ajax.apply(this, arguments);
}