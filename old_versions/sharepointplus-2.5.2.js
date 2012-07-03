/**
 * Created by Aymeric
 * Contact: http://kodono.info
 * Documentation: http://aymkdn.github.com/SharepointPlus/
 * Licence: CC BY-NC-SA 3.0 (http://creativecommons.org/licenses/by-nc-sa/3.0/)
 */
if(!Array.indexOf){
  /**
    @ignore
    @description in IE7- the Array.indexOf doesn't exist!
  */
  Array.prototype.indexOf = function(obj){
	 for(var i=this.length-1; i>-1; i--){
	  if(this[i]==obj) return i;
	 }
   return -1;
  };
}

// Global
_SP_APPROVED=0;
_SP_REJECTED=1;
_SP_PENDING=2;
_SP_DRAFT=3;
_SP_SCHEDULED=4;

(function(window) {
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

  var decode_b64 = function(d,b,c,u,r,q,x){b="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";for(r=q=x='';c=d.charAt(x++);~c&&(u=q%4?u*64+c:c,q++%4)?r+=String.fromCharCode(255&u>>(-2*q&6)):0)c=b.indexOf(c);return r};
  var encode_b64 = function(a,b,c,d,e,f){b="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";c="=";for(d=f='';e&=3,a.charAt(d++)||(b='=',e);f+=b.charAt(63&c>>++e*2))c=c<<8|a.charCodeAt(d-=!e);return f};

  /**
    @name $SP
    @class This is the object uses for all SharepointPlus related actions
   */
  var SharepointPlus = {
    data:[],
    length:0,
    /**
      @name $SP.list
      @namespace
      @description Permits to define the list ID
      
      @param {String} The list ID
    */
    list: function( list ) {
      this.reset();
      this.listID = list;
      return this;
    },
    /**
      @name $SP.parse
      @function
      @description Use a WHERE sentence to transform it into a CAML Syntax sentence
      
      @param {String} where The WHERE sentence to change
      @example
      $SP.parse('ContentType="My Content Type" OR Description&lt;>null AND Fiscal_x0020_Week >= 43 AND Result_x0020_Date < "2012-02-03"');
      // -> return &lt;And>&lt;Or>&lt;Eq>&lt;FieldRef Name="ContentType" />&lt;Value Type="Text">My Content Type&lt;/Value>&lt;/Eq>&lt;isNotNull>&lt;FieldRef Name="Description" />&lt;/isNotNull>&lt;/Or>&lt;Geq>&lt;FieldRef Name="Fiscal_x0020_Week" />&lt;Value Type="Number">43&lt;/Value>&lt;/Geq>&lt;/And>
    */
    parse:function(q) {
      var queryString = q.replace(/(\s+)?(=|<=|>=|<>|<|>| LIKE | like )(\s+)?/g,"$2").replace(/""|''/g,"Null").replace(/==/g,"="); // remove unnecessary white space & replace ' 
      var factory = [];
      var limitMax = q.length;
      var closeOperator="", closeTag = "", ignoreNextChar=false;
      var lastField = "";
      var parenthesis = {open:0};
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
                      if (charAtI=="'") openedApos=!openedApos;
                      else if (charAtI==")" && !openedApos) parenthesis.open--;
                    }
                    
                    var lastIndex = factory.length-1;
  
                    // concat with the first index
                    if (lastIndex>=0) {
                      if (closeOperator != "") factory[0] = "<"+closeOperator+">"+factory[0];
                      factory[0] += this.parse(queryString.substring(start+1, i));
                      if (closeOperator != "") factory[0] += "</"+closeOperator+">";
                      //delete(factory[lastIndex]);
                      closeOperator = "";
                    } else factory[0] = this.parse(queryString.substring(start+1, i));
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
                    else lastField += letter;
                    break;
          case '"': // look now for the next "
          case "'": var apos = letter;
                    var word = "";
                    while ((letter = queryString.charAt(++i)) != apos && i < limitMax) {
                      if (letter == "\\") letter = queryString.charAt(++i);
                      word+=letter;
                    }
                    lastIndex = factory.length-1;
                    factory[lastIndex] += '<FieldRef Name="'+lastField+'" '+(word=="[Me]"?'LookupId="True" ':'')+'/>';
                    lastField = "";
                    var type = (isNaN(word) ? "Text" : "Number"); // check the type
                    if (/\d{4}-\d\d?-\d\d?((T| )\d{2}:\d{2}:\d{2})?/.test(word) || word == "[Today]") type="DateTime";
                    word = this._cleanString(word);
                    // two special words that are [Today] and [Me]
                    switch(word) {
                      case "[Today]": word = '<Today OffsetDays="0" />'; break;
                      case "[Me]":    word = '<UserID Type="Integer" />'; type = "Integer"; break;
                    }
                    factory[lastIndex] += '<Value Type="'+type+'">'+word+'</Value>';
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
                      factory[lastIndex] += '<FieldRef Name="'+lastField+'" />';
                      lastField = "";
                      factory[lastIndex] += '<Value Type="Number">'+value.replace(/ $/,"")+'</Value>';
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
      @name this._cleanString
      @function
      @description clean a string to remove the bad characters when using AJAX over Sharepoint web services (like <, > and &)
      
      @param {String} string The string to clean
      @note That should be used as an internal function
    */
    _cleanString:function(str) {
      return str.replace(/&(?!amp;|lt;|gt;)/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    },
    /**
      @name $SP.list.get
      @function
      @description Get the content of the list
      
      @param {String} [listID] The list ID
      @param {Object} [setup] Options (see below)
        @param {String}  [setup.fields=""] The fields you want to grab (be sure to add "Attachments" as a field if you want to know the direct link to an attachment)
        @param {String}  [setup.where=""] The query string (like SQL syntax) (you'll need to use double \\ before the inside ' -- see example below)
        @param {String}  [setup.orderby=""] The field used to sort the list result (you can also add "ASC" -default- or "DESC")
        @param {String}  [setup.groupby=""] The field used to group by the list result
        @param {String}  [setup.url='current website'] The website url
        @param {Integer} [setup.rowlimit="0"] You can define the number of rows you want to receive back (0 is infinite)
        @param {Boolean} [setup.forceOWS=false] If you want to force the script to use Lists.asmx instead of dspsts.asmx
      @param {Function} [result] A function with the data from the request as first argument
      
      @example
      $SP.list("{ABCD-1234-XXXX-0000}").get(function(data) {
        for (var i=0; i&lt;data.length; i++) console.log(data[i].getAttribute("Title"));
      });
      
      $SP.get("{ABCD-1234-XXXX-0000}", function(data) {});
      
      $SP.get("{ABCD-1234-XXXX-0000}", {fields: "Title,Organization", orderby: "Title DESC,Test_x0020_Date ASC"}, function(data) {
              for (var i=0; i&lt;data.length; i++) console.log(data[i].getAttribute("Title"));
            });
            
      $SP.list("{ABCD-1234-XXXX-0000}").get({fields:"Title", where:"Fiscal_x0020_Week > 30 AND Fiscal_x0020_Week &lt; 50 AND Name = 'O\\'Sullivan, James'"}).each(function(index, row) {
        console.log(row.getAttribute("Title"));
      });
      
      // also in the query you can use Manager="[Me]" to filter by the current user,
      // or Project_x0020_Date="[Today]" to filter by the current date
      $SP.list("{ABCD-1234-XXXX-0000}").get({fields:"Title", where:"Author = '[Me]'"}).each(function(index, row) {
        console.log(row.getAttribute("Title"));
      });
    */
    get:function(list, setup, fct) {
      switch (arguments.length) {
          case 0: if (this.listID == undefined) throw "Error 'get': you have to define the list ID";
                  break;
          case 1: if (typeof list == "object") return this.get(this.listID, list);
                  else if (typeof list == "function") return this.get(this.listID, {}, list);
          case 2: if (typeof list == "string" && typeof setup == "function") return this.get(list, {}, setup);
                  else if (typeof list=="object" && typeof setup == "function") return this.get(this.listID, list, setup);
          case 3: this.listID=list;
      }
  
      // default values
      setup           = setup || {};
      if (setup.url == undefined && typeof L_Menu_BaseUrl == "undefined") throw "Error 'get': not able to find the URL!"; // we cannot determine the url
      setup.url       = setup.url || (window.location.protocol +"//"+ window.location.host + L_Menu_BaseUrl);
      setup.fields    = setup.fields || "";
      setup.where     = setup.where || "";
      setup.orderby   = setup.orderby || "";
      setup.groupby   = setup.groupby || "";
      setup.rowlimit  = setup.rowlimit || 0;
      
      // if we have [Me]/[Today] in the WHERE, or we want to use the GROUPBY,
      // then we want to use the Lists.asmx service
      // also for Sharepoint 2010
      var useOWS = ( setup.groupby!="" || /\[Me\]|\[Today\]/.test(setup.where) || setup.forceOWS===true || typeof SP=="object");
      
      // what about the fields ?
      this.fields="";
      if (setup.fields == "" || setup.fields == [])
        this.fields = "<AllFields />";
      else {
        if (typeof setup.fields == "string") setup.fields = setup.fields.replace(/ /g, "").split(",");
        if (setup.fields.indexOf("Attachments") != -1) useOWS=true;
        for (var i=0; i<setup.fields.length; i++)
          this.fields += '<Field'+(useOWS?'Ref':'')+' Name="'+setup.fields[i]+'" />';
      }
            
      // what about sorting ?
      var orderby="";
      if (setup.orderby != "") {
        var fieldsDir = setup.orderby.split(",");
        for (i=0; i<fieldsDir.length; i++) {
          var direction = "ASC";
          var splt      = jQuery.trim(fieldsDir[i]).split(" ");
          if (splt.length > 0) {
            if (splt.length==2) direction = splt[1].toUpperCase();
            orderby += ( useOWS ? '<FieldRef Name="'+splt[0]+'" Ascending="'+(direction=="ASC")+'" />' : '<OrderField Name="'+splt[0]+'" Direction="'+direction+'" />' );
          }
        }
      }
      
      // what about groupby ?
      var groupby="";
      if (setup.groupby != "") {
        var gFields = setup.groupby.split(",");
        for (i=0; i<gFields.length; i++)
          groupby += '<FieldRef Name="'+gFields[i]+'" />';
      }
      
      // forge the parameters
      var body = "";
      var aReturn = [];
      if (useOWS) {
        body = "<?xml version=\"1.0\" encoding=\"utf-8\"?>"
              + "<soap:Envelope xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" "
              + "xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\" "
              + "xmlns:soap=\"http://schemas.xmlsoap.org/soap/envelope/\">"
              + "<soap:Body>" 
              + "<GetListItems xmlns=\"http://schemas.microsoft.com/sharepoint/soap/\">"
              + "<listName>"+this.listID+"</listName>"
              + "<viewName></viewName>"
              + "<query>"
              +" <Query>"
              +" "+ ( setup.where!="" ? "<Where>"+ this.parse(setup.where) +"</Where>" : "" )
              +" "+ ( groupby!="" ? "<GroupBy>"+groupby+"</GroupBy>" : "" )
              +" "+ ( orderby!="" ? "<OrderBy>"+orderby+"</OrderBy>" : "" )
              +" </Query>"
              +" </query>"
              +" <viewFields>"
              +" <ViewFields>"
              +" "+this.fields
              +" </ViewFields>"
              +" </viewFields>"
              +" <rowLimit>"+setup.rowlimit+"</rowLimit>"
              +" <queryOptions>"
              +" <QueryOptions>"
              +" <ViewAttributes Scope=\"Recursive\"></ViewAttributes>"
              +" <IncludeAttachmentUrls>True</IncludeAttachmentUrls>"
              +" </QueryOptions>"
              +" </queryOptions>"
              +" </GetListItems>"
              + "</soap:Body>"
              + "</soap:Envelope>";
        // do the request
        var url = setup.url + "/_vti_bin/Lists.asmx";
        var _this=this;
        jQuery.ajax({type: "POST",
                     cache: false,
                     async: (fct!=undefined?true:false),
                     url: url,
                     data: body,
                     contentType: "text/xml; charset=utf-8",
                     dataType: "xml",
                     success:function(data) {
                               // we want to use myElem to change the getAttribute function
                               var rows=data.getElementsByTagName('z:row');
                               if (rows.length==0) rows=data.getElementsByTagName('row'); // for Chrome 'bug'
                               aReturn = fastMap(rows, function(row) { return myElem(row); });
                               if (typeof fct == "function") fct(aReturn);
                             }
                   });
      } else {
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
                +" <Fields>"+this.fields+"</Fields>"
                +" <Where>"+ this.parse(setup.where) +"</Where>"
                +" "+ ( groupby!="" ? "<GroupBy>"+groupby+"</GroupBy>" : "" )
                +" "+ ( orderby!="" ? "<OrderBy>"+orderby+"</OrderBy>" : "" )
                +" </Query>"
                +" </dsQuery>"
                +" </queryRequest>"
                + "</soap:Body>"
                + "</soap:Envelope>";
        // do the request
        var url = setup.url + "/_vti_bin/dspsts.asmx";
        jQuery.ajax({type: "POST",
                     cache: false,
                     async: (fct!=undefined?true:false),
                     url: url,
                     data: body,
                     contentType: "text/xml; charset=utf-8",
                     beforeSend: function(xhr) { xhr.setRequestHeader('SOAPAction', 'http://schemas.microsoft.com/sharepoint/dsp/queryRequest'); },
                     dataType: "xml",
                     success:function(data) { if (typeof fct == "function") fct(data.getElementsByTagName('Row')); else aReturn = data.getElementsByTagName('Row'); }
                   });
      }
      if (typeof fct == "undefined") {
        this.data = aReturn;
        this.length = this.data.length;
      }
      return this;
    },
    /**
      @name $SP.createFile
      @function
      @description Create a file and save it to a Document library
      
      @param {Object} [setup] Options (see below)
        @param {String} setup.content The file content
        @param {String} setup.destination The full path to the file to create
        @param {String} [setup.url='current website'] The website url
        @param {String} [setup.after=function(){}] A function that will be triggered after the task
   
      @example
      $SP.createFile({content:"Hello World!",destination:"http://mysite/Shared Documents/myfile.xls",url:"http://mysite/",after:function() { alert("File created!"); }});
    */
    createFile:function(setup) {
      // default values
      setup     = setup || {};
      if (setup.content == undefined) throw "Error 'createFile': not able to find the file content.";
      if (setup.destination == undefined) throw "Error 'createFile': not able to find the file destination path.";
      if (setup.url == undefined && typeof L_Menu_BaseUrl == "undefined") throw "Error 'createFile': not able to find the URL!"; // we cannot determine the url
      setup.url = setup.url || (window.location.protocol +"//"+ window.location.host + L_Menu_BaseUrl);
      setup.after = setup.after || (function(){});
      
      var soapEnv  = "<?xml version=\"1.0\" encoding=\"utf-8\"?>"
                    +"<soap:Envelope xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\" xmlns:soap=\"http://schemas.xmlsoap.org/soap/envelope/\">"
                    +"<soap:Body>"
                    +"<CopyIntoItems xmlns=\"http://schemas.microsoft.com/sharepoint/soap/\">"
                    +"<SourceUrl>http://null</SourceUrl>"
                    +"<DestinationUrls><string>"+setup.destination+"</string></DestinationUrls>"
                    +"<Fields><FieldInformation Type='File' /></Fields>"
                    +"<Stream>"+encode_b64(setup.content)+"</Stream>"
                    +"</CopyIntoItems>"
                    +"</soap:Body>"
                    +"</soap:Envelope>";
      jQuery.ajax({
        url: setup.url + "/_vti_bin/copy.asmx",
        type: "POST",
        dataType: "xml",
        data: soapEnv,
        beforeSend: function(xhr) { xhr.setRequestHeader('SOAPAction', 'http://schemas.microsoft.com/sharepoint/soap/CopyIntoItems'); },
        contentType: "text/xml; charset=\"utf-8\"",
        success:function(data) {
                     var a = data.getElementsByTagName('CopyResult');
                     if (a && a[0] && a[0].getAttribute("ErrorCode") != "Success") throw "Error 'createFile': "+a[0].getAttribute("ErrorCode")+" - "+a[0].getAttribute("ErrorMessage");
                     if (typeof setup.after == "function") setup.after();
                   }
      });
    },
    /**
      @name $SP.list.getAttachment
      @function
      @description Get the attachment(s) for some items
      
      @param {String} [listID] The list ID
      @param {String} itemID The item ID
      @param {Object} [setup] Options (see below)
        @param {String} [setup.url='current website'] The website url
      @param {Function} [result] A function with the data from the request as first argument
      
      @example
      $SP.list("{ABCD-1234-XXXX-0000}").getAttachment("1,15,24",function(data) {
        for (var i=0; i&lt;data.length; i++) console.log(data[i]);
      });
      
      $SP.get("{ABCD-1234-XXXX-0000}", "98", function(data) {
        for (var i=0; i&lt;data.length; i++) console.log(data[i]);
      });
    */
    getAttachment:function(list, itemID, setup, fct) {
      switch (arguments.length) {
          case 0: if (this.listID == undefined) throw "Error 'getAttachment': you have to define the list ID";
                  else throw "Error 'getAttachment': you have to define the item ID";
                  break;
          case 1: if (this.listID == undefined) throw "Error 'getAttachment': you have to define the list ID";
                  else if (jQuery.type(list) == "string") return this.getAttachment(this.listID, list);
                  else throw "Error 'getAttachment': you have to define the item ID";
                  break;
          case 2: if (jQuery.type(list) == "string" && jQuery.type(itemID) == "function") return this.getAttachment(this.listID, list, {}, itemID);
                  else if (jQuery.type(list) == "string" && jQuery.type(itemID) == "object") return this.getAttachment(this.listID, list, itemID);
                  break;
          case 3: if (jQuery.type(setup) == "function" && jQuery.type(itemID) == "object") return this.getAttachment(this.listID, list, itemID, setup);
                  else if (jQuery.type(setup) == "function") return this.getAttachment(list, itemID, {}, setup);
                  break;
          case 4: this.listID=list;
      }
  
      // default values
      setup           = setup || {};
      if (setup.url == undefined && typeof L_Menu_BaseUrl == "undefined") throw "Error 'getAttachment': not able to find the URL!"; // we cannot determine the url
      setup.url       = setup.url || (window.location.protocol +"//"+ window.location.host + L_Menu_BaseUrl);
      
      // forge the parameters
      var body = "<?xml version=\"1.0\" encoding=\"utf-8\"?>"
                 + "<soap:Envelope xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" "
                 + "xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\" "
                 + "xmlns:soap=\"http://schemas.xmlsoap.org/soap/envelope/\">"
                 + " <soap:Body>"
                 + " <GetAttachmentCollection xmlns=\"http://schemas.microsoft.com/sharepoint/soap/\">"
                 + " <listName>"+this.listID+"</listName>"
                 + " <listItemID>"+itemID+"</listItemID>"
                 + " </GetAttachmentCollection>"
                 + " </soap:Body>"
                 + "</soap:Envelope>";
      // do the request
      var url = setup.url + "/_vti_bin/lists.asmx";
      var aReturn = [];
      jQuery.ajax({type: "POST",
                   cache: false,
                   async: (fct!=undefined?true:false),
                   url: url,
                   data: body,
                   contentType: "text/xml; charset=utf-8",
                   beforeSend: function(xhr) { xhr.setRequestHeader('SOAPAction', 'http://schemas.microsoft.com/sharepoint/soap/GetAttachmentCollection'); },
                   dataType: "xml",
                   success:function(data) {
                     var a = data.getElementsByTagName('Attachment');
                     for (var i=0; i < a.length; i++) aReturn.push(a[i].firstChild.nodeValue);
                     if (typeof fct == "function") fct(aReturn);
                   }
                 });
      if (typeof fct == "undefined") {
        this.data = aReturn;
        this.length = this.data.length;
      }
      return this;
    },
    /**
      @name $SP.list.info
      @function
      @description Get the information (StaticName, DisplayName, Description, Type, Format, Required, DefaultValue, Choices, SourceID) - metadata - regarding the list for each column
      
      @param {String} [listID] The list ID
      @param {Object} [setup] Options (see below)
        @param {String} [setup.url='current website'] The website url
      @param {Function} [function()] A function with the data from the request as first argument
      
      @example
      $SP.list("{ABCD-1234-XXXX-0000}").info(function(fields) {
        for (var i=0; i&lt;fields.length; i++) console.log(fields[i]["DisplayName"]+ ": "+fields[i]["Description"]);
      });
      
      $SP.info("{ABCD-1234-XXXX-0000}",{url:"http://intranet.site.com/dept/"},function(fields) {
        for (var i=0; i&lt;fields.length; i++) console.log(fields[i]["DisplayName"]+ ": "+fields[i]["Description"]);
      });
    */
    info:function(list, setup, fct) {
      switch (arguments.length) {
          case 0: if (this.listID == undefined) throw "Error 'info': you have to define the list ID";
                  break;
          case 1: if (typeof list == "object") return this.info(this.listID, list);
                  else if (typeof list == "function") return this.info(this.listID, {}, list);
          case 2: if (typeof list == "string" && typeof setup == "function") return this.info(list, {}, setup);
                  else if (typeof list=="object" && typeof setup == "function") return this.info(this.listID, list, setup);
          case 3: this.listID=list;
      }
  
      // default values
      setup           = setup || {};
      if (setup.url == undefined && typeof L_Menu_BaseUrl == "undefined") throw "Error 'info': not able to find the URL!"; // we cannot determine the url
      setup.url       = setup.url || (window.location.protocol +"//"+ window.location.host + L_Menu_BaseUrl);
      
      // forge the parameters
      var body = '<?xml version="1.0" encoding="utf-8"?>';
      body += '<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">';
      body += '  <soap:Body>';
      body += '    <GetList xmlns="http://schemas.microsoft.com/sharepoint/soap/">';
      body += '      <listName>'+this.listID+'</listName>';
      body += '    </GetList>';
      body += '  </soap:Body>';
      body += '</soap:Envelope>';
      
      // do the request
      var url = setup.url + "/_vti_bin/lists.asmx";
      var aReturn = [];
      jQuery.ajax({type: "POST",
                   cache: false,
                   async: (fct!=undefined?true:false),
                   url: url,
                   data: body,
                   contentType: "text/xml; charset=utf-8",
                   beforeSend: function(xhr) { xhr.setRequestHeader('SOAPAction', 'http://schemas.microsoft.com/sharepoint/soap/GetList'); },
                   dataType: "xml",
                   success:function(data) {
                     var arr = data.getElementsByTagName('Field');
                     var index = 0;
                     for (var i=0; i < arr.length; i++) {
                       if (arr[i].getAttribute("ID")) {
                         aReturn[index] = [];
                         aReturn[index]["Description"] = arr[i].getAttribute("Description");
                         aReturn[index]["StaticName"] = arr[i].getAttribute("StaticName");
                         aReturn[index]["DisplayName"] = arr[i].getAttribute("DisplayName");
                         aReturn[index]["Format"] = arr[i].getAttribute("Format");
                         aReturn[index]["SourceID"] = arr[i].getAttribute("SourceID");
                         aReturn[index]["Required"] = arr[i].getAttribute("Required");
                         aReturn[index]["Type"] = arr[i].getAttribute("Type");
                         if (aReturn[index]["Type"] == "Choice" || aReturn[index]["Type"] == "MultiChoice") {
                           aReturn[index]["FillInChoice"] = arr[i].getAttribute("FillInChoice");
                           var a=arr[i].getElementsByTagName("CHOICE");
                           var r=[];
                           for(var k=0; k<a.length; k++) r.push(a[k].firstChild.nodeValue);
                           aReturn[index]["Choices"]=r;
                         } else
                           aReturn[index]["Choices"] = [];
                         aReturn[index]["DefaultValue"] = ( arr[i].getElementsByTagName("Default").length > 0 ? arr[i].getElementsByTagName("Default")[0].nodeValue : "" );
                         index++;
                       }
                     }
                      
                     if (typeof fct == "function") fct(aReturn);
                   }
                 });
      if (typeof fct == "undefined") {
        this.data = aReturn;
        this.length = this.data.length;
      }
      return this;
    },
    /**
      @name $SP.list.view
      @function
      @description Get the fields selected for a View
      
      @param {String} [listID] The list ID
      @param {String} [viewID] The view ID
      @param {Object} [setup] Options (see below)
        @param {String} [setup.url='current website'] The website url
      @param {Function} [function()] A function with the data from the request as first argument
      
      @example
      $SP.list("{ABCD-1234-XXXX-0000}").view("{1487-ACDD-XXXX-0000}",function(cols) {
        for (var i=0; i&lt;cols.length; i++) console.log("Column "+i+": "+cols[i]);
      });
    */
    view:function(list, viewID, setup, fct) {
      switch (arguments.length) {
          case 0: if (this.listID == undefined) throw "Error 'view': you have to define the list ID";
                  break;
          case 1: if (typeof list == "string") return this.view(this.listID, list);
                  else if (typeof list == "function") return this.view(this.listID, "", {}, list);
          case 2: if (typeof list == "string" && typeof viewID == "object") return this.view(this.listID, list, viewID);
                  else if (typeof list == "string" && typeof viewID == "function") return this.view(this.listID, list, {}, viewID);
          case 3: if (typeof viewID=="string" && typeof setup == "function") return this.view(this.listID, list, {}, setup);
          case 4: this.listID=list;
      }
  
      // default values
      setup           = setup || {};
      if (setup.url == undefined && typeof L_Menu_BaseUrl == "undefined") throw "Error 'view': not able to find the URL!"; // we cannot determine the url
      setup.url       = setup.url || (window.location.protocol +"//"+ window.location.host + L_Menu_BaseUrl);
      viewID            = viewID || "";
      
      // forge the parameters
      var body = '<?xml version="1.0" encoding="utf-8"?>';
      body += '<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">';
      body += '  <soap:Body>';
      body += '    <GetView xmlns="http://schemas.microsoft.com/sharepoint/soap/">';
      body += '      <listName>'+this.listID+'</listName>';
      body += '      <viewName>'+viewID+'</viewName>';
      body += '    </GetView>';
      body += '  </soap:Body>';
      body += '</soap:Envelope>';
      
      // do the request
      var url = setup.url + "/_vti_bin/Views.asmx";
      var aReturn = [];
      jQuery.ajax({type: "POST",
                   cache: false,
                   async: (fct!=undefined?true:false),
                   url: url,
                   data: body,
                   contentType: "text/xml; charset=utf-8",
                   beforeSend: function(xhr) { xhr.setRequestHeader('SOAPAction', 'http://schemas.microsoft.com/sharepoint/soap/GetView'); },
                   dataType: "xml",
                   success:function(data) {
                     var arr = data.getElementsByTagName('ViewFields')[0].getElementsByTagName('FieldRef');
                     for (var i=0; i < arr.length; i++)
                       aReturn.push(arr[i].getAttribute("Name"))
                    
                     if (typeof fct == "function") fct(aReturn);
                   }
                 });
      if (typeof fct == "undefined") {
        this.data = aReturn;
        this.length = this.data.length;
      }
      return this;
    },
    /**
      @name $SP.list.views
      @function
      @description Get the views info ((ID, Name, Url) for a List
      
      @param {String} [listID] The list ID
      @param {Object} [setup] Options (see below)
        @param {String} [setup.url='current website'] The website url
      @param {Function} [function()] A function with the data from the request as first argument
      
      @example
      $SP.list("{ABCD-1234-XXXX-0000}").views(function(view) {
        for (var i=0; i&lt;view.length; i++) console.log("View #"+i+": "+view[i]['Name']");
      });
    */
    views:function(list, setup, fct) {
      switch (arguments.length) {
        case 0: if (this.listID == undefined) throw "Error 'views': you have to define the list ID";
                break;
        case 1: if (typeof list == "object") return this.views(this.listID, list);
                else if (typeof list == "function") return this.views(this.listID, {}, list);
        case 2: if (typeof list == "string" && typeof setup == "function") return this.views(list, {}, setup);
                else if (typeof list=="object" && typeof setup == "function") return this.views(this.listID, list, setup);
        case 3: this.listID=list;
      }
  
      // default values
      setup           = setup || {};
      if (setup.url == undefined && typeof L_Menu_BaseUrl == "undefined") throw "Error 'views': not able to find the URL!"; // we cannot determine the url
      setup.url       = setup.url || (window.location.protocol +"//"+ window.location.host + L_Menu_BaseUrl);
      
      // forge the parameters
      var body = '<?xml version="1.0" encoding="utf-8"?>';
      body += '<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">';
      body += '  <soap:Body>';
      body += '    <GetViewCollection xmlns="http://schemas.microsoft.com/sharepoint/soap/">';
      body += '      <listName>'+this.listID+'</listName>';
      body += '    </GetViewCollection>';
      body += '  </soap:Body>';
      body += '</soap:Envelope>';
      
      // do the request
      var url = setup.url + "/_vti_bin/Views.asmx";
      var aReturn = [];
      jQuery.ajax({type: "POST",
                   cache: false,
                   async: (fct!=undefined?true:false),
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
                    }
                    
                    if (typeof fct == "function") fct(aReturn);
                   }
                 });
      if (typeof fct == "undefined") {
        this.data = aReturn;
        this.length = this.data.length;
      }
      return this;
    },
    /**
      @name $SP.lists
      @function
      @description Get the lists from the site (for each list we'll have "ID", "Name", "Description", "Url")
      
      @param {Object} [setup] Options (see below)
        @param {String} [setup.url='current website'] The website url
      @param {Function} [function()] A function with the data from the request as first argument
      
      @example
      $SP.lists(function(list) {
        for (var i=0; i&lt;list.length; i++) console.log("List #"+i+": "+list[i]['Name']");
      });
    */
    lists:function(setup, fct) {
      switch (arguments.length) {
        case 1: if (typeof setup == "function") return this.lists({}, setup);
      }
  
      // default values
      setup           = setup || {};
      if (setup.url == undefined && typeof L_Menu_BaseUrl == "undefined") throw "Error 'lists': not able to find the URL!"; // we cannot determine the url
      setup.url       = setup.url || (window.location.protocol +"//"+ window.location.host + L_Menu_BaseUrl);
      
      // forge the parameters
      var body = '<?xml version="1.0" encoding="utf-8"?>';
      body += '<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">';
      body += '  <soap:Body>';
      body += '    <GetListCollection xmlns="http://schemas.microsoft.com/sharepoint/soap/">';
      body += '    </GetListCollection>';
      body += '  </soap:Body>';
      body += '</soap:Envelope>';
      
      // do the request
      var url = setup.url + "/_vti_bin/lists.asmx";
      var aReturn = [];
      jQuery.ajax({type: "POST",
                   cache: false,
                   async: (fct!=undefined?true:false),
                   url: url,
                   data: body,
                   contentType: "text/xml; charset=utf-8",
                   beforeSend: function(xhr) { xhr.setRequestHeader('SOAPAction', 'http://schemas.microsoft.com/sharepoint/soap/GetListCollection'); },
                   dataType: "xml",
                   success:function(data) {
                    var arr = data.getElementsByTagName('List');
                    for (var i=0; i < arr.length; i++) {
                      aReturn[i] = [];
                      aReturn[i]["ID"] = arr[i].getAttribute("ID");
                      aReturn[i]["Name"] = arr[i].getAttribute("Title");
                      aReturn[i]["Url"] = arr[i].getAttribute("DefaultViewUrl");
                      aReturn[i]["Description"] = arr[i].getAttribute("Description");
                    }
                    
                    if (typeof fct == "function") fct(aReturn);
                   }
                 });
      if (typeof fct == "undefined") {
        this.data = aReturn;
        this.length = this.data.length;
      }
      return this;
    },
    /**
      @name $SP.each
      @function
      @description Use the jQuery.each() function on the returned data array
    */
    each:function(arr, fct) {
      switch (arguments.length) {
          case 0: throw "Error 'each': you have to provide a function.";
                  break;
          case 1: if (typeof arr == "function") jQuery.each(this.data, arr);
                  else throw "Error 'each': you have to provide a function.";
                  break;
          default: if (jQuery.type(arr) === "array" && jQuery.type(fct) === "function") jQuery.each(arr, fct);
                  break;
      }
    },
    /**
      @name $SP.list.add
      @function
      @description Add items into a Sharepoint List (ATTENTION: you should not try to add more than 15 items in the same time)
                   note: A Date must be provided as "YYYY-MM-DD hh:mm:ss", or you can use $SP.toSPDate(new Date())
                   note: A person must be provided as "-1;#email" (e.g. "-1;#foo@bar.com") OR NT login with double \ (eg "-1;#europe\\foo_bar") OR the user ID
                   note: A lookup value must be provided as "X;#value", with X the ID of the value from the lookup list.
                   note: A URL field must be provided as "http://www.website.com, Name"
                   note: A multiple selection must be provided as ";#choice 1;#choice 2;#", or just pass an array as the value and it will do the trick
                   note: A Yes/No checkbox must be provided as "1" (for TRUE) or "0" (for "False")
                   note: You cannot change the Approval Status when adding, you need to use the $SP.moderate function
      
      @param {String} [listID] The list ID
      @param {Object|Array} items List of items (e.g. [{Field_x0020_Name: "Value", OtherField: "new value"}, {Field_x0020_Name: "Value2", OtherField: "new value2"}])
      @param {Object} [setup] Options (see below)
        @param {String} [setup.url='current website'] The website url
        @param {Boolean} [setup.async=true] Determines if we want asynchrous request
        @param {Function} [setup.progress] (current,max) If you provide more than 15 items then they will be treated by packets and you can use "progress" to know more about the steps
        @param {Function} [setup.success] A function with the items added sucessfully
        @param {Function} [setup.error] A function with the items not added
        @param {Function} [setup.after] A function that will be executed at the end of the request
        @param {Boolean} [setup.escapeChar=true] Determines if we want to escape the special chars that will cause an error (for example '&' will be automatically converted to '&amp;')
      
      @example
      $SP.list("{ABCD-1234-XXXX-0000}").add({Title:"Ok"});
      
      $SP.add("{ABCD-1234-XXXX-0000}", [{Title:"Ok"}, {Title:"Good"}], {after:function() { alert("Done!"); }});
                 
      $SP.list("{ABCD-1234-XXXX-0000}").add({Title:"Ok"}, {error:function(items) {
        for (var i=0; i &lt; items.length; i++) console.log("Error '"+items[i].errorMessage+"' with:"+items[i].Title); // the 'errorMessage' attribute is added to the object
      }, success:function(items) {
        for (var i=0; i &lt; items.length; i++) console.log("Success for:"+items[i].Title+" (ID:"+items[i].ID+")");
      }});
      
      // different ways to add John and Tom into the table
      $SP.list("{ABCD-1234-XXXX-0000}").add({Title:"John is the Tom's Manager",Manager:"-1;#john@compagny.com",Report:"-1;#tom@compagny.com"}); // if you don't know the ID
      $SP.list("{ABCD-1234-XXXX-0000}").add({Title:"John is the Tom's Manager",Manager:"157",Report:"874"}); // if you know the User ID 
    */
    add:function(list, items, setup) {
      switch (arguments.length) {
          case 0: if (this.listID == undefined) throw "Error 'add': you have to define the list ID.";
                  break;
          case 1: if (jQuery.type(list) === "string") throw "Error 'add': you have to define the items to add.";
                  else if (jQuery.type(list) === "object" || jQuery.type(list) === "array") return this.add(this.listID, list);
          case 2: if (jQuery.type(list) === "string" && (jQuery.type(items) === "object" || jQuery.type(items) === "array")) break;
                  if ((jQuery.type(list) === "object" || jQuery.type(list) === "array") && jQuery.type(items) === "object") return this.add(this.listID, list, items);
          case 3: this.listID=list;
      }
      
      // default values
      setup         = setup || {};
      if (setup.url == undefined && typeof L_Menu_BaseUrl == "undefined") throw "Error 'add': not able to find the URL!"; // we cannot determine the url
      setup.url     = setup.url || (window.location.protocol +"//"+ window.location.host + L_Menu_BaseUrl);
      setup.async   = (setup.async == undefined) ? true : setup.async;
      setup.success = setup.success || (function() {});
      setup.error   = setup.error || (function() {});
      setup.after   = setup.after || (function() {});
      setup.escapeChar = (setup.escapeChar == undefined) ? true : setup.escapeChar;
      setup.progress= setup.progress || (function() {});
      
      if (jQuery.type(items) == "object") items = [ items ];
      var itemsLength=items.length;
      
      // define current and max for the progress
      setup.progressVar = setup.progressVar || {current:0,max:itemsLength,passed:[],failed:[],eventID:"spAdd"+(""+Math.random()).slice(2)};
      // we cannot add more than 15 items in the same time, so split by 15 elements
      // and also to avoid surcharging the server
      if (itemsLength > 15) {
        var nextPacket=items.slice(0);
        var cutted=nextPacket.splice(0,15);
        var _this=this;
        $(document).on(setup.progressVar.eventID,function(event) {
          $(document).off(setup.progressVar.eventID);
          _this.add(nextPacket,event.setup);
        });
        this.add(cutted,setup);
        return this;
      } else if (itemsLength == 0) throw "'add': nothing to add!";
      
      // increment the progress
      setup.progressVar.current += itemsLength;
      
      // build a part of the request
      var updates = '<Batch OnError="Continue" ListVersion="1"  ViewName="">';
      var thisObject = this;
      for (var i=0; i < items.length; i++) {
        updates += '<Method ID="'+(i+1)+'" Cmd="New">';
        updates += '<Field Name=\'ID\'>New</Field>';
        jQuery.each(items[i], function(key, value) {
          if (jQuery.type(value) == "array") value = ";#" + value.join(";#") + ";#"; // an array should be seperate by ";#"
          if (setup.escapeChar && jQuery.type(value) == "string") value = thisObject._cleanString(value); // replace & (and not &amp;) by "&amp;" to avoid some issues
          updates += "<Field Name='"+key+"'>"+value+"</Field>";
        });
        updates += '</Method>';
      }
      updates += '</Batch>';
      
      // build the request
      var body = "<?xml version=\"1.0\" encoding=\"utf-8\"?>"
               + "<soap:Envelope xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\" xmlns:soap=\"http://schemas.xmlsoap.org/soap/envelope/\">"
               + "<soap:Body>"
               + "<UpdateListItems xmlns=\"http://schemas.microsoft.com/sharepoint/soap/\">"
               + "<listName>"+this.listID+"</listName>"
               + "<updates>"
               + updates
               + "</updates>"
               + "</UpdateListItems>"
               + "</soap:Body>"
               + "</soap:Envelope>";
               
      // send the request
      var url = setup.url + "/_vti_bin/lists.asmx";     
      jQuery.ajax({type: "POST",
                   cache: false,
                   async: setup.async,
                   url: url,
                   data: body,
                   beforeSend: function(xhr) { xhr.setRequestHeader('SOAPAction', 'http://schemas.microsoft.com/sharepoint/soap/UpdateListItems'); },
                   contentType: "text/xml; charset=utf-8",
                   dataType: "xml",
                   success:function(data) {
                     var result = data.getElementsByTagName('Result');
                     var len=result.length;
                     var passed = setup.progressVar.passed, failed = setup.progressVar.failed;
                     for (var i=0; i < len; i++) {
                       if (result[i].getElementsByTagName('ErrorCode')[0].firstChild.nodeValue == "0x00000000") { // success
                         var rows=result[i].getElementsByTagName('z:row');
                         if (rows.length==0) rows=result[i].getElementsByTagName('row'); // for Chrome 'bug'
                         items[i].ID = rows[0].getAttribute("ows_ID");
                         passed.push(items[i]);
                       } else {
                         items[i].errorMessage = result[i].getElementsByTagName('ErrorText')[0].firstChild.nodeValue;
                         failed.push(items[i]);
                       }
                     }
                     
                     setup.progress(setup.progressVar.current,setup.progressVar.max);
                     // check if we have some other packets that are waiting to be treated
                     if (setup.progressVar.current < setup.progressVar.max)
                       $(document).trigger({type:setup.progressVar.eventID,setup:setup});
                     else {
                       if (passed.length>0) setup.success(passed);
                       if (failed.length>0) setup.error(failed);
                       setup.after();
                     }
                   }
                 });
      return this;
    },
    /**
      @name $SP.list.update
      @function
      @description Update items from a Sharepoint List (ATTENTION you should not try to update more than 15 items in the same time)
      
      @param {String} [listID] The list ID
      @param {Array} items List of items (e.g. [{ID: 1, Field_x0020_Name: "Value", OtherField: "new value"}, {ID:22, Field_x0020_Name: "Value2", OtherField: "new value2"}])
      @param {Object} [setup] Options (see below)
        @param {String} [setup.url='current website'] The website url
        @param {Boolean} [setup.async=true] Determines if we want asynchrous request
        @param {String} [setup.where=""] You can define a WHERE clause
        @param {Function} [setup.progress] (current,max) If you provide more than 15 ID then they will be treated by packets and you can use "progress" to know more about the steps
        @param {Function} [setup.success] (passedItems) A function with the items updated sucessfully
        @param {Function} [setup.error] (failedItems) A function with the items not updated
        @param {Function} [setup.after] () A function that will be executed at the end of the request
        @param {Boolean} [setup.escapeChar=true] Determines if we want to escape the special chars that will cause an error (for example '&' will be automatically converted to '&amp;')
        
      @example
      $SP.list("{ABCD-1234-XXXX-0000}").update({ID:1, Title:"Ok"}); // you must always provide the ID
      $SP.list("{ABCD-1234-XXXX-0000}").update({Title:"Ok"},{where:"Status = 'Complete'"}); // if you use the WHERE then you must not provide the item ID
      
      $SP.update("{ABCD-1234-XXXX-0000}", [{ID:5, Title:"Ok"}, {ID: 15, Title:"Good"}]);
                 
      $SP.list("{ABCD-1234-XXXX-0000}").update({ID:43, Title:"Ok"}, {error:function(items) {
        for (var i=0; i &lt; items.length; i++) console.log("Error '"+items[i].errorMessage+"' with:"+items[i].Title));
      }});
    */
    update:function(list, items, setup) {
      switch (arguments.length) {
          case 0: if (this.listID == undefined) throw "Error 'update': you have to define the list ID.";
                  break;
          case 1: if (jQuery.type(list) === "string") throw "Error 'update': you have to define the items to update.";
                  else if (jQuery.type(list) === "object" || jQuery.type(list) === "array") return this.update(this.listID, list);
          case 2: if (jQuery.type(list) === "string" && (jQuery.type(items) === "object" || jQuery.type(items) === "array")) break;
                  if ((jQuery.type(list) === "object" || jQuery.type(list) === "array") && jQuery.type(items) === "object") return this.update(this.listID, list, items);
          case 3: this.listID=list;
      }
      
      // default values
      setup         = setup || {};
      if (setup.url == undefined && typeof L_Menu_BaseUrl == "undefined") throw "Error 'update': not able to find the URL!"; // we cannot determine the url
      setup.url     = setup.url || (window.location.protocol +"//"+ window.location.host + L_Menu_BaseUrl);
      setup.async   = (setup.async == undefined) ? true : setup.async;
      setup.where   = setup.where || "";
      setup.success = setup.success || (function() {});
      setup.error   = setup.error || (function() {});
      setup.after   = setup.after || (function() {});
      setup.escapeChar = (setup.escapeChar == undefined) ? true : setup.escapeChar;
      setup.progress= setup.progress || (function() {});
           
      if (jQuery.type(items) == "object") items = [ items ];
      var itemsLength=items.length;
      
      // if there is a WHERE clause
      if (itemsLength == 1 && setup.where) {
        // call GET first
        delete items[0].ID;
        var _this=this;
        this.get({fields:"ID",where:setup.where,url:setup.url},function(data) {
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
        $(document).on(setup.progressVar.eventID,function(event) {
          $(document).off(setup.progressVar.eventID);
          _this.update(nextPacket,event.setup);
        });
        this.update(cutted,setup);
        return this;
      } else if (itemsLength == 0) throw "'update': nothing to update!";
      
      // increment the progress
      setup.progressVar.current += itemsLength;

      // build a part of the request
      var updates = '<Batch OnError="Continue" ListVersion="1"  ViewName="">';
      var thisObject = this;
      for (var i=0; i < itemsLength; i++) {
        updates += '<Method ID="'+(i+1)+'" Cmd="Update">';
        if (items[i].ID == undefined) throw "Error 'update': you have to provide the item ID called 'ID'";
        jQuery.each(items[i], function(key, value) {
          if (jQuery.type(value) == "array") value = ";#" + value.join(";#") + ";#"; // an array should be seperate by ";#"
          if (setup.escapeChar && jQuery.type(value) == "string") value = thisObject._cleanString(value); // replace & (and not &amp;) by "&amp;" to avoid some issues
          updates += "<Field Name='"+key+"'>"+value+"</Field>";
        });
        updates += '</Method>';
      }
      updates += '</Batch>';
      
      // build the request
      var body = "<?xml version=\"1.0\" encoding=\"utf-8\"?>"
               + "<soap:Envelope xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\" xmlns:soap=\"http://schemas.xmlsoap.org/soap/envelope/\">"
               + "<soap:Body>"
               + "<UpdateListItems xmlns=\"http://schemas.microsoft.com/sharepoint/soap/\">"
               + "<listName>"+this.listID+"</listName>"
               + "<updates>"
               + updates
               + "</updates>"
               + "</UpdateListItems>"
               + "</soap:Body>"
               + "</soap:Envelope>";

      // send the request
      var url = setup.url + "/_vti_bin/lists.asmx";
      jQuery.ajax({type: "POST",
                   cache: false,
                   async: setup.async,
                   url: url,
                   data: body,
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
                     if (setup.progressVar.current < setup.progressVar.max)
                       $(document).trigger({type:setup.progressVar.eventID,setup:setup});
                     else {
                       if (passed.length>0) setup.success(passed);
                       if (failed.length>0) setup.error(failed);
                       setup.after();
                     }
                   }
                 });
      return this;
    },
    /**
      @name $SP.list.moderate
      @function
      @description Moderate items from a Sharepoint List
      
      @param {String} [listID] The list ID
      @param {Array} approval List of items and ApprovalStatus(e.g. [{ID:1, ApprovalStatus:"Approved"}, {ID:22, ApprovalStatus:"Pending"}])
      @param {Object} [setup] Options (see below)
        @param {String} [setup.url='current website'] The website url
        @param {Boolean} [setup.async=true] Determines if we want asynchrous request
        @param {Function} [setup.success] A function with the items updated sucessfully
        @param {Function} [setup.error] A function with the items not updated
        @param {Function} [setup.after] A function that will be executed at the end of the request
        
      @example
      $SP.list("{ABCD-1234-XXXX-0000}").moderate({ID:1, ApprovalStatus:"Rejected"}); // you must always provide the ID
      
      $SP.moderate("{ABCD-1234-XXXX-0000}", [{ID:5, ApprovalStatus:"Pending"}, {ID: 15, ApprovalStatus:"Approved"}]);
                 
      $SP.list("{ABCD-1234-XXXX-0000}").moderate({ID:43, ApprovalStatus:"Approved"}, {error:function(items) {
        for (var i=0; i &lt; items.length; i++) console.log("Error with:"+items[i].ID);
      },success:function(items) { for (var i=0; i &lt; items.length; i++) console.log("Success with:"+items[i].getAttribute("Title")); } });
    */
    moderate:function(list, items, setup) {
      switch (arguments.length) {
          case 0: if (this.listID == undefined) throw "Error 'moderate': you have to define the list ID.";
                  break;
          case 1: if (jQuery.type(list) === "string") throw "Error 'moderate': you have to define the items to moderate.";
                  else if (jQuery.type(list) === "object" || jQuery.type(list) === "array") return this.moderate(this.listID, list);
          case 2: if (jQuery.type(list) === "string" && (jQuery.type(items) === "object" || jQuery.type(items) === "array")) break;
                  if ((jQuery.type(list) === "object" || jQuery.type(list) === "array") && jQuery.type(items) === "object") return this.moderate(this.listID, list, items);
          case 3: this.listID=list;
      }
      
      // default values
      setup         = setup || {};
      if (setup.url == undefined && typeof L_Menu_BaseUrl == "undefined") throw "Error 'moderate': not able to find the URL!"; // we cannot determine the url
      setup.url     = setup.url || (window.location.protocol +"//"+ window.location.host + L_Menu_BaseUrl);
      setup.async   = (setup.async == undefined) ? true : setup.async;
      setup.success = setup.success || (function() {});
      setup.error   = setup.error || (function() {});
      setup.after   = setup.after || (function() {});
      
      if (jQuery.type(items) == "object") items = [ items ];
      
      // we cannot add more than 15 items in the same time, so split by 15 elements
      while (items.length > 15) {
        var nextPacket = items.slice(0,15);
        items.splice(0,15);
        this.moderate(list, nextPacket, setup);
      }

      // build a part of the request
      var updates = '<Batch OnError="Continue" ListVersion="1"  ViewName="">';
      var thisObject = this;
      for (var i=0; i < items.length; i++) {
        updates += '<Method ID="'+(i+1)+'" Cmd="Moderate">';
        if (items[i].ID == undefined) throw "Error 'moderate': you have to provide the item ID called 'ID'";
        else if (items[i].ApprovalStatus == undefined) throw "Error 'moderate': you have to provide the approval status 'ApprovalStatus' (Approved, Rejected, Pending, Draft or Scheduled)";
        jQuery.each(items[i], function(key, value) {
          if (key == "ApprovalStatus") {
            key = "_ModerationStatus";
            switch (value) {
              case "Approved":  value=0; break;
              case "Rejected":  value=1; break;
              case "Pending":   value=2; break;
              case "Draft":     value=3; break;
              case "Scheduled": value=4; break;
              default:          value=2; break;
            }
          }
          updates += "<Field Name='"+key+"'>"+value+"</Field>";
        });
        updates += '</Method>';
      }
      updates += '</Batch>';
      
      // build the request
      var body = "<?xml version=\"1.0\" encoding=\"utf-8\"?>"
               + "<soap:Envelope xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\" xmlns:soap=\"http://schemas.xmlsoap.org/soap/envelope/\">"
               + "<soap:Body>"
               + "<UpdateListItems xmlns=\"http://schemas.microsoft.com/sharepoint/soap/\">"
               + "<listName>"+this.listID+"</listName>"
               + "<updates>"
               + updates
               + "</updates>"
               + "</UpdateListItems>"
               + "</soap:Body>"
               + "</soap:Envelope>";
               
      // send the request
      var url = setup.url + "/_vti_bin/lists.asmx";
      jQuery.ajax({type: "POST",
                   cache: false,
                   async: setup.async,
                   url: url,
                   data: body,
                   beforeSend: function(xhr) { xhr.setRequestHeader('SOAPAction', 'http://schemas.microsoft.com/sharepoint/soap/UpdateListItems'); },
                   contentType: "text/xml; charset=utf-8",
                   dataType: "xml",
                   success:function(data) {
                     var result = data.getElementsByTagName('Result');
                     var len=result.length;
                     var passed = [], failed = [];
                     for (var i=0; i < len; i++) {
                       var item = myElem(result[i].getElementsByTagName('z:row')[0]);
                       if (result[i].getElementsByTagName('ErrorCode')[0].firstChild.nodeValue == "0x00000000") // success
                         passed.push(item);
                       else {
                         items[i].errorMessage = result[i].getElementsByTagName('ErrorText')[0].firstChild.nodeValue;
                         failed.push(items[i]);
                       }
                     }
                     if (passed.length>0) setup.success(passed);
                     if (failed.length>0) setup.error(failed);
                     setup.after();
                   }
                 });
      return this;
    },
    /**
      @name $SP.list.remove
      @function
      @description Delete items from a Sharepoint List
      @note You can also use the key word 'del' instead of 'remove'
      
      @param {String} [listID] The list ID
      @param {Objet|Array} itemsID List of items ID (e.g. [{ID:1}, {ID:22}])
      @param {Object} [setup] Options (see below)
        @param {String} [setup.url='current website'] The website url
        @param {Boolean} [setup.async=true] Determines if we want asynchrous request
        @param {Function} [setup.progress] (current,max) If you provide more than 15 ID then they will be treated by packets and you can use "progress" to know more about the steps
        @param {Function} [setup.success] (passedItems) A function with the items updated sucessfully
        @param {Function} [setup.error] (failedItems) A function with the items not updated
        @param {Function} [setup.after] () A function that will be executed at the end of the request
      
      @example
      $SP.list("{ABCD-1234-XXXX-0000}").remove({ID:1}); // you must always provide the ID
      $SP.list("{ABCD-1234-XXXX-0000}").remove({where:"Title = 'OK'",progress:function(current,max) {
        console.log(current+"/"+max);
      }});
      
      $SP.del("{ABCD-1234-XXXX-0000}", [{ID:5}, {ID:15}]);
                 
      $SP.list("{ABCD-1234-XXXX-0000}").remove({ID:43, Title:"My title"}, {error:function(items) {
        for (var i=0; i &lt; items.length; i++) console.log("Error with:"+items[i].ID+" ("+items[i].errorMessage+")"); // only .ID and .errorMessage are available
      }});
    */
    remove:function(list, items, setup) {
      switch (arguments.length) {
          case 0: if (this.listID == undefined) throw "Error 'remove': you have to define the list ID.";
                  break;
          case 1: if (jQuery.type(list) === "string") throw "Error 'remove': you have to define the items to remove.";
                  else if (jQuery.type(list) === "object" || jQuery.type(list) === "array") return this.remove(this.listID, list);
          case 2: if (jQuery.type(list) === "string" && (jQuery.type(items) === "object" || jQuery.type(items) === "array")) break;
                  if ((jQuery.type(list) === "object" || jQuery.type(list) === "array") && jQuery.type(items) === "object") return this.remove(this.listID, list, items);
          case 3: this.listID=list;
      }
      
      // default values
      if (!setup && items.where) { setup=items; items=[]; } // the case when we use the "where"
      setup         = setup || {};
      if (setup.url == undefined && typeof L_Menu_BaseUrl == "undefined") throw "Error 'remove': not able to find the URL!"; // we cannot determine the url
      setup.url     = setup.url || (window.location.protocol +"//"+ window.location.host + L_Menu_BaseUrl);
      setup.async   = (setup.async == undefined) ? true : setup.async;
      setup.success = setup.success || (function() {});
      setup.error   = setup.error || (function() {});
      setup.after   = setup.after || (function() {});
      setup.progress= setup.progress || (function() {});
           
      if (jQuery.type(items) == "object") items = [ items ];
      var itemsLength=items.length;
      
      // if there is a WHERE clause
      if (setup.where) {
        // call GET first
        if (itemsLength==1) delete items[0].ID;
        var _this=this;
        this.get({fields:"ID",where:setup.where,url:setup.url},function(data) {
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
          // now call again the REMOVE
          delete setup.where;
          _this.remove(aItems,setup);
        });
        return this;
      } else if (itemsLength == 0) throw "'remove': nothing to delete!";
      
      // define current and max for the progress
      setup.progressVar = setup.progressVar || {current:0,max:itemsLength,passed:[],failed:[],eventID:"spRemove"+(""+Math.random()).slice(2)};
      // we cannot add more than 15 items in the same time, so split by 15 elements
      // and also to avoid surcharging the server
      if (itemsLength > 15) {
        var nextPacket=items.slice(0);
        var cutted=nextPacket.splice(0,15);
        var _this=this;
        $(document).on(setup.progressVar.eventID,function(event) {
          $(document).off(setup.progressVar.eventID);
          _this.remove(nextPacket,event.setup);
        });
        this.remove(cutted,setup);
        return this;
      }
      // increment the progress
      setup.progressVar.current += itemsLength;

      // build a part of the request
      var updates = '<Batch OnError="Continue" ListVersion="1"  ViewName="">';
      for (var i=0; i < items.length; i++) {
        updates += '<Method ID="'+(i+1)+'" Cmd="Delete">';
        if (items[i].ID == undefined) throw "Error 'delete': you have to provide the item ID called 'ID'";
        updates += "<Field Name='ID'>"+items[i].ID+"</Field>";
        updates += '</Method>';
      }
      updates += '</Batch>';
      
      // build the request
      var body = "<?xml version=\"1.0\" encoding=\"utf-8\"?>"
               + "<soap:Envelope xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\" xmlns:soap=\"http://schemas.xmlsoap.org/soap/envelope/\">"
               + "<soap:Body>"
               + "<UpdateListItems xmlns=\"http://schemas.microsoft.com/sharepoint/soap/\">"
               + "<listName>"+this.listID+"</listName>"
               + "<updates>"
               + updates
               + "</updates>"
               + "</UpdateListItems>"
               + "</soap:Body>"
               + "</soap:Envelope>";
               
      // send the request
      var url = setup.url + "/_vti_bin/lists.asmx";
      jQuery.ajax({type: "POST",
                   cache: false,
                   async: setup.async,
                   url: url,
                   data: body,
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
                     if (setup.progressVar.current < setup.progressVar.max)
                       $(document).trigger({type:setup.progressVar.eventID,setup:setup});
                     else {
                       if (passed.length>0) setup.success(passed);
                       if (failed.length>0) setup.error(failed);
                       setup.after();
                     }
                   }
                 });
      return this;
    },
    /**
      @name $SP.people
      @function
      @description Find the user details like manager, email, colleagues, ...
      
      @param {String} [username] With or without the domain, and you can also use an email address, and if you leave it empty it's the current user by default (if you use the domain, don't forget to use a double \ like "mydomain\\john_doe")
      @param {Object} [setup] Options (see below)
        @param {String} [setup.url='current website'] The website url
      @param {Function} [result] () A function that will be executed at the end of the request with a param that is an array with the result
      
      @example
      $SP.people("john_doe",{url:"http://my.si.te/subdir/"}, function(people) {
        for (var i=0; i &lt; people.length; i++) console.log(people[i]+" = "+people[people[i]]);
      });
    */
    people:function(username, setup, fct) {
      switch (arguments.length) {
          case 1: if (jQuery.type(username) === "object") setup=username;
                  else if (jQuery.type(username) === "function") fct=username;
                  username=undefined;
                  break;
          case 2: if (jQuery.type(username) === "string" && jQuery.type(setup) === "function") { fct=setup; setup=undefined; break; }
                  if (jQuery.type(username) === "object" && jQuery.type(setup) === "function") { fct=setup; setup=username; username=undefined; break; }
      }
      
      // default values
      setup         = setup || {};
      if (setup.url == undefined && typeof L_Menu_BaseUrl == "undefined") throw "Error 'people': not able to find the URL!"; // we cannot determine the url
      setup.url     = setup.url || (window.location.protocol +"//"+ window.location.host + L_Menu_BaseUrl);
      fct           = fct || (function() {});
      username      = username || "";
      
      // build the request
      var body = "<soap:Envelope xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xmlns:xsd='http://www.w3.org/2001/XMLSchema' xmlns:soap='http://schemas.xmlsoap.org/soap/envelope/'>"
               + "<soap:Body><GetUserProfileByName xmlns='http://microsoft.com/webservices/SharePointPortalServer/UserProfileService'>"
               + "<AccountName>"+username+"</AccountName>"
               + "</GetUserProfileByName></soap:Body></soap:Envelope>";
               
      // send the request
      var url = setup.url + "_vti_bin/UserProfileService.asmx";
      jQuery.ajax({type: "POST",
                   cache: false,
                   url: url,
                   data: body,
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
                       if (value&&value.length>=1) value=value[0].firstChild.nodeValue;
                       else value="No Value";
                       aResult.push(name);
                       aResult[name]=value;
                     }
                     fct(aResult);
                   },statusCode: {
                     500: function(req) {
                       fct([]);
                       // any error ?
                       var error=req.responseXML.getElementsByTagName("faultstring");
                       if (error.length==1) throw "Error 'people': "+error[0].firstChild.nodeValue;
                     }
                   }
                 });
      return this;
    },
    /**
      @name $SP.addressbook
      @function
      @description Find an user based on a part of his name
      
      @param {String} word A part of the name from the guy you're looking for
      @param {Object} [setup] Options (see below)
        @param {String} [setup.limit=10] Number of results returned
        @param {String} [setup.type='User'] Possible values are: 'All', 'DistributionList', 'SecurityGroup', 'SharePointGroup', 'User', and 'None' (see http://msdn.microsoft.com/en-us/library/people.spprincipaltype.aspx)
        @param {String} [setup.url='current website'] The website url
      @param {Function} [result] () A function that will be executed at the end of the request with a param that is an array with the result (typically: AccountName,UserInfoID,DisplayName,Email,Departement,Title,PrincipalType)
      
      @example
      $SP.addressbook("john", {limit:25}, function(people) {
        for (var i=0; i &lt; people.length; i++) {
          for (var j=0; j &lt; people[i].length; j++) console.log(people[i][j]+" = "+people[people[i][j]]);
        }
      });
    */
    addressbook:function(username, setup, fct) {
      switch (arguments.length) {
          case 1: if (jQuery.type(username) === "object") setup=username;
                  else if (jQuery.type(username) === "function") fct=username;
                  username=undefined;
                  break;
          case 2: if (jQuery.type(username) === "string" && jQuery.type(setup) === "function") { fct=setup; setup=undefined; break; }
                  if (jQuery.type(username) === "object" && jQuery.type(setup) === "function") { fct=setup; setup=username; username=undefined; break; }
      }
      
      // default values
      setup         = setup || {};
      if (setup.url == undefined && typeof L_Menu_BaseUrl == "undefined") throw "Error 'addressbook': not able to find the URL!"; // we cannot determine the url
      setup.url     = setup.url || (window.location.protocol +"//"+ window.location.host + L_Menu_BaseUrl);
      setup.limit   = setup.limit || 10;
      setup.type    = setup.type || "User";
      fct           = fct || (function() {});
      username      = username || "";
      
      // build the request
      var body = "<soap:Envelope xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xmlns:xsd='http://www.w3.org/2001/XMLSchema' xmlns:soap='http://schemas.xmlsoap.org/soap/envelope/'>"
               + "<soap:Body><SearchPrincipals xmlns='http://schemas.microsoft.com/sharepoint/soap/'>"
               + "<searchText>"+username+"</searchText><maxResults>"+setup.limit+"</maxResults><principalType>"+setup.type+"</principalType></SearchPrincipals></soap:Body></soap:Envelope>";
               
      // send the request
      var url = setup.url + "_vti_bin/People.asmx";
      jQuery.ajax({type: "POST",
                   cache: false,
                   url: url,
                   data: body,
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
                     fct(aResult);
                   }
                 });
      return this;
    },
    reset:function() {
      this.data   = [];
      this.length = 0;
      this.listID = "";
    },
    /**
      @name $SP.toDate
      @function
      @description Change a Sharepoint date (as a string) to a Date Object
      @param {String} textDate the Sharepoint date string
      @return {Date} the equivalent Date object for the Sharepoint date string passed
      @example $SP.toDate("2008-10-31T00:00:00").getFullYear(); // 2008
    */
    toDate: function(strDate) {
      // 2008-10-31T00:00:00
      if (strDate.length!=19) return new Date();
      var year  = strDate.substring(0,4);
      var month = strDate.substring(5,7);
      var day   = strDate.substring(8,10);
      var hour  = strDate.substring(11,13);
      var min   = strDate.substring(14,16);
      var sec   = strDate.substring(17,19);
      return new Date(year,month-1,day,hour,min,sec);
    },
    /**
      @name $SP.toSPDate
      @function
      @description Change a Date object into a Sharepoint date string
      @param {Date} [dateObject] the Sharepoint date string
      @return {String} the equivalent string for the Date object passed
      @example $SP.toSPDate(new Date("31/Oct/2008")); // --> "2008-10-31 00:00:00"
    */
    toSPDate: function(oDate) {
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
      return year+"-"+month+"-"+day+" "+hours+":"+minutes+":"+seconds;
    },
    /**
      @name $SP.toCurrency
      @function
      @description It will return a number with commas, currency sign and a specific number of decimals
      @param {Number|String} number The number to format
      @param {Number} [decimal=-1] The number of decimals (use -1 if you want to have 2 decimals when there are decimals, or no decimals if it's .00
      @param {String} [sign='$'] The currency sign to add
      
      @return {String} The converted number
      @example 
      
      $SP.toCurrency(1500000); // --> $1,500,000
      $SP.toCurrency(1500000,2,''); // --> 1,500,000.00 
     */
    toCurrency:function(n,dec,sign) {
      n=Number(n);
      if (dec == undefined) dec=-1;
      if (sign == undefined) sign='$';
      var m="";
      if (n<0) { m="-"; n*=-1; }
      var s = n;
      if (dec==-1) s = s.toFixed(2).replace('.00', '');
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
      @name $SP.getLookup
      @function
      @description Split the ID and Value
      @param {String} text The string to retrieve data
      @return {Object} .id returns the ID, and .value returns the value
      @example $SP.getLookup("328;#Foo"); // --> {id:328, value:"Foo"}
    */
    getLookup: function(str) { var a=str.split(";#"); return {id:a[0], value:a[1]}; },
    /**
      @name $SP.toXSLString
      @function
      @description Change a string into a XSL format string
      @param {String} text The string to change
      @return {String} the XSL version of the string passed
      @example $SP.toXSLString("Big Title"); // --> "Big_x0020_Title"
    */
    toXSLString: function(str) {
      // if the first word contains  a number, then FullEscape the first letter/number
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
      if (/[0-9]/.test(aSpaces[0]) && aSpaces[0].length < 5) {
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
      @name $SP.formfields
      @namespace
      @description Retrieve the fields info in the NewForm and in the EditForm
      @return {Array} An array of hash with several keys: name, values, elements, type, and tr
      
      @param {String|Array} [fields=""] A list of fields to get (e.g. "field1,other field,field2" or ["field1","other field","field2"]) and by default we take all fields
      @param {Object} [settings] Options (see below)
        @param {Boolean} [settings.mandatory=false] Add the mandatory fields into the set
        @param {Boolean} [settings.calendar=false] Add the fields with a calendar into the set
        @param {Boolean} [settings.people=false] Add the fields with a people picker into the set
              
      @example
      $SP.formfields(); // return all the fields
      
      $SP.formfields({mandatory:true}).each(function(idx, field) { // return all the mandatory fields
        if (field.values.length==0) console.log(field.name+" is empty!");
      });
      $SP.formfields("Title,Contact Name,Email").each(function(idx, field) { // return these three fields
        console.log(field.name+" has these values: "+field.values.join(","));
      });
    */
    formfields:function(fields, settings) {
      this.reset();  
      if (arguments.length == 1 && jQuery.type(fields) === "object") { settings=fields; fields=undefined; }
      
      // default values
      settings = settings || [];
      fields   = fields   || "";
      
      var aReturn = [];
      if (jQuery.type(fields) == "string")
        fields = ( fields=="" ? [] : fields.split(",") );
    
      // add the functions
      var fctVal=function(str) {
        // it means we want to get the value
        if (str == undefined) {
          var aReturn = [];
          var val = ( jQuery.type(obj.values) == "array" ? this.values : [ this.values ] );
          for (var i=0; i < val.length; i++) {
              if (val[i] !== "") aReturn.push(val[i]);
          }
          if (aReturn.length==1) return aReturn[0];
          else if (aReturn.length==0) return "";
          else return aReturn;
        } else if (jQuery.type(str) == "string" || jQuery.type(str) == "boolean") { // we want to set a simple value
          str = [ str ];
        }
        
        // here we want to set a value
        if (jQuery.type(str) == "array") {
          for (i=0; i < this.elements.length; i++) {
            if (this.elements[i].tagName.toLowerCase() == "option") { // it's a select
              if (str.indexOf(jQuery(this.elements[i]).val()) != -1) this.elements[i].selected = true;
              else this.elements[i].selected = false;
            } else if (this.elements[i].tagName.toLowerCase() == "input" && jQuery(this.elements[i]).attr("type") == "checkbox") { // it's a checkbox
              // if it's a simple checkbox
              if (str[0] === true) this.elements[i].checked = true;
              else if (str[0] === false) this.elements[i].checked = false;
              // for several choices
              else if (str.indexOf(jQuery(this.elements[i]).next().text()) != -1) this.elements[i].checked = true;
              else this.elements[i].checked = false;
            } else if (this.elements[i].tagName.toLowerCase() == "div") { // people picker
              jQuery(this.elements[i]).text(str.join("; ")).siblings("textarea.ms-input:first").val(str.join("; "));
            } else
              jQuery(this.elements[i]).val(str.join(""));
          }
        }
        
        return this;
      };
      var fctElem = function() {
        var aReturn = [];
        for (var i=0; i<this.elements.length; i++) {
          if (this.elements[i].tagName.toLowerCase() == "option") {
            aReturn.push(jQuery(this.elements[i]).parent());
            break;
          }
          aReturn.push(this.elements[i]);
        }
        switch(aReturn.length) {
          case 0: return null;
          case 1: return jQuery(aReturn[0]);
          default: return jQuery(aReturn);
        }
      };
      var fctRow = function() { return this.tr; };
      var fctType = function() { return this.type; };
      
      // find our nodes and cache them
      // don't use jQuery for performance issue
      var table=null;
      for (var a=document.getElementsByTagName('table'), i=0, len=a.length; i<len; i++) {
        if (a[i].className.search("ms-formtable") != -1) { table = a[i]; break; } // we found our table!
      }
      if (table==null) throw("Error: unable to find the table.ms-formtable!");
      
      // this function will help to find the closest TR element instead of using jQuery.closest('tr')
      var closestTR = function(nobr) {
        var tr = nobr[0];
        do { tr=tr.parentNode; } while(tr.tagName != "TR");
        return jQuery(tr);
      };
      
      // this function will permit to find the elements
      // to be much faster than obj.tr.find('td.ms-formbody span:first').find("select[id$='_Lookup'] option,select[multiple][id$='_SelectResult'],div.ms-inputuserfield,input:radio,textarea.ms-long,input.ms-input:text,input.ms-long:text,select.ms-RadioText option,input:checkbox");
      // @param the TR element that is the parent
      var findElements = function(tr) {
        var td = tr[0].getElementsByTagName("td")[1].getElementsByTagName("span")[0];
        var elem = [];
        var input = td.getElementsByTagName("input");
        for (var i=0; i<input.length; i++) {
          var type=input[i].getAttribute("type");
          switch (type) {
            case "text": if (input[i].className.search("ms-input") != -1 || input[i].className.search("ms-long") != -1) { elem= [ input[i] ]; i=input.length; } break;
            case "radio": elem = [ input[i] ]; i=input.length; break;
            case "checkbox": elem.push(input[i]); break;
          }
        }
        if (elem.length === 0) {
          var select = td.getElementsByTagName("select");
          for (i=0; i<select.length; i++) {
            if (select[i].className.search("ms-RadioText") != -1 || (/_Lookup$|_SelectResult$/).test(select[i].id)) {
              elem = select[i].getElementsByTagName("option");
              break;
            }
          }
        }
        if (elem.length === 0) {
          var other = td.getElementsByTagName("div");
          for (i=0; i<other.length; i++) {
            if (other[i].className.search("ms-inputuserfield") != -1) { elem=[ other[i] ]; break; }
          }
          if (elem.length === 0) {
            other = td.getElementsByTagName("textarea");
              for (i=0; i<other.length; i++) {
                if (other[i].className.search("ms-long") != -1) { elem=[ other[i] ]; break; }
              }
          }
        }

        return elem;
      }

      
      // let's go through the nodes to find all fields
      var limit = (fields.length>0 ? fields.length : 1000);
      if (settings.mandatory || settings.calendar || settings.people) limit=1000;
      for (a=table.getElementsByTagName('nobr'), i=-1, len=a.length, done=0; i<len && done<limit; i++) { // we start at -1 because of Content Type
        var nobr, t, html, txt, ok=false;
        var search; // if we have to search for a value
        if (i == -1) { // handle the content type
          if (limit == 0 || fields.indexOf('Content Type') != -1) {
            html="Content Type";
            ok=true;
          }
        } else {
          tr = undefined;
          nobr = jQuery(a[i]);
          html = nobr.html();
          txt  = nobr.text(); // use this one for the &amp; and others
          // clean the html
          if (html.search("ms-formvalidation") != -1) {
            html = html.slice(0,-39);
            if (html.charAt(html.length-2)=='<' && (html.charAt(html.length-1)=='s'||html.charAt(html.length-1)=='S')) html=html.slice(0,-2); // with IE we don't have "" around the class name
            // do we want the mandatory fields ?
            if (settings.mandatory == true) { ok=true; }
            txt = txt.slice(0,-2); // it's a mandatory field so we want to remove the extra * at the end
          }

          if (!ok) {
            if (settings.calendar) {
              tr=closestTR(nobr);
              ok = (tr.find('input[id$="DateTimeFieldDate"]').length>0);
            }
            if (!ok && settings.people) {
              if (tr===undefined) tr=closestTR(nobr);
              ok = (tr.find('img[title="Check Names"]').length>0);
             }
          }
          if (!ok) {
            tr=undefined;
            if (limit == 1000 && settings.length==0) ok=true;
            else if (limit != 1000) {
              for (var k=0, lenk=limit; k<lenk; k++) {
                if (jQuery.trim(fields[k]) == txt) { ok=true; done++; break; }
              }
            }
          }
        }
       
        // if we have some fields required
        if (ok) {
          var field    = html;
          var obj      = {name: field, elements: null, values: null, tr: null, type: null};
          if (field != "Content Type") {          
            obj.tr       = (tr===undefined ? closestTR(nobr) : tr);
            obj.elements = findElements(obj.tr);
          } else { // the Content Type field is different !
            obj.elements = jQuery('[title="Content Type"]');
            obj.tr       = closestTR(obj.elements);
          }
          obj.values   = [];
          obj.val      = fctVal;
          obj.elem     = fctElem;
          obj.getType  = fctType;
          obj.row      = fctRow;
          // find values
          jQuery.each(obj.elements, function(index, el) {
            var jel = jQuery(el);
            if (el.tagName.toLowerCase() == "input" && jel.attr("type") == "checkbox") { // it's a checkbox, so we need to find the related label
              var val = "";
              obj.type = "checkbox";
              if (/BooleanField$/.test(jel.attr("id"))) { // if it's a single Yes/No box
                val = el.checked;
                obj.type = "boolean";
              }
              else if (el.checked == true) val = jel.next().text();

              if (val !== "") obj.values.push(val);
            } else if (el.tagName.toLowerCase() == "option" || el.tagName.toLowerCase() == "select") {// if it's a select
              var parent = ( el.tagName.toLowerCase() == "option" ? jel.parent() : jel );
              // if it's a multiple lookup
              if (/_SelectResult$/.test(parent.attr("id"))) {
                parent.find("option").each(function() { obj.values.push(jQuery(this).text()); });
                obj.type = "multiple";
              } else {
                // if it's a lookup value we want the TEXT and not the VALUE
                var val = ( /_Lookup$/.test(parent.attr("id")) ? parent.find("option:selected").text() : parent.val() );
                if (jQuery.type(val) == "array") { // multiple selection
                  jQuery.each(val, function(idx, v) { if (v!="" && v!=undefined) obj.values.push(v); });
                  obj.type = "multiple";
                } else {
                  if (val!="" && val!=undefined) obj.values.push(val);
                  obj.type = "select";
                }
              }
              return false;
            } else if (el.tagName.toLowerCase() == "div") {// if it's a people picker
              var val = ""
              obj.type = "people";
              var formbody = jel.closest("td.ms-formbody");
              // we search if we have a DIV with ID divEntityData in case we already have a value!
              val = ( (tmp=formbody.find("div#divEntityData").attr("key")) != undefined ? tmp : val );
              val = ( (tmp=formbody.find("input[id$='EntityKey']").val()) != undefined ? tmp : val );
              
              if (val == "") val = jel.text();
              if (val == "") val = jel.next().val();
              // if the value is empty then we try the INPUT UserField (EditForm)
              val = ( val == "" ? jel.closest("span").children("input[id$='UserField_HiddenEntityDisplayText']").val() : val );
              if (val!="" && val!=null && val!=undefined) obj.values.push(val);
            } else if (el.tagName.toLowerCase() == "input" && jel.attr("type") == "radio") { // it's some radio buttons
              obj.type = "radio";
              if (el.checked) obj.values.push(jel.next().text().replace(/^\s+/, "").replace(/\s+$/, ""));
            } else {
              obj.type = "text";
              if (/FieldDate$/.test(el.id))        obj.type = "date";
              else if (/UrlFieldUrl$/.test(el.id)) obj.type = "url";
              val = jel.val();
              if (val!="" && val!=undefined) obj.values.push(val);
            }
          });
          
          if (obj.type != "checkbox" && obj.type != "multiple" && obj.values.length == 1) obj.values = obj.values[0];
          else if (obj.values.length == 0) obj.values = "";
          aReturn.push(obj);
        }
      }

      this.data   = aReturn;
      this.length = this.data.length;
      return this;
    },
    /**
      @name $SP.formfields.val
      @function
      @description Set or Get the value(s) for the field(s) selected by "formfields"
      @return {String|Array} A string or an array of the values found
      
      @param {String|Array} [value=empty] If "str" is specified, then it means we want to set a value, if "str" is not specified then it means we want to get the value
              
      @example
      $SP.formfields("Title").val(); // return "My project"
      $SP.formfields("Title").val("My other project");
      $SP.formfields("Title").val(); // return "My other project"
    */
    val:function(str) {
      // it means we want to get the value
      if (str == undefined) {
        var aReturn = [];
        for (var k=0; k < this.data.length; k++) {
          var val = this.data[k].val();
          if (jQuery.type(val) == "array") {
            jQuery.each(val, function(idx, v) { aReturn.push(v); });
          } else
            aReturn.push(val);
        }
        if (aReturn.length==1) return aReturn[0];
        else if (aReturn.length==0) return "";
        else return aReturn;
      } else if (jQuery.type(str) == "string" || jQuery.type(str) == "boolean" || jQuery.type(str) == "number") { // we want to set a simple value
        str = [ str ];
      }
      
      // here we want to set a value
      if (jQuery.type(str) == "array") {
        for (var idx=0; idx<this.data.length; idx++) this.data[idx].val(str);
      }
      
      return this;
    },
    /**
      @name $SP.formfields.elem
      @function
      @description Get the jQuery element(s) tied with the field(s) selected by "formfields"
                   Here is the list of different HTMLElement returned:
                   - one "INPUT TEXT" for a free text field;
                   - one "SELECT" for a list of options (dropdown box);
                   - all the "INPUT CHECKBOX" for a multipe selection by checkboxes;
                   - one "TEXTAREA" for a large free text field;
                   - one "DIV" for a people picker field;
                   - one "INPUT CHECKBOX" for a yes/no radio button.
      @return {jQuery} Null is returned if nothing is found, or a jQuery object is returned for all HTMLElements found for the selected fields
                   
      @example
      $SP.formfields("Title").elem(); // return a jQuery object of the INPUT HTMLElement
      $SP.formfields("List of options").elem(); // return a jQuery object of the SELECT HTMLEelement
      
    */
    elem:function() {
      var aReturn = [];
      for (var i=0; i<this.data.length; i++) {
        jQuery.each(this.data[i].elem(), function(idx, obj) {
          aReturn.push(obj);
        });
      }
        
      switch(aReturn.length) {
        case 0: return null;
        case 1: return jQuery(aReturn[0]);
        default: return jQuery(aReturn);
      }
    },
    /**
      @name $SP.formfields.row
      @function
      @description Get the jQuery TR element(s) tied with the field(s) selected by "formfields"
      @return {jQuery} Null is returned if nothing is found, or a jQuery object is returned for all HTMLElements TR found for the selected fields
                   
      @example
      $SP.formfields("Title").row(); // return the TR element that is the parent (= the row)
     
    */
    row:function() {
      var aReturn = [];
      for (var i=0; i<this.data.length; i++) {
        jQuery.each(this.data[i].row(), function(idx, obj) {
          aReturn.push(obj);
        });
      }
        
      switch(aReturn.length) {
        case 0: return null;
        case 1: return jQuery(aReturn[0]);
        default: return jQuery(aReturn);
      }
    },
    /**
      @name $SP.formfields.type
      @function
      @description Get the type of the field(s) selected by "formfields"
                   Here is the list of different types returned:
                   - "text" for a free text field;
                   - "select" for a list of options (dropdown box);
                   - "multiple" for a list of options with multiple selection (dropdown box);
                   - "checkbox" for a multipe selection by checkboxes;
                   - "text" for a large free text field;
                   - "people" for a people picker field;
                   - "date" for a date field;
                   - "boolean" for a yes/no radio button.
      @return {String} Returns the type of the fields
                   
      @example
      $SP.formfields("Title").type(); // return "text"
      $SP.formfields("List of options").type(); // return "checkbox"
      
    */
    type:function() {
      var aReturn = [];
      for (var i=0; i<this.data.length; i++) aReturn.push(this.data[i].getType());

      switch(aReturn.length) {
        case 0: return null;
        case 1: return aReturn[0];
        default: return aReturn;
      } 
    }
  };
  
  /**
   * @description we need to extend an element for some cases with $SP.get
   **/
  var myElem = (function(){
    var myElem = function(elem) { return new MyElemConstruct(elem); },
    MyElemConstruct = function(elem) { this.mynode = elem; return this; };
    myElem.fn = MyElemConstruct.prototype = {
      getAttribute: function(id) { return this.mynode.getAttribute("ows_"+id); }
    };
    return myElem;
  })();

  SharepointPlus.del = SharepointPlus.remove;
  return window.$SP = window.SharepointPlus = SharepointPlus;

})(window);