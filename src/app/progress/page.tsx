'use client';

import { useProgressStore } from '@/lib/storage/progress-store';
import { achievements, getAchievement } from '@/lib/gamification/achievements';
import { Trophy, Flame, Zap, Star, Target, Lock } from 'lucide-react';

export default function ProgressPage() {
  const progress = useProgressStore();
  const signsCount = Object.keys(progress.signsLearned).length;
  const masteredCount = Object.values(progress.signsLearned).filter(s => s.mastered).length;
  const totalAttempts = Object.values(progress.signsLearned).reduce((sum, s) => sum + s.attempts, 0);
  const avgScore = signsCount > 0
    ? Math.round(Object.values(progress.signsLearned).reduce((sum, s) => sum + s.bestScore, 0) / signsCount)
    : 0;

  const xpProgress = progress.xpProgress();
  const xpForNext = progress.xpForNextLevel();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold mb-8">Your Progress</h1>

      {/* Level & XP */}
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 sm:p-8 text-white mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[#1dda63] text-sm font-medium">Current Level</p>
            <p className="text-4xl font-bold">{progress.level}</p>
          </div>
          <div className="text-right">
            <p className="text-[#1dda63] text-sm font-medium">Total XP</p>
            <p className="text-4xl font-bold">{progress.xp.toLocaleString()}</p>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex justify-between text-sm text-[#1dda63] mb-2">
            <span>Level {progress.level}</span>
            <span>Level {progress.level + 1}</span>
          </div>
          <div className="h-3 bg-indigo-900/40 rounded-full overflow-hidden">
            <div
              className="h-full bg-white/90 rounded-full transition-all duration-500"
              style={{ width: `${xpProgress}%` }}
            />
          </div>
          <p className="text-xs text-[#1dda63] mt-2">{xpForNext - progress.xp} XP to next level</p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-white/[0.06] rounded-xl border border-gray-200 dark:border-white/10 p-5">
          <div className="flex items-center gap-2 text-orange-500 mb-2">
            <Flame className="w-5 h-5" />
            <span className="text-sm font-medium">Streak</span>
          </div>
          <p className="text-3xl font-bold">{progress.streakDays}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">days</p>
        </div>

        <div className="bg-white dark:bg-white/[0.06] rounded-xl border border-gray-200 dark:border-white/10 p-5">
          <div className="flex items-center gap-2 text-indigo-500 mb-2">
            <Zap className="w-5 h-5" />
            <span className="text-sm font-medium">Signs Learned</span>
          </div>
          <p className="text-3xl font-bold">{signsCount}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{masteredCount} mastered</p>
        </div>

        <div className="bg-white dark:bg-white/[0.06] rounded-xl border border-gray-200 dark:border-white/10 p-5">
          <div className="flex items-center gap-2 text-green-500 mb-2">
            <Target className="w-5 h-5" />
            <span className="text-sm font-medium">Avg Score</span>
          </div>
          <p className="text-3xl font-bold">{avgScore}%</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">best scores</p>
        </div>

        <div className="bg-white dark:bg-white/[0.06] rounded-xl border border-gray-200 dark:border-white/10 p-5">
          <div className="flex items-center gap-2 text-purple-500 mb-2">
            <Star className="w-5 h-5" />
            <span className="text-sm font-medium">Total Practice</span>
          </div>
          <p className="text-3xl font-bold">{totalAttempts}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">attempts</p>
        </div>
      </div>

      {/* Lessons & Courses */}
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <div className="bg-white dark:bg-white/[0.06] rounded-xl border border-gray-200 dark:border-white/10 p-5">
          <h3 className="font-semibold mb-2">Lessons Completed</h3>
          <p className="text-3xl font-bold text-[#1dda63]">{progress.lessonsCompleted.length}</p>
          {progress.lessonsCompleted.length === 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Start a course to track your progress</p>
          )}
        </div>
        <div className="bg-white dark:bg-white/[0.06] rounded-xl border border-gray-200 dark:border-white/10 p-5">
          <h3 className="font-semibold mb-2">Courses Completed</h3>
          <p className="text-3xl font-bold text-purple-600">{progress.coursesCompleted.length}</p>
          {progress.coursesCompleted.length === 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Complete all lessons in a course to finish it</p>
          )}
        </div>
      </div>

      {/* Achievements */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Trophy className="w-6 h-6 text-yellow-500" />
          Achievements
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map(achievement => {
            const unlocked = progress.achievements.includes(achievement.id);
            return (
              <div
                key={achievement.id}
                className={`flex items-start gap-4 p-4 rounded-xl border transition-colors ${
                  unlocked
                    ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700/50'
                    : 'bg-gray-50 dark:bg-white/[0.05] border-gray-200 dark:border-white/10 opacity-60'
                }`}
              >
                <div className={`flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-xl text-2xl ${
                  unlocked ? 'bg-yellow-100 dark:bg-yellow-900/30' : 'bg-gray-200 dark:bg-gray-700'
                }`}>
                  {unlocked ? achievement.icon : <Lock className="w-5 h-5 text-gray-400" />}
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{achievement.title}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-300 mt-0.5">{achievement.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
