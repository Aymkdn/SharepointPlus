"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js-stable/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.default = remove;

var _regenerator = _interopRequireDefault(require("@babel/runtime-corejs3/regenerator"));

var _splice = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/splice"));

var _promise = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/promise"));

var _startsWith = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/starts-with"));

var _indexOf = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/index-of"));

var _filter = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/filter"));

var _slice = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/slice"));

var _isArray = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/array/is-array"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/asyncToGenerator"));

var _ajax = _interopRequireDefault(require("../utils/ajax.js"));

var _buildBodyForSOAP2 = _interopRequireDefault(require("./_buildBodyForSOAP.js"));

var _cloneObject = _interopRequireDefault(require("../utils/cloneObject.js"));

var _get = _interopRequireDefault(require("./get.js"));

var _add = _interopRequireDefault(require("./add.js"));

/**
  @name $SP().list.remove
  @function
  @description Delete items from a Sharepoint List

  @param {Objet|Array} [itemsID] List of items ID (e.g. [{ID:1}, {ID:22}]) | ATTENTION if you want to delete a file you have to add the "FileRef" e.g. {ID:2,FileRef:"path/to/the/file.ext"}
  @param {Object} [options] Options (see below)
    @param {String} [options.where] If you don't specify the itemsID (first param) then you have to use a `where` clause - it will search for the list of items ID based on the `where` and it will then delete all of them
    @param {Number} [options.packetsize=30] If you have too many items to delete, then we use `packetsize` to cut them into several requests (because Sharepoint cannot handle too many items at once)
    @param {Function} [options.progress] Two parameters: 'current' and 'max' -- If you provide more than 'packetsize' ID then they will be treated by packets and you can use "progress" to know more about the steps
    @param {Boolean} [options.breakOnFailure=false] If you add more than `packetsize` items, then they will be removed by packet; by setting `breakOnFailure=true` it will cause the process to stop if at least one item from a packet has failed
    @param {String|Date} [options.event] If you want to delete an occurrence of a recurrent event from a calendar (see the below example)
  @return {Promise} resolve({passed, failed}), reject(error)

  @example
  $SP().list("My List").remove({ID:1});
  // we can use the WHERE clause instead providing the ID
  $SP().list("My List").remove({where:"Title = 'OK'",progress:function(current,max) {
    console.log(current+"/"+max);
  }});

  // delete several items
  $SP().list("List Name", "http://my.sharepoint.com/sub/dir/").remove([{ID:5}, {ID:7}]);

  $SP().list("List").remove({ID:43, Title:"My title"}).then(function(items) {
    for (var i=0; i &lt; items.failed.length; i++) console.log("Error with:"+items.failed[i].ID+" ("+items.failed[i].errorMessage+")"); // only .ID and .errorMessage are available
  });

  // example for deleting a file/folder
  $SP().list("My Shared Documents").remove({ID:4,FileRef:"site/subsite/My Shared Documents/something.xls"});
  // or use {where} (that only works with files, but not folders)
  $SP().list("My Shared Documents").remove({where:"ID = 4"});

  // if you want to delete one occurrence of a recurrent event you must use option "event"
  // e.g. you have an event #1589 that occurs every weekday, from 9am to 10am, but you want to delete the one on December 17, 2018
  $SP().list("Calendar").remove({
    where:'ID = 1589', // the criteria that permits to identify your master recurrent event -- IT IS REQUIRED
    event:new Date(2018,11,17) // date of the event that needs to be deleted, it can be the "RecurrenceID"
  })
*/
function remove(_x, _x2) {
  return _remove.apply(this, arguments);
}

function _remove() {
  _remove = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee(items, options) {
    var _this = this;

    var _context4, setup, itemsLength, nextPacket, cutted, getParams, _data, clone, aItems, fileRef, it, _i, _context, eventDate, event, updates, _i2, data, result, len, passed, failed, i;

    return _regenerator.default.wrap(function _callee$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            _context5.prev = 0;

            if (this.url) {
              _context5.next = 3;
              break;
            }

            throw "[SharepointPlus 'remove'] not able to find the URL!";

          case 3:
            // we cannot determine the url
            // default values
            if (!options && items.where) {
              options = items;
              items = [];
            } // the case when we use the "where"


            setup = {};
            (0, _cloneObject.default)(true, setup, options);

            setup.progress = setup.progress || function () {};

            setup.packetsize = setup.packetsize || 30;
            if (!(0, _isArray.default)(items)) items = [items];
            itemsLength = items.length; // if there is a WHERE clause

            if (!setup.where) {
              _context5.next = 44;
              break;
            }

            // call GET first
            if (itemsLength === 1) delete items[0].ID;
            getParams = {
              fields: ["ID", "FileRef"],
              where: setup.where
            }; // if we want to delete an event

            if (setup.event) {
              getParams.fields.push("Title");
              getParams.calendar = true;
              getParams.calendarOptions = {
                referenceDate: setup.event
              };
            }

            _context5.next = 16;
            return _get.default.call(this, getParams);

          case 16:
            _data = _context5.sent;

            // we need a function to clone the items
            clone = function clone(obj) {
              var newObj = {};

              for (var k in obj) {
                newObj[k] = obj[k];
              }

              return newObj;
            };

            aItems = [], it = {};

            if (setup.event) {
              _context5.next = 26;
              break;
            }

            _i = _data.length;

            while (_i--) {
              it = clone(items[0]);
              it.ID = _data[_i].getAttribute("ID");
              fileRef = _data[_i].getAttribute("FileRef");
              if (fileRef) it.FileRef = this.cleanResult(fileRef);
              aItems.push(it);
            }

            setup.where = undefined; // now call again the REMOVE

            return _context5.abrupt("return", remove.call(this, aItems, setup));

          case 26:
            // the treatment is different for `event`
            eventDate = typeof setup.event !== 'string' ? this.toSPDate(setup.event) : (0, _slice.default)(_context = setup.event).call(_context, 0, 10);
            event = (0, _filter.default)(_data).call(_data, function (d) {
              var _context2, _context3;

              return (0, _indexOf.default)(_context2 = d.getAttribute("ID")).call(_context2, "." + eventDate + "T") !== -1 || (0, _startsWith.default)(_context3 = d.getAttribute("RecurrenceID") || "").call(_context3, eventDate);
            });

            if (!(event.length === 0)) {
              _context5.next = 30;
              break;
            }

            return _context5.abrupt("return", _promise.default.reject("[SharepointPlus 'remove'] No event found on " + eventDate));

          case 30:
            event = event[0]; // see https://fatalfrenchy.wordpress.com/2010/07/16/sharepoint-recurrence-data-schema/

            it.MasterSeriesItemID = event.getAttribute("ID").split('.')[0];
            it.UID = event.getAttribute("UID");
            it.EventType = 3;
            it.fRecurrence = 1;
            it.fAllDayEvent = event.getAttribute("fAllDayEvent") || "0";
            it.RecurrenceData = "No Recurrence";
            it.RecurrenceID = event.getAttribute("RecurrenceID"); // the occurrence event date

            it.Title = "Deleted: " + event.getAttribute("Title") || "";
            it.EventDate = event.getAttribute("EventDate");
            it.EndDate = event.getAttribute("EndDate");
            return _context5.abrupt("return", _add.default.call(this, it, setup));

          case 42:
            _context5.next = 46;
            break;

          case 44:
            if (!(itemsLength === 0)) {
              _context5.next = 46;
              break;
            }

            return _context5.abrupt("return", _promise.default.resolve({
              passed: [],
              failed: []
            }));

          case 46:
            // define current and max for the progress
            setup.progressVar = setup.progressVar || {
              current: 0,
              max: itemsLength,
              passed: [],
              failed: [],
              eventID: "spRemove" + (0, _slice.default)(_context4 = "" + Math.random()).call(_context4, 2)
            }; // we cannot add more than setup.packetsize items in the same time, so split by setup.packetsize elements
            // and also to avoid surcharging the server

            if (itemsLength > setup.packetsize) {
              nextPacket = (0, _slice.default)(items).call(items, 0);
              cutted = (0, _splice.default)(nextPacket).call(nextPacket, 0, setup.packetsize);

              global._SP_REMOVE_PROGRESSVAR[setup.progressVar.eventID] = function (setup) {
                return remove.call(_this, nextPacket, setup);
              };

              items = cutted;
              itemsLength = items.length;
            } // increment the progress


            setup.progressVar.current += itemsLength; // build a part of the request

            updates = '<Batch OnError="Continue" ListVersion="1"  ViewName="">';
            _i2 = 0;

          case 51:
            if (!(_i2 < items.length)) {
              _context5.next = 61;
              break;
            }

            updates += '<Method ID="' + (_i2 + 1) + '" Cmd="Delete">';

            if (!(items[_i2].ID == undefined)) {
              _context5.next = 55;
              break;
            }

            throw "Error 'delete': you have to provide the item ID called 'ID'";

          case 55:
            updates += "<Field Name='ID'>" + items[_i2].ID + "</Field>";
            if (items[_i2].FileRef != undefined) updates += "<Field Name='FileRef'>" + items[_i2].FileRef + "</Field>";
            updates += '</Method>';

          case 58:
            _i2++;
            _context5.next = 51;
            break;

          case 61:
            updates += '</Batch>'; // send the request

            _context5.next = 64;
            return _ajax.default.call(this, {
              url: this.url + "/_vti_bin/lists.asmx",
              body: (0, _buildBodyForSOAP2.default)("UpdateListItems", "<listName>" + this.listID + "</listName><updates>" + updates + "</updates>"),
              headers: {
                'SOAPAction': 'http://schemas.microsoft.com/sharepoint/soap/UpdateListItems'
              }
            });

          case 64:
            data = _context5.sent;
            result = data.getElementsByTagName('Result'), len = result.length, passed = setup.progressVar.passed, failed = setup.progressVar.failed;

            for (i = 0; i < len; i++) {
              if (result[i].getElementsByTagName('ErrorCode')[0].firstChild.nodeValue === "0x00000000") // success
                passed.push(items[i]);else {
                items[i].errorMessage = result[i].getElementsByTagName('ErrorText')[0].firstChild.nodeValue;
                failed.push(items[i]);
              }
            }

            setup.progress(setup.progressVar.current, setup.progressVar.max); // check if we have some other packets that are waiting to be treated

            if (!(setup.progressVar.current < setup.progressVar.max)) {
              _context5.next = 76;
              break;
            }

            if (!global._SP_REMOVE_PROGRESSVAR[setup.progressVar.eventID]) {
              _context5.next = 74;
              break;
            }

            if (!(setup.breakOnFailure && failed.length > 0)) {
              _context5.next = 73;
              break;
            }

            // clean memory
            global._SP_REMOVE_PROGRESSVAR[setup.progressVar.eventID] = undefined; // and resolve by passing the items resolution

            return _context5.abrupt("return", _promise.default.resolve({
              passed: passed,
              failed: failed
            }));

          case 73:
            return _context5.abrupt("return", global._SP_REMOVE_PROGRESSVAR[setup.progressVar.eventID](setup));

          case 74:
            _context5.next = 78;
            break;

          case 76:
            if (global._SP_REMOVE_PROGRESSVAR[setup.progressVar.eventID]) global._SP_REMOVE_PROGRESSVAR[setup.progressVar.eventID] = undefined;
            return _context5.abrupt("return", _promise.default.resolve({
              passed: passed,
              failed: failed
            }));

          case 78:
            _context5.next = 83;
            break;

          case 80:
            _context5.prev = 80;
            _context5.t0 = _context5["catch"](0);
            return _context5.abrupt("return", _promise.default.reject(_context5.t0));

          case 83:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee, this, [[0, 80]]);
  }));
  return _remove.apply(this, arguments);
}

module.exports = exports.default;