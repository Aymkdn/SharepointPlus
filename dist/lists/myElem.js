"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js-stable/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.default = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/createClass"));

/**
 * @ignore
 * @description we need to extend an element for some cases with $SP().get
 **/
var _default =
/*#__PURE__*/
function () {
  function _default(elem) {
    (0, _classCallCheck2.default)(this, _default);
    this.mynode = elem;
    this.singleList = true;
  }

  (0, _createClass2.default)(_default, [{
    key: "getAttribute",
    value: function getAttribute(id) {
      return this.mynode.getAttribute("ows_" + id.replace(/ /g, ""));
    }
  }, {
    key: "getAttributes",
    value: function getAttributes() {
      return this.mynode.attributes;
    }
  }]);
  return _default;
}();

exports.default = _default;
module.exports = exports.default;