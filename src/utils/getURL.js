import ajax from './ajax.js'
import _buildBodyForSOAP from '../lists/_buildBodyForSOAP.js'

/**
  @name $SP().getURL
  @function
  @category utils
  @description Return the current base URL website
  @return {Promise} resolve(The current base URL website), reject(error)
*/
export default async function getURL() {
  if (typeof this.url === "undefined") {
    // try to build it
    if (typeof window.L_Menu_BaseUrl!=="undefined") {
      return Promise.resolve(checkURL(window.L_Menu_BaseUrl)); // eslint-disable-line
    } else {
      // eslint-disable-next-line
      if (typeof window._spPageContextInfo !== "undefined" && typeof window._spPageContextInfo.webServerRelativeUrl !== "undefined") {
        return Promise.resolve(checkURL(window._spPageContextInfo.webServerRelativeUrl)); // eslint-disable-line
      } else {
        // we'll use the Webs.asmx service to find the base URL
        try {
          let data = await ajax.call(this, {
            url: "/_vti_bin/Webs.asmx",
            body: _buildBodyForSOAP("WebUrlFromPageUrl", "<pageUrl>"+window.location.href.replace(/&/g,"&amp;")+"</pageUrl>"),
          })
          let result=data.getElementsByTagName('WebUrlFromPageUrlResult');
          if (result.length) {
            return Promise.resolve(checkURL(result[0].firstChild.nodeValue.toLowerCase()));
          } else {
            return Promise.reject("[SharepointPlus 'getURL'] Unable to retrieve the URL")
          }
        } catch(err) {
          return Promise.reject(err);
        }
      }
    }
  } else return Promise.resolve(checkURL(this.url));
}

// when at the root of the site, we could have an empty URL, so we return the current location
function checkURL(u) {
  return (u==="" || u==="/" ? window.location.protocol+"//"+window.location.host+"/" : u);
}
