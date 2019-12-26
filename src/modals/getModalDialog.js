/**
 * @name $SP().getModalDialog
 * @function
 * @category modals
 * @description Retrieve the modal object for a special modalDialog
 *
 * @param {String} id The ID of the modal
 * @return {Object} The modal object or NULL if the modal doesnt exist
 *
 * @example
 * var modal = $SP().getModalDialog("MyModal");
 * $SP().closeModalDialog(modal);
 */
export default function getModalDialog(id) {
  if (typeof window.top._SP_MODALDIALOG !== "undefined") {
    var md=window.top._SP_MODALDIALOG;
    id = id.replace(/\W+/g,"");
    for (var i=0; i<md.length; i++) {
      if (md[i].id === "sp_frame_"+id) {
        return md[i];
      }
    }
  }
  return null;
}
