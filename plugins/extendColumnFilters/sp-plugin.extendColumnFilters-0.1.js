// a jQuery plugin to create an iframe
// source: https://forum.jquery.com/topic/dynamically-created-iframe-and-it-s-data-manipulation-issue-under-firefox
// source: http://home.jejaju.com/play/iframe-contents.html
(function($){
  var waiting=0
  function logit(){
    waiting++
    return function(e){
      waiting--
      if (waiting==0){
        var doc= this.ownerDocument;
        var win= 'defaultView' in doc? doc.defaultView : doc.parentWindow;
        $(win.iframe).trigger('loaded')
        $(win).trigger('loaded')
        $(doc).trigger('loaded')
      }
    }
  }
  $.fn.appendWL= function(t){
    return $(t).one('load',logit()).appendTo(this)
  }
  $.fn.iframe= function(els,options){
    if ($.type(els)==="string") return this.contents().find(els)
    else if (els===window) return this[0].contentWindow
    else if (els===document) return this.contents()
    var settings=$.extend({
        html:'<!doctype html><html><head><\/head><body><\/body><\/html>'
      },els),
      options=$.extend({
        $:$,
        css:true
      },options)
    return $('<iframe/>').appendTo(this).each(function(){
      var contents=$(this).contents(),win=contents[0], frameWindow=this.contentWindow
      win.write(settings.html)
      win.close()
      if (options.$) frameWindow.$=frameWindow.jQuery=$
      frameWindow.iframe=this
      if (options.css){
        $('link[rel="stylesheet"]').each(function(){
          contents.find('head').appendWL(this.outerHTML)
        })
        $('style').each(function(){ // opera doesn't get a load event on style tags!
          contents.find('head').append(this.outerHTML)
        })
      }
      $.each(settings,function(k,v){
        if(k!='html') contents.find(k).html(v)
      })
      setTimeout(function(){
        $(frameWindow).trigger('ready')
      },0)
    })
  }
})(jQuery)

/**
 * when the users clicks on the header a dropdown appears
 * the first function that is called is "CreateFilterMenu"
 * then an iframe is called with a special URL by "addFilterMenuItems"
 * and finally the data returns by this iframe are used to create the options to filter
 *
 * @param {Object} options
 *   @param {String} [list] (Optional) This is the name of the Sharepoint List related to the headers
 *   @param {Array} headers Array of headers with special properties
 *     @param {String} name This is the display name of the header that will have to change
 *
*/

var _SP_Plugin_extendColumnFilters={"listHeadersToChange":[], "list":"", "content":[]};
$SP().registerPlugin('extendColumnFilters', function(options) {
  var i, len, listHeadersToChange=[];

  for (i=0; i<options.headers.length; i++) listHeadersToChange.push(options.headers[i].name);
  _SP_Plugin_extendColumnFilters.listHeadersToChange=listHeadersToChange;
  _SP_Plugin_extendColumnFilters.list = options.list || ctx.listName;

  window.addFilterMenuItems_bak=window.addFilterMenuItems;
  
  // a short function to retrieve the params in the url
  function parseParams(url){url=url||window.location.search;var i={},g,b=/\+/g,c=/([^&=]+)=?([^&]*)/g,h=function(a){return decodeURIComponent(a.replace(b," "))},f=url.substring(1);while(g=c.exec(f)){i[h(g[1])]=h(g[2])}return i};

  window.addFilterMenuItems=function(m, j) {
    var displayname, ctxnum, name, escapeName, view, content, where, selectedValue="";
    if (filterTable) {
      // "filterTable" contains the DIV that has several useful info
      // in "name" we have the internal name of the field
      // in "displayname" we have the display name of the field
      // in "ctxnum" we have the unique ID used to load the related iframe
      // check if the current fields need to be changed
      displayname = filterTable.getAttribute("displayname");
      ctxnum = filterTable.getAttribute("CtxNum");
      view = filterTable.getAttribute("sortfields").replace(/^[^{]+({[^}]+}).*$/,"$1").toUpperCase();
      name = filterTable.getAttribute("name");
      escapeName = escapeProperly(name);
      where = [];
      
      if (_SP_Plugin_extendColumnFilters.listHeadersToChange.indexOf(displayname) > -1) {
        // we need to see if we have some filters in place already
        var params = parseParams();
        for (var param in params) {
          if (params.hasOwnProperty(param) && param.slice(0,11) === "FilterField") {
            // if it's the current filter then we want to know the selected value
            if (params[param] === name) {
              selectedValue = params[param.replace(/Field/,"Value")]
            } else {
              // if it's not then we need to create a where clause with the other filters
              where.push(params[param]+' = "'+params[param.replace(/Field/,"Value")]+'"')
            }
          }
        }
        where=where.join(" AND ");
        strFilteredValue=selectedValue || null; // "strFilteredValue" is used by Sharepoint
        
        // the below code is coming from addFilterMenuItems and permits to simulate the same behavior
        // we create the skeleton for the filter menu
        var createSkeletonMenu = function(clearFilter) {
          strDisplayText = StBuildParam(L_DontFilterBy_Text, displayname);
          var onMenuClick = "javascript:HandleFilter(event, '" + STSScriptEncode(FilterFieldV3(ctxFilter.view, escapeName, "", 0, true)) + "')";
          var imgFilterSrc = ctxFilter.imagesPath + (clearFilter ? "FILTEROFF.gif" : "FILTEROFFDISABLED.gif");
          CAMOptFilter(m, j, strDisplayText, onMenuClick, imgFilterSrc, clearFilter, "fmi_clr");
          var optionLoading = CAMOpt(j, L_Loading_Text, "");
          optionLoading.setAttribute("enabled", "false");
          setTimeout("ShowFilterLoadingMenu()", 15);
        }
        
        // check if we have the data for that one
        if (_SP_Plugin_extendColumnFilters.content.length===0) {
          bMenuLoadInProgress = true; // used by Sharepoint
          createSkeletonMenu(strFilteredValue?true:false);
          
          // now it's time to get the data
          $SP().list(_SP_Plugin_extendColumnFilters.list).get({
            "fields":name,
            "paging":true,
            "view":ctxFilter.view,
            "where":where,
            "groupby":name
          }, function(data) {
            var arr=[];
            for (var k=data.length; k--;) arr.push(data[k].getAttribute(name))
            arr.sort();
            _SP_Plugin_extendColumnFilters.content=arr;
            window.addFilterMenuItems(m, j);
          })
          return
        } else {
          // if there is a selected value, then we enable the Clear Filter
          if (bMenuLoadInProgress === false) createSkeletonMenu(strFilteredValue?true:false)
        }

        // let's define the content returned by the iframe
        content = '<SELECT id="diidFilter'+name+'" TITLE="Filter by '+displayname+'" OnChange=\'FilterField("'+view+'","'+name.replace(/\_/g,"\\u00255f")+'",this.options[this.selectedIndex].value, this.selectedIndex);\' dir=""><OPTION  '+(selectedValue===""?'SELECTED':'')+' Value="">(All)</OPTION>';
        for (i=0, len=_SP_Plugin_extendColumnFilters.content.length; i<len; i++)
          content += '<OPTION Value="'+_SP_Plugin_extendColumnFilters.content[i]+'" '+(_SP_Plugin_extendColumnFilters.content[i]==selectedValue?'SELECTED':'')+'>'+_SP_Plugin_extendColumnFilters.content[i]+'<\/OPTION>';
        content += '</SELECT><br><a id="diidSort'+name+'" onfocus="OnFocusFilter(this)" title="Sort by '+displayname+'" href="javascript:" onclick="javascript:return OnClickFilter(this,event);"  SortingFields="SortField='+escapeName+'&amp;SortDir=Asc&amp;View='+escapeProperly(view)+'">'+displayname+'<img src="/_layouts/images/blank.gif" class="ms-hidden" border="0" width="1" height="1" alt="Use SHIFT+ENTER to open the menu (new window)."/></a><img src="/_layouts/images/blank.gif" alt="" border="0"/><img src="/_layouts/images/blank.gif" border="0" alt=""/>';
        // here we want to override in creating our own iframe and deleting the existing one
        $('#FilterIframe' + filterTable.getAttribute("CtxNum")).remove();
        $('body').iframe({
          'body':content,
        }).attr({
          'id':'FilterIframe' + ctxnum,
          'name':'FilterIframe' + ctxnum
        }).css({
          'display':'none',
          'widht':0,
          'height':0
        }).on('loaded', function() {
          window.OnIframeLoad();
        })

        return
      } else {
        // if we have selected something else then we want to erase the content
        _SP_Plugin_extendColumnFilters.content=[]
      }
    }

    window.addFilterMenuItems_bak(m, j);
  }
})
