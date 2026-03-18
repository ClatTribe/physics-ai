'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import type { DiagramConfig } from '@/data/types'

interface Props {
  diagram: DiagramConfig
  currentStep: number
  showElements: string[]
  onParamChange?: (params: Record<string, number>, results: Record<string, number>) => void
}

/** ────────────────────────────────────────────
 *  Interactive Physics Canvas
 *  Renders animated SVG diagrams with sliders
 *  ──────────────────────────────────────────── */
export default function PhysicsCanvas({ diagram, currentStep, showElements, onParamChange }: Props) {
  // Live param values (from sliders)
  const [params, setParams] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {}
    for (const [k, v] of Object.entries(diagram.params)) initial[k] = v.value
    return initial
  })

  // Reset params when diagram changes
  useEffect(() => {
    const initial: Record<string, number> = {}
    for (const [k, v] of Object.entries(diagram.params)) initial[k] = v.value
    setParams(initial)
  }, [diagram])

  // Calculate derived values
  const results = useMemo(() => calculate(diagram.type, params), [diagram.type, params])

  // Notify parent of changes
  useEffect(() => {
    onParamChange?.(params, results)
  }, [params, results, onParamChange])

  const handleSlider = useCallback((key: string, val: number) => {
    setParams(p => ({ ...p, [key]: val }))
  }, [])

  const vis = new Set(showElements)

  return (
    <div className="rounded-xl border border-[rgba(184,255,184,0.1)] bg-[rgba(0,0,0,0.2)] overflow-hidden">
      {/* SVG Diagram */}
      <div className="relative" style={{ minHeight: 240 }}>
        <svg viewBox="0 0 600 280" className="w-full" style={{ maxHeight: 280 }}>
          <defs>
            <marker id="arrowGreen" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="#00e676" />
            </marker>
            <marker id="arrowRed" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="#ff5252" />
            </marker>
            <marker id="arrowBlue" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="#64b5f6" />
            </marker>
            <marker id="arrowWhite" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="#fff" />
            </marker>
          </defs>

          {diagram.type === 'atwood' && <AtwoodDiagram params={params} results={results} vis={vis} step={currentStep} />}
          {diagram.type === 'projectile' && <ProjectileDiagram params={params} results={results} vis={vis} step={currentStep} />}
          {diagram.type === 'pendulum' && <PendulumDiagram params={params} results={results} vis={vis} step={currentStep} />}
          {diagram.type === 'lens' && <LensDiagram params={params} results={results} vis={vis} step={currentStep} />}
        </svg>

        {/* Live calculated values overlay */}
        {Object.keys(results).length > 0 && currentStep >= 2 && (
          <div className="absolute top-2 right-2 bg-black/60 rounded-lg px-3 py-2 text-[11px] space-y-0.5">
            {Object.entries(results).map(([k, v]) => (
              <div key={k} className="flex items-center gap-2">
                <span className="text-[var(--text-dim)]">{k}:</span>
                <span className="text-green-400 font-mono font-bold">{typeof v === 'number' ? v.toFixed(2) : v}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sliders */}
      {Object.keys(diagram.params).length > 0 && (
        <div className="px-4 py-3 border-t border-[rgba(184,255,184,0.08)] bg-[rgba(0,0,0,0.15)]">
          <div className="text-[10px] font-bold text-orange-400 uppercase tracking-wider mb-2">
            ⚡ Change Parameters — See What Happens!
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2">
            {Object.entries(diagram.params).map(([key, cfg]) => (
              <div key={key}>
                <div className="flex justify-between text-[11px] mb-0.5">
                  <span className="text-[var(--text-dim)]">{cfg.label}</span>
                  <span className="text-white font-mono font-bold">{params[key]}{cfg.unit}</span>
                </div>
                <input
                  type="range"
                  min={cfg.min} max={cfg.max} step={cfg.step}
                  value={params[key]}
                  onChange={e => handleSlider(key, parseFloat(e.target.value))}
                  className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #ff9100 0%, #ff9100 ${((params[key] - cfg.min) / (cfg.max - cfg.min)) * 100}%, #2d3148 ${((params[key] - cfg.min) / (cfg.max - cfg.min)) * 100}%, #2d3148 100%)`,
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════
   PHYSICS CALCULATIONS
   ═══════════════════════════════════════════════ */

function calculate(type: string, p: Record<string, number>): Record<string, number> {
  switch (type) {
    case 'atwood': {
      const m1 = p.m1 || 5, m2 = p.m2 || 3, g = 10
      const a = ((m1 - m2) * g) / (m1 + m2)
      const T = (2 * m1 * m2 * g) / (m1 + m2)
      return { 'a (m/s²)': a, 'T (N)': T }
    }
    case 'projectile': {
      const u = p.u || 20, theta = (p.theta || 30) * Math.PI / 180, H = p.H || 20, g = 10
      const ux = u * Math.cos(theta), uy = u * Math.sin(theta)
      // Quadratic: 0.5*g*t² - uy*t - H = 0
      const disc = uy * uy + 2 * g * H
      const t = (uy + Math.sqrt(disc)) / g
      const hMax = H + (uy * uy) / (2 * g)
      const R = ux * t
      return { 'Time (s)': t, 'H_max (m)': hMax, 'Range (m)': R }
    }
    case 'pendulum': {
      const L = p.L || 1, g = 10, theta = (p.theta || 5) * Math.PI / 180, m = p.m || 0.1
      const T = 2 * Math.PI * Math.sqrt(L / g)
      const vMax = Math.sqrt(2 * g * L * (1 - Math.cos(theta)))
      const Tmax = m * (g + (vMax * vMax) / L)
      return { 'T (s)': T, 'v_max (m/s)': vMax, 'T_max (N)': Tmax }
    }
    case 'lens': {
      const f1 = p.f1 || 20, f2 = p.f2 || -40, d = p.d || 10, u1 = p.u1 || -30
      const v1 = 1 / (1/f1 + 1/u1)  // Lens formula: 1/v - 1/u = 1/f → 1/v = 1/f + 1/u (u negative)
      const u2 = v1 - d  // virtual object distance
      const v2inv = 1/f2 + 1/u2
      const v2 = v2inv !== 0 ? 1/v2inv : Infinity
      return { 'v₁ (cm)': v1, 'v₂ (cm)': v2 }
    }
    default:
      return {}
  }
}

/* ═══════════════════════════════════════════════
   DIAGRAM RENDERERS (SVG)
   ═══════════════════════════════════════════════ */

interface DiagramProps {
  params: Record<string, number>
  results: Record<string, number>
  vis: Set<string>
  step: number
}

// Helper: animated appearance
function Anim({ show, delay = 0, children }: { show: boolean; delay?: number; children: React.ReactNode }) {
  return (
    <g style={{
      opacity: show ? 1 : 0,
      transform: show ? 'translateY(0)' : 'translateY(8px)',
      transition: `all 0.6s ease ${delay}ms`,
    }}>
      {children}
    </g>
  )
}

// Force arrow helper
function ForceArrow({ x, y, dx, dy, label, color = '#00e676', show }: {
  x: number; y: number; dx: number; dy: number; label: string; color?: string; show: boolean
}) {
  const markerId = color === '#ff5252' ? 'arrowRed' : color === '#64b5f6' ? 'arrowBlue' : 'arrowGreen'
  return (
    <Anim show={show}>
      <line x1={x} y1={y} x2={x + dx} y2={y + dy}
        stroke={color} strokeWidth="2.5" markerEnd={`url(#${markerId})`} />
      <text x={x + dx + (dx > 0 ? 6 : -6)} y={y + dy + 4}
        fill={color} fontSize="13" fontWeight="bold" textAnchor={dx > 0 ? 'start' : 'end'}>
        {label}
      </text>
    </Anim>
  )
}

/* ─── Atwood Machine ─── */
function AtwoodDiagram({ params, results, vis, step }: DiagramProps) {
  const m1 = params.m1 || 5, m2 = params.m2 || 3
  const a = results['a (m/s²)'] || 0
  const T = results['T (N)'] || 0
  const scale1 = 25 + m1 * 4, scale2 = 25 + m2 * 4

  return (
    <g>
      {/* Pulley */}
      <Anim show={step >= 0}>
        <circle cx="300" cy="40" r="22" fill="none" stroke="#9aa0b4" strokeWidth="3" />
        <circle cx="300" cy="40" r="4" fill="#9aa0b4" />
        {/* Support */}
        <line x1="300" y1="18" x2="300" y2="5" stroke="#666" strokeWidth="3" />
        <line x1="270" y1="5" x2="330" y2="5" stroke="#666" strokeWidth="4" />
      </Anim>

      {/* String */}
      <Anim show={step >= 0}>
        <line x1="278" y1="40" x2="278" y2={130} stroke="#ffd180" strokeWidth="2" strokeDasharray={step < 1 ? "none" : "none"} />
        <line x1="322" y1="40" x2="322" y2={130} stroke="#ffd180" strokeWidth="2" />
        <path d={`M 278 40 Q 278 25, 300 18 Q 322 25, 322 40`} fill="none" stroke="#ffd180" strokeWidth="2" />
      </Anim>

      {/* Block m1 (left, heavier) */}
      <Anim show={step >= 0}>
        <rect x={278 - scale1/2} y={130} width={scale1} height={scale1} rx="4"
          fill="rgba(108,99,255,0.3)" stroke="#6c63ff" strokeWidth="2" />
        <text x="278" y={130 + scale1/2 + 5} textAnchor="middle" fill="#fff" fontSize="14" fontWeight="bold">
          m₁={m1}
        </text>
        <text x="278" y={130 + scale1/2 + 20} textAnchor="middle" fill="#9aa0b4" fontSize="11">kg</text>
      </Anim>

      {/* Block m2 (right, lighter) */}
      <Anim show={step >= 0}>
        <rect x={322 - scale2/2} y={130} width={scale2} height={scale2} rx="4"
          fill="rgba(0,230,118,0.2)" stroke="#00e676" strokeWidth="2" />
        <text x="322" y={130 + scale2/2 + 5} textAnchor="middle" fill="#fff" fontSize="14" fontWeight="bold">
          m₂={m2}
        </text>
        <text x="322" y={130 + scale2/2 + 20} textAnchor="middle" fill="#9aa0b4" fontSize="11">kg</text>
      </Anim>

      {/* FBD Forces — appear at step 1+ */}
      {/* m1: weight down */}
      <ForceArrow x={238} y={155} dx={0} dy={50} label={`${m1}g = ${m1*10}N`} color="#ff5252" show={step >= 1} />
      {/* m1: tension up */}
      <ForceArrow x={248} y={145} dx={0} dy={-45} label={`T`} color="#64b5f6" show={step >= 1} />
      {/* m2: weight down */}
      <ForceArrow x={362} y={150} dx={0} dy={45} label={`${m2}g = ${m2*10}N`} color="#ff5252" show={step >= 1} />
      {/* m2: tension up */}
      <ForceArrow x={352} y={145} dx={0} dy={-45} label={`T`} color="#64b5f6" show={step >= 1} />

      {/* Acceleration arrows — appear at step 2+ */}
      <Anim show={step >= 3}>
        <line x1="220" y1="170" x2="220" y2="210" stroke="#ff9100" strokeWidth="3" markerEnd="url(#arrowWhite)" />
        <text x="205" y="220" fill="#ff9100" fontSize="12" fontWeight="bold">a↓</text>
      </Anim>
      <Anim show={step >= 3}>
        <line x1="380" y1="200" x2="380" y2="160" stroke="#ff9100" strokeWidth="3" markerEnd="url(#arrowWhite)" />
        <text x="385" y="155" fill="#ff9100" fontSize="12" fontWeight="bold">a↑</text>
      </Anim>

      {/* Result labels */}
      <Anim show={step >= 3} delay={200}>
        <rect x="420" y="80" width="170" height="55" rx="8" fill="rgba(0,0,0,0.5)" stroke="#ff9100" strokeWidth="1" />
        <text x="430" y="100" fill="#ff9100" fontSize="12" fontWeight="bold">Calculated:</text>
        <text x="430" y="118" fill="#00e676" fontSize="13" fontFamily="monospace">a = {a.toFixed(2)} m/s²</text>
        <text x="430" y="130" fill="#64b5f6" fontSize="13" fontFamily="monospace">T = {T.toFixed(1)} N</text>
      </Anim>

      {/* Direction label */}
      <Anim show={step >= 1}>
        <text x="278" y="260" textAnchor="middle" fill="#9aa0b4" fontSize="11">heavier → goes down</text>
        <text x="322" y="270" textAnchor="middle" fill="#9aa0b4" fontSize="11">lighter → goes up</text>
      </Anim>
    </g>
  )
}

/* ─── Projectile Motion ─── */
function ProjectileDiagram({ params, results, step }: DiagramProps) {
  const u = params.u || 20, thetaDeg = params.theta || 30, H = params.H || 20
  const theta = thetaDeg * Math.PI / 180
  const ux = u * Math.cos(theta), uy = u * Math.sin(theta)
  const tFlight = results['Time (s)'] || 3.24
  const hMax = results['H_max (m)'] || 25
  const R = results['Range (m)'] || 56

  // Scale factors for diagram
  const bldgH = 100, bldgX = 80, groundY = 240
  const scaleX = 400 / Math.max(R, 50)
  const scaleY = bldgH / Math.max(H, 20)

  // Generate trajectory points
  const points: string[] = []
  const steps = 40
  for (let i = 0; i <= steps; i++) {
    const t = (tFlight * i) / steps
    const x = bldgX + ux * t * scaleX
    const yPhys = H + uy * t - 0.5 * 10 * t * t
    const y = groundY - yPhys * scaleY
    if (y <= groundY + 10) points.push(`${x},${y}`)
  }

  return (
    <g>
      {/* Ground */}
      <line x1="0" y1={groundY} x2="600" y2={groundY} stroke="#4a4a4a" strokeWidth="2" strokeDasharray="6,4" />

      {/* Building */}
      <Anim show={step >= 0}>
        <rect x={bldgX - 30} y={groundY - bldgH} width="60" height={bldgH} rx="3"
          fill="rgba(108,99,255,0.15)" stroke="#6c63ff" strokeWidth="2" />
        <text x={bldgX} y={groundY - bldgH / 2} textAnchor="middle" fill="#9aa0b4" fontSize="11">
          H={H}m
        </text>
      </Anim>

      {/* Velocity vector at launch */}
      <Anim show={step >= 1}>
        <line x1={bldgX} y1={groundY - bldgH}
          x2={bldgX + 60 * Math.cos(theta)} y2={groundY - bldgH - 60 * Math.sin(theta)}
          stroke="#ff9100" strokeWidth="2.5" markerEnd="url(#arrowWhite)" />
        <text x={bldgX + 35} y={groundY - bldgH - 35} fill="#ff9100" fontSize="12" fontWeight="bold">
          u={u}m/s
        </text>
        {/* Angle arc */}
        <path d={`M ${bldgX + 25} ${groundY - bldgH} A 25 25 0 0 0 ${bldgX + 25 * Math.cos(theta)} ${groundY - bldgH - 25 * Math.sin(theta)}`}
          fill="none" stroke="#ff9100" strokeWidth="1.5" />
        <text x={bldgX + 32} y={groundY - bldgH - 8} fill="#ff9100" fontSize="10">{thetaDeg}°</text>
      </Anim>

      {/* Components ux, uy */}
      <Anim show={step >= 1} delay={200}>
        {/* ux */}
        <line x1={bldgX} y1={groundY - bldgH + 15}
          x2={bldgX + 45} y2={groundY - bldgH + 15}
          stroke="#00e676" strokeWidth="2" markerEnd="url(#arrowGreen)" strokeDasharray="4,3" />
        <text x={bldgX + 50} y={groundY - bldgH + 19} fill="#00e676" fontSize="10">uₓ</text>
        {/* uy */}
        <line x1={bldgX - 15} y1={groundY - bldgH}
          x2={bldgX - 15} y2={groundY - bldgH - 40}
          stroke="#64b5f6" strokeWidth="2" markerEnd="url(#arrowBlue)" strokeDasharray="4,3" />
        <text x={bldgX - 28} y={groundY - bldgH - 42} fill="#64b5f6" fontSize="10">uᵧ</text>
      </Anim>

      {/* Trajectory curve */}
      <Anim show={step >= 2}>
        <polyline points={points.join(' ')} fill="none" stroke="#ffd180" strokeWidth="2.5" strokeDasharray="6,3" />
        {/* Ball at peak */}
        <circle cx={bldgX + ux * (uy / 10) * scaleX} cy={groundY - hMax * scaleY} r="5" fill="#ff9100" />
      </Anim>

      {/* Max height line */}
      <Anim show={step >= 4}>
        <line x1="20" y1={groundY - hMax * scaleY} x2={bldgX + ux * (uy / 10) * scaleX}
          y2={groundY - hMax * scaleY} stroke="#00e676" strokeWidth="1" strokeDasharray="4,4" />
        <text x="10" y={groundY - hMax * scaleY - 5} fill="#00e676" fontSize="11" fontWeight="bold">
          H={hMax.toFixed(0)}m
        </text>
      </Anim>

      {/* Range */}
      <Anim show={step >= 5}>
        <line x1={bldgX} y1={groundY + 15} x2={bldgX + R * scaleX} y2={groundY + 15}
          stroke="#64b5f6" strokeWidth="1.5" markerEnd="url(#arrowBlue)" />
        <text x={bldgX + R * scaleX / 2} y={groundY + 30} textAnchor="middle"
          fill="#64b5f6" fontSize="11" fontWeight="bold">R = {R.toFixed(1)}m</text>
      </Anim>

      {/* Landing point */}
      <Anim show={step >= 5}>
        <circle cx={bldgX + R * scaleX} cy={groundY} r="5" fill="#ff5252" />
      </Anim>
    </g>
  )
}

/* ─── Simple Pendulum ─── */
function PendulumDiagram({ params, results, step }: DiagramProps) {
  const L = params.L || 1, thetaDeg = params.theta || 5
  const theta = thetaDeg * Math.PI / 180
  const T = results['T (s)'] || 2
  const vMax = results['v_max (m/s)'] || 0.28
  const m = params.m || 0.1

  const pivotX = 300, pivotY = 30
  const stringLen = 150
  const bobX = pivotX + stringLen * Math.sin(theta)
  const bobY = pivotY + stringLen * Math.cos(theta)
  const bobR = 12 + (m * 100)

  return (
    <g>
      {/* Support */}
      <Anim show={step >= 0}>
        <line x1="250" y1="15" x2="350" y2="15" stroke="#666" strokeWidth="4" />
        <rect x="245" y="5" width="110" height="15" rx="2" fill="#333" stroke="#555" strokeWidth="1" />
      </Anim>

      {/* Equilibrium (dashed) */}
      <Anim show={step >= 0}>
        <line x1={pivotX} y1={pivotY} x2={pivotX} y2={pivotY + stringLen + 20}
          stroke="#444" strokeWidth="1" strokeDasharray="5,5" />
      </Anim>

      {/* String + Bob at displaced position */}
      <Anim show={step >= 0}>
        <line x1={pivotX} y1={pivotY} x2={bobX} y2={bobY}
          stroke="#ffd180" strokeWidth="2" />
        <circle cx={bobX} cy={bobY} r={bobR}
          fill="rgba(108,99,255,0.4)" stroke="#6c63ff" strokeWidth="2" />
        <text x={bobX} y={bobY + 4} textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold">
          {m}kg
        </text>
      </Anim>

      {/* Angle arc */}
      <Anim show={step >= 0}>
        <path d={`M ${pivotX} ${pivotY + 40} A 40 40 0 0 1 ${pivotX + 40 * Math.sin(theta)} ${pivotY + 40 * Math.cos(theta)}`}
          fill="none" stroke="#ff9100" strokeWidth="1.5" />
        <text x={pivotX + 20} y={pivotY + 55} fill="#ff9100" fontSize="11">{thetaDeg}°</text>
      </Anim>

      {/* Weight force (mg) */}
      <ForceArrow x={bobX + 20} y={bobY} dx={0} dy={40} label={`mg`} color="#ff5252" show={step >= 1} />

      {/* Tension force */}
      <Anim show={step >= 1}>
        <line x1={bobX - 15} y1={bobY} x2={pivotX - 15 + (pivotX - bobX) * 0.3} y2={bobY - 45}
          stroke="#64b5f6" strokeWidth="2.5" markerEnd="url(#arrowBlue)" />
        <text x={pivotX - 30} y={bobY - 50} fill="#64b5f6" fontSize="12" fontWeight="bold">T</text>
      </Anim>

      {/* Velocity at mean position */}
      <Anim show={step >= 2}>
        <circle cx={pivotX} cy={pivotY + stringLen} r="4" fill="#00e676" opacity="0.5" />
        <line x1={pivotX + 5} y1={pivotY + stringLen} x2={pivotX + 55} y2={pivotY + stringLen}
          stroke="#00e676" strokeWidth="2.5" markerEnd="url(#arrowGreen)" />
        <text x={pivotX + 60} y={pivotY + stringLen + 4} fill="#00e676" fontSize="11" fontWeight="bold">
          v_max
        </text>
      </Anim>

      {/* Results box */}
      <Anim show={step >= 1} delay={200}>
        <rect x="420" y="60" width="165" height="65" rx="8" fill="rgba(0,0,0,0.5)" stroke="#ff9100" strokeWidth="1" />
        <text x="430" y="80" fill="#ff9100" fontSize="11" fontWeight="bold">Live Values:</text>
        <text x="430" y="96" fill="#fff" fontSize="12" fontFamily="monospace">T = {T.toFixed(2)} s</text>
        <text x="430" y="110" fill="#00e676" fontSize="12" fontFamily="monospace">v_max = {vMax.toFixed(3)} m/s</text>
        <text x="430" y="124" fill="#64b5f6" fontSize="10" fontFamily="monospace">L = {L}m</text>
      </Anim>

      {/* Swing path (arc) */}
      <Anim show={step >= 0}>
        <path d={`M ${pivotX - stringLen * Math.sin(theta)} ${pivotY + stringLen * Math.cos(theta)}
          A ${stringLen} ${stringLen} 0 0 1 ${pivotX + stringLen * Math.sin(theta)} ${pivotY + stringLen * Math.cos(theta)}`}
          fill="none" stroke="#444" strokeWidth="1" strokeDasharray="3,3" />
      </Anim>
    </g>
  )
}

/* ─── Lens Combination ─── */
function LensDiagram({ params, results, step }: DiagramProps) {
  const f1 = params.f1 || 20, f2 = params.f2 || -40, d = params.d || 10, u1 = params.u1 || -30
  const v1 = results['v₁ (cm)'] || 60
  const v2 = results['v₂ (cm)'] || -200

  const cx1 = 200, cx2 = 200 + d * 3, axisY = 140
  const objX = cx1 + u1 * 3 // u1 is negative

  return (
    <g>
      {/* Principal axis */}
      <line x1="20" y1={axisY} x2="580" y2={axisY} stroke="#444" strokeWidth="1" />

      {/* Convex lens */}
      <Anim show={step >= 0}>
        <ellipse cx={cx1} cy={axisY} rx="4" ry="50" fill="rgba(100,181,246,0.2)" stroke="#64b5f6" strokeWidth="2" />
        <text x={cx1} y={axisY - 60} textAnchor="middle" fill="#64b5f6" fontSize="11" fontWeight="bold">
          Convex (f={f1})
        </text>
      </Anim>

      {/* Concave lens */}
      <Anim show={step >= 0}>
        <path d={`M ${cx2 - 4} ${axisY - 50} Q ${cx2 + 6} ${axisY} ${cx2 - 4} ${axisY + 50}`}
          fill="none" stroke="#ff5252" strokeWidth="2" />
        <path d={`M ${cx2 + 4} ${axisY - 50} Q ${cx2 - 6} ${axisY} ${cx2 + 4} ${axisY + 50}`}
          fill="none" stroke="#ff5252" strokeWidth="2" />
        <text x={cx2} y={axisY - 60} textAnchor="middle" fill="#ff5252" fontSize="11" fontWeight="bold">
          Concave (f={f2})
        </text>
      </Anim>

      {/* Object */}
      <Anim show={step >= 0}>
        <line x1={objX} y1={axisY} x2={objX} y2={axisY - 40} stroke="#00e676" strokeWidth="2.5" markerEnd="url(#arrowGreen)" />
        <text x={objX} y={axisY + 15} textAnchor="middle" fill="#00e676" fontSize="10">Object</text>
      </Anim>

      {/* Ray from convex — step 1+ */}
      <Anim show={step >= 1}>
        <line x1={objX} y1={axisY - 40} x2={cx1} y2={axisY - 40} stroke="#ffd180" strokeWidth="1.5" />
        <line x1={cx1} y1={axisY - 40} x2={cx1 + Math.min(v1, 80) * 3} y2={axisY}
          stroke="#ffd180" strokeWidth="1.5" strokeDasharray="4,3" />
      </Anim>

      {/* Image from lens 1 */}
      <Anim show={step >= 1}>
        <line x1={cx1 + Math.min(v1, 60) * 3} y1={axisY} x2={cx1 + Math.min(v1, 60) * 3} y2={axisY + 30}
          stroke="#ff9100" strokeWidth="2" strokeDasharray="3,3" />
        <text x={cx1 + Math.min(v1, 60) * 3} y={axisY + 45} textAnchor="middle" fill="#ff9100" fontSize="10">
          I₁
        </text>
      </Anim>

      {/* Separation label */}
      <Anim show={step >= 0}>
        <line x1={cx1} y1={axisY + 55} x2={cx2} y2={axisY + 55} stroke="#9aa0b4" strokeWidth="1" />
        <text x={(cx1 + cx2) / 2} y={axisY + 68} textAnchor="middle" fill="#9aa0b4" fontSize="10">d={d}cm</text>
      </Anim>

      {/* Results */}
      <Anim show={step >= 2} delay={200}>
        <rect x="400" y="20" width="180" height="55" rx="8" fill="rgba(0,0,0,0.5)" stroke="#ff9100" strokeWidth="1" />
        <text x="410" y="38" fill="#ff9100" fontSize="11" fontWeight="bold">Image Positions:</text>
        <text x="410" y="55" fill="#fff" fontSize="12" fontFamily="monospace">v₁ = {v1.toFixed(1)} cm</text>
        <text x="410" y="70" fill="#00e676" fontSize="12" fontFamily="monospace">v₂ = {v2.toFixed(1)} cm</text>
      </Anim>
    </g>
  )
}
