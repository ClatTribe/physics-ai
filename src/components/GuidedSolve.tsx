'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import type { Step, Topic } from '@/data/types'
import { speak, stopSpeaking } from '@/lib/tts'

interface StepResult {
  stepIndex: number
  correct: boolean
  weakSkill?: string
  attempts: number
  studentAnswer: string
  feedback: string
}

interface GuidedSolveProps {
  topic: Topic
  professorName: string
  speed: number
  onComplete: (results: StepResult[]) => void
  onWeakSkillFound: (skill: string) => void
}

export default function GuidedSolve({ topic, professorName, speed, onComplete, onWeakSkillFound }: GuidedSolveProps) {
  const [currentStepIdx, setCurrentStepIdx] = useState(0)
  const [input, setInput] = useState('')
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [results, setResults] = useState<StepResult[]>([])
  const [currentFeedback, setCurrentFeedback] = useState<{ text: string; correct: boolean; weakSkill?: string } | null>(null)
  const [attempts, setAttempts] = useState(0)
  const [showCorrect, setShowCorrect] = useState(false)
  const [completed, setCompleted] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Problem steps (skip the first "Problem Statement" step and last "Final Answer" step)
  const solvableSteps = topic.steps.filter(s => !s.isAnswer && topic.steps.indexOf(s) > 0)
  const problemStatement = topic.steps[0]
  const currentStep = solvableSteps[currentStepIdx]
  const totalSolvable = solvableSteps.length

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [results, currentFeedback])

  // Speak the problem statement on mount
  useEffect(() => {
    if (problemStatement?.speech) {
      speak(problemStatement.speech, speed)
    }
    return () => stopSpeaking()
  }, [])

  const evaluate = useCallback(async () => {
    if (!input.trim() || isEvaluating || !currentStep) return
    const answer = input.trim()
    setIsEvaluating(true)
    setCurrentFeedback(null)

    const stepContent = `${currentStep.label}\n${currentStep.text || ''}\n${currentStep.math || ''} ${currentStep.math2 || ''} ${currentStep.math3 || ''}`

    try {
      const res = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          professorName,
          topicTitle: topic.title,
          stepLabel: currentStep.label,
          stepContent,
          studentAnswer: answer,
          stepIndex: currentStepIdx,
          totalSteps: totalSolvable,
          previousCorrect: results.filter(r => r.correct).map(r => solvableSteps[r.stepIndex]?.label),
          previousWrong: results.filter(r => !r.correct).map(r => r.weakSkill).filter(Boolean),
          attemptNumber: attempts + 1,
        }),
      })

      const data = await res.json()

      if (data.fallback) {
        setCurrentFeedback({ text: 'Could not evaluate. Moving to next step.', correct: true })
        moveToNext(answer, true, undefined, 'N/A')
        setIsEvaluating(false)
        return
      }

      const feedback = data.feedback || ''
      const isCorrect = !!data.correct

      setCurrentFeedback({ text: feedback, correct: isCorrect, weakSkill: data.weakSkill })

      // Speak feedback
      if (feedback) speak(feedback, speed)

      if (isCorrect) {
        moveToNext(answer, true, undefined, feedback)
      } else {
        setAttempts(prev => prev + 1)
        if (data.weakSkill) onWeakSkillFound(data.weakSkill)

        if (attempts >= 2) {
          // 3rd wrong attempt — show correct answer and move on
          setShowCorrect(true)
          moveToNext(answer, false, data.weakSkill, feedback)
        }
      }
    } catch {
      setCurrentFeedback({ text: 'Evaluation failed.', correct: false })
    }

    setIsEvaluating(false)
  }, [input, currentStep, currentStepIdx, attempts, results, professorName, topic, speed])

  const moveToNext = (answer: string, correct: boolean, weakSkill: string | undefined, feedback: string) => {
    setResults(prev => [...prev, {
      stepIndex: currentStepIdx, correct, weakSkill, attempts: attempts + 1, studentAnswer: answer, feedback,
    }])

    setTimeout(() => {
      if (currentStepIdx + 1 < totalSolvable) {
        setCurrentStepIdx(prev => prev + 1)
        setInput('')
        setAttempts(0)
        setCurrentFeedback(null)
        setShowCorrect(false)
      } else {
        setCompleted(true)
        const finalResults = [...results, { stepIndex: currentStepIdx, correct, weakSkill, attempts: attempts + 1, studentAnswer: answer, feedback }]
        onComplete(finalResults)
      }
    }, correct ? 1500 : 2500)
  }

  const skipStep = () => {
    setCurrentFeedback({ text: 'Step skipped — marked as needs review.', correct: false, weakSkill: 'Skipped' })
    onWeakSkillFound('Skipped')
    moveToNext('(skipped)', false, 'Skipped', 'Step skipped')
  }

  // ═══ Summary after completion ═══
  if (completed) {
    const allResults = results
    const correctCount = allResults.filter(r => r.correct).length
    const weakSet = new Set(allResults.filter(r => !r.correct && r.weakSkill).map(r => r.weakSkill!))
    const weakSkills: string[] = []; weakSet.forEach(s => weakSkills.push(s))
    const percentage = Math.round((correctCount / totalSolvable) * 100)

    return (
      <div className="flex-1 mx-5 mb-2 rounded-2xl border-2 border-[#1a3a1a] overflow-hidden"
        style={{ background: 'var(--whiteboard)', boxShadow: 'inset 0 2px 20px rgba(0,0,0,0.4)' }}>
        <div className="p-8 h-full overflow-y-auto">
          <div className="text-center mb-6">
            <div className="text-4xl mb-3">{percentage >= 80 ? '🏆' : percentage >= 50 ? '💪' : '📚'}</div>
            <div className="text-2xl font-bold text-white mb-1">Practice Complete!</div>
            <div className="text-[var(--text-dim)]">{topic.title}</div>
          </div>

          {/* Score */}
          <div className="flex justify-center gap-6 mb-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400">{correctCount}</div>
              <div className="text-xs text-[var(--text-dim)]">Correct</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-400">{totalSolvable - correctCount}</div>
              <div className="text-xs text-[var(--text-dim)]">Wrong</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-400">{percentage}%</div>
              <div className="text-xs text-[var(--text-dim)]">Score</div>
            </div>
          </div>

          {/* Weak skills identified */}
          {weakSkills.length > 0 && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
              <div className="text-sm font-bold text-red-400 mb-2">🔴 Weak Skills Identified</div>
              <div className="flex flex-wrap gap-2">
                {weakSkills.map(skill => (
                  <span key={skill} className="px-3 py-1 rounded-full bg-red-500/20 text-red-300 text-xs font-semibold">{skill}</span>
                ))}
              </div>
              <div className="text-xs text-red-300/60 mt-2">These aren't about "Physics" — they're specific sub-skills you can work on.</div>
            </div>
          )}

          {/* Step-by-step breakdown */}
          <div className="space-y-2">
            {allResults.map((r, i) => (
              <div key={i} className={`flex items-center gap-3 px-3 py-2 rounded-lg ${r.correct ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                <span className="text-lg">{r.correct ? '✅' : '❌'}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-[var(--text)]">{solvableSteps[r.stepIndex]?.label}</div>
                  {!r.correct && r.weakSkill && (
                    <div className="text-[10px] text-red-400">Weak: {r.weakSkill} (attempts: {r.attempts})</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ═══ Active Solving UI ═══
  return (
    <div className="flex-1 mx-5 mb-2 rounded-2xl border-2 border-[#1a3a1a] overflow-hidden flex flex-col"
      style={{ background: 'var(--whiteboard)', boxShadow: 'inset 0 2px 20px rgba(0,0,0,0.4)' }}>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6">
        {/* Problem Statement (always visible) */}
        <div className="mb-5 p-4 rounded-xl bg-[rgba(108,99,255,0.08)] border border-[rgba(108,99,255,0.2)]">
          <div className="text-xs font-bold text-[var(--accent)] uppercase tracking-wider mb-1.5">{problemStatement?.label}</div>
          <div className="text-sm text-[var(--chalk)] leading-relaxed">{problemStatement?.text}</div>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-2 mb-5">
          {solvableSteps.map((_, i) => {
            const result = results.find(r => r.stepIndex === i)
            return (
              <div key={i} className="flex-1 h-2 rounded-full overflow-hidden bg-[var(--surface2)]">
                <div className={`h-full rounded-full transition-all duration-500 ${
                  i === currentStepIdx ? 'bg-orange-500 w-1/2' :
                  result?.correct ? 'bg-green-500 w-full' :
                  result && !result.correct ? 'bg-red-500 w-full' :
                  'w-0'
                }`} />
              </div>
            )
          })}
          <span className="text-[10px] text-[var(--text-dim)] shrink-0">{currentStepIdx + 1}/{totalSolvable}</span>
        </div>

        {/* Completed steps */}
        {results.map((r, i) => (
          <div key={i} className={`mb-3 p-3 rounded-lg ${r.correct ? 'bg-green-500/8 border border-green-500/20' : 'bg-red-500/8 border border-red-500/20'}`}>
            <div className="flex items-center gap-2 mb-1">
              <span>{r.correct ? '✅' : '❌'}</span>
              <span className="text-xs font-bold text-[var(--text-dim)]">{solvableSteps[r.stepIndex]?.label}</span>
              {!r.correct && r.weakSkill && <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400">{r.weakSkill}</span>}
            </div>
            <div className="text-xs text-[var(--text-dim)]">Your answer: {r.studentAnswer}</div>
          </div>
        ))}

        {/* Current step prompt */}
        {currentStep && (
          <div className="mb-4 p-4 rounded-xl bg-orange-500/8 border-2 border-orange-500/30">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-bold text-orange-400 uppercase tracking-wider">
                Step {currentStepIdx + 1}: {currentStep.label}
              </div>
              {attempts > 0 && (
                <span className="text-[9px] px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-400">Attempt {attempts + 1}</span>
              )}
            </div>
            {currentStep.text && (
              <div className="text-sm text-[var(--chalk)] mb-2">{currentStep.text}</div>
            )}
            <div className="text-xs text-orange-400/60 mt-1">
              Write your answer — show your working (formula, substitution, calculation)
            </div>
          </div>
        )}

        {/* Show correct answer after 3 wrong attempts */}
        {showCorrect && currentStep && (
          <div className="mb-4 p-4 rounded-xl bg-[rgba(0,230,118,0.08)] border border-green-500/20">
            <div className="text-xs font-bold text-green-400 mb-1">Correct Answer:</div>
            <div className="text-sm text-[var(--chalk)] font-mono">
              {currentStep.math || currentStep.text || ''}
              {currentStep.math2 && <div className="mt-1">{currentStep.math2}</div>}
            </div>
          </div>
        )}

        {/* Feedback */}
        {currentFeedback && (
          <div className={`mb-4 p-3 rounded-xl ${
            currentFeedback.correct ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'
          }`}>
            <div className="flex items-center gap-2 mb-1">
              <span>{currentFeedback.correct ? '✅' : '❌'}</span>
              <span className="text-xs font-bold text-[var(--text)]">{professorName}</span>
              {currentFeedback.weakSkill && (
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400">Weak: {currentFeedback.weakSkill}</span>
              )}
            </div>
            <div className="text-sm text-[var(--chalk)]">{currentFeedback.text}</div>
          </div>
        )}
      </div>

      {/* Input area */}
      {!completed && currentStep && (
        <div className="border-t border-[rgba(184,255,184,0.08)] bg-[rgba(0,0,0,0.15)] p-4">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); evaluate() } }}
            placeholder={`Step ${currentStepIdx + 1}: Apna answer likho... (formula, values, calculation)`}
            rows={3}
            className="w-full px-4 py-3 bg-[var(--surface2)] border border-[var(--border)] rounded-xl text-[var(--text)] text-sm outline-none focus:border-orange-500 transition-colors placeholder:text-[var(--text-dim)] resize-none font-mono"
          />
          <div className="flex items-center justify-between mt-2">
            <button onClick={skipStep}
              className="text-xs text-[var(--text-dim)] hover:text-orange-400 transition-colors">
              Skip this step →
            </button>
            <div className="flex items-center gap-2">
              {isEvaluating && <span className="text-xs text-[var(--text-dim)]">Checking...</span>}
              <button onClick={evaluate} disabled={!input.trim() || isEvaluating}
                className="px-5 py-2 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                {isEvaluating ? '⏳ Evaluating...' : '✏️ Submit Step'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
