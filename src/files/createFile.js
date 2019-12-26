import ajax from '../utils/ajax.js'
import hasREST from '../utils/hasREST.js'
import info from '../lists/info.js'
import update from '../lists/update.js'
import arrayBufferToBase64 from '../utils/arrayBufferToBase64.js'
import _buildBodyForSOAP from '../lists/_buildBodyForSOAP.js'
import cloneObject from '../utils/cloneObject.js'

/**
  @name $SP().list.createFile
  @function
  @category files
  @description Create/Upload a file into a Document library

  @param {Object} setup Options (see below)
    @param {ArrayBuffer|String} setup.content The file content
    @param {String} setup.filename The relative path (within the document library) to the file to create
    @param {Object} [setup.fields] If you want to set some fields for the created document
    @param {Function} [setup.progress=function(percentage){}] The upload progress in percentage
    @param {Function} [setup.getXHR=function(xhr){}] To manipulate the XMLHttpRequest object used during the upload
  @return {Promise} resolve(object that represents the file), reject(error)

  @example
  $SP().list("Documents", "http://my.other.site/website/").createFile({
    content:"*ArrayBuffer*",
    filename:"Demo/HelloWorld.txt"
  }).then(function(file) {
    console.log(file.Url+" has been created")
    // and to get more info, like the ID, you can do:
    $SP().ajax({url:file.AllFieldsUrl}).then(function(body) {
      console.log(body.d)
    })
  }, function(error) {
    console.log("Error: ",error)
  })

  // create a text document with some fields
  $SP().list("Shared Documents").createFile({
    content:"ArrayBuffer*",
    filename:"SubFolder/myfile.txt",
    fields:{
      "Title":"My Document",
      "File_x0020_Description":"This is my file!"
    }
  }).then(function(file) {
    alert("File "+file.Name+" created at " + file.Url);
  });

  // use onprogress and abort
  $SP().list("Documents").createFile({
    content:"*ArrayBuffer*",
    filename:"BigFile.iso",
    progress:function(perc) {
      console.log("percentage of progress => ",perc)
    },
    getXHR:function(xhr) {
      // automtically abort after 3 seconds
      setTimeout(function() {
        xhr.abort()
      }, 3000)
    }
  }).then(function(file) {
    console.log(file.Url+" has been created")
  }, function(error) {
    console.log("Error: ",error)
  })

  // example with a input[type="file"]
  // &lt;input type="file" id="file_to_upload"> &lt;button type="button" onclick="_uploadFile()">Upload&lt;/button>
  function _uploadFile() {
    var files;
    // retrive file from INPUT
    files = document.querySelector('#file_to_upload').files;
    if (!files || files.length === 0) {
      alert("ERROR: Select a file");
      return;
    }
    files = Array.prototype.slice.call(files);
    // read the files
    Promise.all(files.map(function(file) {
      return new Promise(function(prom_res, prom_rej) {
        // use fileReader
        var fileReader = new FileReader();
        fileReader.onloadend = function(e) {
          file.content = e.target.result;
          prom_res(file);
        }
        fileReader.onerror = function(e) {
          prom_rej(e.target.error);
        }
        fileReader.readAsArrayBuffer(file);
      })
    })).then(function(files) {
      // upload files
      return Promise.all(files.map(function(file) {
        return $SP().list("SharepointPlusLibrary").createFile({
          content:file.content,
          filename:file.name,
          progress:function(perc) {
            console.log("Progress => ",perc+"%")
          }
        })
      }))
    })
  }

  // if you want to add some headers, for example for authentication method
  $SP().list("SharepointPlusLibrary").createFile({
    content:file.content,
    filename:file.name,
    getXHR:function(xhr) {
      xhr.setRequestHeader('Authorization','Bearer XYZ')
    }
  })

  // NOTE: in some cases the files are automatically checked out, so you have to use $SP().checkin()
*/
export default async function createFile(setup) {
  // default values
  setup = setup || {};
  try {
    if (typeof setup.content === "undefined") throw "[SharepointPlus 'createFile']: the file content is required.";
    if (typeof setup.filename === "undefined") throw "[SharepointPlus 'createFile']: the filename is required.";
    if (!this.listID) throw "[SharepointPlus 'createFile']: the library name is required.";
    if (!this.url) throw "[SharepointPlus 'createFile']: not able to find the URL!"; // we cannot determine the url
    setup.extendedFields = setup.extendedFields || "";
    setup.progress=setup.progress||function(){};
    setup.getXHR=setup.getXHR||function(){};

    // we need to find the RootFolder for the list
    let file = {};
    let infos = await info.call(this);
    let rootFolder = infos._List.RootFolder;
    let folder = setup.filename.split("/");
    let filename = setup.filename;
    if (folder.length > 1) {
      filename=folder.slice(-1)[0];
      folder="/"+folder.slice(0,-1).join("/");
    }
    else folder="";
    folder = rootFolder+folder;

    // to avoid invalid characters
    // see http://www.simplyaprogrammer.com/2008/05/importing-files-into-sharepoint.html
    // eslint-disable-next-line
    let _filename = filename.replace(/[\*\?\|:"'<>#{}%~&]/g,"").replace(/^[\. ]+|[\. ]+$/g,"").replace(/ {2,}/g," ").replace(/\.{2,}/g,".");
    if (_filename.length>=128) {
      _filename = _filename.slice(0,115)+'__'+_filename.slice(-8);
    }

    // we now decide what to do based on if we have REST
    // if no, then relay on Copy Web Service
    let hasRest = await hasREST.call(this);
    if (!hasRest) {
      // use Copy Web Service
      // if we have setup.fields, then we need to figure out the Type using $SP().list().info()
      if (setup.fields && !setup.extendedFields) {
        let fields = await info.call(this);
        // we use extendedFields to define the Type
        for (let i=fields.length; i--;) {
          if (setup.fields[fields[i]["StaticName"]]) {
            setup.extendedFields += '<FieldInformation Type="'+fields[i]["Type"]+'" Value="'+setup.fields[fields[i]["StaticName"]]+'" DisplayName="'+fields[i]["StaticName"]+'" InternalName="'+fields[i]["StaticName"]+'" />'
          }
        }
        if (!setup.extendedFields) delete setup.fields;
        return createFile.call(this, setup);
      }

      let destination = "/" + folder + "/" + _filename;
      destination = (this.url + destination).replace(/([^:]\/)\//g,"$1");
      if (destination.slice(0,4) !== "http") destination=window.location.protocol + "//" + window.location.host + destination;
      setup.content=arrayBufferToBase64(setup.content); // ArrayBuffer to Base64 String
      let soapEnv = "<SourceUrl>http://null</SourceUrl>"
                    +"<DestinationUrls><string>"+destination+"</string></DestinationUrls>"
                    +'<Fields><FieldInformation Type="File" />'+setup.extendedFields+'</Fields>'
                    +"<Stream>"+setup.content+"</Stream>"
      soapEnv = _buildBodyForSOAP("CopyIntoItems", soapEnv);

      let data = await ajax.call(this, {
        url: this.url + "/_vti_bin/copy.asmx",
        body: soapEnv,
        onprogress:function(evt) {
          if (evt.lengthComputable) {
            setup.progress(parseInt(evt.loaded / evt.total * 100));
          }
        },
        getXHR:setup.getXHR,
        headers:{'SOAPAction':'http://schemas.microsoft.com/sharepoint/soap/CopyIntoItems'}
      });

      let a = data.getElementsByTagName('CopyResult');
      a = (a.length>0 ? a[0] : null);
      if (a && a.getAttribute("ErrorCode") !== "Success") {
        return Promise.reject("[SharepointPlus 'createFile'] Error creating ("+destination+"): "+a.getAttribute("ErrorCode")+" - "+a.getAttribute("ErrorMessage"));
      } else {
        return Promise.resolve({Url:destination, Name:setup.filename});
      }
    } else {
      // use REST API
      let urlCall = this.url+"/_api/web/GetFolderByServerRelativeUrl('"+encodeURIComponent(folder)+"')/files/add(url='"+encodeURIComponent(_filename)+"',overwrite=true)";
      // the URL must not be longer than 20 characters
      // The browsers could crash if we try to use send() with a large ArrayBuffer (https://stackoverflow.com/questions/46297625/large-arraybuffer-crashes-with-xmlhttprequest-send)
      // so I convert ArrayBuffer into a Blob
      // note: we cannot use startUpload/continueUpload/finishUpload because it's only available for Sharepoint Online
      if (typeof Blob !== "undefined") setup.content = new Blob([setup.content]);
      let body = await ajax.call(this, {
        url: urlCall,
        body: setup.content,
        onprogress:function(evt) {
          if (evt.lengthComputable) {
            setup.progress(parseInt(evt.loaded / evt.total * 100));
          }
        },
        getXHR:setup.getXHR
      });

      // retrieve the full path
      cloneObject(true, file, body.d);
      file.Url=file.__metadata.uri.split("/").slice(0,3).join("/")+body.d.ServerRelativeUrl;
      file.AllFieldsUrl=body.d.ListItemAllFields.__deferred.uri;
      // if we want to update some fields
      if (setup.fields) {
        // using "ListItemAllFields.__deferred.uri" we can find the URL to get details about the uploaded file
        body = await ajax.call(this, {url:file.AllFieldsUrl});
        cloneObject(true, file, body.d);
        let params={ID:file.ID};
        cloneObject(params, setup.fields);
        let items = await update.call(this, params);

        if (items.failed.length>0) {
          return Promise.reject("File '"+file.Url+"' added, but fields not updated: "+items.failed[0].errorMessage)
        } else {
          items=items.passed[0];
          for (let attr in items) {
            file[attr]=items[attr];
          }
          return Promise.resolve(file)
        }
      } else {
        return Promise.resolve(file)
      }
    }
  } catch(err) {
    return Promise.reject(err);
  }
}
