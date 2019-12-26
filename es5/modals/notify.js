import _setTimeout from "@babel/runtime-corejs3/core-js-stable/set-timeout";
import removeNotify from './removeNotify.js';
/**
  @name $SP().notify
  @function
  @category modals
  @description Permits to notify the user using the SP.UI.Notify.addNotification system

  @param {String} message Message to show
  @param {Object} [options]
    @param {Integer}  [options.timeout=5] The number of seconds that the notification is shown
    @param {Boolean}  [options.override=false] This option to TRUE permits to remove the previous/current notification that is showing (even if the timeout is not over and even if it's a sticky) and replace it with the new one
    @param {Boolean}  [options.overrideAll=false] Same as previously except that it will remove *all* the previous notifications that are currently showing
    @param {Boolean}  [options.overrideSticky=true] When "overrideAll:true" then even the sticky notifications are removed, but you can block this behavior with "overrideSticky:false"
    @param {Boolean}  [options.sticky=false] Keep the notification on the screen until it's manually removed (or automatically removed with "overrideAll:true" and "overrideSticky:true")
    @param {String}   [options.name=random()] You can give a name to the notification (to use it with $SP().removeNotify('name'))
    @param {Function} [options.after=function(name,afterDelay){}] You can call this function when the notification is removed -- the argument "name" is the name of the notification (see previous option), the argument "afterDelay" is TRUE when the notification has been removed by the system after it's normal timeout

  @example
  $SP().notify('Processing the data...', {sticky:true}); // the notification will stay on the screen until we remove it
  $SP().notify('All done!', {overrideAll:true}); // the "Processing the data..." is removed from the screen and a 5 seconds message says "All done!"

  $SP().notify('Please wait 10 seconds...', {
    name:"My 10 seconds notification",
    timeout:10,
    after:function(name,afterDelay) {
      if (afterDelay) alert("OK, you waited during 10 seconds!")
      else alert("Something just removed this notification called '"+name+"'' before the timeout :-(")
    }
  })
*/

export default function notify(message, options) {
  var _this = this;

  if (message === undefined) throw "[SharepointPlus notify'] you must provide the message to show.";
  if (typeof message !== "string") throw "[SharepointPlus notify'] you must provide a string for the message to show.";
  options = options || {};
  options.timeout = !isNaN(options.timeout) ? options.timeout : 5;
  options.override = options.override === true ? true : false;
  options.overrideAll = options.overrideAll === true ? true : false;
  options.overrideSticky = options.overrideSticky === false ? false : true;
  options.sticky = options.sticky === true ? true : false;
  options.name = options.name || new Date().getTime();

  options.after = options.after || function () {}; // [internal use] "fake" is used just to treat the queue due to the notifications ready


  options.fake = options.fake === true ? true : false; // [internal use] "ignoreQueue" is when we want to treat directly the message without flushing the queue

  options.ignoreQueue = options.ignoreQueue === true ? true : false; // we need core.js and sp.js

  global._SP_NOTIFY_READY = IsSodLoaded(_v_dictSod["sp.js"]) && IsSodLoaded(_v_dictSod["core.js"]); // eslint-disable-line

  if (global._SP_NOTIFY_READY === false) {
    global._SP_NOTIFY_QUEUE.push({
      message: message,
      options: options
    });
    /*ExecuteOrDelayUntilScriptLoaded(function() { // eslint-disable-line
      ExecuteOrDelayUntilScriptLoaded(function() { // eslint-disable-line
        global._SP_NOTIFY_READY=true;
        _notify.call(this,"fake",{fake:true});
      }, "core.js")
    }, "sp.js")*/


    LoadMultipleSods(["sp.js", "core.js"], function () {
      // eslint-disable-line
      global._SP_NOTIFY_READY = true;
      notify.call(_this, "fake", {
        fake: true
      });
    });
    return this;
  } else {
    // check if we don't have some notifications in queue first
    if (options.ignoreQueue !== true) {
      while (global._SP_NOTIFY_QUEUE.length > 0) {
        var a = global._SP_NOTIFY_QUEUE.shift();

        a.options.ignoreQueue = true;
        notify.call(this, a.message, a.options);
      }
    }

    if (options.fake === true) return; // for the override options

    if (global._SP_NOTIFY.length > 0) {
      if (options.overrideAll) removeNotify.call(this, {
        all: true,
        includeSticky: options.overrideSticky
      });else if (options.override) removeNotify.call(this, global._SP_NOTIFY[global._SP_NOTIFY.length - 1].name);
    }

    global._SP_NOTIFY.push({
      name: options.name,
      id: SP.UI.Notify.addNotification(message, true),
      options: options
    }); // eslint-disable-line

  } // setup a timeout


  if (!options.sticky) {
    _setTimeout(function () {
      removeNotify.call(this, options.name, {
        timeout: true
      });
    }, options.timeout * 1000);
  }
}