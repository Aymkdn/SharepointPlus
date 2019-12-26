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
export default function removeNotify(name,options) {
  switch (arguments.length) {
    case 0: throw "Error 'removeNotify': you must provide 'name' or 'options'."
    case 2: {
      if (typeof options !== "object") throw "Error 'removeNotify': you must provide an object for 'options'."
    }
  }

  if (arguments.length === 1 && typeof name === "object") {
    options = name;
    name = undefined;
  }
  options = options || {all:false};
  // [internal use] timeout is a boolean to say if it's a timeout remove or if we forced it
  options.timeout = (options.timeout === true ? true : false);

  // make sure we are ready
  if (global._SP_NOTIFY_READY === false && global._SP_NOTIFY_QUEUE.length > 0) {
    setTimeout(() => removeNotify.call(this, name, options), 150)
    return this;
  }

  let notif;
  // if we want to delete all the notifications
  if (options.all === true) {
    let a=[]
    while (global._SP_NOTIFY.length > 0) {
      notif = global._SP_NOTIFY.shift();
      if (options.includeSticky === false && notif.options.sticky === true) a.push(notif)
      else {
        SP.UI.Notify.removeNotification(notif.id); // eslint-disable-line
        setTimeout(() => notif.options.after.call(this, notif.name, false), 150)
      }
    }
    global._SP_NOTIFY = a.slice(0); // if we want to keep the sticky notifs
  } else if (name !== undefined) {
    // search for the notification
    for (let i=0,len=global._SP_NOTIFY.length; i<len; i++) {
      if (global._SP_NOTIFY[i].name == name) {
        notif = global._SP_NOTIFY.splice(i,1)[0];
        SP.UI.Notify.removeNotification(notif.id); // eslint-disable-line
        setTimeout(() => notif.options.after.call(this, notif.name, options.timeout), 150)
        return this;
      }
    }
  }
  return this;
}
