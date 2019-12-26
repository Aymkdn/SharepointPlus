import _regeneratorRuntime from "@babel/runtime-corejs3/regenerator";
import _Promise from "@babel/runtime-corejs3/core-js-stable/promise";
import _asyncToGenerator from "@babel/runtime-corejs3/helpers/esm/asyncToGenerator";
import ajax from './ajax.js';
import getURL from './getURL.js';
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

export default function getTimeZoneInfo(_x) {
  return _getTimeZoneInfo.apply(this, arguments);
}

function _getTimeZoneInfo() {
  _getTimeZoneInfo = _asyncToGenerator(
  /*#__PURE__*/
  _regeneratorRuntime.mark(function _callee(settings) {
    var data;
    return _regeneratorRuntime.wrap(function _callee$(_context) {
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
            return getURL();

          case 5:
            settings.url = _context.sent;

          case 6:
            _context.next = 8;
            return ajax.call(this, {
              url: settings.url + '/_api/web/RegionalSettings/TimeZone'
            });

          case 8:
            data = _context.sent;
            return _context.abrupt("return", _Promise.resolve({
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
            return _context.abrupt("return", _Promise.reject(_context.t0));

          case 15:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this, [[0, 12]]);
  }));
  return _getTimeZoneInfo.apply(this, arguments);
}