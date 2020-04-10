"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js-stable/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports["default"] = distributionLists;

var _regenerator = _interopRequireDefault(require("@babel/runtime-corejs3/regenerator"));

var _promise = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/promise"));

var _getIterator2 = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/get-iterator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/asyncToGenerator"));

var _ajax = _interopRequireDefault(require("../utils/ajax.js"));

var _buildBodyForSOAP2 = _interopRequireDefault(require("../lists/_buildBodyForSOAP.js"));

var _getURL = _interopRequireDefault(require("../utils/getURL.js"));

/**
  @name $SP().distributionLists
  @function
  @category people
  @description Find the distribution lists where the specified user is member of

  @param {String} username The username with or without the domain ("domain\\login" for Sharepoint 2010, or e.g. "i:0#.w|domain\\login" for Sharepoint 2013)
  @param {Object} [setup] Options (see below)
    @param {String} [setup.url='current website'] The website url
    @param {Boolean} [setup.cache=true] Cache the response from the server
  @return {Promise} resolve(mailings), reject(error)

  @example
  $SP().distributionLists("mydomain\\john_doe",{url:"http://my.si.te/subdir/"}).then(function(mailing) {
    for (var i=0; i &lt; mailing.length; i++) console.log(mailing[i]); // -> {SourceReference: "cn=listname,ou=distribution lists,ou=rainbow,dc=com", DisplayName:"listname", MailNickname:"List Name", Url:"mailto:listname@rainbow.com"}
  });
*/
function distributionLists(_x, _x2) {
  return _distributionLists.apply(this, arguments);
}

function _distributionLists() {
  _distributionLists = (0, _asyncToGenerator2["default"])(
  /*#__PURE__*/
  _regenerator["default"].mark(function _callee(username, setup) {
    var _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, c, data, aResult, i, len, found, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, _c;

    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;

            if (username) {
              _context.next = 3;
              break;
            }

            throw "[SharepointPlus 'distributionLists'] the username is required.";

          case 3:
            // default values
            setup = setup || {};

            if (setup.url) {
              _context.next = 8;
              break;
            }

            _context.next = 7;
            return _getURL["default"].call(this);

          case 7:
            setup.url = _context.sent;

          case 8:
            username = username.toLowerCase();
            setup.url = setup.url.toLowerCase();
            setup.cache = setup.cache === false ? false : true; // check the cache
            // [ {user:"username", url:"url", data:"the distribution lists"}, ... ]

            if (!setup.cache) {
              _context.next = 38;
              break;
            }

            _iteratorNormalCompletion = true;
            _didIteratorError = false;
            _iteratorError = undefined;
            _context.prev = 15;
            _iterator = (0, _getIterator2["default"])(global._SP_CACHE_DISTRIBUTIONLISTS);

          case 17:
            if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
              _context.next = 24;
              break;
            }

            c = _step.value;

            if (!(c.user === username && c.url === setup.url)) {
              _context.next = 21;
              break;
            }

            return _context.abrupt("return", _promise["default"].resolve(c.data));

          case 21:
            _iteratorNormalCompletion = true;
            _context.next = 17;
            break;

          case 24:
            _context.next = 30;
            break;

          case 26:
            _context.prev = 26;
            _context.t0 = _context["catch"](15);
            _didIteratorError = true;
            _iteratorError = _context.t0;

          case 30:
            _context.prev = 30;
            _context.prev = 31;

            if (!_iteratorNormalCompletion && _iterator["return"] != null) {
              _iterator["return"]();
            }

          case 33:
            _context.prev = 33;

            if (!_didIteratorError) {
              _context.next = 36;
              break;
            }

            throw _iteratorError;

          case 36:
            return _context.finish(33);

          case 37:
            return _context.finish(30);

          case 38:
            _context.next = 40;
            return _ajax["default"].call(this, {
              url: setup.url + "/_vti_bin/UserProfileService.asmx",
              body: (0, _buildBodyForSOAP2["default"])("GetCommonMemberships", "<accountName>" + username + "</accountName>", "http://microsoft.com/webservices/SharePointPortalServer/UserProfileService"),
              headers: {
                'SOAPAction': 'http://microsoft.com/webservices/SharePointPortalServer/UserProfileService/GetUserMemberships'
              }
            });

          case 40:
            data = _context.sent;
            aResult = []; // get the details

            data = data.getElementsByTagName('MembershipData');

            for (i = 0, len = data.length; i < len; i++) {
              if (data[i].getElementsByTagName("Source")[0].firstChild.nodeValue === "DistributionList") {
                aResult.push({
                  "SourceReference": data[i].getElementsByTagName("SourceReference")[0].firstChild.nodeValue,
                  "DisplayName": data[i].getElementsByTagName("DisplayName")[0].firstChild.nodeValue,
                  "MailNickname": data[i].getElementsByTagName("MailNickname")[0].firstChild.nodeValue,
                  "Url": data[i].getElementsByTagName("Url")[0].firstChild.nodeValue
                });
              }
            } // cache the result


            found = false;
            _iteratorNormalCompletion2 = true;
            _didIteratorError2 = false;
            _iteratorError2 = undefined;
            _context.prev = 48;
            _iterator2 = (0, _getIterator2["default"])(global._SP_CACHE_DISTRIBUTIONLISTS);

          case 50:
            if (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done) {
              _context.next = 59;
              break;
            }

            _c = _step2.value;

            if (!(_c.user === username && _c.url === setup.url)) {
              _context.next = 56;
              break;
            }

            _c.data = aResult;
            found = true;
            return _context.abrupt("break", 59);

          case 56:
            _iteratorNormalCompletion2 = true;
            _context.next = 50;
            break;

          case 59:
            _context.next = 65;
            break;

          case 61:
            _context.prev = 61;
            _context.t1 = _context["catch"](48);
            _didIteratorError2 = true;
            _iteratorError2 = _context.t1;

          case 65:
            _context.prev = 65;
            _context.prev = 66;

            if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
              _iterator2["return"]();
            }

          case 68:
            _context.prev = 68;

            if (!_didIteratorError2) {
              _context.next = 71;
              break;
            }

            throw _iteratorError2;

          case 71:
            return _context.finish(68);

          case 72:
            return _context.finish(65);

          case 73:
            if (!found) global._SP_CACHE_DISTRIBUTIONLISTS.push({
              user: username,
              url: setup.url,
              data: aResult
            });
            return _context.abrupt("return", _promise["default"].resolve(aResult));

          case 77:
            _context.prev = 77;
            _context.t2 = _context["catch"](0);
            return _context.abrupt("return", _promise["default"].reject(_context.t2));

          case 80:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this, [[0, 77], [15, 26, 30, 38], [31,, 33, 37], [48, 61, 65, 73], [66,, 68, 72]]);
  }));
  return _distributionLists.apply(this, arguments);
}

module.exports = exports.default;