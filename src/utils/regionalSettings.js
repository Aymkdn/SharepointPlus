import ajax from './ajax.js'
import getURL from './getURL.js'

/**
  @name $SP().regionalSettings
  @function
  @category utils
  @description Find the region settings (of the current user) defined with _layouts/regionalsetng.aspx?Type=User (lcid, cultureInfo, timeZone, calendar, alternateCalendar, workWeek, timeFormat..)

  @return {Promise} resolve({lcid, cultureInfo, timeZone, calendar, alternateCalendar, workWeek:{days, firstDayOfWeek, firstWeekOfYear, startTime, endTime}}), reject(error)

  @example
  $SP().regionalSettings().then(function(region) {
    // show the selected timezone, and the working days
    console.log("timeZone: "+region.timeZone);
    console.log("working days: "+region.workWeek.days.join(", "))
  }, function(error) {
    console.log(error)
  })
*/
export default async function regionalSettings(url) {
  try {
    // check cache
    if (global._SP_CACHE_REGIONALSETTINGS) {
      return Promise.resolve(global._SP_CACHE_REGIONALSETTINGS)
    }
    // find the base URL
    if (!url) {
      url = await getURL.call(this);
    }

    let data = await ajax.call(this, {url:url + "/_layouts/regionalsetng.aspx?Type=User"});
    let result = {lcid:"", cultureInfo:"", timeZone:"", calendar:"", alternateCalendar:""};
    let div = document.createElement('div');
    div.innerHTML = data;
    let tmp, i;
    let getValue = function(id) {
      let e = div.querySelector("select[id$='"+id+"']");
      return e.options[e.selectedIndex].innerHTML;
    };

    result.lcid = div.querySelector("select[id$='LCID']").value;
    result.cultureInfo = getValue("LCID");
    result.timeZone = getValue("TimeZone");
    result.calendar = getValue("DdlwebCalType");
    result.alternateCalendar = getValue("DdlwebAltCalType");

    tmp=document.querySelectorAll("input[id*='ChkListWeeklyMultiDays']");
    result.workWeek = {days:[], firstDayOfWeek:"", firstWeekOfYear:"", startTime:"", endTime:""};
    for (i=0; i<tmp.length; i++) {
      if (tmp[i].checked) result.workWeek.days.push(tmp[i].nextSibling.querySelector('abbr').getAttribute("title"))
    }

    result.workWeek.firstDayOfWeek = getValue("DdlFirstDayOfWeek");
    result.workWeek.firstWeekOfYear = getValue("DdlFirstWeekOfYear");
    result.workWeek.startTime=div.querySelector("select[id$='DdlStartTime']").value;
    result.workWeek.endTime=div.querySelector("select[id$='DdlEndTime']").value;
    result.timeFormat = getValue("DdlTimeFormat");

    // cache
    global._SP_CACHE_REGIONALSETTINGS = result;
    return Promise.resolve(result);
  } catch(err) {
    return Promise.reject(err);
  }
}
