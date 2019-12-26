/**
  @name $SP().list.startWorkflow2013
  @function
  @description Manually start a work (that has been set to be manually started) (for "Sharepoint 2013 workflow" as the platform type)

  @param {Object} setup
    @param {Number} [setup.ID] The item ID that tied to the workflow
    @param {String} setup.workflowName The name of the workflow
    @param {Array|Object} [setup.parameters] An array of object with {name:"Name of the parameter", value:"Value of the parameter"}
  @return {Promise} resolve() when started, reject(error)

  @example
  // if you want to call a Site Workflow, just leave the list name empty and don't provide an item ID, e.g.:
  $SP().list("").startWorkflow2013({workflowName:"My Site Workflow"});

  // to start a workflow for a list item
  $SP().list("List Name").startWorkflow2013({ID:15, workflowName:"Workflow for List Name (manual)", parameters:{name:"Message",value:"Welcome here!"}).then(function() {
    console.log("workflow started")
  }, function(error) {
    console.log("Error: ",error);
  });
**/
export default function startWorkflow2013(setup) {
  return new Promise((prom_resolve, prom_reject) => {
    if (!this.url) throw "[SharepointPlus 'startWorkflow2013'] not able to find the URL!";

    setup = setup || {};
    setup.platformType = setup.platformType || 2013; // internal use when calling Site Workflow from startWorkflow()
    if (!setup.workflowName) throw "[SharepointPlus 'startWorkflow2013'] Please provide the workflow name."
    if (this.listID && !setup.ID) throw "Error 'startWorkflow2013': Please provide the item ID."

    // we need "sp.workflowservices.js"
    if (typeof SP === "undefined" || typeof SP.SOD === "undefined") { // eslint-disable-line
      throw "[SharepointPlus 'startWorkflow2013']: SP.SOD.executeFunc is required (from the Microsoft file called init.js)";
    }

    SP.SOD.executeFunc("sp.js", "SP.ClientContext" , function(){ // eslint-disable-line
      SP.SOD.registerSod('sp.workflowservices.js', SP.Utilities.Utility.getLayoutsPageUrl('sp.workflowservices.js')); // eslint-disable-line
      SP.SOD.executeFunc('sp.workflowservices.js', "SP.WorkflowServices.WorkflowServicesManager", function() { // eslint-disable-line
        var context = new SP.ClientContext(this.url); // eslint-disable-line
        var web = context.get_web();

        var servicesManager = SP.WorkflowServices.WorkflowServicesManager.newObject(context, web); // eslint-disable-line
        context.load(servicesManager);
        // list the existing workflows
        var subscriptions = servicesManager.getWorkflowSubscriptionService().enumerateSubscriptions();
        context.load(subscriptions);

        context.executeQueryAsync(function() {
          var subsEnum = subscriptions.getEnumerator(), sub;
          var initiationParams = {}, i, passed=false;
          var workflowName = setup.workflowName.toLowerCase();
          // set the parameters
          if (setup.parameters) {
            if (setup.parameters.length === undefined) setup.parameters = [ setup.parameters ];
            for (i=0; i<setup.parameters.length; i++)
              initiationParams[setup.parameters[i].name] = setup.parameters[i].value;
          }

          if (setup.platformType == 2010) {
            var interopService = servicesManager.getWorkflowInteropService();
            interopService.startWorkflow(workflowName, null, null, null, initiationParams);
            context.executeQueryAsync(function() {
              prom_resolve()
            }, function(sender, args) {
              var errorMessage = args.get_message();
              if (errorMessage === "associationName") errorMessage = "No workflow found with the name '"+setup.workflowName+"'";
              prom_reject(errorMessage);
            });
          } else {
            // go thru all the workflows to find the one we want to initiate
            while (subsEnum.moveNext()) {
              sub = subsEnum.get_current();
              if (sub.get_name().toLowerCase() === workflowName) {

                if (setup.ID) servicesManager.getWorkflowInstanceService().startWorkflowOnListItem(sub, setup.ID, initiationParams);
                else servicesManager.getWorkflowInstanceService().startWorkflow(sub, initiationParams);
                context.executeQueryAsync(function() {
                  prom_resolve()
                }, function(sender, args) {
                  prom_reject(args.get_message())
                });
                passed=true;
                break;
              }
            }
            if (!passed) {
              prom_reject("No workflow found with the name '"+setup.workflowName+"'");
            }
          }
        }, function(sender, args) {
          prom_reject(args.get_message())
        });
      });
    })
  })
}
