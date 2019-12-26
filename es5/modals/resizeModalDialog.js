/**
 * @name $SP().resizeModalDialog
 * @function
 * @category modals
 * @description Resize a ModalDialog and recenter it
 * @param  {Object} options
 *   @param {Number} width
 *   @param {Number} height
 *   @param {String} [id] The id of the modal to resize, or the last opened dialog will be used
 * @return {Boolean} FALSE if something went wrong
 *
 * @example
 * // to have a form opened faster we define a minimal width and height, and then once it's loaded we want to have the correct size
 * $SP().showModalDialog({
 *   id:"inmodal",
 *   url:url,
 *   width:200,
 *   height:100,
 *   allowMaximize:true,
 *   onurlload:function() {
 *     // resize the frame by checking the size of the loaded page
 *     var iframe=window.top.document.getElementById('sp_frame_inmodal').nextSibling.querySelector('iframe');
 *     // define the max size based on the page size
 *     var size = $SP().getPageSize();
 *     var maxWidth = 2*size.vw.width/3; // 2/3 of the viewport width
 *     var maxHeight = 90*size.vw.height/100 // 90% of the viewport height
 *     // find the size we want based on the modal
 *     var e=$(iframe.contentDocument.getElementById('onetIDListForm')); // this element gives the size of our form from the modal
 *     var width=e.outerWidth(true)+100;
 *     var height=e.outerHeight(true)+iframe.contentDocument.getElementById('ms-designer-ribbon').offsetHeight+100;
 *     if (width>maxWidth) width=maxWidth;
 *     if (height>maxHeight) height=maxHeight;
 *     $SP().resizeModalDialog({id:"inmodal",width:width,height:height});
 *     // bind the iframe resize, to make sure an external event won't resize it to 200x100
 *     $(iframe.contentWindow).on('resize', function() {
 *       var $this=$(this);
 *       if ($this.width() === 200 && $this.height() === 100) { // if it gets the original size, then resize to the new ones
 *         $SP().resizeModalDialog({id:"inmodal",width:width,height:height});
 *       }
 *     })
 *   }
 * });
 */
export default function resizeModalDialog(options) {
  var dlg, dialogElements, deltaWidth, deltaHeight, key;

  var pxToNum = function pxToNum(px) {
    return px.replace(/px/, "") * 1;
  };

  var wt = window.top;

  if (!options.id) {
    if (wt._SP_MODALDIALOG.length === 0) return false; // no modal

    options.id = wt._SP_MODALDIALOG[wt._SP_MODALDIALOG.length - 1].id.replace(/sp_frame_/, "");
  } // find dialog element


  dlg = wt.document.getElementById('sp_frame_' + options.id);
  if (!dlg) return false; // cannot find the modal

  dlg = dlg.nextSibling;
  options.width = options.width === undefined ? pxToNum(dlg.style.width) : options.width;
  options.height = options.height === undefined ? pxToNum(dlg.style.height) : options.height; // inspiration: https://social.msdn.microsoft.com/Forums/office/en-US/d92508be-4b4b-4f78-86d3-5d15a510bb18/how-do-i-resize-a-dialog-box-once-its-open?forum=sharepointdevelopmentprevious

  dialogElements = {
    "Border": dlg.querySelector('.ms-dlgBorder'),
    "TitleText": dlg.querySelector('.ms-dlgTitleText'),
    "Content": dlg,
    "Frame": dlg.querySelector('.ms-dlgFrame')
  }; // calculate width & height delta

  deltaWidth = options.width - pxToNum(dialogElements.Border.style.width);
  deltaHeight = options.height - pxToNum(dialogElements.Border.style.height);

  for (key in dialogElements) {
    if (Object.prototype.hasOwnProperty.call(dialogElements, key) && dialogElements[key]) {
      dialogElements[key].style.width = pxToNum(dialogElements[key].style.width) + deltaWidth + "px"; // set the height, excluding title elements

      if (key !== "TitleText") dialogElements[key].style.height = pxToNum(dialogElements[key].style.height) + deltaHeight + "px";
    }
  } // now we recenter


  var pageSize = this.getPageSize(wt);
  dlg.style.top = pageSize.vw.height / 2 - pxToNum(dlg.style.height) / 2 + "px";
  dlg.style.left = pageSize.vw.width / 2 - pxToNum(dlg.style.width) / 2 + "px";
}