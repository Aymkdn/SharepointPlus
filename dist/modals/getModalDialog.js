"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js-stable/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports["default"] = getModalDialog;

/**
 * @name $SP().getModalDialog
 * @function
 * @category modals
 * @description Retrieve the modal object for a special modalDialog
 *
 * @param {String} id The ID of the modal
 * @return {Object} The modal object or NULL if the modal doesnt exist
 *
 * @example
 * var modal = $SP().getModalDialog("MyModal");
 * $SP().closeModalDialog(modal);
 */
function getModalDialog(id) {
  if (typeof window.top._SP_MODALDIALOG !== "undefined") {
    var md = window.top._SP_MODALDIALOG;
    id = id.replace(/\W+/g, "");

    for (var i = 0; i < md.length; i++) {
      if (md[i].id === "sp_frame_" + id) {
        return md[i];
      }
    }
  }

  return null;
}

module.exports = exports.default;