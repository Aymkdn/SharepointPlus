"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js-stable/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.default = getManager;

var _regenerator = _interopRequireDefault(require("@babel/runtime-corejs3/regenerator"));

var _promise = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/promise"));

var _startsWith = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/starts-with"));

var _typeof2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/typeof"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/asyncToGenerator"));

var _getURL = _interopRequireDefault(require("../utils/getURL.js"));

var _getUserInfo = _interopRequireDefault(require("./getUserInfo.js"));

var _people = _interopRequireDefault(require("./people.js"));

/**
  @name $SP().getManager
  @function
  @category people
  @description Return the manager for the provided user, as a People string

  @param {String} [username] With or without the domain, and you can also use an email address, and if you leave it empty it's the current user by default
  @param {Object} [setup] Options (see below)
    @param {String} [setup.url='current website'] The website url
  @return {Function} resolve(manager), reject(error)

  @example
  $SP().getManager("john_doe",{url:"http://my.si.te/subdir/"})
  .then(function(manager) {
    console.log(manager); // 42;#Smith,, Jane,#i:0#.w|domain\Jane_Smith,#Jane_Smith@Domain.com,#Jane_Smith@Domain.com,#Smith,, Jane
    manager = $SP().getPeopleLookup(manager);
    console.log(manager.name); // "Smith, Jane"
  })
  .catch(function(err) {
    console.log("Err => ",err)
  });
*/
function getManager(_x, _x2) {
  return _getManager.apply(this, arguments);
}

function _getManager() {
  _getManager = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee(username, setup) {
    var pres,
        managerUserName,
        res,
        displayName,
        _args = arguments;
    return _regenerator.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;

            if (_args.length === 1 && (0, _typeof2.default)(username) === "object") {
              setup = username;
              username = "";
            } // default values


            username = username || "";
            setup = setup || {};

            if (setup.url) {
              _context.next = 8;
              break;
            }

            _context.next = 7;
            return _getURL.default.call(this);

          case 7:
            setup.url = _context.sent;

          case 8:
            _context.next = 10;
            return _people.default.call(this, username, setup);

          case 10:
            pres = _context.sent;
            managerUserName = pres.Manager;
            if (!(0, _startsWith.default)(managerUserName).call(managerUserName, 'i:0')) managerUserName = "i:0#.w|" + managerUserName;
            _context.next = 15;
            return _getUserInfo.default.call(this, managerUserName, setup);

          case 15:
            res = _context.sent;
            // "42;#Doe,, John,#i:0#.w|domain\John_Doe,#John_Doe@Domain.com,#John_Doe@Domain.com,#Doe,, John
            displayName = res.Name.replace(/,/, ",,");
            return _context.abrupt("return", _promise.default.resolve(res.ID + ";#" + displayName + ",#" + managerUserName + ",#" + res.Email + ",#" + res.Email + ",#" + displayName));

          case 20:
            _context.prev = 20;
            _context.t0 = _context["catch"](0);
            return _context.abrupt("return", _promise.default.reject(_context.t0));

          case 23:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this, [[0, 20]]);
  }));
  return _getManager.apply(this, arguments);
}

module.exports = exports.default;