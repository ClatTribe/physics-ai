export interface Step {
  label: string
  text?: string
  math?: string
  math2?: string
  math3?: string
  speech: string
  highlight?: boolean
  isAnswer?: boolean
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
}

export type Subject = 'All' | 'Physics' | 'Chemistry' | 'Mathematics'
export type Difficulty = 'All' | 'Easy' | 'Medium' | 'Hard'
