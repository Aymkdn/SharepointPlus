/**
  @name $SP().closeModalDialog
  @function
  @category modals
  @description Close the last modal dialog

  @param {Object} [dialogResult] One of the enumeration values specifying the result of the modal dialog (SP.UI.DialogResult|), or the modal object returned by $SP().getModalDialog()
  @param {Object} [returnValue] The return value of the modal dialog

  @example
  // if the user use the cross to close the modal, then `dialogResult` equals to 0 in the callback
  // but you can trigger the close of the modal and pass anything you want
  $SP().showModalDialog({
    id:"demo",
    title:"Hello World",
    html:'&lt;p>This is an example. Click one of the buttons.&lt;/p>&lt;p class="ms-alignCenter">&lt;button onclick="$SP().closeModalDialog(\'Continue has been clicked\')">Continue&lt;/button>&lt;/p>',
    callback:function(res) {
      alert(res)
    }
  })

  // or
  var modal = $SP().getModalDialog('demo');
  if (modal) $SP().closeModalDialog(modal);
 */
export default function closeModalDialog(dialogResult, returnValue) {
  var fct = function() {
    var md;
    if (typeof dialogResult === "object" && dialogResult.type === "modalDialog") {
      md = {id:dialogResult.id, dialogResult:returnValue, returnValue:undefined, type:"closeModalDialog"};
      dialogResult.modal.close(md);
      // if it's a wait screen, then we need to remove the <style> using options.dialogReturnValueCallBack
      if (dialogResult.options.wait) dialogResult.options.dialogReturnValueCallback(md, returnValue);
    } else {
      if (typeof window.top._SP_MODALDIALOG !== "undefined") {
        md=window.top._SP_MODALDIALOG;
        if (md.length>0) {
          md = md[md.length-1];

          // close has only one parameter
          md.modal.close({id:md.id, dialogResult:dialogResult, returnValue:returnValue, type:"closeModalDialog"});
          // if it's a wait screen, then we need to remove the <style> using options.dialogReturnValueCallBack
          if (md.options.wait) md.options.dialogReturnValueCallback(dialogResult, returnValue);
          return false;
        }
      }
      SP.UI.ModalDialog.commonModalDialogClose(dialogResult, returnValue); // eslint-disable-line
    }
  };
  SP.SOD.executeOrDelayUntilScriptLoaded(fct, 'sp.ui.dialog.js'); // eslint-disable-line

  return false;
}
