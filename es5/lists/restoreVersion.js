import _regeneratorRuntime from "@babel/runtime-corejs3/regenerator";
import _includesInstanceProperty from "@babel/runtime-corejs3/core-js-stable/instance/includes";
import _Promise from "@babel/runtime-corejs3/core-js-stable/promise";
import _asyncToGenerator from "@babel/runtime-corejs3/helpers/esm/asyncToGenerator";
import info from './info.js';
import ajax from '../utils/ajax.js';
import getRequestDigest from '../utils/getRequestDigest.js';
/**
  @name $SP().list.restoreVersion
  @function
  @description When versionning is activated on a list, you can use this function to restore another version label/number for a list item

  @param {Object} [setup] Options (see below)
    @param {Number} setup.ID The item ID
    @param {Number} setup.VersionID The version ID from $SP().list().getVersions()
  @return {Promise} resolve(true), reject(errorMessage)

  @example
  $SP().list("My List").restoreVersion({
    ID:1,
    VersionID:3849
  })
*/

export default function restoreVersion(_x) {
  return _restoreVersion.apply(this, arguments);
}

function _restoreVersion() {
  _restoreVersion = _asyncToGenerator(
  /*#__PURE__*/
  _regeneratorRuntime.mark(function _callee(setup) {
    var infos,
        rootFolder,
        reqDigest,
        _args = arguments;
    return _regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (!(_args.length === 0)) {
              _context.next = 2;
              break;
            }

            throw "[SharepointPlus 'restoreVersion'] the arguments are mandatory.";

          case 2:
            if (this.listID) {
              _context.next = 4;
              break;
            }

            throw "[SharepointPlus 'restoreVersion'] the list ID/Name is required.";

          case 4:
            if (this.url) {
              _context.next = 6;
              break;
            }

            throw "[SharepointPlus 'restoreVersion'] not able to find the URL!";

          case 6:
            if (setup.ID) {
              _context.next = 8;
              break;
            }

            throw "[SharepointPlus 'restoreVersion'] the item ID is required.";

          case 8:
            if (setup.VersionID) {
              _context.next = 10;
              break;
            }

            throw "[SharepointPlus 'restoreVersion'] the VersionID is required.";

          case 10:
            _context.next = 12;
            return info.call(this);

          case 12:
            infos = _context.sent;
            rootFolder = infos._List.RootFolder; // if no versionning

            if (!(infos._List.EnableVersioning !== "True")) {
              _context.next = 16;
              break;
            }

            return _context.abrupt("return", _Promise.reject("[SharepointPlus 'restoreVersion'] No versionning enabled on the list '" + this.listID + "'."));

          case 16:
            _context.next = 18;
            return getRequestDigest.call(this, {
              cache: false
            });

          case 18:
            reqDigest = _context.sent;
            return _context.abrupt("return", ajax.call(this, {
              url: this.url + "/_layouts/15/versions.aspx?FileName=" + encodeURIComponent(rootFolder + "/" + setup.ID + "_.000") + "&list=" + infos._List.Name + "&ID=" + setup.ID + "&col=Number&order=d&op=Restore&ver=" + setup.VersionID,
              method: "POST",
              body: "__REQUESTDIGEST=" + encodeURIComponent(reqDigest),
              headers: {
                "Content-Type": "application/x-www-form-urlencoded"
              }
            }).then(function (res) {
              if (_includesInstanceProperty(res).call(res, "Sorry, something went wrong")) return _Promise.reject("Something went wrong.");
              return true;
            }));

          case 20:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this);
  }));
  return _restoreVersion.apply(this, arguments);
}