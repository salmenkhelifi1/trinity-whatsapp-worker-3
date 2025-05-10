const { saveMemoryToFirestore } = require('./firebase');
const { uploadFileToDrive } = require('./drive');
const fs = require('fs');

async function decideStorage(content) {
  const isLargeContent = content.length > 300; // ✅ Real condition

  if (isLargeContent) {
    const fileName = `memory_${Date.now()}.txt`;
    const tempPath = `/tmp/${fileName}`;

    fs.writeFileSync(tempPath, content, 'utf8');

    try {
      const fileId = await uploadFileToDrive(tempPath, fileName);
      fs.unlinkSync(tempPath);
      return { storage: 'drive', fileId };
    } catch (error) {
      console.error('❌ Drive Upload Failed. Saving to Firebase instead.');
      const docIdFallback = await saveMemoryToFirestore(content);
      fs.unlinkSync(tempPath);
      return { storage: 'firebase', docId: docIdFallback };
    }
  } else {
    const docId = await saveMemoryToFirestore(content);
    return { storage: 'firebase', docId };
  }
}

module.exports = { decideStorage };
