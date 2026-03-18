'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

interface Message {
  role: 'student' | 'teacher' | 'system'
  text: string
}

interface DoubtChatProps {
  currentTopic: string
  topicTitle: string
  coveredSteps: string[]
  isLessonActive: boolean
  isPaused: boolean
  currentStepLabel: string
  currentStepContent: string  // Full step content (text + math + narration)
  onTeacherSpeak: (text: string) => void
  onDoubtAsked?: (question: string) => void
  onDoubtDuringLesson?: (question: string, aiResponse: string) => void
}

// Offline fallback
const fallbackResponses = [
  'Bahut accha doubt hai! Is concept ko samajhne ke liye, pehle basic formula yaad karo, phir derivation se connect karo.',
  'Good question! JEE mein is type ke problems frequently aate hain. Fundamentals strong hone chahiye.',
  'Ye ek common confusion hai. NCERT se concept padho, phir previous year papers solve karo.',
]

// Keyword overlap for repeat detection
function extractKeywords(text: string): Set<string> {
  const stop = new Set(['the','a','is','in','it','of','to','and','for','on','hai','ka','ke','ki','ko','se','mein','kya','ye','wo','kaise','kyu','kyun','why','how','what','when','where','which','i','me','my','please','sir','bhai','help','do','does','can'])
  return new Set(
    text.toLowerCase().replace(/[^a-zA-Z0-9\u0900-\u097F\s]/g, '').split(/\s+/).filter(w => w.length > 2 && !stop.has(w))
  )
}

function similarity(a: string, b: string): number {
  const kw1 = extractKeywords(a), kw2 = extractKeywords(b)
  if (!kw1.size || !kw2.size) return 0
  let overlap = 0
  kw1.forEach(w => { if (kw2.has(w)) overlap++ })
  return overlap / Math.max(kw1.size, kw2.size)
}

export default function DoubtChat({
  currentTopic, topicTitle, coveredSteps,
  isLessonActive, isPaused, currentStepLabel, currentStepContent,
  onTeacherSpeak, onDoubtAsked, onDoubtDuringLesson,
}: DoubtChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const [geminiAvailable, setGeminiAvailable] = useState<boolean | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const doubtHistoryRef = useRef<{ question: string; response: string }[]>([])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    setMessages([])
    doubtHistoryRef.current = []
  }, [currentTopic])

  const detectRepeat = useCallback((question: string) => {
    const similar: string[] = []
    for (const entry of doubtHistoryRef.current) {
      if (similarity(question, entry.question) > 0.35) similar.push(entry.response)
    }
    return { count: similar.length + 1, previousResponses: similar }
  }, [])

  const askGemini = async (question: string, duringLesson: boolean): Promise<string> => {
    const { count, previousResponses } = detectRepeat(question)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          topicContext: topicTitle,
          previousSteps: coveredSteps.join('\n'),
          repeatCount: count,
          previousAttempts: previousResponses.join('\n---\n'),
          duringLesson,
          currentStepLabel: duringLesson ? currentStepLabel : undefined,
          currentStepContent: duringLesson ? currentStepContent : undefined,
        }),
      })

      if (!res.ok) { setGeminiAvailable(false); return getFallback() }
      const data = await res.json()
      if (data.fallback) { setGeminiAvailable(false); return getFallback() }
      if (data.response) { setGeminiAvailable(true); return data.response }
      setGeminiAvailable(false)
      return getFallback()
    } catch {
      setGeminiAvailable(false)
      return getFallback()
    }
  }

  const getFallback = () => fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)]

  const handleSubmit = async () => {
    if (!input.trim() || isThinking) return
    const question = input.trim()
    setInput('')

    onDoubtAsked?.(question)

    const { count } = detectRepeat(question)
    const duringLesson = isLessonActive

    setMessages(prev => [...prev, { role: 'student', text: question }])

    if (duringLesson) {
      setMessages(prev => [...prev, {
        role: 'system',
        text: `⏸️ Lesson paused — Prof. Sharma is re-explaining "${currentStepLabel}"...`
      }])
    }

    if (count >= 3) {
      setMessages(prev => [...prev, {
        role: 'system',
        text: `🧠 Same concept ${count}x — trying a completely different explanation...`
      }])
    }

    setIsThinking(true)
    const response = await askGemini(question, duringLesson)
    doubtHistoryRef.current.push({ question, response })

    setMessages(prev => [...prev, { role: 'teacher', text: response }])
    setIsThinking(false)

    // If lesson is active, this triggers pause + whiteboard re-explanation
    if (duringLesson && onDoubtDuringLesson) {
      onDoubtDuringLesson(question, response)
    } else {
      onTeacherSpeak(response)
    }
  }

  return (
    <div className="border-t border-[var(--border)] bg-[var(--surface)]">
      {/* Paused banner */}
      {isPaused && (
        <div className="px-4 py-2 bg-orange-500/10 border-b border-orange-500/20 text-orange-400 text-xs font-semibold flex items-center gap-2">
          <span>⏸️ Lesson paused.</span>
          <span className="text-[var(--text-dim)]">Ask more doubts or click "Samajh aa gaya! Continue →" above to resume.</span>
        </div>
      )}

      {messages.length > 0 && (
        <div ref={scrollRef} className="max-h-[220px] overflow-y-auto p-3 space-y-2">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'student' ? 'justify-end' : msg.role === 'system' ? 'justify-center' : 'justify-start'}`}>
              {msg.role === 'system' ? (
                <div className="text-[11px] text-orange-400 bg-orange-400/10 px-3 py-1 rounded-full">{msg.text}</div>
              ) : (
                <div className={`max-w-[80%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed
                  ${msg.role === 'student' ? 'bg-orange-500 text-white rounded-br-sm' : 'bg-[var(--surface2)] text-[var(--text)] rounded-bl-sm border border-[var(--border)]'}`}>
                  {msg.role === 'teacher' && (
                    <div className="flex items-center gap-1.5 mb-1">
                      <div className="text-[10px] font-bold text-green-400">Prof. Sharma</div>
                      {geminiAvailable && <div className="text-[9px] px-1.5 py-0.5 rounded bg-[rgba(108,99,255,0.15)] text-[var(--accent)] font-semibold">AI</div>}
                    </div>
                  )}
                  {msg.text}
                </div>
              )}
            </div>
          ))}
          {isThinking && (
            <div className="flex justify-start">
              <div className="bg-[var(--surface2)] rounded-xl px-3.5 py-2.5 text-sm border border-[var(--border)] rounded-bl-sm">
                <div className="text-[10px] font-bold text-green-400 mb-1">Prof. Sharma</div>
                <div className="flex items-center gap-1.5 py-1">
                  <div className="w-1.5 h-1.5 bg-[var(--text-dim)] rounded-full animate-bounce" style={{animationDelay:'0s'}} />
                  <div className="w-1.5 h-1.5 bg-[var(--text-dim)] rounded-full animate-bounce" style={{animationDelay:'0.15s'}} />
                  <div className="w-1.5 h-1.5 bg-[var(--text-dim)] rounded-full animate-bounce" style={{animationDelay:'0.3s'}} />
                  <span className="text-xs text-[var(--text-dim)] ml-1">
                    {isLessonActive ? 'Re-explaining this step...' : 'Soch raha hoon...'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center gap-2.5 p-3">
        <div className="flex-1 relative">
          <input type="text" value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            placeholder={
              isLessonActive
                ? isPaused
                  ? "Aur doubt hai? Poocho... ya 'Continue' press karo ↑"
                  : "Doubt? Type karo — lesson automatically pause hoga!"
                : currentTopic ? "Doubt poocho... Hindi ya English mein!" : "Pehle ek topic select karo..."
            }
            disabled={!currentTopic}
            className="w-full px-4 py-2.5 bg-[var(--surface2)] border border-[var(--border)] rounded-xl text-[var(--text)] text-sm outline-none focus:border-orange-500 transition-colors placeholder:text-[var(--text-dim)] disabled:opacity-40 pr-20"
          />
          {geminiAvailable !== null && (
            <div className={`absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-semibold px-1.5 py-0.5 rounded
              ${geminiAvailable ? 'bg-green-400/10 text-green-400' : 'bg-yellow-400/10 text-yellow-400'}`}>
              {geminiAvailable ? '⚡ Gemini' : '📦 Offline'}
            </div>
          )}
        </div>
        <button onClick={handleSubmit} disabled={!input.trim() || isThinking || !currentTopic}
          className="px-4 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 shrink-0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22,2 15,22 11,13 2,9"/>
          </svg>
          {isLessonActive ? '⏸️ Ask' : 'Poocho'}
        </button>
      </div>
    </div>
  )
}
