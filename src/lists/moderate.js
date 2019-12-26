import ajax from '../utils/ajax.js'
import _buildBodyForSOAP from './_buildBodyForSOAP.js'
import myElem from './myElem.js'

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
export default async function moderate(items, setup) {
  try {
    if (!this.listID) throw "[SharepointPlus 'moderate'] the list ID/Name is required.";

    // default values
    setup = setup || {};
    if (!this.url) throw "[SharepointPlus 'moderate'] not able to find the URL!"; // we cannot determine the url
    setup.progress= setup.progress || function(){};

    if (!Array.isArray(items)) items = [ items ];
    let itemsLength=items.length, nextPacket, cutted, itemKey, itemValue, it;

    // define current and max for the progress
    setup.progressVar = setup.progressVar || {current:0,max:itemsLength,passed:[],failed:[],eventID:"spModerate"+(""+Math.random()).slice(2)};
    // we cannot add more than 15 items in the same time, so split by 15 elements
    // and also to avoid surcharging the server
    if (itemsLength > 15) {
      nextPacket=items.slice(0);
      cutted=nextPacket.splice(0,15);
      global._SP_MODERATE_PROGRESSVAR[setup.progressVar.eventID] = setup => moderate.call(this,nextPacket,setup);
      return moderate.call(this,cutted,setup);
    } else if (itemsLength === 0) {
      return Promise.resolve({passed:[], failed:[]});
    }

    // increment the progress
    setup.progressVar.current += itemsLength;

    // build a part of the request
    let updates = '<Batch OnError="Continue" ListVersion="1"  ViewName="">';
    for (let i=0; i < itemsLength; i++) {
      updates += '<Method ID="'+(i+1)+'" Cmd="Moderate">';
      if (!items[i].ID) throw "[SharepointPlus 'moderate'] you have to provide the item ID called 'ID'";
      else if (typeof items[i].ApprovalStatus === "undefined") throw "[SharepointPlus 'moderate'] you have to provide the approval status 'ApprovalStatus' (Approved, Rejected, Pending, Draft or Scheduled)";
      for (it in items[i]) {
        if (Object.prototype.hasOwnProperty.call(items[i], it)) {
          itemKey = it;
          itemValue = items[i][it];
          if (itemKey == "ApprovalStatus") {
            itemKey = "_ModerationStatus";
            switch (itemValue.toLowerCase()) {
              case "approve":
              case "approved":  itemValue=0; break;
              case "reject":
              case "deny":
              case "denied":
              case "rejected":  itemValue=1; break;
              case "pending":   itemValue=2; break;
              case "draft":     itemValue=3; break;
              case "scheduled": itemValue=4; break;
              default:          itemValue=2; break;
            }
          }
        }
        updates += "<Field Name='"+itemKey+"'>"+itemValue+"</Field>";
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
    let result = data.getElementsByTagName('Result'), len=result.length, passed = setup.progressVar.passed, failed = setup.progressVar.failed, rows;
    for (let i=0; i < len; i++) {
      rows=result[i].getElementsByTagName('z:row');
      if (rows.length==0) rows=data.getElementsByTagName('row'); // for Chrome
      let item = new myElem(rows[0]);
      if (result[i].getElementsByTagName('ErrorCode')[0].firstChild.nodeValue == "0x00000000") // success
        passed.push(item);
      else {
        items[i].errorMessage = result[i].getElementsByTagName('ErrorText')[0].firstChild.nodeValue;
        failed.push(items[i]);
      }
    }

    setup.progress(setup.progressVar.current,setup.progressVar.max);
    // check if we have some other packets that are waiting to be treated
    if (setup.progressVar.current < setup.progressVar.max) {
      if (global._SP_MODERATE_PROGRESSVAR[setup.progressVar.eventID]) {
        return global._SP_MODERATE_PROGRESSVAR[setup.progressVar.eventID](setup);
      }
    }  else {
      if (global._SP_MODERATE_PROGRESSVAR[setup.progressVar.eventID]) delete global._SP_MODERATE_PROGRESSVAR[setup.progressVar.eventID];
      return Promise.resolve({passed:passed, failed:failed});
    }
  } catch(err) {
    return Promise.reject(err);
  }
}
