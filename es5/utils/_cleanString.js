/**
 * @ignore
 */
export default function _cleanString(str) {
  return str.replace(/&(?!amp;|lt;|gt;)/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}