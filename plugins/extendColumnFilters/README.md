# extendColumnFilters

This is a plugin that is able to extend the default filters available in each column/header for a standard Sharepoint 2010 view.

**It could be improved a lot** but right now it fits my little needs: I have a Document Library under Sharepoint 2010 (untested for the other versions of Sharepoint) and I've noticed that the default views don't permit to filter by the filename when I needed this feature.

**Attention** : jQuery is required for this plugin.

Example:

![Before](https://raw.githubusercontent.com/Aymkdn/SharepointPlus/master/plugins/extendColumnFilters/images/before.png)

So using this plugin it now looks like that:

![After](https://raw.githubusercontent.com/Aymkdn/SharepointPlus/master/plugins/extendColumnFilters/images/after.png)

And the behavior is similar to the other columns.

# How to use the plugin

We need to make sure `core.js` is loaded before calling the plugin.

## Options

`headers`: An array of the headers that will be extended... right now it should only be `name`

### Example

```javascript
ExecuteOrDelayUntilScriptLoaded(function() {
  $SP().plugin('extendColumnFilters',{
    headers:[{
      name:"Name"
    }]
  });
}, "core.js")
```

# Possible new features

The other idea about this plugin would be to create an `input` box where you can enter something to filter out the list of options (like Excel does) for each column. It would be very useful when the list of options is very long.
