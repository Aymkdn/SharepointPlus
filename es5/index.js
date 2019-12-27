import $SP from './main.js';
import add from './lists/add.js';
import addAttachment from './lists/addAttachment.js';
import checkin from './files/checkin.js';
import cleanResult from './lists/cleanResult.js';
import createFile from './files/createFile.js';
import createFolder from './files/createFolder.js';
import get from './lists/get.js';
import getAttachment from './lists/getAttachment.js';
import getContentTypeInfo from './lists/getContentTypeInfo.js';
import getContentTypes from './lists/getContentTypes.js';
import getWorkflowID from './lists/getWorkflowID.js';
import history from './lists/history.js';
import info from './lists/info.js';
import list from './lists/list.js';
import lists from './lists/lists.js';
import moderate from './lists/moderate.js';
import parse from './lists/parse.js';
import parseRecurrence from './lists/parseRecurrence.js';
import remove from './lists/remove.js';
import setReadOnly from './lists/setReadOnly.js';
import startWorkflow from './lists/startWorkflow.js';
import startWorkflow2013 from './lists/startWorkflow2013.js';
import stopWorkflow from './lists/stopWorkflow.js';
import update from './lists/update.js';
import view from './lists/view.js';
import views from './lists/views.js';
import closeModalDialog from './modals/closeModalDialog.js';
import getModalDialog from './modals/getModalDialog.js';
import notify from './modals/notify.js';
import removeNotify from './modals/removeNotify.js';
import resizeModalDialog from './modals/resizeModalDialog.js';
import showModalDialog from './modals/showModalDialog.js';
import waitModalDialog from './modals/waitModalDialog.js';
import adressbook from './people/adressbook.js';
import distributionLists from './people/distributionLists.js';
import getManager from './people/getManager.js';
import getUserInfo from './people/getUserInfo.js';
import groupMembers from './people/groupMembers.js';
import isMember from './people/isMember.js';
import people from './people/people.js';
import usergroups from './people/usergroups.js';
import whoami from './people/whoami.js';
import ajax from './utils/ajax.js';
import arrayBufferToBase64 from './utils/arrayBufferToBase64.js';
import arrayChunk from './utils/arrayChunk.js';
import cloneObject from './utils/cloneObject.js';
import getLookup from './utils/getLookup.js';
import getPageSize from './utils/getPageSize.js';
import getPeopleLookup from './utils/getPeopleLookup.js';
import getRequestDigest from './utils/getRequestDigest.js';
import getTimeZoneInfo from './utils/getTimeZoneInfo.js';
import getURL from './utils/getURL.js';
import hasREST from './utils/hasREST.js';
import newGuid from './utils/newGuid.js';
import regionalDateFormat from './utils/regionalDateFormat.js';
import regionalSettings from './utils/regionalSettings.js';
import toDate from './utils/toDate.js';
import toPeopleString from './utils/toPeopleString.js';
import toSPDate from './utils/toSPDate.js';
import toXSLString from './utils/toXSLString.js';
import webService from './utils/webService.js';
import workflowStatusToText from './utils/workflowStatusToText.js';

function spInit(params) {
  return function () {
    var sp = new $SP();
    sp.init(params);
    return sp;
  };
}

export default spInit({
  add: add,
  addAttachment: addAttachment,
  checkin: checkin,
  cleanResult: cleanResult,
  createFile: createFile,
  createFolder: createFolder,
  get: get,
  getAttachment: getAttachment,
  getContentTypeInfo: getContentTypeInfo,
  getContentTypes: getContentTypes,
  getWorkflowID: getWorkflowID,
  history: history,
  info: info,
  list: list,
  lists: lists,
  moderate: moderate,
  parse: parse,
  parseRecurrence: parseRecurrence,
  remove: remove,
  setReadOnly: setReadOnly,
  startWorkflow: startWorkflow,
  startWorkflow2013: startWorkflow2013,
  stopWorkflow: stopWorkflow,
  update: update,
  view: view,
  views: views,
  closeModalDialog: closeModalDialog,
  getModalDialog: getModalDialog,
  notify: notify,
  removeNotify: removeNotify,
  resizeModalDialog: resizeModalDialog,
  showModalDialog: showModalDialog,
  waitModalDialog: waitModalDialog,
  adressbook: adressbook,
  distributionLists: distributionLists,
  getManager: getManager,
  getUserInfo: getUserInfo,
  groupMembers: groupMembers,
  isMember: isMember,
  people: people,
  usergroups: usergroups,
  whoami: whoami,
  ajax: ajax,
  arrayBufferToBase64: arrayBufferToBase64,
  arrayChunk: arrayChunk,
  cloneObject: cloneObject,
  getLookup: getLookup,
  getPageSize: getPageSize,
  getPeopleLookup: getPeopleLookup,
  getRequestDigest: getRequestDigest,
  getTimeZoneInfo: getTimeZoneInfo,
  getURL: getURL,
  hasREST: hasREST,
  newGuid: newGuid,
  regionalDateFormat: regionalDateFormat,
  regionalSettings: regionalSettings,
  toDate: toDate,
  toPeopleString: toPeopleString,
  toSPDate: toSPDate,
  toXSLString: toXSLString,
  webService: webService,
  workflowStatusToText: workflowStatusToText
});