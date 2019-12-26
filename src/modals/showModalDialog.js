import getPageSize from '../utils/getPageSize.js'
import closeModalDialog from './closeModalDialog.js'

/**
  @name $SP().showModalDialog
  @function
  @category modals
  @description Show a modal dialog (based on SP.UI.ModalDialog.showModalDialog) but provides some advanced functions and better management of the modals (for example when you launch several modals)

  @param {Object} [options] Regular options from http://msdn.microsoft.com/en-us/library/office/ff410058%28v=office.14%29.aspx with some additional ones or some changes
    @param {String} [options.html] We can directly provide the HTML code as a string
    @param {String} [options.width] If equals to "calculated", then we use the 2/3 of the viewport width; if equals to "full" then we use the full viewport width; otherwise see the original documentation (https://msdn.microsoft.com/en-us/library/office/ff410058(v=office.14).aspx)
    @param {String} [options.height] If equals to "calculated", then we use 90% of the viewport height; if equals to "full" then we use the full viewport height; otherwise see the original documentation (https://msdn.microsoft.com/en-us/library/office/ff410058(v=office.14).aspx)
    @param {Boolean} [options.closePrevious=false] It permits to close a previous modal dialog before opening this one
    @param {Boolean} [options.wait=false] If we want to show a Wait Screen (alias for $SP().waitModalDialog())
    @param {String} [options.id=random()] An unique ID to identify the modal dialog (don't use space or special characters)
    @param {Function} [options.callback] A shortcut to `dialogReturnValueCallback` with dialogResult and returnValue
    @param {Function} [options.onload] The modal might be delayed as we need to load some Sharepoint JS files; the `onload` function is called once the modal is shown
    @param {Function} [options.onurlload] When we use the "url" parameter, this is triggered when the DOMContent of the iframe is loaded (if it's the same origin)
    @param {String} [options.title] The title to give to the modal (if you use `wait:true` then it will be the main text that will appear on 2013, and the modal title for 2010)
    @param {String} [options.message] This parameter is only use if there is `wait:true` and permits to define the subtitle message for 2013, or the main message for 2010
    @param {String} [options.url] A string that contains the URL of the page that appears in the dialog. If both url and html are specified, url takes precedence. Either url or html must be specified.
    @param {Number} [options.x] An integer value that specifies the x-offset of the dialog. This value works like the CSS left value.
    @param {Number} [options.y] An integer value that specifies the y-offset of the dialog. This value works like the CSS top value.
    @param {Boolean} [options.allowMaximize] A Boolean value that specifies whether the dialog can be maximized. true if the Maximize button is shown; otherwise, false.
    @param {Boolean} [options.showMaximized] A Boolean value that specifies whether the dialog opens in a maximized state. true the dialog opens maximized. Otherwise, the dialog is opened at the requested sized if specified; otherwise, the default size, if specified; otherwise, the autosized size.
    @param {Boolean} [options.showClose=true] A Boolean value that specifies whether the Close button appears on the dialog.
    @param {Boolean} [options.autoSize] A Boolean value that specifies whether the dialog platform handles dialog sizing.
  @return {Promise} If will return an object with two parameters: dialogResult, returnValue

  @example
  // using a callback
  $SP().showModalDialog({
    title:"Dialog",
    html:'&lt;h1>Hello World&lt;/h1>&lt;p>&lt;button type="button" onclick="$SP().closeModalDialog(\'here\')">Close&lt;/button>&lt;/p>',
    callback:function(dialogResult, returnValue) {
      alert("Result="+dialogResult); // -> "here"
    }
  })

  // using as a Promise
  $SP().showModalDialog({
    title:"Dialog",
    html:'&lt;h1>Hello World&lt;/h1>&lt;p>&lt;button type="button" onclick="$SP().closeModalDialog(\'here\')">Close&lt;/button>&lt;/p>'
  })
  .then(function(res) {
    alert("Result="+res.dialogResult); // -> "here"
  })

  // show a waiting message
  $SP().waitModalDialog("Working...");
  // --- do some stuff ---
  // close the waiting message and open a new modal dialog
  $SP().showModalDialog({
    closePrevious:true,
    title:"Success",
    html:'&lt;h1>Done!&lt;/h1>'
  })
  // and use $SP().closeModalDialog() to close it
 */
export default function showModalDialog(options) {
  return new Promise(prom_res => {
    // in some weird cases the script is not loaded correctly, so we need to ensure it
    if (!global._SP_MODALDIALOG_LOADED) {
      global._SP_MODALDIALOG_LOADED=(typeof SP === "object" && typeof SP.UI === "object" && typeof SP.UI.ModalDialog === "function" && typeof SP.UI.ModalDialog.showModalDialog === "function"); // eslint-disable-line
      if (!global._SP_MODALDIALOG_LOADED) {
        LoadSodByKey("sp.ui.dialog.js", function() { // eslint-disable-line
          global._SP_MODALDIALOG_LOADED=true;
          showModalDialog.call(this, options)
          .then(function(res) { prom_res(res) })
        });
        return this;
      }
    }
    var size, ohtml;
    // source: http://stackoverflow.com/a/24603642/1134119
    function iFrameReady(a,b){function e(){d||(d=!0,clearTimeout(c),b.call(this))}function f(){"complete"===this.readyState&&e.call(this)}function g(a,b,c){return a.addEventListener?a.addEventListener(b,c):a.attachEvent("on"+b,function(){return c.call(a,window.event)})}function h(){var b=a.contentDocument||a.contentWindow.document;0!==b.URL.indexOf("about:")?"complete"===b.readyState?e.call(b):(g(b,"DOMContentLoaded",e),g(b,"readystatechange",f)):c=setTimeout(h,1)}var c,d=!1;g(a,"load",function(){var b=a.contentDocument;b||(b=a.contentWindow,b&&(b=b.document)),b&&e.call(b)}),h()} // eslint-disable-line

    options.id = (options.id || "").replace(/\W+/g,"");
    options.id = options.id || new Date().getTime();
    var modal_id = "sp_frame_"+options.id;
    if (options.html && typeof options.html === "string") {
      ohtml = document.createElement('div');
      ohtml.style.padding="10px";
      ohtml.style.display="inline-block";
      ohtml.className = "sp-showModalDialog";
      ohtml.id = 'content_'+modal_id;
      ohtml.innerHTML = options.html;
      options.html = ohtml;
    }
    // if width and height are set to "calculated" then we'll use the viewport size to define them
    if (options.width === "calculated" || options.height === "calculated") {
      size = getPageSize();
      if (options.width === "calculated") {
        options.width = size.vw.width;
        if (options.width > 768) {
          // we want to adjust to use 2/3
          options.width = 2*options.width/3
        }
      }
      if (options.height === "calculated") {
        options.height = size.vw.height;
        if (options.height > 576) {
          // we want to adjust to use 90%
          options.height = 90*options.height/100
        }
      }
    }
    if (options.width === "full" || options.height === "full") {
      size = getPageSize();
      if (options.width === "full") options.width = size.vw.width;
      if (options.height === "full") options.height = size.vw.height;
    }
    options.wait = (options.wait === true ? true : false);
    options.closePrevious = (options.closePrevious === true ? true : false);
    if (options.previousClose === true) options.closePrevious=true;
    if (options.closePrevious) closeModalDialog.call(this);

    // if showClose=false and callback is used, then showClose=false and hideClose=true
    // the reason is callback won't be triggered if showclose is false
    if (options.showClose === false && (options.dialogReturnValueCallback || options.callback)) {
      options.showClose = true;
      options.hideClose = true;
    }

    // define our own callback function to properly delete the Modal when it's closed
    var callback = options.dialogReturnValueCallback || options.callback || function() {};
    options.dialogReturnValueCallback = function(dialogResult, returnValue) {
      // if we use .close() then we have only one argument
      var id, dialog;
      if (typeof dialogResult === "object" && typeof dialogResult.type !== "undefined" && dialogResult.type === "closeModalDialog") {
        var args = dialogResult;
        dialogResult = args.dialogResult;
        returnValue = args.returnValue;
        id = args.id;
      }

      // make sure we remove the correct modal, so if "id" is provided, we look for it
      if (id) {
        for (var i=0; i<window.top._SP_MODALDIALOG.length; i++) {
          if (window.top._SP_MODALDIALOG[i].id === id) {
            dialog = window.top._SP_MODALDIALOG.splice(i, 1);
            dialog = dialog[0];
            break;
          }
        }
      }
      if (!dialog) dialog = window.top._SP_MODALDIALOG.pop();

      // remove <style> for overlay
      window.top.document.body.removeChild(window.top.document.getElementById("style_"+dialog.id));
      callback.call(this, dialogResult, returnValue);
      prom_res({dialogResult:dialogResult, returnValue:returnValue});
    };

    var fct = function() {
      var modal = (options.wait ? SP.UI.ModalDialog.showWaitScreenWithNoClose(options.title, options.message, options.height, options.width) : SP.UI.ModalDialog.showModalDialog(options)); // eslint-disable-line

      // search for the lastest iframe + ms-dlgContent in the top frame body
      var wt = window.top;
      var id = modal_id;
      var frames = wt.document.querySelectorAll('body > iframe');
      var frame = frames[frames.length-1];
      var biggestZ = 0;
      // we define an attribute to find them later
      frame.setAttribute("id", id);
      // record it into a special object
      if (typeof wt._SP_MODALDIALOG === "undefined") wt._SP_MODALDIALOG=[];

      wt._SP_MODALDIALOG.push({id:id, modal:modal, zIndex:frame.style.zIndex, options:options, type:"modalDialog"});
      // check the z-index for .ms-dlgOverlay
      wt._SP_MODALDIALOG.forEach(function(val) {
        if (val.zIndex > biggestZ) biggestZ = val.zIndex;
      });
      biggestZ--;
      wt.document.body.insertAdjacentHTML('beforeend', '<style id="style_'+id+'">.ms-dlgOverlay { z-index:'+biggestZ+' !important; display:block !important }</style>');
      // if showClose=true and callback is used, then showClose=false and hideClose=true
      // the reason is callback won't be triggered if showclose is false
      if (options.hideClose === true) {
        var cross = frame.nextSibling.querySelector('.ms-dlgCloseBtn');
        cross.parentNode.removeChild(cross);
      }
      if (typeof options.onload==="function") options.onload();
      if (options.url && options.onurlload && typeof options.onurlload === "function") {
        // find the iframe
        var frameURL = wt.document.getElementById(id);
        if (frameURL) frameURL = frameURL.nextSibling;
        if (frameURL) frameURL = frameURL.querySelector('iframe');
        if (frameURL) {
          iFrameReady(frameURL, options.onurlload)
        }
      }
    };
    SP.SOD.executeOrDelayUntilScriptLoaded(fct, 'sp.ui.dialog.js'); // eslint-disable-line
  })
}
