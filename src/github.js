// 📁 src/github.js
const simpleGit = require('simple-git');
const git = simpleGit();

async function pushToGitHub(commitMessage = 'Auto memory update') {
    try {
        await git.add('.');
        await git.commit(commitMessage);
        await git.push('origin', 'main');
        console.log('✅ Pushed to GitHub successfully!');
    } catch (error) {
        console.error('GitHub push error:', error.message);
        throw new Error('Failed to push to GitHub');
    }
}

module.exports = { pushToGitHub };
