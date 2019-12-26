/**
  @name $SP().toXSLString
  @function
  @category utils
  @description Change a string into a XSL format string
  @param {String} text The string to change
  @return {String} the XSL version of the string passed
  @example $SP().toXSLString("Big Title"); // --> "Big_x0020_Title"
*/
export default function toXSLString(str) {
  if (typeof str !== "string") throw "[SharepointPlus 'toXLSString'] The argument is not a string...."; // if the first car is a number, then FullEscape it

  var FullEscape = function FullEscape(strg) {
    var hexVals = new Array("0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F");
    var rstr = "",
        i,
        c,
        num,
        temp,
        hexString,
        tmpStr,
        k;

    for (i = 0; i < strg.length; i++) {
      c = strg.charAt(i);
      num = c.charCodeAt(0);
      temp = 0;
      hexString = "";

      while (num >= 16) {
        temp = num % 16;
        num = Math.floor(num / 16);
        hexString += hexVals[temp];
      }

      hexString += hexVals[num];
      tmpStr = "";

      for (k = hexString.length - 1; k >= 0; k--) {
        tmpStr += hexString.charAt(k);
      }

      rstr += "%" + tmpStr;
    }

    return rstr;
  };

  var aSpaces = str.split(" "),
      ret = "",
      i,
      c; // check if there is a number and work length is smaller than 5 letters

  if (/^[0-9]/.test(aSpaces[0]) && aSpaces[0].length < 5) {
    // change the first letter
    ret = FullEscape(str.charAt(0));
    str = str.substring(1);
  }

  for (i = 0; i < str.length; i++) {
    c = str.charAt(i);
    if (/[0-9A-Za-z_]/.test(c) === false) ret += FullEscape(c).toLowerCase();else ret += c;
  }

  return ret.replace(/%([a-zA-Z0-9][a-zA-Z0-9])/g, "_x00$1_").substring(0, 32);
}