import ajax from './ajax.js'
import getURL from './getURL.js'
import regionalSettings from './regionalSettings'

/**
  @name $SP().regionalDateFormat
  @function
  @category utils
  @description Provide the Date Format based on the user regional settings (YYYY for 4-digits Year, YY for 2-digits day, MM for 2-digits Month, M for 1-digit Month, DD for 2-digits day, D for 1-digit day) -- it's using the DatePicker iFrame (so an AJAX request)

  @return {Promise} resolve(dateFormat), reject(error)

  @example
  // you'll typically need that info when parsing a date from a Date Picker field from a form
  // we suppose here you're using momentjs
  // eg. we want to verify start date is before end date
  var startDate = $SP().formfields("Start Date").val();
  var endDate = $SP().formfields("End Date").val();
  $SP().regionalDateFormat().then(function(dateFormat) {
    // if the user settings are on French, then dateFormat = "DD/MM/YYYY"
    if (moment(startDate, dateFormat).isAfter(moment(endDate, dateFormat))) {
      alert("StartDate must be before EndDate!")
    }
  })

  // Here is also an example of how you can parse a string date
  // -> https://gist.github.com/Aymkdn/b17903cf7786578300f04f50460ebe96
 */
export default async function regionalDateFormat(url) {
  try {
    // check cache
    if (global._SP_CACHE_DATEFORMAT) {
      return Promise.resolve(global._SP_CACHE_DATEFORMAT);
    }
    // find the base URL
    if (!url) {
      url = await getURL.call(this);
    }

    // check if we have LCID
    var lcid = "";
    if (typeof _spRegionalSettings !== "undefined") lcid=_spRegionalSettings.localeId; // eslint-disable-line
    else if (global._SP_CACHE_REGIONALSETTINGS) lcid=global._SP_CACHE_REGIONALSETTINGS.lcid;
    if (!lcid) {
      await regionalSettings.call(this, url);
      lcid=global._SP_CACHE_REGIONALSETTINGS.lcid;
    }

    let data = await ajax.call(this, {url:url + "/_layouts/iframe.aspx?cal=1&date=1/1/2000&lcid="+lcid});
    let div = document.createElement('div');
    div.innerHTML = data;

    // div will contain the full datepicker page, for the January 2000
    // search for 3/January/2000
    let x = div.querySelector('a[id="20000103"]').getAttribute("href").replace(/javascript:ClickDay\('(.*)'\)/,"$1");
    // source : http://stackoverflow.com/questions/7885096/how-do-i-decode-a-string-with-escaped-unicode
    let r = /\\u([\d\w]{4})/gi;
    x = x.replace(r, function (match, grp) { return String.fromCharCode(parseInt(grp, 16)); } );
    x = unescape(x); // eg: 3.1.2000
    x = x.replace(/20/, "YY"); // 3.1.YY00
    x = x.replace(/00/, "YY"); // 3.1.YYYY
    x = x.replace(/03/, "DD"); // 3.1.YYYY
    x = x.replace(/3/, "D"); // D.1.YYYY
    x = x.replace(/01/, "MM"); // D.1.YYYY
    x = x.replace(/1/, "M"); // D.M.YYYY
    global._SP_CACHE_DATEFORMAT = x;
    return Promise.resolve(x);
  } catch(err) {
    return Promise.reject(err);
  }
}
