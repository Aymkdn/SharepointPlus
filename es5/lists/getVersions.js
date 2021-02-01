import _regeneratorRuntime from "@babel/runtime-corejs3/regenerator";
import _mapInstanceProperty from "@babel/runtime-corejs3/core-js-stable/instance/map";
import _Array$isArray from "@babel/runtime-corejs3/core-js-stable/array/is-array";
import _asyncToGenerator from "@babel/runtime-corejs3/helpers/esm/asyncToGenerator";
import info from './info.js';
import ajax from '../utils/ajax.js';
/**
  @name $SP().list.getVersions
  @function
  @description When versionning is activated on a list, you can use this function to get the different version label/number for a list item

  @param {Number} ID The item ID
  @return {Promise} resolve(arrayOflistOfVersions)

  @example
  $SP().list("My List").getVersions({
    ID:1
  }).then(function(versions) {
    versions.forEach(function(version) {
      console.log(version);
      // returns:
      //  - CheckInComment
      //  - Created
      //  - VersionID
      //  - IsCurrentVersion (boolean)
      //  - VersionLabel (e.g. "1.0", "2.0", …)
    })
  });
*/

export default function getVersions(_x) {
  return _getVersions.apply(this, arguments);
}

function _getVersions() {
  _getVersions = _asyncToGenerator(
  /*#__PURE__*/
  _regeneratorRuntime.mark(function _callee(itemID) {
    var infos, rootFolder;
    return _regeneratorRuntime.wrap(function _callee$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            if (this.listID) {
              _context2.next = 2;
              break;
            }

            throw "[SharepointPlus 'getVersions'] the list ID/Name is required.";

          case 2:
            if (this.url) {
              _context2.next = 4;
              break;
            }

            throw "[SharepointPlus 'getVersions'] not able to find the URL!";

          case 4:
            if (itemID) {
              _context2.next = 6;
              break;
            }

            throw "[SharepointPlus 'getVersions'] the item ID is required.";

          case 6:
            _context2.next = 8;
            return info.call(this);

          case 8:
            infos = _context2.sent;
            rootFolder = infos._List.RootFolder; // if no versionning

            if (!(infos._List.EnableVersioning !== "True")) {
              _context2.next = 12;
              break;
            }

            return _context2.abrupt("return", []);

          case 12:
            return _context2.abrupt("return", ajax.call(this, {
              url: this.url + "/_api/web/GetFileByServerRelativeUrl('" + encodeURIComponent(rootFolder + "/" + itemID + "_.000") + "')/Versions"
            }).then(function (res) {
              var _context;

              if (!res || !res.d || !_Array$isArray(res.d.results)) return [];
              return _mapInstanceProperty(_context = res.d.results).call(_context, function (item) {
                return {
                  CheckInComment: item.CheckInComment,
                  Created: item.Created,
                  VersionID: item.ID,
                  IsCurrentVersion: item.IsCurrentVersion,
                  VersionLabel: item.VersionLabel
                };
              });
            }));

          case 13:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee, this);
  }));
  return _getVersions.apply(this, arguments);
}