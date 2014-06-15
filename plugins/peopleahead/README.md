People Ahead
============

This plugin permits to change a simple `<input type="text">` to a text field connected to the Sharepoint address book where you can type an user name and select him/her from a list.

Example
-------

You have to include jQuery, SharepointPlus and the plugin. Add these lines to your `<head>` (make sure you use the last version of SharepointPlus):
````html
<script type="text/javascript" src="jquery-1.9.1.min.js"></script>
<script type="text/javascript" src="sharepointplus-3.0.5.min.js"></script>
<script type="text/javascript" src="peopleahead/sp-plugin.peopleahead.js"></script>
<link type="text/css" rel="stylesheet" href="peopleahead/sp-plugin.peopleahead.css">
````

Include also a text box in your code:
````html
<input type="text" id="people-picker">
````

Now, after this tag, you can add the below JavaScript:

````html
<script type="text/javascript">
$SP().plugin('peopleahead',{
  selector:'#people-picker',
  onselect:function() {
    var $this=$(this);
    alert($this.data('name')+" ("+$this.data('email')+") has been selected");
  }
});
</script>
````


Your simple input text box becomes:

![alt text](https://raw.github.com/Aymkdn/SharepointPlus/master/plugins/peopleahead/example/_1.png "Textbox")

And if you start typing the name of someone in your company:

![alt text](https://raw.github.com/Aymkdn/SharepointPlus/master/plugins/peopleahead/example/_2.png "Textbox")

Documentation
-------------

**Description:** Change an input field into a field that will search for a name into the Sharepoint Address Book

### Parameters

An object `setup` is passed to the plugin call.
The properties are:
* {String} [setup.selector=".peopleahead"] The INPUT element where the typeahead will be applied
* {Number} [setup.limit=20] The maximum of results returned by $SP().addressbook()
* {String} [setup.loading] The source of the spin loading image you want to show (by default a data:image/gif;base64 is used)
* {String} [setup.noresult="No result: Please use 'firstname', or 'lastname', or 'lastname, firstname'"] The message to show when no one is found
* {Function} [setup.onselect] When selecting someone in the list

**The available data are "userid", "email", "name", "login" and "title" (this is the Job Title).**

You can get more data in adding what you want at [line 101](https://github.com/Aymkdn/SharepointPlus/blob/master/plugins/peopleahead/sp-plugin.peopleahead.js#L101) (but this is depend of what your Sharepoint provides).

### Example

````javascript
  $SP().plugin('peopleahead', {
    selector:"#my-people",
    limit:10,
    loading:'http://www.mysite.com/images/loading.gif',
    noresult:'Nothing found... Sorry.',
    onselect:function() {
      // 'this' is the A element that we click which contains in data attribute the "userid", "email", "name", "login" and "title"
      alert('You have selected '+$(this).data('name')+' and the related email is '+$(this).data('email'));
    }
  })
````
