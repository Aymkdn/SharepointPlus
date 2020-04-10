"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js-stable/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports["default"] = views;

var _regenerator = _interopRequireDefault(require("@babel/runtime-corejs3/regenerator"));

var _forEach = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/for-each"));

var _promise = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/promise"));

var _getIterator2 = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/get-iterator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/asyncToGenerator"));

var _ajax = _interopRequireDefault(require("../utils/ajax.js"));

var _buildBodyForSOAP2 = _interopRequireDefault(require("./_buildBodyForSOAP.js"));

/**
  @name $SP().list.views
  @function
  @description Get the views' info for a List

  @param {Hash} [options]
    @param {Boolean} [options.cache=true] Get the info from the cache
  @return {Promise} resolve({DefaultView, Name, ID, Type, Url}), reject(error)

  @example
  $SP().list("My List").views().then(function(view) {
    for (var i=0; i&lt;view.length; i++) {
      console.log("View #"+i+": "+view[i].Name);
    }
  });
*/
function views(_x) {
  return _views.apply(this, arguments);
}

function _views() {
  _views = (0, _asyncToGenerator2["default"])(
  /*#__PURE__*/
  _regenerator["default"].mark(function _callee(options) {
    var _this = this;

    var _context, found, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, c, data, aReturn, arr, i;

    return _regenerator["default"].wrap(function _callee$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.prev = 0;

            if (this.listID) {
              _context2.next = 3;
              break;
            }

            throw "[SharepointPlus 'views'] the list ID/Name is required.";

          case 3:
            options = options || {};
            options.cache = options.cache === false ? false : true; // default values

            if (this.url) {
              _context2.next = 7;
              break;
            }

            throw "[SharepointPlus 'views'] not able to find the URL!";

          case 7:
            // we cannot determine the url
            // check the cache
            found = false;

            if (!options.cache) {
              _context2.next = 36;
              break;
            }

            _iteratorNormalCompletion = true;
            _didIteratorError = false;
            _iteratorError = undefined;
            _context2.prev = 12;
            _iterator = (0, _getIterator2["default"])(global._SP_CACHE_SAVEDVIEWS);

          case 14:
            if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
              _context2.next = 22;
              break;
            }

            c = _step.value;

            if (!(c.url === this.url && c.listID === this.listID)) {
              _context2.next = 19;
              break;
            }

            found = true;
            return _context2.abrupt("return", _promise["default"].resolve(c.data));

          case 19:
            _iteratorNormalCompletion = true;
            _context2.next = 14;
            break;

          case 22:
            _context2.next = 28;
            break;

          case 24:
            _context2.prev = 24;
            _context2.t0 = _context2["catch"](12);
            _didIteratorError = true;
            _iteratorError = _context2.t0;

          case 28:
            _context2.prev = 28;
            _context2.prev = 29;

            if (!_iteratorNormalCompletion && _iterator["return"] != null) {
              _iterator["return"]();
            }

          case 31:
            _context2.prev = 31;

            if (!_didIteratorError) {
              _context2.next = 34;
              break;
            }

            throw _iteratorError;

          case 34:
            return _context2.finish(31);

          case 35:
            return _context2.finish(28);

          case 36:
            _context2.next = 38;
            return _ajax["default"].call(this, {
              url: this.url + "/_vti_bin/Views.asmx",
              body: (0, _buildBodyForSOAP2["default"])("GetViewCollection", '<listName>' + this.listID + '</listName>'),
              headers: {
                'SOAPAction': 'http://schemas.microsoft.com/sharepoint/soap/GetViewCollection'
              }
            });

          case 38:
            data = _context2.sent;
            aReturn = [], arr = data.getElementsByTagName('View'), i = 0;

            for (; i < arr.length; i++) {
              aReturn[i] = {
                ID: arr[i].getAttribute("Name"),
                Name: arr[i].getAttribute("DisplayName"),
                Url: arr[i].getAttribute("Url"),
                DefaultView: arr[i].getAttribute("DefaultView") == "TRUE",
                Type: arr[i].getAttribute("Type"),
                Node: arr[i]
              };
            } // cache


            (0, _forEach["default"])(_context = global._SP_CACHE_SAVEDVIEWS).call(_context, function (c) {
              if (c.url === _this.url && c.listID === _this.listID) {
                c.data = aReturn;
                found = true;
              }
            });
            if (!found) global._SP_CACHE_SAVEDVIEWS.push({
              url: this.url,
              listID: this.listID,
              data: aReturn
            });
            return _context2.abrupt("return", _promise["default"].resolve(aReturn));

          case 46:
            _context2.prev = 46;
            _context2.t1 = _context2["catch"](0);
            return _context2.abrupt("return", _promise["default"].reject(_context2.t1));

          case 49:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee, this, [[0, 46], [12, 24, 28, 36], [29,, 31, 35]]);
  }));
  return _views.apply(this, arguments);
}

module.exports = exports.default;