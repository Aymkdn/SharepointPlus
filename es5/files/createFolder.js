import _regeneratorRuntime from "@babel/runtime-corejs3/regenerator";
import _indexOfInstanceProperty from "@babel/runtime-corejs3/core-js-stable/instance/index-of";
import _Promise from "@babel/runtime-corejs3/core-js-stable/promise";
import _sliceInstanceProperty from "@babel/runtime-corejs3/core-js-stable/instance/slice";
import _asyncToGenerator from "@babel/runtime-corejs3/helpers/esm/asyncToGenerator";
import add from '../lists/add.js';
/**
  @name $SP().list.createFolder
  @function
  @category files
  @description Create a folter in a Document library

  @param {String} path The relative path to the new folder
  @return {Promise} resolve({BaseName,ID,FSObjType}), reject(error)

  @example
  // create a folder called "first" at the root of the Shared Documents library
  // the result should be "http://mysite/Shared Documents/first/"
  // if the folder already exists, it returns a resolved Promise but with an errorMessage included
  $SP().list("Shared Documents").createFolder("first").then(function(folder) { alert("Folder created!"); })

  // create a folder called "second" under "first"
  // the result should be "http://mysite/Shared Documents/first/second/"
  // if "first" doesn't exist then it's automatically created
  $SP().list("Documents").createFolder("first/second").then(function(folder) { alert("Folder created!"); }

  // Note: To delete a folder you can use $SP().list().remove() with ID and FileRef parameters
*/

export default function createFolder(_x) {
  return _createFolder.apply(this, arguments);
}

function _createFolder() {
  _createFolder = _asyncToGenerator(
  /*#__PURE__*/
  _regeneratorRuntime.mark(function _callee(folderPath) {
    var path, toAdd, tmpPath, i, rows, _i, _context;

    return _regeneratorRuntime.wrap(function _callee$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.prev = 0;

            if (!(typeof folderPath === "undefined")) {
              _context2.next = 3;
              break;
            }

            throw "[SharepointPlus 'createFolder']: the folder path is required.";

          case 3:
            // split the path based on '/'
            // eslint-disable-next-line
            path = folderPath.replace(/[\*\?\|:"'<>#{}%~&]/g, "").replace(/^[\. ]+|[\. ]+$/g, "").replace(/ {2,}/g, " ").replace(/\.{2,}/g, "."), toAdd = [], tmpPath = ""; // trim "/" at the beginning and end

            if (path.charAt(0) === "/") path = _sliceInstanceProperty(path).call(path, 1);
            if (_sliceInstanceProperty(path).call(path, -1) === "/") path = _sliceInstanceProperty(path).call(path, 0, -1);
            path = path.split('/');

            for (i = 0; i < path.length; i++) {
              tmpPath += (i > 0 ? '/' : '') + path[i];
              toAdd.push({
                FSObjType: 1,
                BaseName: tmpPath
              });
            }

            _context2.next = 10;
            return add.call(this, toAdd);

          case 10:
            rows = _context2.sent;
            // remove first and last "/" for folderPath
            if (folderPath.charAt(0) === "/") folderPath = _sliceInstanceProperty(folderPath).call(folderPath, 1);
            if (_sliceInstanceProperty(folderPath).call(folderPath, -1) === "/") folderPath = _sliceInstanceProperty(folderPath).call(folderPath, 0, -1); // check if our final folder has been correctly created

            _i = rows.passed.length;

          case 14:
            if (!_i--) {
              _context2.next = 19;
              break;
            }

            if (!(rows.passed[_i].BaseName === folderPath)) {
              _context2.next = 17;
              break;
            }

            return _context2.abrupt("return", _Promise.resolve(rows.passed[_i]));

          case 17:
            _context2.next = 14;
            break;

          case 19:
            i = rows.failed.length;

          case 20:
            if (!i--) {
              _context2.next = 30;
              break;
            }

            if (!(rows.failed[i].BaseName === folderPath)) {
              _context2.next = 28;
              break;
            }

            if (!(_indexOfInstanceProperty(_context = rows.failed[i].errorMessage).call(_context, '0x8107090d') > -1)) {
              _context2.next = 27;
              break;
            }

            // duplicate folder
            rows.failed[i].errorMessage = "Folder '" + rows.failed[i].BaseName + "' already exists.";
            return _context2.abrupt("return", _Promise.reject(rows.failed[i]));

          case 27:
            return _context2.abrupt("return", _Promise.resolve(rows.failed[i].errorMessage));

          case 28:
            _context2.next = 20;
            break;

          case 30:
            return _context2.abrupt("return", _Promise.reject("Unknown error"));

          case 33:
            _context2.prev = 33;
            _context2.t0 = _context2["catch"](0);
            return _context2.abrupt("return", _Promise.reject(_context2.t0));

          case 36:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee, this, [[0, 33]]);
  }));
  return _createFolder.apply(this, arguments);
}