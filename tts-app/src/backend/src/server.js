const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const app = express();
const PORT = process.env.PORT || 5000;
const AUDIO_DIR = path.join(__dirname, "../audio");

// Ensure audio directory exists
if (!fs.existsSync(AUDIO_DIR)) {
  fs.mkdirSync(AUDIO_DIR, { recursive: true });
}

app.use(cors({ origin: "*" }));
app.use(express.json());
app.use("/audio", express.static(AUDIO_DIR));

// POST /api/speak - convert text to speech
app.post("/api/speak", (req, res) => {
  const { text } = req.body;

  if (!text || typeof text !== "string") {
    return res.status(400).json({ error: "Text field is required." });
  }

  const trimmed = text.trim();
  if (!trimmed) {
    return res.status(400).json({ error: "Text cannot be empty." });
  }

  if (trimmed.length > 500) {
    return res.status(400).json({ error: "Text must be 500 characters or fewer." });
  }

  const filename = `${uuidv4()}.mp3`;
  const filepath = path.join(AUDIO_DIR, filename);

  // Escape single quotes in text for shell safety
  const safeText = trimmed.replace(/'/g, "'\\''");

  const cmd = `python3 -c "
from gtts import gTTS
tts = gTTS(text='${safeText}', lang='en', slow=False)
tts.save('${filepath}')
"`;

  exec(cmd, { timeout: 15000 }, (error, stdout, stderr) => {
    if (error) {
      console.error("gTTS error:", stderr || error.message);
      return res.status(500).json({ error: "Failed to generate speech. Please try again." });
    }

    // Schedule cleanup after 60 seconds
    setTimeout(() => {
      fs.unlink(filepath, () => {});
    }, 60_000);

    return res.json({
      audioUrl: `/audio/${filename}`,
      text: trimmed,
      characters: trimmed.length,
    });
  });
});

// GET /health
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "tts-backend" });
});

app.listen(PORT, () => {
  console.log(`TTS backend running on port ${PORT}`);
});
