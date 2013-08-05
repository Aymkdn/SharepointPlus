# Changelog

**Change Log v3.0.5 (August 5, 2013)**

 - Add the $SP().list().startWorkflow() function to manually start a workflow
 - Add the $SP().list().getWorkflowID() function (that is internally used)
 - Fix $SP().formfields().val() for a people picker (Sharepoint 2010 compatibility)
 - Fix $SP().cleanResult() when no separator was provided
 - Add another paramer to the return function for $SP().list().get() that is the error message (in case the request to the webservice didn't work)
 - Fix a bug with the argments mandatory for $SP().list().add()
 - Fix a bug with $SP().parse() when there was a backslash with a single quote and a bracket for a string 
 - Change the behavior of $SP().list().add() when you provide an empty array (no more exception returned)
 - Change the order of calling success/error for $SP().list().add/remove/update() -- now the "error" callback is called before the "sucess" callback
 - Fix a bug with $SP().lists() (https://github.com/Aymkdn/SharepointPlus/issues/2)
 - Fix a wrong information in the documentation for $SP().list().get() and "progress"

**Change Log v3.0.4 (March 18, 2013)**

 - Rewrite of the $SP.formfields function for better compatibility and performances
 - Fix a bug with an internal function (that returns the current website URL)
 - Rewrite the $SP().list().getAttachment() function
 - Add $SP().whoami() function to get the current user's details
 - $SP().people() returns the error ("string") when there was a problem
 - $SP().list().remove() with the WHERE clause can now also directly delete the files from a document library
 - Fix a bug for $SP().list().update() when using the function with 1 argument
 - Add the $SP().registerPlugin() and $SP().plugin() (first plugin also done)

**Change Log v3.0.3 (November 2, 2012)**

- Better compatibility with Sharepoint 2010
- Because of the Sharepoint 2010 list view throttling (that limit a query to 5,000 items) you can now use the $SP().list().get() with an array for the WHERE clause (see the documentation)
- A "progress" option is now available for $SP().list().get() when using an array for the "where" option
- Add the $SP().cleanResult() function
- Change $SP().toDate() to work with SP2010 format
- Fix the fact we can use either $SP().list().remove() or $SP().list().del()
- Fix an issue with $SP().formfields() applied to a field with several radio buttons
- Add the $SP().noConflict() function that permits to use _$SP instead of $SP (undocumented)
- Fix: you can now get all the fields from a list with leaving "fields" empty or undefined (e.g. $SP().list("My List").get({where:"ID = 1"},function(data) {}))
- $SP().cleanResult(str) now returns "" when 'str' is null or undefined
- Change the license to GPL v2
- Change the Array.prototype.indexOf function
- Add the SharepointPlus version --> $SP().getVersion();

**Change Log v3.0.2**
- Add "encoded" option for $SP().createFile() when the content is already base64-encoded
- Add $SP().checkin() to Check In a file
- Change $SP().list().remove() to be able to delete a file into a shared document library
- NOTE: I'll probably soon change the API to have something like $SP().file().xxxx for all files related actions...


**Change Log v3.0.1**
- Add warning for when we want to use a field with a comma in formfields()
- Add support for Multiple Lookup Selection in formfields()
- Add "Lookup" result for $SP().list().info() -- with "Choices" you now have an object {list:"List from where the values are coming from",field:"Name of the field to retrieve"}
- Add "distributionLists" that returns the user's distribution lists
- Add "groupMembers" that returns the members of a group
- Add "isMember" that will say if an user is part of a Sharepoint group (we could do it with usegroups() however in some cases, like with the distribution lists, the usergroups() will be useless)
- NOTE: with all these new USER features I'm going to review the way to call them... something like $SP().user().xxx

**Change Log v3.0**
- MAJOR CHANGE: you must now call SharepointPlus with $SP() instead of $SP
- ATTENTION: the listID as parameter for the functions is deprecated... you have to use the $SP().list() to define the list
- ATTENTION: Change the $SP().list().view() function (the behavior is different, see the documentation)
- Improve the $SP().list() : only use the LIST NAME and not the LIST ID anymore
- Use view name or view ID in $SP.list().view()
- The URL parameter must now be configured in $SP.list(), and in most cases the URL will be automatically find (for the current website)
- Fix issue with Chrome and $SP().list().add() function
- Add the context for the callback functions : 'this' is now recognized like the current $SP() object in the returning functions
- Add JOIN and OUTERJOIN features to $SP().list().get() (in BETA and should be improved with the time... also it doesn't use -yet- the JOIN options available with Sharepoint 2010)
- Remove ".each()" for ".list()" because all the AJAX requests are now asynchronous
- Add $SP().usergroups() to retrieve of list of groups for an user
- Remove some jQuery dependencies ... still less jQuery code !


**Change Log v2.5.2**
- Add more properties from the $SP.list().info() function
- Better support for Date into a WHERE clause
- Fix issue with Chrome and $SP.list().get() function
- Fix issue with simple quote inside the WHERE clause (you now need to use \\' when using ' inside '')

**Change Log v2.5.1**  
- Add $SP.people() to find the user details based on a name  
- Add $SP.addressbook() to find someone in the Active Directory based on a part of his name  
- Check compatibility with jQuery 1.7.2  

**Change Log v2.5**  
- Add compatibility with Sharepoint 2010  
- Function "progress" added to $SP.list().add()

**Change Log v2.4**  
- First public release