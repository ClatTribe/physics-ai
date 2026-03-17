'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Avatar from '@/components/Avatar'
import Whiteboard from '@/components/Whiteboard'
import DoubtChat from '@/components/DoubtChat'
import { topics, type Topic } from '@/data/topics'
import { initTTS, setCallbacks, speak, stopSpeaking } from '@/lib/tts'

export default function Home() {
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentStep, setCurrentStep] = useState(-1)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [studentCount, setStudentCount] = useState(847)
  const timeoutsRef = useRef<NodeJS.Timeout[]>([])

  // Init TTS
  useEffect(() => {
    initTTS()
    setCallbacks(
      () => setIsSpeaking(true),
      () => setIsSpeaking(false),
    )
  }, [])

  // Fake student count
  useEffect(() => {
    const interval = setInterval(() => {
      setStudentCount(c => Math.max(800, c + Math.floor(Math.random() * 7) - 3))
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const clearTimeouts = () => {
    timeoutsRef.current.forEach(t => clearTimeout(t))
    timeoutsRef.current = []
  }

  const startLesson = useCallback(() => {
    if (!selectedTopic) return
    setIsPlaying(true)
    setCurrentStep(-1)
    clearTimeouts()

    let delay = 200

    selectedTopic.steps.forEach((step, idx) => {
      const t = setTimeout(() => {
        setCurrentStep(idx)
        if (step.speech) {
          speak(step.speech, speed)
        }
      }, delay)
      timeoutsRef.current.push(t)

      // Estimate speech duration (chars * ~55ms adjusted by speed)
      const speechDuration = step.speech ? (step.speech.length * 55) / speed : 3000
      delay += Math.max(speechDuration, 2000 / speed)
    })

    // Auto-stop after last step
    const endT = setTimeout(() => {
      setIsPlaying(false)
    }, delay + 1000)
    timeoutsRef.current.push(endT)
  }, [selectedTopic, speed])

  const stopLesson = () => {
    setIsPlaying(false)
    setCurrentStep(-1)
    clearTimeouts()
    stopSpeaking()
  }

  const handleTopicSelect = (topic: Topic) => {
    if (isPlaying) stopLesson()
    setSelectedTopic(topic)
    setCurrentStep(-1)
  }

  const handleDoubtSpeak = (text: string) => {
    speak(text, speed)
  }

  const progress = selectedTopic && currentStep >= 0
    ? ((currentStep + 1) / selectedTopic.steps.length) * 100
    : 0

  return (
    <div className="h-screen flex flex-col">
      {/* ═══ Top Bar ═══ */}
      <header className="flex items-center justify-between px-5 h-14 bg-[var(--surface)] border-b border-[var(--border)] shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-[var(--accent)] to-purple-400 flex items-center justify-center font-extrabold text-white text-sm">
            P
          </div>
          <div className="font-bold text-lg">
            Physics<span className="text-[var(--accent)]">AI</span>
          </div>
          {isPlaying && (
            <div className="flex items-center gap-1.5 bg-red-500/15 text-red-400 px-3 py-1 rounded-full text-xs font-semibold">
              <div className="w-2 h-2 bg-red-400 rounded-full" style={{animation:'livePulse 1.5s infinite'}} />
              LIVE
            </div>
          )}
        </div>

        <div className="flex items-center gap-5">
          <div className="flex items-center gap-1.5 text-sm text-[var(--text-dim)]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            {studentCount} students online
          </div>

          {/* Speed Control */}
          <div className="flex items-center gap-1.5 text-xs text-[var(--text-dim)]">
            Speed:
            {[0.5, 1, 1.5, 2].map(s => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`px-2 py-0.5 rounded text-[11px] border transition-colors
                  ${speed === s
                    ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
                    : 'bg-transparent text-[var(--text-dim)] border-[var(--border)] hover:border-[var(--text-dim)]'
                  }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ═══ Main Layout ═══ */}
      <div className="flex flex-1 overflow-hidden">
        {/* ─── Sidebar ─── */}
        <aside className="w-[300px] bg-[var(--surface)] border-r border-[var(--border)] flex flex-col shrink-0">
          {/* Avatar */}
          <div className="p-5 border-b border-[var(--border)]">
            <Avatar isSpeaking={isSpeaking} />
          </div>

          {/* Topic list */}
          <div className="flex-1 overflow-y-auto p-3">
            {/* JEE Topics */}
            <div className="text-[10px] font-bold uppercase tracking-[1.5px] text-[var(--text-dim)] px-2 py-1.5">
              JEE Mains & Advanced
            </div>
            {topics.filter(t => t.exam === 'JEE').map(topic => (
              <button
                key={topic.id}
                onClick={() => handleTopicSelect(topic)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-[10px] text-left transition-all mb-0.5
                  ${selectedTopic?.id === topic.id
                    ? 'bg-[rgba(108,99,255,0.15)] border border-[rgba(108,99,255,0.3)]'
                    : 'hover:bg-[var(--surface2)] border border-transparent'
                  }`}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0"
                  style={{ background: `${topic.color}20`, color: topic.color }}
                >
                  {topic.icon}
                </div>
                <div className="min-w-0">
                  <div className="text-[13px] font-semibold truncate">{topic.title}</div>
                  <div className="text-[11px] text-[var(--text-dim)] truncate">{topic.titleHi}</div>
                </div>
              </button>
            ))}

            {/* NEET Topics */}
            <div className="text-[10px] font-bold uppercase tracking-[1.5px] text-[var(--text-dim)] px-2 py-1.5 mt-3">
              NEET Physics
            </div>
            {topics.filter(t => t.exam === 'NEET').map(topic => (
              <button
                key={topic.id}
                onClick={() => handleTopicSelect(topic)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-[10px] text-left transition-all mb-0.5
                  ${selectedTopic?.id === topic.id
                    ? 'bg-[rgba(108,99,255,0.15)] border border-[rgba(108,99,255,0.3)]'
                    : 'hover:bg-[var(--surface2)] border border-transparent'
                  }`}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0"
                  style={{ background: `${topic.color}20`, color: topic.color }}
                >
                  {topic.icon}
                </div>
                <div className="min-w-0">
                  <div className="text-[13px] font-semibold truncate">{topic.title}</div>
                  <div className="text-[11px] text-[var(--text-dim)] truncate">{topic.titleHi}</div>
                </div>
              </button>
            ))}
          </div>
        </aside>

        {/* ─── Main Content ─── */}
        <main className="flex-1 flex flex-col min-w-0">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-5 py-2.5 bg-[var(--surface)] border-b border-[var(--border)] shrink-0">
            <div className="font-bold text-base truncate">
              {selectedTopic ? selectedTopic.titleHi : 'Select a topic to begin'}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {isPlaying && (
                <button
                  onClick={stopLesson}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold
                    bg-red-500/15 text-red-400 border border-red-500/20 hover:bg-red-500/25 transition-colors"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="6" width="12" height="12" rx="1"/>
                  </svg>
                  Stop
                </button>
              )}
              <button
                onClick={startLesson}
                disabled={!selectedTopic || isPlaying}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold
                  bg-[var(--accent)] text-white shadow-[0_2px_12px_var(--accent-glow)]
                  hover:shadow-[0_4px_20px_var(--accent-glow)] hover:-translate-y-px
                  transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5,3 19,12 5,21"/>
                </svg>
                {isPlaying ? 'Playing...' : 'Start Lesson'}
              </button>
            </div>
          </div>

          {/* Progress */}
          <div className="h-[3px] mx-5 mt-2 bg-[var(--surface2)] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-[var(--accent)] to-green-400"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Whiteboard or Welcome */}
          {selectedTopic && currentStep >= 0 ? (
            <Whiteboard
              steps={selectedTopic.steps}
              currentStepIndex={currentStep}
              isPlaying={isPlaying}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center px-10 max-w-md">
                <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-[var(--accent)] to-purple-400 flex items-center justify-center shadow-[0_8px_32px_var(--accent-glow)]">
                  {selectedTopic ? (
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                      <polygon points="5,3 19,12 5,21"/>
                    </svg>
                  ) : (
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M12 16v-4M12 8h.01"/>
                    </svg>
                  )}
                </div>
                <h2 className="text-2xl font-bold mb-2">
                  {selectedTopic ? selectedTopic.title : 'AI Physics Teacher'}
                </h2>
                <p className="text-[var(--text-dim)] text-sm leading-relaxed">
                  {selectedTopic
                    ? `Click "Start Lesson" to watch Prof. Sharma solve this problem step-by-step in Hindi + English with voice explanation.`
                    : `Select a topic from the sidebar and click "Start Lesson" to watch Prof. Sharma teach JEE/NEET physics problems step-by-step on the virtual whiteboard.`
                  }
                </p>
                {!selectedTopic && (
                  <div className="mt-4 flex items-center justify-center gap-2 text-xs text-[var(--text-dim)]">
                    <span className="px-2 py-1 rounded bg-[var(--surface2)]">Hindi + English</span>
                    <span className="px-2 py-1 rounded bg-[var(--surface2)]">Voice Narration</span>
                    <span className="px-2 py-1 rounded bg-[var(--surface2)]">Ask Doubts</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Doubt Chat */}
          <DoubtChat
            currentTopic={selectedTopic?.id || ''}
            topicTitle={selectedTopic ? `${selectedTopic.title} — ${selectedTopic.titleHi}` : ''}
            coveredSteps={
              selectedTopic && currentStep >= 0
                ? selectedTopic.steps.slice(0, currentStep + 1).map(s => `${s.label}: ${s.text || s.math || ''}`)
                : []
            }
            onTeacherSpeak={handleDoubtSpeak}
          />
        </main>
      </div>
    </div>
  )
}
