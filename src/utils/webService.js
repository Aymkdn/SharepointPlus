import ajax from './ajax.js'
import getURL from './getURL.js'
import _buildBodyForSOAP from '../lists/_buildBodyForSOAP.js'

/**
 * @name $SP().webService
 * @function
 * @category utils
 * @description Permits to directly deal with a WebService (similar to SPServices http://sympmarc.github.io/SPServices/core/web-services.html)
 * @param  {Object} options
 *   @param {String} operation The method name to use (e.g. UpdateList, GetList, ....)
 *   @param {String} service The name of the service (Lists, Versions, PublishedLinksService, ...) it's the ".asmx" name without the extension
 *   @param {Object} [properties={}] The properties to call
 *   @param {String} [webURL=current website] The URL of the website
 *   @param {String|Boolean} [soapURL='http://schemas.microsoft.com/sharepoint/soap/'] If the SOAP url is not the default one, then you can customize it... it will be send in the request's headers as "SOAPAction"
 *   @param {Boolean} [soapAction=true] Some web services don't want the "SOAPAction" header
 * @return {Promise} resolve(responseBody), reject(see $SP().ajax())
 *
 * @example
 * $SP().webService({ // http://sympmarc.github.io/SPServices/core/web-services/Lists/UpdateList.html
 *   service:"Lists",
 *   operation:"Updatelist",
 *   webURL:"http://what.ever/"
 *   properties:{
 *     listName:"Test",
 *     listProperties:"...",
 *     newFields:"...",
 *     updateFields:"...",
 *     deleteFields:"...",
 *     listVersion:"..."
 *   }
 * }).then(function(response) {
 *   // do something with the response
 * }, function(error) {
 *   console.log("Error => ",error)
 * });
 *
 * // to remove a person from a group
 * $SP().webService({
 *   service:"UserGroup",
 *   operation:"RemoveUserFromGroup",
 *   soapURL:"http://schemas.microsoft.com/sharepoint/soap/directory/",
 *   properties:{
 *     groupName:"Group",
 *     userLoginName:"domain\\user"
 *   }
 * }).then(function(response) {
 *   console.log("OK => ",response)
 * }, function(error) { console.log("Error => ",error) });
 */
export default async function webService(options) {
  try {
    var bodyContent="", prop, params;
    if (!options.service) throw "Error 'webService': the option 'service' is required";
    if (!options.operation) throw "Error 'webService': the option 'operation' is required";
    options.webURL = options.webURL || this.url;
    // if we didn't define the url in the parameters, then we need to find it
    if (!options.webURL) {
      let url = await getURL();
      options.webURL=url;
      return webService.call(this, options);
    }
    options.properties = options.properties || {};
    for (prop in options.properties) {
      if (Object.prototype.hasOwnProperty.call(options.properties, prop)) {
        bodyContent += '<'+prop+'>'+options.properties[prop]+'</'+prop+'>'
      }
    }
    options.soapAction=(options.soapAction===false?false:true);
    options.soapURL=options.soapURL||'http://schemas.microsoft.com/sharepoint/soap/';
    if (!options.soapAction) options.soapURL=options.soapURL.replace(/\/$/,"");
    bodyContent = _buildBodyForSOAP(options.operation, bodyContent, options.soapURL);
    params={
      url: options.webURL+"/_vti_bin/"+options.service+".asmx",
      body: bodyContent
    };
    if (options.soapAction) params.headers={'SOAPAction':options.soapURL+options.operation };

    return ajax.call(this, params);
  } catch(err) {
    return Promise.reject(err);
  }
}
