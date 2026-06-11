# ── Stage 1: deps ──────────────────────────────────────────────────────────────
FROM node:20-slim AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

# ── Stage 2: runtime ───────────────────────────────────────────────────────────
FROM node:20-slim AS runtime

# Install Python 3, pip, and gTTS
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    python3-venv \
    && pip3 install --break-system-packages gtts \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy installed node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY package*.json ./
COPY src/ ./src/

# Create audio output directory
RUN mkdir -p /app/audio

EXPOSE 5000

ENV NODE_ENV=production \
    PORT=5000

CMD ["node", "src/server.js"]
