import _regeneratorRuntime from "@babel/runtime-corejs3/regenerator";
import _Promise from "@babel/runtime-corejs3/core-js-stable/promise";
import _typeof from "@babel/runtime-corejs3/helpers/esm/typeof";
import _asyncToGenerator from "@babel/runtime-corejs3/helpers/esm/asyncToGenerator";
import ajax from './ajax.js';
import getURL from './getURL.js';
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

export default function getServerTime(_x, _x2) {
  return _getServerTime.apply(this, arguments);
}

function _getServerTime() {
  _getServerTime = _asyncToGenerator(
  /*#__PURE__*/
  _regeneratorRuntime.mark(function _callee(date, url) {
    var data;
    return _regeneratorRuntime.wrap(function _callee$(_context) {
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
            return getURL.call(this);

          case 5:
            url = _context.sent;

          case 6:
            _context.next = 8;
            return ajax.call(this, {
              url: url + "/_api/web/RegionalSettings/TimeZone/utcToLocalTime(@date)?@date='" + date.toUTCString() + "'"
            });

          case 8:
            data = _context.sent;

            if (!(_typeof(data) === "object" && data.d && data.d.UTCToLocalTime)) {
              _context.next = 11;
              break;
            }

            return _context.abrupt("return", _Promise.resolve(data.d.UTCToLocalTime + 'Z'));

          case 11:
            return _context.abrupt("return", _Promise.reject("[getServerTime] The server didn't return the expected response."));

          case 14:
            _context.prev = 14;
            _context.t0 = _context["catch"](0);
            return _context.abrupt("return", _Promise.reject(_context.t0));

          case 17:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this, [[0, 14]]);
  }));
  return _getServerTime.apply(this, arguments);
}