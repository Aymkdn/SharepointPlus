import info from './info.js'
import ajax from '../utils/ajax.js'

/**
  @name $SP().list.getVersions
  @function
  @description When versionning is activated on a list, you can use this function to get the different version label/number for a list item

  @param {Number} ID The item ID
  @return {Promise} resolve(arrayOflistOfVersions)

  @example
  $SP().list("My List").getVersions({
    ID:1
  }).then(function(versions) {
    versions.forEach(function(version) {
      console.log(version);
      // returns:
      //  - CheckInComment
      //  - Created
      //  - VersionID
      //  - IsCurrentVersion (boolean)
      //  - VersionLabel (e.g. "1.0", "2.0", …)
    })
  });
*/
export default async function getVersions(itemID) {
  if (!this.listID) throw "[SharepointPlus 'getVersions'] the list ID/Name is required.";
  if (!this.url) throw "[SharepointPlus 'getVersions'] not able to find the URL!"; // we cannot determine the url
  if (!itemID) throw "[SharepointPlus 'getVersions'] the item ID is required.";

  // we need the real path to the list
  let infos = await info.call(this);
  let rootFolder = infos._List.RootFolder;
  // if no versionning
  if (infos._List.EnableVersioning !== "True") return [];

  return ajax.call(this, {
    url:this.url + "/_api/web/GetFileByServerRelativeUrl('"+encodeURIComponent(rootFolder+"/"+itemID+"_.000")+"')/Versions"
  })
  .then(res => {
    if (!res || !res.d || !Array.isArray(res.d.results)) return [];
    return res.d.results.map(item => {
      return {
        CheckInComment:item.CheckInComment,
        Created:item.Created,
        VersionID:item.ID,
        IsCurrentVersion:item.IsCurrentVersion,
        VersionLabel:item.VersionLabel
      }
    })
  })
}
