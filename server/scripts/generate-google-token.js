const { google } = require('googleapis');
const readline = require('readline');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const SCOPES = ['https://www.googleapis.com/auth/contacts'];

async function main() {
  const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
  const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
  
  if (!CLIENT_ID || !CLIENT_SECRET) {
    console.error('❌ GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set in your server/.env file');
    process.exit(1);
  }

  // We use urn:ietf:wg:oauth:2.0:oob for desktop apps to get the code via copy/paste
  const oAuth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    'https://developers.google.com/oauthplayground' 
  );

  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent' // Forces consent to ensure a refresh token is returned
  });

  console.log('Authorize this app by visiting this url:', authUrl);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question('Enter the code from that page here: ', async (code) => {
    rl.close();
    try {
      const { tokens } = await oAuth2Client.getToken(code);
      console.log('\n✅ Successfully authenticated!');
      console.log('--------------------------------------------------');
      console.log('YOUR REFRESH TOKEN IS:');
      console.log(tokens.refresh_token);
      console.log('--------------------------------------------------');
      console.log('Please add this to your server/.env file as:');
      console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`);
    } catch (err) {
      console.error('❌ Error retrieving access token', err);
    }
  });
}

main();
