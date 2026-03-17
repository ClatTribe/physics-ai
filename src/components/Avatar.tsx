'use client'

import { useEffect, useRef, useState } from 'react'

interface AvatarProps {
  isSpeaking: boolean
}

export default function Avatar({ isSpeaking }: AvatarProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)
  const [imageLoaded, setImageLoaded] = useState(false)
  const frameRef = useRef(0)
  const animRef = useRef<number>(0)

  // Use a realistic AI-generated Indian professor face
  // This URL points to a royalty-free professional headshot
  const FACE_URL = 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face'
  // Fallback: generate a placeholder
  const FALLBACK_URL = 'https://api.dicebear.com/7.x/personas/svg?seed=professor&backgroundColor=c0aede'

  useEffect(() => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      imgRef.current = img
      setImageLoaded(true)
    }
    img.onerror = () => {
      // Fallback
      const fallback = new Image()
      fallback.crossOrigin = 'anonymous'
      fallback.onload = () => {
        imgRef.current = fallback
        setImageLoaded(true)
      }
      fallback.src = FALLBACK_URL
    }
    img.src = FACE_URL
  }, [])

  useEffect(() => {
    if (!canvasRef.current || !imageLoaded || !imgRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')!
    const size = 200
    canvas.width = size
    canvas.height = size

    const draw = () => {
      frameRef.current++
      ctx.clearRect(0, 0, size, size)

      // Circular clip
      ctx.save()
      ctx.beginPath()
      ctx.arc(size/2, size/2, size/2, 0, Math.PI * 2)
      ctx.clip()

      // Subtle head movement when speaking
      const t = frameRef.current / 60
      let offsetX = 0, offsetY = 0, scale = 1
      if (isSpeaking) {
        offsetX = Math.sin(t * 1.5) * 1.5
        offsetY = Math.sin(t * 2) * 1
        scale = 1 + Math.sin(t * 3) * 0.005
      }

      // Draw the face image
      const img = imgRef.current!
      const aspectRatio = img.width / img.height
      let drawW = size, drawH = size
      if (aspectRatio > 1) {
        drawH = size
        drawW = size * aspectRatio
      } else {
        drawW = size
        drawH = size / aspectRatio
      }

      ctx.translate(size/2 + offsetX, size/2 + offsetY)
      ctx.scale(scale, scale)
      ctx.drawImage(img, -drawW/2, -drawH/2, drawW, drawH)

      // Mouth animation overlay (subtle dark overlay at mouth position)
      if (isSpeaking) {
        const mouthOpen = Math.abs(Math.sin(t * 8)) * 0.6 + 0.1
        const mouthY = size * 0.18  // relative to center
        const mouthW = size * 0.08
        const mouthH = size * 0.02 + mouthOpen * size * 0.04

        ctx.fillStyle = `rgba(0,0,0,${mouthOpen * 0.15})`
        ctx.beginPath()
        ctx.ellipse(0, mouthY, mouthW, mouthH, 0, 0, Math.PI * 2)
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
          width={200}
          height={200}
          className="w-[180px] h-[180px]"
        />

        {/* Speaking indicator overlay */}
        {isSpeaking && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 rounded-full px-3 py-1 flex items-center gap-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-[10px] text-green-400 font-semibold">SPEAKING</span>
          </div>
        )}
      </div>

      {/* Name */}
      <div className="text-center">
        <div className="font-bold text-base">Prof. Arjun Sharma</div>
        <div className="text-xs text-[var(--text-dim)]">AI Physics Instructor • IIT Delhi</div>
      </div>

      {/* Sound waves */}
      <div className={`flex items-center gap-[3px] h-6 transition-opacity duration-300 ${isSpeaking ? 'opacity-100' : 'opacity-0'}`}>
        {[1,2,3,4,5].map(i => (
          <div
            key={i}
            className={`w-[3px] bg-green-400 rounded-sm`}
            style={{
              height: `${8 + (i <= 3 ? i * 8 : (6-i) * 8)}px`,
              animation: `wave 0.8s ease-in-out ${(i-1) * 0.1}s infinite`,
            }}
          />
        ))}
      </div>
    </div>
  )
}
