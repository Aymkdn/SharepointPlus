"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js-stable/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports["default"] = update;

var _regenerator = _interopRequireDefault(require("@babel/runtime-corejs3/regenerator"));

var _typeof2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/typeof"));

var _splice = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/splice"));

var _indexOf = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/index-of"));

var _filter = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/filter"));

var _slice = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/slice"));

var _forEach = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/for-each"));

var _isArray = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/array/is-array"));

var _promise = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/promise"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/asyncToGenerator"));

var _ajax = _interopRequireDefault(require("../utils/ajax.js"));

var _buildBodyForSOAP2 = _interopRequireDefault(require("./_buildBodyForSOAP.js"));

var _cloneObject = _interopRequireDefault(require("../utils/cloneObject.js"));

var _parseRecurrence = _interopRequireDefault(require("./parseRecurrence.js"));

var _newGuid = _interopRequireDefault(require("../utils/newGuid.js"));

var _cleanString2 = _interopRequireDefault(require("../utils/_cleanString.js"));

var _get = _interopRequireDefault(require("./get.js"));

var _add = _interopRequireDefault(require("./add.js"));

var _getContentTypeInfo = _interopRequireDefault(require("./getContentTypeInfo.js"));

/**
  @name $SP().list.update
  @function
  @description Update items from a Sharepoint List

  @param {Array} items List of items (e.g. [{ID: 1, Field_x0020_Name: "Value", OtherField: "new value"}, {ID:22, Field_x0020_Name: "Value2", OtherField: "new value2"}])
  @param {Object} [options] Options (see below)
    @param {String} [options.where=""] You can define a WHERE clause
    @param {Number} [options.packetsize=30] If you have too many items to update, then we use `packetsize` to cut them into several requests (because Sharepoint cannot handle too many items at once)
    @param {Function} [options.progress] Two parameters: 'current' and 'max' -- if you provide more than 'packetsize' ID then they will be treated by packets and you can use "progress" to know more about the steps
    @param {Boolean} [options.breakOnFailure=false] If you add more than `packetsize` items, then they will be updated by packet; by setting `breakOnFailure=true` it will cause the process to stop if at least one item from a packet has failed
    @param {Boolean} [options.escapeChar=true] Determines if we want to escape the special chars that will cause an error (for example '&' will be automatically converted to '&amp;amp;')
    @param {String|Date} [options.event] If you want to create an exception occurrence for a recurrent event you must define the "event" option using the date of the occurence to change (see the below example)
  @return {Promise} resolve({passed, failed}), reject(error)

  @example
  $SP().list("My List").update({ID:1, Title:"Ok"});
  // if you use the WHERE then you must not provide the item ID:
  $SP().list("List Name").update({Title:"Ok"},{where:"Status = 'Complete'"});

  $SP().list("My List","http://sharepoint.org/mydir/").update([{ID:5, Title:"Ok"}, {ID: 15, Title:"Good"}]);

  $SP().list("List Name").update({ID:43, Title:"Ok"}).then(function(items) {
    for (var i=0; i &lt; items.failed.length; i++) console.log("Error '"+items.failed[i].errorMessage+"' with:"+items.failed[i].Title);
    var len=items.passed.length;
    console.log(len+(len>1?" items have been successfully added":" item has been successfully added"))
  });

  // For recurrent calendar events, you can edit one of the occurrence using the `event` option; it will procure a new separate event
  // e.g. you have an event #1589 that occurs every weekday, from 9am to 10am, but you want to update the one on December 17, 2018 to be from 2pm to 3pm
  $SP().list("Calendar").update({
    Title:'Special Team Meeting', // if you want to change the event's title
    EventDate:$SP().toSPDate(new Date(2018,11,17,14,0,0), true), // the new start date for the meeting (2pm)
    EndDate:$SP().toSPDate(new Date(2018,11,17,15,0,0), true) // the new end date for the meeting (3pm)
  }, {
    where:'ID = 1589', // the criteria that permits to identify your master recurrent event -- IT IS REQUIRED
    event:new Date(2018,11,17) // date of the event that needs to be changed... if the event ID is "5274.0.2019-01-07T15:00:00Z", then you can use "2019-01-07T15:00:00Z"
  })

  // Note: if you update a complete serie for a recurrent event, then all the exception occurrences will be automatically deleted and replace with the full serie of events
*/
function update(_x, _x2) {
  return _update.apply(this, arguments);
}

function _update() {
  _update = (0, _asyncToGenerator2["default"])(
  /*#__PURE__*/
  _regenerator["default"].mark(function _callee(items, options) {
    var _this = this;

    var _context4, setup, itemsLength, nextPacket, cutted, itemKey, itemValue, it, _context, getFields, params, _data2, fields, _data, clone, aItems, _it, i, _context2, eventDate, event, updates, _i, data, result, len, passed, failed, _i2, raw;

    return _regenerator["default"].wrap(function _callee$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            _context5.prev = 0;

            if (this.listID) {
              _context5.next = 3;
              break;
            }

            return _context5.abrupt("return", _promise["default"].reject("[SharepointPlus 'update'] the list ID/name is required."));

          case 3:
            if (this.url) {
              _context5.next = 5;
              break;
            }

            return _context5.abrupt("return", _promise["default"].reject("[SharepointPlus 'update'] not able to find the URL!"));

          case 5:
            // we cannot determine the url
            // default values
            setup = {};
            (0, _cloneObject["default"])(true, setup, options);
            setup.where = setup.where || "";
            setup.escapeChar = setup.escapeChar === undefined ? true : setup.escapeChar;

            setup.progress = setup.progress || function () {};

            setup.packetsize = setup.packetsize || 30;
            if (!(0, _isArray["default"])(items)) items = [items];
            itemsLength = items.length; // if there is a WHERE clause

            if (!(itemsLength === 1 && setup.where)) {
              _context5.next = 57;
              break;
            }

            // call GET first
            delete items[0].ID;
            getFields = [];
            params = {
              fields: ["ID"],
              where: setup.where
            }; // for calendar events

            if (!setup.event) {
              _context5.next = 29;
              break;
            }

            params.calendar = true;
            params.calendarOptions = {
              referenceDate: setup.event
            }; // we also need all the columns for the event

            _context5.next = 22;
            return _get["default"].call(this, {
              fields: 'ContentType',
              where: setup.where
            });

          case 22:
            _data2 = _context5.sent;

            if (!(_data2.length === 0)) {
              _context5.next = 25;
              break;
            }

            return _context5.abrupt("return", _promise["default"].reject("[SharepointPlus 'update'] Unable to find an event with `" + setup.where + "`"));

          case 25:
            _context5.next = 27;
            return _getContentTypeInfo["default"].call(this, _data2[0].getAttribute('ContentType') || 'Event');

          case 27:
            fields = _context5.sent;
            (0, _forEach["default"])(fields).call(fields, function (field) {
              var fieldID = field.Name || field.StaticName;

              if (fieldID === "TimeZone" || field.Group !== '_Hidden' && field.ReadOnly !== 'TRUE' && field.Hidden !== 'TRUE' && typeof items[0][fieldID] === 'undefined') {
                params.fields.push(fieldID);
              }
            });

          case 29:
            getFields = (0, _slice["default"])(_context = params.fields).call(_context, 0);
            _context5.next = 32;
            return _get["default"].call(this, params);

          case 32:
            _data = _context5.sent;

            // we need a function to clone the items
            clone = function clone(obj) {
              var newObj = {};

              for (var k in obj) {
                newObj[k] = obj[k];
              }

              return newObj;
            };

            aItems = [];

            if (setup.event) {
              _context5.next = 42;
              break;
            }

            i = _data.length;

            while (i--) {
              _it = clone(items[0]);
              _it.ID = _data[i].getAttribute("ID");
              aItems.push(_it);
            }

            setup.where = undefined; // now call again the UPDATE

            return _context5.abrupt("return", update.call(this, aItems, setup));

          case 42:
            // the treatment is different for `event`
            eventDate = typeof setup.event !== 'string' ? this.toSPDate(setup.event) : (0, _slice["default"])(_context2 = setup.event).call(_context2, 0, 10);
            event = (0, _filter["default"])(_data).call(_data, function (d) {
              var _context3;

              return (0, _indexOf["default"])(_context3 = d.getAttribute("ID")).call(_context3, "." + eventDate + "T") !== -1;
            });

            if (!(event.length === 0)) {
              _context5.next = 46;
              break;
            }

            return _context5.abrupt("return", _promise["default"].reject("[SharepointPlus 'update'] No event found on " + eventDate));

          case 46:
            event = event[0]; // see https://fatalfrenchy.wordpress.com/2010/07/16/sharepoint-recurrence-data-schema/

            _it = clone(items[0]);
            (0, _forEach["default"])(getFields).call(getFields, function (field) {
              if (field !== 'ID' && typeof _it[field] === 'undefined') {
                var val = event.getAttribute(field);
                if (val !== undefined && val !== null) _it[field] = val;
              }
            });
            _it.MasterSeriesItemID = event.getAttribute("ID").split('.')[0];
            _it.UID = event.getAttribute("UID");
            _it.EventType = 4;
            _it.fRecurrence = 1;
            _it.RecurrenceData = "No Recurrence";
            _it.RecurrenceID = event.getAttribute("RecurrenceID"); // the occurrence event date

            _it.TimeZone = event.getAttribute("TimeZone");
            return _context5.abrupt("return", _add["default"].call(this, _it, setup));

          case 57:
            // define current and max for the progress
            setup.progressVar = setup.progressVar || {
              current: 0,
              max: itemsLength,
              passed: [],
              failed: [],
              eventID: "spUpdate" + (0, _slice["default"])(_context4 = "" + Math.random()).call(_context4, 2)
            }; // we cannot add more than 15 items in the same time, so split by 15 elements
            // and also to avoid surcharging the server

            if (!(itemsLength > setup.packetsize)) {
              _context5.next = 66;
              break;
            }

            nextPacket = (0, _slice["default"])(items).call(items, 0);
            cutted = (0, _splice["default"])(nextPacket).call(nextPacket, 0, setup.packetsize);

            global._SP_UPDATE_PROGRESSVAR[setup.progressVar.eventID] = function (setup) {
              return update.call(_this, nextPacket, setup);
            };

            items = cutted;
            itemsLength = items.length;
            _context5.next = 68;
            break;

          case 66:
            if (!(itemsLength == 0)) {
              _context5.next = 68;
              break;
            }

            return _context5.abrupt("return", _promise["default"].resolve({
              passed: [],
              failed: []
            }));

          case 68:
            // increment the progress
            setup.progressVar.current += itemsLength; // build a part of the request

            updates = '<Batch OnError="Continue" ListVersion="1"  ViewName="">';
            _i = 0;

          case 71:
            if (!(_i < itemsLength)) {
              _context5.next = 80;
              break;
            }

            updates += '<Method ID="' + (_i + 1) + '" Cmd="Update">';

            if (items[_i].ID) {
              _context5.next = 75;
              break;
            }

            return _context5.abrupt("return", _promise["default"].reject("[SharepointPlus 'update'] you have to provide the item ID called 'ID'"));

          case 75:
            for (it in items[_i]) {
              if (Object.prototype.hasOwnProperty.call(items[_i], it)) {
                itemKey = it;
                itemValue = items[_i][it];

                if ((0, _isArray["default"])(itemValue)) {
                  if (itemValue.length === 0) itemValue = '';else itemValue = ";#" + itemValue.join(";#") + ";#"; // an array should be seperate by ";#"
                } // if we have RecurrenceData, and if it's an object, then we convert it


                if (itemKey === 'RecurrenceData') {
                  if ((0, _typeof2["default"])(itemValue) === 'object') itemValue = (0, _parseRecurrence["default"])(itemValue); // add additional fields

                  if (!items[_i]['RecurrenceID']) {
                    if (typeof items[_i]['fRecurrence'] === 'undefined') updates += "<Field Name='fRecurrence'>1</Field>";
                    if (typeof items[_i]['EventType'] === 'undefined') updates += "<Field Name='EventType'>1</Field>";
                    if (typeof items[_i]['UID'] === 'undefined') updates += "<Field Name='UID'>{" + (0, _newGuid["default"])() + "}</Field>";
                    if (typeof items[_i]['fAllDayEvent'] === 'undefined') updates += "<Field Name='fAllDayEvent'>0</Field>";
                  }

                  updates += "<Field Name='" + itemKey + "'><![CDATA[" + itemValue + "]]></Field>";
                } else {
                  if (typeof itemValue === 'boolean') itemValue = itemValue ? '1' : '0';
                  if (setup.escapeChar && typeof itemValue === "string") itemValue = (0, _cleanString2["default"])(itemValue); // replace & (and not &amp;) by "&amp;" to avoid some issues

                  updates += "<Field Name='" + itemKey + "'>" + itemValue + "</Field>";
                }
              }
            }

            updates += '</Method>';

          case 77:
            _i++;
            _context5.next = 71;
            break;

          case 80:
            updates += '</Batch>'; // send the request

            _context5.next = 83;
            return _ajax["default"].call(this, {
              url: this.url + "/_vti_bin/lists.asmx",
              body: (0, _buildBodyForSOAP2["default"])("UpdateListItems", "<listName>" + this.listID + "</listName><updates>" + updates + "</updates>"),
              headers: {
                'SOAPAction': 'http://schemas.microsoft.com/sharepoint/soap/UpdateListItems'
              }
            });

          case 83:
            data = _context5.sent;
            result = data.getElementsByTagName('Result'), len = result.length, passed = setup.progressVar.passed, failed = setup.progressVar.failed;

            for (_i2 = 0; _i2 < len; _i2++) {
              if (result[_i2].getElementsByTagName('ErrorCode')[0].firstChild.nodeValue === "0x00000000" && items[_i2]) {
                // success
                raw = result[_i2].getElementsByTagName('z:row');
                if (raw.length === 0) raw = result[_i2].getElementsByTagName('row'); // for Chrome 'bug'

                items[_i2].raw = raw[0];
                passed.push(items[_i2]);
              } else if (items[_i2]) {
                items[_i2].errorMessage = result[_i2].getElementsByTagName('ErrorText')[0].firstChild.nodeValue;
                failed.push(items[_i2]);
              }
            }

            setup.progress(setup.progressVar.current, setup.progressVar.max); // check if we have some other packets that are waiting to be treated

            if (!(setup.progressVar.current < setup.progressVar.max)) {
              _context5.next = 95;
              break;
            }

            if (!global._SP_UPDATE_PROGRESSVAR[setup.progressVar.eventID]) {
              _context5.next = 93;
              break;
            }

            if (!(setup.breakOnFailure && failed.length > 0)) {
              _context5.next = 92;
              break;
            }

            // clean memory
            global._SP_UPDATE_PROGRESSVAR[setup.progressVar.eventID] = undefined; // and resolve by passing the items resolution

            return _context5.abrupt("return", _promise["default"].resolve({
              passed: passed,
              failed: failed
            }));

          case 92:
            return _context5.abrupt("return", global._SP_UPDATE_PROGRESSVAR[setup.progressVar.eventID](setup));

          case 93:
            _context5.next = 97;
            break;

          case 95:
            if (global._SP_UPDATE_PROGRESSVAR[setup.progressVar.eventID]) global._SP_UPDATE_PROGRESSVAR[setup.progressVar.eventID] = undefined;
            return _context5.abrupt("return", _promise["default"].resolve({
              passed: passed,
              failed: failed
            }));

          case 97:
            _context5.next = 102;
            break;

          case 99:
            _context5.prev = 99;
            _context5.t0 = _context5["catch"](0);
            return _context5.abrupt("return", _promise["default"].reject(_context5.t0));

          case 102:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee, this, [[0, 99]]);
  }));
  return _update.apply(this, arguments);
}

module.exports = exports.default;