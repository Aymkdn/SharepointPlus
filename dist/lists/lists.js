"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js-stable/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports["default"] = lists;

var _regenerator = _interopRequireDefault(require("@babel/runtime-corejs3/regenerator"));

var _promise = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/promise"));

var _getIterator2 = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/get-iterator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/asyncToGenerator"));

var _getURL = _interopRequireDefault(require("../utils/getURL"));

var _ajax = _interopRequireDefault(require("../utils/ajax.js"));

var _buildBodyForSOAP2 = _interopRequireDefault(require("./_buildBodyForSOAP.js"));

/**
  @name $SP().lists
  @function
  @description Get all the lists from the site

  @param {Object} [setup] Options (see below)
    @param {String} [setup.url='current website'] The website url
    @param {Boolean} [setup.cache=true] To get the result from the cache when available
  @return {Promise} resolve({ID, Name, Description, Url, .....}), reject(error)

  @example
  $SP().lists().then(function(lists) {
    for (var i=0; i&lt;lists.length; i++) console.log("List #"+i+": "+lists[i].Name);
  });
*/
function lists(_x) {
  return _lists.apply(this, arguments);
}

function _lists() {
  _lists = (0, _asyncToGenerator2["default"])(
  /*#__PURE__*/
  _regenerator["default"].mark(function _callee(setup) {
    var _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, c, data, aReturn, arr, i, j, attributes, found, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, _c;

    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            // default values
            setup = setup || {}; // if we didn't define the url in the parameters, then we need to find it

            if (setup.url) {
              _context.next = 6;
              break;
            }

            _context.next = 5;
            return _getURL["default"].call(this);

          case 5:
            setup.url = _context.sent;

          case 6:
            setup.cache = setup.cache === false ? false : true; // check cache

            if (!setup.cache) {
              _context.next = 34;
              break;
            }

            _iteratorNormalCompletion = true;
            _didIteratorError = false;
            _iteratorError = undefined;
            _context.prev = 11;
            _iterator = (0, _getIterator2["default"])(global._SP_CACHE_SAVEDLISTS);

          case 13:
            if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
              _context.next = 20;
              break;
            }

            c = _step.value;

            if (!(c.url === setup.url)) {
              _context.next = 17;
              break;
            }

            return _context.abrupt("return", _promise["default"].resolve(c.data));

          case 17:
            _iteratorNormalCompletion = true;
            _context.next = 13;
            break;

          case 20:
            _context.next = 26;
            break;

          case 22:
            _context.prev = 22;
            _context.t0 = _context["catch"](11);
            _didIteratorError = true;
            _iteratorError = _context.t0;

          case 26:
            _context.prev = 26;
            _context.prev = 27;

            if (!_iteratorNormalCompletion && _iterator["return"] != null) {
              _iterator["return"]();
            }

          case 29:
            _context.prev = 29;

            if (!_didIteratorError) {
              _context.next = 32;
              break;
            }

            throw _iteratorError;

          case 32:
            return _context.finish(29);

          case 33:
            return _context.finish(26);

          case 34:
            _context.next = 36;
            return _ajax["default"].call(this, {
              url: setup.url + "/_vti_bin/lists.asmx",
              body: (0, _buildBodyForSOAP2["default"])("GetListCollection", ""),
              headers: {
                'SOAPAction': 'http://schemas.microsoft.com/sharepoint/soap/GetListCollection'
              }
            });

          case 36:
            data = _context.sent;
            aReturn = [], arr = data.getElementsByTagName('List');

            for (i = 0; i < arr.length; i++) {
              aReturn[i] = {};
              attributes = arr[i].attributes;

              for (j = attributes.length; j--;) {
                aReturn[i][attributes[j].nodeName] = attributes[j].nodeValue;
              }

              aReturn[i].Url = arr[i].getAttribute("DefaultViewUrl");
              aReturn[i].Name = arr[i].getAttribute("Title");
            } // cache


            found = false;

            if (!setup.cache) {
              _context.next = 68;
              break;
            }

            _iteratorNormalCompletion2 = true;
            _didIteratorError2 = false;
            _iteratorError2 = undefined;
            _context.prev = 44;
            _iterator2 = (0, _getIterator2["default"])(global._SP_CACHE_SAVEDLISTS);

          case 46:
            if (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done) {
              _context.next = 54;
              break;
            }

            _c = _step2.value;

            if (!(_c.url === setup.url)) {
              _context.next = 51;
              break;
            }

            found = true;
            return _context.abrupt("break", 54);

          case 51:
            _iteratorNormalCompletion2 = true;
            _context.next = 46;
            break;

          case 54:
            _context.next = 60;
            break;

          case 56:
            _context.prev = 56;
            _context.t1 = _context["catch"](44);
            _didIteratorError2 = true;
            _iteratorError2 = _context.t1;

          case 60:
            _context.prev = 60;
            _context.prev = 61;

            if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
              _iterator2["return"]();
            }

          case 63:
            _context.prev = 63;

            if (!_didIteratorError2) {
              _context.next = 66;
              break;
            }

            throw _iteratorError2;

          case 66:
            return _context.finish(63);

          case 67:
            return _context.finish(60);

          case 68:
            if (!found) global._SP_CACHE_SAVEDLISTS.push({
              url: setup.url,
              data: aReturn
            });
            return _context.abrupt("return", _promise["default"].resolve(aReturn));

          case 72:
            _context.prev = 72;
            _context.t2 = _context["catch"](0);
            return _context.abrupt("return", _promise["default"].reject(_context.t2));

          case 75:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this, [[0, 72], [11, 22, 26, 34], [27,, 29, 33], [44, 56, 60, 68], [61,, 63, 67]]);
  }));
  return _lists.apply(this, arguments);
}

module.exports = exports.default;