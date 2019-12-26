import ajax from '../utils/ajax.js'
import _buildBodyForSOAP from '../lists/_buildBodyForSOAP.js'
import getURL from '../utils/getURL.js'

/**
  @name $SP().usergroups
  @function
  @category people
  @description Find the Sharepoint groups where the specified user is member of

  @param {String} username The username with the domain ("domain\\login" for Sharepoint 2010, or e.g. "i:0#.w|domain\\login" for Sharepoint 2013)
  @param {Object} [setup] Options (see below)
    @param {String} [setup.url='current website'] The website url
    @param {Boolean} [setup.cache=true] Keep a cache of the result
  @return {Promise} result(groups), reject(error)

  @example
  $SP().usergroups("mydomain\\john_doe",{url:"http://my.si.te/subdir/"}).then(function(groups) {
    for (var i=0; i &lt; groups.length; i++) console.log(groups[i]); // -> "Roadmap Admin", "Global Viewers", ...
  });
*/
export default async function usergroups(username, setup) {
   try {
    if (!username) throw "[SharepointPlus 'usergroups']: the username is required.";
    setup = setup || {};
    setup.cache = (setup.cache === false ? false : true);
    if (!setup.url) {
      setup.url = await getURL.call(this);
    }

    username=username.toLowerCase();
    setup.url=setup.url.toLowerCase();
    // check the cache
    // [ {user:"username", url:"url", data:"the groups"}, ... ]
    if (setup.cache) {
      for (let c of global._SP_CACHE_USERGROUPS) {
        if (c.user === username && c.url === setup.url) {
          return Promise.resolve(c.data);
        }
      }
    }

    // send the request
    let data = await ajax.call(this, {
      url:setup.url + "/_vti_bin/usergroup.asmx",
      body:_buildBodyForSOAP("GetGroupCollectionFromUser", "<userLoginName>"+username+"</userLoginName>", "http://schemas.microsoft.com/sharepoint/soap/directory/"),
      headers:{'SOAPAction':'http://schemas.microsoft.com/sharepoint/soap/directory/GetGroupCollectionFromUser'}
    })

    let aResult=[];
    // get the details
    data=data.getElementsByTagName('Group');
    for (let i=0,len=data.length; i<len; i++) aResult.push(data[i].getAttribute("Name"));

    // cache the result
    let found=false;
    for (let c of global._SP_CACHE_USERGROUPS) {
      if (c.user === username && c.url === setup.url) {
        c.data=aResult;
        found=true;
        break;
      }
    }
    if (!found) global._SP_CACHE_USERGROUPS.push({user:username,url:setup.url,data:aResult});

    return Promise.resolve(aResult);
  } catch(err) {
    return Promise.reject(err);
  }
}
