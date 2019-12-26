import add from '../lists/add.js'

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
export default async function createFolder(folderPath) {
  try {
    if (typeof folderPath === "undefined") throw "[SharepointPlus 'createFolder']: the folder path is required.";
    // split the path based on '/'
    // eslint-disable-next-line
    let path=folderPath.replace(/[\*\?\|:"'<>#{}%~&]/g,"").replace(/^[\. ]+|[\. ]+$/g,"").replace(/ {2,}/g," ").replace(/\.{2,}/g,"."), toAdd=[], tmpPath="", i;
    // trim "/" at the beginning and end
    if (path.charAt(0)==="/") path=path.slice(1);
    if (path.slice(-1)==="/") path=path.slice(0,-1);
    path=path.split('/');
    for (i=0; i<path.length; i++) {
      tmpPath += (i>0?'/':'') + path[i];
      toAdd.push({FSObjType:1, BaseName:tmpPath})
    }
    let rows = await add.call(this, toAdd);

    // remove first and last "/" for folderPath
    if (folderPath.charAt(0)==="/") folderPath=folderPath.slice(1);
    if (folderPath.slice(-1)==="/") folderPath=folderPath.slice(0,-1);
    // check if our final folder has been correctly created
    for (let i=rows.passed.length; i--;) {
      if (rows.passed[i].BaseName === folderPath) {
        return Promise.resolve(rows.passed[i]);
      }
    }
    for (i=rows.failed.length; i--;) {
      if (rows.failed[i].BaseName === folderPath) {
        if (rows.failed[i].errorMessage.indexOf('0x8107090d') > -1) { // duplicate folder
          rows.failed[i].errorMessage="Folder '"+rows.failed[i].BaseName+"' already exists.";
          return Promise.reject(rows.failed[i]);
        } else {
          return Promise.resolve(rows.failed[i].errorMessage);
        }
      }
    }
    return Promise.reject("Unknown error");
  } catch(err) {
    return Promise.reject(err);
  }
}
