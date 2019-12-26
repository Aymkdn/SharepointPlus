var expect = chai.expect;
var assert = chai.assert;
mocha.setup({
  ui:'bdd',
  bail:true // stop the subsequence tests if there is an error
});

function str2ab(str) {
  var buf = new ArrayBuffer(str.length*2); // 2 bytes for each char
  var bufView = new Uint16Array(buf);
  for (var i=0, strLen=str.length; i<strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}

describe('Lists', function() {
  this.timeout(5000);
  it('$SP().parse()', function() {
    assert($SP().parse('ContentType = "My Content Type" OR Description <> null AND Fiscal_x0020_Week >= 43 AND Result_x0020_Date < "2012-02-03"') === '<And><And><Or><Eq><FieldRef Name="ContentType" /><Value Type="Text">My Content Type</Value></Eq><IsNotNull><FieldRef Name="Description" /></IsNotNull></Or><Geq><FieldRef Name="Fiscal_x0020_Week" /><Value Type="Number">43</Value></Geq></And><Lt><FieldRef Name="Result_x0020_Date" /><Value Type="DateTime">2012-02-03</Value></Lt></And>');
  });

  it('$SP().lists()', function() {
    return $SP().lists()
    .then(function(lists) {
      var passed=false;
      for (var i=lists.length; i--;) {
        if (lists[i]['Name'] === "SharepointPlus") {
          passed=true;
          break
        }
      }
      assert(passed, 'Unable to find the list called "SharepointPlus"');
    });
  });

  var _viewID;
  it('$SP().list().views()', function() {
    return $SP().list("SharepointPlus").views()
    .then(function(views) {
      var passed=false;
      for (var i=views.length; i--;) {
        if (views[i]["Name"] === "All Items") {
          passed=true;
          _viewID=views[i]["ID"];
          break;
        }
      }
      assert(passed, 'Unable to find the view called "All Items" in "SharepointPlus"');
    });
  });

  it('$SP().list().view()', function() {
    return $SP().list("SharepointPlus").view("All Items")
    .then(function(view) {
      assert(view.ID === _viewID, 'The "view.ID" ('+view.ID+') should be equal to "'+_viewID+'" for the view called "All Items" in "SharepointPlus"');
    });
  });

  var itemID;
  var title = new Date().getTime();
  it('$SP().list().add()', function() {
    return $SP().list("SharepointPlus").add({'Title':'Add','Single_x0020_line_x0020_of_x0020':title,'Multiple_x0020_lines_x0020_of_x0':"test",'Lookup':'2;#Option 2'})
    .then(function(items) {
      if (items.failed.length > 0) {
        assert(false, "Unable to add a row, the server returned: "+items.failed[0].errorMessage);
      }
    })
  });

  it('$SP().list().get()', function() {
    return $SP().list("SharepointPlus").get({fields:"ID,Title,Single_x0020_line_x0020_of_x0020",where:'Single_x0020_line_x0020_of_x0020 = "'+title+'"'})
    .then(function(data) {
      if (data.length === 1) {
        itemID = data[0].getAttribute("ID");
      }
    })
  });

  it('$SP().list().update()', function() {
    return $SP().list("SharepointPlus").update({'ID':itemID,'Title':'testUpdate','Multiple_x0020_lines_x0020_of_x0':"next"})
    .then(function(items) {
      if (items.failed.length > 0) {
        assert(false, "Unable to update a row, the server returned: "+items.failed[0].errorMessage);
      }
    })
  });

  it('$SP().list().addAttachment()', function() {
    return $SP().list("SharepointPlus").addAttachment({
      ID:itemID,
      filename:".   helloworld < with special characters & too long.... really too long but this is* required for testing purposes~ at 100% a little bit more and we're good for testing....txt  ",
      attachment:str2ab('Hello World')
    })
    .then(function(fileURL) {
      assert(fileURL.indexOf("/Lists/SharepointPlus/Attachments/"+itemID+"/helloworld with special characters too long. really too long but this is required for testing purposes at 100 a lit__ting.txt")>-1);
    })
  });

  it('$SP().list().getAttachment()', function() {
    return $SP().list("SharepointPlus").getAttachment(itemID)
    .then(function(attachments) {
      assert(attachments.length===1 && attachments[0].indexOf("Lists/SharepointPlus/Attachments/"+itemID+"/helloworld with special characters too long. really too long but this is required for testing purposes at 100 a lit__ting.txt") > -1);
    })
  });

  it('$SP().list().history()', function() {
    return $SP().list("SharepointPlus").history({ID:itemID, Name:"Multiple_x0020_lines_x0020_of_x0"})
    .then(function(data) {
      var passed=false;
      for (var i=0,len=data.length; i<len; i++) {
        if (data[i].getAttribute("Multiple_x0020_lines_x0020_of_x0") === "test") {
          passed=true;
          break;
        }
      }
      assert(passed);
    })
  });

  it('$SP().list().info()', function() {
    return $SP().list("SharepointPlus").info()
    .then(function(infos) {
      var passed=false;
      for (var i=0; i<infos.length; i++) {
        if (infos[i]["StaticName"] === "Multiple_x0020_lines_x0020_of_x0" && infos[i]["AppendOnly"]==="TRUE") {
          passed=true;
          break;
        }
      }
      assert(passed);
    })
  });

  it('$SP().list().getContentTypes()', function() {
    return $SP().list("SharepointPlus").getContentTypes()
    .then(function(contentTypes) {
      var passed=false;
      for (var i=0; i<contentTypes.length; i++) {
        if (contentTypes[i].Name==="Item") {
          passed=true;
          break;
        }
      }
      assert(passed);
    })
  });

  it('$SP().list().getContentTypeInfo()', function() {
    return $SP().list("SharepointPlus").getContentTypeInfo("Item")
    .then(function(fields) {
      var passed=false;
      for (var i=0; i<fields.length; i++) {
        if (fields[i]["DisplayName"] === "Title") {
          passed=true;
          break;
        }
      }
      assert(passed)
    })
  });

  it('$SP().list().moderate()', function() {
    return $SP().webService({
      service:"Lists",
      operation:"UpdateList",
      properties:{
        listName:"SharepointPlus",
        listProperties:'<List Title="SharepointPlus" EnableModeration="True" />',
        newFields:"",
        updateFields:"",
        deleteFields:"",
        listVersion:""
      }
    })
    .then(function() {
      return $SP().list("SharepointPlus").update({'ID':itemID,'Title':'testModeration'})
    })
    .then(function() {
      return $SP().list("SharepointPlus").moderate({ID:itemID, ApprovalStatus:"Rejected"})
    })
    .then(function(items) {
      var passed=false;
      if (items.failed.length===0) {
        items.passed.forEach(function(item) {
          if (item.getAttribute("_ModerationStatus") == 1) {
            passed=true;
          }
        })
      }
      assert(passed);
    })
  });

  it('$SP().list().remove()', function() {
    return $SP().list("SharepointPlus").remove({'ID':itemID})
    .then(function(items) {
      assert(items.passed.length>0);
    })
  });

  it('$SP().list().add() Multiple', function() {
    var testProgressOK = false;
    return $SP().list("SharepointPlus").add([{Title:"Multiple " + title}, {Title:"Multiple " + title}, {Title:"Multiple " + title}, {Title:"Multiple " + title}, {Title:"Multiple " + title, 'Lookup':'2;#Option 2'}], {
      packetsize:2,
      progress:function(n, total) {
        if (n === 5 && total === 5) {
          testProgressOK=true;
        }
      }
    })
    .then(function(items) {
      assert(testProgressOK, 'The "progress" function has not been called');
      assert(items.passed.length===5, "We should have 5 new items but we have "+items.passed.length);
      itemID = items.passed[items.passed.length-1].ID;
    })
  });

  it('$SP().list().get() with "outerjoin"', function() {
    return $SP().list("SharepointPlus").get({
      fields:"ID,Lookup",
      where:"ID = "+itemID,
      outerjoin:{
        list:"SharepointPlusLookup",
        fields:"ID",
        on:"'SharepointPlusLookup'.ID = 'SharepointPlus'.Lookup"
      },
    })
    .then(function(data) {
      assert(data.length===1 && data[0].getAttribute("SharepointPlus.Lookup").split(";#")[0]==data[0].getAttribute("SharepointPlusLookup.ID"));
    })
  });

  it('$SP().list().get() with "innerjoin"/"onLookup"', function() {
    return $SP().list("SharepointPlusLookup").get({
      fields:"ID,Title",
      innerjoin:{
        list:"SharepointPlus",
        fields:"ID,Title",
        onLookup:"Lookup"
      }
    })
    .then(function(data) {
      assert(data.length>0 && data[0].getAttribute("SharepointPlus.Lookup").split(";#")[0]==data[0].getAttribute("SharepointPlusLookup.ID"));
    })
  });

  it('$SP().list().get() with "alias"', function() {
    return $SP().list("SharepointPlus").get({
      fields:"ID,Lookup",
      where:"ID = "+itemID,
      outerjoin:{
        list:"SharepointPlusLookup",
        alias:"SPL",
        fields:"ID",
        on:"'SPL'.ID = 'SharepointPlus'.Lookup"
      },
    })
    .then(function(data) {
      assert(data.length>0 && data[0].getAttribute("SharepointPlus.Lookup").split(";#")[0]==data[0].getAttribute("SPL.ID"));
    })
  });

  it('$SP().list().get() with "[Me]"', function() {
    return $SP().list("SharepointPlus").get({
      fields:"ID",
      where:"Author = '[Me]'"
    })
    .then(function(data) {
      assert(data.length>0);
    })
  });

  it('$SP().list().get() with "[Today-1]"', function() {
    return $SP().list("SharepointPlus").get({
      fields:"ID",
      where:"Created > '[Today-1]'"
    })
    .then(function(data) {
      assert(data.length>0);
    })
  });

  it('$SP().list().get() with a view', function() {
    return $SP().list("SharepointPlus").get({
      view:'All Items'
    })
    .then(function(data) {
      assert(data.length>0 && data[0].getAttribute("Title"));
    })
  });

  it('$SP().list().get() with rowlimit', function() {
    return $SP().list("SharepointPlus").get({
      rowlimit:1
    })
    .then(function(data) {
      assert(data.length===1);
    })
  });

  it('$SP().list().get() with page', function() {
    return $SP().list("SharepointPlus").get({
      fields:"ID",
      rowlimit:1,
      paging:true,
      page:1,
      orderby:"ID DESC"
    })
    .then(function(data) {
      assert(data.length===1 && data[0].getAttribute("ID") === itemID);
    })
  });

  it('$SP().list().get() with where as an array', function() {
    var testProgressOK = false;
    return $SP().list("SharepointPlus").get({
      fields:"ID",
      where:["ID = "+(itemID-1), "ID = "+itemID],
      progress:function (current, max) {
        if (current === 2 && max === 2) {
          testProgressOK=true;
        }
      }
    })
    .then(function(data) {
      assert(testProgressOK, "The 'progress' function didn't work");
      assert(data.length===2 && data[0].getAttribute("ID") == itemID-1 && data[1].getAttribute("ID") == itemID);
    })
  });

  it('$SP().list().get() with ~', function() {
    return $SP().list("SharepointPlus").get({
      fields:"ID",
      where:"Editor ~= "+_spPageContextInfo.userId
    })
    .then(function(data) {
      assert(data.length>0);
    })
  });

  it('$SP().list().get() with merge', function() {
    return $SP().list("SharepointPlus").get({
      fields:"ID",
      where:"ID = "+(itemID-1),
      merge:[{
        list:"SharepointPlus",
        fields:"ID",
        where:"ID = "+itemID
      }]
    })
    .then(function(data) {
      assert(data.length===2 && data[0].getAttribute("ID")==(itemID-1) && data[1].getAttribute("ID")==itemID);
    })
  });

  it('$SP().list().get() with whereFct', function() {
    var whereOK=false;
    return $SP().list("SharepointPlus").get({
      fields:"ID",
      where:"ID > 0",
      whereFct:function(w) {
        whereOK = (w === '<Gt><FieldRef Name="ID" /><Value Type="Number">0</Value></Gt>');
        return '<Eq><FieldRef Name="ID" /><Value Type="Number">'+itemID+'</Value></Eq>';
      }
    })
    .then(function(data) {
      assert(data.length===1 && data[0].getAttribute("ID")==itemID);
    })
  });

  it('$SP().list().get() with whereCAML', function() {
    var whereOK=false;
    return $SP().list("SharepointPlus").get({
      fields:"ID",
      where:'<Eq><FieldRef Name="ID" /><Value Type="Number">'+itemID+'</Value></Eq>',
      whereCAML:true
    })
    .then(function(data) {
      assert(data.length===1 && data[0].getAttribute("ID")==itemID);
    })
  });

  it('$SP().list().get() with orderby and expandUserField', function() {
    var whereOK=false;
    return $SP().list("SharepointPlus").get({
      fields:["ID","Author"],
      orderby:'ID DESC',
      expandUserField:true
    })
    .then(function(data) {
      assert(data.length > 0 && data[0].getAttribute("ID") > data[1].getAttribute("ID"), "OrderBy option failed");
      assert(data.length > 0 && data[0].getAttribute("Author").indexOf("@") > -1, "ExpandUserField option failed");
    })
  });

  it('$SP().list().get() with showListInAttribute', function() {
    return $SP().list("SharepointPlus").get({
      fields:["ID"],
      showListInAttribute:true
    })
    .then(function(data) {
      assert(data.length > 0 && data[0].getAttribute("SharepointPlus.ID") > 0);
    })
  });

  it('$SP().list().get() with json', function() {
    return $SP().list("SharepointPlus").get({
      fields:["ID"],
      json:true
    })
    .then(function(data) {
      assert(data.length > 0 && data[0].ID > 0);
    })
  });

  it('$SP().list().get() with showListInAttribute and json', function() {
    return $SP().list("SharepointPlus").get({
      fields:["ID"],
      json:true,
      showListInAttribute:true
    })
    .then(function(data) {
      assert(data.length > 0 && data[0]["SharepointPlus.ID"] > 0);
    })
  });

  it('$SP().list().update() Multiple', function() {
    var testProgressOK = false;
    return $SP().list("SharepointPlus").update({Title:"Multiple Updated "+title}, {
      where:"Title = 'Multiple "+title+"'",
      packetsize:2,
      progress:function(n, total) {
        if (n === 5 && total === 5) {
          testProgressOK=true;
        }
      }
    })
    .then(function(items) {
      assert(testProgressOK, 'The "progress" function has not been called');
      assert(items.passed.length===5, "We should have 5 items updated but we have "+items.passed.length);
    })
  });

  it('$SP().list().remove() Multiple', function() {
    var testProgressOK = false;
    return $SP().list("SharepointPlus").remove({
      where:"Title = 'Multiple Updated "+title+"'",
      packetsize:2,
      progress:function(n, total) {
        if (n === 5 && total === 5) {
          testProgressOK=true;
        }
      }
    })
    .then(function(items) {
      assert(testProgressOK, 'The "progress" function has not been called');
      assert(items.passed.length===5, "We should have 5 items removed but we have "+items.passed.length)
    })
  });

  it('$SP().list().add() Multiple with failure', function() {
    return $SP().list("SharepointPlus").add([{Title:"Multiple with failure " + title}, {Title:"Multiple with failure " + title}, {Title:"Multiple with failure " + title}, {UnknownColumn:"Failure"}, {Title:"Multiple with failure " + title}], {
      packetsize:2,
      breakOnFailure:true
    })
    .then(function(items) {
      assert(items.passed.length===3 && items.failed.length===1);
    })
  });

  it('$SP().list().update() Multiple with failure', function() {
    return $SP().list("SharepointPlus").update({UnknownColumn:"Failure"}, {
      where:"Title = 'Multiple with failure " + title + "'",
      packetsize:2,
      breakOnFailure:true
    })
    .then(function(items) {
      assert(items.passed.length===0 && items.failed.length===2);
    })
  });

  it('$SP().list().remove() All', function() {
    return $SP().list("SharepointPlus").remove({
      where:"ID > 0"
    })
    .then(function(items) {
      assert(items.failed.length===0);
    })
  });
})

describe('Calendar', function() {
  this.timeout(5000);

  // parseRecurrence
  // from RecurrenceData XML to object
  it('$SP().parseRecurrence()', function() {
    var rec = $SP().parseRecurrence('<recurrence><rule><firstDayOfWeek>mo</firstDayOfWeek><repeat><monthlyByDay weekday="TRUE" weekdayOfMonth="last" monthFrequency="1" /></repeat><windowEnd>2019-01-19T16:00:00Z</windowEnd></rule></recurrence>');
    assert(rec.type==="monthlyByDay" && rec.firstDayOfWeek==="monday"&&rec.on.weekday==="last"&&rec.frequency===1&&rec.endDate.toISOString()==="2019-01-19T16:00:00.000Z", "From RecurrenceData XML to object");

    assert($SP().parseRecurrence({"type":"weekly","frequency":1,"on":{"monday":true,"tuesday":true,"wednesday":true},"endDate":new Date("2007-05-31T22:00:00.000Z")}) === '<recurrence><rule><firstDayOfWeek>mo</firstDayOfWeek><repeat><weekly mo="TRUE" tu="TRUE" we="TRUE" weekFrequency="1" /></repeat><windowEnd>2007-05-31T22:00:00Z</windowEnd></rule></recurrence>', 'From object to RecurrenceData XML (weekly)');

    // Every weekday
    assert($SP().parseRecurrence({"type":"daily", "firstDayOfWeek":"monday", "on":{ "weekday":true }}) === '<recurrence><rule><firstDayOfWeek>mo</firstDayOfWeek><repeat><daily weekday="TRUE" /></repeat><repeatForever>FALSE</repeatForever></rule></recurrence>', 'From object to RecurrenceData XML (weekday)');

    // Every X days
    assert($SP().parseRecurrence({"type":"daily", "frequency":2}) === '<recurrence><rule><firstDayOfWeek>mo</firstDayOfWeek><repeat><daily dayFrequency="2" /></repeat><repeatForever>FALSE</repeatForever></rule></recurrence>', 'From object to RecurrenceData XML (every X days)');

    // Every week on Monday and Wednesday
    assert($SP().parseRecurrence({"type":"weekly", "firstDayOfWeek":"sunday", "on":{"monday":true, "wednesday":true},frequency:1}) === '<recurrence><rule><firstDayOfWeek>su</firstDayOfWeek><repeat><weekly mo="TRUE" we="TRUE" weekFrequency="1" /></repeat><repeatForever>FALSE</repeatForever></rule></recurrence>', 'From object to RecurrenceData XML (every week on Monday and Wednesday)');

    // Every day 10 of every 2 months
    assert($SP().parseRecurrence({"type":"monthly","on":{"day":10},"frequency":2}) === '<recurrence><rule><firstDayOfWeek>mo</firstDayOfWeek><repeat><monthly monthFrequency="2" day="10" /></repeat><repeatForever>FALSE</repeatForever></rule></recurrence>', 'From object to RecurrenceData XML (every day 10 of every 2 months)');

    // Every second tuesday of every 6 months
    assert($SP().parseRecurrence({"type":"monthlyByDay", "firstDayOfWeek":"monday","on":{ "tuesday":"second"}, "frequency":6}) === '<recurrence><rule><firstDayOfWeek>mo</firstDayOfWeek><repeat><monthlyByDay tu="TRUE" weekdayOfMonth="second" monthFrequency="6" /></repeat><repeatForever>FALSE</repeatForever></rule></recurrence>', 'From object to RecurrenceData XML (every second tuesday of every 6 months)');

    // Every December 25
    assert($SP().parseRecurrence({"type":"yearly","firstDayOfWeek":"monday","on":{"month":12,"day":25},"frequency":1}) === '<recurrence><rule><firstDayOfWeek>mo</firstDayOfWeek><repeat><yearly yearFrequency="1" month="12" day="25" /></repeat><repeatForever>FALSE</repeatForever></rule></recurrence>', 'From object to RecurrenceData XML (every December 25)');

    // The third weekday of September
    assert($SP().parseRecurrence({ "type":"yearlyByDay","on":{"month":9, "weekday":"third"},"frequency":1}) === '<recurrence><rule><firstDayOfWeek>mo</firstDayOfWeek><repeat><yearlyByDay weekday="TRUE" weekDayOfMonth="third"  month="9"yearFrequency="1" /></repeat><repeatForever>FALSE</repeatForever></rule></recurrence>', 'From object to RecurrenceData XML (the third weekday of September)');
  });

  var itemID;
  var title = new Date().getTime();
  it('$SP().list().add()', function() {
    return $SP().list("SharepointPlus Calendar").add({
      Title:title,
      EventDate:"2018-12-20 10:00:00",
      EndDate:"2019-12-31 11:00:00",
      RecurrenceData: {
        "type":"weekly",
        "frequency":1,
        "on":{
          "monday":true,
          "friday":true
        },
        "endDate":new Date(2019,11,31,11,0,0)
      }
    })
    .then(function(items) {
      assert(items.passed.length > 0);
    })
  });

  it('$SP().list().get() (1)', function() {
    return $SP().list("SharepointPlus Calendar").get({
      fields:"Title",
      calendar:true,
      calendarOptions:{
        referenceDate:new Date(2019,2,25), // Monday, March 25, 2019
        range: "Week"
      }
    })
    .then(function(data) {
      itemID = data[0].getAttribute("ID").split('.')[0];
      assert(data.length === 2 &&
          data[0].getAttribute("Title") == title &&
          data[1].getAttribute("Title") == title &&
          data[0].getAttribute("EventDate") === "2019-03-25 10:00:00" &&
          data[0].getAttribute("EndDate") === "2019-03-25 11:00:00" &&
          data[1].getAttribute("EventDate") === "2019-03-29 10:00:00" &&
          data[1].getAttribute("EndDate") === "2019-03-29 11:00:00" &&
          data[0].getAttribute("fRecurrence") == 1 &&
          data[1].getAttribute("fRecurrence") == 1 &&
          data[0].getAttribute("RecurrenceData") === '<recurrence><rule><firstDayOfWeek>mo</firstDayOfWeek><repeat><weekly mo="TRUE" fr="TRUE" weekFrequency="1" /></repeat><windowEnd>2019-12-31T10:00:00Z</windowEnd></rule></recurrence>'
      );
    })
  });

  it('$SP().list().update()', function() {
    return $SP().list("SharepointPlus Calendar").update({
      Title:'Special',
      EventDate:$SP().toSPDate(new Date(2019,2,25,14,0,0), true), // the new start date for the meeting (2pm)
      EndDate:$SP().toSPDate(new Date(2019,2,25,15,0,0), true) // the new end date for the meeting (3pm)
    }, {
      where:'ID = '+itemID, // the criteria that permits to identify your master recurrent event -- IT IS REQUIRED
      event:new Date(2019,2,25) // date of the event that needs to be changed... if the event ID is "5274.0.2019-01-07T15:00:00Z", then you can use "2019-01-07T15:00:00Z"
    })
    .then(function(items) {
      assert(items.passed.length>0, 'No items updated');
      var item = items.passed[0];
      itemID=item.MasterSeriesItemID;
      assert(item.EndDate==="2019-03-25T15:00:00Z" && item.EventDate==="2019-03-25T14:00:00Z" && item.EventType===4 && item.RecurrenceID === "2019-03-25 10:00:00" && item.Title === "Special", "The updated item doesn't look correct.");
    })
  });

  // if you want to delete one occurrence of a recurrent event you must use option "event"
  // e.g. you have an event #1589 that occurs every weekday, from 9am to 10am, but you want to delete the one on December 17, 2018
  it('$SP().list().remove()', function() {
    return $SP().list("SharepointPlus Calendar").remove({
      where:'ID = '+itemID, // the criteria that permits to identify your master recurrent event -- IT IS REQUIRED
      event:"2019-03-29 10:00:00" // date of the event that needs to be deleted, it can be the "RecurrenceID"
    })
    .then(function(items) {
      assert(items.passed.length>0);
    })
  });

  it('$SP().list().get() (2)', function() {
    return $SP().list("SharepointPlus Calendar").get({
      fields:"Title",
      calendar:true,
      calendarOptions:{
        referenceDate:new Date(2019,2,25), // Monday, March 25, 2019
        range: "Week"
      }
    })
    .then(function(data) {
      if (data.length>0) itemID=data[0].getAttribute("MasterSeriesItemID");
      assert(data.length === 1 &&
             data[0].getAttribute("Title") === "Special" &&
             data[0].getAttribute("EventDate") === "2019-03-25 14:00:00" &&
             data[0].getAttribute("EndDate") === "2019-03-25 15:00:00")
    })
  });

  it('$SP().list().remove() (all)', function() {
    // delete all
    return $SP().list('SharepointPlus Calendar').remove({ID:itemID})
    .then(function(items) {
      assert(items.passed.length>0);
    })
  });
});

describe('Document/File', function() {
  this.timeout(5000);

  var filename = new Date().getTime() + ".txt";
  var library = "SharepointPlusLibrary";
  var path = library + "/" + filename;
  var file;
  var folderName = "folder_"+Date.now();
  var fileURL;

  it('$SP().list().createFile()', function() {
    return $SP().list(library).createFile({
      content:'Hello World',
      filename:filename
    })
    .then(function(_file) {
      file = _file;
      fileURL = _file.Url;
      assert(_file.Url.split("/").slice(-2).join("/")===path);
    })
  });

  it('$SP().list().ajax() readfile', function() {
    return $SP().ajax({
      url:fileURL
    })
    .then(function(content) {
      assert(content==='Hello World');
    })
  });

  it('$SP().checkin()', function() {
    // check out the file
    return $SP().webService({
      service:"Lists",
      operation:"CheckOutFile",
      properties:{
        "pageUrl":file.Url,
        checkoutToLocal: "false"
      }
    })
    .then(function() {
      // verify
      return $SP().list("SharepointPlusLibrary").get({
        fields:"ID,CheckoutUser",
        where:'FileRef = "'+file.Url+'"'
      })
    })
    .then(function(data) {
      assert((data.length === 1 && data[0].getAttribute("CheckoutUser") !== null), "The checkout with webService has failed");

      // checkin
      return $SP().checkin({
        destination:file.Url,
        comments:"Automatic check in with SharepointPlus"
      })
      .then(function() {
        // verify
        return $SP().list("SharepointPlusLibrary").get({
          fields:"ID,CheckoutUser",
          where:'FileRef = "'+file.Url+'"'
        })
        .then(function(data) {
          assert((data.length === 1 && data[0].getAttribute("CheckoutUser") === null), "The checkin process failed");
        })
      })
    });
  })

  it('$SP().list().createFile()', function() {
    return $SP().list("fakelibrary").createFile({
      content:str2ab('Hello World'),
      filename:filename
    })
    .catch(function(error) {
      assert(true);
    });
  });

  it('$SP().list().createFolder()', function() {
    return $SP().list(library).createFolder(folderName)
    .then(function(folder) {
      assert(folder.BaseName == folderName)
    })
  });

  it('$SP().list().createFile() in folder', function() {
    return $SP().list(library).createFile({
      content:str2ab('Hello World'),
      filename:folderName + '/' + filename
    })
    .then(function(_file) {
      assert(_file.Url.indexOf(folderName + '/' + filename)>-1);
    })
  });

  var refFolder;
  it('$SP().list().get() with FilesAndFolders_Recursive', function() {
    return $SP().list(library).get({
      fields:"BaseName,FileRef,FSObjType",
      folderOptions:{
        show:"FilesAndFolders_Recursive"
      }
    })
    .then(function(data) {
      assert(data.length===3 && data[0].getAttribute("FileRef").indexOf(folderName)>-1 && data[1].getAttribute("FileRef").indexOf(filename)>-1 && data[2].getAttribute("FileRef").indexOf(folderName + '/' + filename)>-1);
      refFolder=data[0].getAttribute("FileRef");
    })
  });

  it('$SP().list().remove() folder by ref', function() {
    // delete files
    var folder = refFolder.split(";#");
    return $SP().list(library).remove({ID:folder[0], FileRef:folder[1]})
    .then(function(items) {
      assert(items.passed.length === 1 && items.failed.length===0);
    })
  });


  it('$SP().list().remove() file with where', function() {
    // delete files
    return $SP().list(library).remove({where:"ID > 0"})
    .then(function(items) {
      assert(items.passed.length === 1 && items.failed.length===0);
    })
  });
});

describe('People', function() {
  this.timeout(5000);

  var username, spusername, lastname;
  it('$SP().whoami()', function() {
    return $SP().whoami()
    .then(function(people) {
      if (people["AccountName"]) {
        username = people["AccountName"].toLowerCase();
        spusername = "i:0#.w|" + username;
        lastname = people["LastName"];
        assert(true);
      }
    })
  });

  it('$SP().isMember()', function() {
    // test isMember()
    return $SP().isMember({user:username, group:"SharepointPlus"})
    .then(function(isMember) {
      assert(isMember);
    });
  });

  it('$SP().groupMembers()', function() {
    // test groupMembers
    return $SP().groupMembers("SharepointPlus")
    .then(function(members) {
      var passed=false;
      for (var i=members.length; i--;) {
        if (spusername.indexOf(members[i]["LoginName"].toLowerCase()) !== -1) {
          passed=true;
          break;
        }
      }
      assert(passed);
    });

    it('$SP().addressbook()', function() {
      // test addressbook
      return $SP().addressbook(lastname, {limit:100})
      .then(function(people) {
        var passed=false;
        for (var i=0; i < people.length; i++) {
          for (var j=0; j < people[i].length; j++) {
            if (people[i]["AccountName"].toLowerCase() === username) {
              passed=true;
              break;
            }
          }
        }
        assert(passed);
      });
    });

    it('$SP().getUserInfo()', function() {
      // test getUserInfo
      return $SP().getUserInfo(spusername)
      .then(function(info) {
        assert((typeof info !== "string" && info.LoginName.toLowerCase() === spusername));
      });
    })
  });
});

describe('Utils', function() {
  this.timeout(5000);

  it('$SP().toDate()', function() {
    var date = $SP().toDate("2012-10-31T00:00:00");
    assert(date.getFullYear() === 2012 && date.getMonth() === 9 && date.getDate() === 31);
  });

  it('$SP().toSPDate()', function() {
    assert($SP().toSPDate(new Date(2012,9,31), true) === "2012-10-31T00:00:00Z");
  });

  it('$SP().toXSLString()', function() {
    assert($SP().toXSLString("Big Title") === "Big_x0020_Title");
  });

  it('$SP().workflowStatusToText()', function() {
    assert($SP().workflowStatusToText(2) === "In Progress");
  });

  it('$SP().cleanResult()', function() {
    assert($SP().cleanResult("42;#Aymeric") === "Aymeric");
  });

  it('$SP().getLookup() - Simple', function() {
    var gl=$SP().getLookup("42;#Aymeric");
    assert(gl.id==42 && gl.value==="Aymeric");
  });

  it('$SP().getLookup() - Multiple', function() {
    var gl=$SP().getLookup("42;#Aymeric;#70;#Kodono");
    assert(gl.id[0]==="42" && gl.value[0]==="Aymeric" && gl.id[1]==70 && gl.value[1]==="Kodono");
  });

  it('$SP().getLookup() - Invalid', function() {
    var gl=$SP().getLookup("42");
    assert(gl.id==42 && gl.value==="42");
  });

  it('$SP().getPeopleLookup() - Simple Long', function() {
    var gpl=$SP().getPeopleLookup("42;#Doe,, John,#i:0#.w|domain\\John_Doe,#John_Doe@Domain.com,#John_Doe@Domain.com,#Doe,, John");
    assert(gpl.id==42 && gpl.name==="Doe, John" && gpl.username==="i:0#.w|domain\\John_Doe" && gpl.email==="John_Doe@Domain.com");
  });

  it('$SP().getPeopleLookup() - Multiple Long', function() {
    var gpl = $SP().getPeopleLookup("42;#Doe,, John,#i:0#.w|domain\\John_Doe,#John_Doe@Domain.com,#John_Doe@Domain.com,#Doe,, John;#1981;#Doe,, Jane,#i:0#.w|domain\\Jane_Doe,#Jane_Doe@Domain.com,#Jane_Doe@Domain.com,#Doe,, Jane");
    assert(Array.isArray(gpl) && gpl.length === 2 && gpl[0].id==42 && gpl[0].name==="Doe, John" && gpl[0].username==="i:0#.w|domain\\John_Doe" && gpl[0].email==="John_Doe@Domain.com" && gpl[1].id==1981 && gpl[1].name==="Doe, Jane" && gpl[1].username==="i:0#.w|domain\\Jane_Doe" && gpl[1].email==="Jane_Doe@Domain.com");
  });

  it('$SP().getPeopleLookup() - Simple Short', function() {
    var gpl=$SP().getPeopleLookup("42;#Doe,, John");
    assert(gpl.id==42 && gpl.name==="Doe, John" && gpl.username==="" && gpl.email==="");
  });

  it('$SP().regionalDateFormat()', function() {
    return $SP().regionalDateFormat()
    .then(function(dateFormat) {
      assert(dateFormat.indexOf("YY")>-1);
    });
  });
});

describe('Modals', function() {
  this.timeout(5000);
  it('ModalDialog', function() {
    return $SP().showModalDialog({
      id:"QUnitModal",
      title:"ModalTitle",
      html:"<p id='modalbody'>ModalBody</p>",
      onload:function() {
        assert(document.querySelector('#dialogTitleSpan').innerHTML === "ModalTitle", '"ModalTitle" has not been found')
        assert(document.querySelector('#modalbody').innerHTML === "ModalBody", '"ModalBody" has not been found')
        setTimeout(function() {
          var modal = $SP().getModalDialog('QUnitModal');
          if (modal) {
            $SP().closeModalDialog(modal, true);
          } else {
            assert(false, '$SP().getModalDialog() has failed');
          }
        }, 1200)
      }
    })
    .then(function(res) {
      assert(res.dialogResult === true, "$SP().closeModalDialog() should have returned 'true', but '"+res.dialogResult+"' has been returned")
    });
  });

  it('Notify', function() {
    return new Promise(function(prom_res) {
      $SP().notify("Hello World", {sticky:true, name:"QUnitNotify"});
      setTimeout(function() {
        var txt = document.querySelector('#notificationArea .ms-trcnoti-toast').innerText;
        assert(txt === "Hello World", '"'+txt+'" has been found in the notify instead of "Hello World"');

        $SP().removeNotify("QUnitNotify", {all:true});
        setTimeout(function() {
          assert(document.querySelector('#notificationArea .ms-trcnoti-toast') === null, "The notify seems to be still here when it should have been removed.");
          prom_res();
        }, 2500)
      }, 1500)
    })
  })
})

function deleteTestEnvironment() {
  $SP().waitModalDialog("Deleting...");
  Promise.all([
    $SP().webService({
      service:"Lists",
      operation:"DeleteList",
      properties:{
        listName: "SharepointPlus",
      }
    }),
    $SP().webService({
      service:"Lists",
      operation:"DeleteList",
      properties:{
        listName: "SharepointPlus Calendar",
      }
    }),
    $SP().webService({
      service:"Lists",
      operation:"DeleteList",
      properties:{
        listName: "SharepointPlusLookup",
      }
    }),
    $SP().webService({
      service:"Lists",
      operation:"DeleteList",
      properties:{
        listName: "SharepointPlusLibrary",
      }
    }),
    $SP().webService({
      service:"UserGroup",
      operation:"RemoveGroup",
      soapURL:"http://schemas.microsoft.com/sharepoint/soap/directory/",
      properties:{
        groupName: "SharepointPlus",
      }
    })
  ])
  .then(function() {
    return $SP().list("Site Pages").remove({
      where:"BaseName = 'Tests.aspx' OR BaseName LIKE 'sharepointplus.' OR BaseName LIKE 'sptests.' OR BaseName LIKE 'mocha.' OR BaseName LIKE 'chai.'"
    });
  })
  .then(function() {
    return $SP().getURL();
  })
  .then(function(url) {
    window.location.href = url;
  })
}

// https://stackoverflow.com/a/18702655/1134119
var runner = mocha.run();
var testHasFailed = false;
runner.on("fail", function() {
  testHasFailed=true;
});
runner.on("end", function() {
  var el = document.querySelector('#result');
  var txt = '✓ Test Suite Success';
  if (testHasFailed) {
    txt = '✖ Test Suite Failed';
    el.style.color = 'red';
  }
  el.innerHTML = txt + '<br><button type="button" onclick="deleteTestEnvironment()">Delete Test Environment</button>';
})
