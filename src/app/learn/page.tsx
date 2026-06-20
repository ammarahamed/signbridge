'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowRight, CheckCircle2, BookOpen } from 'lucide-react';
import { signLanguages, getCoursesForLanguage } from '@/lib/signs/languages';
import { useProgressStore } from '@/lib/storage/progress-store';

function LearnContent() {
  const searchParams = useSearchParams();
  const preferredLanguage = useProgressStore(s => s.preferredLanguage);
  const setLanguage = useProgressStore(s => s.setLanguage);
  const lessonsCompleted = useProgressStore(s => s.lessonsCompleted);
  const coursesCompleted = useProgressStore(s => s.coursesCompleted);

  const initialLang = searchParams.get('lang') || preferredLanguage || 'asl';
  const [selectedLang, setSelectedLang] = useState(initialLang);

  const courses = getCoursesForLanguage(selectedLang);
  const selectedLangInfo = signLanguages.find(l => l.id === selectedLang);

  const handleLangChange = (langId: string) => {
    setSelectedLang(langId);
    setLanguage(langId);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-10">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#1dda63]/12 text-[#1dda63] mb-4">
          <BookOpen className="w-6 h-6" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Learn sign language</h1>
        <p className="mt-3 text-lg text-gray-400 max-w-2xl">
          Choose your language and start learning with structured, bite-sized courses.
        </p>
      </div>

      {/* Language selector */}
      <div className="flex flex-wrap gap-3 mb-10">
        {signLanguages.map((lang) => (
          <button
            key={lang.id}
            onClick={() => handleLangChange(lang.id)}
            className={`flex items-center gap-2.5 px-5 py-3 rounded-xl font-medium transition-all ${
              selectedLang === lang.id
                ? 'bg-[#1dda63] text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30'
                : 'bg-gray-100 dark:bg-white/[0.08] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/[0.12]'
            }`}
          >
            <span className="text-xl">{lang.flag}</span>
            <span>{lang.nativeName}</span>
          </button>
        ))}
      </div>

      {/* Selected language info */}
      {selectedLangInfo && (
        <div className="mb-10 p-5 bg-[#1dda63]/5 dark:bg-[#1dda63]/10 rounded-xl border border-indigo-100 dark:border-indigo-800">
          <h2 className="font-semibold text-lg">{selectedLangInfo.name}</h2>
          <p className="text-gray-600 dark:text-gray-300 mt-1">{selectedLangInfo.description}</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            Alphabet type: <span className="font-medium capitalize">{selectedLangInfo.alphabetType}</span> | Region: {selectedLangInfo.region}
          </p>
        </div>
      )}

      {/* Courses */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => {
          const isCourseComplete = coursesCompleted.includes(course.id);
          const completedLessons = course.lessons.filter(l => lessonsCompleted.includes(l.id)).length;
          const progress = course.lessons.length > 0 ? (completedLessons / course.lessons.length) * 100 : 0;

          return (
            <div
              key={course.id}
              className="group relative flex flex-col p-6 rounded-2xl bg-white dark:bg-white/[0.06] border border-gray-200 dark:border-white/10 hover:border-[#1dda63]/30 dark:hover:border-[#1dda63]/30 hover:shadow-lg transition-all"
            >
              {isCourseComplete && (
                <div className="absolute top-4 right-4">
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                </div>
              )}

              <div className="text-4xl mb-3">{course.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 flex-1">{course.description}</p>

              {/* Progress bar */}
              <div className="mb-4">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>{completedLessons}/{course.lessons.length} lessons</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#1dda63] rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Lesson list */}
              <div className="space-y-2 mb-4">
                {course.lessons.map((lesson) => {
                  const isComplete = lessonsCompleted.includes(lesson.id);
                  return (
                    <Link
                      key={lesson.id}
                      href={`/learn/${selectedLang}/${course.id}/${lesson.id}`}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                        isComplete
                          ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                          : 'bg-gray-50 dark:bg-white/[0.05] text-gray-700 dark:text-gray-300 hover:bg-[#1dda63]/5 dark:hover:bg-indigo-900/20'
                      }`}
                    >
                      {isComplete ? (
                        <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-gray-300 dark:border-gray-600 flex-shrink-0" />
                      )}
                      <span className="truncate">{lesson.title}</span>
                    </Link>
                  );
                })}
              </div>

              <Link
                href={`/learn/${selectedLang}/${course.id}/${course.lessons[0]?.id}`}
                className="inline-flex items-center gap-2 text-[#1dda63] dark:text-[#1dda63] font-medium text-sm group-hover:gap-3 transition-all"
              >
                {progress > 0 ? 'Continue' : 'Start Course'}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function LearnPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-10"><div className="h-8 w-64 bg-gray-200 dark:bg-white/[0.06] rounded animate-pulse" /></div>}>
      <LearnContent />
    </Suspense>
  );
}
