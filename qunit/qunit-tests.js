QUnit.config.autostart = false;

var __currentUserName=""; // current user name need for tests
// we use SPServices to create the test environment
function getListSharepointPlus(list) {
  var deferred = jQuery.Deferred();
  list = list || "SharepointPlus";

  $('#testEnv').text("Test Environment Setup : checking if list '"+list+"' exists...");

  $().SPServices({
    operation: "GetList",
    listName: list,
    completefunc: function(xData, Status) {
      if (Status === "error") {
        var error = $(xData.responseXML).find('errorstring').text();
        if (error.indexOf("List does not exist") > -1) {
          deferred.reject("List does not exist");
        } else {
          deferred.reject(error);
        }
      } else {
        deferred.resolve($(xData.responseXML).find("List").attr("ID"));
      }
    }
  })

  return deferred;
}
function createListSharepointPlus(list) {
  var deferred = jQuery.Deferred();
  list = list || "SharepointPlus";

  $('#testEnv').text("Test Environment Setup : creating list '"+list+"'...");

  $().SPServices({
    operation: "AddList",
    listName: list,
    description:"List used for SharepointPlus tests",
    templateID:(list.indexOf("Library") > -1?"101":"100"),
    completefunc: function(xData, Status) {
      if (Status === "error") {
        deferred.reject($(xData.responseXML).find('errorstring').text());
      } else {
        deferred.resolve();
      }
    }
  })

  return deferred;
}
function createListFields(libraryID) {
  var deferred = jQuery.Deferred();

  $('#testEnv').text("Test Environment Setup : creating test fields...");

  var fields = [];
  fields.push({"DisplayName":"Single line of text", "Type":"Text", "Required":"TRUE"});
  fields.push({"DisplayName":"Person or Group", "Type":"User"});
  fields.push({"DisplayName":"Person or Group (Multiple)", "Type":"UserMulti", "Mult":"TRUE"});
  fields.push({"DisplayName":"Multiple lines of text (Plain)", "Type":"Note", "RichText":"FALSE"});
  fields.push({"DisplayName":"Multiple lines of text (Rich)", "Type":"Note", "RichText":"TRUE", "RichTextMode":"FullHtml"});
  //fields.push({"DisplayName":"Multiple lines of text (Append)", "Type":"Note", "RichText":"FALSE", "AppendOnly":"TRUE" });
  fields.push({"DisplayName":"Choices (Dropdown)", "Type":"Choice", "Format":"Dropdown", "FillInChoice":"FALSE", "_CHOICES":[{"CHOICE":"Option 1"},{"CHOICE":"Option 2"},{"CHOICE":"Option 3"}] });
  fields.push({"DisplayName":"Choices (Dropdown Fillin)", "Type":"Choice", "Format":"Dropdown", "FillInChoice":"TRUE", "_CHOICES":[{"CHOICE":"Option 1"},{"CHOICE":"Option 2"},{"CHOICE":"Option 3"}] });
  fields.push({"DisplayName":"Choices (Radio)", "Type":"Choice", "Format":"RadioButtons", "FillInChoice":"FALSE", "_CHOICES":[{"CHOICE":"Option 1"},{"CHOICE":"Option 2"},{"CHOICE":"Option 3"}] });
  fields.push({"DisplayName":"Choices (Radio Fillin)", "Type":"Choice", "Format":"RadioButtons", "FillInChoice":"TRUE", "_CHOICES":[{"CHOICE":"Option 1"},{"CHOICE":"Option 2"},{"CHOICE":"Option 3"}] });
  fields.push({"DisplayName":"Choices (Checkboxes)", "Type":"MultiChoice", "FillInChoice":"FALSE", "_CHOICES":[{"CHOICE":"Option 1"},{"CHOICE":"Option 2"},{"CHOICE":"Option 3"}] });
  fields.push({"DisplayName":"Choices (Checkboxes Fillin)", "Type":"MultiChoice", "FillInChoice":"TRUE", "_CHOICES":[{"CHOICE":"Option 1"},{"CHOICE":"Option 2"},{"CHOICE":"Option 3"}] });
  fields.push({"DisplayName":"Number", "Type":"Number", "Min":"0", "Max":"100" });
  fields.push({"DisplayName":"Number (Percentage)", "Type":"Number", "Percentage":"TRUE" });
  fields.push({"DisplayName":"Currency", "Type":"Currency", "LCID":"1033" });
  fields.push({"DisplayName":"Date Only", "Type":"DateTime", "Format":"DateOnly", "FriendlyDisplayFormat":"Disabled" });
  fields.push({"DisplayName":"Date and Time", "Type":"DateTime", "FriendlyDisplayFormat":"Disabled" });
  //fields.push({"DisplayName":"Date and Time (Friendly)", "Type":"DateTime", "Format":"DateOnly", "FriendlyDisplayFormat":"Relative" });
  fields.push({"DisplayName":"Lookup", "Type":"Lookup", "ShowField":"Title", "List":libraryID, "PrependId":"TRUE" });
  fields.push({"DisplayName":"Lookup (Multiple)", "Type":"LookupMulti", "ShowField":"Title", "List":libraryID, "PrependId":"TRUE", "Mult":"TRUE" });
  fields.push({"DisplayName":"Yes No", "Type":"Boolean", "_Default":"0" });
  fields.push({"DisplayName":"Hyperlink", "Type":"URL", "Format":"Hyperlink" });
  //fields.push({"DisplayName":"Picture", "Type":"URL", "Format":"Image" });

  var fieldsToAdd = '<Fields>', field, i, j, attr, options, opt;
  // for each field we create it into the list
  for (i=0; i<fields.length; i++) {
    fieldsToAdd += '<Method ID="'+(i+1)+'">'
                +  '<Field ';

    options="";
    for (attr in fields[i]) {
      if (fields[i].hasOwnProperty(attr)) {
        field = fields[i][attr];

        if (attr.slice(0,1) === "_") {
          options += '<'+attr.slice(1)+'>';
          if (jQuery.type(field) === "array") {
            for (j=0; j<field.length; j++) {
              for (opt in field[j]) {
                if (field[j].hasOwnProperty(opt)) {
                  options += '<'+opt+'>'+field[j][opt]+'</'+opt+'>';
                }
              }
            }
          } else {
            if (typeof field === "string") {
              options += field;
            } else {
              for (opt in field) {
                if (field.hasOwnProperty(opt)) {
                  options += '<'+opt+'>'+field[opt]+'</'+opt+'>';
                }
              }
            }
          }
          options += '</'+attr.slice(1)+'>';
        } else {
          fieldsToAdd += attr+'="'+fields[i][attr]+'" ';
        }
      }
    }
    fieldsToAdd += ' Description="Field created for tests with SharepointPlus">' + options + '</Field>'
    fieldsToAdd += '</Method>';
  }
  fieldsToAdd += '</Fields>';

  // add some items in SharepointPlusLookup
  $().SPServices({
    operation: "UpdateListItems",
    listName: "SharepointPlusLookup",
    updates: "<Batch OnError='Continue' PreCalc='TRUE'>" +
            "<Method ID='1' Cmd='New'>" +
                "<Field Name='Title'>Option 1</Field>" +
            "</Method>" +
            "<Method ID='2' Cmd='New'>" +
                "<Field Name='Title'>Option 2</Field>" +
            "</Method>" +
            "<Method ID='3' Cmd='New'>" +
                "<Field Name='Title'>Option 3</Field>" +
            "</Method>" +
        "</Batch>",
    completefunc: function(xData, Status) {
      // we now create fields in SharepointPlus list
      $().SPServices({
        operation: "UpdateList",
        listName: "SharepointPlus",
        listProperties:"<List EnableVersioning='TRUE' />",
        updateFields: "",
        newFields: fieldsToAdd,
        deleteFields: "",
        listVersion: "",
        completefunc: function (xData, Status) {
          deferred.resolve();
        }
      });
    }
  });

  return deferred;
}
function addWebPartInSharepointList() {
  $('#testEnv').text("Test Environment Setup : loading webpart...");

  $().SPServices({
    operation: "AddWebPart",
    pageUrl: $().SPServices.SPGetCurrentSite() + "/Lists/SharepointPlus/NewForm.aspx",
    webPartXml:("<?xml version=\"1.0\" encoding=\"utf-16\"?>\n" +    "<WebPart xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns=\"http://schemas.microsoft.com/WebPart/v2\">\n" +
      "<Title>Content Editor Web Part</Title>\n  " +
      "<FrameType>Default</FrameType>\n  " +
      "<Description>Use for formatted text, tables, and images.</Description>\n  " +
      "<IsIncluded>true</IsIncluded>\n  " +
      "<ZoneID>Header</ZoneID>\n  " +
      "<PartOrder>1</PartOrder>\n  " +
      "<FrameState>Normal</FrameState>\n  " +
      "<Height />\n  " +
      "<Width />\n  " +
      "<AllowRemove>true</AllowRemove>\n  " +
      "<AllowZoneChange>true</AllowZoneChange>\n  " +
      "<AllowMinimize>true</AllowMinimize>\n  " +
      "<IsVisible>true</IsVisible>\n  " +
      "<DetailLink />\n  " +
      "<HelpLink />\n  " +
      "<Dir>Default</Dir>\n  " +
      "<PartImageSmall />\n  " +
      "<MissingAssembly />\n  " +
      "<PartImageLarge>/_layouts/images/mscontl.gif</PartImageLarge>\n  " +
      "<IsIncludedFilter />\n  " +
      "<Assembly>Microsoft.SharePoint, Version=12.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c</Assembly>\n  " +
      "<TypeName>Microsoft.SharePoint.WebPartPages.ContentEditorWebPart</TypeName>\n  " +
      "<ContentLink xmlns=\"http://schemas.microsoft.com/WebPart/v2/ContentEditor\" />\n  " +
      "<Content xmlns=\"http://schemas.microsoft.com/WebPart/v2/ContentEditor\"><![CDATA["+ $('script').filter('[src*="jquery"]:first,[src*="sharepointplus"]:first').map(function() { return this.outerHTML }).toArray().join("") +"]]></Content>\n  " +
      "<PartStorage xmlns=\"http://schemas.microsoft.com/WebPart/v2/ContentEditor\" />\n</WebPart>").replace(/</g,"&lt;").replace(/>/g,"&gt;"),
    storage:"Shared",
    completefunc: function(xData, Status) {
      $().SPServices({
        operation: "AddWebPart",
        pageUrl: $().SPServices.SPGetCurrentSite() + "/Lists/SharepointPlus/EditForm.aspx",
        webPartXml:("<?xml version=\"1.0\" encoding=\"utf-16\"?>\n" +    "<WebPart xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns=\"http://schemas.microsoft.com/WebPart/v2\">\n" +
          "<Title>Content Editor Web Part</Title>\n  " +
          "<FrameType>Default</FrameType>\n  " +
          "<Description>Use for formatted text, tables, and images.</Description>\n  " +
          "<IsIncluded>true</IsIncluded>\n  " +
          "<ZoneID>Header</ZoneID>\n  " +
          "<PartOrder>1</PartOrder>\n  " +
          "<FrameState>Normal</FrameState>\n  " +
          "<Height />\n  " +
          "<Width />\n  " +
          "<AllowRemove>true</AllowRemove>\n  " +
          "<AllowZoneChange>true</AllowZoneChange>\n  " +
          "<AllowMinimize>true</AllowMinimize>\n  " +
          "<IsVisible>true</IsVisible>\n  " +
          "<DetailLink />\n  " +
          "<HelpLink />\n  " +
          "<Dir>Default</Dir>\n  " +
          "<PartImageSmall />\n  " +
          "<MissingAssembly />\n  " +
          "<PartImageLarge>/_layouts/images/mscontl.gif</PartImageLarge>\n  " +
          "<IsIncludedFilter />\n  " +
          "<Assembly>Microsoft.SharePoint, Version=12.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c</Assembly>\n  " +
          "<TypeName>Microsoft.SharePoint.WebPartPages.ContentEditorWebPart</TypeName>\n  " +
          "<ContentLink xmlns=\"http://schemas.microsoft.com/WebPart/v2/ContentEditor\" />\n  " +
          "<Content xmlns=\"http://schemas.microsoft.com/WebPart/v2/ContentEditor\"><![CDATA["+ $('script').filter('[src*="jquery"]:first,[src*="sharepointplus"]:first').map(function() { return this.outerHTML }).toArray().join("") +"]]></Content>\n  " +
          "<PartStorage xmlns=\"http://schemas.microsoft.com/WebPart/v2/ContentEditor\" />\n</WebPart>").replace(/</g,"&lt;").replace(/>/g,"&gt;"),
        storage:"Shared",
        completefunc: function(xData, Status) {
          initTestEnvironment();
        }
      })
    }
  })
}
function checkGroupSharepointPlus(pre) {
  var deferred = jQuery.Deferred();
  pre = pre || "";

  // get the current user name
  $().SPServices({
    operation:"GetUserProfileByName",
    accountName: "",
    completefunc:function(xData, Status) {
      var accountName = pre + $(xData.responseXML).find('Name:contains("AccountName"):first').nextAll('Values').find('Value').text();
      // create group
      $().SPServices({
        operation:"AddGroup",
        groupName: "SharepointPlus",
        ownerIdentifier: accountName,
        ownerType: "user",
        defaultUserLoginName: accountName,
        description: "Group for SharepointPlus tests",
        completefunc:function(xData, Status) {
          __currentUserName = accountName;
          if (Status === "error" && pre === "" && $(xData.responseXML).find('errorstring').text().indexOf("Please try again with a new name") === -1) {
            $.when( checkGroupSharepointPlus("i:0#.w|") ).done(function() {
              deferred.resolve();
            });
          }
          else deferred.resolve();
        }
      })
    }
  });

  return deferred;
}
function deleteTestEnvironment() {
  $q('#testEnv').text("Deleting...");

  $q.when(

    (function() {
      var deferred = $q.Deferred();
      $q().SPServices({
        operation:"DeleteList",
        listName: "SharepointPlus",
        completefunc:function() {
          deferred.resolve();
        }
      })
      return deferred;
    }()),

    (function() {
      var deferred = $q.Deferred();
      $q().SPServices({
        operation:"DeleteList",
        listName: "SharepointPlusLookup",
        completefunc:function() {
          deferred.resolve();
        }
      })
      return deferred;
    }()),

    (function() {
      var deferred = $q.Deferred();
      $q().SPServices({
        operation:"DeleteList",
        listName: "SharepointPlusLibrary",
        completefunc:function() {
          deferred.resolve();
        }
      })
      return deferred;
    }()),

    (function() {
      var deferred = $q.Deferred();
      $q().SPServices({
        operation:"RemoveGroup",
        groupName: "SharepointPlus",
        completefunc:function() {
          deferred.resolve();
        }
      })
      return deferred;
    }())

  ).done(function() {
    $q('#testEnv').text("Test Environment Removed!");
  });
}

function initTestEnvironment() {
  // check if SharepointPlus Lookup exists
  $.when( getListSharepointPlus("SharepointPlusLookup") ).then(
    function yes(libraryID) {

      // check if "SharepointPlusLibrary" exists
      $.when( getListSharepointPlus("SharepointPlusLibrary") ).then(

        function yes() {
          // get library
          // check if "SharepointPlus" list exists
          $.when( getListSharepointPlus("SharepointPlus") ).then(
            function yes() {

              // check if SharepointPlus group exists
              $.when( checkGroupSharepointPlus() ).done(function() {
                $('#testEnv').text("Test environnement OK");
                initSPtests()
              });

            },
            function fail(error) {
              // if list doesn't exist, then create it
              if (error === "List does not exist") {

                $.when( createListSharepointPlus("SharepointPlus") ).then(
                  function done() {
                    // create fields
                    createListFields(libraryID).done(function() {
                      // add web part into the NewForm.aspx
                      addWebPartInSharepointList()
                    });
                  },
                  function fail(error) {
                    alert("Error with AddList: " + error);
                  }
                );

              } else {
                alert("Error with GetList: " + error);
              }
            }
          );
        },
        function fail(error) {
          // if library doesn't exist, then create it
          if (error === "List does not exist") {

            $.when( createListSharepointPlus("SharepointPlusLibrary") ).then(
              function done() {
                initTestEnvironment();
              },
              function fail(error) {
                alert("Error with AddList: " + error);
              }
            );

          } else {
            alert("Error with GetList: " + error);
          }
        }
      );
    },
    function fail(error) {
      // if library doesn't exist, then create it
      if (error === "List does not exist") {

        $.when( createListSharepointPlus("SharepointPlusLookup") ).then(
          function done() {
            initTestEnvironment();
          },
          function fail(error) {
            alert("Error with AddList: " + error);
          }
        );

      } else {
        alert("Error with GetList: " + error);
      }
    }
  );
}

// init environment test
initTestEnvironment();


function initSPtests() {
  $('#testEnv').text("Loading tests...");
  $('#testframe').attr("src",$().SPServices.SPGetCurrentSite() + "/Lists/SharepointPlus/NewForm.aspx").load(function() {
    $('#testEnv').text("Running tests...");
    // for my own environment
    if (window.frames[0].document.documentElement.className.indexOf("ie8") > -1 && typeof window.frames[0].Array.prototype.indexOf === "function") {
      window.frames[0].Array.prototype.indexOf = undefined;
    }
    // because Sharepoint things Chrome is IE7 that fails some tests
    window.frames[0].IsIE7 = function() { return false };
    loadSPtests();
  })
}

// source inspiration https://github.com/michelgotta/qunit-blogpost-example
function loadSPtests() {
  $q = jQuery.noConflict(true);

  $q(function() {
    function getSharePointMajorVersion(){
     var deferred = $q.Deferred();

     // The following copied from: http://msdn.microsoft.com/en-us/library/ms537505(v=vs.85).aspx
      var xmlHttp = null;
      if (window.XMLHttpRequest) {
        // If IE7, Mozilla, Safari, and so on: Use native object.
        xmlHttp = new XMLHttpRequest();
      }else{
        if (window.ActiveXObject) {
           // ...otherwise, use the ActiveX control for IE5.x and IE6.
           xmlHttp = new ActiveXObject('MSXML2.XMLHTTP.3.0');
        }
      }
      xmlHttp.open('HEAD', location.href, false);
      xmlHttp.send();
      var SPVersion = xmlHttp.getResponseHeader("MicrosoftSharePointTeamServices");
      if(SPVersion == null){
        deferred.resolve(0);
      }else{
        deferred.resolve(SPVersion.slice(0,2))
      }

      return deferred;
    }

    $q.when( getSharePointMajorVersion() ).done(function(spversion) {
      // Get the jQuery Object from the original code
      $ = jQuery = window.frames[0].jQuery;
      $SP = window.frames[0].SharepointPlus;
      var pagetitle = document.querySelector('#qunit-header');
      if (pagetitle) pagetitle.innerHTML = pagetitle.innerHTML + ' ' + $SP().getVersion();

      test('formfields()', function(assert) {
        // --- for Single line of text
        // test .val()
        assert.ok(function() {
          $SP().formfields("Single line of text").val("test");
          return $SP().formfields("Single line of text").val() === "test";
        }(), "Single line of text -- val()");
        // test isMandatory()
        assert.ok(($SP().formfields("Single line of text").isMandatory() === true), "Single line of text -- isMandatory()");
        // test name()
        assert.ok(($SP().formfields("Single line of text").name() === "Single line of text"), "Single line of text -- name()");
        // test description()
        assert.ok(($SP().formfields("Single line of text").description() === "Field created for tests with SharepointPlus"), "Single line of text -- description()");
        // test elem()
        assert.ok(($SP().formfields("Single line of text").elem(false).tagName.toUpperCase() === "INPUT"), "Single line of text -- elem()");
        // test type()
        assert.ok(($SP().formfields("Single line of text").type() === "text"), "Single line of text -- type()");
        // test .row()
        assert.ok(function() {
          $SP().formfields("Single line of text").row().hide();
          return !$SP().formfields("Single line of text").row().is(':visible');
        }(), "Single line of text -- row()");

        // --- for Person or Group
        // test .val()
        var currentUserName = __currentUserName.split("|");
        currentUserName = (currentUserName.length > 1 ? currentUserName[currentUserName.length-1] : currentUserName[0]);
        assert.ok(function() {
          $SP().formfields("Person or Group").val(currentUserName);
          var key = $SP().formfields("Person or Group").val({extend:true}).Key.toLowerCase();
          return (key === __currentUserName.toLowerCase() || key === currentUserName.toLowerCase());
        }(), "Person or Group -- val()");
        // test isMandatory()
        assert.ok(($SP().formfields("Person or Group").isMandatory() === false), "Person or Group -- isMandatory()");
        // test name()
        assert.ok(($SP().formfields("Person or Group").name() === "Person or Group"), "Person or Group -- name()");
        // test description()
        assert.ok(($SP().formfields("Person or Group").description() === "Field created for tests with SharepointPlus"), "Person or Group -- description()");
        // test elem()
        assert.ok(
          (function() {
            var el = $SP().formfields("Person or Group").elem(false);
            if (SPIsArray(el)) el=el[0];
            return el.tagName.toUpperCase() === "DIV"
          }()), "Person or Group -- elem()");
        // test type()
        assert.ok(($SP().formfields("Person or Group").type() === "people"), "Person or Group -- type()");
        // test .row()
        assert.ok(function() {
          $SP().formfields("Person or Group").row().hide();
          return !$SP().formfields("Person or Group").row().is(':visible');
        }(), "Person or Group -- row()");

        // --- for Person or Group (Multiple)
        // test .val()
        assert.ok(function() {
          $SP().formfields("Person or Group (Multiple)").val([currentUserName, currentUserName]);
          var arr = $SP().formfields("Person or Group (Multiple)").val({extend:true});
          if (SPIsArray(arr)) {
            return arr.length === 2 && (arr[0].Key.toLowerCase() == __currentUserName.toLowerCase() || arr[0].Key.toLowerCase() == currentUserName.toLowerCase()) && (arr[1].Key.toLowerCase() == __currentUserName.toLowerCase() || arr[1].Key.toLowerCase() == currentUserName.toLowerCase());
          } else {
            return (arr.Key.toLowerCase() == __currentUserName.toLowerCase() || arr.Key.toLowerCase() == currentUserName.toLowerCase());
          }
        }(), "Person or Group (Multiple) -- val()");
        // test isMandatory()
        assert.ok(($SP().formfields("Person or Group (Multiple)").isMandatory() === false), "Person or Group (Multiple) -- isMandatory()");
        // test name()
        assert.ok(($SP().formfields("Person or Group (Multiple)").name() === "Person or Group (Multiple)"), "Person or Group (Multiple) -- name()");
        // test description()
        assert.ok(($SP().formfields("Person or Group (Multiple)").description() === "Field created for tests with SharepointPlus"), "Person or Group (Multiple) -- description()");
        // test elem()
        assert.ok(
          (function() {
            var el = $SP().formfields("Person or Group (Multiple)").elem(false);
            if (SPIsArray(el)) el=el[0];
            return el.tagName.toUpperCase() === "DIV"
          }()), "Person or Group (Multiple) -- elem()");
        // test type()
        assert.ok(($SP().formfields("Person or Group (Multiple)").type() === "people multiple"), "Person or Group (Multiple) -- type()");
        // test .row()
        assert.ok(function() {
          $SP().formfields("Person or Group (Multiple)").row().hide();
          return !$SP().formfields("Person or Group (Multiple)").row().is(':visible');
        }(), "Person or Group (Multiple) -- row()");

        // --- for Multiple lines of text (Plain)
        // test .val()
        assert.ok(function() {
          $SP().formfields("Multiple lines of text (Plain)").val("test");
          return $SP().formfields("Multiple lines of text (Plain)").val() === "test";
        }(), "Multiple lines of text (Plain) -- val()");
        // test isMandatory()
        assert.ok(($SP().formfields("Multiple lines of text (Plain)").isMandatory() === false), "Multiple lines of text (Plain) -- isMandatory()");
        // test name()
        assert.ok(($SP().formfields("Multiple lines of text (Plain)").name() === "Multiple lines of text (Plain)"), "Multiple lines of text (Plain) -- name()");
        // test description()
        assert.ok(($SP().formfields("Multiple lines of text (Plain)").description() === "Field created for tests with SharepointPlus"), "Multiple lines of text (Plain) -- description()");
        // test elem()
        assert.ok(($SP().formfields("Multiple lines of text (Plain)").elem(false).tagName.toUpperCase() === "TEXTAREA"), "Multiple lines of text (Plain) -- elem()");
        // test type()
        assert.ok(($SP().formfields("Multiple lines of text (Plain)").type() === "text multiple"), "Multiple lines of text (Plain) -- type()");
        // test .row()
        assert.ok(function() {
          $SP().formfields("Multiple lines of text (Plain)").row().hide();
          return !$SP().formfields("Multiple lines of text (Plain)").row().is(':visible');
        }(), "Multiple lines of text (Plain) -- row()");

        // --- for Multiple lines of text (Rich)
        // test .val()
        assert.ok(function() {
          $SP().formfields("Multiple lines of text (Rich)").val("<b>test</b>");
          return $SP().formfields("Multiple lines of text (Rich)").val().toLowerCase() === "<b>test</b>";
        }(), "Multiple lines of text (Rich) -- val()");
        // test isMandatory()
        assert.ok(($SP().formfields("Multiple lines of text (Rich)").isMandatory() === false), "Multiple lines of text (Rich) -- isMandatory()");
        // test name()
        assert.ok(($SP().formfields("Multiple lines of text (Rich)").name() === "Multiple lines of text (Rich)"), "Multiple lines of text (Rich) -- name()");
        // test description()
        assert.ok(($SP().formfields("Multiple lines of text (Rich)").description() === "Field created for tests with SharepointPlus"), "Multiple lines of text (Rich) -- description()");
        // test elem()
        assert.ok(($SP().formfields("Multiple lines of text (Rich)").elem(false).tagName.toUpperCase() === "DIV"), "Multiple lines of text (Rich) -- elem()");
        // test type()
        assert.ok(($SP().formfields("Multiple lines of text (Rich)").type() === "html multiple"), "Multiple lines of text (Rich) -- type()");
        // test .row()
        assert.ok(function() {
          $SP().formfields("Multiple lines of text (Rich)").row().hide();
          return !$SP().formfields("Multiple lines of text (Rich)").row().is(':visible');
        }(), "Multiple lines of text (Rich) -- row()");

        // --- for Choices (Dropdown)
        // test .val()
        assert.ok(function() {
          $SP().formfields("Choices (Dropdown)").val("Option 2");
          return $SP().formfields("Choices (Dropdown)").val() == "Option 2";
        }(), "Choices (Dropdown) -- val()");
        // test isMandatory()
        assert.ok(($SP().formfields("Choices (Dropdown)").isMandatory() === false), "Choices (Dropdown) -- isMandatory()");
        // test name()
        assert.ok(($SP().formfields("Choices (Dropdown)").name() === "Choices (Dropdown)"), "Choices (Dropdown) -- name()");
        // test description()
        assert.ok(($SP().formfields("Choices (Dropdown)").description() === "Field created for tests with SharepointPlus"), "Choices (Dropdown) -- description()");
        // test elem()
        assert.ok(($SP().formfields("Choices (Dropdown)").elem(false).tagName.toUpperCase() === "SELECT"), "Choices (Dropdown) -- elem()");
        // test type()
        assert.ok(($SP().formfields("Choices (Dropdown)").type() === "choices"), "Choices (Dropdown) -- type()");
        // test .row()
        assert.ok(function() {
          $SP().formfields("Choices (Dropdown)").row().hide();
          return !$SP().formfields("Choices (Dropdown)").row().is(':visible');
        }(), "Choices (Dropdown) -- row()");

        // --- for Choices (Dropdown Fillin)
        // test .val()
        assert.ok(function() {
          var test1, test2;
          $SP().formfields("Choices (Dropdown Fillin)").val("Option 2");
          test1 = $SP().formfields("Choices (Dropdown Fillin)").val() == "Option 2";
          $SP().formfields("Choices (Dropdown Fillin)").val("Option 4");
          test2 = $SP().formfields("Choices (Dropdown Fillin)").val() == "Option 4";
          return test1 && test2;
        }(), "Choices (Dropdown Fillin) -- val()");
        // test isMandatory()
        assert.ok(($SP().formfields("Choices (Dropdown Fillin)").isMandatory() === false), "Choices (Dropdown Fillin) -- isMandatory()");
        // test name()
        assert.ok(($SP().formfields("Choices (Dropdown Fillin)").name() === "Choices (Dropdown Fillin)"), "Choices (Dropdown Fillin) -- name()");
        // test description()
        assert.ok(($SP().formfields("Choices (Dropdown Fillin)").description() === "Field created for tests with SharepointPlus"), "Choices (Dropdown Fillin) -- description()");
        // test elem()
        assert.ok(($SP().formfields("Choices (Dropdown Fillin)").elem(false).length === 4), "Choices (Dropdown Fillin) -- elem()");
        // test type()
        assert.ok(($SP().formfields("Choices (Dropdown Fillin)").type() === "choices plus"), "Choices (Dropdown Fillin) -- type()");
        // test .row()
        assert.ok(function() {
          $SP().formfields("Choices (Dropdown Fillin)").row().hide();
          return !$SP().formfields("Choices (Dropdown Fillin)").row().is(':visible');
        }(), "Choices (Dropdown Fillin) -- row()");

        // --- for Choices (Radio)
        // test .val()
        assert.ok(function() {
          $SP().formfields("Choices (Radio)").val("Option 2");
          return $SP().formfields("Choices (Radio)").val() == "Option 2";
        }(), "Choices (Radio) -- val()");
        // test isMandatory()
        assert.ok(($SP().formfields("Choices (Radio)").isMandatory() === false), "Choices (Radio) -- isMandatory()");
        // test name()
        assert.ok(($SP().formfields("Choices (Radio)").name() === "Choices (Radio)"), "Choices (Radio) -- name()");
        // test description()
        assert.ok(($SP().formfields("Choices (Radio)").description() === "Field created for tests with SharepointPlus"), "Choices (Radio) -- description()");
        // test elem()
        assert.ok(($SP().formfields("Choices (Radio)").elem(false).length === 3), "Choices (Radio) -- elem()");
        // test type()
        assert.ok(($SP().formfields("Choices (Radio)").type() === "choices radio"), "Choices (Radio) -- type()");
        // test .row()
        assert.ok(function() {
          $SP().formfields("Choices (Radio)").row().hide();
          return !$SP().formfields("Choices (Radio)").row().is(':visible');
        }(), "Choices (Radio) -- row()");

        // --- for Choices (Radio Fillin)
        // test .val()
        assert.ok(function() {
          var test1, test2;
          $SP().formfields("Choices (Radio Fillin)").val("Option 2");
          test1 = $SP().formfields("Choices (Radio Fillin)").val() == "Option 2";
          $SP().formfields("Choices (Radio Fillin)").val("Option 4");
          test2 = $SP().formfields("Choices (Radio Fillin)").val() == "Option 4";
          return test1 && test2;
        }(), "Choices (Radio Fillin) -- val()");
        // test isMandatory()
        assert.ok(($SP().formfields("Choices (Radio Fillin)").isMandatory() === false), "Choices (Radio Fillin) -- isMandatory()");
        // test name()
        assert.ok(($SP().formfields("Choices (Radio Fillin)").name() === "Choices (Radio Fillin)"), "Choices (Radio Fillin) -- name()");
        // test description()
        assert.ok(($SP().formfields("Choices (Radio Fillin)").description() === "Field created for tests with SharepointPlus"), "Choices (Radio Fillin) -- description()");
        // test elem()
        assert.ok(($SP().formfields("Choices (Radio Fillin)").elem(false).length === 5), "Choices (Radio Fillin) -- elem()");
        // test type()
        assert.ok(($SP().formfields("Choices (Radio Fillin)").type() === "choices radio plus"), "Choices (Radio Fillin) -- type()");
        // test .row()
        assert.ok(function() {
          $SP().formfields("Choices (Radio Fillin)").row().hide();
          return !$SP().formfields("Choices (Radio Fillin)").row().is(':visible');
        }(), "Choices (Radio Fillin) -- row()");

        // --- for Choices (Checkboxes)
        // test .val()
        assert.ok(function() {
          var test1, test2, values;
          $SP().formfields("Choices (Checkboxes)").val("Option 2");
          test1 = $SP().formfields("Choices (Checkboxes)").val()[0] == "Option 2";
          $SP().formfields("Choices (Checkboxes)").val(["Option 1", "Option 3"]);
          values = $SP().formfields("Choices (Checkboxes)").val();
          test2 = values.length === 2 && values[0] == "Option 1" && values[1] == "Option 3";
          return test1 && test2;
        }(), "Choices (Checkboxes) -- val()");
        // test isMandatory()
        assert.ok(($SP().formfields("Choices (Checkboxes)").isMandatory() === false), "Choices (Checkboxes) -- isMandatory()");
        // test name()
        assert.ok(($SP().formfields("Choices (Checkboxes)").name() === "Choices (Checkboxes)"), "Choices (Checkboxes) -- name()");
        // test description()
        assert.ok(($SP().formfields("Choices (Checkboxes)").description() === "Field created for tests with SharepointPlus"), "Choices (Checkboxes) -- description()");
        // test elem()
        assert.ok(($SP().formfields("Choices (Checkboxes)").elem(false).length === 3), "Choices (Checkboxes) -- elem()");
        // test type()
        assert.ok(($SP().formfields("Choices (Checkboxes)").type() === "choices checkbox"), "Choices (Checkboxes) -- type()");
        // test .row()
        assert.ok(function() {
          $SP().formfields("Choices (Checkboxes)").row().hide();
          return !$SP().formfields("Choices (Checkboxes)").row().is(':visible');
        }(), "Choices (Checkboxes) -- row()");

        // --- for Choices (Checkboxes Fillin)
        // test .val()
        assert.ok(function() {
          var test1, test2, test3, test4, values;
          $SP().formfields("Choices (Checkboxes Fillin)").val("Option 2");
          test1 = $SP().formfields("Choices (Checkboxes Fillin)").val()[0] == "Option 2";
          $SP().formfields("Choices (Checkboxes Fillin)").val(["Option 1", "Option 3"]);
          values = $SP().formfields("Choices (Checkboxes Fillin)").val();
          test2 = values.length === 2 && values[0] == "Option 1" && values[1] == "Option 3";
          $SP().formfields("Choices (Checkboxes Fillin)").val("Option 4");
          test3 = $SP().formfields("Choices (Checkboxes Fillin)").val()[0] == "Option 4";
          $SP().formfields("Choices (Checkboxes Fillin)").val(["Option 2", "Option 5"]);
          values = $SP().formfields("Choices (Checkboxes Fillin)").val();
          test4 = values.length === 2 && values[0] == "Option 2" && values[1] == "Option 5";
          return test1 && test2 && test3 && test4;
        }(), "Choices (Checkboxes Fillin) -- val()");
        // test isMandatory()
        assert.ok(($SP().formfields("Choices (Checkboxes Fillin)").isMandatory() === false), "Choices (Checkboxes Fillin) -- isMandatory()");
        // test name()
        assert.ok(($SP().formfields("Choices (Checkboxes Fillin)").name() === "Choices (Checkboxes Fillin)"), "Choices (Checkboxes Fillin) -- name()");
        // test description()
        assert.ok(($SP().formfields("Choices (Checkboxes Fillin)").description() === "Field created for tests with SharepointPlus"), "Choices (Checkboxes Fillin) -- description()");
        // test elem()
        assert.ok(($SP().formfields("Choices (Checkboxes Fillin)").elem(false).length === 5), "Choices (Checkboxes Fillin) -- elem()");
        // test type()
        assert.ok(($SP().formfields("Choices (Checkboxes Fillin)").type() === "choices checkbox plus"), "Choices (Checkboxes Fillin) -- type()");
        // test .row()
        assert.ok(function() {
          $SP().formfields("Choices (Checkboxes Fillin)").row().hide();
          return !$SP().formfields("Choices (Checkboxes Fillin)").row().is(':visible');
        }(), "Choices (Checkboxes Fillin) -- row()");

        // --- for Currency
        // test .val()
        assert.ok(function() {
          $SP().formfields("Currency").val("10");
          return $SP().formfields("Currency").val() === "10";
        }(), "Currency -- val()");
        // test isMandatory()
        assert.ok(($SP().formfields("Currency").isMandatory() === false), "Currency -- isMandatory()");
        // test name()
        assert.ok(($SP().formfields("Currency").name() === "Currency"), "Currency -- name()");
        // test description()
        assert.ok(($SP().formfields("Currency").description() === "Field created for tests with SharepointPlus"), "Currency -- description()");
        // test elem()
        assert.ok(($SP().formfields("Currency").elem(false).tagName.toUpperCase() === "INPUT"), "Currency -- elem()");
        // test type()
        assert.ok(($SP().formfields("Currency").type() === "currency"), "Currency -- type()");
        // test .row()
        assert.ok(function() {
          $SP().formfields("Currency").row().hide();
          return !$SP().formfields("Currency").row().is(':visible');
        }(), "Currency -- row()");

        // --- for Number
        // test .val()
        assert.ok(function() {
          $SP().formfields("Number").val("10");
          return $SP().formfields("Number").val() === "10";
        }(), "Number -- val()");
        // test isMandatory()
        assert.ok(($SP().formfields("Number").isMandatory() === false), "Number -- isMandatory()");
        // test name()
        assert.ok(($SP().formfields("Number").name() === "Number"), "Number -- name()");
        // test description()
        assert.ok(($SP().formfields("Number").description() === "Field created for tests with SharepointPlus"), "Number -- description()");
        // test elem()
        assert.ok(($SP().formfields("Number").elem(false).tagName.toUpperCase() === "INPUT"), "Number -- elem()");
        // test type()
        assert.ok(($SP().formfields("Number").type() === "number"), "Number -- type()");
        // test .row()
        assert.ok(function() {
          $SP().formfields("Number").row().hide();
          return !$SP().formfields("Number").row().is(':visible');
        }(), "Number -- row()");

        // --- for Number (Percentage)
        // test .val()
        assert.ok(function() {
          $SP().formfields("Number (Percentage)").val("10");
          return $SP().formfields("Number (Percentage)").val() === "10";
        }(), "Number (Percentage) -- val()");
        // test isMandatory()
        assert.ok(($SP().formfields("Number (Percentage)").isMandatory() === false), "Number (Percentage) -- isMandatory()");
        // test name()
        assert.ok(($SP().formfields("Number (Percentage)").name() === "Number (Percentage)"), "Number (Percentage) -- name()");
        // test description()
        assert.ok(($SP().formfields("Number (Percentage)").description() === "Field created for tests with SharepointPlus"), "Number (Percentage) -- description()");
        // test elem()
        assert.ok(($SP().formfields("Number (Percentage)").elem(false).tagName.toUpperCase() === "INPUT"), "Number (Percentage) -- elem()");
        // test type()
        assert.ok(($SP().formfields("Number (Percentage)").type() === "number"), "Number (Percentage) -- type()");
        // test .row()
        assert.ok(function() {
          $SP().formfields("Number (Percentage)").row().hide();
          return !$SP().formfields("Number (Percentage)").row().is(':visible');
        }(), "Number (Percentage) -- row()");

        // --- for Date Only
        // test .val()
        assert.ok(function() {
          $SP().formfields("Date Only").val("1/1/2015");
          return $SP().formfields("Date Only").val() === "1/1/2015";
        }(), "Date Only -- val()");
        // test isMandatory()
        assert.ok(($SP().formfields("Date Only").isMandatory() === false), "Date Only -- isMandatory()");
        // test name()
        assert.ok(($SP().formfields("Date Only").name() === "Date Only"), "Date Only -- name()");
        // test description()
        assert.ok(($SP().formfields("Date Only").description() === "Field created for tests with SharepointPlus"), "Date Only -- description()");
        // test elem()
        assert.ok(($SP().formfields("Date Only").elem(false).length === 2), "Date Only -- elem()");
        // test type()
        assert.ok(($SP().formfields("Date Only").type() === "date"), "Date Only -- type()");
        // test .row()
        assert.ok(function() {
          $SP().formfields("Date Only").row().hide();
          return !$SP().formfields("Date Only").row().is(':visible');
        }(), "Date Only -- row()");

        // --- for Date and Time
        // test .val()
        assert.ok(function() {
          $SP().formfields("Date and Time").val(["1/1/2015", "1 PM", "15"]);
          var a = $SP().formfields("Date and Time").val();
          return SPIsArray(a) && a.length===3 && a[0] === "1/1/2015" && a[2] == "15";
        }(), "Date and Time -- val()");
        // test isMandatory()
        assert.ok(($SP().formfields("Date and Time").isMandatory() === false), "Date and Time -- isMandatory()");
        // test name()
        assert.ok(($SP().formfields("Date and Time").name() === "Date and Time"), "Date and Time -- name()");
        // test description()
        assert.ok(($SP().formfields("Date and Time").description() === "Field created for tests with SharepointPlus"), "Date and Time -- description()");
        // test elem()
        assert.ok(($SP().formfields("Date and Time").elem(false).length === 4), "Date and Time -- elem()");
        // test type()
        assert.ok(($SP().formfields("Date and Time").type() === "date time"), "Date and Time -- type()");
        // test .row()
        assert.ok(function() {
          $SP().formfields("Date and Time").row().hide();
          return !$SP().formfields("Date and Time").row().is(':visible');
        }(), "Date and Time -- row()");

        // --- for Lookup
        // test .val()
        assert.ok(function() {
          $SP().formfields("Lookup").val("Option 2");
          return $SP().formfields("Lookup").val() == "Option 2";
        }(), "Lookup -- val()");
        // test isMandatory()
        assert.ok(($SP().formfields("Lookup").isMandatory() === false), "Lookup -- isMandatory()");
        // test name()
        assert.ok(($SP().formfields("Lookup").name() === "Lookup"), "Lookup -- name()");
        // test description()
        assert.ok(($SP().formfields("Lookup").description() === "Field created for tests with SharepointPlus"), "Lookup -- description()");
        // test elem()
        assert.ok(($SP().formfields("Lookup").elem(false).tagName.toUpperCase() === "SELECT"), "Lookup -- elem()");
        // test type()
        assert.ok(($SP().formfields("Lookup").type() === "lookup"), "Lookup -- type()");
        // test .row()
        assert.ok(function() {
          $SP().formfields("Lookup").row().hide();
          return !$SP().formfields("Lookup").row().is(':visible');
        }(), "Lookup -- row()");

        // --- for Lookup (Multiple)
        // test .val()
        assert.ok(function() {
          var arr, test1, test1bis, test2;
          // SP2010 adds the ID numbers in options
          $SP().formfields("Lookup (Multiple)").val("Option 2");
          test1 = ($SP().formfields("Lookup (Multiple)").val()[0] == "Option 2");
          $SP().formfields("Lookup (Multiple)").val("2 - Option 2");
          test1bis = ($SP().formfields("Lookup (Multiple)").val()[0] == "2 - Option 2");
          $SP().formfields("Lookup (Multiple)").val(["Option 3", "3 - Option 3", "Option 1", "1 - Option 1"]);
          arr = $SP().formfields("Lookup (Multiple)").val();
          test2 = SPIsArray(arr) && arr.length===2 && (arr[0] == "Option 3" || arr[0] == "3 - Option 3") && (arr[1] == "Option 1" || arr[1] == "1 - Option 1");
          return (test1 || test1bis) && test2;
        }(), "Lookup (Multiple) -- val()");
        // test isMandatory()
        assert.ok(($SP().formfields("Lookup (Multiple)").isMandatory() === false), "Lookup (Multiple) -- isMandatory()");
        // test name()
        assert.ok(($SP().formfields("Lookup (Multiple)").name() === "Lookup (Multiple)"), "Lookup (Multiple) -- name()");
        // test description()
        assert.ok(($SP().formfields("Lookup (Multiple)").description() === "Field created for tests with SharepointPlus"), "Lookup (Multiple) -- description()");
        // test elem()
        assert.ok(($SP().formfields("Lookup (Multiple)").elem(false).length === 4), "Lookup (Multiple) -- elem()");
        // test type()
        assert.ok(($SP().formfields("Lookup (Multiple)").type() === "lookup multiple"), "Lookup (Multiple) -- type()");
        // test .row()
        assert.ok(function() {
          $SP().formfields("Lookup (Multiple)").row().hide();
          return !$SP().formfields("Lookup (Multiple)").row().is(':visible');
        }(), "Lookup (Multiple) -- row()");

        // --- for Yes No
        // test .val()
        assert.ok(function() {
          var test1, test2;
          test1 = !$SP().formfields("Yes No").val();
          $SP().formfields("Yes No").val(true);
          test2 = $SP().formfields("Yes No").val();
          return test1 && test2;
        }(), "Yes No -- val()");
        // test isMandatory()
        assert.ok(($SP().formfields("Yes No").isMandatory() === false), "Yes No -- isMandatory()");
        // test name()
        assert.ok(($SP().formfields("Yes No").name() === "Yes No"), "Yes No -- name()");
        // test description()
        assert.ok(($SP().formfields("Yes No").description() === "Field created for tests with SharepointPlus"), "Yes No -- description()");
        // test elem()
        assert.ok(($SP().formfields("Yes No").elem(false).tagName.toUpperCase() === "INPUT"), "Yes No -- elem()");
        // test type()
        assert.ok(($SP().formfields("Yes No").type() === "boolean"), "Yes No -- type()");
        // test .row()
        assert.ok(function() {
          $SP().formfields("Yes No").row().hide();
          return !$SP().formfields("Yes No").row().is(':visible');
        }(), "Yes No -- row()");

        // --- for Hyperlink
        // test .val()
        assert.ok(function() {
          var res, test1, test2;
          $SP().formfields("Hyperlink").val(["SharepointPlus", "https://github.com/Aymkdn/SharepointPlus"]);
          res = $SP().formfields("Hyperlink").val();
          test1 = (SPIsArray(res) && res.length === 2 && res[0] === "SharepointPlus" && res[1] === "https://github.com/Aymkdn/SharepointPlus");
          $SP().formfields("Hyperlink").val("https://github.com/Aymkdn/SharepointPlus");
          res = $SP().formfields("Hyperlink").val();
          test2 = (SPIsArray(res) && res.length === 2 && res[0] === "https://github.com/Aymkdn/SharepointPlus" && res[1] === "https://github.com/Aymkdn/SharepointPlus");
          return test1 && test2;
        }(), "Hyperlink -- val()");
        // test isMandatory()
        assert.ok(($SP().formfields("Hyperlink").isMandatory() === false), "Hyperlink -- isMandatory()");
        // test name()
        assert.ok(($SP().formfields("Hyperlink").name() === "Hyperlink"), "Hyperlink -- name()");
        // test description()
        assert.ok(($SP().formfields("Hyperlink").description() === "Field created for tests with SharepointPlus"), "Hyperlink -- description()");
        // test elem()
        assert.ok(($SP().formfields("Hyperlink").elem(false).length === 4), "Hyperlink -- elem()");
        // test type()
        assert.ok(($SP().formfields("Hyperlink").type() === "url"), "Hyperlink -- type()");
        // test .row()
        assert.ok(function() {
          $SP().formfields("Hyperlink").row().hide();
          return !$SP().formfields("Hyperlink").row().is(':visible');
        }(), "Hyperlink -- row()");

      });

      test('list related stuff', function(assert) {
        assert.expect(9);

        var doneLists = assert.async();
        var doneViews = assert.async();
        var doneView = assert.async();
        var doneAdd = assert.async();
        var doneGet = assert.async();
        var doneGetWithJoin = assert.async();
        var doneUpdate = assert.async();
        var doneRemove = assert.async();

        assert.ok(($SP().parse('ContentType = "My Content Type" OR Description <> null AND Fiscal_x0020_Week >= 43 AND Result_x0020_Date < "2012-02-03"') === '<And><And><Or><Eq><FieldRef Name="ContentType" /><Value Type="Text">My Content Type</Value></Eq><IsNotNull><FieldRef Name="Description" /></IsNotNull></Or><Geq><FieldRef Name="Fiscal_x0020_Week" /><Value Type="Number">43</Value></Geq></And><Lt><FieldRef Name="Result_x0020_Date" /><Value Type="DateTime">2012-02-03</Value></Lt></And>'), 'parse()');

        // test lists()
        $SP().lists(function(lists) {
          var passed=false;
          for (var i=lists.length; i--;) {
            if (lists[i]['Name'] === "SharepointPlus") {
              passed=true;
              break
            }
          }
          assert.ok(passed, 'lists()');
          doneLists();
        });

        // test views()
        $SP().list("SharepointPlus").views(function(views) {
          var passed=false, _viewID="";
          for (var i=views.length; i--;) {
            if (views[i]["Name"] === "All Items") {
              passed=true;
              _viewID=views[i]["ID"];
              break;
            }
          }
          assert.ok(passed, 'views()');
          doneViews();
          if (passed) {
            // test view()
            $SP().list("SharepointPlus").view("All Items", function(data,viewID) {
              assert.ok((viewID === _viewID), 'view()');
              doneView();
            });
          } else {
            assert.ok(false, 'view()');
            doneView();
          }
        });

        // test .list().add()
        var title = new Date().getTime();
        $SP().list("SharepointPlus").add({'Title':'Add','Single_x0020_line_x0020_of_x0020':title,'Lookup':'2;#Option 2'}, {
          error:function() {
            assert.ok(false, ".add()");
            doneAdd();
            assert.ok(false, ".get()");
            doneGet();
            assert.ok(false, ".update()");
            doneUpdate();
            assert.ok(false, ".get() with join");
            doneGetJoin();
            assert.ok(false, ".remove()");
            doneRemove();

          },
          success:function() {
            assert.ok(true, ".add()");
            doneAdd();

            // test .list().get()
            $SP().list("SharepointPlus").get({fields:"ID,Title,Single_x0020_line_x0020_of_x0020",where:'Single_x0020_line_x0020_of_x0020 = "'+title+'"'}, function(data) {
              if (data.length === 1) {
                assert.ok(true, ".get()");
                doneGet();

                var itemID = data[0].getAttribute("ID");
                // test .list().update()
                $SP().list("SharepointPlus").update({'ID':itemID,'Title':'testUpdate'}, {
                  error:function() {
                    assert.ok(false, ".update()");
                    doneUpdate();
                    assert.ok(false, ".get() with join");
                    doneGetWithJoin();
                    assert.ok(false, ".remove()");
                    doneRemove();
                  },
                  success:function() {
                    assert.ok(true, ".update()");
                    doneUpdate();

                    // test .list().get() with 'join'
                    $SP().list("SharepointPlus").get({
                      fields:"ID,Lookup",
                      where:"ID = "+itemID,
                      outerjoin:{
                        list:"SharepointPlusLookup",
                        fields:"ID",
                        on:"'SharepointPlusLookup'.ID = 'SharepointPlus'.Lookup"
                      },
                    }, function(data) {
                      assert.ok(data.length>0 && data[0].getAttribute("SharepointPlus.Lookup").split(";#")[0]==data[0].getAttribute("SharepointPlusLookup.ID"), ".get() with join");
                      doneGetWithJoin();

                      // test .list().remove()
                      $SP().list("SharepointPlus").remove({'ID':itemID}, {
                        after:function(passed,failed) {
                          assert.ok(passed.length>0, ".remove()");
                          doneRemove();
                        }
                      });
                    })
                  }
                });
              } else {
                assert.ok(false, ".get()");
                doneGet();
                assert.ok(false, ".update()");
                doneUpdate();
                assert.ok(false, ".get() with join");
                doneGetWithJoin();
                assert.ok(false, ".remove()");
                doneRemove();
              }
            });
          }
        });
      });

      test('document/file related stuff', function(assert) {
        assert.expect(4);

        var doneCreateFileSuccess = assert.async();
        var doneCreateFileError = assert.async();
        var doneCheckOut = assert.async();
        var doneCheckIn = assert.async();

        // test createFile()
        var filename = new Date().getTime() + ".txt";
        var library = "SharepointPlusLibrary";
        var path = library + "/" + filename;
        $SP().createFile({
          content:'Hello World',
          filename:filename,
          library:library,
          success:function(fileURL) {
            assert.ok(fileURL.split("/").slice(-2).join("/")===path, 'createFile() Phase 1');
            // check out the file
            $SP().webService({
              service:"Lists",
              operation:"CheckOutFile",
              properties:{
                "pageUrl":fileURL,
                checkoutToLocal: "false"
              }
            }).then(function() {
              // verify
              $SP().list("SharepointPlusLibrary").get({
                fields:"ID,CheckoutUser",
                where:'FileRef = "'+fileURL+'"'
              }, function(data) {
                var res = (data.length === 1 && data[0].getAttribute("CheckoutUser") !== null);
                assert.ok(res, "webService() with 'checkout'");
                doneCheckOut();
                // checkin
                if (res) {
                  $SP().checkin({
                    destination:fileURL,
                    comments:"Automatic check in with SharepointPlus",
                    after:function() {
                      // verify
                      $SP().list("SharepointPlusLibrary").get({
                        fields:"ID,CheckoutUser",
                        where:'FileRef = "'+fileURL+'"'
                      }, function(data) {
                        var res = (data.length === 1 && data[0].getAttribute("CheckoutUser") === null);
                        assert.ok(res, "checkin()");
                        doneCheckIn();
                      })
                    }
                  })
                } else {
                  doneCheckIn()
                }
              })
            })
          },
          after:function() {
            doneCreateFileSuccess();
          }
        });

        $SP().createFile({
          content:'Hello World',
          filename:filename,
          library:"fakelibrary",
          error:function(fileURL, error) {
            fileURL = fileURL.split("/").slice(-2).join("/");
            assert.ok(fileURL==="fakelibrary/"+filename, 'createFile() Phase 2');
          },
          after:function() {
            doneCreateFileError();
          }
        });
      });

      test('people and group stuff', function(assert) {
        assert.expect(5);

        var doneWhoami = assert.async();
        var doneIsMember = assert.async();
        var doneGroupMembers = assert.async();
        var doneAddressbook = assert.async();
        var doneGetUserInfo = assert.async();

        $SP().whoami(function(people) {
          if (people["AccountName"]) {
            var username = people["AccountName"].toLowerCase();
            var spusername = (spversion >= 15 ? "i:0#.w|" : "") + username;
            var lastname = people["LastName"];
            assert.ok(true, 'whoami()');
            doneWhoami();

            // test isMember()
            $SP().isMember({user:spusername, group:"SharepointPlus"}, function(isMember) {
              assert.ok(isMember, 'isMember()');
              doneIsMember();
            });

            // test groupMembers
            $SP().groupMembers("SharepointPlus", function(members) {
              var passed=false;
              for (var i=members.length; i--;) {
                if (members[i]["LoginName"].toLowerCase() === spusername) {
                  passed=true;
                  break;
                }
              }
              assert.ok(passed, 'groupMembers()');
              doneGroupMembers();
            });

            // test addressbook
            $SP().addressbook(lastname, {limit:100}, function(people) {
              var passed=false;
              for (var i=0; i < people.length; i++) {
                for (var j=0; j < people[i].length; j++) {
                  if (people[i]["AccountName"].toLowerCase() === username) {
                    passed=true;
                    break;
                  }
                }
              }
              assert.ok(passed, 'addressbook()');
              doneAddressbook();
            });

            // test getUserInfo
            $SP().getUserInfo(spusername, function(info) {
              assert.ok((typeof info !== "string" && info.LoginName.toLowerCase() === spusername), 'getUserInfo()');
              doneGetUserInfo();
            });
          } else {
            assert.ok(false, 'whoami()');
            doneWhoami();
            assert.ok(false, 'isMember()');
            doneIsMember();
            assert.ok(false, 'groupMembers()');
            doneGroupMembers();
            assert.ok(false, 'addressbook()');
            doneAddressbook();
            assert.ok(false, 'getUserInfo()');
            doneGetUserInfo();
          }
        });
      });

      test('other stuff', function(assert) {
        assert.ok(($SP().toCurrency(1500000) === '$1,500,000'), 'toCurrency()');
        assert.ok(($SP().toDate("2012-10-31T00:00:00").getFullYear() === 2012), 'toDate()');
        assert.ok(($SP().toSPDate(new Date(2012,9,31), true) === "2012-10-31 00:00:00"), 'toSPDate()');
        assert.ok(($SP().toXSLString("Big Title") === "Big_x0020_Title"), 'toXSLString()');
        assert.ok(($SP().workflowStatusToText(2) === "In Progress"), 'workflowStatusToText()');
      })

      QUnit.start();
      $q('#testEnv').text("");
      QUnit.done(function() {
        $q('#testEnv').html('<button onclick="deleteTestEnvironment()">Delete the test environment</button>');
      });
    })
  })
}
