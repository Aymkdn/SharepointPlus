import ajax from '../utils/ajax.js'
import _buildBodyForSOAP from './_buildBodyForSOAP.js'

/**
  @name $SP().list.views
  @function
  @description Get the views' info for a List

  @param {Hash} [options]
    @param {Boolean} [options.cache=true] Get the info from the cache
  @return {Promise} resolve({DefaultView, Name, ID, Type, Url}), reject(error)

  @example
  $SP().list("My List").views().then(function(view) {
    for (var i=0; i&lt;view.length; i++) {
      console.log("View #"+i+": "+view[i].Name);
    }
  });
*/
export default async function views(options) {
  try {
    // check if we need to queue it
    if (!this.listID) throw "[SharepointPlus 'views'] the list ID/Name is required.";
    options = options||{};
    options.cache = (options.cache === false ? false : true);

    // default values
    if (!this.url) throw "[SharepointPlus 'views'] not able to find the URL!"; // we cannot determine the url

    // check the cache
    let found=false;
    if (options.cache) {
      for (let c of global._SP_CACHE_SAVEDVIEWS) {
        if (c.url===this.url && c.listID === this.listID) {
          found=true;
          return Promise.resolve(c.data);
        }
      }
    }

    // do the request
    let data = await ajax.call(this, {
      url: this.url + "/_vti_bin/Views.asmx",
      body: _buildBodyForSOAP("GetViewCollection", '<listName>'+this.listID+'</listName>'),
      headers:{'SOAPAction':'http://schemas.microsoft.com/sharepoint/soap/GetViewCollection'}
    })

    let aReturn = [], arr = data.getElementsByTagName('View'), i=0;
    for (; i < arr.length; i++) {
      aReturn[i] = {
        ID: arr[i].getAttribute("Name"),
        Name: arr[i].getAttribute("DisplayName"),
        Url: arr[i].getAttribute("Url"),
        DefaultView:(arr[i].getAttribute("DefaultView")=="TRUE"),
        Type:arr[i].getAttribute("Type"),
        Node: arr[i]
      }
    }

    // cache
    global._SP_CACHE_SAVEDVIEWS.forEach(c => {
      if (c.url===this.url && c.listID === this.listID) {
        c.data=aReturn;
        found=true;
      }
    })

    if (!found) global._SP_CACHE_SAVEDVIEWS.push({url:this.url,listID:this.listID,data:aReturn});
    return Promise.resolve(aReturn);
  } catch(err) {
    return Promise.reject(err);
  }
}
