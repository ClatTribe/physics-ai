export interface Professor {
  name: string
  title: string
  image: string
  video?: string   // path to public/avatar-{subject}.mp4 if exists
  color: string    // ring color
}

export const professors: Record<string, Professor> = {
  Physics: {
    name: 'Prof. Arjun Sharma',
    title: 'Physics • IIT Delhi',
    image: '/physics_avatar.jpeg',
    video: '/avatar-physics.mp4',
    color: '#6c63ff',
  },
  Mathematics: {
    name: 'Prof. Ashutosh Verma',
    title: 'Mathematics • IIT Bombay',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
    video: '/avatar-math.mp4',
    color: '#ff9800',
  },
  Chemistry: {
    name: 'Prof. Pankaj Gupta',
    title: 'Chemistry • IIT Kanpur',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
    video: '/avatar-chemistry.mp4',
    color: '#00bcd4',
  },
}

// Default when no topic selected
export const defaultProfessor = professors.Physics
