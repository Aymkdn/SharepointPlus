import _regeneratorRuntime from "@babel/runtime-corejs3/regenerator";
import _asyncToGenerator from "@babel/runtime-corejs3/helpers/esm/asyncToGenerator";
import ajax from '../utils/ajax.js';
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

export default function getVersions(_x) {
  return _getVersions.apply(this, arguments);
}

function _getVersions() {
  _getVersions = _asyncToGenerator(
  /*#__PURE__*/
  _regeneratorRuntime.mark(function _callee(itemID) {
    return _regeneratorRuntime.wrap(function _callee$(_context) {
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
            return _context.abrupt("return", ajax.call(this, {
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