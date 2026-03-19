'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { loadProfile, saveProfile, addWeakSpot, resolveWeakSpot, setSocraticState, clearSocraticState, getWeakConcepts } from '@/lib/studentProfile'
import type { StudentProfile } from '@/lib/studentProfile'

interface Message {
  role: 'student' | 'teacher' | 'system'
  text: string
  type?: 'socratic_question' | 'correct' | 'wrong' | 'explanation'
}

interface DoubtChatProps {
  currentTopic: string
  topicTitle: string
  professorName: string
  coveredSteps: string[]
  isLessonActive: boolean
  isPaused: boolean
  currentStepLabel: string
  currentStepContent: string
  onTeacherSpeak: (text: string) => void
  onDoubtAsked?: (question: string) => void
  onDoubtDuringLesson?: (question: string, aiResponse: string) => void
  onWeakSpotUpdate?: (weakSpots: string[]) => void
}

const fallbackResponses = [
  'Achha dekho, pehle basics check karte hain. Kya tumhe is step mein use hone wale formula ka physical meaning pata hai?',
  'Main seedha answer nahi dunga — pehle sochke batao, is step mein kaunsa physics principle use ho raha hai?',
]

function extractKeywords(text: string): Set<string> {
  const stop = new Set(['the','a','is','in','it','of','to','and','for','on','hai','ka','ke','ki','ko','se','mein','kya','ye','wo','i','me','my','please','sir','bhai','help','do','does','can'])
  return new Set(text.toLowerCase().replace(/[^a-zA-Z0-9\u0900-\u097F\s]/g, '').split(/\s+/).filter(w => w.length > 2 && !stop.has(w)))
}
function similarity(a: string, b: string): number {
  const k1 = extractKeywords(a), k2 = extractKeywords(b)
  if (!k1.size || !k2.size) return 0
  let o = 0; k1.forEach(w => { if (k2.has(w)) o++ })
  return o / Math.max(k1.size, k2.size)
}

export default function DoubtChat({
  currentTopic, topicTitle, professorName, coveredSteps,
  isLessonActive, isPaused, currentStepLabel, currentStepContent,
  onTeacherSpeak, onDoubtAsked, onDoubtDuringLesson, onWeakSpotUpdate,
}: DoubtChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const [geminiAvailable, setGeminiAvailable] = useState<boolean | null>(null)
  const [profile, setProfile] = useState<StudentProfile>(loadProfile)
  const scrollRef = useRef<HTMLDivElement>(null)
  const doubtHistoryRef = useRef<{ question: string; response: string }[]>([])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    setMessages([])
    doubtHistoryRef.current = []
  }, [currentTopic])

  // Persist profile changes
  useEffect(() => { saveProfile(profile) }, [profile])

  const detectRepeat = useCallback((q: string) => {
    const similar: string[] = []
    for (const e of doubtHistoryRef.current) { if (similarity(q, e.question) > 0.35) similar.push(e.response) }
    return { count: similar.length + 1, previousResponses: similar }
  }, [])

  const callAPI = async (body: Record<string, unknown>): Promise<Record<string, unknown>> => {
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) { setGeminiAvailable(false); return { fallback: true } }
      const data = await res.json()
      if (data.fallback) { setGeminiAvailable(false); return { fallback: true } }
      setGeminiAvailable(true)
      return data
    } catch { setGeminiAvailable(false); return { fallback: true } }
  }

  const handleSubmit = async () => {
    if (!input.trim() || isThinking) return
    const question = input.trim()
    setInput('')
    onDoubtAsked?.(question)

    const { count, previousResponses } = detectRepeat(question)
    const duringLesson = isLessonActive
    const socratic = profile.socraticState[currentTopic]

    setMessages(prev => [...prev, { role: 'student', text: question }])
    setIsThinking(true)

    // ═══ CASE 1: Student is answering a previous Socratic question ═══
    if (socratic?.pendingQuestion && duringLesson) {
      const data = await callAPI({
        question, professorName, topicContext: topicTitle,
        previousSteps: coveredSteps.join('\n'),
        duringLesson: true, currentStepLabel, currentStepContent,
        socraticMode: 'evaluate_answer',
        pendingQuestion: socratic.pendingQuestion,
        targetConcept: socratic.targetConcept,
        socraticAttempts: socratic.attempts + 1,
        weakSpots: getWeakConcepts(profile, currentTopic),
      })

      if (data.fallback) {
        addMsg('teacher', fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)])
        setIsThinking(false); return
      }

      const verdict = data.verdict as string
      const response = data.response as string || ''

      if (verdict === 'correct') {
        // Student got it! Resolve weak spot
        setProfile(prev => resolveWeakSpot(clearSocraticState(prev, currentTopic), currentTopic, socratic.targetConcept))
        addMsg('teacher', response, 'correct')
        setMessages(prev => [...prev, { role: 'system', text: `✅ "${socratic.targetConcept}" — Samajh aa gaya!` }])
        onWeakSpotUpdate?.(getWeakConcepts(profile, currentTopic))
        speakAndNotify(response)
      } else if (verdict === 'give_up' || (socratic.attempts >= 2)) {
        // Gave up or 3+ wrong → give full explanation, mark as weak
        setProfile(prev => addWeakSpot(clearSocraticState(prev, currentTopic), currentTopic, currentStepLabel, socratic.targetConcept))
        addMsg('teacher', response, 'explanation')
        setMessages(prev => [...prev, { role: 'system', text: `🔴 "${socratic.targetConcept}" → Weak Spot marked` }])
        onWeakSpotUpdate?.(getWeakConcepts(profile, currentTopic))
        speakAndNotify(response)
      } else {
        // Wrong but still has attempts → give hint, ask again
        setProfile(prev => setSocraticState(prev, currentTopic, {
          ...socratic, attempts: socratic.attempts + 1, pendingQuestion: socratic.pendingQuestion
        }))
        setProfile(prev => addWeakSpot(prev, currentTopic, currentStepLabel, socratic.targetConcept))
        addMsg('teacher', response, 'wrong')
        onTeacherSpeak(response)
      }

      doubtHistoryRef.current.push({ question, response })
      setIsThinking(false)
      return
    }

    // ═══ CASE 2: New doubt during lesson → try Socratic approach ═══
    if (duringLesson) {
      setMessages(prev => [...prev, { role: 'system', text: `⏸️ Lesson paused — thinking about how to guide you...` }])

      const data = await callAPI({
        question, professorName, topicContext: topicTitle,
        previousSteps: coveredSteps.join('\n'),
        repeatCount: count, previousAttempts: previousResponses.join('\n---\n'),
        duringLesson: true, currentStepLabel, currentStepContent,
        weakSpots: getWeakConcepts(profile, currentTopic),
      })

      if (data.fallback) {
        addMsg('teacher', fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)])
        setIsThinking(false); return
      }

      if (data.mode === 'socratic' && data.leadingQuestion) {
        // Gemini wants to ask a Socratic question
        const intro = (data.intro as string) || ''
        const lq = data.leadingQuestion as string
        const concept = (data.targetConcept as string) || 'Concept'

        setProfile(prev => setSocraticState(prev, currentTopic, {
          pendingQuestion: lq, targetConcept: concept, stepLabel: currentStepLabel, attempts: 0,
        }))

        const fullMsg = `${intro}\n\n💡 ${lq}`
        addMsg('teacher', fullMsg, 'socratic_question')
        setMessages(prev => [...prev, { role: 'system', text: `🎯 Testing: "${concept}" — answer karo!` }])
        speakAndNotify(`${intro} ... ${lq}`)
      } else {
        // Direct explanation (3+ repeats or Gemini decided to explain)
        const response = (data.response as string) || 'Let me explain this differently...'
        addMsg('teacher', response, 'explanation')
        speakAndNotify(response)
      }

      doubtHistoryRef.current.push({ question, response: (data.response || data.leadingQuestion || '') as string })
      if (duringLesson && onDoubtDuringLesson) {
        onDoubtDuringLesson(question, (data.response || data.intro || '') as string)
      }
      setIsThinking(false)
      return
    }

    // ═══ CASE 3: Casual mode (not during lesson) ═══
    const data = await callAPI({
      question, professorName, topicContext: topicTitle,
      previousSteps: coveredSteps.join('\n'),
    })
    const response = (data.response as string) || fallbackResponses[0]
    addMsg('teacher', response)
    doubtHistoryRef.current.push({ question, response })
    onTeacherSpeak(response)
    setIsThinking(false)
  }

  function addMsg(role: Message['role'], text: string, type?: Message['type']) {
    setMessages(prev => [...prev, { role, text, type }])
  }

  function speakAndNotify(text: string) {
    onTeacherSpeak(text)
  }

  // Active Socratic question indicator
  const activeSocratic = profile.socraticState[currentTopic]
  const weakCount = getWeakConcepts(profile, currentTopic).length

  return (
    <div className="border-t border-[var(--border)] bg-[var(--surface)]">
      {/* Paused + Socratic state banner */}
      {isPaused && (
        <div className="px-4 py-2 bg-orange-500/10 border-b border-orange-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            {activeSocratic?.pendingQuestion ? (
              <span className="text-orange-400 font-semibold">🎯 Answer the question below to continue</span>
            ) : (
              <span className="text-orange-400 font-semibold">⏸️ Lesson paused — ask more or click Continue ↑</span>
            )}
          </div>
          {weakCount > 0 && (
            <span className="text-[9px] bg-red-500/15 text-red-400 px-2 py-0.5 rounded-full font-semibold">
              {weakCount} weak spot{weakCount > 1 ? 's' : ''}
            </span>
          )}
        </div>
      )}

      {messages.length > 0 && (
        <div ref={scrollRef} className="max-h-[250px] overflow-y-auto p-3 space-y-2">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'student' ? 'justify-end' : msg.role === 'system' ? 'justify-center' : 'justify-start'}`}>
              {msg.role === 'system' ? (
                <div className="text-[11px] text-orange-400 bg-orange-400/10 px-3 py-1 rounded-full">{msg.text}</div>
              ) : (
                <div className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed
                  ${msg.role === 'student' ? 'bg-orange-500 text-white rounded-br-sm' :
                    msg.type === 'socratic_question' ? 'bg-[rgba(255,200,0,0.08)] border-2 border-yellow-500/30 text-[var(--text)] rounded-bl-sm' :
                    msg.type === 'correct' ? 'bg-[rgba(0,230,118,0.08)] border border-green-500/30 text-[var(--text)] rounded-bl-sm' :
                    msg.type === 'wrong' ? 'bg-[rgba(255,82,82,0.08)] border border-red-500/30 text-[var(--text)] rounded-bl-sm' :
                    'bg-[var(--surface2)] text-[var(--text)] rounded-bl-sm border border-[var(--border)]'
                  }`}>
                  {msg.role === 'teacher' && (
                    <div className="flex items-center gap-1.5 mb-1">
                      <div className={`text-[10px] font-bold ${
                        msg.type === 'socratic_question' ? 'text-yellow-400' :
                        msg.type === 'correct' ? 'text-green-400' :
                        msg.type === 'wrong' ? 'text-red-400' : 'text-green-400'
                      }`}>
                        {msg.type === 'socratic_question' ? `🎯 ${professorName}` :
                         msg.type === 'correct' ? `✅ ${professorName}` :
                         msg.type === 'wrong' ? `❌ ${professorName}` : professorName}
                      </div>
                      {geminiAvailable && <div className="text-[9px] px-1.5 py-0.5 rounded bg-[rgba(108,99,255,0.15)] text-[var(--accent)] font-semibold">AI</div>}
                    </div>
                  )}
                  <div className="whitespace-pre-line">{msg.text}</div>
                </div>
              )}
            </div>
          ))}
          {isThinking && (
            <div className="flex justify-start">
              <div className="bg-[var(--surface2)] rounded-xl px-3.5 py-2.5 text-sm border border-[var(--border)] rounded-bl-sm">
                <div className="text-[10px] font-bold text-green-400 mb-1">{professorName}</div>
                <div className="flex items-center gap-1.5 py-1">
                  {[0, 0.15, 0.3].map(d => (
                    <div key={d} className="w-1.5 h-1.5 bg-[var(--text-dim)] rounded-full animate-bounce" style={{animationDelay:`${d}s`}} />
                  ))}
                  <span className="text-xs text-[var(--text-dim)] ml-1">
                    {activeSocratic?.pendingQuestion ? 'Evaluating your answer...' :
                     isLessonActive ? 'Thinking of a good question for you...' : 'Soch raha hoon...'}
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
              activeSocratic?.pendingQuestion
                ? "Answer the question above..."
                : isLessonActive
                ? isPaused ? "Aur doubt? Ya Continue press karo ↑" : "Doubt? Lesson will pause for you!"
                : currentTopic ? "Doubt poocho..." : "Pehle topic select karo..."
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
          className={`px-4 py-2.5 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 shrink-0
            ${activeSocratic?.pendingQuestion ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-orange-500 hover:bg-orange-600'}`}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22,2 15,22 11,13 2,9"/>
          </svg>
          {activeSocratic?.pendingQuestion ? 'Answer' : isLessonActive ? '⏸️ Ask' : 'Poocho'}
        </button>
      </div>
    </div>
  )
}
