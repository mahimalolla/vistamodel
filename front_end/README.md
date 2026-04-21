# VISTA Frontend

**Voice-based Interpretation & Streaming Translation**

A real-time speech-to-speech translation UI built with React 18 + TypeScript. Captures microphone input via the Web Speech API, sends it to the Cloud Run translation backend, and plays back the result with Text-to-Speech.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18.3 + TypeScript 5.8 |
| Build tool | Vite 5.4 (SWC compiler) |
| Styling | Tailwind CSS 3.4 + shadcn/ui |
| Routing | React Router DOM 6 |

---

## Project Structure

```
front_end/
├── src/
│   ├── pages/
│   │   ├── Landing.tsx          # Marketing / hero page
│   │   ├── Index.tsx            # Main translation interface
│   │   ├── Dashboard.tsx        # Session overview & analytics
│   │   └── NotFound.tsx         # 404 handler
│   ├── components/
│   │   ├── MicButton.tsx        # Animated record / stop button
│   │   ├── LanguagePanel.tsx    # Numbered source + target text display
│   │   ├── VistaHeader.tsx      # Header with API status indicator
│   │   ├── ThemeToggle.tsx      # Dark / light mode switcher
│   │   ├── WaveformVisualizer.tsx  # Live waveform + timer
│   │   ├── NavLink.tsx          # Navigation link
│   │   ├── starFieldBackground.tsx # Canvas animated star field
│   │   └── ui/                  # 49 shadcn/ui primitives
│   ├── hooks/
│   │   ├── useSpeechRecognition.ts  # Core: STT → translate API → TTS
│   │   ├── use-mobile.tsx       # Viewport detection
│   │   └── use-toast.ts         # Toast notifications
│   ├── lib/
│   │   └── utils.ts             # cn() class merger
│   ├── assets/
│   │   ├── vista-logo.png       # Light theme logo
│   │   └── vista-logo-dark.png  # Dark theme logo
│   ├── test/
│   │   ├── setup.ts             # Vitest setup
│   │   └── example.test.ts      # Sample test
│   ├── App.tsx                  # Router definition
│   ├── main.tsx                 # Entry point
│   └── index.css                # Global styles + CSS theme variables
├── public/                      # Static assets
├── Dockerfile                   # Multi-stage build
├── nginx.conf                   # SPA routing, caching, compression
├── deploy.sh                    # GCP Cloud Run deploy script
├── vite.config.ts
├── vitest.config.ts
├── playwright.config.ts
├── tailwind.config.ts
└── package.json
```

---

## Pages

### Landing (`/`)
Marketing page with animated star-field background, feature grid, domain showcase (General / Medical / Legal), a 3-step "How It Works" section, architecture overview, and CTA buttons.

### Translation Interface (`/interpreter`)
The core UI. Side-by-side source and target language panels with numbered lines, a microphone button, domain selector (General / Medical / Legal), language pair swap, auto-play toggle, and API health badge.

### Dashboard (`/dashboard`)
Session analytics overview with live status cards, recent session list, quick-action buttons, and HIPAA / GDPR trust cards.

---

## Core Hook - `useSpeechRecognition`

`src/hooks/useSpeechRecognition.ts` drives the entire translation loop:

```
Mic input
  └── Web SpeechRecognition API  (continuous, interim results)
        └── final transcript  →  POST /translate  (Cloud Run)
                                      └── translated_text
                                            └── SpeechSynthesisUtterance  →  Speaker
```

Supported language codes: `en-US` (English) and `es-ES` (Spanish).  
Supported domains passed to the API: `general`, `medical`, `legal`.

---

## API Integration

**Base URL:** `https://translation-api-1050963407386.us-central1.run.app`

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/health` | Check `model_ready` flag on app load |
| `POST` | `/translate` | Translate a final transcript |

**POST /translate request body:**
```json
{
  "text": "The patient needs immediate care.",
  "direction": "en_to_es",
  "domain": "medical"
}
```

**Response:**
```json
{
  "translated_text": "El paciente necesita atención inmediata."
}
```

Direction values: `en_to_es` · `es_to_en`

---

## Local Development

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:8080)
npm run dev

# Type check
npx tsc --noEmit

# Lint
npm run lint
```

---

## Testing

```bash
# Unit tests (Vitest + Testing Library)
npm test

# Unit tests in watch mode
npm run test:watch

# E2E tests (Playwright)
npx playwright test
```

---

## Build & Docker

```bash
# Production build → dist/
npm run build

# Build Docker image
docker build -t vista-frontend .

# Run container locally
docker run -p 8080:8080 vista-frontend
```

The Dockerfile uses a two-stage build:
1. **Build stage** - Node 20 Alpine installs dependencies and runs `vite build`
2. **Serve stage** - Nginx Alpine serves the `dist/` folder

Nginx is configured for SPA fallback routing, 1-year static asset caching, gzip compression, and security headers (`X-Frame-Options`, `X-Content-Type-Options`).

---

## Deploy to Cloud Run

```bash
# From front_end/
bash deploy.sh
```

Deploys to `us-central1` as `vista-frontend` with 256 MiB RAM, 1 CPU, 0–3 instances.

---
