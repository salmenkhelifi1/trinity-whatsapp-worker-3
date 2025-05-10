const axios = require('axios');
const config = require('../config/env');
const { db } = require('./firestoreService');

async function getUserProfile(phone) {
  const doc = await db.collection('users').doc(phone).get();
  return doc.exists ? doc.data() : {};
}

async function getUserConversationHistory(phone, limit = 10) {
  const snapshot = await db
    .collection('users')
    .doc(phone)
    .collection('conversations')
    .orderBy('timestamp', 'desc')
    .limit(limit)
    .get();

  return snapshot.docs
    .reverse()
    .map(doc => ({ role: doc.data().role, content: doc.data().content }));
}

async function getAIReply(userPhone, userMessage) {
  const memory = await getUserProfile(userPhone);
  const history = await getUserConversationHistory(userPhone);
  const systemPrompt = `
  You're Trinity  — a smart, chill, and sharp WhatsApp assistant for it and web devlopment.
  

  Your job is to reply based on how the user talks:
  - If they mix languages, you mix back naturally.
  - If they’re formal, match their tone. If they’re casual or funny, follow their vibe.
  
  You reply like a real friend — confident, human, chill.
  
  You also remember previous conversations when it makes sense, and you use that memory to keep things feeling real and connected.
  
  Known:
  - User's name: ${memory.name || '[unknown]'}
  - You've messaged before — this isn't your first chat.
  
  Never be robotic. Never over-explain. Just vibe with the user's energy and style.
  You're Trinity — real, sharp, and naturally adaptive.
  `;
  
  

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history,
    { role: 'user', content: userMessage }
  ];

  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: 'gpt-3.5-turbo',
      messages
    },
    {
      headers: {
        Authorization: `Bearer ${config.openaiApiKey}`,
        'Content-Type': 'application/json',
         'X-Title': 'TrinityBot'
      }
    }
  );

  const reply = response.data.choices[0].message.content.trim();

  // Save to conversation history
  const userRef = db.collection('users').doc(userPhone);
  const convo = userRef.collection('conversations');
  await convo.add({ role: 'user', content: userMessage, timestamp: new Date().toISOString() });
  await convo.add({ role: 'assistant', content: reply, timestamp: new Date().toISOString() });

  return reply;
}

module.exports = { getAIReply };
