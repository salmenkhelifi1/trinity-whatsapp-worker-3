// 📁 src/memoryFormatter.js
function formatMemory(content, source = 'whatsapp') {
    return {
      content,
      source,
      timestamp: Date.now(),
      intent: 'save'
    };
  }
  
  module.exports = { formatMemory };