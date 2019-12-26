import ajax from '../utils/ajax.js'
import _buildBodyForSOAP from './_buildBodyForSOAP.js'
import getContentTypes from './getContentTypes.js'

/**
  @name $SP().list.getContentTypeInfo
  @function
  @description Get the Content Type Info for a Content Type into the list

  @param {String} contentType The Name or the ID (from $SP().list.getContentTypes) of the Content Type
  @param {Object} [options]
    @param {Boolean} [options.cache=true] Do we use the cache?
  @return {Promise} resolve(fields), reject(error)

  @example
  $SP().list("List Name").getContentTypeInfo("Item").then(function(fields) {
    for (var i=0; i&lt;fields.length; i++) console.log(fields[i]["DisplayName"]+ ": "+fields[i]["Description"]);
  });

  $SP().list("List Name").getContentTypeInfo("0x01009C5212B2D8FF564EBE4873A01C57D0F9001").then(function(fields) {
    for (var i=0; i&lt;fields.length; i++) console.log(fields[i]["DisplayName"]+ ": "+fields[i]["Description"]);
  });
*/
export default async function getContentTypeInfo(contentType, options) {
  if (!this.listID) throw "[SharepointPlus 'getContentTypeInfo'] the list ID/Name is required.";
  if (arguments.length >= 1 && typeof contentType !== "string") throw "[SharepointPlus 'getContentTypeInfo'] the Content Type Name/ID is required.";
  // default values
  if (!this.url) throw "[SharepointPlus 'getContentTypeInfo'] not able to find the URL!"; // we cannot determine the url
  options=options||{cache:true}

  // look at the cache
  if (options.cache) {
    for (let i=0; i<global._SP_CACHE_CONTENTTYPE.length; i++) {
      if (global._SP_CACHE_CONTENTTYPE[i].list === this.listID && global._SP_CACHE_CONTENTTYPE[i].url === this.url && global._SP_CACHE_CONTENTTYPE[i].contentType === contentType) {
        return Promise.resolve(global._SP_CACHE_CONTENTTYPE[i].info);
      }
    }
  }

  // do we have a Content Type Name or ID ?
  if (contentType.slice(0,2) !== "0x") {
    // it's a Name so get the related ID using $SP.list.getContentTypes
    let types = await getContentTypes.call(this, options);
    for (let i=types.length; i--;) {
      if (types[i]["Name"]===contentType) {
        return getContentTypeInfo.call(this, types[i]["ID"], options)
      }
    }
    throw "[SharepointPlus 'getContentTypeInfo'] not able to find the Content Type called '"+contentType+"' at "+this.url;
  }

  // do the request
  let data = await ajax.call(this, {
    url: this.url + "/_vti_bin/lists.asmx",
    body: _buildBodyForSOAP("GetListContentType", '<listName>'+this.listID+'</listName><contentTypeId>'+contentType+'</contentTypeId>'),
    headers:{'SOAPAction':'http://schemas.microsoft.com/sharepoint/soap/GetListContentType'}
  });

  let aReturn = [], i, j, a, r, k, q, arr = data.getElementsByTagName('Field'), index = 0, aIndex, attributes, attrName, lenDefault, attrValue, nodeDefault;
  for (i=0; i < arr.length; i++) {
    if (arr[i].getAttribute("ID")) {
      aReturn[index] = [];
      aIndex=aReturn[index];
      attributes=arr[i].attributes;
      for (j=attributes.length; j--;) {
        attrName=attributes[j].nodeName;
        attrValue=attributes[j].nodeValue;
        if (attrName==="Type") {
          switch (attrValue) {
            case "Choice":
            case "MultiChoice": {
              aIndex["FillInChoice"] = arr[i].getAttribute("FillInChoice");
              a=arr[i].getElementsByTagName("CHOICE");
              r=[];
              for(k=0; k<a.length; k++) r.push(a[k].firstChild.nodeValue);
              aIndex["Choices"]=r;
              break;
            }
            case "Lookup":
            case "LookupMulti":
              aIndex["Choices"]={list:arr[i].getAttribute("List"),field:arr[i].getAttribute("ShowField")};
              break;
            default:
              aIndex["Choices"] = [];
          }
        }
        aIndex[attrName]= attrValue;
      }
      // find the default values
      lenDefault=arr[i].getElementsByTagName("Default").length;
      if (lenDefault>0) {
        nodeDefault=arr[i].getElementsByTagName("Default");
        aReturn[index]["DefaultValue"]=[];
        for (q=0; q<lenDefault; q++) nodeDefault[q].firstChild && aReturn[index]["DefaultValue"].push(nodeDefault[q].firstChild.nodeValue);
        if (lenDefault===1) aReturn[index]["DefaultValue"]=aReturn[index]["DefaultValue"][0];
      } else aReturn[index]["DefaultValue"]=null;
      index++;
    }
  }
  // we cache the result
  global._SP_CACHE_CONTENTTYPE.push({"list":this.listID, "url":this.url, "contentType":contentType, "info":aReturn});
  return Promise.resolve(aReturn);
}
