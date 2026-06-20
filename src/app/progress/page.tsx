'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useProgressStore } from '@/lib/storage/progress-store';
import { achievements } from '@/lib/gamification/achievements';
import {
  Trophy, Flame, Zap, Target, Lock, BookOpen, Camera, Languages, ArrowRight,
} from 'lucide-react';

const quickActions = [
  { href: '/learn', icon: BookOpen, title: 'Continue a course', desc: 'Pick up where you left off', color: '#1dda63' },
  { href: '/practice', icon: Camera, title: 'Practice with webcam', desc: 'Get instant feedback on your signs', color: '#1dda63' },
  { href: '/translate', icon: Languages, title: 'Translate text to sign', desc: 'Type anything and watch it signed', color: '#1dda63' },
];

export default function DashboardPage() {
  const progress = useProgressStore();
  const [today, setToday] = useState('');

  useEffect(() => {
    setToday(new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }));
  }, []);

  const signsCount = Object.keys(progress.signsLearned).length;
  const masteredCount = Object.values(progress.signsLearned).filter(s => s.mastered).length;
  const avgScore = signsCount > 0
    ? Math.round(Object.values(progress.signsLearned).reduce((sum, s) => sum + s.bestScore, 0) / signsCount)
    : 0;
  const isNew = signsCount === 0 && progress.lessonsCompleted.length === 0;

  const xpProgress = progress.xpProgress();
  const xpForNext = progress.xpForNextLevel();
  const unlockedCount = progress.achievements.length;

  const stats = [
    { icon: Flame, label: 'Day streak', value: progress.streakDays, sub: progress.streakDays === 1 ? 'day' : 'days' },
    { icon: Zap, label: 'Signs learned', value: signsCount, sub: `${masteredCount} mastered` },
    { icon: Target, label: 'Average score', value: `${avgScore}%`, sub: 'your best signs' },
    { icon: Trophy, label: 'Achievements', value: unlockedCount, sub: `of ${achievements.length}` },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Greeting */}
      <div className="mb-8">
        <p className="text-sm text-[#1dda63] font-medium">{today || ' '}</p>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mt-1">
          {isNew ? 'Welcome to SignBridge 👋' : 'Welcome back 👋'}
        </h1>
        <p className="text-gray-400 mt-2">
          {isNew
            ? 'Let’s learn your first signs. Pick anything below to get started.'
            : 'Here’s your progress — keep the streak going.'}
        </p>
      </div>

      {/* Level + XP */}
      <div className="relative overflow-hidden rounded-3xl border border-[#1dda63]/25 bg-gradient-to-br from-[#0e2417] to-[#0a0a0a] p-6 sm:p-8 mb-8">
        <div className="pointer-events-none absolute -top-16 -right-10 w-64 h-64 bg-[#1dda63]/20 blur-[90px] rounded-full" />
        <div className="relative flex items-end justify-between mb-5">
          <div>
            <p className="text-sm text-[#1dda63] font-medium">Level</p>
            <p className="text-5xl font-bold leading-none mt-1">{progress.level}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-[#1dda63] font-medium">Total XP</p>
            <p className="text-3xl font-bold leading-none mt-1">{progress.xp.toLocaleString()}</p>
          </div>
        </div>
        <div className="relative">
          <div className="h-3 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-[#1dda63] rounded-full transition-all duration-500" style={{ width: `${xpProgress}%` }} />
          </div>
          <p className="text-xs text-gray-400 mt-2">
            {Math.max(0, xpForNext - progress.xp)} XP to level {progress.level + 1}
          </p>
        </div>
      </div>

      {/* Quick actions */}
      <h2 className="text-lg font-semibold mb-3">{isNew ? 'Start here' : 'Jump back in'}</h2>
      <div className="grid sm:grid-cols-3 gap-4 mb-10">
        {quickActions.map(({ href, icon: Icon, title, desc }) => (
          <Link
            key={href}
            href={href}
            className="group p-5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-[#1dda63]/40 hover:bg-white/[0.05] transition-all"
          >
            <div className="w-11 h-11 rounded-xl bg-[#1dda63]/12 text-[#1dda63] flex items-center justify-center mb-3">
              <Icon className="w-5 h-5" />
            </div>
            <h3 className="font-semibold group-hover:text-[#1dda63] transition-colors">{title}</h3>
            <p className="text-sm text-gray-400 mt-1">{desc}</p>
            <div className="mt-3 inline-flex items-center gap-1 text-sm text-gray-500 group-hover:text-[#1dda63] transition-colors">
              Go <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </div>

      {/* Stats */}
      <h2 className="text-lg font-semibold mb-3">Your stats</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map(({ icon: Icon, label, value, sub }) => (
          <div key={label} className="p-5 rounded-2xl bg-white/[0.03] border border-white/10">
            <div className="flex items-center gap-2 text-[#1dda63] mb-3">
              <Icon className="w-5 h-5" />
              <span className="text-sm font-medium text-gray-300">{label}</span>
            </div>
            <p className="text-3xl font-bold">{value}</p>
            <p className="text-xs text-gray-500 mt-1">{sub}</p>
          </div>
        ))}
      </div>

      {/* Achievements */}
      <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
        <Trophy className="w-5 h-5 text-[#1dda63]" /> Achievements
      </h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {achievements.map((achievement) => {
          const unlocked = progress.achievements.includes(achievement.id);
          return (
            <div
              key={achievement.id}
              className={`flex items-start gap-4 p-4 rounded-2xl border transition-colors ${
                unlocked
                  ? 'bg-[#1dda63]/[0.08] border-[#1dda63]/30'
                  : 'bg-white/[0.02] border-white/10 opacity-60'
              }`}
            >
              <div className={`shrink-0 w-12 h-12 flex items-center justify-center rounded-xl text-2xl ${
                unlocked ? 'bg-[#1dda63]/15' : 'bg-white/[0.06]'
              }`}>
                {unlocked ? achievement.icon : <Lock className="w-5 h-5 text-gray-500" />}
              </div>
              <div>
                <h3 className="font-semibold text-sm">{achievement.title}</h3>
                <p className="text-xs text-gray-400 mt-0.5">{achievement.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
