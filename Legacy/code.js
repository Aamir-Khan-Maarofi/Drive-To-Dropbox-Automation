/**
 * Function that handles the main operation for the application
 */
function mainFunction() {
  // Get the file ids constraiend on file type, an array of id and status (e.g FILEID:STATUS)
  const arr = getNewFileIds(GOOGLE_DRIVE_FOLDER_ID);
  
  // Update the ids array with current ids and removes any previous ids that do not exist now
  updateFilesTracker(FILE_TYPE, arr);
  // After the ids and status are updated in the script properties, send pending files to dropbox
  sendToDropbox(FILE_TYPE);
}

function updateFilesTracker(propertyKey, propertyValue) {
  const scriptProperties = PropertiesService.getScriptProperties();
  const oldContent = scriptProperties.getProperty(propertyKey);
  let newContent = '';

  // If there is an existing value in old content 
  if (oldContent) {

    // iterate through all updated ids and uppdate their status
    propertyValue.forEach((id) => {
      // if the current file id is found in old content, then it's already sent
      if (oldContent.indexOf(id) != -1) {
        newContent += `${id}:SENT,`;
      }
      // if current file id do not exist in old content then it's new file, 
      // add this one with the pending status to new content
      else {
        newContent += `${id}:PENDING,`;
      }
    });
  }
  else {
    propertyValue.forEach((id) => { newContent += `${id}:PENDING,`});
  }

  scriptProperties.setProperty(propertyKey, newContent);
}

function getNewFileIds(folderID) {
  const theFolder = DriveApp.getFolderById(folderID);
  const files = theFolder.getFiles();
  let arr = [];

  while (files.hasNext()) {
    let file = files.next();
    if (file.getMimeType() == FILE_TYPE) arr.push(file.getId());
  };

  return arr;
}

