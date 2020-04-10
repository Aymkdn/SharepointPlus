const spauth = require('node-sp-auth');
const request = require('request-promise');
var logging = require('adal-node').Logging;
var Msal = require('@azure/msal-common')

/*//PII or OII logging disabled. Default Logger does not capture any PII or OII.
logging.setLoggingOptions({
  log: function(level, message, error) {
    // provide your own implementation of the log function
    console.log(message)
  },
  level: logging.LOGGING_LEVEL.VERBOSE, // provide the logging level
  loggingWithPII: false  // Determine if you want to log personal identification information. The default value is false.
});

//PII or OII logging enabled.
logging.setLoggingOptions({
  log: function(level, message, error) {
    // provide your own implementation of the log function
    console.log(message)
  },
  level: logging.LOGGING_LEVEL.VERBOSE,
  loggingWithPII: true
});
var AuthenticationContext = require('adal-node').AuthenticationContext;

var authorityHostUrl = 'https://login.windows.net';
var tenant = '945c199a-83a2-4e80-9f8c-5a91be5752dd'; // AAD Tenant name.
var authorityUrl = authorityHostUrl + '/' + tenant;
var applicationId = '0ef201e1-3a6c-40e8-aeb2-ad24d49d5f21'; // Application Id of app registered under AAD.
var clientSecret = 'TX7r/7q]OqV6nhBQW3xzn=PK[K=U1@87'; // Secret generated for app. Read this environment variable.
var resource = 'api://0ef201e1-3a6c-40e8-aeb2-ad24d49d5f21'; // URI that identifies the resource for which the token is valid.

var context = new AuthenticationContext(authorityUrl);

context.acquireTokenWithClientCredentials(resource, applicationId, clientSecret, function(err, tokenResponse) {
  if (err) {
    console.log('well that didn\'t work: ' + err.stack);
  } else {
    console.log(tokenResponse);

    request.get({
      url: 'https://educate.onecloud.dell.com/_api/web',
      headers: {
        'Authentication':'Bearer '+tokenResponse.accessToken
      },
      json: true
    }).then(response => {
      console.log(response.d.Title);
    });
  }
});*/

/*var BearerStrategy = require("passport-azure-ad").BearerStrategy;
var options = {
  identityMetadata: "https://login.microsoftonline.com/945c199a-83a2-4e80-9f8c-5a91be5752dd/.well-known/openid-configuration",
  clientID: "0ef201e1-3a6c-40e8-aeb2-ad24d49d5f21",
  loggingLevel: "info",
  loggingNoPII: false,
  passReqToCallback: true
};

var bearerStrategy = new BearerStrategy(options,
  function(req, token, done) {
    console.log("request => ");
    console.log(req)
    console.log("token => "+token)
  }
);*/

spauth
.getAuth('https://educate.onecloud.dell.com/', {
  "clientId":"0ef201e1-3a6c-40e8-aeb2-ad24d49d5f21",
  "clientSecret":"TX7r/7q]OqV6nhBQW3xzn=PK[K=U1@87"
})
.then(data => {
  console.log(data)
  var headers = data.headers;
  headers['Accept'] = 'application/json;odata=verbose';

  request.get({
    url: 'https://educate.onecloud.dell.com/_api/web/lists',
    headers: headers,
    json: true
  }).then(response => {
    console.log(response);
  }).catch(response => {
    console.log(response);
  });
});

/*
.then(data =>{
  console.log(data)
  let headers = data.headers;
  headers['Accept'] = 'application/json;odata=verbose';
  let requestOpts = data.options || {};
  requestOpts.json = true;
  requestOpts.headers = headers;
  requestOpts.url = 'https://educate.onecloud.dell.com/';

  request.get(requestOpts).then(response => {
    console.log(response.d.Title);
  });
});
*/
/*
dernier token en date :
Client Id:    7f67d247-cd48-4fd0-9d60-81dd84f4fda8
Client Secret:    1D1b7BgDYp9IMsVojvjztP9tB7sqXxyWcHP/gWXP9eE=
Title:    NodeJS
App Domain:   educate.onecloud.dell.com
Redirect URI:   https://educate.onecloud.dell.com
Realm: 945c199a-83a2-4e80-9f8c-5a91be5752dd
 */

/*
Client Id:    ba5d51d1-d5ac-4cd0-ae0b-738399788b76
Client Secret:    2ZrjD28REl+Q7V67KHmG8bf5zNrp9U7PD3aLPu22xZI=
Title:    NodeJS
App Domain:   educate.onecloud.dell.com
Redirect URI:   https://educate.onecloud.dell.com
*/

/*const $SP = require("esm")(module)("../src/index.js").default;
const sp = $SP().auth({
  "username":"aymeric_de_martin",
  "password":"Spring_2020",
  "domain":"europe"
}*/
/*{
  "username": "aymeric_de_martin@dell.com",
  "password": "Spring_2020"
});*/

/*sp.lists({url:"https://educate.onecloud.dell.com/sites/sandbox/sp-test/"})
.then(console.log)
.catch(console.log)*/

/*sp.ajax({url:"https://educate.onecloud.dell.com/sites/sandbox/sp-test/_api/web/lists/"})
.then(console.log)
.catch(console.log)



https://login.microsoftonline.com/945c199a-83a2-4e80-9f8c-5a91be5752dd/wsfed?wa=wsignin1.0&wtrealm=urn%3aSharepoint%3afederation&wctx=https%3a%2f%2feducate.onecloud.dell.com%2f_layouts%2f15%2fAuthenticate.aspx%3fSource%3d%252F&wreply=https%3a%2f%2feducate.onecloud.dell.com%2f_trust%2fdefault.aspx&sso_nonce=AQABAAAAAABeAFzDwllzTYGDLh_qYbH87qVvvwM4pLiqYXloFo6Il7_-ry9WsQxZcSCEiSKj7w7giT5k2Lt1OOfAcucCyjq6W9sHWZndGciAZPnffTm79iAA&client-request-id=8dacdcfb-c68f-4ec2-a3e7-6077cecf3699&mscrid=8dacdcfb-c68f-4ec2-a3e7-6077cecf3699

this is the sign in URL - https://login.microsoftonline.com/945c199a-83a2-4e80-9f8c-5a91be5752dd/saml2
Azure AD identifier: https://sts.windows.net/945c199a-83a2-4e80-9f8c-5a91be5752dd/


Azure App:
Display name: EducationServicesApp
Application (client) ID: 0ef201e1-3a6c-40e8-aeb2-ad24d49d5f21
Directory (tenant) ID: 945c199a-83a2-4e80-9f8c-5a91be5752dd
Object ID: 2ce1aa65-d743-4f2d-9a36-0e41c02ab05a
Client Secret: TX7r/7q]OqV6nhBQW3xzn=PK[K=U1@87



// Replace {tenant} with your tenant!
curl -X POST -H "Content-Type: application/x-www-form-urlencoded" -d "client_id=7f67d247-cd48-4fd0-9d60-81dd84f4fda8&scope=https%3A%2F%2Fgraph.microsoft.com%2F.default&client_secret=1D1b7BgDYp9IMsVojvjztP9tB7sqXxyWcHP/gWXP9eE=&grant_type=client_credentials" --url "https://login.microsoftonline.com/945c199a-83a2-4e80-9f8c-5a91be5752dd/oauth2/v2.0/token"

curl -X GET -H "Authorization: Bearer " "https://educate.onecloud.dell.com/sites/sandbox/_api/web/lists/"
*/


/*
Client Id:    2a919657-3f38-43d4-a6ac-3a9f4fdedf9e
Client Secret:    cDXDSe6Jn7KzmMGVo+BH6bWajxazwjffz9nM1enDFVA=
Title:    NodeJS Aymeric
App Domain:   localhost
Redirect URI:   https://localhost
*/

