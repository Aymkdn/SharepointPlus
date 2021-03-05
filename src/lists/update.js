import ajax from '../utils/ajax.js'
import _buildBodyForSOAP from './_buildBodyForSOAP.js'
import cloneObject from '../utils/cloneObject.js'
import parseRecurrence from './parseRecurrence.js'
import newGuid from '../utils/newGuid.js'
import _cleanString from '../utils/_cleanString.js'
import get from './get.js'
import add from './add.js'
import getContentTypeInfo from './getContentTypeInfo.js'

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
  // to update 1 item
  $SP().list("My List").update({ID:1, Title:"Ok"});

  // if you use the WHERE then you must not provide the item ID:
  $SP().list("List Name").update({Title:"Ok"},{where:"Status = 'Complete'"});

  // to update several items with a known ID
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
export default async function update(items, options) {
  try {
    if (!this.listID) return Promise.reject("[SharepointPlus 'update'] the list ID/name is required.");
    if (!this.url) return Promise.reject("[SharepointPlus 'update'] not able to find the URL!"); // we cannot determine the url

    // default values
    let setup={};
    cloneObject(true, setup, options);
    setup.where   = setup.where || "";
    setup.escapeChar = (setup.escapeChar === undefined) ? true : setup.escapeChar;
    setup.progress= setup.progress || function(){};
    setup.packetsize=setup.packetsize||30;

    if (!Array.isArray(items)) items = [ items ];
    let itemsLength=items.length, nextPacket, cutted, itemKey, itemValue, it;

    // if there is a WHERE clause
    if (itemsLength === 1 && setup.where) {
      // call GET first
      delete items[0].ID;
      let getFields = [];

      let params = {fields:["ID"],where:setup.where};
      // for calendar events
      if (setup.event) {
        params.calendar=true;
        params.calendarOptions={referenceDate:setup.event}
        // we also need all the columns for the event
        let data = await get.call(this, {fields:'ContentType', where:setup.where});
        if (data.length===0) return Promise.reject("[SharepointPlus 'update'] Unable to find an event with `"+setup.where+"`");
        let fields = await getContentTypeInfo.call(this, data[0].getAttribute('ContentType') || 'Event');
        fields.forEach(function(field) {
          let fieldID = field.Name||field.StaticName;
          if (fieldID === "TimeZone" || (field.Group !== '_Hidden' && field.ReadOnly !== 'TRUE' && field.Hidden !== 'TRUE' && typeof items[0][fieldID] === 'undefined')) {
            params.fields.push(fieldID);
          }
        });
      }

      getFields = params.fields.slice(0);
      let data = await get.call(this, params)

      // we need a function to clone the items
      let clone = function(obj){
        let newObj = {};
        for (let k in obj) newObj[k]=obj[k];
        return newObj;
      };

      let aItems=[], it;
      if (!setup.event) {
        let i=data.length;
        while (i--) {
          it=clone(items[0]);
          it.ID=data[i].getAttribute("ID");
          aItems.push(it);
        }
        setup.where=undefined;

        // now call again the UPDATE
        return update.call(this,aItems,setup);
      } else {
        // the treatment is different for `event`
        let eventDate = (typeof setup.event !== 'string' ? this.toSPDate(setup.event) : setup.event.slice(0,10));
        let event = data.filter(function(d) {
          return d.getAttribute("ID").indexOf("."+eventDate+"T") !== -1;
        });
        if (event.length===0) return Promise.reject("[SharepointPlus 'update'] No event found on "+eventDate);
        event = event[0];

        // see https://fatalfrenchy.wordpress.com/2010/07/16/sharepoint-recurrence-data-schema/
        it=clone(items[0]);
        getFields.forEach(function(field) {
          if (field!=='ID' && typeof it[field] === 'undefined') {
            let val = event.getAttribute(field);
            if (val !== undefined && val !== null) it[field] = val;
          }
        });
        it.MasterSeriesItemID = event.getAttribute("ID").split('.')[0];
        it.UID = event.getAttribute("UID");
        it.EventType = 4;
        it.fRecurrence = 1;
        it.RecurrenceData = "No Recurrence";
        it.RecurrenceID = event.getAttribute("RecurrenceID"); // the occurrence event date
        it.TimeZone = event.getAttribute("TimeZone");
        return add.call(this, it, setup);
      }
    }

    // define current and max for the progress
    setup.progressVar = setup.progressVar || {current:0,max:itemsLength,passed:[],failed:[],eventID:"spUpdate"+(""+Math.random()).slice(2)};
    // we cannot add more than 15 items in the same time, so split by 15 elements
    // and also to avoid surcharging the server
    if (itemsLength > setup.packetsize) {
      nextPacket=items.slice(0);
      cutted=nextPacket.splice(0,setup.packetsize);
      global._SP_UPDATE_PROGRESSVAR[setup.progressVar.eventID] = setup => update.call(this,nextPacket,setup);
      items = cutted;
      itemsLength = items.length;
    } else if (itemsLength == 0) {
      return Promise.resolve({passed:[], failed:[]});
    }

    // increment the progress
    setup.progressVar.current += itemsLength;

    // build a part of the request
    let updates = '<Batch OnError="Continue" ListVersion="1"  ViewName="">';
    for (let i=0; i < itemsLength; i++) {
      updates += '<Method ID="'+(i+1)+'" Cmd="Update">';
      if (!items[i].ID) return Promise.reject("[SharepointPlus 'update'] you have to provide the item ID called 'ID'");
      for (it in items[i]) {
        if (Object.prototype.hasOwnProperty.call(items[i], it)) {
          itemKey = it;
          itemValue = items[i][it];
          if (Array.isArray(itemValue)) {
            if (itemValue.length===0) itemValue='';
            else itemValue = ";#" + itemValue.join(";#") + ";#"; // an array should be seperate by ";#"
          }

          // if we have RecurrenceData, and if it's an object, then we convert it
          if (itemKey === 'RecurrenceData') {
            if (typeof itemValue === 'object') itemValue = parseRecurrence(itemValue);
            // add additional fields
            if (!items[i]['RecurrenceID']) {
              if (typeof items[i]['fRecurrence'] === 'undefined') updates += "<Field Name='fRecurrence'>1</Field>";
              if (typeof items[i]['EventType'] === 'undefined') updates += "<Field Name='EventType'>1</Field>";
              if (typeof items[i]['UID'] === 'undefined') updates += "<Field Name='UID'>{"+newGuid()+"}</Field>";
              if (typeof items[i]['fAllDayEvent'] === 'undefined') updates += "<Field Name='fAllDayEvent'>0</Field>";
            }
            updates += "<Field Name='"+itemKey+"'><![CDATA["+itemValue+"]]></Field>";
          } else {
            if (typeof itemValue === 'boolean') itemValue = (itemValue ? '1' : '0');
            if (setup.escapeChar && typeof itemValue === "string") itemValue = _cleanString(itemValue); // replace & (and not &amp;) by "&amp;" to avoid some issues
            updates += "<Field Name='"+itemKey+"'>"+itemValue+"</Field>";
          }
        }
      }
      updates += '</Method>';
    }
    updates += '</Batch>';

    // send the request
    let data = await ajax.call(this, {
      url:this.url + "/_vti_bin/lists.asmx",
      body:_buildBodyForSOAP("UpdateListItems", "<listName>"+this.listID+"</listName><updates>" + updates + "</updates>"),
      headers:{'SOAPAction':'http://schemas.microsoft.com/sharepoint/soap/UpdateListItems'}
    })

    let result = data.getElementsByTagName('Result'), len=result.length, passed = setup.progressVar.passed, failed = setup.progressVar.failed;
    for (let i=0; i < len; i++) {
      if (result[i].getElementsByTagName('ErrorCode')[0].firstChild.nodeValue === "0x00000000" && items[i]) {// success
        let raw=result[i].getElementsByTagName('z:row');
        if (raw.length===0) raw=result[i].getElementsByTagName('row'); // for Chrome 'bug'
        items[i].raw=raw[0];
        passed.push(items[i]);
      }
      else if (items[i]) {
        items[i].errorMessage = result[i].getElementsByTagName('ErrorText')[0].firstChild.nodeValue;
        failed.push(items[i]);
      }
    }

    setup.progress(setup.progressVar.current,setup.progressVar.max);
    // check if we have some other packets that are waiting to be treated
    if (setup.progressVar.current < setup.progressVar.max) {
      if (global._SP_UPDATE_PROGRESSVAR[setup.progressVar.eventID]) {
        // if we have "breakOnFailure", then we check the updated items
        if (setup.breakOnFailure && failed.length>0) {
          // clean memory
          global._SP_UPDATE_PROGRESSVAR[setup.progressVar.eventID]=undefined;
          // and resolve by passing the items resolution
          return Promise.resolve({passed:passed, failed:failed});
        }
        return global._SP_UPDATE_PROGRESSVAR[setup.progressVar.eventID](setup);
      }
    }
    else {
      if (global._SP_UPDATE_PROGRESSVAR[setup.progressVar.eventID]) global._SP_UPDATE_PROGRESSVAR[setup.progressVar.eventID]=undefined;
      return Promise.resolve({passed:passed, failed:failed});
    }
  } catch(err) {
    return Promise.reject(err);
  }
}
