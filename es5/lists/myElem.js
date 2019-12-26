import _classCallCheck from "@babel/runtime-corejs3/helpers/esm/classCallCheck";
import _createClass from "@babel/runtime-corejs3/helpers/esm/createClass";

/**
 * @ignore
 * @description we need to extend an element for some cases with $SP().get
 **/
var _default =
/*#__PURE__*/
function () {
  function _default(elem) {
    _classCallCheck(this, _default);

    this.mynode = elem;
    this.singleList = true;
  }

  _createClass(_default, [{
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

export { _default as default };