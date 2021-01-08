import ajax from '../utils/ajax.js'
import _buildBodyForSOAP from '../lists/_buildBodyForSOAP.js'
import getURL from '../utils/getURL.js'

/**
  @name $SP().people
  @function
  @category people
  @description Find the user details like manager, email, ...

  @param {String} [username] The username (e.g. domain\\john_doe)
  @param {Object} [setup] Options (see below)
    @param {String} [setup.url='current website'] The website url
  @return {Function} resolve(people), reject(error)

  @example
  $SP().people("john_doe",{url:"http://my.si.te/subdir/"}).then(function(people) {
    for (var i=0; i &lt; people.length; i++) console.log(people[i]+" = "+people[people[i]]);
  }, function(err) {
    console.log("Err => ",err)
  });
*/
export default async function people(username, setup) {
  try {
    if (arguments.length===1 && typeof username === "object") { setup=username; username="" }
    // default values
    username = username || "";
    setup = setup || {};
    if (!setup.url) {
      setup.url = await getURL.call(this);
    }

    let data = await ajax.call(this, {
      url:setup.url + "/_vti_bin/UserProfileService.asmx",
      body:_buildBodyForSOAP("GetUserProfileByName", "<AccountName>"+username+"</AccountName>", "http://microsoft.com/webservices/SharePointPortalServer/UserProfileService"),
      headers:{'SOAPAction':'http://microsoft.com/webservices/SharePointPortalServer/UserProfileService/GetUserProfileByName'}
    })

    let aResult=[], name, value;
    // get the details
    data=data.getElementsByTagName('PropertyData');
    for (let i=0,len=data.length; i<len; i++) {
      name=data[i].getElementsByTagName("Name")[0].firstChild.nodeValue;
      value=data[i].getElementsByTagName("Value");
      value = (value.length>0 ? value[0] : null);
      if (value&&value.firstChild) value=value.firstChild.nodeValue;
      else value="No Value";
      aResult.push(name);
      aResult[name]=value;
    }

    return Promise.resolve(aResult);
  } catch(err) {
    return Promise.reject(err);
  }
}
