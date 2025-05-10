// 📁 src/deployTrigger.js
const axios = require('axios');

async function triggerDeploy() {
    try {
        if (process.env.VERCEL_DEPLOY_HOOK_URL) {
            await axios.post(process.env.VERCEL_DEPLOY_HOOK_URL);
            console.log('✅ Vercel deployment triggered');
        }
        if (process.env.FIREBASE_DEPLOY_HOOK_URL) {
            await axios.post(process.env.FIREBASE_DEPLOY_HOOK_URL);
            console.log('✅ Firebase deployment triggered');
        }
    } catch (error) {
        console.error('Deploy trigger error:', error.message);
    }
}

module.exports = { triggerDeploy };

