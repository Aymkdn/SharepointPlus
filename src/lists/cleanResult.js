/**
  @name $SP().cleanResult
  @function
  @category lists
  @description clean a string returned by a GET (remove ";#" and "string;#" and null becomes "")

  @param {String} str The string to clean
  @param {String} [separator=";"] When it's a list we may want to have a different output (see examples)
  @return {String} the cleaned string

  @example
  $SP().cleanResult("15;#Paul"); // -> "Paul"
  $SP().cleanResult("string;#Paul"); // -> "Paul"
  $SP().cleanResult("string;#"); // -> ""
  $SP().cleanResult(";#Paul;#Jacques;#Aymeric;#"); // -> "Paul;Jacques;Aymeric"
  $SP().cleanResult(";#Paul;#Jacques;#Aymeric;#", ", "); // -> "Paul, Jacques, Aymeric"
*/
export default function cleanResult(str,separator) {
  if (str===null || typeof str==="undefined") return "";
  separator = separator || ";";
  return (typeof str==="string"?str.replace(/^(string;|float;|datetime;)#?/,"").replace(/;#-?[0-9]+;#/g,separator).replace(/^-?[0-9]+;#/,"").replace(/^;#|;#$/g,"").replace(/;#/g,separator):str);
}
