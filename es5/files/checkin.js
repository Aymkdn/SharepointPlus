import _regeneratorRuntime from "@babel/runtime-corejs3/regenerator";
import _Promise from "@babel/runtime-corejs3/core-js-stable/promise";
import _asyncToGenerator from "@babel/runtime-corejs3/helpers/esm/asyncToGenerator";
import getURL from '../utils/getURL.js';
import ajax from '../utils/ajax.js';
import _buildBodyForSOAP from '../lists/_buildBodyForSOAP.js';
/**
  @name $SP().checkin
  @function
  @category files
  @description Checkin a file

  @param {Object} [setup] Options (see below)
    @param {String} setup.destination The full path to the file to check in
    @param {String} [setup.type='MajorCheckIn'] It can be 'MinorCheckIn' (incremented as a minor version), 'MajorCheckIn' (incremented as a major version), or 'OverwriteCheckIn' (overwrite the file)
    @param {String} [setup.comments=""] The comments related to the check in
    @param {String} [setup.url='current website'] The website url
  @return {Promise} resolve() then checked in is done, reject(error) otherwise

  @example
  // with Promise
  $SP().checkin({
    destination:"http://mysite/Shared Documents/myfile.txt",
    comments:"Automatic check in with SharepointPlus"
  }).then(function() {
    alert("Done");
  }).catch(function(error) {
    alert("Check in failed")
  })
*/

export default function checkin(_x) {
  return _checkin.apply(this, arguments);
}

function _checkin() {
  _checkin = _asyncToGenerator(
  /*#__PURE__*/
  _regeneratorRuntime.mark(function _callee(setup) {
    var type, data, res;
    return _regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            setup = setup || {};

            if (setup.destination) {
              _context.next = 4;
              break;
            }

            throw "[SharepointPlus 'checkin'] the file destination path is required.";

          case 4:
            if (this.url && !setup.url) setup.url = this.url;

            if (setup.url) {
              _context.next = 9;
              break;
            }

            _context.next = 8;
            return getURL.call(this);

          case 8:
            setup.url = _context.sent;

          case 9:
            setup.comments = (setup.comments || "").replace(/&/g, "&amp;");
            type = 1;
            _context.t0 = setup.type;
            _context.next = _context.t0 === "MinorCheckIn" ? 14 : _context.t0 === "OverwriteCheckIn" ? 16 : 18;
            break;

          case 14:
            type = 0;
            return _context.abrupt("break", 18);

          case 16:
            type = 2;
            return _context.abrupt("break", 18);

          case 18:
            _context.next = 20;
            return ajax.call(this, {
              url: setup.url + "/_vti_bin/Lists.asmx",
              body: _buildBodyForSOAP("CheckInFile", '<pageUrl>' + setup.destination + '</pageUrl><comment>' + setup.comments + '</comment><CheckinType>' + type + '</CheckinType>'),
              headers: {
                'SOAPAction': 'http://schemas.microsoft.com/sharepoint/soap/CheckInFile'
              }
            });

          case 20:
            data = _context.sent;
            res = data.getElementsByTagName('CheckInFileResult');
            res = res.length > 0 ? res[0] : null;

            if (!(res && res.firstChild.nodeValue != "true")) {
              _context.next = 27;
              break;
            }

            return _context.abrupt("return", _Promise.reject(res));

          case 27:
            return _context.abrupt("return", _Promise.resolve());

          case 28:
            _context.next = 33;
            break;

          case 30:
            _context.prev = 30;
            _context.t1 = _context["catch"](0);
            return _context.abrupt("return", _Promise.reject(_context.t1));

          case 33:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this, [[0, 30]]);
  }));
  return _checkin.apply(this, arguments);
}