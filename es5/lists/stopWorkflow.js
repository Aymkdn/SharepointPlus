import _setTimeout from "@babel/runtime-corejs3/core-js-stable/set-timeout";
import _Date$now from "@babel/runtime-corejs3/core-js-stable/date/now";
import _Promise from "@babel/runtime-corejs3/core-js-stable/promise";
import getWorkflowID from './getWorkflowID.js';
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

export default function stopWorkflow(setup) {
  if (!this.url) throw "[SharepointPlus 'stopWorkflow'] not able to find the URL!";
  setup = setup || {};
  if (!setup.workflowName && !setup.workflowID) throw "[SharepointPlus 'stopWorkflow'] Please provide the workflow name";
  if (!setup.ID) throw "[SharepointPlus 'stopWorkflow'] Please provide the item ID"; // retrieve the workflow instances

  return getWorkflowID.call(this, {
    ID: setup.ID,
    workflowName: setup.workflowName
  }).then(function (params) {
    var lenInstances = params.instances.length;
    if (lenInstances === 0) return _Promise.reject("[SharepointPlus 'stopWorkflow'] No instances found for this workflow");
    var lastIntance = params.instances[lenInstances - 1];

    var idx = _Date$now();

    return new _Promise(function (prom_res) {
      // we use an iframe
      document.body.insertAdjacentHTML('beforeend', '<iframe id="iframe_' + idx + '" />');
      var fr = document.getElementById('iframe_' + idx);

      fr.onload = function () {
        fr.contentWindow.__doPostBack('ctl00$PlaceHolderMain$HtmlAnchorEnd', '');

        _setTimeout(function () {
          document.body.removeChild(fr);
          prom_res();
        }, 1000);
      };

      fr.src = lastIntance.StatusPageUrl;
    });
  });
}