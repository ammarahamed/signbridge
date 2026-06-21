'use client';

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Hand, Shuffle, ChevronDown, Award, Zap, Repeat } from 'lucide-react';
import { signLanguages } from '@/lib/signs/languages';
import { getSignsByLanguage, getSignsByCategory } from '@/lib/signs/sign-data';
import { ReferenceImage } from '@/components/signs/ReferenceImage';
import { useProgressStore } from '@/lib/storage/progress-store';
import { SignSequence, PoseComparisonResult } from '@/lib/signs/types';

const SignPlayer = dynamic(
  () => import('@/components/avatar/SignPlayer').then(m => ({ default: m.SignPlayer })),
  { ssr: false, loading: () => <div className="w-full h-[300px] bg-gray-100 dark:bg-white/[0.06] rounded-xl animate-pulse" /> }
);

const WebcamPractice = dynamic(
  () => import('@/components/tracking/WebcamPractice').then(m => ({ default: m.WebcamPractice })),
  { ssr: false, loading: () => <div className="w-full h-[300px] bg-gray-100 dark:bg-white/[0.06] rounded-xl animate-pulse" /> }
);

export default function PracticePage() {
  const preferredLanguage = useProgressStore(s => s.preferredLanguage);
  const recordPractice = useProgressStore(s => s.recordPractice);
  const signsLearned = useProgressStore(s => s.signsLearned);

  const [language, setLanguage] = useState(preferredLanguage || 'asl');
  const [category, setCategory] = useState('alphabet');
  const [currentSign, setCurrentSign] = useState<SignSequence | null>(null);
  const [lastScore, setLastScore] = useState<PoseComparisonResult | null>(null);

  const signs = useMemo(() => getSignsByCategory(language, category), [language, category]);
  const categories = useMemo(() => {
    const allSigns = getSignsByLanguage(language);
    return [...new Set(allSigns.map(s => s.category))];
  }, [language]);

  const stats = useMemo(() => {
    const catIds = new Set(getSignsByCategory(language, category).map(s => s.id));
    const learned = Object.entries(signsLearned)
      .filter(([id]) => catIds.has(id))
      .map(([, p]) => p);
    const mastered = learned.filter(p => p.mastered).length;
    const avg = learned.length
      ? Math.round(learned.reduce((a, p) => a + p.bestScore, 0) / learned.length)
      : 0;
    const reps = learned.reduce((a, p) => a + p.attempts, 0);
    return { mastered, total: catIds.size, avg, reps };
  }, [signsLearned, language, category]);

  const pickRandomSign = () => {
    if (signs.length === 0) return;
    const idx = Math.floor(Math.random() * signs.length);
    setCurrentSign(signs[idx]);
    setLastScore(null);
  };

  const handleScore = (result: PoseComparisonResult) => {
    setLastScore(result);
    if (currentSign && result.score >= 60) {
      recordPractice(currentSign.id, result.score);
    }
  };

  if (!currentSign && signs.length > 0) {
    setCurrentSign(signs[0]);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#1dda63]/12 text-[#1dda63] mb-4">
            <Hand className="w-6 h-6" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Practice mode</h1>
          <p className="text-gray-400 mt-3 max-w-2xl">
            Practice signs with your webcam and get real-time feedback.
          </p>
        </div>

        <button
          onClick={pickRandomSign}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1dda63] hover:bg-[#15b850] text-[#0a0a0a] rounded-xl font-medium transition-colors"
        >
          <Shuffle className="w-4 h-4" />
          Random Sign
        </button>
      </div>

      {/* Live practice stats */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {[
          { icon: Award, label: 'Mastered', value: `${stats.mastered}/${stats.total}` },
          { icon: Zap, label: 'Avg accuracy', value: `${stats.avg}%` },
          { icon: Repeat, label: 'Total reps', value: `${stats.reps}` },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="rounded-2xl bg-white/[0.03] border border-white/10 p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1dda63]/12 text-[#1dda63] flex items-center justify-center shrink-0">
              <Icon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] uppercase tracking-wide text-gray-400 truncate">{label}</div>
              <div className="text-xl sm:text-2xl font-bold tabular-nums">{value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-8">
        <div className="relative">
          <select
            value={language}
            onChange={(e) => { setLanguage(e.target.value); setCurrentSign(null); }}
            className="appearance-none pl-4 pr-10 py-2.5 bg-white dark:bg-white/[0.06] border border-gray-200 dark:border-white/10 rounded-xl font-medium text-sm cursor-pointer"
          >
            {signLanguages.map(lang => (
              <option key={lang.id} value={lang.id}>{lang.flag} {lang.nativeName}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>

        <div className="flex gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => { setCategory(cat); setCurrentSign(null); }}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium capitalize transition-colors ${
                category === cat
                  ? 'bg-[#1dda63]/10 dark:bg-[#1dda63]/10 text-[#1dda63] dark:text-[#1dda63]'
                  : 'bg-gray-100 dark:bg-white/[0.06] text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/[0.1]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Sign selector */}
      <div className="flex flex-wrap gap-2 mb-8">
        {signs.map(sign => (
          <button
            key={sign.id}
            onClick={() => { setCurrentSign(sign); setLastScore(null); }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              currentSign?.id === sign.id
                ? 'bg-[#1dda63] text-white'
                : 'bg-gray-100 dark:bg-white/[0.06] text-gray-700 dark:text-gray-300 hover:bg-[#1dda63]/10 dark:hover:bg-[#1dda63]/10'
            }`}
          >
            {sign.gloss}
          </button>
        ))}
      </div>

      {/* Practice area */}
      {currentSign && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* 3D Reference + Real Image */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold">{currentSign.gloss}</h2>
              <span className="px-2 py-0.5 bg-gray-100 dark:bg-white/[0.06] rounded text-xs text-gray-500 uppercase">
                {currentSign.language}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white dark:bg-white/[0.06] rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden">
                <SignPlayer sign={currentSign} className="h-[280px]" />
              </div>
              <ReferenceImage sign={currentSign} />
            </div>
            <div className="p-4 bg-gray-50 dark:bg-white/[0.04] rounded-xl">
              <p className="text-sm text-gray-600 dark:text-gray-300">{currentSign.description}</p>
              {currentSign.mnemonic && (
                <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-2">
                  Tip: {currentSign.mnemonic}
                </p>
              )}
            </div>
          </div>

          {/* Webcam */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Your Turn</h2>
            <WebcamPractice
              targetLandmarks={currentSign.poses[0]?.landmarks || []}
              onScore={handleScore}
            />
          </div>
        </div>
      )}
    </div>
  );
}
