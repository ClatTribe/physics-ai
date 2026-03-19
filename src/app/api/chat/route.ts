import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

function getSystemPrompt(name: string) {
  return `You are ${name}, an AI teacher at JEETribe AI. Expert IIT professor teaching for JEE and NEET.

STYLE: Speak in Hinglish (Hindi + English mix). Hindi for encouragement/transitions, English for technical terms. Warm, patient, encouraging.
RULES: Relate to JEE/NEET patterns. Explain physical intuition, not just math. Give tricks to remember formulas. Never use markdown/bullets — speak naturally like a class lecture.`
}

// Detect if student input is vague / "I don't understand" type
function isVagueOrConfused(question: string): boolean {
  const q = question.toLowerCase().trim()
  const vaguePatterns = [
    // Hindi
    'haan', 'ha', 'haa', 'yeh', 'ye', 'yahi', 'nahi', 'nhi', 'nai',
    'nahi samjha', 'nhi samjha', 'samajh nahi aaya', 'samjh nhi aaya',
    'nahi aaya', 'clear nahi', 'confused', 'doubt', 'doubt hai',
    'phir se', 'fir se', 'dobara', 'again', 'repeat',
    'kya', 'kaise', 'kyun', 'kyu', 'why',
    'aur', 'or', 'what', 'huh', 'ok but',
    // English
    "don't understand", 'dont understand', "didn't get", 'didnt get',
    'not clear', 'explain again', 'say again', 'come again',
    'i dont get it', "i don't get it", 'still confused',
    'what do you mean', 'how', 'but why', 'but how',
    'can you explain', 'explain this', 'tell me again',
    'not getting', 'still not clear', 'huh?', '?',
    'i dont understand', "i don't understand",
  ]
  // Check exact match or if the input is very short
  if (q.length <= 15) {
    for (const p of vaguePatterns) {
      if (q === p || q.includes(p)) return true
    }
  }
  // Very short input during lesson = likely confused
  if (q.length <= 5) return true
  // Input is just punctuation or single word
  if (q.replace(/[^a-zA-Z0-9\u0900-\u097F]/g, '').length <= 4) return true
  return false
}

export async function POST(request: NextRequest) {
  try {
    const {
      question, professorName, topicContext, previousSteps,
      repeatCount, previousAttempts,
      duringLesson, currentStepLabel, currentStepContent,
    } = await request.json()

    const profName = professorName || 'Prof. Arjun Sharma'

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      return NextResponse.json({ error: 'GEMINI_API_KEY not configured', fallback: true }, { status: 200 })
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const modelsToTry = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro']
    let lastError: Error | null = null
    const isVague = isVagueOrConfused(question)

    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName })

        let promptText: string
        let tokenLimit: number
        let temp: number

        if (duringLesson && currentStepContent) {
          // ═══ MID-LESSON MODE ═══
          tokenLimit = 800
          temp = 0.5

          const stepInfo = `
CURRENT STEP: "${currentStepLabel}"
STEP CONTENT:
${currentStepContent}

STEPS COVERED SO FAR:
${previousSteps || 'None'}`

          if (isVague) {
            // Student said something vague like "haan", "nahi samjha", "yeh", "?"
            // → DO NOT try to interpret the word. Just re-explain the step.
            promptText = `${getSystemPrompt(profName)}

TOPIC: ${topicContext}
${stepInfo}

THE STUDENT SAID: "${question}"
This is NOT a specific question — the student is confused and needs you to RE-EXPLAIN the current step.

YOU MUST DO ALL OF THIS (this is mandatory, not optional):

1. START with: "Achha koi baat nahi, main ek aur tarike se samjhata hoon..."

2. RE-EXPLAIN THE CONCEPT using a COMPLETELY DIFFERENT approach:
   - If the step has a formula, explain WHAT each symbol means physically (e.g., "g matlab gravity ka pull, 10 m/s² matlab har second speed 10 badh jaati hai")
   - Give a REAL-LIFE ANALOGY (e.g., for projectile: "Jaise agar tum terrace se ball throw karo...")
   - Work through a SIMPLER numerical example with easy numbers like 2, 5, 10

3. THEN show the same formula again but SLOWER, step by step:
   - "Pehle ye likho: [formula]"
   - "Ab isme ye value dalo: [substitution]"
   - "Calculate karo: [result]"

4. END with: "Ab samajh aaya? Agar haan toh Continue press karo. Nahi toh specifically batao kaunsa part confuse kar raha hai."

IMPORTANT: Your response MUST be 150-250 words. You MUST include actual formulas and numbers. Do NOT just say "accha doubt hai" — that is USELESS. Actually teach the concept.`
          } else {
            // Student asked a SPECIFIC question
            promptText = `${getSystemPrompt(profName)}

TOPIC: ${topicContext}
${stepInfo}

${repeatCount >= 3 ? `⚠️ Student asked about this ${repeatCount} times. Previous failed explanations:\n${previousAttempts}\nUse COMPLETELY different approach — daily life analogy, cricket example, or imagine-you-are framing.` : ''}
${repeatCount === 2 ? `Student asked similar before. Use different angle. Previous attempt:\n${previousAttempts}` : ''}

STUDENT'S SPECIFIC DOUBT: "${question}"

YOU MUST:
1. Directly answer their specific question about this step
2. If they ask "why" or "kaise" — explain the physical intuition, not just repeat the formula
3. Give a concrete example with actual numbers
4. If relevant, mention which JEE/NEET year this concept appeared
5. End with: "Ab clear hai? Continue press karo ya aur poocho!"

Response must be 100-200 words with actual teaching content.`
          }
        } else {
          // ═══ CASUAL MODE (not during lesson) ═══
          tokenLimit = 300
          temp = 0.7
          promptText = `${getSystemPrompt(profName)}

Topic: ${topicContext || 'General'}
${previousSteps ? `Context:\n${previousSteps}` : ''}

Student asks: "${question}"

Give a concise, helpful answer in Hinglish (50-100 words). Relate to JEE/NEET if relevant.`
        }

        const result = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: promptText }] }],
          generationConfig: { maxOutputTokens: tokenLimit, temperature: temp },
        })

        const text = result.response.text()
        if (!text || text.trim().length < 20) throw new Error('Response too short')

        return NextResponse.json({ response: text, model: modelName, isVague })
      } catch (modelError) {
        lastError = modelError instanceof Error ? modelError : new Error(String(modelError))
        console.error(`[Gemini] ${modelName} failed:`, lastError.message)
        continue
      }
    }

    return NextResponse.json({
      error: lastError?.message || 'All models failed', fallback: true,
      debug: `Tried: ${modelsToTry.join(', ')}`,
    }, { status: 200 })
  } catch (error: unknown) {
    console.error('[Gemini] Error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error', fallback: true,
    }, { status: 200 })
  }
}

export async function GET() {
  const apiKey = process.env.GEMINI_API_KEY
  const configured = !!(apiKey && apiKey !== 'your_gemini_api_key_here')
  return NextResponse.json({ status: configured ? 'ready' : 'missing_key', keyPresent: configured })
}
