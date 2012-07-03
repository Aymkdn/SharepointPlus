# Changelog

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