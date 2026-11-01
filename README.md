# TamilDub AI (தமிழ் டப்பிங் ஏஐ)
> **"Every Language. One Tamil Voice."**

AI-Powered YouTube Video Tamil Dubbing & Voice Translation Platform.

---

## 1. Overview & Capabilities
TamilDub AI automatically translates and dubs authorized YouTube video sources and user-uploaded MP4 files into authentic, natural Tamil speech while preserving video visuals, ambient Foley background sound, and speaker individuality.

### Core Features:
- **17-Step Autonomous Pipeline**: Automatic source language detection, Whisper neural speech recognition, speaker diarization, idiomatic Tamil translation, neural TTS synthesis, dynamic audio synchronization, sidechain ducking, and MP4 remuxing.
- **Natural Tamil AI Voices**: High-fidelity Tamil vocal models: *Karthik* (Male conversational), *Meenakshi* (Female expressive), *Selvan* (Deep cinematic narrator), and *Priya* (Professional corporate).
- **Authorized Voice Timbre Cloning**: Ethically verified vocal profile cloning with legal speaker consent verification checklist and audit retention.
- **Interactive Dubbing Studio**: Synchronized HTML5 video player, audio track switcher (Original Audio vs Tamil Dubbed Audio vs Foley Ambient), waveform scrub timeline, live Tamil script subtitles, inline transcript editor, and individual line AI regeneration.
- **Multi-Format Export Hub**: Instant download of rendered MP4 video, Tamil MP3 audio track, SRT & VTT subtitles, and QA Compliance Processing Report.
- **Creator & Admin Dashboards**: Project history, minute credits, Celery worker queue telemetry, GPU utilization, and Gemini API token consumption.

---

## 2. 17-Step AI Dubbing Pipeline
1. **Video Input**: Authorized YouTube URL verification or user MP4 upload.
2. **Metadata Extraction**: FPS, aspect ratio, duration, and audio stream layout.
3. **Language Detection**: Automatic acoustic classification across 12+ languages.
4. **Audio Extraction**: Demuxing multi-channel audio tracks.
5. **Speech Recognition**: Whisper neural speech-to-text with frame-accurate timestamps.
6. **Speaker Identification**: Acoustic clustering and multi-speaker diarization.
7. **Transcript Generation**: Sentence and word-level timestamped transcripts.
8. **Tamil Translation**: Contextual translation into natural, spoken Tamil syntax.
9. **Translation Quality Verification**: Syllabic fit calibration and BLEU score validation.
10. **Tamil Voice Generation**: Neural TTS generation using Gemini 3.8 Flash Lite TTS and local synthesis.
11. **Voice Similarity Processing**: Acoustic timbre replication for verified speakers.
12. **Audio Synchronization**: Dynamic time-stretching and lip-sync alignment.
13. **Original Dialogue Replacement**: Spectral subtraction of original vocal frequencies.
14. **Background Audio Mixing**: Sidechain compression to preserve room ambiance, sound effects, and score.
15. **Subtitle Generation**: Bilingual SRT and WebVTT export (தமிழ் & phonetic romanization).
16. **Final MP4 Rendering**: Hardware-accelerated H.264 muxing.
17. **Video Preview & Download**: Real-time playback and master file delivery.

---

## 3. Technology Stack
- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, Motion.
- **Full-Stack Runtime**: Express.js server on Node.js running Vite middleware in dev.
- **AI Engines**: `@google/genai` (Gemini 3.8 Flash for translation & quality checks; Gemini 3.8 Flash Lite TTS for Tamil vocal synthesis; Whisper STT).
- **Backend Architecture**: Python 3.11, Django, Django REST Framework, MySQL, Celery, Redis, FFmpeg.

---

## 4. Local Development & Installation

### Quick Start (Web App & Full-Stack Server):
```bash
# 1. Install dependencies
npm install

# 2. Configure environment (optional, server automatically provides intelligent fallbacks)
cp .env.example .env

# 3. Start development server (serves frontend & backend on port 3000)
npm run dev
```

### Python / Django Backend Setup (for production workers):
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Start Celery worker with Redis
celery -A tamildub worker --loglevel=info

# Start Django API server
python manage.py runserver 8000
```

---

## 5. REST API Documentation
- `POST /api/auth/register` — Register a creator account
- `POST /api/auth/login` — Authenticate and receive JWT session
- `POST /api/dubbing/start` — Initiate 17-step dubbing pipeline
- `GET /api/dubbing/status/:id` — Poll live step progress (1 to 17)
- `POST /api/dubbing/translate` — Real-time Tamil translation with lip-sync fit ratio
- `POST /api/dubbing/regenerate` — Re-synthesize dialogue line with custom emotion/tone
- `POST /api/dubbing/voice-preview` — Audition Tamil voice actor speech
- `POST /api/dubbing/consent-verify` — Verify legal speaker consent for voice cloning
- `GET /api/dubbing/download/:id` — Download bundle: MP4, MP3, SRT, VTT, QA Report
- `GET /api/admin/metrics` — Telemetry for GPU cluster, Redis queue, and token consumption
