'use client'

import { useState, useRef, useEffect } from 'react'

interface Message {
  role: 'student' | 'teacher'
  text: string
  timestamp: Date
}

interface DoubtChatProps {
  currentTopic: string
  onTeacherSpeak: (text: string) => void
}

// Pre-built doubt responses for each topic (works without API)
const doubtResponses: Record<string, Record<string, string>> = {
  kinematics: {
    default: 'Bahut accha doubt hai! Projectile motion mein hamesha yaad rakhna — horizontal aur vertical motion independent hain. Horizontally koi acceleration nahi hai, vertically gravity kaam karti hai. Agar koi aur specific doubt hai toh poochho!',
    'why positive root': 'Kyunki time hamesha positive hota hai! Negative root ka matlab hoga ki ball throw hone se pehle ka time — jo physically possible nahi hai. JEE mein hamesha physical significance check karo.',
    'what if angle changes': 'Agar angle change ho toh components change honge. 45 degrees pe maximum range milta hai ground se throw karne pe. Building se throw karne pe optimal angle 45 se thoda kam hota hai — ye JEE Advanced level concept hai!',
  },
  newton: {
    default: 'Good question! Newton ke laws mein free body diagram sabse important hai. Hamesha pehle FBD banao, phir equations likho. Constraint relation bhi check karo — agar string inextensible hai toh acceleration same hogi.',
    'why tension same': 'String massless hai isliye! Agar string ka mass hota toh different parts mein tension different hota. Massless string mein tension throughout same hoti hai. Ye ek important assumption hai JEE mein.',
  },
  electrostatics: {
    default: 'Gauss Law ka key point ye hai ki symmetry use karke problem simple karo. Spherical charge distribution ke liye spherical Gaussian surface, cylindrical ke liye cylindrical. JEE Advanced mein Gauss law har saal aata hai!',
    'why does it behave like point charge': 'Bahut important observation! Shell theorem kehta hai ki uniform spherical distribution bahar se point charge jaisa dikhta hai. Ye Newton ne gravity ke liye prove kiya tha aur same math electrostatics mein bhi apply hota hai.',
  },
  shm: {
    default: 'SHM mein key concept ye hai ki restoring force displacement ke proportional hoti hai. Pendulum mein ye small angle approximation se aata hai — sin theta approximately theta. Isliye large angles pe formula work nahi karta!',
  },
  thermo: {
    default: 'Thermodynamics mein hamesha Kelvin use karo, Celsius mein calculation mat karo! Carnot engine theoretical maximum hai — koi real engine itna efficient nahi ho sakta. NEET mein ye concept baar baar aata hai.',
  },
  optics: {
    default: 'Optics mein sign convention sahi se follow karo — ye sabse common mistake hai. New Cartesian convention mein: distances direction of light mein positive, against negative. Focal length: convex positive, concave negative.',
  },
}

function getResponse(topicId: string, question: string): string {
  const topicResponses = doubtResponses[topicId] || {}

  // Simple keyword matching
  const lowerQ = question.toLowerCase()
  for (const [key, response] of Object.entries(topicResponses)) {
    if (key !== 'default' && lowerQ.includes(key)) {
      return response
    }
  }

  // Check for common patterns
  if (lowerQ.includes('kyu') || lowerQ.includes('why') || lowerQ.includes('kyun')) {
    return topicResponses.default || 'Bahut accha doubt hai! Is concept ko deeply samajhne ke liye, pehle fundamentals pe focus karo. Step by step approach follow karo — pehle formula yaad karo, phir derivation samjho, phir problems solve karo.'
  }

  if (lowerQ.includes('formula') || lowerQ.includes('derive')) {
    return 'Ye formula derivation se aata hai. Main recommend karunga ki NCERT se derivation padho — JEE aur NEET dono mein derivation-based questions aate hain. Kya aapko step-by-step derivation chahiye?'
  }

  if (lowerQ.includes('trick') || lowerQ.includes('shortcut')) {
    return 'Shortcut toh hai, lekin pehle concept clear karo! Shortcut tab kaam aata hai jab fundamentals strong hon. Mera suggestion: pehle 10 questions concept se solve karo, phir shortcut seekho — tab trick hamesha yaad rahegi.'
  }

  return topicResponses.default || 'Accha sawaal hai! Is topic mein practice bahut zaroori hai. Main suggest karunga ki previous year JEE/NEET papers se is type ke questions solve karo. Koi specific step mein doubt hai toh batao!'
}

export default function DoubtChat({ currentTopic, onTeacherSpeak }: DoubtChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  // Reset chat when topic changes
  useEffect(() => {
    setMessages([])
  }, [currentTopic])

  const handleSubmit = () => {
    if (!input.trim() || isThinking) return

    const question = input.trim()
    setInput('')

    // Add student message
    setMessages(prev => [...prev, { role: 'student', text: question, timestamp: new Date() }])

    // Simulate thinking
    setIsThinking(true)

    setTimeout(() => {
      const response = getResponse(currentTopic, question)
      setMessages(prev => [...prev, { role: 'teacher', text: response, timestamp: new Date() }])
      setIsThinking(false)
      onTeacherSpeak(response)
    }, 1200 + Math.random() * 800)
  }

  return (
    <div className="border-t border-[var(--border)] bg-[var(--surface)]">
      {/* Messages area (collapsible) */}
      {messages.length > 0 && (
        <div ref={scrollRef} className="max-h-[200px] overflow-y-auto p-3 space-y-2">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'student' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-xl px-3 py-2 text-sm
                ${msg.role === 'student'
                  ? 'bg-[var(--accent)] text-white rounded-br-sm'
                  : 'bg-[var(--surface2)] text-[var(--text)] rounded-bl-sm border border-[var(--border)]'
                }`}
              >
                {msg.role === 'teacher' && (
                  <div className="text-[10px] font-bold text-green-400 mb-0.5">Prof. Sharma</div>
                )}
                {msg.text}
              </div>
            </div>
          ))}
          {isThinking && (
            <div className="flex justify-start">
              <div className="bg-[var(--surface2)] rounded-xl px-3 py-2 text-sm border border-[var(--border)] rounded-bl-sm">
                <div className="text-[10px] font-bold text-green-400 mb-0.5">Prof. Sharma</div>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-[var(--text-dim)] rounded-full animate-bounce" style={{animationDelay:'0s'}} />
                  <div className="w-1.5 h-1.5 bg-[var(--text-dim)] rounded-full animate-bounce" style={{animationDelay:'0.15s'}} />
                  <div className="w-1.5 h-1.5 bg-[var(--text-dim)] rounded-full animate-bounce" style={{animationDelay:'0.3s'}} />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Input bar */}
      <div className="flex items-center gap-2.5 p-3">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          placeholder="Doubt poocho... e.g. 'Ye formula kahan se aaya?' or 'Why positive root?'"
          className="flex-1 px-4 py-2.5 bg-[var(--surface2)] border border-[var(--border)] rounded-xl
            text-[var(--text)] text-sm outline-none focus:border-[var(--accent)] transition-colors
            placeholder:text-[var(--text-dim)]"
        />
        <button
          onClick={handleSubmit}
          disabled={!input.trim() || isThinking}
          className="px-4 py-2.5 bg-[var(--accent)] text-white rounded-xl text-sm font-semibold
            hover:bg-[#5b52ee] transition-colors disabled:opacity-40 disabled:cursor-not-allowed
            flex items-center gap-1.5"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22,2 15,22 11,13 2,9" />
          </svg>
          Ask
        </button>
      </div>
    </div>
  )
}
