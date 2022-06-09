"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js-stable/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.default = hasPermission;

var _regenerator = _interopRequireDefault(require("@babel/runtime-corejs3/regenerator"));

var _promise = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/promise"));

var _isArray = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/array/is-array"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/asyncToGenerator"));

var _ajax = _interopRequireDefault(require("../utils/ajax.js"));

/**
  @name $SP().list.hasPermission
  @function
  @description This function permits to check if the current user has a specific permission for a list/library
  @param {String|Array} perm Can be one of the values listed on https://docs.microsoft.com/en-us/previous-versions/office/developer/sharepoint-2010/ee556747(v%3Doffice.14)
  @return {Promise} A promise with a boolean (TRUE/FALSE) if the requested perm was a string, or an object ({perm1:BOOLEAN, perm2:BOOLEAN}) if it was an array

  @example
  // check permissions for list 'Travels'
  $SP().list('Travels').hasPermission('deleteListItems').then(function(hasPerm) {
    console.log('Can the user delete an item on Travels? ', hasPerm) // hasPerm is TRUE or FALSE
  })

  $SP().list('Travels').hasPermission(['addListItems','editListItems']).then(function(hasPerm) {
    console.log('Can the user add an item in Travels? ', hasPerm.addListItems);
    console.log('Can the user edit an item in Travels? ', hasPerm.editListItems);
  })
 */
function hasPermission(_x) {
  return _hasPermission.apply(this, arguments);
}

function _hasPermission() {
  _hasPermission = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee(perm) {
    var permMatch, permLen, i, data, serverPerm, ret, _i, a, b;

    return _regenerator.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;

            if (this.listID) {
              _context.next = 3;
              break;
            }

            throw "[SharepointPlus 'hasPermission'] the list ID/Name is required.";

          case 3:
            if (this.url) {
              _context.next = 5;
              break;
            }

            throw "[SharepointPlus 'hasPermission'] not able to find the URL!";

          case 5:
            // we cannot determine the url
            permMatch = {
              emptyMask: 0,
              viewListItems: 1,
              addListItems: 2,
              editListItems: 3,
              deleteListItems: 4,
              approveItems: 5,
              openItems: 6,
              viewVersions: 7,
              deleteVersions: 8,
              cancelCheckout: 9,
              managePersonalViews: 10,
              manageLists: 12,
              viewFormPages: 13,
              anonymousSearchAccessList: 14,
              open: 17,
              viewPages: 18,
              addAndCustomizePages: 19,
              applyThemeAndBorder: 20,
              applyStyleSheets: 21,
              viewUsageData: 22,
              createSSCSite: 23,
              manageSubwebs: 24,
              createGroups: 25,
              managePermissions: 26,
              browseDirectories: 27,
              browseUserInfo: 28,
              addDelPrivateWebParts: 29,
              updatePersonalWebParts: 30,
              manageWeb: 31,
              anonymousSearchAccessWebLists: 32,
              useClientIntegration: 37,
              useRemoteAPIs: 38,
              manageAlerts: 39,
              createAlerts: 40,
              editMyUserInfo: 41,
              enumeratePermissions: 63,
              fullMask: 65
            };
            if (!(0, _isArray.default)(perm)) perm = [perm];
            permLen = perm.length; // check all permissions exist

            i = 0;

          case 9:
            if (!(i < permLen)) {
              _context.next = 15;
              break;
            }

            if (!(permMatch[perm[i]] === undefined)) {
              _context.next = 12;
              break;
            }

            throw "[SharepointPlus 'hasPermission'] the permission '" + perm + "' is not valid. Please, check the documentation.";

          case 12:
            i++;
            _context.next = 9;
            break;

          case 15:
            _context.next = 17;
            return _ajax.default.call(this, {
              url: this.url + "/_api/web/lists/getbytitle('" + this.listID + "')/EffectiveBasePermissions"
            });

          case 17:
            data = _context.sent;
            serverPerm = data.d.EffectiveBasePermissions;
            ret = {};

            for (_i = 0; _i < permLen; _i++) {
              if (permMatch[perm[_i]] === 65) ret[perm[_i]] = (serverPerm.High & 32767) === 32767 && serverPerm.Low === 65535;
              a = permMatch[perm[_i]] - 1;
              b = 1;

              if (a >= 0 && a < 32) {
                b = b << a;
                ret[perm[_i]] = 0 !== (serverPerm.Low & b);
              } else if (a >= 32 && a < 64) {
                b = b << a - 32;
                ret[perm[_i]] = 0 !== (serverPerm.High & b);
              } else {
                ret[perm[_i]] = false;
              }
            }

            return _context.abrupt("return", permLen === 1 ? ret[perm[0]] : ret);

          case 24:
            _context.prev = 24;
            _context.t0 = _context["catch"](0);
            return _context.abrupt("return", _promise.default.reject(_context.t0));

          case 27:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this, [[0, 24]]);
  }));
  return _hasPermission.apply(this, arguments);
}

module.exports = exports.default;