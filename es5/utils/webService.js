import _regeneratorRuntime from "@babel/runtime-corejs3/regenerator";
import _Promise from "@babel/runtime-corejs3/core-js-stable/promise";
import _asyncToGenerator from "@babel/runtime-corejs3/helpers/esm/asyncToGenerator";
import ajax from './ajax.js';
import getURL from './getURL.js';
import _buildBodyForSOAP from '../lists/_buildBodyForSOAP.js';
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

export default function webService(_x) {
  return _webService.apply(this, arguments);
}

function _webService() {
  _webService = _asyncToGenerator(
  /*#__PURE__*/
  _regeneratorRuntime.mark(function _callee(options) {
    var bodyContent, prop, params, url;
    return _regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            bodyContent = "";

            if (options.service) {
              _context.next = 4;
              break;
            }

            throw "Error 'webService': the option 'service' is required";

          case 4:
            if (options.operation) {
              _context.next = 6;
              break;
            }

            throw "Error 'webService': the option 'operation' is required";

          case 6:
            options.webURL = options.webURL || this.url; // if we didn't define the url in the parameters, then we need to find it

            if (options.webURL) {
              _context.next = 13;
              break;
            }

            _context.next = 10;
            return getURL();

          case 10:
            url = _context.sent;
            options.webURL = url;
            return _context.abrupt("return", webService.call(this, options));

          case 13:
            options.properties = options.properties || {};

            for (prop in options.properties) {
              if (Object.prototype.hasOwnProperty.call(options.properties, prop)) {
                bodyContent += '<' + prop + '>' + options.properties[prop] + '</' + prop + '>';
              }
            }

            options.soapAction = options.soapAction === false ? false : true;
            options.soapURL = options.soapURL || 'http://schemas.microsoft.com/sharepoint/soap/';
            if (!options.soapAction) options.soapURL = options.soapURL.replace(/\/$/, "");
            bodyContent = _buildBodyForSOAP(options.operation, bodyContent, options.soapURL);
            params = {
              url: options.webURL + "/_vti_bin/" + options.service + ".asmx",
              body: bodyContent
            };
            if (options.soapAction) params.headers = {
              'SOAPAction': options.soapURL + options.operation
            };
            return _context.abrupt("return", ajax.call(this, params));

          case 24:
            _context.prev = 24;
            _context.t0 = _context["catch"](0);
            return _context.abrupt("return", _Promise.reject(_context.t0));

          case 27:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this, [[0, 24]]);
  }));
  return _webService.apply(this, arguments);
}