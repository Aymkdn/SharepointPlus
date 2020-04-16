import _regeneratorRuntime from "@babel/runtime-corejs3/regenerator";
import _forEachInstanceProperty from "@babel/runtime-corejs3/core-js-stable/instance/for-each";
import _getIterator from "@babel/runtime-corejs3/core-js/get-iterator";
import _Promise from "@babel/runtime-corejs3/core-js-stable/promise";
import _asyncToGenerator from "@babel/runtime-corejs3/helpers/esm/asyncToGenerator";
import views from './views.js';
import ajax from '../utils/ajax.js';
import _buildBodyForSOAP from './_buildBodyForSOAP.js';
/**
  @name $SP().list.view
  @function
  @description Get the view's details (like selected fields, order by, where, ....)

  @param {String} [viewID="The default view"] The view ID or view Name
  @param {Object} [options] (see below)
    @param {Boolean} [options.cache=true] Get the view's info from the cache
  @return {Promise} resolve({DefaultView, Name, ID, Type, Url, OrderBy, Fields, RowLimit, WhereCAML}), reject(error)

  @example
  $SP().list("List Name").view("All Items").then(function(res) {
    for (var i=0; i&lt;res.Fields.length; i++) console.log("Column "+i+": "+res.Fields[i]);
    console.log("And the GUI for this view is :"+res.ID);
  });
*/

export default function view(_x, _x2) {
  return _view.apply(this, arguments);
}

function _view() {
  _view = _asyncToGenerator(
  /*#__PURE__*/
  _regeneratorRuntime.mark(function _callee(viewID, options) {
    var _this = this;

    var _context, list, i, found, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, c, _views, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, v, data, node, where, oReturn, arr;

    return _regeneratorRuntime.wrap(function _callee$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.prev = 0;

            if (this.listID) {
              _context2.next = 3;
              break;
            }

            return _context2.abrupt("return", _Promise.reject("[SharepointPlus 'view'] the list ID/Name is required."));

          case 3:
            if (viewID) {
              _context2.next = 5;
              break;
            }

            return _context2.abrupt("return", _Promise.reject("[SharepointPlus 'view'] the view ID/Name is required."));

          case 5:
            // default values
            list = this.listID, found = false;
            options = options || {};
            options.cache = options.cache === false ? false : true;

            if (this.url) {
              _context2.next = 10;
              break;
            }

            return _context2.abrupt("return", _Promise.reject("[SharepointPlus 'view'] not able to find the URL!"));

          case 10:
            if (!options.cache) {
              _context2.next = 38;
              break;
            }

            _iteratorNormalCompletion = true;
            _didIteratorError = false;
            _iteratorError = undefined;
            _context2.prev = 14;
            _iterator = _getIterator(global._SP_CACHE_SAVEDVIEW);

          case 16:
            if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
              _context2.next = 24;
              break;
            }

            c = _step.value;

            if (!(c.url === this.url && c.list === list && (c.viewID === viewID || c.viewName === viewID))) {
              _context2.next = 21;
              break;
            }

            found = true;
            return _context2.abrupt("return", _Promise.resolve(c.data));

          case 21:
            _iteratorNormalCompletion = true;
            _context2.next = 16;
            break;

          case 24:
            _context2.next = 30;
            break;

          case 26:
            _context2.prev = 26;
            _context2.t0 = _context2["catch"](14);
            _didIteratorError = true;
            _iteratorError = _context2.t0;

          case 30:
            _context2.prev = 30;
            _context2.prev = 31;

            if (!_iteratorNormalCompletion && _iterator.return != null) {
              _iterator.return();
            }

          case 33:
            _context2.prev = 33;

            if (!_didIteratorError) {
              _context2.next = 36;
              break;
            }

            throw _iteratorError;

          case 36:
            return _context2.finish(33);

          case 37:
            return _context2.finish(30);

          case 38:
            if (!(viewID.charAt(0) !== '{')) {
              _context2.next = 69;
              break;
            }

            _context2.next = 41;
            return views.call(this);

          case 41:
            _views = _context2.sent;
            _iteratorNormalCompletion2 = true;
            _didIteratorError2 = false;
            _iteratorError2 = undefined;
            _context2.prev = 45;
            _iterator2 = _getIterator(_views);

          case 47:
            if (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done) {
              _context2.next = 54;
              break;
            }

            v = _step2.value;

            if (!(v.Name === viewID)) {
              _context2.next = 51;
              break;
            }

            return _context2.abrupt("return", view.call(this, v.ID));

          case 51:
            _iteratorNormalCompletion2 = true;
            _context2.next = 47;
            break;

          case 54:
            _context2.next = 60;
            break;

          case 56:
            _context2.prev = 56;
            _context2.t1 = _context2["catch"](45);
            _didIteratorError2 = true;
            _iteratorError2 = _context2.t1;

          case 60:
            _context2.prev = 60;
            _context2.prev = 61;

            if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
              _iterator2.return();
            }

          case 63:
            _context2.prev = 63;

            if (!_didIteratorError2) {
              _context2.next = 66;
              break;
            }

            throw _iteratorError2;

          case 66:
            return _context2.finish(63);

          case 67:
            return _context2.finish(60);

          case 68:
            return _context2.abrupt("return", _Promise.reject("[SharepointPlus 'view'] not able to find the view called '" + viewID + "' for list '" + this.listID + "' at " + this.url));

          case 69:
            _context2.next = 71;
            return ajax.call(this, {
              url: this.url + "/_vti_bin/Views.asmx",
              body: _buildBodyForSOAP("GetView", '<listName>' + this.listID + '</listName><viewName>' + viewID + '</viewName>'),
              headers: {
                'SOAPAction': 'http://schemas.microsoft.com/sharepoint/soap/GetView'
              }
            });

          case 71:
            data = _context2.sent;
            node = data.getElementsByTagName('View');
            node = node.length > 0 ? node[0] : null;
            oReturn = {
              DefaultView: node.getAttribute("DefaultView") == "TRUE",
              Name: node.getAttribute("DisplayName"),
              ID: viewID,
              Type: node.getAttribute("Type"),
              Url: node.getAttribute("Url"),
              OrderBy: [],
              Fields: [],
              RowLimit: "",
              WhereCAML: "",
              Node: node
            };
            arr = data.getElementsByTagName('ViewFields')[0].getElementsByTagName('FieldRef'); // find fields

            for (i = 0; i < arr.length; i++) {
              oReturn.Fields.push(arr[i].getAttribute("Name"));
            } // find orderby


            arr = data.getElementsByTagName('OrderBy');
            arr = arr.length > 0 ? arr[0] : null;

            if (arr) {
              arr = arr.getElementsByTagName('FieldRef');

              for (i = 0; i < arr.length; i++) {
                oReturn.OrderBy.push(arr[i].getAttribute("Name") + " " + (arr[i].getAttribute("Ascending") == undefined ? "ASC" : "DESC"));
              }

              oReturn.OrderBy = oReturn.OrderBy.join(",");
            } else oReturn.OrderBy = ""; // find where


            where = data.getElementsByTagName('Where');
            where = where.length > 0 ? where[0] : null;

            if (where) {
              where = where.xml || new XMLSerializer().serializeToString(where);
              where = where.match(/<Where [^>]+>(.*)<\/Where>/);
              if (where.length == 2) oReturn.WhereCAML = where[1];
            } // cache the data


            found = false;

            _forEachInstanceProperty(_context = global._SP_CACHE_SAVEDVIEW).call(_context, function (c) {
              if (c.url === _this.url && c.list === list && (c.viewID === viewID || c.viewName === viewID)) {
                c.data = oReturn;
                found = true;
              }
            });

            if (!found) global._SP_CACHE_SAVEDVIEW.push({
              url: this.url,
              list: this.listID,
              data: oReturn,
              viewID: viewID,
              viewName: oReturn.Name
            });
            return _context2.abrupt("return", _Promise.resolve(oReturn));

          case 89:
            _context2.prev = 89;
            _context2.t2 = _context2["catch"](0);
            return _context2.abrupt("return", _Promise.reject(_context2.t2));

          case 92:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee, this, [[0, 89], [14, 26, 30, 38], [31,, 33, 37], [45, 56, 60, 68], [61,, 63, 67]]);
  }));
  return _view.apply(this, arguments);
}