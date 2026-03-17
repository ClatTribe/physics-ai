import { NextRequest, NextResponse } from 'next/server'

/**
 * Google Cloud Text-to-Speech API
 *
 * Single request per call — NO chunking on server side.
 * Google TTS handles up to 5000 chars per request which is plenty.
 * This produces one clean audio file with no breaks or cuts.
 *
 * Voices:
 *   en-IN-Neural2-B  (male, Indian English)
 *   hi-IN-Neural2-C  (male, Hindi)
 */

const GOOGLE_TTS_ENDPOINT = 'https://texttospeech.googleapis.com/v1/text:synthesize'

export async function POST(request: NextRequest) {
  try {
    const { text, speed = 1.0 } = await request.json()

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'text is required' }, { status: 400 })
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      return NextResponse.json({ error: 'API key not configured', fallback: true }, { status: 200 })
    }

    // Use Indian English voice for Hinglish (handles both Hindi words and English)
    // en-IN voice pronounces Hindi transliteration well and English perfectly
    const body = {
      input: { text: text.slice(0, 4500) }, // Google limit safety
      voice: {
        languageCode: 'en-IN',
        name: 'en-IN-Neural2-B',
        ssmlGender: 'MALE',
      },
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: Math.max(0.5, Math.min(2.0, speed)),
        pitch: -1.0,
        volumeGainDb: 2.0,
        effectsProfileId: ['large-home-entertainment-class-device'],
      },
    }

    const res = await fetch(`${GOOGLE_TTS_ENDPOINT}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      console.error('[TTS] Error:', res.status, errorData)
      return NextResponse.json({
        error: `TTS error ${res.status}`,
        detail: errorData,
        fallback: true,
        fix: res.status === 403
          ? 'Add "Cloud Text-to-Speech API" to your API key restrictions at console.cloud.google.com/apis/credentials'
          : undefined,
      }, { status: 200 })
    }

    const data = await res.json()
    if (!data.audioContent) {
      return NextResponse.json({ error: 'No audio generated', fallback: true }, { status: 200 })
    }

    const audioBuffer = Buffer.from(data.audioContent, 'base64')

    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': String(audioBuffer.length),
        'Cache-Control': 'public, max-age=3600',
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

// Health check — actually calls Google TTS to verify it works
export async function GET() {
  const apiKey = process.env.GEMINI_API_KEY
  const configured = !!(apiKey && apiKey !== 'your_gemini_api_key_here')

  if (!configured) {
    return NextResponse.json({ status: 'missing_key' })
  }

  try {
    const res = await fetch(`${GOOGLE_TTS_ENDPOINT}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input: { text: 'Hello' },
        voice: { languageCode: 'en-IN', name: 'en-IN-Neural2-B', ssmlGender: 'MALE' },
        audioConfig: { audioEncoding: 'MP3' },
      }),
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      return NextResponse.json({
        status: 'error',
        httpStatus: res.status,
        error: errorData,
        fix: res.status === 403
          ? 'Add "Cloud Text-to-Speech API" to your API key at https://console.cloud.google.com/apis/credentials'
          : `Error ${res.status}`,
      })
    }

    const data = await res.json()
    return NextResponse.json({
      status: 'working',
      audioGenerated: !!data.audioContent,
    })
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Network error',
    })
  }
}
