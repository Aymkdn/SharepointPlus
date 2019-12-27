import getURL from '../utils/getURL.js'

/**
  @name $SP().list
  @namespace
  @description Permits to define the list ID/name

  @param {String} listID Ths list ID or the list name
  @param {String} [url] If the list name is provided, then you need to make sure URL is provided too (then no need to define the URL again for the chained functions like 'get' or 'update')
  @return {Object} the current SharepointPlus object

  @example
  $SP().list("My List");
  $SP().list("My List","http://my.sharpoi.nt/other.directory/");
*/
export default async function list(list, url) {
  this.listID = list.replace(/&/g,"&amp;");

  if (url) {
    // make sure we don't have a '/' at the end
    this.url=(url.slice(-1)==='/'?url.slice(0,-1):url);
  } else {
    this.url = await getURL.call(this);
  }
  return Promise.resolve()
}
