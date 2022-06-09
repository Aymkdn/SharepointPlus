import _regeneratorRuntime from "@babel/runtime-corejs3/regenerator";
import _Promise from "@babel/runtime-corejs3/core-js-stable/promise";
import _asyncToGenerator from "@babel/runtime-corejs3/helpers/esm/asyncToGenerator";
import _sliceInstanceProperty from "@babel/runtime-corejs3/core-js-stable/instance/slice";
import ajax from '../utils/ajax.js';
import _buildBodyForSOAP from './_buildBodyForSOAP.js';
import arrayBufferToBase64 from '../utils/arrayBufferToBase64.js';
import getVersions from './getVersions.js';
import restoreVersion from './restoreVersion.js';
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

  // to read a file and send it
  // with something like: &lt;input type="file" onchange="addAttachment(event)"&gt;
  function addAttachment(event) {
    let files = event.target.files;
    let fileReader = new FileReader();
    fileReader.onloadend = function(e) {
      let content = e.target.result;
      $SP().list("MyList").addAttachment({
        ID:itemID,
        filename:files[0].name,
        attachment:content
      })
      .then(function(url) {
        console.log({url})
      })
      .catch(function(err) {
        console.log(err)
      })
    }
    fileReader.onerror = function(e) {
      alert('Unexpected error: '+e.target.error);
    }
    fileReader.readAsArrayBuffer(files[0]);
  }
*/

export default function addAttachment(setup) {
  var _this = this;

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
  }).then(
  /*#__PURE__*/
  function () {
    var _ref = _asyncToGenerator(
    /*#__PURE__*/
    _regeneratorRuntime.mark(function _callee(data) {
      var res, fileURL, versions, versionID;
      return _regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              res = data.getElementsByTagName('AddAttachmentResult');
              res = res.length > 0 ? res[0] : null;
              fileURL = "";
              if (res) fileURL = _this.url + "/" + res.firstChild.nodeValue;

              if (fileURL) {
                _context.next = 6;
                break;
              }

              return _context.abrupt("return", _Promise.reject(res));

            case 6:
              _context.prev = 6;
              _context.next = 9;
              return getVersions.call(_this, setup.ID);

            case 9:
              versions = _context.sent;

              if (!(versions.length > 0)) {
                _context.next = 14;
                break;
              }

              versionID = versions[versions.length - 1].VersionID;
              _context.next = 14;
              return restoreVersion.call(_this, {
                ID: setup.ID,
                VersionID: versionID
              });

            case 14:
              return _context.abrupt("return", fileURL);

            case 17:
              _context.prev = 17;
              _context.t0 = _context["catch"](6);
              return _context.abrupt("return", fileURL);

            case 20:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, null, [[6, 17]]);
    }));

    return function (_x) {
      return _ref.apply(this, arguments);
    };
  }());
}