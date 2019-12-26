import ajax from './ajax.js'
import getURL from './getURL.js'

/**
 * @name $SP().getTimeZoneInfo
 * @function
 * @category utils
 * @description Permits to retrieve the TimeZone informations (ID, Description, XMLTZone) based on the server's timezone
 *
 * @param {Object} [settings]
 *   @param {String} [settings.url="current website"]
 * @return {Object} resolve({ID, Description, XMLTZone}), reject(error)
 */
export default async function getTimeZoneInfo(settings) {
  // https://docs.microsoft.com/en-us/previous-versions/office/sharepoint-server/ms453853(v%3Doffice.15)
  try {
    settings = settings || {};
    if (!settings.url) {
      settings.url = await getURL();
    }

    let data = await ajax.call(this, {url:settings.url+'/_api/web/RegionalSettings/TimeZone'});
    return Promise.resolve({
      ID:data.d.Id,
      Description:data.d.Description,
      Bias:data.d.Information.Bias,
      StandardBias:data.d.Information.StandardBias,
      DaylightBias:data.d.Information.DaylightBias,
      XMLTZone:"<timeZoneRule><standardBias>"+(data.d.Information.Bias*1+data.d.Information.StandardBias*1)+"</standardBias><additionalDaylightBias>"+data.d.Information.DaylightBias+"</additionalDaylightBias></timeZoneRule>"
    })
  } catch(err) {
    return Promise.reject(err);
  }
}
