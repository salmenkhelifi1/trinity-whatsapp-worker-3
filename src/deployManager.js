const axios = require('axios');

async function triggerDeployment() {
  const url = process.env.VERCEL_DEPLOY_HOOK || '';
  if (!url) return console.error('No deploy hook defined.');
  const response = await axios.post(url);
  console.log('Deploy triggered:', response.data);
}

module.exports = { triggerDeployment };
