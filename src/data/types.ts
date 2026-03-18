export interface Step {
  label: string
  text?: string
  math?: string
  math2?: string
  math3?: string
  speech: string
  highlight?: boolean
  isAnswer?: boolean
  /** Which elements to reveal in the diagram at this step (cumulative) */
  showElements?: string[]
}

export interface DiagramConfig {
  type: 'atwood' | 'projectile' | 'pendulum' | 'lens' | 'circuit' | 'gauss'
  /** Default parameter values for sliders */
  params: Record<string, { label: string; min: number; max: number; step: number; value: number; unit: string }>
  /** Function-like formula strings for recalculation — actual calc is in the component */
}

export interface Topic {
  id: string
  title: string
  titleHi: string
  icon: string
  color: string
  exam: 'JEE Mains' | 'JEE Advanced' | 'NEET'
  subject: 'Physics' | 'Chemistry' | 'Mathematics'
  difficulty: 'Easy' | 'Medium' | 'Hard'
  chapter: string
  steps: Step[]
  /** Interactive diagram config — if present, shows animated canvas */
  diagram?: DiagramConfig
}

export type Subject = 'All' | 'Physics' | 'Chemistry' | 'Mathematics'
export type Difficulty = 'All' | 'Easy' | 'Medium' | 'Hard'
