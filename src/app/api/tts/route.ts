import { NextRequest, NextResponse } from 'next/server'

/**
 * Google Cloud Text-to-Speech API route
 *
 * Uses the same Google API key as Gemini (user just needs to enable
 * "Cloud Text-to-Speech API" in their Google Cloud console).
 *
 * Voices used:
 *   Hindi:   hi-IN-Neural2-C  (male, warm tone)
 *   English: en-IN-Neural2-B  (male, Indian accent)
 *
 * Returns: audio/mpeg binary stream
 */

const GOOGLE_TTS_ENDPOINT = 'https://texttospeech.googleapis.com/v1/text:synthesize'

// Detect if text is primarily Hindi (Devanagari script)
function isHindi(text: string): boolean {
  const hindiChars = (text.match(/[\u0900-\u097F]/g) || []).length
  return hindiChars > text.length * 0.25
}

// Split long text into chunks (Google TTS limit is 5000 bytes)
// We split on sentence boundaries to keep it natural
function chunkText(text: string, maxLen = 400): string[] {
  if (text.length <= maxLen) return [text]

  const chunks: string[] = []
  // Split on sentence endings
  const sentences = text.split(/(?<=[.!?।])\s+/)
  let current = ''

  for (const sentence of sentences) {
    if ((current + ' ' + sentence).trim().length > maxLen && current) {
      chunks.push(current.trim())
      current = sentence
    } else {
      current = current ? current + ' ' + sentence : sentence
    }
  }
  if (current.trim()) chunks.push(current.trim())

  // If still too long (no sentence boundaries), split on commas
  const result: string[] = []
  for (const chunk of chunks) {
    if (chunk.length > maxLen) {
      const parts = chunk.split(/(?<=,)\s+/)
      let sub = ''
      for (const part of parts) {
        if ((sub + ' ' + part).trim().length > maxLen && sub) {
          result.push(sub.trim())
          sub = part
        } else {
          sub = sub ? sub + ' ' + part : part
        }
      }
      if (sub.trim()) result.push(sub.trim())
    } else {
      result.push(chunk)
    }
  }

  return result.length > 0 ? result : [text.slice(0, maxLen)]
}

export async function POST(request: NextRequest) {
  try {
    const { text, speed = 1.0 } = await request.json()

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'text is required' }, { status: 400 })
    }

    // Use the same API key as Gemini
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      return NextResponse.json(
        { error: 'API key not configured', fallback: true },
        { status: 200 }
      )
    }

    // Split text into chunks
    const chunks = chunkText(text)
    const audioBuffers: Buffer[] = []

    for (const chunk of chunks) {
      const hindi = isHindi(chunk)

      // Choose voice based on language
      const voice = hindi
        ? { languageCode: 'hi-IN', name: 'hi-IN-Neural2-C' }    // Male Hindi Neural2
        : { languageCode: 'en-IN', name: 'en-IN-Neural2-B' }    // Male Indian English Neural2

      const body = {
        input: { text: chunk },
        voice: {
          ...voice,
          ssmlGender: 'MALE',
        },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: Math.max(0.5, Math.min(2.0, speed)),
          pitch: -1.0,           // Slightly deeper for teacher authority
          volumeGainDb: 2.0,     // Slightly louder
          effectsProfileId: ['large-home-entertainment-class-device'], // Fuller sound
        },
      }

      const res = await fetch(`${GOOGLE_TTS_ENDPOINT}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        console.error('[TTS] Google Cloud TTS error:', res.status, errorData)

        // If it's a permission error, tell the user what to enable
        if (res.status === 403) {
          return NextResponse.json({
            error: 'Cloud Text-to-Speech API not enabled. Go to console.cloud.google.com → APIs → Enable "Cloud Text-to-Speech API"',
            fallback: true,
          }, { status: 200 })
        }

        return NextResponse.json({
          error: `TTS API error: ${res.status}`,
          detail: errorData,
          fallback: true,
        }, { status: 200 })
      }

      const data = await res.json()
      if (data.audioContent) {
        audioBuffers.push(Buffer.from(data.audioContent, 'base64'))
      }
    }

    if (audioBuffers.length === 0) {
      return NextResponse.json({ error: 'No audio generated', fallback: true }, { status: 200 })
    }

    // Concatenate all audio buffers
    const fullAudio = Buffer.concat(audioBuffers)

    // Return as audio stream
    return new NextResponse(fullAudio, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': String(fullAudio.length),
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    })
  } catch (error) {
    console.error('[TTS] Error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      fallback: true,
    }, { status: 200 })
  }
}

// Health check — actually tests the TTS API with a real call
export async function GET() {
  const apiKey = process.env.GEMINI_API_KEY
  const configured = !!(apiKey && apiKey !== 'your_gemini_api_key_here')

  if (!configured) {
    return NextResponse.json({
      status: 'missing_key',
      note: 'Set GEMINI_API_KEY in environment variables',
    })
  }

  // Actually test the TTS API
  try {
    const testBody = {
      input: { text: 'Hello' },
      voice: { languageCode: 'en-IN', name: 'en-IN-Neural2-B', ssmlGender: 'MALE' },
      audioConfig: { audioEncoding: 'MP3' },
    }

    const res = await fetch(`${GOOGLE_TTS_ENDPOINT}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testBody),
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      return NextResponse.json({
        status: 'error',
        httpStatus: res.status,
        error: errorData,
        fix: res.status === 403
          ? 'Enable "Cloud Text-to-Speech API" at https://console.cloud.google.com/apis/library/texttospeech.googleapis.com'
          : res.status === 400
          ? 'API key may not have permission for Cloud TTS. Try enabling the API.'
          : `Unexpected error ${res.status}`,
      })
    }

    const data = await res.json()
    return NextResponse.json({
      status: 'working',
      audioGenerated: !!data.audioContent,
      audioSizeBytes: data.audioContent ? Math.round(data.audioContent.length * 0.75) : 0,
    })
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Network error',
    })
  }
}
