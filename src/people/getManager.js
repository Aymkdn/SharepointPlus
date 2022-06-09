import getURL from '../utils/getURL.js'
import getUserInfo from './getUserInfo.js'
import people from './people.js'

/**
  @name $SP().getManager
  @function
  @category people
  @description Return the manager for the provided user, as a People string

  @param {String} [username] Username with the domain, and if you leave it empty it's the current user by default
  @param {Object} [setup] Options (see below)
    @param {String} [setup.url='current website'] The website url
    @param {Function} [setup.modify] Permits to modify the manager's username returned by the service
  @return {Function} resolve(manager), reject(error)

  @example
  $SP().getManager("domain\\john_doe",{url:"http://my.si.te/subdir/"})
  .then(function(manager) {
    console.log(manager); // 42;#Smith,, Jane,#i:0#.w|domain\Jane_Smith,#Jane_Smith@Domain.com,#Jane_Smith@Domain.com,#Smith,, Jane
    manager = $SP().getPeopleLookup(manager);
    console.log(manager.name); // "Smith, Jane"
  })
  .catch(function(err) {
    console.log("Err => ",err)
  });

  $SP().getManager("domain\\john_doe",{
    modify:function(managerUserName) {
      return (managerUserName.startsWith('i:0') ? managerUserName : "i:0#.w|" + managerUserName);
    }
  })
*/
export default async function getManager(username, setup) {
  try {
    if (arguments.length===1 && typeof username === "object") { setup=username; username="" }
    // default values
    username = (username || "");
    setup = setup || {};
    if (!setup.url) {
      setup.url = await getURL.call(this);
    }
    setup.modify = setup.modify || function(val) { return val };

    let pres = await people.call(this, username, setup);
    let managerUserName = setup.modify(pres.Manager);
    let res = await getUserInfo.call(this, managerUserName, setup);

    // "42;#Doe,, John,#i:0#.w|domain\John_Doe,#John_Doe@Domain.com,#John_Doe@Domain.com,#Doe,, John
    let displayName = res.Name.replace(/,/,",,");
    return Promise.resolve(res.ID+";#"+displayName+",#"+managerUserName+",#"+res.Email+",#"+res.Email+",#"+displayName);
  } catch(err) {
    return Promise.reject(err);
  }
}
