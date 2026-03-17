import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const SYSTEM_PROMPT = `You are Prof. Arjun Sharma, an expert IIT Delhi physics professor who teaches JEE and NEET students. You are India's most beloved AI physics teacher.

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
    const { question, topicContext, previousSteps } = await request.json()

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY not configured', fallback: true },
        { status: 200 } // 200 so frontend can show fallback gracefully
      )
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
    })

    const contextMessage = topicContext
      ? `\n\nCurrent topic being taught: ${topicContext}\nSteps covered so far:\n${previousSteps || 'None yet'}`
      : ''

    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `${SYSTEM_PROMPT}${contextMessage}\n\nStudent's doubt: "${question}"\n\nRespond as Prof. Arjun Sharma in Hinglish. Keep it concise and helpful.`,
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

    return NextResponse.json({ response: text })
  } catch (error: unknown) {
    console.error('Gemini API error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: message, fallback: true },
      { status: 200 }
    )
  }
}
