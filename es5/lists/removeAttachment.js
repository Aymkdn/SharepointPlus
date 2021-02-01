import _regeneratorRuntime from "@babel/runtime-corejs3/regenerator";
import _asyncToGenerator from "@babel/runtime-corejs3/helpers/esm/asyncToGenerator";
import ajax from '../utils/ajax.js';
import _buildBodyForSOAP from './_buildBodyForSOAP.js';
import getVersions from './getVersions.js';
import restoreVersion from './restoreVersion.js';
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
    filename:"https://mysite.share.point.com/Toolbox/Lists/Tasks/Attachments/2305/image1.png"
  })
*/

export default function removeAttachment(setup) {
  var _this = this;

  if (arguments.length === 0) throw "[SharepointPlus 'removeAttachment'] the arguments are mandatory.";
  if (!this.listID) throw "[SharepointPlus 'removeAttachment'] the list ID/Name is required.";
  if (!this.url) throw "[SharepointPlus 'removeAttachment'] not able to find the URL!"; // we cannot determine the url

  if (!setup.ID) throw "[SharepointPlus 'removeAttachment'] the item ID is required.";
  if (!setup.fileURL) throw "[SharepointPlus 'removeAttachment'] the fileURL is required.";
  return ajax.call(this, {
    url: this.url + "/_vti_bin/Lists.asmx",
    body: _buildBodyForSOAP("DeleteAttachment", "<listName>" + this.listID + "</listName><listItemID>" + setup.ID + "</listItemID><url>" + setup.fileURL + "</url>"),
    headers: {
      'SOAPAction': 'http://schemas.microsoft.com/sharepoint/soap/DeleteAttachment'
    }
  }).then(
  /*#__PURE__*/
  _asyncToGenerator(
  /*#__PURE__*/
  _regeneratorRuntime.mark(function _callee() {
    var versions, versionID;
    return _regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            _context.next = 3;
            return getVersions.call(_this, setup.ID);

          case 3:
            versions = _context.sent;

            if (!(versions.length > 0)) {
              _context.next = 8;
              break;
            }

            versionID = versions[versions.length - 1].VersionID;
            _context.next = 8;
            return restoreVersion.call(_this, {
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