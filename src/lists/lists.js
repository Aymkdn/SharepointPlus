import getURL from '../utils/getURL'
import ajax from '../utils/ajax.js'
import _buildBodyForSOAP from './_buildBodyForSOAP.js'

/**
  @name $SP().lists
  @function
  @description Get all the lists from the site

  @param {Object} [setup] Options (see below)
    @param {String} [setup.url='current website'] The website url
    @param {Boolean} [setup.cache=true] To get the result from the cache when available
  @return {Promise} resolve({ID, Name, Description, Url, .....}), reject(error)

  @example
  $SP().lists().then(function(lists) {
    for (var i=0; i&lt;lists.length; i++) console.log("List #"+i+": "+lists[i].Name);
  });
*/
export default async function lists(setup) {
  try {
    // default values
    setup = setup || {};
    // if we didn't define the url in the parameters, then we need to find it
    if (!setup.url) {
      setup.url = await getURL.call(this);
    }
    setup.cache=(setup.cache===false?false:true);

    // check cache
    if (setup.cache) {
      for (let c of global._SP_CACHE_SAVEDLISTS) {
        if (c.url===setup.url) {
          return Promise.resolve(c.data);
        }
      }
    }

    // do the request
    let data = await ajax.call(this, {
      url:setup.url + "/_vti_bin/lists.asmx",
      body:_buildBodyForSOAP("GetListCollection", ""),
      headers:{'SOAPAction':'http://schemas.microsoft.com/sharepoint/soap/GetListCollection'}
    })

    let aReturn = [], arr = data.getElementsByTagName('List'), i, j, attributes;
    for (i=0; i < arr.length; i++) {
      aReturn[i]={};
      attributes=arr[i].attributes;
      for (j=attributes.length; j--;) aReturn[i][attributes[j].nodeName]=attributes[j].nodeValue;
      aReturn[i].Url=arr[i].getAttribute("DefaultViewUrl")
      aReturn[i].Name=arr[i].getAttribute("Title")
    }

    // cache
    let found=false;
    if (setup.cache) {
      for (let c of global._SP_CACHE_SAVEDLISTS) {
        if (c.url===setup.url) {
          found=true;
          break;
        }
      }
    }
    if (!found) global._SP_CACHE_SAVEDLISTS.push({url:setup.url,data:aReturn});

    return Promise.resolve(aReturn);
  } catch(err) {
    return Promise.reject(err);
  }
}
