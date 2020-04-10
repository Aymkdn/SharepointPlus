import ajax from '../utils/ajax.js'

/**
  @name $SP().list.hasPermission
  @function
  @description This function permits to check if the current user has a specific permission for a list/library
  @param {String|Array} perm Can be one of the values listed on https://docs.microsoft.com/en-us/previous-versions/office/developer/sharepoint-2010/ee556747(v%3Doffice.14)
  return {Promise} A promise with a boolean (TRUE/FALSE) if the requested perm was a string, or an object ({perm1:BOOLEAN, perm2:BOOLEAN}) if it was an array

  @example
  // check permissions for list 'Travels'
  $SP().list('Travels').hasPermission('deleteListItems').then(function(hasPerm) {
    console.log('Can the user delete an item on Travels? ', hasPerm) // hasPerm is TRUE or FALSE
  })

  $SP().list('Travels').hasPermission(['addListItems','editListItems']).then(function(hasPerm) {
    console.log('Can the user add an item in Travels? ', hasPerm.addListItems);
    console.log('Can the user edit an item in Travels? ', hasPerm.editListItems);
  })
 */
export default async function hasPermission(perm) {
  try {
    if (!this.listID) throw "[SharepointPlus 'hasPermission'] the list ID/Name is required.";
    if (!this.url) throw "[SharepointPlus 'hasPermission'] not able to find the URL!"; // we cannot determine the url

    let permMatch = {
      emptyMask: 0,
      viewListItems: 1,
      addListItems: 2,
      editListItems: 3,
      deleteListItems: 4,
      approveItems: 5,
      openItems: 6,
      viewVersions: 7,
      deleteVersions: 8,
      cancelCheckout: 9,
      managePersonalViews: 10,
      manageLists: 12,
      viewFormPages: 13,
      anonymousSearchAccessList: 14,
      open: 17,
      viewPages: 18,
      addAndCustomizePages: 19,
      applyThemeAndBorder: 20,
      applyStyleSheets: 21,
      viewUsageData: 22,
      createSSCSite: 23,
      manageSubwebs: 24,
      createGroups: 25,
      managePermissions: 26,
      browseDirectories: 27,
      browseUserInfo: 28,
      addDelPrivateWebParts: 29,
      updatePersonalWebParts: 30,
      manageWeb: 31,
      anonymousSearchAccessWebLists: 32,
      useClientIntegration: 37,
      useRemoteAPIs: 38,
      manageAlerts: 39,
      createAlerts: 40,
      editMyUserInfo: 41,
      enumeratePermissions: 63,
      fullMask: 65
    }

    if (!Array.isArray(perm)) perm = [ perm ];
    let permLen = perm.length;

    // check all permissions exist
    for (let i=0; i<permLen; i++) {
      if (permMatch[perm[i]] === undefined) throw "[SharepointPlus 'hasPermission'] the permission '"+perm+"' is not valid. Please, check the documentation.";
    }

    let data = await ajax.call(this, {
      url:this.url + "/_api/web/lists/getbytitle('"+this.listID+"')/EffectiveBasePermissions"
    });

    let serverPerm = data.d.EffectiveBasePermissions;

    let ret = {};
    for (let i=0; i<permLen; i++) {
      if (permMatch[perm[i]] === 65) ret[perm[i]] = ((serverPerm.High & 32767) === 32767 && serverPerm.Low === 65535);
      let a = permMatch[perm[i]] - 1;
      let b = 1;
      if (a >= 0 && a < 32) {
        b = b << a;
        ret[perm[i]] = (0 !== (serverPerm.Low & b));
      } else if (a >= 32 && a < 64) {
        b = b << a - 32;
        ret[perm[i]] = (0 !== (serverPerm.High & b));
      } else {
        ret[perm[i]] = false;
      }
    }

    return (permLen === 1 ? ret[perm[0]] : ret);
  } catch(err) {
    return Promise.reject(err);
  }
}
