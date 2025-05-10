const fs = require('fs');
const path = require('path');
const { pushToGitHub } = require('./githubHelper');
const { triggerDeployment } = require('./deployManager');

function generateCodeFiles(memory) {
  const dir = path.join(__dirname, '../output/phase4/generated');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'memory.md'), memory.content);
  return dir;
}

function runDevWorkflow(memory) {
  const dir = generateCodeFiles(memory);
  pushToGitHub(dir)
    .then(() => triggerDeployment())
    .catch(console.error);
}

module.exports = { runDevWorkflow };
