import { Achievement, UserProgress } from '../signs/types';

export const achievements: Achievement[] = [
  {
    id: 'first-sign',
    title: 'First Sign',
    description: 'Learn your very first sign',
    icon: '🌟',
    condition: (p: UserProgress) => Object.keys(p.signsLearned).length >= 1,
  },
  {
    id: 'alphabet-starter',
    title: 'ABCs',
    description: 'Complete your first alphabet lesson',
    icon: '🔤',
    condition: (p: UserProgress) => p.lessonsCompleted.some(l => l.includes('alpha')),
  },
  {
    id: 'ten-signs',
    title: 'Getting Fluent',
    description: 'Learn 10 different signs',
    icon: '✋',
    condition: (p: UserProgress) => Object.keys(p.signsLearned).length >= 10,
  },
  {
    id: 'perfect-score',
    title: 'Perfect Form',
    description: 'Score 95% or higher on a practice session',
    icon: '💯',
    condition: (p: UserProgress) => Object.values(p.signsLearned).some(s => s.bestScore >= 95),
  },
  {
    id: 'week-warrior',
    title: 'Week Warrior',
    description: 'Practice for 7 days in a row',
    icon: '🔥',
    condition: (p: UserProgress) => p.streakDays >= 7,
  },
  {
    id: 'polyglot',
    title: 'Polyglot',
    description: 'Practice signs in 2 or more sign languages',
    icon: '🌍',
    condition: (p: UserProgress) => {
      const langs = new Set(Object.keys(p.signsLearned).map(id => id.split('-')[0]));
      return langs.size >= 2;
    },
  },
  {
    id: 'fifty-signs',
    title: 'Half Century',
    description: 'Learn 50 different signs',
    icon: '🏆',
    condition: (p: UserProgress) => Object.keys(p.signsLearned).length >= 50,
  },
  {
    id: 'century-club',
    title: 'Century Club',
    description: 'Learn 100 different signs',
    icon: '👑',
    condition: (p: UserProgress) => Object.keys(p.signsLearned).length >= 100,
  },
  {
    id: 'dedicated-learner',
    title: 'Dedicated Learner',
    description: 'Practice 50 times total',
    icon: '📚',
    condition: (p: UserProgress) => Object.values(p.signsLearned).reduce((sum, s) => sum + s.attempts, 0) >= 50,
  },
  {
    id: 'course-complete',
    title: 'Course Graduate',
    description: 'Complete an entire course',
    icon: '🎓',
    condition: (p: UserProgress) => p.coursesCompleted.length >= 1,
  },
];

export function checkAchievements(progress: UserProgress): string[] {
  return achievements
    .filter(a => !progress.achievements.includes(a.id) && a.condition(progress))
    .map(a => a.id);
}

export function getAchievement(id: string): Achievement | undefined {
  return achievements.find(a => a.id === id);
}
