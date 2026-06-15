(() => {
  "use strict";

  // ── Config ────────────────────────────────────────────────────────────────────
  const API_BASE = "";
  const MAX_CHARS = 500;
  const MAX_HISTORY = 5;

  // ── DOM refs ──────────────────────────────────────────────────────────────────
  const textarea    = document.getElementById("inputText");
  const charCount   = document.getElementById("charCount");
  const speakBtn    = document.getElementById("speakBtn");
  const btnIcon     = document.getElementById("btnIcon");
  const btnLabel    = document.getElementById("btnLabel");
  const statusMsg   = document.getElementById("statusMsg");
  const playerWrap  = document.getElementById("playerWrap");
  const audioPlayer = document.getElementById("audioPlayer");
  const playerMeta  = document.getElementById("playerMeta");
  const waveform    = document.getElementById("waveform");
  const waveLabel   = document.getElementById("waveformLabel");
  const historySection = document.getElementById("historySection");
  const historyList    = document.getElementById("historyList");

  // ── State ─────────────────────────────────────────────────────────────────────
  let isLoading = false;
  let history   = [];

  // ── Character counter ─────────────────────────────────────────────────────────
  textarea.addEventListener("input", () => {
    const len = textarea.value.length;
    charCount.textContent = `${len} / ${MAX_CHARS}`;
    charCount.classList.toggle("warn", len > MAX_CHARS * 0.85);
  });

  // ── Keyboard shortcut: Ctrl/Cmd+Enter to speak ────────────────────────────────
  textarea.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      if (!isLoading) handleSpeak();
    }
  });

  speakBtn.addEventListener("click", handleSpeak);

  // ── Main handler ──────────────────────────────────────────────────────────────
  async function handleSpeak() {
    const text = textarea.value.trim();
    if (!text) {
      showStatus("Please type something first.", "error");
      textarea.focus();
      return;
    }
    if (text.length > MAX_CHARS) {
      showStatus(`Text is too long. Max ${MAX_CHARS} characters.`, "error");
      return;
    }

    setLoading(true);
    setWaveState("loading", "Generating…");
    showStatus("Converting text to speech…", "info");

    try {
      const res = await fetch(`${API_BASE}/api/speak`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Unknown server error.");
      }

      const audioUrl = `${API_BASE}${data.audioUrl}`;
      audioPlayer.src = audioUrl;
      playerWrap.hidden = false;
      showStatus("Ready! Press play to listen.", "success");
      setWaveState("playing", "Playing");

      // Add to history
      addToHistory(text, audioUrl);

      // Auto-play
      try { await audioPlayer.play(); } catch (_) { /* user may need to interact */ }

    } catch (err) {
      console.error(err);
      showStatus(err.message || "Something went wrong. Is the backend running?", "error");
      setWaveState("idle", "Idle");
    } finally {
      setLoading(false);
    }
  }

  // ── Audio events ──────────────────────────────────────────────────────────────
  audioPlayer.addEventListener("play",  () => setWaveState("playing", "Playing"));
  audioPlayer.addEventListener("pause", () => setWaveState("idle",    "Paused"));
  audioPlayer.addEventListener("ended", () => setWaveState("idle",    "Done"));

  // ── UI helpers ────────────────────────────────────────────────────────────────
  function setLoading(state) {
    isLoading = state;
    speakBtn.disabled = state;

    if (state) {
      btnIcon.outerHTML = `<div class="spinner" id="btnIcon"></div>`;
      btnLabel.textContent = "Generating…";
    } else {
      const el = document.getElementById("btnIcon");
      if (el) {
        el.outerHTML = `<svg class="btn-icon" id="btnIcon" width="20" height="20" viewBox="0 0 24 24" fill="none">
          <polygon points="5,3 19,12 5,21" fill="currentColor"/>
        </svg>`;
      }
      btnLabel.textContent = "Speak";
    }
  }

  function showStatus(msg, type = "info") {
    statusMsg.textContent = msg;
    statusMsg.className = `status ${type}`;
  }

  function setWaveState(state, label) {
    waveform.className = `waveform ${state}`;
    waveLabel.textContent = label;
    waveLabel.className = `waveform-label ${state}`;
  }

  // ── History ───────────────────────────────────────────────────────────────────
  function addToHistory(text, audioUrl) {
    // Deduplicate
    history = history.filter(h => h.text !== text);
    history.unshift({ text, audioUrl, ts: Date.now() });
    if (history.length > MAX_HISTORY) history.pop();
    renderHistory();
  }

  function renderHistory() {
    if (history.length === 0) {
      historySection.hidden = true;
      return;
    }
    historySection.hidden = false;
    historyList.innerHTML = "";

    history.forEach(({ text, audioUrl }) => {
      const li = document.createElement("li");
      li.className = "history-item";
      li.title = "Click to re-use this text";

      const span = document.createElement("span");
      span.className = "hi-text";
      span.textContent = text;

      const replayBtn = document.createElement("button");
      replayBtn.className = "hi-replay";
      replayBtn.title = "Replay";
      replayBtn.setAttribute("aria-label", `Replay: ${text}`);
      replayBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <polygon points="5,3 19,12 5,21" fill="currentColor"/>
        </svg>`;

      // Click text → fill textarea
      span.addEventListener("click", () => {
        textarea.value = text;
        textarea.dispatchEvent(new Event("input"));
        textarea.focus();
      });

      // Click replay → play audio
      replayBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        audioPlayer.src = audioUrl;
        playerWrap.hidden = false;
        audioPlayer.play().catch(() => {});
        setWaveState("playing", "Playing");
        showStatus("Replaying…", "info");
      });

      li.append(span, replayBtn);
      historyList.appendChild(li);
    });
  }

  // ── Init ──────────────────────────────────────────────────────────────────────
  setWaveState("idle", "Idle");
  textarea.focus();
})();
