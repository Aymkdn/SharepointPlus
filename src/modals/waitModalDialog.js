import showModalDialog from './showModalDialog.js'

/**
 * @name $SP().waitModalDialog
 * @function
 * @category modals
 * @description Shortcut for SP.UI.ModalDialog.showWaitScreenWithNoClose()
 *
 * @param {String} [title="Working on it..."] The main message with the loading spin for SP2013, or the modal window title for SP2010
 * @param {String} [subtitle=""] The subtitle for SP2013, or the main message with the loading spin for SP2010
 * @param {Number} [height] The modal height
 * @param {Number} [width] The modal width
 */
export default function waitModalDialog(title, subtitle, height, width) {
  return showModalDialog.call(this, {
    wait:true,
    title:title||"Working...",
    message:subtitle,
    width:width,
    height:height
  });
}
