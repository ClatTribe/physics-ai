import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const SYSTEM_PROMPT = `You are Prof. Arjun Sharma, the AI teacher at JEETribe AI. You are an expert IIT Delhi professor who teaches Physics, Chemistry, and Mathematics for JEE Mains, JEE Advanced, and NEET students.

PERSONALITY & STYLE:
- Speak in Hinglish (Hindi + English mix) — the way a real Indian coaching teacher talks
- Use Hindi for encouragement, transitions, emphasis ("Dekho", "Bilkul sahi", "Ab samjho", "Bahut accha doubt hai!")
- Use English for technical terms, formulas, and physics concepts
- Be warm, encouraging, and patient — like a favorite teacher
- Use phrases like "Ye bahut important hai JEE ke liye!", "NEET mein ye baar baar aata hai!"
- Keep answers concise (3-5 sentences) unless a detailed explanation is needed

TEACHING RULES:
- Always relate answers back to JEE/NEET exam patterns
- If a student asks "why", explain the physical intuition, not just math
- When giving formulas, also give the "trick" to remember them
- Correct misconceptions gently: "Bahut students ye galti karte hain, but actually..."
- End important explanations with a quick recap

RESPONSE FORMAT:
- Keep responses SHORT for doubts (50-100 words typically)
- Use simple language — you're teaching 16-18 year olds
- If someone asks something off-topic, gently bring them back to physics
- Never use markdown formatting, bullet points, or headers — speak naturally as a teacher would in class`

export async function POST(request: NextRequest) {
  try {
    const { question, topicContext, previousSteps, repeatCount, previousAttempts, duringLesson, currentStepLabel } = await request.json()

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY not configured', fallback: true },
        { status: 200 }
      )
    }

    const genAI = new GoogleGenerativeAI(apiKey)

    // Try models in order of preference (verified model IDs as of March 2026)
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

        // Emotional Intelligence: detect repeated doubts and change approach
        let emotionalContext = ''
        if (repeatCount && repeatCount >= 3) {
          emotionalContext = `\n\n⚠️ IMPORTANT: The student has asked about the SAME concept ${repeatCount} times. They clearly haven't understood your previous explanations. You MUST:
1. Acknowledge their frustration warmly: "Dekho, koi baat nahi — is concept ko samajhne mein time lagta hai"
2. Use a COMPLETELY DIFFERENT approach: use a real-life analogy, a visual example, or break it into even simpler baby steps
3. Do NOT repeat your previous explanation. Here are your previous attempts that DIDN'T work:\n${previousAttempts || 'N/A'}
4. Try: analogy from cricket/daily life, numerical example with very simple numbers, or step-by-step with "imagine you are..." framing`
        } else if (repeatCount && repeatCount === 2) {
          emotionalContext = `\n\nNote: Student asked a similar question before. Rephrase your explanation using a different angle or example. Say "Achha, main ek aur tarike se samjhata hoon..." Previous explanation:\n${previousAttempts || 'N/A'}`
        }

        // Mid-lesson doubt: the lesson is PAUSED waiting for understanding
        let lessonContext = ''
        if (duringLesson && currentStepLabel) {
          lessonContext = `\n\n🎯 CRITICAL CONTEXT: The student asked this doubt DURING a live lesson. The lesson is now PAUSED at step "${currentStepLabel}". You must:
1. Go BACK to this specific step and re-explain it more clearly
2. Use a simpler example or analogy specific to what confused them
3. Break the step into even smaller sub-steps
4. After explaining, encourage them: "Ab samajh aaya? Agar haan toh Continue press karo, nahi toh aur poocho!"
5. Keep your response focused on THIS step only — don't jump ahead
6. Response should be 80-150 words — detailed enough to clarify but not overwhelming`
        }

        const result = await model.generateContent({
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: `${SYSTEM_PROMPT}${contextMessage}${emotionalContext}${lessonContext}\n\nStudent's doubt: "${question}"\n\nRespond as Prof. Arjun Sharma in Hinglish. ${duringLesson ? 'Re-explain the current step in a clearer way.' : 'Keep it concise and helpful.'}`,
                },
              ],
            },
          ],
          generationConfig: {
            maxOutputTokens: 300,
            temperature: 0.7,
          },
        })

        const response = result.response
        const text = response.text()

        if (!text || text.trim().length === 0) {
          throw new Error('Empty response from model')
        }

        return NextResponse.json({ response: text, model: modelName })
      } catch (modelError) {
        lastError = modelError instanceof Error ? modelError : new Error(String(modelError))
        console.error(`[Gemini] Model ${modelName} failed:`, lastError.message)
        continue // Try next model
      }
    }

    // All models failed — return the actual error so user can debug
    return NextResponse.json(
      {
        error: lastError?.message || 'All models failed',
        fallback: true,
        debug: `Tried models: ${modelsToTry.join(', ')}. Last error: ${lastError?.message}`,
      },
      { status: 200 }
    )
  } catch (error: unknown) {
    console.error('[Gemini] Request error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: message, fallback: true },
      { status: 200 }
    )
  }
}

// Health check — GET /api/chat tells you if the key is configured
export async function GET() {
  const apiKey = process.env.GEMINI_API_KEY
  const configured = !!(apiKey && apiKey !== 'your_gemini_api_key_here')

  return NextResponse.json({
    status: configured ? 'ready' : 'missing_key',
    keyPresent: configured,
    keyPrefix: configured ? apiKey!.substring(0, 6) + '...' : null,
  })
}
