'use client';

import { useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { ArrowLeft, ArrowRight, CheckCircle2, Eye, Hand, HelpCircle } from 'lucide-react';
import { getLesson, getCourse } from '@/lib/signs/languages';
import { getSign } from '@/lib/signs/sign-data';
import { ReferenceImage } from '@/components/signs/ReferenceImage';
import { useProgressStore } from '@/lib/storage/progress-store';
import { PoseComparisonResult } from '@/lib/signs/types';

function scoreColor(s: number): string {
  return s >= 70 ? '#1dda63' : s >= 50 ? '#a3e635' : s >= 35 ? '#f97316' : '#ef4444';
}

const SignPlayer = dynamic(
  () => import('@/components/avatar/SignPlayer').then(m => ({ default: m.SignPlayer })),
  { ssr: false, loading: () => <div className="w-full h-[300px] bg-gray-100 dark:bg-white/[0.06] rounded-xl animate-pulse" /> }
);

const WebcamPractice = dynamic(
  () => import('@/components/tracking/WebcamPractice').then(m => ({ default: m.WebcamPractice })),
  { ssr: false, loading: () => <div className="w-full h-[300px] bg-gray-100 dark:bg-white/[0.06] rounded-xl animate-pulse" /> }
);

type StepType = 'intro' | 'watch' | 'practice' | 'quiz' | 'complete';

export default function LessonClient() {
  const params = useParams();
  const router = useRouter();
  const lessonId = params.lesson as string;
  const courseId = params.course as string;
  const language = params.language as string;

  const lesson = getLesson(lessonId);
  const course = getCourse(courseId);
  const recordPractice = useProgressStore(s => s.recordPractice);
  const completeLesson = useProgressStore(s => s.completeLesson);

  const [currentSignIndex, setCurrentSignIndex] = useState(0);
  const [step, setStep] = useState<StepType>('intro');
  const [bestScore, setBestScore] = useState(0);
  const [passed, setPassed] = useState(false);
  const [liveResult, setLiveResult] = useState<PoseComparisonResult | null>(null);
  const [quizAnswer, setQuizAnswer] = useState<string | null>(null);
  const [quizCorrect, setQuizCorrect] = useState<boolean | null>(null);

  if (!lesson || !course) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Lesson not found</h1>
        <Link href="/learn" className="text-[#1dda63] hover:underline">Back to courses</Link>
      </div>
    );
  }

  const signs = lesson.signs.map(getSign).filter(Boolean);
  const currentSign = signs[currentSignIndex];
  const totalSteps = signs.length;

  const handleScore = useCallback((result: PoseComparisonResult) => {
    setBestScore(b => Math.max(b, result.score));
    setLiveResult(result);
  }, []);

  // Fired once when the learner passes — show a card, don't auto-advance.
  const handlePass = useCallback((score: number) => {
    if (!currentSign) return;
    setPassed(true);
    setBestScore(b => Math.max(b, score));
    recordPractice(currentSign.id, score);
  }, [currentSign, recordPractice]);

  const nextSign = () => {
    setPassed(false);
    setLiveResult(null);
    if (currentSignIndex < signs.length - 1) {
      setCurrentSignIndex(i => i + 1);
      setStep('watch');
      setBestScore(0);
    } else {
      setStep('quiz');
    }
  };

  const handleQuizAnswer = (signId: string) => {
    const correct = signId === currentSign?.id;
    setQuizAnswer(signId);
    setQuizCorrect(correct);
    if (correct) {
      setTimeout(() => {
        completeLesson(lessonId);
        setStep('complete');
      }, 1500);
    }
  };

  const nextLesson = () => {
    if (!course) return;
    const currentIdx = course.lessons.findIndex(l => l.id === lessonId);
    if (currentIdx < course.lessons.length - 1) {
      const next = course.lessons[currentIdx + 1];
      router.push(`/learn/${language}/${courseId}/${next.id}`);
    } else {
      router.push(`/learn?lang=${language}`);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href={`/learn?lang=${language}`}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">{course.title}</span>
        </Link>
        <div className="text-sm text-gray-500">
          {currentSignIndex + 1} / {totalSteps}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-gray-100 dark:bg-white/[0.06] rounded-full mb-8 overflow-hidden">
        <div
          className="h-full bg-[#1dda63] rounded-full transition-all duration-500"
          style={{ width: `${((currentSignIndex + (step === 'complete' ? 1 : 0)) / totalSteps) * 100}%` }}
        />
      </div>

      {/* Lesson title */}
      <h1 className="text-2xl sm:text-3xl font-bold mb-2">{lesson.title}</h1>
      <p className="text-gray-600 dark:text-gray-300 mb-8">{lesson.description}</p>

      {/* Step content */}
      {step === 'intro' && (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-[#1dda63]/10 dark:bg-[#1dda63]/10 mb-6">
            <Eye className="w-10 h-10 text-[#1dda63] dark:text-[#1dda63]" />
          </div>
          <h2 className="text-2xl font-bold mb-3">Ready to learn?</h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto mb-8">
            You&apos;ll learn {signs.length} signs in this lesson. First watch the 3D demonstration,
            then practice with your camera.
          </p>
          <button
            onClick={() => setStep('watch')}
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#1dda63] hover:bg-[#15b850] text-[#0a0a0a] rounded-xl text-lg font-semibold transition-colors"
          >
            Let&apos;s Go
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {step === 'watch' && currentSign && (
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#1dda63]/10 dark:bg-[#1dda63]/10 text-[#1dda63] dark:text-[#1dda63] rounded-lg text-sm font-medium">
              <Eye className="w-4 h-4" />
              Watch
            </div>
            <h2 className="text-xl font-bold">{currentSign.gloss}</h2>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-white/[0.06] rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden">
              <SignPlayer sign={currentSign} className="h-[350px]" />
            </div>
            <ReferenceImage sign={currentSign} />
            <div className="flex flex-col justify-center p-6 bg-gray-50 dark:bg-white/[0.04] rounded-xl">
              <h3 className="font-semibold text-lg mb-3">How to sign &ldquo;{currentSign.gloss}&rdquo;</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">{currentSign.description}</p>
              {currentSign.mnemonic && (
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <p className="text-sm text-yellow-800 dark:text-yellow-300">
                    <span className="font-medium">Memory tip:</span> {currentSign.mnemonic}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={() => setStep('practice')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#1dda63] hover:bg-[#15b850] text-[#0a0a0a] rounded-xl font-medium transition-colors"
            >
              <Hand className="w-4 h-4" />
              Practice This Sign
            </button>
            <button
              onClick={nextSign}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-white/[0.06] hover:bg-gray-200 dark:hover:bg-white/[0.1] rounded-xl font-medium transition-colors"
            >
              Skip
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {step === 'practice' && currentSign && (
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg text-sm font-medium">
              <Hand className="w-4 h-4" />
              Practice
            </div>
            <h2 className="text-xl font-bold">Sign &ldquo;{currentSign.gloss}&rdquo;</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[230px_minmax(0,1fr)_320px] gap-5 items-start">
            {/* Reference — 3D hand + image (bigger so the hand is usable) */}
            <div className="space-y-3">
              <div className="bg-white dark:bg-white/[0.06] rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden">
                <SignPlayer sign={currentSign} showControls={false} className="h-[220px]" />
              </div>
              <ReferenceImage sign={currentSign} />
              <p className="text-xs text-gray-500 leading-relaxed px-1">{currentSign.description}</p>
            </div>

            {/* Camera (scores rendered in the right column) */}
            <div>
              <WebcamPractice
                targetLandmarks={currentSign.poses[0]?.landmarks || []}
                onScore={handleScore}
                onPass={handlePass}
                passThreshold={50}
                hideScores
              />
            </div>

            {/* Right: status + always-visible finger scores */}
            <div className="space-y-3">
              {passed ? (
                <div className="rounded-2xl bg-[#1dda63]/[0.08] border border-[#1dda63]/30 p-5 text-center">
                  <CheckCircle2 className="w-9 h-9 text-[#1dda63] mx-auto mb-2" />
                  <p className="text-base font-bold text-[#1dda63]">Nice! You signed &ldquo;{currentSign.gloss}&rdquo; — {bestScore}%</p>
                  <button
                    onClick={nextSign}
                    className="mt-3 w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#1dda63] hover:bg-[#15b850] text-[#072012] rounded-xl font-semibold transition-colors"
                  >
                    {currentSignIndex < signs.length - 1 ? 'Next sign' : 'Finish lesson'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-3 flex gap-2">
                  <button
                    onClick={() => setStep('watch')}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-medium text-gray-300 hover:bg-white/[0.06] rounded-xl transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" /> Watch
                  </button>
                  <button
                    onClick={nextSign}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-medium bg-white/[0.06] hover:bg-white/[0.1] text-white rounded-xl transition-colors"
                  >
                    Skip <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Live finger accuracy — always visible */}
              <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">Finger accuracy</span>
                  {liveResult && (
                    <span className="text-sm font-bold tabular-nums" style={{ color: scoreColor(liveResult.score) }}>
                      {liveResult.score}%
                    </span>
                  )}
                </div>
                {liveResult ? (
                  <div className="space-y-2">
                    {Object.entries(liveResult.fingerScores).map(([finger, score]) => (
                      <div key={finger} className="flex items-center gap-2">
                        <span className="w-12 text-xs text-gray-400 capitalize">{finger}</span>
                        <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{ width: `${score}%`, backgroundColor: scoreColor(score) }} />
                        </div>
                        <span className="w-9 text-right text-xs font-bold tabular-nums" style={{ color: scoreColor(score) }}>{score}%</span>
                      </div>
                    ))}
                    {liveResult.hints.length > 0 && (
                      <div className="pt-2 mt-1 border-t border-white/10 space-y-1">
                        {liveResult.hints.map((h, i) => (
                          <p key={i} className="text-xs text-gray-400 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: scoreColor(liveResult.score) }} />
                            {h}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500">Start the camera and show your hand to see live finger scores.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 'quiz' && (
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-purple-100 dark:bg-purple-900/30 mb-6">
            <HelpCircle className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
          <h2 className="text-2xl font-bold mb-3">Quick Quiz</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8">Which sign matches the 3D hand below?</p>

          {currentSign && (
            <div className="max-w-sm mx-auto mb-8 bg-white dark:bg-white/[0.06] rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden">
              <SignPlayer sign={currentSign} showControls={false} className="h-[250px]" />
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-lg mx-auto">
            {signs.slice(0, 6).map((sign) => (
              <button
                key={sign!.id}
                onClick={() => handleQuizAnswer(sign!.id)}
                disabled={quizAnswer !== null}
                className={`px-4 py-3 rounded-xl font-medium text-lg transition-all ${
                  quizAnswer === sign!.id
                    ? quizCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                    : quizAnswer !== null && sign!.id === currentSign?.id
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 dark:bg-white/[0.06] hover:bg-[#1dda63]/10 dark:hover:bg-[#1dda63]/10'
                }`}
              >
                {sign!.gloss}
              </button>
            ))}
          </div>

          {quizAnswer && !quizCorrect && (
            <button
              onClick={() => { setQuizAnswer(null); setQuizCorrect(null); completeLesson(lessonId); setStep('complete'); }}
              className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-[#1dda63] hover:bg-[#15b850] text-[#0a0a0a] rounded-xl font-medium transition-colors"
            >
              Continue Anyway
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {step === 'complete' && (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-3xl font-bold mb-3">Lesson Complete!</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-3">
            You learned {signs.length} signs: {signs.map(s => s!.gloss).join(', ')}
          </p>
          <p className="text-[#1dda63] dark:text-[#1dda63] font-medium mb-8">+50 XP earned</p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={nextLesson}
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#1dda63] hover:bg-[#15b850] text-[#0a0a0a] rounded-xl text-lg font-semibold transition-colors"
            >
              Next Lesson
              <ArrowRight className="w-5 h-5" />
            </button>
            <Link
              href={`/learn?lang=${language}`}
              className="inline-flex items-center gap-2 px-6 py-3 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/[0.06] rounded-xl transition-colors"
            >
              Back to Courses
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
