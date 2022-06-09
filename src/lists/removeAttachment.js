import ajax from '../utils/ajax.js'
import _buildBodyForSOAP from './_buildBodyForSOAP.js'
import getVersions from './getVersions.js'
import restoreVersion from './restoreVersion.js'

/**
  @name $SP().list.removeAttachment
  @function
  @description Remove an attachment from a Sharepoint List Item

  @param {Object} setup Options (see below)
    @param {Number} setup.ID The item ID where the file will be removed
    @param {String} setup.fileURL The full path to the file
  @return {Promise} resolve(true), reject()

  @example
  $SP().list("My List").removeAttachment({
    ID:1,
    fileURL:"https://mysite.share.point.com/Toolbox/Lists/Tasks/Attachments/2305/image1.png"
  })
*/
export default function removeAttachment(setup) {
  if (arguments.length===0) throw "[SharepointPlus 'removeAttachment'] the arguments are mandatory.";
  if (!this.listID) throw "[SharepointPlus 'removeAttachment'] the list ID/Name is required.";
  if (!this.url) throw "[SharepointPlus 'removeAttachment'] not able to find the URL!"; // we cannot determine the url
  if (!setup.ID) throw "[SharepointPlus 'removeAttachment'] the item ID is required.";
  if (!setup.fileURL) throw "[SharepointPlus 'removeAttachment'] the fileURL is required.";

  return ajax.call(this, {
    url: this.url + "/_vti_bin/Lists.asmx",
    body: _buildBodyForSOAP("DeleteAttachment", "<listName>"+this.listID+"</listName><listItemID>"+setup.ID+"</listItemID><url>"+setup.fileURL+"</url>"),
    headers:{'SOAPAction': 'http://schemas.microsoft.com/sharepoint/soap/DeleteAttachment' }
  })
  .then(async () => {
    // there is a bug with Sharepoint: if the list has the versioning enabled, then add/remove an attachment will created an empty version
    // which could reset the values for the "Multiple Lines of Text" field with "Append" option
    // -> to resolve it we will restore the last version each time we add/remove an attachment
    try {
      let versions = await getVersions.call(this, setup.ID);
      if (versions.length > 0) {
        let versionID = versions[versions.length-1].VersionID;
        await restoreVersion.call(this, {ID:setup.ID, VersionID:versionID});
      }
      return true;
    } catch(err) {
      return true;
    }
  })
}
