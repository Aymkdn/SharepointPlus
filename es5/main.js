import _regeneratorRuntime from "@babel/runtime-corejs3/regenerator";
import _asyncToGenerator from "@babel/runtime-corejs3/helpers/esm/asyncToGenerator";
import _typeof from "@babel/runtime-corejs3/helpers/esm/typeof";
import _classCallCheck from "@babel/runtime-corejs3/helpers/esm/classCallCheck";
import _createClass from "@babel/runtime-corejs3/helpers/esm/createClass";
global._SP_CACHE_CONTENTTYPES = [];
global._SP_CACHE_CONTENTTYPE = [];
global._SP_CACHE_SAVEDVIEW = [];
global._SP_CACHE_SAVEDVIEWS = [];
global._SP_CACHE_SAVEDLISTS = [];
global._SP_CACHE_USERGROUPS = [];
global._SP_CACHE_GROUPMEMBERS = [];
global._SP_CACHE_DISTRIBUTIONLISTS = [];
global._SP_CACHE_REGIONALSETTINGS = void 0;
global._SP_CACHE_DATEFORMAT = void 0;
global._SP_CACHE_HASREST = {};
global._SP_CACHE_REQUESTDIGEST = {};
global._SP_CACHE_TIMEZONEINFO = {};
global._SP_ADD_PROGRESSVAR = {};
global._SP_UPDATE_PROGRESSVAR = {};
global._SP_MODERATE_PROGRESSVAR = {};
global._SP_REMOVE_PROGRESSVAR = {};
global._SP_NOTIFY_READY = false;
global._SP_NOTIFY_QUEUE = [];
global._SP_NOTIFY = [];
global._SP_PLUGINS = {};
global._SP_MODALDIALOG_LOADED = false;
global._SP_MAXWHERE_ONLOOKUP = 30;
global._SP_ISBROWSER = new Function("try {return this===window;}catch(e){ return false;}")();
global._SP_JSON_ACCEPT = "verbose"; // other options are "minimalmetadata" and "nometadata"

var SharepointPlus =
/*#__PURE__*/
function () {
  function SharepointPlus() {
    _classCallCheck(this, SharepointPlus);

    this.queue = []; // array of {fct:"function to execute", args:"Related arguments for this function"}

    this.data = [];
    this.length = 0;
    this.listID = '';
    this.url = void 0;
    this.module_sprequest = null;
    this.credentialOptions = null;
    this.authMethod = {
      cookie: null
    };
    this.proxyweb = null;
  }
  /**
    @name $SP().getVersion
    @function
    @category core
    @description Returns the SP version
      @return {String} The current SharepointPlus version
  */


  _createClass(SharepointPlus, [{
    key: "getVersion",
    value: function getVersion() {
      return "6.1.2";
    }
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
        // if you use the AddIn method, it may not work – in that case, you'll need to use the FedAuth method as described there: https://github.com/Aymkdn/SharepointPlus/wiki/Using-the-FedAuth-Cookie#javascript-code
      // let's say we want to use our own function to set the FedAuth cookie
      var sp = $SP().auth({method:'cookie', function() {
        // we need to return the content of our cookie
        // e.g. if it's a FedAuth we'll return 'FedAuth=YAHeZNEZdfnZEfzfzeKnfze…';
        return myFunctionToGetFedAuth();
      });
    */

  }, {
    key: "auth",
    value: function auth(credentialOptions, fct) {
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

  }, {
    key: "proxy",
    value: function proxy(_proxy) {
      this.proxyweb = _proxy;
      return this;
    }
  }, {
    key: "init",
    value: function init(params) {
      var _this = this;

      if (_typeof(params) === "object") {
        var _loop = function _loop(key) {
          if (key === "list") {
            _this[key] = function () {
              for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
              }

              _this.queue = [{
                fct: params[key],
                args: args
              }];
              return _this;
            };
          } else {
            // when we need '$SP().list()'
            switch (key) {
              case "get":
              case "add":
              case "info":
              case "view":
              case "views":
              case "addAttachment":
              case "getAttachment":
              case "getContentTypeInfo":
              case "getContentTypes":
              case "getVersions":
              case "getWorkflowID":
              case "hasPermission":
              case "history":
              case "moderate":
              case "remove":
              case "removeAttachment":
              case "restoreVersion":
              case "startWorkflow":
              case "startWorkflow2013":
              case "stopWorkflow":
              case "update":
              case "createFile":
              case "createFolder":
                {
                  _this[key] = _this._queueFct(params[key]);
                  break;
                }

              default:
                {
                  _this[key] = params[key];
                }
            }
          }
        };

        for (var key in params) {
          _loop(key);
        }
      }
    }
  }, {
    key: "_queueFct",
    value: function _queueFct(fct) {
      var _this2 = this;

      return (
        /*#__PURE__*/
        _asyncToGenerator(
        /*#__PURE__*/
        _regeneratorRuntime.mark(function _callee() {
          var _len2,
              args,
              _key2,
              item,
              _args = arguments;

          return _regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  for (_len2 = _args.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                    args[_key2] = _args[_key2];
                  }

                  if (!(_this2.queue.length > 0)) {
                    _context.next = 4;
                    break;
                  }

                  item = _this2.queue.shift();
                  return _context.abrupt("return", item.fct.apply(_this2, item.args).then(function () {
                    return fct.apply(_this2, args);
                  }));

                case 4:
                case "end":
                  return _context.stop();
              }
            }
          }, _callee);
        }))
      );
    }
  }]);

  return SharepointPlus;
}();

export { SharepointPlus as default };