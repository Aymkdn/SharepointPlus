import _indexOfInstanceProperty from "@babel/runtime-corejs3/core-js-stable/instance/index-of";
import _sliceInstanceProperty from "@babel/runtime-corejs3/core-js-stable/instance/slice";

/**
  @name $SP().toDate
  @function
  @category utils
  @description Change a Sharepoint date (as a string) to a Date Object
  @param {String} textDate the Sharepoint date string
  @param {Boolean} [forceUTC=false] Permits to force the reading of the date in UTC
  @return {Date} the equivalent Date object for the Sharepoint date string passed
  @example $SP().toDate("2012-10-31T00:00:00").getFullYear(); // 2012
*/
export default function toDate(strDate, forceUTC) {
  if (!strDate) return ""; // 2008-10-31(T)00:00:00(Z)

  if (typeof strDate !== "string" && !isNaN(new Date(strDate))) return strDate; // check if it's a date, more robust than "d instanceof Date"

  if (_sliceInstanceProperty(strDate).call(strDate, 0, 10) === "datetime;#") strDate = _sliceInstanceProperty(strDate).call(strDate, 10); // if it's a short date like 2020-01-19 then we use new Date()

  if (strDate.length === 10 && /\d{4}-\d{2}-\d{2}/.test(strDate)) return new Date(strDate);
  if (strDate.length != 19 && strDate.length != 20) throw "[SharepointPlus toDate] '" + strDate + "' is invalid.";
  var year = strDate.substring(0, 4);
  var month = strDate.substring(5, 7);
  var day = strDate.substring(8, 10);
  var hour = strDate.substring(11, 13);
  var min = strDate.substring(14, 16);
  var sec = strDate.substring(17, 19); // check if we have "Z" for UTC date

  return _indexOfInstanceProperty(strDate).call(strDate, "Z") > -1 || forceUTC ? new Date(Date.UTC(year, month - 1, day, hour, min, sec)) : new Date(year, month - 1, day, hour, min, sec);
}