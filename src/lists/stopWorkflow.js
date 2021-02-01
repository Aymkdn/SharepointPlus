import getWorkflowID from './getWorkflowID.js'
import ajax from '../utils/ajax.js'

/**
 * @name $SP().list.stopWorkflow
 * @function
 * @description Stop/Terminate a Workflow 2010 instance (this is only for Workflow 2010)
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
  .then(async wrkflw => {
    let lenInstances = wrkflw.instances.length;
    if (lenInstances===0) return Promise.reject("[SharepointPlus 'stopWorkflow'] No instances found for this workflow");
    let lastInstance = wrkflw.instances[lenInstances-1];
    let html = await ajax.call(this, {url:lastInstance.StatusPageUrl});
    let requestDigest = html.match(/<input type="hidden" name="__REQUESTDIGEST" id="__REQUESTDIGEST" value=".*" \/>/g);
    if (!requestDigest) throw "[SharepointPlus 'stopWorkflow'] Unable to find the __REQUESTDIGEST from the Workflow Status page";
    requestDigest = requestDigest[0].match(/<input type="hidden" name="__REQUESTDIGEST" id="__REQUESTDIGEST" value="(.*)" \/>/)[1];

    let viewState = html.match(/<input type="hidden" name="__VIEWSTATE" id="__VIEWSTATE" value=".*" \/>/g);
    if (!viewState) throw "[SharepointPlus 'stopWorkflow'] Unable to find the __VIEWSTATE from the Workflow Status page";
    viewState = viewState[0].match(/<input type="hidden" name="__VIEWSTATE" id="__VIEWSTATE" value="(.*)" \/>/)[1];

    let viewStateGenerator = html.match(/<input type="hidden" name="__VIEWSTATEGENERATOR" id="__VIEWSTATEGENERATOR" value=".*" \/>/g);
    if (!viewStateGenerator) throw "[SharepointPlus 'stopWorkflow'] Unable to find the __VIEWSTATEGENERATOR from the Workflow Status page";
    viewStateGenerator = viewStateGenerator[0].match(/<input type="hidden" name="__VIEWSTATEGENERATOR" id="__VIEWSTATEGENERATOR" value="(.*)" \/>/)[1];

    let eventValidation = html.match(/<input type="hidden" name="__EVENTVALIDATION" id="__EVENTVALIDATION" value=".*" \/>/g);
    if (!eventValidation) throw "[SharepointPlus 'stopWorkflow'] Unable to find the __EVENTVALIDATION from the Workflow Status page";
    eventValidation = eventValidation[0].match(/<input type="hidden" name="__EVENTVALIDATION" id="__EVENTVALIDATION" value="(.*)" \/>/)[1];

    let params = {};
    params.MSOWebPartPage_PostbackSource = '';
    params.MSOTlPn_SelectedWpId = '';
    params.MSOTlPn_View = 0;
    params.MSOTlPn_ShowSettings = "False";
    params.MSOGallery_SelectedLibrary = '';
    params.MSOGallery_FilterString = '';
    params.MSOTlPn_Button = "none";
    params.__EVENTTARGET = "ctl00$PlaceHolderMain$HtmlAnchorEnd";
    params.__EVENTARGUMENT = "";
    params.MSOSPWebPartManager_DisplayModeName = "Browse";
    params.MSOSPWebPartManager_ExitingDesignMode = 'false';
    params.MSOWebPartPage_Shared = '';
    params.MSOLayout_LayoutChanges = '';
    params.MSOLayout_InDesignMode = '';
    params.MSOSPWebPartManager_OldDisplayModeName = 'Browse';
    params.MSOSPWebPartManager_StartWebPartEditingName = 'false';
    params.MSOSPWebPartManager_EndWebPartEditing = 'false';
    params._maintainWorkspaceScrollPosition = 0;
    params.__REQUESTDIGEST = requestDigest;
    params.__VIEWSTATE = viewState;
    params.__VIEWSTATEGENERATOR = viewStateGenerator;
    params.__SCROLLPOSITIONX = 0;
    params.__SCROLLPOSITIONY = 0;
    params.__EVENTVALIDATION = eventValidation;
    params["ctl00$PlaceHolderMain$WorkflowInstanceID"] = lastInstance.Id;
    params["ctl00$PlaceHolderMain$WorkflowInstanceName"] = '';
    params["ctl00$PlaceHolderMain$CachedTaskQueryString"] = '';
    params["ctl00$PlaceHolderMain$CachedHistoryQueryString"] = '';

    // call the page to stop the workflow
    await ajax.call(this, {
      url:lastInstance.StatusPageUrl,
      method:'POST',
      headers:{
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body:Object.keys(params).map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`).join('&')
    });
  });
}
