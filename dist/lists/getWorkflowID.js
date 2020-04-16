"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js-stable/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.default = getWorkflowID;

var _regenerator = _interopRequireDefault(require("@babel/runtime-corejs3/regenerator"));

var _promise = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/promise"));

var _slice = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/slice"));

var _startsWith = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/starts-with"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/asyncToGenerator"));

var _ajax = _interopRequireDefault(require("../utils/ajax.js"));

var _buildBodyForSOAP2 = _interopRequireDefault(require("./_buildBodyForSOAP.js"));

var _get = _interopRequireDefault(require("./get.js"));

/**
 * @name $SP().list.getWorkflowID
 * @function
 * @description Find the WorkflowID for a workflow, and some other related info
 *
 * @param {Object} setup
 *   @param {Number} setup.ID The item ID that is tied to the workflow
 *   @param {String} setup.workflowName The name of the workflow
 * @return {Promise} resolve({workflowID, fileRef, description, instances}), reject(error)
 *
 * @example
 * $SP().list("List Name").getWorkflowID({ID:15, workflowName:"Workflow for List Name (manual)"}).then(function(params) {
 *   alert("Workflow ID:"+params.workflowID+" and the FileRef is: "+params.fileRef);
 * });
 */
function getWorkflowID(_x) {
  return _getWorkflowID.apply(this, arguments);
}

function _getWorkflowID() {
  _getWorkflowID = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee(setup) {
    var _context, d, fileRef, _context2, _context3, data, res, i, row, rows, context, lists, list, item, workflows, _res;

    return _regenerator.default.wrap(function _callee$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _context4.prev = 0;

            if (this.listID) {
              _context4.next = 3;
              break;
            }

            throw "[SharepointPlus 'getWorkflowID'] the list ID/Name is required.";

          case 3:
            if (this.url) {
              _context4.next = 5;
              break;
            }

            throw "[SharepointPlus 'getWorkflowID'] not able to find the URL!";

          case 5:
            // we cannot determine the url
            setup = setup || {};

            if (!(!setup.ID || !setup.workflowName)) {
              _context4.next = 8;
              break;
            }

            throw "[SharepointPlus 'getWorkflowID'] all parameters are mandatory";

          case 8:
            _context4.next = 10;
            return _get.default.call(this, {
              fields: "FieldRef",
              where: "ID = " + setup.ID
            });

          case 10:
            d = _context4.sent;

            if (!(d.length === 0)) {
              _context4.next = 13;
              break;
            }

            throw "[SharepointPlus 'getWorkflowID'] I'm not able to find the item ID " + setup.ID;

          case 13:
            fileRef = this.cleanResult(d[0].getAttribute("FileRef"));

            if (!(0, _startsWith.default)(_context = this.url).call(_context, "http")) {
              // we need to find the full path
              fileRef = (0, _slice.default)(_context2 = window.location.href.split("/")).call(_context2, 0, 3).join("/") + "/" + fileRef;
            }

            if (!(0, _startsWith.default)(fileRef).call(fileRef, "http")) {
              fileRef = (0, _slice.default)(_context3 = this.url.split("/")).call(_context3, 0, 3).join("/") + "/" + fileRef;
            }

            _context4.next = 18;
            return _ajax.default.call(this, {
              url: this.url + "/_vti_bin/Workflow.asmx",
              body: (0, _buildBodyForSOAP2.default)("GetWorkflowDataForItem", '<item>' + fileRef + '</item>', "http://schemas.microsoft.com/sharepoint/soap/workflow/"),
              headers: {
                'SOAPAction': 'http://schemas.microsoft.com/sharepoint/soap/workflow/GetWorkflowDataForItem'
              }
            });

          case 18:
            data = _context4.sent;
            // we want to use myElem to change the getAttribute function
            res = {}, rows = data.getElementsByTagName('WorkflowTemplate');

            if (!(rows.length === 0)) {
              _context4.next = 37;
              break;
            }

            if (!(typeof SP === "undefined")) {
              _context4.next = 23;
              break;
            }

            throw "[SharepointPlus 'getWorkflowID'] This function must be executed from a Sharepoint page (JSOM support is required).";

          case 23:
            // depending of the permissions, we couldn't have the WorkflowTemplate data
            // in that case we have to get the workflow ID with another way
            context = SP.ClientContext.get_current(); // eslint-disable-line

            lists = context.get_web().get_lists();
            list = lists.getByTitle(this.listID);
            item = list.getItemById(setup.ID);
            context.load(list);
            context.load(item);
            workflows = list.get_workflowAssociations();
            context.load(workflows);
            _context4.next = 33;
            return new _promise.default(function (prom_res, prom_rej) {
              context.executeQueryAsync(function () {
                var enumerator = workflows.getEnumerator();

                while (enumerator.moveNext()) {
                  var workflow = enumerator.get_current();

                  if (workflow.get_name() === setup.workflowName) {
                    _res = {
                      "fileRef": fileRef,
                      "description": workflow.get_description(),
                      "workflowID": "{" + workflow.get_id().toString() + "}",
                      "instances": []
                    };
                    break;
                  }
                }

                prom_res(_res);
              }, function () {
                prom_rej("[SharepointPlus 'getWorkflowID'] Problem while dealing with SP.ClientContext.get_current()");
              });
            });

          case 33:
            _res = _context4.sent;
            return _context4.abrupt("return", _promise.default.resolve(_res));

          case 37:
            for (i = rows.length; i--;) {
              if (rows[i].getAttribute("Name") == setup.workflowName) {
                res = {
                  "fileRef": fileRef,
                  "description": rows[i].getAttribute("Description"),
                  "workflowID": "{" + rows[i].getElementsByTagName('WorkflowTemplateIdSet')[0].getAttribute("TemplateId") + "}",
                  "instances": []
                };
              }
            }

            if (res.fileRef) {
              _context4.next = 40;
              break;
            }

            throw "[SharepointPlus 'getWorkflowID'] it seems the requested workflow ('" + setup.workflowName + "') doesn't exist!";

          case 40:
            rows = data.getElementsByTagName("Workflow");

            for (i = 0; i < rows.length; i++) {
              row = rows[i];
              res.instances.push({
                "StatusPageUrl": row.getAttribute("StatusPageUrl"),
                "Id": row.getAttribute("Id"),
                "TemplateId": row.getAttribute("TemplateId"),
                "ListId": row.getAttribute("ListId"),
                "SiteId": row.getAttribute("SiteId"),
                "WebId": row.getAttribute("WebId"),
                "ItemId": row.getAttribute("ItemId"),
                "ItemGUID": row.getAttribute("ItemGUID"),
                "TaskListId": row.getAttribute("TaskListId"),
                "AdminTaskListId": row.getAttribute("AdminTaskListId"),
                "Author": row.getAttribute("Author"),
                "Modified": row.getAttribute("Modified"),
                "Created": row.getAttribute("Created"),
                "StatusVersion": row.getAttribute("StatusVersion"),
                "Status1": {
                  "code": row.getAttribute("Status1"),
                  "text": this.workflowStatusToText(row.getAttribute("Status1"))
                },
                "Status2": {
                  "code": row.getAttribute("Status2"),
                  "text": this.workflowStatusToText(row.getAttribute("Status2"))
                },
                "Status3": {
                  "code": row.getAttribute("Status3"),
                  "text": this.workflowStatusToText(row.getAttribute("Status3"))
                },
                "Status4": {
                  "code": row.getAttribute("Status4"),
                  "text": this.workflowStatusToText(row.getAttribute("Status4"))
                },
                "Status5": {
                  "code": row.getAttribute("Status5"),
                  "text": this.workflowStatusToText(row.getAttribute("Status5"))
                },
                "Status6": {
                  "code": row.getAttribute("Status6"),
                  "text": this.workflowStatusToText(row.getAttribute("Status6"))
                },
                "Status7": {
                  "code": row.getAttribute("Status7"),
                  "text": this.workflowStatusToText(row.getAttribute("Status7"))
                },
                "Status8": {
                  "code": row.getAttribute("Status8"),
                  "text": this.workflowStatusToText(row.getAttribute("Status8"))
                },
                "Status9": {
                  "code": row.getAttribute("Status9"),
                  "text": this.workflowStatusToText(row.getAttribute("Status9"))
                },
                "Status10": {
                  "code": row.getAttribute("Status10"),
                  "text": this.workflowStatusToText(row.getAttribute("Status10"))
                },
                "TextStatus1": row.getAttribute("TextStatus1"),
                "TextStatus2": row.getAttribute("TextStatus2"),
                "TextStatus3": row.getAttribute("TextStatus3"),
                "TextStatus4": row.getAttribute("TextStatus4"),
                "TextStatus5": row.getAttribute("TextStatus5"),
                "Modifications": row.getAttribute("Modifications"),
                "InternalState": row.getAttribute("InternalState"),
                "ProcessingId": row.getAttribute("ProcessingId")
              });
            }

            return _context4.abrupt("return", _promise.default.resolve(res));

          case 43:
            _context4.next = 48;
            break;

          case 45:
            _context4.prev = 45;
            _context4.t0 = _context4["catch"](0);
            return _context4.abrupt("return", _promise.default.reject(_context4.t0));

          case 48:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee, this, [[0, 45]]);
  }));
  return _getWorkflowID.apply(this, arguments);
}

module.exports = exports.default;