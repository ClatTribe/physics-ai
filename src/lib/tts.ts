// Text-to-Speech engine with Hindi + English (Hinglish) support
// Uses Web Speech API with Indian English voice preference

let synth: SpeechSynthesis | null = null
let currentUtterance: SpeechSynthesisUtterance | null = null
let onSpeakStart: (() => void) | null = null
let onSpeakEnd: (() => void) | null = null

export function initTTS() {
  if (typeof window !== 'undefined') {
    synth = window.speechSynthesis
  }
}

export function setCallbacks(onStart: () => void, onEnd: () => void) {
  onSpeakStart = onStart
  onSpeakEnd = onEnd
}

function getIndianVoice(): SpeechSynthesisVoice | null {
  if (!synth) return null
  const voices = synth.getVoices()

  // Priority order for Indian accent
  const priorities = [
    // Hindi voices
    (v: SpeechSynthesisVoice) => v.lang === 'hi-IN',
    // Indian English
    (v: SpeechSynthesisVoice) => v.lang === 'en-IN',
    // Google Indian English
    (v: SpeechSynthesisVoice) => v.name.includes('Google') && v.lang.startsWith('en'),
    // Any English
    (v: SpeechSynthesisVoice) => v.lang.startsWith('en'),
  ]

  for (const test of priorities) {
    const match = voices.find(test)
    if (match) return match
  }

  return voices[0] || null
}

export function speak(text: string, speed: number = 1): Promise<void> {
  return new Promise((resolve) => {
    if (!synth) {
      initTTS()
      if (!synth) { resolve(); return }
    }

    // Cancel any ongoing speech
    synth.cancel()

    const utter = new SpeechSynthesisUtterance(text)
    utter.rate = speed
    utter.pitch = 0.95
    utter.volume = 1

    const voice = getIndianVoice()
    if (voice) utter.voice = voice

    utter.onstart = () => onSpeakStart?.()
    utter.onend = () => { onSpeakEnd?.(); resolve() }
    utter.onerror = () => { onSpeakEnd?.(); resolve() }

    currentUtterance = utter
    synth.speak(utter)
  })
}

export function stopSpeaking() {
  synth?.cancel()
  onSpeakEnd?.()
}

export function isSpeaking(): boolean {
  return synth?.speaking ?? false
}
