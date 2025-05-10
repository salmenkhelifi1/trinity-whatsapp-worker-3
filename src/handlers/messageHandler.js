const { storeMessage, db } = require('../services/firestoreService');
const { getAIReply } = require('../services/openaiService');

async function handleIncomingMessage(sock, msg) {
  if (!msg.message || msg.key.fromMe) return;

  const from = msg.key.remoteJid;
  const userDoc = db.collection('users').doc(from);

  // Get name from *your* contact list (not just their pushname)
  const contactName = sock.contacts?.[from]?.notify || sock.contacts?.[from]?.name || '';

  // Store name in Firestore if not already there
  const userSnapshot = await userDoc.get();
  if (!userSnapshot.exists) {
    await userDoc.set({ name: contactName });
  }

  // Extract user message text
  const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
  await storeMessage('incoming', msg);

  // Generate AI reply and send it
  const reply = await getAIReply(from, text);
  await sock.sendMessage(from, { text: reply });

  await storeMessage('outgoing', { to: from, text: reply });
}

module.exports = { handleIncomingMessage };
