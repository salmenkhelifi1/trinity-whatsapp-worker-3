// 📁 src/services/whatsappService.js

global.crypto = require('crypto');

const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, downloadMediaMessage } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const { transcribeAudio } = require('../whisper');
const { decideStorage } = require('../storageDecision');
const { formatMemory } = require('../memoryFormatter');
const { handleError } = require('../utils/errorHandler');
const { logger } = require('../utils/logger');
const { getAIReply } = require('../services/openaiService');
const { handleUpdateCommand } = require('../services/driveService'); // NEW
const fs = require('fs');
const path = require('path');

async function startWhatsAppClient() {
  const { state, saveCreds } = await useMultiFileAuthState('./auth');

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
  });

  // Connection management
  sock.ev.on('connection.update', ({ connection, lastDisconnect, qr }) => {
    if (qr) {
      qrcode.generate(qr, { small: true });
    }

    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut);
      if (shouldReconnect) {
        console.log('Reconnecting...');
        startWhatsAppClient();
      } else {
        console.log('Logged out.');
      }
    }

    if (connection === 'open') {
      console.log('✅ WhatsApp connection established!');
    }
  });

  // Handle incoming messages
  sock.ev.on('messages.upsert', async ({ messages }) => {
    for (let msg of messages) {
      if (!msg.message || msg.key.fromMe) return;

      try {
        const messageType = Object.keys(msg.message)[0];
        let content = '';
        const userPhone = msg.key.remoteJid.split('@')[0];

        if (messageType === 'conversation') {
          content = msg.message.conversation;
        } else if (messageType === 'extendedTextMessage') {
          content = msg.message.extendedTextMessage.text;
        } else if (messageType === 'audioMessage') {
          console.log('🎤 Voice message detected. Downloading...');
          const audioBuffer = await downloadMediaMessage(
            msg,
            'buffer',
            {},
            { reuploadRequest: sock }
          );
          const audioPath = path.join(__dirname, 'voice.ogg');
          fs.writeFileSync(audioPath, audioBuffer);
          content = await transcribeAudio(audioPath);
          console.log('🧠 Transcribed text:', content);
          fs.unlinkSync(audioPath);
        }

        if (!content) continue;

        // 🔥 Handle /update command
        if (content.startsWith('/update')) {
          const commandText = content.replace('/update', '').trim();
          await handleUpdateCommand(sock, msg, commandText);
          continue; // Skip normal memory saving
        }

        // 🔥 Normal memory save + AI reply
        console.log('📩 Saving new memory...');
        const memory = formatMemory(content, 'whatsapp');
        const result = await decideStorage(JSON.stringify(memory), content.length > 300);
        logger.info(`✅ Memory saved to ${result.storage}`);

        const aiReply = await getAIReply(userPhone, content);
        await sock.sendMessage(msg.key.remoteJid, { text: aiReply });

      } catch (error) {
        handleError(error);
      }
    }
  });

  sock.ev.on('creds.update', saveCreds);
}

module.exports = { startWhatsAppClient };
