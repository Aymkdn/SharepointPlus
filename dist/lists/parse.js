"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js-stable/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports["default"] = parse;

var _forEach = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/for-each"));

var _slice = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/slice"));

var _typeof2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/typeof"));

var _cleanString2 = _interopRequireDefault(require("../utils/_cleanString.js"));

/**
  @name $SP().parse
  @function
  @category lists
  @description Use a WHERE sentence to transform it into a CAML Syntax sentence

  @param {String} where The WHERE sentence to change
  @param {String} [escapeChar=true] Determines if we want to escape the special chars that will cause an error (for example '&' will be automatically converted to '&amp;amp;')
  @example
  $SP().parse('ContentType = "My Content Type" OR Description &lt;> null AND Fiscal_x0020_Week >= 43 AND Result_x0020_Date < "2012-02-03"');
  // -> return &lt;And>&lt;And>&lt;Or>&lt;Eq>&lt;FieldRef Name="ContentType" />&lt;Value Type="Text">My Content Type&lt;/Value>&lt;/Eq>&lt;IsNotNull>&lt;FieldRef Name="Description" />&lt;/IsNotNull>&lt;/Or>&lt;Geq>&lt;FieldRef Name="Fiscal_x0020_Week" />&lt;Value Type="Number">43&lt;/Value>&lt;/Geq>&lt;/And>&lt;Lt>&lt;FieldRef Name="Result_x0020_Date" />&lt;Value Type="DateTime">2012-02-03&lt;/Value>&lt;/Lt>&lt;/And>

  // available operators :
  // "&lt;" : less than
  // "&lt;=" : less than or equal to
  // ">" : greater than
  // ">=" : greater than or equal to
  // "<>" : different
  // "~=" : this must be only used when comparing to a number that represents a User or List ID (e.g. 'User ~= 328') - that permits to query a list with indexed lookup column
  // "~<>" : same as before, except that we exclude the value (e.g. 'User ~<> 328')
  // " AND "
  // " OR "
  // " LIKE " : for example 'Title LIKE "foo"' will return "foobar" "foo" "barfoobar" "barfoo" and so on
  // " IN " : for example 'Location IN ["Los Angeles","San Francisco","New York"]', equivalent to 'Location = "Los Angeles" OR Location = "San Francisco" OR Location = "New York"' — SP2013 limits each IN to 60 items. If you want to check Lookup IDs instead of text you can use '~' followed by the ID, for example 'Location IN ["~23", "~26", "~30"]'

  // special words:
  // '[Me]' : for the current user
  // '[Today]' : to use the today date
  // '[Today+X]' : to use today + X days
  // Null : for the Null value
  // TRUE : for the Yes/No columns
  // FALSE : for the Yes/No columns

  // in the below example, on the "&" will be escaped
  var bar="Bob & Marley";
  var foo="O'Conney";
  $SP().parse('Bar = "'+bar+'" AND Foo = "'+foo+'"'); // -> &lt;And>&lt;Eq>&lt;FieldRef Name="Bar" />&lt;Value Type="Text">Bob &amp; Marley&lt;/Value>&lt;/Eq>&lt;Eq>&lt;FieldRef Name="Foo" />&lt;Value Type="Text">O'Conney&lt;/Value>&lt;/Eq>&lt;/And>
  $SP().parse("Bar = '"+bar+"' AND Foo = '"+foo+"'"); // don't put the simple and double quotes this way because it'll cause an issue with O'Conney
*/
function parse(q, escapeChar) {
  // schema: https://docs.microsoft.com/en-us/sharepoint/dev/schema/query-schema
  var queryString = q.replace(/(\s+)?(=|~=|<=|>=|~<>|<>|<|>| LIKE | IN )(\s+)?/g, "$2").replace(/""|''/g, "Null").replace(/==/g, "="); // remove unnecessary white space & replace '
  // the Null doesn't work with IN, so we need to move it outside

  if (/\w+ IN \[([^[]+,)?Null,?/.test(queryString)) {
    // eslint-disable-next-line
    queryString = queryString.replace(/(\w+) IN \[([^\[]+,)?Null(,[^\]]+)?\]/g, "($1 = Null OR $&)") // eslint-disable-next-line
    .replace(/\[([^\[]+,)?Null(,[^\]]+)?\]/g, "[$1$2]").replace(/(\[),|(,),|,(\])/g, "$1$2$3");
  }

  var factory = [];
  escapeChar = escapeChar === false ? false : true;
  var limitMax = queryString.length;
  var closeOperator = "",
      closeTag = "",
      ignoreNextChar = false;
  var lastField = "";
  var parenthesis = {
    open: 0
  };
  var lookupId = false;

  for (var i = 0; i < queryString.length; i++) {
    var letter = queryString.charAt(i);

    switch (letter) {
      case "(":
        // find the deepest (
        var start = i;
        var openedApos = false;

        while (queryString.charAt(i) == "(" && i < limitMax) {
          i++;
          parenthesis.open++;
        } // find the corresponding )


        while (parenthesis.open > 0 && i < limitMax) {
          i++; // if there is a ' opened then ignore the ) until the next '

          var charAtI = queryString.charAt(i);
          if (charAtI == "\\") ignoreNextChar = true; // when we have a backslash \ then ignore the next char
          else if (!ignoreNextChar && (charAtI == "'" || charAtI == '"')) openedApos = !openedApos;else if (!ignoreNextChar && charAtI == "(" && !openedApos) parenthesis.open++;else if (!ignoreNextChar && charAtI == ")" && !openedApos) parenthesis.open--;else ignoreNextChar = false;
        }

        var lastIndex = factory.length - 1; // concat with the first index

        if (lastIndex >= 0) {
          if (closeOperator != "") factory[0] = "<" + closeOperator + ">" + factory[0];
          factory[0] += parse(queryString.substring(start + 1, i));
          if (closeOperator != "") factory[0] += "</" + closeOperator + ">";
          closeOperator = "";
        } else {
          factory[0] = parse(queryString.substring(start + 1, i));
        }

        break;

      case "[":
        // for operator IN
        var start = i; // eslint-disable-line

        var openedApos = false; // eslint-disable-line
        // find the corresponding ]

        while (i < limitMax) {
          i++; // if there is a ' opened then ignore the ) until the next '

          var charAtI = queryString.charAt(i); // eslint-disable-line

          if (charAtI == "\\") ignoreNextChar = true; // when we have a backslash \then ignore the next char
          else if (!ignoreNextChar && (charAtI == "'" || charAtI == '"')) openedApos = !openedApos;else if (!ignoreNextChar && !openedApos && charAtI == "]") break;else ignoreNextChar = false;
        }

        var lastIndex = factory.length - 1; // eslint-disable-line

        var arrIn = JSON.parse('[' + queryString.substring(start + 1, i) + ']'); // we want to detect the type for the values

        var typeIn = "Text";

        switch ((0, _typeof2["default"])(arrIn[0])) {
          case "number":
            typeIn = "Number";
            break;

          default:
            {
              var _context;

              // check if it starts with ~ and then it's a number -- lookupid
              if (arrIn[0].charAt(0) === "~" && typeof ((0, _slice["default"])(_context = arrIn[0]).call(_context, 1) * 1) === "number") {
                typeIn = "Integer"; // change all array values

                (0, _forEach["default"])(arrIn).call(arrIn, function (e, i) {
                  arrIn[i] = (0, _slice["default"])(e).call(e, 1);
                });
              }
            }
        }

        factory[lastIndex] += '<FieldRef Name="' + lastField + '" ' + (typeIn === "Integer" ? 'LookupId="True"' : '') + ' /><Values><Value Type="' + typeIn + '">' + arrIn.join('</Value><Value Type="' + typeIn + '">') + '</Value></Values>' + closeTag;
        lastField = "";
        closeTag = ""; // concat with the first index

        if (lastIndex > 0) {
          if (closeOperator != "") factory[0] = "<" + closeOperator + ">" + factory[0];
          factory[0] += factory[lastIndex];
          if (closeOperator != "") factory[0] += "</" + closeOperator + ">";
          delete factory[lastIndex];
          closeOperator = "";
        }

        break;

      case ">": // look at the operand

      case "<":
        i++;

        if (queryString.charAt(i) == "=") {
          // >= or <=
          factory.push("<" + (letter == ">" ? "G" : "L") + "eq>");
          closeTag = "</" + (letter == ">" ? "G" : "L") + "eq>";
        } else if (letter == "<" && queryString.charAt(i) == ">") {
          // <>
          factory.push("<Neq>");
          closeTag = "</Neq>";
        } else {
          i--;
          factory.push("<" + (letter == ">" ? "G" : "L") + "t>");
          closeTag = "</" + (letter == ">" ? "G" : "L") + "t>";
        }

        break;

      case "~":
        // special operator '~=' and '~<>' for lookup
        if (queryString.charAt(i + 1) == "=" || queryString.charAt(i + 1) === '<' && queryString.charAt(i + 2) === '>') {
          lookupId = true;
        }

        break;

      case "=":
        factory.push("<Eq>");
        closeTag = "</Eq>";
        break;

      case " ":
        // check if it's AND or OR
        if (queryString.substring(i, i + 5).toUpperCase() == " AND ") {
          // add the open tag in the array
          closeOperator = "And";
          i += 4;
        } else if (queryString.substring(i, i + 4).toUpperCase() == " OR ") {
          // add the open tag in the array
          closeOperator = "Or";
          i += 3;
        } else if ((0, _slice["default"])(queryString).call(queryString, i, i + 6).toUpperCase() == " LIKE ") {
          i += 5;
          factory.push("<Contains>");
          closeTag = "</Contains>";
        } else if ((0, _slice["default"])(queryString).call(queryString, i, i + 4).toUpperCase() == " IN ") {
          i += 3;
          factory.push("<In>");
          closeTag = "</In>";
        } else lastField += letter;

        break;

      case '"': // look now for the next "

      case "'":
        var apos = letter;
        var word = "",
            other = "";

        while ((letter = queryString.charAt(++i)) != apos && i < limitMax) {
          if (letter == "\\") letter = queryString.charAt(++i);
          word += letter;
        }

        lastIndex = factory.length - 1;
        factory[lastIndex] += '<FieldRef Name="' + lastField + '" ' + (word == "[Me]" ? 'LookupId="True" ' : '') + '/>';
        lastField = "";
        var type = "Text"; //(isNaN(word) ? "Text" : "Number"); // check the type
        // check automatically if it's a DateTime

        if (/\d{4}-\d\d?-\d\d?((T| )\d{2}:\d{2}:\d{2})?/.test(word)) {
          type = "DateTime"; // check if we want to evaluate the TIME also

          if (/\d{4}-\d\d?-\d\d?((T| )\d{2}:\d{2}:\d{2})/.test(word)) other = ' IncludeTimeValue="TRUE"';
        }

        if (escapeChar) word = (0, _cleanString2["default"])(word); // special words ([Today] and [Me])

        if (word === "[Me]") {
          word = '<UserID Type="Integer" />';
          type = "Integer";
        } else if ((0, _slice["default"])(word).call(word, 0, 6) == "[Today") {
          type = "DateTime"; // find the offset if defined

          word = '<Today OffsetDays="' + 1 * (0, _slice["default"])(word).call(word, 6, -1) + '" />';
        }

        factory[lastIndex] += '<Value Type="' + type + '"' + other + '>' + word + '</Value>';
        factory[lastIndex] += closeTag;
        closeTag = ""; // concat with the first index

        if (lastIndex > 0) {
          if (closeOperator != "") factory[0] = "<" + closeOperator + ">" + factory[0];
          factory[0] += factory[lastIndex];
          if (closeOperator != "") factory[0] += "</" + closeOperator + ">";
          delete factory[lastIndex];
          closeOperator = "";
        }

        break;

      case "0":
      case "1":
      case "2":
      case "3":
      case "4":
      case "5":
      case "6":
      case "7":
      case "8":
      case "9":
        if (closeTag != "") {
          // it's the value
          var value = letter;

          while (!isNaN(letter = queryString.charAt(++i)) && i < limitMax) {
            value += "" + letter;
          }

          lastIndex = factory.length - 1;
          factory[lastIndex] += '<FieldRef Name="' + lastField + '"' + (lookupId ? ' LookupId="True"' : '') + ' />';
          lastField = "";
          factory[lastIndex] += '<Value Type="' + (lookupId ? "Integer" : "Number") + '">' + value.replace(/ $/, "") + '</Value>';
          factory[lastIndex] += closeTag;
          closeTag = ""; // concat with the first index

          if (lastIndex > 0) {
            if (closeOperator != "") factory[0] = "<" + closeOperator + ">" + factory[0];
            factory[0] += factory[lastIndex];
            if (closeOperator != "") factory[0] += "</" + closeOperator + ">";
            delete factory[lastIndex];
            closeOperator = "";
          }

          i -= 2;
          break;
        }

      default:
        // eslint-disable-line
        if (closeTag == "") lastField += letter;else if (letter.toLowerCase() == "n" && queryString.substring(i, i + 4).toLowerCase() == "null") {
          // if we have NULL as the value
          lastIndex = factory.length - 1;

          if (closeTag == "</Neq>") {
            // <>
            factory[lastIndex] = "<IsNotNull>";
            closeTag = "</IsNotNull>";
          } else if (closeTag == "</Eq>") {
            // =
            factory[lastIndex] = "<IsNull>";
            closeTag = "</IsNull>";
          }

          i += 3;
          factory[lastIndex] += '<FieldRef Name="' + lastField + '" />';
          lastField = "";
          factory[lastIndex] += closeTag;
          closeTag = ""; // concat with the first index

          if (lastIndex > 0) {
            if (closeOperator != "") factory[0] = "<" + closeOperator + ">" + factory[0];
            factory[0] += factory[lastIndex];
            if (closeOperator != "") factory[0] += "</" + closeOperator + ">";
            delete factory[lastIndex];
            closeOperator = "";
          }
        } else if (letter.toLowerCase() === "t" && queryString.substring(i, i + 4).toLowerCase() === "true" || letter.toLowerCase() === "f" && queryString.substring(i, i + 5).toLowerCase() === "false") {
          // when we have TRUE/FALSE as the value
          lastIndex = factory.length - 1;
          i += 3;
          if (letter.toLowerCase() === "f") i++;
          factory[lastIndex] += '<FieldRef Name="' + lastField + '" /><Value Type="Boolean">' + (letter.toLowerCase() === "t" ? 1 : 0) + '</Value>';
          lastField = "";
          factory[lastIndex] += closeTag;
          closeTag = ""; // concat with the first index

          if (lastIndex > 0) {
            if (closeOperator != "") factory[0] = "<" + closeOperator + ">" + factory[0];
            factory[0] += factory[lastIndex];
            if (closeOperator != "") factory[0] += "</" + closeOperator + ">";
            delete factory[lastIndex];
            closeOperator = "";
          }
        }
    }
  }

  return factory.join("");
}

module.exports = exports.default;