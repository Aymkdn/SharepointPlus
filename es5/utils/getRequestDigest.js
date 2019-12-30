import _regeneratorRuntime from "@babel/runtime-corejs3/regenerator";
import _Promise from "@babel/runtime-corejs3/core-js-stable/promise";
import _indexOfInstanceProperty from "@babel/runtime-corejs3/core-js-stable/instance/index-of";
import _sliceInstanceProperty from "@babel/runtime-corejs3/core-js-stable/instance/slice";
import _asyncToGenerator from "@babel/runtime-corejs3/helpers/esm/asyncToGenerator";
import ajax from './ajax.js';
/**
 * @name $SP().getRequestDigest
 * @function
 * @category utils
 * @description Retrieve a Request Digest (and it will change the value of document.querySelector("#__REQUESTDIGEST") when a new Request Digest is created)
 * @param {Object} settings
 *   @param {String} [settings.url=current] To check another URL (or if you use it on a Node server)
 *   @param {Boolean} [settings.cache=true] TRUE to use the cache and/or the one into the page for the digest, FALSE to get a new one
 * @return {Promise} resolve(Request Digest), reject(reject from $SP().ajax())
 *
 * @example
 * $SP().getRequestDigest({cache:false}).then(function(digest) { console.log("The new digest is "+digest)})
 */

export default function getRequestDigest(_x) {
  return _getRequestDigest.apply(this, arguments);
}

function _getRequestDigest() {
  _getRequestDigest = _asyncToGenerator(
  /*#__PURE__*/
  _regeneratorRuntime.mark(function _callee(settings) {
    var _context, e, digest, url, data;

    return _regeneratorRuntime.wrap(function _callee$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.prev = 0;
            settings = settings || {};
            settings.cache = settings.cache === false ? false : true;
            url = settings.url || this.url;
            if (!url) url = _sliceInstanceProperty(_context = window.location.href.split("/")).call(_context, 0, 3).join("/");
            url = url.toLowerCase();
            if (_indexOfInstanceProperty(url).call(url, "_api") !== -1) url = url.split("_api")[0];else if (_indexOfInstanceProperty(url).call(url, "_vti_bin/client.svc/processquery") !== -1) url = url.split("_vti_bin/client.svc/processquery")[0]; // check cache

            if (settings.cache) digest = global._SP_CACHE_REQUESTDIGEST[url];

            if (!digest) {
              _context2.next = 11;
              break;
            }

            if (!(new Date().getTime() - new Date(digest.split(",")[1]).getTime() < 86400000)) {
              _context2.next = 11;
              break;
            }

            return _context2.abrupt("return", _Promise.resolve(digest));

          case 11:
            if (!(global._SP_ISBROWSER && document && settings.cache)) {
              _context2.next = 17;
              break;
            }

            e = document.querySelector("#__REQUESTDIGEST");

            if (!e) {
              _context2.next = 17;
              break;
            }

            digest = e.value; // cache

            global._SP_CACHE_REQUESTDIGEST[url] = digest;
            return _context2.abrupt("return", _Promise.resolve(digest));

          case 17:
            _context2.next = 19;
            return ajax.call(this, {
              url: url + "/_api/contextinfo",
              method: "POST"
            });

          case 19:
            data = _context2.sent;
            digest = data.d.GetContextWebInformation.FormDigestValue; // cache

            global._SP_CACHE_REQUESTDIGEST[url] = digest;

            if (global._SP_ISBROWSER && document) {
              e = document.querySelector("#__REQUESTDIGEST");
              if (e) e.value = digest;
            }

            return _context2.abrupt("return", _Promise.resolve(digest));

          case 26:
            _context2.prev = 26;
            _context2.t0 = _context2["catch"](0);
            return _context2.abrupt("return", _Promise.reject(_context2.t0));

          case 29:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee, this, [[0, 26]]);
  }));
  return _getRequestDigest.apply(this, arguments);
}