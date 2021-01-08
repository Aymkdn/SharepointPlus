"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js-stable/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.default = getServerTime;

var _regenerator = _interopRequireDefault(require("@babel/runtime-corejs3/regenerator"));

var _promise = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/promise"));

var _typeof2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/typeof"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/asyncToGenerator"));

var _ajax = _interopRequireDefault(require("./ajax.js"));

var _getURL = _interopRequireDefault(require("./getURL.js"));

/**
  @name $SP().getServerTime
  @function
  @category utils
  @description Return the current server time (or convert the passed date)

  @param {Date} [date=new Date()] You can send a Date object and it will be converted using the server time
  @param {String} [url="current website"] The url of the website
  @return {Promise} resolve(DateInUTC), reject(error)

  @example
  $SP().getServerTime().then(function(dateInUTC) {
    console.log("Server Time: "+dateInUTC);
  }, function(error) {
    console.log(error)
  })
*/
function getServerTime(_x, _x2) {
  return _getServerTime.apply(this, arguments);
}

function _getServerTime() {
  _getServerTime = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee(date, url) {
    var data;
    return _regenerator.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            date = date || new Date(); // find the base URL

            if (url) {
              _context.next = 6;
              break;
            }

            _context.next = 5;
            return _getURL.default.call(this);

          case 5:
            url = _context.sent;

          case 6:
            _context.next = 8;
            return _ajax.default.call(this, {
              url: url + "/_api/web/RegionalSettings/TimeZone/utcToLocalTime(@date)?@date='" + date.toUTCString() + "'"
            });

          case 8:
            data = _context.sent;

            if (!((0, _typeof2.default)(data) === "object" && data.d && data.d.UTCToLocalTime)) {
              _context.next = 11;
              break;
            }

            return _context.abrupt("return", _promise.default.resolve(data.d.UTCToLocalTime + 'Z'));

          case 11:
            return _context.abrupt("return", _promise.default.reject("[getServerTime] The server didn't return the expected response."));

          case 14:
            _context.prev = 14;
            _context.t0 = _context["catch"](0);
            return _context.abrupt("return", _promise.default.reject(_context.t0));

          case 17:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this, [[0, 14]]);
  }));
  return _getServerTime.apply(this, arguments);
}

module.exports = exports.default;