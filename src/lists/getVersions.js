import ajax from '../utils/ajax.js'

/**
  @name $SP().list.getVersions
  @function
  @description When versionning is activated on a list, you can use this function to get the different versions of a list item

  @param {Number} ID The item ID
  @return {Promise} resolve(arrayOfVersions)

  @example
  $SP().list("My List").getVersions(1234).then(function(versions) {
    versions.forEach(function(version) {
      console.log(version);
    })
  });
*/
export default async function getVersions(itemID) {
  if (!this.listID) throw "[SharepointPlus 'getVersions'] the list ID/Name is required.";
  if (!this.url) throw "[SharepointPlus 'getVersions'] not able to find the URL!"; // we cannot determine the url
  if (!itemID) throw "[SharepointPlus 'getVersions'] the item ID is required.";

  return ajax.call(this, {
    url:this.url + "/_api/lists/getbytitle('"+this.listID+"')/Items("+itemID+")/Versions"
  })
  .then(res => {
    return ((res.d ? res.d.results : res.value)||[])
  })
}
