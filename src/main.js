global._SP_CACHE_CONTENTTYPES=[];
global._SP_CACHE_CONTENTTYPE=[];
global._SP_CACHE_SAVEDVIEW=[];
global._SP_CACHE_SAVEDVIEWS=[];
global._SP_CACHE_SAVEDLISTS=[];
global._SP_CACHE_USERGROUPS=[]
global._SP_CACHE_GROUPMEMBERS=[];
global._SP_CACHE_DISTRIBUTIONLISTS=[];
global._SP_CACHE_REGIONALSETTINGS=void 0;
global._SP_CACHE_DATEFORMAT=void 0;
global._SP_CACHE_HASREST={};
global._SP_CACHE_REQUESTDIGEST={};
global._SP_CACHE_TIMEZONEINFO={};
global._SP_ADD_PROGRESSVAR={};
global._SP_UPDATE_PROGRESSVAR={};
global._SP_MODERATE_PROGRESSVAR={};
global._SP_REMOVE_PROGRESSVAR={};
global._SP_NOTIFY_READY=false;
global._SP_NOTIFY_QUEUE=[];
global._SP_NOTIFY=[];
global._SP_PLUGINS={};
global._SP_MODALDIALOG_LOADED=false;
global._SP_MAXWHERE_ONLOOKUP=30;
global._SP_ISBROWSER=(new Function("try {return this===window;}catch(e){ return false;}"))();
global._SP_JSON_ACCEPT="verbose"; // other options are "minimalmetadata" and "nometadata"

export default class SharepointPlus {
  constructor() {
    this.queue = []; // array of {fct:"function to execute", args:"Related arguments for this function"}
    this.data=[];
    this.length=0;
    this.listID = '';
    this.url=void 0;
    this.module_sprequest=null;
    this.credentialOptions=null;
    this.authMethod={cookie:null};
    this.proxyweb=null;
  }

  /**
    @name $SP().getVersion
    @function
    @category core
    @description Returns the SP version

    @return {String} The current SharepointPlus version
  */
  getVersion () { return "6.1.1" }

  /**
    @name $SP().auth
    @function
    @category node
    @description Permits to use credentials when doing requests (for Node module only)

    @param {Object} credentialOptions Options from https://github.com/s-KaiNet/node-sp-auth
        @params {String} [method] If we cannot use an authentication from 'node-sp-auth', then we need to define the method here (only 'cookie' is supported for now)
    @return {Object} the current SharepointPlus object

    @example
    var user1 = {username:'aymeric', password:'sharepointplus', domain:'kodono'};
    $SP().auth(user1)
         .list("My List","http://my.sharpoi.nt/other.directory/")
        .get({...});
    // or :
    var sp = $SP().auth(user1);
    sp.list("My List", "https://web.si.te").get({...});
    sp.list("Other List"; "http://my.sharpoi.nt/other.directory/").update(...);

    // let's say we want to use our own function to set the FedAuth cookie
    var sp = $SP().auth({method:'cookie', function() {
      // we need to return the content of our cookie
      // e.g. if it's a FedAuth we'll return 'FedAuth=YAHeZNEZdfnZEfzfzeKnfze…';
      return myFunctionToGetFedAuth();
    });
  */
  auth (credentialOptions, fct) {
    if (credentialOptions.method === 'cookie' && typeof fct === "function") {
      this.authMethod.cookie = fct;
    } else {
      this.credentialOptions = credentialOptions;
    }
    return this;
  }

  /**
    @name $SP().proxy
    @function
    @category node
    @description Permits to define a proxy server (for Node module only)

    @param {String} proxyURL Looks like "http://domain%5Cusername:password@proxy.something:80"
    @return {Object} the current SharepointPlus object

    @example
    var user1 = {username:'aymeric', password:'sharepointplus', domain:'kodono'};
    var proxy = "http://" + user1.domain + "%5C" + user1.username + ":" + user1.password + "@proxy:80";
    $SP().proxy(proxy).auth(user1)
         .list("My List","http://my.sharpoi.nt/other.directory/")
        .get({...});
    // or :
    var sp = $SP().proxy(proxy).auth(user1);
    sp.list("My List", "https://web.si.te").get({...});
    sp.list("Other List"; "http://my.sharpoi.nt/other.directory/").update(...);
  */
  proxy (proxy) {
    this.proxyweb = proxy;
    return this;
  }

  init (params) {
    if (typeof params === "object") {
      for (let key in params) {
        if (key === "list") {
          this[key] = (...args) => {
            this.queue = [ { fct:params[key], args } ];
            return this;
          }
        } else {
          // when we need '$SP().list()'
          switch(key) {
            case "get":
            case "add":
            case "info":
            case "view":
            case "views":
            case "addAttachment":
            case "getAttachment":
            case "getContentTypeInfo":
            case "getContentTypes":
            case "getWorkflowID":
            case "hasPermission":
            case "history":
            case "moderate":
            case "remove":
            case "startWorkflow":
            case "startWorkflow2013":
            case "stopWorkflow":
            case "update":
            case "createFile":
            case "createFolder": {
              this[key] = this._queueFct(params[key]);
              break;
            }
            default: {
              this[key] = params[key];
            }
          }
        }
      }
    }
  }

  _queueFct (fct) {
    return async (...args) => {
      if (this.queue.length>0) {
        let item = this.queue.shift();
        return item.fct.apply(this, item.args)
        .then(() => fct.apply(this, args))
      }
    }
  }

}
