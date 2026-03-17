/**
 * TTS Client — Google Cloud Neural2 with browser fallback
 *
 * Key design: ONE audio plays at a time. speak() returns a Promise
 * that resolves ONLY when the audio finishes. The lesson player
 * awaits this promise before moving to the next step.
 */

type TTSMode = 'api' | 'browser' | 'detecting'

let mode: TTSMode = 'detecting'
let shouldStop = false
let isCurrentlySpeaking = false
let currentAudio: HTMLAudioElement | null = null
let currentResolve: (() => void) | null = null

// Browser fallback
let synth: SpeechSynthesis | null = null
let cachedVoice: SpeechSynthesisVoice | null = null

// Callbacks
let onStartCb: (() => void) | null = null
let onEndCb: (() => void) | null = null
let onModeCb: ((m: TTSMode) => void) | null = null

// ─── Init ─────────────────────────────────────────

export function initTTS() {
  if (typeof window === 'undefined') return
  synth = window.speechSynthesis

  const loadVoices = () => {
    const voices = synth!.getVoices()
    // Prefer Indian English
    cachedVoice =
      voices.find(v => v.lang === 'en-IN' && v.name.includes('Google')) ||
      voices.find(v => v.lang === 'en-IN') ||
      voices.find(v => v.lang.startsWith('en') && v.name.includes('Google')) ||
      voices.find(v => v.lang.startsWith('en')) ||
      voices[0] || null
  }
  loadVoices()
  if (synth.onvoiceschanged !== undefined) synth.onvoiceschanged = loadVoices

  // Chrome keep-alive
  setInterval(() => {
    if (synth?.speaking && !synth.paused) { synth.pause(); synth.resume() }
  }, 10000)

  detectMode()
}

async function detectMode() {
  try {
    const res = await fetch('/api/tts')
    const data = await res.json()
    console.log('[TTS] Health:', data)
    mode = data.status === 'working' ? 'api' : 'browser'
  } catch {
    mode = 'browser'
  }
  console.log('[TTS] Mode:', mode)
  onModeCb?.(mode)
}

export function setCallbacks(
  onStart: () => void,
  onEnd: () => void,
  onMode?: (m: TTSMode) => void,
) {
  onStartCb = onStart
  onEndCb = onEnd
  if (onMode) onModeCb = onMode
}

export function getTTSMode(): TTSMode { return mode }

// ─── Main speak() — returns Promise that resolves when done ───

export function speak(text: string, speed: number = 1): Promise<void> {
  // Stop anything currently playing FIRST
  stopSpeaking()
  shouldStop = false

  if (mode === 'api') {
    return speakAPI(text, speed)
  }
  return speakBrowser(text, speed)
}

// ─── API TTS ──────────────────────────────────────

function speakAPI(text: string, speed: number): Promise<void> {
  return new Promise(async (resolve) => {
    if (shouldStop) { resolve(); return }

    isCurrentlySpeaking = true
    onStartCb?.()

    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, speed }),
      })

      if (shouldStop) { finish(resolve); return }

      // If API didn't return audio, fall back to browser
      if (!res.ok || !res.headers.get('content-type')?.includes('audio')) {
        console.warn('[TTS] API non-audio response, using browser')
        isCurrentlySpeaking = false
        return speakBrowser(text, speed).then(resolve)
      }

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const audio = new Audio(url)
      currentAudio = audio
      currentResolve = resolve

      audio.onended = () => {
        URL.revokeObjectURL(url)
        cleanup()
        resolve()
      }

      audio.onerror = () => {
        URL.revokeObjectURL(url)
        cleanup()
        resolve()
      }

      if (shouldStop) {
        URL.revokeObjectURL(url)
        finish(resolve)
        return
      }

      await audio.play()
    } catch (err) {
      console.error('[TTS] Error:', err)
      finish(resolve)
    }
  })
}

// ─── Browser TTS ──────────────────────────────────

function speakBrowser(text: string, speed: number): Promise<void> {
  return new Promise((resolve) => {
    if (!synth || shouldStop) { resolve(); return }
    synth.cancel()

    isCurrentlySpeaking = true
    onStartCb?.()
    currentResolve = resolve

    const utter = new SpeechSynthesisUtterance(text)
    if (cachedVoice) utter.voice = cachedVoice
    utter.rate = Math.max(0.5, Math.min(2, speed))
    utter.pitch = 0.95
    utter.volume = 1

    utter.onend = () => { cleanup(); resolve() }
    utter.onerror = () => { cleanup(); resolve() }

    synth.speak(utter)
  })
}

// ─── Stop & Cleanup ───────────────────────────────

function cleanup() {
  isCurrentlySpeaking = false
  currentAudio = null
  currentResolve = null
  onEndCb?.()
}

function finish(resolve: () => void) {
  cleanup()
  resolve()
}

export function stopSpeaking() {
  shouldStop = true

  // Stop API audio
  if (currentAudio) {
    currentAudio.pause()
    currentAudio.currentTime = 0
    currentAudio = null
  }

  // Stop browser speech
  synth?.cancel()

  // Resolve any pending promise so the lesson player can move on
  if (currentResolve) {
    const r = currentResolve
    currentResolve = null
    isCurrentlySpeaking = false
    onEndCb?.()
    r()
  } else {
    isCurrentlySpeaking = false
    onEndCb?.()
  }
}

export function getIsSpeaking(): boolean { return isCurrentlySpeaking }
