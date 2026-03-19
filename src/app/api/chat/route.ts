import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

function getSystemPrompt(name: string) {
  return `You are ${name}, an AI teacher at JEETribe AI. Expert IIT professor for JEE and NEET.
Speak in Hinglish (Hindi + English mix). Hindi for encouragement, English for technical terms. Warm and patient.
Relate to JEE/NEET patterns. Explain physical intuition. Give memory tricks for formulas.
Never use markdown, bullet points, or headers — speak naturally like a class lecture.
Never output JSON or code blocks — only natural speech.`
}

function isVagueOrConfused(q: string): boolean {
  const s = q.toLowerCase().trim()
  const p = ['haan','ha','haa','yeh','ye','nahi','nhi','nai','nahi samjha','samajh nahi aaya','clear nahi','confused','doubt','phir se','fir se','again','repeat','kya','kaise','kyun','kyu','why','what','huh',"don't understand",'dont understand','not clear','explain again','still confused','how','but why',"i don't get it",'not getting','?']
  if (s.length <= 15) { for (const x of p) { if (s === x || s.includes(x)) return true } }
  if (s.length <= 5) return true
  return false
}

export async function POST(request: NextRequest) {
  try {
    const {
      question, professorName, topicContext, previousSteps,
      repeatCount, previousAttempts,
      duringLesson, currentStepLabel, currentStepContent,
      socraticMode, pendingQuestion, targetConcept, socraticAttempts,
      weakSpots,
    } = await request.json()

    const profName = professorName || 'Prof. Arjun Sharma'
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      return NextResponse.json({ error: 'No API key', fallback: true }, { status: 200 })
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const modelsToTry = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro']
    let lastError: Error | null = null
    const vague = isVagueOrConfused(question)

    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName })
        let promptText: string
        let tokenLimit = 400
        let temp = 0.6

        const stepInfo = currentStepContent ? `\nCURRENT STEP: "${currentStepLabel}"\nCONTENT:\n${currentStepContent}` : ''
        const stepsInfo = previousSteps ? `\nSTEPS COVERED:\n${previousSteps}` : ''
        const weakInfo = weakSpots?.length ? `\nSTUDENT WEAK SPOTS: ${weakSpots.join(', ')}` : ''

        if (socraticMode === 'evaluate_answer') {
          // ═══ Evaluate student's answer to our previous question ═══
          tokenLimit = 600
          promptText = `${getSystemPrompt(profName)}

TOPIC: ${topicContext}${stepInfo}${weakInfo}

You previously asked this question: "${pendingQuestion}"
Concept being tested: "${targetConcept}"
Student answered: "${question}"
This is attempt #${socraticAttempts || 1}

EVALUATE their answer:

If CORRECT (even partially): Start with "VERDICT:CORRECT" on the first line, then praise them and briefly connect to the main concept. End with "Continue press karo!"

If WRONG and this is attempt 1 or 2: Start with "VERDICT:WRONG" on the first line, then gently correct, give a specific hint, and say "Ek aur try karo!"

If WRONG and this is attempt 3+: Start with "VERDICT:GIVEUP" on the first line, then give the FULL clear explanation with formula, example, and analogy. End with "Continue press karo ya aur doubt poocho!"

IMPORTANT: Start your response with exactly one of: VERDICT:CORRECT or VERDICT:WRONG or VERDICT:GIVEUP (on its own line). Then write your natural Hinglish explanation.`

        } else if (duringLesson && (vague || question)) {
          // ═══ Doubt during lesson ═══
          tokenLimit = 1000
          temp = 0.5

          const repeatContext = repeatCount >= 3
            ? `\nStudent asked ${repeatCount} times. Previous FAILED explanations:\n${previousAttempts}\nUse COMPLETELY different approach.`
            : repeatCount === 2
            ? `\nAsked before. Use different angle. Previous:\n${previousAttempts}`
            : ''

          if (vague) {
            // "haan", "nahi samjha", "?" → re-explain the step
            promptText = `${getSystemPrompt(profName)}

TOPIC: ${topicContext}${stepInfo}${stepsInfo}${weakInfo}${repeatContext}

Student said "${question}" — they are confused and need the current step re-explained.

YOU MUST DO ALL OF THIS:

Start with: "Achha koi baat nahi, ek aur tarike se samjhte hain..."

1. EXPLAIN what this step is about in simple words (what are we trying to find and why)
2. If there is a formula — explain WHAT each symbol means physically. For example: "g matlab gravity, 10 m/s² ka matlab har second mein speed 10 badhti hai"
3. Give a REAL-LIFE ANALOGY. For example for projectile: "Jaise terrace se ball phenko..."
4. Work through a SIMPLE numerical example with easy numbers like 2, 5, 10
5. Show the formula step by step: "Pehle ye likho... Ab isme values dalo... Calculate karo..."
6. End with: "Ab samajh aaya? Continue press karo ya specific doubt batao!"

Write at least 150 words. Actually TEACH the concept — do not just say "accha doubt hai".`

          } else {
            // Specific question → Socratic leading question
            if (repeatCount && repeatCount >= 3) {
              // Too many repeats → give direct answer
              promptText = `${getSystemPrompt(profName)}

TOPIC: ${topicContext}${stepInfo}${stepsInfo}${weakInfo}${repeatContext}

Student asks: "${question}"

They have asked multiple times — give a DIRECT, CLEAR, DETAILED explanation. Use a different approach than before. Include formula, numerical example, and real-life analogy. At least 150 words.`
            } else {
              // Socratic: ask a leading question
              promptText = `${getSystemPrompt(profName)}

TOPIC: ${topicContext}${stepInfo}${stepsInfo}${weakInfo}

Student asks: "${question}"

Instead of giving the answer directly, guide them with a LEADING QUESTION.

Start with "SOCRATIC:" on the first line, followed by the concept name in brackets like [Force Identification].
Then write 1-2 sentences of intro, then ask a specific sub-question that tests a prerequisite concept.

Example format:
SOCRATIC:[Free Body Diagram]
Achha, main seedha answer nahi dunga. Pehle sochke batao — m1 pe kitne forces lag rahe hain aur kis direction mein? Sab forces ke naam batao.

The leading question must test a PREREQUISITE (not the final answer), be answerable in 1-2 sentences, and be in Hinglish.`
            }
          }
        } else {
          // ═══ Casual mode ═══
          tokenLimit = 300
          temp = 0.7
          promptText = `${getSystemPrompt(profName)}

Topic: ${topicContext || 'General'}${stepsInfo}

Student asks: "${question}"

Give a concise helpful answer in Hinglish (50-100 words).`
        }

        const result = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: promptText }] }],
          generationConfig: { maxOutputTokens: tokenLimit, temperature: temp },
        })

        const rawText = result.response.text().trim()
        if (!rawText || rawText.length < 10) throw new Error('Response too short')

        // Parse structured responses
        if (rawText.startsWith('VERDICT:')) {
          const firstNewline = rawText.indexOf('\n')
          const verdictLine = rawText.substring(0, firstNewline > 0 ? firstNewline : rawText.length).trim()
          const responseText = firstNewline > 0 ? rawText.substring(firstNewline + 1).trim() : ''

          let verdict = 'give_up'
          if (verdictLine.includes('CORRECT')) verdict = 'correct'
          else if (verdictLine.includes('WRONG')) verdict = 'wrong'

          return NextResponse.json({ verdict, response: responseText, concept: targetConcept, model: modelName })
        }

        if (rawText.startsWith('SOCRATIC:')) {
          const firstNewline = rawText.indexOf('\n')
          const conceptLine = rawText.substring(9, firstNewline > 0 ? firstNewline : rawText.length).trim()
          const concept = conceptLine.replace(/[\[\]]/g, '').trim() || 'Concept'
          const body = firstNewline > 0 ? rawText.substring(firstNewline + 1).trim() : rawText.substring(9).trim()

          // Split into intro and question (last sentence ending with ?)
          const lastQ = body.lastIndexOf('?')
          let intro = body
          let leadingQuestion = body
          if (lastQ > 20) {
            // Find the start of the question sentence
            const beforeQ = body.substring(0, lastQ)
            const sentStart = Math.max(beforeQ.lastIndexOf('.'), beforeQ.lastIndexOf('!'), beforeQ.lastIndexOf('।')) + 1
            intro = body.substring(0, sentStart).trim()
            leadingQuestion = body.substring(sentStart).trim()
          }

          return NextResponse.json({ mode: 'socratic', intro, leadingQuestion, targetConcept: concept, model: modelName })
        }

        // Plain text response
        return NextResponse.json({ response: rawText, model: modelName })

      } catch (modelError) {
        lastError = modelError instanceof Error ? modelError : new Error(String(modelError))
        console.error(`[Gemini] ${modelName}:`, lastError.message)
        continue
      }
    }

    return NextResponse.json({ error: lastError?.message, fallback: true }, { status: 200 })
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Error', fallback: true }, { status: 200 })
  }
}

export async function GET() {
  const apiKey = process.env.GEMINI_API_KEY
  const ok = !!(apiKey && apiKey !== 'your_gemini_api_key_here')
  return NextResponse.json({ status: ok ? 'ready' : 'missing_key', keyPresent: ok })
}
