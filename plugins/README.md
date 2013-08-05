Plugins repository
==================

### People Ahead

Change an input field into a field that will search for a name into the Sharepoint Address Book (= people picker)

## How to create a new plugin

You simply need to insert your code inside the below one:
````javascript
$SP().registerPlugin('nameOfYourPlugin', function(options) {
  // your code here
})
````

Then it'll be called like that:
````javascript
$SP().plugin('nameOfYourPlugin',{optionsOne:"something",optionsTwo:"something else"});
````
