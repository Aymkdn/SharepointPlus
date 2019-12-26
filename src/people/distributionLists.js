import ajax from '../utils/ajax.js'
import _buildBodyForSOAP from '../lists/_buildBodyForSOAP.js'
import getURL from '../utils/getURL.js'

/**
  @name $SP().distributionLists
  @function
  @category people
  @description Find the distribution lists where the specified user is member of

  @param {String} username The username with or without the domain ("domain\\login" for Sharepoint 2010, or e.g. "i:0#.w|domain\\login" for Sharepoint 2013)
  @param {Object} [setup] Options (see below)
    @param {String} [setup.url='current website'] The website url
    @param {Boolean} [setup.cache=true] Cache the response from the server
  @return {Promise} resolve(mailings), reject(error)

  @example
  $SP().distributionLists("mydomain\\john_doe",{url:"http://my.si.te/subdir/"}).then(function(mailing) {
    for (var i=0; i &lt; mailing.length; i++) console.log(mailing[i]); // -> {SourceReference: "cn=listname,ou=distribution lists,ou=rainbow,dc=com", DisplayName:"listname", MailNickname:"List Name", Url:"mailto:listname@rainbow.com"}
  });
*/
export default async function distributionLists(username, setup) {
  try {
    if (!username) throw "[SharepointPlus 'distributionLists'] the username is required.";
    // default values
    setup = setup || {};
    if (!setup.url) {
      setup.url = await getURL.call(this);
    }

    username = username.toLowerCase();
    setup.url=setup.url.toLowerCase();
    setup.cache = (setup.cache === false ? false : true)
    // check the cache
    // [ {user:"username", url:"url", data:"the distribution lists"}, ... ]
    if (setup.cache) {
      for (let c of global._SP_CACHE_DISTRIBUTIONLISTS) {
        if (c.user === username && c.url === setup.url) {
          return Promise.resolve(c.data);
        }
      }
    }

    // send the request
    let data = await ajax.call(this, {
      url:setup.url + "/_vti_bin/UserProfileService.asmx",
      body:_buildBodyForSOAP("GetCommonMemberships", "<accountName>"+username+"</accountName>", "http://microsoft.com/webservices/SharePointPortalServer/UserProfileService"),
      headers:{'SOAPAction':'http://microsoft.com/webservices/SharePointPortalServer/UserProfileService/GetUserMemberships'}
    })

    let aResult=[];
    // get the details
    data=data.getElementsByTagName('MembershipData');
    for (let i=0,len=data.length; i<len; i++) {
      if (data[i].getElementsByTagName("Source")[0].firstChild.nodeValue === "DistributionList") {
        aResult.push({"SourceReference": data[i].getElementsByTagName("SourceReference")[0].firstChild.nodeValue, "DisplayName":data[i].getElementsByTagName("DisplayName")[0].firstChild.nodeValue, "MailNickname":data[i].getElementsByTagName("MailNickname")[0].firstChild.nodeValue, "Url":data[i].getElementsByTagName("Url")[0].firstChild.nodeValue});
      }
    }

    // cache the result
    let found=false;
    for (let c of global._SP_CACHE_DISTRIBUTIONLISTS) {
      if (c.user === username && c.url === setup.url) {
        c.data=aResult;
        found=true;
        break;
      }
    }
    if (!found) global._SP_CACHE_DISTRIBUTIONLISTS.push({user:username,url:setup.url,data:aResult});

    return Promise.resolve(aResult);
  } catch(err) {
    return Promise.reject(err);
  }
}
