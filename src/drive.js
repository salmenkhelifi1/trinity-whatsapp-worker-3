// 📁 src/drive.js
const { google } = require('googleapis');
const fs = require('fs');

const auth = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

auth.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });

const drive = google.drive({ version: 'v3', auth });

async function uploadFileToDrive(filePath, fileName) {
  const fileMetadata = { name: fileName };
  const media = {
    mimeType: 'text/plain',
    body: fs.createReadStream(filePath)
  };

  const response = await drive.files.create({
    resource: fileMetadata,
    media: media,
    fields: 'id'
  });

  return response.data.id;
}

module.exports = { uploadFileToDrive };
