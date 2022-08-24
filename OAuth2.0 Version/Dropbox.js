/**
 * This function is executed every time when files are need to be sent to Dropbox. 
 * 
 * Using the refresh_token (long-lived) saved in the script properties that you 
 * grabbed onnce while setting up the automation, it will request for an access_token
 * 
 * Using the access_token we will later make api calls to send files to Dropbox
 *
 * It mimics the following curl request mentioned in dropbox OAuth2.0 documentation: 
 * 
 * curl https://api.dropbox.com/oauth2/token \
    -d grant_type=refresh_token \
    -d refresh_token=<YOUR_REFRESH_TOKEN> \
    -u <YOUR_APP_KEY>:<YOUR_APP_SECRET> 
 */

function grabAccessToken() {
    let endpoint, refreshToken, scriptProperties, response, accessToken;

    // The OAuth2.0 token generation endpoint that accepts "POST" request with pre-defined parameters
    endpoint = "https://api.dropbox.com/oauth2/token";
    // Grab a handle to the script properties, for current script and grab the "REFRESH_TOKEN" value 
    scriptProperties = PropertiesService.getScriptProperties();
    refreshToken = scriptProperties.getProperty('REFRESH_TOKEN');

    // Make an HTTP POST Request to the above-mentioned endpoint, with a the long-lived refresh-token 
    // from script properties, app key and secret.
    response = UrlFetchApp.fetch(endpoint, {
        method: 'POST',
        muteHttpExceptions: true,

        payload: {
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
            client_id: APP_KEY,
            client_secret: APP_SECRET
        },
    });

    // If the request was successfull then grab short-lived access_token from response, save it in 
    // script properties as "ACCESS_TOKEN" key and return green flag
    if (response.getResponseCode() == 200) {
        accessToken = JSON.parse(response.getContentText()).access_token;
        scriptProperties.setProperty('ACCESS_TOKEN', accessToken);
        return true;
    }

    // Otherwise, return red flag that will halt the automation notify user by email
    return [false, undefined];
}


/**
 * This function sends one Google Drive file to a Dropbox folder at a time, it takes the file id and dropbox access_token
 * as argument. 
 * 
 * The rest of constants refered here are set in the consts.gs.
 */
function uploadGoogleFilesToDropbox(googleDriveFileId, accessToken) {
    let driveFile, parameters, headers, options, endpoint, response;

    // Grab the Google Drive file by it's id, if the id is sent here it's ensured that the file exists
    driveFile = DriveApp.getFileById(googleDriveFileId);

    // File add endpoint of dropbox developers content api, is used later to send files through http post request
    endpoint = 'https://content.dropboxapi.com/2/files/upload';

    // Dropbox parameters that will be sent in the post request to above mentioned endpoint
    parameters = {
        path: `${DROPBOX_FOLDER_PATH}/${driveFile.getName()}`,
        mode: 'add',
        autorename: true,
        mute: false,
    };

    // headers obejct for the post request to above-mentioned endpoint
    headers = {
        'Content-Type': 'application/octet-stream',
        'Authorization': 'Bearer ' + accessToken,
        'Dropbox-API-Arg': JSON.stringify(parameters),
    };

    // The URLFetchAPP option object, it indicates the request type, holds payload and headers information
    options = {
        method: 'POST',
        headers: headers,
        payload: driveFile.getBlob().getBytes(),
    };

    // make an add file request to the endpoint with required parameters.
    response = UrlFetchApp.fetch(endpoint, options);

    if (response.getResponseCode() == 200) Logger.log('File uploaded successfully to Dropbox');
}