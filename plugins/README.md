Plugins repository
==================

**Attention** : some plugins might need jQuery. So make sure you load it when required.

## Available Plugins

### [People Ahead](peopleahead)

Change an input field into a field that will search for a name into the Sharepoint Address Book (= people picker)

### [Extend Column Filters](extendColumnFilters)

This is a plugin that is able to extend the default filters available in each column/header for a standard Sharepoint view.

**It could be improved a lot** but right now it fits my little needs: I have a Document Library under Sharepoint 2010 (untested for the other versions of Sharepoint) and I've noticed that the default views don't permit to filter by the filename when I needed this feature.

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
