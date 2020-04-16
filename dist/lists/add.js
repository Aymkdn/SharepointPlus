"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js-stable/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.default = add;

var _keys = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/keys"));

var _regenerator = _interopRequireDefault(require("@babel/runtime-corejs3/regenerator"));

var _typeof2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/typeof"));

var _promise = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/promise"));

var _splice = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/splice"));

var _slice = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/slice"));

var _isArray = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/array/is-array"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/asyncToGenerator"));

var _ajax = _interopRequireDefault(require("../utils/ajax.js"));

var _buildBodyForSOAP2 = _interopRequireDefault(require("./_buildBodyForSOAP.js"));

var _cloneObject = _interopRequireDefault(require("../utils/cloneObject.js"));

var _parseRecurrence = _interopRequireDefault(require("./parseRecurrence.js"));

var _newGuid = _interopRequireDefault(require("../utils/newGuid.js"));

var _cleanString2 = _interopRequireDefault(require("../utils/_cleanString.js"));

var _getTimeZoneInfo = _interopRequireDefault(require("../utils/getTimeZoneInfo.js"));

/**
  @name $SP().list.add
  @function
  @description Add items into a Sharepoint List
               note: A Date must be provided as "YYYY-MM-DD" (only date comparison) or "YYYY-MM-DD hh:mm:ss" (date AND time comparison), or you can use $SP().toSPDate(new Date())
               note: A person must be provided as "-1;#email" (e.g. "-1;#foo@bar.com") OR NT login with double \ (eg "-1;#europe\\foo_bar") OR the user ID as a number
               note SP2013: If "-1;#" doesn't work on Sharepoint 2013, then try with "i:0#.w|" (e.g. "i:0#.w|europe\\foo_bar") ("i:0#.w|" may vary based on your authentification system -- see https://social.technet.microsoft.com/wiki/contents/articles/13921.sharepoint-20102013-claims-encoding.aspx)
               note: A lookup value must be provided as "X;#value", with X the ID of the value from the lookup list.
                     --> it should also be possible to not pass the value but only the ID, e.g.: "X;#" or the ID as a number without anything else
               note: A URL field must be provided as "http://www.website.com, Name"
               note: A multiple selection of People/Users must be provided as "userID1;#email1;#userID2;#email2;#userID3;#email3", with "userID" that could be "-1" if you don't know it, and "email" that could also be an NT Login; if you know the correct userID then nothing else is required (e.g. "158;#;#27655;#" will add the users with ID 158 and 27655)
               note: A multiple selection must be provided as ";#choice 1;#choice 2;#", or just pass an array as the value and it will do the trick
               note: A multiple selection of Lookup must be provided as ";#X;#Choice 1;#Y;#Choice 2;#" (with X the ID for "Choice 1", and "Y" for "Choice 2")
                     --> it should also be possible to not pass the values but only the ID, e.g.: ";#X;#;#Y;#;#"
               note: A Yes/No checkbox must be provided as "1" (for TRUE) or "0" (for "False")
               note: A Term / Taxonomy / Managed Metadata field must be provided as "0;#|UniqueIdentifier" for the special hidden related column (see https://github.com/Aymkdn/SharepointPlus/wiki/ to know more)
               note: You cannot change the Approval Status when adding, you need to use the $SP().moderate function

  @param {Object|Array} items List of items (e.g. [{Field_x0020_Name: "Value", OtherField: "new value"}, {Field_x0020_Name: "Value2", OtherField: "new value2"}])
  @param {Object} [options] Options (see below)
    @param {Number} [options.packetsize=30] If you have too many items to add, then we use `packetsize` to cut them into several requests (because Sharepoint cannot handle too many items at once)
    @param {Function} [options.progress] (current,max) If you provide more than 'packetsize' items then they will be treated by packets and you can use "progress" to know more about the steps
    @param {Boolean} [options.breakOnFailure=false] If you add more than `packetsize` items, then they will be added by packet; by setting `breakOnFailure=true` it will cause the process to stop if at least one item from a packet has failed
    @param {Boolean} [options.escapeChar=true] Determines if we want to escape the special chars that will cause an error (for example '&' will be automatically converted to '&amp;amp;')
    @param {String} [options.rootFolder=''] When dealing with Discussion Board you need to provide the rootFolder of the Message when you post a reply
  @return {Promise} resolve({passed, failed}), reject(error)

  @example
  $SP().list("My List").add({Title:"Ok"});

  $SP().list("List Name").add([{Title:"Ok"}, {Title:"Good"}]).then(function(items) { alert("Done!"); });

  $SP().list("My List","http://my.sharepoi.nt/dir/").add({Title:"Ok"}).then(function(items) {
    if (items.failed.length > 0) {
      for (let i=0; i &lt; items.failed.length; i++) console.log("Error '"+items.failed[i].errorMessage+"' with:"+items.failed[i].Title); // the 'errorMessage' attribute is added to the object
    }
    if (items.passed.length > 0) {
      for (let i=0; i &lt; items.passed.length; i++) console.log("Success for:"+items.passed[i].Title+" (ID:"+items.passed[i].ID+")");
    }
  });

  // different ways to add John and Tom into the table
  $SP().list("List Name").add({Title:"John is the Tom's Manager",Manager:"-1;#john@compagny.com",Report:"-1;#tom@compagny.com"}); // if you don't know the ID
  $SP().list("My List").add({Title:"John is the Tom's Manager",Manager:"157",Report:"874"}); // if you know the Lookup ID

  // Calendar events:
  //   - you must define "EventDate" and "EndDate"
  //   - for a full day event you have to define "fAllDayEvent" to "1"
  //   - for recurrent events you have to define "RecurrenceData" and you can either provide an already formatted XML string or the recurrence object that will then be converted with $SP().parseRecurrence()
  // EXAMPLE: event occurs every week on monday and friday, until December 31, 2019, between 10am and 11am, starting from December 20, 2018
  // EventDate is the StartTime and must be the same as EndDate (except for the Time)
  $SP().list("My Calendar").add({
    Title:"Team Meeting",
    EventDate:"2018-12-20 10:00:00", // the Date part is when the recurrent event starts, and the Time part will be used for each event
    EndDate:"2019-12-31 11:00:00", // it must be the last Date/Time for the meeting, then the Time is used as an end time for each event
    RecurrenceData: {
      "type":"weekly",
      "frequency":1,
      "on":{
        "monday":true,
        "friday":true
      },
      "endDate":new Date(2019,11,31,11,0,0) // December 31, 2019, at 11am
    }
  })

  // for Discussion Board, please refer to https://github.com/Aymkdn/SharepointPlus/wiki/Sharepoint-Discussion-Board
*/
function add(_x, _x2) {
  return _add.apply(this, arguments);
}

function _add() {
  _add = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee(items, options) {
    var _this = this;

    var _context, setup, itemsLength, nextPacket, cutted, itemKey, itemValue, it, i, updates, info, data, result, len, passed, failed, rows;

    return _regenerator.default.wrap(function _callee$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.prev = 0;

            if (this.listID) {
              _context2.next = 3;
              break;
            }

            throw "[SharepointPlus 'add'] the list ID/Name is required.";

          case 3:
            if (this.url) {
              _context2.next = 5;
              break;
            }

            throw "[SharepointPlus 'add'] not able to find the URL!";

          case 5:
            // we cannot determine the url
            // default values
            setup = {};
            (0, _cloneObject.default)(true, setup, options);
            setup.escapeChar = setup.escapeChar == undefined ? true : setup.escapeChar;

            setup.progress = setup.progress || function () {};

            setup.packetsize = setup.packetsize || 30;
            setup.rootFolder = setup.rootFolder || "";
            if (!(0, _isArray.default)(items)) items = [items];
            itemsLength = items.length; // define current and max for the progress

            setup.progressVar = setup.progressVar || {
              current: 0,
              max: itemsLength,
              passed: [],
              failed: [],
              eventID: "spAdd" + (0, _slice.default)(_context = "" + Math.random()).call(_context, 2)
            }; // we cannot add more than 15 items in the same time, so split by 15 elements
            // and also to avoid surcharging the server

            if (!(itemsLength > setup.packetsize)) {
              _context2.next = 22;
              break;
            }

            nextPacket = (0, _slice.default)(items).call(items, 0);
            cutted = (0, _splice.default)(nextPacket).call(nextPacket, 0, setup.packetsize);

            global._SP_ADD_PROGRESSVAR[setup.progressVar.eventID] = function (setup) {
              return add.call(_this, nextPacket, setup);
            };

            items = cutted;
            itemsLength = items.length;
            _context2.next = 25;
            break;

          case 22:
            if (!(itemsLength === 0)) {
              _context2.next = 25;
              break;
            }

            setup.progress(1, 1);
            return _context2.abrupt("return", _promise.default.resolve({
              passed: [],
              failed: []
            }));

          case 25:
            // increment the progress
            setup.progressVar.current += itemsLength; // build a part of the request

            updates = '<Batch OnError="Continue" ListVersion="1"  ViewName=""' + (setup.rootFolder ? ' RootFolder="' + setup.rootFolder + '"' : '') + '>';
            i = 0;

          case 28:
            if (!(i < items.length)) {
              _context2.next = 67;
              break;
            }

            updates += '<Method ID="' + (i + 1) + '" Cmd="New">';
            updates += '<Field Name=\'ID\'>New</Field>';
            _context2.t0 = (0, _keys.default)(_regenerator.default).call(_regenerator.default, items[i]);

          case 32:
            if ((_context2.t1 = _context2.t0()).done) {
              _context2.next = 63;
              break;
            }

            it = _context2.t1.value;

            if (!Object.prototype.hasOwnProperty.call(items[i], it)) {
              _context2.next = 61;
              break;
            }

            itemKey = it;
            itemValue = items[i][it];

            if ((0, _isArray.default)(itemValue)) {
              if (itemValue.length === 0) itemValue = '';else itemValue = ";#" + itemValue.join(";#") + ";#"; // an array should be seperate by ";#"
            }

            _context2.t2 = itemKey;
            _context2.next = _context2.t2 === "RecurrenceData" ? 41 : 58;
            break;

          case 41:
            // if we have RecurrenceData, and if it's an object, then we convert it
            if ((0, _typeof2.default)(itemValue) === 'object') itemValue = (0, _parseRecurrence.default)(itemValue); // add additional fields
            // see https://fatalfrenchy.wordpress.com/2010/07/16/sharepoint-recurrence-data-schema/
            // and https://stackoverflow.com/a/44487221/1134119

            if (typeof items[i]['fRecurrence'] === 'undefined') updates += "<Field Name='fRecurrence'>1</Field>";
            if (typeof items[i]['EventType'] === 'undefined') updates += "<Field Name='EventType'>1</Field>";
            if (typeof items[i]['UID'] === 'undefined') updates += "<Field Name='UID'>{" + (0, _newGuid.default)() + "}</Field>";
            if (typeof items[i]['fAllDayEvent'] === 'undefined') updates += "<Field Name='fAllDayEvent'>0</Field>";

            if (!(typeof items[i]['TimeZone'] === 'undefined')) {
              _context2.next = 56;
              break;
            }

            if (!global._SP_CACHE_TIMEZONEINFO[this.url]) {
              _context2.next = 51;
              break;
            }

            updates += "<Field Name='TimeZone'>" + global._SP_CACHE_TIMEZONEINFO[this.url].ID + "</Field>";
            _context2.next = 56;
            break;

          case 51:
            _context2.next = 53;
            return _getTimeZoneInfo.default.call(this, {
              url: this.url
            });

          case 53:
            info = _context2.sent;
            global._SP_CACHE_TIMEZONEINFO[this.url] = info;
            return _context2.abrupt("return", add.call(this, items, options));

          case 56:
            //if (typeof items[i]['XMLTZone'] === 'undefined') updates += "<Field Name='XMLTZone'><![CDATA[<timeZoneRule><standardBias></standardBias><additionalDaylightBias>0</additionalDaylightBias></timeZoneRule>]]></Field>";
            //if (typeof items[i]['WorkspaceLink'] === 'undefined') updates += "<Field Name='WorkspaceLink'>0</Field>";
            // we also define the duration

            /*if (!items[i]['Duration']) {
              let startTime = items[i]['EventDate'].match(/[ T]([0-9]+):([0-9]+):[0-9]+/);
              let endTime = items[i]['EndDate'].match(/[ T]([0-9]+):([0-9]+):[0-9]+/);
              if (startTime && endTime && startTime.length===3 && endTime.length===3) {
                let duration = (new Date(1981,0,19,endTime[1],endTime[2]) - new Date(1981,0,19,startTime[1],startTime[2])) / 1000;
                if (duration>0) updates += "<Field Name='Duration'>"+duration+"</Field>";
              }
            }*/
            updates += "<Field Name='" + itemKey + "'><![CDATA[" + itemValue + "]]></Field>";
            return _context2.abrupt("break", 61);

          case 58:
            if (typeof itemValue === 'boolean') itemValue = itemValue ? '1' : '0';
            if (setup.escapeChar && typeof itemValue === "string") itemValue = (0, _cleanString2.default)(itemValue); // replace & (and not &amp;) by "&amp;" to avoid some issues

            updates += "<Field Name='" + itemKey + "'>" + itemValue + "</Field>";

          case 61:
            _context2.next = 32;
            break;

          case 63:
            updates += '</Method>';

          case 64:
            i++;
            _context2.next = 28;
            break;

          case 67:
            updates += '</Batch>'; // send the request

            _context2.next = 70;
            return _ajax.default.call(this, {
              url: this.url + "/_vti_bin/lists.asmx",
              body: (0, _buildBodyForSOAP2.default)("UpdateListItems", "<listName>" + this.listID + "</listName><updates>" + updates + "</updates>"),
              headers: {
                'SOAPAction': 'http://schemas.microsoft.com/sharepoint/soap/UpdateListItems'
              }
            });

          case 70:
            data = _context2.sent;
            result = data.getElementsByTagName('Result'), len = result.length, passed = setup.progressVar.passed, failed = setup.progressVar.failed;

            for (i = 0; i < len; i++) {
              if (result[i].getElementsByTagName('ErrorCode')[0].firstChild.nodeValue === "0x00000000") {
                // success
                rows = result[i].getElementsByTagName('z:row');
                if (rows.length == 0) rows = result[i].getElementsByTagName('row'); // for Chrome 'bug'

                if (items[i]) {
                  items[i].ID = rows[0].getAttribute("ows_ID");
                  items[i].raw = rows[0];
                  passed.push(items[i]);
                }
              } else if (items[i]) {
                items[i].errorMessage = result[i].getElementsByTagName('ErrorText')[0].firstChild.nodeValue;
                failed.push(items[i]);
              }
            }

            setup.progress(setup.progressVar.current, setup.progressVar.max); // check if we have some other packets that are waiting to be treated

            if (!(setup.progressVar.current < setup.progressVar.max)) {
              _context2.next = 82;
              break;
            }

            if (!global._SP_ADD_PROGRESSVAR[setup.progressVar.eventID]) {
              _context2.next = 80;
              break;
            }

            if (!(setup.breakOnFailure && failed.length > 0)) {
              _context2.next = 79;
              break;
            }

            // clean memory
            global._SP_ADD_PROGRESSVAR[setup.progressVar.eventID] = undefined; // and resolve by passing the items resolution

            return _context2.abrupt("return", _promise.default.resolve({
              passed: passed,
              failed: failed
            }));

          case 79:
            return _context2.abrupt("return", global._SP_ADD_PROGRESSVAR[setup.progressVar.eventID](setup));

          case 80:
            _context2.next = 84;
            break;

          case 82:
            if (global._SP_ADD_PROGRESSVAR[setup.progressVar.eventID]) global._SP_ADD_PROGRESSVAR[setup.progressVar.eventID] = undefined;
            return _context2.abrupt("return", _promise.default.resolve({
              passed: passed,
              failed: failed
            }));

          case 84:
            _context2.next = 89;
            break;

          case 86:
            _context2.prev = 86;
            _context2.t3 = _context2["catch"](0);
            return _context2.abrupt("return", _promise.default.reject(_context2.t3));

          case 89:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee, this, [[0, 86]]);
  }));
  return _add.apply(this, arguments);
}

module.exports = exports.default;