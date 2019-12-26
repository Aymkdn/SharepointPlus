import _regeneratorRuntime from "@babel/runtime-corejs3/regenerator";
import _Promise from "@babel/runtime-corejs3/core-js-stable/promise";
import _asyncToGenerator from "@babel/runtime-corejs3/helpers/esm/asyncToGenerator";
import ajax from './ajax.js';
import _buildBodyForSOAP from '../lists/_buildBodyForSOAP.js';
/**
  @name $SP().getURL
  @function
  @category utils
  @description Return the current base URL website
  @return {Promise} resolve(The current base URL website), reject(error)
*/

export default function getURL() {
  return _getURL.apply(this, arguments);
} // when at the root of the site, we could have an empty URL, so we return the current location

function _getURL() {
  _getURL = _asyncToGenerator(
  /*#__PURE__*/
  _regeneratorRuntime.mark(function _callee() {
    var data, result;
    return _regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (!(typeof this.url === "undefined")) {
              _context.next = 26;
              break;
            }

            if (!(typeof window.L_Menu_BaseUrl !== "undefined")) {
              _context.next = 5;
              break;
            }

            return _context.abrupt("return", _Promise.resolve(checkURL(window.L_Menu_BaseUrl)));

          case 5:
            if (!(typeof window._spPageContextInfo !== "undefined" && typeof window._spPageContextInfo.webServerRelativeUrl !== "undefined")) {
              _context.next = 9;
              break;
            }

            return _context.abrupt("return", _Promise.resolve(checkURL(window._spPageContextInfo.webServerRelativeUrl)));

          case 9:
            _context.prev = 9;
            _context.next = 12;
            return ajax.call(this, {
              url: "/_vti_bin/Webs.asmx",
              body: _buildBodyForSOAP("WebUrlFromPageUrl", "<pageUrl>" + window.location.href.replace(/&/g, "&amp;") + "</pageUrl>")
            });

          case 12:
            data = _context.sent;
            result = data.getElementsByTagName('WebUrlFromPageUrlResult');

            if (!result.length) {
              _context.next = 18;
              break;
            }

            return _context.abrupt("return", _Promise.resolve(checkURL(result[0].firstChild.nodeValue.toLowerCase())));

          case 18:
            return _context.abrupt("return", _Promise.reject("[SharepointPlus 'getURL'] Unable to retrieve the URL"));

          case 19:
            _context.next = 24;
            break;

          case 21:
            _context.prev = 21;
            _context.t0 = _context["catch"](9);
            return _context.abrupt("return", _Promise.reject(_context.t0));

          case 24:
            _context.next = 27;
            break;

          case 26:
            return _context.abrupt("return", _Promise.resolve(checkURL(this.url)));

          case 27:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this, [[9, 21]]);
  }));
  return _getURL.apply(this, arguments);
}

function checkURL(u) {
  return u === "" || u === "/" ? window.location.protocol + "//" + window.location.host + "/" : u;
}