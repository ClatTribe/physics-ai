'use client'

import { useEffect, useRef, useState } from 'react'

interface AvatarProps {
  isSpeaking: boolean
}

/**
 * Avatar with real video lip-sync
 *
 * HOW IT WORKS:
 * - Uses a looping video of a person talking
 * - When isSpeaking=true → video plays (natural lip movement)
 * - When isSpeaking=false → video pauses (still face)
 * - Falls back to static image if video fails to load
 *
 * TO CUSTOMIZE: Replace AVATAR_VIDEO_URL with your own video:
 * - Record a 10-30 second video of a teacher talking (head & shoulders)
 * - Upload to your public folder, S3, or any CDN
 * - Set the URL below
 *
 * You can also generate a talking avatar video using:
 * - D-ID (https://d-id.com) — upload a photo, get a talking video
 * - HeyGen (https://heygen.com) — AI avatar video generation
 * - Synthesia (https://synthesia.io) — similar service
 */

// Default: free stock video of a man talking (Pexels)
// Replace this with your own teacher's talking video for best results
const AVATAR_VIDEO_URL = 'https://videos.pexels.com/video-files/4623532/4623532-sd_640_360_30fps.mp4'

// Fallback static image
const AVATAR_IMAGE_URL = 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face'

export default function Avatar({ isSpeaking }: AvatarProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoLoaded, setVideoLoaded] = useState(false)
  const [videoError, setVideoError] = useState(false)

  // Play/pause video based on speaking state
  useEffect(() => {
    const video = videoRef.current
    if (!video || !videoLoaded) return

    if (isSpeaking) {
      video.play().catch(() => {
        // Autoplay blocked — try muted
        video.muted = true
        video.play().catch(() => setVideoError(true))
      })
    } else {
      video.pause()
    }
  }, [isSpeaking, videoLoaded])

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Face container — circular */}
      <div className={`relative rounded-full overflow-hidden avatar-ring ${isSpeaking ? 'speaking' : ''}`}
        style={{ width: 180, height: 180 }}>

        {/* Video layer — shows when loaded */}
        {!videoError && (
          <video
            ref={videoRef}
            src={AVATAR_VIDEO_URL}
            loop
            muted
            playsInline
            preload="auto"
            onLoadedData={() => setVideoLoaded(true)}
            onError={() => setVideoError(true)}
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              // Subtle zoom to crop out video edges and focus on face
              transform: 'scale(1.3)',
              transformOrigin: 'center 35%',
            }}
          />
        )}

        {/* Fallback: static image (shows if video fails or before video loads) */}
        {(videoError || !videoLoaded) && (
          <img
            src={AVATAR_IMAGE_URL}
            alt="Prof. Arjun Sharma"
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

        {/* Subtle dark vignette around edges */}
        <div className="absolute inset-0 rounded-full"
          style={{
            background: 'radial-gradient(circle, transparent 55%, rgba(0,0,0,0.3) 100%)',
            pointerEvents: 'none',
          }}
        />

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
