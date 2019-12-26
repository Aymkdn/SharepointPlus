import $SP from './main.js';
export default function spInit(params) {
  var sp = new $SP();
  sp.init(params);
  return function () {
    return sp;
  };
}