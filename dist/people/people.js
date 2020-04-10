"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js-stable/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports["default"] = people;

var _regenerator = _interopRequireDefault(require("@babel/runtime-corejs3/regenerator"));

var _promise = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/promise"));

var _typeof2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/typeof"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/asyncToGenerator"));

var _ajax = _interopRequireDefault(require("../utils/ajax.js"));

var _buildBodyForSOAP2 = _interopRequireDefault(require("../lists/_buildBodyForSOAP.js"));

var _getURL = _interopRequireDefault(require("../utils/getURL.js"));

/**
  @name $SP().people
  @function
  @category people
  @description Find the user details like manager, email, ...

  @param {String} [username] With or without the domain, and you can also use an email address, and if you leave it empty it's the current user by default (if you use the domain, don't forget to use a double \ like "mydomain\\john_doe")
  @param {Object} [setup] Options (see below)
    @param {String} [setup.url='current website'] The website url
  @return {Function} resolve(people), reject(error)

  @example
  $SP().people("john_doe",{url:"http://my.si.te/subdir/"}).then(function(people) {
    for (var i=0; i &lt; people.length; i++) console.log(people[i]+" = "+people[people[i]]);
  }, function(err) {
    console.log("Err => ",err)
  });
*/
function people(_x, _x2) {
  return _people.apply(this, arguments);
}

function _people() {
  _people = (0, _asyncToGenerator2["default"])(
  /*#__PURE__*/
  _regenerator["default"].mark(function _callee(username, setup) {
    var data,
        aResult,
        name,
        value,
        i,
        len,
        _args = arguments;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;

            if (_args.length === 1 && (0, _typeof2["default"])(username) === "object") {
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
            return _getURL["default"].call(this);

          case 7:
            setup.url = _context.sent;

          case 8:
            _context.next = 10;
            return _ajax["default"].call(this, {
              url: setup.url + "/_vti_bin/UserProfileService.asmx",
              body: (0, _buildBodyForSOAP2["default"])("GetUserProfileByName", "<AccountName>" + username + "</AccountName>", "http://microsoft.com/webservices/SharePointPortalServer/UserProfileService"),
              headers: {
                'SOAPAction': 'http://microsoft.com/webservices/SharePointPortalServer/UserProfileService/GetUserProfileByName'
              }
            });

          case 10:
            data = _context.sent;
            aResult = []; // get the details

            data = data.getElementsByTagName('PropertyData');

            for (i = 0, len = data.length; i < len; i++) {
              name = data[i].getElementsByTagName("Name")[0].firstChild.nodeValue;
              value = data[i].getElementsByTagName("Value");
              value = value.length > 0 ? value[0] : null;
              if (value && value.firstChild) value = value.firstChild.nodeValue;else value = "No Value";
              aResult.push(name);
              aResult[name] = value;
            }

            return _context.abrupt("return", _promise["default"].resolve(aResult));

          case 17:
            _context.prev = 17;
            _context.t0 = _context["catch"](0);
            return _context.abrupt("return", _promise["default"].reject(_context.t0));

          case 20:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this, [[0, 17]]);
  }));
  return _people.apply(this, arguments);
}

module.exports = exports.default;