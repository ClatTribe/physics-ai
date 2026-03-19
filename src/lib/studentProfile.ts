/**
 * Student Profile — tracks weak spots, concept mastery, and Socratic dialogue state
 *
 * Persists to localStorage so progress survives page refreshes.
 * Used by:
 *   - Gemini API to decide whether to ask a leading question or give direct help
 *   - ConceptHeatmap to show weak spots in red
 *   - Lesson player to adapt narration for weak concepts
 */

export interface WeakSpot {
  concept: string
  topicId: string
  stepLabel: string
  failedAttempts: number   // how many times student couldn't answer the sub-question
  lastAsked: number        // timestamp
  resolved: boolean        // student eventually got it right
}

export interface StudentProfile {
  weakSpots: WeakSpot[]
  // Track Socratic dialogue state per topic
  socraticState: Record<string, {
    pendingQuestion: string | null   // the leading question we asked
    targetConcept: string            // what concept we're testing
    stepLabel: string                // which step this relates to
    attempts: number                 // how many wrong answers so far
  }>
  totalDoubts: number
  totalResolved: number
}

const STORAGE_KEY = 'jeetribe_student_profile'

function getDefault(): StudentProfile {
  return { weakSpots: [], socraticState: {}, totalDoubts: 0, totalResolved: 0 }
}

export function loadProfile(): StudentProfile {
  if (typeof window === 'undefined') return getDefault()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? { ...getDefault(), ...JSON.parse(raw) } : getDefault()
  } catch { return getDefault() }
}

export function saveProfile(profile: StudentProfile) {
  if (typeof window === 'undefined') return
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(profile)) } catch { /* ignore */ }
}

export function addWeakSpot(profile: StudentProfile, topicId: string, stepLabel: string, concept: string): StudentProfile {
  const existing = profile.weakSpots.find(w => w.concept === concept && w.topicId === topicId)
  if (existing) {
    existing.failedAttempts++
    existing.lastAsked = Date.now()
    existing.resolved = false
  } else {
    profile.weakSpots.push({
      concept, topicId, stepLabel,
      failedAttempts: 1, lastAsked: Date.now(), resolved: false,
    })
  }
  profile.totalDoubts++
  return { ...profile }
}

export function resolveWeakSpot(profile: StudentProfile, topicId: string, concept: string): StudentProfile {
  const ws = profile.weakSpots.find(w => w.concept === concept && w.topicId === topicId)
  if (ws) {
    ws.resolved = true
    profile.totalResolved++
  }
  return { ...profile }
}

export function getWeakConcepts(profile: StudentProfile, topicId?: string): string[] {
  return profile.weakSpots
    .filter(w => !w.resolved && (!topicId || w.topicId === topicId))
    .map(w => w.concept)
}

export function setSocraticState(
  profile: StudentProfile,
  topicId: string,
  state: { pendingQuestion: string | null; targetConcept: string; stepLabel: string; attempts: number }
): StudentProfile {
  profile.socraticState[topicId] = state
  return { ...profile }
}

export function clearSocraticState(profile: StudentProfile, topicId: string): StudentProfile {
  delete profile.socraticState[topicId]
  return { ...profile }
}
