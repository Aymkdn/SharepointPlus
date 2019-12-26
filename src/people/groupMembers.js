import ajax from '../utils/ajax.js'
import _buildBodyForSOAP from '../lists/_buildBodyForSOAP.js'
import getURL from '../utils/getURL.js'
import _cleanString from '../utils/_cleanString.js'

/**
  @name $SP().groupMembers
  @function
  @category people
  @description Find the members of a Sharepoint group

  @param {String} groupname Name of the group
  @param {Object} [setup] Options (see below)
    @param {String} [setup.url='current website'] The website url
    @param {Boolean} [setup.cache=true] By default the function will cache the group members (so if you call several times it will use the cache)
  @return {Promise} resolve(members), reject(error)

  @example
  $SP().groupMembers("my group").then(function(members) {
    for (var i=0; i &lt; members.length; i++) console.log(members[i]); // -> {ID:"1234", Name:"Doe, John", LoginName:"mydomain\john_doe", Email:"john_doe@rainbow.com"}
  });
*/
export default async function groupMembers(groupname, setup) {
  try {
    if (!groupname) throw "[SharepointPlus 'groupMembers'] the groupname is required.";
    // default values
    setup = setup || {};
    setup.cache = (setup.cache === false ? false : true);
    if (!setup.url) {
      setup.url = await getURL.call(this);
    }

    groupname=groupname.toLowerCase();
    setup.url=setup.url.toLowerCase();
    // check the cache
    // [ {user:"username", url:"url", data:"the distribution lists"}, ... ]
    if (setup.cache) {
      for (let c of global._SP_CACHE_GROUPMEMBERS) {
        if (c.group === groupname && c.url === setup.url) {
          return Promise.resolve(c.data);
        }
      }
    }

    // send the request
    let data = await ajax.call(this, {
      url:setup.url + "/_vti_bin/usergroup.asmx",
      body:_buildBodyForSOAP("GetUserCollectionFromGroup", "<groupName>"+_cleanString(groupname)+"</groupName>", "http://schemas.microsoft.com/sharepoint/soap/directory/"),
      headers:{'SOAPAction':'http://schemas.microsoft.com/sharepoint/soap/directory/GetUserCollectionFromGroup'}
    })
    let aResult=[];
    // get the details
    data=data.getElementsByTagName('User');
    for (let i=0,len=data.length; i<len; i++) {
      aResult.push({"ID": data[i].getAttribute("ID"), "Name":data[i].getAttribute("Name"), "LoginName":data[i].getAttribute("LoginName"), "Email":data[i].getAttribute("Email")});
    }
    // cache the result
    let found=false;
    for (let c of global._SP_CACHE_GROUPMEMBERS) {
      if (c.group === groupname && c.url === setup.url) {
        c.data=aResult;
        found=true;
        break;
      }
    }
    if (!found) global._SP_CACHE_GROUPMEMBERS.push({group:groupname,url:setup.url,data:aResult});

    return Promise.resolve(aResult);
  } catch(err) {
    return Promise.reject(err);
  }
}
