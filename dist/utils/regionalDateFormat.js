"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js-stable/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.default = regionalDateFormat;

var _regenerator = _interopRequireDefault(require("@babel/runtime-corejs3/regenerator"));

var _parseInt2 = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/parse-int"));

var _promise = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/promise"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/asyncToGenerator"));

var _ajax = _interopRequireDefault(require("./ajax.js"));

var _getURL = _interopRequireDefault(require("./getURL.js"));

var _regionalSettings = _interopRequireDefault(require("./regionalSettings"));

/**
  @name $SP().regionalDateFormat
  @function
  @category utils
  @description Provide the Date Format based on the user regional settings (YYYY for 4-digits Year, YY for 2-digits day, MM for 2-digits Month, M for 1-digit Month, DD for 2-digits day, D for 1-digit day) -- it's using the DatePicker iFrame (so an AJAX request)

  @return {Promise} resolve(dateFormat), reject(error)

  @example
  // you'll typically need that info when parsing a date from a Date Picker field from a form
  // we suppose here you're using momentjs
  // eg. we want to verify start date is before end date
  var startDate = $SP().formfields("Start Date").val();
  var endDate = $SP().formfields("End Date").val();
  $SP().regionalDateFormat().then(function(dateFormat) {
    // if the user settings are on French, then dateFormat = "DD/MM/YYYY"
    if (moment(startDate, dateFormat).isAfter(moment(endDate, dateFormat))) {
      alert("StartDate must be before EndDate!")
    }
  })

  // Here is also an example of how you can parse a string date
  // -> https://gist.github.com/Aymkdn/b17903cf7786578300f04f50460ebe96
 */
function regionalDateFormat(_x) {
  return _regionalDateFormat.apply(this, arguments);
}

function _regionalDateFormat() {
  _regionalDateFormat = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee(url) {
    var lcid, data, div, x, r;
    return _regenerator.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;

            if (!global._SP_CACHE_DATEFORMAT) {
              _context.next = 3;
              break;
            }

            return _context.abrupt("return", _promise.default.resolve(global._SP_CACHE_DATEFORMAT));

          case 3:
            if (url) {
              _context.next = 7;
              break;
            }

            _context.next = 6;
            return _getURL.default.call(this);

          case 6:
            url = _context.sent;

          case 7:
            // check if we have LCID
            lcid = "";
            if (typeof _spRegionalSettings !== "undefined") lcid = _spRegionalSettings.localeId; // eslint-disable-line
            else if (global._SP_CACHE_REGIONALSETTINGS) lcid = global._SP_CACHE_REGIONALSETTINGS.lcid;

            if (lcid) {
              _context.next = 13;
              break;
            }

            _context.next = 12;
            return _regionalSettings.default.call(this, url);

          case 12:
            lcid = global._SP_CACHE_REGIONALSETTINGS.lcid;

          case 13:
            _context.next = 15;
            return _ajax.default.call(this, {
              url: url + "/_layouts/iframe.aspx?cal=1&date=1/1/2000&lcid=" + lcid
            });

          case 15:
            data = _context.sent;
            div = document.createElement('div');
            div.innerHTML = data; // div will contain the full datepicker page, for the January 2000
            // search for 3/January/2000

            x = div.querySelector('a[id="20000103"]').getAttribute("href").replace(/javascript:ClickDay\('(.*)'\)/, "$1"); // source : http://stackoverflow.com/questions/7885096/how-do-i-decode-a-string-with-escaped-unicode

            r = /\\u([\d\w]{4})/gi;
            x = x.replace(r, function (match, grp) {
              return String.fromCharCode((0, _parseInt2.default)(grp, 16));
            });
            x = unescape(x); // eg: 3.1.2000

            x = x.replace(/20/, "YY"); // 3.1.YY00

            x = x.replace(/00/, "YY"); // 3.1.YYYY

            x = x.replace(/03/, "DD"); // 3.1.YYYY

            x = x.replace(/3/, "D"); // D.1.YYYY

            x = x.replace(/01/, "MM"); // D.1.YYYY

            x = x.replace(/1/, "M"); // D.M.YYYY

            global._SP_CACHE_DATEFORMAT = x;
            return _context.abrupt("return", _promise.default.resolve(x));

          case 32:
            _context.prev = 32;
            _context.t0 = _context["catch"](0);
            return _context.abrupt("return", _promise.default.reject(_context.t0));

          case 35:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this, [[0, 32]]);
  }));
  return _regionalDateFormat.apply(this, arguments);
}

module.exports = exports.default;