"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js-stable/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.default = getUserInfo;

var _regenerator = _interopRequireDefault(require("@babel/runtime-corejs3/regenerator"));

var _promise = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/promise"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/asyncToGenerator"));

var _ajax = _interopRequireDefault(require("../utils/ajax.js"));

var _buildBodyForSOAP2 = _interopRequireDefault(require("../lists/_buildBodyForSOAP.js"));

var _getURL = _interopRequireDefault(require("../utils/getURL.js"));

/**
  @name $SP().getUserInfo
  @function
  @category people
  @description Find the User ID, work email, and preferred name for the specified username (this is useful because of the User ID that can then be used for filtering a list)

  @param {String} username That must be "domain\\login" for Sharepoint 2010, or something like "i:0#.w|domain\\login" for Sharepoint 2013
  @param {Object} [setup] Options (see below)
    @param {String} [setup.url='current website'] The website url
  @return {Promise} resolve({ID,Sid,Name,LoginName,Email,Notes,IsSiteAdmin,IsDomainGroup,Flags}), reject(error)

  @example
  $SP().getUserInfo("domain\\john_doe",{url:"http://my.si.te/subdir/"}).then(function(info) {
    alert("User ID = "+info.ID)
  }, function(error) {
    console.log(error)
  });
*/
function getUserInfo(_x, _x2) {
  return _getUserInfo.apply(this, arguments);
}

function _getUserInfo() {
  _getUserInfo = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee(username, setup) {
    var data;
    return _regenerator.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;

            if (!(typeof username !== "string")) {
              _context.next = 3;
              break;
            }

            throw "[SharepointPlus 'getUserInfo'] the username is required.";

          case 3:
            // default values
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
            return _ajax.default.call(this, {
              url: setup.url + "/_vti_bin/usergroup.asmx",
              body: (0, _buildBodyForSOAP2.default)("GetUserInfo", '<userLoginName>' + username + '</userLoginName>', "http://schemas.microsoft.com/sharepoint/soap/directory/")
            });

          case 10:
            data = _context.sent;
            // get the details
            data = data.getElementsByTagName('User');

            if (!(data.length === 0)) {
              _context.next = 16;
              break;
            }

            return _context.abrupt("return", _promise.default.reject("[SharepointPlus 'getUserInfo'] nothing returned?!"));

          case 16:
            return _context.abrupt("return", _promise.default.resolve({
              ID: data[0].getAttribute("ID"),
              Sid: data[0].getAttribute("Sid"),
              Name: data[0].getAttribute("Name"),
              LoginName: data[0].getAttribute("LoginName"),
              Email: data[0].getAttribute("Email"),
              Notes: data[0].getAttribute("Notes"),
              IsSiteAdmin: data[0].getAttribute("IsSiteAdmin"),
              IsDomainGroup: data[0].getAttribute("IsDomainGroup"),
              Flags: data[0].getAttribute("Flags")
            }));

          case 17:
            _context.next = 22;
            break;

          case 19:
            _context.prev = 19;
            _context.t0 = _context["catch"](0);
            return _context.abrupt("return", _promise.default.reject(_context.t0));

          case 22:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this, [[0, 19]]);
  }));
  return _getUserInfo.apply(this, arguments);
}

module.exports = exports.default;