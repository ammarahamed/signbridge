export type Landmark = [number, number, number];

export interface SignPose {
  landmarks: Landmark[];
  timestamp: number;
  handedness: 'left' | 'right' | 'both';
  secondHandLandmarks?: Landmark[];
}

export interface SignSequence {
  id: string;
  gloss: string;
  language: string;
  category: string;
  poses: SignPose[];
  duration: number;
  description: string;
  mnemonic?: string;
  twoHanded: boolean;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface SignLanguageInfo {
  id: string;
  name: string;
  nativeName: string;
  region: string;
  description: string;
  flag: string;
  alphabetType: 'one-handed' | 'two-handed';
  availableCourses: string[];
}

export interface Course {
  id: string;
  language: string;
  title: string;
  description: string;
  icon: string;
  lessons: Lesson[];
  order: number;
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  description: string;
  signs: string[];
  order: number;
}

export interface LessonStep {
  type: 'intro' | 'watch' | 'practice' | 'quiz';
  signId?: string;
  title: string;
  description: string;
}

export interface PoseComparisonResult {
  score: number;
  fingerScores: Record<string, number>;
  hints: string[];
}

export interface UserProgress {
  signsLearned: Record<string, SignProgress>;
  lessonsCompleted: string[];
  coursesCompleted: string[];
  xp: number;
  level: number;
  streakDays: number;
  lastPracticeDate: string;
  achievements: string[];
  preferredLanguage: string;
  favorites: string[];
}

export interface SignProgress {
  signId: string;
  bestScore: number;
  attempts: number;
  lastPracticed: string;
  mastered: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  condition: (progress: UserProgress) => boolean;
}
