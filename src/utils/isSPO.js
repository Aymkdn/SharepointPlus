/**
 * @name isSPO
 * @category utils
 * @function
 * @description Return TRUE if the SharePoint is SharePoint Online
 * @param {Object} settings
 *   @param {String} [settings.url=current] To check another URL
 * @return {Boolean} Return TRUE if it's SPO or FALSE if not, or NULL is not able to determine it
 *
 * @note You can force an URL to be seen as SPO by defining the global variable _SP_ISSPO['url to check']=true
 */
export default function isSPO(settings) {
  settings = settings||{};
  let url=(settings.url || this.url || window.location.href).split("/").slice(0,3).join("/");
  // check global variable
  if (typeof global._SP_ISSPO[url] === "boolean") return global._SP_ISSPO[url];
  // check .sharepoint.com in URL
  if (url.endsWith('.sharepoint.com')) return true;
  // check _spPageContextInfo
  if (typeof global._spPageContextInfo === "object") return global._spPageContextInfo.isSPO || false;
  return null;
}
