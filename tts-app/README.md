# VoiceType – Text to Speech App

A 2-tier application: type anything, hear it spoken aloud in English.

```
tts-app/
├── docker-compose.yml
└── src/
    ├── frontend/          # Nginx serving static HTML/CSS/JS
    │   ├── Dockerfile
    │   ├── nginx.conf
    │   └── src/
    │       ├── index.html
    │       ├── style.css
    │       └── app.js
    └── backend/           # Node.js + Express + Python gTTS
        ├── Dockerfile
        ├── package.json
        └── src/
            └── server.js
```

## Quick Start (Docker Compose)

```bash
# Build and start both services
docker compose up --build

# App is at:  http://localhost:3000
# API is at:  http://localhost:5000
```

## Run Without Docker

### Backend
```bash
cd src/backend
pip3 install gtts          # Python dependency
npm install
node src/server.js         # starts on :5000
```

### Frontend
```bash
# Open src/frontend/src/index.html directly in a browser
# OR serve it with any static server:
npx serve src/frontend/src -p 3000
```

> **Note:** When running without Docker, the frontend's `app.js` points to
> `http://localhost:5000` by default, which matches the backend's default port.

## API Reference

### `POST /api/speak`
Converts text to an MP3 audio file.

**Request body:**
```json
{ "text": "Hello, world!" }
```

**Response:**
```json
{
  "audioUrl": "/audio/<uuid>.mp3",
  "text": "Hello, world!",
  "characters": 13
}
```

**Errors:**
- `400` – missing/empty text, or exceeds 500 characters
- `500` – gTTS generation failed

### `GET /health`
Returns `{ "status": "ok" }`.

## Keyboard Shortcut
`Ctrl + Enter` (or `Cmd + Enter` on Mac) triggers the Speak button.
