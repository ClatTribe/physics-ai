'use client'

import { useEffect, useRef, useState } from 'react'

interface AvatarProps {
  isSpeaking: boolean
}

/**
 * Avatar with video lip-sync
 *
 * SETUP (2 minutes):
 * 1. Get a 10-30 second video of a person talking (head+shoulders)
 *    - Record yourself, or use D-ID.com to generate one from a photo ($5)
 *    - Or download free from mixkit.co/free-stock-video/talking/
 * 2. Save it as: public/avatar-talking.mp4
 * 3. That's it — the component auto-detects the file
 *
 * Without the video file, it shows the static image with an animated
 * audio visualizer ring that pulses when speaking.
 */

// Check if the user has placed their video in /public/
const VIDEO_PATH = '/avatar-talking.mp4'
const FACE_IMAGE = 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face'

export default function Avatar({ isSpeaking }: AvatarProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [hasVideo, setHasVideo] = useState<boolean | null>(null) // null = checking
  const [pulseScale, setPulseScale] = useState(1)
  const animRef = useRef<number>(0)
  const frameRef = useRef(0)

  // Check if avatar video exists in public folder
  useEffect(() => {
    fetch(VIDEO_PATH, { method: 'HEAD' })
      .then(res => {
        setHasVideo(res.ok && (res.headers.get('content-type')?.includes('video') || res.url.endsWith('.mp4')))
      })
      .catch(() => setHasVideo(false))
  }, [])

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

  // Animated ring pulse when speaking (works for both video and image mode)
  useEffect(() => {
    const tick = () => {
      frameRef.current++
      if (isSpeaking) {
        // Multi-frequency pulse for organic feel
        const t = frameRef.current / 60
        const v = 1 + Math.sin(t * 6) * 0.03 + Math.sin(t * 10) * 0.02 + Math.sin(t * 15) * 0.01
        setPulseScale(v)
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
      {/* Outer ring — pulses when speaking */}
      <div className="relative" style={{ width: 188, height: 188 }}>
        {/* Animated glow rings */}
        {isSpeaking && (
          <>
            <div className="absolute inset-0 rounded-full"
              style={{
                border: '2px solid rgba(0,230,118,0.3)',
                transform: `scale(${pulseScale * 1.08})`,
                transition: 'transform 0.1s ease',
              }} />
            <div className="absolute inset-0 rounded-full"
              style={{
                border: '1px solid rgba(0,230,118,0.15)',
                transform: `scale(${pulseScale * 1.15})`,
                transition: 'transform 0.15s ease',
              }} />
          </>
        )}

        {/* Face container */}
        <div
          className={`rounded-full overflow-hidden border-[3px] transition-colors duration-300
            ${isSpeaking ? 'border-green-400' : 'border-[var(--accent)]'}`}
          style={{
            width: 180, height: 180, margin: 4,
            boxShadow: isSpeaking
              ? '0 0 30px rgba(0,230,118,0.25), 0 0 60px rgba(0,230,118,0.08)'
              : '0 0 20px rgba(108,99,255,0.2)',
            transform: `scale(${pulseScale})`,
            transition: 'box-shadow 0.3s ease',
          }}
        >
          {/* Video mode */}
          {hasVideo && (
            <video
              ref={videoRef}
              src={VIDEO_PATH}
              loop
              muted
              playsInline
              preload="auto"
              className="w-full h-full object-cover"
              style={{ transform: 'scale(1.15)', transformOrigin: 'center 40%' }}
            />
          )}

          {/* Image mode (fallback or while checking) */}
          {!hasVideo && (
            <img
              src={FACE_IMAGE}
              alt="Prof. Arjun Sharma"
              className="w-full h-full object-cover"
              crossOrigin="anonymous"
            />
          )}
        </div>

        {/* Speaking badge */}
        {isSpeaking && (
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-green-500 rounded-full px-3 py-0.5 flex items-center gap-1.5 z-10 shadow-lg">
            {/* Mini equalizer bars */}
            <div className="flex items-end gap-[2px] h-3">
              {[0, 0.1, 0.2, 0.1, 0].map((delay, i) => (
                <div key={i} className="w-[2px] bg-white rounded-full"
                  style={{
                    height: `${4 + Math.abs(Math.sin((frameRef.current / 8) + i * 1.5)) * 8}px`,
                    transition: 'height 0.1s ease',
                  }} />
              ))}
            </div>
            <span className="text-[9px] text-white font-bold">SPEAKING</span>
          </div>
        )}
      </div>

      {/* Name */}
      <div className="text-center">
        <div className="font-bold text-base">Prof. Arjun Sharma</div>
        <div className="text-xs text-[var(--text-dim)]">AI Teacher • IIT Delhi</div>
        {hasVideo === false && (
          <div className="text-[9px] text-[var(--text-dim)] mt-1 opacity-60">
            Add /public/avatar-talking.mp4 for video
          </div>
        )}
      </div>

      {/* Sound waves */}
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
