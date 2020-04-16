"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js-stable/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.default = list;

var _regenerator = _interopRequireDefault(require("@babel/runtime-corejs3/regenerator"));

var _promise = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/promise"));

var _slice = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/slice"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/asyncToGenerator"));

var _getURL = _interopRequireDefault(require("../utils/getURL.js"));

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
function list(_x, _x2) {
  return _list.apply(this, arguments);
}

function _list() {
  _list = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee(list, url) {
    return _regenerator.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            this.listID = list.replace(/&/g, "&amp;");

            if (!url) {
              _context.next = 5;
              break;
            }

            // make sure we don't have a '/' at the end
            this.url = (0, _slice.default)(url).call(url, -1) === '/' ? (0, _slice.default)(url).call(url, 0, -1) : url;
            _context.next = 8;
            break;

          case 5:
            _context.next = 7;
            return _getURL.default.call(this);

          case 7:
            this.url = _context.sent;

          case 8:
            return _context.abrupt("return", _promise.default.resolve());

          case 9:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this);
  }));
  return _list.apply(this, arguments);
}

module.exports = exports.default;