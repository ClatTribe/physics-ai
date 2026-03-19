'use client'

import { useEffect, useRef, useState } from 'react'
import type { Professor } from '@/data/professors'

interface AvatarProps {
  isSpeaking: boolean
  professor: Professor
}

export default function Avatar({ isSpeaking, professor }: AvatarProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [hasVideo, setHasVideo] = useState<boolean | null>(null)
  const [pulseScale, setPulseScale] = useState(1)
  const animRef = useRef<number>(0)
  const frameRef = useRef(0)
  const prevVideoPath = useRef('')

  // Check if video exists when professor changes
  useEffect(() => {
    if (!professor.video) { setHasVideo(false); return }
    if (professor.video === prevVideoPath.current && hasVideo !== null) return
    prevVideoPath.current = professor.video
    setHasVideo(null)

    fetch(professor.video, { method: 'HEAD' })
      .then(res => setHasVideo(res.ok && (res.headers.get('content-type')?.includes('video') || res.url.endsWith('.mp4'))))
      .catch(() => setHasVideo(false))
  }, [professor.video])

  // Play/pause video
  useEffect(() => {
    if (!videoRef.current || !hasVideo) return
    if (isSpeaking) {
      videoRef.current.play().catch(() => {
        videoRef.current!.muted = true
        videoRef.current!.play().catch(() => {})
      })
    } else {
      videoRef.current.pause()
    }
  }, [isSpeaking, hasVideo])

  // Pulse animation
  useEffect(() => {
    const tick = () => {
      frameRef.current++
      if (isSpeaking) {
        const t = frameRef.current / 60
        setPulseScale(1 + Math.sin(t * 6) * 0.03 + Math.sin(t * 10) * 0.02 + Math.sin(t * 15) * 0.01)
      } else {
        setPulseScale(prev => prev + (1 - prev) * 0.1)
      }
      animRef.current = requestAnimationFrame(tick)
    }
    animRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(animRef.current)
  }, [isSpeaking])

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: 188, height: 188 }}>
        {/* Animated glow rings */}
        {isSpeaking && (
          <>
            <div className="absolute inset-0 rounded-full"
              style={{ border: `2px solid ${professor.color}50`, transform: `scale(${pulseScale * 1.08})`, transition: 'transform 0.1s ease' }} />
            <div className="absolute inset-0 rounded-full"
              style={{ border: `1px solid ${professor.color}25`, transform: `scale(${pulseScale * 1.15})`, transition: 'transform 0.15s ease' }} />
          </>
        )}

        {/* Face container */}
        <div className="rounded-full overflow-hidden border-[3px] transition-colors duration-300"
          style={{
            width: 180, height: 180, margin: 4,
            borderColor: isSpeaking ? '#00e676' : professor.color,
            boxShadow: isSpeaking
              ? '0 0 30px rgba(0,230,118,0.25), 0 0 60px rgba(0,230,118,0.08)'
              : `0 0 20px ${professor.color}40`,
            transform: `scale(${pulseScale})`,
          }}>

          {/* Video mode */}
          {hasVideo && professor.video && (
            <video ref={videoRef} src={professor.video} loop muted playsInline preload="auto"
              className="w-full h-full object-cover"
              style={{ transform: 'scale(1.15)', transformOrigin: 'center 40%' }} />
          )}

          {/* Image mode */}
          {!hasVideo && (
            <img src={professor.image} alt={professor.name}
              className="w-full h-full object-cover" crossOrigin="anonymous" />
          )}
        </div>

        {/* Speaking badge */}
        {isSpeaking && (
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-green-500 rounded-full px-3 py-0.5 flex items-center gap-1.5 z-10 shadow-lg">
            <div className="flex items-end gap-[2px] h-3">
              {[0, 1, 2, 3, 4].map(i => (
                <div key={i} className="w-[2px] bg-white rounded-full"
                  style={{ height: `${4 + Math.abs(Math.sin((frameRef.current / 8) + i * 1.5)) * 8}px`, transition: 'height 0.1s ease' }} />
              ))}
            </div>
            <span className="text-[9px] text-white font-bold">SPEAKING</span>
          </div>
        )}
      </div>

      {/* Name — changes per subject */}
      <div className="text-center">
        <div className="font-bold text-base">{professor.name}</div>
        <div className="text-xs text-[var(--text-dim)]">{professor.title}</div>
      </div>

      {/* Sound waves */}
      <div className={`flex items-center gap-[3px] h-6 transition-opacity duration-300 ${isSpeaking ? 'opacity-100' : 'opacity-0'}`}>
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="w-[3px] rounded-sm"
            style={{
              backgroundColor: professor.color,
              height: `${8 + (i <= 3 ? i * 8 : (6 - i) * 8)}px`,
              animation: `wave 0.8s ease-in-out ${(i - 1) * 0.1}s infinite`,
            }} />
        ))}
      </div>
    </div>
  )
}
