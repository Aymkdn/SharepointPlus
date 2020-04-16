"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js-stable/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.default = _buildBodyForSOAP;

/**
  @ignore
  @function
  @param {String} methodName
  @param {String} bodyContent
  @param {String} [xmlns="http://schemas.microsoft.com/sharepoint/soap/"]
  @description (internal use only) Permits to create the body for a SOAP request
*/
function _buildBodyForSOAP(methodName, bodyContent, xmlns) {
  xmlns = xmlns || "http://schemas.microsoft.com/sharepoint/soap/";
  return '<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><' + methodName + ' xmlns="' + xmlns.replace(/webpartpages\/$/, 'webpartpages') + '">' + bodyContent + '</' + methodName + '></soap:Body></soap:Envelope>';
}

module.exports = exports.default;