import ajax from '../utils/ajax.js'
import _buildBodyForSOAP from './_buildBodyForSOAP.js'
import get from './get.js'

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
export default async function getWorkflowID(setup) {
  try {
    if (!this.listID) throw "[SharepointPlus 'getWorkflowID'] the list ID/Name is required.";
    if (!this.url) throw "[SharepointPlus 'getWorkflowID'] not able to find the URL!"; // we cannot determine the url
    setup = setup || {};
    if (!setup.ID || !setup.workflowName) throw "[SharepointPlus 'getWorkflowID'] all parameters are mandatory";

    // find the fileRef
    let d = await get.call(this, {fields:"FieldRef",where:"ID = "+setup.ID});

    if (d.length===0) throw "[SharepointPlus 'getWorkflowID'] I'm not able to find the item ID "+setup.ID;

    let fileRef = this.cleanResult(d[0].getAttribute("FileRef"));
    if(!this.url.startsWith("http")) {
      // we need to find the full path
      fileRef=window.location.href.split("/").slice(0,3).join("/") + "/" + fileRef;
    }
    if (!fileRef.startsWith("http")) {
      fileRef = this.url.split("/").slice(0,3).join("/") +"/" + fileRef;
    }

    let data = await ajax.call(this, {
      url: this.url+"/_vti_bin/Workflow.asmx",
      body: _buildBodyForSOAP("GetWorkflowDataForItem", '<item>'+fileRef+'</item>', "http://schemas.microsoft.com/sharepoint/soap/workflow/"),
      headers:{'SOAPAction':'http://schemas.microsoft.com/sharepoint/soap/workflow/GetWorkflowDataForItem'}
    })

    // we want to use myElem to change the getAttribute function
    let res={},i,row, rows=data.getElementsByTagName('WorkflowTemplate');
    if (rows.length===0) {
      if (typeof SP === "undefined") throw "[SharepointPlus 'getWorkflowID'] This function must be executed from a Sharepoint page (JSOM support is required).";
      // depending of the permissions, we couldn't have the WorkflowTemplate data
      // in that case we have to get the workflow ID with another way
      let context = SP.ClientContext.get_current(); // eslint-disable-line
      let lists = context.get_web().get_lists();
      let list = lists.getByTitle(this.listID);
      let item = list.getItemById(setup.ID);
      context.load(list);
      context.load(item);
      let workflows = list.get_workflowAssociations();
      context.load(workflows);
      let res = await new Promise((prom_res, prom_rej) => {
        context.executeQueryAsync(function() {
          let enumerator = workflows.getEnumerator();
          while(enumerator.moveNext()) {
            let workflow = enumerator.get_current();
            if (workflow.get_name() === setup.workflowName) {
              res = {
                "fileRef":fileRef,
                "description":workflow.get_description(),
                "workflowID":"{"+workflow.get_id().toString()+"}",
                "instances":[]
              }
              break;
            }
          }
          prom_res(res);
        },
        function() {
          prom_rej("[SharepointPlus 'getWorkflowID'] Problem while dealing with SP.ClientContext.get_current()");
        });
      });

      return Promise.resolve(res);
    } else {
      for (i=rows.length; i--;) {
        if (rows[i].getAttribute("Name") == setup.workflowName) {
          res = {
            "fileRef":fileRef,
            "description":rows[i].getAttribute("Description"),
            "workflowID":"{"+rows[i].getElementsByTagName('WorkflowTemplateIdSet')[0].getAttribute("TemplateId")+"}",
            "instances":[]
          };
        }
      }
      if (!res.fileRef) {
        throw "[SharepointPlus 'getWorkflowID'] it seems the requested workflow ('"+setup.workflowName+"') doesn't exist!";
      }
      rows=data.getElementsByTagName("Workflow");
      for (i=0; i<rows.length; i++) {
        row=rows[i];
        res.instances.push({
          "StatusPageUrl":row.getAttribute("StatusPageUrl"),
          "Id":row.getAttribute("Id"),
          "TemplateId":row.getAttribute("TemplateId"),
          "ListId":row.getAttribute("ListId"),
          "SiteId":row.getAttribute("SiteId"),
          "WebId":row.getAttribute("WebId"),
          "ItemId":row.getAttribute("ItemId"),
          "ItemGUID":row.getAttribute("ItemGUID"),
          "TaskListId":row.getAttribute("TaskListId"),
          "AdminTaskListId":row.getAttribute("AdminTaskListId"),
          "Author":row.getAttribute("Author"),
          "Modified":row.getAttribute("Modified"),
          "Created":row.getAttribute("Created"),
          "StatusVersion":row.getAttribute("StatusVersion"),
          "Status1":{"code":row.getAttribute("Status1"), "text":this.workflowStatusToText(row.getAttribute("Status1"))},
          "Status2":{"code":row.getAttribute("Status2"), "text":this.workflowStatusToText(row.getAttribute("Status2"))},
          "Status3":{"code":row.getAttribute("Status3"), "text":this.workflowStatusToText(row.getAttribute("Status3"))},
          "Status4":{"code":row.getAttribute("Status4"), "text":this.workflowStatusToText(row.getAttribute("Status4"))},
          "Status5":{"code":row.getAttribute("Status5"), "text":this.workflowStatusToText(row.getAttribute("Status5"))},
          "Status6":{"code":row.getAttribute("Status6"), "text":this.workflowStatusToText(row.getAttribute("Status6"))},
          "Status7":{"code":row.getAttribute("Status7"), "text":this.workflowStatusToText(row.getAttribute("Status7"))},
          "Status8":{"code":row.getAttribute("Status8"), "text":this.workflowStatusToText(row.getAttribute("Status8"))},
          "Status9":{"code":row.getAttribute("Status9"), "text":this.workflowStatusToText(row.getAttribute("Status9"))},
          "Status10":{"code":row.getAttribute("Status10"), "text":this.workflowStatusToText(row.getAttribute("Status10"))},
          "TextStatus1":row.getAttribute("TextStatus1"),
          "TextStatus2":row.getAttribute("TextStatus2"),
          "TextStatus3":row.getAttribute("TextStatus3"),
          "TextStatus4":row.getAttribute("TextStatus4"),
          "TextStatus5":row.getAttribute("TextStatus5"),
          "Modifications":row.getAttribute("Modifications"),
          "InternalState":row.getAttribute("InternalState"),
          "ProcessingId":row.getAttribute("ProcessingId")
        });
      }
      return Promise.resolve(res);
    }
  } catch(err) {
    return Promise.reject(err);
  }
}
