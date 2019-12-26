import getRequestDigest from './getRequestDigest.js'
import nanoajax from './_nanoajax.js'

/**
 * @name $SP().ajax
 * @function
 * @category utils
 * @description Permits to do an Ajax request based on https://github.com/yanatan16/nanoajax for Browsers, and https://github.com/s-KaiNet/sp-request for NodeKJ
 * @param {Object} settings (See options below)
 *   @param {String} settings.url The url to call
 *   @param {String} [settings.method="GET"|"POST"] The HTTP Method ("GET" or "POST" if "body" is provided)
 *   @param {Object} [settings.headers] the headers
 *   @param {String} [settings.body] The data to send to the server
 *   @param {Function} [settings.onprogress=function(event){}] Show the download/upload progress (within browser only)
 *   @param {Function} [settings.getXHR=function(xhr){}] Pass the XMLHttpRequest object as a parameter (within browser only)
 * @return {Promise} resolve(responseText||responseXML), reject({response, statusCode, responseText})
 *
 * @example
 * // for a regular request
 * $SP().ajax({url:'https://my.web.site'}).then(function(data) { console.log(data) })
 *
 * // if the URL contains /_api/ and if "Accept", "Content-Type" or "X-RequestDigest", then they are auto-defined
 *
 * // (in browser) manipulate xhr for specific needs, like reading a remote file (based on https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Sending_and_Receiving_Binary_Data)
 * $SP().ajax({url:'https://url.com/file.png', getXHR:function(xhr){ xhr.responseType = 'arraybuffer' }}).then(function(data) {
 *   // ArrayBuffer result
 *   var blob = new Blob([data], {type: "image/png"});
 *   fileReader.readAsArrayBuffer(blob);
 * })
 *
 * // (in browser) show progress on download, and cancel the download after 5 seconds
 * var _xhr;
 * $SP().ajax({
 *   url:'https://server/files/video.mp4',
 *   getXHR:function(xhr) {
 *     _xhr = xhr;
 *     xhr.responseType = 'arraybuffer'
 *   },
 *   onprogress:function(event) {
 *     console.log(event.loaded+" / "+event.total)
 *   }
 * });
 * setTimeout(function() { _xhr.abort() }, 5000); // abort after 5 seconds
 *
 * // (in Node) to get the Buffer from a remote file we could use `encoding:null`
 * // ATTENTION: it will only work if the file is located on a Sharepoint; for other remote files, please use another library like `request`
 * sp.ajax({url:'https://my.web.site/lib/file.pdf', encoding:null}).then(data => {
 *   // 'data' is a Buffer
 * })
 *
 * // for a CORS/cross-domain request you may need to use 'false' for 'Content-Type'
 * // ATTENTION: it will only work if the file is located on a Sharepoint; for other remote files, please use another library like `request`
 * $SP().ajax({url:'https://my.cross-domain.web/site', headers:{"Content-Type":false}}).then(function(data) { console.log(data) })
 */
export default async function ajax(settings) {
  settings.headers = settings.headers || {};

  try {
    let addRequestDigest = false;
    // add "Accept": "application/json;odata=verbose" for headers if there is "_api/" in URL, except for "_api/web/Url"
    if (settings.url.toLowerCase().indexOf("/_api/") > -1 && settings.url.toLowerCase().indexOf("_api/web/url") === -1) {
      if (typeof settings.headers["Accept"] === "undefined") settings.headers.Accept = "application/json;odata=" + global._SP_JSON_ACCEPT;
      if (typeof settings.headers["Content-Type"] === "undefined") settings.headers["Content-Type"] = "application/json;odata=" + global._SP_JSON_ACCEPT;
      if (typeof settings.headers["X-RequestDigest"] === "undefined" && settings.url.indexOf("contextinfo") === -1) {
        addRequestDigest = true;
      }
    }
    // if "_vti_bin/client.svc/ProcessQuery" we want to add the RequestDigest
    if (settings.url.toLowerCase().indexOf("_vti_bin/client.svc/processquery") > -1 && typeof settings.headers["X-RequestDigest"] === "undefined") {
      addRequestDigest = true
    }
    if (addRequestDigest) {
      // we need to retrieve the Request Digest
      let requestDigest = await getRequestDigest.call(this, {
        url: settings.url.toLowerCase().split("_api")[0]
      })
      settings.headers["X-RequestDigest"] = requestDigest;
      return ajax.call(this, settings)
    }
    // use XML as the default content type
    if (typeof settings.headers["Content-Type"] === "undefined") settings.headers["Content-Type"] = "text/xml; charset=utf-8";

    // check if it's NodeJS
    if (global._SP_ISBROWSER) {
      // IE will return an "400 Bad Request" if it's a POST with no body
      if (settings.method === "POST" && !settings.body) settings.body = "";
      // eslint-disable-next-line
      let ret = await new Promise(prom_res => {
        nanoajax(settings, (code, responseText, request) => {
          prom_res({
            code,
            responseText,
            request
          })
        })
      })
      let code = ret.code,
        responseText = ret.responseText,
        request = ret.request;
      if (code >= 200 && code < 300 && responseText !== "Error" && responseText !== "Abort" && responseText !== "Timeout") {
        var body = (!request.responseType || request.responseType === 'document' ? request.responseXML || request.responseText : responseText);
        if ((request.getResponseHeader("Content-Type") || "").indexOf("/json") > -1 && typeof body === "string") body = JSON.parse(body); // parse JSON
        return Promise.resolve(body);
      } else {
        // check if it's an issue with validation code
        if (code == 403 && responseText.indexOf("The security validation for this page is invalid and might be corrupted. Please use your web browser's Back button to try your operation again.") > -1) {
          // then we retry
          delete settings.headers["X-RequestDigest"];
          let requestDigest = await getRequestDigest({
            cache: false
          })
          settings.headers["X-RequestDigest"] = requestDigest;
          return ajax.call(this, settings);
        } else {
          return Promise.reject({
            statusCode: code,
            responseText: responseText,
            request: request
          });
        }
      }
    } else {
      // we use the module 'sp-request' from https://github.com/s-KaiNet/sp-request
      if (this.module_sprequest === null) {
        if (this.credentialOptions === null) {
          throw "[SharepointPlus 'ajax'] please use `$SP().auth()` to provide your credentials first";
        }
        this.module_sprequest = require('sp-request').create(this.credentialOptions);
      }

      if (settings.headers['Content-Type'] && settings.headers['Content-Type'].indexOf('xml') > -1) settings.headers['Accept'] = 'application/xml, text/xml, */*; q=0.01';
      if (!settings.method) settings.method = (typeof settings.body !== "undefined" ? "POST" : "GET");
      if (settings.method.toUpperCase() === "POST" && typeof settings.body !== "undefined") settings.headers['Content-Length'] = Buffer.byteLength(settings.body);
      // add User Agent
      settings.headers['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:52.0) Gecko/20100101 Firefox/52.0';
      var opts = {
        json: false,
        method: settings.method,
        strictSSL: false,
        headers: settings.headers,
        jar: true
      };
      if (settings.body) opts.body = settings.body;
      if (this.proxyweb) opts.proxy = this.proxyweb;
      // looks like the Content-Length creates some issues
      if (opts.headers) delete opts.headers["Content-Length"];
      // check if we have some other parameters
      for (var stg in settings) {
        if (Object.prototype.hasOwnProperty.call(settings, stg) && !opts[stg]) opts[stg] = settings[stg];
      }

      let response = await this.module_sprequest(settings.url, opts);
      if (response.statusCode === 200 && response.statusMessage !== "Error" && response.statusMessage !== "Abort" && response.statusMessage !== "Timeout") {
        // check if it's XML, then parse it
        if ((response.headers['content-type'] || "").indexOf('xml') > -1 && response.body.slice(0, 5) === '<?xml') {
          var DOMParser = require('xmldom').DOMParser;
          var result = new DOMParser().parseFromString(response.body);
          return Promise.resolve(result);
        } else {
          if ((response.headers['content-type'] || "").indexOf('json') > -1 && typeof response.body === "string") response.body = JSON.parse(response.body)
          return Promise.resolve(response.body);
        }
      } else {
        return Promise.reject({
          response: response,
          statusCode: response.statusCode,
          responseText: response.body
        });
      }

    }

  } catch (err) {
    return Promise.reject({
      error: err,
      statusCode: err.statusCode,
      response: err.response,
      responseText: (err.response ? err.response.body : '')
    });
  }
}
