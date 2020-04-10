"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js-stable/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports["default"] = stopWorkflow;

var _setTimeout2 = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/set-timeout"));

var _now = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/date/now"));

var _promise = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/promise"));

var _getWorkflowID = _interopRequireDefault(require("./getWorkflowID.js"));

/**
 * @name $SP().list.stopWorkflow
 * @function
 * @description Stop/Terminate a Workflow 2010 instance (this is only for Workflow 2010) -- this technique uses an iframe to load the workflow page and trigger the "End the workflow" link, so make sure the user has correct permissions, uses a browser and is on the same website
 *
 * @param {Object} setup
 *   @param {Number} setup.ID The item ID that is tied to the workflow
 *   @param {String} setup.workflowName The name of the workflow
 * @return {Promise} resolve(), reject(error)
 *
 * @example
 * $SP().list("List Name").stopWorkflow({ID:42, workflowName:"My workflow"});
 */
function stopWorkflow(setup) {
  if (!this.url) throw "[SharepointPlus 'stopWorkflow'] not able to find the URL!";
  setup = setup || {};
  if (!setup.workflowName && !setup.workflowID) throw "[SharepointPlus 'stopWorkflow'] Please provide the workflow name";
  if (!setup.ID) throw "[SharepointPlus 'stopWorkflow'] Please provide the item ID"; // retrieve the workflow instances

  return _getWorkflowID["default"].call(this, {
    ID: setup.ID,
    workflowName: setup.workflowName
  }).then(function (params) {
    var lenInstances = params.instances.length;
    if (lenInstances === 0) return _promise["default"].reject("[SharepointPlus 'stopWorkflow'] No instances found for this workflow");
    var lastIntance = params.instances[lenInstances - 1];
    var idx = (0, _now["default"])();
    return new _promise["default"](function (prom_res) {
      // we use an iframe
      document.body.insertAdjacentHTML('beforeend', '<iframe id="iframe_' + idx + '" />');
      var fr = document.getElementById('iframe_' + idx);

      fr.onload = function () {
        fr.contentWindow.__doPostBack('ctl00$PlaceHolderMain$HtmlAnchorEnd', '');

        (0, _setTimeout2["default"])(function () {
          document.body.removeChild(fr);
          prom_res();
        }, 1000);
      };

      fr.src = lastIntance.StatusPageUrl;
    });
  });
}

module.exports = exports.default;