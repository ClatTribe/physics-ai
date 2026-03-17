/**
 * High-quality TTS engine for Hinglish (Hindi + English)
 *
 * Improvements over basic Web Speech API:
 * 1. Intelligent voice selection (prioritises Indian English & Hindi voices)
 * 2. Text chunking — breaks long text into natural sentences for smoother playback
 * 3. Pitch/rate micro-adjustments per chunk for more natural cadence
 * 4. Pause insertion between sentences for realistic pacing
 * 5. Queue management — prevents overlapping utterances
 * 6. Hindi-aware splitting — doesn't break Hindi phrases mid-word
 */

let synth: SpeechSynthesis | null = null
let voicesLoaded = false
let cachedVoice: SpeechSynthesisVoice | null = null
let cachedHindiVoice: SpeechSynthesisVoice | null = null
let isCurrentlySpeaking = false
let shouldStop = false
let utteranceQueue: SpeechSynthesisUtterance[] = []

// Callbacks
let onSpeakStartCb: (() => void) | null = null
let onSpeakEndCb: (() => void) | null = null

export function initTTS() {
  if (typeof window === 'undefined') return

  synth = window.speechSynthesis

  // Force voice loading (Chrome needs this)
  const loadVoices = () => {
    const voices = synth!.getVoices()
    if (voices.length > 0) {
      voicesLoaded = true
      cachedVoice = selectBestVoice(voices, 'en')
      cachedHindiVoice = selectBestVoice(voices, 'hi')
      console.log('[TTS] Loaded voices:', {
        english: cachedVoice?.name,
        hindi: cachedHindiVoice?.name,
        total: voices.length,
      })
    }
  }

  loadVoices()
  if (synth.onvoiceschanged !== undefined) {
    synth.onvoiceschanged = loadVoices
  }

  // Workaround: Chrome pauses long utterances after ~15s.
  // Keep-alive ping every 10s while speaking.
  setInterval(() => {
    if (synth && synth.speaking && !synth.paused) {
      synth.pause()
      synth.resume()
    }
  }, 10000)
}

export function setCallbacks(onStart: () => void, onEnd: () => void) {
  onSpeakStartCb = onStart
  onSpeakEndCb = onEnd
}

/**
 * Select the best available voice with smart ranking
 */
function selectBestVoice(
  voices: SpeechSynthesisVoice[],
  lang: 'en' | 'hi'
): SpeechSynthesisVoice | null {
  if (lang === 'hi') {
    // Hindi voice priority
    const priorities: Array<(v: SpeechSynthesisVoice) => boolean> = [
      v => v.lang === 'hi-IN' && v.name.includes('Google'),
      v => v.lang === 'hi-IN' && v.name.includes('Microsoft'),
      v => v.lang === 'hi-IN' && !v.localService,   // Network voices are usually better
      v => v.lang === 'hi-IN',
      v => v.lang.startsWith('hi'),
    ]
    for (const test of priorities) {
      const match = voices.find(test)
      if (match) return match
    }
    return null
  }

  // English voice priority — prefer Indian English, then natural-sounding
  const priorities: Array<(v: SpeechSynthesisVoice) => boolean> = [
    // Indian English (best match for Hinglish)
    v => v.lang === 'en-IN' && v.name.includes('Google'),
    v => v.lang === 'en-IN' && v.name.includes('Microsoft') && v.name.includes('Neerja'),
    v => v.lang === 'en-IN' && v.name.includes('Microsoft'),
    v => v.lang === 'en-IN' && !v.localService,
    v => v.lang === 'en-IN',
    // Premium network voices (any English)
    v => v.lang.startsWith('en') && v.name.includes('Google') && v.name.includes('Natural'),
    v => v.lang.startsWith('en') && v.name.includes('Google'),
    v => v.lang.startsWith('en') && !v.localService && !v.name.includes('compact'),
    // Fallback
    v => v.lang.startsWith('en-US'),
    v => v.lang.startsWith('en'),
  ]

  for (const test of priorities) {
    const match = voices.find(test)
    if (match) return match
  }
  return voices[0] || null
}

/**
 * Detect if a segment is primarily Hindi
 */
function isHindiSegment(text: string): boolean {
  const hindiCharCount = (text.match(/[\u0900-\u097F]/g) || []).length
  return hindiCharCount > text.length * 0.3
}

/**
 * Split text into natural chunks for smoother speech
 * - Splits on sentence boundaries (. ! ? —)
 * - Keeps chunks reasonably sized (under ~120 chars)
 * - Preserves Hindi phrases together
 */
function chunkText(text: string): string[] {
  // First split on sentence-level boundaries
  const rawChunks = text.split(/(?<=[.!?।])\s+|(?<=—)\s+|(?<=,)\s+(?=\w{20,})/)

  const chunks: string[] = []
  let currentChunk = ''

  for (const raw of rawChunks) {
    if (!raw.trim()) continue

    if (currentChunk.length + raw.length < 120) {
      currentChunk += (currentChunk ? ' ' : '') + raw
    } else {
      if (currentChunk) chunks.push(currentChunk.trim())
      currentChunk = raw
    }
  }
  if (currentChunk.trim()) chunks.push(currentChunk.trim())

  // If we ended up with just one huge chunk, try splitting on commas
  if (chunks.length === 1 && chunks[0].length > 150) {
    const commaSplit = chunks[0].split(/(?<=,)\s+/)
    if (commaSplit.length > 1) return commaSplit.map(s => s.trim()).filter(Boolean)
  }

  return chunks.length > 0 ? chunks : [text]
}

/**
 * Create a single utterance with optimized settings
 */
function createUtterance(
  text: string,
  speed: number,
  chunkIndex: number,
  totalChunks: number
): SpeechSynthesisUtterance {
  const utter = new SpeechSynthesisUtterance(text)

  // Voice selection: use Hindi voice for Hindi-heavy segments
  const useHindi = isHindiSegment(text)
  const voice = useHindi ? (cachedHindiVoice || cachedVoice) : cachedVoice
  if (voice) utter.voice = voice

  // Base rate with micro-variation for natural cadence
  const baseRate = speed
  const variation = (Math.random() - 0.5) * 0.06 // ±3% variation
  utter.rate = Math.max(0.5, Math.min(2, baseRate + variation))

  // Slightly lower pitch for teacher authority, with natural variation
  utter.pitch = 0.92 + (Math.random() * 0.08) // 0.92 – 1.0

  // Slightly louder for first chunk (teacher emphasis at start)
  utter.volume = chunkIndex === 0 ? 1.0 : 0.95

  return utter
}

/**
 * Main speak function — high quality with chunking and queuing
 */
export function speak(text: string, speed: number = 1): Promise<void> {
  return new Promise(resolve => {
    if (!synth) {
      initTTS()
      if (!synth) { resolve(); return }
    }

    // Stop any current speech
    shouldStop = false
    synth.cancel()
    utteranceQueue = []

    const chunks = chunkText(text)
    let completedChunks = 0

    // Signal speaking started
    isCurrentlySpeaking = true
    onSpeakStartCb?.()

    const speakNext = (index: number) => {
      if (shouldStop || index >= chunks.length) {
        isCurrentlySpeaking = false
        onSpeakEndCb?.()
        resolve()
        return
      }

      const utter = createUtterance(chunks[index], speed, index, chunks.length)

      utter.onend = () => {
        completedChunks++

        // Natural pause between sentences (50-150ms)
        const pauseMs = 50 + Math.random() * 100
        setTimeout(() => speakNext(index + 1), pauseMs / speed)
      }

      utter.onerror = (e) => {
        // Skip this chunk on error, continue with next
        console.warn('[TTS] Chunk error:', e.error, '— skipping')
        setTimeout(() => speakNext(index + 1), 50)
      }

      synth!.speak(utter)
    }

    speakNext(0)
  })
}

/**
 * Stop all speech immediately
 */
export function stopSpeaking() {
  shouldStop = true
  utteranceQueue = []
  synth?.cancel()
  isCurrentlySpeaking = false
  onSpeakEndCb?.()
}

/**
 * Check if currently speaking
 */
export function getIsSpeaking(): boolean {
  return isCurrentlySpeaking
}

/**
 * Get available voice info (for debugging/settings UI)
 */
export function getVoiceInfo(): { english: string; hindi: string; total: number } {
  return {
    english: cachedVoice?.name || 'Not loaded',
    hindi: cachedHindiVoice?.name || 'Not available',
    total: synth?.getVoices().length || 0,
  }
}
