"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js-stable/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.default = removeAttachment;

var _regenerator = _interopRequireDefault(require("@babel/runtime-corejs3/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/asyncToGenerator"));

var _ajax = _interopRequireDefault(require("../utils/ajax.js"));

var _buildBodyForSOAP2 = _interopRequireDefault(require("./_buildBodyForSOAP.js"));

var _getVersions = _interopRequireDefault(require("./getVersions.js"));

var _restoreVersion = _interopRequireDefault(require("./restoreVersion.js"));

/**
  @name $SP().list.removeAttachment
  @function
  @description Remove an attachment from a Sharepoint List Item

  @param {Object} setup Options (see below)
    @param {Number} setup.ID The item ID where the file will be removed
    @param {String} setup.fileURL The full path to the file
  @return {Promise} resolve(true), reject()

  @example
  $SP().list("My List").removeAttachment({
    ID:1,
    fileURL:"https://mysite.share.point.com/Toolbox/Lists/Tasks/Attachments/2305/image1.png"
  })
*/
function removeAttachment(setup) {
  var _this = this;

  if (arguments.length === 0) throw "[SharepointPlus 'removeAttachment'] the arguments are mandatory.";
  if (!this.listID) throw "[SharepointPlus 'removeAttachment'] the list ID/Name is required.";
  if (!this.url) throw "[SharepointPlus 'removeAttachment'] not able to find the URL!"; // we cannot determine the url

  if (!setup.ID) throw "[SharepointPlus 'removeAttachment'] the item ID is required.";
  if (!setup.fileURL) throw "[SharepointPlus 'removeAttachment'] the fileURL is required.";
  return _ajax.default.call(this, {
    url: this.url + "/_vti_bin/Lists.asmx",
    body: (0, _buildBodyForSOAP2.default)("DeleteAttachment", "<listName>" + this.listID + "</listName><listItemID>" + setup.ID + "</listItemID><url>" + setup.fileURL + "</url>"),
    headers: {
      'SOAPAction': 'http://schemas.microsoft.com/sharepoint/soap/DeleteAttachment'
    }
  }).then(
  /*#__PURE__*/
  (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee() {
    var versions, versionID;
    return _regenerator.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            _context.next = 3;
            return _getVersions.default.call(_this, setup.ID);

          case 3:
            versions = _context.sent;

            if (!(versions.length > 0)) {
              _context.next = 8;
              break;
            }

            versionID = versions[versions.length - 1].VersionID;
            _context.next = 8;
            return _restoreVersion.default.call(_this, {
              ID: setup.ID,
              VersionID: versionID
            });

          case 8:
            return _context.abrupt("return", true);

          case 11:
            _context.prev = 11;
            _context.t0 = _context["catch"](0);
            return _context.abrupt("return", true);

          case 14:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[0, 11]]);
  })));
}

module.exports = exports.default;