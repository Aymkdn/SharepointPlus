import views from './views.js'
import ajax from '../utils/ajax.js'
import _buildBodyForSOAP from './_buildBodyForSOAP.js'

/**
  @name $SP().list.view
  @function
  @description Get the view's details (like selected fields, order by, where, ....)

  @param {String} [viewID="The default view"] The view ID or view Name
  @param {Object} [options] (see below)
    @param {Boolean} [options.cache=true] Get the view's info from the cache
  @return {Promise} resolve({DefaultView, Name, ID, Type, Url, OrderBy, Fields, RowLimit, WhereCAML}), reject(error)

  @example
  $SP().list("List Name").view("All Items").then(function(res) {
    for (var i=0; i&lt;res.Fields.length; i++) console.log("Column "+i+": "+res.Fields[i]);
    console.log("And the GUI for this view is :"+res.ID);
  });
*/
export default async function view(viewID, options) {
  try {
    if (!this.listID) return Promise.reject("[SharepointPlus 'view'] the list ID/Name is required.");
    if (!viewID) return Promise.reject("[SharepointPlus 'view'] the view ID/Name is required.");
    // default values
    let list = this.listID, i, found=false;
    options=options||{};
    options.cache=(options.cache===false?false:true);
    if (!this.url) return Promise.reject("[SharepointPlus 'view'] not able to find the URL!"); // we cannot determine the url

    // check if we didn't save this information before
    if (options.cache) {
      for (let c of global._SP_CACHE_SAVEDVIEW) {
        if (c.url===this.url && c.list===list && (c.viewID===viewID || c.viewName===viewID)) {
          found=true;
          return Promise.resolve(c.data);
        }
      }
    }

    // if viewID is not an ID but a name then we need to find the related ID
    if (viewID.charAt(0) !== '{') {
      let _views = await views.call(this);
      for (let v of _views) {
        if (v.Name===viewID) {
          return view.call(this, v.ID);
        }
      }
      return Promise.reject("[SharepointPlus 'view'] not able to find the view called '"+viewID+"' for list '"+this.listID+"' at "+this.url);
    }

    // do the request
    let data = await ajax.call(this, {
      url: this.url + "/_vti_bin/Views.asmx",
      body: _buildBodyForSOAP("GetView", '<listName>'+this.listID+'</listName><viewName>'+viewID+'</viewName>'),
      headers:{'SOAPAction':'http://schemas.microsoft.com/sharepoint/soap/GetView'}
    });

    let node=data.getElementsByTagName('View'), where;
    node = (node.length>0 ? node[0] : null);
    let oReturn = {DefaultView:(node.getAttribute("DefaultView")=="TRUE"), Name:node.getAttribute("DisplayName"), ID:viewID, Type:node.getAttribute("Type"), Url:node.getAttribute("Url"), OrderBy:[], Fields:[], RowLimit:"", WhereCAML:"", Node:node};
    let arr = data.getElementsByTagName('ViewFields')[0].getElementsByTagName('FieldRef');
    // find fields
    for ( i=0; i < arr.length; i++) oReturn.Fields.push(arr[i].getAttribute("Name"));
    // find orderby
    arr = data.getElementsByTagName('OrderBy');
    arr = (arr.length>0 ? arr[0] : null);
    if (arr) {
      arr = arr.getElementsByTagName('FieldRef');
      for (i=0; i<arr.length; i++) oReturn.OrderBy.push(arr[i].getAttribute("Name")+" "+(arr[i].getAttribute("Ascending")==undefined?"ASC":"DESC"));
      oReturn.OrderBy=oReturn.OrderBy.join(",");
    } else oReturn.OrderBy="";
    // find where
    where=data.getElementsByTagName('Where');
    where = (where.length>0 ? where[0] : null);
    if (where) {
      where=where.xml || (new XMLSerializer()).serializeToString(where);
      where=where.match(/<Where [^>]+>(.*)<\/Where>/);
      if(where.length==2) oReturn.WhereCAML=where[1];
    }

    // cache the data
    found=false;
    global._SP_CACHE_SAVEDVIEW.forEach(c => {
      if (c.url===this.url && c.list===list && (c.viewID===viewID || c.viewName===viewID)) {
        c.data=oReturn;
        found=true;
      }
    })
    if (!found) global._SP_CACHE_SAVEDVIEW.push({url:this.url,list:this.listID,data:oReturn,viewID:viewID,viewName:oReturn.Name});
    return Promise.resolve(oReturn);
  } catch(err) {
    return Promise.reject(err);
  }
}
