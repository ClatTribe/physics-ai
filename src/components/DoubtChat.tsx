'use client'

import { useState, useRef, useEffect } from 'react'

interface Message {
  role: 'student' | 'teacher'
  text: string
  isLoading?: boolean
}

interface DoubtChatProps {
  currentTopic: string
  topicTitle: string
  coveredSteps: string[]
  onTeacherSpeak: (text: string) => void
}

// Offline fallback responses (used when Gemini API is unavailable)
const fallbackResponses = [
  'Bahut accha doubt hai! Is concept ko samajhne ke liye, pehle basic formula yaad karo, phir derivation se connect karo. Practice se sab clear ho jayega!',
  'Good question! JEE mein is type ke problems frequently aate hain. Key point ye hai ki fundamentals strong hone chahiye — shortcut baad mein seekhna.',
  'Ye ek common confusion hai. Main suggest karunga — NCERT se concept padho, phir previous year papers solve karo. Step by step approach follow karo.',
  'Excellent doubt! Haan, ye tricky hai but ek baar samajh aaya toh bahut easy hai. Physical intuition pe focus karo, not just rote formulas.',
  'Bilkul sahi direction mein soch rahe ho! Is concept ka deep connection hai energy conservation se. Jab ye connect ho jayega tab sab clear hoga.',
]

export default function DoubtChat({ currentTopic, topicTitle, coveredSteps, onTeacherSpeak }: DoubtChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const [geminiAvailable, setGeminiAvailable] = useState<boolean | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  // Reset chat when topic changes
  useEffect(() => {
    setMessages([])
  }, [currentTopic])

  const askGemini = async (question: string): Promise<string> => {
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          topicContext: topicTitle,
          previousSteps: coveredSteps.join('\n'),
        }),
      })

      const data = await res.json()

      if (data.fallback || data.error) {
        setGeminiAvailable(false)
        return getFallbackResponse()
      }

      setGeminiAvailable(true)
      return data.response
    } catch {
      setGeminiAvailable(false)
      return getFallbackResponse()
    }
  }

  const getFallbackResponse = (): string => {
    return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)]
  }

  const handleSubmit = async () => {
    if (!input.trim() || isThinking) return

    const question = input.trim()
    setInput('')

    // Add student message
    setMessages(prev => [...prev, { role: 'student', text: question }])
    setIsThinking(true)

    // Get AI response
    const response = await askGemini(question)

    setMessages(prev => [...prev, { role: 'teacher', text: response }])
    setIsThinking(false)
    onTeacherSpeak(response)
  }

  return (
    <div className="border-t border-[var(--border)] bg-[var(--surface)]">
      {/* Messages area */}
      {messages.length > 0 && (
        <div ref={scrollRef} className="max-h-[220px] overflow-y-auto p-3 space-y-2.5">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'student' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed
                ${msg.role === 'student'
                  ? 'bg-[var(--accent)] text-white rounded-br-sm'
                  : 'bg-[var(--surface2)] text-[var(--text)] rounded-bl-sm border border-[var(--border)]'
                }`}
              >
                {msg.role === 'teacher' && (
                  <div className="flex items-center gap-1.5 mb-1">
                    <div className="text-[10px] font-bold text-green-400">Prof. Sharma</div>
                    {geminiAvailable === true && (
                      <div className="text-[9px] px-1.5 py-0.5 rounded bg-[rgba(108,99,255,0.15)] text-[var(--accent)] font-semibold">
                        AI
                      </div>
                    )}
                  </div>
                )}
                {msg.text}
              </div>
            </div>
          ))}

          {/* Thinking indicator */}
          {isThinking && (
            <div className="flex justify-start">
              <div className="bg-[var(--surface2)] rounded-xl px-3.5 py-2.5 text-sm border border-[var(--border)] rounded-bl-sm">
                <div className="text-[10px] font-bold text-green-400 mb-1">Prof. Sharma</div>
                <div className="flex items-center gap-1.5 py-1">
                  <div className="w-1.5 h-1.5 bg-[var(--text-dim)] rounded-full animate-bounce" style={{animationDelay:'0s'}} />
                  <div className="w-1.5 h-1.5 bg-[var(--text-dim)] rounded-full animate-bounce" style={{animationDelay:'0.15s'}} />
                  <div className="w-1.5 h-1.5 bg-[var(--text-dim)] rounded-full animate-bounce" style={{animationDelay:'0.3s'}} />
                  <span className="text-xs text-[var(--text-dim)] ml-1">Soch raha hoon...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Input bar */}
      <div className="flex items-center gap-2.5 p-3">
        <div className="flex-1 relative">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            placeholder={currentTopic
              ? "Doubt poocho... 'Ye formula kahan se aaya?' / 'Why did we ignore friction?'"
              : "Pehle ek topic select karo, phir doubt poochho..."
            }
            disabled={!currentTopic}
            className="w-full px-4 py-2.5 bg-[var(--surface2)] border border-[var(--border)] rounded-xl
              text-[var(--text)] text-sm outline-none focus:border-[var(--accent)] transition-colors
              placeholder:text-[var(--text-dim)] disabled:opacity-40 disabled:cursor-not-allowed pr-20"
          />
          {geminiAvailable !== null && (
            <div className={`absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-semibold px-1.5 py-0.5 rounded
              ${geminiAvailable
                ? 'bg-green-400/10 text-green-400'
                : 'bg-yellow-400/10 text-yellow-400'
              }`}
            >
              {geminiAvailable ? '⚡ Gemini AI' : '📦 Offline'}
            </div>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={!input.trim() || isThinking || !currentTopic}
          className="px-4 py-2.5 bg-[var(--accent)] text-white rounded-xl text-sm font-semibold
            hover:bg-[#5b52ee] transition-colors disabled:opacity-40 disabled:cursor-not-allowed
            flex items-center gap-1.5 shrink-0"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22,2 15,22 11,13 2,9" />
          </svg>
          Poocho
        </button>
      </div>
    </div>
  )
}
