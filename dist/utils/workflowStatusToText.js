"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js-stable/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports["default"] = workflowStatusToText;

/**
  @name $SP().workflowStatusToText
  @function
  @category utils
  @description Return the text related to a workflow status code

  @param {String|Number} code This is the code returned by a workflow

  @example
  $SP().workflowStatusToText(2); // -> "In Progress"
 */
function workflowStatusToText(code) {
  code = code * 1;

  switch (code) {
    case 0:
      return "Not Started";

    case 1:
      return "Failed On Start";

    case 2:
      return "In Progress";

    case 3:
      return "Error Occurred";

    case 4:
      return "Stopped By User";

    case 5:
      return "Completed";

    case 6:
      return "Failed On Start Retrying";

    case 7:
      return "Error Occurred Retrying";

    case 8:
      return "View Query Overflow";

    case 15:
      return "Canceled";

    case 16:
      return "Approved";

    case 17:
      return "Rejected";

    default:
      return "Unknown";
  }
}

module.exports = exports.default;