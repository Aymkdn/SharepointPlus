import ajax from '../utils/ajax.js'
import _buildBodyForSOAP from '../lists/_buildBodyForSOAP.js'
import getURL from '../utils/getURL.js'

/**
  @name $SP().addressbook
  @function
  @category people
  @description Find an user based on a part of his name

  @param {String} [word] A part of the name from the guy you're looking for
  @param {Object} [setup] Options (see below)
    @param {String} [setup.limit=10] Number of results returned
    @param {String} [setup.type='User'] Possible values are: 'All', 'DistributionList', 'SecurityGroup', 'SharePointGroup', 'User', and 'None' (see http://msdn.microsoft.com/en-us/library/people.spprincipaltype.aspx)
    @param {String} [setup.url='current website'] The website url
  @return {Promise} resolve([{AccountName,UserInfoID,DisplayName,Email,Departement,Title,PrincipalType}]), reject(error)

  @example
  $SP().addressbook("john", {limit:25}).then(function(people) {
    for (var i=0; i &lt; people.length; i++) {
      for (var j=0; j &lt; people[i].length; j++) console.log(people[i][j]+" = "+people[i][people[i][j]]);
    }
  });
*/
export default async function addressbook(username, setup) {
  try {
    switch(arguments.length) {
      case 0: username=""; setup={}; break;
      case 1:{
        if (typeof username==="string") setup={}
        else { setup=username; username="" }
        break;
      }
    }
    if (!setup.url) {
      setup.url = await getURL.call(this);
    }
    setup.limit = setup.limit || 10;
    setup.type  = setup.type || "User";

    let data = await ajax.call(this, {
      url:setup.url + "/_vti_bin/People.asmx",
      body:_buildBodyForSOAP("SearchPrincipals", "<searchText>"+username+"</searchText><maxResults>"+setup.limit+"</maxResults><principalType>"+setup.type+"</principalType>"),
      headers:{'SOAPAction':'http://schemas.microsoft.com/sharepoint/soap/SearchPrincipals'}
    });

    let aResult=[], children, name, value;
    // get the details
    data=data.getElementsByTagName('PrincipalInfo');
    for (let i=0,lenR=data.length; i<lenR; i++) {
      children=data[i].childNodes;
      aResult[i]=[];
      for (let j=0,lenC=children.length; j<lenC; j++) {
        name=children[j].nodeName;
        value=children[j].firstChild;
        if (value) value=value.nodeValue;
        aResult[i].push(name);
        aResult[i][name]=value;
      }
    }

    return Promise.resolve(aResult);
  } catch(err) {
    return Promise.reject(err);
  }
}
