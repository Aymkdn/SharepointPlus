"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js-stable/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.default = waitModalDialog;

var _showModalDialog = _interopRequireDefault(require("./showModalDialog.js"));

/**
 * @name $SP().waitModalDialog
 * @function
 * @category modals
 * @description Shortcut for SP.UI.ModalDialog.showWaitScreenWithNoClose()
 *
 * @param {String} [title="Working on it..."] The main message with the loading spin for SP2013, or the modal window title for SP2010
 * @param {String} [subtitle=""] The subtitle for SP2013, or the main message with the loading spin for SP2010
 * @param {Number} [height] The modal height
 * @param {Number} [width] The modal width
 */
function waitModalDialog(title, subtitle, height, width) {
  return _showModalDialog.default.call(this, {
    wait: true,
    title: title || "Working...",
    message: subtitle,
    width: width,
    height: height
  });
}

module.exports = exports.default;