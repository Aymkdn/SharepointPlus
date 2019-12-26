import _regeneratorRuntime from "@babel/runtime-corejs3/regenerator";
import _Promise from "@babel/runtime-corejs3/core-js-stable/promise";
import _sliceInstanceProperty from "@babel/runtime-corejs3/core-js-stable/instance/slice";
import _asyncToGenerator from "@babel/runtime-corejs3/helpers/esm/asyncToGenerator";
import getURL from '../utils/getURL.js';
/**
  @name $SP().list
  @namespace
  @description Permits to define the list ID/name

  @param {String} listID Ths list ID or the list name
  @param {String} [url] If the list name is provided, then you need to make sure URL is provided too (then no need to define the URL again for the chained functions like 'get' or 'update')
  @return {Object} the current SharepointPlus object

  @example
  $SP().list("My List");
  $SP().list("My List","http://my.sharpoi.nt/other.directory/");
*/

export default function list(_x, _x2) {
  return _list.apply(this, arguments);
}

function _list() {
  _list = _asyncToGenerator(
  /*#__PURE__*/
  _regeneratorRuntime.mark(function _callee(list, url) {
    return _regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            this.listID = list.replace(/&/g, "&amp;");

            if (!url) {
              _context.next = 5;
              break;
            }

            // make sure we don't have a '/' at the end
            this.url = _sliceInstanceProperty(url).call(url, -1) === '/' ? _sliceInstanceProperty(url).call(url, 0, -1) : url;
            _context.next = 8;
            break;

          case 5:
            _context.next = 7;
            return getURL.call(this);

          case 7:
            this.url = _context.sent;

          case 8:
            return _context.abrupt("return", _Promise.resolve());

          case 9:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this);
  }));
  return _list.apply(this, arguments);
}