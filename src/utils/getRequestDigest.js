import ajax from './ajax.js'

/**
 * @name $SP().getRequestDigest
 * @function
 * @category utils
 * @description Retrieve a Request Digest (and it will change the value of document.querySelector("#__REQUESTDIGEST") when a new Request Digest is created)
 * @param {Object} settings
 *   @param {String} [settings.url=current] To check another URL (or if you use it on a Node server)
 *   @param {Boolean} [settings.cache=true] TRUE to use the cache and/or the one into the page for the digest, FALSE to get a new one
 * @return {Promise} resolve(Request Digest), reject(reject from $SP().ajax())
 *
 * @example
 * $SP().getRequestDigest({cache:false}).then(function(digest) { console.log("The new digest is "+digest)})
 */
export default async function getRequestDigest(settings) {
  try {
    settings=settings||{};
    settings.cache=(settings.cache===false?false:true);
    let e, digest, url=(settings.url||this.url);
    if (!url) url=window.location.href.split("/").slice(0,3).join("/");
    url=url.toLowerCase();
    if (url.indexOf("_api") !== -1) url=url.split("_api")[0];
    else if (url.indexOf("_vti_bin/client.svc/processquery") !== -1) url=url.split("_vti_bin/client.svc/processquery")[0];
    // check cache
    if (settings.cache) digest=global._SP_CACHE_REQUESTDIGEST[url];
    if (digest) {
      // check date to be less than 24h
      if (new Date().getTime() - new Date(digest.split(",")[1]).getTime() < 86400000) {
        return Promise.resolve(digest);
      }
    }
    if (global._SP_ISBROWSER && document && settings.cache) {
      e=document.querySelector("#__REQUESTDIGEST");
      if (e) {
        digest=e.value;
        // cache
        global._SP_CACHE_REQUESTDIGEST[url]=digest;
        return Promise.resolve(digest);
      }
    }
    // do a request
    let data = await ajax.call(this, {
      url:url + "/_api/contextinfo",
      method:"POST"
    })
    digest=data.d.GetContextWebInformation.FormDigestValue;
    // cache
    global._SP_CACHE_REQUESTDIGEST[url]=digest;
    if (global._SP_ISBROWSER && document) {
      e=document.querySelector("#__REQUESTDIGEST");
      if (e) e.value=digest;
    }

    return Promise.resolve(digest);
  } catch(err) {
    return Promise.reject(err);
  }
}
