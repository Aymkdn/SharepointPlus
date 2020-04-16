"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js-stable/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.default = history;

var _ajax = _interopRequireDefault(require("../utils/ajax.js"));

var _buildBodyForSOAP2 = _interopRequireDefault(require("./_buildBodyForSOAP.js"));

/**
  @name $SP().list.history
  @function
  @description When versioning is an active option for your list, then you can use this function to find the previous values for a field

  @param {Object} params See below
    @param {String|Number} params.ID The item ID
    @param {String} params.Name The field name
  @return {Promise} resolve(data), reject(error)

  @example
  $SP().list("My List").history({ID:1981, Name:"Critical_x0020_Comments"}).then(function(data) {
    for (var i=0,len=data.length; i&lt;len; i++) {
      console.log("Date: "+data[i].getAttribute("Modified")); // you can use $SP().toDate() to convert it to a JavaScript Date object
      console.log("Editor: "+data[i].getAttribute("Editor")); // it's the long format type, so the result looks like that "328;#Doe,, John,#DOMAIN\john_doe,#John_Doe@example.com,#,#Doe,, John"
      console.log("Content: "+data[i].getAttribute("Critical_x0020_Comments")); // use the field name here
    }
  });
*/
function history(params) {
  if (!this.listID) throw "[SharepointPlus 'history'] the list ID/Name is required.";
  params = params || {};
  if (!params.ID || !params.Name) throw "[SharepointPlus 'history'] you must provide the item ID and field Name."; // send the request

  return _ajax.default.call(this, {
    url: this.url + "/_vti_bin/lists.asmx",
    body: (0, _buildBodyForSOAP2.default)("GetVersionCollection", "<strlistID>" + this.listID + "</strlistID><strlistItemID>" + params.ID + "</strlistItemID><strFieldName>" + params.Name + "</strFieldName>"),
    headers: {
      'SOAPAction': 'http://schemas.microsoft.com/sharepoint/soap/GetVersionCollection'
    }
  }).then(function (data) {
    return data.getElementsByTagName('Version');
  });
}

module.exports = exports.default;