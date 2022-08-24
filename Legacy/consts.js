// ADD YOUR  DROPBOX APP ACCESS_TOKEN HERE
const DROPBOX_ACCESS_TOKEN = '';

// ADD YOUR DROPBOX FOLDER PATH HERE, This depends on the app scope, if the scope is folder then leave it as is
// If the scope is whole Dropbox, then add your folder path, in this case 
// if you have a folder named "DRIVE FILES" on the root, then file path will be '/DRIVE FILES'
// If you have a folder named "PDFs" in "DRIVE FILES" then file path will be '/DRIVE FILES/PDFs'

const DROPBOX_FOLDER_PATH = '';

// YOUR GOOGLE DRIVE FOLDER ID GOES HERE, Where the Files are located

const GOOGLE_DRIVE_FOLDER_ID = '';

// This one is set for PDFs, if you need to process images only then replace 'application/pdf' with 'image/png'

const FILE_TYPE = 'application/pdf';
