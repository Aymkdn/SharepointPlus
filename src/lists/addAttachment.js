import ajax from '../utils/ajax.js'
import _buildBodyForSOAP from './_buildBodyForSOAP.js'
import arrayBufferToBase64 from '../utils/arrayBufferToBase64.js'
import getVersions from './getVersions.js'
import restoreVersion from './restoreVersion.js'

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
  // with something like: <input type="file" onchange="addAttachment(event)">
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
  if (arguments.length===0) throw "[SharepointPlus 'addAttachment'] the arguments are mandatory.";
  if (!this.listID) throw "[SharepointPlus 'addAttachment'] the list ID/Name is required.";
  if (!this.url) throw "[SharepointPlus 'addAttachment'] not able to find the URL!"; // we cannot determine the url
  if (!setup.ID) throw "[SharepointPlus 'addAttachment'] the item ID is required.";
  if (!setup.filename) throw "[SharepointPlus 'addAttachment'] the filename is required.";
  if (!setup.attachment) throw "[SharepointPlus 'addAttachment'] the ArrayBuffer of the attachment's content is required.";
  // avoid invalid characters
  // eslint-disable-next-line
  let filename = setup.filename.replace(/[\*\?\|\\/:"'<>#{}%~&]/g,"").replace(/^[\. ]+|[\. ]+$/g,"").replace(/ {2,}/g," ").replace(/\.{2,}/g,".");
  if (filename.length>=128) {
    filename = filename.slice(0,115)+'__'+filename.slice(-8);
  }
  return ajax.call(this, {
    url: this.url + "/_vti_bin/Lists.asmx",
    body: _buildBodyForSOAP("AddAttachment", "<listName>"+this.listID+"</listName><listItemID>"+setup.ID+"</listItemID><fileName>"+filename+"</fileName><attachment>"+arrayBufferToBase64(setup.attachment)+"</attachment>"),
    headers:{'SOAPAction': 'http://schemas.microsoft.com/sharepoint/soap/AddAttachment' }
  })
  .then(async data => {
    let res = data.getElementsByTagName('AddAttachmentResult');
    res = (res.length>0 ? res[0] : null);
    let fileURL = "";
    if (res) fileURL = this.url + "/" + res.firstChild.nodeValue;
    if (!fileURL) return Promise.reject(res);
    // there is a bug with Sharepoint: if the list has the versioning enabled, then add/remove an attachment will created an empty version
    // which could reset the values for the "Multiple Lines of Text" field with "Append" option
    // -> to resolve it we will restore the last version each time we add/remove an attachment
    try {
      let versions = await getVersions.call(this, setup.ID);
      if (versions.length > 0) {
        let versionID = versions[versions.length-1].VersionID;
        await restoreVersion.call(this, {ID:setup.ID, VersionID:versionID});
      }
      return fileURL;
    } catch(err) {
      return fileURL;
    }
  })
}
