"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js-stable/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports["default"] = regionalSettings;

var _regenerator = _interopRequireDefault(require("@babel/runtime-corejs3/regenerator"));

var _promise = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/promise"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/asyncToGenerator"));

var _ajax = _interopRequireDefault(require("./ajax.js"));

var _getURL = _interopRequireDefault(require("./getURL.js"));

/**
  @name $SP().regionalSettings
  @function
  @category utils
  @description Find the region settings (of the current user) defined with _layouts/regionalsetng.aspx?Type=User (lcid, cultureInfo, timeZone, calendar, alternateCalendar, workWeek, timeFormat..)

  @return {Promise} resolve({lcid, cultureInfo, timeZone, calendar, alternateCalendar, workWeek:{days, firstDayOfWeek, firstWeekOfYear, startTime, endTime}}), reject(error)

  @example
  $SP().regionalSettings().then(function(region) {
    // show the selected timezone, and the working days
    console.log("timeZone: "+region.timeZone);
    console.log("working days: "+region.workWeek.days.join(", "))
  }, function(error) {
    console.log(error)
  })
*/
function regionalSettings(_x) {
  return _regionalSettings.apply(this, arguments);
}

function _regionalSettings() {
  _regionalSettings = (0, _asyncToGenerator2["default"])(
  /*#__PURE__*/
  _regenerator["default"].mark(function _callee(url) {
    var data, result, div, tmp, i, getValue;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;

            if (!global._SP_CACHE_REGIONALSETTINGS) {
              _context.next = 3;
              break;
            }

            return _context.abrupt("return", _promise["default"].resolve(global._SP_CACHE_REGIONALSETTINGS));

          case 3:
            if (url) {
              _context.next = 7;
              break;
            }

            _context.next = 6;
            return _getURL["default"].call(this);

          case 6:
            url = _context.sent;

          case 7:
            _context.next = 9;
            return _ajax["default"].call(this, {
              url: url + "/_layouts/regionalsetng.aspx?Type=User"
            });

          case 9:
            data = _context.sent;
            result = {
              lcid: "",
              cultureInfo: "",
              timeZone: "",
              calendar: "",
              alternateCalendar: ""
            };
            div = document.createElement('div');
            div.innerHTML = data;

            getValue = function getValue(id) {
              var e = div.querySelector("select[id$='" + id + "']");
              return e.options[e.selectedIndex].innerHTML;
            };

            result.lcid = div.querySelector("select[id$='LCID']").value;
            result.cultureInfo = getValue("LCID");
            result.timeZone = getValue("TimeZone");
            result.calendar = getValue("DdlwebCalType");
            result.alternateCalendar = getValue("DdlwebAltCalType");
            tmp = document.querySelectorAll("input[id*='ChkListWeeklyMultiDays']");
            result.workWeek = {
              days: [],
              firstDayOfWeek: "",
              firstWeekOfYear: "",
              startTime: "",
              endTime: ""
            };

            for (i = 0; i < tmp.length; i++) {
              if (tmp[i].checked) result.workWeek.days.push(tmp[i].nextSibling.querySelector('abbr').getAttribute("title"));
            }

            result.workWeek.firstDayOfWeek = getValue("DdlFirstDayOfWeek");
            result.workWeek.firstWeekOfYear = getValue("DdlFirstWeekOfYear");
            result.workWeek.startTime = div.querySelector("select[id$='DdlStartTime']").value;
            result.workWeek.endTime = div.querySelector("select[id$='DdlEndTime']").value;
            result.timeFormat = getValue("DdlTimeFormat"); // cache

            global._SP_CACHE_REGIONALSETTINGS = result;
            return _context.abrupt("return", _promise["default"].resolve(result));

          case 31:
            _context.prev = 31;
            _context.t0 = _context["catch"](0);
            return _context.abrupt("return", _promise["default"].reject(_context.t0));

          case 34:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this, [[0, 31]]);
  }));
  return _regionalSettings.apply(this, arguments);
}

module.exports = exports.default;