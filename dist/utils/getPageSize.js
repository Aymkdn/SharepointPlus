"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js-stable/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports["default"] = getPageSize;

/**
  @name $SP().getPageSize
  @function
  @category utils
  @description Get the doc and viewport size (source: https://blog.kodono.info/wordpress/2015/03/23/get-window-viewport-document-height-and-width-javascript/)
 */
function getPageSize(win) {
  var vw = {
    width: 0,
    height: 0
  };
  var doc = {
    width: 0,
    height: 0
  };
  var w = win || window,
      d = w.document,
      dde = d.documentElement,
      db = d.querySelector('body'); // viewport size

  vw.width = w.innerWidth || dde.clientWidth || db.clientWidth;
  vw.height = w.innerHeight || dde.clientHeight || db.clientHeight; // document size

  doc.width = Math.max(db.scrollWidth, dde.scrollWidth, db.offsetWidth, dde.offsetWidth, db.clientWidth, dde.clientWidth);
  doc.height = Math.max(db.scrollHeight, dde.scrollHeight, db.offsetHeight, dde.offsetHeight, db.clientHeight, dde.clientHeight); // if IE8 there is a bug with 4px

  if (!!(document.all && document.querySelector && !document.addEventListener) && vw.width + 4 == doc.width && vw.height + 4 == doc.height) {
    vw.width = doc.width;
    vw.height = doc.height;
  }

  return {
    vw: vw,
    doc: doc
  };
}

module.exports = exports.default;