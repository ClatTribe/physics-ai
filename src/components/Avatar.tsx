'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

interface AvatarProps {
  isSpeaking: boolean
}

/**
 * Avatar with loose lip-sync using CSS split-face technique
 *
 * Instead of drawing a fake mouth on canvas (which never aligns),
 * we split the real face photo into upper + lower halves.
 * The lower half (jaw area) moves down slightly when speaking,
 * creating a natural "talking" effect with the real image pixels.
 *
 * - Upper half: eyes, forehead — stays still
 * - Lower half: mouth, chin — bobs up/down randomly
 * - Both halves use the same image with clip-path
 * - Random timing creates natural, non-robotic movement
 */
export default function Avatar({ isSpeaking }: AvatarProps) {
  const FACE_URL = 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face'

  // Jaw animation state
  const [jawOffset, setJawOffset] = useState(0)
  const [headTilt, setHeadTilt] = useState(0)
  const animRef = useRef<number>(0)
  const stateRef = useRef({
    target: 0,
    current: 0,
    nextChange: 0,
    frame: 0,
  })

  const animate = useCallback(() => {
    const st = stateRef.current
    st.frame++

    if (isSpeaking) {
      // Pick new jaw position at random intervals
      if (st.frame >= st.nextChange) {
        const r = Math.random()
        // Weighted: mostly small-medium movements, occasional wide
        if (r < 0.12) st.target = 0        // mouth closed (pause)
        else if (r < 0.45) st.target = 2 + Math.random() * 2   // small open
        else if (r < 0.8) st.target = 4 + Math.random() * 3    // medium open
        else st.target = 7 + Math.random() * 3                  // wide open (emphasis)

        // Vary timing: 2-6 frames between changes
        st.nextChange = st.frame + 2 + Math.floor(Math.random() * 5)
      }
    } else {
      st.target = 0
    }

    // Smooth interpolation
    st.current += (st.target - st.current) * 0.25
    setJawOffset(st.current)

    // Subtle head tilt while speaking
    if (isSpeaking) {
      setHeadTilt(Math.sin(st.frame / 40) * 0.8 + Math.sin(st.frame / 25) * 0.4)
    } else {
      setHeadTilt(prev => prev * 0.95)
    }

    animRef.current = requestAnimationFrame(animate)
  }, [isSpeaking])

  useEffect(() => {
    animRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animRef.current)
  }, [animate])

  // Split point: 55% from top (roughly where upper lip meets)
  const splitPercent = 55

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Face container */}
      <div className={`relative rounded-full overflow-hidden avatar-ring ${isSpeaking ? 'speaking' : ''}`}
        style={{ width: 180, height: 180 }}>

        {/* Upper face (eyes, forehead) — stays still */}
        <div
          className="absolute inset-0"
          style={{
            clipPath: `inset(0 0 ${100 - splitPercent}% 0)`,
            transform: `rotate(${headTilt * 0.3}deg)`,
            transition: 'transform 0.15s ease',
          }}
        >
          <img
            src={FACE_URL}
            alt="Prof. Arjun Sharma"
            className="w-full h-full object-cover"
            crossOrigin="anonymous"
          />
        </div>

        {/* Lower face (mouth, chin) — moves down when speaking */}
        <div
          className="absolute inset-0"
          style={{
            clipPath: `inset(${splitPercent}% 0 0 0)`,
            transform: `translateY(${jawOffset}px) rotate(${headTilt * 0.3}deg) scaleY(${1 + jawOffset * 0.005})`,
            transition: 'transform 0.06s ease-out',
          }}
        >
          <img
            src={FACE_URL}
            alt=""
            className="w-full h-full object-cover"
            crossOrigin="anonymous"
            aria-hidden="true"
          />
        </div>

        {/* Dark gap between halves when jaw drops (inner mouth) */}
        {jawOffset > 1.5 && (
          <div
            className="absolute left-1/2 -translate-x-1/2"
            style={{
              top: `${splitPercent}%`,
              width: `${28 + jawOffset * 2}%`,
              height: `${Math.min(jawOffset * 1.2, 12)}px`,
              background: `radial-gradient(ellipse, rgba(40,15,15,${Math.min(jawOffset * 0.08, 0.7)}) 0%, rgba(40,15,15,0) 80%)`,
              borderRadius: '50%',
              pointerEvents: 'none',
            }}
          />
        )}

        {/* Speaking indicator */}
        {isSpeaking && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 rounded-full px-3 py-1 flex items-center gap-1 z-10">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-[10px] text-green-400 font-semibold">SPEAKING</span>
          </div>
        )}
      </div>

      {/* Name */}
      <div className="text-center">
        <div className="font-bold text-base">Prof. Arjun Sharma</div>
        <div className="text-xs text-[var(--text-dim)]">AI Teacher • IIT Delhi</div>
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
