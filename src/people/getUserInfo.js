import ajax from '../utils/ajax.js'
import _buildBodyForSOAP from '../lists/_buildBodyForSOAP.js'
import getURL from '../utils/getURL.js'

/**
  @name $SP().getUserInfo
  @function
  @category people
  @description Find the User ID, work email, and preferred name for the specified username (this is useful because of the User ID that can then be used for filtering a list)

  @param {String} username That must be "domain\\login" for Sharepoint 2010, or something like "i:0#.w|domain\\login" for Sharepoint 2013
  @param {Object} [setup] Options (see below)
    @param {String} [setup.url='current website'] The website url
  @return {Promise} resolve({ID,Sid,Name,LoginName,Email,Notes,IsSiteAdmin,IsDomainGroup,Flags}), reject(error)

  @example
  $SP().getUserInfo("domain\\john_doe",{url:"http://my.si.te/subdir/"}).then(function(info) {
    alert("User ID = "+info.ID)
  }, function(error) {
    console.log(error)
  });
*/
export default async function getUserInfo(username, setup) {
  try {
    if (typeof username !== "string") throw "[SharepointPlus 'getUserInfo'] the username is required.";
    // default values
    setup = setup || {};
    if (!setup.url) {
      setup.url = await getURL.call(this);
    }

    let data = await ajax.call(this, {
      url:setup.url + "/_vti_bin/usergroup.asmx",
      body:_buildBodyForSOAP("GetUserInfo", '<userLoginName>'+username+'</userLoginName>', "http://schemas.microsoft.com/sharepoint/soap/directory/")
    })
    // get the details
    data=data.getElementsByTagName('User');
    if (data.length===0) {
      return Promise.reject("[SharepointPlus 'getUserInfo'] nothing returned?!")
    } else {
      return Promise.resolve({ID:data[0].getAttribute("ID"),Sid:data[0].getAttribute("Sid"),Name:data[0].getAttribute("Name"),LoginName:data[0].getAttribute("LoginName"),Email:data[0].getAttribute("Email"),Notes:data[0].getAttribute("Notes"),IsSiteAdmin:data[0].getAttribute("IsSiteAdmin"),IsDomainGroup:data[0].getAttribute("IsDomainGroup"),Flags:data[0].getAttribute("Flags")})
    }
  } catch(err) {
    return Promise.reject(err);
  }
}
