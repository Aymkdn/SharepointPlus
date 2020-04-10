"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js-stable/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports["default"] = setReadOnly;

var _promise = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/promise"));

var _forEach = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/for-each"));

var _info = _interopRequireDefault(require("./info.js"));

var _webService = _interopRequireDefault(require("../utils/webService.js"));

/**
  @name $SP().list.setReadOnly
  @function
  @description Permits to change a readonly column (like "Created By", "Created","Modified" or "Modified By") to become editable... ATTENTION: it's not recommanded to edit a READONLY column, and it could have unexpected consequences on your list

  @param {String} fieldID The internal field name (e.g. "Author", or "Modified"); The supported columns are: "Author", "Created", "Editor" and "Modified". You can also provide an XML string if you want to deal with another column (e.g. <'Field ID="{8c06beca-0777-48f7-91c7-6da68bc07b69}" Name="Created" SourceID="http://schemas.microsoft.com/sharepoint/v3" StaticName="Created" Group="_Hidden" ColName="tp_Created" RowOrdinal="0" ReadOnly="TRUE" Type="DateTime" DisplayName="Created" StorageTZ="TRUE"/>')
  @param {Boolean} readonly To define the readonly status of the column
  @return {Promise} resolve(contentTypes), reject(error)

  @example
  // make "Created" column an editable column
  $SP().list("List Name").setReadOnly('Created', false)
  .then(function() {
    $SP().list("List Name").update({ID:1, Created:'2019-01-19'})
  })
*/
function setReadOnly(fieldID, readonly) {
  var _this = this;

  if (!this.listID) throw "[SharepointPlus 'setReadOnly']: the list ID/Name is required";
  if (!this.url) throw "[SharepointPlus 'setReadOnly']: not able to find the URL!"; // we cannot determine the url
  // do the request

  var updateSystemFields = "<Fields><Method ID='1'>";
  if (fieldID.charAt(0) === '<') updateSystemFields += fieldID; // get info

  return _info["default"].call(this).then(function (infos) {
    var props = ["ID", "Name", "SourceID", "StaticName", "ColName", "RowOrdinal", "Type", "DisplayName"];
    updateSystemFields += '<Field';

    var _loop = function _loop(i) {
      if (infos[i]["Name"] === fieldID) {
        // add other properties based on the Field ID
        switch (fieldID) {
          case "Created":
          case "Modified":
            {
              props.push("StorageTZ");
              break;
            }

          case "Author":
          case "Editor":
            {
              props.push("List");
              break;
            }
        }

        (0, _forEach["default"])(props).call(props, function (prop) {
          if (infos[i][prop]) updateSystemFields += ' ' + prop + '="' + infos[i][prop] + '"';
        });
        updateSystemFields += ' ReadOnly="' + (readonly ? "TRUE" : "FALSE") + '" />';
        return "break";
      }
    };

    for (var i = infos.length; i--;) {
      var _ret = _loop(i);

      if (_ret === "break") break;
    }

    updateSystemFields += "</Method></Fields>";
    return _webService["default"].call(_this, {
      webURL: _this.url,
      service: "Lists",
      operation: "UpdateList",
      properties: {
        listName: _this.listID,
        listProperties: "",
        updateFields: updateSystemFields,
        newFields: "",
        deleteFields: "",
        listVersion: ""
      }
    });
  }).then(function (response) {
    if (response.getElementsByTagName('ErrorCode')[0].firstChild.nodeValue !== "0x00000000") {
      var errors = response.getElementsByTagName('ErrorText');
      return _promise["default"].reject(errors.length > 0 ? errors[0].firstChild.nodeValue : "Unknown Error");
    }
  });
}

module.exports = exports.default;