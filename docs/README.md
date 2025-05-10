# Trinity WhatsApp Worker

A Node.js-based AI-powered assistant that listens to voice or text commands via WhatsApp, transcribes audio using OpenAI Whisper, and stores structured memory into Firebase or Google Drive.

---

## 🚀 Features

### 🔊 Voice & Text Command Listener

* WhatsApp integration to receive voice notes and text messages
* Batch support for uploaded audio files

### 🧠 AI-Powered Transcription

* OpenAI Whisper API for accurate voice-to-text
* Integrated parser to extract structured memory from transcripts

### 📦 Smart Storage Routing

* Firebase Firestore for short-term structured memory
* Google Drive for long-term memory (e.g. documents, large content)
* Auto decision logic with manual override support
* Graceful fallbacks (e.g. Drive quota handling, Firebase default)

### 🧰 Dev Memory Mode

* Interprets dev instructions and modifies/creates code
* File types: `.js`, `.json`, `.env`, `.md`
* GitHub push automation + optional Vercel/Firebase deployment triggers

---

## 🛠️ Setup

### 1. Clone the Repo

```bash
git clone https://github.com/your-org/trinity-whatsapp-worker.git
cd trinity-whatsapp-worker
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Copy the `.env.example` file and edit values as needed:

```bash
cp .env.example .env
```

---

## 📁 Project Structure

```
src/
├── config/              # Environment management
├── handlers/            # Message handling logic
├── services/            # Drive, Firestore, Whisper, WhatsApp, OpenAI
├── utils/               # Logging, error handling
├── listener.js          # Core entry for WhatsApp listener
├── whisper.js           # Voice transcription logic
├── memoryFormatter.js   # Formats memory into structured JSON
├── deployManager.js     # DevOps trigger for deployment
```

---

## ✅ Requirements

* Node.js v18+
* Firebase project & service credentials
* Google Drive API access
* OpenAI API key (Whisper)

---

## 🧪 Testing

Run local tests using:

```bash
node src/index.js
```

Ensure `.env` is properly configured and Firebase/Drive access is working.

---

## 📄 License

MIT

---

## 👨‍💻 Author

Salmen Khelifi – [khelifi-salmen.com](https://khelifi-salmen.com)
