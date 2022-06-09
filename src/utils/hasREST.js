
/**
  @name $SP().hasREST
  @function
  @category utils
  @description In the earlier version of SharePointPlus, this function was used to check if the REST API was available – these days I assume everyone is now using at least SharePoint 2013, so this function always returns TRUE – if you don't have REST API you can still define _SP_CACHE_HASREST["url to check"]=false
  @param {Object} settings
    @param {String} [settings.url=current] To check another URL
  @return {Promise} A resolved Promise that gives TRUE or FALSE
*/
export default function hasREST(settings) {
  settings = settings||{};
  let url=(settings.url || this.url || window.location.href).split("/").slice(0,3).join("/");
  // check cache
  if (typeof global._SP_CACHE_HASREST[url] === "boolean") {
    return Promise.resolve(global._SP_CACHE_HASREST[url]);
  }
  return Promise.resolve(true);
}
