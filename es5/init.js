import $SP from './main.js';
export default function spInit(params) {
  return function () {
    var sp = new $SP();
    sp.init(params);
    return sp;
  };
}