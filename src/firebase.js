// 📁 src/firebase.js
const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    })
  });
}

const db = admin.firestore();

async function saveMemoryToFirestore(memory) {
  const doc = await db.collection('memories').add(JSON.parse(memory));
  return doc.id;
}

module.exports = { saveMemoryToFirestore };