# SharepointPlus

[![Average time to resolve an issue](http://isitmaintained.com/badge/resolution/aymkdn/sharepointplus.svg)](http://isitmaintained.com/project/aymkdn/sharepointplus "Average time to resolve an issue")
[![Percentage of issues still open](http://isitmaintained.com/badge/open/aymkdn/sharepointplus.svg)](http://isitmaintained.com/project/aymkdn/sharepointplus "Percentage of issues still open")
[![](https://data.jsdelivr.com/v1/package/npm/sharepointplus/badge)](https://www.jsdelivr.com/package/npm/sharepointplus)

SharepointPlus ($SP) is a JavaScript library which offers some extended features for SharePoint entirely on client side (requires no server install). $SP will simplify your interactions with the Sharepoint Web Services and will help you to deal with the List Forms.

Other JavaScript library like this one are often complex, with few or no example. With SharepointPlus it's easy (like the SQL syntax) and you'll find examples for each method.

## Documentation

The documentation is in the docs directory, it serves as the demo as well.

Browse [online documentation here](http://aymkdn.github.com/SharepointPlus/).

### Quick start

#### Requirements

If you plan to use IE11, you need to add the [Promise polyfill](https://github.com/taylorhakes/promise-polyfill).

#### CDN / Standalone

``` html
  <script type="text/javascript" src="sharepointplus-5.0.min.js"></script>
```

You may also want to use a CDN: [SharepointPlus on JSDelivr](http://www.jsdelivr.com/#!sharepointplus)

#### Node.js

Install

``` sh
npm install sharepointplus # npm
yarn add --dev sharepointplus #yarn
```

Usage:

``` javascript
// the credentials depend of your authentication system
// see: https://github.com/s-KaiNet/node-sp-auth
const credentials = {
  username:'my_username',
  password:'mypassword',
  domain:'mydomain'
};
// you can also define a proxy
const proxyweb = "http://" + credentials.domain + "%5C" + credentials.username + ":" + credentials.password + "@proxy:80";

const $SP = require('sharepointplus');
const sp = $SP().proxy(proxyweb).auth(credentials);
```

### Webpack & NPM / YARN

Install

``` sh
npm install sharepointplus # npm
yarn add --dev sharepointplus #yarn
```

You need to ignore `sp-request` with `IgnorePlugin` for builds to succseed:

``` javascript
// webpack.config.js

plugins: [
  new webpack.IgnorePlugin(/^sp-request$/)
]
```

### Usage example

 Update all items with an "Amount" value bigger than 1000:

``` javascript

$SP().list('My List Name').update({
  Title:"Too expensive"
}, {
  where:"Amount > 1000"
}).then(function(res) {
  alert(res.passed.length+" items successfully updated!");
});
```

Get all items with "Requestor" as the current user and with "Default Color" is
"pink":

``` javascript
$SP().list('ListName').get({
  fields:"Title,Size",
  where:"Requestor = '[Me]' AND Default_x0020_Color = 'pink'",
  orderby:"Size DESC"
}).then(function(data) {
  var html = "<ul>";
  for (var i=data.length; i--;)
    html += "<li>Model '"+data[i].getAttribute("Title")+"' (size: "+data[i].getAttribute("Default_x0020_Color")+")<li>";
  $('#list').append(html+'</ul>');
});
```
