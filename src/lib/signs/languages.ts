import { SignLanguageInfo, Course, Lesson } from './types';

export const signLanguages: SignLanguageInfo[] = [
  {
    id: 'asl',
    name: 'American Sign Language',
    nativeName: 'ASL',
    region: 'United States, Canada',
    description: 'Used by over 500,000 people in the US and Canada. One-handed fingerspelling alphabet.',
    flag: '🇺🇸',
    alphabetType: 'one-handed',
    availableCourses: ['alphabet', 'numbers', 'common-words'],
  },
  {
    id: 'bsl',
    name: 'British Sign Language',
    nativeName: 'BSL',
    region: 'United Kingdom',
    description: 'Used by over 150,000 people in the UK. Two-handed fingerspelling alphabet.',
    flag: '🇬🇧',
    alphabetType: 'two-handed',
    availableCourses: ['alphabet', 'numbers'],
  },
  {
    id: 'isl',
    name: 'Indian Sign Language',
    nativeName: 'ISL',
    region: 'India',
    description: 'Used by millions across India. One-handed fingerspelling with unique handshapes.',
    flag: '🇮🇳',
    alphabetType: 'one-handed',
    availableCourses: ['alphabet', 'numbers'],
  },
];

export const courses: Course[] = [
  {
    id: 'asl-alphabet',
    language: 'asl',
    title: 'ASL Alphabet',
    description: 'Learn the 26 letters of the ASL fingerspelling alphabet',
    icon: '🔤',
    order: 1,
    lessons: [
      { id: 'asl-alpha-1', courseId: 'asl-alphabet', title: 'Letters A–F', description: 'Your first six letters', signs: ['asl-a','asl-b','asl-c','asl-d','asl-e','asl-f'], order: 1 },
      { id: 'asl-alpha-2', courseId: 'asl-alphabet', title: 'Letters G–L', description: 'Building your vocabulary', signs: ['asl-g','asl-h','asl-i','asl-j','asl-k','asl-l'], order: 2 },
      { id: 'asl-alpha-3', courseId: 'asl-alphabet', title: 'Letters M–R', description: 'Halfway through!', signs: ['asl-m','asl-n','asl-o','asl-p','asl-q','asl-r'], order: 3 },
      { id: 'asl-alpha-4', courseId: 'asl-alphabet', title: 'Letters S–Z', description: 'Complete the alphabet', signs: ['asl-s','asl-t','asl-u','asl-v','asl-w','asl-x','asl-y','asl-z'], order: 4 },
    ],
  },
  {
    id: 'asl-numbers',
    language: 'asl',
    title: 'ASL Numbers',
    description: 'Learn numbers 0–9 in ASL',
    icon: '🔢',
    order: 2,
    lessons: [
      { id: 'asl-num-1', courseId: 'asl-numbers', title: 'Numbers 0–4', description: 'Start counting', signs: ['asl-0','asl-1','asl-2','asl-3','asl-4'], order: 1 },
      { id: 'asl-num-2', courseId: 'asl-numbers', title: 'Numbers 5–9', description: 'Complete single digits', signs: ['asl-5','asl-6','asl-7','asl-8','asl-9'], order: 2 },
    ],
  },
  {
    id: 'asl-common',
    language: 'asl',
    title: 'Common Words',
    description: 'Essential everyday signs',
    icon: '💬',
    order: 3,
    lessons: [
      { id: 'asl-greet-1', courseId: 'asl-common', title: 'Greetings', description: 'Hello, goodbye, and more', signs: ['asl-hello','asl-goodbye','asl-please','asl-thankyou','asl-sorry'], order: 1 },
    ],
  },
  {
    id: 'bsl-alphabet',
    language: 'bsl',
    title: 'BSL Alphabet',
    description: 'Learn the two-handed BSL fingerspelling alphabet',
    icon: '🔤',
    order: 1,
    lessons: [
      { id: 'bsl-alpha-1', courseId: 'bsl-alphabet', title: 'Letters A–F', description: 'Your first six letters', signs: ['bsl-a','bsl-b','bsl-c','bsl-d','bsl-e','bsl-f'], order: 1 },
      { id: 'bsl-alpha-2', courseId: 'bsl-alphabet', title: 'Letters G–L', description: 'Building vocabulary', signs: ['bsl-g','bsl-h','bsl-i','bsl-j','bsl-k','bsl-l'], order: 2 },
      { id: 'bsl-alpha-3', courseId: 'bsl-alphabet', title: 'Letters M–R', description: 'Halfway there!', signs: ['bsl-m','bsl-n','bsl-o','bsl-p','bsl-q','bsl-r'], order: 3 },
      { id: 'bsl-alpha-4', courseId: 'bsl-alphabet', title: 'Letters S–Z', description: 'Complete the alphabet', signs: ['bsl-s','bsl-t','bsl-u','bsl-v','bsl-w','bsl-x','bsl-y','bsl-z'], order: 4 },
    ],
  },
  {
    id: 'bsl-numbers',
    language: 'bsl',
    title: 'BSL Numbers',
    description: 'Learn numbers 0–9 in BSL',
    icon: '🔢',
    order: 2,
    lessons: [
      { id: 'bsl-num-1', courseId: 'bsl-numbers', title: 'Numbers 0–4', description: 'Start counting', signs: ['bsl-0','bsl-1','bsl-2','bsl-3','bsl-4'], order: 1 },
      { id: 'bsl-num-2', courseId: 'bsl-numbers', title: 'Numbers 5–9', description: 'Complete single digits', signs: ['bsl-5','bsl-6','bsl-7','bsl-8','bsl-9'], order: 2 },
    ],
  },
  {
    id: 'isl-alphabet',
    language: 'isl',
    title: 'ISL Alphabet',
    description: 'Learn the Indian Sign Language fingerspelling alphabet',
    icon: '🔤',
    order: 1,
    lessons: [
      { id: 'isl-alpha-1', courseId: 'isl-alphabet', title: 'Letters A–F', description: 'Your first six letters', signs: ['isl-a','isl-b','isl-c','isl-d','isl-e','isl-f'], order: 1 },
      { id: 'isl-alpha-2', courseId: 'isl-alphabet', title: 'Letters G–L', description: 'Building vocabulary', signs: ['isl-g','isl-h','isl-i','isl-j','isl-k','isl-l'], order: 2 },
      { id: 'isl-alpha-3', courseId: 'isl-alphabet', title: 'Letters M–R', description: 'Halfway there!', signs: ['isl-m','isl-n','isl-o','isl-p','isl-q','isl-r'], order: 3 },
      { id: 'isl-alpha-4', courseId: 'isl-alphabet', title: 'Letters S–Z', description: 'Complete the alphabet', signs: ['isl-s','isl-t','isl-u','isl-v','isl-w','isl-x','isl-y','isl-z'], order: 4 },
    ],
  },
  {
    id: 'isl-numbers',
    language: 'isl',
    title: 'ISL Numbers',
    description: 'Learn numbers 0–9 in ISL',
    icon: '🔢',
    order: 2,
    lessons: [
      { id: 'isl-num-1', courseId: 'isl-numbers', title: 'Numbers 0–4', description: 'Start counting', signs: ['isl-0','isl-1','isl-2','isl-3','isl-4'], order: 1 },
      { id: 'isl-num-2', courseId: 'isl-numbers', title: 'Numbers 5–9', description: 'Complete single digits', signs: ['isl-5','isl-6','isl-7','isl-8','isl-9'], order: 2 },
    ],
  },
];

export function getLanguage(id: string): SignLanguageInfo | undefined {
  return signLanguages.find(l => l.id === id);
}

export function getCoursesForLanguage(languageId: string): Course[] {
  return courses.filter(c => c.language === languageId).sort((a, b) => a.order - b.order);
}

export function getCourse(courseId: string): Course | undefined {
  return courses.find(c => c.id === courseId);
}

export function getLesson(lessonId: string): (Lesson & { course: Course }) | undefined {
  for (const course of courses) {
    const lesson = course.lessons.find(l => l.id === lessonId);
    if (lesson) return { ...lesson, course };
  }
  return undefined;
}
