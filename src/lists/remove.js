import ajax from '../utils/ajax.js'
import _buildBodyForSOAP from './_buildBodyForSOAP.js'
import cloneObject from '../utils/cloneObject.js'
import get from './get.js'
import add from './add.js'

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
export default async function remove(items, options) {
  try {
    if (!this.url) throw "[SharepointPlus 'remove'] not able to find the URL!"; // we cannot determine the url
    // default values
    if (!options && items.where) { options=items; items=[]; } // the case when we use the "where"
    let setup={};
    cloneObject(true, setup, options);
    setup.progress= setup.progress || (function() {});
    setup.packetsize = setup.packetsize || 30;

    if (!Array.isArray(items)) items = [ items ];
    let itemsLength=items.length, nextPacket, cutted;

    // if there is a WHERE clause
    if (setup.where) {
      // call GET first
      if (itemsLength===1) delete items[0].ID;
      let getParams = {fields:["ID","FileRef"],where:setup.where};
      // if we want to delete an event
      if (setup.event) {
        getParams.fields.push("Title");
        getParams.calendar=true;
        getParams.calendarOptions={referenceDate:setup.event}
      }
      let data = await get.call(this,getParams)

      // we need a function to clone the items
      let clone = function(obj){
        let newObj = {};
        for (let k in obj) newObj[k]=obj[k];
        return newObj;
      };
      let aItems=[],fileRef,it={};
      if (!setup.event) {
        let i=data.length;
        while (i--) {
          it=clone(items[0]);
          it.ID=data[i].getAttribute("ID");
          fileRef=data[i].getAttribute("FileRef");
          if (fileRef) it.FileRef=this.cleanResult(fileRef);
          aItems.push(it);
        }
        setup.where=undefined;

        // now call again the REMOVE
        return remove.call(this,aItems,setup);
      } else {
        // the treatment is different for `event`
        let eventDate = (typeof setup.event !== 'string' ? this.toSPDate(setup.event) : setup.event.slice(0,10));
        let event = data.filter(function(d) {
          return d.getAttribute("ID").indexOf("."+eventDate+"T") !== -1 || (d.getAttribute("RecurrenceID")||"").startsWith(eventDate);
        });
        if (event.length===0) return Promise.reject("[SharepointPlus 'remove'] No event found on "+eventDate);
        event = event[0];

        // see https://fatalfrenchy.wordpress.com/2010/07/16/sharepoint-recurrence-data-schema/
        it.MasterSeriesItemID = event.getAttribute("ID").split('.')[0];
        it.UID = event.getAttribute("UID");
        it.EventType = 3;
        it.fRecurrence = 1;
        it.fAllDayEvent = event.getAttribute("fAllDayEvent")||"0";
        it.RecurrenceData = "No Recurrence";
        it.RecurrenceID = event.getAttribute("RecurrenceID"); // the occurrence event date
        it.Title = "Deleted: " + event.getAttribute("Title")||"";
        it.EventDate = event.getAttribute("EventDate");
        it.EndDate = event.getAttribute("EndDate");
        return add.call(this, it, setup);
      }
    } else if (itemsLength === 0) {
      // nothing to delete
      return Promise.resolve({passed:[], failed:[]});
    }

    // define current and max for the progress
    setup.progressVar = setup.progressVar || {current:0,max:itemsLength,passed:[],failed:[],eventID:"spRemove"+(""+Math.random()).slice(2)};
    // we cannot add more than setup.packetsize items in the same time, so split by setup.packetsize elements
    // and also to avoid surcharging the server
    if (itemsLength > setup.packetsize) {
      nextPacket=items.slice(0);
      cutted=nextPacket.splice(0,setup.packetsize);
      global._SP_REMOVE_PROGRESSVAR[setup.progressVar.eventID] = setup => remove.call(this,nextPacket,setup);
      items = cutted;
      itemsLength = items.length;
    }
    // increment the progress
    setup.progressVar.current += itemsLength;

    // build a part of the request
    let updates = '<Batch OnError="Continue" ListVersion="1"  ViewName="">';
    for (let i=0; i < items.length; i++) {
      updates += '<Method ID="'+(i+1)+'" Cmd="Delete">';
      if (items[i].ID == undefined) throw "Error 'delete': you have to provide the item ID called 'ID'";
      updates += "<Field Name='ID'>"+items[i].ID+"</Field>";
      if (items[i].FileRef != undefined) updates += "<Field Name='FileRef'>"+items[i].FileRef+"</Field>";
      updates += '</Method>';
    }
    updates += '</Batch>';

    // send the request
    let data = await ajax.call(this, {
      url:this.url + "/_vti_bin/lists.asmx",
      body:_buildBodyForSOAP("UpdateListItems", "<listName>"+this.listID+"</listName><updates>" + updates + "</updates>"),
      headers:{'SOAPAction':'http://schemas.microsoft.com/sharepoint/soap/UpdateListItems'}
    })

    let result = data.getElementsByTagName('Result'), len=result.length, passed = setup.progressVar.passed, failed = setup.progressVar.failed, i;
    for (i=0; i < len; i++) {
      if (result[i].getElementsByTagName('ErrorCode')[0].firstChild.nodeValue === "0x00000000") // success
        passed.push(items[i]);
      else {
        items[i].errorMessage = result[i].getElementsByTagName('ErrorText')[0].firstChild.nodeValue;
        failed.push(items[i]);
      }
    }

    setup.progress(setup.progressVar.current,setup.progressVar.max);
    // check if we have some other packets that are waiting to be treated
    if (setup.progressVar.current < setup.progressVar.max) {
      if (global._SP_REMOVE_PROGRESSVAR[setup.progressVar.eventID]) {
        // if we have "breakOnFailure", then we check the updated items
        if (setup.breakOnFailure && failed.length>0) {
          // clean memory
          global._SP_REMOVE_PROGRESSVAR[setup.progressVar.eventID]=undefined;
          // and resolve by passing the items resolution
          return Promise.resolve({passed:passed, failed:failed});
        }
        return global._SP_REMOVE_PROGRESSVAR[setup.progressVar.eventID](setup);
      }
    } else {
      if (global._SP_REMOVE_PROGRESSVAR[setup.progressVar.eventID]) global._SP_REMOVE_PROGRESSVAR[setup.progressVar.eventID]=undefined;
      return Promise.resolve({passed:passed, failed:failed});
    }
  } catch(err) {
    return Promise.reject(err);
  }
}
