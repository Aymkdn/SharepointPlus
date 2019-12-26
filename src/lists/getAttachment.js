import ajax from '../utils/ajax.js'
import _buildBodyForSOAP from './_buildBodyForSOAP.js'

/**
  @name $SP().list.getAttachment
  @function
  @description Get the attachment(s) for an item

  @param {String|Number} itemID The item ID
  @return {Promise} resolve([results])

  @example
  $SP().list("My List","http://my.site.com/mydir/").getAttachment(1).then(function(attachments) {
    for (var i=0; i&lt;attachments.length; i++) console.log(attachments[i]); -> "https://my.site.com/site/Lists/Something/Attachments/46/helloworld.txt"
  });

  // you can also use $SP().list().get() using the "Attachments" field
*/
export default function getAttachment(itemID) {
  if (!this.listID) throw "[SharepointPlus 'getAttachment']: the list ID/Name is required";
  if (!this.url) throw "[SharepointPlus 'getAttachment']: not able to find the URL!"; // we cannot determine the url
  // do the request
  return ajax.call(this, {
    url: this.url + "/_vti_bin/lists.asmx",
    body: _buildBodyForSOAP("GetAttachmentCollection", "<listName>"+this.listID+"</listName><listItemID>"+itemID+"</listItemID>"),
    headers:{'SOAPAction':'http://schemas.microsoft.com/sharepoint/soap/GetAttachmentCollection'}
  }).then(function(data) {
    var aReturn = [], i=0, a = data.getElementsByTagName('Attachment');
    for (; i < a.length; i++) aReturn.push(a[i].firstChild.nodeValue);
    return aReturn;
  });
}
