'use client'

import { useEffect, useRef, useState } from 'react'

interface AvatarProps {
  isSpeaking: boolean
}

/**
 * Avatar with loose lip-sync
 *
 * Uses a real photo with canvas-based mouth overlay that:
 * - Opens/closes at varying speeds (not a robotic sine wave)
 * - Uses skin-toned inner mouth color that blends with the face
 * - Has 3 mouth shapes: closed, half-open, wide — randomly cycled
 * - Subtle jaw movement (slight vertical shift of lower face)
 * - Head micro-movements while speaking
 * - Blink animation (random, 3-5 second intervals)
 */
export default function Avatar({ isSpeaking }: AvatarProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)
  const [imageLoaded, setImageLoaded] = useState(false)
  const animRef = useRef<number>(0)
  const stateRef = useRef({
    frame: 0,
    // Mouth shape target (0=closed, 0.3=half, 0.7=wide, 1=very wide)
    mouthTarget: 0,
    mouthCurrent: 0,
    // How fast mouth moves to target
    mouthSpeed: 0.15,
    // When to pick next mouth shape
    nextShapeAt: 0,
    // Blink state
    blinkAmount: 0,
    nextBlinkAt: 120,
    isBlinking: false,
  })

  // Indian male professor face
  const FACE_URL = 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face'
  const FALLBACK_URL = 'https://api.dicebear.com/7.x/personas/svg?seed=professor&backgroundColor=c0aede'

  useEffect(() => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => { imgRef.current = img; setImageLoaded(true) }
    img.onerror = () => {
      const fb = new Image()
      fb.crossOrigin = 'anonymous'
      fb.onload = () => { imgRef.current = fb; setImageLoaded(true) }
      fb.src = FALLBACK_URL
    }
    img.src = FACE_URL
  }, [])

  useEffect(() => {
    if (!canvasRef.current || !imageLoaded || !imgRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')!
    const S = 220 // canvas size
    canvas.width = S
    canvas.height = S

    const st = stateRef.current

    const draw = () => {
      st.frame++
      const t = st.frame / 60

      ctx.clearRect(0, 0, S, S)
      ctx.save()

      // Circular clip
      ctx.beginPath()
      ctx.arc(S / 2, S / 2, S / 2, 0, Math.PI * 2)
      ctx.clip()

      // ─── Head micro-movement when speaking ───
      let headX = 0, headY = 0, headScale = 1
      if (isSpeaking) {
        headX = Math.sin(t * 1.2) * 1.2 + Math.sin(t * 2.7) * 0.6
        headY = Math.sin(t * 1.8) * 0.8
        headScale = 1 + Math.sin(t * 2.5) * 0.003
      }

      ctx.translate(S / 2 + headX, S / 2 + headY)
      ctx.scale(headScale, headScale)

      // ─── Draw face image ───
      const img = imgRef.current!
      const ar = img.width / img.height
      let dw = S, dh = S
      if (ar > 1) { dh = S; dw = S * ar } else { dw = S; dh = S / ar }
      ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh)

      // ─── Blink animation ───
      if (st.frame >= st.nextBlinkAt) {
        st.isBlinking = true
        st.nextBlinkAt = st.frame + 180 + Math.random() * 180 // 3-6 seconds
      }
      if (st.isBlinking) {
        st.blinkAmount += 0.3
        if (st.blinkAmount >= 1) {
          st.blinkAmount = 0
          st.isBlinking = false
        }
      }
      if (st.blinkAmount > 0) {
        const blinkPhase = st.blinkAmount < 0.5
          ? st.blinkAmount * 2 // closing
          : (1 - st.blinkAmount) * 2 // opening
        const eyeY = -S * 0.06 // approximate eye position relative to center
        const eyeH = S * 0.025 * blinkPhase
        ctx.fillStyle = 'rgba(180,140,110,0.9)' // skin tone
        // Left eye area
        ctx.fillRect(-S * 0.15, eyeY - eyeH / 2, S * 0.12, eyeH)
        // Right eye area
        ctx.fillRect(S * 0.03, eyeY - eyeH / 2, S * 0.12, eyeH)
      }

      // ─── Mouth / Lip Sync ───
      if (isSpeaking) {
        // Pick new mouth shape at random intervals (3-8 frames)
        if (st.frame >= st.nextShapeAt) {
          // Weighted random: mostly half-open, sometimes wide, occasionally closed
          const r = Math.random()
          if (r < 0.15) st.mouthTarget = 0 // closed (natural pause)
          else if (r < 0.5) st.mouthTarget = 0.25 + Math.random() * 0.15 // half open
          else if (r < 0.85) st.mouthTarget = 0.5 + Math.random() * 0.2 // open
          else st.mouthTarget = 0.8 + Math.random() * 0.2 // wide (emphasis)

          // Vary speed: sometimes snappy, sometimes smooth
          st.mouthSpeed = 0.1 + Math.random() * 0.2
          // Next shape change: 3-8 frames (varies for natural feel)
          st.nextShapeAt = st.frame + 3 + Math.floor(Math.random() * 6)
        }
      } else {
        st.mouthTarget = 0
        st.mouthSpeed = 0.08
      }

      // Smooth interpolation to target
      st.mouthCurrent += (st.mouthTarget - st.mouthCurrent) * st.mouthSpeed
      const mo = Math.max(0, st.mouthCurrent) // mouth openness 0-1

      if (mo > 0.02) {
        // Mouth position (relative to face center) — adjust these for your image
        const mouthCX = 0
        const mouthCY = S * 0.16
        const mouthW = S * 0.065 + mo * S * 0.03
        const mouthH = S * 0.008 + mo * S * 0.05

        // Jaw drop effect: slight downward shift of lower face region
        const jawDrop = mo * 1.5

        // Inner mouth (dark)
        ctx.fillStyle = `rgba(60,30,25,${0.4 + mo * 0.5})`
        ctx.beginPath()
        ctx.ellipse(mouthCX, mouthCY + jawDrop, mouthW, mouthH, 0, 0, Math.PI * 2)
        ctx.fill()

        // Teeth hint (white line at top of mouth opening when wide)
        if (mo > 0.4) {
          ctx.fillStyle = `rgba(255,255,255,${(mo - 0.4) * 0.5})`
          ctx.beginPath()
          ctx.ellipse(mouthCX, mouthCY + jawDrop - mouthH * 0.5, mouthW * 0.7, mouthH * 0.15, 0, 0, Math.PI * 2)
          ctx.fill()
        }

        // Lip outline (subtle, skin-dark blend)
        ctx.strokeStyle = `rgba(120,70,60,${0.2 + mo * 0.3})`
        ctx.lineWidth = 1.2
        ctx.beginPath()
        ctx.ellipse(mouthCX, mouthCY + jawDrop, mouthW + 1, mouthH + 1, 0, 0, Math.PI * 2)
        ctx.stroke()

        // Shadow under lower lip
        ctx.fillStyle = `rgba(0,0,0,${mo * 0.12})`
        ctx.beginPath()
        ctx.ellipse(mouthCX, mouthCY + jawDrop + mouthH + 2, mouthW * 0.8, 2, 0, 0, Math.PI * 2)
        ctx.fill()
      }

      ctx.restore()
      animRef.current = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(animRef.current)
  }, [imageLoaded, isSpeaking])

  return (
    <div className="flex flex-col items-center gap-3">
      <div className={`relative rounded-full overflow-hidden avatar-ring ${isSpeaking ? 'speaking' : ''}`}>
        <canvas
          ref={canvasRef}
          width={220}
          height={220}
          className="w-[180px] h-[180px]"
        />

        {isSpeaking && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 rounded-full px-3 py-1 flex items-center gap-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-[10px] text-green-400 font-semibold">SPEAKING</span>
          </div>
        )}
      </div>

      <div className="text-center">
        <div className="font-bold text-base">Prof. Arjun Sharma</div>
        <div className="text-xs text-[var(--text-dim)]">AI Teacher • IIT Delhi</div>
      </div>

      <div className={`flex items-center gap-[3px] h-6 transition-opacity duration-300 ${isSpeaking ? 'opacity-100' : 'opacity-0'}`}>
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="w-[3px] bg-green-400 rounded-sm"
            style={{
              height: `${8 + (i <= 3 ? i * 8 : (6 - i) * 8)}px`,
              animation: `wave 0.8s ease-in-out ${(i - 1) * 0.1}s infinite`,
            }} />
        ))}
      </div>
    </div>
  )
}
