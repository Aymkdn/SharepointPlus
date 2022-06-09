// old a previous version to set up the test environment
const $SP = require('../../sharepointplus-online/dist');
// we load $SP for testing
const _$SP = require("esm")(module)("../src/index.js").default;
const commandLineArgs = require('command-line-args');
const fs = require('fs');
const path = require('path');
const req = require('request-promise');
var prompt = require('prompt');
;(async () => {
  // the cli options
  const optionDefinitions = [
    { name: 'credentials', type: String }, // path to a JSON file with {username, password, domain}
    { name: 'url', type: String }, // full URL to the Sharepoint website that will be used for the tests
    { name: 'proxy', type: String } // if a proxy is required; e.g. "http://domain%5Cusername:password@proxy:80"
  ]
  const optionsCLI = commandLineArgs(optionDefinitions);
  prompt.override = optionsCLI;

  const promptSchema = {
    properties: {
      run: {
        description:"Do you want to run the tests within your Sharepoint 2013+ with Content Editor webpart support? (Y/n)",
        default:'Y',
        required:true
      },
      url: {
        description: "Sharepoint URL where the tests will be ran (rootdir of a website)?",
        required:true,
        ask: function() {
          return prompt.history('run').value.toUpperCase() === 'Y'
        }
      },
      credentials:{
        description: "Please, enter a local path to a .json file that contains your credentials ({username, password, domain})",
        required:true,
        ask: function() {
          return prompt.history('run').value.toUpperCase() === 'Y'
        }
      },
      proxy:{
        description: "If a proxy is required, please enter the proxy string (e.g. http://domain%5Cusername:password@proxy:80)",
        ask: function() {
          return prompt.history('run').value.toUpperCase() === 'Y'
        }
      }
    }
  }

  // check parameters
  prompt.start();
  await new Promise(function(prom_res, prom_rej) {
    prompt.get(promptSchema, function(err, result) {
      if (err) prom_rej(err);
      else {
        if (result.run.toUpperCase() !== 'Y') {
          prom_rej("No Tests will be done.");
        }
        optionsCLI.url = result.url;
        optionsCLI.credentials = result.credentials;
        optionsCLI.proxy = result.proxy;

        prom_res();
      }
    })
  });

  // remove last '/' in the url
  optionsCLI.url = optionsCLI.url.replace(/\/+$/,"");

  const credentials = require(optionsCLI.credentials);
  const sp = $SP().auth(credentials);
  const _sp = _$SP().auth(credentials);
  if (optionsCLI.proxy) {
    sp.proxy(optionsCLI.proxy);
    _sp.proxy(optionsCLI.proxy);
  }

  // create the test lists
  function createList(list) {
    list = list || "SharepointPlus";

    console.log("Test Environment Setup: creating list '"+list+"'...");

    let templateID = "100";
    if (list.indexOf("Library") > -1) templateID = "101";
    if (list.indexOf("Calendar") > -1) templateID = "106";

    return sp.ajax({
      url:optionsCLI.url+"/_api/web/lists/",
      method:"POST",
      headers:{
        'Content-Type': 'application/json;odata=verbose;'
      },
      body:JSON.stringify({
        '__metadata': { 'type': 'SP.List' },
        'BaseTemplate': templateID,
        'Title': list
      })
    })
    .then(async res => {
      // to serialize to a string the result
      // var xmlserializer = require('xmlserializer');
      // console.log(xmlserializer.serializeToString(res.documentElement))
      // for "SharepointPlus" list we want to create the columns too
      if (list === "SharepointPlus") {
        // get the list ID
        let listID = res.Id;

        console.log("Test Environment Setup: creating columns in 'SharepointPlus' list...");

        let fields = [];
        fields.push({"DisplayName":"Single line of text", "Type":"Text", "Required":"TRUE"});
        fields.push({"DisplayName":"Person or Group", "Type":"User"});
        fields.push({"DisplayName":"Person or Group (Multiple)", "Type":"UserMulti", "Mult":"TRUE"});
        fields.push({"DisplayName":"Multiple lines of text (Plain)", "Type":"Note", "RichText":"FALSE", "AppendOnly":"TRUE"});
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
        fields.push({"DisplayName":"Lookup", "Type":"Lookup", "ShowField":"Title", "List":listID, "PrependId":"TRUE" });
        fields.push({"DisplayName":"Lookup (Multiple)", "Type":"LookupMulti", "ShowField":"Title", "List":listID, "PrependId":"TRUE", "Mult":"TRUE" });
        fields.push({"DisplayName":"Yes No", "Type":"Boolean", "_Default":"0" });
        fields.push({"DisplayName":"Hyperlink", "Type":"URL", "Format":"Hyperlink" });
        //fields.push({"DisplayName":"Picture", "Type":"URL", "Format":"Image" });

        /*let fieldsToAdd = '<Fields>', field, i, j, attr, options, opt;
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
                if (Array.isArray(field)) {
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
        fieldsToAdd += '</Fields>';*/

        // add the columns – https://www.codesharepoint.com/rest-api/create-list-column-in-sharepoint-using-rest-api
        let getSchema = function(field) {
          let ret = `<Field`;
          for (let key in field) {
            ret += ` ${key}="${field[key]}"`;
          }
          return ret + ' />';
        }

        for (let col of fields) {
          let props = {
            '__metadata':{'type': 'SP.Field'},
            'FieldTypeKind': 0,
            'Title':col.DisplayName
          }
          switch(col.Type) {
            case "Text": props.FieldTypeKind=2; props.SchemaXml=getSchema(col); break;
            case "User":
            case "UserMulti": props.FieldTypeKind=20; props.SchemaXml=getSchema(col); break;
            case "Note": props.FieldTypeKind=3; props.SchemaXml=getSchema(col); break;
            case "Choice":
            case "MultiChoice": props.FieldTypeKind=6; props.SchemaXml=getSchema(col); break;
            case "Number": props.FieldTypeKind=9; props.SchemaXml=getSchema(col); break;
            case "Currency": props.FieldTypeKind=10; props.SchemaXml=getSchema(col); break;
            case "DateTime": props.FieldTypeKind=4; props.SchemaXml=getSchema(col); break;
            case "Lookup":
            case "LookupMulti": {
              props.FieldTypeKind=7;
              props.SchemaXml=getSchema(col);
              props.__metadata.type="SP.FieldCreationInformation";
              props.LookupFieldName=col.ShowField;
              props.LookupListId=col.List;
              break;
            }
            case "Boolean": props.FieldTypeKind=8; props.SchemaXml=getSchema(col); break;
            case "URL": props.FieldTypeKind=11; props.SchemaXml=getSchema(col); break;
          }
          await sp.ajax({
            url:optionsCLI.url+"/_api/web/lists/getByTitle('"+list+"')/fields/createfieldasxml",
            method:"POST",
            headers:{
              'Content-Type': 'application/json;odata=verbose;'
            },
            body:JSON.stringify({
              "parameters":{
                "__metadata": { "type": "SP.XmlSchemaFieldCreationInformation" },
                "SchemaXml": getSchema(col)
              }
            })
          })
        }
      } else if (list === "SharepointPlusLookup") {
        // add some items in SharepointPlusLookup
        console.log("Test Environment Setup: adding items in 'SharepointPlusLookup'...");
        return sp.list(list, optionsCLI.url).add([ {Title:'Option 1'}, {Title:'Option 2'}, {Title:'Option 3'} ]);
      }
    })
  }

  async function testEnvironment() {
    console.log("Test Environment Checking...");
    try {
      // check if the test lists already exist, otherwise create them
      let lists = await sp.lists({url:optionsCLI.url});
      let listNames = lists.map(list => list.Title);
      for (let list of ["SharepointPlusLookup", "SharepointPlus", "SharepointPlusLibrary", "SharepointPlus Calendar"]) {
        if (!listNames.includes(list)) {
          await createList(list);
        } else {
          // for SharepointPlusLibrary we want to delete it first, if we have data
          if (list === "SharepointPlusLibrary") {
            await sp.ajax({
              url: optionsCLI.url + "/_api/web/lists/GetByTitle('"+list+"')",
              method:"POST",
              headers:{
                "X-HTTP-Method": "DELETE",
                "IF-MATCH": "*"
              }
            });
            await createList(list);
          }
        }
      }

      // check if the permissions group "SharepointPlus" exists
      console.log("Test Environment Setup: checking user group 'SharepointPlus'...");
      try {
        await sp.ajax({
          url:optionsCLI.url+"/_api/web/sitegroups",
          method:"POST",
          headers:{
            'Content-Type': 'application/json;odata=verbose;'
          },
          body:JSON.stringify({
            '__metadata':{'type': 'SP.Group'},
            'Title': "SharepointPlus",
            'Description': "Group for SharepointPlus tests"
          })
        });
      } catch(err) {}

      console.log("### PLEASE ADD YOURSELF IN THE 'SharepointPlus' group ###");

      console.log("Test Environment Setup: configuring 'Tests.aspx' in 'Site Pages'...");
      // we delete it and readd it with the last version of the library
      await sp.list("Site Pages", optionsCLI.url).remove({where:"FileLeafRef = 'Tests.aspx' OR FileLeafRef LIKE 'sharepointplus.' OR FileLeafRef LIKE 'sptests.'"});

      await sp.list("Site Pages", optionsCLI.url).createFile({
        filename:'Tests.aspx',
        content:`<%@ Page language="C#" MasterPageFile="~masterurl/default.master"    Inherits="Microsoft.SharePoint.WebPartPages.WebPartPage,Microsoft.SharePoint,Version=16.0.0.0,Culture=neutral,PublicKeyToken=71e9bce111e9429c"  %> <%@ Register Tagprefix="SharePoint" Namespace="Microsoft.SharePoint.WebControls" Assembly="Microsoft.SharePoint, Version=16.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %> <%@ Register Tagprefix="Utilities" Namespace="Microsoft.SharePoint.Utilities" Assembly="Microsoft.SharePoint, Version=16.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %> <%@ Import Namespace="Microsoft.SharePoint" %> <%@ Assembly Name="Microsoft.Web.CommandUI, Version=16.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %> <%@ Register Tagprefix="WebPartPages" Namespace="Microsoft.SharePoint.WebPartPages" Assembly="Microsoft.SharePoint, Version=16.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
                <asp:Content ContentPlaceHolderId="PlaceHolderAdditionalPageHead" runat="server">
                  <link rel="stylesheet" href="/sites/Educate/Style%20Library/Standard/MasterPage.min.css" />
                  <script src="/sites/Educate/Style%20Library/Standard/MasterPage.min.js" type="text/javascript"></script>
                </asp:Content>
                <asp:Content ContentPlaceHolderId="PlaceHolderPageTitle" runat="server">
                  SharepointPlus Tests Page
                </asp:Content>
                <asp:Content ContentPlaceHolderID="PlaceHolderLeftNavBar" runat="Server"></asp:Content>
                <asp:Content ContentPlaceHolderId="PlaceHolderMain" runat="server">
                   <WebPartPages:WebPartZone runat="server" id="WebPart" />
                </asp:Content>`
      });

      // create a sharepointplus.js file
      let spContent = fs.readFileSync(path.resolve('../browser/sharepointplus.js'));
      let spFileName = 'sharepointplus.'+Date.now()+'.js';
      await sp.list("Site Pages", optionsCLI.url).createFile({
        filename:spFileName,
        content:spContent
      });

      // create the test file
      let spTestContent = fs.readFileSync(path.resolve('./tests.js'));
      let spTestFile = 'sptests.'+Date.now()+'.js';
      await sp.list("Site Pages", optionsCLI.url).createFile({
        filename:spTestFile,
        content:spTestContent
      });

      // get mocha et chai from CDN
      let dependencies = await sp.list("Site Pages", optionsCLI.url).get({fields:"BaseName", where:"FileLeafRef = 'mocha.js' OR FileLeafRef = 'mocha.css' OR FileLeafRef = 'chai.js'"});
      if (dependencies.length !== 3) {
        console.log("Test Environment Setup: Downloading Mocha/Chai Files...");
        let mocha = await req('https://cdn.jsdelivr.net/npm/mocha/mocha.js');
        await sp.list("Site Pages", optionsCLI.url).createFile({
          filename:'mocha.js',
          content:mocha
        });
        let mochaCSS = await req('https://cdn.jsdelivr.net/npm/mocha/mocha.css');
        await sp.list("Site Pages", optionsCLI.url).createFile({
          filename:'mocha.css',
          content:mochaCSS
        });
        let chai = await req('https://cdn.jsdelivr.net/npm/chai/chai.js');
        await sp.list("Site Pages", optionsCLI.url).createFile({
          filename:'chai.js',
          content:chai
        });
      }

      // we now add a webpart
      // not available in SPO
      console.log("### PLEASE ADD A CONTENT EDITOR WEBPART ON "+optionsCLI.url+"/SitePages/Tests.aspx ###");
      console.log("Content to add:");
      console.log(`<style>#mocha > #mocha-stats { position:relative; top:auto; right:auto } #mocha > #mocha-stats .progress { float:none }</style>
          <h1 id="result" style="color: green;"></h1>
          <div id="mocha" style="margin: 0px;"></div>
          <link rel="stylesheet" href="mocha.css"/><script src="mocha.js"></script>
          <script src="chai.js"></script><script src="${spFileName}"></script>
          <script src="${spTestFile}"></script>`);
      /*await _sp.ajax({
        url:optionsCLI.url+"/_api/web/getfilebyserverrelativeurl('/"+optionsCLI.url.split('/').slice(3).join("/")+"/SitePages/Tests.aspx')/getlimitedwebpartmanager(1)/ImportWebPart",
        method:"POST",
        body:JSON.stringify({
          webPartXml:`<?xml version="1.0" encoding="utf-8"?>
          <WebPart xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://schemas.microsoft.com/WebPart/v2">
            <Title>Content Editor</Title>
            <FrameType>Default</FrameType>
            <Description>Allows authors to enter rich text content.</Description>
            <IsIncluded>true</IsIncluded>
            <ZoneID>WebPart</ZoneID>
            <PartOrder>0</PartOrder>
            <FrameState>Normal</FrameState>
            <Height />
            <Width />
            <AllowRemove>true</AllowRemove>
            <AllowZoneChange>true</AllowZoneChange>
            <AllowMinimize>true</AllowMinimize>
            <AllowConnect>true</AllowConnect>
            <AllowEdit>true</AllowEdit>
            <AllowHide>true</AllowHide>
            <IsVisible>true</IsVisible>
            <DetailLink />
            <HelpLink />
            <HelpMode>Modeless</HelpMode>
            <Dir>Default</Dir>
            <PartImageSmall />
            <MissingAssembly>Cannot import this Web Part.</MissingAssembly>
            <PartImageLarge>/_layouts/15/images/mscontl.gif</PartImageLarge>
            <IsIncludedFilter />
            <Assembly>Microsoft.SharePoint, Version=16.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c</Assembly>
            <TypeName>Microsoft.SharePoint.WebPartPages.ContentEditorWebPart</TypeName>
            <ContentLink xmlns="http://schemas.microsoft.com/WebPart/v2/ContentEditor" />
            <Content xmlns="http://schemas.microsoft.com/WebPart/v2/ContentEditor"><![CDATA[
          <style>#mocha > #mocha-stats { position:relative; top:auto; right:auto } #mocha > #mocha-stats .progress { float:none }</style>
          <h1 id="result" style="color: green;"></h1>
          <div id="mocha" style="margin: 0px;"></div>
          <link rel="stylesheet" href="mocha.css"/><script src="mocha.js"></script>
          <script src="chai.js"></script><script src="${spFileName}"></script>
          <script src="${spTestFile}"></script>]]></Content>
            <PartStorage xmlns="http://schemas.microsoft.com/WebPart/v2/ContentEditor" />
          </WebPart>`
        })
      })*/

      console.log("Test Environment Setup: Completed!");
    } catch(err) {
      console.log("[ERROR] ",err)
    }
  }

  try {
    await testEnvironment();
    // do a quick test with Node
    let data = await _sp.list("Site Pages", optionsCLI.url).get({
      where:"BaseName = 'Tests.aspx' OR BaseName LIKE 'sharepointplus.' OR BaseName LIKE 'sptests.'"
    })
    if (data.length === 3) console.log("SharepointPlus Node Test: Success :-)");
    else console.log("SharepointPlus Node Test: Failed :-(");

    process.stderr.write("\x07"); // beep
    console.log("Open this URL to run the tests: \x1b[36m"+optionsCLI.url+"/SitePages/Tests.aspx\x1b[0m");
  } catch(e) {}
})();
