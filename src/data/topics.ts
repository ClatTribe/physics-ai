export type { Step, Topic, Subject, Difficulty } from './types'

import { physicsQuestions } from './physics'
import { chemistryQuestions } from './chemistry'
import { mathQuestions } from './mathematics'
import type { Topic } from './types'

export const topics: Topic[] = [
  ...physicsQuestions,
  ...chemistryQuestions,
  ...mathQuestions,
]
