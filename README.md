# PhysicsAI — AI Physics Teacher for JEE & NEET

An AI-powered physics teacher that explains JEE & NEET problems step-by-step on a virtual whiteboard, with a realistic avatar, Hindi + English (Hinglish) voice narration, and an interactive doubt-asking system.

## Features

- 🧑‍🏫 **Realistic AI Avatar** — Human face with lip-sync animation and speaking indicators
- 📝 **Virtual Green Board** — Chalk-style whiteboard with LaTeX math rendering (KaTeX)
- 🗣️ **Hinglish Voice** — Hindi + English narration with Indian accent using Web Speech API
- 💬 **Doubt System** — Students can type doubts and get AI-powered responses
- ⚡ **6 Topics** — Kinematics, Newton's Laws, Electrostatics, Optics, SHM, Thermodynamics
- 🎚️ **Speed Control** — 0.5x to 2x playback speed

## Tech Stack

- **Next.js 14** (App Router, TypeScript)
- **Tailwind CSS** for styling
- **KaTeX** for math rendering
- **Web Speech API** for text-to-speech
- **Vercel** for deployment

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deployment

Push to GitHub and import in [Vercel](https://vercel.com). Zero configuration needed.

## Roadmap

- [ ] D-ID / HeyGen integration for photorealistic avatar video
- [ ] Claude API for dynamic problem solving and doubt resolution
- [ ] ElevenLabs for high-quality Hindi TTS
- [ ] Student authentication and progress tracking
- [ ] More topics across all JEE/NEET chapters
