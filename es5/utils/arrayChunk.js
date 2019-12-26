import _sliceInstanceProperty from "@babel/runtime-corejs3/core-js-stable/instance/slice";

/**
 * @name arrayChunk
 * @category utils
 * @function
 * @description Permits to cut an array into smaller blocks
 * @param {Array} b The array to split
 * @param {Number} e The size of each block
 * @return {Array} An array that contains several arrays with the required size
 *
 * @example
 * $SP().arrayChunk(["a","b","c","d","e","f","g","h"], 2); -> ["a", "b"], ["c", "d"], ["e", "f"], ["g", "h"]
 */
export default function arrayChunk(b, e) {
  var d = [];

  for (var c = 0, a = b.length; c < a; c += e) {
    d.push(_sliceInstanceProperty(b).call(b, c, c + e));
  }

  return d;
}