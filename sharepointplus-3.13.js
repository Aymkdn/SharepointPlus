/*!
 * SharepointPlus v3.13
 * Copyright 2016, Aymeric (@aymkdn)
 * Contact: http://kodono.info
 * Documentation: http://aymkdn.github.com/SharepointPlus/
 * License: GPL-3 (http://aymkdn.github.com/SharepointPlus/license.md)
 */

/**
 @ignore
 @description Return true when the arg is an array
*/
var SPIsArray = function(v) { return (Object.prototype.toString.call(v) === '[object Array]') }

/**
  @ignore
  @description Array.indexOf polyfill for IE8
*/
var SPArrayIndexOf = function(arr, searchElement) {
  "use strict";
  if (!Array.prototype.indexOf) {
    var t = Object(arr);
    var len = t.length >>> 0;
    if (len === 0) {
      return -1;
    }
    var n = 0;
    if (arguments.length > 1) {
      n = Number(arguments[1]);
      if (n != n) { // shortcut for verifying if it's NaN
        n = 0;
      } else if (n != 0 && n != Infinity && n != -Infinity) {
        n = (n > 0 || -1) * Math.floor(Math.abs(n));
      }
    }
    if (n >= len) {
      return -1;
    }
    var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);
    for (; k < len; k++) {
      if (k in t && t[k] === searchElement) {
        return k;
      }
    }
    return -1;
  } else {
    return arr.indexOf(searchElement);
  }
}
/**
 @ignore
 @description Array.forEach polyfill for IE8 (source : https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach)
*/
var SPArrayForEach = function(arr, callback, thisArg) {
  "use strict";
  if (!Array.prototype.forEach) {
    var T, k;
    if (arr == null) {
      throw new TypeError(' this is null or not defined');
    }
    var O = Object(arr);
    var len = O.length >>> 0;
    if (typeof callback !== "function") {
      throw new TypeError(callback + ' is not a function');
    }
    if (arguments.length > 1) T = thisArg;
    k = 0;
    while (k < len) {
      var kValue;
      if (k in O) {
        kValue = O[k];
        callback.call(T, kValue, k, O);
      }
      k++;
    }
  } else {
    return arr.forEach(callback, thisArg);
  }
}

if(!String.prototype.trim) {
  /**
    @ignore
    @escription The trim() feature for String is not always available for all browsers
  */
  String.prototype.trim = function () {
    return this.replace(/^\s+|\s+$/g,'');
  };
}

// Global
_SP_APPROVED=0;
_SP_REJECTED=1;
_SP_PENDING=2;
_SP_DRAFT=3;
_SP_SCHEDULED=4;
_SP_CACHE_FORMFIELDS=null;
_SP_CACHE_CONTENTTYPES=[];
_SP_CACHE_CONTENTTYPE=[];
_SP_CACHE_SAVEDVIEW=void 0;
_SP_CACHE_SAVEDVIEWS=void 0;
_SP_CACHE_SAVEDLISTS=void 0;
_SP_CACHE_USERGROUPS=[]
_SP_CACHE_GROUPMEMBERS=[];
_SP_CACHE_DISTRIBUTIONLISTS=[];
_SP_CACHE_REGIONALSETTINGS=void 0;
_SP_CACHE_DATEFORMAT=void 0;
_SP_ADD_PROGRESSVAR={};
_SP_UPDATE_PROGRESSVAR={};
_SP_MODERATE_PROGRESSVAR={};
_SP_REMOVE_PROGRESSVAR={};
_SP_BASEURL=void 0;
_SP_NOTIFY_READY=false;
_SP_NOTIFY_QUEUE=[];
_SP_NOTIFY=[];
_SP_PLUGINS={};

// for each select of lookup with more than 20 values, for IE only
// see https://bdequaasteniet.wordpress.com/2013/12/03/getting-rid-of-sharepoint-complex-dropdowns/
// Inspiration for the below code: SPServices
if (typeof jQuery === "function") {
  $('.ms-lookuptypeintextbox').each(function() {
    var $input=$(this);
    // find the default/selected ID
    var selectedID=$("#"+$input.attr("optHid")).val();
    // find the options in the "choices" property from the INPUT
    var choices = $input.attr("choices").split("|");

    // create a simple dropdown
    var htmlSelect = '<select id="' + $input.attr("id") + '_Lookup" name="'+$input.attr("name").replace(/\_/g,"$")+'" data-info="This SELECT has been created by SharepointPlus" title="' + $input.attr("title") + '">';
    for (var i = 0; i < choices.length; i += 2) {
      htmlSelect += '<option value="' + choices[i+1] + '"' + (choices[i+1] == selectedID ? ' selected="selected"' : '') + '>' + choices[i] + '</option>';
    }
    htmlSelect += "</select>";

    // add the new select and hide the other useless elements
    $input.closest("span").hide().before(htmlSelect);

    // when the select changes then we need to put the selected value...
    $("#" + $input.attr("id") + "_Lookup").on('change', function() {
        var $input = $('#'+$(this).attr("id").slice(0,-7));
        var $optHid = $("#"+$input.attr("optHid"));
        var val = $(this).val();
        // set the optHid value with the selected one
        $optHid.val(val);
        // and save the selected text to the original input (only if the value is not equal to "0" (None))
        $input.val($(this).find("option[value='" + (val !== "0" ? val : "") + "']").text());
    }).trigger("change");
  })
}

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
          case 0: dest[i]=fn(source[i]); i--;
          case 7: dest[i]=fn(source[i]); i--;
          case 6: dest[i]=fn(source[i]); i--;
          case 5: dest[i]=fn(source[i]); i--;
          case 4: dest[i]=fn(source[i]); i--;
          case 3: dest[i]=fn(source[i]); i--;
          case 2: dest[i]=fn(source[i]); i--;
          case 1: dest[i]=fn(source[i]); i--;
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
    /**
      @name $SP().getVersion
      @function
      @description Returns the SP version
      
      @return {String} The current SharepointPlus version
    */
    getVersion:function() { return "3.13" },
    /**
      @name $SP().decode_b64
      @function
      @description Permits to decode a Base 64 string
      
      @param {String} toDecode It's the Base 64 string to decode
      @return {String} The decoded string
    */
    decode_b64:function(d,b,c,u,r,q,x){b="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";for(r=q=x='';c=d.charAt(x++);~c&&(u=q%4?u*64+c:c,q++%4)?r+=String.fromCharCode(255&u>>(-2*q&6)):0)c=b.indexOf(c);return r},
    /**
      @name $SP().encode_b64
      @function
      @description Permits to encode in Base 64
    
      @param {String} toEncode It's the string to encode into Base 64
      @return {String} The encoded string
    */
    encode_b64:function(a,b,c,d,e,f){b="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";c="=";for(d=f='';e&=3,a.charAt(d++)||(b='=',e);f+=b.charAt(63&c>>++e*2))c=c<<8|a.charCodeAt(d-=!e);return f},
    /**
      @ignore
      @description Ajax system based on jQuery parameters
    */
    ajax:function(settings) {
      if (typeof jQuery !== "undefined" && jQuery.ajax) {
        fct = jQuery.ajax(settings);
      } else {
        if (typeof nanoajax !== "undefined") {
          var headers = {'Content-Type': settings.contentType || "text/xml; charset=utf-8"};
          if (typeof settings.beforeSend === "function") {
            var xhr = {setRequestHeader:function(a, b) { headers[a]=b }};
            settings.beforeSend(xhr);
          }
          nanoajax.ajax({
            url: settings.url,
            method: settings.method || "POST",
            headers: headers,
            body: settings.data
          },
          function (code, responseText, request) {
            if (code === 200 && responseText !== "Error" && responseText !== "Abort" && responseText !== "Timeout") {
              settings.success(request.responseXML || request.responseText);
            } else {
              if (typeof settings.error === "function") {
                settings.error(request, code, responseText);
              }
            }
          })
        }
        else {
          throw "[SharepointPlus] Fatal Error : No AJAX library has been found... Please use jQuery or nanoajax";
        }
      }
    },
    /**
      @name $SP().list
      @namespace
      @description Permits to define the list ID
      
      @param {String} listID Ths list ID or the list name
      @param {String} [url] If the list name is provided, then you need to make sure URL is provided too (then no need to define the URL again for the chained functions like 'get' or 'update')
      @example
      $SP().list("My List");
      $SP().list("My List","http://my.sharpoi.nt/other.directory/");
    */
    list:function(list,url) {
      this.reset();
      if (url) {
        // make sure we don't have a '/' at the end
        if (url.substring(url.length-1,url.length)==='/') url=url.substring(0,url.length-1)
        this.url=url;
      }
      else this._getURL();
      this.listID = list.replace(/&/g,"&amp;");
      return this;
    },
    /**
      @ignore
      @name $SP()._getURL
      @function

      @param {Boolean} [async=true] When calling $SP().getURL() will don't want an async request
      @description (internal use only) Store the current URL website into this.url
     */
    _getURL:function(async) {
      async = (async === false ? false : true);
      if (typeof this.url === "undefined") {
        // search for the local base URL
        if (typeof _SP_BASEURL !== "undefined") this.url=_SP_BASEURL;
        else {
          // try to build it
          if (typeof L_Menu_BaseUrl!=="undefined") this.url=_SP_BASEURL=L_Menu_BaseUrl;
          else {
            if (typeof _spPageContextInfo !== "undefined" && typeof _spPageContextInfo.webServerRelativeUrl !== "undefined") this.url=_SP_BASEURL=_spPageContextInfo.webServerRelativeUrl;
            else {
              // we'll use the Webs.asmx service to find the base URL
              this.needQueue=true;
              var _this=this;
              var body=_this._buildBodyForSOAP("WebUrlFromPageUrl", "<pageUrl>"+window.location.href.replace(/&/g,"&amp;")+"</pageUrl>");
              var url = "/_vti_bin/Webs.asmx";
              _this.ajax({
                type: "POST",
                cache: false,
                async: async,
                url: url,
                data: body,
                contentType: "text/xml; charset=utf-8",
                dataType: "xml",
                success:function(data) {
                  // we want to use myElem to change the getAttribute function
                  var result=data.getElementsByTagName('WebUrlFromPageUrlResult');
                  if (result.length) {
                    _this.url = _SP_BASEURL = result[0].firstChild.nodeValue.toLowerCase();
                  }
                  _this.needQueue=false;
                }
              });
            }
          }
        }
      }
      return this;
    },
    /**
      @name $SP().getURL
      @function
      @description Return the current base URL website

      @return {String} The current base URL website
     */
    getURL:function() {
      if (typeof _SP_BASEURL !== "undefined") return _SP_BASEURL;
      this._getURL(false);
      return this.url;
    },
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
      @ignore
      @name $SP()._addInQueue
      @function
      @description (internal use only) Add a function in the queue
    */
    _addInQueue:function(args) {
      this.listQueue.push(args);
      if (this.listQueue.length===1) this._testQueue();
      return this
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
      // " IN " : for example 'Location IN ["Los Angeles","San Francisco","New York"]', equivalent to 'Location = "Los Angeles" OR Location = "San Francisco" OR Location = "New York"'

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
                    var start = i;
                    var openedApos=false;
                    // find the corresponding ]
                    while (i < limitMax) {
                      i++;
                      // if there is a ' opened then ignore the ) until the next '
                      var charAtI = queryString.charAt(i);
                      if (charAtI=="\\") ignoreNextChar=true; // when we have a backslash \then ignore the next char
                      else if (!ignoreNextChar && (charAtI=="'" || charAtI=='"')) openedApos=!openedApos;
                      else if (!ignoreNextChar && !openedApos && charAtI=="]") break;
                      else ignoreNextChar=false;
                    }
                    
                    var lastIndex = factory.length-1;
                    factory[lastIndex] += '<FieldRef Name="'+lastField+'" /><Values><Value Type="Text">' + JSON.parse('[' + queryString.substring(start+1, i) + ']').join('</Value><Value Type="Text">') + '</Value></Values>' + closeTag;
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
          case "<": i++;
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
          case "=": factory.push("<Eq>");
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
          case "'": var apos = letter;
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
          default:  if (closeTag == "") lastField += letter;
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
      @return {Array}array of clauses
      @example
      $SP()._parseOn("'List1'.field1 = 'List2'.field2 AND 'List1'.Other_x0020_Field = 'List2'.Some_x0020_Field")
    */
    _parseOn:function(q) {
      var factory = [];
      var queryString = q.replace(/(\s+)?(=)(\s+)?/g,"$2").replace(/==/g,"=").split(" AND ");
      for (var i=0; i<queryString.length; i++) {
        var mtch = queryString[i].match(/'([^']+)'\.([a-zA-Z0-9_]+)='([^']+)'\.([a-zA-Z0-9_]+)/);
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
      @name $SP()._cleanString
      @function
      @description clean a string to remove the bad characters when using AJAX over Sharepoint web services (like <, > and &)
      
      @param {String} string The string to clean
      @note That should be used as an internal function
    */
    _cleanString:function(str) {
      return str.replace(/&(?!amp;|lt;|gt;)/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    },
    /**
      @name $SP().cleanResult
      @function
      @description clean a string returned by a GET (remove ";#" and "string;#" and null becomes "")
      
      @param {String} str The string to clean
      @param {String} [separator=";"] When it's a list we may want to have a different output (see examples)
      @return {String} the cleaned string

      @example
      $SP().cleanResult("15;#Paul"); // -> "Paul"
      $SP().cleanResult("string;#Paul"); // -> "Paul"
      $SP().cleanResult(";#Paul;#Jacques;#Aymeric;#"); // -> "Paul;Jacques;Aymeric"
      $SP().cleanResult(";#Paul;#Jacques;#Aymeric;#", ", "); // -> "Paul, Jacques, Aymeric"
    */
    cleanResult:function(str,separator) {
      if (str===null || typeof str==="undefined") return "";
      separator = separator || ";";
      return (typeof str==="string"?str.replace(/;#[0-9]+;#/g,separator).replace(/^[0-9]+;#/,"").replace(/^;#|;#$/g,"").replace(/;#/g,separator).replace(/^(string;|float;)#?/,""):str);
    },
    /**
      @name $SP().list.get
      @function
      @description Get the content of the list based on different criteria (by default the default view is used)
      
      @param {Object} [setup] Options (see below)
        @param {String}  [setup.fields=""] The fields you want to grab (be sure to add "Attachments" as a field if you want to know the direct link to an attachment)
        @param {String|Array}  [setup.where=""] The query string (like SQL syntax) (you'll need to use double \\ before the inside ' -- see example below); you can use an array that will make the sequential requests but it will return all the data into one array (useful for the Sharepoint 2010 throttling limit)
        @param {Function} [setup.progress] When using an array for the WHERE or the PAGING option then you can call the progress function (see the example)
        @param {Boolean} [setup.whereCAML=false] If you want to pass a WHERE clause that is with CAML Syntax only instead of SQL-like syntax -- see $SP().parse() for more info
        @param {Boolean} [setup.whereEscapeChar=true] Determines if we want to escape the special chars that will cause an error (for example '&' will be automatically converted to '&amp;') -- this is applied to the WHERE clause only
        @param {Function} [setup.whereFct=function(w){return w}] Permits to apply your own function on the WHERE clause after conversion to CAML (can be useful also when you use the "view" parameter)
        @param {String}  [setup.orderby=""] The field used to sort the list result (you can also add "ASC" -default- or "DESC")
        @param {Boolean} [setup.useIndexForOrderBy=false] Based on https://spservices.codeplex.com/discussions/280642#post1323410 it permits to override the 5,000 items  limit in an unique call -- see the example below to know how to use it
        @param {String}  [setup.groupby=""] The field used to group by the list result
        @param {String}  [setup.view=""] If you specify a viewID or a viewName that exists for that list, then the fields/where/order settings for this view will be used in addition to the FIELDS/WHERE/ORDERBY you have defined (the user settings will be used first)
        @param {Integer} [setup.rowlimit=0] You can define the number of rows you want to receive back (0 is infinite)
        @param {Boolean} [setup.paging=false] If you have defined the 'rowlimit' then you can use 'paging' to cut by packets your full request -- this is useful when there is a list view threshold (attention: we cannot use "WHERE" or "ORDERBY" with this option)
        @param {Integer} [setup.page=infinite] When you use the `paging` option, several requests will be done until we get all the data, but using the `page` option you can define the number of requests/pages you want to get
        @param {String}  [setup.listItemCollectionPositionNext=""] When doing paging, this is the index used by Sharepoint to get the next page
        @param {Boolean} [setup.expandUserField=false] When you get a user field, you can have more information (like name,email,sip,...) by switching this to TRUE
        @param {Boolean} [setup.dateInUTC=false] TRUE to return dates in Coordinated Universal Time (UTC) format. FALSE to return dates in ISO format.
        @param {Object} [setup.folderOptions] Permits to read the content of a Document Library (see below)
          @param {String} [setup.folderOptions.path=""] Relative path of the folders we want to explore (by default it's the root of the document library)
          @param {String} [setup.folderOptions.show="FilesAndFolders_InFolder"] Four values: "FilesOnly_Recursive" that lists all the files recursively from the provided path (and its children); "FilesAndFolders_Recursive" that lists all the files and folders recursively from the provided path (and its children); "FilesOnly_InFolder" that lists all the files from the provided path; "FilesAndFolders_InFolder" that lists all the files and folders from the provided path
        @param {Boolean} [setup.queryOptions=undefined] If you want to provide your own QueryOptions and overwrite the ones built for you -- it should be some XML code (see http://msdn.microsoft.com/en-us/library/lists.lists.getlistitems.aspx)
        @param {Object} [setup.join] Permits to create a JOIN closure between the current list and another one: it will be the same syntax than a regular GET (see the example below) (it doesn't use yet the JOIN options provided with Sharepoint 2010)
          @param {String} [setup.join.list] Permits to establish the link between two lists (see the example below)
          @param {String} [setup.join.url='current website'] The website url (if different than the current website)
          @param {String} [setup.join.on] Permits to establish the link between two lists (only between the direct parent list and its child, not with the grand parent) (see the example below)
          @param {Boolean} [setup.join.outer=false] If you want to do an outer join (you can also directly use "outerjoin" instead of "join")
        @param {Boolean} [setup.calendar=false] If you want to get the events from a Calendar List
        @param {Object} [setup.calendarOptions] Options that will be used when "calendar:true" (see the example to know how to use it)
          @param {Boolean} [setup.calendarOptions.splitRecurrence=true] By default we split the events with a recurrence (so 1 item = 1 day of the recurrence)
          @param {String|Date} [setup.calendarOptions.referenceDate=today] This is the date used to retrieve the events -- that can be a JS Date object or a SP Date (String)
          @param {String} [setup.calendarOptions.range="Month"] By default we have all the events in the reference month (based on the referenceDate), but we can restrict it to a week with "Week" (from Monday to Sunday) (see https://www.nothingbutsharepoint.com/sites/eusp/Pages/Use-SPServices-to-Get-Recurring-Events-as-Distinct-Items.aspx)
      @param {Function} [result=function(data,error)] A function with the data from the request as first argument, and the second argument is the error message in case something went wrong
      
      @example
      $SP().list("List Name").get(function(data) {
        for (var i=0; i&lt;data.length; i++) console.log(data[i].getAttribute("Title"));
      });
      
      // with some fields and an orderby command
      $SP().list("ListName","http://www.mysharepoint.com/mydir/").get({
        fields:"Title,Organization",
        orderby:"Title DESC,Test_x0020_Date ASC"
      }, function getData(data) {
        for (var i=0; i&lt;data.length; i++) console.log(data[i].getAttribute("Title"));
      });

      // handle the errors
      $SP().list("List Name").get(function(data,error) {
        if (error) { alert(error) }
        for (var i=0; i&lt;data.length; i++) console.log(data[i].getAttribute("Title"));
      });
      
      // the WHERE clause must be SQL-like
      // the field names must be the internal names used by Sharepoint
      // ATTENTION - note that here we open the WHERE string with simple quotes (') and that should be your default behavior each time you use WHERE
      var name = "O'Sullivan, James";
      $SP().list("My List").get({
        fields:"Title",
        where:'Fiscal_x0020_Week > 30 AND Fiscal_x0020_Week &lt; 50 AND Name = "'+name+'"'
      }),function getData(row) {
        for (var i=row.length;i--;) console.log(row[i].getAttribute("Title"));
      });

      // Same example but this time we write the name directly inside the query...
      // So make sure to use a single backslash (\) if you have a simple quote ' inside your WHERE with a double quotes (") to open/close the string
      $SP().list("My List").get({
        fields:"Title",
        where:'Fiscal_x0020_Week > 30 AND Fiscal_x0020_Week &lt; 50 AND Name = "O\'Sullivan, James"'
      }),function getData(row) {
        for (var i=row.length;i--;) console.log(row[i].getAttribute("Title"));
      });
      // Or to use a double backslash (\\) if you have a simple quote ' inside your WHERE with a simple quote (') to open/close the string
      $SP().list("My List").get({
        fields:"Title",
        where:"Fiscal_x0020_Week > 30 AND Fiscal_x0020_Week &lt; 50 AND Name = 'O\\'Sullivan, James'"
      }),function getData(row) {
        for (var i=row.length;i--;) console.log(row[i].getAttribute("Title"));
      });

      // also in the WHERE clause you can use '[Me]' to filter by the current user,
      $SP().list("My List").get({
        fields:"Title",
        where:"Author = '[Me]'"
      },function getData(row) {
        console.log(row[0].getAttribute("Title"));
      });

      // also in the WHERE clause you can use '[Today]' or '[Today-X]' with 'X' a number,
      // Here it will return the records done yesterday
      $SP().list("My List").get({
        fields:"Title",
        where:"Created = '[Today-1]'"
      },function getData(row) {
        console.log(row[0].getAttribute("Title"));
      });
      
      // Since 3.0.8, if you do a WHERE on a Date with the Time included, then it will compare with the tim
      // see http://blogs.syrinx.com/blogs/sharepoint/archive/2008/08/05/caml-queries-with-dates.aspx
      // here it will only show the items created at 2PM exactly -- if you want to check only the today, then use "Created = '2014-03-12'"
      $SP().list("My List").get({
        fields:"Title",
        where:"Created = '2014-03-12 14:00:00'"
      },function getData(row) {
        console.log(row[0].getAttribute("Title"));
      });

      // We have a list called "My List" with a view already set that is called "Marketing View" with some FIELDS and a WHERE clause
      // so the function will grab the view information and will get the data from the list with "Author = '[Me]'" and adding the view's WHERE clause too
      $SP().list("My List","http://my.sharepoint.com/my/site/").get({
        view:"Marketing View",
        where:"Author = '[Me]'"
      }, function(data) {
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
      }, function(data) {
        console.log(data.length); // -> 23587
      })
      // add the `page` option to stop after a number of requests/pages
      // for example you only want the last record from a list that has more than 5,000 items
      $SP().list("My List").get({fields:"ID",orderby:"ID DESC",rowlimit:1,paging:true,page:1}, function(data) {
        console.log("last ID : "+data[0].getAttribute("ID"));
      })
      // use `listItemCollectionPositionNext` to start from this index
      $SP().list("My List").get({fields:"ID",orderby:"ID DESC",rowlimit:10,paging:true,page:1}, function(data, nextPageIndex) {
        // get the next block
        this.get{fields:"ID",orderby:"ID DESC",rowlimit:10,paging:true,page:1,listItemCollectionPositionNext:nextPageIndex}, function(data, nextPageIndex) {
          // here we have the 2nd block of data into `data`
        })
      })
      
      // We can also find the files from a Document Shared Library
      $SP().list("Shared Documents","http://my.share.point.com/my_site/").get({
        fields:"FileLeafRef,File_x0020_Size",
      }, function getData(data) {
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
      },function getData(data) {
        for (var i=0; i&lt;data.length; i++)
          console.log(data[i].getAttribute("Purchasing List.Region")+" | "+data[i].getAttribute("Purchasing List.Year")+" | "+data[i].getAttribute("Purchasing List.Expense_x0020_Type")+" | "+data[i].getAttribute("Purchasing List.Cost"));
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
      },function getData(data) {
        for (var i=0; i&lt;data.length; i++)
          console.log(data[i].getAttribute("Purchasing List.Region")+" | "+data[i].getAttribute("Purchasing List.Year")+" | "+data[i].getAttribute("Purchasing List.Expense_x0020_Type")+" | "+data[i].getAttribute("Purchasing List.Cost"));
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
      },function getData(data) {
        console.log(data.length); // -> 6,523
      });
      // also regarding the throttling limit, you can query a list on a user column in using the User ID
      // For example if John Doe is recorded as "328;#Doe, John" then you'll have to use the special operator "~="
      $SP().list("Sessions").get({
        fields:"Title",
        where:'User ~= 328"
      },function getData(data) {
        console.log(data.length);
      });

      // if you want to list only the files visible into a folder for a Document Library
      $SP().list("My Shared Documents").get({
        fields:"BaseName,FileRef,FSObjType", // "BaseName" is the name of the file/folder; "FileRef" is the full path of the file/folder; "FSObjType" is 0 for a file and 1 for a folder (you need to apply $SP().cleanResult())
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
      }, function(data) {
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
      }, function(d) {
        console.log(d.length)
      })
    */
    get:function(setup, fct) {
      // check if we need to queue it
      if (this.needQueue) { return this._addInQueue(arguments) }
      if (this.listID == undefined) throw "Error 'get': you have to define the list ID/Name";
      if (arguments.length === 1 && typeof setup === "function") return this.get({}, setup);
  
      // default values
      setup           = setup || {};
      if (this.url == undefined) throw "Error 'get': not able to find the URL!"; // we cannot determine the url
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
        if (typeof setup.calendarOptions.referenceDate !== "string") setup.calendarOptions.referenceDate=this.toSPDate(setup.calendarOptions.referenceDate)
        setup.calendarOptions.splitRecurrence = (setup.calendarOptions.splitRecurrence===false ? "FALSE" : "TRUE");
        setup.calendarOptions.range = setup.calendarOptions.range || "Month";
      }
      // if (setup.whereCAML!==true) setup.whereCAML = (setup.view!="");
      setup.results = setup.results || []; // internal use when there is a paging
      setup.listItemCollectionPositionNext = setup.listItemCollectionPositionNext || ""; // for paging
      
      // if setup.where is an array, then it means we want to do several requests
      // so we keep the first WHERE
      if (typeof setup.where === "object") {
        setup.where = setup.where.slice(0); // clone the original array
        if (setup.originalWhere==undefined) setup.originalWhere = setup.where.slice(0);
        setup.nextWhere = setup.where.slice(1);
        setup.where = setup.where.shift();
      } else {
        setup.originalWhere = setup.where;
        setup.nextWhere = [];
      }
      // we use the progress only when WHERE is an array
      setup.progress = setup.progress || (function() {});

      // if view is defined and is not a GUID, then we need to find the view ID
      if (setup.view !== "") {
        var _this=this;
        // retrieve the View ID based on its name
        // and find the view details
        _this.view(setup.view,function(data,viewID) {
          setup.view=viewID;
          setup.fields 
          var where = (setup.whereCAML ? setup.where : _this.parse(setup.where));
          // if we have a 'DateRangesOverlap' then we want to move this part at the end -- since v3.0.9
          var mtchDateRanges = data.whereCAML.match(/^<And>(<DateRangesOverlap>.*<\/DateRangesOverlap>)(.*)<\/And>$/);
          if (mtchDateRanges && mtchDateRanges.length === 3) data.whereCAML = '<And>'+mtchDateRanges[2]+mtchDateRanges[1]+'</And>'
          where += data.whereCAML;
          if (setup.where !== "" && data.whereCAML !== "") where = "<And>" + where + "</And>";
          setup.where=where;
          setup.fields += (setup.fields===""?"":",") + data.fields.join(",");
          setup.orderby += (setup.orderby===""?"":",") + data.orderby;
          setup.whereCAML=true;
          setup.useOWS=true;
          // disable the calendar option
          setup.calendarViaView=setup.calendar;
          setup.calendar=false;
          delete setup.view;
          return _this.get.call(_this,setup,fct);
        });
        return this;
      }
      
      // if we have [Me]/[Today] in the WHERE, or we want to use the GROUPBY,
      // then we want to use the Lists.asmx service
      // also for Sharepoint 2010
      // depreciate since v3.0
      var useOWS = true;//( setup.groupby!="" || /\[Me\]|\[Today\]/.test(setup.where) || setup.forceOWS===true || typeof SP=="object");
      
      // what about the fields ?
      var fields="";
      if (setup.fields == "" || setup.fields == [])
        fields = "";
      else {
        if (typeof setup.fields == "string") setup.fields = setup.fields.replace(/^\s+/,"").replace(/\s+$/,"").replace(/( )?,( )?/g,",").split(",");
        // depreciate since v3.0 // if (setup.fields.indexOf("Attachments") != -1) useOWS=true;
        for (var i=0; i<setup.fields.length; i++) fields += '<FieldRef Name="'+setup.fields[i]+'" />';
          // depreciate since v3.0 fields += '<Field'+(useOWS?'Ref':'')+' Name="'+setup.fields[i]+'" />';
      }
            
      // what about sorting ?
      var orderby="";
      if (setup.orderby != "") {
        var fieldsDir = setup.orderby.split(",");
        for (i=0; i<fieldsDir.length; i++) {
          var direction = "ASC";
          var splt      = fieldsDir[i].trim().split(" ");
          if (splt.length > 0) {
            if (splt.length==2) direction = splt[1].toUpperCase();
            orderby += ( useOWS ? '<FieldRef Name="'+splt[0]+'" Ascending="'+(direction=="ASC")+'" />' : '<OrderField Name="'+splt[0]+'" Direction="'+direction+'" />' );
          }
        }
      }
      // if calendar:true and no orderby, then we order by the EventDate
      if ((setup.calendar===true||setup.calendarViaView===true) && orderby==="") orderby = '<FieldRef Name="EventDate" Ascending="ASC" />'
      
      // what about groupby ?
      var groupby="";
      if (setup.groupby != "") {
        var gFields = setup.groupby.split(",");
        for (i=0; i<gFields.length; i++)
          groupby += '<FieldRef Name="'+gFields[i]+'" />';
      }

      // when it's a calendar we want to retrieve some fields by default
      if (setup.calendar===true || setup.calendarViaView===true) {
        var tmpFields = ["Title", "EventDate", "EndDate", "Duration", "fAllDayEvent", "fRecurrence", "RecurrenceData", "ID"];
        for (i=0; i<tmpFields.length; i++) fields += '<FieldRef Name="'+tmpFields[i]+'" />';
      }
      
      // forge the parameters
      var body = "";
      var aReturn = [];

      // if no queryOptions provided then we set the default ones
      if (setup.queryOptions === undefined) {
        setup._queryOptions = "<DateInUtc>"+setup.dateInUTC+"</DateInUtc>"
                           + "<Paging ListItemCollectionPositionNext=\""+setup.listItemCollectionPositionNext.replace(/&/g,"&amp;")+"\"></Paging>"
                           + "<IncludeAttachmentUrls>True</IncludeAttachmentUrls>"
                           + (fields==="" ? "" : "<IncludeMandatoryColumns>False</IncludeMandatoryColumns>")
                           + "<ExpandUserField>"+setup.expandUserField+"</ExpandUserField>";
        // check if we want something related to the folders
        if (setup.folderOptions) {
          var viewAttr;
          switch (setup.folderOptions.show) {
            case "FilesAndFolders_Recursive": viewAttr="RecursiveAll"; break
            case "FilesOnly_InFolder": viewAttr="FilesOnly"; break
            case "FilesAndFolders_InFolder": viewAttr=""; break
            case "FilesOnly_Recursive":
            default: viewAttr="Recursive"
          }
          setup._queryOptions += "<ViewAttributes Scope=\""+viewAttr+"\"></ViewAttributes>"
          if (setup.folderOptions.path) setup._queryOptions += "<Folder>"+this.url + '/' + this.listID + '/' + setup.folderOptions.path+"</Folder>"
        } else
          setup._queryOptions += "<ViewAttributes Scope=\"Recursive\"></ViewAttributes>"
      } else setup._queryOptions = setup.queryOptions
      if (setup.calendarOptions) {
        setup._queryOptions += "<CalendarDate>" + setup.calendarOptions.referenceDate + "</CalendarDate>"
                            +  "<RecurrencePatternXMLVersion>v3</RecurrencePatternXMLVersion>"
                            +  "<ExpandRecurrence>"+setup.calendarOptions.splitRecurrence+"</ExpandRecurrence>";
      }

      // what about the Where ?
      var where="";
      if (setup.where !== "") {
        if (setup.whereCAML) where=setup.where;
        else where=this.parse(setup.where);
      }
      if (setup.calendar===true) {
        var whereDateRanges = "<DateRangesOverlap>"
                            + "<FieldRef Name='EventDate' />"
                            + "<FieldRef Name='EndDate' />"
                            + "<FieldRef Name='RecurrenceID' />"
                            + "<Value Type='DateTime'><" + setup.calendarOptions.range + " /></Value>" /* there is a property called IncludeTimeValue="TRUE" */
                            + "</DateRangesOverlap>"
        if (where !== "") where = "<And>" + where + whereDateRanges + "</And>";
        else where = whereDateRanges;
      }
      where = setup.whereFct(where);
      var _this=this;
      if (useOWS) {
        body = "<listName>"+_this.listID+"</listName>"
              + "<viewName>"+setup.view+"</viewName>"
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
        var url = _this.url + "/_vti_bin/Lists.asmx";
        _this.ajax({type: "POST",
                     cache: false,
                     async: true,
                     url: url,
                     data: body,
                     contentType: "text/xml; charset=utf-8",
                     dataType: "xml",
                     success:function(data) {
                            // we want to use myElem to change the getAttribute function
                            var rows=data.getElementsByTagName('z:row');
                            if (rows.length==0) rows=data.getElementsByTagName('row'); // for Chrome 'bug'
                            aReturn = fastMap(rows, function(row) { return myElem(row); });
                            // we have data from a previous list, so let's merge all together the both of them
                            if (setup.joinData) {
                              var on = setup.joinData["noindex"];
                              var aResult = [];
                              var prevIndex="";
                              var listIndexFound={length:0};
                              if (!on.length) alert("$SP.get() -- Error 'get': you must define the ON clause with JOIN is used.");
                              // we have a linked list so do some stuff here to tie the two lists together
                              for (var i=0,stop=aReturn.length; i<stop; i++) {
                                var index="";
                                for (var j=0; j<on.length; j++) index += aReturn[i].getAttribute(on[j][_this.listID]);
                                // check if the index exists in the previous set of data
                                if (setup.joinData[index]) {
                                  if (prevIndex!==index) {
                                    listIndexFound[setup.joinIndex[index]]=true;
                                    listIndexFound.length++;
                                    prevIndex=index;
                                  }
                                  // we merge the joinData and the aReturn
                                  for (var j=0,joinDataLen=setup.joinData[index].length; j<joinDataLen; j++) {
                                    var tmp=[];
                                    // find the attributes for the current list
                                    var attributesReturn=aReturn[i].getAttributes();
                                    for (var attr=attributesReturn.length; attr--;) {
                                      tmp[_this.listID+"."+attributesReturn[attr].nodeName.slice(4)] = attributesReturn[attr].nodeValue;
                                    }
                                    // now find the attributes for the joinData
                                    var attributesJoinData=setup.joinData[index][j].getAttributes();
                                    for (var attr in attributesJoinData) {
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
                              
                              // if we want to do an outerjoin we link the missing data
                              if (setup.outer) {
                                var joinIndexLen=setup.joinIndex.length;
                                if (listIndexFound.length < joinIndexLen) {
                                  for (i=0; i<joinIndexLen; i++) {
                                    if (listIndexFound[i] !== true) {
                                      var idx = setup.joinIndex[i];
                                      if (idx===undefined || setup.joinData[idx]===undefined) continue
                                      for (var j=0,joinDataLen=setup.joinData[idx].length; j<joinDataLen; j++) {
                                        var tmp=[];
                                        var attributesJoinData=setup.joinData[idx][j].getAttributes();
                                        for (var attr in attributesJoinData) {
                                          tmp[attr] = setup.joinData[idx][j].getAttribute(attr);
                                        }
                                        aResult.push(new extendMyObject(tmp));
                                      }
                                    }
                                  }
                                }
                              }
                            }
                            
                            if (setup.outerjoin) { setup.join=setup.outerjoin; setup.join.outer=true }
                            else if (setup.innerjoin) setup.join=setup.innerjoin;
                            // if we join it with another list
                            if (setup.join) {
                             var joinData=[],joinIndex=[];
                             // retrieve the ON clauses
                             var on=_this._parseOn(setup.join.on);
                             joinData["noindex"]=on; // keep a copy of it for the next treatment in the tied list
                             for (var i=0,stop=aReturn.length; i<stop; i++) {
                               // create an index that will be used in the next list to filter it
                               var index="",tmp=[];
                               for (var j=0; j<on.length; j++) index += aReturn[i].getAttribute(on[j][_this.listID]) || aReturn[i].getAttribute(_this.listID+"."+on[j][_this.listID]);
                               if (!joinData[index]) {
                                 joinIndex[index]=joinIndex.length;
                                 joinIndex.push(index);
                                 joinData[index] = [];
                               }
                               // if we are coming from some other join
                               if (setup.joinData) {
                                 joinData[index].push(aReturn[i]);
                               } else {
                                 var attributes=aReturn[i].getAttributes();
                                 for (var j=attributes.length; j--;) {
                                   tmp[_this.listID+"."+attributes[j].nodeName.slice(4)] = attributes[j].nodeValue;
                                 }
                                 joinData[index].push(new extendMyObject(tmp));
                               }
                             }
                             delete setup.joinData;
                             //call the joined list to grab data and process them
                             var sp=$SP().list(setup.join.list,setup.join.url||_this.url), nextPage;
                             setup.join.joinData=joinData;
                             setup.join.joinIndex=joinIndex;
                             sp.get(setup.join,fct);
                            } else {
                              // if setup.results length is bigger than 0 then it means we need to add the current data
                              if (setup.results.length>0)
                                for (var i=0,stop=aReturn.length; i<stop; i++) setup.results.push(aReturn[i])
                                
                              // depending of the setup.nextWhere length we update the progress
                              if (typeof setup.originalWhere !== "string")
                                setup.progress(setup.originalWhere.length-setup.nextWhere.length,setup.originalWhere.length);
                              
                              // if paging we want to return ListItemCollectionPositionNext
                              if (setup.paging) {
                                var collection = data.getElementsByTagName("rs:data")[0];
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
                                  _this.get(setup,fct)
                                } else {
                                  // it means we're done, no more call
                                  if (typeof fct == "function") fct.call(_this,setup.results, nextPage)
                                }
                              } else if (setup.nextWhere.length>0) { // if we need to so some more request
                                if (setup.results.length===0) setup.results=aReturn
                                setup.where = setup.nextWhere.slice(0);
                                _this.get(setup,fct)
                              } else if (typeof fct == "function") {
                                // rechange setup.where with the original one just in case it was an array to make sure we didn't override the original array
                                setup.where = setup.originalWhere;
                                fct.call(_this,(setup.results.length>0?setup.results:aReturn), nextPage);
                              }
                            }
                      },
                      error:function(jqXHR, textStatus, errorThrown) {
                        var res = jqXHR.responseXML;
                        var err = res.getElementsByTagName("errorstring");
                        if (err && err[0]) fct.call(_this,[],"Error: "+err[0].firstChild.nodeValue)
                        else fct.call(_this,[],textStatus+": "+errorThrown);
                      }
                   });
      } /*else {
        body = "<?xml version=\"1.0\" encoding=\"utf-8\"?>"
                + "<soap:Envelope xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" "
                + "xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\" "
                + "xmlns:soap=\"http://schemas.xmlsoap.org/soap/envelope\/\">"
                +" <soap:Header xmlns:soap=\"http://schemas.xmlsoap.org/soap/envelope\/\">"
                +" <dsp:versions xmlns:dsp=\"http://schemas.microsoft.com/sharepoint/dsp\">"
                +" <dsp:version>1.0</dsp:version>"
                +" </dsp:versions>"
                +" <dsp:request xmlns:dsp=\"http://schemas.microsoft.com/sharepoint/dsp\" service=\"DspSts\" document=\"content\" method=\"query\">"
                +" </dsp:request>"
                +" </soap:Header>"
                + "<soap:Body>" 
                + "<queryRequest "
                +" xmlns=\"http://schemas.microsoft.com/sharepoint/dsp\">"
                +" <dsQuery select=\"/list[@id='"+this.listID+"']\""
                +" resultContent=\"dataOnly\""
                +" columnMapping=\"attribute\" resultRoot=\"Rows\" resultRow=\"Row\">"
                +" <Query RowLimit=\""+(setup.rowlimit>0?setup.rowlimit:-1)+"\">"
                +" <Fields>"+fields+"</Fields>"
                +" <Where>"+ (setup.whereCAML?setup.where:this.parse(setup.where)) +"</Where>"
                +" "+ ( groupby!="" ? "<GroupBy>"+groupby+"</GroupBy>" : "" )
                +" "+ ( orderby!="" ? "<OrderBy>"+orderby+"</OrderBy>" : "" )
                +" </Query>"
                +" </dsQuery>"
                +" </queryRequest>"
                + "</soap:Body>"
                + "</soap:Envelope>";
        // do the request
        var url = setup.url + "/_vti_bin/dspsts.asmx";
        _this.ajax({type: "POST",
                     cache: false,
                     async: true,
                     url: url,
                     data: body,
                     contentType: "text/xml; charset=utf-8",
                     beforeSend: function(xhr) { xhr.setRequestHeader('SOAPAction', 'http://schemas.microsoft.com/sharepoint/dsp/queryRequest'); },
                     dataType: "xml",
                     success:function(data) {
                       var aReturn=data.getElementsByTagName('Row');
                       if (setup.join) {
                         var on=[];
                         for (var i=0,stop=aReturn.length; i<stop; i++) on[aReturn[i].getAttribute(setup.join.on)]=aReturn[i];
                         var sp=$SP().list(setup.join.list,setup.join.url||setup.url);
                         setup.join.joinData=on;
                         sp.get(setup.join,fct);
                       }
                       else if (typeof fct == "function") fct.call(_this,aReturn,setup.joinData)
                     }
                   });
      }*/
      return this;
    },
    /**
      @name $SP().createFile
      @function
      @description Create a file and save it to a Document library
      
      @param {Object} setup Options (see below)
        @param {String} setup.content The file content
        @param {String} setup.destination The full path to the file to create
        @param {Boolean} [setup.encoded=false] Set to true if the content passed is already base64-encoded
        @param {String} [setup.url='current website'] The website url
        @param {Function} [setup.success=function(fileURL){}] A callback function that will be triggered in case of success; 1 parameter
        @param {Function} [setup.error=function(fileURL,errorMessage){}] A callback function that will be triggered in case of failure; 2 parameters
        @param {Function} [setup.after=function(fileURL){}] A callback function that will be triggered after the task whatever it's successful or not; 1 parameter
   
      @example
      // create a text document
      $SP().createFile({
        content:"Hello World!",
        destination:"http://mysite/Shared Documents/myfile.txt",
        url:"http://mysite/",
        after:function() { alert("File created!"); }
      });
      
      // we can also create an Excel file
      // a good way to export some data to Excel
      $SP().createFile({
        content:"&lt;table>&lt;tr>&lt;th>Column A&lt;/th>&lt;th>Column B&lt;/th>&lt;/tr>&lt;tr>&lt;td>Hello&lt;/td>&lt;td>World!&lt;/td>&lt;/tr>&lt;/table>",
        destination:"http://mysite/Shared Documents/myfile.xls",
        url:"http://mysite/",
        after:function() {
          window.location.href="http://mysite/Shared Documents/myfile.xls";
        }
      });

      // You can use https://github.com/Aymkdn/FileToDataURI if you want to be able to read a local file
      // and then upload it to a document library, via Javascript/Flash
      // We'll use "encoded:true" to say our content is alreadu a base64 string
      $SP().createFile({
        content:"*your stuff with FileToDataURI that returns a base64 string*",
        encoded:true,
        destination:"http://mysite/Shared Documents/myfile.xls",
        url:"http://mysite/"
      });

      // NOTE: in some cases the file are automatically checked out, so you have to use $SP().checkin()
    */
    createFile:function(setup) {
      // default values
      setup     = setup || {};
      if (setup.content == undefined) throw "Error 'createFile': not able to find the file content.";
      if (setup.destination == undefined) throw "Error 'createFile': not able to find the file destination path.";
      setup.url = setup.url || this.url;
      // if we didn't define the url in the parameters, then we need to find it
      if (!setup.url) {
        this._getURL();
        return this._addInQueue(arguments);
      }
      if (setup.url == undefined) throw "Error 'createFile': not able to find the URL!"; // we cannot determine the url
      setup.after   = setup.after || (function(){});
      setup.success = setup.success || (function() {});
      setup.error   = setup.error || (function() {});
      setup.encoded = (setup.encoded==undefined?false:setup.encoded);
      // if setup.destination starts with '/' then we use the current location
      if (setup.destination.charAt(0) === "/") setup.destination = window.location.protocol + "//" + window.location.host + setup.destination;

      var _this=this;
      var soapEnv = "<SourceUrl>http://null</SourceUrl>"
                    +"<DestinationUrls><string>"+setup.destination+"</string></DestinationUrls>"
                    +"<Fields><FieldInformation Type='File' /></Fields>"
                    +"<Stream>"+(setup.encoded?setup.content:_this.encode_b64(setup.content))+"</Stream>"
      soapEnv = _this._buildBodyForSOAP("CopyIntoItems", soapEnv);
      _this.ajax({
        url: setup.url + "/_vti_bin/copy.asmx",
        type: "POST",
        dataType: "xml",
        data: soapEnv,
        beforeSend: function(xhr) { xhr.setRequestHeader('SOAPAction', 'http://schemas.microsoft.com/sharepoint/soap/CopyIntoItems'); },
        contentType: "text/xml; charset=\"utf-8\"",
        success:function(data) {
          var a = data.getElementsByTagName('CopyResult');
          if (a && a[0] && a[0].getAttribute("ErrorCode") !== "Success") {
            if (typeof setup.error === "function") setup.error.call(_this, setup.destination, "Error 'createFile': "+a[0].getAttribute("ErrorCode")+" - "+a[0].getAttribute("ErrorMessage"));
          } else {
            if (typeof setup.success === "function") setup.success.call(_this, setup.destination);
          }
          
          if (typeof setup.after === "function") setup.after.call(_this, setup.destination);
        },
        error:function(qXHR, textStatus, errorThrown) {
          if (typeof setup.error === "function") setup.error.call(_this, setup.destination, "Error 'createFile': "+errorThrown);
          if (typeof setup.after === "function") setup.after.call(_this, setup.destination);
        }
      });

      return this;
    },
    /**
      @name $SP().createFolder
      @function
      @description Create a folter in a Document library
      
      @param {Object} setup Options (see below)
        @param {String} setup.path The relative path to the new folder
        @param {String} setup.library The name of the Document Library
        @param {String} [setup.url='current website'] The website url
        @param {Function} [setup.after=function(){}] A callback function that will be triggered after the task
   
      @example
      // create a folder called "first" at the root of the Shared Documents library
      // the result should be "http://mysite/Shared Documents/first/"
      $SP().createFolder({
        path:"first",
        library:"Shared Documents",
        url:"http://mysite/",
        after:function() { alert("Folder created!"); }
      });
      
      // create a folder called "second" under "first" 
      // the result should be "http://mysite/Shared Documents/first/second/"
      // if "first" doesn't exist then it will be created
      $SP().createFolder({
        path:"first/second",
        library:"Shared Documents",
        after:function() { alert("Folder created!"); }
      });

      // Note: To delete a folder you can use $SP().list().remove()
    */
    createFolder:function(setup) {
      // default values
      setup     = setup || {};
      if (setup.path == undefined) throw "Error 'createFolder': please provide the 'path'.";
      if (setup.library == undefined) throw "Error 'createFolder': please provide the library name.";
      setup.url = setup.url || this.url;
      // if we didn't define the url in the parameters, then we need to find it
      if (!setup.url) {
        this._getURL();
        return this._addInQueue(arguments);
      }
      if (setup.url == undefined) throw "Error 'createFolder': not able to find the URL!"; // we cannot determine the url
      setup.after = setup.after || (function(){});

      // split the path based on '/'
      var path = setup.path.split('/'), toAdd=[], tmpPath="";
      for (var i=0; i<path.length; i++) {
        tmpPath += (i>0?'/':'') + path[i];
        toAdd.push({FSObjType:1, BaseName:tmpPath})
      }
      this.list(setup.library, setup.url).add(toAdd, {after:setup.after})
      return this;
    },
    /**
      @name $SP().checkin
      @function
      @description Checkin a file
      
      @param {Object} [setup] Options (see below)
        @param {String} setup.destination The full path to the file to check in
        @param {String} [setup.comments=""] The comments related to the check in
        @param {String} [setup.url='current website'] The website url
        @param {Function} [setup.success=function(){}] A callback function that will be triggered when there is success
        @param {Function} [setup.error=function(){}] A callback function that will be triggered if there is an error
        @param {Function} [setup.after=function(){}] A callback function that will be triggered after the task
   
      @example
      $SP().checkin({
        destination:"http://mysite/Shared Documents/myfile.txt",
        comments:"Automatic check in with SharepointPlus",
        after:function() { alert("Done"); }
      });
    */
    checkin:function(setup) {
      // default values
      setup     = setup || {};
      if (setup.destination == undefined) throw "Error 'checkin': not able to find the file destination path.";
      setup.url = setup.url || this.url;
      // if we didn't define the url in the parameters, then we need to find it
      if (!setup.url) {
        this._getURL();
        return this._addInQueue(arguments);
      }
      if (this.url == undefined) throw "Error 'checkin': not able to find the URL!"; // we cannot determine the url
      setup.url = this.url;
      setup.comments = setup.comments || "";
      setup.success = setup.success || (function(){});
      setup.error = setup.error || (function(){});
      setup.after = setup.after || (function(){});

      var _this=this;
      var soapEnv = _this._buildBodyForSOAP("CheckInFile", '<pageUrl>'+setup.destination+'</pageUrl><comment>'+setup.comments+'</comment><CheckinType>1</CheckinType></CheckInFile>');
      _this.ajax({
        url: setup.url + "/_vti_bin/Lists.asmx",
        type: "POST",
        dataType: "xml",
        data: soapEnv,
        beforeSend: function(xhr) { xhr.setRequestHeader('SOAPAction', 'http://schemas.microsoft.com/sharepoint/soap/CheckInFile'); },
        contentType: "text/xml; charset=utf-8",
        success:function(data) {
          var res = data.getElementsByTagName('CheckInFileResult');
          if (res && res[0] && res[0].firstChild.nodeValue != "true") setup.error.call(_this);
          else setup.success.call(_this);

          setup.after.call(_this);
        }
      });
    },
    /**
      @name $SP().list.getAttachment
      @function
      @description Get the attachment(s) for some items
      
      @param {String|Array} itemID The item IDs separated by a coma (ATTENTION: one request is done for each ID)
      @param {Function} [result] A function with the data from the request as first argument
      
      @example
      $SP().list("My List","http://my.site.com/mydir/").getAttachment([1,15,24],function(data) {
        for (var i=0; i&lt;data.length; i++) console.log(data[i]);
      });
      
      $SP().list("My List").getAttachment("98", function(data) {
        for (var i=0; i&lt;data.length; i++) console.log(data[i]);
      });

      // you can also use $SP().list().get() using the "Attachments" field
    */
    getAttachment:function(itemID, fct, passed) {
      // check if we need to queue it
      if (this.needQueue) { return this._addInQueue(arguments) }
      if (this.listID == undefined) throw "Error 'getAttachment': you have to define the list ID/Name";
      if (arguments.length === 1 && typeof itemID === "function") throw "Error 'getAttachment': you have to define the item ID";
      if (this.url == undefined) throw "Error 'getAttachment': not able to find the URL!"; // we cannot determine the url
      if (typeof itemID !== "object") itemID = itemID.split(",");
      passed = passed || [];

      var _this=this;
      
      // forge the parameters
      var body = _this._buildBodyForSOAP("GetAttachmentCollection", "<listName>"+this.listID+"</listName><listItemID>"+itemID.shift()+"</listItemID>");
      // do the request
      var url = this.url + "/_vti_bin/lists.asmx";
      var aReturn = [];
      _this.ajax({type: "POST",
                   cache: false,
                   async: true,
                   url: url,
                   data: body,
                   contentType: "text/xml; charset=utf-8",
                   beforeSend: function(xhr) { xhr.setRequestHeader('SOAPAction', 'http://schemas.microsoft.com/sharepoint/soap/GetAttachmentCollection'); },
                   dataType: "xml",
                   success:function(data) {
                      var a = data.getElementsByTagName('Attachment');
                      for (var i=0; i < a.length; i++) aReturn.push(a[i].firstChild.nodeValue);
                      if (aReturn.length===0) aReturn="";
                      else if (aReturn.length===1) aReturn=aReturn[0]
                      passed.push(aReturn);
                      // if we don't have any more attachment to search for
                      if (itemID.length===0) {
                        if (typeof fct === "function") fct.call(_this,passed);
                      } else {
                        // we have more attachments to find
                        _this.getAttachment(itemID,fct,passed)
                      }
                   }
                 });
      return this;
    },
    /**
      @name $SP().list.getContentTypes
      @function
      @description Get the Content Types for the list (returns Name, ID and Description)
      
      @param {Object} [options]
        @param {Boolean} [options.cache=true] Do we want to use the cache on recall for this function?
      @param {Function} [function()] A function with the data from the request as first argument
      
      @example
      $SP().list("List Name").getContentTypes(function(contentTypes) {
        for (var i=0; i&lt;contentTypes.length; i++) console.log(contentTypes[i].Name, contentTypes[i].ID, contentTypes[i].Description);
      });
    */
    getContentTypes:function(options, fct) {
      // check if we need to queue it
      if (this.needQueue) { return this._addInQueue(arguments) }
      if (this.listID == undefined) throw "Error 'getContentTypes': you have to define the list ID";
      if (arguments.length === 1 && typeof options === "function") return this.getContentTypes(null, options);

      // default values
      if (this.url == undefined) throw "Error 'getContentTypes': not able to find the URL!"; // we cannot determine the url
      
      // check the Cache
      if (!options) options={cache:true};
      if (options.cache) {
        for (var i=0; i<_SP_CACHE_CONTENTTYPES.length; i++) {
          if (_SP_CACHE_CONTENTTYPES[i].list === this.listID && _SP_CACHE_CONTENTTYPES[i].url === this.url) {
            if (typeof fct === "function") fct.call(this,_SP_CACHE_CONTENTTYPES[i].contentTypes);
            return this;
          }
        }
      }
      
      var _this=this;
      // forge the parameters
      var body = _this._buildBodyForSOAP("GetListContentTypes", '<listName>'+_this.listID+'</listName>');
      // do the request
      var url = this.url + "/_vti_bin/lists.asmx";
      var aReturn = [];
      _this.ajax({type: "POST",
                   cache: false,
                   async: true,
                   url: url,
                   data: body,
                   contentType: "text/xml; charset=utf-8",
                   beforeSend: function(xhr) { xhr.setRequestHeader('SOAPAction', 'http://schemas.microsoft.com/sharepoint/soap/GetListContentTypes'); },
                   dataType: "xml",
                   success:function(data) {
                     var arr = data.getElementsByTagName('ContentType');
                     var ID;
                     for (var i=0; i < arr.length; i++) {
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

                     if (typeof fct === "function") fct.call(_this,aReturn);
                   }
                 });
      return this;
    },
    /**
      @name $SP().list.getContentTypeInfo
      @function
      @description Get the Content Type Info for a Content Type into the list
      
      @param {String} contentType The Name or the ID (from $SP().list.getContentTypes) of the Content Type
      @param {Object} [options]
        @param {Boolean} [options.cache=true] Do we use the cache?
      @param {Function} [function()] A function with the data from the request as first argument
      
      @example
      $SP().list("List Name").getContentTypeInfo("Item", function(fields) {
        for (var i=0; i&lt;fields.length; i++) console.log(fields[i]["DisplayName"]+ ": "+fields[i]["Description"]);
      });

      $SP().list("List Name").getContentTypeInfo("0x01009C5212B2D8FF564EBE4873A01C57D0F9001", function(fields) {
        for (var i=0; i&lt;fields.length; i++) console.log(fields[i]["DisplayName"]+ ": "+fields[i]["Description"]);
      });
    */
    getContentTypeInfo:function(contentType, options, fct) {
      // check if we need to queue it
      if (this.needQueue) { return this._addInQueue(arguments) }
      if (this.listID == undefined) throw "Error 'getContentTypeInfo': you have to define the list ID";
      if (arguments.length >= 1 && typeof contentType !== "string") throw "Error 'getContentTypeInfo': you have to provide the Content Type Name/ID";
      if (arguments.length === 2 && typeof options === "function") return this.getContentTypeInfo(contentType, null, options);
      // default values
      if (this.url == undefined) throw "Error 'getContentTypeInfo': not able to find the URL!"; // we cannot determine the url
      
      if (!options) options={cache:true}

      // look at the cache
      if (options.cache) {
        for (var i=0; i<_SP_CACHE_CONTENTTYPE.length; i++) {
          if (_SP_CACHE_CONTENTTYPE[i].list === this.listID && _SP_CACHE_CONTENTTYPE[i].url === this.url && _SP_CACHE_CONTENTTYPE[i].contentType === contentType) {
            if (typeof fct === "function") fct.call(this,_SP_CACHE_CONTENTTYPE[i].info);
            return this;
          }
        }
      }

      // do we have a Content Type Name or ID ?
      if (contentType.slice(0,2) !== "0x") {
        // it's a Name so get the related ID using $SP.list.getContentTypes
        this.getContentTypes(options, function(types) {
          var found=false;
          for (var i=types.length; i--;) {
            if (types[i]["Name"]===contentType) {
              this.getContentTypeInfo(types[i]["ID"], options, fct);
              found=true;
              break;
            }
          }
          if (!found) throw "Error 'getContentTypeInfo': not able to find the Content Type called '"+contentType+"' at "+this.url;
        });
        return this;
      }

      var _this=this;
      
      // forge the parameters
      var body = _this._buildBodyForSOAP("GetListContentType", '<listName>'+_this.listID+'</listName><contentTypeId>'+contentType+'</contentTypeId>');
      // do the request
      var url = this.url + "/_vti_bin/lists.asmx";
      var aReturn = [];
      _this.ajax({type: "POST",
                   cache: false,
                   async: true,
                   url: url,
                   data: body,
                   contentType: "text/xml; charset=utf-8",
                   beforeSend: function(xhr) { xhr.setRequestHeader('SOAPAction', 'http://schemas.microsoft.com/sharepoint/soap/GetListContentType'); },
                   dataType: "xml",
                   success:function(data) {
                     var arr = data.getElementsByTagName('Field');
                     var index = 0, aIndex, attributes, attrName, lenDefault;
                     for (var i=0; i < arr.length; i++) {
                       if (arr[i].getAttribute("ID")) {
                         aReturn[index] = [];
                         aIndex=aReturn[index];
                         attributes=arr[i].attributes;
                         for (var j=attributes.length; j--;) {
                           attrName=attributes[j].nodeName;
                           attrValue=attributes[j].nodeValue;
                           if (attrName==="Type") {
                             switch (attrValue) {
                               case "Choice":
                               case "MultiChoice": {
                                 aIndex["FillInChoice"] = arr[i].getAttribute("FillInChoice");
                                 var a=arr[i].getElementsByTagName("CHOICE");
                                 var r=[];
                                 for(var k=0; k<a.length; k++) r.push(a[k].firstChild.nodeValue);
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
                           for (var q=0; q<lenDefault; q++) nodeDefault[q].firstChild && aReturn[index]["DefaultValue"].push(nodeDefault[q].firstChild.nodeValue);
                           if (lenDefault===1) aReturn[index]["DefaultValue"]=aReturn[index]["DefaultValue"][0];
                         } else aReturn[index]["DefaultValue"]=null;

                         index++;
                       }
                     }
                    
                     // we cache the result
                     _SP_CACHE_CONTENTTYPE.push({"list":_this.listID, "url":_this.url, "contentType":contentType, "info":aReturn});

                     if (typeof fct == "function") fct.call(_this,aReturn);
                   }
                 });
      return this;
    },
    /**
      @name $SP().list.info
      @function
      @description Get the information (StaticName, DisplayName, Description, Required ("TRUE", "FALSE", null), DefaultValue, Choices, etc...) - metadata - regarding the list for each column
      
      @param {Function} [function()] A function with the data from the request as first argument
      
      @example
      $SP().list("List Name").info(function(fields) {
        for (var i=0; i&lt;fields.length; i++) console.log(fields[i]["DisplayName"]+ ": "+fields[i]["Description"]);
      });
      
      $SP().list("My list","http://intranet.site.com/dept/").info(function(fields) {
        for (var i=0; i&lt;fields.length; i++) console.log(fields[i]["DisplayName"]+ ": "+fields[i]["Description"]);
      });
    */
    info:function(fct) {
      // check if we need to queue it
      if (this.needQueue) { return this._addInQueue(arguments) }
      if (this.listID == undefined) throw "Error 'info': you have to define the list ID";
        
      // default values
      if (this.url == undefined) throw "Error 'info': not able to find the URL!"; // we cannot determine the url

      var _this=this;
            
      // forge the parameters
      var body = _this._buildBodyForSOAP("GetList", '<listName>'+_this.listID+'</listName>');
      // do the request
      var url = this.url + "/_vti_bin/lists.asmx";
      var aReturn = [];
      _this.ajax({type: "POST",
                   cache: false,
                   async: true,
                   url: url,
                   data: body,
                   contentType: "text/xml; charset=utf-8",
                   beforeSend: function(xhr) { xhr.setRequestHeader('SOAPAction', 'http://schemas.microsoft.com/sharepoint/soap/GetList'); },
                   dataType: "xml",
                   success:function(data) {
                     var arr = data.getElementsByTagName('Field');
                     var index = 0, aIndex, attributes, attrName, lenDefault;
                     for (var i=0; i < arr.length; i++) {
                       if (arr[i].getAttribute("ID")) {
                         aReturn[index] = [];
                         aIndex=aReturn[index];
                         attributes=arr[i].attributes;
                         for (var j=attributes.length; j--;) {
                           attrName=attributes[j].nodeName;
                           attrValue=attributes[j].nodeValue;
                           if (attrName==="Type") {
                             switch (attrValue) {
                               case "Choice":
                               case "MultiChoice": {
                                 aIndex["FillInChoice"] = arr[i].getAttribute("FillInChoice");
                                 var a=arr[i].getElementsByTagName("CHOICE");
                                 var r=[];
                                 for(var k=0; k<a.length; k++) r.push(a[k].firstChild.nodeValue);
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
                           for (var q=0; q<lenDefault; q++) nodeDefault[q].firstChild && aReturn[index]["DefaultValue"].push(nodeDefault[q].firstChild.nodeValue);
                           if (lenDefault===1) aReturn[index]["DefaultValue"]=aReturn[index]["DefaultValue"][0];
                         } else aReturn[index]["DefaultValue"]=null;

                         index++;
                       }
                     }
                      
                     if (typeof fct == "function") fct.call(_this,aReturn);
                   }
                 });
      return this;
    },
    /**
      @name $SP().list.view
      @function
      @description Get the info (fields, orderby, whereCAML) for a View
      
      @param {String} [viewID="The default view"] The view ID or view Name
      @param {Function} [function()] A function with the data from the request as first argument and the viewID as second parameter
      
      @example
      $SP().list("List Name").view("All Items",function(data,viewID) {
        for (var i=0; i&lt;data.fields.length; i++) console.log("Column "+i+": "+data.fields[i]);
        console.log("And the GUI for this view is :"+viewID);
      });
      
      $SP().list("My List","http://my.sharepoint.com/my/site").view("My Beautiful View",function(data,viewID) {
        for (var i=0; i&lt;data.fields.length; i++) console.log("Column "+i+": "+data.fields[i]);
      });
    */
    view:function(viewID, fct) {
      // check if we need to queue it
      if (this.needQueue) { return this._addInQueue(arguments) }
      if (this.listID == undefined) throw "Error 'view': you have to define the list ID/Name";
      if (arguments.length === 1 && typeof viewID === "function") return this.view("", viewID);
  
      // default values
      list = this.listID;
      if (this.url == undefined) throw "Error 'view': not able to find the URL!"; // we cannot determine the url
      viewID = viewID || "";
      var viewName = arguments[2] || viewID;
      
      viewName=viewName.toLowerCase();
      // check if we didn't save this information before
      var savedView = _SP_CACHE_SAVEDVIEW;
      if (savedView!=undefined) {
        for (var i=savedView.length; i--;) {
          if (savedView[i].url===this.url && savedView[i].list===list && (savedView[i].viewID===viewID || savedView[i].viewName===viewName)) { fct.call(this,savedView[i].data,viewID); return this }
        }
      } else savedView=[];
      
      // if viewID is not an ID but a name then we need to find the related ID
      if (viewID.charAt(0) !== '{') {
        this.views(function(views) {
          var found=false;
          for (var i=views.length; i--;) {
            if (views[i]["Name"]===viewID) {
              this.view(views[i]["ID"],fct,viewID);
              found=true;
              break;
            }
          }
          if (!found) throw "Error 'view': not able to find the view called '"+viewID+"' at "+this.url;
        });
        return this;
      }

      var _this=this;
      
      // forge the parameters
      var body = _this._buildBodyForSOAP("GetView", '<listName>'+_this.listID+'</listName><viewName>'+viewID+'</viewName>');
      // do the request
      var url = this.url + "/_vti_bin/Views.asmx";
      var aReturn = ["fields","orderby","whereCAML"];
      _this.ajax({type: "POST",
                   cache: false,
                   async: true,
                   url: url,
                   data: body,
                   contentType: "text/xml; charset=utf-8",
                   beforeSend: function(xhr) { xhr.setRequestHeader('SOAPAction', 'http://schemas.microsoft.com/sharepoint/soap/GetView'); },
                   dataType: "xml",
                   success:function(data) {
                     aReturn.fields=[]
                     var arr = data.getElementsByTagName('ViewFields')[0].getElementsByTagName('FieldRef');
                     for (var i=0; i < arr.length; i++) aReturn.fields.push(arr[i].getAttribute("Name"));
                    
                     aReturn.orderby="";
                     arr = data.getElementsByTagName('OrderBy');
                     if (arr.length) {
                       var orderby=[];
                       arr = arr[0].getElementsByTagName('FieldRef');
                       for (var i=0; i<arr.length; i++) orderby.push(arr[i].getAttribute("Name")+" "+(arr[i].getAttribute("Ascending")==undefined?"ASC":"DESC"));
                       aReturn.orderby=orderby.join(",");
                     }
                     
                     aReturn.whereCAML="";
                     var where=data.getElementsByTagName('Where');
                     if (where.length) {
                       where=where[0].xml || (new XMLSerializer()).serializeToString(where[0]);
                       where=where.match(/<Where [^>]+>(.*)<\/Where>/);
                       if(where.length==2) aReturn.whereCAML=where[1];
                     }
                     
                     // cache the data
                     savedView.push({url:_this.url,list:list,data:aReturn,viewID:viewID,viewName:viewName});
                     _SP_CACHE_SAVEDVIEW = savedView;
                     
                     if (typeof fct == "function") fct.call(_this,aReturn,viewID);
                   }
                 });
      return this;
    },
    /**
      @name $SP().list.views
      @function
      @description Get the views info (ID, Name, Url, Node) for a List
      
      @param {Hash} [options]
        @param {Boolean} [cache=true] By default the result will be cached for a later use in the page
      @param {Function} [function()] A function with the data from the request as first argument
      
      @example
      $SP().list("My List").views(function(view) {
        for (var i=0; i&lt;view.length; i++) {
          console.log("View #"+i+": "+view[i]['Name']);
          // if you want to access to another property, like "Type"
          console.log("Type: "+view[i]["Node"].getAttribute("Type"));
        }
      });

    */
    views:function(options, fct) {
      if (typeof options === "function") return this.views({}, options);
      options.cache = (options.cache === false ? false : true);
      // check if we need to queue it
      if (this.needQueue) { return this._addInQueue(arguments) }
      if (this.listID == undefined) throw "Error 'views': you have to define the list ID";
        
      // default values
      if (this.url == undefined) throw "Error 'views': not able to find the URL!"; // we cannot determine the url
      fct = fct || function(){};
            
      // check if we didn't save this information before
      var savedViews = _SP_CACHE_SAVEDVIEWS;
      if (savedViews!=undefined && options.cache) {
        for (var i=savedViews.length; i--;) {
          if (savedViews[i].url==this.url && savedViews[i].listID === this.listID) { fct.call(this,savedViews[i].data); return this }
        }
      } else savedViews=[];
      
      var _this=this;
      
      // forge the parameters
      var body = _this._buildBodyForSOAP("GetViewCollection", '<listName>'+_this.listID+'</listName>');
      // do the request
      var url = _this.url + "/_vti_bin/Views.asmx";
      var aReturn = [];
      _this.ajax({type: "POST",
                   cache: false,
                   async: true,
                   url: url,
                   data: body,
                   contentType: "text/xml; charset=utf-8",
                   beforeSend: function(xhr) { xhr.setRequestHeader('SOAPAction', 'http://schemas.microsoft.com/sharepoint/soap/GetViewCollection'); },
                   dataType: "xml",
                   success:function(data) {
                    var arr = data.getElementsByTagName('View');
                    for (var i=0; i < arr.length; i++) {
                      aReturn[i] = [];
                      aReturn[i]["ID"] = arr[i].getAttribute("Name");
                      aReturn[i]["Name"] = arr[i].getAttribute("DisplayName");
                      aReturn[i]["Url"] = arr[i].getAttribute("Url");
                      aReturn[i]["Node"] = arr[i]
                    }
                    
                    // save the data into the DOM for later usage
                    if (options.cache === true) {
                      savedViews.push({url:_this.url,listID:this.listID,data:aReturn});
                      _SP_CACHE_SAVEDVIEWS = savedViews;
                    }
                    fct.call(_this,aReturn);
                   }
                 });
      return this;
    },
    /**
      @name $SP().lists
      @function
      @description Get the lists from the site (for each list we'll have "ID", "Name", "Description", "Url")
      
      @param {Object} [setup] Options (see below)
        @param {String} [setup.url='current website'] The website url
      @param {Function} [function()] A function with the data from the request as first argument
      
      @example
      $SP().lists(function(list) {
        for (var i=0; i&lt;list.length; i++) console.log("List #"+i+": "+list[i]['Name']);
      });
    */
    lists:function(setup, fct) {
      if (arguments.length===1 && typeof setup === "function") return this.lists({}, setup);
        
      // default values
      setup = setup || {};
      setup.url = setup.url || this.url;
      // if we didn't define the url in the parameters, then we need to find it
      if (!setup.url) {
        this._getURL();
        return this._addInQueue(arguments);
      } else this.url=setup.url
      if (this.url == undefined) throw "Error 'lists': not able to find the URL!"; // we cannot determine the url

      var _this=this;
            
      // forge the parameters
      var body = _this._buildBodyForSOAP("GetListCollection", "");
      // check if we didn't save this information before
      var savedLists = _SP_CACHE_SAVEDLISTS;
      if (savedLists!=undefined) {
        for (var i=savedLists.length; i--;) {
          if (savedLists[i].url==this.url) {
            if (typeof fct == "function") fct(savedLists[i].data);
            else {
              this.data = savedLists[i].data;
              this.length = this.data.length;
            }
            return this;
          }
        }
      } else savedLists=[];

      // do the request
      var url = _this.url + "/_vti_bin/lists.asmx";
      var aReturn = [];
      _this.ajax({type:"POST",
                   cache:false,
                   async:true,
                   url:url,
                   data:body,
                   contentType:"text/xml; charset=utf-8",
                   beforeSend:function(xhr) { xhr.setRequestHeader('SOAPAction', 'http://schemas.microsoft.com/sharepoint/soap/GetListCollection'); },
                   dataType:"xml",
                   success:function(data) {
                    var arr = data.getElementsByTagName('List');
                    for (var i=0; i < arr.length; i++) {
                      aReturn[i] = [];
                      aReturn[i]["ID"] = arr[i].getAttribute("ID");
                      aReturn[i]["Name"] = arr[i].getAttribute("Title");
                      aReturn[i]["Url"] = arr[i].getAttribute("DefaultViewUrl");
                      aReturn[i]["Description"] = arr[i].getAttribute("Description");
                    }
                    
                    // save the data into the DOM for later usage
                    savedLists.push({url:_this.url,data:aReturn});
                    _SP_CACHE_SAVEDLISTS = savedLists;
                    if (typeof fct == "function") fct.call(_this,aReturn);
                   }
                 });
      return this;
    },
    /**
      @name $SP().list.add
      @function
      @description Add items into a Sharepoint List
                   note: A Date must be provided as "YYYY-MM-DD" (only date comparison) or "YYYY-MM-DD hh:mm:ss" (date AND time comparison), or you can use $SP().toSPDate(new Date())
                   note: A person must be provided as "-1;#email" (e.g. "-1;#foo@bar.com") OR NT login with double \ (eg "-1;#europe\\foo_bar") OR the user ID
                   note: A lookup value must be provided as "X;#value", with X the ID of the value from the lookup list.
                         --> it should also be possible to not pass the value but only the ID, e.g.: "X;#"
                   note: A URL field must be provided as "http://www.website.com, Name"
                   note: A multiple selection must be provided as ";#choice 1;#choice 2;#", or just pass an array as the value and it will do the trick
                   note: A multiple selection of Lookup must be provided as ";#X;#Choice 1;#Y;#Choice 2;#" (with X the ID for "Choice 1", and "Y" for "Choice 2")
                         --> it should also be possible to not pass the values but only the ID, e.g.: ";#X;#;#Y;#;#"
                   note: A Yes/No checkbox must be provided as "1" (for TRUE) or "0" (for "False")
                   note: You cannot change the Approval Status when adding, you need to use the $SP().moderate function
      
      @param {Object|Array} items List of items (e.g. [{Field_x0020_Name: "Value", OtherField: "new value"}, {Field_x0020_Name: "Value2", OtherField: "new value2"}])
      @param {Object} [setup] Options (see below)
        @param {Function} [setup.progress] (current,max) If you provide more than 15 items then they will be treated by packets and you can use "progress" to know more about the steps
        @param {Function} [setup.success] A function with the items added sucessfully
        @param {Function} [setup.error] A function with the items not added
        @param {Function} [setup.after] A function that will be executed at the end of the request
        @param {Boolean} [setup.escapeChar=true] Determines if we want to escape the special chars that will cause an error (for example '&' will be automatically converted to '&amp;amp;')
      
      @example
      $SP().list("My List").add({Title:"Ok"});
      
      $SP().list("List Name").add([{Title:"Ok"}, {Title:"Good"}], {after:function() { alert("Done!"); });
                 
      $SP().list("My List","http://my.sharepoi.nt/dir/").add({Title:"Ok"}, {error:function(items) {
        for (var i=0; i &lt; items.length; i++) console.log("Error '"+items[i].errorMessage+"' with:"+items[i].Title); // the 'errorMessage' attribute is added to the object
      }, success:function(items) {
        for (var i=0; i &lt; items.length; i++) console.log("Success for:"+items[i].Title+" (ID:"+items[i].ID+")");
      }});
      
      // different ways to add John and Tom into the table
      $SP().list("List Name").add({Title:"John is the Tom's Manager",Manager:"-1;#john@compagny.com",Report:"-1;#tom@compagny.com"}); // if you don't know the ID
      $SP().list("My List").add({Title:"John is the Tom's Manager",Manager:"157",Report:"874"}); // if you know the Lookup ID 
    */
    add:function(items, setup) {
      // check if we need to queue it
      if (this.needQueue) { return this._addInQueue(arguments) }
      if (arguments.length===0 || (arguments.length===1 && typeof items !== "object"))
        throw "Error 'add': you need to define the list of items";
      if (this.listID===undefined) throw "Error 'add': you need to use list() to define the list name.";
      
      // default values
      setup         = setup || {};
      if (this.url == undefined) throw "Error 'add': not able to find the URL!"; // we cannot determine the url
      setup.success = setup.success || (function() {});
      setup.error   = setup.error || (function() {});
      setup.after   = setup.after || (function() {});
      setup.escapeChar = (setup.escapeChar == undefined) ? true : setup.escapeChar;
      setup.progress= setup.progress || (function() {});
      
      if (typeof items === "object" && items.length==undefined) items = [ items ];
      var itemsLength=items.length;
      
      // define current and max for the progress
      setup.progressVar = setup.progressVar || {current:0,max:itemsLength,passed:[],failed:[],eventID:"spAdd"+(""+Math.random()).slice(2)};
      // we cannot add more than 15 items in the same time, so split by 15 elements
      // and also to avoid surcharging the server
      if (itemsLength > 15) {
        var nextPacket=items.slice(0);
        var cutted=nextPacket.splice(0,15);
        var _this=this;
        _SP_ADD_PROGRESSVAR[setup.progressVar.eventID] = function(setup) {
          _this.add(nextPacket,setup);
        };
        this.add(cutted,setup);
        return this;
      } else if (itemsLength == 0) {
        setup.progress(1,1);
        setup.error([]);
        setup.success([]);
        setup.after();
        return this;
      }
      
      // increment the progress
      setup.progressVar.current += itemsLength;
      
      // build a part of the request
      var updates = '<Batch OnError="Continue" ListVersion="1"  ViewName="">';
      var _this = this;
      var itemKey, itemValue, it;
      for (var i=0; i < items.length; i++) {
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

      var _this=this;
            
      // build the request
      var body = _this._buildBodyForSOAP("UpdateListItems", "<listName>"+_this.listID+"</listName><updates>" + updates + "</updates>");
      // send the request
      var url = _this.url + "/_vti_bin/lists.asmx";
      _this.ajax({type:"POST",
                   cache:false,
                   async:true,
                   url:url,
                   data:body,
                   beforeSend: function(xhr) { xhr.setRequestHeader('SOAPAction', 'http://schemas.microsoft.com/sharepoint/soap/UpdateListItems'); },
                   contentType:"text/xml; charset=utf-8",
                   dataType:"xml",
                   success:function(data) {
                     var result = data.getElementsByTagName('Result');
                     var len=result.length;
                     var passed = setup.progressVar.passed, failed = setup.progressVar.failed;
                     for (var i=0; i < len; i++) {
                       if (result[i].getElementsByTagName('ErrorCode')[0].firstChild.nodeValue == "0x00000000") { // success
                         var rows=result[i].getElementsByTagName('z:row');
                         if (rows.length==0) rows=result[i].getElementsByTagName('row'); // for Chrome 'bug'
                         if (items[i]) {
                           items[i].ID = rows[0].getAttribute("ows_ID");
                           passed.push(items[i]);
                         }
                       } else if (items[i]) {
                         items[i].errorMessage = result[i].getElementsByTagName('ErrorText')[0].firstChild.nodeValue;
                         failed.push(items[i]);
                       }
                     }
                     
                     setup.progress(setup.progressVar.current,setup.progressVar.max);
                     // check if we have some other packets that are waiting to be treated
                     if (setup.progressVar.current < setup.progressVar.max) {
                       if (_SP_ADD_PROGRESSVAR[setup.progressVar.eventID]) {
                         _SP_ADD_PROGRESSVAR[setup.progressVar.eventID](setup);
                       }
                     } else {
                      if (failed.length>0) setup.error.call(_this,failed);
                      if (passed.length>0) setup.success.call(_this,passed);
                      setup.after.call(_this);
                      if (_SP_ADD_PROGRESSVAR[setup.progressVar.eventID]) delete _SP_ADD_PROGRESSVAR[setup.progressVar.eventID];
                     }
                   }
                 });
      return this;
    },
    /**
      @name $SP().list.update
      @function
      @description Update items from a Sharepoint List
      
      @param {Array} items List of items (e.g. [{ID: 1, Field_x0020_Name: "Value", OtherField: "new value"}, {ID:22, Field_x0020_Name: "Value2", OtherField: "new value2"}])
      @param {Object} [setup] Options (see below)
        @param {String} [setup.where=""] You can define a WHERE clause
        @param {Function} [setup.progress] Two parameters: 'current' and 'max' -- if you provide more than 15 ID then they will be treated by packets and you can use "progress" to know more about the steps
        @param {Function} [setup.success] One parameter: 'passedItems' -- a function with the items updated sucessfully
        @param {Function} [setup.error] One parameter: 'failedItems' -- a function with the items not updated
        @param {Function} [setup.after] A function that will be executed at the end of the request
        @param {Boolean} [setup.escapeChar=true] Determines if we want to escape the special chars that will cause an error (for example '&' will be automatically converted to '&amp;')
        
      @example
      $SP().list("My List").update({ID:1, Title:"Ok"}); // you must always provide the ID
      $SP().list("List Name").update({Title:"Ok"},{where:"Status = 'Complete'"}); // if you use the WHERE then you must not provide the item ID
      
      $SP().list("My List","http://sharepoint.org/mydir/").update([{ID:5, Title:"Ok"}, {ID: 15, Title:"Good"}]);
                 
      $SP().list("List Name").update({ID:43, Title:"Ok"}, {error:function(items) {
        for (var i=0; i &lt; items.length; i++) console.log("Error '"+items[i].errorMessage+"' with:"+items[i].Title);
      }});
    */
    update:function(items, setup) {
      // check if we need to queue it
      if (this.needQueue) { return this._addInQueue(arguments) }
      if (this.listID===undefined) throw "Error 'update': you need to use list() to define the list name.";
      
      // default values
      setup         = setup || {};
      if (this.url == undefined) throw "Error 'update': not able to find the URL!"; // we cannot determine the url
      setup.where   = setup.where || "";
      setup.success = setup.success || (function() {});
      setup.error   = setup.error || (function() {});
      setup.after   = setup.after || (function() {});
      setup.escapeChar = (setup.escapeChar == undefined) ? true : setup.escapeChar;
      setup.progress= setup.progress || (function() {});
           
      if (typeof items === "object" && items.length==undefined) items = [ items ];
      var itemsLength=items.length;
      
      // if there is a WHERE clause
      if (itemsLength == 1 && setup.where) {
        // call GET first
        delete items[0].ID;
        var _this=this;
        this.get({fields:"ID",where:setup.where},function(data) {
          // we need a function to clone the items
          var clone = function(obj){
            var newObj = {};
            for (var k in obj) newObj[k]=obj[k];
            return newObj;
          };
          var aItems=[];
          for (var i=data.length;i--;) {
            var it=clone(items[0]);
            it.ID=data[i].getAttribute("ID");
            aItems.push(it);
          }
          delete setup.where;
          // now call again the UPDATE
          _this.update(aItems,setup);
        });
        return this;
      }
      
      // define current and max for the progress
      setup.progressVar = setup.progressVar || {current:0,max:itemsLength,passed:[],failed:[],eventID:"spUpdate"+(""+Math.random()).slice(2)};
      // we cannot add more than 15 items in the same time, so split by 15 elements
      // and also to avoid surcharging the server
      if (itemsLength > 15) {
        var nextPacket=items.slice(0);
        var cutted=nextPacket.splice(0,15);
        var _this=this;
        _SP_UPDATE_PROGRESSVAR[setup.progressVar.eventID] = function(setup) {
          _this.update(nextPacket,setup);
        };
        this.update(cutted,setup);
        return this;
      } else if (itemsLength == 0) {
        setup.progress(1,1);
        setup.error([]);
        setup.success([]);
        setup.after();
        return this;
      }
      
      // increment the progress
      setup.progressVar.current += itemsLength;

      // build a part of the request
      var updates = '<Batch OnError="Continue" ListVersion="1"  ViewName="">';
      var _this = this;
      var itemKey, itemValue, it;
      for (var i=0; i < itemsLength; i++) {
        updates += '<Method ID="'+(i+1)+'" Cmd="Update">';
        if (items[i].ID == undefined) throw "Error 'update': you have to provide the item ID called 'ID'";
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

      var _this=this;
            
      // build the request
      var body = _this._buildBodyForSOAP("UpdateListItems", "<listName>"+_this.listID+"</listName><updates>" + updates + "</updates>");
      // send the request
      var url = this.url + "/_vti_bin/lists.asmx";
      _this.ajax({type:"POST",
                   cache:false,
                   async:true,
                   url:url,
                   data:body,
                   beforeSend: function(xhr) { xhr.setRequestHeader('SOAPAction', 'http://schemas.microsoft.com/sharepoint/soap/UpdateListItems'); },
                   contentType: "text/xml; charset=utf-8",
                   dataType: "xml",
                   success:function(data) {
                     var result = data.getElementsByTagName('Result');
                     var len=result.length;
                     var passed = setup.progressVar.passed, failed = setup.progressVar.failed;
                     for (var i=0; i < len; i++) {
                       if (result[i].getElementsByTagName('ErrorCode')[0].firstChild.nodeValue == "0x00000000" && items[i]) // success
                         passed.push(items[i]);
                       else if (items[i]) {
                         items[i].errorMessage = result[i].getElementsByTagName('ErrorText')[0].firstChild.nodeValue;
                         failed.push(items[i]);
                       }
                     }
                     
                     setup.progress(setup.progressVar.current,setup.progressVar.max);
                     // check if we have some other packets that are waiting to be treated
                     if (setup.progressVar.current < setup.progressVar.max) {
                       if (_SP_UPDATE_PROGRESSVAR[setup.progressVar.eventID]) {
                         _SP_UPDATE_PROGRESSVAR[setup.progressVar.eventID](setup);
                       }
                     }
                     else {
                       if (failed.length>0) setup.error.call(_this,failed);
                       if (passed.length>0) setup.success.call(_this,passed);
                       setup.after.call(_this);
                       if (_SP_UPDATE_PROGRESSVAR[setup.progressVar.eventID]) delete _SP_UPDATE_PROGRESSVAR[setup.progressVar.eventID];
                     }
                   }
                 });
      return this;
    },
    /**
      @name $SP().list.history
      @function
      @description When a textarea/multiple lines of text has the versioning option, then you can use this function to find the previous values
      
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
      // check if we need to queue it
      if (this.needQueue) { return this._addInQueue(arguments) }
      if (this.listID===undefined) throw "Error 'history': you need to use list() to define the list name.";
      if (arguments.length !== 2) throw "Error 'history': you need to provide two parameters.";
      if (typeof params !== "object") throw "Error 'history': the first parameter must be an object.";
      else {
        if (params.ID === undefined || params.Name === undefined) throw "Error 'history': the first parameter must be an object with ID and Name.";
      }
      if (typeof returnFct !== "function") throw "Error 'history': the second parameter must be a function.";

      var _this=this;
      
      // build the request
      var body = _this._buildBodyForSOAP("GetVersionCollection", "<strlistID>"+_this.listID+"</strlistID><strlistItemID>"+params.ID+"</strlistItemID><strFieldName>"+params.Name+"</strFieldName>")
      // send the request
      var url = this.url + "/_vti_bin/lists.asmx";
      _this.ajax({type:"POST",
                   cache:false,
                   async:true,
                   url:url,
                   data:body,
                   beforeSend: function(xhr) { xhr.setRequestHeader('SOAPAction', 'http://schemas.microsoft.com/sharepoint/soap/GetVersionCollection'); },
                   contentType: "text/xml; charset=utf-8",
                   dataType: "xml",
                   success:function(data) {
                     returnFct.call(_this, data.getElementsByTagName('Version'))
                   }
                 });
      return this;
    },
    /**
      @name $SP().list.moderate
      @function
      @description Moderate items from a Sharepoint List
      
      @param {Array} approval List of items and ApprovalStatus (e.g. [{ID:1, ApprovalStatus:"Approved"}, {ID:22, ApprovalStatus:"Pending"}])
      @param {Object} [setup] Options (see below)
        @param {Function} [setup.success] A function with the items updated sucessfully
        @param {Function} [setup.error] A function with the items not updated
        @param {Function} [setup.after] A function that will be executed at the end of the request
        @param {Function} [setup.progress] Two parameters: 'current' and 'max' -- if you provide more than 15 ID then they will be treated by packets and you can use "progress" to know more about the steps
        
      @example
      $SP().list("My List").moderate({ID:1, ApprovalStatus:"Rejected"}); // you must always provide the ID
      
      $SP().list("List Name").moderate([{ID:5, ApprovalStatus:"Pending"}, {ID: 15, ApprovalStatus:"Approved"}]);
                 
      $SP().list("Other List").moderate({ID:43, ApprovalStatus:"Approved"}, {
        error:function(items) {
          for (var i=0; i &lt; items.length; i++) console.log("Error with:"+items[i].ID);
        },
        success:function(items) {
          for (var i=0; i &lt; items.length; i++) console.log("Success with:"+items[i].getAttribute("Title"));
        }
      });
    */
    moderate:function(items, setup) {
      // check if we need to queue it
      if (this.needQueue) { return this._addInQueue(arguments) }
      if (arguments.length===0 || (arguments.length===1 && typeof items === "object" && items.length === undefined))
        throw "Error 'moderate': you need to define the list of items";
      if (this.listID===undefined) throw "Error 'moderate': you need to use list() to define the list name.";
      
      // default values
      setup         = setup || {};
      if (this.url == undefined) throw "Error 'moderate': not able to find the URL!"; // we cannot determine the url
      setup.async   = (setup.async == undefined) ? true : setup.async;
      setup.success = setup.success || (function() {});
      setup.error   = setup.error || (function() {});
      setup.after   = setup.after || (function() {});
      setup.progress= setup.progress || (function() {});
      
      if (typeof items === "object" && items.length==undefined) items = [ items ];
      var itemsLength=items.length;

      // define current and max for the progress
      setup.progressVar = setup.progressVar || {current:0,max:itemsLength,passed:[],failed:[],eventID:"spModerate"+(""+Math.random()).slice(2)};
      var _this=this;
      
      // we cannot add more than 15 items in the same time, so split by 15 elements
      // and also to avoid surcharging the server
      if (itemsLength > 15) {
        var nextPacket=items.slice(0);
        var cutted=nextPacket.splice(0,15);
        _SP_MODERATE_PROGRESSVAR[setup.progressVar.eventID] = function(setup) {
          _this.moderate(nextPacket,setup);
        };
        this.moderate(cutted,setup);
        return this;
      } else if (itemsLength == 0) {
        setup.progress(1,1);
        setup.success([]);
        setup.error([]);
        setup.after();
        return this;
      }
      
      // increment the progress
      setup.progressVar.current += itemsLength;

      // build a part of the request
      var updates = '<Batch OnError="Continue" ListVersion="1"  ViewName="">';
      var itemKey, itemValue, it;
      for (var i=0; i < itemsLength; i++) {
        updates += '<Method ID="'+(i+1)+'" Cmd="Moderate">';
        if (items[i].ID == undefined) throw "Error 'moderate': you have to provide the item ID called 'ID'";
        else if (items[i].ApprovalStatus == undefined) throw "Error 'moderate': you have to provide the approval status 'ApprovalStatus' (Approved, Rejected, Pending, Draft or Scheduled)";
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
      
      // build the request
      var body = _this._buildBodyForSOAP("UpdateListItems", "<listName>"+_this.listID+"</listName><updates>" + updates + "</updates>");
      // send the request
      var url = _this.url + "/_vti_bin/lists.asmx";
      _this.ajax({type:"POST",
                   cache:false,
                   async:true,
                   url:url,
                   data:body,
                   beforeSend: function(xhr) { xhr.setRequestHeader('SOAPAction', 'http://schemas.microsoft.com/sharepoint/soap/UpdateListItems'); },
                   contentType: "text/xml; charset=utf-8",
                   dataType: "xml",
                   success:function(data) {
                     var result = data.getElementsByTagName('Result');
                     var len=result.length;
                     var passed = setup.progressVar.passed, failed = setup.progressVar.failed;
                     var rows;
                     for (var i=0; i < len; i++) {
                       rows=result[i].getElementsByTagName('z:row');
                       if (rows.length==0) rows=data.getElementsByTagName('row'); // for Chrome
                       var item = myElem(rows[0]);
                       if (result[i].getElementsByTagName('ErrorCode')[0].firstChild.nodeValue == "0x00000000") // success
                         passed.push(item);
                       else {
                         items[i].errorMessage = result[i].getElementsByTagName('ErrorText')[0].firstChild.nodeValue;
                         failed.push(items[i]);
                       }
                     }
                     
                     setup.progress(setup.progressVar.current,setup.progressVar.max);
                     // check if we have some other packets that are waiting to be treated
                     if (setup.progressVar.current < setup.progressVar.max) {
                       if (_SP_MODERATE_PROGRESSVAR[setup.progressVar.eventID]) {
                         _SP_MODERATE_PROGRESSVAR[setup.progressVar.eventID](setup);
                       }
                     }
                     else {
                       if (passed.length>0) setup.success.call(_this,passed);
                       if (failed.length>0) setup.error.call(_this,failed);
                       setup.after.call(_this);
                       if (_SP_MODERATE_PROGRESSVAR[setup.progressVar.eventID]) delete _SP_MODERATE_PROGRESSVAR[setup.progressVar.eventID];
                     }
                   }
                 });
      return this;
    },
    /**
      @name $SP().list.remove
      @function
      @description Delete items from a Sharepoint List
      @note You can also use the key word 'del' instead of 'remove'
      
      @param {Objet|Array} itemsID List of items ID (e.g. [{ID:1}, {ID:22}]) | ATTENTION if you want to delete a file you have to add the "FileRef" e.g. {ID:2,FileRef:"path/to/the/file.ext"}
      @param {Object} [setup] Options (see below)
        @param {Function} [setup.progress] Two parameters: 'current' and 'max' -- If you provide more than 15 ID then they will be treated by packets and you can use "progress" to know more about the steps
        @param {Function} [setup.success] One parameter: 'passedItems' -- a function with the items updated sucessfully
        @param {Function} [setup.error] (One parameter: 'failedItems' -- a function with the items not updated
        @param {Function} [setup.after] A function that will be executed at the end of the request
      
      @example
      $SP().list("My List").remove({ID:1}); // you must always provide the ID
      
      // we can use the WHERE clause instead providing the ID
      $SP().list("My List").remove({where:"Title = 'OK'",progress:function(current,max) {
        console.log(current+"/"+max);
      }});
      
      // delete several items
      $SP().list("List Name", "http://my.sharepoint.com/sub/dir/").remove([{ID:5}, {ID:7}]);
           
      // example about how to use the "error" callback
      $SP().list("List").remove({ID:43, Title:"My title"}, {error:function(items) {
        for (var i=0; i &lt; items.length; i++) console.log("Error with:"+items[i].ID+" ("+items[i].errorMessage+")"); // only .ID and .errorMessage are available
      }});

      // example for deleting a file
      $SP().list("My Shared Documents").remove({ID:4,FileRef:"my/directory/My Shared Documents/something.xls"});
    */
    remove:function(items, setup) {
      // check if we need to queue it
      if (this.needQueue) { return this._addInQueue(arguments) }
      var _this=this;      
      // default values
      if (!setup && items.where) { setup=items; items=[]; } // the case when we use the "where"
      setup         = setup || {};
      if (this.url == undefined) throw "Error 'remove': not able to find the URL!"; // we cannot determine the url
      setup.error   = setup.error || (function() {});
      setup.success = setup.success || (function() {});
      setup.after   = setup.after || (function() {});
      setup.progress= setup.progress || (function() {});
           
      if (typeof items === "object" && items.length==undefined) items = [ items ];
      var itemsLength=items.length;
      
      // if there is a WHERE clause
      if (setup.where) {
        // call GET first
        if (itemsLength==1) delete items[0].ID;
        this.get({fields:"ID,FileRef",where:setup.where},function(data) {
          // we need a function to clone the items
          var clone = function(obj){
            var newObj = {};
            for (var k in obj) newObj[k]=obj[k];
            return newObj;
          };
          var aItems=[],fileRef;
          for (var i=data.length;i--;) {
            var it=clone(items[0]);
            it.ID=data[i].getAttribute("ID");
            fileRef=data[i].getAttribute("FileRef");
            if (fileRef) it.FileRef=$SP().cleanResult(fileRef);
            aItems.push(it);
          }
          // now call again the REMOVE
          delete setup.where;
          _this.remove(aItems,setup);
        });
        return _this;
      } else if (itemsLength == 0) {
        // nothing to delete
        setup.progress(1,1);
        setup.error.call(_this,[]);
        setup.success.call(_this,[]);
        setup.after.call(_this)
        return _this;
      }
      
      // define current and max for the progress
      setup.progressVar = setup.progressVar || {current:0,max:itemsLength,passed:[],failed:[],eventID:"spRemove"+(""+Math.random()).slice(2)};
      // we cannot add more than 15 items in the same time, so split by 15 elements
      // and also to avoid surcharging the server
      if (itemsLength > 15) {
        var nextPacket=items.slice(0);
        var cutted=nextPacket.splice(0,15);
        _SP_REMOVE_PROGRESSVAR[setup.progressVar.eventID] = function(setup) {
          _this.remove(nextPacket,setup);
        };
        _this.remove(cutted,setup);
        return _this;
      }
      // increment the progress
      setup.progressVar.current += itemsLength;

      // build a part of the request
      var updates = '<Batch OnError="Continue" ListVersion="1"  ViewName="">';
      for (var i=0; i < items.length; i++) {
        updates += '<Method ID="'+(i+1)+'" Cmd="Delete">';
        if (items[i].ID == undefined) throw "Error 'delete': you have to provide the item ID called 'ID'";
        updates += "<Field Name='ID'>"+items[i].ID+"</Field>";
        if (items[i].FileRef != undefined) updates += "<Field Name='FileRef'>"+items[i].FileRef+"</Field>";
        updates += '</Method>';
      }
      updates += '</Batch>';
      
      // build the request
      var body = _this._buildBodyForSOAP("UpdateListItems", "<listName>"+_this.listID+"</listName><updates>" + updates + "</updates>");
      // send the request
      var url = _this.url + "/_vti_bin/lists.asmx";
      _this.ajax({type:"POST",
                   cache:false,
                   async:true,
                   url:url,
                   data:body,
                   beforeSend: function(xhr) { xhr.setRequestHeader('SOAPAction', 'http://schemas.microsoft.com/sharepoint/soap/UpdateListItems'); },
                   contentType: "text/xml; charset=utf-8",
                   dataType: "xml",
                   success:function(data) {
                     var result = data.getElementsByTagName('Result');
                     var len=result.length;
                     var passed = setup.progressVar.passed, failed = setup.progressVar.failed;
                     for (var i=0; i < len; i++) {
                       if (result[i].getElementsByTagName('ErrorCode')[0].firstChild.nodeValue == "0x00000000") // success
                         passed.push(items[i]);
                       else {
                         items[i].errorMessage = result[i].getElementsByTagName('ErrorText')[0].firstChild.nodeValue;
                         failed.push(items[i]);
                       }
                     }
                     
                     setup.progress(setup.progressVar.current,setup.progressVar.max);
                     // check if we have some other packets that are waiting to be treated
                     if (setup.progressVar.current < setup.progressVar.max) {
                       if (_SP_REMOVE_PROGRESSVAR[setup.progressVar.eventID]) {
                         _SP_REMOVE_PROGRESSVAR[setup.progressVar.eventID](setup);
                       }
                     } else {
                      if (failed.length>0) setup.error.call(_this,failed);
                      if (passed.length>0) setup.success.call(_this,passed);
                      setup.after.call(_this);
                       if (_SP_REMOVE_PROGRESSVAR[setup.progressVar.eventID]) delete _SP_REMOVE_PROGRESSVAR[setup.progressVar.eventID];
                     }
                   }
                 });
      return this;
    },
    del:function(items, setup) { return this.remove(items,setup) },
    /**
      @name $SP().usergroups
      @function
      @description Find the Sharepoint groups where the specified user is member of
      
      @param {String} username The username with the domain (don't forget to use a double \ like "mydomain\\john_doe")
      @param {Object} [setup] Options (see below)
        @param {String} [setup.url='current website'] The website url
        @param {Boolean} [setup.error=true] The function will stop and throw an error when something went wrong (use FALSE to don't throw an error)
        @param {Boolean} [setup.cache=true] Keep a cache of the result
      @param {Function} [result] A function that will be executed at the end of the request with a param that is an array with the result
      
      @example
      $SP().usergroups("mydomain\\john_doe",{url:"http://my.si.te/subdir/"}, function(groups) {
        for (var i=0; i &lt; groups.length; i++) console.log(groups[i]); // -> "Roadmap Admin", "Global Viewers", ...
      });
    */
    usergroups:function(username, setup, fct) {
      switch (arguments.length) {
          case 1: if (typeof username === "object") return this.usergroups("",username,function(){});
                  else if (typeof username === "function") return this.usergroups("",{},username);
                  break;
          case 2: if (typeof username === "string" && typeof setup === "function") return this.usergroups(username,{},setup);
                  if (typeof username === "object" && typeof setup === "function") return this.usergroups("",username,setup);
      }
      
      // default values
      setup         = setup || {};
      setup.cache = (setup.cache === false ? false : true);
      if (setup.url == undefined) {
        if (!this.url) { this._getURL(); return this._addInQueue(arguments) }
        else setup.url=this.url;
      } else this.url=setup.url;
      fct           = fct || (function() {});
      if (!username) throw "Error 'usergroups': you have to set an username.";
      
      username=username.toLowerCase();
      setup.url=setup.url.toLowerCase();
      // check the cache
      // [ {user:"username", url:"url", data:"the groups"}, ... ]
      var cache=_SP_CACHE_USERGROUPS || [];
      if (setup.cache) {
        for (var i=cache.length; i--;) {
          if (cache[i].user.toLowerCase() == username && cache[i].url.toLowerCase() == setup.url) {
            fct.call(this,cache[i].data);
            return this
          }
        }
      }
      
      var _this=this;
      
      // build the request
      var body = _this._buildBodyForSOAP("GetGroupCollectionFromUser", "<userLoginName>"+username+"</userLoginName>", "http://schemas.microsoft.com/sharepoint/soap/directory/")
      // send the request
      var url = setup.url + "/_vti_bin/usergroup.asmx";
      _this.ajax({type:"POST",
                   cache:false,
                   url:url,
                   data:body,
                   beforeSend: function(xhr) { xhr.setRequestHeader('SOAPAction', 'http://schemas.microsoft.com/sharepoint/soap/directory/GetGroupCollectionFromUser'); },
                   contentType: "text/xml; charset=utf-8",
                   dataType: "xml",
                   success:function(data) {
                     var aResult=[];
                     // get the details
                     data=data.getElementsByTagName('Group');
                     for (var i=0,len=data.length; i<len; i++)
                       aResult.push(data[i].getAttribute("Name"));
                     // cache the result
                     cache.push({user:username,url:setup.url,data:aResult});
                     _SP_CACHE_USERGROUPS = cache;
                     fct.call(_this,aResult);
                   },
                   error:function(req, textStatus, errorThrown) {
                     if (setup.error===false) fct.call(_this,[]);
                     else {
                       // any error ?
                       var error=req.responseXML.getElementsByTagName("errorstring");
                       if (typeof console === "object") console.error("Error 'usergroups': "+error[0].firstChild.nodeValue);
                      }
                   }
                 });
      return this;
    },
    /**
      @name $SP().workflowStatusToText
      @function
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
      @description Find the WorkflowID for a workflow, and some other data (fileRef, description, instances, ...)
      
      @param {Object} setup
        @param {Number} setup.ID The item ID that is tied to the workflow
        @param {String} setup.workflowName The name of the workflow
        @param {Function} setup.after The callback function that is called after the request is done (the parameter is {workflowID:"the workflowID", fileRef:"the fileRef"})
      
      @example
      $SP().list("List Name").getWorkflowID({ID:15, workflowName:"Workflow for List Name (manual)", after:function(params) {
        alert("Workflow ID:"+params.workflowID+" and the FileRef is: "+params.fileRef);
      }});
     */
    getWorkflowID:function(setup) {
      // check if we need to queue it
      if (this.needQueue) { return this._addInQueue(arguments) }
      if (this.listID == undefined) throw "Error 'getWorkflowID': you have to define the list ID/Name";
      if (this.url == undefined) throw "Error 'getWorkflowID': not able to find the URL!"; // we cannot determine the url
      setup = setup || {};
      if (setup.ID==undefined || setup.workflowName==undefined || setup.after==undefined) throw "Error 'getWorkflowID': all parameters are mandatory";

      // find the fileRef
      this.get({fields:"FieldRef",where:"ID = "+setup.ID}, function(d) {
              if (d.length===0) throw "Error 'getWorkflowID': I'm not able to find the item ID "+setup.ID;

              var fileRef = this.cleanResult(d[0].getAttribute("FileRef"));
              var c=fileRef.substring(0,fileRef.indexOf("/Lists"))
              var d=this.url.substring(0,this.url.indexOf(c));
              fileRef = d+fileRef;
              var _this=this;
              var body = _this._buildBodyForSOAP("GetWorkflowDataForItem", '<item>'+fileRef+'</item>', "http://schemas.microsoft.com/sharepoint/soap/workflow/");
              _this.ajax({
                type: "POST",
                cache: false,
                async: true,
                url: this.url+"/_vti_bin/Workflow.asmx",
                data: body,
                beforeSend: function(xhr) { xhr.setRequestHeader('SOAPAction', 'http://schemas.microsoft.com/sharepoint/soap/workflow/GetWorkflowDataForItem'); },
                contentType: "text/xml; charset=utf-8",
                dataType: "xml",
                success:function(data) {
                  // we want to use myElem to change the getAttribute function
                  var res={},i,row;
                  var rows=data.getElementsByTagName('WorkflowTemplate');
                  if (rows.length===0) {
                    // depending of the permissions, we couldn't have the WorkflowTemplate data
                    // in that case we have to get the workflow ID with another way
                      var context = SP.ClientContext.get_current();
                      var lists = context.get_web().get_lists();
                      var list = lists.getByTitle(_this.listID);
                      var item = list.getItemById(setup.ID);
                      var file = item.get_file();
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
                        setup.after.call(_this, res);
                      },
                      function() {
                        throw "Error 'getWorkflowID': Problem while dealing with SP.ClientContext.get_current()";
                      });
                  } else {
                    for (i=rows.length; i--;) {
                      if (rows[i].getAttribute("Name") == setup.workflowName) {
                        res = {
                          "fileRef":fileRef,
                          "description":rows[i].getAttribute("Description"),
                          "workflowID":"{"+rows[i].getElementsByTagName('WorkflowTemplateIdSet')[0].getAttribute("TemplateId")+"}",
                          "instances":[]
                        };
                      }
                    }
                    if (!res.fileRef) {
                      throw "Error 'getWorkflowID': it seems the requested workflow ('"+setup.workflowName+"') doesn't exist!";
                    }
                    rows=data.getElementsByTagName("Workflow");
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
                    setup.after.call(_this, res);
                  }
                  return _this
                },
                error:function(jqXHR, textStatus, errorThrown) {
                  throw "Error 'getWorkflowID': Something went wrong with the request over the Workflow Web Service..."
                }
              });
      })
      return this;
    },
    /**
      @name $SP().list.startWorkflow
      @function
      @description Manually start a work (that has been set to be manually started) (-untested with Sharepoint 2007-)
      
      @param {Object} setup
        @param {Number} setup.ID The item ID that tied to the workflow
        @param {String} setup.workflowName The name of the workflow
        @param {Array|Object} [setup.parameters] An array of object with {name:"Name of the parameter", value:"Value of the parameter"}
        @param {Function} [setup.after] This callback function that is called after the request is done
        @param {String} [setup.fileRef] Optional: you can provide the fileRef to avoid calling the $SP().list().getWorkflowID()
        @param {String} [setup.workflowID] Optional: you can provide the workflowID to avoid calling the $SP().list().getWorkflowID()
      
      @example
      $SP().list("List Name").startWorkflow({ID:15, workflowName:"Workflow for List Name (manual)", parameters:{name:"Message",value:"Welcome here!"}, after:function(error) {
        if (!error)
          alert("Workflow done!");
        else 
          alert("Error: "+error);
      }});
    **/
    startWorkflow:function(setup) {
      // check if we need to queue it
      if (this.needQueue) { return this._addInQueue(arguments) }
      if (this.listID == undefined) throw "Error 'startWorkflow': you have to define the list ID/Name";
      if (this.url == undefined) throw "Error 'startWorkflow': not able to find the URL!";
      
      setup = setup || {};
      setup.after = setup.after || (function() {});
      if (!setup.workflowName && !setup.workflowID) throw "Error 'startWorkflow': Please provide the workflow name!"
      if (!setup.ID) throw "Error 'startWorkflow': Please provide the item ID!"

      // find the FileRef and templateID
      if (!setup.fileRef && !setup.workflowID) {
        this.getWorkflowID({ID:setup.ID,workflowName:setup.workflowName,
          after:function(params) {
            setup.fileRef=params.fileRef;
            setup.workflowID=params.workflowID;
            this.startWorkflow(setup)
          }
        })
      } else {
        // define the parameters if any
        var workflowParameters = "<root />";
        if (setup.parameters) {
          var p;
          if (setup.parameters.length == undefined) setup.parameters = [ setup.parameters ];
          p = setup.parameters.slice(0);
          workflowParameters = "<Data>";
          for (var i=0; i<p.length; i++)
          workflowParameters += "<"+p[i].name+">"+p[i].value+"</"+p[i].name+">";
          workflowParameters += "</Data>";
        }
        
        var _this=this;
        
        var body = _this._buildBodyForSOAP("StartWorkflow", "<item>"+setup.fileRef+"</item><templateId>"+setup.workflowID+"</templateId><workflowParameters>"+workflowParameters+"</workflowParameters>", "http://schemas.microsoft.com/sharepoint/soap/workflow/");
        // do the request
        var url = this.url + "/_vti_bin/Workflow.asmx";
        _this.ajax({
          type: "POST",
          cache: false,
          async: true,
          url: url,
          data: body,
          beforeSend: function(xhr) { xhr.setRequestHeader('SOAPAction', 'http://schemas.microsoft.com/sharepoint/soap/workflow/StartWorkflow'); },
          contentType: "text/xml; charset=utf-8",
          dataType: "xml",
          success:function(data) {
            setup.after.call(_this)
          },
          error:function(jqXHR, textStatus, errorThrown) {
            setup.after.call(_this, errorThrown)
          }
        });
      }
      return this;
    },
    /**
      @name $SP().distributionLists
      @function
      @description Find the distribution lists where the specified user is member of
      
      @param {String} username The username with or without the domain (don't forget to use a double \ like "mydomain\\john_doe")
      @param {Object} [setup] Options (see below)
        @param {String} [setup.url='current website'] The website url
        @param {Boolean} [setup.cache=true] Cache the response from the server
      @param {Function} [result] A function that will be executed at the end of the request with a param that is an array with the result
      
      @example
      $SP().distributionLists("mydomain\\john_doe",{url:"http://my.si.te/subdir/"}, function(mailing) {
        for (var i=0; i &lt; mailing.length; i++) console.log(mailing[i]); // -> {SourceReference: "cn=listname,ou=distribution lists,ou=rainbow,dc=com", DisplayName:"listname", MailNickname:"List Name", Url:"mailto:listname@rainbow.com"}
      });
    */
    distributionLists:function(username, setup, fct) {
      switch (arguments.length) {
          case 1: if (typeof username === "object") return this.distributionLists("",username,function(){});
                  else if (typeof username === "function") return this.distributionLists("",{},username);
                  break;
          case 2: if (typeof username === "string" && typeof setup === "function") return this.distributionLists(username,{},setup);
                  if (typeof username === "object" && typeof setup === "function") return this.distributionLists("",username,setup);
      }
      
      // default values
      setup         = setup || {};
      if (setup.url == undefined) {
        if (!this.url) { this._getURL(); return this._addInQueue(arguments) }
        else setup.url=this.url;
      } else this.url=setup.url;
      fct           = fct || (function() {});
      if (!username) throw "Error 'distributionLists': you have to set an username.";
      
      username = username.toLowerCase();
      setup.url=setup.url.toLowerCase();
      setup.cache = (setup.cache === false ? false : true)
      // check the cache
      // [ {user:"username", url:"url", data:"the distribution lists"}, ... ]
      var cache=_SP_CACHE_DISTRIBUTIONLISTS || [];
      if (setup.cache) {
        for (var i=cache.length; i--;) {
          if (cache[i].user === username && cache[i].url === setup.url) {
            fct.call(this,cache[i].data);
            return this
          }
        }
      }

      var _this=this;
      
      // build the request
      var body = _this._buildBodyForSOAP("GetCommonMemberships", "<accountName>"+username+"</accountName>", "http://microsoft.com/webservices/SharePointPortalServer/UserProfileService");
               
      // send the request
      var url = setup.url + "/_vti_bin/UserProfileService.asmx";
      _this.ajax({type:"POST",
                   cache:false,
                   url:url,
                   data:body,
                   beforeSend: function(xhr) { xhr.setRequestHeader('SOAPAction', 'http://microsoft.com/webservices/SharePointPortalServer/UserProfileService/GetUserMemberships') },
                   contentType: "text/xml; charset=utf-8",
                   dataType: "xml",
                   success:function(data) {
                     var aResult=[];
                     // get the details
                     data=data.getElementsByTagName('MembershipData');
                     for (var i=0,len=data.length; i<len; i++) {
                       if (data[i].getElementsByTagName("Source")[0].firstChild.nodeValue === "DistributionList")
                         aResult.push({"SourceReference": data[i].getElementsByTagName("SourceReference")[0].firstChild.nodeValue, "DisplayName":data[i].getElementsByTagName("DisplayName")[0].firstChild.nodeValue, "MailNickname":data[i].getElementsByTagName("MailNickname")[0].firstChild.nodeValue, "Url":data[i].getElementsByTagName("Url")[0].firstChild.nodeValue});
                     }
                     // cache the result
                     cache.push({user:username,url:setup.url,data:aResult});
                     _SP_CACHE_DISTRIBUTIONLISTS = cache;
                     fct.call(_this,aResult);
                   },
                   error:function(req, textStatus, errorThrown) {
                     fct.call(_this,[]);
                     // any error ?
                     //var error=req.responseXML.getElementsByTagName("errorstring");
                     //if (typeof console === "object") console.error("Error 'distributionLists': "+error[0].firstChild.nodeValue);
                   }
                 });
      return this;
    },
    /**
      @name $SP().groupMembers
      @function
      @description Find the members of a Sharepoint group
      
      @param {String} groupname Name of the group
      @param {Object} [setup] Options (see below)
        @param {String} [setup.url='current website'] The website url
        @param {Boolean} [setup.error=true] The function will stop and throw an error when something went wrong (use FALSE to don't throw an error)
        @param {Boolean} [setup.cache=true] By default the function will cache the group members (so if you call several times it will use the cache)
      @param {Function} [result] A function that will be executed at the end of the request with a param that is an array with the result
      
      @example
      $SP().groupMembers("my group", function(members) {
        for (var i=0; i &lt; members.length; i++) console.log(members[i]); // -> {ID:"1234", Name:"Doe, John", LoginName:"mydomain\john_doe", Email:"john_doe@rainbow.com"}
      });
    */
    groupMembers:function(groupname, setup, fct) {
      switch (arguments.length) {
          case 1: if (typeof groupname === "object") return this.groupMembers("",groupname,function(){});
                  else if (typeof groupname === "function") return this.groupMembers("",{},groupname);
                  break;
          case 2: if (typeof groupname === "string" && typeof setup === "function") return this.groupMembers(groupname,{},setup);
                  if (typeof groupname === "object" && typeof setup === "function") return this.groupMembers("",groupname,setup);
      }
      
      // default values
      setup         = setup || {};
      setup.cache = (setup.cache === undefined ? true : setup.cache);
      if (setup.url == undefined) {
        if (!this.url) { this._getURL(); return this._addInQueue(arguments) }
        else setup.url=this.url;
      } else this.url=setup.url;
      fct           = fct || (function() {});
      if (!groupname) throw "Error 'groupMembers': you have to set an groupname.";
      
      groupname=groupname.toLowerCase();
      setup.url=setup.url.toLowerCase();
      // check the cache
      // [ {user:"username", url:"url", data:"the distribution lists"}, ... ]
      var cache=[];
      if (setup.cache) {
        cache=_SP_CACHE_GROUPMEMBERS || [];
        for (var i=cache.length; i--;) {
          if (cache[i].group === groupname && cache[i].url === setup.url) {
            fct.call(this,cache[i].data);
            return this
          }
        }
      }

      var _this=this;
      
      // build the request
      var body = _this._buildBodyForSOAP("GetUserCollectionFromGroup", "<groupName>"+this._cleanString(groupname)+"</groupName>", "http://schemas.microsoft.com/sharepoint/soap/directory/");
      // send the request
      var url = setup.url + "/_vti_bin/usergroup.asmx";
      _this.ajax({type:"POST",
                   cache:false,
                   url:url,
                   data:body,
                   beforeSend: function(xhr) { xhr.setRequestHeader('SOAPAction', 'http://schemas.microsoft.com/sharepoint/soap/directory/GetUserCollectionFromGroup') },
                   contentType: "text/xml; charset=utf-8",
                   dataType: "xml",
                   success:function(data) {
                     var aResult=[];
                     // get the details
                     data=data.getElementsByTagName('User');
                     for (var i=0,len=data.length; i<len; i++)
                       aResult.push({"ID": data[i].getAttribute("ID"), "Name":data[i].getAttribute("Name"), "LoginName":data[i].getAttribute("LoginName"), "Email":data[i].getAttribute("Email")});
                     // cache the result
                     cache.push({group:groupname,url:setup.url,data:aResult});
                     _SP_CACHE_GROUPMEMBERS = cache;
                     fct.call(_this,aResult);
                   },
                   error:function(req, textStatus, errorThrown) {
                     if (setup.error===false) fct.call(_this,[]);
                     else {
                       // any error ?
                       var error=req.responseXML.getElementsByTagName("errorstring");
                       if (typeof console === "object") console.error("Error 'groupMembers': "+error[0].firstChild.nodeValue);
                      }
                   }
               });
      return this;
    },
    /**
      @name $SP().isMember
      @function
      @description Find if the user is member of the Sharepoint group
      
      @param {Object} [setup] Options (see below)
        @param {String} setup.user Username with domain ("domain\\login" for Sharepoint 2010, or "i:0#.w|domain\\login" for Sharepoint 2013)
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
      @description Find the user details like manager, email, colleagues, ...
      
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
      switch (arguments.length) {
          case 1: if (typeof username === "object") return this.people("",username,function(){});
                  else if (typeof username === "function") return this.people("",{},username);
                  username=undefined;
                  break;
          case 2: if (typeof username === "string" && typeof setup === "function") return this.people(username,{},setup);
                  if (typeof username === "object" && typeof setup === "function") return this.people("",username,setup);
      }
      
      // default values
      setup         = setup || {};
      if (setup.url == undefined) {
        if (!this.url) { this._getURL(); return this._addInQueue(arguments) }
        else setup.url=this.url;
      } else this.url=setup.url;
      fct           = fct || (function() {});
      username      = username || "";

      var _this=this;
            
      // build the request
      var body = _this._buildBodyForSOAP("GetUserProfileByName", "<AccountName>"+username+"</AccountName>", "http://microsoft.com/webservices/SharePointPortalServer/UserProfileService");
      // send the request
      var url = setup.url + "/_vti_bin/UserProfileService.asmx";
      _this.ajax({type:"POST",
                   cache:false,
                   url:url,
                   data:body,
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
                   error:function(req, textStatus, errorThrown) {
                     // any error ?
                     var error=req.responseXML.getElementsByTagName("faultstring");
                     fct.call(_this,"Error 'people': "+error[0].firstChild.nodeValue);
                   }
                 });
      return this;
    },
    /**
      @name $SP().getUserInfo
      @function
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
      if (typeof username !== "string") throw "Error 'getUserInfo': the first argument must be the username";
      switch (arguments.length) {
          case 2: if (typeof setup === "function") return this.getUserInfo(username,{},setup);
                  if (typeof setup === "object") return this.getUserInfo(username,setup,function() {});
                  break;
          case 3: if (typeof setup !== "object" && typeof fct !== "function") throw "Error 'getUserInfo': incorrect arguments, please review the documentation";
      }
      
      // default values
      setup = setup || {};
      if (setup.url == undefined) {
        if (!this.url) { this._getURL(); return this._addInQueue(arguments) }
        else setup.url=this.url;
      } else this.url=setup.url;
      fct = fct || (function() {});

      var _this=this;
            
      // build the request
      var body = _this._buildBodyForSOAP("GetUserInfo", '<userLoginName>'+username+'</userLoginName>', "http://schemas.microsoft.com/sharepoint/soap/directory/");
      // send the request
      var url = setup.url + "/_vti_bin/usergroup.asmx";
      _this.ajax({type:"POST",
                   cache:false,
                   url:url,
                   data:body,
                   contentType: "text/xml; charset=utf-8",
                   dataType: "xml",
                   success:function(data) {
                     var aResult=[];
                     // get the details
                     data=data.getElementsByTagName('User');
                     if (data.length===0)
                      fct.call(_this,"Error 'getUserInfo': nothing returned?!")
                     else 
                      fct.call(_this,{ID:data[0].getAttribute("ID"),Sid:data[0].getAttribute("Sid"),Name:data[0].getAttribute("Name"),LoginName:data[0].getAttribute("LoginName"),Email:data[0].getAttribute("Email"),Notes:data[0].getAttribute("Notes"),IsSiteAdmin:data[0].getAttribute("IsSiteAdmin"),IsDomainGroup:data[0].getAttribute("IsDomainGroup"),Flags:data[0].getAttribute("Flags")})
                   },
                   error:function(req, textStatus, errorThrown) {
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
      // find the base URL
      if (!this.url) { this._getURL(); return this._addInQueue(arguments) }
      if (typeof callback !== "function") callback = function() {};
      var _this = this;

      // check cache
      if (_SP_CACHE_REGIONALSETTINGS) callback.call(_this, _SP_CACHE_REGIONALSETTINGS);

      $SP().ajax({
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
      @description Provide the Date Format based on the user regional settings (YYYY for 4-digits Year, YY for 2-digits day, MM for 2-digits Month, M for 1-digit Month, DD for 2-digits day, DD for 1-digit day) -- it's using the DatePicker iFrame (so an AJAX request)
      
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
     */
    regionalDateFormat:function(callback) {
      // find the base URL
      if (!this.url) { this._getURL(); return this._addInQueue(arguments) }
      if (typeof callback !== "function") callback = function() {};
      var _this = this;

      // check cache
      if (_SP_CACHE_DATEFORMAT) callback.call(_this, _SP_CACHE_DATEFORMAT);

      // check if we have LCID
      var lcid = "";
      if (typeof _spRegionalSettings !== "undefined") lcid=_spRegionalSettings.localeId;
      else if (_SP_CACHE_REGIONALSETTINGS) lcid=_SP_CACHE_REGIONALSETTINGS.lcid;
      if (!lcid) {
        return _this.regionalSettings(function() {
          _this.regionalDateFormat(callback);
        })
      }
      
      $SP().ajax({
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
      switch (arguments.length) {
          case 1: if (typeof username === "object") return this.addressbook("",username,function(){});
                  else if (typeof username === "function") return this.addressbook("",{},username);
                  else if (typeof username === "string")  return this.addressbook(username,{},function(){});
                  username=undefined;
                  break;
          case 2: if (typeof username === "string" && typeof setup === "function") return this.addressbook(username,{},setup);
                  if (typeof username === "object" && typeof setup === "function") return this.addressbook("",username,setup);
      }
      
      // default values
      setup         = setup || {};
      if (setup.url == undefined) {
        if (!this.url) { this._getURL(); return this._addInQueue(arguments) }
        else setup.url=this.url;
      } else this.url=setup.url;
      setup.limit   = setup.limit || 10;
      setup.type    = setup.type || "User";
      fct           = fct || (function() {});
      username      = username || "";

      var _this=this;
            
      // build the request
      var body = _this._buildBodyForSOAP("SearchPrincipals", "<searchText>"+username+"</searchText><maxResults>"+setup.limit+"</maxResults><principalType>"+setup.type+"</principalType>");
      // send the request
      var url = setup.url + "/_vti_bin/People.asmx";
      _this.ajax({type: "POST",
                   cache:false,
                   url:url,
                   data:body,
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
      return this;
    },
    reset:function() {
      this.data   = [];
      this.length = 0;
      this.listID = "";
      this.needQueue=false;
      this.listQueue=[];
      delete this.url;
    },
    /**
      @name $SP().toDate
      @function
      @description Change a Sharepoint date (as a string) to a Date Object
      @param {String} textDate the Sharepoint date string
      @param {Boolean} [forceUTC=false] Permits to force the reading of the date in UTC
      @return {Date} the equivalent Date object for the Sharepoint date string passed
      @example $SP().toDate("2012-10-31T00:00:00").getFullYear(); // 2012
    */
    toDate:function(strDate, forceUTC) {
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
      @description Split the ID and Value
      @param {String} text The string to retrieve data
      @return {Object} .id returns the ID, and .value returns the value
      @example $SP().getLookup("328;#Foo"); // --> {id:328, value:"Foo"}
    */
    getLookup:function(str) { if (!str) { return {id:"", value:""} } var a=str.split(";#"); return {id:a[0], value:a[1]}; },
    /**
      @name $SP().toXSLString
      @function
      @description Change a string into a XSL format string
      @param {String} text The string to change
      @return {String} the XSL version of the string passed
      @example $SP().toXSLString("Big Title"); // --> "Big_x0020_Title"
    */
    toXSLString:function(str) {
      if (typeof str !== "string") throw "Error 'toXLSString': '"+str+"' is not a string....";
      // if the first car is a number, then FullEscape it
      var FullEscape = function(strg, exceptNumeric) {
          exceptNumeric = exceptNumeric || false;
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
          while (curNode = iterator.nextNode()) {
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
      for (var a=document.querySelectorAll('td.ms-formbody'), i=-1, len=a.length, done=0; i<len && done<limit; i++) { // we start at -1 because of Content Type
        var tr, td, isMandatory=false, html /* HTML content of the NOBR tag */, txt /* Text content of the NOBR tag */, infoFromComments, includeThisField=false;
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
            _isMandatory: isMandatory,
            _description: "", /* the field's description */
            _elements: [], /* the HTML elements related to that field */
            _tr: null, /* the TR parent node */
            _type: null /* the type of this field: checkbox, boolean */
          };
          
          if (fieldName === "Content Type") { // the Content Type field is different !
            obj._elements = document.querySelector('.ms-formbody select[title="Content Type"]');
            obj._type = "content type";
            obj._tr = tr;
          } else 
            obj._tr = tr;
          
          obj.val    = function() {};
          obj.elem   = function(usejQuery) {
            usejQuery = (usejQuery === false ? false : true);
            var aReturn = this._elements;
            var hasJQuery=(typeof jQuery === "function" && usejQuery === true);

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
                var v=[];
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
                      else return e.innerHTML.replace(/^<div class="?ExternalClass[0-9A-Z]+"?>([\s\S]*)<\/div>$/i,"$1").replace(/<span (rtenodeid="1" )?id="?ms-rterangecursor-start"?><\/span><span (rtenodeid="3" )?id="?ms-rterangecursor-end"?([^>]+)?><\/span>/gi,"").replace(/^<p>​<\/p>$/,"");
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
                        return GetPickerControlValue(id, false, true).trim();
                      } else {
                        v = GetPickerControlValue(id, false, false);
                        // we try to extract data from there
                        tmp = document.createElement('div');
                        tmp.innerHTML = v;
                        v = tmp.querySelector('#divEntityData');
                        return (v ? {"Key":v.getAttribute("key"), "DisplayText":v.getAttribute("DisplayText")} : {"Key":"", "DisplayText":GetPickerControlValue(id, false, true).trim()})
                      }
                    } else { // SP2013
                      if (typeof SPClientPeoplePicker === "function") {
                        tmp = SPClientPeoplePicker.SPClientPeoplePickerDict[id];
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
                      EntityEditorCallback(tmp, id, false);
                      v=getUplevel(id);
                      // check the value passed
                      WebForm_DoCallback(id.replace(/(ctl\d+)(\_)/g,"$1\$").replace(/(^ctl\d+\$m)(\_)/,"$1\$").replace(/\_ctl/,"\$ctl"),v,EntityEditorHandleCheckNameResult,id,EntityEditorHandleCheckNameError,true);
                    } else { // SP2013
                      if (typeof SPClientPeoplePicker === "function") {
                        res = SPClientPeoplePicker.SPClientPeoplePickerDict[id];
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
                    
                  var e = this.elem(false), val=[], o;
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
                        GipRemoveSelectedItems(masterGroup)
                      }
                      setSelectedOption(e[0], "", "none");
                      // then we want to select in the same order
                      for (o=0; o<v.length; o++) {
                        // select what we want in the first box
                        setSelectedOption(e[0], v[o], params);
                        // click the button
                        if (clickAdd) eval("!function() {"+clickAdd+"}()");
                        else if (typeof GipAddSelectedItems === "function") {
                          GipAddSelectedItems(masterGroup)
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
      $SP().formfields("List of options").elem(); / -> returns a HTML SELECT 
      
    */
    elem:function(usejQuery) {
      usejQuery = (usejQuery === false ? false : true);
      var aReturn = [];
      var hasJQuery=(typeof jQuery === "function" && usejQuery === true);
      this.each(function() {
        var e = this.elem(false);
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
      $SP().formfields("Title").name(); // return "Title"
      $SP().formfields(["Field1", "Field2"]).name(); // return [ "Field1", "Field2" ]
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
      @name $SP().notify
      @function
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
          ExecuteOrDelayUntilScriptLoaded(function() {
            ExecuteOrDelayUntilScriptLoaded(function() {
              _SP_NOTIFY_READY=true;
              $SP().notify("fake",{fake:true});
            }, "core.js")
          }, "sp.js")
        })
        return this
      } else {
        // check if we don't have some notifications in queue first
        if (options.ignoreQueue!==true) {
          while (_SP_NOTIFY_QUEUE.length > 0) {
            var a = _SP_NOTIFY_QUEUE.shift();
            a.options.ignoreQueue=true;
            $SP().notify(a.message, a.options);
          }
        }
        if (options.fake===true) return;

        // for the override options
        if (_SP_NOTIFY.length > 0) {
          if (options.overrideAll)
            $SP().removeNotify({all:true, includeSticky:options.overrideSticky})
          else if (options.override)
            $SP().removeNotify(_SP_NOTIFY[_SP_NOTIFY.length-1].name)
        }
        
        _SP_NOTIFY.push({name:options.name, id:SP.UI.Notify.addNotification(message, true), options:options})
      }

      // setup a timeout
      if (!options.sticky) {
        var _this=this;
        setTimeout(function() {
          $SP().removeNotify(options.name, {timeout:true})
        }, options.timeout*1000)
      }

      return this;
    },
    /**
      @name $SP().removeNotify
      @function
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
        setTimeout(function() { $SP().removeNotify(name, options) }, 150)
        return this;
      }

      var notif,_this=this;
      // if we want to delete all the notifications
      if (options.all === true) {
        var a=[]
        while (_SP_NOTIFY.length > 0) {
          notif = _SP_NOTIFY.shift();
          if (options.includeSticky === false && notif.options.sticky === true) a.push(notif)
          else {
            SP.UI.Notify.removeNotification(notif.id);
            setTimeout(function() { notif.options.after.call(_this, notif.name, false) }, 150)
          }
        }
        _SP_NOTIFY = a.slice(0); // if we want to keep the sticky notifs
      } else if (name !== undefined) {
        // search for the notification
        for (var i=0,len=_SP_NOTIFY.length; i<len; i++) {
          if (_SP_NOTIFY[i].name == name) {
            notif = _SP_NOTIFY.splice(i,1)[0];
            SP.UI.Notify.removeNotification(notif.id);
            setTimeout(function() { notif.options.after.call(_this, notif.name, options.timeout) }, 150)
            return this;
          }
        }
      }
      return this;
    },
    /**
      @name $SP().registerPlugin
      @function
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

  return window.$SP = window.SharepointPlus = SharepointPlus;

})(this,document);