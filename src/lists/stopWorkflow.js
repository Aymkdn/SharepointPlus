import getWorkflowID from './getWorkflowID.js'

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
  if (!setup.workflowName && !setup.workflowID) throw "[SharepointPlus 'stopWorkflow'] Please provide the workflow name"
  if (!setup.ID) throw "[SharepointPlus 'stopWorkflow'] Please provide the item ID"

  // retrieve the workflow instances
  return getWorkflowID.call(this, {ID:setup.ID, workflowName:setup.workflowName})
  .then(function(params) {
    let lenInstances = params.instances.length;
    if (lenInstances===0) return Promise.reject("[SharepointPlus 'stopWorkflow'] No instances found for this workflow");
    let lastIntance = params.instances[lenInstances-1];
    let idx = Date.now();
    return new Promise(prom_res => {
      // we use an iframe
      document.body.insertAdjacentHTML('beforeend', '<iframe id="iframe_'+idx+'" />');
      let fr = document.getElementById('iframe_'+idx);
      fr.onload=function() {
        fr.contentWindow.__doPostBack('ctl00$PlaceHolderMain$HtmlAnchorEnd','');
        setTimeout(function() {
          document.body.removeChild(fr);
          prom_res();
        }, 1000);
      }
      fr.src=lastIntance.StatusPageUrl;
    });
  });
}
