import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

function getSystemPrompt(name: string) {
  return `You are ${name}, an AI teacher at JEETribe AI. Expert IIT professor teaching for JEE and NEET.

STYLE: Speak in Hinglish (Hindi + English mix). Hindi for encouragement/transitions, English for technical terms. Warm, patient, encouraging.
RULES: Relate to JEE/NEET patterns. Explain physical intuition, not just math. Give tricks to remember formulas. Never use markdown/bullets — speak naturally like a class lecture.`
}

function isVagueOrConfused(question: string): boolean {
  const q = question.toLowerCase().trim()
  const patterns = [
    'haan','ha','haa','yeh','ye','yahi','nahi','nhi','nai',
    'nahi samjha','nhi samjha','samajh nahi aaya','samjh nhi aaya',
    'nahi aaya','clear nahi','confused','doubt','doubt hai',
    'phir se','fir se','dobara','again','repeat',
    'kya','kaise','kyun','kyu','why','aur','or','what','huh','ok but',
    "don't understand",'dont understand',"didn't get",'didnt get',
    'not clear','explain again','say again','come again',
    'i dont get it',"i don't get it",'still confused',
    'what do you mean','how','but why','but how',
    'can you explain','explain this','tell me again',
    'not getting','still not clear','huh?','?',
  ]
  if (q.length <= 15) { for (const p of patterns) { if (q === p || q.includes(p)) return true } }
  if (q.length <= 5) return true
  if (q.replace(/[^a-zA-Z0-9\u0900-\u097F]/g, '').length <= 4) return true
  return false
}

export async function POST(request: NextRequest) {
  try {
    const {
      question, professorName, topicContext, previousSteps,
      repeatCount, previousAttempts,
      duringLesson, currentStepLabel, currentStepContent,
      // Socratic dialogue state
      socraticMode, pendingQuestion, targetConcept, socraticAttempts,
      weakSpots,
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
          // ═══ MID-LESSON SOCRATIC MODE ═══
          tokenLimit = 800
          temp = 0.5

          const stepInfo = `CURRENT STEP: "${currentStepLabel}"\nSTEP CONTENT:\n${currentStepContent}\n\nSTEPS COVERED:\n${previousSteps || 'None'}`
          const weakInfo = weakSpots?.length ? `\nSTUDENT'S KNOWN WEAK SPOTS: ${weakSpots.join(', ')}` : ''

          if (socraticMode === 'evaluate_answer') {
            // Student is answering our previous leading question
            promptText = `${getSystemPrompt(profName)}

TOPIC: ${topicContext}
${stepInfo}${weakInfo}

YOU PREVIOUSLY ASKED THIS LEADING QUESTION: "${pendingQuestion}"
THE CONCEPT BEING TESTED: "${targetConcept}"
STUDENT'S ANSWER: "${question}"
ATTEMPT NUMBER: ${socraticAttempts || 1}

EVALUATE their answer and respond with EXACTLY ONE of these JSON formats (respond ONLY with JSON, nothing else):

If their answer shows understanding (even partially correct):
{"verdict": "correct", "response": "Bilkul sahi! [brief praise + connect to next concept]. Ab samajh aaya? Continue press karo!", "concept": "${targetConcept}"}

If their answer is wrong or they seem confused (attempt 1-2):
{"verdict": "wrong", "response": "[Gently correct without giving full answer]. Hint: [give a specific hint]. Ek aur try karo!", "concept": "${targetConcept}", "hint": "[one-line hint]"}

If they've failed 3+ times, give the full explanation:
{"verdict": "give_up", "response": "[Full clear explanation with formula + example + analogy]. Ye concept important hai — ${targetConcept} ka matlab hai [explain]. Ab samajh aaya? Continue press karo ya aur poocho!", "concept": "${targetConcept}"}

IMPORTANT: Return ONLY valid JSON. No extra text before or after.`

          } else if (isVague) {
            // Student said "haan" / "nahi samjha" / vague → re-explain with Socratic approach
            promptText = `${getSystemPrompt(profName)}

TOPIC: ${topicContext}
${stepInfo}${weakInfo}

Student is confused about this step (said: "${question}").

${repeatCount >= 3 ? `They've been confused ${repeatCount} times. Previous failed explanations:\n${previousAttempts}\nUse COMPLETELY different approach.` : ''}

Instead of just explaining again, use the SOCRATIC METHOD:

Respond with this JSON format ONLY:
{"mode": "socratic", "leadingQuestion": "[A specific sub-question that tests the prerequisite concept. E.g., if step is about acceleration in pulley, ask: 'Pehle ye batao — m1 pe kitne forces lag rahe hain? Unke names kya hain?']", "targetConcept": "[the specific concept being tested, e.g., 'Force Identification' or 'Free Body Diagram']", "intro": "[1-2 sentence intro before the question, e.g., 'Achha dekho, pehle basics check karte hain...']"}

The leading question must:
- Test a PREREQUISITE concept (not the final answer)
- Be specific enough that the answer is 1-2 sentences
- Be something a JEE student should know
- Be in Hinglish

IMPORTANT: Return ONLY valid JSON. No extra text.`

          } else {
            // Student asked a SPECIFIC question → also use Socratic approach first
            promptText = `${getSystemPrompt(profName)}

TOPIC: ${topicContext}
${stepInfo}${weakInfo}

STUDENT'S DOUBT: "${question}"

${repeatCount >= 3 ? `Student asked ${repeatCount} times. Previous:\n${previousAttempts}\nGive full explanation this time.` : ''}

${repeatCount && repeatCount >= 3 ? `Since they have asked many times, give a DIRECT, CLEAR explanation with formula + example. Respond as plain text (NOT JSON).` :
`Use the SOCRATIC METHOD. Instead of giving the answer directly, ask a leading question that guides them to figure it out.

Respond with this JSON format ONLY:
{"mode": "socratic", "leadingQuestion": "[A question that makes them think about the prerequisite. E.g., if they ask 'How to find acceleration?', ask 'Pehle batao — dono blocks pe kaunse forces lag rahe hain aur kis direction mein?']", "targetConcept": "[specific concept being tested]", "intro": "[1 sentence like 'Achha, main seedha answer nahi dunga — pehle sochke batao...']"}

IMPORTANT: Return ONLY valid JSON. No extra text.`}`

          }
        } else {
          // ═══ CASUAL MODE ═══
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

        const rawText = result.response.text().trim()
        if (!rawText || rawText.length < 5) throw new Error('Response too short')

        // Try to parse as JSON (Socratic responses)
        try {
          // Clean up common JSON issues from LLMs
          const jsonStr = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
          const parsed = JSON.parse(jsonStr)
          return NextResponse.json({ ...parsed, model: modelName, raw: false })
        } catch {
          // Not JSON — return as plain text response
          return NextResponse.json({ response: rawText, model: modelName, raw: true })
        }
      } catch (modelError) {
        lastError = modelError instanceof Error ? modelError : new Error(String(modelError))
        console.error(`[Gemini] ${modelName} failed:`, lastError.message)
        continue
      }
    }

    return NextResponse.json({ error: lastError?.message || 'All models failed', fallback: true }, { status: 200 })
  } catch (error: unknown) {
    console.error('[Gemini] Error:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error', fallback: true }, { status: 200 })
  }
}

export async function GET() {
  const apiKey = process.env.GEMINI_API_KEY
  const configured = !!(apiKey && apiKey !== 'your_gemini_api_key_here')
  return NextResponse.json({ status: configured ? 'ready' : 'missing_key', keyPresent: configured })
}
