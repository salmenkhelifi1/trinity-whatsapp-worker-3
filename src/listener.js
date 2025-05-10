const { handleIncomingMessage } = require('./transcriber');
const { routeStorage } = require('./storageRouter');

function onMessageReceived(message) {
  if (message.type === 'voice' || message.type === 'audio') {
    handleIncomingMessage(message)
      .then(memory => routeStorage(memory))
      .catch(err => console.error("Listener Error:", err));
  }
}

module.exports = { onMessageReceived };
