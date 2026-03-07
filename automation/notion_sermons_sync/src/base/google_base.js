import { google } from 'googleapis';
import { authenticate } from '@google-cloud/local-auth';
import { filePath, readFileAsJson, writeJsonToFile } from './fs_utils.js';

// If modifying these scopes, delete token.json.
const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.metadata.readonly',
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/drive.photos.readonly',
  // 'https://www.googleapis.com/auth/photoslibrary.readonly'
];
const TOKEN_FILE = 'token.json';
const CREDENTIALS_FILE = 'credentials.json';
const SERVICE_ACCOUNT_FILE = 'service-account.json';

/**
 * Reads previously authorized credentials from the save file.
 *
 * @return {Promise<OAuth2Client|null>}
 */
async function loadSavedCredentialsIfExist() {
  try {
    // The file token.json stores the user's access and refresh tokens, and is
    // created automatically when the authorization flow completes for the first
    // time.
    const credentials = await readFileAsJson(TOKEN_FILE);
    return google.auth.fromJSON(credentials);
  } catch {
    return null;
  }
}

/**
 * Serializes credentials to a file compatible with GoogleAuth.fromJSON.
 *
 * @param {OAuth2Client} client
 * @return {Promise<void>}
 */
async function saveCredentials(client) {
  const keys = await readFileAsJson(CREDENTIALS_FILE);
  const key = keys.installed || keys.web;
  const json = {
    type: 'authorized_user',
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  };
  await writeJsonToFile(json, TOKEN_FILE);
}

/**
 * Load or request or authorization to call APIs.
 *
 */
async function authorize() {
  let client = await loadSavedCredentialsIfExist();
  if (client) {
    return client;
  }
  client = await authenticate({
    scopes: SCOPES,
    keyfilePath: filePath(CREDENTIALS_FILE),
  });
  if (client.credentials) {
    await saveCredentials(client);
  }
  return client;
}

/**
 * Authorize using a service account key file.
 * Used for Sheets/Drive access (all functions except photos).
 */
async function authorizeServiceAccount() {
  const auth = new google.auth.GoogleAuth({
    keyFile: filePath(SERVICE_ACCOUNT_FILE),
    scopes: SCOPES,
  });
  return auth.getClient();
}

export default {
  authorize,
  authorizeServiceAccount
}
