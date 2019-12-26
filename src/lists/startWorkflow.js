import ajax from '../utils/ajax.js'
import _buildBodyForSOAP from './_buildBodyForSOAP.js'
import startWorkflow2013 from './startWorkflow2013.js'
import getWorkflowID from './getWorkflowID.js'

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
export default async function startWorkflow(setup) {
  try {
    if (!this.url) throw "[SharepointPlus 'startWorkflow'] not able to find the URL!";

    // if no listID then it's a Site Workflow so we use startWorkflow2013
    if (!this.listID) {
      setup.platformType=2010;
      return startWorkflow2013.call(this, setup);
    }
    setup = setup || {};
    if (!setup.workflowName && !setup.workflowID) throw "[SharepointPlus 'startWorkflow'] Please provide the workflow name"
    if (!setup.ID) throw "[SharepointPlus 'startWorkflow'] Please provide the item ID"

    // find the FileRef and templateID
    if (!setup.fileRef && !setup.workflowID) {
      let params = await getWorkflowID.call(this, {ID:setup.ID,workflowName:setup.workflowName})
      setup.fileRef=params.fileRef;
      setup.workflowID=params.workflowID;
    }

    // define the parameters if any
    let workflowParameters = "<root />", p, i;
    if (setup.parameters) {
      if (!Array.isArray(setup.parameters)) setup.parameters = [ setup.parameters ];
      p = setup.parameters.slice(0);
      workflowParameters = "<Data>";
      for (i=0; i<p.length; i++) workflowParameters += "<"+p[i].name+">"+p[i].value+"</"+p[i].name+">";
      workflowParameters += "</Data>";
    }

    await ajax.call(this, {
      url: this.url + "/_vti_bin/Workflow.asmx",
      body:_buildBodyForSOAP("StartWorkflow", "<item>"+setup.fileRef+"</item><templateId>"+setup.workflowID+"</templateId><workflowParameters>"+workflowParameters+"</workflowParameters>", "http://schemas.microsoft.com/sharepoint/soap/workflow/"),
      headers:{'SOAPAction':'http://schemas.microsoft.com/sharepoint/soap/workflow/StartWorkflow'}
    });

    return Promise.resolve();
  } catch(err) {
    return Promise.reject(err);
  }
}
