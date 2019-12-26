import ajax from '../utils/ajax.js'
import _buildBodyForSOAP from './_buildBodyForSOAP.js'

/**
  @name $SP().list.getContentTypes
  @function
  @description Get the Content Types for the list (returns Name, ID and Description)

  @param {Object} [options]
    @param {Boolean} [options.cache=true] Do we want to use the cache on recall for this function?
  @return {Promise} resolve(contentTypes), reject(error)

  @example
  $SP().list("List Name").getContentTypes().then(function(contentTypes) {
    for (var i=0; i&lt;contentTypes.length; i++) console.log(contentTypes[i].Name, contentTypes[i].ID, contentTypes[i].Description);
  });
*/
export default function getContentTypes(options) {
  if (!this.listID) throw "[SharepointPlus 'getContentTypes'] the list ID/name is required.";
  // default values
  if (!this.url) throw "[SharepointPlus 'getContentTypes'] not able to find the URL!"; // we cannot determine the url

  // check the Cache
  options=options||{cache:true};
  if (options.cache) {
    for (let i=0; i<global._SP_CACHE_CONTENTTYPES.length; i++) {
      if (global._SP_CACHE_CONTENTTYPES[i].list === this.listID && global._SP_CACHE_CONTENTTYPES[i].url === this.url) {
        return Promise.resolve(global._SP_CACHE_CONTENTTYPES[i].contentTypes);
      }
    }
  }

  // do the request
  return ajax.call(this, {
    url: this.url + "/_vti_bin/lists.asmx",
    body: _buildBodyForSOAP("GetListContentTypes", '<listName>'+this.listID+'</listName>'),
    headers:{'SOAPAction':'http://schemas.microsoft.com/sharepoint/soap/GetListContentTypes'}
  })
  .then(data => {
    let arr = data.getElementsByTagName('ContentType'), ID, i=0, aReturn = [];
    for (; i < arr.length; i++) {
      ID = arr[i].getAttribute("ID");
      if (ID) {
        aReturn.push({
          "ID":ID,
          "Name":arr[i].getAttribute("Name"),
          "Description":arr[i].getAttribute("Description")
        });
      }
    }
    // we cache the result
    global._SP_CACHE_CONTENTTYPES.push({"list":this.listID, "url":this.url, "contentTypes":aReturn});
    return aReturn;
  })
}
