if (typeof jQuery === "undefined") throw 'Error sp-peopleaheade: jQuery must be loaded first!'
if (typeof $SP === "undefined") throw 'Error sp-peopleahead: SharepointPlus must be loaded first!'

/**
  @name $SP().plugin('peopleahead')
  @function
  @description Change an input field into a field that will search for a name into the Sharepoint Address Book
      
  @param {Object} [setup] Options (see below)
    @param {String} [setup.selector=".peopleahead"] The INPUT element where the typeahead will be applied
    @param {Number} [setup.limit=20] The maximum of results returned by $SP().addressbook()
    @param {String} [setup.loading] The source of the spin loading image you want to show (by default a data:image/gif;base64 is used)
    @param {String} [setup.noresult="No result: Please use 'firstname', or 'lastname', or 'lastname, firstname'"] The message to show when no one is found
    @param {String} [setup.enable=true] You can disable the plugin on a field with "enable:false" and you can re-enable it later
    @param {Function} [setup.onselect] When selecting someone in the list
  
  @example
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
  
  // disable the plugin
  $SP().plugin('peopleahead', {
    selector:"#my-people",
    enable:false
  })
  // and re-enable it
  $SP().plugin('peopleahead', {
    selector:"#my-people",
    enable:true
  })

*/
$SP().registerPlugin('peopleahead', function(options) {
  options.selector = options.selector ||".peopleahead";
  if (options.enable !== undefined) {
    if (options.enable === true)
      $(options.selector).on('keyup.peopleahead', spPeopleAheadKeyUp)
    else
      $(options.selector).off('keyup.peopleahead').closest('.sp-peopleahead').find('img,ul').hide();
    
    return 
  }
  options.limit = options.limit || 20;
  var centerIMG = (options.loading === undefined ? 'margin-top:8px' : '');
  options.loading = options.loading || 'data:image/gif;base64,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';
  options.noresult = options.noresult || "No result: Please use 'firstname', or 'lastname', or 'lastname, firstname'"
  options.onselect = options.onselect || (function(){});

  // replace the INPUT element
  $(options.selector).each(function() {
    $(this).attr('autocomplete','off');
    $(this).replaceWith('<div class="sp-peopleahead" data-mouseintheplace="true"><img src="'+options.loading+'" alt="loading" style="'+centerIMG+'">'+this.outerHTML+'<ul></ul></div>')
  });
      
  $(options.selector).data("peopleahead-options",options).on('keyup.peopleahead', spPeopleAheadKeyUp).on('blur.peopleahead', function() {
    var $this=$(this);
    var $parent = $this.closest('.sp-peopleahead');
    if ($parent.data('mouseintheplace') != true) {
      $parent.find('img,ul').hide();
      if ($this.data('login') === "") $this[0].className='peopleahead-warning'
    } else if ($this.val() === "") {
      $parent.find('img,ul').hide();
    }
  })
  $('.sp-typeahead').on('mouseenter.peopleahead', function() {
     $(this).data('mouseintheplace',true);
  }).on('mouseleave.peopleahead', function() {
     $(this).data('mouseintheplace',false);
  })
})

function spPeopleAheadKeyUp() {
  var $this=$(this);
  var options = $(this).data("peopleahead-options")
  // we want to move the UL just under the input
  if (!$this.data('ul-position')) {
    var pos=$this.position();
    var hght=$this.height();
    $this.data('ul-position','done').next().css({top:(hght+pos.top)+'px', left:pos.left+'px'})
  }
  // show the loading image
  $(this).prev().show();
  var waitForSearch = $this.data('waitForSearch');
  if (waitForSearch) clearTimeout(waitForSearch);
  waitForSearch = setTimeout(function searchPeople() {
    $this.data("login","");
    $this[0].className="";
    $SP().addressbook($this.val(),{limit:options.limit},function(data) {
      var html='';
      for (var p=0; p<data.length; p++) {
        if (data[p]["UserInfoID"] != -1) {
          var displayName=data[p]["DisplayName"];
          var title=(data[p]["Title"] ? data[p]["Title"] : "No title");
          html += '<li><a href="#nogo" data-login="'+data[p]["AccountName"]+'" data-userid="'+data[p]["UserInfoID"]+'" data-email="'+data[p]["Email"]+'" data-name="'+displayName+'" data-title="'+title.replace(/"/g,'&quot;')+'"><b>'+displayName+'</b> (<em>'+title+'</em>)</a></li>';
        }
      }
      if (data.length===0) html = '<li><a href="#nogo">'+options.noresult+'</a></li>';
      $this.next().show().html(html);
      $this.prev().hide();
      // when selecting someone in the list
      $('.sp-peopleahead').on('click','li > a',function(event) {
        event.preventDefault();
        var _this=$(this);
        var $input=_this.closest('.sp-peopleahead').find('input');
        $input.val(_this.data('name')).data('login',_this.data('login')).next().hide();
        options.onselect.call(this)
      });
    })
  }, 350);
  $this.data('waitForSearch',waitForSearch)
}
