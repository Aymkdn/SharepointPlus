import $SP from './main.js'
export default function spInit (params) {
  let sp = new $SP();
  sp.init(params);
  return () => sp;
}
