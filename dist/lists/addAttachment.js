"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js-stable/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports["default"] = addAttachment;

var _promise = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/promise"));

var _slice = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/slice"));

var _ajax = _interopRequireDefault(require("../utils/ajax.js"));

var _buildBodyForSOAP2 = _interopRequireDefault(require("./_buildBodyForSOAP.js"));

var _arrayBufferToBase = _interopRequireDefault(require("../utils/arrayBufferToBase64.js"));

/**
  @name $SP().list.addAttachment
  @function
  @description Add an attachment to a Sharepoint List Item

  @param {Object} setup Options (see below)
    @param {Number} setup.ID The item ID to attach the file
    @param {String} setup.filename The name of the file
    @param {String} setup.attachment An array buffer of the file content
  @return {Promise} resolve(fileURL), reject()

  @example
  $SP().list("My List").addAttachment({
    ID:1,
    filename:"helloworld.txt",
    attachment:"*ArrayBuffer*"
  }).then(function(fileURL) {
    alert(fileURL)
  });
*/
function addAttachment(setup) {
  var _this = this;

  // check if we need to queue it
  if (arguments.length === 0) throw "[SharepointPlus 'addAttachment'] the arguments are mandatory.";
  if (!this.listID) throw "[SharepointPlus 'addAttachment'] the list ID/Name is required.";
  if (!this.url) throw "[SharepointPlus 'addAttachment'] not able to find the URL!"; // we cannot determine the url

  if (!setup.ID) throw "[SharepointPlus 'addAttachment'] the item ID is required.";
  if (!setup.filename) throw "[SharepointPlus 'addAttachment'] the filename is required.";
  if (!setup.attachment) throw "[SharepointPlus 'addAttachment'] the ArrayBuffer of the attachment's content is required."; // avoid invalid characters
  // eslint-disable-next-line

  var filename = setup.filename.replace(/[\*\?\|\\/:"'<>#{}%~&]/g, "").replace(/^[\. ]+|[\. ]+$/g, "").replace(/ {2,}/g, " ").replace(/\.{2,}/g, ".");

  if (filename.length >= 128) {
    filename = (0, _slice["default"])(filename).call(filename, 0, 115) + '__' + (0, _slice["default"])(filename).call(filename, -8);
  }

  return _ajax["default"].call(this, {
    url: this.url + "/_vti_bin/Lists.asmx",
    body: (0, _buildBodyForSOAP2["default"])("AddAttachment", "<listName>" + this.listID + "</listName><listItemID>" + setup.ID + "</listItemID><fileName>" + filename + "</fileName><attachment>" + (0, _arrayBufferToBase["default"])(setup.attachment) + "</attachment>"),
    headers: {
      'SOAPAction': 'http://schemas.microsoft.com/sharepoint/soap/AddAttachment'
    }
  }).then(function (data) {
    var res = data.getElementsByTagName('AddAttachmentResult');
    res = res.length > 0 ? res[0] : null;
    var fileURL = "";
    if (res) fileURL = _this.url + "/" + res.firstChild.nodeValue;
    if (!fileURL) return _promise["default"].reject(res);else return fileURL;
  });
}

module.exports = exports.default;