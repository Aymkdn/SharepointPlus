"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js-stable/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.default = startWorkflow;

var _regenerator = _interopRequireDefault(require("@babel/runtime-corejs3/regenerator"));

var _promise = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/promise"));

var _slice = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/slice"));

var _isArray = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/array/is-array"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/asyncToGenerator"));

var _ajax = _interopRequireDefault(require("../utils/ajax.js"));

var _buildBodyForSOAP2 = _interopRequireDefault(require("./_buildBodyForSOAP.js"));

var _startWorkflow2 = _interopRequireDefault(require("./startWorkflow2013.js"));

var _getWorkflowID = _interopRequireDefault(require("./getWorkflowID.js"));

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
function startWorkflow(_x) {
  return _startWorkflow.apply(this, arguments);
}

function _startWorkflow() {
  _startWorkflow = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee(setup) {
    var params, workflowParameters, p, i, _context;

    return _regenerator.default.wrap(function _callee$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.prev = 0;

            if (this.url) {
              _context2.next = 3;
              break;
            }

            throw "[SharepointPlus 'startWorkflow'] not able to find the URL!";

          case 3:
            if (this.listID) {
              _context2.next = 6;
              break;
            }

            setup.platformType = 2010;
            return _context2.abrupt("return", _startWorkflow2.default.call(this, setup));

          case 6:
            setup = setup || {};

            if (!(!setup.workflowName && !setup.workflowID)) {
              _context2.next = 9;
              break;
            }

            throw "[SharepointPlus 'startWorkflow'] Please provide the workflow name";

          case 9:
            if (setup.ID) {
              _context2.next = 11;
              break;
            }

            throw "[SharepointPlus 'startWorkflow'] Please provide the item ID";

          case 11:
            if (!(!setup.fileRef && !setup.workflowID)) {
              _context2.next = 17;
              break;
            }

            _context2.next = 14;
            return _getWorkflowID.default.call(this, {
              ID: setup.ID,
              workflowName: setup.workflowName
            });

          case 14:
            params = _context2.sent;
            setup.fileRef = params.fileRef;
            setup.workflowID = params.workflowID;

          case 17:
            // define the parameters if any
            workflowParameters = "<root />";

            if (setup.parameters) {
              if (!(0, _isArray.default)(setup.parameters)) setup.parameters = [setup.parameters];
              p = (0, _slice.default)(_context = setup.parameters).call(_context, 0);
              workflowParameters = "<Data>";

              for (i = 0; i < p.length; i++) {
                workflowParameters += "<" + p[i].name + ">" + p[i].value + "</" + p[i].name + ">";
              }

              workflowParameters += "</Data>";
            }

            _context2.next = 21;
            return _ajax.default.call(this, {
              url: this.url + "/_vti_bin/Workflow.asmx",
              body: (0, _buildBodyForSOAP2.default)("StartWorkflow", "<item>" + setup.fileRef + "</item><templateId>" + setup.workflowID + "</templateId><workflowParameters>" + workflowParameters + "</workflowParameters>", "http://schemas.microsoft.com/sharepoint/soap/workflow/"),
              headers: {
                'SOAPAction': 'http://schemas.microsoft.com/sharepoint/soap/workflow/StartWorkflow'
              }
            });

          case 21:
            return _context2.abrupt("return", _promise.default.resolve());

          case 24:
            _context2.prev = 24;
            _context2.t0 = _context2["catch"](0);
            return _context2.abrupt("return", _promise.default.reject(_context2.t0));

          case 27:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee, this, [[0, 24]]);
  }));
  return _startWorkflow.apply(this, arguments);
}

module.exports = exports.default;