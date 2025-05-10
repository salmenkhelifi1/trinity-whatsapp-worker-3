const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

async function transcribeAudio(filePath) {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath));
    formData.append('model', 'whisper-1');

    try {
        const response = await axios.post('https://api.openai.com/v1/audio/transcriptions', formData, {
            headers: {
                ...formData.getHeaders(),
                Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
            }
        });
        return response.data.text;
    } catch (error) {
        console.error('Whisper API error:', error.response ? error.response.data : error.message);
        throw new Error('Failed to transcribe audio');
    }
}

module.exports = { transcribeAudio };
// 📁 src/whisper.js
