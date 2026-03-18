import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const SYSTEM_PROMPT = `You are Prof. Arjun Sharma, the AI teacher at JEETribe AI. You are an expert IIT Delhi professor who teaches Physics, Chemistry, and Mathematics for JEE Mains, JEE Advanced, and NEET students.

PERSONALITY & STYLE:
- Speak in Hinglish (Hindi + English mix) — the way a real Indian coaching teacher talks
- Use Hindi for encouragement, transitions, emphasis ("Dekho", "Bilkul sahi", "Ab samjho", "Bahut accha doubt hai!")
- Use English for technical terms, formulas, and physics concepts
- Be warm, encouraging, and patient — like a favorite teacher
- Use phrases like "Ye bahut important hai JEE ke liye!", "NEET mein ye baar baar aata hai!"

TEACHING RULES:
- Always relate answers back to JEE/NEET exam patterns
- If a student asks "why", explain the physical intuition, not just math
- When giving formulas, also give the "trick" to remember them
- Correct misconceptions gently: "Bahut students ye galti karte hain, but actually..."
- End important explanations with a quick recap
- Never use markdown formatting, bullet points, or headers — speak naturally as a teacher would in class`

export async function POST(request: NextRequest) {
  try {
    const {
      question, topicContext, previousSteps,
      repeatCount, previousAttempts,
      duringLesson, currentStepLabel, currentStepContent,
    } = await request.json()

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY not configured', fallback: true },
        { status: 200 }
      )
    }

    const genAI = new GoogleGenerativeAI(apiKey)

    const modelsToTry = [
      'gemini-2.5-flash',
      'gemini-2.0-flash',
      'gemini-1.5-flash',
      'gemini-1.5-pro',
    ]

    let lastError: Error | null = null

    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName })

        const contextMessage = topicContext
          ? `\n\nCurrent topic being taught: ${topicContext}\nSteps covered so far:\n${previousSteps || 'None yet'}`
          : ''

        // Emotional Intelligence
        let emotionalContext = ''
        if (repeatCount && repeatCount >= 3) {
          emotionalContext = `\n\n⚠️ CRITICAL: Student asked about the SAME concept ${repeatCount} times. Previous explanations FAILED. You MUST:
1. Say: "Dekho, koi baat nahi — ek aur tarike se samjhte hain"
2. Use a COMPLETELY DIFFERENT method: real-life analogy (cricket, cooking, driving), or imagine-you-are framing
3. Do NOT repeat anything from these failed attempts:\n${previousAttempts || 'N/A'}
4. Start fresh with the simplest possible explanation`
        } else if (repeatCount && repeatCount === 2) {
          emotionalContext = `\n\nStudent asked similar before. Use a different angle. Say "Achha, ek aur example se samjhte hain..." Previous attempt:\n${previousAttempts || 'N/A'}`
        }

        // ═══ MID-LESSON DOUBT — this is the key part ═══
        let lessonContext = ''
        let tokenLimit = 300
        let temp = 0.7

        if (duringLesson) {
          tokenLimit = 600 // Much more room for a proper re-explanation
          temp = 0.6 // Slightly more focused

          lessonContext = `\n\n═══ LESSON IS PAUSED — STUDENT NEEDS RE-EXPLANATION ═══
The lesson stopped because the student has a doubt. They are confused about this specific step:

STEP TITLE: "${currentStepLabel || 'Unknown'}"
STEP CONTENT: ${currentStepContent || 'Not available'}

YOUR TASK — you MUST do ALL of these:
1. DIRECTLY address what confused them — don't just say "accha doubt hai" and stop
2. RE-EXPLAIN the concept in this step using DIFFERENT words and a SIMPLER example
3. If there's a formula, explain WHY each part of the formula exists (physical meaning)
4. Give a concrete numerical example with easy numbers (like 2, 5, 10) to build intuition
5. Use an analogy from daily life if possible (bucket filling for rate, cricket ball for projectile, etc.)
6. End with: "Ab samajh aaya? Continue press karo ya aur doubt poocho!"

IMPORTANT: Your response will be shown on the whiteboard and spoken aloud. Make it a REAL teaching moment, not a generic acknowledgment. Minimum 100 words.`
        }

        const promptText = duringLesson
          ? `${SYSTEM_PROMPT}${contextMessage}${emotionalContext}${lessonContext}\n\nStudent's doubt: "${question}"\n\nGive a detailed, clear re-explanation of the step. This will appear on the whiteboard. Make it educational and complete.`
          : `${SYSTEM_PROMPT}${contextMessage}${emotionalContext}\n\nStudent's doubt: "${question}"\n\nRespond concisely as Prof. Sharma in Hinglish (50-100 words).`

        const result = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: promptText }] }],
          generationConfig: {
            maxOutputTokens: tokenLimit,
            temperature: temp,
          },
        })

        const text = result.response.text()
        if (!text || text.trim().length === 0) throw new Error('Empty response')

        return NextResponse.json({ response: text, model: modelName })
      } catch (modelError) {
        lastError = modelError instanceof Error ? modelError : new Error(String(modelError))
        console.error(`[Gemini] ${modelName} failed:`, lastError.message)
        continue
      }
    }

    return NextResponse.json({
      error: lastError?.message || 'All models failed',
      fallback: true,
      debug: `Tried: ${modelsToTry.join(', ')}`,
    }, { status: 200 })
  } catch (error: unknown) {
    console.error('[Gemini] Error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      fallback: true,
    }, { status: 200 })
  }
}

export async function GET() {
  const apiKey = process.env.GEMINI_API_KEY
  const configured = !!(apiKey && apiKey !== 'your_gemini_api_key_here')
  return NextResponse.json({
    status: configured ? 'ready' : 'missing_key',
    keyPresent: configured,
    keyPrefix: configured ? apiKey!.substring(0, 6) + '...' : null,
  })
}
