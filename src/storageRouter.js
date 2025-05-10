const { saveToFirebase } = require('../utils/firebase');
const { saveToDrive } = require('../utils/drive');

function routeStorage(memory) {
  if (memory.content.includes("long-term") || memory.type === "file") {
    return saveToDrive(memory);
  }
  return saveToFirebase(memory);
}

module.exports = { routeStorage };
