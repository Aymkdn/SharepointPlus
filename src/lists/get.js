import cloneObject from '../utils/cloneObject.js'
import view from './view.js'
import parse from './parse.js'
import info from './info.js'
import _cleanString from '../utils/_cleanString.js'
import toSPDate from '../utils/toSPDate.js'
import _buildBodyForSOAP from './_buildBodyForSOAP.js'
import ajax from '../utils/ajax.js'
import getLookup from '../utils/getLookup.js'
import myElem from './myElem.js'
import arrayChunk from '../utils/arrayChunk.js'

class extendMyObject {
  constructor(arr) {
    this.attributes=arr;
  }

  getAttribute (attr) {
    return this.attributes[attr]
  }

  getAttributes () {
    return this.attributes
  }
}

/**
  @ignore
  @function
  @description (internal use only) Look at the ON clause to convert it

  @param {String} on The ON clause
  @return {Array} array of clauses
  @example
  $SP()._parseOn("'List1'.field1 = 'List2'.field2 AND 'List1'.Other_x0020_Field = 'List2'.Some_x0020_Field")
*/
function _parseOn(q) {
  var factory = [],  i=0, mtch, queryString = q.replace(/(\s+)?(=)(\s+)?/g,"$2").replace(/==/g,"=").split(" AND ");
  for (; i<queryString.length; i++) {
    mtch = queryString[i].match(/'([^']+)'\.([a-zA-Z0-9_]+)='([^']+)'\.([a-zA-Z0-9_]+)/);
    if (mtch && mtch.length==5) {
      var tmp={};
      tmp[mtch[1]] = mtch[2];
      tmp[mtch[3]] = mtch[4];
      factory.push(tmp);
    }
  }
  return factory;
}

/**
  @name $SP().list.get
  @function
  @description Get the content of the list based on different criteria (by default the default view is used)

  @param {Object} [options] Options (see below)
    @param {String}  [options.fields=""] The fields you want to grab (be sure to add "Attachments" as a field if you want to know the direct link to an attachment)
    @param {String}  [options.view=""] If you specify a viewID or a viewName that exists for that list, then the fields/where/order settings for this view will be used in addition to the FIELDS/WHERE/ORDERBY you have defined (the user settings will be used first)
    @param {Boolean} [options.json=false] When TRUE then the data returned will be an array of JSON
    @param {String|Array}  [options.where=""] The query string (like SQL syntax) (you'll need to use double \\ before the inside ' -- see example below); you can use an array that will make the sequential requests but it will return all the data into one array (useful for the Sharepoint 2010 throttling limit)
    @param {Boolean} [options.whereCAML=false] If you want to pass a WHERE clause that is with CAML Syntax only instead of SQL-like syntax -- see $SP().parse() for more info
    @param {Boolean} [options.whereEscapeChar=true] Determines if we want to escape the special chars that will cause an error (for example '&' will be automatically converted to '&amp;amp;') -- this is applied to the WHERE clause only
    @param {Function} [options.whereFct=function(w){return w}] Permits to apply your own function on the WHERE clause after conversion to CAML (can be useful also when you use the "view" parameter)
    @param {Function} [options.progress] When using an array for the WHERE or the PAGING option then you can call the progress function (see the example); one parameter when PAGING that is the number of total items already loaded; two parameters when WHERE as an array that are the number of requests done and the total number of requests that will be sent
    @param {String}  [options.orderby=""] The field used to sort the list result (you can also add "ASC" -default- or "DESC")
    @param {String}  [options.groupby=""] The field used to group by the list result; NOTE: it's an option provided by Sharepoint WebService, but it doesn't really do anything special on the results...
    @param {Integer} [options.rowlimit=0] You can define the number of rows you want to receive back (0 is infinite)
    @param {Boolean} [options.paging=false] If you have defined the 'rowlimit' then you can use 'paging' to cut by packets your full request -- this is useful when there is a list view threshold (attention: we cannot use "WHERE" or "ORDERBY" with this option)
    @param {Integer} [options.page=infinite] When you use the `paging` option, several requests will be done until we get all the data, but using the `page` option you can define the number of requests/pages you want to get
    @param {String}  [options.listItemCollectionPositionNext=""] When doing paging, this is the index used by Sharepoint to get the next/previous page
    @param {Boolean} [options.useIndexForOrderBy=false] Based on https://spservices.codeplex.com/discussions/280642#post1323410 it permits to override the 5,000 items limit in an unique call (for Sharepoint 2010 only) -- see the example below to know how to use it
    @param {Boolean} [options.expandUserField=false] When you get a user field, you can have more information (like name,email,sip,...) by switching this to TRUE
    @param {Boolean} [options.dateInUTC=false] TRUE to return dates in Coordinated Universal Time (UTC) format. FALSE to return dates in ISO format.
    @param {Boolean} [options.showListInAttribute=false] When we call a single list, it permits to add the ListName in the attribute (see example)
    @param {String} [options.alias=listName] In case of a "join" or when "showListInAttribute" is true, we can use a different name for the list to be shown
    @param {Array} [options.merge] Permits to merge several lists together and return only one dataset; obviously it makes more sense to use this option when you have tables in different locations, but with the same columns. It must be an array of the same settings as $SP().list().get(). Each row of the dataset will have an extra `Source` parameter to know from where the data is coming from (see an example below)
    @param {Object} [options.folderOptions] Permits to read the content of a Document Library (see below)
      @param {String} [options.folderOptions.path=""] Relative path of the folders we want to explore (by default it's the root of the document library)
      @param {String} [options.folderOptions.show="FilesAndFolders_InFolder"] Four values: "FilesOnly_Recursive" that lists all the files recursively from the provided path (and its children); "FilesAndFolders_Recursive" that lists all the files and folders recursively from the provided path (and its children); "FilesOnly_InFolder" that lists all the files from the provided path; "FilesAndFolders_InFolder" that lists all the files and folders from the provided path
      @param {String} [options.folderOptions.rootFolder=""] It's the full URL to the document library; if not provided, it will be automatically retrieved
    @param {Boolean} [options.queryOptions=undefined] If you want to provide your own QueryOptions and overwrite the ones built for you -- it should be some XML code (see https://msdn.microsoft.com/en-us/library/lists.lists.getlistitems%28v=office.12%29.aspx?f=255&MSPPError=-2147217396)
    @param {Object} [options.join] Permits to create a JOIN closure between the current list and another one: it will be the same syntax than a regular GET (see the example below)
      @param {String} [options.join.list] Permits to establish the link between two lists (see the example below)
      @param {String} [options.join.url='current website'] The website url (if different than the current website)
      @param {String} [options.join.on] Permits to establish the link between two lists (only between the direct parent list and its child, not with the grand parent) (see the example below)
      @param {String} [options.join.onLookup] Permits to establish the link between two lists based on a lookup field... it's more optimized than the simple `join.on` (see the example below)
      @param {Boolean} [options.join.outer=false] If you want to do an outer join (you can also directly use "outerjoin" instead of "join")
    @param {Boolean} [options.calendar=false] If you want to get the events from a Calendar List
    @param {Object} [options.calendarOptions] Options that will be used when "calendar:true" (see the example to know how to use it)
      @param {Boolean} [options.calendarOptions.splitRecurrence=true] By default we split the events with a recurrence (so 1 item = 1 day of the recurrence)
      @param {String|Date} [options.calendarOptions.referenceDate=today] This is the date used to retrieve the events -- that can be a JS Date object or a SP Date (String) [attention: if 'splitRecurrence' is FALSE, then Sharepoint will ignore this 'referenceDate'...]
      @param {String} [options.calendarOptions.range="Month"] By default we have all the events in the reference month (based on the referenceDate), but we can restrict it to a week with "Week" (from Monday to Sunday) (see https://blog.kodono.info/wordpress/2018/07/09/sharepoint-daterangesoverlap-value/)
  @return {Promise} resolve(data returned by the server), reject(error from $SP().ajax())

  @example
  $SP().list("List Name").get().then(function(data) {
    for (var i=0; i&lt;data.length; i++) console.log(data[i].getAttribute("Title"));
  });

  // with some fields and an orderby command
  $SP().list("ListName","http://www.mysharepoint.com/mydir/").get({
    fields:"Title,Organization",
    orderby:"Title DESC,Test_x0020_Date ASC"
  }).then(function(data) {
    for (var i=0; i&lt;data.length; i++) console.log(data[i].getAttribute("Title"));
  });

  // handle the errors
  $SP().list("List Name").get().then(function(data) {
    for (var i=0; i&lt;data.length; i++) console.log(data[i].getAttribute("Title"));
  }).catch(function(err) {
    console.log("Error => ",err)
  });

  // the WHERE clause must be SQL-like
  // the field names must be the internal names used by Sharepoint
  // ATTENTION - note that here we open the WHERE string with simple quotes (') and that should be your default behavior each time you use WHERE
  var name = "O'Sullivan, James";
  $SP().list("My List").get({
    fields:"Title",
    where:'Fiscal_x0020_Week > 30 AND Fiscal_x0020_Week &lt; 50 AND Name = "'+name+'"'
  }).then(function(row) {
    for (var i=row.length;i--;) console.log(row[i].getAttribute("Title"));
  });

  // Same example but this time we write the name directly inside the query...
  // So make sure to use a single backslash (\) if you have a simple quote ' inside your WHERE with a double quotes (") to open/close the string
  $SP().list("My List").get({
    fields:"Title",
    where:'Fiscal_x0020_Week > 30 AND Fiscal_x0020_Week &lt; 50 AND Name = "O\'Sullivan, James"'
  }).then(function(row) {
    for (var i=row.length;i--;) console.log(row[i].getAttribute("Title"));
  });
  // Or to use a double backslash (\\) if you have a simple quote ' inside your WHERE with a simple quote (') to open/close the string
  $SP().list("My List").get({
    fields:"Title",
    where:"Fiscal_x0020_Week > 30 AND Fiscal_x0020_Week &lt; 50 AND Name = 'O\\'Sullivan, James'"
  }).then(function(row) {
    for (var i=row.length;i--;) console.log(row[i].getAttribute("Title"));
  });

  // also in the WHERE clause you can use '[Me]' to filter by the current user,
  $SP().list("My List").get({
    fields:"Title",
    where:"Author = '[Me]'"
  }).then(function(row) {
    console.log(row[0].getAttribute("Title"));
  });

  // also in the WHERE clause you can use '[Today]' or '[Today-X]' with 'X' a number,
  // Here it will return the records done yesterday
  $SP().list("My List").get({
    fields:"Title",
    where:"Created = '[Today-1]'"
  }).then(function(row) {
    console.log(row[0].getAttribute("Title"));
  });

  // Since 3.0.8, if you do a WHERE on a Date with the Time included, then it will compare with the time
  // see http://blogs.syrinx.com/blogs/sharepoint/archive/2008/08/05/caml-queries-with-dates.aspx
  // here it will only show the items created at 2PM exactly -- if you want to check only the today, then use "Created = '2014-03-12'"
  $SP().list("My List").get({
    fields:"Title",
    where:"Created = '2014-03-12 14:00:00'"
  }).then(function(row) {
    console.log(row[0].getAttribute("Title"));
  });

  // We have a list called "My List" with a view already set that is called "Marketing View" with some FIELDS and a WHERE clause
  // so the function will grab the view information and will get the data from the list with "Author = '[Me]'" and adding the view's WHERE clause too
  $SP().list("My List","http://my.sharepoint.com/my/site/").get({
    view:"Marketing View",
    where:"Author = '[Me]'"
  }).then(function(data) {
    for (var i=data.length; i--;) console.log(data[i].getAttribute("Title") + " by " + data[i].getAttribute("Author"));
  });

  // use the paging option for the large list to avoid the message "the attempted operation is prohibited because it exceeds the list view threshold enforced by the administrator"
  // ATTENTION: if you use the WHERE option then it could return the "view threshold" error message because the packet from the WHERE is too big and SharePoint is too stupid...
  $SP().list("My List").get({
    fields:"ID,Title",
    rowlimit:5000,
    paging:true,
    progress:function progress(nbItemsLoaded) {
      // for each new page this function will be called
      console.log("It's still loading... already "+nbItemsLoaded+" items have been loaded!");
    }
  }).then(function(data) {
    console.log(data.length); // -> 23587
  })
  // add the `page` option to stop after a number of requests/pages
  // for example you only want the last record from a list that has more than 5,000 items
  $SP().list("My List").get({fields:"ID",orderby:"ID DESC",rowlimit:1,paging:true,page:1}).then(function(data) {
    console.log("last ID : "+data[0].getAttribute("ID"));
  })
  // use `listItemCollectionPositionNext` to start from this index
  $SP().list("My List").get({
    fields:"ID",
    orderby:"ID DESC",
    rowlimit:10,
    paging:true,
    page:1
  }).then(function(data) {
    // "data" is our first page of data
    // get the next block
    return $SP().list("My List").get({fields:"ID",orderby:"ID DESC",rowlimit:10,paging:true,page:1,listItemCollectionPositionNext:data.NextPage})
  }).then(function(data) {
    // here "data" is the 2nd block of data
    // If you want to access to the previous page, you can use:
    // listItemCollectionPositionNext:"Paged=TRUE&PagedPrev=True&p_ID="+ID
    // with ID the first/smallest ID of the current set.
    // reference: https://social.technet.microsoft.com/wiki/contents/articles/18606.sharepoint-2013-paging-with-sharepoint-client-object-model.aspx
  })

  // We can also find the files from a Document Shared Library
  $SP().list("Shared Documents","http://my.share.point.com/my_site/").get({
    fields:"FileLeafRef,File_x0020_Size",
  }).then(function(data) {
    for (var i=0; i<&lt;data.length; i++) console.log("FileName:"+data[i].getAttribute("FileLeafRef"),"FileSize:"+data[i].getAttribute("File_x0020_Size"));
  });

  // We can join two or more lists together based on a condition
  // ATTENTION: in that case the DATA passed to the callback will return a value for "LIST NAME.FIELD_x0020_NAME" and not directly "FIELD_x0020_NAME"
  // ATTENTION: you need to make sure to call the 'fields' that will be used in the 'on' clause
  $SP().list("Finance and Expense","http://my.sharepoint.com/my_sub/dir/").get({
    fields:"Expense_x0020_Type",
    where:"Finance_x0020_Category = 'Supplies'",
    join:{
      list:"Purchasing List",
      fields:"Region,Year,Expense_x0020_Type,Finance_x0020_Category,Cost",
      where:"Region = 'EMEA' AND Year = 2012",
      orderby:"Expense_x0020_Type,Finance_x0020_Category",
      on:"'Purchasing List'.Expense_x0020_Type = 'Finance and Expense'.Expense_x0020_Type",
      join:{
        list:"Financial Static Data",
        fields:"Region,Year,Expense_x0020_Type,Finance_x0020_Category,Forecast",
        where:"Region = 'EMEA' AND Year = 2012",
        on:"'Purchasing List'.Region = 'Financial Static Data'.Region AND 'Purchasing List'.Expense_x0020_Type = 'Financial Static Data'.Expense_x0020_Type"
      }
    }
  }).then(function(data) {
    for (var i=0; i&lt;data.length; i++) {
      console.log(data[i].getAttribute("Purchasing List.Region")+" | "+data[i].getAttribute("Purchasing List.Year")+" | "+data[i].getAttribute("Purchasing List.Expense_x0020_Type")+" | "+data[i].getAttribute("Purchasing List.Cost"));
    }
  });

  // By default "join" is an "inner join", but you can also do an "outerjoin"
  // ATTENTION: in that case the DATA passed to the callback will return a value for "LIST NAME.FIELD_x0020_NAME" and not directly "FIELD_x0020_NAME"
  // ATTENTION: you need to make sure to call the 'fields' that will be used in the 'on' clause
  $SP().list("Finance and Expense","http://my.sharepoint.com/my_sub/dir/").get({
    fields:"Expense_x0020_Type",
    where:"Finance_x0020_Category = 'Supplies'",
    join:{
      list:"Purchasing List",
      fields:"Region,Year,Expense_x0020_Type,Finance_x0020_Category,Cost",
      where:"Region = 'EMEA' AND Year = 2012",
      orderby:"Expense_x0020_Type,Finance_x0020_Category",
      on:"'Purchasing List'.Expense_x0020_Type = 'Finance and Expense'.Expense_x0020_Type",
      outerjoin:{
        list:"Financial Static Data",
        fields:"Region,Year,Expense_x0020_Type,Finance_x0020_Category,Forecast",
        where:"Region = 'EMEA' AND Year = 2012",
        on:"'Purchasing List'.Region = 'Financial Static Data'.Region AND 'Purchasing List'.Expense_x0020_Type = 'Financial Static Data'.Expense_x0020_Type"
      }
    }
  }).then(function(data) {
    for (var i=0; i&lt;data.length; i++)
      console.log(data[i].getAttribute("Purchasing List.Region")+" | "+data[i].getAttribute("Purchasing List.Year")+" | "+data[i].getAttribute("Purchasing List.Expense_x0020_Type")+" | "+data[i].getAttribute("Purchasing List.Cost"));
  })

  // Another example of "outerjoin", but this time with fields tied to a Lookup ID
  // Here 1 Project can have several Deliverables based on field "Project ID", and 1 Deliverable can have several team members based on "Deliverable ID"
  $SP().list("Projects").get({
    fields:"ID,Project_x0020_Name",
    where:"Status = 'In Progress'",
    outerjoin:{
      list:"Deliverables",
      fields:"ID,Name",
      onLookup:"Project_x0020_ID",
      outerjoin:{
        list:"Team Members",
        fields:"ID,Deliverable_x0020_ID,Name",
        onLookup:"Deliverable_x0020_ID"
      }
    }
  }).then(function(data) {
    var html = '&lt;table class="table default">&lt;thead>&lt;tr>&lt;th>Project ID&lt;/th>&lt;th>Project Name&lt;/th>&lt;th>Deliverable ID&lt;/th>&lt;th>Deliverable Name&lt;/th>&lt;th>Team ID&lt;/th>&lt;th>Member Name&lt;/th>&lt;/tr>&lt;/thead>&lt;tbody>'
    for (var i=0;i&lt;data.length; i++) {
      html += '&lt;tr>&lt;td>'+data[i].getAttribute("Projects.ID")+'&lt;/td>&lt;td>'+data[i].getAttribute("Projects.Project_x0020_Name")+'&lt;/td>&lt;td>'+data[i].getAttribute("Deliverables.ID")+'&lt;/td>&lt;td>'+data[i].getAttribute("Deliverables.Name")+'&lt;/td>&lt;td>'+data[i].getAttribute("Team Members.ID")+'&lt;/td>&lt;td>'+data[i].getAttribute("Team Members.Name")+'&lt;/td>&lt;/tr>'
    }
    html += '&lt;/tbody>&lt;/table>';
    $('#part1').html(html);
  })

  // With Sharepoint 2010 we are limited due to the throttling limit (see here for some very interesting information http://www.glynblogs.com/2011/03/sharepoint-2010-list-view-throttling-and-custom-caml-queries.html)
  // So for example if I do WHERE:'Fiscal_x0020_Year = 2012' it will return an error because I have 6,500 items
  // So I'll do several requests for each Fiscal_x0020_Week into this Fiscal Year
  var query=[],q=[];
  for (var i=1; i&lt;54; i++) {
    q.push("Fiscal_x0020_Week = "+i);
    if (i%8==0 || i == 53) {
      query.push("("+q.join(" OR ")+") AND Fiscal_x0020_Year = 2012");
      q=[]
    }
  }
  // it returns :
  // [
  //   "(Fiscal_x0020_Week = 1 OR Fiscal_x0020_Week = 2 OR Fiscal_x0020_Week = 3 OR Fiscal_x0020_Week = 4 OR Fiscal_x0020_Week = 5 OR Fiscal_x0020_Week = 6 OR Fiscal_x0020_Week = 7 OR Fiscal_x0020_Week = 8) AND Fiscal_x0020_Year = 2012",
  //   ...
  //   "(Fiscal_x0020_Week = 49 OR Fiscal_x0020_Week = 50 OR Fiscal_x0020_Week = 51 OR Fiscal_x0020_Week = 52 OR Fiscal_x0020_Week = 53) AND Fiscal_x0020_Year = 2012"
  // ]
  $SP().list("Sessions").get({
    fields:"Title,Score",
    where:query,
    progress:function progress(current,max) {
      // when we use an array for the WHERE clause we are able to provide `current` and `max`
      console.log("Progress: "+current+" / "+max);
    }
  }).then(function(data) {
    console.log(data.length); // -> 6,523
  });
  // also regarding the throttling limit, you can query a list on a user column in using the User ID
  // For example if John Doe is recorded as "328;#Doe, John" then you'll have to use the special operator "~="
  $SP().list("Sessions").get({
    fields:"Title",
    where:"User ~= 328"
  }).then(function(data) {
    console.log(data.length);
  });

  // if you want to list only the files visible into a folder for a Document Library
  $SP().list("My Shared Documents").get({
    fields:"BaseName,FileRef,FSObjType", // "BaseName" is the name of the file/folder; "FileRef" is the full path of the file/folder; "FSObjType" is 0 for a file and 1 for a folder (you need to apply $SP().cleanResult()), "File_x0020_Size" the filesize in bytes
    folderOptions:{
      path:"My Folder/Sub Folder/",
      show:"FilesOnly_InFolder"
    }
  });

  // if you want to list all the files and folders for a Document Library
  // Let's say the original name for this library was "Documents Library", but then it has been renamed to "My Different Shared Documents"
  $SP().list("My Different Shared Documents").get({
    fields:"BaseName,FileRef,FSObjType", // "BaseName" is the name of the file/folder; "FileRef" is the full path of the file/folder; "FSObjType" is 0 for a file and 1 for a folder (you need to apply $SP().cleanResult())
    folderOptions:{
      show:"FilesAndFolders_Recursive",
      rootFolder:"https://www.mysite.com/sites/Team/Documents Library/" // this is optional as the tool will otherwise automatically retrieve this full path
    }
  });

  // How to retrieve the events from a Calendar List
  // NOTE -- when "calendar:true" we automatically get some fields: "Title", "EventDate" -- the Start Date --, "EndDate", "RecurrenceData", "Duration", "fAllDayEvent", "fRecurrence", "ID", "EventType", "UID" and "MasterSeriesItemID"
  $SP().list("My Calendar").get({
    fields:"Description",
    calendar:true,
    calendarOptions:{
      referenceDate:new Date(2012,4,4),
      range: "Week"
    },
    where:"Category = 'Yellow'"
  }).then(function(data) {
    var events=[];
    for (var i=0; i&lt;data.length; i++) {
      // several information are available -- see below
      events.push({
        Title:         data[i].getAttribute("Title"),
        StartDateTime: data[i].getAttribute("EventDate"), // you can use $SP().toDate() to have a JS Date
        EndDateTime:   data[i].getAttribute("EndDate"), // you can use $SP().toDate() to have a JS Date
        Recurrence:    (data[i].getAttribute("fRecurrence") == 1 ? true : false),
        AllDayEvent:   (data[i].getAttribute("fAllDayEvent") == 1 ? true : false),
        RecurrenceEnd: (data[i].getAttribute("RecurrenceData")||"").replace(/.+<windowEnd>([^<]+)<\/windowEnd>.+/,"$1"), // see the NOTE below
        ID:            data[i].getAttribute("ID"), // the ID for the recurrence events is special but can be also passed to "Display.aspx?ID="
        Duration:      1*data[i].getAttribute("Duration") // Duration is in SECONDS
      })
      // NOTE: with data[i].getAttribute("RecurrenceData") you'll find more info about the recurrence (like the end date for the serie, and much more),
      // but because there are a lot of scenario, I won't handle the different cases.
      // e.g. for a daily recurrence you can find the end date of the serie with: data[i].getAttribute("RecurrenceData").replace(/.+<windowEnd>([^<]+)<\/windowEnd>.+/,"$1")
      // --> it will return a SP Date
    }
  })

  // if we want to merge two tables
  $SP().list("Requests").get({
    fields:"ID",
    where:"User_x0020_Name ~= 16358",
    merge:[{
      list:"Requests Archive",
      fields:"ID",
      where:"User_x0020_Name ~= 16358"
    }]
  })
  .then(function(data) {
    data.forEach(function(d) { console.log(d.Source.list, d.Source.url, d.getAttribute("ID")) })
  })

  // Use of "showListInAttribute"
  // In normal case you'll have:
  $SP().list("My List").get({fields:"Title", where:"ID = 1"})
  .then(function(data) {
    console.log("Title = "+data[0].getAttribute("Title"))
  });
  // With "showListInAttribute" you'll have to use the listname to get the field's value:
  $SP().list("My List").get({fields:"Title", where:"ID = 1", showListInAttribute:true})
  .then(function(data) {
    console.log("Title = "+data[0].getAttribute("My List.Title")); // here we have to specifiy "My List"
  });

  // With "json:true" you'll get an array of JSON
  $SP().list("My List").get({fields:"Title", json:true})
  .then(function(data) {
    data.forEach(function(d) {
      console.log("Title = "+d["Title"]);
    })
  });

  // for Discussion Board, please refer to https://github.com/Aymkdn/SharepointPlus/wiki/Sharepoint-Discussion-Board

  // [It doesn't work with Sharepoint 2013 anymore, only for SP2010]
  // You can use `useIndexForOrderBy:true` to override the list view threshold -- see https://spservices.codeplex.com/discussions/280642
  // To make it to work, you need :
  // 1) to have "ID > 0 AND Another_Index_Column_Filtered" in the WHERE Clause (so at least two filters), and then we can add some other WHERE (even the not indexed columns)
  // 2) To use `orderby`, with an indexed column
  // 3) To use `useIndexForOrderBy:true`
  // see the below example with Trainer an indexed column, and Equipment a column not indexed
  // NOTE: you need to test your WHERE to see if it works or not, because it's vary a lot depending of the kind of WHERE clause you'll use
  $SP().list("Calendar",'http://intranet.dell.com/services/Educate/Toolbox/scheduling_tool/').get({
    fields:"Trainer",
    where:'ID > 0 AND Trainer <> "" AND Equipment LIKE "Box"',
    orderby:'Trainer',
    useIndexForOrderBy:true
  }).then(function(d) {
    console.log(d.length)
  })
*/
export default async function get (options) {
  try {
    if (!this.listID) return Promise.reject("[SharepointPlus 'get']: the list ID/Name is required");

    // default values
    let setup={};
    cloneObject(true, setup, options);
    if (!this.url) return Promise.reject("[SharepointPlus 'get']: not able to find the URL!"); // we cannot determine the url

    setup.fields                       = setup.fields || "";
    setup.where                        = setup.where || "";
    setup.whereFct                     = setup.whereFct || function(w) { return w };
    setup.orderby                      = setup.orderby || "";
    setup.useIndexForOrderBy           = (setup.useIndexForOrderBy===true ? true : false);
    setup.groupby                      = setup.groupby || "";
    setup.rowlimit                     = setup.rowlimit || 0;
    setup.whereEscapeChar              = (setup.whereEscapeChar===false ? false : true);
    setup.paging                       = (setup.paging===true ? true : false);
    setup.page                         = (setup.paging===false || isNaN(setup.page) ? 5000 : setup.page);
    if (setup.paging && setup.rowlimit === 0) setup.rowlimit = 5000; // if rowlimit is not defined, we set it to 5000 by default
    setup.expandUserField              = (setup.expandUserField===true || setup.expandUserField==="True"?"True":"False");
    setup.dateInUTC                    = (setup.dateInUTC===true?"True":"False");
    setup.folderOptions                = setup.folderOptions || null;
    setup.view                         = setup.view || "";
    setup.alias                        = setup.alias || this.listID;
    setup.calendar                     = (setup.calendar===true ? true : false);
    if (setup.calendar===true) {
      setup.calendarOptions = setup.calendarOptions || {};
      setup.calendarOptions.referenceDate = setup.calendarOptions.referenceDate || new Date();
      if (typeof setup.calendarOptions.referenceDate !== "string") setup.calendarOptions.referenceDate=toSPDate(setup.calendarOptions.referenceDate)
      setup.calendarOptions.splitRecurrence = (setup.calendarOptions.splitRecurrence===false ? "FALSE" : "TRUE");
      setup.calendarOptions.range = setup.calendarOptions.range || "Month";
    }

    // if we want to force the ListName in the attribute name, but don't do it when there is a join
    if (setup.showListInAttribute && (setup.join || setup.innerjoin || setup.outerjoin)) {
      setup.showListInAttribute=false;
    }

    // if (setup.whereCAML!==true) setup.whereCAML = (setup.view!="");
    setup.results = setup.results || []; // internal use when there is a paging
    setup.listItemCollectionPositionNext = setup.listItemCollectionPositionNext || ""; // for paging
    // protect & into ListItemCollectionPositionNext
    if (setup.listItemCollectionPositionNext) setup.listItemCollectionPositionNext = setup.listItemCollectionPositionNext.replace(/&/g,"&amp;").replace(/&amp;amp;/g,"&amp;");

    // if view is defined, then we need to find the view ID
    if (setup.view !== "") {
      // retrieve the View ID based on its name
      // and find the view details
      let _view = await view.call(this, setup.view);
      setup.view=_view.ID;
      // the view will return a WHERE clause in CAML format
      if (_view.WhereCAML) {
        let where;
        if (!Array.isArray(setup.where)) where = [ setup.where ];
        else where = setup.where.slice(0);
        where = where.map(w => {
          // is our original Where in the setup is already converted in CAML ?
          // If not, we convert it in order to merge with the one from the View
          return (setup.whereCAML ? w : parse(w));
        });

        // if we have a 'DateRangesOverlap' then we want to move this part at the end -- since v3.0.9
        var mtchDateRanges = _view.WhereCAML.match(/^<And>(<DateRangesOverlap>.*<\/DateRangesOverlap>)(.*)<\/And>$/);
        if (mtchDateRanges && mtchDateRanges.length === 3) _view.WhereCAML = '<And>'+mtchDateRanges[2]+mtchDateRanges[1]+'</And>'
        where = where.map(function(w) {
          return "<And>" + w + _view.WhereCAML + "</And>";
        });
        setup.where=where;
        setup.whereCAML=true;
      }
      setup.fields += (setup.fields===""?"":",") + _view.Fields.join(",");
      setup.orderby += (setup.orderby===""?"":",") + _view.OrderBy;

      // disable the calendar option
      setup.calendarViaView=setup.calendar;
      setup.calendar=false;
    }

    // if setup.where is an array, then it means we want to do several requests
    // so we keep the first WHERE
    if (Array.isArray(setup.where)) {
      /*setup.where = setup.where.slice(0); // clone the original array
      if (!setup.originalWhere) setup.originalWhere = setup.where.slice(0);
      setup.nextWhere = setup.where.slice(1);
      setup.where = setup.where.shift();*/
      let totalWhere = setup.where.length;
      let cntWhere = 0;
      return Promise.all(setup.where.map(w => {
        let params = {};
        for (let k in setup) params[k]=setup[k];
        params.where = w;
        return get.call(this, params)
        .then(data => {
          if (typeof params.progress === "function") params.progress(++cntWhere, totalWhere);
          return data;
        })
      }))
      .then(allData => {
        let data = [];
        allData.forEach(d => data=data.concat(d));
        return data;
      })
    } else {
      setup.originalWhere = setup.where;
      setup.nextWhere = [];
    }
    // we use the progress only when WHERE is an array
    setup.progress = setup.progress || (function() {});

    // what about the fields ?
    let fields="", i, orderby="", fieldsDir, direction, splt, groupby="", gFields, tmpFields, body="", viewAttr, where="", whereDateRanges;

    if (setup.fields.length>0) {
      if (typeof setup.fields === "string") setup.fields = setup.fields.replace(/^\s+/,"").replace(/\s+$/,"").replace(/( )?,( )?/g,",").split(",");
      for (i=0; i<setup.fields.length; i++) fields += '<FieldRef Name="'+setup.fields[i]+'" />';
    }

    // what about sorting ?
    if (setup.orderby !== "") {
      fieldsDir = setup.orderby.split(",");
      for (i=0; i<fieldsDir.length; i++) {
        direction = "ASC";
        splt      = fieldsDir[i].trim().split(" ");
        if (splt.length > 0) {
          if (splt.length==2) direction = splt[1].toUpperCase();
          orderby += '<FieldRef Name="'+splt[0]+'" Ascending="'+(direction=="ASC")+'" />';
        }
      }
    }
    // if calendar:true and no orderby, then we order by the EventDate
    if ((setup.calendar===true||setup.calendarViaView===true) && orderby==="") orderby = '<FieldRef Name="EventDate" Ascending="ASC" />'

    // what about groupby ?
    if (setup.groupby !== "") {
      gFields = setup.groupby.split(",");
      for (i=0; i<gFields.length; i++) groupby += '<FieldRef Name="'+gFields[i]+'" />';
    }

    // if we merge several similar lists
    if (Array.isArray(setup.merge)) {
      setup.mergeData = setup.mergeData || [];
    }

    // when it's a calendar we want to retrieve some fields by default
    if (setup.calendar===true || setup.calendarViaView===true) {
      tmpFields = ["Title", "EventDate", "EndDate", "Duration", "fAllDayEvent", "fRecurrence", "RecurrenceData", "ID", "MasterSeriesItemID", "UID", "RecurrenceID"];
      for (i=0; i<tmpFields.length; i++) fields += '<FieldRef Name="'+tmpFields[i]+'" />';
    }

    // forge the parameters
    if (setup.folderOptions && !setup.folderOptions.rootFolder) {
      // we need to find the correct path to this document library
      let infos = await info.call(this);
      setup.folderOptions.rootFolder=infos._List.RootFolder;
    }
    // if no queryOptions provided then we set the default ones
    if (setup.queryOptions === undefined) {
      setup._queryOptions = "<DateInUtc>"+setup.dateInUTC+"</DateInUtc>"
                          + "<Paging ListItemCollectionPositionNext=\""+setup.listItemCollectionPositionNext+"\"></Paging>"
                          + "<IncludeAttachmentUrls>True</IncludeAttachmentUrls>"
                          + (fields==="" ? "" : "<IncludeMandatoryColumns>False</IncludeMandatoryColumns>")
                          + "<ExpandUserField>"+setup.expandUserField+"</ExpandUserField>";
      // check if we want something related to the folders
      if (setup.folderOptions) {
        switch (setup.folderOptions.show) {
          case "FilesAndFolders_Recursive": viewAttr="RecursiveAll"; break
          case "FilesOnly_InFolder": viewAttr="FilesOnly"; break
          case "FilesAndFolders_InFolder": viewAttr=""; break
          case "FilesOnly_Recursive":
          default: viewAttr="Recursive"
        }
        setup._queryOptions += "<ViewAttributes Scope=\""+viewAttr+"\"></ViewAttributes>"
        if (setup.folderOptions.path) setup._queryOptions += "<Folder>"+ setup.folderOptions.rootFolder + '/' + setup.folderOptions.path+"</Folder>"
      } else
        setup._queryOptions += "<ViewAttributes Scope=\"Recursive\"></ViewAttributes>"
    } else setup._queryOptions = setup.queryOptions
    if (setup.calendarOptions) {
      setup._queryOptions += "<CalendarDate>" + setup.calendarOptions.referenceDate + "</CalendarDate>"
                          +  "<RecurrencePatternXMLVersion>v3</RecurrencePatternXMLVersion>"
                          +  "<ExpandRecurrence>"+setup.calendarOptions.splitRecurrence+"</ExpandRecurrence>";
    }

    // what about the Where ?
    if (setup.where !== "") {
      if (setup.whereCAML) where=setup.where;
      else where=parse(setup.where);
    }
    if (setup.calendar===true) {
      whereDateRanges = "<DateRangesOverlap>"
                      + "<FieldRef Name='EventDate' />"
                      + "<FieldRef Name='EndDate' />"
                      + "<FieldRef Name='RecurrenceID' />"
                      + "<Value Type='DateTime'><" + setup.calendarOptions.range + " /></Value>" /* there is a property called IncludeTimeValue="TRUE" */
                      + "</DateRangesOverlap>"
      if (where !== "") where = "<And>" + where + whereDateRanges + "</And>";
      else where = whereDateRanges;
    }

    where = setup.whereFct(where);
    body = "<listName>"+this.listID+"</listName>"
          + "<viewName>"+(setup.viewID||"")+"</viewName>"
          + "<query>"
          + "<Query>"
          + ( where!="" ? "<Where>"+ where +"</Where>" : "" )
          + ( groupby!="" ? "<GroupBy>"+groupby+"</GroupBy>" : "" )
          + ( orderby!="" ? "<OrderBy"+(setup.useIndexForOrderBy ? " UseIndexForOrderBy='TRUE' Override='TRUE'": "")+">"+orderby+"</OrderBy>" : "" )
          + "</Query>"
          + "</query>"
          + "<viewFields>"
          + "<ViewFields Properties='True'>"
          + fields
          + "</ViewFields>"
          + "</viewFields>"
          + "<rowLimit>"+setup.rowlimit+"</rowLimit>"
          + "<queryOptions>"
          + "<QueryOptions>"
          + setup._queryOptions
          + "</QueryOptions>"
          + "</queryOptions>";
    body = _buildBodyForSOAP("GetListItems", body);

    // do the request
    let data = await ajax.call(this, {
      url: this.url + "/_vti_bin/Lists.asmx",
      body: body
    });

    let rows, j, stop, collection, on, aResult, prevIndex, index, listIndexFound, nextPage,
        joinDataLen, tmp, attributes, attributesReturn, attr, attributesJoinData, joinIndexLen, idx,
        joinData, joinIndex, joinWhereLookup, wh, aReturn=[], mergeSetup, mergeSource;
    // we want to use myElem to change the getAttribute function
    rows=data.getElementsByTagName('z:row');
    if (rows.length===0) rows=data.getElementsByTagName('row'); // for Chrome 'bug'

    // convert immediatly to JSON if there is no JOIN
    let doJSON = (setup.json && !setup.join && !setup.innerjoin && !setup.outerjoin && !setup.joinIndex);

    // do we want to force the ListName in the attribute name ?
    if (setup.showListInAttribute) {
      for (let i=0, len=rows.length; i<len; i++) {
        let attributes=rows[i].attributes;
        let tmp = {};
        for (let j=attributes.length; j--;) {
          tmp[setup.alias+"."+attributes[j].nodeName.slice(4)] = attributes[j].nodeValue;
        }
        if (doJSON) aReturn.push(tmp);
        else aReturn.push(new extendMyObject(tmp));
      }
    } else {
      // if we want the result as an array of JSON
      if (doJSON) {
        let len = rows.length;
        let lenFields = setup.fields.length;
        for (let i=0; i<len; i++) {
          let ret = {};
          // if we don't have any fields defined
          // then we need to search for them
          if (lenFields===0) {
            let attrs = rows[i].attributes;
            for (let attrsLen=attrs.length, i=0; i<attrsLen; i++) {
              let fieldName = attrs[i].nodeName.slice(4);
              ret[fieldName]=attrs[i].nodeValue;
            }
          } else {
            setup.fields.forEach(function(fieldName) {
              ret[fieldName]=rows[i].getAttribute('ows_'+fieldName);
            });
          }

          aReturn.push(ret);
        }
      } else {
        for (let i=0, len=rows.length; i<len; i++) {
          aReturn.push(new myElem(rows[i]));
        }
      }
    }

    // if setup.results length is bigger than 0 then it means we need to add the current data
    if (setup.results.length>0)
      for (i=0,stop=aReturn.length; i<stop; i++) setup.results.push(aReturn[i])

    // depending of the setup.nextWhere length we update the progress
    if (typeof setup.originalWhere !== "string")
      setup.progress(setup.originalWhere.length-setup.nextWhere.length,setup.originalWhere.length);

    // if paging we want to return ListItemCollectionPositionNext
    if (setup.paging) {
      collection = data.getElementsByTagName("rs:data")[0];
      if (typeof collection === "undefined" || collection.length==0) {
        collection=data.getElementsByTagName("data")[0]; // for Chrome
      }
      if (collection) nextPage = collection.getAttribute("ListItemCollectionPositionNext");
    }

    // if we have a paging then we need to do the request again
    if (setup.paging && --setup.page > 0) {
      // check if we need to go to another request
      if (setup.results.length===0) setup.results=aReturn;
      // notify that we keep loading
      setup.progress(setup.results.length);
      if (nextPage) {
        // we need more calls
        setup.listItemCollectionPositionNext=_cleanString(nextPage);
        return get.call(this, setup);
      } else {
        aReturn = setup.results
        // it means we're done, no more call
      }
    } else if (setup.nextWhere.length>0) { // if we need to so some more request
      if (setup.results.length===0) setup.results=aReturn
      setup.where = setup.nextWhere.slice(0);
      return get.call(this, setup);
    } else {
      // rechange setup.where with the original one just in case it was an array to make sure we didn't override the original array
      setup.where = setup.originalWhere;
      aReturn = (setup.results.length>0?setup.results:aReturn);
    }

    // we have data from a previous list, so let's merge all together the both of them
    if (setup.joinData) {
      on = setup.joinData["noindex"];
      aResult = [];
      prevIndex="";
      listIndexFound={length:0};
      if (!on.length) alert("$SP.get() -- Error 'get': you must define the ON clause when JOIN is used.");
      // we have a linked list so do some stuff here to tie the two lists together
      for (i=0,stop=aReturn.length; i<stop; i++) {
        index="";
        for (j=0; j<on.length; j++) index += "_"+getLookup(aReturn[i].getAttribute(on[j][setup.alias])).id;
        // check if the index exists in the previous set of data
        if (setup.joinData[index]) {
          if (prevIndex!==index) {
            if (!listIndexFound[setup.joinIndex[index]]) listIndexFound.length++;
            listIndexFound[setup.joinIndex[index]]=true;
            prevIndex=index;
          }
          // we merge the joinData and the aReturn
          for (j=0,joinDataLen=setup.joinData[index].length; j<joinDataLen; j++) {
            tmp=[];
            // find the attributes for the current list
            attributesReturn=aReturn[i].getAttributes();
            for (attr=attributesReturn.length; attr--;) {
              tmp[setup.alias+"."+attributesReturn[attr].nodeName.slice(4)] = attributesReturn[attr].nodeValue;
            }
            // now find the attributes for the joinData
            attributesJoinData=setup.joinData[index][j].getAttributes();
            for (attr in attributesJoinData) {
              tmp[attr] = setup.joinData[index][j].getAttribute(attr);
            }

            aResult.push(new extendMyObject(tmp));
          }
        }
        // for the default options
        if (setup.innerjoin) setup.join=setup.innerjoin;
        if (setup.outerjoin) {
          setup.join=setup.outerjoin;
          setup.join.outer=true;
        }

      }
      aReturn=aResult;

      // if there is a WHERE clause then we want to force to an innerjoin
      // except where setup.where equals to setup.onLookupWhere
      if (setup.where && setup.onLookupWhere && setup.outer) {
        let whereParsed = (setup.where.startsWith('<') ? setup.where : parse(setup.where));
        let onLookupWhereParsed = (setup.onLookupWhere.startsWith('<') ? setup.onLookupWhere : parse(setup.onLookupWhere));
        if (whereParsed!==onLookupWhereParsed) setup.outer=false;
      }

      // if we want to do an outerjoin we link the missing data
      if (setup.outer) {
        joinIndexLen=setup.joinIndex.length;
        if (listIndexFound.length < joinIndexLen) {
          for (i=0; i<joinIndexLen; i++) {
            if (listIndexFound[i] !== true) {
              idx = setup.joinIndex[i];
              if (idx===undefined || setup.joinData[idx]===undefined) continue
              for (j=0,joinDataLen=setup.joinData[idx].length; j<joinDataLen; j++) {
                tmp=[];
                attributesJoinData=setup.joinData[idx][j].getAttributes();
                for (attr in attributesJoinData) {
                  tmp[attr] = setup.joinData[idx][j].getAttribute(attr);
                }
                aResult.push(new extendMyObject(tmp));
              }
            }
          }
        }
      }
    }

    if (setup.outerjoin) {
      setup.join=setup.outerjoin;
      setup.join.outer=true;
    }
    else if (setup.innerjoin) setup.join=setup.innerjoin;

    // if we join it with another list
    if (setup.join) {
      joinData=[];
      joinIndex=[];
      joinWhereLookup=[];
      // retrieve the ON clauses
      if (setup.join.onLookup) setup.join.on="'"+(setup.join.alias||setup.join.list)+"'."+setup.join.onLookup+" = '"+setup.alias+"'.ID";
      on=_parseOn(setup.join.on);
      joinData["noindex"]=on; // keep a copy of it for the next treatment in the tied list
      for (i=0,stop=aReturn.length; i<stop; i++) {
        // create an index that will be used in the next list to filter it
        index="",tmp=[];
        for (j=0; j<on.length; j++) index += "_"+getLookup(aReturn[i].getAttribute(on[j][setup.alias]) || aReturn[i].getAttribute(setup.alias+"."+on[j][setup.alias])).id;
        if (!joinData[index]) {
          joinIndex[index]=joinIndex.length;
          joinIndex.push(index);
          joinData[index] = [];
          // if onLookup then we will store the current ID with the ~ to use it in a where clause with IN operator
          if (setup.join.onLookup && index!=="_") joinWhereLookup.push("~"+index.slice(1))
        }
        // if we are coming from some other join
        if (setup.joinData) {
          joinData[index].push(aReturn[i]);
        } else {
          attributes=aReturn[i].getAttributes();
          for (j=attributes.length; j--;) {
            tmp[setup.alias+"."+attributes[j].nodeName.slice(4)] = attributes[j].nodeValue;
          }
          joinData[index].push(new extendMyObject(tmp));
        }
      }
      setup.joinData=undefined;
      // call the joined list to grab data and process them
      // if onLookup then we create a WHERE clause with IN operator
      if (setup.join.onLookup) {
        if (joinWhereLookup.length>0) {
          // SP2013 limits to 60 items per IN
          wh=arrayChunk(joinWhereLookup, 60);
          for (j=0; j<wh.length; j++) {
            wh[j] = setup.join.onLookup+' IN ["'+wh[j].join('","')+'"]'
          }
          // if the WHERE is too big then the server could run out of memory
          if (wh.length <= global._SP_MAXWHERE_ONLOOKUP) {
            wh = "(" + wh.join(" OR ") + ")";
            // now we add this WHERE into the existing where
            if (setup.join.where) {
              if (Array.isArray(setup.join.where)) {
                setup.join.where.forEach(function(e,i) { setup.join.where[i]=wh + " AND ("+e+")" })
              } else {
                setup.join.where=wh + " AND (" + setup.join.where + ")";
              }
            } else setup.join.where=wh
            setup.join.onLookupWhere=wh;
          } else {
            // in that case we'll use paging
            setup.join.paging=true;
          }
        }
        // make sure the lookup fields is in the fields list
        if (!setup.join.fields) setup.join.fields=[];
        if (!Array.isArray(setup.join.fields)) {
          tmp=setup.join.fields.split(",");
          tmp.push(setup.join.onLookup);
          setup.join.fields=tmp.join(",");
        } else setup.join.fields.push(setup.join.onLookup);
      }
      this.listID = setup.join.list;
      this.url = setup.join.url||this.url;
      setup.join.json = setup.json;
      setup.join.joinData=joinData;
      setup.join.joinIndex=joinIndex;
      return get.call(this, setup.join);
    }

    // if we want to merge other lists
    if (setup.merge) {
      mergeSource = {
        list:setup.list || this.listID,
        url:setup.url || this.url
      }
      if (setup.merge.length>0) {
        mergeSetup = setup.merge.shift();
        mergeSetup.merge = setup.merge.slice(0);
        this.listID = mergeSetup.list;
        this.url = mergeSetup.url||this.url;
        // we need to identify the Source of each set
        mergeSetup.mergeData=setup.mergeData.concat(aReturn.map(function(ret) {
          ret.Source = mergeSource;
          return ret;
        }));
        return get.call(this, mergeSetup);
      } else {
        aReturn = setup.mergeData.concat(aReturn.map(function(ret) {
          ret.Source = mergeSource;
          return ret;
        }));
      }
    }

    aReturn["NextPage"]=nextPage;

    // convert to JSON if required
    if (setup.json && !doJSON) {
      let ret = [];
      for (let i=0, len=aReturn.length; i<len; i++) {
        ret.push(aReturn[i].getAttributes())
      }
      return Promise.resolve(ret);
    }
    return Promise.resolve(aReturn);
  } catch(err) {
    return Promise.reject(err);
  }
}
