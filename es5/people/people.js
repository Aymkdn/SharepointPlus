import _regeneratorRuntime from "@babel/runtime-corejs3/regenerator";
import _Promise from "@babel/runtime-corejs3/core-js-stable/promise";
import _typeof from "@babel/runtime-corejs3/helpers/esm/typeof";
import _asyncToGenerator from "@babel/runtime-corejs3/helpers/esm/asyncToGenerator";
import ajax from '../utils/ajax.js';
import _buildBodyForSOAP from '../lists/_buildBodyForSOAP.js';
import getURL from '../utils/getURL.js';
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

export default function people(_x, _x2) {
  return _people.apply(this, arguments);
}

function _people() {
  _people = _asyncToGenerator(
  /*#__PURE__*/
  _regeneratorRuntime.mark(function _callee(username, setup) {
    var data,
        aResult,
        name,
        value,
        i,
        len,
        _args = arguments;
    return _regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;

            if (_args.length === 1 && _typeof(username) === "object") {
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
            return getURL.call(this);

          case 7:
            setup.url = _context.sent;

          case 8:
            _context.next = 10;
            return ajax.call(this, {
              url: setup.url + "/_vti_bin/UserProfileService.asmx",
              body: _buildBodyForSOAP("GetUserProfileByName", "<AccountName>" + username + "</AccountName>", "http://microsoft.com/webservices/SharePointPortalServer/UserProfileService"),
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

            return _context.abrupt("return", _Promise.resolve(aResult));

          case 17:
            _context.prev = 17;
            _context.t0 = _context["catch"](0);
            return _context.abrupt("return", _Promise.reject(_context.t0));

          case 20:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this, [[0, 17]]);
  }));
  return _people.apply(this, arguments);
}