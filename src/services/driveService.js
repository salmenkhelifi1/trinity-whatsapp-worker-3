// 📁 src/services/driveService.js

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const { generateAIReply } = require('../services/openaiService');

// Setup Google Drive client
const auth = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);
auth.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });

const drive = google.drive({ version: 'v3', auth });

// Find a file on Drive by name
async function findFileOnDrive(fileName) {
  const res = await drive.files.list({
    q: `name='${fileName}' and trashed=false`,
    fields: 'files(id, name)',
    spaces: 'drive'
  });
  return res.data.files.length > 0 ? res.data.files[0] : null;
}

// Download a file content from Drive by ID
async function downloadFileFromDrive(fileId) {
  const destPath = path.join('/tmp', `download_${fileId}.txt`);
  const dest = fs.createWriteStream(destPath);

  await drive.files.get(
    { fileId, alt: 'media' },
    { responseType: 'stream' }
  ).then(res => {
    return new Promise((resolve, reject) => {
      res.data
        .on('end', () => resolve(destPath))
        .on('error', reject)
        .pipe(dest);
    });
  });

  return destPath;
}

// Upload new version of file to Drive
async function uploadNewVersionToDrive(content, oldFileName) {
  const newFileName = oldFileName.replace('.txt', `_v${Date.now()}.txt`);
  const tempPath = `/tmp/${newFileName}`;

  fs.writeFileSync(tempPath, content, 'utf8');

  const response = await drive.files.create({
    resource: { name: newFileName },
    media: { mimeType: 'text/plain', body: fs.createReadStream(tempPath) },
    fields: 'id'
  });

  fs.unlinkSync(tempPath);
  return response.data.id;
}

// Update memory file using AI
async function updateMemoryWithAI(oldContent, userInstruction) {
  const fullPrompt = `Here is the old memory:\n\n${oldContent}\n\nUser wants the following update:\n${userInstruction}\n\nPlease reply with the full updated version.`;

  const aiReply = await generateAIReply('update', fullPrompt);
  return aiReply;
}

// Handle /update command logic
async function handleUpdateCommand(sock, msg, commandText) {
  try {
    const [fileInstructionPart, ...instructionParts] = commandText.split(':');
    const fileName = fileInstructionPart.trim();
    const userInstruction = instructionParts.join(':').trim();

    const file = await findFileOnDrive(fileName);
    if (!file) {
      await sock.sendMessage(msg.key.remoteJid, { text: `❌ File not found: ${fileName}` });
      return;
    }

    const downloadedPath = await downloadFileFromDrive(file.id);
    const oldContent = fs.readFileSync(downloadedPath, 'utf8');

    const updatedContent = await updateMemoryWithAI(oldContent, userInstruction);

    const newFileId = await uploadNewVersionToDrive(updatedContent, fileName);

    await sock.sendMessage(msg.key.remoteJid, { text: `✅ Update complete! New file uploaded: https://drive.google.com/file/d/${newFileId}/view` });
  } catch (error) {
    console.error('❌ Update command error:', error);
    await sock.sendMessage(msg.key.remoteJid, { text: `❌ Failed to update memory: ${error.message}` });
  }
}

module.exports = { handleUpdateCommand };
