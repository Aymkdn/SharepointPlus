/**
  @name $SP().parseRecurrence
  @function
  @category lists
  @description Transform a RecurrenceData XML string to a recurrence object, and transform a recurrence object to a RecurrenceData XML string (for calendar events)
  @param  {String|Object} data The RecurrenceData XML or a recurrence object
  @return {String|Object}

  @example
  // from RecurrenceData XML to object
  $SP().parseRecurrence('&lt;recurrence>&lt;rule>&lt;firstDayOfWeek>mo&lt;/firstDayOfWeek>&lt;repeat>&lt;monthlyByDay weekday="TRUE" weekdayOfMonth="last" monthFrequency="1" />&lt;/repeat>&lt;windowEnd>2019-01-19T16:00:00Z&lt;/windowEnd>&lt;/rule>&lt;/recurrence>');
  // it will return the below object
  {
    "type":"monthlyByDay",
    "firstDayOfWeek":"monday",
    "on":{
      "weekday":"last"
    },
    "frequency":1,
    "endDate":"2019-01-19T16:00:00.000Z"
  }

  // from recurrence object to RecurrenceData XML string
  $SP().parseRecurrence({"type":"weekly","frequency":1,"on":{"monday":true,"tuesday":true,"wednesday":true},"endDate":new Date("2007-05-31T22:00:00.000Z")}); // -> &lt;recurrence>&lt;rule>&lt;firstDayOfWeek>mo&lt;/firstDayOfWeek>&lt;repeat>&lt;weekly mo="TRUE" tu="TRUE" we="TRUE" weekFrequency="1" />&lt;/repeat>&lt;windowEnd>2007-05-31T22:00:00Z&lt;/windowEnd>&lt;/rule>&lt;/recurrence>

  // recurrence object examples:
  // Every weekday
  {
    "type":"daily",
    "firstDayOfWeek":"monday",
    "on":{
      "weekday":true
    }
  }

  // Every X days
  {
    "type":"daily",
    "firstDayOfWeek":"monday",
    "frequency":X
  }

  // Every week on Monday and Wednesday
  {
    "type":"weekly",
    "firstDayOfWeek":"monday",
    "on":{
      "monday":true,
      "wednesday":true
    },
    "frequency":1
  }

  // Every day 10 of every 2 months
  {
    "type":"monthly",
    "firstDayOfWeek":"monday",
    "on":{
      "day":10
    },
    "frequency":2
  }

  // Every second tuesday of every 6 months
  {
    "type":"monthlyByDay",
    "firstDayOfWeek":"monday",
    "on":{
      "tuesday":"second"
    },
    "frequency":6
  }

  // Every December 25
  {
    "type":"yearly",
    "firstDayOfWeek":"monday",
    "on":{
      "month":12,
      "day":25
    },
    "frequency":1
  }

  // The third weekday of September
  {
    "type":"yearlyByDay",
    "firstDayOfWeek":"monday",
    "on":{
      "month":9,
      "weekday":"third"
    },
    "frequency":1
  }
*/
export default function parseRecurrence(data) {
  // check if it's XML
  var days = [ "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday" ];
  var ret=null;
  // e.g. <recurrence><rule><firstDayOfWeek>mo</firstDayOfWeek><repeat><daily weekday="TRUE" /></repeat><windowEnd>2019-01-19T16:00:00Z</windowEnd></rule></recurrence>
  if (typeof data === "string" && data.charAt(0)==='<') {
    ret = {};
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(data, "text/xml");
    var XMLS = new XMLSerializer(); // for IE
    var getText = function(elem) {
        // IE doesn't provide innerHTML, so we serialize and use regexp
      return (elem.innerHTML ? elem.innerHTML : XMLS.serializeToString(elem).replace(/^<[^>]+>([^<]+)<\/[^>]+>$/m,"$1"))
    }

    // references:
    // - http://thehightechheels.blogspot.com/2012/12/sharepoint-evenet-recurrencedata-xml.html
    // - https://fatalfrenchy.wordpress.com/2010/07/16/sharepoint-recurrence-data-schema/
    var tags = ['firstDayOfWeek', 'daily', 'weekly', 'monthly', 'monthlyByDay', 'yearly', 'yearlyByDay', 'windowEnd', 'repeatInstances'];
    tags.forEach(function(tag) {
      var xmlField = xmlDoc.getElementsByTagName(tag);
      if (xmlField.length===1) {
        var elem = xmlField[0];
        if (/y$/.test(tag)) ret.type = tag;
        switch(tag) {
          case "firstDayOfWeek": {
            var firstDayOfWeek = getText(elem)
            for (var i=0; i<days.length; i++) {
              if (days[i].slice(0,2) === firstDayOfWeek) {
                ret.firstDayOfWeek=days[i];
                break;
              }
            }
            break;
          }
          case "daily": {
            // is it a weekday thing ?
            if (elem.getAttribute("weekday") === "TRUE") ret.on = {"weekday":true};
            else ret.frequency=elem.getAttribute("dayFrequency")*1;
            break;
          }
          case "weekly": {
            ret.frequency=elem.getAttribute("weekFrequency")*1;
            ret.on = {};
            days.forEach(function(day) {
              if (elem.getAttribute(day.slice(0,2)) === "TRUE") ret.on[day]=true;
            });
            break;
          }
          case "monthly": {
            ret.frequency=elem.getAttribute("monthFrequency")*1;
            ret.on = {day:elem.getAttribute("day")*1};
            break;
          }
          case "yearlyByDay":
          case "monthlyByDay": {
            var weekdayOfMonth = elem.getAttribute("weekdayOfMonth") || elem.getAttribute("weekDayOfMonth"); // first, second, third, forth, last
            ret.on = {};
            days.forEach(function(day) {
              if (elem.getAttribute(day.slice(0,2)) === "TRUE") ret.on[day]=weekdayOfMonth;
            });
            if (elem.getAttribute("day") === "TRUE") ret.on.day=weekdayOfMonth;
            if (elem.getAttribute("weekday") === "TRUE") ret.on.weekday=weekdayOfMonth;
            if (elem.getAttribute("weekend_day") === "TRUE") ret.on.weekend=weekdayOfMonth;

            if (tag === "monthlyByDay") ret.frequency=elem.getAttribute("monthFrequency")*1;
            else {
              ret.frequency=elem.getAttribute("yearFrequency")*1;
              ret.on.month = elem.getAttribute("month")*1;
            }
            break;
          }
          case "yearly": {
            ret.frequency=elem.getAttribute("yearFrequency")*1;
            ret.on = {
              "month":elem.getAttribute("month")*1,
              "day":elem.getAttribute("day")*1,
            }
            break;
          }
          case "windowEnd": {
            ret.endDate = new Date(getText(elem))
            break;
          }
          case "repeatInstances": {
            ret.endAfter = getText(elem)*1;
            break;
          }
        }
      }
    })

    return ret;
  } else if (data && typeof data === "object" && data.type) {
    // transform an object to a XML string
    data.firstDayOfWeek = data.firstDayOfWeek || "mo";
    ret = '<recurrence><rule><firstDayOfWeek>'+(data.firstDayOfWeek.toLowerCase().slice(0,2)||'mo')+'</firstDayOfWeek><repeat><'+data.type+' ';
    switch (data.type) {
      case "daily": {
        ret += (data.frequency ? 'dayFrequency="'+data.frequency+'"' : 'weekday="TRUE"') + ' />';
        break;
      }
      case "weekly": {
        days.forEach(function(day) {
          if (data.on[day]) ret += day.slice(0,2) + '="TRUE" ';
        });
        ret += 'weekFrequency="' + data.frequency + '" />';
        break;
      }
      case "monthly": {
        ret += 'monthFrequency="' + data.frequency + '" day="' + data.on.day + '" />';
        break;
      }
      case "yearlyByDay":
      case "monthlyByDay": {
        ['day', 'weekday', 'weekend'].concat(days).forEach(function(day, idx) {
          if (data.on[day]) {
            if (idx < 3) {
              ret += day + (day==='weekend'?'_day':'');
            } else {
              ret += day.slice(0,2)
            }
            // monthlyByDay has "weekdayOfMonth" with "day" in lowercase, when yearlyByDay has "weekDayOfMonth"
            ret += '="TRUE" ';
            // avoid repeating "weekDayOfMonth"
            if (ret.indexOf('ayOfMonth') === -1) {
              ret += 'week' + (data.type==="monthlyByDay" ? 'd' : 'D') + 'ayOfMonth="' + data.on[day] + '" ';
            }
            day = data.on[day];
          }
        });

        if (data.on.month) ret += ' month="' + data.on.month + '"';
        ret += (data.type==="monthlyByDay" ? 'month' : 'year') + 'Frequency="' + data.frequency + '" />';
        break;
      }
      case "yearly": {
        ret += 'yearFrequency="' + data.frequency + '" month="' + data.on.month + '" day="' + data.on.day + '" />';
        break;
      }
    }
    ret += '</repeat>';
    if (data.endDate) {
      ret += '<windowEnd>' + new Date(data.endDate).toISOString().replace(/.000Z/,"Z") + '</windowEnd>';
    } else if (data.endAfter) {
      ret += '<repeatInstances>' + data.endAfter + '</repeatInstances>';
    } else {
      ret += '<repeatForever>FALSE</repeatForever>';
    }

    ret += '</rule></recurrence>';

    return ret;
  }

  return null;
}
