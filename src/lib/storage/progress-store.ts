import { create } from 'zustand';
import { UserProgress, SignProgress } from '../signs/types';

const DEFAULT_PROGRESS: UserProgress = {
  signsLearned: {},
  lessonsCompleted: [],
  coursesCompleted: [],
  xp: 0,
  level: 1,
  streakDays: 0,
  lastPracticeDate: '',
  achievements: [],
  preferredLanguage: 'asl',
  favorites: [],
};

const STORAGE_KEY = 'signbridge-progress';

function loadProgress(): UserProgress {
  if (typeof window === 'undefined') return DEFAULT_PROGRESS;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return { ...DEFAULT_PROGRESS, ...JSON.parse(stored) };
  } catch {}
  return DEFAULT_PROGRESS;
}

function saveProgress(progress: UserProgress) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {}
}

function calculateLevel(xp: number): number {
  return Math.max(1, Math.floor(Math.sqrt(xp / 100)));
}

function xpForLevel(level: number): number {
  return level * level * 100;
}

function checkStreak(lastDate: string, currentStreak: number): { streakDays: number; lastPracticeDate: string } {
  const today = new Date().toISOString().split('T')[0];
  if (lastDate === today) return { streakDays: currentStreak, lastPracticeDate: today };

  const last = new Date(lastDate);
  const now = new Date(today);
  const diffDays = Math.floor((now.getTime() - last.getTime()) / (86400000));

  if (diffDays === 1) return { streakDays: currentStreak + 1, lastPracticeDate: today };
  if (diffDays === 2) return { streakDays: currentStreak, lastPracticeDate: today }; // grace period
  return { streakDays: 1, lastPracticeDate: today };
}

interface ProgressStore extends UserProgress {
  setLanguage: (language: string) => void;
  recordPractice: (signId: string, score: number) => void;
  completeLesson: (lessonId: string) => void;
  completeCourse: (courseId: string) => void;
  addXP: (amount: number) => void;
  toggleFavorite: (signId: string) => void;
  unlockAchievement: (achievementId: string) => void;
  hydrate: () => void;
  xpForNextLevel: () => number;
  xpProgress: () => number;
}

export const useProgressStore = create<ProgressStore>((set, get) => ({
  ...DEFAULT_PROGRESS,

  hydrate: () => {
    const progress = loadProgress();
    set(progress);
  },

  setLanguage: (language) => {
    set({ preferredLanguage: language });
    saveProgress({ ...get(), preferredLanguage: language });
  },

  recordPractice: (signId, score) => {
    const state = get();
    const existing = state.signsLearned[signId];
    const signProgress: SignProgress = {
      signId,
      bestScore: Math.max(score, existing?.bestScore || 0),
      attempts: (existing?.attempts || 0) + 1,
      lastPracticed: new Date().toISOString(),
      mastered: Math.max(score, existing?.bestScore || 0) >= 90,
    };
    const streak = checkStreak(state.lastPracticeDate, state.streakDays);
    let xpGain = 10;
    if (score >= 90) xpGain = 25;
    if (!existing) xpGain += 5;
    const newXP = state.xp + xpGain;
    const newState = {
      ...state,
      signsLearned: { ...state.signsLearned, [signId]: signProgress },
      xp: newXP,
      level: calculateLevel(newXP),
      ...streak,
    };
    set(newState);
    saveProgress(newState);
  },

  completeLesson: (lessonId) => {
    const state = get();
    if (state.lessonsCompleted.includes(lessonId)) return;
    const newXP = state.xp + 50;
    const newState = {
      ...state,
      lessonsCompleted: [...state.lessonsCompleted, lessonId],
      xp: newXP,
      level: calculateLevel(newXP),
    };
    set(newState);
    saveProgress(newState);
  },

  completeCourse: (courseId) => {
    const state = get();
    if (state.coursesCompleted.includes(courseId)) return;
    const newXP = state.xp + 200;
    const newState = {
      ...state,
      coursesCompleted: [...state.coursesCompleted, courseId],
      xp: newXP,
      level: calculateLevel(newXP),
    };
    set(newState);
    saveProgress(newState);
  },

  addXP: (amount) => {
    const state = get();
    const newXP = state.xp + amount;
    const newState = { ...state, xp: newXP, level: calculateLevel(newXP) };
    set(newState);
    saveProgress(newState);
  },

  toggleFavorite: (signId) => {
    const state = get();
    const favorites = state.favorites.includes(signId)
      ? state.favorites.filter(f => f !== signId)
      : [...state.favorites, signId];
    const newState = { ...state, favorites };
    set(newState);
    saveProgress(newState);
  },

  unlockAchievement: (achievementId) => {
    const state = get();
    if (state.achievements.includes(achievementId)) return;
    const newState = {
      ...state,
      achievements: [...state.achievements, achievementId],
    };
    set(newState);
    saveProgress(newState);
  },

  xpForNextLevel: () => xpForLevel(get().level + 1),
  xpProgress: () => {
    const state = get();
    const currentLevelXP = xpForLevel(state.level);
    const nextLevelXP = xpForLevel(state.level + 1);
    return ((state.xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;
  },
}));
