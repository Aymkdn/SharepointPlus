"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js-stable/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.default = getPeopleLookup;

var _forEach = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/for-each"));

var _map = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/map"));

/**
  @name $SP().getPeopleLookup
  @function
  @category utils
  @description When returning a people field from a list using 'expandUserField' to true, then this utility function will split into more friendly pieces
  @param {String} str The string to split
  @return {Object|Array} An object (or array of objects) with 'id', 'name', 'username', 'email'
  @example
  $SP().getPeopleLookup("42;#Doe,, John,#i:0#.w|domain\John_Doe,#John_Doe@Domain.com,#John_Doe@Domain.com,#Doe,, John"); // --> {id:"42", name:"Doe, John", username:'i:0#.w|domain\John_Doe', email:'John_Doe@Domain.com'}
  $SP().getPeopleLookup("42;#Doe,, John,#i:0#.w|domain\John_Doe,#John_Doe@Domain.com,#John_Doe@Domain.com,#Doe,, John;#1981;#Doe,, Jane,#i:0#.w|domain\Jane_Doe,#Jane_Doe@Domain.com,#Jane_Doe@Domain.com,#Doe,, Jane"); // --> [ {id:"42", name:"Doe, John", username:'i:0#.w|domain\John_Doe', email:'John_Doe@Domain.com'}, {id:"1981", name:"Doe, Jane", username:'i:0#.w|domain\Jane_Doe', email:'Jane_Doe@Domain.com'} ]
*/
function getPeopleLookup(str) {
  if (!str) return {
    id: '',
    name: '',
    username: '',
    email: ''
  }; // check if we have several people

  var splt = str.split(";#");
  var res = [];

  for (var i = 0; i < splt.length; i += 2) {
    res.push(splt[i] + ";#" + splt[i + 1]);
  }

  res = (0, _map.default)(res).call(res, function (str) {
    var _context;

    var ret = {
      id: '',
      name: '',
      username: '',
      email: ''
    };
    (0, _forEach.default)(_context = str.split(',#')).call(_context, function (s, i) {
      switch (i) {
        case 0:
          {
            var idu = s.split(";#");
            ret.id = idu[0];
            ret.name = idu[1].replace(/,,/g, ",");
            break;
          }

        case 1:
          {
            ret.username = s;
            break;
          }

        case 2:
          {
            ret.email = s;
            break;
          }

        case 4:
          {
            ret.name = s.replace(/,,/g, ",");
            break;
          }
      }
    });
    return ret;
  });
  return res.length === 1 ? res[0] : res;
}

module.exports = exports.default;