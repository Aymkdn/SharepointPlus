test('formfields()', function(assert) {
  // test .val()
  assert.ok(function() {
    $SP().formfields("Title").val("test");
    return $SP().formfields("Title").val() === "test";
  }(), ".val()");

  // test isMandatory()
  assert.ok($SP().formfields("Title").isMandatory(), "isMandatory()");
  
  // test name()
  assert.ok(($SP().formfields("Title").name() === "Title"), "name()");
  
  // test elem()
  assert.ok(($SP().formfields("Title").elem()[0].tagName.toUpperCase() === "INPUT"), "elem()");

  // test type()
  assert.ok(($SP().formfields("Title").type() === "text"), "type()");
  
  // test .row()
  assert.ok(function() {
    $SP().formfields("Title").row().hide();
    return !$SP().formfields("Title").row().is(':visible');
  }(), ".row()");
});

test('list related stuff', function(assert) {
  assert.expect(8);

  var doneLists = assert.async();
  var doneViews = assert.async();
  var doneView = assert.async();
  var doneAdd = assert.async();
  var doneGet = assert.async();
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
  $SP().list("SharepointPlus").add({'Title':title}, {
    error:function() {
      assert.ok(false, ".add()");
      doneAdd();
      assert.ok(false, ".get()");
      doneGet();
      assert.ok(false, ".update()");
      doneUpdate();
      assert.ok(false, ".remove()");
      doneRemove();

    },
    success:function() {
      assert.ok(true, ".add()");
      doneAdd();
      
      // test .list().get()
      $SP().list("SharepointPlus").get({fields:"ID,Title",where:'Title = "'+title+'"'}, function(data) {
        if (data.length === 1) {
          assert.ok(true, ".get()");
          doneGet();
          
          var itemID = data[0].getAttribute("ID");
          // test .list().update()
          $SP().list("SharepointPlus").update({'ID':itemID,'Title':'testUpdate'}, {
            error:function() {
              assert.ok(false, ".update()");
              doneUpdate();
              assert.ok(false, ".remove()");
              doneRemove();
            },
            success:function() {
              assert.ok(true, ".update()");
              doneUpdate();
              
              // test .list().remove()
              $SP().list("SharepointPlus").remove({'ID':itemID}, {
                error:function() {
                  assert.ok(false, ".remove()");
                  doneRemove();
                },
                success:function() {
                  assert.ok(true, ".remove()");
                  doneRemove();
                }
              }); 
            }
          });
        } else {
          assert.ok(false, ".get()");
          doneGet();
          assert.ok(false, ".update()");
          doneUpdate();
          assert.ok(false, ".remove()");
          doneRemove();
        }
      });
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
      var lastname = people["LastName"];
      assert.ok(true, 'whoami()');
      doneWhoami();
      
      // test isMember()
      $SP().isMember({user:username, group:"SharepointPlus"}, function(isMember) {
        assert.ok(isMember, 'isMember()');
        doneIsMember();
      });
      
      // test groupMembers
      $SP().groupMembers("SharepointPlus", function(members) {
        var passed=false;
        for (var i=members.length; i--;) {
          if (members[i]["LoginName"].toLowerCase() === username) {
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
      $SP().getUserInfo(username, function(info) {
        assert.ok((typeof info !== "string" && info.LoginName.toLowerCase() === username), 'getUserIno()');
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
