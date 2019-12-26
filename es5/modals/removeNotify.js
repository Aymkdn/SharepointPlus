import _spliceInstanceProperty from "@babel/runtime-corejs3/core-js-stable/instance/splice";
import _sliceInstanceProperty from "@babel/runtime-corejs3/core-js-stable/instance/slice";
import _setTimeout from "@babel/runtime-corejs3/core-js-stable/set-timeout";
import _typeof from "@babel/runtime-corejs3/helpers/esm/typeof";

/**
  @name $SP().removeNotify
  @function
  @category modals
  @description Permits to remove a notification that is shown on the screen

  @param {String} [name] Name of the notification
  @param {Object} [options] If you pass the options, then the 'name' is ignored
    @param {Boolean} [options.all=false] To TRUE to remove ALL notifications
    @param {Boolean} [options.includeSticky=true] To FALSE if you don't want to remove the sticky notifications (only works with the "all:true" option)

  @example
  $SP().notify('Processing the data...', {sticky:true,name:"Processing data"}); // the notification will stay on the screen until we remove it
  $SP().removeNotify("Processing data"); // the notification is removed

  $SP().notify('Doing some stuff...');
  $SP().notify('Doing some other stuff...');
  $SP().removeNotify({all:true}); // all the notifications are removed

  $SP().notify('Doing some stuff...');
  $SP().notify('Doing some other stuff...');
  $SP().notify('This is a sticky message', {sticky:true});
  $SP().removeNotify({all:true, includeSticky:false}); // all the notifications are removed except the sticky one
*/
export default function removeNotify(name, options) {
  var _this = this;

  switch (arguments.length) {
    case 0:
      throw "Error 'removeNotify': you must provide 'name' or 'options'.";

    case 2:
      {
        if (_typeof(options) !== "object") throw "Error 'removeNotify': you must provide an object for 'options'.";
      }
  }

  if (arguments.length === 1 && _typeof(name) === "object") {
    options = name;
    name = undefined;
  }

  options = options || {
    all: false
  }; // [internal use] timeout is a boolean to say if it's a timeout remove or if we forced it

  options.timeout = options.timeout === true ? true : false; // make sure we are ready

  if (global._SP_NOTIFY_READY === false && global._SP_NOTIFY_QUEUE.length > 0) {
    _setTimeout(function () {
      return removeNotify.call(_this, name, options);
    }, 150);

    return this;
  }

  var notif; // if we want to delete all the notifications

  if (options.all === true) {
    var a = [];

    while (global._SP_NOTIFY.length > 0) {
      notif = global._SP_NOTIFY.shift();
      if (options.includeSticky === false && notif.options.sticky === true) a.push(notif);else {
        SP.UI.Notify.removeNotification(notif.id); // eslint-disable-line

        _setTimeout(function () {
          return notif.options.after.call(_this, notif.name, false);
        }, 150);
      }
    }

    global._SP_NOTIFY = _sliceInstanceProperty(a).call(a, 0); // if we want to keep the sticky notifs
  } else if (name !== undefined) {
    // search for the notification
    for (var i = 0, len = global._SP_NOTIFY.length; i < len; i++) {
      if (global._SP_NOTIFY[i].name == name) {
        var _context;

        notif = _spliceInstanceProperty(_context = global._SP_NOTIFY).call(_context, i, 1)[0];
        SP.UI.Notify.removeNotification(notif.id); // eslint-disable-line

        _setTimeout(function () {
          return notif.options.after.call(_this, notif.name, options.timeout);
        }, 150);

        return this;
      }
    }
  }

  return this;
}