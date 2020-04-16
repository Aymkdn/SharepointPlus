"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js-stable/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.default = getTimeZoneInfo;

var _regenerator = _interopRequireDefault(require("@babel/runtime-corejs3/regenerator"));

var _promise = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/promise"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/asyncToGenerator"));

var _ajax = _interopRequireDefault(require("./ajax.js"));

var _getURL = _interopRequireDefault(require("./getURL.js"));

/**
 * @name $SP().getTimeZoneInfo
 * @function
 * @category utils
 * @description Permits to retrieve the TimeZone informations (ID, Description, XMLTZone) based on the server's timezone
 *
 * @param {Object} [settings]
 *   @param {String} [settings.url="current website"]
 * @return {Object} resolve({ID, Description, XMLTZone}), reject(error)
 */
function getTimeZoneInfo(_x) {
  return _getTimeZoneInfo.apply(this, arguments);
}

function _getTimeZoneInfo() {
  _getTimeZoneInfo = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee(settings) {
    var data;
    return _regenerator.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            settings = settings || {};

            if (settings.url) {
              _context.next = 6;
              break;
            }

            _context.next = 5;
            return (0, _getURL.default)();

          case 5:
            settings.url = _context.sent;

          case 6:
            _context.next = 8;
            return _ajax.default.call(this, {
              url: settings.url + '/_api/web/RegionalSettings/TimeZone'
            });

          case 8:
            data = _context.sent;
            return _context.abrupt("return", _promise.default.resolve({
              ID: data.d.Id,
              Description: data.d.Description,
              Bias: data.d.Information.Bias,
              StandardBias: data.d.Information.StandardBias,
              DaylightBias: data.d.Information.DaylightBias,
              XMLTZone: "<timeZoneRule><standardBias>" + (data.d.Information.Bias * 1 + data.d.Information.StandardBias * 1) + "</standardBias><additionalDaylightBias>" + data.d.Information.DaylightBias + "</additionalDaylightBias></timeZoneRule>"
            }));

          case 12:
            _context.prev = 12;
            _context.t0 = _context["catch"](0);
            return _context.abrupt("return", _promise.default.reject(_context.t0));

          case 15:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this, [[0, 12]]);
  }));
  return _getTimeZoneInfo.apply(this, arguments);
}

module.exports = exports.default;