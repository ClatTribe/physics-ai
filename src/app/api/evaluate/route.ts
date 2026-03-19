import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

/**
 * Step-by-step answer evaluator for Guided Solve mode.
 *
 * Student submits their attempt for ONE step at a time.
 * Gemini compares it to the correct step and identifies:
 *   - Is it correct?
 *   - If wrong, WHAT SPECIFIC SUB-SKILL is weak? (algebra, sign convention, formula recall, etc.)
 *   - A hint to guide them without giving the answer
 */

export async function POST(request: NextRequest) {
  try {
    const {
      professorName,
      topicTitle,
      stepLabel,           // e.g. "Write Equation for m1"
      stepContent,         // The correct step content (text + math)
      studentAnswer,       // What the student wrote
      stepIndex,           // Which step number
      totalSteps,          // Total steps in the question
      previousCorrect,     // Steps student already got right
      previousWrong,       // Steps student got wrong (with sub-skill)
      attemptNumber,       // How many tries on this step
    } = await request.json()

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      return NextResponse.json({ fallback: true }, { status: 200 })
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const modelsToTry = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash']
    const profName = professorName || 'Prof. Sharma'

    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName })

        const prompt = `You are ${profName}, evaluating a JEE/NEET student's step-by-step solution.

TOPIC: ${topicTitle}
STEP ${stepIndex + 1} of ${totalSteps}: "${stepLabel}"

CORRECT ANSWER FOR THIS STEP:
${stepContent}

STUDENT'S ATTEMPT:
"${studentAnswer}"

ATTEMPT NUMBER: ${attemptNumber}
${previousWrong?.length ? `PREVIOUSLY IDENTIFIED WEAK AREAS: ${previousWrong.join(', ')}` : ''}

EVALUATE the student's answer. Your response MUST start with one of these lines:

CORRECT
(if the student's answer is mathematically/conceptually correct, even if worded differently)

WRONG:[sub-skill]
(if wrong — identify the SPECIFIC sub-skill that's weak. Choose from: Formula Recall, Sign Convention, Algebra, Trigonometry, Unit Conversion, Force Identification, Free Body Diagram, Vector Components, Differentiation, Integration, Equation Setup, Substitution, Conceptual Understanding, Simplification)

After the first line, write 1-3 sentences in Hinglish:
- If CORRECT: Brief praise + what to do next. E.g. "Bilkul sahi! Ab next step mein in equations ko solve karo."
- If WRONG (attempt 1-2): A HINT without giving the answer. E.g. "Almost! Sign convention check karo — upward positive liya hai ya downward?"
- If WRONG (attempt 3+): Give the correct answer and explain. E.g. "Dekho, sahi equation hai: m₁g - T = m₁a. Kyunki m₁ neeche ja raha hai, mg downward aur T upward."

Keep it SHORT (2-3 sentences max).`

        const result = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 300, temperature: 0.4 },
        })

        const rawText = result.response.text().trim()
        if (!rawText) throw new Error('Empty')

        const firstLine = rawText.split('\n')[0].trim()
        const feedback = rawText.split('\n').slice(1).join('\n').trim()

        if (firstLine === 'CORRECT') {
          return NextResponse.json({ correct: true, feedback, model: modelName })
        }

        if (firstLine.startsWith('WRONG:')) {
          const weakSkill = firstLine.substring(6).trim()
          return NextResponse.json({ correct: false, weakSkill, feedback, model: modelName })
        }

        // Fallback: couldn't parse — treat as feedback
        return NextResponse.json({ correct: false, weakSkill: 'Unknown', feedback: rawText, model: modelName })

      } catch (err) {
        console.error(`[Evaluate] ${modelName}:`, err)
        continue
      }
    }

    return NextResponse.json({ fallback: true }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ fallback: true, error: String(error) }, { status: 200 })
  }
}
