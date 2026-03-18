'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import Avatar from '@/components/Avatar'
import Whiteboard from '@/components/Whiteboard'
import DoubtChat from '@/components/DoubtChat'
import ConceptHeatmap from '@/components/ConceptHeatmap'
import { topics as builtInTopics, type Topic, type Subject, type Difficulty } from '@/data/topics'
import { initTTS, setCallbacks, speak, stopSpeaking, getTTSMode } from '@/lib/tts'

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

const SUBJECTS: Subject[] = ['All', 'Physics', 'Chemistry', 'Mathematics']
const DIFFICULTIES: Difficulty[] = ['All', 'Easy', 'Medium', 'Hard']

const subjectColors: Record<string, string> = {
  All: 'var(--accent)',
  Physics: '#6c63ff',
  Chemistry: '#00bcd4',
  Mathematics: '#ff9800',
}

const difficultyColors: Record<string, string> = {
  Easy: '#00e676',
  Medium: '#ff9100',
  Hard: '#ff5252',
}

export default function Home() {
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentStep, setCurrentStep] = useState(-1)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [studentCount, setStudentCount] = useState(847)
  const [ttsMode, setTtsMode] = useState<string>('detecting')
  const [subject, setSubject] = useState<Subject>('All')
  const [difficulty, setDifficulty] = useState<Difficulty>('All')
  const [doubtHistory, setDoubtHistory] = useState<string[]>([])
  const [customTopics, setCustomTopics] = useState<Topic[]>([])

  // Load custom questions from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('jeetribe_custom_questions')
        if (saved) setCustomTopics(JSON.parse(saved))
      } catch { /* ignore */ }
    }
  }, [])

  // Combine built-in + custom topics
  const allTopics = useMemo(() => [...builtInTopics, ...customTopics], [customTopics])

  // Filtered topics
  const filteredTopics = useMemo(() => {
    return allTopics.filter(t => {
      if (subject !== 'All' && t.subject !== subject) return false
      if (difficulty !== 'All' && t.difficulty !== difficulty) return false
      return true
    })
  }, [subject, difficulty])

  // Init TTS
  useEffect(() => {
    initTTS()
    setCallbacks(
      () => setIsSpeaking(true),
      () => setIsSpeaking(false),
      (m) => setTtsMode(m),
    )
    setTimeout(() => setTtsMode(getTTSMode()), 3000)
  }, [])

  // Fake student count
  useEffect(() => {
    const interval = setInterval(() => {
      setStudentCount(c => Math.max(800, c + Math.floor(Math.random() * 7) - 3))
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const abortRef = useRef(false)

  const startLesson = useCallback(async () => {
    if (!selectedTopic) return
    abortRef.current = false
    setIsPlaying(true)
    setCurrentStep(-1)
    await sleep(300)

    for (let idx = 0; idx < selectedTopic.steps.length; idx++) {
      if (abortRef.current) break
      setCurrentStep(idx)
      const step = selectedTopic.steps[idx]
      if (step.speech && !abortRef.current) {
        await speak(step.speech, speed)
      }
      if (abortRef.current) break
      await sleep(400)
    }

    if (!abortRef.current) setIsPlaying(false)
  }, [selectedTopic, speed])

  const stopLesson = () => {
    abortRef.current = true
    setIsPlaying(false)
    setCurrentStep(-1)
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
          <div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-orange-500 to-yellow-400 flex items-center justify-center font-extrabold text-white text-sm">
            JT
          </div>
          <div className="font-bold text-lg">
            JEETribe<span className="text-orange-400"> AI</span>
          </div>
          <a href="/admin" className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[var(--surface2)] text-[var(--text-dim)] hover:text-white transition-colors">
            ⚙️ Admin
          </a>
          {isPlaying && (
            <div className="flex items-center gap-1.5 bg-red-500/15 text-red-400 px-3 py-1 rounded-full text-xs font-semibold">
              <div className="w-2 h-2 bg-red-400 rounded-full" style={{animation:'livePulse 1.5s infinite'}} />
              LIVE
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-sm text-[var(--text-dim)]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            {studentCount} online
          </div>

          <div className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
            ttsMode === 'api' ? 'bg-green-400/10 text-green-400'
              : ttsMode === 'detecting' ? 'bg-yellow-400/10 text-yellow-400'
              : 'bg-[var(--surface2)] text-[var(--text-dim)]'
          }`}>
            {ttsMode === 'api' ? '🔊 Neural' : ttsMode === 'detecting' ? '⏳...' : '🔈 Browser'}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-[var(--text-dim)]">
            Speed:
            {[0.5, 1, 1.5, 2].map(s => (
              <button key={s} onClick={() => setSpeed(s)}
                className={`px-2 py-0.5 rounded text-[11px] border transition-colors
                  ${speed === s ? 'bg-orange-500 text-white border-orange-500' : 'bg-transparent text-[var(--text-dim)] border-[var(--border)]'}`}>
                {s}x
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ═══ Main Layout ═══ */}
      <div className="flex flex-1 overflow-hidden">
        {/* ─── Sidebar ─── */}
        <aside className="w-[310px] bg-[var(--surface)] border-r border-[var(--border)] flex flex-col shrink-0">
          {/* Avatar */}
          <div className="p-4 border-b border-[var(--border)]">
            <Avatar isSpeaking={isSpeaking} />
          </div>

          {/* Concept Mastery Heatmap — shows when a topic is selected */}
          {selectedTopic && (
            <div className="px-3 pt-3 pb-1 border-b border-[var(--border)]">
              <ConceptHeatmap
                topicId={selectedTopic.id}
                currentStep={currentStep}
                doubtHistory={doubtHistory}
              />
            </div>
          )}

          {/* Subject Tabs */}
          <div className="px-3 pt-3 pb-1">
            <div className="flex gap-1">
              {SUBJECTS.map(s => (
                <button key={s} onClick={() => setSubject(s)}
                  className={`flex-1 px-1 py-1.5 rounded-lg text-[11px] font-semibold transition-all
                    ${subject === s
                      ? 'text-white'
                      : 'text-[var(--text-dim)] hover:bg-[var(--surface2)]'
                    }`}
                  style={subject === s ? { background: subjectColors[s] } : undefined}
                >
                  {s === 'All' ? '📚 All' : s === 'Physics' ? '⚡ Phy' : s === 'Chemistry' ? '🧪 Chem' : '📐 Math'}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty Filter */}
          <div className="px-3 pb-2">
            <div className="flex gap-1">
              {DIFFICULTIES.map(d => (
                <button key={d} onClick={() => setDifficulty(d)}
                  className={`flex-1 px-1 py-1 rounded-md text-[10px] font-semibold transition-all border
                    ${difficulty === d
                      ? 'text-white border-transparent'
                      : 'text-[var(--text-dim)] border-[var(--border)] hover:bg-[var(--surface2)]'
                    }`}
                  style={difficulty === d && d !== 'All'
                    ? { background: difficultyColors[d] }
                    : difficulty === d ? { background: 'var(--accent)' } : undefined
                  }
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Question count */}
          <div className="px-4 pb-2 text-[11px] text-[var(--text-dim)]">
            {filteredTopics.length} questions
          </div>

          {/* Topic list */}
          <div className="flex-1 overflow-y-auto px-3 pb-3">
            {filteredTopics.map(topic => (
              <button
                key={topic.id}
                onClick={() => handleTopicSelect(topic)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-[10px] text-left transition-all mb-1
                  ${selectedTopic?.id === topic.id
                    ? 'bg-[rgba(108,99,255,0.15)] border border-[rgba(108,99,255,0.3)]'
                    : 'hover:bg-[var(--surface2)] border border-transparent'
                  }`}
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0"
                  style={{ background: `${topic.color}20`, color: topic.color }}>
                  {topic.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[12px] font-semibold truncate">{topic.title}</div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[9px] px-1.5 py-0.5 rounded font-semibold"
                      style={{ background: `${difficultyColors[topic.difficulty]}20`, color: difficultyColors[topic.difficulty] }}>
                      {topic.difficulty}
                    </span>
                    <span className="text-[9px] text-[var(--text-dim)]">{topic.exam}</span>
                    <span className="text-[9px] text-[var(--text-dim)]">• {topic.chapter}</span>
                  </div>
                </div>
              </button>
            ))}

            {filteredTopics.length === 0 && (
              <div className="text-center text-sm text-[var(--text-dim)] py-8">
                No questions match this filter
              </div>
            )}
          </div>
        </aside>

        {/* ─── Main Content ─── */}
        <main className="flex-1 flex flex-col min-w-0">
          <div className="flex items-center justify-between px-5 py-2.5 bg-[var(--surface)] border-b border-[var(--border)] shrink-0">
            <div className="font-bold text-base truncate">
              {selectedTopic ? selectedTopic.titleHi : 'Question select karo →'}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {isPlaying && (
                <button onClick={stopLesson}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-red-500/15 text-red-400 border border-red-500/20 hover:bg-red-500/25 transition-colors">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="1"/></svg>
                  Stop
                </button>
              )}
              <button onClick={startLesson} disabled={!selectedTopic || isPlaying}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-orange-500 text-white shadow-[0_2px_12px_rgba(255,150,0,0.3)] hover:shadow-[0_4px_20px_rgba(255,150,0,0.3)] hover:-translate-y-px transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>
                {isPlaying ? 'Playing...' : 'Start Lesson'}
              </button>
            </div>
          </div>

          {/* Progress */}
          <div className="h-[3px] mx-5 mt-2 bg-[var(--surface2)] rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-orange-500 to-yellow-400"
              style={{ width: `${progress}%` }} />
          </div>

          {/* Whiteboard or Welcome */}
          {selectedTopic && currentStep >= 0 ? (
            <Whiteboard steps={selectedTopic.steps} currentStepIndex={currentStep} isPlaying={isPlaying} diagram={selectedTopic.diagram} />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center px-10 max-w-md">
                <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-orange-500 to-yellow-400 flex items-center justify-center shadow-[0_8px_32px_rgba(255,150,0,0.3)]">
                  {selectedTopic ? (
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><polygon points="5,3 19,12 5,21"/></svg>
                  ) : (
                    <span className="text-3xl">🎯</span>
                  )}
                </div>
                <h2 className="text-2xl font-bold mb-2">
                  {selectedTopic ? selectedTopic.title : 'JEETribe AI'}
                </h2>
                <p className="text-[var(--text-dim)] text-sm leading-relaxed">
                  {selectedTopic
                    ? `"Start Lesson" press karo — Prof. Sharma step-by-step solve karenge Hindi + English mein.`
                    : `30 NTA-style questions — Physics, Chemistry, Maths. Easy se Hard tak. Select karo aur AI teacher se seekho!`
                  }
                </p>
                {!selectedTopic && (
                  <div className="mt-4 flex items-center justify-center gap-2 text-xs text-[var(--text-dim)]">
                    <span className="px-2 py-1 rounded bg-[var(--surface2)]">⚡ Physics</span>
                    <span className="px-2 py-1 rounded bg-[var(--surface2)]">🧪 Chemistry</span>
                    <span className="px-2 py-1 rounded bg-[var(--surface2)]">📐 Maths</span>
                    <span className="px-2 py-1 rounded bg-[var(--surface2)]">🗣️ Hinglish</span>
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
            onDoubtAsked={(q) => setDoubtHistory(prev => [...prev, q])}
          />
        </main>
      </div>
    </div>
  )
}
