/**
 * SETUP ON GOOGLE DRIVE SIDE
 * 
 * Add the MimeType for the files in FILE_TYPE that you want the script to consider, this is currently set for PDFs only
 * Add your Google Drive Folder Id in GD_FOLDER_ID, this is the folder where new files are being tracked
 */
const FILE_TYPE = 'application/pdf';
const GD_FOLDER_ID = 'YOUR-DRIVE-FOLDER-ID';

/**
 * Create a DROPBOX APP From the APP Console by following this URL:
 * https://www.dropbox.com/developers/apps
 * 
 * Define the scope of your application (it may have folder access or complete dropbox access). I recommend completed 
 * Dropbox access so you won't need to create app for each automation/folder on Google Drive. 
 * 
 * Assign the app and directories the required permissions (read/write access from the scope tab on app console)
 */

/**
 * DROPBOX APP KEY AND SECRET SETUP
 * 
 * Update APP_KEY and APP_SECRET with your dropbox app key and app secrets
 */
const APP_KEY = 'YOUR-DROPBOX-APP-ID';
const APP_SECRET = 'YOUR-DROPBOX-APP-SECRET';

/**
 * DROPBOX FOLDER PATH SETUP
 * 
 * If your Dropbox app has access to your whole dropbox then add the folder path here
 * e.g there is "PDF" folder in "AUTOMATED FILES" folder, then path will be "/AUTOMATED FILES/PDF"
 * 
 * If your Dropbox app has access to a specific folder, then leave this empty. The script will 
 * automatically add files in the app folder. 
 */
const DROPBOX_FOLDER_PATH = '';

/**
 * DROPBOX APP OAuth2.0 REDIRECT_URL
 * 
 * You need to have the REDIRECT_URL set up for your Dropbox app, this is mandatory. 
 * To do this add https://www.google.com as your redirect_url, we won't redirect anything to this 
 * url, but it's mandatory for OAuth2.0 authentication and authorization. 
 * 
 * The reason I stick to www.google.com is that it will always be up and running, so minimizing any expected errors
 */
const REDIRECT_URI = 'https://www.google.com';

/**
 * AUTHORIZATION_CODE SETUP (TRICKY & IS ONE-TIME PROCESS)
 * 
 * Here is the trickiest part of the whole automation set up, but I am confident enough that the guide provided below 
 * will be sufficient to help you with this setup. 
 * 
 * WE WILL BE USING THIS URL FOR MANUAL SETUP: 
 * https://www.dropbox.com/oauth2/authorize?client_id=YOUR_APP_KEY&redirect_uri=https://www.google.com&response_type=code&token_access_type=offline
 * 
 * 1. Notice the above mentioned URL, it has YOUR_APP_KEY written as capital. Repalce this with your Dropbox app key
 * 2. Copy the edited URL and past it in address bar in your browser, hit enter, allow and accept all permissions 
 * 3. You will be redirected to www.google.com/?code="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
 * 4. Copy the part after = and between the dobule quotation (the xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx)
 * 5. Paste it here in the AUTHORIZATION_CODE
 * 6. This is valid for about 30 minutes and will expire soon, now navigate to Refresh_Token_Script.gs
 * 7. Run the grabRefreshToken() function and it will grab the refresh_token, will save it for later use
 */

const AUTHORIZATION_CODE = "YOUR-MANUALLY-GENERATED-AUTHORIZATION-CODE";

/**
 * CLAP CLAP, you made it this far. Now you need to set time-driven trigger for your app so the mainFunction in Code.gs will 
 * execute after a certain period of time. It will then look for any changes in the directory, based on file type and previously 
 * stored file ids in the script properties. 
 * 
 * If it notices any change, it will the update the file ids in script properties, will grab access_token automatically and will 
 * send any new files to Dropbox. 
 * 
 * To set the time-driven trigger, do this: 
 * 1. Navigate to the Triggers tab on online Google Apps Script Editor (the clock icon)
 * 2. Click "New Trigger" button at the bottom right cornor of your screen, and you will see the pop-up window appears
 * 3. From "Choose which function to run", select mainFunction
 * 4. From "Choose which deployment should run", select "Head"
 * 5. From "Select event source", select Time-Driven
 * 6. From "Select type of time based trigger", select the one that best suits your needs
 * 7. From "Select minute interval", select the one that best suits your needs
 * 8. From "Failure notification settings", at the right side, select "Notify me immediately"
 * 9. Hit save, allow all permissions if you're prompted with any and the script should be all set now.
 * 
 * Add new PDFs in the directory and you will see them in Dropbox folder after a copule of minutes.
 */