import getURL from '../utils/getURL.js'
import usergroups from './usergroups.js'
import groupMembers from './groupMembers.js'
import distributionLists from './distributionLists.js'

/**
  @name $SP().isMember
  @function
  @category people
  @description Find if the user is member of the Sharepoint group

  @param {Object} [setup] Options (see below)
    @param {String} setup.user Username with domain ("domain\\login" for Sharepoint 2010, or e.g. "i:0#.w|domain\\login" for Sharepoint 2013)
    @param {String} setup.group Name of the group
    @param {String} [setup.url='current website'] The website url
    @param {Boolean} [setup.cache=true] Cache the response from the server
  @return {PRomise} resolve(isMember), reject(error)

  @example
  $SP().isMember({user:"mydomain\\john_doe",group:"my group",url:"http://my.site.com/"}).then(function(isMember) {
    if (isMember) alert("OK !")
  });
*/
export default async function isMember(setup) {
  try {
    setup = setup || {};
    if (!setup.user) throw "[SharepointPlus 'isMember'] the user is required.";
    if (!setup.group) throw "[SharepointPlus 'isMember'] the group is required.";
    setup.cache = (setup.cache === false ? false : true)
    if (!setup.url) {
      setup.url = await getURL.call(this);
    }
    setup.group = setup.group.toLowerCase();
    let members=[];
    // first check with usergroups()
    let groups = await usergroups.call(this, setup.user, {cache:setup.cache})
    for (let i=groups.length; i--;) {
      if (groups[i].toLowerCase() === setup.group) {
        return Promise.resolve(true);
      }
    }

    // if we're there then it means we need to keep investigating
    // look at the members of the group
    let m = await groupMembers.call(this, setup.group, {cache:setup.cache});
    for (let i=m.length; i--;) members.push(m[i].Name.toLowerCase());

    // and search if our user is part of the members (like a distribution list)
    let distrib = await distributionLists.call(this, setup.user, {cache:setup.cache});

    for (let i=distrib.length; i--;) {
      if (members.indexOf(distrib[i].DisplayName.toLowerCase()) > -1) {
        return Promise.resolve(true);
      }
    }

    return Promise.resolve(false);
  } catch(err) {
    return Promise.reject(err)
  }
}
