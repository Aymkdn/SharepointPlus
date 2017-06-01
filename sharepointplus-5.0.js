/*!
 * SharepointPlus v5.0
 * Copyright 2017, Aymeric (@aymkdn)
 * Contact: http://kodono.info
 * Documentation: http://aymkdn.github.com/SharepointPlus/
 * License: LGPL-3 (http://aymkdn.github.com/SharepointPlus/license.md)
 */

/**
 @name SPIsArray
 @function
 @category utils
 @description Return true when the arg is an array
*/
var SPIsArray = function(v) { return (Object.prototype.toString.call(v) === '[object Array]') }

/**
 * @name SPArrayChunk
 * @category utils
 * @function
 * @description Permits to cut an array into smaller blocks
 * @param {Array} b The array to split
 * @param {Number} e The size of each block
 * @return {Array} An array that contains several arrays with the required size
 */
var SPArrayChunk=function(b,e){var d=[];for(var c=0,a=b.length;c<a;c+=e){d.push(b.slice(c,c+e))}return d}

/**
 * @name SPExtend
 * @category utils
 * @function
 * @description It will clone an object (see https://blog.kodono.info/wordpress/2017/04/12/deep-clone-an-object-in-javascript/)
 * @param {Boolean} [deep=false] If we want a deep clone
 * @param {Object} objectDestination The object that will be extended
 * @param {Object} objectSource The object the copy
 */
var SPExtend=function(){var r,t,n,o,e=arguments[0]||{},f=1,i=arguments.length,u=!1,y=function(r){if(null===r||"object"!=typeof r||r.nodeType||null!==r&&r===r.window)return!1;try{if(r.constructor&&!this.hasOwnProperty.call(r.constructor.prototype,"isPrototypeOf"))return!1}catch(t){return!1}return!0};for("boolean"==typeof e&&(u=e,e=arguments[f]||{},f++),"object"!=typeof e&&"function"!=typeof e&&(e={}),!1;i>f;f+=1)if(null!==(r=arguments[f]))for(t in r)e!==r[t]&&"undefined"==typeof e[t]&&(u&&r[t]&&(y(r[t])||(n=Array.isArray(r[t])))?(n?(n=!1,o=e[t]&&Array.isArray(e[t])?e[t]:[]):o=e[t]&&y(e[t])?e[t]:{},e[t]=SPExtend(u,o,r[t])):void 0!==r[t]&&(e[t]=r[t]));return e}

// Encode an ArrayBuffer as a base64 string
// source: https://gist.github.com/jonleighton/958841
var SPArrayBufferToBase64=function(arrayBuffer) {
  var base64    = ''
  var encodings = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
  var bytes         = new Uint8Array(arrayBuffer)
  var byteLength    = bytes.byteLength
  var byteRemainder = byteLength % 3
  var mainLength    = byteLength - byteRemainder
  var a, b, c, d, chunk

  // Main loop deals with bytes in chunks of 3
  for (var i = 0; i < mainLength; i = i + 3) {
    // Combine the three bytes into a single integer
    chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2]

    // Use bitmasks to extract 6-bit segments from the triplet
    a = (chunk & 16515072) >> 18 // 16515072 = (2^6 - 1) << 18
    b = (chunk & 258048)   >> 12 // 258048   = (2^6 - 1) << 12
    c = (chunk & 4032)     >>  6 // 4032     = (2^6 - 1) << 6
    d = chunk & 63               // 63       = 2^6 - 1

    // Convert the raw binary segments to the appropriate ASCII encoding
    base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d]
  }

  // Deal with the remaining bytes and padding
  if (byteRemainder == 1) {
    chunk = bytes[mainLength]

    a = (chunk & 252) >> 2 // 252 = (2^6 - 1) << 2

    // Set the 4 least significant bits to zero
    b = (chunk & 3)   << 4 // 3   = 2^2 - 1

    base64 += encodings[a] + encodings[b] + '=='
  } else if (byteRemainder == 2) {
    chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1]

    a = (chunk & 64512) >> 10 // 64512 = (2^6 - 1) << 10
    b = (chunk & 1008)  >>  4 // 1008  = (2^6 - 1) << 4

    // Set the 2 least significant bits to zero
    c = (chunk & 15)    <<  2 // 15    = 2^4 - 1

    base64 += encodings[a] + encodings[b] + encodings[c] + '='
  }

  return base64
}

// Global
var _SP_CACHE_FORMFIELDS=null;
var _SP_CACHE_CONTENTTYPES=[];
var _SP_CACHE_CONTENTTYPE=[];
var _SP_CACHE_SAVEDVIEW=[];
var _SP_CACHE_SAVEDVIEWS=[];
var _SP_CACHE_SAVEDLISTS=[];
var _SP_CACHE_USERGROUPS=[]
var _SP_CACHE_GROUPMEMBERS=[];
var _SP_CACHE_DISTRIBUTIONLISTS=[];
var _SP_CACHE_REGIONALSETTINGS=void 0;
var _SP_CACHE_DATEFORMAT=void 0;
var _SP_CACHE_HASREST={};
var _SP_CACHE_REQUESTDIGEST={};
var _SP_ADD_PROGRESSVAR={};
var _SP_UPDATE_PROGRESSVAR={};
var _SP_MODERATE_PROGRESSVAR={};
var _SP_REMOVE_PROGRESSVAR={};
var _SP_BASEURL=void 0;
var _SP_NOTIFY_READY=false;
var _SP_NOTIFY_QUEUE=[];
var _SP_NOTIFY=[];
var _SP_PLUGINS={};
var _SP_MODALDIALOG_LOADED=false;
var _SP_MAXWHERE_ONLOOKUP=30;
var _SP_ISBROWSER=(new Function("try {return this===window;}catch(e){ return false;}"))();
var _SP_JSON_ACCEPT="verbose"; // other options are "minimalmetadata" and "nometadata"

(function(window, document, undefined) {
  // define a faster way to apply a function to an array
  var fastMap = function(source,fn) {
    var iterations = source.length;
    var dest = new Array(iterations);
    var _n = iterations / 8;
    var _caseTest = iterations % 8;
    for (var i = iterations-1; i > -1; i--) {
      var n = _n;
      var caseTest = _caseTest;
      do {
        switch (caseTest) {
          case 0: dest[i]=fn(source[i]); i--; // eslint-disable-line
          case 7: dest[i]=fn(source[i]); i--; // eslint-disable-line
          case 6: dest[i]=fn(source[i]); i--; // eslint-disable-line
          case 5: dest[i]=fn(source[i]); i--; // eslint-disable-line
          case 4: dest[i]=fn(source[i]); i--; // eslint-disable-line
          case 3: dest[i]=fn(source[i]); i--; // eslint-disable-line
          case 2: dest[i]=fn(source[i]); i--; // eslint-disable-line
          case 1: dest[i]=fn(source[i]); i--; // eslint-disable-line
        }
        caseTest = 0;
      } while (--n > 0);
    }
    return dest;
  };

  /**
    @name $SP()
    @class This is the object uses for all SharepointPlus related actions
   */
  function SharepointPlus() {
    if (!(this instanceof arguments.callee)) return new arguments.callee();
  }

  SharepointPlus.prototype = {
    data:[],
    length:0,
    listQueue:[],
    needQueue:false,
    module_sprequest:null,
    credentialOptions:null,
    proxyweb:null,
    /**
      @name $SP().getVersion
      @function
      @category core
      @description Returns the SP version

      @return {String} The current SharepointPlus version
    */
    getVersion:function() { return "5.0" },
    /**
     * @ignore
     * @name $SP()._promise
     * @function
     * @description (internal use only) If will reduce the code after compression
     * @param  {Function} fct
     * @return {Promise}
     */
    _promise:function(fct) { return new Promise(fct) },
    /**
      @name $SP().hasREST
      @function
      @category utils
      @description Verify if the website supports REST API (Sharepoint 2013 and later)
      @param {Object} settings
        @param {String} [settings.url=current] To check another URL (or if you need on a Node server)
      @return {Promise} A resolved Promise that gives TRUE or FALSE
    */
    hasREST:function(settings) {
      var _this=this;
      return _this._promise(function(prom_resolve) {
        settings = settings||{};
        var url=(settings.url || _this.url || window.location.href).split("/").slice(0,3).join("/");
        // check cache
        if (typeof _SP_CACHE_HASREST[url] === "boolean") {
          prom_resolve(_SP_CACHE_HASREST[url]);
          return
        }
        var hasREST, needAjax=(settings.url || !_SP_ISBROWSER || typeof SP === "undefined" ? true : false);
        if (!needAjax) {
          if (typeof SP !== "undefined" && SP.ClientSchemaVersions) { // eslint-disable-line
            // cache
            hasREST=(parseInt(SP.ClientSchemaVersions.currentVersion)>14); // eslint-disable-line
            _SP_CACHE_HASREST[url]=hasREST;
            prom_resolve(hasREST);
            return;
          }
          else needAjax=true;
        }
        if (needAjax) {
          _this.ajax({url:url + "/_api/web/Url"}).then(function() { _SP_CACHE_HASREST[url]=true; prom_resolve(true) }, function() { _SP_CACHE_HASREST[url]=false; prom_resolve(false) })
        } else {
          _SP_CACHE_HASREST[url]=false;
          prom_resolve(false);
        }
      })
    },
    /**
     * @name $SP()._getRequestDigest
     * @ignore
     * @function
     * @category utils
     * @description Retrieve the Request Digest
     * @param {Object} settings
     *   @param {String} [settings.url=current] To check another URL (or if you need on a Node server)
     * @return {Promise} resolve(Request Digest), reject(reject from $SP().ajax())
     */
    _getRequestDigest:function(settings) {
      var _this=this;
      return _this._promise(function(prom_resolve, prom_reject){
        var e, digest, url=(settings.url||_this.url||window.location.href).split("/").slice(0,3).join("/");
        // check cache
        digest=_SP_CACHE_REQUESTDIGEST[url];
        if (digest) {
          // check date to be less than 24h
          if (new Date().getTime() - new Date(digest.split(",")[1]).getTime() < 86400000) {
            prom_resolve(digest);
            return;
          }
        }
        if (_SP_ISBROWSER && document) {
          e=document.querySelector("#__REQUESTDIGEST");
          if (e) {
            digest=e.value;
            // cache
            _SP_CACHE_REQUESTDIGEST[url]=digest;
            prom_resolve(digest);
            return
          }
        }
        // do a request
        _this.ajax({
          url:url + "/_api/contextinfo",
          method:"POST"
        }).then(function(data) {
          digest=data.d.GetContextWebInformation.FormDigestValue;
          // cache
          _SP_CACHE_REQUESTDIGEST[url]=digest;
          prom_resolve(digest);
        }, function(rej) {
          prom_reject(rej)
        })
      })
    },
    /**
      @name $SP().ajax
      @function
      @category utils
      @description Permits to do an Ajax request (for internal use) based on https://github.com/yanatan16/nanoajax
      @param {Object} settings
        @param {String} url The url to call
        @param {String} [method="GET"|"POST"] The HTTP Method ("GET" or "POST" if "body" is provided)
        @param {Object} [headers] the headers
        @param {String} [body] The data to send to the server
        @param {Function} [onprogress=function(event){}] The "onprogress" object for XHR
      @return {Promise} resolve(responseText||responseXML), reject({response, statusCode, responseText})
    */
    ajax:function(settings) {
      var _this=this;
      var headers=settings.headers||{}; // for size optimization
      // https://github.com/yanatan16/nanoajax
      // eslint-disable-next-line
      !function(t,e){function n(t){return t&&e.XDomainRequest&&!/MSIE 1/.test(navigator.userAgent)?new XDomainRequest:e.XMLHttpRequest?new XMLHttpRequest:void 0}function o(t,e,n){t[e]=t[e]||n}var r=["responseType","withCredentials","timeout","onprogress"];t.ajax=function(t,a){function s(t,e){return function(){c||(a(void 0===f.status?t:f.status,0===f.status?"Error":f.response||f.responseText||e,f),c=!0)}}var u=t.headers||{},i=t.body,d=t.method||(i?"POST":"GET"),c=!1,f=n(t.cors);f.open(d,t.url,!0);var l=f.onload=s(200);f.onreadystatechange=function(){4===f.readyState&&l()},f.onerror=s(null,"Error"),f.ontimeout=s(null,"Timeout"),f.onabort=s(null,"Abort"),i&&(o(u,"X-Requested-With","XMLHttpRequest"),e.FormData&&i instanceof e.FormData||o(u,"Content-Type","application/x-www-form-urlencoded"));for(var p,m=0,v=r.length;v>m;m++)p=r[m],void 0!==t[p]&&(f[p]=t[p]);for(var p in u)f.setRequestHeader(p,u[p]);return f.send(i),f},e.nanoajax=t}({},function(){return this}());
      return _this._promise(function(prom_resolve, prom_reject) {
        // add "Accept": "application/json;odata=verbose" for headers if there is "_api/" in URL
        if (settings.url.indexOf("/_api/") > -1) {
          if (!headers["Accept"]) headers.Accept = "application/json;odata="+_SP_JSON_ACCEPT;
          if (!headers["Content-Type"]) headers["Content-Type"] = "application/json;odata="+_SP_JSON_ACCEPT;
          if (!headers["X-RequestDigest"] && settings.url.indexOf("contextinfo") === -1) {
            // we need to retrieve the Request Digest
            _this._getRequestDigest().then(function(requestDigest) {
              headers["X-RequestDigest"]=requestDigest;
              _this.ajax(settings).then(function(res) { prom_resolve(res) }, function(rej) { prom_reject(rej) });
            });
            return
          }
        }
        // use XML as the default content type
        if (!headers["Content-Type"]) headers["Content-Type"]="text/xml; charset=utf-8";
        // check if it's NodeJS
        if (_SP_ISBROWSER) {
          // eslint-disable-next-line
          nanoajax.ajax(settings, function(code, responseText, request) {
            if (code === 200 && responseText !== "Error" && responseText !== "Abort" && responseText !== "Timeout") {
              prom_resolve(request.responseXML || request.responseText)
            } else {
              prom_reject({statusCode:code, responseText:responseText, request:request});
            }
          })
        } else {
          // we use the module 'sp-request' from https://github.com/s-KaiNet/sp-request
          if (_this.module_sprequest === null) {
            if (_this.credentialOptions === null) {
              throw "[SharepointPlus] Error 'ajax': please use `$SP().auth()` to provide your credentials first";
            }
            _this.module_sprequest = require('sp-request').create(_this.credentialOptions);
          }
          if (headers['Content-Type'].indexOf('xml') > -1) headers['Accept'] = 'application/xml, text/xml, */*; q=0.01';
          if (!settings.method || settings.method.toUpperCase() === "POST") headers['Content-Length'] = Buffer.byteLength(settings.body);
          // add User Agent
          headers['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:52.0) Gecko/20100101 Firefox/52.0';
          var opts = {
            json:false,
            method:settings.method || (settings.body?"POST":"GET"),
            strictSSL: false,
            headers: headers,
            jar:true
          };
          if (settings.body) opts.body=settings.body;
          if (_this.proxyweb) opts.proxy=_this.proxyweb;
          _this.module_sprequest(settings.url, opts)
          .then(function(response) {
            if (response.statusCode === 200 && response.statusMessage !== "Error" && response.statusMessage !== "Abort" && response.statusMessage !== "Timeout") {
              // check if it's XML, then parse it
              if (response.headers['content-type'].indexOf('xml') > -1 && response.body.slice(0,5) === '<?xml') {
                var DOMParser = require('xmldom').DOMParser;
                var result = new DOMParser().parseFromString(response.body);
                prom_resolve(result);
              } else {
                prom_resolve(response.body);
              }
            } else {
              prom_reject({response:response, statusCode:response.statusCode, responseText:response.body});
            }
          }, function(err) {
            prom_reject({statusCode:err.statusCode, response:err.response, responseText:err.response.body});
          });
        }
      })
    },
    /**
      @name $SP().auth
      @function
      @category node
      @description Permits to use credentials when doing requests (for Node module only)

      @param {Object} credentialOptions Options from https://github.com/s-KaiNet/node-sp-auth
      @return {Object} the current SharepointPlus object

      @example
      var user1 = {username:'aymeric', password:'sharepointplus', domain:'kodono'};
      $SP().auth(user1)
           .list("My List","http://my.sharpoi.nt/other.directory/")
          .get({...});
      // or :
      var sp = $SP().auth(user1);
      sp.list("My List", "https://web.si.te").get({...});
      sp.list("Other List"; "http://my.sharpoi.nt/other.directory/").update(...);
    */
    auth:function(credentialOptions) {
      this.credentialOptions = credentialOptions;
      return this;
    },
    /**
      @name $SP().proxy
      @function
      @category node
      @description Permits to define a proxy server (for Node module only)

      @param {String} proxyURL Looks like "http://domain%5Cusername:password@proxy.something:80"
      @return {Object} the current SharepointPlus object

      @example
      var user1 = {username:'aymeric', password:'sharepointplus', domain:'kodono'};
      var proxy = "http://" + user1.domain + "%5C" + user1.username + ":" + user1.password + "@proxy:80";
      $SP().proxy(proxy).auth(user1)
           .list("My List","http://my.sharpoi.nt/other.directory/")
          .get({...});
      // or :
      var sp = $SP().proxy(proxy).auth(user1);
      sp.list("My List", "https://web.si.te").get({...});
      sp.list("Other List"; "http://my.sharpoi.nt/other.directory/").update(...);
    */
    proxy:function(proxy) {
      this.proxyweb = proxy;
      return this;
    },
    /**
      @name $SP().list
      @namespace
      @description Permits to define the list ID/name

      @param {String} listID Ths list ID or the list name
      @param {String} [url] If the list name is provided, then you need to make sure URL is provided too (then no need to define the URL again for the chained functions like 'get' or 'update')
      @return {Object} the current SharepointPlus object

      @example
      $SP().list("My List");
      $SP().list("My List","http://my.sharpoi.nt/other.directory/");
    */
    list:function(list,url) {
      var _this=this.reset();
      if (url) {
        // make sure we don't have a '/' at the end
        _this.url=(url.slice(-1)==='/'?url.slice(0,-1):url);
      }
      else _this._getURL();
      _this.listID = list.replace(/&/g,"&amp;");
      return _this;
    },
    /**
      @ignore
      @name $SP()._getURL
      @function
      @param {Boolean} [setURL=true] If we don't want to set this.url but just return the URL found

      @description (internal use only) Store the current URL website into this.url
      @return {Promise} resolve(url), reject(error)
     */
    _getURL:function(setURL) {
      var _this=this;
      setURL=(setURL===false?false:true);
      return _this._promise(function(prom_resolve, prom_reject) {
        if (typeof _this.url === "undefined") {
          // search for the local base URL
          if (typeof _SP_BASEURL !== "undefined") {
            if (setURL) _this.url=_SP_BASEURL;
            prom_resolve(_SP_BASEURL)
          } else {
            // try to build it
            if (typeof L_Menu_BaseUrl!=="undefined") {
              if (setURL) _this.url=_SP_BASEURL=L_Menu_BaseUrl; // eslint-disable-line
              prom_resolve(L_Menu_BaseUrl) // eslint-disable-line
            } else {
              // eslint-disable-next-line
              if (typeof _spPageContextInfo !== "undefined" && typeof _spPageContextInfo.webServerRelativeUrl !== "undefined") {
                if (setURL) _this.url=_SP_BASEURL=_spPageContextInfo.webServerRelativeUrl; // eslint-disable-line
                prom_resolve(_spPageContextInfo.webServerRelativeUrl) // eslint-disable-line
              } else {
                // we'll use the Webs.asmx service to find the base URL
                _this.needQueue=true;
                _this.ajax({
                  url: "/_vti_bin/Webs.asmx",
                  body: _this._buildBodyForSOAP("WebUrlFromPageUrl", "<pageUrl>"+window.location.href.replace(/&/g,"&amp;")+"</pageUrl>"),
                }).then(function(data) {
                  var result=data.getElementsByTagName('WebUrlFromPageUrlResult');
                  if (result.length) {
                    var u=result[0].firstChild.nodeValue.toLowerCase();
                    if (setURL) _this.url = _SP_BASEURL = u;
                    prom_resolve(u);
                  } else {
                    prom_reject("[SharepointPlus '_getURL'] Unable to retrieve the URL")
                  }
                  _this.needQueue=false;
                });
                return;
              }
            }
          }
        }
        prom_reject("[SharepointPlus '_getURL'] Unable to retrieve the URL");
      })
    },
    /**
      @name $SP().getURL
      @function
      @category utils
      @description Return the current base URL website
      @return {Promise} resolve(The current base URL website), reject(error)
     */
    getURL:function() { return this._getURL(false) },
    /**
      @ignore
      @name $SP()._buildBodyForSOAP
      @function
      @param {String} methodName
      @param {String} bodyContent
      @param {String} [xmlns="http://schemas.microsoft.com/sharepoint/soap/"]
      @description (internal use only) Permits to create the body for a SOAP request
    */
    _buildBodyForSOAP:function(methodName, bodyContent, xmlns) {
      xmlns = xmlns || "http://schemas.microsoft.com/sharepoint/soap/";
      return '<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><'+methodName+' xmlns="'+xmlns+'">' + bodyContent + '</'+methodName+'></soap:Body></soap:Envelope>';
    },
    /**
     * @name $SP().webService
     * @function
     * @category core
     * @description Permits to directly deal with a WebService (similar to SPServices http://sympmarc.github.io/SPServices/core/web-services.html)
     * @param  {Object} options
     *   @param {String} operation The method name to use (e.g. UpdateList, GetList, ....)
     *   @param {String} service The name of the service (Lists, Versions, PublishedLinksService, ...) it's the ".asmx" name without the extension
     *   @param {Object} [properties={}] The properties to call
     *   @param {String} [webURL=current website] The URL of the website
     *   @param {String} [soapURL='http://schemas.microsoft.com/sharepoint/soap/'] If the SOAP url is not the default one, then you can customize it
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
    webService:function(options) {
      var _this=this;
      return _this._promise(function(prom_resolve, prom_reject) {
        var bodyContent="", prop;
        if (!options.service) throw "Error 'webService': the option 'service' is required";
        if (!options.operation) throw "Error 'webService': the option 'operation' is required";
        options.webURL = options.webURL || _this.url;
        // if we didn't define the url in the parameters, then we need to find it
        if (!options.webURL) {
          _this._getURL().then(function(url) {
            options.webURL=url;
            _this.webService(options).then(function(res) {
              prom_resolve(res);
            }, function(rej) {
              prom_reject(rej)
            })
          }, function(rej) {
            prom_reject(rej)
          })
          return;
        }
        options.properties = options.properties || {};
        for (prop in options.properties) {
          if (options.properties.hasOwnProperty(prop)) {
            bodyContent += '<'+prop+'>'+options.properties[prop]+'</'+prop+'>'
          }
        }
        options.soapURL=options.soapURL||'http://schemas.microsoft.com/sharepoint/soap/';
        bodyContent = _this._buildBodyForSOAP(options.operation, bodyContent, options.soapURL);
        _this.ajax({
          url: options.webURL+"/_vti_bin/"+options.service+".asmx",
          body: bodyContent,
          headers: {'SOAPAction':options.soapURL+options.operation },
        }).then(function(data) { prom_resolve(data) }, function(rej) { prom_reject(rej) });
      })
    },
    /**
      @ignore
      @name $SP()._addInQueue
      @function
      @description (internal use only) Add a function in the queue
    */
    _addInQueue:function(args) {
      var _this;
      _this.listQueue.push(args);
      if (_this.listQueue.length===1) _this._testQueue();
      return _this
    },
    /**
      @ignore
      @name $SP()._testQueue
      @function
      @description (internal use only) Permits to treat the queue
    */
    _testQueue:function() {
      var _this=this;
      if (_this.needQueue) {
        setTimeout(function() { _this._testQueue.call(_this) }, 25);
      } else {
        if (_this.listQueue.length > 0) {
          var todo = _this.listQueue.shift();
          todo.callee.apply(_this, Array.prototype.slice.call(todo));
        }
        _this.needQueue=(_this.listQueue.length>0);
        if (_this.needQueue) {
          setTimeout(function() { _this._testQueue.call(_this) }, 25);
        }
      }
    },
    /**
      @name $SP().parse
      @function
      @category lists
      @description Use a WHERE sentence to transform it into a CAML Syntax sentence

      @param {String} where The WHERE sentence to change
      @param {String} [escapeChar=true] Determines if we want to escape the special chars that will cause an error (for example '&' will be automatically converted to '&amp;')
      @example
      $SP().parse('ContentType = "My Content Type" OR Description &lt;> null AND Fiscal_x0020_Week >= 43 AND Result_x0020_Date < "2012-02-03"');
      // -> return &lt;And>&lt;And>&lt;Or>&lt;Eq>&lt;FieldRef Name="ContentType" />&lt;Value Type="Text">My Content Type&lt;/Value>&lt;/Eq>&lt;IsNotNull>&lt;FieldRef Name="Description" />&lt;/IsNotNull>&lt;/Or>&lt;Geq>&lt;FieldRef Name="Fiscal_x0020_Week" />&lt;Value Type="Number">43&lt;/Value>&lt;/Geq>&lt;/And>&lt;Lt>&lt;FieldRef Name="Result_x0020_Date" />&lt;Value Type="DateTime">2012-02-03&lt;/Value>&lt;/Lt>&lt;/And>

      // available operators :
      // "&lt;" : less than
      // "&lt;=" : less than or equal to
      // ">" : greater than
      // ">=" : greater than or equal to
      // "<>" : different
      // "~=" : this must be only used when comparing to a number that represents the User ID (e.g. 'User ~= 328') - that permits to query a list with too many items but with the User column that is indexed
      // " AND "
      // " OR "
      // " LIKE " : for example 'Title LIKE "foo"' will return "foobar" "foo" "barfoobar" "barfoo" and so on
      // " IN " : for example 'Location IN ["Los Angeles","San Francisco","New York"]', equivalent to 'Location = "Los Angeles" OR Location = "San Francisco" OR Location = "New York"' — SP2013 limits each IN to 60 items. If you want to check Lookup IDs instead of text you can use '~' followed by the ID, for example 'Location IN ["~23", "~26", "~30"]'

      // special words:
      // '[Me]' : for the current user
      // '[Today]' : to use the today date
      // '[Today+X]' : to use today + X days
      // Null : for the Null value
      // TRUE : for the Yes/No columns
      // FALSE : for the Yes/No columns

      // in the below example, on the "&" will be escaped
      var bar="Bob & Marley";
      var foo="O'Conney";
      $SP().parse('Bar = "'+bar+'" AND Foo = "'+foo+'"'); // -> &lt;And>&lt;Eq>&lt;FieldRef Name="Bar" />&lt;Value Type="Text">Bob &amp; Marley&lt;/Value>&lt;/Eq>&lt;Eq>&lt;FieldRef Name="Foo" />&lt;Value Type="Text">O'Conney&lt;/Value>&lt;/Eq>&lt;/And>
      $SP().parse("Bar = '"+bar+"' AND Foo = '"+foo+"'"); // don't put the simple and double quotes this way because it'll cause an issue with O'Conney
    */
    parse:function(q, escapeChar) {
      var queryString = q.replace(/(\s+)?(=|~=|<=|>=|<>|<|>| LIKE | IN )(\s+)?/g,"$2").replace(/""|''/g,"Null").replace(/==/g,"="); // remove unnecessary white space & replace '
      var factory = [];
      escapeChar = (escapeChar===false ? false : true)
      var limitMax = q.length;
      var closeOperator="", closeTag = "", ignoreNextChar=false;
      var lastField = "";
      var parenthesis = {open:0};
      var lookupId = false;
      for (var i=0; i < queryString.length; i++) {
        var letter = queryString.charAt(i);
        switch (letter) {
          case "(": // find the deepest (
            var start = i;
            var openedApos=false;
            while (queryString.charAt(i) == "(" && i < limitMax) { i++; parenthesis.open++; }
            // find the corresponding )
            while (parenthesis.open>0 && i < limitMax) {
              i++;
              // if there is a ' opened then ignore the ) until the next '
              var charAtI = queryString.charAt(i);
              if (charAtI=="\\") ignoreNextChar=true; // when we have a backslash \then ignore the next char
              else if (!ignoreNextChar && (charAtI=="'" || charAtI=='"')) openedApos=!openedApos;
              else if (!ignoreNextChar && charAtI==")" && !openedApos) parenthesis.open--;
              else ignoreNextChar=false;
            }

            var lastIndex = factory.length-1;

            // concat with the first index
            if (lastIndex>=0) {
              if (closeOperator != "") factory[0] = "<"+closeOperator+">"+factory[0];
              factory[0] += this.parse(queryString.substring(start+1, i));
              if (closeOperator != "") factory[0] += "</"+closeOperator+">";
              closeOperator = "";
            } else factory[0] = this.parse(queryString.substring(start+1, i));
            break;
          case "[": // for operator IN
            var start = i; // eslint-disable-line
            var openedApos=false; // eslint-disable-line
            // find the corresponding ]
            while (i < limitMax) {
              i++;
              // if there is a ' opened then ignore the ) until the next '
              var charAtI = queryString.charAt(i); // eslint-disable-line
              if (charAtI=="\\") ignoreNextChar=true; // when we have a backslash \then ignore the next char
              else if (!ignoreNextChar && (charAtI=="'" || charAtI=='"')) openedApos=!openedApos;
              else if (!ignoreNextChar && !openedApos && charAtI=="]") break;
              else ignoreNextChar=false;
            }

            var lastIndex = factory.length-1; // eslint-disable-line
            var arrIn = JSON.parse('[' + queryString.substring(start+1, i) + ']');
            // we want to detect the type for the values
            var typeIn = "Text";
            switch(typeof arrIn[0]) {
              case "number": typeIn = "Number"; break;
              default: {
                // check if it starts with ~ and then it's a number -- lookupid
                if (arrIn[0].charAt(0) === "~" && typeof (arrIn[0].slice(1)*1) === "number") {
                  typeIn = "Integer";
                  // change all array values
                  arrIn.forEach(function(e,i) { arrIn[i]=e.slice(1) })
                }
              }
            }
            factory[lastIndex] += '<FieldRef Name="'+lastField+'" '+(typeIn==="Integer"?'LookupId="True"':'')+' /><Values><Value Type="'+typeIn+'">' + arrIn.join('</Value><Value Type="'+typeIn+'">') + '</Value></Values>' + closeTag;
            lastField = "";
            closeTag = "";
            // concat with the first index
            if (lastIndex>0) {
              if (closeOperator != "") factory[0] = "<"+closeOperator+">"+factory[0];
              factory[0] += factory[lastIndex];
              if (closeOperator != "") factory[0] += "</"+closeOperator+">";
              delete(factory[lastIndex]);
              closeOperator = "";
            }
            break;
          case ">":  // look at the operand
          case "<":
            i++;
            if (queryString.charAt(i) == "=") { // >= or <=
              factory.push("<"+(letter==">"?"G":"L")+"eq>");
              closeTag = "</"+(letter==">"?"G":"L")+"eq>";
            } else if (letter == "<" && queryString.charAt(i) == ">") { // <>
              factory.push("<Neq>");
              closeTag = "</Neq>";
            } else {
              i--;
              factory.push("<"+(letter==">"?"G":"L")+"t>");
              closeTag = "</"+(letter==">"?"G":"L")+"t>";
            }
            break;
          case "~": // special operator '~=' for People
            if (queryString.charAt(i+1) == "=") lookupId=true
            break;
          case "=":
            factory.push("<Eq>");
            closeTag = "</Eq>";
            break;
          case " ": // check if it's AND or OR
            if (queryString.substring(i,i+5).toUpperCase() == " AND ") {
              // add the open tag in the array
              closeOperator = "And";
              i+=4;
            }
            else if (queryString.substring(i,i+4).toUpperCase() == " OR ") {
              // add the open tag in the array
              closeOperator = "Or";
              i+=3;
            }
            else if (queryString.slice(i,i+6).toUpperCase() == " LIKE ") {
              i+=5;
              factory.push("<Contains>");
              closeTag = "</Contains>";
            }
            else if (queryString.slice(i,i+4).toUpperCase() == " IN ") {
              i+=3;
              factory.push("<In>");
              closeTag = "</In>";
            }
            else lastField += letter;
            break;
          case '"': // look now for the next "
          case "'":
            var apos = letter;
            var word = "", other="";
            while ((letter = queryString.charAt(++i)) != apos && i < limitMax) {
              if (letter == "\\") letter = queryString.charAt(++i);
              word+=letter;
            }
            lastIndex = factory.length-1;
            factory[lastIndex] += '<FieldRef Name="'+lastField+'" '+(word=="[Me]"?'LookupId="True" ':'')+'/>';
            lastField = "";
            var type = "Text"; //(isNaN(word) ? "Text" : "Number"); // check the type
            // check automatically if it's a DateTime
            if (/\d{4}-\d\d?-\d\d?((T| )\d{2}:\d{2}:\d{2})?/.test(word)) {
              type="DateTime";
              // check if we want to evaluate the TIME also
              if (/\d{4}-\d\d?-\d\d?((T| )\d{2}:\d{2}:\d{2})/.test(word)) other=' IncludeTimeValue="TRUE"';
            }
            if (escapeChar) word = this._cleanString(word);
            // special words ([Today] and [Me])
            if (word === "[Me]") {
              word = '<UserID Type="Integer" />';
              type = "Integer";
            } else if (word.slice(0,6) == "[Today") {
              type="DateTime";
              // find the offset if defined
              word = '<Today OffsetDays="'+(1*word.slice(6,-1))+'" />';
            }

            factory[lastIndex] += '<Value Type="'+type+'"'+other+'>'+word+'</Value>';
            factory[lastIndex] += closeTag;
            closeTag = "";
            // concat with the first index
            if (lastIndex>0) {
              if (closeOperator != "") factory[0] = "<"+closeOperator+">"+factory[0];
              factory[0] += factory[lastIndex];
              if (closeOperator != "") factory[0] += "</"+closeOperator+">";
              delete(factory[lastIndex]);
              closeOperator = "";
            }
            break;
          case "0": case "1": case "2": case "3": case "4": case "5": case "6": case "7": case "8": case "9":
            if (closeTag != "") { // it's the value
              var value = letter;
              while (!isNaN(letter = queryString.charAt(++i)) && i < limitMax) value+=""+letter;
              lastIndex = factory.length-1;
              factory[lastIndex] += '<FieldRef Name="'+lastField+'"'+(lookupId?' LookupId="True"':'')+' />';
              lastField = "";
              factory[lastIndex] += '<Value Type="'+(lookupId?"Integer":"Number")+'">'+value.replace(/ $/,"")+'</Value>';
              factory[lastIndex] += closeTag;
              closeTag = "";
              // concat with the first index
              if (lastIndex>0) {
                if (closeOperator != "") factory[0] = "<"+closeOperator+">"+factory[0];
                factory[0] += factory[lastIndex];
                if (closeOperator != "") factory[0] += "</"+closeOperator+">";
                delete(factory[lastIndex]);
                closeOperator = "";
              }
              i-=2;
              break;
            }
          default: // eslint-disable-line
            if (closeTag == "") lastField += letter;
            else if (letter.toLowerCase() == "n" && queryString.substring(i,i+4).toLowerCase() == "null") { // if we have NULL as the value
              lastIndex = factory.length-1;
              if (closeTag == "</Neq>") { // <>
                factory[lastIndex] = "<IsNotNull>";
                closeTag = "</IsNotNull>";
              } else if (closeTag == "</Eq>") { // =
                factory[lastIndex] = "<IsNull>";
                closeTag = "</IsNull>";
              }
              i+=3;
              factory[lastIndex] += '<FieldRef Name="'+lastField+'" />';
              lastField = "";
              factory[lastIndex] += closeTag;
              closeTag = "";
              // concat with the first index
              if (lastIndex>0) {
                if (closeOperator != "") factory[0] = "<"+closeOperator+">"+factory[0];
                factory[0] += factory[lastIndex];
                if (closeOperator != "") factory[0] += "</"+closeOperator+">";
                delete(factory[lastIndex]);
                closeOperator = "";
              }
            }
            else if ((letter.toLowerCase() === "t" && queryString.substring(i,i+4).toLowerCase() === "true") || (letter.toLowerCase() === "f" && queryString.substring(i,i+5).toLowerCase() === "false")) { // when we have TRUE/FALSE as the value
              lastIndex = factory.length-1;
              i+=3;
              if (letter.toLowerCase() === "f") i++;
              factory[lastIndex] += '<FieldRef Name="'+lastField+'" /><Value Type="Boolean">'+(letter.toLowerCase() === "t"?1:0)+'</Value>';
              lastField = "";
              factory[lastIndex] += closeTag;
              closeTag = "";
              // concat with the first index
              if (lastIndex>0) {
                if (closeOperator != "") factory[0] = "<"+closeOperator+">"+factory[0];
                factory[0] += factory[lastIndex];
                if (closeOperator != "") factory[0] += "</"+closeOperator+">";
                delete(factory[lastIndex]);
                closeOperator = "";
              }
            }
        }
      }
      return factory.join("");
    },
    /**
      @ignore
      @name $SP()._parseOn
      @function
      @description (internal use only) Look at the ON clause to convert it

      @param {String} on The ON clause
      @return {Array} array of clauses
      @example
      $SP()._parseOn("'List1'.field1 = 'List2'.field2 AND 'List1'.Other_x0020_Field = 'List2'.Some_x0020_Field")
    */
    _parseOn:function(q) {
      var factory = [],  i=0, mtch, queryString = q.replace(/(\s+)?(=)(\s+)?/g,"$2").replace(/==/g,"=").split(" AND ");
      for (; i<queryString.length; i++) {
        mtch = queryString[i].match(/'([^']+)'\.([a-zA-Z0-9_]+)='([^']+)'\.([a-zA-Z0-9_]+)/);
        if (mtch && mtch.length==5) {
          var tmp={};
          tmp[mtch[1]] = mtch[2];
          tmp[mtch[3]] = mtch[4];
          factory.push(tmp);
        }
      }
      return factory;
    },
    /**
      @ignore
      @name $SP()._cleanString
      @function
      @description clean a string to remove the bad characters when using AJAX over Sharepoint web services (like <, > and &)
      Note: That should only be used as an internal function
      @param {String} string The string to clean
    */
    _cleanString:function(str) {
      return str.replace(/&(?!amp;|lt;|gt;)/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    },
    /**
      @name $SP().cleanResult
      @function
      @category lists
      @description clean a string returned by a GET (remove ";#" and "string;#" and null becomes "")

      @param {String} str The string to clean
      @param {String} [separator=";"] When it's a list we may want to have a different output (see examples)
      @return {String} the cleaned string

      @example
      $SP().cleanResult("15;#Paul"); // -> "Paul"
      $SP().cleanResult("string;#Paul"); // -> "Paul"
      $SP().cleanResult("string;#"); // -> ""
      $SP().cleanResult(";#Paul;#Jacques;#Aymeric;#"); // -> "Paul;Jacques;Aymeric"
      $SP().cleanResult(";#Paul;#Jacques;#Aymeric;#", ", "); // -> "Paul, Jacques, Aymeric"
    */
    cleanResult:function(str,separator) {
      if (str===null || typeof str==="undefined") return "";
      separator = separator || ";";
      return (typeof str==="string"?str.replace(/^(string;|float;)#?/,"").replace(/;#[0-9]+;#/g,separator).replace(/^[0-9]+;#/,"").replace(/^;#|;#$/g,"").replace(/;#/g,separator):str);
    },
    /**
      @name $SP().list.get
      @function
      @description Get the content of the list based on different criteria (by default the default view is used)

      @param {Object} [options] Options (see below)
        @param {String}  [options.fields=""] The fields you want to grab (be sure to add "Attachments" as a field if you want to know the direct link to an attachment)
        @param {String}  [options.view=""] If you specify a viewID or a viewName that exists for that list, then the fields/where/order settings for this view will be used in addition to the FIELDS/WHERE/ORDERBY you have defined (the user settings will be used first)
        @param {String|Array}  [options.where=""] The query string (like SQL syntax) (you'll need to use double \\ before the inside ' -- see example below); you can use an array that will make the sequential requests but it will return all the data into one array (useful for the Sharepoint 2010 throttling limit)
        @param {Boolean} [options.whereCAML=false] If you want to pass a WHERE clause that is with CAML Syntax only instead of SQL-like syntax -- see $SP().parse() for more info
        @param {Boolean} [options.whereEscapeChar=true] Determines if we want to escape the special chars that will cause an error (for example '&' will be automatically converted to '&amp;') -- this is applied to the WHERE clause only
        @param {Function} [options.whereFct=function(w){return w}] Permits to apply your own function on the WHERE clause after conversion to CAML (can be useful also when you use the "view" parameter)
        @param {Function} [options.progress] When using an array for the WHERE or the PAGING option then you can call the progress function (see the example)
        @param {String}  [options.orderby=""] The field used to sort the list result (you can also add "ASC" -default- or "DESC")
        @param {String}  [options.groupby=""] The field used to group by the list result
        @param {Integer} [options.rowlimit=0] You can define the number of rows you want to receive back (0 is infinite)
        @param {Boolean} [options.paging=false] If you have defined the 'rowlimit' then you can use 'paging' to cut by packets your full request -- this is useful when there is a list view threshold (attention: we cannot use "WHERE" or "ORDERBY" with this option)
        @param {Integer} [options.page=infinite] When you use the `paging` option, several requests will be done until we get all the data, but using the `page` option you can define the number of requests/pages you want to get
        @param {String}  [options.listItemCollectionPositionNext=""] When doing paging, this is the index used by Sharepoint to get the next page
        @param {Boolean} [options.useIndexForOrderBy=false] Based on https://spservices.codeplex.com/discussions/280642#post1323410 it permits to override the 5,000 items  limit in an unique call -- see the example below to know how to use it
        @param {Boolean} [options.expandUserField=false] When you get a user field, you can have more information (like name,email,sip,...) by switching this to TRUE
        @param {Boolean} [options.dateInUTC=false] TRUE to return dates in Coordinated Universal Time (UTC) format. FALSE to return dates in ISO format.
        @param {Object} [options.folderOptions] Permits to read the content of a Document Library (see below)
          @param {String} [options.folderOptions.path=""] Relative path of the folders we want to explore (by default it's the root of the document library)
          @param {String} [options.folderOptions.show="FilesAndFolders_InFolder"] Four values: "FilesOnly_Recursive" that lists all the files recursively from the provided path (and its children); "FilesAndFolders_Recursive" that lists all the files and folders recursively from the provided path (and its children); "FilesOnly_InFolder" that lists all the files from the provided path; "FilesAndFolders_InFolder" that lists all the files and folders from the provided path
        @param {Boolean} [options.queryOptions=undefined] If you want to provide your own QueryOptions and overwrite the ones built for you -- it should be some XML code (see https://msdn.microsoft.com/en-us/library/lists.lists.getlistitems%28v=office.12%29.aspx?f=255&MSPPError=-2147217396)
        @param {Object} [options.join] Permits to create a JOIN closure between the current list and another one: it will be the same syntax than a regular GET (see the example below) (it doesn't use yet the JOIN options provided with Sharepoint 2010)
          @param {String} [options.join.list] Permits to establish the link between two lists (see the example below)
          @param {String} [options.join.url='current website'] The website url (if different than the current website)
          @param {String} [options.join.on] Permits to establish the link between two lists (only between the direct parent list and its child, not with the grand parent) (see the example below)
          @param {String} [options.join.onLookup] Permits to establish the link between two lists based on a lookup field... it's more optimized than the simple `join.on` (see the example below)
          @param {Boolean} [options.join.outer=false] If you want to do an outer join (you can also directly use "outerjoin" instead of "join")
        @param {Boolean} [options.calendar=false] If you want to get the events from a Calendar List
        @param {Object} [options.calendarOptions] Options that will be used when "calendar:true" (see the example to know how to use it)
          @param {Boolean} [options.calendarOptions.splitRecurrence=true] By default we split the events with a recurrence (so 1 item = 1 day of the recurrence)
          @param {String|Date} [options.calendarOptions.referenceDate=today] This is the date used to retrieve the events -- that can be a JS Date object or a SP Date (String)
          @param {String} [options.calendarOptions.range="Month"] By default we have all the events in the reference month (based on the referenceDate), but we can restrict it to a week with "Week" (from Monday to Sunday) (see https://www.nothingbutsharepoint.com/sites/eusp/Pages/Use-SPServices-to-Get-Recurring-Events-as-Distinct-Items.aspx)
      @return {Promise} resolve(data returned by the server), reject(error from $SP().ajax())

      @example
      $SP().list("List Name").get().then(function(data) {
        for (var i=0; i&lt;data.length; i++) console.log(data[i].getAttribute("Title"));
      });

      // with some fields and an orderby command
      $SP().list("ListName","http://www.mysharepoint.com/mydir/").get({
        fields:"Title,Organization",
        orderby:"Title DESC,Test_x0020_Date ASC"
      }).then(function(data) {
        for (var i=0; i&lt;data.length; i++) console.log(data[i].getAttribute("Title"));
      });

      // handle the errors
      $SP().list("List Name").get().then(function(data) {
        for (var i=0; i&lt;data.length; i++) console.log(data[i].getAttribute("Title"));
      }).catch(function(err) {
        console.log("Error => ",err)
      });

      // the WHERE clause must be SQL-like
      // the field names must be the internal names used by Sharepoint
      // ATTENTION - note that here we open the WHERE string with simple quotes (') and that should be your default behavior each time you use WHERE
      var name = "O'Sullivan, James";
      $SP().list("My List").get({
        fields:"Title",
        where:'Fiscal_x0020_Week > 30 AND Fiscal_x0020_Week &lt; 50 AND Name = "'+name+'"'
      }).then(function(row) {
        for (var i=row.length;i--;) console.log(row[i].getAttribute("Title"));
      });

      // Same example but this time we write the name directly inside the query...
      // So make sure to use a single backslash (\) if you have a simple quote ' inside your WHERE with a double quotes (") to open/close the string
      $SP().list("My List").get({
        fields:"Title",
        where:'Fiscal_x0020_Week > 30 AND Fiscal_x0020_Week &lt; 50 AND Name = "O\'Sullivan, James"'
      }).then(function(row) {
        for (var i=row.length;i--;) console.log(row[i].getAttribute("Title"));
      });
      // Or to use a double backslash (\\) if you have a simple quote ' inside your WHERE with a simple quote (') to open/close the string
      $SP().list("My List").get({
        fields:"Title",
        where:"Fiscal_x0020_Week > 30 AND Fiscal_x0020_Week &lt; 50 AND Name = 'O\\'Sullivan, James'"
      }).then(function(row) {
        for (var i=row.length;i--;) console.log(row[i].getAttribute("Title"));
      });

      // also in the WHERE clause you can use '[Me]' to filter by the current user,
      $SP().list("My List").get({
        fields:"Title",
        where:"Author = '[Me]'"
      }).then(function(row) {
        console.log(row[0].getAttribute("Title"));
      });

      // also in the WHERE clause you can use '[Today]' or '[Today-X]' with 'X' a number,
      // Here it will return the records done yesterday
      $SP().list("My List").get({
        fields:"Title",
        where:"Created = '[Today-1]'"
      }).then(function(row) {
        console.log(row[0].getAttribute("Title"));
      });

      // Since 3.0.8, if you do a WHERE on a Date with the Time included, then it will compare with the tim
      // see http://blogs.syrinx.com/blogs/sharepoint/archive/2008/08/05/caml-queries-with-dates.aspx
      // here it will only show the items created at 2PM exactly -- if you want to check only the today, then use "Created = '2014-03-12'"
      $SP().list("My List").get({
        fields:"Title",
        where:"Created = '2014-03-12 14:00:00'"
      }).then(function(row) {
        console.log(row[0].getAttribute("Title"));
      });

      // We have a list called "My List" with a view already set that is called "Marketing View" with some FIELDS and a WHERE clause
      // so the function will grab the view information and will get the data from the list with "Author = '[Me]'" and adding the view's WHERE clause too
      $SP().list("My List","http://my.sharepoint.com/my/site/").get({
        view:"Marketing View",
        where:"Author = '[Me]'"
      }).then(function(data) {
        for (var i=data.length; i--;) console.log(data[i].getAttribute("Title") + " by " + data[i].getAttribute("Author"));
      });

      // use the paging option for the large list to avoid the message "the attempted operation is prohibited because it exceeds the list view threshold enforced by the administrator"
      // ATTENTION: if you use the WHERE option then it could return the "view threshold" error message because the packet from the WHERE is too big and SharePoint is too stupid...
      $SP().list("My List").get({
        fields:"ID,Title",
        rowlimit:5000,
        paging:true,
        progress:function progress(nbItemsLoaded) {
          // for each new page this function will be called
          console.log("It's still loading... already "+nbItemsLoaded+" items have been loaded!");
        }
      }).then(function(data) {
        console.log(data.length); // -> 23587
      })
      // add the `page` option to stop after a number of requests/pages
      // for example you only want the last record from a list that has more than 5,000 items
      $SP().list("My List").get({fields:"ID",orderby:"ID DESC",rowlimit:1,paging:true,page:1}).then(function(data) {
        console.log("last ID : "+data[0].getAttribute("ID"));
      })
      // use `listItemCollectionPositionNext` to start from this index
      $SP().list("My List").get({
        fields:"ID",
        orderby:"ID DESC",
        rowlimit:10,
        paging:true,
        page:1
      }).then(function(data) {
        // "data" is our first page of data
        // get the next block
        return $SP().list("My List").get({fields:"ID",orderby:"ID DESC",rowlimit:10,paging:true,page:1,listItemCollectionPositionNext:data.NextPage})
      }).then(function(data) {
        // here "data" is the 2nd block of data
      })

      // We can also find the files from a Document Shared Library
      $SP().list("Shared Documents","http://my.share.point.com/my_site/").get({
        fields:"FileLeafRef,File_x0020_Size",
      }).then(function(data) {
        for (var i=0; i<&lt;data.length; i++) console.log("FileName:"+data[i].getAttribute("FileLeafRef"),"FileSize:"+data[i].getAttribute("File_x0020_Size"));
      });

      // We can join two or more lists together based on a condition
      // ATTENTION: in that case the DATA passed to the callback will return a value for "LIST NAME.FIELD_x0020_NAME" and not directly "FIELD_x0020_NAME"
      // ATTENTION: you need to make sure to call the 'fields' that will be used in the 'on' clause
      $SP().list("Finance and Expense","http://my.sharepoint.com/my_sub/dir/").get({
        fields:"Expense_x0020_Type",
        where:"Finance_x0020_Category = 'Supplies'",
        join:{
          list:"Purchasing List",
          fields:"Region,Year,Expense_x0020_Type,Finance_x0020_Category,Cost",
          where:"Region = 'EMEA' AND Year = 2012",
          orderby:"Expense_x0020_Type,Finance_x0020_Category",
          on:"'Purchasing List'.Expense_x0020_Type = 'Finance and Expense'.Expense_x0020_Type",
          join:{
            list:"Financial Static Data",
            fields:"Region,Year,Expense_x0020_Type,Finance_x0020_Category,Forecast",
            where:"Region = 'EMEA' AND Year = 2012",
            on:"'Purchasing List'.Region = 'Financial Static Data'.Region AND 'Purchasing List'.Expense_x0020_Type = 'Financial Static Data'.Expense_x0020_Type"
          }
        }
      }).then(function(data) {
        for (var i=0; i&lt;data.length; i++) {
          console.log(data[i].getAttribute("Purchasing List.Region")+" | "+data[i].getAttribute("Purchasing List.Year")+" | "+data[i].getAttribute("Purchasing List.Expense_x0020_Type")+" | "+data[i].getAttribute("Purchasing List.Cost"));
        }
      });

      // By default "join" is an "inner join", but you can also do an "outerjoin"
      // ATTENTION: in that case the DATA passed to the callback will return a value for "LIST NAME.FIELD_x0020_NAME" and not directly "FIELD_x0020_NAME"
      // ATTENTION: you need to make sure to call the 'fields' that will be used in the 'on' clause
      $SP().list("Finance and Expense","http://my.sharepoint.com/my_sub/dir/").get({
        fields:"Expense_x0020_Type",
        where:"Finance_x0020_Category = 'Supplies'",
        join:{
          list:"Purchasing List",
          fields:"Region,Year,Expense_x0020_Type,Finance_x0020_Category,Cost",
          where:"Region = 'EMEA' AND Year = 2012",
          orderby:"Expense_x0020_Type,Finance_x0020_Category",
          on:"'Purchasing List'.Expense_x0020_Type = 'Finance and Expense'.Expense_x0020_Type",
          outerjoin:{
            list:"Financial Static Data",
            fields:"Region,Year,Expense_x0020_Type,Finance_x0020_Category,Forecast",
            where:"Region = 'EMEA' AND Year = 2012",
            on:"'Purchasing List'.Region = 'Financial Static Data'.Region AND 'Purchasing List'.Expense_x0020_Type = 'Financial Static Data'.Expense_x0020_Type"
          }
        }
      }).then(function(data) {
        for (var i=0; i&lt;data.length; i++)
          console.log(data[i].getAttribute("Purchasing List.Region")+" | "+data[i].getAttribute("Purchasing List.Year")+" | "+data[i].getAttribute("Purchasing List.Expense_x0020_Type")+" | "+data[i].getAttribute("Purchasing List.Cost"));
      })

      // Another example of "outerjoin", but this time with fields tied to a Lookup ID
      // Here 1 Project can have several Deliverables based on field "Project ID", and 1 Deliverable can have several team members based on "Deliverable ID"
      $SP().list("Projects").get({
        fields:"ID,Project_x0020_Name",
        where:"Status = 'In Progress'",
        outerjoin:{
          list:"Deliverables",
          fields:"ID,Name",
          onLookup:"Project_x0020_ID",
          outerjoin:{
            list:"Team Members",
            fields:"ID,Deliverable_x0020_ID,Name",
            onLookup:"Deliverable_x0020_ID"
          }
        }
      }).then(function(data) {
        var html = '&lt;table class="table default">&lt;thead>&lt;tr>&lt;th>Project ID&lt;/th>&lt;th>Project Name&lt;/th>&lt;th>Deliverable ID&lt;/th>&lt;th>Deliverable Name&lt;/th>&lt;th>Team ID&lt;/th>&lt;th>Member Name&lt;/th>&lt;/tr>&lt;/thead>&lt;tbody>'
        for (var i=0;i&lt;data.length; i++) {
          html += '&lt;tr>&lt;td>'+data[i].getAttribute("Projects.ID")+'&lt;/td>&lt;td>'+data[i].getAttribute("Projects.Project_x0020_Name")+'&lt;/td>&lt;td>'+data[i].getAttribute("Deliverables.ID")+'&lt;/td>&lt;td>'+data[i].getAttribute("Deliverables.Name")+'&lt;/td>&lt;td>'+data[i].getAttribute("Team Members.ID")+'&lt;/td>&lt;td>'+data[i].getAttribute("Team Members.Name")+'&lt;/td>&lt;/tr>'
        }
        html += '&lt;/tbody>&lt;/table>';
        $('#part1').html(html);
      })

      // With Sharepoint 2010 we are limited due to the throttling limit (see here for some very interesting information http://www.glynblogs.com/2011/03/sharepoint-2010-list-view-throttling-and-custom-caml-queries.html)
      // So for example if I do WHERE:'Fiscal_x0020_Year = 2012' it will return an error because I have 6,500 items
      // So I'll do several requests for each Fiscal_x0020_Week into this Fiscal Year
      var query=[],q=[];
      for (var i=1; i&lt;54; i++) {
        q.push("Fiscal_x0020_Week = "+i);
        if (i%8==0 || i == 53) {
          query.push("("+q.join(" OR ")+") AND Fiscal_x0020_Year = 2012");
          q=[]
        }
      }
      // it returns :
      // [
      //   "(Fiscal_x0020_Week = 1 OR Fiscal_x0020_Week = 2 OR Fiscal_x0020_Week = 3 OR Fiscal_x0020_Week = 4 OR Fiscal_x0020_Week = 5 OR Fiscal_x0020_Week = 6 OR Fiscal_x0020_Week = 7 OR Fiscal_x0020_Week = 8) AND Fiscal_x0020_Year = 2012",
      //   ...
      //   "(Fiscal_x0020_Week = 49 OR Fiscal_x0020_Week = 50 OR Fiscal_x0020_Week = 51 OR Fiscal_x0020_Week = 52 OR Fiscal_x0020_Week = 53) AND Fiscal_x0020_Year = 2012"
      // ]
      $SP().list("Sessions").get({
        fields:"Title,Score",
        where:query,
        progress:function progress(current,max) {
          // when we use an array for the WHERE clause we are able to provide `current` and `max`
          console.log("Progress: "+current+" / "+max);
        }
      }).then(function(data) {
        console.log(data.length); // -> 6,523
      });
      // also regarding the throttling limit, you can query a list on a user column in using the User ID
      // For example if John Doe is recorded as "328;#Doe, John" then you'll have to use the special operator "~="
      $SP().list("Sessions").get({
        fields:"Title",
        where:'User ~= 328"
      }).then(function(data) {
        console.log(data.length);
      });

      // if you want to list only the files visible into a folder for a Document Library
      $SP().list("My Shared Documents").get({
        fields:"BaseName,FileRef,FSObjType", // "BaseName" is the name of the file/folder; "FileRef" is the full path of the file/folder; "FSObjType" is 0 for a file and 1 for a folder (you need to apply $SP().cleanResult()), "File_x0020_Size" the filesize in bytes
        folderOptions:{
          path:"My Folder/Sub Folder/",
          show:"FilesOnly_InFolder"
        }
      });

      // if you want to list all the files and folders for a Document Library
      $SP().list("My Shared Documents").get({
        fields:"BaseName,FileRef,FSObjType", // "BaseName" is the name of the file/folder; "FileRef" is the full path of the file/folder; "FSObjType" is 0 for a file and 1 for a folder (you need to apply $SP().cleanResult())
        folderOptions:{
          show:"FilesAndFolders_Recursive"
        }
      });

      // How to retrieve the events from a Calendar List
      // NOTE -- when "calendar:true" we automatically get some fields: "Title", "EventDate" -- the Start Date --, "EndDate", "RecurrenceData", Duration", fAllDayEvent", "fRecurrence", "ID"
      $SP().list("My Calendar").get({
        fields:"Description",
        calendar:true,
        calendarOptions:{
          referenceDate:new Date(2012,4,4),
          range: "Week"
        }
        where:"Category = 'Yellow'"
      }).then(function(data) {
        var events=[];
        for (var i=0; i&lt;data.length; i++) {
          // several information are available -- see below
          events.push({
            Title:         data[i].getAttribute("Title"),
            StartDateTime: data[i].getAttribute("EventDate"), // you can use $SP().toDate() to have a JS Date
            EndDateTime:   data[i].getAttribute("EndDate"), // you can use $SP().toDate() to have a JS Date
            Recurrence:    (data[i].getAttribute("fRecurrence") == 1 ? true : false),
            AllDayEvent:   (data[i].getAttribute("fAllDayEvent") == 1 ? true : false),
            RecurrenceEnd: (data[i].getAttribute("RecurrenceData")||"").replace(/.+<windowEnd>([^<]+)<\/windowEnd>.+/,"$1"), // see the NOTE below
            ID:            data[i].getAttribute("ID"), // the ID for the recurrence events is special but can be also passed to "Display.aspx?ID="
            Duration:      1*data[i].getAttribute("Duration") // Duration is in SECONDS
          })
          // NOTE: with data[i].getAttribute("RecurrenceData") you'll find more info about the recurrence (like the end date for the serie, and much more),
          // but because there are a lot of scenario, I won't handle the different cases.
          // e.g. for a daily recurrence you can find the end date of the serie with: data[i].getAttribute("RecurrenceData").replace(/.+<windowEnd>([^<]+)<\/windowEnd>.+/,"$1")
          // --> it will return a SP Date
        }
      })

      // [It doesn't work with Sharepoint 2013 anymore, only for SP2010]
      // You can use `useIndexForOrderBy:true` to override the list view threshold -- see https://spservices.codeplex.com/discussions/280642
      // To make it to work, you need :
      // 1) to have "ID > 0 AND Another_Index_Column_Filtered" in the WHERE Clause (so at least two filters), and then we can add some other WHERE (even the not indexed columns)
      // 2) To use `orderby`, with an indexed column
      // 3) To use `useIndexForOrderBy:true`
      // see the below example with Trainer an indexed column, and Equipment a column not indexed
      // NOTE: you need to test your WHERE to see if it works or not, because it's vary a lot depending of the kind of WHERE clause you'll use
      $SP().list("Calendar",'http://intranet.dell.com/services/Educate/Toolbox/scheduling_tool/').get({
        fields:"Trainer",
        where:'ID > 0 AND Trainer <> "" AND Equipment LIKE "Box"',
        orderby:'Trainer',
        useIndexForOrderBy:true
      }).then(function(d) {
        console.log(d.length)
      })
    */
    get:function(options) {
      var _this = this;
      return _this._promise(function(prom_resolve, prom_reject) {
        // check if we need to queue it
        if (_this.needQueue) { return _this._addInQueue(arguments) }
        if (!_this.listID) throw "[SharepointPlus 'get']: the list ID/Name is required";
        // default values
        var setup={};
        SPExtend(true, setup, options);
        if (!_this.url) throw "[SharepointPlus 'get']: not able to find the URL!"; // we cannot determine the url
        setup.fields    = setup.fields || "";
        setup.where     = setup.where || "";
        setup.whereFct  = setup.whereFct || function(w) { return w };
        setup.orderby   = setup.orderby || "";
        setup.useIndexForOrderBy = (setup.useIndexForOrderBy===true ? true : false);
        setup.groupby   = setup.groupby || "";
        setup.rowlimit  = setup.rowlimit || 0;
        setup.whereEscapeChar= (setup.whereEscapeChar===false ? false : true);
        setup.paging    = (setup.paging===true ? true : false);
        setup.page      = (setup.paging===false || isNaN(setup.page) ? 5000 : setup.page);
        if (setup.paging && setup.rowlimit === 0) setup.rowlimit = 5000; // if rowlimit is not defined, we set it to 5000 by default
        setup.expandUserField = (setup.expandUserField===true || setup.expandUserField==="True"?"True":"False");
        setup.dateInUTC = (setup.dateInUTC===true?"True":"False");
        setup.folderOptions = setup.folderOptions || null;
        setup.view      = setup.view || "";
        setup.calendar  = (setup.calendar===true ? true : false);
        if (setup.calendar===true) {
          setup.calendarOptions = setup.calendarOptions || {};
          setup.calendarOptions.referenceDate = setup.calendarOptions.referenceDate || new Date();
          if (typeof setup.calendarOptions.referenceDate !== "string") setup.calendarOptions.referenceDate=_this.toSPDate(setup.calendarOptions.referenceDate)
          setup.calendarOptions.splitRecurrence = (setup.calendarOptions.splitRecurrence===false ? "FALSE" : "TRUE");
          setup.calendarOptions.range = setup.calendarOptions.range || "Month";
        }
        // if (setup.whereCAML!==true) setup.whereCAML = (setup.view!="");
        setup.results = setup.results || []; // internal use when there is a paging
        setup.listItemCollectionPositionNext = setup.listItemCollectionPositionNext || ""; // for paging
        // protect & into ListItemCollectionPositionNext
        if (setup.listItemCollectionPositionNext) setup.listItemCollectionPositionNext = setup.listItemCollectionPositionNext.replace(/&/g,"&amp;").replace(/&amp;amp;/g,"&amp;");

        // if setup.where is an array, then it means we want to do several requests
        // so we keep the first WHERE
        if (SPIsArray(setup.where)) {
          setup.where = setup.where.slice(0); // clone the original array
          if (!setup.originalWhere) setup.originalWhere = setup.where.slice(0);
          setup.nextWhere = setup.where.slice(1);
          setup.where = setup.where.shift();
        } else {
          setup.originalWhere = setup.where;
          setup.nextWhere = [];
        }
        // we use the progress only when WHERE is an array
        setup.progress = setup.progress || (function() {});

        // if view is defined, then we need to find the view ID
        if (setup.view !== "") {
          // retrieve the View ID based on its name
          // and find the view details
          _this.view(setup.view).then(function(view) {
            setup.view=view.ID;
            var where = (setup.whereCAML ? setup.where : _this.parse(setup.where));
            // if we have a 'DateRangesOverlap' then we want to move this part at the end -- since v3.0.9
            var mtchDateRanges = view.WhereCAML.match(/^<And>(<DateRangesOverlap>.*<\/DateRangesOverlap>)(.*)<\/And>$/);
            if (mtchDateRanges && mtchDateRanges.length === 3) view.WhereCAML = '<And>'+mtchDateRanges[2]+mtchDateRanges[1]+'</And>'
            where += view.WhereCAML;
            if (setup.where !== "" && view.WhereCAML !== "") where = "<And>" + where + "</And>";
            setup.where=where;
            setup.fields += (setup.fields===""?"":",") + view.Fields.join(",");
            setup.orderby += (setup.orderby===""?"":",") + view.OrderBy;
            setup.whereCAML=true;
            setup.useOWS=true;
            // disable the calendar option
            setup.calendarViaView=setup.calendar;
            setup.calendar=false;
            delete setup.view;
            _this.get(setup).then(function(res) { prom_resolve(res) }, function(rej) { prom_reject(rej) });
          });
          return;
        }
        // what about the fields ?
        var fields="", i, orderby="", fieldsDir, direction, splt, groupby="", gFields, tmpFields, body="", viewAttr, where="", whereDateRanges;
        if (setup.fields.length>0) {
          if (typeof setup.fields === "string") setup.fields = setup.fields.replace(/^\s+/,"").replace(/\s+$/,"").replace(/( )?,( )?/g,",").split(",");
          for (i=0; i<setup.fields.length; i++) fields += '<FieldRef Name="'+setup.fields[i]+'" />';
        }

        // what about sorting ?
        if (setup.orderby !== "") {
          fieldsDir = setup.orderby.split(",");
          for (i=0; i<fieldsDir.length; i++) {
            direction = "ASC";
            splt      = fieldsDir[i].trim().split(" ");
            if (splt.length > 0) {
              if (splt.length==2) direction = splt[1].toUpperCase();
              orderby += '<FieldRef Name="'+splt[0]+'" Ascending="'+(direction=="ASC")+'" />';
            }
          }
        }
        // if calendar:true and no orderby, then we order by the EventDate
        if ((setup.calendar===true||setup.calendarViaView===true) && orderby==="") orderby = '<FieldRef Name="EventDate" Ascending="ASC" />'

        // what about groupby ?
        if (setup.groupby !== "") {
          gFields = setup.groupby.split(",");
          for (i=0; i<gFields.length; i++) groupby += '<FieldRef Name="'+gFields[i]+'" />';
        }

        // when it's a calendar we want to retrieve some fields by default
        if (setup.calendar===true || setup.calendarViaView===true) {
          tmpFields = ["Title", "EventDate", "EndDate", "Duration", "fAllDayEvent", "fRecurrence", "RecurrenceData", "ID"];
          for (i=0; i<tmpFields.length; i++) fields += '<FieldRef Name="'+tmpFields[i]+'" />';
        }

        // forge the parameters
        // if no queryOptions provided then we set the default ones
        if (setup.queryOptions === undefined) {
          setup._queryOptions = "<DateInUtc>"+setup.dateInUTC+"</DateInUtc>"
                             + "<Paging ListItemCollectionPositionNext=\""+setup.listItemCollectionPositionNext+"\"></Paging>"
                             + "<IncludeAttachmentUrls>True</IncludeAttachmentUrls>"
                             + (fields==="" ? "" : "<IncludeMandatoryColumns>False</IncludeMandatoryColumns>")
                             + "<ExpandUserField>"+setup.expandUserField+"</ExpandUserField>";
          // check if we want something related to the folders
          if (setup.folderOptions) {
            switch (setup.folderOptions.show) {
              case "FilesAndFolders_Recursive": viewAttr="RecursiveAll"; break
              case "FilesOnly_InFolder": viewAttr="FilesOnly"; break
              case "FilesAndFolders_InFolder": viewAttr=""; break
              case "FilesOnly_Recursive":
              default: viewAttr="Recursive"
            }
            setup._queryOptions += "<ViewAttributes Scope=\""+viewAttr+"\"></ViewAttributes>"
            if (setup.folderOptions.path) setup._queryOptions += "<Folder>"+_this.url + '/' + _this.listID + '/' + setup.folderOptions.path+"</Folder>"
          } else
            setup._queryOptions += "<ViewAttributes Scope=\"Recursive\"></ViewAttributes>"
        } else setup._queryOptions = setup.queryOptions
        if (setup.calendarOptions) {
          setup._queryOptions += "<CalendarDate>" + setup.calendarOptions.referenceDate + "</CalendarDate>"
                              +  "<RecurrencePatternXMLVersion>v3</RecurrencePatternXMLVersion>"
                              +  "<ExpandRecurrence>"+setup.calendarOptions.splitRecurrence+"</ExpandRecurrence>";
        }

        // what about the Where ?
        if (setup.where !== "") {
          if (setup.whereCAML) where=setup.where;
          else where=_this.parse(setup.where);
        }
        if (setup.calendar===true) {
          whereDateRanges = "<DateRangesOverlap>"
                          + "<FieldRef Name='EventDate' />"
                          + "<FieldRef Name='EndDate' />"
                          + "<FieldRef Name='RecurrenceID' />"
                          + "<Value Type='DateTime'><" + setup.calendarOptions.range + " /></Value>" /* there is a property called IncludeTimeValue="TRUE" */
                          + "</DateRangesOverlap>"
          if (where !== "") where = "<And>" + where + whereDateRanges + "</And>";
          else where = whereDateRanges;
        }
        where = setup.whereFct(where);
        body = "<listName>"+_this.listID+"</listName>"
              + "<viewName>"+(setup.viewID||"")+"</viewName>"
              + "<query>"
              + "<Query>"
              + ( where!="" ? "<Where>"+ where +"</Where>" : "" )
              + ( groupby!="" ? "<GroupBy>"+groupby+"</GroupBy>" : "" )
              + ( orderby!="" ? "<OrderBy"+(setup.useIndexForOrderBy ? " UseIndexForOrderBy='TRUE' Override='TRUE'": "")+">"+orderby+"</OrderBy>" : "" )
              + "</Query>"
              + "</query>"
              + "<viewFields>"
              + "<ViewFields Properties='True'>"
              + fields
              + "</ViewFields>"
              + "</viewFields>"
              + "<rowLimit>"+setup.rowlimit+"</rowLimit>"
              + "<queryOptions>"
              + "<QueryOptions>"
              + setup._queryOptions
              + "</QueryOptions>"
              + "</queryOptions>";
        body = _this._buildBodyForSOAP("GetListItems", body);
        // do the request
        _this.ajax({
          url: _this.url + "/_vti_bin/Lists.asmx",
          body: body
        }).then(function(data) {
          var rows, i, j, stop, collection, on, aResult, prevIndex, index, listIndexFound, nextPage,
              joinDataLen, tmp, attributes, attributesReturn, attr, attributesJoinData, joinIndexLen, idx, sp,
              joinData, joinIndex, joinWhereLookup, wh, aReturn;
          // we want to use myElem to change the getAttribute function
          rows=data.getElementsByTagName('z:row');
          if (rows.length===0) rows=data.getElementsByTagName('row'); // for Chrome 'bug'
          aReturn = fastMap(rows, function(row) { return myElem(row); });

          // if setup.results length is bigger than 0 then it means we need to add the current data
          if (setup.results.length>0)
            for (i=0,stop=aReturn.length; i<stop; i++) setup.results.push(aReturn[i])

          // depending of the setup.nextWhere length we update the progress
          if (typeof setup.originalWhere !== "string")
            setup.progress(setup.originalWhere.length-setup.nextWhere.length,setup.originalWhere.length);

          // if paging we want to return ListItemCollectionPositionNext
          if (setup.paging) {
            collection = data.getElementsByTagName("rs:data")[0];
            if (typeof collection === "undefined" || collection.length==0) {
              collection=data.getElementsByTagName("data")[0]; // for Chrome
            }
            if (collection) nextPage = collection.getAttribute("ListItemCollectionPositionNext");
          }

          // if we have a paging then we need to do the request again
          if (setup.paging && --setup.page > 0) {
            // check if we need to go to another request
            if (setup.results.length===0) setup.results=aReturn;
            // notify that we keep loading
            setup.progress(setup.results.length);
            if (nextPage) {
              // we need more calls
              setup.listItemCollectionPositionNext=_this._cleanString(nextPage);
              _this.get(setup).then(function(res) { prom_resolve(res) }, function(rej) { prom_reject(rej) });
              return;
            } else {
              aReturn = setup.results
              // it means we're done, no more call
            }
          } else if (setup.nextWhere.length>0) { // if we need to so some more request
            if (setup.results.length===0) setup.results=aReturn
            setup.where = setup.nextWhere.slice(0);
            _this.get(setup).then(function(res) { prom_resolve(res) }, function(rej) { prom_reject(rej) });
            return;
          } else {
            // rechange setup.where with the original one just in case it was an array to make sure we didn't override the original array
            setup.where = setup.originalWhere;
            aReturn = (setup.results.length>0?setup.results:aReturn);
          }

          // we have data from a previous list, so let's merge all together the both of them
          if (setup.joinData) {
            on = setup.joinData["noindex"];
            aResult = [];
            prevIndex="";
            listIndexFound={length:0};
            if (!on.length) alert("$SP.get() -- Error 'get': you must define the ON clause when JOIN is used.");
            // we have a linked list so do some stuff here to tie the two lists together
            for (i=0,stop=aReturn.length; i<stop; i++) {
              index="";
              for (j=0; j<on.length; j++) index += "_"+_this.getLookup(aReturn[i].getAttribute(on[j][_this.listID])).id;
              // check if the index exists in the previous set of data
              if (setup.joinData[index]) {
                if (prevIndex!==index) {
                  if (!listIndexFound[setup.joinIndex[index]]) listIndexFound.length++;
                  listIndexFound[setup.joinIndex[index]]=true;
                  prevIndex=index;
                }
                // we merge the joinData and the aReturn
                for (j=0,joinDataLen=setup.joinData[index].length; j<joinDataLen; j++) {
                  tmp=[];
                  // find the attributes for the current list
                  attributesReturn=aReturn[i].getAttributes();
                  for (attr=attributesReturn.length; attr--;) {
                    tmp[_this.listID+"."+attributesReturn[attr].nodeName.slice(4)] = attributesReturn[attr].nodeValue;
                  }
                  // now find the attributes for the joinData
                  attributesJoinData=setup.joinData[index][j].getAttributes();
                  for (attr in attributesJoinData) {
                    tmp[attr] = setup.joinData[index][j].getAttribute(attr);
                  }

                  aResult.push(new extendMyObject(tmp));
                }
              }
              // for the default options
              if (setup.innerjoin) setup.join=setup.innerjoin;
              if (setup.outerjoin) {
                setup.join=setup.outerjoin;
                setup.join.outer=true;
              }

            }
            aReturn=aResult;

            // if there is a WHERE clause then we want to force to an innerjoin
            // except where setup.where equals to setup.onLookupWhere
            if (setup.where && setup.where!==setup.onLookupWhere && setup.outer) setup.outer=false;

            // if we want to do an outerjoin we link the missing data
            if (setup.outer) {
              joinIndexLen=setup.joinIndex.length;
              if (listIndexFound.length < joinIndexLen) {
                for (i=0; i<joinIndexLen; i++) {
                  if (listIndexFound[i] !== true) {
                    idx = setup.joinIndex[i];
                    if (idx===undefined || setup.joinData[idx]===undefined) continue
                    for (j=0,joinDataLen=setup.joinData[idx].length; j<joinDataLen; j++) {
                      tmp=[];
                      attributesJoinData=setup.joinData[idx][j].getAttributes();
                      for (attr in attributesJoinData) {
                        tmp[attr] = setup.joinData[idx][j].getAttribute(attr);
                      }
                      aResult.push(new extendMyObject(tmp));
                    }
                  }
                }
              }
            }
          }

          if (setup.outerjoin) {
            setup.join=setup.outerjoin;
            setup.join.outer=true;
          }
          else if (setup.innerjoin) setup.join=setup.innerjoin;
          // if we join it with another list
          if (setup.join) {
            joinData=[];
            joinIndex=[];
            joinWhereLookup=[];
            // retrieve the ON clauses
            if (setup.join.onLookup) setup.join.on="'"+setup.join.list+"'."+setup.join.onLookup+" = '"+_this.listID+"'.ID";
            on=_this._parseOn(setup.join.on);
            joinData["noindex"]=on; // keep a copy of it for the next treatment in the tied list
            for (i=0,stop=aReturn.length; i<stop; i++) {
              // create an index that will be used in the next list to filter it
              index="",tmp=[];
              for (j=0; j<on.length; j++) index += "_"+_this.getLookup(aReturn[i].getAttribute(on[j][_this.listID]) || aReturn[i].getAttribute(_this.listID+"."+on[j][_this.listID])).id;
              if (!joinData[index]) {
                joinIndex[index]=joinIndex.length;
                joinIndex.push(index);
                joinData[index] = [];
                // if onLookup then we will store the current ID with the ~ to use it in a where clause with IN operator
                if (setup.join.onLookup && index!=="_") joinWhereLookup.push("~"+index.slice(1))
              }
              // if we are coming from some other join
              if (setup.joinData) {
                joinData[index].push(aReturn[i]);
              } else {
                attributes=aReturn[i].getAttributes();
                for (j=attributes.length; j--;) {
                  tmp[_this.listID+"."+attributes[j].nodeName.slice(4)] = attributes[j].nodeValue;
                }
                joinData[index].push(new extendMyObject(tmp));
              }
            }
            delete setup.joinData;
            // call the joined list to grab data and process them
            // if onLookup then we create a WHERE clause with IN operator
            if (setup.join.onLookup) {
              if (joinWhereLookup.length>0) {
                // SP2013 limits to 60 items per IN
                wh=SPArrayChunk(joinWhereLookup, 60);
                for (j=0; j<wh.length; j++) {
                  wh[j] = setup.join.onLookup+' IN ["'+wh[j].join('","')+'"]'
                }
                // if the WHERE is too big then the server could run out of memory
                if (wh.length <= _SP_MAXWHERE_ONLOOKUP) {
                  wh = "(" + wh.join(" OR ") + ")";
                  // now we add this WHERE into the existing where
                  if (setup.join.where) {
                    if (SPIsArray(setup.join.where)) {
                      setup.join.where.forEach(function(e,i) { setup.join.where[i]=wh + " AND ("+e+")" })
                    } else {
                      setup.join.where=wh + " AND (" + setup.join.where + ")";
                    }
                  } else setup.join.where=wh
                  setup.join.onLookupWhere=wh;
                } else {
                  // in that case we'll use paging
                  setup.join.paging=true;
                }
              }
              // make sure the lookup fields is in the fields list
              if (!setup.join.fields) setup.join.fields=[];
              if (!SPIsArray(setup.join.fields)) {
                tmp=setup.join.fields.split(",");
                tmp.push(setup.join.onLookup);
                setup.join.fields=tmp.join(",");
              } else setup.join.fields.push(setup.join.onLookup);
            }
            sp=_this.list(setup.join.list,setup.join.url||_this.url);
            setup.join.joinData=joinData;
            setup.join.joinIndex=joinIndex;
            sp.get(setup.join).then(function(res) { prom_resolve(res) }, function(rej) { prom_reject(rej) });
            return;
          }

          aReturn["NextPage"]=nextPage;
          prom_resolve(aReturn)
        },
        function(rej) {
          prom_reject(rej)
        });
      });
    },
    /**
      @name $SP().list.createFile
      @function
      @category files
      @description Create/Upload a file into a Document library

      @param {Object} setup Options (see below)
        @param {ArrayBuffer} setup.content The file content
        @param {String} setup.filename The relative path (within the document library) to the file to create
        @param {Object} [setup.fields] If you want to set some fields for the created document
        @param {Function} [setup.progress=function(percentage){}] The upload progress in percentage
      @return {Promise} resolve(object that represents the file), reject(error)

      @example
      $SP().list("Documents", "http://my.other.site/website/").createFile({
        content:"*ArrayBuffer*",
        filename:"Demo/HelloWorld.txt"
      }).then(function(file) {
        console.log(file.Url+" has been created")
      }, function(error) {
        console.log("Error: ",error)
      })

      // create a text document with some fields
      $SP().list("Shared Documents").createFile({
        content:"ArrayBuffer*",
        filename:"SubFolder/myfile.txt",
        fields:{
          "Title":"My Document",
          "File_x0020_Description":"This is my file!"
        }
      }).then(function(file) {
        alert("File "+file.Name+" created at " + file.Url);
      });

      // NOTE: in some cases the files are automatically checked out, so you have to use $SP().checkin()
    */
    createFile:function(setup) {
      var _this=this;
      return _this._promise(function(prom_resolve, prom_reject) {
        // check if we need to queue it
        if (_this.needQueue) { return _this._addInQueue(arguments) }
        // default values
        setup = setup || {};
        if (setup.content === undefined) throw "[SharepointPlus 'createFile']: the file content is required.";
        if (setup.filename === undefined) throw "[SharepointPlus 'createFile']: the filename is required.";
        if (!_this.listID) throw "[SharepointPlus 'createFile']: the library name is required.";
        setup.extendedFields = setup.extendedFields || "";
        setup.progress=setup.progress||function(){};
        // we now decide what to do based on if we have REST
        // if no, then relay on Copy Web Service
        _this.hasREST().then(function(hasREST) {
          if (!hasREST) {
            // use Copy Web Service
            // if we have setup.fields, then we need to figure out the Type using $SP().list().info()
            if (setup.fields && !setup.extendedFields) {
              _this.info().then(function(fields) {
                // we use extendedFields to define the Type
                for (var i=fields.length; i--;) {
                  if (setup.fields[fields[i]["StaticName"]]) {
                    setup.extendedFields += '<FieldInformation Type="'+fields[i]["Type"]+'" Value="'+setup.fields[fields[i]["StaticName"]]+'" DisplayName="'+fields[i]["StaticName"]+'" InternalName="'+fields[i]["StaticName"]+'" />'
                  }
                }
                if (!setup.extendedFields) delete setup.fields;
                if (setup.useCallback) _this.createFile(setup);
                else _this.createFile(setup).then(function(res) { prom_resolve(res) }, function(rej) { prom_reject(rej) })
              });
              return;
            }
            var destination = "/" + setup.library + "/" + setup.filename
            destination = (setup.url + destination).replace(/([^:]\/)\//g,"$1");
            if (destination.slice(0,4) !== "http") destination=window.location.protocol + "//" + window.location.host + destination;
            setup.content=SPArrayBufferToBase64(setup.content); // ArrayBuffer to Base64 String
            var soapEnv = "<SourceUrl>http://null</SourceUrl>"
                          +"<DestinationUrls><string>"+destination+"</string></DestinationUrls>"
                          +'<Fields><FieldInformation Type="File" />'+setup.extendedFields+'</Fields>'
                          +"<Stream>"+setup.content+"</Stream>"
            soapEnv = _this._buildBodyForSOAP("CopyIntoItems", soapEnv);
            _this.ajax({
              url: _this.url + "/_vti_bin/copy.asmx",
              body: soapEnv,
              onprogress:function(evt) {
                if (evt.lengthComputable) {
                  setup.progress(parseInt(evt.loaded / evt.total * 100));
                }
              },
              headers:{'SOAPAction':'http://schemas.microsoft.com/sharepoint/soap/CopyIntoItems'}
            }).then(function(data) {
              var a = data.getElementsByTagName('CopyResult');
              if (a && a[0] && a[0].getAttribute("ErrorCode") !== "Success") {
                prom_reject("[SharepointPlus 'createFile'] Error creating ("+destination+"): "+a[0].getAttribute("ErrorCode")+" - "+a[0].getAttribute("ErrorMessage"));
              } else {
                prom_resolve({Url:destination, Name:setup.filename});
              }
            }, function(rej) {
              prom_reject(rej);
            });
          } else {
            // use REST API
            // we need to find the RootFolder for the list
            _this.info().then(function(infos) {
              var rootFolder = infos._List.RootFolder;
              var folder = setup.filename.split("/");
              var filename = setup.filename;
              var file = {};
              if (folder.length > 1) {
                filename=folder.slice(-1);
                folder="/"+folder.slice(0,-1).join("/");
              }
              else folder="";
              folder = rootFolder+folder;
              _this.ajax({
                url: _this.url+"/_api/web/GetFolderByServerRelativeUrl('"+encodeURIComponent(folder)+"')/files/add(url='"+encodeURIComponent(filename)+"',overwrite=true)",
                body: setup.content,
                onprogress:function(evt) {
                  if (evt.lengthComputable) {
                    setup.progress(parseInt(evt.loaded / evt.total * 100));
                  }
                }
              }).then(function(body) {
                file.Url=_this.url.split("/").slice(0,3).join("/")+body.d.ServerRelativeUrl;
                SPExtend(true, file, body.d);
                // if we want to update some fields
                if (setup.fields) {
                  // using "ListItemAllFields.__deferred.uri" we can find the URL to get details about the uploaded file
                  return _this.ajax({url:body.d.ListItemAllFields.__deferred.uri})
                } else {
                  prom_resolve()
                }
              }).then(function(body) {
                SPExtend(true, file, body.d);
                var params={ID:file.ID};
                SPExtend(params, setup.fields);
                return _this.update(params);
              }).then(function(rows) {
                var attributes=rows[0].attributes;
                for (var j=attributes.length; j--;) {
                  file[attributes[j].nodeName]=attributes[j].nodeValue;
                }
                prom_resolve(file)
              }).catch(function(err) { prom_reject(err) });
            })
          }
        })
      })
    },
    /**
      @name $SP().list.createFolder
      @function
      @category files
      @description Create a folter in a Document library

      @param {String} path The relative path to the new folder
      @return {Promise} resolve(folder details), reject(error)

      @example
      // create a folder called "first" at the root of the Shared Documents library
      // the result should be "http://mysite/Shared Documents/first/"
      $SP().list("Shared Documents").createFolder("first").then(function(folder) { alert("Folder created!"); })

      // create a folder called "second" under "first"
      // the result should be "http://mysite/Shared Documents/first/second/"
      // if "first" doesn't exist then it will return an error
      $SP().createFolder("first/second").then(function(folder) { alert("Folder created!"); }

      // Note: To delete a folder you can use $SP().list().remove() with ID and FileRef parameters
    */
    createFolder:function(folderPath) {
      // default values
      var _this=this;
      return _this._promise(function(prom_resolve, prom_reject) {
        // check if we need to queue it
        if (_this.needQueue) { return _this._addInQueue(arguments) }
        if (folderPath === undefined) throw "[SharepointPlus 'createFolder']: the folder path is required.";
        // split the path based on '/'
        var path=folderPath, toAdd=[], tmpPath="", i, folder={};
        // trim "/" at the beginning and end
        if (path.charAt(0)==="/") path=path.slice(1);
        if (path.slice(-1)==="/") path=path.slice(0,-1);
        path=path.split('/');
        for (i=0; i<path.length; i++) {
          tmpPath += (i>0?'/':'') + path[i];
          toAdd.push({FSObjType:1, BaseName:tmpPath})
        }
        _this.add(toAdd).then(function(rows) {
          var attributes=rows[0].attributes;
          for (var j=attributes.length; j--;) {
            folder[attributes[j].nodeName]=attributes[j].nodeValue;
          }
          prom_resolve(folder)
        }, function(error) { prom_reject(error) });
      })
    },
    /**
      @name $SP().checkin
      @function
      @category files
      @description Checkin a file

      @param {Object} [setup] Options (see below)
        @param {String} setup.destination The full path to the file to check in
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
      }).catchfunction(error) {
        alert("Check in failed")
      })
    */
    checkin:function(setup) {
      // default values
      var _this=this;
      return _this._promise(function(prom_resolve, prom_reject) {
        setup     = setup || {};
        if (setup.destination == undefined) throw "[SharepointPlus 'checkin'] the file destination path is required.";
        if (!_this.url) throw "[SharepointPlus 'checkin']: not able to find the URL!"; // we cannot determine the url
        setup.comments = setup.comments || "";
        _this.ajax({
          url: _this.url + "/_vti_bin/Lists.asmx",
          body:_this._buildBodyForSOAP("CheckInFile", '<pageUrl>'+setup.destination+'</pageUrl><comment>'+setup.comments+'</comment><CheckinType>1</CheckinType>'),
          headers:{'SOAPAction':'http://schemas.microsoft.com/sharepoint/soap/CheckInFile'}
        }).then(function(data) {
          var res = data.getElementsByTagName('CheckInFileResult');
          if (res && res[0] && res[0].firstChild.nodeValue != "true") {
            prom_reject(res);
          } else {
            prom_resolve();
          }
          setup.after.call(_this);
        }, function(err) { prom_reject(err) });
      })
    },
    /**
      @name $SP().list.addAttachment
      @function
      @description Add an attachment to a Sharepoint List Item

      @param {Object} setup Options (see below)
        @param {Number} setup.ID The item ID to attach the file
        @param {String} setup.filename The name of the file
        @param {String} setup.attachment An array buffer of the file content
      @return {Promise} resolve(fileURL), reject()

      @example
      $SP().list("My List").addAttachment({
        ID:1,
        filename:"helloworld.txt",
        attachment:"*ArrayBuffer*"
      }).then(function(fileURL) {
        alert(fileURL)
      });
    */
    addAttachment:function(setup) {
      var _this=this;
      return _this._promise(function(prom_resolve, prom_reject) {
        // check if we need to queue it
        if (_this.needQueue) { return _this._addInQueue(arguments) }
        if (arguments.length===0) throw "[SharepointPlus 'addAttachment']: the arguments are mandatory.";
        if (!_this.listID) throw "[SharepointPlus 'addAttachment']: you need to use list() to define the list name.";
        if (typeof setup.ID === "undefined") throw "[SharepointPlus 'addAttachment']: the item ID is required.";
        if (typeof setup.filename === "undefined") throw "[SharepointPlus 'addAttachment']: the filename is required.";
        if (typeof setup.attachment === "undefined") throw "[SharepointPlus 'addAttachment']: the ArrayBuffer of the attachment's content is required.";
        _this.ajax({
          url: _this.url + "/_vti_bin/Lists.asmx",
          body: _this._buildBodyForSOAP("AddAttachment", "<listName>"+_this.listID+"</listName><listItemID>"+setup.ID+"</listItemID><fileName>"+setup.filename+"</fileName><attachment>"+setup.attachment+"</attachment>"),
          headers:{'SOAPAction': 'http://schemas.microsoft.com/sharepoint/soap/AddAttachment' }
        }).then(function(data) {
          var res = data.getElementsByTagName('AddAttachmentResult');
          var fileURL = "";
          if (res && res[0]) fileURL = _this.getURL() + "/" + res[0].firstChild.nodeValue;
          if (!fileURL) prom_reject(res);
          else prom_resolve(fileURL);
        }, function(error) { prom_reject(error) });
      })
    },
    /**
      @name $SP().list.getAttachment
      @function
      @description Get the attachment(s) for an item

      @param {String|Number} itemID The item ID
      @return {Promise} resolve([results])

      @example
      $SP().list("My List","http://my.site.com/mydir/").getAttachment(1).then(function(attachments) {
        for (var i=0; i&lt;attachments.length; i++) console.log(attachments[i]);
      });

      // you can also use $SP().list().get() using the "Attachments" field
    */
    getAttachment:function(itemID) {
      var _this=this;
      return _this._promise(function(prom_resolve, prom_reject) {
        // check if we need to queue it
        if (_this.needQueue) { return _this._addInQueue(arguments) }
        if (!_this.listID) throw "[SharepointPlus 'getAttachment']: the list ID/Name is required";
        if (!_this.url) throw "[SharepointPlus 'getAttachment']: not able to find the URL!"; // we cannot determine the url
        // do the request
        _this.ajax({
          url: _this.url + "/_vti_bin/lists.asmx",
          body: _this._buildBodyForSOAP("GetAttachmentCollection", "<listName>"+_this.listID+"</listName><listItemID>"+itemID+"</listItemID>"),
          headers:{'SOAPAction':'http://schemas.microsoft.com/sharepoint/soap/GetAttachmentCollection'}
        }).then(function(data) {
          var aReturn = [], i=0, a = data.getElementsByTagName('Attachment');
          for (; i < a.length; i++) aReturn.push(a[i].firstChild.nodeValue);
          prom_resolve(aReturn)
        }, function(err) { prom_reject(err) });
      })
    },
    /**
      @name $SP().list.getContentTypes
      @function
      @description Get the Content Types for the list (returns Name, ID and Description)

      @param {Object} [options]
        @param {Boolean} [options.cache=true] Do we want to use the cache on recall for this function?
      @return {Promise} resolve(contentTypes), reject(error)

      @example
      $SP().list("List Name").getContentTypes().then(function(contentTypes) {
        for (var i=0; i&lt;contentTypes.length; i++) console.log(contentTypes[i].Name, contentTypes[i].ID, contentTypes[i].Description);
      });
    */
    getContentTypes:function(options) {
      var _this=this;
      return _this._promise(function(prom_resolve, prom_reject) {
        // check if we need to queue it
        if (_this.needQueue) { return _this._addInQueue(arguments) }
        if (!_this.listID) throw "[SharepointPlus 'getContentTypes'] the list ID/name is required.";
        // default values
        if (!_this.url) throw "[SharepointPlus 'getContentTypes'] not able to find the URL!"; // we cannot determine the url

        // check the Cache
        options=options||{cache:true};
        if (options.cache) {
          for (var i=0; i<_SP_CACHE_CONTENTTYPES.length; i++) {
            if (_SP_CACHE_CONTENTTYPES[i].list === _this.listID && _SP_CACHE_CONTENTTYPES[i].url === _this.url) {
              prom_resolve(_SP_CACHE_CONTENTTYPES[i].contentTypes);
              return;
            }
          }
        }

        // do the request
        _this.ajax({
          url: _this.url + "/_vti_bin/lists.asmx",
          body: _this._buildBodyForSOAP("GetListContentTypes", '<listName>'+_this.listID+'</listName>'),
          headers:{'SOAPAction':'http://schemas.microsoft.com/sharepoint/soap/GetListContentTypes'}
        }).then(function(data) {
          var arr = data.getElementsByTagName('ContentType'), ID, i=0, aReturn = [];
          for (; i < arr.length; i++) {
            ID = arr[i].getAttribute("ID");
            if (ID) {
              aReturn.push({
                "ID":ID,
                "Name":arr[i].getAttribute("Name"),
                "Description":arr[i].getAttribute("Description")
              });
            }
          }
          // we cache the result
          _SP_CACHE_CONTENTTYPES.push({"list":_this.listID, "url":_this.url, "contentTypes":aReturn});
          prom_resolve(aReturn);
        }, function(err) { prom_reject(err) });
      })
    },
    /**
      @name $SP().list.getContentTypeInfo
      @function
      @description Get the Content Type Info for a Content Type into the list

      @param {String} contentType The Name or the ID (from $SP().list.getContentTypes) of the Content Type
      @param {Object} [options]
        @param {Boolean} [options.cache=true] Do we use the cache?
      @return {Promise} resolve(fields), reject(error)

      @example
      $SP().list("List Name").getContentTypeInfo("Item").then(function(fields) {
        for (var i=0; i&lt;fields.length; i++) console.log(fields[i]["DisplayName"]+ ": "+fields[i]["Description"]);
      });

      $SP().list("List Name").getContentTypeInfo("0x01009C5212B2D8FF564EBE4873A01C57D0F9001").then(function(fields) {
        for (var i=0; i&lt;fields.length; i++) console.log(fields[i]["DisplayName"]+ ": "+fields[i]["Description"]);
      });
    */
    getContentTypeInfo:function(contentType, options) {
      var _this=this;
      return _this._promise(function(prom_resolve, prom_reject) {
        // check if we need to queue it
        if (_this.needQueue) { return _this._addInQueue(arguments) }
        if (!_this.listID) throw "[SharepointPlus 'getContentTypeInfo'] the list ID/Name is required.";
        if (arguments.length >= 1 && typeof contentType !== "string") throw "[SharepointPlus 'getContentTypeInfo'] the Content Type Name/ID is required.";
        // default values
        if (!_this.url) throw "[SharepointPlus 'getContentTypeInfo'] not able to find the URL!"; // we cannot determine the url
        options=options||{cache:true}

        // look at the cache
        if (options.cache) {
          for (var i=0; i<_SP_CACHE_CONTENTTYPE.length; i++) {
            if (_SP_CACHE_CONTENTTYPE[i].list === _this.listID && _SP_CACHE_CONTENTTYPE[i].url === _this.url && _SP_CACHE_CONTENTTYPE[i].contentType === contentType) {
              prom_resolve(_SP_CACHE_CONTENTTYPE[i].info);
            }
          }
        }

        // do we have a Content Type Name or ID ?
        if (contentType.slice(0,2) !== "0x") {
          // it's a Name so get the related ID using $SP.list.getContentTypes
          _this.getContentTypes(options).then(function(types) {
            var found=false;
            for (var i=types.length; i--;) {
              if (types[i]["Name"]===contentType) {
                _this.getContentTypeInfo(types[i]["ID"], options).then(function(res) { prom_resolve(res) }, function(rej) { prom_reject(rej) });
                found=true;
                break;
              }
            }
            if (!found) throw "[SharepointPlus 'getContentTypeInfo'] not able to find the Content Type called '"+contentType+"' at "+_this.url;
          });
          return;
        }

        // do the request
        _this.ajax({
          url: _this.url + "/_vti_bin/lists.asmx",
          body: _this._buildBodyForSOAP("GetListContentType", '<listName>'+_this.listID+'</listName><contentTypeId>'+contentType+'</contentTypeId>'),
          headers:{'SOAPAction':'http://schemas.microsoft.com/sharepoint/soap/GetListContentType'}
        }).then(function(data) {
          var aReturn = [], i, j, a, r, k, q, arr = data.getElementsByTagName('Field'), index = 0, aIndex, attributes, attrName, lenDefault, attrValue, nodeDefault;
          for (i=0; i < arr.length; i++) {
            if (arr[i].getAttribute("ID")) {
              aReturn[index] = [];
              aIndex=aReturn[index];
              attributes=arr[i].attributes;
              for (j=attributes.length; j--;) {
                attrName=attributes[j].nodeName;
                attrValue=attributes[j].nodeValue;
                if (attrName==="Type") {
                  switch (attrValue) {
                    case "Choice":
                    case "MultiChoice": {
                      aIndex["FillInChoice"] = arr[i].getAttribute("FillInChoice");
                      a=arr[i].getElementsByTagName("CHOICE");
                      r=[];
                      for(k=0; k<a.length; k++) r.push(a[k].firstChild.nodeValue);
                      aIndex["Choices"]=r;
                      break;
                    }
                    case "Lookup":
                    case "LookupMulti":
                      aIndex["Choices"]={list:arr[i].getAttribute("List"),field:arr[i].getAttribute("ShowField")};
                      break;
                    default:
                      aIndex["Choices"] = [];
                  }
                }
                aIndex[attrName]= attrValue;
              }
              // find the default values
              lenDefault=arr[i].getElementsByTagName("Default").length;
              if (lenDefault>0) {
                nodeDefault=arr[i].getElementsByTagName("Default");
                aReturn[index]["DefaultValue"]=[];
                for (q=0; q<lenDefault; q++) nodeDefault[q].firstChild && aReturn[index]["DefaultValue"].push(nodeDefault[q].firstChild.nodeValue);
                if (lenDefault===1) aReturn[index]["DefaultValue"]=aReturn[index]["DefaultValue"][0];
              } else aReturn[index]["DefaultValue"]=null;
              index++;
            }
          }
          // we cache the result
          _SP_CACHE_CONTENTTYPE.push({"list":_this.listID, "url":_this.url, "contentType":contentType, "info":aReturn});
          prom_resolve(aReturn);
        }, function(err) { prom_reject(err) })
      })
    },
    /**
      @name $SP().list.info
      @function
      @description Get the columns' information/metadata, and the list's details

      @return {Promise} resolve(infos), reject(error)

      @example
      $SP().list("List Name").info().then(function(infos) {
        // for columns' details:
        for (var i=0; i&lt;infos.length; i++) console.log(infos[i]["DisplayName"]+ ": => "+infos[i]);
        // for list's details:
        console.log(infos._List)
      });
    */
    info:function() {
      var _this=this;
      return _this._promise(function(prom_resolve, prom_reject) {
        // check if we need to queue it
        if (_this.needQueue) { return _this._addInQueue(arguments) }
        if (!_this.listID) throw "[SharepointPlus 'info'] the list ID/Name is required.";
        // default values
        if (!_this.url) throw "[SharepointPlus 'info'] not able to find the URL!"; // we cannot determine the url

        // do the request
        _this.ajax({
          url: _this.url + "/_vti_bin/lists.asmx",
          body: _this._buildBodyForSOAP("GetList", '<listName>'+_this.listID+'</listName>'),
          headers:{'SOAPAction':'http://schemas.microsoft.com/sharepoint/soap/GetList'}
        }).then(function(data) {
          var aReturn = [], arr = data.getElementsByTagName('Field'), index = 0, aIndex, attributes, attrName, attrValue, lenDefault, nodeDefault,i,j,a,r,k,nName,nValue;
          // retrieve list info first
          var listDetails = data.getElementsByTagName('List')[0];
          attributes=listDetails.attributes;
          aReturn["_List"]={};
          for (i=0; i<attributes.length; i++) {
            aReturn["_List"][attributes[i].nodeName]=attributes[i].nodeValue
          }
          // then retrieve fields info
          for (i=0; i < arr.length; i++) {
            if (arr[i].getAttribute("ID")) {
              aReturn[index] = [];
              aIndex=aReturn[index];
              attributes=arr[i].attributes;
              for (j=attributes.length; j--;) {
                attrName=attributes[j].nodeName;
                attrValue=attributes[j].nodeValue;
                if (attrName==="Type") {
                  switch (attrValue) {
                    case "Choice":
                    case "MultiChoice": {
                      aIndex["FillInChoice"] = arr[i].getAttribute("FillInChoice");
                      a=arr[i].getElementsByTagName("CHOICE");
                      r=[];
                      for(k=0; k<a.length; k++) r.push(a[k].firstChild.nodeValue);
                      aIndex["Choices"]=r;
                      break;
                    }
                    case "Lookup":
                    case "LookupMulti":
                      aIndex["Choices"]={list:arr[i].getAttribute("List"),field:arr[i].getAttribute("ShowField")};
                      break;
                    case "TaxonomyFieldType":
                    case "TaxonomyFieldTypeMulti": {
                      a=arr[i].getElementsByTagName("Property");
                      aIndex["Property"]={};
                      for(k=0; k<a.length; k++) {
                        nName=a[k].getElementsByTagName('Name');
                        nValue=a[k].getElementsByTagName('Value');
                        if (nName.length>0) aIndex["Property"][nName[0].firstChild.nodeValue]=(nValue.length>0?nValue[0].firstChild.nodeValue:null);
                      }
                      break;
                    }
                    default:
                      aIndex["Choices"] = [];
                  }
                }
                aIndex[attrName]= attrValue;
              }

              // find the default values
              lenDefault=arr[i].getElementsByTagName("Default").length;
              if (lenDefault>0) {
                nodeDefault=arr[i].getElementsByTagName("Default");
                aReturn[index]["DefaultValue"]=[];
                for (var q=0; q<lenDefault; q++) nodeDefault[q].firstChild && aReturn[index]["DefaultValue"].push(nodeDefault[q].firstChild.nodeValue);
                if (lenDefault===1) aReturn[index]["DefaultValue"]=aReturn[index]["DefaultValue"][0];
              } else aReturn[index]["DefaultValue"]=null;

              index++;
            }
          }
          prom_resolve(aReturn);
        }).then(function(error) { prom_reject(error) });
      })
    },
    /**
      @name $SP().list.view
      @function
      @description Get the view's details (like selected fields, order by, where, ....)

      @param {String} [viewID="The default view"] The view ID or view Name
      @param {Object} [options] (see below)
        @param {Boolean} [cache=true] Get the view's info from the cache
      @return {Promise} resolve({DefaultView, Name, ID, Type, Url, OrderBy, Fields, RowLimit, WhereCAML}), reject(error)

      @example
      $SP().list("List Name").view("All Items").then(function(res) {
        for (var i=0; i&lt;res.Fields.length; i++) console.log("Column "+i+": "+res.Fields[i]);
        console.log("And the GUI for this view is :"+res.ID);
      });
    */
    view:function(viewID, options) {
      var _this=this;
      return _this._promise(function(prom_resolve, prom_reject) {
        // check if we need to queue it
        if (_this.needQueue) { return _this._addInQueue(arguments) }
        if (!_this.listID) throw "[SharepointPlus 'view'] the list ID/Name is required.";
        if (!_this.viewID) throw "[SharepointPlus 'view'] the view ID/Name is required.";
        // default values
        var list = _this.listID, i, found=false;
        options.cache=(options.cache===false?false:true);
        if (!_this.url) throw "[SharepointPlus 'view'] not able to find the URL!"; // we cannot determine the url

        // check if we didn't save this information before
        if (options.cache) {
          _SP_CACHE_SAVEDVIEW.forEach(function(c) {
            if (c.url===_this.url && c.list===list && (c.viewID===viewID || c.viewName===viewID)) {
              found=true;
              prom_resolve(c.data);
            }
          })
          if (found) return;
        }

        // if viewID is not an ID but a name then we need to find the related ID
        if (viewID.charAt(0) !== '{') {
          _this.views().then(function(views) {
            found=false;
            for (i=views.length; i--;) {
              if (views[i].Name===viewID) {
                _this.view(views[i].ID).then(function(res) { prom_resolve(res) }, function(rej) { prom_reject(rej) });
                found=true;
                break;
              }
            }
            if (!found) throw "[SharepointPlus 'view'] not able to find the view called '"+viewID+"' for list '"+_this.listID+"' at "+_this.url;
          });
          return;
        }

        // do the request
        _this.ajax({
          url: _this.url + "/_vti_bin/Views.asmx",
          body: _this._buildBodyForSOAP("GetView", '<listName>'+_this.listID+'</listName><viewName>'+viewID+'</viewName>'),
          headers:{'SOAPAction':'http://schemas.microsoft.com/sharepoint/soap/GetView'}
        }).then(function(data) {
          var node=data.querySelector('View'), i, where;
          var oReturn = {DefaultView:(node.getAttribute("DefaultView")=="TRUE"), Name:node.getAttribute("DisplayName"), ID:viewID, Type:node.getAttribute("Type"), Url:node.getAttribute("Url"), OrderBy:[], Fields:[], RowLimit:"", WhereCAML:"", Node:node};
          var arr = data.getElementsByTagName('ViewFields')[0].getElementsByTagName('FieldRef');
          // find fields
          for ( i=0; i < arr.length; i++) oReturn.Fields.push(arr[i].getAttribute("Name"));
            // find orderby
          arr = data.getElementsByTagName('OrderBy');
          if (arr.length) {
            arr = arr[0].getElementsByTagName('FieldRef');
            for (i=0; i<arr.length; i++) oReturn.OrderBy.push(arr[i].getAttribute("Name")+" "+(arr[i].getAttribute("Ascending")==undefined?"ASC":"DESC"));
            oReturn.OrderBy=oReturn.OrderBy.join(",");
          }
          // find where
          where=data.getElementsByTagName('Where');
          if (where.length) {
            where=where[0].xml || (new XMLSerializer()).serializeToString(where[0]);
            where=where.match(/<Where [^>]+>(.*)<\/Where>/);
            if(where.length==2) oReturn.WhereCAML=where[1];
          }

          // cache the data
          found=false;
          _SP_CACHE_SAVEDVIEW.forEach(function(c) {
            if (c.url===_this.url && c.list===list && (c.viewID===viewID || c.viewName===viewID)) {
              c.data=oReturn;
              found=true;
            }
          })
          if (!found) _SP_CACHE_SAVEDVIEW.push({url:_this.url,list:_this.listID,data:oReturn,viewID:viewID,viewName:oReturn.Name});
          prom_resolve(oReturn);
        }, function(error) { prom_reject(error) })
      })
    },
    /**
      @name $SP().list.views
      @function
      @description Get the views' info for a List

      @param {Hash} [options]
        @param {Boolean} [cache=true] Get the info from the cache
      @return {Promise} resolve({DefaultView, Name, ID, Type, Url}), reject(error)

      @example
      $SP().list("My List").views().then(function(view) {
        for (var i=0; i&lt;view.length; i++) {
          console.log("View #"+i+": "+view[i].Name);
        }
      });

    */
    views:function(options) {
      var _this=this;
      return _this._promise(function(prom_resolve, prom_reject) {
        // check if we need to queue it
        if (_this.needQueue) { return _this._addInQueue(arguments) }
        if (!_this.listID) throw "[SharepointPlus 'views'] the list ID/Name is required.";
        options.cache = (options.cache === false ? false : true);

        // default values
        if (!_this.url) throw "[SharepointPlus 'views'] not able to find the URL!"; // we cannot determine the url

        // check the cache
        var found=false;
        if (options.cache) {
          _SP_CACHE_SAVEDVIEWS.forEach(function(c) {
            if (c.url===_this.url && c.listID === _this.listID) {
              found=true;
              prom_resolve(c.data);
            }
          })
          if (found) return;
        }

        // do the request
        _this.ajax({
          url: _this.url + "/_vti_bin/Views.asmx",
          body: _this._buildBodyForSOAP("GetViewCollection", '<listName>'+_this.listID+'</listName>'),
          headers:{'SOAPAction':'http://schemas.microsoft.com/sharepoint/soap/GetViewCollection'}
        }).then(function(data) {
          var aReturn = [], arr = data.querySelectorAll('View'), i=0, found=false;
          for (; i < arr.length; i++) {
            aReturn[i] = {
              ID: arr[i].getAttribute("Name"),
              Name: arr[i].getAttribute("DisplayName"),
              Url: arr[i].getAttribute("Url"),
              DefaultView:(arr[i].getAttribute("DefaultView")=="TRUE"),
              Type:arr[i].getAttribute("Type"),
              Node: arr[i]
            }
          }

          // scache
          _SP_CACHE_SAVEDVIEWS.forEach(function(c) {
            if (c.url===_this.url && c.listID === _this.listID) {
              c.data=aReturn;
              found=true;
            }
          })
          if (!found) _SP_CACHE_SAVEDVIEWS.push({url:_this.url,listID:_this.listID,data:aReturn});
          prom_resolve(aReturn);
        }, function(error) { prom_reject(error) });
      })
    },
    /**
      @name $SP().lists
      @function
      @description Get all the lists from the site

      @param {Object} [setup] Options (see below)
        @param {String} [setup.url='current website'] The website url
        @param {Boolean} [setup.cache=true] To get the result from the cache when available
      @return {Promise} resolve({ID, Name, Description, Url, .....}), reject(error)

      @example
      $SP().lists().then(function(lists) {
        for (var i=0; i&lt;lists.length; i++) console.log("List #"+i+": "+lists[i].Name);
      });
    */
    lists:function(setup) {
      var _this=this;
      return _this._promise(function(prom_resolve, prom_reject) {
        // default values
        setup = setup || {};
        // if we didn't define the url in the parameters, then we need to find it
        if (!setup.url) {
          _this.getURL()
          .then(function(url) { return _this.lists({url:url}) })
          .then(function(res) { prom_resolve(res) })
          .catch(function(rej) { prom_reject(rej) });
          return;
        }
        setup.cache=(setup.cache===false?false:true);

        // check cache
        var found=false;
        if (setup.cache) {
          _SP_CACHE_SAVEDLISTS.forEach(function(c) {
            if (c.url===setup.url) {
              found=true;
              prom_resolve(c.data)
            }
          })
          if (found) return;
        }

        // do the request
        _this.ajax({
          url:setup.url + "/_vti_bin/lists.asmx",
          body:_this._buildBodyForSOAP("GetListCollection", ""),
          headers:{'SOAPAction':'http://schemas.microsoft.com/sharepoint/soap/GetListCollection'}
        }).then(function(data) {
          var aReturn = [], arr = data.querySelectorAll('List'), i, attributes, attr;
          for (i=0; i < arr.length; i++) {
            attributes=arr[i].getAttributes();
            aReturn[i]={};
            for (attr in attributes) {
              aReturn[i][attr] = arr[i].getAttribute(attr);
            }
            aReturn[i].Url=arr[i].getAttribute("DefaultViewUrl")
          }

          // cache
          found=false;
          if (setup.cache) {
            _SP_CACHE_SAVEDLISTS.forEach(function(c) {
              if (c.url===setup.url) found=true;
            })
          }
          if (!found) _SP_CACHE_SAVEDLISTS.push({url:setup.url,data:aReturn});
          prom_resolve(aReturn);
        }).then(function(error) { prom_reject(error) })
      })
    },
    /**
      @name $SP().list.add
      @function
      @description Add items into a Sharepoint List
                   note: A Date must be provided as "YYYY-MM-DD" (only date comparison) or "YYYY-MM-DD hh:mm:ss" (date AND time comparison), or you can use $SP().toSPDate(new Date())
                   note: A person must be provided as "-1;#email" (e.g. "-1;#foo@bar.com") OR NT login with double \ (eg "-1;#europe\\foo_bar") OR the user ID
                   note SP2013: If "-1;#" doesn't work on Sharepoint 2013, then try with "i:0#.w|" (e.g. "i:0#.w|europe\\foo_bar") ("i:0#.w|" may vary based on your authentification system -- see https://social.technet.microsoft.com/wiki/contents/articles/13921.sharepoint-20102013-claims-encoding.aspx)
                   note: A lookup value must be provided as "X;#value", with X the ID of the value from the lookup list.
                         --> it should also be possible to not pass the value but only the ID, e.g.: "X;#"
                   note: A URL field must be provided as "http://www.website.com, Name"
                   note: A multiple selection must be provided as ";#choice 1;#choice 2;#", or just pass an array as the value and it will do the trick
                   note: A multiple selection of Lookup must be provided as ";#X;#Choice 1;#Y;#Choice 2;#" (with X the ID for "Choice 1", and "Y" for "Choice 2")
                         --> it should also be possible to not pass the values but only the ID, e.g.: ";#X;#;#Y;#;#"
                   note: A Yes/No checkbox must be provided as "1" (for TRUE) or "0" (for "False")
                   note: A Term / Taxonomy / Managed Metadata field must be provided as "0;#|UniqueIdentifier" for the special hidden related column (see https://github.com/Aymkdn/SharepointPlus/wiki/ to know more)
                   note: You cannot change the Approval Status when adding, you need to use the $SP().moderate function

      @param {Object|Array} items List of items (e.g. [{Field_x0020_Name: "Value", OtherField: "new value"}, {Field_x0020_Name: "Value2", OtherField: "new value2"}])
      @param {Object} [options] Options (see below)
        @param {Number} [options.packetsize=15] If you have too many items to add, then we use `packetsize` to cut them into several requests (because Sharepoint cannot handle too many items at once)
        @param {Function} [options.progress] (current,max) If you provide more than 15 items then they will be treated by packets and you can use "progress" to know more about the steps
        @param {Boolean} [options.escapeChar=true] Determines if we want to escape the special chars that will cause an error (for example '&' will be automatically converted to '&amp;amp;')
      @return {Promise} resolve({passed, failed}), reject(error)

      @example
      $SP().list("My List").add({Title:"Ok"});

      $SP().list("List Name").add([{Title:"Ok"}, {Title:"Good"}]).then(function(items) { alert("Done!"); });

      $SP().list("My List","http://my.sharepoi.nt/dir/").add({Title:"Ok"}).then(function(items) {
        if (items.failed.length > 0) {
          for (var i=0; i &lt; items.failed.length; i++) console.log("Error '"+items.failed[i].errorMessage+"' with:"+items.failed[i].Title); // the 'errorMessage' attribute is added to the object
        }
        if (items.passed.length > 0) {
          for (var i=0; i &lt; items.passed.length; i++) console.log("Success for:"+items.passed[i].Title+" (ID:"+items.passed[i].ID+")");
        }
      });

      // different ways to add John and Tom into the table
      $SP().list("List Name").add({Title:"John is the Tom's Manager",Manager:"-1;#john@compagny.com",Report:"-1;#tom@compagny.com"}); // if you don't know the ID
      $SP().list("My List").add({Title:"John is the Tom's Manager",Manager:"157",Report:"874"}); // if you know the Lookup ID
    */
    add:function(items, options) {
      var _this=this;
      return _this._promise(function(prom_resolve, prom_reject) {
        // check if we need to queue it
        if (_this.needQueue) { return _this._addInQueue(arguments) }
        if (!_this.listID) throw "[SharepointPlus 'add'] the list ID/Name is required.";
        if (!_this.url) throw "[SharepointPlus 'add'] not able to find the URL!"; // we cannot determine the url

        // default values
        var setup={};
        SPExtend(true, setup, options);
        setup.escapeChar = (setup.escapeChar == undefined) ? true : setup.escapeChar;
        setup.progress= setup.progress || function(){};
        setup.packetsize=setup.packetsize||15;

        if (!SPIsArray(items)) items = [ items ];

        var itemsLength=items.length, nextPacket, cutted, itemKey, itemValue, it, i;
        // define current and max for the progress
        setup.progressVar = setup.progressVar || {current:0,max:itemsLength,passed:[],failed:[],eventID:"spAdd"+(""+Math.random()).slice(2)};
        // we cannot add more than 15 items in the same time, so split by 15 elements
        // and also to avoid surcharging the server
        if (itemsLength > setup.packetsize) {
          nextPacket=items.slice(0);
          cutted=nextPacket.splice(0,setup.packetsize);
          _SP_ADD_PROGRESSVAR[setup.progressVar.eventID] = function(setup) {
            return _this.add(nextPacket,setup);
          };
          items = cutted;
          itemsLength = items.length;
        } else if (itemsLength === 0) {
          setup.progress(1,1);
          prom_resolve({passed:[], failed:[]})
          return;
        }

        // increment the progress
        setup.progressVar.current += itemsLength;

        // build a part of the request
        var updates = '<Batch OnError="Continue" ListVersion="1"  ViewName="">';
        for (i=0; i < items.length; i++) {
          updates += '<Method ID="'+(i+1)+'" Cmd="New">';
          updates += '<Field Name=\'ID\'>New</Field>';
          for (it in items[i]) {
            if (items[i].hasOwnProperty(it)) {
              itemKey = it;
              itemValue = items[i][it];
              if (SPIsArray(itemValue)) itemValue = ";#" + itemValue.join(";#") + ";#"; // an array should be seperate by ";#"
              if (setup.escapeChar && typeof itemValue === "string") itemValue = _this._cleanString(itemValue); // replace & (and not &amp;) by "&amp;" to avoid some issues
              updates += "<Field Name='"+itemKey+"'>"+itemValue+"</Field>";
            }
          }
          updates += '</Method>';
        }
        updates += '</Batch>';

        // send the request
        _this.ajax({
          url:_this.url + "/_vti_bin/lists.asmx",
          body:_this._buildBodyForSOAP("UpdateListItems", "<listName>"+_this.listID+"</listName><updates>" + updates + "</updates>"),
          headers:{'SOAPAction':'http://schemas.microsoft.com/sharepoint/soap/UpdateListItems'}
        }).then(function(data) {
          var result = data.querySelectorAll('Result'), len=result.length, passed = setup.progressVar.passed, failed = setup.progressVar.failed, i, rows;
          for (i=0; i < len; i++) {
            if (result[i].querySelector('ErrorCode').firstChild.nodeValue === "0x00000000") { // success
              rows=result[i].querySelectorAll('z:row');
              if (rows.length==0) rows=result[i].querySelectorAll('row'); // for Chrome 'bug'
              if (items[i]) {
                items[i].ID = rows[0].getAttribute("ows_ID");
                passed.push(items[i]);
              }
            } else if (items[i]) {
              items[i].errorMessage = result[i].querySelector('ErrorText').firstChild.nodeValue;
              failed.push(items[i]);
            }
          }

          setup.progress(setup.progressVar.current,setup.progressVar.max);
          // check if we have some other packets that are waiting to be treated
          if (setup.progressVar.current < setup.progressVar.max) {
            if (_SP_ADD_PROGRESSVAR[setup.progressVar.eventID]) {
              _SP_ADD_PROGRESSVAR[setup.progressVar.eventID](setup).then(function(res) { prom_resolve(res) }, function(rej) { prom_reject(rej) })
            }
          } else {
            if (_SP_ADD_PROGRESSVAR[setup.progressVar.eventID]) delete _SP_ADD_PROGRESSVAR[setup.progressVar.eventID];
            prom_resolve({passed:passed, failed:failed});
          }
        }, function(rej) { prom_reject(rej) });
      })
    },
    /**
      @name $SP().list.update
      @function
      @description Update items from a Sharepoint List

      @param {Array} items List of items (e.g. [{ID: 1, Field_x0020_Name: "Value", OtherField: "new value"}, {ID:22, Field_x0020_Name: "Value2", OtherField: "new value2"}])
      @param {Object} [options] Options (see below)
        @param {String} [options.where=""] You can define a WHERE clause
        @param {Number} [options.packetsize=15] If you have too many items to update, then we use `packetsize` to cut them into several requests (because Sharepoint cannot handle too many items at once)
        @param {Function} [options.progress] Two parameters: 'current' and 'max' -- if you provide more than 15 ID then they will be treated by packets and you can use "progress" to know more about the steps
        @param {Boolean} [options.escapeChar=true] Determines if we want to escape the special chars that will cause an error (for example '&' will be automatically converted to '&amp;')
      @return {Promise} resolve({passed, failed}), reject(error)

      @example
      $SP().list("My List").update({ID:1, Title:"Ok"});
      // if you use the WHERE then you must not provide the item ID:
      $SP().list("List Name").update({Title:"Ok"},{where:"Status = 'Complete'"});

      $SP().list("My List","http://sharepoint.org/mydir/").update([{ID:5, Title:"Ok"}, {ID: 15, Title:"Good"}]);

      $SP().list("List Name").update({ID:43, Title:"Ok"}).then(function(items) {
        for (var i=0; i &lt; items.failed.length; i++) console.log("Error '"+items.failed[i].errorMessage+"' with:"+items.failed[i].Title);
        var len=items.passed.length;
        console.log(len+(len>1?" items have been successfully added":" item has been successfully added"))
      });
    */
    update:function(items, options) {
      var _this=this;
      return _this._promise(function(prom_resolve, prom_reject) {
        // check if we need to queue it
        if (_this.needQueue) { return _this._addInQueue(arguments) }
        if (!_this.listID) throw "[SharepointPlus 'update'] the list ID/name is required.";
        if (!_this.url) throw "[SharepointPlus 'update'] not able to find the URL!"; // we cannot determine the url

        // default values
        var setup={};
        SPExtend(true, setup, options);
        setup.where   = setup.where || "";
        setup.escapeChar = (setup.escapeChar == undefined) ? true : setup.escapeChar;
        setup.progress= setup.progress || function(){};
        setup.packetsize=setup.packetsize||15;

        if (!SPIsArray(items)) items = [ items ];
        var itemsLength=items.length, nextPacket, cutted, itemKey, itemValue, it, i;

        // if there is a WHERE clause
        if (itemsLength === 1 && setup.where) {
          // call GET first
          delete items[0].ID;
          _this.get({fields:"ID",where:setup.where}).then(function(data) {
            // we need a function to clone the items
            var clone = function(obj){
              var newObj = {};
              for (var k in obj) newObj[k]=obj[k];
              return newObj;
            };
            var aItems=[], i=data.length, it;
            while (i--) {
              it=clone(items[0]);
              it.ID=data[i].getAttribute("ID");
              aItems.push(it);
            }
            delete setup.where;
            // now call again the UPDATE
            _this.update(aItems,setup).then(function(res) { prom_resolve(res) }, function(rej) { prom_reject(rej) });
          });
          return
        }

        // define current and max for the progress
        setup.progressVar = setup.progressVar || {current:0,max:itemsLength,passed:[],failed:[],eventID:"spUpdate"+(""+Math.random()).slice(2)};
        // we cannot add more than 15 items in the same time, so split by 15 elements
        // and also to avoid surcharging the server
        if (itemsLength > setup.packetsize) {
          nextPacket=items.slice(0);
          cutted=nextPacket.splice(0,setup.packetsize);
          _SP_UPDATE_PROGRESSVAR[setup.progressVar.eventID] = function(setup) {
            return _this.update(nextPacket,setup);
          };
          items = cutted;
          itemsLength = items.length;
        } else if (itemsLength == 0) {
          prom_resolve({passed:[], failed:[]});
          return;
        }

        // increment the progress
        setup.progressVar.current += itemsLength;

        // build a part of the request
        var updates = '<Batch OnError="Continue" ListVersion="1"  ViewName="">';
        for (i=0; i < itemsLength; i++) {
          updates += '<Method ID="'+(i+1)+'" Cmd="Update">';
          if (!items[i].ID) throw "[SharepointPlus 'update'] you have to provide the item ID called 'ID'";
          for (it in items[i]) {
            if (items[i].hasOwnProperty(it)) {
              itemKey = it;
              itemValue = items[i][it];
              if (SPIsArray(itemValue)) itemValue = ";#" + itemValue.join(";#") + ";#"; // an array should be seperate by ";#"
              if (setup.escapeChar && typeof itemValue === "string") itemValue = _this._cleanString(itemValue); // replace & (and not &amp;) by "&amp;" to avoid some issues
              updates += "<Field Name='"+itemKey+"'>"+itemValue+"</Field>";
            }
          }
          updates += '</Method>';
        }
        updates += '</Batch>';

        // send the request
        _this.ajax({
          url:_this.url + "/_vti_bin/lists.asmx",
          body:_this._buildBodyForSOAP("UpdateListItems", "<listName>"+_this.listID+"</listName><updates>" + updates + "</updates>"),
          headers:{'SOAPAction':'http://schemas.microsoft.com/sharepoint/soap/UpdateListItems'}
        }).then(function(data) {
          var result = data.querySelectorAll('Result'), len=result.length, passed = setup.progressVar.passed, failed = setup.progressVar.failed, i;
          for (i=0; i < len; i++) {
            if (result[i].querySelector('ErrorCode').firstChild.nodeValue === "0x00000000" && items[i]) // success
              passed.push(items[i]);
            else if (items[i]) {
              items[i].errorMessage = result[i].querySelector('ErrorText').firstChild.nodeValue;
              failed.push(items[i]);
            }
          }

          setup.progress(setup.progressVar.current,setup.progressVar.max);
          // check if we have some other packets that are waiting to be treated
          if (setup.progressVar.current < setup.progressVar.max) {
            if (_SP_UPDATE_PROGRESSVAR[setup.progressVar.eventID]) {
              _SP_UPDATE_PROGRESSVAR[setup.progressVar.eventID](setup).then(function(res) { prom_resolve(res) }, function(rej) { prom_reject(rej) })
            }
          }
          else {
            if (_SP_UPDATE_PROGRESSVAR[setup.progressVar.eventID]) delete _SP_UPDATE_PROGRESSVAR[setup.progressVar.eventID];
            prom_resolve({passed:passed, failed:failed});
          }
        }).then(function(rej) { prom_reject(rej) });
      })
    },
    /**
      @name $SP().list.history
      @function
      @description When versioning is an active option for your list, then you can use this function to find the previous values for a field

      @param {Object} params See below
        @param {String|Number} params.ID The item ID
        @param {String} params.Name The field name
      @param {Function} returnFct This function will have one parameter that is the data returned

      @example
      $SP().list("My List").history({ID:1981, Name:"Critical_x0020_Comments"}, function(data) {
        for (var i=0,len=data.length; i&lt;len; i++) {
          console.log("Date: "+data[i].getAttribute("Modified")); // you can use $SP().toDate() to convert it to a JavaScript Date object
          console.log("Editor: "+data[i].getAttribute("Editor")); // it's the long format type, so the result looks like that "328;#Doe,, John,#DOMAIN\john_doe,#John_Doe@example.com,#,#Doe,, John"
          console.log("Content: "+data[i].getAttribute("Critical_x0020_Comments")); // use the field name here
        }
      });
    */
    history:function(params, returnFct) {
      var _this=this;
      // check if we need to queue it
      if (_this.needQueue) { return _this._addInQueue(arguments) }
      if (!_this.listID) throw "Error 'history': you need to use list() to define the list name.";
      if (arguments.length !== 2) throw "Error 'history': you need to provide two parameters.";
      if (typeof params !== "object") throw "Error 'history': the first parameter must be an object.";
      else {
        if (params.ID === undefined || params.Name === undefined) throw "Error 'history': the first parameter must be an object with ID and Name.";
      }
      if (typeof returnFct !== "function") throw "Error 'history': the second parameter must be a function.";


      // build the request
      var body = _this._buildBodyForSOAP("GetVersionCollection", "<strlistID>"+_this.listID+"</strlistID><strlistItemID>"+params.ID+"</strlistItemID><strFieldName>"+params.Name+"</strFieldName>")
      // send the request
      var url = _this.url + "/_vti_bin/lists.asmx";
      _this.ajax({
        method:"POST",
        cache:false,
        url:url,
        body:body,
        beforeSend: function(xhr) { xhr.setRequestHeader('SOAPAction', 'http://schemas.microsoft.com/sharepoint/soap/GetVersionCollection'); },
        contentType: "text/xml; charset=utf-8",
        dataType: "xml",
        success:function(data) {
          returnFct.call(_this, data.getElementsByTagName('Version'))
        }
      });
      return _this;
    },
    /**
      @name $SP().list.moderate
      @function
      @description Moderate items from a Sharepoint List

      @param {Array} approval List of items and ApprovalStatus (e.g. [{ID:1, ApprovalStatus:"Approved"}, {ID:22, ApprovalStatus:"Pending"}])
      @param {Object} [setup] Options (see below)
        @param {Number} [setup.packetsize=15] If you have too many items to moderate, then we use `packetsize` to cut them into several requests (because Sharepoint cannot handle too many items at once)
        @param {Function} [setup.progress] Two parameters: 'current' and 'max' -- if you provide more than `packetsize` ID then they will be treated by packets and you can use "progress" to know more about the steps
      @return {Promise} resolve({passed, failed}), reject(error)

      @example
      $SP().list("My List").moderate({ID:1, ApprovalStatus:"Rejected"}); // you must always provide the ID

      $SP().list("Other List").moderate([{ID:5, ApprovalStatus:"Pending"}, {ID: 15, ApprovalStatus:"Approved"}]).then(function(items) {
        for (var i=0; i &lt; items.failed.length; i++) console.log("Error with:"+items.failed[i].ID);
        for (var i=0; i &lt; items.passed.length; i++) console.log("Success with:"+items.passed[i].getAttribute("Title"));
      });
    */
    moderate:function(items, setup) {
      var _this=this;
      return _this._promise(function(prom_resolve, prom_reject) {
        // check if we need to queue it
        if (_this.needQueue) { return _this._addInQueue(arguments) }
        if (!_this.listID) throw "[SharepointPlus 'moderate'] the list ID/Name is required.";

        // default values
        setup = setup || {};
        if (!_this.url) throw "[SharepointPlus 'moderate'] not able to find the URL!"; // we cannot determine the url
        setup.progress= setup.progress || function(){};

        if (!SPIsArray(items)) items = [ items ];
        var itemsLength=items.length, nextPacket, cutted, itemKey, itemValue, it, i;

        // define current and max for the progress
        setup.progressVar = setup.progressVar || {current:0,max:itemsLength,passed:[],failed:[],eventID:"spModerate"+(""+Math.random()).slice(2)};
        // we cannot add more than 15 items in the same time, so split by 15 elements
        // and also to avoid surcharging the server
        if (itemsLength > 15) {
          nextPacket=items.slice(0);
          cutted=nextPacket.splice(0,15);
          _SP_MODERATE_PROGRESSVAR[setup.progressVar.eventID] = function(setup) {
            return _this.moderate(nextPacket,setup);
          };
          _this.moderate(cutted,setup);
          return;
        } else if (itemsLength === 0) {
          setup.after({passed:[], failed:[]});
          return;
        }

        // increment the progress
        setup.progressVar.current += itemsLength;

        // build a part of the request
        var updates = '<Batch OnError="Continue" ListVersion="1"  ViewName="">';
        for (i=0; i < itemsLength; i++) {
          updates += '<Method ID="'+(i+1)+'" Cmd="Moderate">';
          if (!items[i].ID) throw "Error 'moderate': you have to provide the item ID called 'ID'";
          else if (typeof items[i].ApprovalStatus === "undefined") throw "[SharepointPlus 'moderate'] you have to provide the approval status 'ApprovalStatus' (Approved, Rejected, Pending, Draft or Scheduled)";
          for (it in items[i]) {
            if (items[i].hasOwnProperty(it)) {
              itemKey = it;
              itemValue = items[i][it];
              if (itemKey == "ApprovalStatus") {
                itemKey = "_ModerationStatus";
                switch (itemValue.toLowerCase()) {
                  case "approve":
                  case "approved":  itemValue=0; break;
                  case "reject":
                  case "deny":
                  case "denied":
                  case "rejected":  itemValue=1; break;
                  case "pending":   itemValue=2; break;
                  case "draft":     itemValue=3; break;
                  case "scheduled": itemValue=4; break;
                  default:          itemValue=2; break;
                }
              }
            }
            updates += "<Field Name='"+itemKey+"'>"+itemValue+"</Field>";
          }
          updates += '</Method>';
        }
        updates += '</Batch>';

        // send the request
        _this.ajax({
          url:_this.url + "/_vti_bin/lists.asmx",
          body:_this._buildBodyForSOAP("UpdateListItems", "<listName>"+_this.listID+"</listName><updates>" + updates + "</updates>"),
          headers:{'SOAPAction':'http://schemas.microsoft.com/sharepoint/soap/UpdateListItems'}
        }).then(function(data) {
          var result = data.querySelectorAll('Result'), len=result.length, passed = setup.progressVar.passed, failed = setup.progressVar.failed, rows, i;
          for (i=0; i < len; i++) {
            rows=result[i].querySelectorAll('z:row');
            if (rows.length==0) rows=data.querySelectorAll('row'); // for Chrome
            var item = myElem(rows[0]);
            if (result[i].querySelector('ErrorCode').firstChild.nodeValue == "0x00000000") // success
              passed.push(item);
            else {
              items[i].errorMessage = result[i].querySelector('ErrorText').firstChild.nodeValue;
              failed.push(items[i]);
            }
          }

          setup.progress(setup.progressVar.current,setup.progressVar.max);
          // check if we have some other packets that are waiting to be treated
          if (setup.progressVar.current < setup.progressVar.max) {
            if (_SP_MODERATE_PROGRESSVAR[setup.progressVar.eventID]) {
              _SP_MODERATE_PROGRESSVAR[setup.progressVar.eventID](setup).then(function(res) { prom_resolve(res) }, function(rej) {prom_reject(rej) });
            }
          }  else {
            if (_SP_MODERATE_PROGRESSVAR[setup.progressVar.eventID]) delete _SP_MODERATE_PROGRESSVAR[setup.progressVar.eventID];
            prom_resolve({passed:passed, failed:failed})
          }
        }, function(rej) { prom_reject(rej) });
      })
    },
    /**
      @name $SP().list.remove
      @function
      @description Delete items from a Sharepoint List

      @param {Objet|Array} [itemsID] List of items ID (e.g. [{ID:1}, {ID:22}]) | ATTENTION if you want to delete a file you have to add the "FileRef" e.g. {ID:2,FileRef:"path/to/the/file.ext"}
      @param {Object} [options] Options (see below)
        @param {String} [options.where] If you don't specify the itemsID (first param) then you have to use a `where` clause - it will search for the list of items ID based on the `where` and it will then delete all of them
        @param {Number} [options.packetsize=15] If you have too many items to delete, then we use `packetsize` to cut them into several requests (because Sharepoint cannot handle too many items at once)
        @param {Function} [options.progress] Two parameters: 'current' and 'max' -- If you provide more than 15 ID then they will be treated by packets and you can use "progress" to know more about the steps
      @return {Promise} resolve({passed, failed}), reject(error)

      @example
      $SP().list("My List").remove({ID:1});
      // we can use the WHERE clause instead providing the ID
      $SP().list("My List").remove({where:"Title = 'OK'",progress:function(current,max) {
        console.log(current+"/"+max);
      }});

      // delete several items
      $SP().list("List Name", "http://my.sharepoint.com/sub/dir/").remove([{ID:5}, {ID:7}]);

      $SP().list("List").remove({ID:43, Title:"My title"}).then(function(items) {
        for (var i=0; i &lt; items.failed.length; i++) console.log("Error with:"+items.failed[i].ID+" ("+items.failed[i].errorMessage+")"); // only .ID and .errorMessage are available
      });

      // example for deleting a file
      $SP().list("My Shared Documents").remove({ID:4,FileRef:"my/directory/My Shared Documents/something.xls"});
    */
    remove:function(items, options) {
      var _this=this;
      return _this._promise(function(prom_resolve, prom_reject) {
        // check if we need to queue it
        if (_this.needQueue) { return _this._addInQueue(arguments) }
        if (!_this.url) throw "[SharepointPlus 'remove'] not able to find the URL!"; // we cannot determine the url
        // default values
        if (!options && items.where) { options=items; items=[]; } // the case when we use the "where"
        var setup={};
        SPExtend(true, setup, options);
        setup.progress= setup.progress || (function() {});
        setup.packetsize = setup.packetsize || 15;

        if (!SPIsArray(items)) items = [ items ];
        var itemsLength=items.length, nextPacket, cutted, i;

        // if there is a WHERE clause
        if (setup.where) {
          // call GET first
          if (itemsLength===1) delete items[0].ID;
          _this.get({fields:"ID,FileRef",where:setup.where}).then(function(data) {
            // we need a function to clone the items
            var clone = function(obj){
              var newObj = {};
              for (var k in obj) newObj[k]=obj[k];
              return newObj;
            };
            var aItems=[],fileRef,i=data.length,it;
            while (i--) {
              it=clone(items[0]);
              it.ID=data[i].getAttribute("ID");
              fileRef=data[i].getAttribute("FileRef");
              if (fileRef) it.FileRef=_this.cleanResult(fileRef);
              aItems.push(it);
            }
            delete setup.where;
            // now call again the REMOVE
            _this.remove(aItems,setup).then(function(res) { prom_resolve(res) }, function(rej) { prom_reject(rej) });
          });
          return;
        } else if (itemsLength === 0) {
          // nothing to delete
          prom_resolve({passed:[], failed:[]});
          return;
        }

        // define current and max for the progress
        setup.progressVar = setup.progressVar || {current:0,max:itemsLength,passed:[],failed:[],eventID:"spRemove"+(""+Math.random()).slice(2)};
        // we cannot add more than setup.packetsize items in the same time, so split by setup.packetsize elements
        // and also to avoid surcharging the server
        if (itemsLength > setup.packetsize) {
          nextPacket=items.slice(0);
          cutted=nextPacket.splice(0,setup.packetsize);
          _SP_REMOVE_PROGRESSVAR[setup.progressVar.eventID] = function(setup) {
            return _this.remove(nextPacket,setup);
          };
          items = cutted;
          itemsLength = items.length;
        }
        // increment the progress
        setup.progressVar.current += itemsLength;

        // build a part of the request
        var updates = '<Batch OnError="Continue" ListVersion="1"  ViewName="">';
        for (i=0; i < items.length; i++) {
          updates += '<Method ID="'+(i+1)+'" Cmd="Delete">';
          if (items[i].ID == undefined) throw "Error 'delete': you have to provide the item ID called 'ID'";
          updates += "<Field Name='ID'>"+items[i].ID+"</Field>";
          if (items[i].FileRef != undefined) updates += "<Field Name='FileRef'>"+items[i].FileRef+"</Field>";
          updates += '</Method>';
        }
        updates += '</Batch>';

        // send the request
        _this.ajax({
          url:_this.url + "/_vti_bin/lists.asmx",
          body:_this._buildBodyForSOAP("UpdateListItems", "<listName>"+_this.listID+"</listName><updates>" + updates + "</updates>"),
          headers:{'SOAPAction':'http://schemas.microsoft.com/sharepoint/soap/UpdateListItems'}
        }).then(function(data) {
          var result = data.querySelectorAll('Result'), len=result.length, passed = setup.progressVar.passed, failed = setup.progressVar.failed, i;
          for (i=0; i < len; i++) {
            if (result[i].querySelectorA('ErrorCode').firstChild.nodeValue === "0x00000000") // success
              passed.push(items[i]);
            else {
              items[i].errorMessage = result[i].querySelectorA('ErrorText').firstChild.nodeValue;
              failed.push(items[i]);
            }
          }

          setup.progress(setup.progressVar.current,setup.progressVar.max);
          // check if we have some other packets that are waiting to be treated
          if (setup.progressVar.current < setup.progressVar.max) {
            if (_SP_REMOVE_PROGRESSVAR[setup.progressVar.eventID]) {
              if (setup.useCallback) _SP_REMOVE_PROGRESSVAR[setup.progressVar.eventID](setup);
              else _SP_REMOVE_PROGRESSVAR[setup.progressVar.eventID](setup).then(function(res) { prom_resolve(res) }, function(rej) { prom_reject(rej) })
            }
          } else {
            if (_SP_REMOVE_PROGRESSVAR[setup.progressVar.eventID]) delete _SP_REMOVE_PROGRESSVAR[setup.progressVar.eventID];
            prom_resolve({passed:passed, failed:failed});
          }
        });
      })
    },
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
    usergroups:function(username, setup) {
      var _this=this;
      return _this._promise(function(prom_resolve, prom_reject) {
        // default values
        if (!username) throw "[SharepointPlus 'usergroups']: the username is required.";
        setup = setup || {};
        setup.cache = (setup.cache === false ? false : true);
        if (!setup.url) {
          _this.getURL()
          .then(function(url) { return _this.usergroups(username, {url:url}) })
          .then(function(res) { prom_resolve(res) })
          .catch(function(rej) { prom_reject(rej) })
          return;
        }

        username=username.toLowerCase();
        setup.url=setup.url.toLowerCase();
        // check the cache
        // [ {user:"username", url:"url", data:"the groups"}, ... ]
        var found=false;
        if (setup.cache) {
          _SP_CACHE_USERGROUPS.forEach(function(c) {
            if (c.user === username && c.url === setup.url) {
              prom_resolve(c.data);
              found=true;
            }
          })
        }
        if (found) return;

        // send the request
        _this.ajax({
          url:setup.url + "/_vti_bin/usergroup.asmx",
          body:_this._buildBodyForSOAP("GetGroupCollectionFromUser", "<userLoginName>"+username+"</userLoginName>", "http://schemas.microsoft.com/sharepoint/soap/directory/"),
          headers:{'SOAPAction':'http://schemas.microsoft.com/sharepoint/soap/directory/GetGroupCollectionFromUser'}
        }).then(function(data) {
          var aResult=[];
          // get the details
          data=data.querySelectorAll('Group');
          for (var i=0,len=data.length; i<len; i++) aResult.push(data[i].getAttribute("Name"));
          // cache the result
          found=false;
          _SP_CACHE_USERGROUPS.forEach(function(c) {
            if (c.user === username && c.url === setup.url) {
              c.data=aResult;
              found=true;
            }
          })
          if (!found) _SP_CACHE_USERGROUPS.push({user:username,url:setup.url,data:aResult});
          prom_resolve(aResult);
        }, function(error) { prom_reject(error) });
      })
    },
    /**
      @name $SP().workflowStatusToText
      @function
      @category utils
      @description Return the text related to a workflow status code

      @param {String|Number} code This is the code returned by a workflow

      @example
      $SP().workflowStatusToText(2); // -> "In Progress"
     */
    workflowStatusToText:function(code) {
      code = code * 1;
      switch(code) {
        case 0: return "Not Started";
        case 1: return "Failed On Start";
        case 2: return "In Progress";
        case 3: return "Error Occurred";
        case 4: return "Stopped By User";
        case 5: return "Completed";
        case 6: return "Failed On Start Retrying";
        case 7: return "Error Occurred Retrying";
        case 8: return "View Query Overflow";
        case 15: return "Canceled";
        case 16: return "Approved";
        case 17: return "Rejected";
        default: return "Unknown";
      }
    },
    /**
      @name $SP().list.getWorkflowID
      @function
      @description Find the WorkflowID for a workflow, and some other related info

      @param {Object} setup
        @param {Number} setup.ID The item ID that is tied to the workflow
        @param {String} setup.workflowName The name of the workflow
      @return {Promise} resolve({workflowID, fileRef, description, instances}), reject(error)

      @example
      $SP().list("List Name").getWorkflowID({ID:15, workflowName:"Workflow for List Name (manual)"}).then(function(params) {
        alert("Workflow ID:"+params.workflowID+" and the FileRef is: "+params.fileRef);
      });
     */
    getWorkflowID:function(setup) {
      var _this=this;
      return _this._promise(function(prom_resolve, prom_reject) {
        // check if we need to queue it
        if (_this.needQueue) { return _this._addInQueue(arguments) }
        if (!_this.listID) throw "[SharepointPlus 'getWorkflowID'] the list ID/Name is required.";
        if (!_this.url) throw "[SharepointPlus 'getWorkflowID'] not able to find the URL!"; // we cannot determine the url
        setup = setup || {};
        if (!setup.ID || !setup.workflowName) throw "[SharepointPlus 'getWorkflowID'] all parameters are mandatory";

        // find the fileRef
        _this.get({fields:"FieldRef",where:"ID = "+setup.ID}).then(function(d) {
          if (d.length===0) throw "[SharepointPlus 'getWorkflowID'] I'm not able to find the item ID "+setup.ID;

          var fileRef = _this.cleanResult(d[0].getAttribute("FileRef"));
          var c=fileRef.substring(0,fileRef.indexOf("/Lists"))
          d=_this.url.substring(0,_this.url.indexOf(c));
          fileRef = d+fileRef;
          _this.ajax({
            url: _this.url+"/_vti_bin/Workflow.asmx",
            body: _this._buildBodyForSOAP("GetWorkflowDataForItem", '<item>'+fileRef+'</item>', "http://schemas.microsoft.com/sharepoint/soap/workflow/"),
            headers:{'SOAPAction':'http://schemas.microsoft.com/sharepoint/soap/workflow/GetWorkflowDataForItem'}
          }).then(function(data) {
            // we want to use myElem to change the getAttribute function
            var res={},i,row, rows=data.querySelectorAll('WorkflowTemplate');
            if (rows.length===0) {
              // depending of the permissions, we couldn't have the WorkflowTemplate data
              // in that case we have to get the workflow ID with another way
              var context = SP.ClientContext.get_current(); // eslint-disable-line
              var lists = context.get_web().get_lists();
              var list = lists.getByTitle(_this.listID);
              var item = list.getItemById(setup.ID);
              context.load(list);
              context.load(item);
              var workflows = list.get_workflowAssociations();
              context.load(workflows);
              context.executeQueryAsync(function() {
                var enumerator = workflows.getEnumerator();
                while(enumerator.moveNext()) {
                  var workflow = enumerator.get_current();
                  if (workflow.get_name() === setup.workflowName) {
                    res = {
                      "fileRef":fileRef,
                      "description":workflow.get_description(),
                      "workflowID":"{"+workflow.get_id().toString()+"}",
                      "instances":[]
                    }
                    break;
                  }
                }
                prom_resolve(res);
              },
              function() {
                throw "[SharepointPlus 'getWorkflowID'] Problem while dealing with SP.ClientContext.get_current()";
              });
            } else {
              for (i=rows.length; i--;) {
                if (rows[i].getAttribute("Name") == setup.workflowName) {
                  res = {
                    "fileRef":fileRef,
                    "description":rows[i].getAttribute("Description"),
                    "workflowID":"{"+rows[i].querySelector('WorkflowTemplateIdSet').getAttribute("TemplateId")+"}",
                    "instances":[]
                  };
                }
              }
              if (!res.fileRef) {
                throw "[SharepointPlus 'getWorkflowID'] it seems the requested workflow ('"+setup.workflowName+"') doesn't exist!";
              }
              rows=data.querySelectorAll("Workflow");
              for (i=0; i<rows.length; i++) {
                row=rows[i];
                res.instances.push({
                  "StatusPageUrl":row.getAttribute("StatusPageUrl"),
                  "Id":row.getAttribute("Id"),
                  "TemplateId":row.getAttribute("TemplateId"),
                  "ListId":row.getAttribute("ListId"),
                  "SiteId":row.getAttribute("SiteId"),
                  "WebId":row.getAttribute("WebId"),
                  "ItemId":row.getAttribute("ItemId"),
                  "ItemGUID":row.getAttribute("ItemGUID"),
                  "TaskListId":row.getAttribute("TaskListId"),
                  "AdminTaskListId":row.getAttribute("AdminTaskListId"),
                  "Author":row.getAttribute("Author"),
                  "Modified":row.getAttribute("Modified"),
                  "Created":row.getAttribute("Created"),
                  "StatusVersion":row.getAttribute("StatusVersion"),
                  "Status1":{"code":row.getAttribute("Status1"), "text":_this.workflowStatusToText(row.getAttribute("Status1"))},
                  "Status2":{"code":row.getAttribute("Status2"), "text":_this.workflowStatusToText(row.getAttribute("Status2"))},
                  "Status3":{"code":row.getAttribute("Status3"), "text":_this.workflowStatusToText(row.getAttribute("Status3"))},
                  "Status4":{"code":row.getAttribute("Status4"), "text":_this.workflowStatusToText(row.getAttribute("Status4"))},
                  "Status5":{"code":row.getAttribute("Status5"), "text":_this.workflowStatusToText(row.getAttribute("Status5"))},
                  "Status6":{"code":row.getAttribute("Status6"), "text":_this.workflowStatusToText(row.getAttribute("Status6"))},
                  "Status7":{"code":row.getAttribute("Status7"), "text":_this.workflowStatusToText(row.getAttribute("Status7"))},
                  "Status8":{"code":row.getAttribute("Status8"), "text":_this.workflowStatusToText(row.getAttribute("Status8"))},
                  "Status9":{"code":row.getAttribute("Status9"), "text":_this.workflowStatusToText(row.getAttribute("Status9"))},
                  "Status10":{"code":row.getAttribute("Status10"), "text":_this.workflowStatusToText(row.getAttribute("Status10"))},
                  "TextStatus1":row.getAttribute("TextStatus1"),
                  "TextStatus2":row.getAttribute("TextStatus2"),
                  "TextStatus3":row.getAttribute("TextStatus3"),
                  "TextStatus4":row.getAttribute("TextStatus4"),
                  "TextStatus5":row.getAttribute("TextStatus5"),
                  "Modifications":row.getAttribute("Modifications"),
                  "InternalState":row.getAttribute("InternalState"),
                  "ProcessingId":row.getAttribute("ProcessingId")
                });
              }
              prom_resolve(res);
            }
            return
          }, function() {
            prom_reject("[SharepointPlus 'getWorkflowID'] Something went wrong with the request over the Workflow Web Service...")
          });
        })
      })
    },
    /**
      @name $SP().list.startWorkflow
      @function
      @description Manually start a workflow (that has been set to be manually started) (for "Sharepoint 2010 workflow" as the platform type)

      @param {Object} setup
        @param {String} setup.workflowName The name of the workflow
        @param {Number} [setup.ID] The item ID that tied to the workflow
        @param {Array|Object} [setup.parameters] An array of object with {name:"Name of the parameter", value:"Value of the parameter"}
        @param {String} [setup.fileRef] Optional: you can provide the fileRef to avoid calling the $SP().list().getWorkflowID()
        @param {String} [setup.workflowID] Optional: you can provide the workflowID to avoid calling the $SP().list().getWorkflowID()
      @return {Promise} resolve() if it's started, reject(error)

      @example
      // if you want to call a Site Workflow, just leave the list name empty and don't provide an item ID, e.g.:
      $SP().list("").startWorkflow({workflowName:"My Site Workflow"});

      // to start a workflow for a list item
      $SP().list("List Name").startWorkflow({ID:15, workflowName:"Workflow for List Name (manual)", parameters:{name:"Message",value:"Welcome here!"}).then(function() {
        alert("Worflow Started!")
      }).catch(function(error) {
          console.log("Error: ",error);
      });
    **/
    startWorkflow:function(setup) {
      var _this=this;
      return _this._promise(function(prom_resolve, prom_reject) {
        // check if we need to queue it
        if (_this.needQueue) { return _this._addInQueue(arguments) }
        if (!_this.url) throw "[SharepointPlus 'startWorkflow'] not able to find the URL!";

        // if no listID then it's a Site Workflow so we use startWorkflow2013
        if (!_this.listID) {
          setup.platformType=2010;
          return _this.startWorkflow2013(setup)
        }
        setup = setup || {};
        if (!setup.workflowName && !setup.workflowID) throw "[SharepointPlus 'startWorkflow'] Please provide the workflow name"
        if (!setup.ID) throw "[SharepointPlus 'startWorkflow'] Please provide the item ID"

        // find the FileRef and templateID
        if (!setup.fileRef && !setup.workflowID) {
          _this.getWorkflowID({ID:setup.ID,workflowName:setup.workflowName}).then(function(params) {
            setup.fileRef=params.fileRef;
            setup.workflowID=params.workflowID;
            _this.startWorkflow(setup).then(function(res) { prom_resolve(res) }, function(rej) { prom_reject(rej) })
          })
          return;
        } else {
          // define the parameters if any
          var workflowParameters = "<root />", p, i;
          if (setup.parameters) {
            if (!SPIsArray(setup.parameters)) setup.parameters = [ setup.parameters ];
            p = setup.parameters.slice(0);
            workflowParameters = "<Data>";
            for (i=0; i<p.length; i++) workflowParameters += "<"+p[i].name+">"+p[i].value+"</"+p[i].name+">";
            workflowParameters += "</Data>";
          }

          _this.ajax({
            url: _this.url + "/_vti_bin/Workflow.asmx",
            body:_this._buildBodyForSOAP("StartWorkflow", "<item>"+setup.fileRef+"</item><templateId>"+setup.workflowID+"</templateId><workflowParameters>"+workflowParameters+"</workflowParameters>", "http://schemas.microsoft.com/sharepoint/soap/workflow/"),
            headers:{'SOAPAction':'http://schemas.microsoft.com/sharepoint/soap/workflow/StartWorkflow'}
          }).then(function() {
            prom_resolve()
          }, function(error) { prom_reject(error) });
        }
      })
    },
    /**
      @name $SP().list.startWorkflow2013
      @function
      @description Manually start a work (that has been set to be manually started) (for "Sharepoint 2013 workflow" as the platform type)

      @param {Object} setup
        @param {Number} [setup.ID] The item ID that tied to the workflow
        @param {String} setup.workflowName The name of the workflow
        @param {Array|Object} [setup.parameters] An array of object with {name:"Name of the parameter", value:"Value of the parameter"}
      @return {Promise} resolve() when started, reject(error)

      @example
      // if you want to call a Site Workflow, just leave the list name empty and don't provide an item ID, e.g.:
      $SP().list("").startWorkflow2013({workflowName:"My Site Workflow"});

      // to start a workflow for a list item
      $SP().list("List Name").startWorkflow2013({ID:15, workflowName:"Workflow for List Name (manual)", parameters:{name:"Message",value:"Welcome here!"}).then(function() {
        console.log("workflow started")
      }, function(error) {
        console.log("Error: ",error);
      });
    **/
    startWorkflow2013:function(setup) {
      var _this=this;
      return _this._promise(function(prom_resolve, prom_reject) {
        // check if we need to queue it
        if (_this.needQueue) { return _this._addInQueue(arguments) }
        if (!_this.url) throw "[SharepointPlus 'startWorkflow2013'] not able to find the URL!";

        setup = setup || {};
        setup.platformType = setup.platformType || 2013; // internal use when calling Site Workflow from startWorkflow()
        if (!setup.workflowName) throw "[SharepointPlus 'startWorkflow2013'] Please provide the workflow name."
        if (_this.listID && !setup.ID) throw "Error 'startWorkflow2013': Please provide the item ID."

        // we need "sp.workflowservices.js"
        if (typeof SP === "undefined" || typeof SP.SOD === "undefined") { // eslint-disable-line
          throw "[SharepointPlus 'startWorkflow2013']: SP.SOD.executeFunc is required (from the Microsoft file called init.js)";
        }

        SP.SOD.executeFunc("sp.js", "SP.ClientContext" , function(){ // eslint-disable-line
          SP.SOD.registerSod('sp.workflowservices.js', SP.Utilities.Utility.getLayoutsPageUrl('sp.workflowservices.js')); // eslint-disable-line
          SP.SOD.executeFunc('sp.workflowservices.js', "SP.WorkflowServices.WorkflowServicesManager", function() { // eslint-disable-line
            var context = new SP.ClientContext(_this.url); // eslint-disable-line
            var web = context.get_web();

            var servicesManager = SP.WorkflowServices.WorkflowServicesManager.newObject(context, web); // eslint-disable-line
            context.load(servicesManager);
            // list the existing workflows
            var subscriptions = servicesManager.getWorkflowSubscriptionService().enumerateSubscriptions();
            context.load(subscriptions);

            context.executeQueryAsync(function() {
              var subsEnum = subscriptions.getEnumerator(), sub;
              var initiationParams = {}, i, passed=false;
              var workflowName = setup.workflowName.toLowerCase();
              // set the parameters
              if (setup.parameters) {
                if (setup.parameters.length === undefined) setup.parameters = [ setup.parameters ];
                for (i=0; i<setup.parameters.length; i++)
                  initiationParams[setup.parameters[i].name] = setup.parameters[i].value;
              }

              if (setup.platformType == 2010) {
                var interopService = servicesManager.getWorkflowInteropService();
                interopService.startWorkflow(workflowName, null, null, null, initiationParams);
                context.executeQueryAsync(function() {
                  prom_resolve()
                }, function(sender, args) {
                  var errorMessage = args.get_message();
                  if (errorMessage === "associationName") errorMessage = "No workflow found with the name '"+setup.workflowName+"'";
                  prom_reject(errorMessage);
                });
              } else {
                // go thru all the workflows to find the one we want to initiate
                while (subsEnum.moveNext()) {
                  sub = subsEnum.get_current();
                  if (sub.get_name().toLowerCase() === workflowName) {

                    if (setup.ID) servicesManager.getWorkflowInstanceService().startWorkflowOnListItem(sub, setup.ID, initiationParams);
                    else servicesManager.getWorkflowInstanceService().startWorkflow(sub, initiationParams);
                    context.executeQueryAsync(function() {
                      prom_resolve()
                    }, function(sender, args) {
                      prom_reject(args.get_message())
                    });
                    passed=true;
                    break;
                  }
                }
                if (!passed) {
                  prom_reject("No workflow found with the name '"+setup.workflowName+"'");
                }
              }
            }, function(sender, args) {
              prom_reject(args.get_message())
            });
          });
        })
      })
    },
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
    distributionLists:function(username, setup) {
      var _this=this;
      return _this._promise(function(prom_resolve, prom_reject) {
        if (!username) throw "[SharepointPlus 'distributionLists'] the username is required.";
        // default values
        setup = setup || {};
        if (!setup.url) {
          _this.getURL()
          .then(function(url) { setup.url=url; return _this.distributionLists(username, setup) })
          .then(function(res) { prom_resolve(res) })
          .catch(function(rej) { prom_reject(rej) });
          return;
        }

        username = username.toLowerCase();
        setup.url=setup.url.toLowerCase();
        setup.cache = (setup.cache === false ? false : true)
        // check the cache
        // [ {user:"username", url:"url", data:"the distribution lists"}, ... ]
        var found=false;
        if (setup.cache) {
          _SP_CACHE_DISTRIBUTIONLISTS.forEach(function(c) {
            if (c.user === username && c.url === setup.url) {
              prom_resolve(c.data);
              found=true;
            }
          })
        }
        if (found) return;

        // send the request
        _this.ajax({
          url:setup.url + "/_vti_bin/UserProfileService.asmx",
          body:_this._buildBodyForSOAP("GetCommonMemberships", "<accountName>"+username+"</accountName>", "http://microsoft.com/webservices/SharePointPortalServer/UserProfileService"),
          headers:{'SOAPAction':'http://microsoft.com/webservices/SharePointPortalServer/UserProfileService/GetUserMemberships'}
        }).then(function(data) {
          var aResult=[];
          // get the details
          data=data.querySelectorAll('MembershipData');
          for (var i=0,len=data.length; i<len; i++) {
            if (data[i].querySelector("Source").firstChild.nodeValue === "DistributionList") {
              aResult.push({"SourceReference": data[i].querySelector("SourceReference").firstChild.nodeValue, "DisplayName":data[i].querySelector("DisplayName").firstChild.nodeValue, "MailNickname":data[i].querySelector("MailNickname").firstChild.nodeValue, "Url":data[i].querySelector("Url").firstChild.nodeValue});
            }
          }
          // cache the result
          found=false;
          _SP_CACHE_DISTRIBUTIONLISTS.forEach(function(c) {
            if (c.user === username && c.url === setup.url) {
              c.data=aResult;
              found=true;
            }
          })
          if (!found) _SP_CACHE_DISTRIBUTIONLISTS.push({user:username,url:setup.url,data:aResult})
          prom_resolve(aResult);
        }, function(error) {
          prom_reject(error)
        });
      })
    },
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
    groupMembers:function(groupname, setup) {
      var _this=this;
      return _this._promise(function(prom_resolve, prom_reject) {
        if (!groupname) throw "[SharepointPlus 'groupMembers'] the groupname is required.";
        // default values
        setup = setup || {};
        setup.cache = (setup.cache === false ? false : true);
        if (!setup.url) {
          if (!_this.url) {
            _this.getURL()
            .then(function(url) { setup.url=url; return _this.groupMembers(groupname, setup) })
            .then(function(res) { prom_resolve(res) })
            .catch(function(rej) { prom_reject(rej) });
            return
          }
        }

        groupname=groupname.toLowerCase();
        setup.url=setup.url.toLowerCase();
        // check the cache
        // [ {user:"username", url:"url", data:"the distribution lists"}, ... ]
        var found=false;
        if (setup.cache) {
          _SP_CACHE_GROUPMEMBERS.forEach(function(c) {
            if (c.group === groupname && c.url === setup.url) {
              prom_resolve(c.data);
              found=true;
            }
          })
        }
        if (found) return;

        // send the request
        _this.ajax({
          url:setup.url + "/_vti_bin/usergroup.asmx",
          body:_this._buildBodyForSOAP("GetUserCollectionFromGroup", "<groupName>"+_this._cleanString(groupname)+"</groupName>", "http://schemas.microsoft.com/sharepoint/soap/directory/"),
          headers:{'SOAPAction':'http://schemas.microsoft.com/sharepoint/soap/directory/GetUserCollectionFromGroup'}
        }).then(function(data) {
          var aResult=[];
          // get the details
          data=data.querySelectorAll('User');
          for (var i=0,len=data.length; i<len; i++) {
            aResult.push({"ID": data[i].getAttribute("ID"), "Name":data[i].getAttribute("Name"), "LoginName":data[i].getAttribute("LoginName"), "Email":data[i].getAttribute("Email")});
          }
          // cache the result
          found=false;
          _SP_CACHE_GROUPMEMBERS.forEach(function(c) {
            if (c.group === groupname && c.url === setup.url) {
              c.data=aResult;
              found=true;
            }
          })
          if (!found) _SP_CACHE_GROUPMEMBERS.push({group:groupname,url:setup.url,data:aResult});
          prom_resolve(aResult);
        }, function(error) {
          prom_reject(error)
        });
      })
    },
    /**
      @name $SP().isMember
      @function
      @category people
      @description Find if the user is member of the Sharepoint group

      @param {Object} [setup] Options (see below)
        @param {String} setup.user Username with domain ("domain\\login" for Sharepoint 2010, or e.g. "i:0#.w|domain\\login" for Sharepoint 2013)
        @param {String} setup.group Name of the group
        @param {String} [setup.url='current website'] The website url
        @param {Boolean} [setup.cache=true] Cache the response from the server
      @param {Function} [result] Return TRUE if the user is a member of the group, FALSE if not.

      @example
      $SP().isMember({user:"mydomain\\john_doe",group:"my group",url:"http://my.site.com/"}, function(isMember) {
        if (isMember) alert("OK !")
      });
    */
    isMember:function(setup, fct) {
      // default values
      setup         = setup || {};
      setup.cache = (setup.cache === false ? false : true)
      if (setup.url == undefined) {
        if (!this.url) { this._getURL(); return this._addInQueue(arguments) }
        else setup.url=this.url;
      } else this.url=setup.url;
      fct           = fct || (function() {});
      if (!setup.user) throw "Error 'isMember': you have to set an user.";
      if (!setup.group) throw "Error 'isMember': you have to set a group.";

      setup.group = setup.group.toLowerCase();
      // first check with usergroups()
      this.usergroups(setup.user,{cache:setup.cache,error:false},function(groups) {
        for (var i=groups.length; i--;) {
          if (groups[i].toLowerCase() === setup.group) { fct.call(this,true); return this }
        }
        // if we're there then it means we need to keep investigating
        // look at the members of the group
        this.groupMembers(setup.group,{cache:setup.cache,error:false},function(m) {
          var members=[];
          for (var i=m.length; i--;) members.push(m[i].Name.toLowerCase())
          // and search if our user is part of the members (like a distribution list)
          this.distributionLists(setup.user, {cache:setup.cache}, function(distrib) {
            for (var i=distrib.length; i--;) {
              if (SPArrayIndexOf(members, distrib[i].DisplayName.toLowerCase()) > -1) { fct.call(this,true); return this }
            }

            // if we are here it means we found nothing
            fct.call(this,false);
            return this
          });
        });
      })

      return this;
    },
    /**
      @name $SP().people
      @function
      @category people
      @description Find the user details like manager, email, ...

      @param {String} [username] With or without the domain, and you can also use an email address, and if you leave it empty it's the current user by default (if you use the domain, don't forget to use a double \ like "mydomain\\john_doe")
      @param {Object} [setup] Options (see below)
        @param {String} [setup.url='current website'] The website url
      @param {Function} [result] A function that will be executed at the end of the request with a param that is an array with the result, or a String with the error message

      @example
      $SP().people("john_doe",{url:"http://my.si.te/subdir/"}, function(people) {
        if (typeof people === "string") {
          alert(people); // there was a problem so we prompt it
        } else
          for (var i=0; i &lt; people.length; i++) console.log(people[i]+" = "+people[people[i]]);
      });
    */
    people:function(username, setup, fct) {
      var _this=this;
      switch (arguments.length) {
        case 1: {
          if (typeof username === "object") return _this.people("",username,function(){});
          else if (typeof username === "function") return _this.people("",{},username);
          username=undefined;
          break;
        }
        case 2: {
          if (typeof username === "string" && typeof setup === "function") return _this.people(username,{},setup);
          if (typeof username === "object" && typeof setup === "function") return _this.people("",username,setup);
        }
      }

      // default values
      setup         = setup || {};
      if (setup.url == undefined) {
        if (!_this.url) { _this._getURL(); return _this._addInQueue(arguments) }
        else setup.url=_this.url;
      } else _this.url=setup.url;
      fct           = fct || (function() {});
      username      = username || "";

      // build the request
      var body = _this._buildBodyForSOAP("GetUserProfileByName", "<AccountName>"+username+"</AccountName>", "http://microsoft.com/webservices/SharePointPortalServer/UserProfileService");
      // send the request
      var url = setup.url + "/_vti_bin/UserProfileService.asmx";
      _this.ajax({
        method:"POST",
        cache:false,
        url:url,
        body:body,
        beforeSend: function(xhr) { xhr.setRequestHeader('SOAPAction', 'http://microsoft.com/webservices/SharePointPortalServer/UserProfileService/GetUserProfileByName'); },
        contentType: "text/xml; charset=utf-8",
        dataType: "xml",
        success:function(data) {
          var aResult=[];
          // get the details
          data=data.getElementsByTagName('PropertyData');
          for (var i=0,len=data.length; i<len; i++) {
            var name=data[i].getElementsByTagName("Name")[0].firstChild.nodeValue;
            var value=data[i].getElementsByTagName("Value");
            if (value&&value.length>=1&&value[0].firstChild) value=value[0].firstChild.nodeValue;
            else value="No Value";
            aResult.push(name);
            aResult[name]=value;
          }
          fct.call(_this,aResult);
        },
        error:function(req, textStatus, errorThrown) { // eslint-disable-line
          // any error ?
          var error=req.responseXML.getElementsByTagName("faultstring");
          fct.call(_this,"Error 'people': "+error[0].firstChild.nodeValue);
        }
      });
      return _this;
    },
    /**
      @name $SP().getUserInfo
      @function
      @category people
      @description Find the User ID, work email, and preferred name for the specified username (this is useful because of the User ID that can then be used for filtering a list)

      @param {String} username That must be "domain\\login" for Sharepoint 2010, or something like "i:0#.w|domain\\login" for Sharepoint 2013
      @param {Object} [setup] Options (see below)
        @param {String} [setup.url='current website'] The website url
      @param {Function} [result] A function that will be executed at the end of the request with a param that is an object with the result ({ID,Sid,Name,LoginName,Email,Notes,IsSiteAdmin,IsDomainGroup,Flags}), or a String with the error message

      @example
      $SP().getUserInfo("domain\\john_doe",{url:"http://my.si.te/subdir/"}, function(info) {
        if (typeof info === "string") {
          alert("Error:"+info); // there was a problem so we show it
        } else
          alert("User ID = "+info.ID)
      });
    */
    getUserInfo:function(username, setup, fct) {
      var _this=this;
      if (typeof username !== "string") throw "Error 'getUserInfo': the first argument must be the username";
      switch (arguments.length) {
        case 2: {
          if (typeof setup === "function") return _this.getUserInfo(username,{},setup);
          if (typeof setup === "object") return _this.getUserInfo(username,setup,function() {});
          break;
        }
        case 3: if (typeof setup !== "object" && typeof fct !== "function") throw "Error 'getUserInfo': incorrect arguments, please review the documentation";
      }

      // default values
      setup = setup || {};
      if (setup.url == undefined) {
        if (!_this.url) { _this._getURL(); return _this._addInQueue(arguments) }
        else setup.url=_this.url;
      } else _this.url=setup.url;
      fct = fct || (function() {});

      // build the request
      var body = _this._buildBodyForSOAP("GetUserInfo", '<userLoginName>'+username+'</userLoginName>', "http://schemas.microsoft.com/sharepoint/soap/directory/");
      // send the request
      var url = setup.url + "/_vti_bin/usergroup.asmx";
      _this.ajax({
        method:"POST",
        cache:false,
        url:url,
        body:body,
        contentType: "text/xml; charset=utf-8",
        dataType: "xml",
        success:function(data) {
          // get the details
          data=data.getElementsByTagName('User');
          if (data.length===0) {
            fct.call(_this,"Error 'getUserInfo': nothing returned?!")
          } else {
            fct.call(_this,{ID:data[0].getAttribute("ID"),Sid:data[0].getAttribute("Sid"),Name:data[0].getAttribute("Name"),LoginName:data[0].getAttribute("LoginName"),Email:data[0].getAttribute("Email"),Notes:data[0].getAttribute("Notes"),IsSiteAdmin:data[0].getAttribute("IsSiteAdmin"),IsDomainGroup:data[0].getAttribute("IsDomainGroup"),Flags:data[0].getAttribute("Flags")})
          }
        },
        error:function(req, textStatus, errorThrown) { // eslint-disable-line
          // any error ?
          var error=req.responseXML.getElementsByTagName("errorstring");
          fct.call(_this,"Error 'getUserInfo': "+error[0].firstChild.nodeValue);
        }
      });
      return this;
    },
    /**
      @name $SP().whoami
      @function
      @category people
      @description Find the current user details like manager, email, colleagues, ...

      @param {Object} [setup] Options (see below)
        @param {String} [setup.url='current website'] The website url
      @param {Function} [result] A function that will be executed at the end of the request with a param that is an array with the result

      @example
      $SP().whoami({url:"http://my.si.te/subdir/"}, function(people) {
        for (var i=0; i &lt; people.length; i++) console.log(people[i]+" = "+people[people[i]]);
      });
    */
    whoami:function(setup, fct) {
      if (typeof setup === "function") { fct=setup; setup = {} }
      return this.people("",setup,fct);
    },
    /**
      @name $SP().regionalSettings
      @function
      @category utils
      @description Find the region settings (of the current user) defined with _layouts/regionalsetng.aspx?Type=User (lcid, cultureInfo, timeZone, calendar, alternateCalendar, workWeek, timeFormat..)

      @param {Function} [callback] A function with one paramater that contains the parameters returned from the server

      @example
      $SP().regionalSettings(function(region) {
        if (typeof region === "string") {
          // something went wrong
          console.log(region); // returns the error
        } else {
          // show the selected timezone, and the working days
          console.log("timeZone: "+region.timeZone);
          console.log("working days: "+region.workWeek.days.join(", "))
        }
      })
    */
    regionalSettings:function(callback) {
      var _this = this;
      // find the base URL
      if (!_this.url) { _this._getURL(); return _this._addInQueue(arguments) }
      if (typeof callback !== "function") callback = function() {};

      // check cache
      if (_SP_CACHE_REGIONALSETTINGS) callback.call(_this, _SP_CACHE_REGIONALSETTINGS);

      _this.ajax({
        method:'GET',
        url:_this.url + "/_layouts/regionalsetng.aspx?Type=User",
        success:function(data) {
          var result = {lcid:"", cultureInfo:"", timeZone:"", calendar:"", alternateCalendar:""};
          var div = document.createElement('div');
          div.innerHTML = data;
          var tmp, i;
          var getValue = function(id) {
            var e = div.querySelector("select[id$='"+id+"']");
            return e.options[e.selectedIndex].innerHTML;
          };

          result.lcid = div.querySelector("select[id$='LCID']").value;
          result.cultureInfo = getValue("LCID");
          result.timeZone = getValue("TimeZone");
          result.calendar = getValue("DdlwebCalType");
          result.alternateCalendar = getValue("DdlwebAltCalType");

          tmp=document.querySelectorAll("input[id*='ChkListWeeklyMultiDays']");
          result.workWeek = {days:[], firstDayOfWeek:"", firstWeekOfYear:"", startTime:"", endTime:""};
          for (i=0; i<tmp.length; i++) {
            if (tmp[i].checked) result.workWeek.days.push(tmp[i].nextSibling.querySelector('abbr').getAttribute("title"))
          }

          result.workWeek.firstDayOfWeek = getValue("DdlFirstDayOfWeek");
          result.workWeek.firstWeekOfYear = getValue("DdlFirstWeekOfYear");
          result.workWeek.startTime=div.querySelector("select[id$='DdlStartTime']").value;
          result.workWeek.endTime=div.querySelector("select[id$='DdlEndTime']").value;
          result.timeFormat = getValue("DdlTimeFormat");

          // cache
          _SP_CACHE_REGIONALSETTINGS = result;

          callback.call(_this, result);
        },
        error:function(jqXHR, textStatus, errorThrown) {
          callback.call(_this, "Error: ["+textStatus+"] "+errorThrown);
        }
      });

      return _this;
    },
    /**
      @name $SP().regionalDateFormat
      @function
      @category utils
      @description Provide the Date Format based on the user regional settings (YYYY for 4-digits Year, YY for 2-digits day, MM for 2-digits Month, M for 1-digit Month, DD for 2-digits day, D for 1-digit day) -- it's using the DatePicker iFrame (so an AJAX request)

      @param {Function} [callback] It will pass the date format

      @example
      // you'll typically need that info when parsing a date from a Date Picker field from a form
      // we suppose here you're using momentjs
      // eg. we want to verify start date is before end date
      var startDate = $SP().formfields("Start Date").val();
      var endDate = $SP().formfields("End Date").val();
      $SP().regionalDateFormat(function(dateFormat) {
        // if the user settings are on French, then dateFormat = "DD/MM/YYYY"
        if (moment(startDate, dateFormat).isAfter(moment(endDate, dateFormat))) {
          alert("StartDate must be before EndDate!")
        }
      })

      // Here is also an example of how you can parse a string date
      // -> https://gist.github.com/Aymkdn/b17903cf7786578300f04f50460ebe96
     */
    regionalDateFormat:function(callback) {
      var _this = this;
      // find the base URL
      if (!_this.url) { _this._getURL(); return _this._addInQueue(arguments) }
      if (typeof callback !== "function") callback = function() {};

      // check cache
      if (_SP_CACHE_DATEFORMAT) callback.call(_this, _SP_CACHE_DATEFORMAT);

      // check if we have LCID
      var lcid = "";
      if (typeof _spRegionalSettings !== "undefined") lcid=_spRegionalSettings.localeId; // eslint-disable-line
      else if (_SP_CACHE_REGIONALSETTINGS) lcid=_SP_CACHE_REGIONALSETTINGS.lcid;
      if (!lcid) {
        return _this.regionalSettings(function() {
          _this.regionalDateFormat(callback);
        })
      }

      _this.ajax({
        method:'GET',
        url:_this.url + "/_layouts/iframe.aspx?cal=1&date=1/1/2000&lcid="+lcid,
        success:function(data) {
          var div = document.createElement('div');
          div.innerHTML = data;

          // div will contain the full datepicker page, for the January 2000
          // search for 3/January/2000
          var x = div.querySelector('a[id="20000103"]').getAttribute("href").replace(/javascript:ClickDay\('(.*)'\)/,"$1");
          // source : http://stackoverflow.com/questions/7885096/how-do-i-decode-a-string-with-escaped-unicode
          var r = /\\u([\d\w]{4})/gi;
          x = x.replace(r, function (match, grp) { return String.fromCharCode(parseInt(grp, 16)); } );
          x = unescape(x); // eg: 3.1.2000
          x = x.replace(/20/, "YY"); // 3.1.YY00
          x = x.replace(/00/, "YY"); // 3.1.YYYY
          x = x.replace(/03/, "DD"); // 3.1.YYYY
          x = x.replace(/3/, "D"); // D.1.YYYY
          x = x.replace(/01/, "MM"); // D.1.YYYY
          x = x.replace(/1/, "M"); // D.M.YYYY
          _SP_CACHE_DATEFORMAT = x;
          callback.call(_this, x)
        },
        error:function(jqXHR, textStatus, errorThrown) {
          callback.call(_this, "Error: ["+textStatus+"] "+errorThrown)
        }
      });

      return _this;
    },
    /**
      @name $SP().addressbook
      @function
      @category people
      @description Find an user based on a part of his name

      @param {String} word A part of the name from the guy you're looking for
      @param {Object} [setup] Options (see below)
        @param {String} [setup.limit=10] Number of results returned
        @param {String} [setup.type='User'] Possible values are: 'All', 'DistributionList', 'SecurityGroup', 'SharePointGroup', 'User', and 'None' (see http://msdn.microsoft.com/en-us/library/people.spprincipaltype.aspx)
        @param {String} [setup.url='current website'] The website url
      @param {Function} [result] A function that will be executed at the end of the request with a param that is an array with the result (typically: AccountName,UserInfoID,DisplayName,Email,Departement,Title,PrincipalType)

      @example
      $SP().addressbook("john", {limit:25}, function(people) {
        for (var i=0; i &lt; people.length; i++) {
          for (var j=0; j &lt; people[i].length; j++) console.log(people[i][j]+" = "+people[i][people[i][j]]);
        }
      });
    */
    addressbook:function(username, setup, fct) {
      var _this=this;
      switch (arguments.length) {
        case 1: {
          if (typeof username === "object") return _this.addressbook("",username,function(){});
          else if (typeof username === "function") return _this.addressbook("",{},username);
          else if (typeof username === "string")  return _this.addressbook(username,{},function(){});
          username=undefined;
          break;
        }
        case 2: {
          if (typeof username === "string" && typeof setup === "function") return _this.addressbook(username,{},setup);
          if (typeof username === "object" && typeof setup === "function") return _this.addressbook("",username,setup);
        }
      }

      // default values
      setup         = setup || {};
      if (setup.url == undefined) {
        if (!_this.url) { _this._getURL(); return _this._addInQueue(arguments) }
        else setup.url=_this.url;
      } else _this.url=setup.url;
      setup.limit   = setup.limit || 10;
      setup.type    = setup.type || "User";
      fct           = fct || (function() {});
      username      = username || "";


      // build the request
      var body = _this._buildBodyForSOAP("SearchPrincipals", "<searchText>"+username+"</searchText><maxResults>"+setup.limit+"</maxResults><principalType>"+setup.type+"</principalType>");
      // send the request
      var url = setup.url + "/_vti_bin/People.asmx";
      _this.ajax({
        method:"POST",
        cache:false,
        url:url,
        body:body,
        beforeSend: function(xhr) { xhr.setRequestHeader('SOAPAction', 'http://schemas.microsoft.com/sharepoint/soap/SearchPrincipals'); },
        contentType: "text/xml; charset=utf-8",
        dataType: "xml",
        success:function(data) {
          var aResult=[];
          // get the details
          data=data.getElementsByTagName('PrincipalInfo');
          for (var i=0,lenR=data.length; i<lenR; i++) {
            var children=data[i].childNodes;
            aResult[i]=[];
            for (var j=0,lenC=children.length; j<lenC; j++) {
              var name=children[j].nodeName;
              var value=children[j].firstChild;
              if (value) value=value.nodeValue;
              aResult[i].push(name);
              aResult[i][name]=value;
            }
          }
          fct.call(_this,aResult);
        }
      });
      return _this;
    },
    /*
     @ignore
     */
    reset:function() {
      var _this=this;
      _this.data   = [];
      _this.length = 0;
      _this.listID = "";
      _this.needQueue=false;
      _this.listQueue=[];
      delete _this.url;
      return _this;
    },
    /**
      @name $SP().toDate
      @function
      @category utils
      @description Change a Sharepoint date (as a string) to a Date Object
      @param {String} textDate the Sharepoint date string
      @param {Boolean} [forceUTC=false] Permits to force the reading of the date in UTC
      @return {Date} the equivalent Date object for the Sharepoint date string passed
      @example $SP().toDate("2012-10-31T00:00:00").getFullYear(); // 2012
    */
    toDate:function(strDate, forceUTC) {
      if (!strDate) return ""
      // 2008-10-31(T)00:00:00(Z)
      if (strDate instanceof Date) return strDate
      if (strDate.length!=19 && strDate.length!=20) throw "toDate: '"+strDate+"' is invalid."
      var year  = strDate.substring(0,4);
      var month = strDate.substring(5,7);
      var day   = strDate.substring(8,10);
      var hour  = strDate.substring(11,13);
      var min   = strDate.substring(14,16);
      var sec   = strDate.substring(17,19);
      // check if we have "Z" for UTC date
      return (strDate.indexOf("Z") > -1 || forceUTC ? new Date(Date.UTC(year,month-1,day,hour,min,sec)) : new Date(year,month-1,day,hour,min,sec));
    },
    /**
      @name $SP().toSPDate
      @function
      @category utils
      @description Change a Date object into a Sharepoint date string
      @param {Date} dateObject The Date object you want to convert
      @param {Date} [includeTime=false] By default the time is not returned (if the time appears then the WHERE clause will do a time comparison)
      @return {String} the equivalent string for the Date object passed

      @example
      $SP().toSPDate(new Date(2012,9,31), true); // --> "2012-10-31 00:00:00"
      $SP().toSPDate(new Date(2012,9,31)); // --> "2012-10-31"
    */
    toSPDate:function(oDate, includeTime) {
      var pad = function(p_str){
        if(p_str.toString().length==1){p_str = '0' + p_str;}
        return p_str;
      };
      var month   = pad(oDate.getMonth()+1);
      var day     = pad(oDate.getDate());
      var year    = oDate.getFullYear();
      var hours   = pad(oDate.getHours());
      var minutes = pad(oDate.getMinutes());
      var seconds = pad(oDate.getSeconds());
      return year+"-"+month+"-"+day+(includeTime?" "+hours+":"+minutes+":"+seconds : "");
    },
    /**
      @name $SP().toCurrency
      @function
      @category utils
      @description It will return a number with commas, currency sign and a specific number of decimals
      @param {Number|String} number The number to format
      @param {Number} [decimal=-1] The number of decimals (use -1 if you want to have 2 decimals when there are decimals, or no decimals if it's .00)
      @param {String} [sign='$'] The currency sign to add

      @return {String} The converted number
      @example

      $SP().toCurrency(1500000); // --> $1,500,000
      $SP().toCurrency(1500000,2,''); // --> 1,500,000.00
     */
    toCurrency:function(n,dec,sign) {
      n=Number(n);
      if (dec === undefined) dec=-1;
      if (sign === undefined) sign='$';
      var m="";
      if (n<0) { m="-"; n*=-1; }
      var s = n;
      if (dec===-1) s = s.toFixed(2).replace('.00', '');
      else s = s.toFixed(dec);
      var digits = (Math.floor(n) + '').length;
      for (var i=0, j=0, mod=digits%3; i<digits; i++) {
        if (i==0 || i%3!=mod) continue;
        s = s.substr(0, i+j) + ',' + s.substr(i+j);
        j++;
      }
      return (sign!=''?sign:'')+m+s+(sign!=''?'':' '+sign);
    },
    /**
      @name $SP().getLookup
      @function
      @category utils
      @description Split the ID and Value
      @param {String} text The string to retrieve data
      @return {Object} .id returns the ID, and .value returns the value
      @example $SP().getLookup("328;#Foo"); // --> {id:328, value:"Foo"}
    */
    getLookup:function(str) { if (!str) { return {id:"", value:""} } var a=str.split(";#"); return {id:a[0], value:a[1]}; },
    /**
      @name $SP().toXSLString
      @function
      @category utils
      @description Change a string into a XSL format string
      @param {String} text The string to change
      @return {String} the XSL version of the string passed
      @example $SP().toXSLString("Big Title"); // --> "Big_x0020_Title"
    */
    toXSLString:function(str) {
      if (typeof str !== "string") throw "Error 'toXLSString': '"+str+"' is not a string....";
      // if the first car is a number, then FullEscape it
      var FullEscape = function(strg) {
        var hexVals = new Array("0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F");
        var rstr = "";
        for (var i=0; i < strg.length; i++) {
          var c = strg.charAt(i);
          var num = c.charCodeAt(0);
          var temp = 0;
          var hexString = "";
          while (num >= 16) {
            temp = num % 16;
            num = Math.floor(num / 16);
            hexString += hexVals[temp];
          }
          hexString += hexVals[num];
          var tmpStr = "";
          for (var k=hexString.length-1; k >= 0; k--) tmpStr += hexString.charAt(k);
          rstr += "%" + tmpStr;
        }
        return rstr;
      };
      var aSpaces = str.split(" ");
      var ret = "";
      // check if there is a number and work length is smaller than 5 letters
      if (/^[0-9]/.test(aSpaces[0]) && aSpaces[0].length < 5) {
        // change the first letter
        ret = FullEscape(str.charAt(0));
        str = str.substring(1);
      }
      for (var i=0; i < str.length; i++) {
        var c = str.charAt(i);
        if (/[0-9A-Za-z_]/.test(c) === false) ret += FullEscape(c).toLowerCase();
        else ret += c;
      }
      return ret.replace(/%([a-zA-Z0-9][a-zA-Z0-9])/g,"_x00$1_").substring(0,32);
    },
    /**
      @name $SP().formfields
      @namespace
      @description Retrieve the fields info in the NewForm and in the EditForm
      @return {Array} An array of hash with several keys: name, values, elements, type, and tr

      @param {String|Array} [fields=""] A list of fields to get (e.g. "field1,other field,field2" or ["field1","other field","field2"]) and by default we take all fields ... ATTENTION if you have a field with "," then use only the Array as a parameter
      @param {Object} [setup] Options (see below)
        @param {Boolean} [setup.mandatory=undefined] Set it to 'true' to look for the mandatory fields (the "false" value has no effect)
        @param {Boolean} [setup.cache=true] By default the form is scanned only once, but you can use {cache:false} to force the form to be rescanned

      @example
      $SP().formfields(); // return all the fields

      $SP().formfields({mandatory:true}).each(function() { // return all the mandatory fields
        var field = this;
        if (field.val().length==0) console.log(field.name()+" is empty!");
      });
      $SP().formfields("Title,Contact Name,Email").each(function() { // return these three fields
        var field = this;
        console.log(field.name()+" has these values: "+field.val());
      });
      // if you have a field with a comma use an Array
      $SP().formfields(["Title","Long field, isn't it?","Contact Name","Email"]).each(function() {
        var field = this;
        console.log(field.name()+" has the description: "+field.description());
      });
      // returns the fields "Title" and "New & York", and also the mandatory fields
      $SP().formfields(["Title", "New & York"],{mandatory:true});
    */
    formfields:function(fields, settings) {
      'use strict';
      this.reset();
      if (arguments.length == 1 && typeof fields === "object" && typeof fields.length === "undefined") { settings=fields; fields=undefined; }

      // default values
      settings = settings || {};
      fields   = fields   || [];
      settings.cache = (settings.cache === false ? false : true);

      var aReturn = [], bigLimit=10000;
      if (typeof fields === "string") fields=( fields==="" ? [] : fields.split(",") );
      var limit = (fields.length>0 ? fields.length : bigLimit);
      if (limit === bigLimit && !settings.mandatory) settings.includeAll=true; // if we want all of them

      // find all the fields, then cache them if not done already
      if (settings.cache && _SP_CACHE_FORMFIELDS !== null) {
        var allFields = _SP_CACHE_FORMFIELDS.slice(0);
        if (settings.includeAll) {
          this.length=allFields.length;
          this.data=allFields;
          return this;
        }
        var done=0,i,len=allFields.length,idx;
        // retrieve the field names
        var fieldNames=[];
        for (i=0;i<len;i++) fieldNames.push(allFields[i]._name)
        // search for the fields defined
        for (i=0; i<limit; i++) {
          idx=SPArrayIndexOf(fieldNames, fields[i]);
          if (idx > -1) aReturn.push(allFields[idx])
        }
        for (i=0,len=(settings.mandatory?allFields.length:0); i<len; i++) {
          if (allFields[i]._isMandatory && SPArrayIndexOf(fields, allFields[i]._name) === -1) aReturn.push(allFields[i])
        }
        this.length=aReturn.length;
        this.data=aReturn;
        return this;
      }

      settings.includeAll=true;
      settings.cache=true;

      // we use the HTML Comments to identify the fields
      var getFieldInfoFromComments=function(elem) {
        // code from http://stackoverflow.com/questions/13363946/how-do-i-get-an-html-comment-with-javascript
        var comments = [];
        // for IE < 9
        if (typeof document.createNodeIterator === "undefined") {
          // 8 according to the DOM spec
          var Node = {COMMENT_NODE:8};
          var children = elem.childNodes;

          for (var i=0, len=children.length; i<len; i++) {
            if (children[i].nodeType == Node.COMMENT_NODE) {
              comments.push(children[i].nodeValue);
            }
          }
        } else {
          var filterNone = function() { return NodeFilter.FILTER_ACCEPT };
          // Fourth argument, which is actually obsolete according to the DOM4 standard, is required in IE 11
          var iterator = document.createNodeIterator(elem, NodeFilter.SHOW_COMMENT, filterNone, false);
          var curNode;
          while (curNode = iterator.nextNode()) { // eslint-disable-line
            comments.push(curNode.nodeValue);
          }
        }

        var mtch = comments.join("").replace(/\s\s*/g," ").match(/FieldName="([^"]+)".* FieldInternalName="([^"]+)".* FieldType="([^"]+)"/)
        return (mtch ? {"Name":mtch[1], "InternalName":mtch[2], "SPType":mtch[3]} : {"Name":"", "InternalName":"", "SPType":""});
      };

      // Retrieve the text of an HTML element (from jQuery source)
      var getText = function(elem) {
        var i, node, nodeType = elem.nodeType, ret = "";
        if (nodeType) {
          if (nodeType === 1 || nodeType === 9 || nodeType === 11) {
            // Use textContent || innerText for elements
            if (typeof elem.textContent === 'string') return elem.textContent;
            else if (typeof elem.innerText === 'string') {
              // Replace IE's carriage returns
              return elem.innerText.replace(/\r/g, '');
            } else {
              // Traverse its children
              for (elem = elem.firstChild; elem; elem = elem.nextSibling) ret += getText(elem);
            }
          } else if (nodeType === 3 || nodeType === 4) return elem.nodeValue;
        } else {
          // If no nodeType, this is expected to be an array
          for (i = 0; (node = elem[i]); i++) {
            // Do not traverse comment nodes
            if (node.nodeType !== 8) ret += getText(node);
          }
        }
        return ret;
      };

      // Select an OPTION into a SELECT based on it's text
      // params "text", "value", "all", "none"
      var setSelectedOption = function(select, val, params) {
        params = params || "text";
        var options = select.querySelectorAll('option');
        var v, isArray = SPIsArray(val);
        for (var o=0, len=options.length; o<len; o++) {
          if (params === "all") options[o].selected = true;
          else if (params === "none") options[o].selected = false;
          else {
            v = (params === "text" ? options[o].innerHTML : options[o].value);
            options[o].selected = (isArray ? SPArrayIndexOf(val, v) > -1 : (val == v));
          }
        }
      };
      // params can be "text", "value" or "both"
      var getSelectedOption = function(select, params) {
        params = params || "text";
        var options = select.querySelectorAll('option');
        var val=[], isMultiple = (select.getAttribute("multiple") !== null);
        for (var o=0, len=options.length; o<len; o++) {
          if (options[o].selected) {
            if (params === "text") {
              val.push(getText(options[o]));
              if (isMultiple) continue;
              return val[0]||"";
            }
            if (params === "value") {
              val.push(options[o].value);
              if (isMultiple) continue;
              return val[0]||"";
            }
            if (params === "both") {
              val.push({"text":getText(options[o]), "value":options[o].value});
              if (isMultiple) continue;
              return val[0]||"";
            }
          }
        }

        return (isMultiple ? val : (val.length===0 ? "" : val));
      };

      if (settings.includeAll) limit=bigLimit;

      // we now find the names of all fields
      // eslint-disable-next-line
      for (var a=document.querySelectorAll('td.ms-formbody'), i=-1, len=a.length, done=0; i<len && done<limit; i++) { // we start at -1 because of Content Type
        // eslint-disable-next-line
        var tr, td, isMandatory=false, html /* HTML content of the NOBR tag */, txt /* Text content of the NOBR tag */, infoFromComments, includeThisField=false;
        // eslint-disable-next-line
        var search; // if we have to search for a value
        var fieldName, obj, tmp;

        if (settings.includeAll) includeThisField=true;

        if (i === -1) { // handle the content type
          if (includeThisField || SPArrayIndexOf(fields, 'Content Type') > -1) {
            infoFromComments={"Name":"Content Type", "InternalName":"Content_x0020_Type", "SPType":"SPContentType"};
            includeThisField=true;
          }
        } else {
          tr = a[i].parentNode;
          td = tr.querySelector('td.ms-formbody');

          // get info from the comments
          infoFromComments = getFieldInfoFromComments(a[i]);
          if (!infoFromComments.Name) {
            // check if it's Attachments
            if (tr.getAttribute("id") === "idAttachmentsRow") {
              infoFromComments={"Name":"Attachments", "InternalName":"Attachments", "SPType":"SPAttachments"};
              includeThisField=true;
            }
            else continue;
          }

          // find the <nobr> to check if it's mandatory
          txt = tr.querySelector('td.ms-formlabel nobr');
          if (!txt) continue;
          // the text will finish by " *"
          txt = getText(txt);
          isMandatory = / \*$/.test(txt);

          // do we want the mandatory fields ?
          if (settings.mandatory && isMandatory) includeThisField=true;
          else {
            // check if the field is in the list
            if (limit !== bigLimit && SPArrayIndexOf(fields, infoFromComments.Name) > -1) {
              includeThisField=true;
              done++;
            }
          }
        }

        // the field must be included
        if (includeThisField) {
          fieldName = infoFromComments.Name;
          obj       = {
            _name: fieldName,
            _internalname: infoFromComments.InternalName,
            _isMandatory: isMandatory,
            _description: "", /* the field's description */
            _elements: [], /* the HTML elements related to that field */
            _tr: null, /* the TR parent node */
            _type: null /* the type of this field: checkbox, boolean */
          };

          if (fieldName === "Content Type") { // the Content Type field is different !
            obj._elements = document.querySelector('.ms-formbody select[title="Content Type"]');
            if (!obj._elements) continue;
            obj._type = "content type";
            obj._tr = obj._elements.parentNode.parentNode;
          } else
            obj._tr = tr;

          obj.val    = function() {};
          obj.elem   = function(usejQuery) {
            usejQuery = (usejQuery === false ? false : true);
            var aReturn = this._elements;
            var hasJQuery=(typeof jQuery === "function" && usejQuery === true);
            if (aReturn instanceof NodeList) aReturn = [].slice.call(aReturn)
            if (!SPIsArray(aReturn)) return hasJQuery ? jQuery(aReturn) : aReturn;
            switch(aReturn.length) {
              case 0: return hasJQuery ? jQuery() : null;
              case 1: return hasJQuery ? jQuery(aReturn[0]) : aReturn[0];
              default: return hasJQuery ? jQuery(aReturn) : aReturn;
            }
          };
          obj.description = function() { return this._description }
          obj.type = function() { return this._type }; // this function returns the type of the field
          obj.row  = function() { return (typeof jQuery === "function" ? jQuery(this._tr) : this._tr) }; // this function returns the TR parent node
          obj.name = function() { return this._name };
          obj.internalname = function() { return this._internalname };
          obj.isMandatory = function() { return this._isMandatory };
          obj.options = function() {};

          if (obj._name === "Attachments") {
            obj._type = "attachments";
            obj.elem = function(usejQuery) {
              usejQuery = (usejQuery === false ? false : true);
              var aReturn = document.getElementById('idAttachmentsRow').querySelector('.ms-formbody').querySelectorAll('tr');
              var hasJQuery=(typeof jQuery === "function" && usejQuery === true);

              switch(aReturn.length) {
                case 0: return hasJQuery ? jQuery() : null;
                case 1: return hasJQuery ? jQuery(aReturn[0]) : aReturn[0];
                default: return hasJQuery ? jQuery(aReturn) : aReturn;
              }
            }
            obj.val = function(v) {
              if (typeof v === "undefined") { // get
                v=[];
                var e=this.elem(false);
                if (e) {
                  if (!e.length) e=[e];
                  for (var i=0; i<e.length;i ++) {
                    v.push(getText(e[i].querySelector("span")));
                  }
                }
                return v;
              } else {
                return this;
              }
            }
          } else if (obj._name === "Content Type") {
            obj.val = function(v) {
              var e=this.elem(false);
              if (typeof v === "undefined") { // get
                return getSelectedOption(e, "text");
              } else {
                setSelectedOption(e, v, "text");
                eval("!function() {"+e.getAttribute("onchange").replace(/javascript:/,"")+"}()")
                return this;
              }
            };
          } else {
            // get the field description
            // Description in SP2013 is inside a .ms-metadata
            tmp = td.querySelector('.ms-metadata');
            if (tmp && tmp.parentNode == td) {
              obj._description = getText(tmp).trim();
            } else {
              // otherwise we use the last TextNode
              tmp = td.childNodes;
              tmp = tmp[tmp.length-1];
              if (tmp.nodeType==3) obj._description = getText(tmp).trim();
            }

            // work on fields based on SPType
            switch(infoFromComments.SPType) {
              case "SPFieldText":     // Single Line of Text
              case "SPFieldCurrency": // Currency
              case "SPFieldNumber": { // Number
                switch(infoFromComments.SPType) {
                  case "SPFieldCurrency": obj._type="currency"; break;
                  case "SPFieldNumber": obj._type="number"; break;
                  default: obj._type="text";
                }
                obj._elements.push(td.querySelector('input[type="text"]'));

                // val()
                obj.val = function(v) {
                  var e=this.elem(false);
                  if (typeof v !== "undefined") {
                    e.value = v;
                    return this
                  }
                  else return e.value;
                };

                break;
              }
              case "SPFieldNote": { // Multiple Line of Text
                obj._type = "text multiple";
                tmp = td.querySelector('textarea');
                // if there is no TEXTAREA then it means it's not a plain text
                if (tmp) {
                  obj._elements.push(tmp);

                  // val()
                  obj.val = function(v) {
                    var e=this.elem();
                    var type=this.type();
                    if (e[0].tagName.toLowerCase()==="iframe") { // "text multiple" on IE
                      var ifrm = (e.length===1 ? e[0]: e[1]);
                      var doc=(ifrm.contentDocument ? ifrm.contentDocument : ifrm.contentWindow.document);
                      if (v) doc.getElementsByTagName('div')[0].innerHTML=v;
                      else return doc.getElementsByTagName('div')[0].innerHTML;
                    } else {
                      if (typeof v !== "undefined") {
                        e[0].value=v
                        if (type === "text multiple") e[0].innerHTML=v
                      }
                      else return e[0].value
                    }
                    return this
                  };
                } else {
                  obj._type = "html multiple";
                  obj._elements.push(td.querySelector('div'));
                  // val()
                  obj.val = function(v) {
                    var e=this.elem();
                    e = e[0].querySelector('div[contenteditable]');
                    if (e) {
                      if (v !== undefined) {
                        e.innerHTML=v;
                      }
                      else {
                        return e.innerHTML.replace(/^<div class="?ExternalClass[0-9A-Z]+"?>([\s\S]*)<\/div>$/i,"$1").replace(/<span (rtenodeid="1" )?id="?ms-rterangecursor-start"?><\/span><span (rtenodeid="3" )?id="?ms-rterangecursor-end"?([^>]+)?><\/span>/gi,"").replace(/^<p>​<\/p>$/,""); // eslint-disable-line
                      }
                    }
                    return (v !== undefined ? this : null);
                  };
                }

                break;
              }
              case "SPFieldUser":
              case "SPFieldUserMulti": { // Person or Group
                obj._type = "people" + (infoFromComments.SPType === "SPFieldUserMulti" ? " multiple" : "");
                tmp = td.querySelector('div[contenteditable="true"]');
                if (!tmp) obj._elements.push(td.querySelector('div[id]')); // Sharepoint 2013
                else {
                  // for Sharepoint 2010
                  obj._elements.push(tmp);
                  obj._elements.push(td.querySelector('textarea'));
                  !function() {
                    var a = td.querySelectorAll('a');
                    for (var i=0; i < a.length; i++) obj._elements.push(a[i])
                  }();
                }
                // the description is different for SP2010
                if (typeof GetPickerControlValue === "function") {
                  tmp = td.querySelector('table.ms-usereditor');
                  if (tmp) {
                    tmp = tmp.querySelectorAll('span');
                    if (tmp) obj._description = getText(tmp[tmp.length-1]).trim();
                  }
                }

                // 'v' can be {extend:true} to get all the info from SP2013
                obj.val = function(v) {
                  var tmp, res=[], extend=false, id, elems=this.elem(false);
                  if (typeof v === "object" && !SPIsArray(v) && v.extend === true) {
                    v = void 0;
                    extend=true;
                  }

                  // get people picker ID
                  id=(SPIsArray(elems) ? elems[0] : elems).getAttribute("id").replace(/_upLevelDiv$/,"")
                  // get
                  if (typeof v === "undefined") {
                    // if GetPickerControlValue is defined -- SP2010
                    if (typeof GetPickerControlValue === "function") {
                      if (extend === false) {
                        return GetPickerControlValue(id, false, true).trim(); // eslint-disable-line
                      } else {
                        v = GetPickerControlValue(id, false, false); // eslint-disable-line
                        // we try to extract data from there
                        tmp = document.createElement('div');
                        tmp.innerHTML = v;
                        v = tmp.querySelector('#divEntityData');
                        return (v ? {"Key":v.getAttribute("key"), "DisplayText":v.getAttribute("DisplayText")} : {"Key":"", "DisplayText":GetPickerControlValue(id, false, true).trim()}) // eslint-disable-line
                      }
                    } else { // SP2013
                      if (typeof SPClientPeoplePicker === "function") {
                        tmp = SPClientPeoplePicker.SPClientPeoplePickerDict[id]; // eslint-disable-line
                        // if it exists
                        if (tmp) {
                          tmp = tmp.GetAllUserInfo();
                          if (extend) return (tmp.length === 0 ? {"Key":"", "DisplayText":""} : (tmp.length === 1 ? tmp[0] : tmp)); // if we want "extend"
                          else {
                            // return the DisplayText
                            SPArrayForEach(tmp, function(e) { res.push(e.DisplayText) });
                            return (res.length === 0 ? "" : (res.length === 1 ? res[0] : res))
                          }
                        } else {
                          return "";
                        }
                      } else {
                        // if we don't have SPClientPeoplePicker for some reasons...
                        return JSON.parse(this.elem(false).querySelector('input').value)[0].ResolveText
                      }
                    }
                  } else { // set
                    // if EntityEditorCallback is defined -- SP2010
                    if (typeof EntityEditorCallback === "function") {
                      if (!SPIsArray(v)) v=[v];
                      tmp = '<Entities Append="False" Error="" Separator=";" MaxHeight="3">';
                      SPArrayForEach(v, function(e) {
                        tmp += '<Entity Key="' + e + '" DisplayText="' + e + '" IsResolved="False" Description="' + e + '"><MultipleMatches /></Entity>'
                      });
                      tmp += '</Entities>';
                      EntityEditorCallback(tmp, id, false); // eslint-disable-line
                      v=getUplevel(id); // eslint-disable-line
                      // check the value passed
                      WebForm_DoCallback(id.replace(/(ctl\d+)(\_)/g,"$1\$").replace(/(^ctl\d+\$m)(\_)/,"$1\$").replace(/\_ctl/,"\$ctl"),v,EntityEditorHandleCheckNameResult,id,EntityEditorHandleCheckNameError,true); // eslint-disable-line
                    } else { // SP2013
                      if (typeof SPClientPeoplePicker === "function") {
                        res = SPClientPeoplePicker.SPClientPeoplePickerDict[id]; // eslint-disable-line
                        if (res) {
                          // first we remove the existing values
                          tmp = document.getElementById(res.ResolvedListElementId);
                          if (tmp) {
                            tmp = tmp.querySelectorAll('span');
                            id = tmp.length;
                            while(id--) {
                              res.DeleteProcessedUser();
                            }
                          }

                          if (SPIsArray(v)) v=v.join(";")
                          res.AddUserKeys(v, false)
                        } else {
                          throw new Error("$SP().formfields().val() failed with a People Picker, because SPClientPeoplePicker.SPClientPeoplePickerDict['"+id+"'] returned an unexpected value");
                        }
                      } else {
                        throw new Error("$SP().formfields().val() failed with a People Picker, because EntityEditorCallback and SPClientPeoplePicker are not available!");
                      }
                    }

                    return this;
                  }
                }
                break;
              }
              case "SPFieldChoice":
              case "SPFieldMultiChoice": { // Choices
                obj._type = "choices";
                // if there is a TABLE then there is more (radio, fillin box, ...)
                tmp = td.querySelector('table');
                if (!tmp) obj._elements = td.querySelector('select');
                else {
                  tmp = td.querySelector('select');
                  if (tmp) { // if there is a select then it's a normal dropdown with a fillin box
                    obj._type = "choices plus";
                    obj._elements = td.querySelectorAll('input,select');
                  } else {
                    // checkbox or radio
                    tmp = td.querySelector('input[type="checkbox"]');
                    if (tmp) { // checkbox
                      obj._type = "choices checkbox";
                    } else {
                      obj._type = "choices radio";
                    }
                    tmp = td.querySelector('input[type="text"]');
                    if (tmp) { // checkbox with fillin box
                      obj._type += " plus";
                    }
                    obj._elements = td.querySelectorAll('input')
                  }
                }

                obj.val = function(v) {
                  var elems = this.elem(false), i, hasOption, len;
                  var type=this.type();
                  if (typeof v === "undefined") { // get
                    switch(type) {
                      case "choices": { // dropdown
                        return getSelectedOption(elems, "text");
                      }
                      case "choices plus": { // dropdown with fillin
                        // find if we get data from the dropdown or the fillin
                        return (elems[0].checked ? getSelectedOption(elems[1], "text") : elems[3].value);
                      }
                      case "choices radio": { // radio buttons
                        for (i=0; i < elems.length; i++) {
                          if (elems[i].checked) return getText(elems[i].nextSibling);
                        }
                        return "";
                      }
                      case "choices radio plus": { // radio buttons with fillin
                        for (i=0; i < elems.length-2; i++) {
                          if (elems[i].checked) return getText(elems[i].nextSibling)
                        }
                        if (elems[i].checked) return elems[i+1].value
                        return "";
                      }
                      case "choices checkbox":
                      case "choices checkbox plus": { // checkboxes
                        v=[], hasOption=(type==="choices checkbox plus"), len=elems.length;
                        if (hasOption) len--;
                        for (i=0; i < len; i++) {
                          if (elems[i].checked) {
                            v.push(hasOption && i+1===len ? elems[len].value : getText(elems[i].nextSibling));
                          }
                        }
                        return v;
                      }
                    }
                  } else { // set
                    switch(type) {
                      case "choices": { // dropdown
                        setSelectedOption(elems, v, "text");
                        break;
                      }
                      case "choices plus": {
                        // try to select into the dropdown
                        elems[0].checked=true;
                        setSelectedOption(elems[1], v, "text");
                        if (getSelectedOption(elems[1], "text") !== v) {
                          // if it didn't work, then set the value in the fillin box
                          elems[2].checked=true;
                          elems[3].value=v;
                        } else elems[3].value="";
                        break;
                      }
                      case "choices checkbox":
                      case "choices checkbox plus": {
                        if (!SPIsArray(v)) v=[v];
                        len = elems.length;
                        if (type === "choices checkbox plus") len -= 2;
                        for (i=0; i<len; i++) {
                          idx = SPArrayIndexOf(v, getText(elems[i].nextSibling));
                          if (idx > -1) {
                            elems[i].checked=true;
                            v.splice(idx, 1);
                          } else {
                            elems[i].checked=false
                          }
                        }
                        // find if we need to add a value into the fillin box
                        if (type === "choices checkbox plus") {
                          if (v.length > 0) {
                            elems[elems.length-2].checked=true;
                            elems[elems.length-1].value=v[0];
                          } else {
                            elems[elems.length-2].checked=false;
                            elems[elems.length-1].value="";
                          }
                        }
                        break;
                      }
                      case "choices radio":
                      case "choices radio plus": {
                        hasOption=false;
                        len=elems.length;
                        if (type === "choices radio plus") len -= 2;
                        for (i=0; i<len; i++) {
                          if (getText(elems[i].nextSibling) == v) {
                            elems[i].checked=true;
                            hasOption=true;
                            break;
                          }
                        }
                        if (type === "choices radio plus") {
                          if (!hasOption) {
                            // for fillin box when no option has been selected
                            elems[i].checked=true;
                            elems[i+1].value=v;
                          } else elems[i+1].value="";
                        }
                        break;
                      }
                    }
                  }
                  return this;
                }
                break;
              }
              case "SPFieldDateTime": { // Date
                obj._type = "date";
                tmp = td.querySelectorAll('input,select,a')
                if (tmp.length > 2) obj._type += " time";
                obj._elements = obj._elements.concat(tmp);
                obj.val = function(v) {
                  var e=this.elem();
                  if (typeof v !== "undefined") { // set
                    if (!SPIsArray(v)) v = [ v ];
                    e[0].value = v[0];
                    if (e.length === 4) {
                      if (v.length > 1) setSelectedOption(e[2], v[1]);
                      if (v.length > 2) setSelectedOption(e[3], v[2]);
                    }
                    return this
                  } else { // get
                    return (e.length === 4 ? [ e[0].value, getSelectedOption(e[2], "text"), e[3].value ] : e[0].value);
                  }
                }
                break;
              }
              case "SPFieldLookup":
              case "SPFieldLookupMulti": {
                obj._type = "lookup";
                obj._elements = td.querySelectorAll('select,input[id$="Button"],button');
                if (infoFromComments.SPType==="SPFieldLookupMulti") {
                  obj._type += " multiple";
                } else obj._elements = obj._elements[0];

                // params: {selectReturn} with "text", "value" or "both"
                obj.val = function(v) {
                  var params = "text";
                  if (typeof v === "object" && !SPIsArray(v)) {
                    params = v.selectReturn || "text";
                    v = void 0;
                  }
                  var type=this.type();

                  var e = this.elem(false), o;
                  if (typeof v !== "undefined") {
                    if (type === "lookup multiple") {
                      if (!SPIsArray(v)) v = [ v ];
                      //  we want to use the Add/Remove buttons -- the behavior changes between SP2010 and SP2013
                      var clickAdd = e[1].getAttribute("onclick");
                      var clickRemove = e[2].getAttribute("onclick");
                      var masterGroup = window[e[1].getAttribute("id").replace(/AddButton/,"MultiLookup_m")]; // SP2013

                      // reset all from the last select
                      setSelectedOption(e[3], "", "all");
                      if (clickRemove) eval("!function() {"+clickRemove+"}()");
                      else if (typeof GipRemoveSelectedItems === "function") {
                        GipRemoveSelectedItems(masterGroup) // eslint-disable-line
                      }
                      setSelectedOption(e[0], "", "none");
                      // then we want to select in the same order
                      for (o=0; o<v.length; o++) {
                        // select what we want in the first box
                        setSelectedOption(e[0], v[o], params);
                        // click the button
                        if (clickAdd) eval("!function() {"+clickAdd+"}()");
                        else if (typeof GipAddSelectedItems === "function") {
                          GipAddSelectedItems(masterGroup) // eslint-disable-line
                        }
                      }
                    } else {
                      setSelectedOption(e, v, params);
                    }
                  } else {
                    if (type === "lookup multiple") {
                      e = e[3].querySelectorAll('option');
                      v=[];
                      for (o=0; o<e.length; o++) {
                        v.push(params === "text" ? getText(e[o]) : e[o].value)
                      }
                      return (v.length === 0 ? "" : v);
                    } else return getSelectedOption(e, params)
                  }

                  return this;
                }
                break;
              }
              case "SPFieldBoolean": {
                obj._type = "boolean";
                obj._elements = td.querySelector('input');
                // val()
                obj.val = function(v) {
                  var e=this.elem(false);
                  if (typeof v !== "undefined") {
                    e.checked = (v == true);
                    return this;
                  }
                  return e.checked
                }
                break;
              }
              case "SPFieldURL": {
                obj._type = "url";
                obj._elements = td.querySelectorAll('span.ms-formdescription,input');
                // val()
                obj.val = function(v) {
                  var e = this.elem();
                  if (typeof v !== "undefined") {
                    if (!SPIsArray(v)) v = [ v, v ];
                    if (v.length < 2) v = [ v[0], v[0] ];
                    e[1].value = v[0];
                    e[3].value = v[1];
                  }
                  return [ e[1].value, e[3].value ]
                }
                break;
              }
            }
          }
        }
        aReturn.push(obj);
      }

      // cache the result
      _SP_CACHE_FORMFIELDS = aReturn.slice(0);
      settings.includeAll=false;
      return this.formfields(fields, settings)
    },
    /**
      @name $SP().formfields.each
      @function
      @description Permits to go thru the different fields
      @example
      // To print in the console the names of all the fields
      $SP().formfields().each(function() {
        console.log(this.name()); // -> return the name of the field
        console.log(this.isMandatory()); // -> returns TRUE if it's a mandatory field
      })
    */
    each:function(fct) {
      for (var i=0,len=this.data.length; i<len; i++) fct.call(this.data[i])
      return this;
    },
    /**
      @name $SP().formfields.val
      @function
      @description Set or Get the value(s) for the field(s) selected by "formfields"
      @param {String|Array} [value=empty] If "str" is specified, then it means we want to set a value, if "str" is not specified then it means we want to get the value
      @param {Object} options
        @param {Boolean} [identity=false] If set to TRUE then the return values will be a hashmap with "field name" => "field value"
        @param {Boolean} [extend=false} In the case of a PeoplePicker under SP2013 it will return the People object
      @return {String|Array|Object} Return the value of the field(s)

      @example
      $SP().formfields("Title").val(); // return "My project"
      $SP().formfields("Title").val("My other project");
      $SP().formfields("Title").val(); // return "My other project"

      // it will set "Choice 1" and "Choice 2" for the "Make your choice" field, and "2012/12/31" for the "Booking Date" field
      $SP().formfields("Make your choice,Booking Date").val([ ["Choice 1","Choice 2"], "2012/12/31" ]);

      // it will set "My Value" for all the fields
      $SP().formfields("Make your choice,Title,Other Field").val("My Value");

      // it will return an array; each item represents a field
      $SP().formfields("Make your choice,Title,Other Field").val(); // -> [ ["My Value"], "My Value", "Other Field" ]

      // for a Link field
      $SP().formfields("Link").val(["http://www.dell.com","Dell"]) // -> "Dell" is used as the description of the link, and "http://www.dell.com" as the Web address

      // it will return a hashmap
      $SP().formfields("Make your choice,Title,Other Field").val({identity:true}); // -> {"Make your choice":["My Value"], "Title":"My Value", "Other Field":"My Value"}

      // for SP2013 people picker
      $SP().formfields("Manager Name").val({extend:true}); // -> [ { Key="i:0#.w|domain\john_doe",  Description="domain\john_doe",  DisplayText="Doe, John",  ...} ]
      $SP().formfields("Manager Name").val(); // -> "Doe, John"
    */
    val:function(str) {
      var identity=false, extend=false;
      if (typeof str==="object" && !SPIsArray(str)) {
        identity = (str.identity === true ? true : false);
        extend = (str.extend === true ? true : false);
        str=void 0;
      }

      // it means we want to get the value
      if (typeof str === "undefined") {
        var aReturn = [];
        this.each(function() {
          if (identity===true) aReturn[this.name()] = this.val()
          else {
            // if extend is true, then make sure it's a people picker
            if (extend===true && this.type().slice(0,6) === "people")
              aReturn.push(this.val({extend:extend}))
            else
              aReturn.push(this.val())
          }
        })
        if (aReturn.length === 0) return "";
        return (aReturn.length===1 ? aReturn[0] : aReturn)
      } else {
        if (typeof str !== "object") { // we want to set a simple value
          this.each(function() { this.val(str) });
        } else {
          var i=0;
          if (this.length>1) {
            if (str.length !== this.length) throw new Error("$SP.formfields.val: the array passed for val() must have the same size as the number of fields in formfields()")
            this.each(function() { this.val(str[i++]) })
          } else this.each(function() { this.val(str) })
        }
      }

      return this;
    },
    /**
      @name $SP().formfields.elem
      @function
      @description Get the HTML element(s) tied with the field(s) selected by "formfields"
      @param {Boolean} [usejQuery=true] If jQuery is loaded, then by default the elements will be jQuery object; use FALSE to get the regular DOM elements
      @return {Array|HTMLElement|jQuery} Null is returned if nothing is found, or the found elements... if jQuery is defined then the HTML elements will be jQueryrize

      @example
      $SP().formfields("Title").elem(); // -> returns a HTML INPUT TEXT
      $SP().formfields("List of options").elem(); // -> returns a HTML SELECT
    */
    elem:function(usejQuery) {
      usejQuery = (usejQuery === false ? false : true);
      var aReturn = [];
      var hasJQuery=(typeof jQuery === "function" && usejQuery === true);
      this.each(function() {
        var e = this.elem(false);
        if (e instanceof NodeList) e = [].slice.call(e);
        aReturn=aReturn.concat(e)
      })

      switch(aReturn.length) {
        case 0: return hasJQuery ? jQuery() : null;
        case 1: return hasJQuery ? jQuery(aReturn[0]) : aReturn[0];
        default: return hasJQuery ? jQuery(aReturn) : aReturn;
      }
    },
    /**
      @name $SP().formfields.row
      @function
      @description Get the TR element(s) tied with the field(s) selected by "formfields"
      @return {Array|HTMLElement|jQuery} Null is returned if nothing is found, or the TR HTMLElement... or a jQuery object is returned if jQuery exists

      @example
      $SP().formfields("Title").row(); // return the TR element that is the parent (= the row)
      $SP().formfields("Title").row().hide(); // because we have jQuery we can apply the hide()
    */
    row:function() {
      var aReturn = [];
      var hasJQuery=(typeof jQuery === "function");
      this.each(function() {
        var row=this.row();
        if (row instanceof jQuery === true) row=row[0]
        aReturn.push(row)
      })

      switch(aReturn.length) {
        case 0: return (hasJQuery ? jQuery() : null);
        case 1: return (hasJQuery ? jQuery(aReturn[0]) : aReturn[0]);
        default: return (hasJQuery ? jQuery(aReturn) : aReturn);
      }
    },
    /**
      @name $SP().formfields.type
      @function
      @description Get the type of the field(s) selected by "formfields"
                   Here is the list of different types returned:
                   - "text" for the free text field;
                   - "number" for Number field;
                   - "currency" for Currency field;
                   - "text multiple" for the multiple lines of plain text;
                   - "html multiple" for the multiple lines of text in rich mode;
                   - "attachments" for the attachments field;
                   - "lookup" for a lookup field (dropdown);
                   - "lookup multiple" for a lookup field with multiple selection (two dropdowns with two buttons);
                   - "content type" for the content type field;
                   - "boolean" for the yes/no checkbox;
                   - "date" for a date only field;
                   - "date time" for a date and time field;
                   - "choices" for a dropdown selection;
                   - "choices plus" for a dropdown selection with an input field to enter our own value;
                   - "choices radio" for the radio buttons selection;
                   - "choices radio plus" for the radio buttons selection with an input field to enter our own value;
                   - "choices checkbox" for the checkboxes field for a selection;
                   - "choices checkbox plus" for the checkboxes field for a selection with an input field to enter our own value;
                   - "people" for the people picker field;
                   - "people multiple" for the people picker field with multiple selection;
                   - "url" for the link/url/picture field.

      @return {String|Array} Returns the type of the field(s)

      @example
      $SP().formfields("Title").type(); // return "text"
      $SP().formfields("List of options").type(); // return "choices"
    */
    type:function() {
      var aReturn = [];
      this.each(function() { aReturn.push(this.type()) })

      switch(aReturn.length) {
        case 0: return "";
        case 1: return aReturn[0];
        default: return aReturn;
      }
    },
    /**
      @name $SP().formfields.description
      @function
      @description Get the description of the field(s) selected by "formfields"

      @return {String|Array} Returns the description of the field(s)

      @example
      $SP().formfields("Title").description(); // return "This is the description of this field"
      $SP().formfields("List of options").description(); // return "", it means no description
    */
    description:function() {
      var aReturn = [];
      this.each(function() { aReturn.push(this.description()) })

      switch(aReturn.length) {
        case 0: return "";
        case 1: return aReturn[0];
        default: return aReturn;
      }
    },
    /**
      @name $SP().formfields.isMandatory
      @function
      @description Say if a field is mandatory

      @return {Boolean|Array} Returns the mandatory status of the field(s)

      @example
      $SP().formfields("Title").isMandatory(); // return True or False
      $SP().formfields(["Field1", "Field2"]).isMandatory(); // return [ True/False, True/False ]
    */
    isMandatory:function() {
      var aReturn = [];
      this.each(function() { aReturn.push(this.isMandatory()) })

      switch(aReturn.length) {
        case 0: return false;
        case 1: return aReturn[0];
        default: return aReturn;
      }
    },
    /**
      @name $SP().formfields.name
      @function
      @description Return the field name

      @return {String|Array} Returns the name of the field(s)

      @example
      $SP().formfields("Subject").name(); // return "Subject"
      $SP().formfields(["Field Name", "My Field"]).name(); // return [ "Field Name", "My Field" ]
    */
    name:function() {
      var aReturn = [];
      this.each(function() { aReturn.push(this.name()) })

      switch(aReturn.length) {
        case 0: return "";
        case 1: return aReturn[0];
        default: return aReturn;
      }
    },
    /**
      @name $SP().formfields.internalname
      @function
      @description Return the field internalname

      @return {String|Array} Returns the internalname of the field(s)

      @example
      $SP().formfields("Subject").internalname(); // return "Title"
      $SP().formfields(["Field Name", "My Field"]).internalname(); // return [ "Field_x0020_Name", "My_x0020_Field" ]
    */
    internalname:function() {
      var aReturn = [];
      this.each(function() { aReturn.push(this.internalname()) })

      switch(aReturn.length) {
        case 0: return "";
        case 1: return aReturn[0];
        default: return aReturn;
      }
    },
    /**
      @name $SP().notify
      @function
      @category modals
      @description Permits to notify the user using the SP.UI.Notify.addNotification system

      @param {String} message Message to show
      @param {Object} [options]
        @param {Integer}  [options.timeout=5] The number of seconds that the notification is shown
        @param {Boolean}  [options.override=false] This option to TRUE permits to remove the previous/current notification that is showing (even if the timeout is not over and even if it's a sticky) and replace it with the new one
        @param {Boolean}  [options.overrideAll=false] Same as previously except that it will remove *all* the previous notifications that are currently showing
        @param {Boolean}  [options.overrideSticky=true] When "overrideAll:true" then even the sticky notifications are removed, but you can block this behavior with "overrideSticky:false"
        @param {Boolean}  [options.sticky=false] Keep the notification on the screen until it's manually removed (or automatically removed with "overrideAll:true" and "overrideSticky:true")
        @param {String}   [options.name=random()] You can give a name to the notification (to use it with $SP().removeNotify('name'))
        @param {Function} [options.after=function(name,afterDelay){}] You can call this function when the notification is removed -- the argument "name" is the name of the notification (see previous option), the argument "afterDelay" is TRUE when the notification has been removed by the system after it's normal timeout

      @example
      $SP().notify('Processing the data...', {sticky:true}); // the notification will stay on the screen until we remove it
      $SP().notify('All done!', {overrideAll:true}); // the "Processing the data..." is removed from the screen and a 5 seconds message says "All done!"

      $SP().notify('Please wait 10 seconds...', {
        name:"My 10 seconds notification",
        timeout:10,
        after:function(name,afterDelay) {
          if (afterDelay) alert("OK, you waited during 10 seconds!")
          else alert("Something just removed this notification called '"+name+"'' before the timeout :-(")
        }
      })
    */
    notify:function(message,options) {
      var _this=this;
      if (message === undefined) throw "Error 'notify': you must provide the message to show."
      if (typeof message !== "string") throw "Error 'notify': you must provide a string for the message to show."

      options = options || {};
      options.timeout = (!isNaN(options.timeout) ? options.timeout : 5);
      options.override = (options.override === true ? true : false);
      options.overrideAll = (options.overrideAll === true ? true : false);
      options.overrideSticky = (options.overrideSticky === false ? false : true);
      options.sticky = (options.sticky === true ? true : false);
      options.name = options.name || new Date().getTime();
      options.after = options.after || function(){};

      // [internal use] "fake" is used just to treat the queue due to the notifications ready
      options.fake = (options.fake === true ? true : false);
      // [internal use] "ignoreQueue" is when we want to treat directly the message without flushing the queue
      options.ignoreQueue = (options.ignoreQueue === true ? true : false);

      if (_SP_NOTIFY_READY === false) {
        _SP_NOTIFY_QUEUE.push({message:message, options:options});
        $(document).ready(function() {
          // we need core.js and sp.js
          ExecuteOrDelayUntilScriptLoaded(function() { // eslint-disable-line
            ExecuteOrDelayUntilScriptLoaded(function() { // eslint-disable-line
              _SP_NOTIFY_READY=true;
              _this.notify("fake",{fake:true});
            }, "core.js")
          }, "sp.js")
        })
        return _this
      } else {
        // check if we don't have some notifications in queue first
        if (options.ignoreQueue!==true) {
          while (_SP_NOTIFY_QUEUE.length > 0) {
            var a = _SP_NOTIFY_QUEUE.shift();
            a.options.ignoreQueue=true;
            _this.notify(a.message, a.options);
          }
        }
        if (options.fake===true) return;

        // for the override options
        if (_SP_NOTIFY.length > 0) {
          if (options.overrideAll)
            _this.removeNotify({all:true, includeSticky:options.overrideSticky})
          else if (options.override)
            _this.removeNotify(_SP_NOTIFY[_SP_NOTIFY.length-1].name)
        }

        _SP_NOTIFY.push({name:options.name, id:SP.UI.Notify.addNotification(message, true), options:options}) // eslint-disable-line
      }

      // setup a timeout
      if (!options.sticky) {
        setTimeout(function() {
          _this.removeNotify(options.name, {timeout:true})
        }, options.timeout*1000)
      }

      return _this;
    },
    /**
      @name $SP().removeNotify
      @function
      @category modals
      @description Permits to remove a notification that is shown on the screen

      @param {String} [name] Name of the notification
      @param {Object} [options] If you pass the options, then the 'name' is ignored
        @param {Boolean} [options.all=false] To TRUE to remove ALL notifications
        @param {Boolean} [options.includeSticky=true] To FALSE if you don't want to remove the sticky notifications (only works with the "all:true" option)

      @example
      $SP().notify('Processing the data...', {sticky:true,name:"Processing data"}); // the notification will stay on the screen until we remove it
      $SP().removeNotify("Processing data"); // the notification is removed

      $SP().notify('Doing some stuff...');
      $SP().notify('Doing some other stuff...');
      $SP().removeNotify({all:true}); // all the notifications are removed

      $SP().notify('Doing some stuff...');
      $SP().notify('Doing some other stuff...');
      $SP().notify('This is a sticky message', {sticky:true});
      $SP().removeNotify({all:true, includeSticky:false}); // all the notifications are removed except the sticky one
    */
    removeNotify:function(name,options) {
      var _this=this;
      switch (arguments.length) {
        case 0: throw "Error 'removeNotify': you must provide 'name' or 'options'."
        case 2: {
          if (typeof options !== "object") throw "Error 'removeNotify': you must provide an object for 'options'."
        }
      }

      if (arguments.length === 1 && typeof name === "object") {
        options = name;
        name = undefined;
      }
      options = options || {all:false};
      // [internal use] timeout is a boolean to say if it's a timeout remove or if we forced it
      options.timeout = (options.timeout === true ? true : false);

      // make sure we are ready
      if (_SP_NOTIFY_READY === false && _SP_NOTIFY_QUEUE.length > 0) {
        setTimeout(function() { _this.removeNotify(name, options) }, 150)
        return _this;
      }

      var notif;
      // if we want to delete all the notifications
      if (options.all === true) {
        var a=[]
        while (_SP_NOTIFY.length > 0) {
          notif = _SP_NOTIFY.shift();
          if (options.includeSticky === false && notif.options.sticky === true) a.push(notif)
          else {
            SP.UI.Notify.removeNotification(notif.id); // eslint-disable-line
            setTimeout(function() { notif.options.after.call(_this, notif.name, false) }, 150)
          }
        }
        _SP_NOTIFY = a.slice(0); // if we want to keep the sticky notifs
      } else if (name !== undefined) {
        // search for the notification
        for (var i=0,len=_SP_NOTIFY.length; i<len; i++) {
          if (_SP_NOTIFY[i].name == name) {
            notif = _SP_NOTIFY.splice(i,1)[0];
            SP.UI.Notify.removeNotification(notif.id); // eslint-disable-line
            setTimeout(function() { notif.options.after.call(_this, notif.name, options.timeout) }, 150)
            return _this;
          }
        }
      }
      return _this;
    },
    /**
      @ignore
      @name $SP()._getPageSize()
      @function
      @description Get the doc and viewport size
      @source https://blog.kodono.info/wordpress/2015/03/23/get-window-viewport-document-height-and-width-javascript/
     */
    _getPageSize:function(win) {
      var vw = {width:0, height:0};
      var doc = {width:0, height:0};
      var w=win||window, d=w.document, dde=d.documentElement, db=d.getElementsByTagName('body')[0];

      // viewport size
      vw.width  = w.innerWidth||dde.clientWidth||db.clientWidth;
      vw.height = w.innerHeight||dde.clientHeight||db.clientHeight;

      // document size
      doc.width  = Math.max(db.scrollWidth, dde.scrollWidth, db.offsetWidth, dde.offsetWidth, db.clientWidth, dde.clientWidth);
      doc.height = Math.max(db.scrollHeight, dde.scrollHeight, db.offsetHeight, dde.offsetHeight, db.clientHeight, dde.clientHeight);

      // if IE8 there is a bug with 4px
      if (!!(document.all && document.querySelector && !document.addEventListener) && (vw.width+4 == doc.width) && (vw.height+4 == doc.height)) {
        vw.width=doc.width;
        vw.height=doc.height;
      }

      return {vw:vw, doc:doc};
    },
    /**
      @name $SP().showModalDialog
      @function
      @category modals
      @description Show a modal dialog (based on SP.UI.ModalDialog.showModalDialog) but provides some advanced functions and better management of the modals (for example when you launch several modals)

      @param {Object} [options] Regular options from http://msdn.microsoft.com/en-us/library/office/ff410058%28v=office.14%29.aspx with some additional ones or some changes
        @param {String} [options.html] We can directly provide the HTML code as a string
        @param {String} [options.width] If equals to "calculated", then we use the 2/3 of the viewport width; if equals to "full" then we use the full viewport width; otherwise see the original documentation (https://msdn.microsoft.com/en-us/library/office/ff410058(v=office.14).aspx)
        @param {String} [options.height] If equals to "calculated", then we use 90% of the viewport height; if equals to "full" then we use the full viewport height; otherwise see the original documentation (https://msdn.microsoft.com/en-us/library/office/ff410058(v=office.14).aspx)
        @param {Boolean} [options.closePrevious=false] It permits to close a previous modal dialog before opening this one
        @param {Boolean} [options.wait=false] If we want to show a Wait Screen (alias for $SP().waitModalDialog())
        @param {String} [options.id=random()] An unique ID to identify the modal dialog (don't use space or special characters)
        @param {Function} [options.callback] A shortcut to `dialogReturnValueCallback` with dialogResult and returnValue
        @param {Function} [options.onload] The modal might be delayed as we need to load some Sharepoint JS files; the `onload` function is called once the modal is shown
        @param {Function} [options.onurlload] When we use the "url" parameter, this is triggered when the DOMContent of the iframe is loaded (if it's the same origin)
        @param {String} [options.title] The title to give to the modal (if you use `wait:true` then it will be the main text that will appear on 2013, and the modal title for 2010)
        @param {String} [options.message] This parameter is only use if there is `wait:true` and permits to define the subtitle message for 2013, or the main message for 2010
        @param {String} [options.url] A string that contains the URL of the page that appears in the dialog. If both url and html are specified, url takes precedence. Either url or html must be specified.
        @param {Number} [options.x] An integer value that specifies the x-offset of the dialog. This value works like the CSS left value.
        @param {Number} [options.y] An integer value that specifies the y-offset of the dialog. This value works like the CSS top value.
        @param {Boolean} [options.allowMaximize] A Boolean value that specifies whether the dialog can be maximized. true if the Maximize button is shown; otherwise, false.
        @param {Boolean} [options.showMaximized] A Boolean value that specifies whether the dialog opens in a maximized state. true the dialog opens maximized. Otherwise, the dialog is opened at the requested sized if specified; otherwise, the default size, if specified; otherwise, the autosized size.
        @param {Boolean} [options.showClose=true] A Boolean value that specifies whether the Close button appears on the dialog.
        @param {Boolean} [options.autoSize] A Boolean value that specifies whether the dialog platform handles dialog sizing.

      @example
      $SP().showModalDialog({
        title:"Dialog",
        html:'&lt;h1>Hello World&lt;/h1>&lt;p>&lt;button type="button" onclick="$SP().closeModialDialog(\'here\')">Close&lt;/button>&lt;/p>',
        callback:function(dialogResult, returnValue) {
          alert("Result="+dialogResult); // -> "here"
        }
      })

      // show a waiting message
      $SP().waitModalDialog("Working...");
      // --- do some stuff ---
      // close the waiting message and open a new modal dialog
      $SP().showModalDialog({
        closePrevious:true,
        title:"Success",
        html:'&lt;h1>Done!&lt;/h1>'
      })
      // and use $SP().closeModalDialog() to close it
     */
    showModalDialog:function(options) {
      var _this=this;
      // in some weird cases the script is not loaded correctly, so we need to ensure it
      if (!_SP_MODALDIALOG_LOADED) {
        _SP_MODALDIALOG_LOADED=(typeof SP === "object" && typeof SP.UI === "object" && typeof SP.UI.ModalDialog === "function" && typeof SP.UI.ModalDialog.showModalDialog === "function"); // eslint-disable-line
        if (!_SP_MODALDIALOG_LOADED) {
          LoadSodByKey("sp.ui.dialog.js", function() { // eslint-disable-line
            _SP_MODALDIALOG_LOADED=true;
            _this.showModalDialog(options);
          });
          return _this;
        }
      }
      var size, ohtml;
      // source: http://stackoverflow.com/a/24603642/1134119
      function iFrameReady(a,b){function e(){d||(d=!0,clearTimeout(c),b.call(this))}function f(){"complete"===this.readyState&&e.call(this)}function g(a,b,c){return a.addEventListener?a.addEventListener(b,c):a.attachEvent("on"+b,function(){return c.call(a,window.event)})}function h(){var b=a.contentDocument||a.contentWindow.document;0!==b.URL.indexOf("about:")?"complete"===b.readyState?e.call(b):(g(b,"DOMContentLoaded",e),g(b,"readystatechange",f)):c=setTimeout(h,1)}var c,d=!1;g(a,"load",function(){var b=a.contentDocument;b||(b=a.contentWindow,b&&(b=b.document)),b&&e.call(b)}),h()} // eslint-disable-line

      options.id = (options.id || "").replace(/\W+/g,"");
      options.id = options.id || new Date().getTime();
      var modal_id = "sp_frame_"+options.id;
      if (options.html && typeof options.html === "string") {
        ohtml = document.createElement('div');
        ohtml.style.padding="10px";
        ohtml.style.display="inline-block";
        ohtml.className = "sp-showModalDialog";
        ohtml.id = 'content_'+modal_id;
        ohtml.innerHTML = options.html;
        options.html = ohtml;
      }
      // if width and height are set to "calculated" then we'll use the viewport size to define them
      if (options.width === "calculated" || options.height === "calculated") {
        size = _this._getPageSize();
        if (options.width === "calculated") {
          options.width = size.vw.width;
          if (options.width > 768) {
            // we want to adjust to use 2/3
            options.width = 2*options.width/3
          }
        }
        if (options.height === "calculated") {
          options.height = size.vw.height;
          if (options.height > 576) {
            // we want to adjust to use 90%
            options.height = 90*options.height/100
          }
        }
      }
      if (options.width === "full" || options.height === "full") {
        size = _this._getPageSize();
        if (options.width === "full") options.width = size.vw.width;
        if (options.height === "full") options.height = size.vw.height;
      }
      options.wait = (options.wait === true ? true : false);
      options.closePrevious = (options.closePrevious === true ? true : false);
      if (options.previousClose === true) options.closePrevious=true;
      if (options.closePrevious) _this.closeModalDialog();

      // if showClose=false and callback is used, then showClose=false and hideClose=true
      // the reason is callback won't be triggered if showclose is false
      if (options.showClose === false && (options.dialogReturnValueCallback || options.callback)) {
        options.showClose = true;
        options.hideClose = true;
      }

      // define our own callback function to properly delete the Modal when it's closed
      var callback = options.dialogReturnValueCallback || options.callback || function() {};
      options.dialogReturnValueCallback = function(dialogResult, returnValue) {
        // if we use .close() then we have only one argument
        var id, dialog;
        if (typeof dialogResult === "object" && typeof dialogResult.type !== "undefined" && dialogResult.type === "closeModalDialog") {
          var args = dialogResult;
          dialogResult = args.dialogResult;
          returnValue = args.returnValue;
          id = args.id;
        }

        // make sure we remove the correct modal, so if "id" is provided, we look for it
        if (id) {
          for (var i=0; i<window.top._SP_MODALDIALOG.length; i++) {
            if (window.top._SP_MODALDIALOG[i].id === id) {
              dialog = window.top._SP_MODALDIALOG.splice(i, 1);
              dialog = dialog[0];
              break;
            }
          }
        }
        if (!dialog) dialog = window.top._SP_MODALDIALOG.pop();

        // remove <style> for overlay
        window.top.document.body.removeChild(window.top.document.getElementById("style_"+dialog.id));
        callback.call(this, dialogResult, returnValue);
      };

      var fct = function() {
        var modal = (options.wait ? SP.UI.ModalDialog.showWaitScreenWithNoClose(options.title, options.message, options.height, options.width) : SP.UI.ModalDialog.showModalDialog(options)); // eslint-disable-line

        // search for the lastest iframe + ms-dlgContent in the top frame body
        var wt = window.top;
        var id = modal_id;
        var frames = wt.document.querySelectorAll('body > iframe');
        var frame = frames[frames.length-1];
        var biggestZ = 0;
        // we define an attribute to find them later
        frame.setAttribute("id", id);
        // record it into a special object
        if (typeof wt._SP_MODALDIALOG === "undefined") wt._SP_MODALDIALOG=[];

        wt._SP_MODALDIALOG.push({id:id, modal:modal, zIndex:frame.style.zIndex, options:options, type:"modalDialog"});
        // check the z-index for .ms-dlgOverlay
        SPArrayForEach(wt._SP_MODALDIALOG, function(val) {
          if (val.zIndex > biggestZ) biggestZ = val.zIndex;
        });
        biggestZ--;
        wt.document.body.insertAdjacentHTML('beforeend', '<style id="style_'+id+'">.ms-dlgOverlay { z-index:'+biggestZ+' !important; display:block !important }</style>');
        // if showClose=true and callback is used, then showClose=false and hideClose=true
        // the reason is callback won't be triggered if showclose is false
        if (options.hideClose === true) {
          var cross = frame.nextSibling.querySelector('.ms-dlgCloseBtn');
          cross.parentNode.removeChild(cross);
        }
        if (typeof options.onload==="function") options.onload();
        if (options.url && options.onurlload && typeof options.onurlload === "function") {
          // find the iframe
          var frameURL = wt.document.getElementById(id);
          if (frameURL) frameURL = frameURL.nextSibling;
          if (frameURL) frameURL = frameURL.querySelector('iframe');
          if (frameURL) {
            iFrameReady(frameURL, options.onurlload)
          }
        }
      };
      SP.SOD.executeOrDelayUntilScriptLoaded(fct, 'sp.ui.dialog.js'); // eslint-disable-line
    },
    /**
      @name $SP().closeModalDialog
      @function
      @category modals
      @description Close the last modal dialog

      @param {Object} [dialogResult] One of the enumeration values specifying the result of the modal dialog (SP.UI.DialogResult|), or the modal object returned by $SP().getModalDialog()
      @param {Object} [returnValue] The return value of the modal dialog

      @example
      // if the user use the cross to close the modal, then `dialogResult` equals to 0 in the callback
      // but you can trigger the close of the modal and pass anything you want
      $SP().showModalDialog({
        id:"demo",
        title:"Hello World",
        html:'&lt;p>This is an example. Click one of the buttons.&lt;/p>&lt;p class="ms-alignCenter">&lt;button onclick="$SP().closeModalDialog(\'Continue has been clicked\')">Continue&lt;/button>&lt;/p>',
        callback:function(res) {
          alert(res)
        }
      })

      // or
      var modal = $SP().getModalDialog('demo');
      if (modal) $SP().closeModalDialog(modal);
     */
    closeModalDialog:function(dialogResult, returnValue) {
      var fct = function() {
        var md;
        if (typeof dialogResult === "object" && typeof dialogResult.type !== "undefined" && dialogResult.type === "modalDialog") {
          md = {id:dialogResult.id, dialogResult:returnValue, returnValue:undefined, type:"closeModalDialog"};
          dialogResult.modal.close(md);
          // if it's a wait screen, then we need to remove the <style> using options.dialogReturnValueCallBack
          if (dialogResult.options.wait) dialogResult.options.dialogReturnValueCallback(md, returnValue);
        } else {
          if (typeof window.top._SP_MODALDIALOG !== "undefined") {
            md=window.top._SP_MODALDIALOG;
            if (md.length>0) {
              md = md[md.length-1];

              // close has only one parameter
              md.modal.close({id:md.id, dialogResult:dialogResult, returnValue:returnValue, type:"closeModalDialog"});
              // if it's a wait screen, then we need to remove the <style> using options.dialogReturnValueCallBack
              if (md.options.wait) md.options.dialogReturnValueCallback(dialogResult, returnValue);
              return false;
            }
          }
          SP.UI.ModalDialog.commonModalDialogClose(dialogResult, returnValue); // eslint-disable-line
        }
      };
      SP.SOD.executeOrDelayUntilScriptLoaded(fct, 'sp.ui.dialog.js'); // eslint-disable-line

      return false;
    },
    /**
     * @name $SP().getModalDialog
     * @function
     * @category modals
     * @description Retrieve the modal object for a special modalDialog
     *
     * @param {String} id The ID of the modal
     * @return {Object} The modal object or NULL if the modal doesnt exist
     *
     * @example
     * var modal = $SP().getModalDialog("MyModal");
     * $SP().closeModalDialog(modal);
     */
    getModalDialog:function(id) {
      if (typeof window.top._SP_MODALDIALOG !== "undefined") {
        var md=window.top._SP_MODALDIALOG;
        id = id.replace(/\W+/g,"");
        for (var i=0; i<md.length; i++) {
          if (md[i].id === "sp_frame_"+id) {
            return md[i];
          }
        }
      }
      return null;
    },
    /**
     * @name $SP().waitModalDialog
     * @function
     * @category modals
     * @description Shortcut for SP.UI.ModalDialog.showWaitScreenWithNoClose()
     *
     * @param {String} [title="Working on it..."] The main message with the loading spin for SP2013, or the modal window title for SP2010
     * @param {String} [subtitle=""] The subtitle for SP2013, or the main message with the loading spin for SP2010
     * @param {Number} [height] The modal height
     * @param {Number} [width] The modal width
     */
    waitModalDialog:function(title, subtitle, height, width) {
      return this.showModalDialog({
        wait:true,
        title:title||"Working...",
        message:subtitle,
        width:width,
        height:height
      });
    },
    /**
     * @name $SP().resizeModalDialog
     * @function
     * @category modals
     * @description Resize a ModalDialog and recenter it
     * @param  {Object} options
     *   @param {Number} width
     *   @param {Number} height
     *   @param {String} [id] The id of the modal to resize, or the last opened dialog will be used
     * @return {Boolean} FALSE if something went wrong
     *
     * @example
     * // to have a form opened faster we define a minimal width and height, and then once it's loaded we want to have the correct size
     * $SP().showModalDialog({
     *   id:"inmodal",
     *   url:url,
     *   width:200,
     *   height:100,
     *   allowMaximize:true,
     *   onurlload:function() {
     *     // resize the frame by checking the size of the loaded page
     *     var iframe=window.top.document.getElementById('sp_frame_inmodal').nextSibling.querySelector('iframe');
     *     // define the max size based on the page size
     *     var size = $SP()._getPageSize();
     *     var maxWidth = 2*size.vw.width/3; // 2/3 of the viewport width
     *     var maxHeight = 90*size.vw.height/100 // 90% of the viewport height
     *     // find the size we want based on the modal
     *     var e=$(iframe.contentDocument.getElementById('onetIDListForm')); // this element gives the size of our form from the modal
     *     var width=e.outerWidth(true)+100;
     *     var height=e.outerHeight(true)+iframe.contentDocument.getElementById('ms-designer-ribbon').offsetHeight+100;
     *     if (width>maxWidth) width=maxWidth;
     *     if (height>maxHeight) height=maxHeight;
     *     $SP().resizeModalDialog({id:"inmodal",width:width,height:height});
     *     // bind the iframe resize, to make sure an external event won't resize it to 200x100
     *     $(iframe.contentWindow).on('resize', function() {
     *       var $this=$(this);
     *       if ($this.width() === 200 && $this.height() === 100) { // if it gets the original size, then resize to the new ones
     *         $SP().resizeModalDialog({id:"inmodal",width:width,height:height});
     *       }
     *     })
     *   }
     * });
     */
    resizeModalDialog:function(options) {
      var dlg, dialogElements, deltaWidth, deltaHeight, key;
      var pxToNum=function(px) { return px.replace(/px/,"")*1 };
      var wt=window.top;
      if (!options.id) {
        if (wt._SP_MODALDIALOG.length===0) return false; // no modal
        options.id = wt._SP_MODALDIALOG[wt._SP_MODALDIALOG.length-1].id.replace(/sp_frame_/,"");
      }
      // find dialog element
      dlg = wt.document.getElementById('sp_frame_'+options.id);
      if (!dlg) return false; // cannot find the modal
      dlg = dlg.nextSibling;
      options.width = (options.width === undefined ? pxToNum(dlg.style.width) : options.width);
      options.height = (options.height === undefined ? pxToNum(dlg.style.height) : options.height);
      // inspiration: https://social.msdn.microsoft.com/Forums/office/en-US/d92508be-4b4b-4f78-86d3-5d15a510bb18/how-do-i-resize-a-dialog-box-once-its-open?forum=sharepointdevelopmentprevious
      dialogElements = {
        "Border":dlg.querySelector('.ms-dlgBorder'),
        "TitleText":dlg.querySelector('.ms-dlgTitleText'),
        "Content":dlg,
        "Frame":dlg.querySelector('.ms-dlgFrame')
      };
      // calculate width & height delta
      deltaWidth = options.width - pxToNum(dialogElements.Border.style.width);
      deltaHeight = options.height - pxToNum(dialogElements.Border.style.height);

      for (key in dialogElements) {
        if (dialogElements.hasOwnProperty(key) && dialogElements[key]) {
          dialogElements[key].style.width = (pxToNum(dialogElements[key].style.width) + deltaWidth) + "px";
          // set the height, excluding title elements
          if (key !== "TitleText") dialogElements[key].style.height = (pxToNum(dialogElements[key].style.height) + deltaHeight) + "px";
        }
      }

      // now we recenter
      var pageSize=this._getPageSize(wt);
      dlg.style.top=(pageSize.vw.height / 2 - pxToNum(dlg.style.height) / 2) + "px";
      dlg.style.left=(pageSize.vw.width / 2 - pxToNum(dlg.style.width) / 2 ) + "px";
    },
    /**
      @name $SP().registerPlugin
      @function
      @category core
      @description Permits to register a plugin

      @param {String} pluginName You have to define the plugin name
      @param {Function} pluginFct You have to define the function of the plugin with one parameter that are the options passed

      @example
      $SP().registerPlugin('test', function(options) {
        console.log(options.message);
      })
    */
    registerPlugin:function(name,fct) {
      if (typeof _SP_PLUGINS[name] !== "undefined")
        throw "Error 'registerPlugin': '"+name+"' is already registered.";
      _SP_PLUGINS[name] = fct;
      return true;
    },
    /**
      @name $SP().plugin
      @function
      @category core
      @description Permits to use a plugin

      @param {String} pluginName The plugin name to call
      @param {Object} [options] The options for the plugin

      @example
      $SP().plugin('test',{message:"This is a test !"})
    */
    plugin:function(name,options) {
      options = options || {};
      if (typeof _SP_PLUGINS[name] === "function") _SP_PLUGINS[name].call(this,options);
      else throw "Error $SP().plugin: the plugin '"+name+"' is not registered."
      return this;
    }
  };

  /**
   * @ignore
   * @description we need to extend an element for some cases with $SP().get
   **/
  var myElem = (function(){
    var myElem = function(elem) { return new MyElemConstruct(elem); },
        MyElemConstruct = function(elem) { this.mynode = elem; this.singleList=true; return this; };
    myElem.fn = MyElemConstruct.prototype = {
      getAttribute: function(id) { return this.mynode.getAttribute("ows_"+id.replace(/ /g,"")) }, /*.replace(/ /g,"")*/
      getAttributes:function() { return this.mynode.attributes }
    };
    return myElem;
  })();

  var extendMyObject=function(arr) { this.attributes=arr };
  extendMyObject.prototype.getAttribute=function(attr) { return this.attributes[attr] };
  extendMyObject.prototype.getAttributes=function() { return this.attributes };

  SharepointPlus.prototype.noConflict = function() {
    window._$SP = window._SharepointPlus = window.$SP;
  };

  // make SharepointPlus available from NodeJS
  if (!_SP_ISBROWSER && typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = SharepointPlus;
    }
    exports.SharepointPlus = SharepointPlus;
  }
  else {
    window.$SP = window.SharepointPlus = SharepointPlus;
  }

  return SharepointPlus;
})(this,(typeof document!=="undefined"?document:null));
