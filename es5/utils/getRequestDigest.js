import _regeneratorRuntime from "@babel/runtime-corejs3/regenerator";
import _Promise from "@babel/runtime-corejs3/core-js-stable/promise";
import _startsWithInstanceProperty from "@babel/runtime-corejs3/core-js-stable/instance/starts-with";
import _asyncToGenerator from "@babel/runtime-corejs3/helpers/esm/asyncToGenerator";
import ajax from './ajax.js';
import getURL from './getURL.js';
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
    var e, digest, url, data;
    return _regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            settings = settings || {};
            settings.cache = settings.cache === false ? false : true;
            url = settings.url || this.url;

            if (!(!url || !_startsWithInstanceProperty(url).call(url, 'http'))) {
              _context.next = 8;
              break;
            }

            _context.next = 7;
            return getURL.call(this);

          case 7:
            url = _context.sent;

          case 8:
            // remove the last '/' in the URL
            url = url.replace(/\/$/, ''); // check cache

            if (settings.cache) digest = global._SP_CACHE_REQUESTDIGEST[url];

            if (!digest) {
              _context.next = 13;
              break;
            }

            if (!(new Date().getTime() - new Date(digest.split(",")[1]).getTime() < 1800)) {
              _context.next = 13;
              break;
            }

            return _context.abrupt("return", _Promise.resolve(digest));

          case 13:
            if (!(global._SP_ISBROWSER && document && settings.cache)) {
              _context.next = 19;
              break;
            }

            e = document.querySelector("#__REQUESTDIGEST");

            if (!e) {
              _context.next = 19;
              break;
            }

            digest = e.value; // cache

            global._SP_CACHE_REQUESTDIGEST[url] = digest;
            return _context.abrupt("return", _Promise.resolve(digest));

          case 19:
            _context.next = 21;
            return ajax.call(this, {
              url: url + "/_api/contextinfo",
              method: "POST"
            });

          case 21:
            data = _context.sent;
            digest = data.d.GetContextWebInformation.FormDigestValue; // cache

            global._SP_CACHE_REQUESTDIGEST[url] = digest;

            if (global._SP_ISBROWSER && document) {
              e = document.querySelector("#__REQUESTDIGEST");
              if (e) e.value = digest;
            }

            return _context.abrupt("return", _Promise.resolve(digest));

          case 28:
            _context.prev = 28;
            _context.t0 = _context["catch"](0);
            return _context.abrupt("return", _Promise.reject(_context.t0));

          case 31:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this, [[0, 28]]);
  }));
  return _getRequestDigest.apply(this, arguments);
}