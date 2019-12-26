import _regeneratorRuntime from "@babel/runtime-corejs3/regenerator";
import _sliceInstanceProperty from "@babel/runtime-corejs3/core-js-stable/instance/slice";
import _Promise from "@babel/runtime-corejs3/core-js-stable/promise";
import _asyncToGenerator from "@babel/runtime-corejs3/helpers/esm/asyncToGenerator";
import ajax from '../utils/ajax.js';
import _buildBodyForSOAP from './_buildBodyForSOAP.js';
import getContentTypes from './getContentTypes.js';
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

export default function getContentTypeInfo(_x, _x2) {
  return _getContentTypeInfo.apply(this, arguments);
}

function _getContentTypeInfo() {
  _getContentTypeInfo = _asyncToGenerator(
  /*#__PURE__*/
  _regeneratorRuntime.mark(function _callee(contentType, options) {
    var _i,
        types,
        _i2,
        data,
        aReturn,
        i,
        j,
        a,
        r,
        k,
        q,
        arr,
        index,
        aIndex,
        attributes,
        attrName,
        lenDefault,
        attrValue,
        nodeDefault,
        _args = arguments;

    return _regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (this.listID) {
              _context.next = 2;
              break;
            }

            throw "[SharepointPlus 'getContentTypeInfo'] the list ID/Name is required.";

          case 2:
            if (!(_args.length >= 1 && typeof contentType !== "string")) {
              _context.next = 4;
              break;
            }

            throw "[SharepointPlus 'getContentTypeInfo'] the Content Type Name/ID is required.";

          case 4:
            if (this.url) {
              _context.next = 6;
              break;
            }

            throw "[SharepointPlus 'getContentTypeInfo'] not able to find the URL!";

          case 6:
            // we cannot determine the url
            options = options || {
              cache: true
            }; // look at the cache

            if (!options.cache) {
              _context.next = 15;
              break;
            }

            _i = 0;

          case 9:
            if (!(_i < global._SP_CACHE_CONTENTTYPE.length)) {
              _context.next = 15;
              break;
            }

            if (!(global._SP_CACHE_CONTENTTYPE[_i].list === this.listID && global._SP_CACHE_CONTENTTYPE[_i].url === this.url && global._SP_CACHE_CONTENTTYPE[_i].contentType === contentType)) {
              _context.next = 12;
              break;
            }

            return _context.abrupt("return", _Promise.resolve(global._SP_CACHE_CONTENTTYPE[_i].info));

          case 12:
            _i++;
            _context.next = 9;
            break;

          case 15:
            if (!(_sliceInstanceProperty(contentType).call(contentType, 0, 2) !== "0x")) {
              _context.next = 26;
              break;
            }

            _context.next = 18;
            return getContentTypes.call(this, options);

          case 18:
            types = _context.sent;
            _i2 = types.length;

          case 20:
            if (!_i2--) {
              _context.next = 25;
              break;
            }

            if (!(types[_i2]["Name"] === contentType)) {
              _context.next = 23;
              break;
            }

            return _context.abrupt("return", getContentTypeInfo.call(this, types[_i2]["ID"], options));

          case 23:
            _context.next = 20;
            break;

          case 25:
            throw "[SharepointPlus 'getContentTypeInfo'] not able to find the Content Type called '" + contentType + "' at " + this.url;

          case 26:
            _context.next = 28;
            return ajax.call(this, {
              url: this.url + "/_vti_bin/lists.asmx",
              body: _buildBodyForSOAP("GetListContentType", '<listName>' + this.listID + '</listName><contentTypeId>' + contentType + '</contentTypeId>'),
              headers: {
                'SOAPAction': 'http://schemas.microsoft.com/sharepoint/soap/GetListContentType'
              }
            });

          case 28:
            data = _context.sent;
            aReturn = [], arr = data.getElementsByTagName('Field'), index = 0;
            i = 0;

          case 31:
            if (!(i < arr.length)) {
              _context.next = 62;
              break;
            }

            if (!arr[i].getAttribute("ID")) {
              _context.next = 59;
              break;
            }

            aReturn[index] = [];
            aIndex = aReturn[index];
            attributes = arr[i].attributes;
            j = attributes.length;

          case 37:
            if (!j--) {
              _context.next = 56;
              break;
            }

            attrName = attributes[j].nodeName;
            attrValue = attributes[j].nodeValue;

            if (!(attrName === "Type")) {
              _context.next = 53;
              break;
            }

            _context.t0 = attrValue;
            _context.next = _context.t0 === "Choice" ? 44 : _context.t0 === "MultiChoice" ? 44 : _context.t0 === "Lookup" ? 50 : _context.t0 === "LookupMulti" ? 50 : 52;
            break;

          case 44:
            aIndex["FillInChoice"] = arr[i].getAttribute("FillInChoice");
            a = arr[i].getElementsByTagName("CHOICE");
            r = [];

            for (k = 0; k < a.length; k++) {
              r.push(a[k].firstChild.nodeValue);
            }

            aIndex["Choices"] = r;
            return _context.abrupt("break", 53);

          case 50:
            aIndex["Choices"] = {
              list: arr[i].getAttribute("List"),
              field: arr[i].getAttribute("ShowField")
            };
            return _context.abrupt("break", 53);

          case 52:
            aIndex["Choices"] = [];

          case 53:
            aIndex[attrName] = attrValue;

          case 54:
            _context.next = 37;
            break;

          case 56:
            // find the default values
            lenDefault = arr[i].getElementsByTagName("Default").length;

            if (lenDefault > 0) {
              nodeDefault = arr[i].getElementsByTagName("Default");
              aReturn[index]["DefaultValue"] = [];

              for (q = 0; q < lenDefault; q++) {
                nodeDefault[q].firstChild && aReturn[index]["DefaultValue"].push(nodeDefault[q].firstChild.nodeValue);
              }

              if (lenDefault === 1) aReturn[index]["DefaultValue"] = aReturn[index]["DefaultValue"][0];
            } else aReturn[index]["DefaultValue"] = null;

            index++;

          case 59:
            i++;
            _context.next = 31;
            break;

          case 62:
            // we cache the result
            global._SP_CACHE_CONTENTTYPE.push({
              "list": this.listID,
              "url": this.url,
              "contentType": contentType,
              "info": aReturn
            });

            return _context.abrupt("return", _Promise.resolve(aReturn));

          case 64:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this);
  }));
  return _getContentTypeInfo.apply(this, arguments);
}