/**
 * TTS Engine — Google Cloud Neural2 voices with browser fallback
 *
 * Priority:
 *   1. Google Cloud TTS API (Neural2 hi-IN / en-IN voices) via /api/tts
 *   2. Browser Web Speech API fallback (if API unavailable)
 *
 * Features:
 *   - Server-side audio generation for consistent high-quality output
 *   - Automatic Hindi/English voice switching
 *   - Audio queue for smooth sequential playback
 *   - Speed control (0.5x – 2x)
 */

type TTSMode = 'api' | 'browser' | 'detecting'

let mode: TTSMode = 'detecting'
let currentAudio: HTMLAudioElement | null = null
let shouldStop = false
let isCurrentlySpeaking = false

// Browser TTS fallback
let synth: SpeechSynthesis | null = null
let cachedVoice: SpeechSynthesisVoice | null = null
let cachedHindiVoice: SpeechSynthesisVoice | null = null

// Callbacks
let onSpeakStartCb: (() => void) | null = null
let onSpeakEndCb: (() => void) | null = null
let onModeChangeCb: ((mode: TTSMode) => void) | null = null

// ─── Init ───────────────────────────────────────────────

export function initTTS() {
  if (typeof window === 'undefined') return

  synth = window.speechSynthesis

  // Load browser voices for fallback
  const loadVoices = () => {
    const voices = synth!.getVoices()
    if (voices.length > 0) {
      cachedVoice = pickVoice(voices, 'en')
      cachedHindiVoice = pickVoice(voices, 'hi')
    }
  }
  loadVoices()
  if (synth.onvoiceschanged !== undefined) {
    synth.onvoiceschanged = loadVoices
  }

  // Chrome keep-alive for long browser utterances
  setInterval(() => {
    if (synth && synth.speaking && !synth.paused) {
      synth.pause()
      synth.resume()
    }
  }, 10000)

  // Detect if API TTS is available
  detectAPIMode()
}

async function detectAPIMode() {
  try {
    const res = await fetch('/api/tts')
    const data = await res.json()
    if (data.status === 'ready') {
      // Do a quick test call with short text
      const testRes = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: 'test', speed: 1 }),
      })
      if (testRes.ok && testRes.headers.get('content-type')?.includes('audio')) {
        mode = 'api'
        console.log('[TTS] Using Google Cloud Neural2 voices')
      } else {
        const err = await testRes.json().catch(() => ({}))
        console.warn('[TTS] API test failed, using browser fallback:', err)
        mode = 'browser'
      }
    } else {
      mode = 'browser'
      console.log('[TTS] No API key, using browser voices')
    }
  } catch {
    mode = 'browser'
    console.log('[TTS] API unreachable, using browser voices')
  }
  onModeChangeCb?.(mode)
}

export function setCallbacks(
  onStart: () => void,
  onEnd: () => void,
  onMode?: (mode: TTSMode) => void,
) {
  onSpeakStartCb = onStart
  onSpeakEndCb = onEnd
  if (onMode) onModeChangeCb = onMode
}

export function getTTSMode(): TTSMode {
  return mode
}

// ─── Main Speak Function ────────────────────────────────

export async function speak(text: string, speed: number = 1): Promise<void> {
  stopSpeaking()
  shouldStop = false

  if (mode === 'api') {
    return speakViaAPI(text, speed)
  } else {
    return speakViaBrowser(text, speed)
  }
}

// ─── API TTS (Google Cloud Neural2) ─────────────────────

async function speakViaAPI(text: string, speed: number): Promise<void> {
  return new Promise(async (resolve) => {
    try {
      isCurrentlySpeaking = true
      onSpeakStartCb?.()

      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, speed }),
      })

      if (!res.ok || !res.headers.get('content-type')?.includes('audio')) {
        // Fallback to browser
        console.warn('[TTS] API returned non-audio, falling back to browser')
        isCurrentlySpeaking = false
        return speakViaBrowser(text, speed).then(resolve)
      }

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const audio = new Audio(url)
      currentAudio = audio

      audio.onplay = () => {
        isCurrentlySpeaking = true
        onSpeakStartCb?.()
      }

      audio.onended = () => {
        URL.revokeObjectURL(url)
        currentAudio = null
        isCurrentlySpeaking = false
        onSpeakEndCb?.()
        resolve()
      }

      audio.onerror = () => {
        URL.revokeObjectURL(url)
        currentAudio = null
        isCurrentlySpeaking = false
        onSpeakEndCb?.()
        console.warn('[TTS] Audio playback error, falling back')
        speakViaBrowser(text, speed).then(resolve)
      }

      if (shouldStop) {
        URL.revokeObjectURL(url)
        isCurrentlySpeaking = false
        onSpeakEndCb?.()
        resolve()
        return
      }

      await audio.play().catch(() => {
        // Autoplay blocked — fall back to browser
        URL.revokeObjectURL(url)
        isCurrentlySpeaking = false
        speakViaBrowser(text, speed).then(resolve)
      })
    } catch (err) {
      console.error('[TTS] API speak error:', err)
      isCurrentlySpeaking = false
      onSpeakEndCb?.()
      speakViaBrowser(text, speed).then(resolve)
    }
  })
}

// ─── Browser TTS Fallback ───────────────────────────────

function pickVoice(voices: SpeechSynthesisVoice[], lang: 'en' | 'hi'): SpeechSynthesisVoice | null {
  const tests: Array<(v: SpeechSynthesisVoice) => boolean> = lang === 'hi'
    ? [
        v => v.lang === 'hi-IN' && v.name.includes('Google'),
        v => v.lang === 'hi-IN' && v.name.includes('Microsoft'),
        v => v.lang === 'hi-IN' && !v.localService,
        v => v.lang === 'hi-IN',
        v => v.lang.startsWith('hi'),
      ]
    : [
        v => v.lang === 'en-IN' && v.name.includes('Google'),
        v => v.lang === 'en-IN' && v.name.includes('Microsoft'),
        v => v.lang === 'en-IN' && !v.localService,
        v => v.lang === 'en-IN',
        v => v.lang.startsWith('en') && v.name.includes('Google'),
        v => v.lang.startsWith('en') && !v.localService,
        v => v.lang.startsWith('en'),
      ]

  for (const test of tests) {
    const match = voices.find(test)
    if (match) return match
  }
  return voices[0] || null
}

function isHindi(text: string): boolean {
  return (text.match(/[\u0900-\u097F]/g) || []).length > text.length * 0.25
}

function chunkForBrowser(text: string): string[] {
  const raw = text.split(/(?<=[.!?।])\s+/)
  const chunks: string[] = []
  let current = ''
  for (const s of raw) {
    if ((current + ' ' + s).length < 120) {
      current = current ? current + ' ' + s : s
    } else {
      if (current) chunks.push(current.trim())
      current = s
    }
  }
  if (current.trim()) chunks.push(current.trim())
  return chunks.length > 0 ? chunks : [text]
}

function speakViaBrowser(text: string, speed: number): Promise<void> {
  return new Promise(resolve => {
    if (!synth) { resolve(); return }
    synth.cancel()

    const chunks = chunkForBrowser(text)
    isCurrentlySpeaking = true
    onSpeakStartCb?.()

    const speakNext = (i: number) => {
      if (shouldStop || i >= chunks.length) {
        isCurrentlySpeaking = false
        onSpeakEndCb?.()
        resolve()
        return
      }

      const utter = new SpeechSynthesisUtterance(chunks[i])
      const voice = isHindi(chunks[i]) ? (cachedHindiVoice || cachedVoice) : cachedVoice
      if (voice) utter.voice = voice
      utter.rate = Math.max(0.5, Math.min(2, speed + (Math.random() - 0.5) * 0.06))
      utter.pitch = 0.92 + Math.random() * 0.08
      utter.volume = 1

      utter.onend = () => {
        setTimeout(() => speakNext(i + 1), 60 + Math.random() * 80)
      }
      utter.onerror = () => {
        setTimeout(() => speakNext(i + 1), 30)
      }

      synth!.speak(utter)
    }

    speakNext(0)
  })
}

// ─── Stop ───────────────────────────────────────────────

export function stopSpeaking() {
  shouldStop = true

  // Stop API audio
  if (currentAudio) {
    currentAudio.pause()
    currentAudio.src = ''
    currentAudio = null
  }

  // Stop browser speech
  synth?.cancel()

  isCurrentlySpeaking = false
  onSpeakEndCb?.()
}

export function getIsSpeaking(): boolean {
  return isCurrentlySpeaking
}
