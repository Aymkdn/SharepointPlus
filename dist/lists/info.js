"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js-stable/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports["default"] = info;

var _ajax = _interopRequireDefault(require("../utils/ajax.js"));

var _buildBodyForSOAP2 = _interopRequireDefault(require("./_buildBodyForSOAP.js"));

/**
  @name $SP().list.info
  @function
  @description Get the columns' information/metadata, and the list's details

  @return {Promise} resolve(infos), reject(error)

  @example
  $SP().list("List Name").info().then(function(infos) {
    // for columns' details:
    for (var i=0; i&lt;infos.length; i++) console.log(infos[i]["DisplayName"]+ ": => ",infos[i]);
    // for list's details:
    console.log(infos._List)
  });
*/
function info() {
  // check if we need to queue it
  if (!this.listID) throw "[SharepointPlus 'info'] the list ID/Name is required.";
  if (!this.url) throw "[SharepointPlus 'info'] not able to find the URL!"; // we cannot determine the url
  // do the request

  return _ajax["default"].call(this, {
    url: this.url + "/_vti_bin/lists.asmx",
    body: (0, _buildBodyForSOAP2["default"])("GetList", '<listName>' + this.listID + '</listName>'),
    headers: {
      'SOAPAction': 'http://schemas.microsoft.com/sharepoint/soap/GetList'
    }
  }).then(function (data) {
    var aReturn = [],
        arr = data.getElementsByTagName('Field'),
        index = 0,
        aIndex,
        attributes,
        attrName,
        attrValue,
        lenDefault,
        nodeDefault,
        i,
        j,
        a,
        r,
        k,
        nName,
        nValue; // retrieve list info first

    var listDetails = data.getElementsByTagName('List');
    listDetails = listDetails.length > 0 ? listDetails[0] : null;
    attributes = listDetails.attributes;
    aReturn["_List"] = {};

    for (i = 0; i < attributes.length; i++) {
      aReturn["_List"][attributes[i].nodeName] = attributes[i].nodeValue;
    } // then retrieve fields info


    for (i = 0; i < arr.length; i++) {
      if (arr[i].getAttribute("ID")) {
        aReturn[index] = [];
        aIndex = aReturn[index];
        attributes = arr[i].attributes;

        for (j = attributes.length; j--;) {
          attrName = attributes[j].nodeName;
          attrValue = attributes[j].nodeValue;

          if (attrName === "Type") {
            switch (attrValue) {
              case "Choice":
              case "MultiChoice":
                {
                  aIndex["FillInChoice"] = arr[i].getAttribute("FillInChoice");
                  a = arr[i].getElementsByTagName("CHOICE");
                  r = [];

                  for (k = 0; k < a.length; k++) {
                    r.push(a[k].firstChild.nodeValue);
                  }

                  aIndex["Choices"] = r;
                  break;
                }

              case "Lookup":
              case "LookupMulti":
                aIndex["Choices"] = {
                  list: arr[i].getAttribute("List"),
                  field: arr[i].getAttribute("ShowField")
                };
                break;

              case "TaxonomyFieldType":
              case "TaxonomyFieldTypeMulti":
                {
                  a = arr[i].getElementsByTagName("Property");
                  aIndex["Property"] = {};

                  for (k = 0; k < a.length; k++) {
                    nName = a[k].getElementsByTagName('Name');
                    nValue = a[k].getElementsByTagName('Value');
                    if (nName.length > 0) aIndex["Property"][nName[0].firstChild.nodeValue] = nValue.length > 0 ? nValue[0].firstChild.nodeValue : null;
                  }

                  break;
                }

              default:
                aIndex["Choices"] = [];
            }
          }

          aIndex[attrName] = attrValue;
        } // find the default values


        lenDefault = arr[i].getElementsByTagName("Default").length;

        if (lenDefault > 0) {
          nodeDefault = arr[i].getElementsByTagName("Default");
          aReturn[index]["DefaultValue"] = [];

          for (var q = 0; q < lenDefault; q++) {
            nodeDefault[q].firstChild && aReturn[index]["DefaultValue"].push(nodeDefault[q].firstChild.nodeValue);
          }

          if (lenDefault === 1) aReturn[index]["DefaultValue"] = aReturn[index]["DefaultValue"][0];
        } else aReturn[index]["DefaultValue"] = null;

        index++;
      }
    }

    return aReturn;
  });
}

module.exports = exports.default;