function sendToDropbox(propertyKey) {
  const scriptProperties = PropertiesService.getScriptProperties();
  let content = scriptProperties.getProperty(propertyKey);
  let status, extractedId; 

  if (content){
    content = content.split(",");
    content = content.slice(0, content.length-1);
    content.forEach((id) => {
      extractedId = id.split(":")[0];
      status = id.split(":")[1];
      if (status == "PENDING") uploadGoogleFilesToDropbox(extractedId);
      else Logger.log(status);
    });
  }
}

function uploadGoogleFilesToDropbox(googleDriveFileId) {
  let driveFile = DriveApp.getFileById(googleDriveFileId);

  let parameters = {
    path: `${DROPBOX_FOLDER_PATH}/${driveFile.getName()}`,
    mode: 'add',
    autorename: true,
    mute: false,
  };

  let headers = {
    'Content-Type': 'application/octet-stream',
    'Authorization': 'Bearer ' + DROPBOX_ACCESS_TOKEN,
    'Dropbox-API-Arg': JSON.stringify(parameters),
  };


  let options = {
    method: 'POST',
    headers: headers,
    payload: driveFile.getBlob().getBytes(),
    // muteHttpExceptions: true,
  };

  var apiUrl = 'https://content.dropboxapi.com/2/files/upload';
  var response = JSON.parse(UrlFetchApp.fetch(apiUrl, options).getContentText());

  Logger.log(response)
  Logger.log('File uploaded successfully to Dropbox');
}