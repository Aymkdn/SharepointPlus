import _Promise from "@babel/runtime-corejs3/core-js-stable/promise";
import _sliceInstanceProperty from "@babel/runtime-corejs3/core-js-stable/instance/slice";
import ajax from '../utils/ajax.js';
import _buildBodyForSOAP from './_buildBodyForSOAP.js';
import arrayBufferToBase64 from '../utils/arrayBufferToBase64.js';
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

export default function addAttachment(setup) {
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
    filename = _sliceInstanceProperty(filename).call(filename, 0, 115) + '__' + _sliceInstanceProperty(filename).call(filename, -8);
  }

  return ajax.call(this, {
    url: this.url + "/_vti_bin/Lists.asmx",
    body: _buildBodyForSOAP("AddAttachment", "<listName>" + this.listID + "</listName><listItemID>" + setup.ID + "</listItemID><fileName>" + filename + "</fileName><attachment>" + arrayBufferToBase64(setup.attachment) + "</attachment>"),
    headers: {
      'SOAPAction': 'http://schemas.microsoft.com/sharepoint/soap/AddAttachment'
    }
  }).then(function (data) {
    var res = data.getElementsByTagName('AddAttachmentResult');
    res = res.length > 0 ? res[0] : null;
    var fileURL = "";
    if (res) fileURL = _this.url + "/" + res.firstChild.nodeValue;
    if (!fileURL) return _Promise.reject(res);else return fileURL;
  });
}