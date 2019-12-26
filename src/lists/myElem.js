/**
 * @ignore
 * @description we need to extend an element for some cases with $SP().get
 **/
export default class {
  constructor(elem) {
    this.mynode = elem;
    this.singleList = true;
  }

  getAttribute (id) {
    return this.mynode.getAttribute("ows_"+id.replace(/ /g,""));
  }

  getAttributes () {
    return this.mynode.attributes;
  }
}
