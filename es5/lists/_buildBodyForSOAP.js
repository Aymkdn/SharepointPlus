/**
  @ignore
  @function
  @param {String} methodName
  @param {String} bodyContent
  @param {String} [xmlns="http://schemas.microsoft.com/sharepoint/soap/"]
  @description (internal use only) Permits to create the body for a SOAP request
*/
export default function _buildBodyForSOAP(methodName, bodyContent, xmlns) {
  xmlns = xmlns || "http://schemas.microsoft.com/sharepoint/soap/";
  return '<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><' + methodName + ' xmlns="' + xmlns.replace(/webpartpages\/$/, 'webpartpages') + '">' + bodyContent + '</' + methodName + '></soap:Body></soap:Envelope>';
}