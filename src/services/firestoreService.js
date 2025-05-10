const admin = require('firebase-admin');
const config = require('../config/env');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: config.firebase.projectId,
      clientEmail: config.firebase.clientEmail,
      privateKey: config.firebase.privateKey
    }),
    ignoreUndefinedProperties: true
  });
}

const db = admin.firestore();

function removeUndefined(obj) {
  if (Array.isArray(obj)) {
    return obj.map(removeUndefined);
  } else if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj)
        .filter(([_, v]) => v !== undefined)
        .map(([k, v]) => [k, removeUndefined(v)])
    );
  }
  return obj;
}

async function storeMessage(type, message) {
  const docRef = db.collection('messages').doc();
  const cleanMessage = removeUndefined(message);

  await docRef.set({
    type,
    message: cleanMessage,
    timestamp: new Date().toISOString()
  });
}

module.exports = { storeMessage, db };
