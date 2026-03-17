'use client'

import { useEffect, useRef, useState } from 'react'
import type { Step } from '@/data/topics'

interface WhiteboardProps {
  steps: Step[]
  currentStepIndex: number
  isPlaying: boolean
}

// Lazy KaTeX rendering
function MathBlock({ latex, highlight }: { latex: string; highlight?: boolean }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (ref.current && typeof window !== 'undefined') {
      import('katex').then(katex => {
        try {
          katex.default.render(latex, ref.current!, {
            displayMode: true,
            throwOnError: false,
          })
        } catch {
          if (ref.current) ref.current.textContent = latex
        }
      })
    }
  }, [latex])

  return (
    <div
      ref={ref}
      className={highlight ? 'math-highlight' : 'math-block'}
    />
  )
}

function StepCard({ step, visible }: { step: Step; visible: boolean }) {
  if (step.isAnswer) {
    return (
      <div
        className={`mt-5 p-4 rounded-xl border transition-all duration-500
          ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
          bg-[rgba(0,230,118,0.08)] border-[rgba(0,230,118,0.2)]`}
      >
        <div className="text-xs font-bold text-green-400 uppercase tracking-wider mb-2">
          ✓ Final Answer
        </div>
        {step.math && <MathBlock latex={step.math} />}
      </div>
    )
  }

  return (
    <div
      className={`mb-6 transition-all duration-600
        ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
    >
      {step.label && (
        <div className="text-xs font-bold uppercase tracking-wider text-[var(--orange)] mb-1.5">
          {step.label}
        </div>
      )}
      {step.text && (
        <div className="text-sm text-[var(--chalk)] leading-relaxed whitespace-pre-line">
          {step.text}
        </div>
      )}
      {step.math && <MathBlock latex={step.math} highlight={step.highlight} />}
      {step.math2 && <MathBlock latex={step.math2} />}
      {step.math3 && <MathBlock latex={step.math3} />}
    </div>
  )
}

export default function Whiteboard({ steps, currentStepIndex, isPlaying }: WhiteboardProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      })
    }
  }, [currentStepIndex])

  return (
    <div className="flex-1 mx-5 mb-2 rounded-2xl border-2 border-[#1a3a1a] relative overflow-hidden"
      style={{
        background: 'var(--whiteboard)',
        boxShadow: 'inset 0 2px 20px rgba(0,0,0,0.4)',
      }}
    >
      {/* Board texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse at 20% 50%, rgba(0,80,0,0.08) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 50%, rgba(0,60,0,0.06) 0%, transparent 50%)
          `
        }}
      />

      <div ref={scrollRef} className="relative z-10 p-8 h-full overflow-y-auto">
        {steps.slice(0, currentStepIndex + 1).map((step, idx) => (
          <StepCard key={idx} step={step} visible={idx <= currentStepIndex} />
        ))}
      </div>
    </div>
  )
}
