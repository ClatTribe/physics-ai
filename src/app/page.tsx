'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import Avatar from '@/components/Avatar'
import Whiteboard from '@/components/Whiteboard'
import DoubtChat from '@/components/DoubtChat'
import ConceptHeatmap from '@/components/ConceptHeatmap'
import { topics as builtInTopics, type Topic, type Subject, type Difficulty } from '@/data/topics'
import { initTTS, setCallbacks, speak, stopSpeaking, getTTSMode } from '@/lib/tts'
import { professors, defaultProfessor } from '@/data/professors'
import type { Step } from '@/data/types'

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

const SUBJECTS: Subject[] = ['All', 'Physics', 'Chemistry', 'Mathematics']
const DIFFICULTIES: Difficulty[] = ['All', 'Easy', 'Medium', 'Hard']

const subjectColors: Record<string, string> = {
  All: 'var(--accent)', Physics: '#6c63ff', Chemistry: '#00bcd4', Mathematics: '#ff9800',
}
const difficultyColors: Record<string, string> = {
  Easy: '#00e676', Medium: '#ff9100', Hard: '#ff5252',
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

  // ═══ LESSON PAUSE/DOUBT STATE ═══
  const [isPaused, setIsPaused] = useState(false)
  // Extra steps injected by AI when re-explaining during a doubt
  const [extraSteps, setExtraSteps] = useState<Step[]>([])
  // All steps = original + injected extra steps
  const displaySteps = useMemo(() => {
    if (!selectedTopic) return []
    // Insert extra steps right after the current step
    if (extraSteps.length > 0 && currentStep >= 0) {
      const before = selectedTopic.steps.slice(0, currentStep + 1)
      const after = selectedTopic.steps.slice(currentStep + 1)
      return [...before, ...extraSteps, ...after]
    }
    return selectedTopic.steps
  }, [selectedTopic, extraSteps, currentStep])

  // Display step index accounts for extra steps
  const displayStepIndex = currentStep >= 0 ? currentStep + (isPaused || extraSteps.length > 0 ? extraSteps.length : 0) : -1

  const [weakSpots, setWeakSpots] = useState<string[]>([])

  // Pause mechanism: a promise that the lesson loop awaits
  const pauseResolveRef = useRef<(() => void) | null>(null)
  const abortRef = useRef(false)

  // Track doubts asked per step (for adapting explanations)
  const stepDoubtsRef = useRef<Map<number, string[]>>(new Map())

  // Load custom questions
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('jeetribe_custom_questions')
        if (saved) setCustomTopics(JSON.parse(saved))
      } catch { /* ignore */ }
    }
  }, [])

  const allTopics = useMemo(() => [...builtInTopics, ...customTopics], [customTopics])

  // Current professor based on selected topic's subject
  const currentProfessor = useMemo(() => {
    if (selectedTopic) return professors[selectedTopic.subject] || defaultProfessor
    return defaultProfessor
  }, [selectedTopic])

  const filteredTopics = useMemo(() => {
    return allTopics.filter(t => {
      if (subject !== 'All' && t.subject !== subject) return false
      if (difficulty !== 'All' && t.difficulty !== difficulty) return false
      return true
    })
  }, [allTopics, subject, difficulty])

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

  useEffect(() => {
    const interval = setInterval(() => {
      setStudentCount(c => Math.max(800, c + Math.floor(Math.random() * 7) - 3))
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  // ═══ LESSON LOOP — pauses on doubt, waits for understanding ═══
  const startLesson = useCallback(async () => {
    if (!selectedTopic) return
    abortRef.current = false
    setIsPlaying(true)
    setIsPaused(false)
    setCurrentStep(-1)
    setExtraSteps([])
    stepDoubtsRef.current = new Map()
    await sleep(300)

    for (let idx = 0; idx < selectedTopic.steps.length; idx++) {
      if (abortRef.current) break

      // Build adapted speech: if student had doubts on previous steps,
      // tell Gemini to be more careful/slow on similar concepts
      const prevDoubts = Array.from(stepDoubtsRef.current.values()).flat()

      setCurrentStep(idx)
      setExtraSteps([]) // Clear any extra steps from previous doubt

      const step = selectedTopic.steps[idx]
      if (step.speech && !abortRef.current) {
        // If student struggled before, add a gentle recap prefix
        let speechText = step.speech
        if (prevDoubts.length > 0 && idx > 0) {
          speechText = step.speech // Normal speech — adaptation happens in doubt response
        }
        await speak(speechText, speed)
      }

      if (abortRef.current) break

      // ─── Check if paused (student asked a doubt) ───
      // The lesson loop WAITS HERE until the student clicks "Continue"
      if (isPausedRef.current) {
        await new Promise<void>(resolve => {
          pauseResolveRef.current = resolve
        })
        // After resume, clear extra steps and continue
        setExtraSteps([])
      }

      if (abortRef.current) break
      await sleep(400)
    }

    if (!abortRef.current) setIsPlaying(false)
  }, [selectedTopic, speed])

  // We need a ref for isPaused so the async loop can read it
  const isPausedRef = useRef(false)
  useEffect(() => { isPausedRef.current = isPaused }, [isPaused])

  const stopLesson = () => {
    abortRef.current = true
    setIsPlaying(false)
    setIsPaused(false)
    setCurrentStep(-1)
    setExtraSteps([])
    stopSpeaking()
    // Release any pending pause
    if (pauseResolveRef.current) {
      pauseResolveRef.current()
      pauseResolveRef.current = null
    }
  }

  // ═══ DOUBT HANDLER — pauses lesson, gets AI re-explanation ═══
  const handleDoubtDuringLesson = useCallback(async (question: string, aiResponse: string) => {
    if (!isPlaying || currentStep < 0) return

    // 1. Pause the lesson
    stopSpeaking()
    setIsPaused(true)
    isPausedRef.current = true

    // Track this doubt for the current step
    const existing = stepDoubtsRef.current.get(currentStep) || []
    stepDoubtsRef.current.set(currentStep, [...existing, question])

    // 2. Inject AI re-explanation as an extra whiteboard step
    const extraStep: Step = {
      label: '🧠 Re-explanation — Doubt Clarification',
      text: aiResponse,
      speech: aiResponse,
      highlight: true,
    }
    setExtraSteps([extraStep])

    // 3. Speak the re-explanation
    await speak(aiResponse, speed)
  }, [isPlaying, currentStep, speed])

  // Student clicks "Got it! Continue" — resumes the lesson
  const handleResume = useCallback(() => {
    setIsPaused(false)
    isPausedRef.current = false
    setExtraSteps([])
    if (pauseResolveRef.current) {
      pauseResolveRef.current()
      pauseResolveRef.current = null
    }
  }, [])

  const handleTopicSelect = (topic: Topic) => {
    if (isPlaying) stopLesson()
    setSelectedTopic(topic)
    setCurrentStep(-1)
    setExtraSteps([])
    setDoubtHistory([])
  }

  const handleDoubtSpeak = (text: string) => {
    // Only speak if NOT paused (during pause, handleDoubtDuringLesson speaks)
    if (!isPaused) speak(text, speed)
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
          {isPlaying && !isPaused && (
            <div className="flex items-center gap-1.5 bg-red-500/15 text-red-400 px-3 py-1 rounded-full text-xs font-semibold">
              <div className="w-2 h-2 bg-red-400 rounded-full" style={{animation:'livePulse 1.5s infinite'}} />
              LIVE
            </div>
          )}
          {isPaused && (
            <div className="flex items-center gap-1.5 bg-orange-500/15 text-orange-400 px-3 py-1 rounded-full text-xs font-semibold">
              ⏸️ PAUSED — Doubt Mode
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-sm text-[var(--text-dim)]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
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
          <div className="p-4 border-b border-[var(--border)]">
            <Avatar isSpeaking={isSpeaking} professor={currentProfessor} />
          </div>

          {selectedTopic && (
            <div className="px-3 pt-3 pb-1 border-b border-[var(--border)]">
              <ConceptHeatmap topicId={selectedTopic.id} currentStep={currentStep} doubtHistory={doubtHistory} weakSpots={weakSpots} />
            </div>
          )}

          <div className="px-3 pt-3 pb-1">
            <div className="flex gap-1">
              {SUBJECTS.map(s => (
                <button key={s} onClick={() => setSubject(s)}
                  className={`flex-1 px-1 py-1.5 rounded-lg text-[11px] font-semibold transition-all
                    ${subject === s ? 'text-white' : 'text-[var(--text-dim)] hover:bg-[var(--surface2)]'}`}
                  style={subject === s ? { background: subjectColors[s] } : undefined}>
                  {s === 'All' ? '📚 All' : s === 'Physics' ? '⚡ Phy' : s === 'Chemistry' ? '🧪 Chem' : '📐 Math'}
                </button>
              ))}
            </div>
          </div>

          <div className="px-3 pb-2">
            <div className="flex gap-1">
              {DIFFICULTIES.map(d => (
                <button key={d} onClick={() => setDifficulty(d)}
                  className={`flex-1 px-1 py-1 rounded-md text-[10px] font-semibold transition-all border
                    ${difficulty === d ? 'text-white border-transparent' : 'text-[var(--text-dim)] border-[var(--border)] hover:bg-[var(--surface2)]'}`}
                  style={difficulty === d && d !== 'All' ? { background: difficultyColors[d] } : difficulty === d ? { background: 'var(--accent)' } : undefined}>
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="px-4 pb-2 text-[11px] text-[var(--text-dim)]">{filteredTopics.length} questions</div>

          <div className="flex-1 overflow-y-auto px-3 pb-3">
            {filteredTopics.map(topic => (
              <button key={topic.id} onClick={() => handleTopicSelect(topic)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-[10px] text-left transition-all mb-1
                  ${selectedTopic?.id === topic.id ? 'bg-[rgba(108,99,255,0.15)] border border-[rgba(108,99,255,0.3)]' : 'hover:bg-[var(--surface2)] border border-transparent'}`}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0"
                  style={{ background: `${topic.color}20`, color: topic.color }}>{topic.icon}</div>
                <div className="min-w-0 flex-1">
                  <div className="text-[12px] font-semibold truncate">{topic.title}</div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[9px] px-1.5 py-0.5 rounded font-semibold"
                      style={{ background: `${difficultyColors[topic.difficulty]}20`, color: difficultyColors[topic.difficulty] }}>{topic.difficulty}</span>
                    <span className="text-[9px] text-[var(--text-dim)]">{topic.exam}</span>
                    <span className="text-[9px] text-[var(--text-dim)]">• {topic.chapter}</span>
                  </div>
                </div>
              </button>
            ))}
            {filteredTopics.length === 0 && (
              <div className="text-center text-sm text-[var(--text-dim)] py-8">No questions match this filter</div>
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
              {isPaused && (
                <button onClick={handleResume}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-green-500 text-white shadow-[0_2px_12px_rgba(0,230,118,0.3)] hover:bg-green-600 transition-colors animate-pulse">
                  ✅ Samajh aa gaya! Continue →
                </button>
              )}
              {isPlaying && !isPaused && (
                <button onClick={stopLesson}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-red-500/15 text-red-400 border border-red-500/20 hover:bg-red-500/25 transition-colors">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="1"/></svg>
                  Stop
                </button>
              )}
              <button onClick={startLesson} disabled={!selectedTopic || isPlaying}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-orange-500 text-white shadow-[0_2px_12px_rgba(255,150,0,0.3)] hover:shadow-[0_4px_20px_rgba(255,150,0,0.3)] hover:-translate-y-px transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>
                {isPlaying ? (isPaused ? 'Paused' : 'Playing...') : 'Start Lesson'}
              </button>
            </div>
          </div>

          <div className="h-[3px] mx-5 mt-2 bg-[var(--surface2)] rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-orange-500 to-yellow-400"
              style={{ width: `${progress}%` }} />
          </div>

          {selectedTopic && currentStep >= 0 ? (
            <Whiteboard
              steps={displaySteps}
              currentStepIndex={currentStep + extraSteps.length}
              isPlaying={isPlaying}
              diagram={selectedTopic.diagram}
            />
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
                    : `30 NTA-style questions — Physics, Chemistry, Maths. Easy se Hard tak. Select karo aur AI teacher se seekho!`}
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

          <DoubtChat
            currentTopic={selectedTopic?.id || ''}
            topicTitle={selectedTopic ? `${selectedTopic.title} — ${selectedTopic.titleHi}` : ''}
            professorName={currentProfessor.name}
            coveredSteps={
              selectedTopic && currentStep >= 0
                ? selectedTopic.steps.slice(0, currentStep + 1).map(s => `${s.label}: ${s.text || ''} ${s.math || ''} ${s.math2 || ''} ${s.math3 || ''}`.trim())
                : []
            }
            isLessonActive={isPlaying}
            isPaused={isPaused}
            currentStepLabel={selectedTopic && currentStep >= 0 ? selectedTopic.steps[currentStep]?.label : ''}
            currentStepContent={
              selectedTopic && currentStep >= 0
                ? (() => {
                    const s = selectedTopic.steps[currentStep]
                    return `Label: ${s.label}\nText: ${s.text || 'N/A'}\nFormula 1: ${s.math || 'N/A'}\nFormula 2: ${s.math2 || 'N/A'}\nFormula 3: ${s.math3 || 'N/A'}\nNarration: ${s.speech || 'N/A'}`
                  })()
                : ''
            }
            onTeacherSpeak={handleDoubtSpeak}
            onDoubtAsked={(q) => setDoubtHistory(prev => [...prev, q])}
            onDoubtDuringLesson={handleDoubtDuringLesson}
            onWeakSpotUpdate={setWeakSpots}
          />
        </main>
      </div>
    </div>
  )
}
