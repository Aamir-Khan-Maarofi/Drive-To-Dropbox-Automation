/**
 * YOU CAN NOT RUN THIS CODE SUCCESSFULLY IF THE AUTHORIZATION_CODE IS OLDER THAN HALF HOUR. 
 * 
 * See AUTHORIZATION_CODE variable in CONSTS.gs file, if you have updated it now, then run 
 * the grabRefreshToken function. If you haven't already generated the AUTHORIZATION_CODE 
 * now and it's older, then this automation will fail. In that case, navigate to CONSTS.gs 
 * and skimm through the instructions provided there. 
 * 
 * Run this script once manually for each folder that you want to set automation for. Please 
 * make sure you notice the success or error messages in the console (execution log).
 * 
 * Just hit the Run button when you are on this file and it will do the rest automatically. 
 * 
 * Once you have manually generated the AUTHORIZATION_CODE from Browser, then run this script
 * It will access your Dropbox app through your APP_KEY, APP_SECRET and AUTHORIZATION_CODE and 
 * will grab the access token (short-lived), refresh token (long-lived), and bunch of other details
 */

/**
 * An example of what happens in the code is demonstrated through the following curl request:
 *  curl https://api.dropbox.com/oauth2/token \
    -d code=<AUTHORIZATION_CODE> \
    -d grant_type=authorization_code \
    -d redirect_uri=<REDIRECT_URI> \
    -u <APP_KEY>:<APP_SECRET>


  Response from the above curl request if successfull looks like this: 
  {
    "uid": "267161268", 
    "access_token": "Your_Access_token", 
    "expires_in": 14399, 
    "token_type": "bearer", 
    "scope": "files.content.read files.metadata.read sharing.read sharing.write", 
    "refresh_token": "LwlUmqpmGqgAAAAAAAAEYgRoVJoei4u9cC7cDHFBAp0Kkp2JNciPxQpNWGY", 
    "account_id": "dbid:AABuTtSGJM0ME3t4m85i1o3XqnmXvwH5I-A"
  }

  */

/**
 * Requests the DROPBOX APP, based on AUTHORIZATION_CODE, APP_KEY, and APP_SECRET
 * Grabs the access_token (short-lived) and refresh_code (long-lived), with bunch of other details
 * The short-lived access_code along with other details is ignored and the 'refresh_token' is saved
 * for later use. 
 * 
 * We will later use the 'refresh_token' to grab access_token, so this script will not be executed 
 * everytime files are sent to Dropbox. Why? To minimize errors and make the app more prone to bugs. 
 */
function grabRefreshToken() {
    let endpoint, scriptProperties, response, refreshToken;

    // The OAuth2.0 token generation endpoint that accepts "POST" request with pre-defined parameters
    endpoint = "https://api.dropbox.com/oauth2/token";
    // Grab a handle to the script properties, for current script. It's used later to store the refresh_token
    scriptProperties = PropertiesService.getScriptProperties();

    // Make an HTTP POST Request to the above-mentioned endpoint, with a payload
    // The payload contains your manually generated access toekn, your redirect_url set in app OAuth2.0 setting, 
    // your app key and secret, and authorization_code grant_type. 
    response = UrlFetchApp.fetch(endpoint, {
        method: 'POST',
        muteHttpExceptions: true,
        payload: {
            code: AUTHORIZATION_CODE,
            grant_type: 'authorization_code',
            redirect_uri: REDIRECT_URI,
            client_id: APP_KEY,
            client_secret: APP_SECRET
        },
    });

    // If the request was successfull then there must be a key 'refresh_token' in resulted JSON Object
    if (response.getResponseCode() == 200) {
        // Grab the refresh_token values, and ignore the rest of information returned by the endpoint
        refreshToken = JSON.parse(response.getContentText()).refresh_token;
        // Set the "REFRESH_TOKEN" property, to be used later for generating access_token when sending files
        scriptProperties.setProperty("REFRESH_TOKEN", refreshToken);

        // Prompt the user with success message and short-circuit the automation from here 
        Logger.log("Successfully acquired the Refresh Token, you can now setup the rest of automation");
        return;
    }

    // If something is not right, the response code, response error and error description will be printed to console
    Logger.log(`Status Code: ${response.getResponseCode()}`);
    Logger.log(`Couldn't grab the Refresh Token, error: ${JSON.parse(response).error}`);
    Logger.log(JSON.parse(response).error_description);
}