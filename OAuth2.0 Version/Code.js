/**
 * Function that handles the main operation for the application
 */
function mainFunction() {
    // Get the file ids constraiend on file type, an array of id and status (e.g FILEID:STATUS)
    const arr = grabFileIds(GD_FOLDER_ID);

    // Update the ids array with current ids and removes any previous ids that do not exist now
    updateFilesTracker(FILE_TYPE, arr);
    // After the ids and status are updated in the script properties, send pending files to dropbox
    sendToDropbox(FILE_TYPE);
}


/**
 * Takes a Google Drive Folder id as argument and grabs all file ids. The resulted files are 
 * dependant on the file type mentioened in consts.gs file, all other file types are ignored
 */
function grabFileIds(folderID) {
    let theFolder, files, arr, file;

    // Open a handle to the drive folder based on its id and grab all the files located there
    theFolder = DriveApp.getFolderById(folderID);
    files = theFolder.getFiles();
    // Initialize an empty array, to be filled later with files that have the mentioned file type
    arr = [];

    // Process files if there are more
    while (files.hasNext()) {
        // Open a handle to the next file to be processed
        file = files.next();
        // If the file type is the one we are looking for, the append its id to the ids array
        if (file.getMimeType() == FILE_TYPE) arr.push(file.getId());
    };

    // Return whatever is there in the file ids array
    return arr;
}

/**
 * Takes a key and value in the arguments, the value is assumed to be a string and the value 
 * is a one-dimentional array of string
 * 
 * The script loads previous value for the key from script properties, compares it to the new
 * value, and then store all valid ids along with their current status as long-string against
 * the same key
 */
function updateFilesTracker(propertyKey, propertyValue) {
    let scriptProperties, oldContent, newContent;

    // Open a handle to the script properties, and grab the old content stroed against the key
    scriptProperties = PropertiesService.getScriptProperties();
    oldContent = scriptProperties.getProperty(propertyKey);
    // Initialize new content to an empty string, is updated later if the file id exist, or is new
    newContent = '';

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

            // Ignore any ids that are in old content but are not found in new, these files may have been deleted
        });
    }
    // If there is not old content against the key, then add all ids with pending status 
    else {
        propertyValue.forEach((id) => { newContent += `${id}:PENDING,` });
    }

    // Update the script property value for the key with new content string 
    scriptProperties.setProperty(propertyKey, newContent);
}

/**
 * Recieves a property key in the arguments, grabs it's value (long-string) from the script properties, 
 * and for each id:status combination in the long-string, it sends the file whom ids have a "PENDING" 
 * status attached to them
 */
function sendToDropbox(propertyKey) {
    let scriptProperties, runCode, accessToken, content, status, extractedId;

    // Try to grab the access_token (short-lived) based on the refresh_token (long-lived)
    runCode = grabAccessToken();
    // If runCode is false, it means the script failed to grab the access_token, hald the automation here
    // and notify user by email, since this script will be running based on time-driven triggers
    if (!runCode) {
        throw `Couldn't grab access_token, sending files to dropbox failed. Something is wrong with refresh_token or authorization code`;
    }

    // Grab an handle to script properties
    scriptProperties = PropertiesService.getScriptProperties();
    // Grab the long-string of file ids, each file id is binded to a status (either PENDING or SENT) through a colon (e.g id:status)
    content = scriptProperties.getProperty(propertyKey);
    // Grab the access token set by grabAccessToken function, if you're here it means the access_token is already updated
    accessToken = scriptProperties.getProperty('ACCESS_TOKEN');

    // If their are files in the current directory, it's insured that content will not be empty (it's a long string of ids and statuses)
    if (content) {
        // Split the long-string by commas to an array of ids:status that will each be processed individually in the loop
        content = content.split(",");
        // Remove the last element of array that is an empty string becuase there is a comma after each id:status string 
        content = content.slice(0, content.length - 1);

        // Iterate through all id:status formatted strings
        content.forEach((id) => {
            // Seperate the id and status that are bined together by colon (:)
            extractedId = id.split(":")[0];
            status = id.split(":")[1];

            // If status  is pending, this  file needs to be sent to dropbox. Initiate file sending request
            if (status == "PENDING") uploadGoogleFilesToDropbox(extractedId, accessToken);
        });
    }
}
