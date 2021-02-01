"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js-stable/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.default = void 0;

var _main = _interopRequireDefault(require("./main.js"));

var _add = _interopRequireDefault(require("./lists/add.js"));

var _addAttachment = _interopRequireDefault(require("./lists/addAttachment.js"));

var _checkin = _interopRequireDefault(require("./files/checkin.js"));

var _cleanResult = _interopRequireDefault(require("./lists/cleanResult.js"));

var _createFile = _interopRequireDefault(require("./files/createFile.js"));

var _createFolder = _interopRequireDefault(require("./files/createFolder.js"));

var _get = _interopRequireDefault(require("./lists/get.js"));

var _getAttachment = _interopRequireDefault(require("./lists/getAttachment.js"));

var _getContentTypeInfo = _interopRequireDefault(require("./lists/getContentTypeInfo.js"));

var _getContentTypes = _interopRequireDefault(require("./lists/getContentTypes.js"));

var _getVersions = _interopRequireDefault(require("./lists/getVersions.js"));

var _getWorkflowID = _interopRequireDefault(require("./lists/getWorkflowID.js"));

var _hasPermission = _interopRequireDefault(require("./lists/hasPermission.js"));

var _history = _interopRequireDefault(require("./lists/history.js"));

var _info = _interopRequireDefault(require("./lists/info.js"));

var _list = _interopRequireDefault(require("./lists/list.js"));

var _lists = _interopRequireDefault(require("./lists/lists.js"));

var _moderate = _interopRequireDefault(require("./lists/moderate.js"));

var _parse = _interopRequireDefault(require("./lists/parse.js"));

var _parseRecurrence = _interopRequireDefault(require("./lists/parseRecurrence.js"));

var _remove = _interopRequireDefault(require("./lists/remove.js"));

var _removeAttachment = _interopRequireDefault(require("./lists/removeAttachment.js"));

var _restoreVersion = _interopRequireDefault(require("./lists/restoreVersion.js"));

var _setReadOnly = _interopRequireDefault(require("./lists/setReadOnly.js"));

var _startWorkflow = _interopRequireDefault(require("./lists/startWorkflow.js"));

var _startWorkflow2 = _interopRequireDefault(require("./lists/startWorkflow2013.js"));

var _stopWorkflow = _interopRequireDefault(require("./lists/stopWorkflow.js"));

var _update = _interopRequireDefault(require("./lists/update.js"));

var _view = _interopRequireDefault(require("./lists/view.js"));

var _views = _interopRequireDefault(require("./lists/views.js"));

var _closeModalDialog = _interopRequireDefault(require("./modals/closeModalDialog.js"));

var _getModalDialog = _interopRequireDefault(require("./modals/getModalDialog.js"));

var _notify = _interopRequireDefault(require("./modals/notify.js"));

var _removeNotify = _interopRequireDefault(require("./modals/removeNotify.js"));

var _resizeModalDialog = _interopRequireDefault(require("./modals/resizeModalDialog.js"));

var _showModalDialog = _interopRequireDefault(require("./modals/showModalDialog.js"));

var _waitModalDialog = _interopRequireDefault(require("./modals/waitModalDialog.js"));

var _addressbook = _interopRequireDefault(require("./people/addressbook.js"));

var _distributionLists = _interopRequireDefault(require("./people/distributionLists.js"));

var _getManager = _interopRequireDefault(require("./people/getManager.js"));

var _getUserInfo = _interopRequireDefault(require("./people/getUserInfo.js"));

var _groupMembers = _interopRequireDefault(require("./people/groupMembers.js"));

var _isMember = _interopRequireDefault(require("./people/isMember.js"));

var _people = _interopRequireDefault(require("./people/people.js"));

var _usergroups = _interopRequireDefault(require("./people/usergroups.js"));

var _whoami = _interopRequireDefault(require("./people/whoami.js"));

var _ajax = _interopRequireDefault(require("./utils/ajax.js"));

var _arrayBufferToBase = _interopRequireDefault(require("./utils/arrayBufferToBase64.js"));

var _arrayChunk = _interopRequireDefault(require("./utils/arrayChunk.js"));

var _cloneObject = _interopRequireDefault(require("./utils/cloneObject.js"));

var _getLookup = _interopRequireDefault(require("./utils/getLookup.js"));

var _getPageSize = _interopRequireDefault(require("./utils/getPageSize.js"));

var _getPeopleLookup = _interopRequireDefault(require("./utils/getPeopleLookup.js"));

var _getRequestDigest = _interopRequireDefault(require("./utils/getRequestDigest.js"));

var _getServerTime = _interopRequireDefault(require("./utils/getServerTime.js"));

var _getTimeZoneInfo = _interopRequireDefault(require("./utils/getTimeZoneInfo.js"));

var _getURL = _interopRequireDefault(require("./utils/getURL.js"));

var _hasREST = _interopRequireDefault(require("./utils/hasREST.js"));

var _newGuid = _interopRequireDefault(require("./utils/newGuid.js"));

var _regionalDateFormat = _interopRequireDefault(require("./utils/regionalDateFormat.js"));

var _regionalSettings = _interopRequireDefault(require("./utils/regionalSettings.js"));

var _toDate = _interopRequireDefault(require("./utils/toDate.js"));

var _toPeopleString = _interopRequireDefault(require("./utils/toPeopleString.js"));

var _toSPDate = _interopRequireDefault(require("./utils/toSPDate.js"));

var _toXSLString = _interopRequireDefault(require("./utils/toXSLString.js"));

var _webService = _interopRequireDefault(require("./utils/webService.js"));

var _workflowStatusToText = _interopRequireDefault(require("./utils/workflowStatusToText.js"));

function spInit(params) {
  return function () {
    var sp = new _main.default();
    sp.init(params);
    return sp;
  };
}

var _default = spInit({
  add: _add.default,
  addAttachment: _addAttachment.default,
  checkin: _checkin.default,
  cleanResult: _cleanResult.default,
  createFile: _createFile.default,
  createFolder: _createFolder.default,
  get: _get.default,
  getAttachment: _getAttachment.default,
  getContentTypeInfo: _getContentTypeInfo.default,
  getContentTypes: _getContentTypes.default,
  getVersions: _getVersions.default,
  getWorkflowID: _getWorkflowID.default,
  hasPermission: _hasPermission.default,
  history: _history.default,
  info: _info.default,
  list: _list.default,
  lists: _lists.default,
  moderate: _moderate.default,
  parse: _parse.default,
  parseRecurrence: _parseRecurrence.default,
  remove: _remove.default,
  removeAttachment: _removeAttachment.default,
  restoreVersion: _restoreVersion.default,
  setReadOnly: _setReadOnly.default,
  startWorkflow: _startWorkflow.default,
  startWorkflow2013: _startWorkflow2.default,
  stopWorkflow: _stopWorkflow.default,
  update: _update.default,
  view: _view.default,
  views: _views.default,
  closeModalDialog: _closeModalDialog.default,
  getModalDialog: _getModalDialog.default,
  notify: _notify.default,
  removeNotify: _removeNotify.default,
  resizeModalDialog: _resizeModalDialog.default,
  showModalDialog: _showModalDialog.default,
  waitModalDialog: _waitModalDialog.default,
  addressbook: _addressbook.default,
  distributionLists: _distributionLists.default,
  getManager: _getManager.default,
  getUserInfo: _getUserInfo.default,
  groupMembers: _groupMembers.default,
  isMember: _isMember.default,
  people: _people.default,
  usergroups: _usergroups.default,
  whoami: _whoami.default,
  ajax: _ajax.default,
  arrayBufferToBase64: _arrayBufferToBase.default,
  arrayChunk: _arrayChunk.default,
  cloneObject: _cloneObject.default,
  getLookup: _getLookup.default,
  getPageSize: _getPageSize.default,
  getPeopleLookup: _getPeopleLookup.default,
  getRequestDigest: _getRequestDigest.default,
  getServerTime: _getServerTime.default,
  getTimeZoneInfo: _getTimeZoneInfo.default,
  getURL: _getURL.default,
  hasREST: _hasREST.default,
  newGuid: _newGuid.default,
  regionalDateFormat: _regionalDateFormat.default,
  regionalSettings: _regionalSettings.default,
  toDate: _toDate.default,
  toPeopleString: _toPeopleString.default,
  toSPDate: _toSPDate.default,
  toXSLString: _toXSLString.default,
  webService: _webService.default,
  workflowStatusToText: _workflowStatusToText.default
});

exports.default = _default;
module.exports = exports.default;