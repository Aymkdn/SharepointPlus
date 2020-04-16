"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js-stable/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.default = moderate;

var _keys = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/keys"));

var _regenerator = _interopRequireDefault(require("@babel/runtime-corejs3/regenerator"));

var _promise = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/promise"));

var _splice = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/splice"));

var _slice = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/slice"));

var _isArray = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/array/is-array"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/asyncToGenerator"));

var _ajax = _interopRequireDefault(require("../utils/ajax.js"));

var _buildBodyForSOAP2 = _interopRequireDefault(require("./_buildBodyForSOAP.js"));

var _myElem = _interopRequireDefault(require("./myElem.js"));

/**
  @name $SP().list.moderate
  @function
  @description Moderate items from a Sharepoint List

  @param {Array} approval List of items and ApprovalStatus (e.g. [{ID:1, ApprovalStatus:"Approved"}, {ID:22, ApprovalStatus:"Pending"}])
  @param {Object} [setup] Options (see below)
    @param {Number} [setup.packetsize=15] If you have too many items to moderate, then we use `packetsize` to cut them into several requests (because Sharepoint cannot handle too many items at once)
    @param {Function} [setup.progress] Two parameters: 'current' and 'max' -- if you provide more than `packetsize` ID then they will be treated by packets and you can use "progress" to know more about the steps
  @return {Promise} resolve({passed, failed}), reject(error)

  @example
  $SP().list("My List").moderate({ID:1, ApprovalStatus:"Rejected"}); // you must always provide the ID

  $SP().list("Other List").moderate([{ID:5, ApprovalStatus:"Pending"}, {ID: 15, ApprovalStatus:"Approved"}]).then(function(items) {
    for (var i=0; i &lt; items.failed.length; i++) console.log("Error with:"+items.failed[i].ID);
    for (var i=0; i &lt; items.passed.length; i++) console.log("Success with:"+items.passed[i].getAttribute("Title"));
  });
*/
function moderate(_x, _x2) {
  return _moderate.apply(this, arguments);
}

function _moderate() {
  _moderate = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee(items, setup) {
    var _this = this;

    var _context, itemsLength, nextPacket, cutted, itemKey, itemValue, it, updates, i, data, result, len, passed, failed, rows, _i, item;

    return _regenerator.default.wrap(function _callee$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.prev = 0;

            if (this.listID) {
              _context2.next = 3;
              break;
            }

            throw "[SharepointPlus 'moderate'] the list ID/Name is required.";

          case 3:
            // default values
            setup = setup || {};

            if (this.url) {
              _context2.next = 6;
              break;
            }

            throw "[SharepointPlus 'moderate'] not able to find the URL!";

          case 6:
            // we cannot determine the url
            setup.progress = setup.progress || function () {};

            if (!(0, _isArray.default)(items)) items = [items];
            itemsLength = items.length; // define current and max for the progress

            setup.progressVar = setup.progressVar || {
              current: 0,
              max: itemsLength,
              passed: [],
              failed: [],
              eventID: "spModerate" + (0, _slice.default)(_context = "" + Math.random()).call(_context, 2)
            }; // we cannot add more than 15 items in the same time, so split by 15 elements
            // and also to avoid surcharging the server

            if (!(itemsLength > 15)) {
              _context2.next = 17;
              break;
            }

            nextPacket = (0, _slice.default)(items).call(items, 0);
            cutted = (0, _splice.default)(nextPacket).call(nextPacket, 0, 15);

            global._SP_MODERATE_PROGRESSVAR[setup.progressVar.eventID] = function (setup) {
              return moderate.call(_this, nextPacket, setup);
            };

            return _context2.abrupt("return", moderate.call(this, cutted, setup));

          case 17:
            if (!(itemsLength === 0)) {
              _context2.next = 19;
              break;
            }

            return _context2.abrupt("return", _promise.default.resolve({
              passed: [],
              failed: []
            }));

          case 19:
            // increment the progress
            setup.progressVar.current += itemsLength; // build a part of the request

            updates = '<Batch OnError="Continue" ListVersion="1"  ViewName="">';
            i = 0;

          case 22:
            if (!(i < itemsLength)) {
              _context2.next = 60;
              break;
            }

            updates += '<Method ID="' + (i + 1) + '" Cmd="Moderate">';

            if (items[i].ID) {
              _context2.next = 28;
              break;
            }

            throw "[SharepointPlus 'moderate'] you have to provide the item ID called 'ID'";

          case 28:
            if (!(typeof items[i].ApprovalStatus === "undefined")) {
              _context2.next = 30;
              break;
            }

            throw "[SharepointPlus 'moderate'] you have to provide the approval status 'ApprovalStatus' (Approved, Rejected, Pending, Draft or Scheduled)";

          case 30:
            _context2.t0 = (0, _keys.default)(_regenerator.default).call(_regenerator.default, items[i]);

          case 31:
            if ((_context2.t1 = _context2.t0()).done) {
              _context2.next = 56;
              break;
            }

            it = _context2.t1.value;

            if (!Object.prototype.hasOwnProperty.call(items[i], it)) {
              _context2.next = 53;
              break;
            }

            itemKey = it;
            itemValue = items[i][it];

            if (!(itemKey == "ApprovalStatus")) {
              _context2.next = 53;
              break;
            }

            itemKey = "_ModerationStatus";
            _context2.t2 = itemValue.toLowerCase();
            _context2.next = _context2.t2 === "approve" ? 41 : _context2.t2 === "approved" ? 41 : _context2.t2 === "reject" ? 43 : _context2.t2 === "deny" ? 43 : _context2.t2 === "denied" ? 43 : _context2.t2 === "rejected" ? 43 : _context2.t2 === "pending" ? 45 : _context2.t2 === "draft" ? 47 : _context2.t2 === "scheduled" ? 49 : 51;
            break;

          case 41:
            itemValue = 0;
            return _context2.abrupt("break", 53);

          case 43:
            itemValue = 1;
            return _context2.abrupt("break", 53);

          case 45:
            itemValue = 2;
            return _context2.abrupt("break", 53);

          case 47:
            itemValue = 3;
            return _context2.abrupt("break", 53);

          case 49:
            itemValue = 4;
            return _context2.abrupt("break", 53);

          case 51:
            itemValue = 2;
            return _context2.abrupt("break", 53);

          case 53:
            updates += "<Field Name='" + itemKey + "'>" + itemValue + "</Field>";
            _context2.next = 31;
            break;

          case 56:
            updates += '</Method>';

          case 57:
            i++;
            _context2.next = 22;
            break;

          case 60:
            updates += '</Batch>'; // send the request

            _context2.next = 63;
            return _ajax.default.call(this, {
              url: this.url + "/_vti_bin/lists.asmx",
              body: (0, _buildBodyForSOAP2.default)("UpdateListItems", "<listName>" + this.listID + "</listName><updates>" + updates + "</updates>"),
              headers: {
                'SOAPAction': 'http://schemas.microsoft.com/sharepoint/soap/UpdateListItems'
              }
            });

          case 63:
            data = _context2.sent;
            result = data.getElementsByTagName('Result'), len = result.length, passed = setup.progressVar.passed, failed = setup.progressVar.failed;

            for (_i = 0; _i < len; _i++) {
              rows = result[_i].getElementsByTagName('z:row');
              if (rows.length == 0) rows = data.getElementsByTagName('row'); // for Chrome

              item = new _myElem.default(rows[0]);
              if (result[_i].getElementsByTagName('ErrorCode')[0].firstChild.nodeValue == "0x00000000") // success
                passed.push(item);else {
                items[_i].errorMessage = result[_i].getElementsByTagName('ErrorText')[0].firstChild.nodeValue;
                failed.push(items[_i]);
              }
            }

            setup.progress(setup.progressVar.current, setup.progressVar.max); // check if we have some other packets that are waiting to be treated

            if (!(setup.progressVar.current < setup.progressVar.max)) {
              _context2.next = 72;
              break;
            }

            if (!global._SP_MODERATE_PROGRESSVAR[setup.progressVar.eventID]) {
              _context2.next = 70;
              break;
            }

            return _context2.abrupt("return", global._SP_MODERATE_PROGRESSVAR[setup.progressVar.eventID](setup));

          case 70:
            _context2.next = 74;
            break;

          case 72:
            if (global._SP_MODERATE_PROGRESSVAR[setup.progressVar.eventID]) delete global._SP_MODERATE_PROGRESSVAR[setup.progressVar.eventID];
            return _context2.abrupt("return", _promise.default.resolve({
              passed: passed,
              failed: failed
            }));

          case 74:
            _context2.next = 79;
            break;

          case 76:
            _context2.prev = 76;
            _context2.t3 = _context2["catch"](0);
            return _context2.abrupt("return", _promise.default.reject(_context2.t3));

          case 79:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee, this, [[0, 76]]);
  }));
  return _moderate.apply(this, arguments);
}

module.exports = exports.default;