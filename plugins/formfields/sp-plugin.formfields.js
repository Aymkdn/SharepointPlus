if (typeof $SP === "undefined") throw 'Error formfields: SharepointPlus must be loaded first!'
var _SP_CACHE_FORMFIELDS=null;
$SP().registerPlugin('formfields', function(options) {
  var spThis=this;
  var SharepointPlusFormFields=function(fields, settings) {
    this.data=[];
    this.length=0;
  }
  /**
   * @ignore
   */
  SharepointPlusFormFields.prototype.reset=function() { this.data=[]; this.length=0 }
  /**
   * @name $SP().formfields
   * @function
   * @description Retrieve the fields info in the NewForm and in the EditForm
   * @plugin formfields
   * @return {Array} An array of hash with several keys: name, values, elements, type, and tr
   *
   * @param {String|Array} [fields=""] A list of fields to get (e.g. "field1,other field,field2" or ["field1","other field","field2"]) and by default we take all fields ... ATTENTION if you have a field with "," then use only the Array as a parameter
   * @param {Object} [setup] Options (see below)
   *   @param {Boolean} [setup.mandatory=undefined] Set it to 'true' to look for the mandatory fields (the "false" value has no effect)
   *   @param {Boolean} [setup.cache=true] By default the form is scanned only once, but you can use {cache:false} to force the form to be rescanned
   *
   * @example
   * $SP().formfields(); // return all the fields
   *
   * $SP().formfields({mandatory:true}).each(function() { // return all the mandatory fields
   *   var field = this;
   *   if (field.val().length==0) console.log(field.name()+" is empty!");
   * });
   * $SP().formfields("Title,Contact Name,Email").each(function() { // return these three fields
   *   var field = this;
   *   console.log(field.name()+" has these values: "+field.val());
   * });
   * // if you have a field with a comma use an Array
   * $SP().formfields(["Title","Long field, isn't it?","Contact Name","Email"]).each(function() {
   *   var field = this;
   *   console.log(field.name()+" has the description: "+field.description());
   * });
   * // returns the fields "Title" and "New & York", and also the mandatory fields
   * $SP().formfields(["Title", "New & York"],{mandatory:true});
   */
  SharepointPlusFormFields.prototype.formfields=function(fields, settings) {
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
        idx=fieldNames.indexOf(fields[i]);
        if (idx > -1) aReturn.push(allFields[idx])
      }
      for (i=0,len=(settings.mandatory?allFields.length:0); i<len; i++) {
        if (allFields[i]._isMandatory && fields.indexOf(allFields[i]._name) === -1) aReturn.push(allFields[i])
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
      return (mtch ? {"Name":mtch[1].replace(/&amp;/g,"&"), "InternalName":mtch[2], "SPType":mtch[3]} : {"Name":"", "InternalName":"", "SPType":""});
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
          options[o].selected = (isArray ? val.indexOf(v) > -1 : (val == v));
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
        if (includeThisField || fields.indexOf('Content Type') > -1) {
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
          if (limit !== bigLimit && fields.indexOf(infoFromComments.Name) > -1) {
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
                    if (v) doc.querySelector('div').innerHTML=v;
                    else return doc.querySelector('div').innerHTML;
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
                          tmp.forEach(function(e) { res.push(e.DisplayText) });
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
                    v.forEach(function(e) {
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
                        idx = v.indexOf(getText(elems[i].nextSibling));
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
  }
  /**
   * @name $SP().formfields.each
   * @function
   * @plugin formfields
   * @description Permits to go thru the different fields
   * @example
   * // To print in the console the names of all the fields
   * $SP().formfields().each(function() {
   *   console.log(this.name()); // -> return the name of the field
   *   console.log(this.isMandatory()); // -> returns TRUE if it's a mandatory field
   * })
   */
  SharepointPlusFormFields.prototype.each=function(fct) {
    for (var i=0,len=this.data.length; i<len; i++) fct.call(this.data[i])
    return this;
  }
  /**
   * @name $SP().formfields.val
   * @function
   * @plugin formfields
   * @description Set or Get the value(s) for the field(s) selected by "formfields"
   * @param {String|Array} [value=empty] If "str" is specified, then it means we want to set a value, if "str" is not specified then it means we want to get the value
   * @param {Object} options
   *   @param {Boolean} [identity=false] If set to TRUE then the return values will be a hashmap with "field name" => "field value"
   *   @param {Boolean} [extend=false} In the case of a PeoplePicker under SP2013 it will return the People object
   * @return {String|Array|Object} Return the value of the field(s)
  *
   * @example
   * $SP().formfields("Title").val(); // return "My project"
   * $SP().formfields("Title").val("My other project");
   * $SP().formfields("Title").val(); // return "My other project"
   *
   * // it will set "Choice 1" and "Choice 2" for the "Make your choice" field, and "2012/12/31" for the "Booking Date" field
   * $SP().formfields("Make your choice,Booking Date").val([ ["Choice 1","Choice 2"], "2012/12/31" ]);
   *
   * // it will set "My Value" for all the fields
   * $SP().formfields("Make your choice,Title,Other Field").val("My Value");
   *
   * // it will return an array; each item represents a field
   * $SP().formfields("Make your choice,Title,Other Field").val(); // -> [ ["My Value"], "My Value", "Other Field" ]
   *
   * // for a Link field
   * $SP().formfields("Link").val(["http://www.dell.com","Dell"]) // -> "Dell" is used as the description of the link, and "http://www.dell.com" as the Web address
   *
   * // it will return a hashmap
   * $SP().formfields("Make your choice,Title,Other Field").val({identity:true}); // -> {"Make your choice":["My Value"], "Title":"My Value", "Other Field":"My Value"}
   *
   * // for SP2013 people picker
   * $SP().formfields("Manager Name").val({extend:true}); // -> [ { Key="i:0#.w|domain\john_doe",  Description="domain\john_doe",  DisplayText="Doe, John",  ...} ]
   * $SP().formfields("Manager Name").val(); // -> "Doe, John"
   */
  SharepointPlusFormFields.prototype.val=function(str) {
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
  }
  /**
   *  @name $SP().formfields.elem
   *  @function
   *  @plugin formfields
   *  @description Get the HTML element(s) tied with the field(s) selected by "formfields"
   *  @param {Boolean} [usejQuery=true] If jQuery is loaded, then by default the elements will be jQuery object; use FALSE to get the regular DOM elements
   *  @return {Array|HTMLElement|jQuery} Null is returned if nothing is found, or the found elements... if jQuery is defined then the HTML elements will be jQueryrize
   *
   *  @example
   *  $SP().formfields("Title").elem(); // -> returns a HTML INPUT TEXT
   *  $SP().formfields("List of options").elem(); // -> returns a HTML SELECT
   */
  SharepointPlusFormFields.prototype.elem=function(usejQuery) {
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
  }
  /**
   * @name $SP().formfields.row
   * @function
   * @plugin formfields
   * @description Get the TR element(s) tied with the field(s) selected by "formfields"
   * @return {Array|HTMLElement|jQuery} Null is returned if nothing is found, or the TR HTMLElement... or a jQuery object is returned if jQuery exists
   *
   * @example
   * $SP().formfields("Title").row(); // return the TR element that is the parent (= the row)
   * $SP().formfields("Title").row().hide(); // because we have jQuery we can apply the hide()
   */
  SharepointPlusFormFields.prototype.row=function() {
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
  }
  /**
   * @name $SP().formfields.type
   * @function
   * @plugin formfields
   * @description
   * Get the type of the field(s) selected by "formfields"
   * Here is the list of different types returned:
   *    - "text" for the free text field;
   *    - "number" for Number field;
   *    - "currency" for Currency field;
   *    - "text multiple" for the multiple lines of plain text;
   *    - "html multiple" for the multiple lines of text in rich mode;
   *    - "attachments" for the attachments field;
   *    - "lookup" for a lookup field (dropdown);
   *    - "lookup multiple" for a lookup field with multiple selection (two dropdowns with two buttons);
   *    - "content type" for the content type field;
   *    - "boolean" for the yes/no checkbox;
   *    - "date" for a date only field;
   *    - "date time" for a date and time field;
   *    - "choices" for a dropdown selection;
   *    - "choices plus" for a dropdown selection with an input field to enter our own value;
   *    - "choices radio" for the radio buttons selection;
   *    - "choices radio plus" for the radio buttons selection with an input field to enter our own value;
   *    - "choices checkbox" for the checkboxes field for a selection;
   *    - "choices checkbox plus" for the checkboxes field for a selection with an input field to enter our own value;
   *    - "people" for the people picker field;
   *    - "people multiple" for the people picker field with multiple selection;
   *    - "url" for the link/url/picture field.
   * @return {String|Array} Returns the type of the field(s)
   * @example
   * $SP().formfields("Title").type(); // return "text"
   * $SP().formfields("List of options").type(); // return "choices"
   */
  SharepointPlusFormFields.prototype.type=function() {
    var aReturn = [];
    this.each(function() { aReturn.push(this.type()) })

    switch(aReturn.length) {
      case 0: return "";
      case 1: return aReturn[0];
      default: return aReturn;
    }
  }
  /**
  * @name $SP().formfields.description
  * @function
  * @plugin formfields
  * @description Get the description of the field(s) selected by "formfields"
  *
  * @return {String|Array} Returns the description of the field(s)
  *
  * @example
  * $SP().formfields("Title").description(); // return "This is the description of this field"
  * $SP().formfields("List of options").description(); // return "", it means no description
  */
  SharepointPlusFormFields.prototype.description=function() {
    var aReturn = [];
    this.each(function() { aReturn.push(this.description()) })

    switch(aReturn.length) {
      case 0: return "";
      case 1: return aReturn[0];
      default: return aReturn;
    }
  }
  /**
   * @name $SP().formfields.isMandatory
   * @function
   * @plugin formfields
   * @description Say if a field is mandatory
   *
   * @return {Boolean|Array} Returns the mandatory status of the field(s)
   * @example
   * $SP().formfields("Title").isMandatory(); // return True or False
   * $SP().formfields(["Field1", "Field2"]).isMandatory(); // return [ True/False, True/False ]
   */
  SharepointPlusFormFields.prototype.isMandatory=function() {
    var aReturn = [];
    this.each(function() { aReturn.push(this.isMandatory()) })

    switch(aReturn.length) {
      case 0: return false;
      case 1: return aReturn[0];
      default: return aReturn;
    }
  }
  /**
   * @name $SP().formfields.name
   * @function
   * @plugin formfields
   * @description Return the field name
   * @return {String|Array} Returns the name of the field(s)
   * @example
   * $SP().formfields("Subject").name(); // return "Subject"
   * $SP().formfields(["Field Name", "My Field"]).name(); // return [ "Field Name", "My Field" ]
   */
  SharepointPlusFormFields.prototype.name=function() {
    var aReturn = [];
    this.each(function() { aReturn.push(this.name()) })

    switch(aReturn.length) {
      case 0: return "";
      case 1: return aReturn[0];
      default: return aReturn;
    }
  }
  /**
   * @name $SP().formfields.internalname
   * @function
   * @plugin formfields
   * @description Return the field internalname
   * @return {String|Array} Returns the internalname of the field(s)
   * @example
   * $SP().formfields("Subject").internalname(); // return "Title"
   * $SP().formfields(["Field Name", "My Field"]).internalname(); // return [ "Field_x0020_Name", "My_x0020_Field" ]
   */
  SharepointPlusFormFields.prototype.internalname=function() {
    var aReturn = [];
    this.each(function() { aReturn.push(this.internalname()) })

    switch(aReturn.length) {
      case 0: return "";
      case 1: return aReturn[0];
      default: return aReturn;
    }
  }

  return new SharepointPlusFormFields().formfields(options.fields, options.settings);
})
