import getURL from '../utils/getURL.js'
import ajax from '../utils/ajax.js'
import _buildBodyForSOAP from '../lists/_buildBodyForSOAP.js'

/**
  @name $SP().checkin
  @function
  @category files
  @description Checkin a file

  @param {Object} [setup] Options (see below)
    @param {String} setup.destination The full path to the file to check in
    @param {String} [setup.type='MajorCheckIn'] It can be 'MinorCheckIn' (incremented as a minor version), 'MajorCheckIn' (incremented as a major version), or 'OverwriteCheckIn' (overwrite the file)
    @param {String} [setup.comments=""] The comments related to the check in
    @param {String} [setup.url='current website'] The website url
  @return {Promise} resolve() then checked in is done, reject(error) otherwise

  @example
  // with Promise
  $SP().checkin({
    destination:"http://mysite/Shared Documents/myfile.txt",
    comments:"Automatic check in with SharepointPlus"
  }).then(function() {
    alert("Done");
  }).catch(function(error) {
    alert("Check in failed")
  })
*/
export default async function checkin(setup) {
  // default values
  try {
    setup = setup || {};
    if (!setup.destination) throw "[SharepointPlus 'checkin'] the file destination path is required.";
    if (this.url && !setup.url) setup.url=this.url;
    if (!setup.url) {
      setup.url = await getURL.call(this);
    }
    setup.comments = (setup.comments || "").replace(/&/g,"&amp;");
    let type = 1;
    switch(setup.type) {
      case "MinorCheckIn": {
        type=0;
        break;
      }
      case "OverwriteCheckIn": {
        type=2;
        break;
      }
    }

    let data = await ajax.call(this, {
      url: setup.url + "/_vti_bin/Lists.asmx",
      body:_buildBodyForSOAP("CheckInFile", '<pageUrl>'+setup.destination+'</pageUrl><comment>'+setup.comments+'</comment><CheckinType>'+type+'</CheckinType>'),
      headers:{'SOAPAction':'http://schemas.microsoft.com/sharepoint/soap/CheckInFile'}
    })

    let res = data.getElementsByTagName('CheckInFileResult');
    res = (res.length>0 ? res[0] : null);
    if (res && res.firstChild.nodeValue != "true") {
      return Promise.reject(res);
    } else {
      return Promise.resolve();
    }
  } catch(err) {
    return Promise.reject(err);
  }
}
