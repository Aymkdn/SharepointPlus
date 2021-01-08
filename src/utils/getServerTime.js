import ajax from './ajax.js'
import getURL from './getURL.js'

/**
  @name $SP().getServerTime
  @function
  @category utils
  @description Return the current server time (or convert the passed date)

  @param {Date} [date=new Date()] You can send a Date object and it will be converted using the server time
  @param {String} [url="current website"] The url of the website
  @return {Promise} resolve(DateInUTC), reject(error)

  @example
  $SP().getServerTime().then(function(dateInUTC) {
    console.log("Server Time: "+dateInUTC);
  }, function(error) {
    console.log(error)
  })
*/
export default async function getServerTime(date, url) {
  try {
    date = date || new Date();
    // find the base URL
    if (!url) {
      url = await getURL.call(this);
    }

    let data = await ajax.call(this, {url:url + "/_api/web/RegionalSettings/TimeZone/utcToLocalTime(@date)?@date='"+ date.toUTCString() + "'"});
    if (typeof data === "object" && data.d && data.d.UTCToLocalTime) return Promise.resolve(data.d.UTCToLocalTime+'Z');
    return Promise.reject("[getServerTime] The server didn't return the expected response.");
  } catch(err) {
    return Promise.reject(err);
  }
}
