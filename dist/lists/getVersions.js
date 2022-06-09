"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js-stable/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.default = getVersions;

var _regenerator = _interopRequireDefault(require("@babel/runtime-corejs3/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/asyncToGenerator"));

var _ajax = _interopRequireDefault(require("../utils/ajax.js"));

/**
  @name $SP().list.getVersions
  @function
  @description When versionning is activated on a list, you can use this function to get the different versions of a list item

  @param {Number} ID The item ID
  @return {Promise} resolve(arrayOfVersions)

  @example
  $SP().list("My List").getVersions(1234).then(function(versions) {
    versions.forEach(function(version) {
      console.log(version);
    })
  });
*/
function getVersions(_x) {
  return _getVersions.apply(this, arguments);
}

function _getVersions() {
  _getVersions = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee(itemID) {
    return _regenerator.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (this.listID) {
              _context.next = 2;
              break;
            }

            throw "[SharepointPlus 'getVersions'] the list ID/Name is required.";

          case 2:
            if (this.url) {
              _context.next = 4;
              break;
            }

            throw "[SharepointPlus 'getVersions'] not able to find the URL!";

          case 4:
            if (itemID) {
              _context.next = 6;
              break;
            }

            throw "[SharepointPlus 'getVersions'] the item ID is required.";

          case 6:
            return _context.abrupt("return", _ajax.default.call(this, {
              url: this.url + "/_api/lists/getbytitle('" + this.listID + "')/Items(" + itemID + ")/Versions"
            }).then(function (res) {
              return (res.d ? res.d.results : res.value) || [];
            }));

          case 7:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this);
  }));
  return _getVersions.apply(this, arguments);
}

module.exports = exports.default;