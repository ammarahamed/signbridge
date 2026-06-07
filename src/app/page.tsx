'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { BookOpen, Camera, Globe, Trophy, Heart, Users, ArrowRight, Sparkles } from 'lucide-react';
import { signLanguages } from '@/lib/signs/languages';
import { getSignsByLanguage } from '@/lib/signs/sign-data';

const SignPlayer = dynamic(
  () => import('@/components/avatar/SignPlayer').then(m => ({ default: m.SignPlayer })),
  { ssr: false, loading: () => <div className="w-full h-full bg-white/5 rounded-2xl animate-pulse" /> }
);

const features = [
  {
    icon: BookOpen,
    title: 'Interactive Lessons',
    description: 'Structured courses from alphabet basics to full conversations. Learn at your own pace with step-by-step guidance.',
  },
  {
    icon: Camera,
    title: 'Webcam Practice',
    description: 'Practice signs with your camera and get real-time feedback. AI-powered hand tracking scores your accuracy instantly.',
  },
  {
    icon: Globe,
    title: 'Multiple Languages',
    description: 'Learn ASL, BSL, ISL and more. Each sign language has its own courses, dictionary, and practice sessions.',
  },
  {
    icon: Trophy,
    title: 'Track Progress',
    description: 'Earn XP, unlock achievements, and maintain daily streaks. Gamification that keeps you motivated to learn.',
  },
];

const stats = [
  { value: '3', label: 'Sign Languages' },
  { value: '100+', label: 'Signs to Learn' },
  { value: 'Free', label: 'Forever' },
  { value: 'Open', label: 'Source' },
];

export default function HomePage() {
  const [demoSign, setDemoSign] = useState(() => {
    const signs = getSignsByLanguage('asl');
    return signs.find(s => s.gloss === 'Hello') || signs[0];
  });
  const [demoLabel, setDemoLabel] = useState('Hello');

  const cycleSigns = ['Hello', 'Thank You', 'Please', 'A', 'B', 'C'];
  const [cycleIndex, setCycleIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCycleIndex(prev => {
        const next = (prev + 1) % cycleSigns.length;
        const signs = getSignsByLanguage('asl');
        const sign = signs.find(s => s.gloss === cycleSigns[next]);
        if (sign) {
          setDemoSign(sign);
          setDemoLabel(cycleSigns[next]);
        }
        return next;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#0d1a0f] to-[#0a0a0a] dark:from-[#0a0a0a] dark:via-[#0d1a0f] dark:to-[#0a0a0a]" />
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#1dda63]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#1dda63]/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1dda63]/10 text-[#1dda63] text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                100% Free &amp; Open Source
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white">
                Learn{' '}
                <span className="text-[#1dda63]">
                  Sign Language
                </span>
                <br />
                with AI-Powered Tools
              </h1>

              <p className="mt-6 text-lg sm:text-xl text-gray-400 max-w-xl leading-relaxed">
                Interactive 3D hand demonstrations, real-time webcam practice with hand tracking,
                and structured courses for ASL, BSL, ISL, and more.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row items-start gap-4">
                <Link
                  href="/learn"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-[#1dda63] hover:bg-[#15b850] text-[#0a0a0a] rounded-xl text-lg font-semibold shadow-lg shadow-[#1dda63]/20 transition-all hover:scale-[1.02]"
                >
                  Start Learning
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/dictionary"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl text-lg font-semibold border border-white/10 transition-all"
                >
                  Browse Dictionary
                </Link>
              </div>

              {/* Real photo */}
              <div className="mt-10 relative rounded-2xl overflow-hidden shadow-xl border border-white/10">
                <Image
                  src="/images/hero-signing.jpg"
                  alt="Person practicing sign language on a video call"
                  width={800}
                  height={533}
                  className="w-full h-auto object-cover"
                  priority
                />
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent px-5 py-4">
                  <p className="text-white text-sm font-medium">Real people learning sign language every day</p>
                </div>
              </div>
            </div>

            {/* Right: Live 3D hand demo */}
            <div className="relative">
              <div className="relative bg-white/[0.04] backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden shadow-2xl shadow-[#1dda63]/5">
                <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-[#1dda63]" />
                  </div>
                  <span className="text-xs text-gray-500 font-mono">3D Hand Demo</span>
                  <div className="w-16" />
                </div>
                <SignPlayer sign={demoSign} showControls={false} className="h-[320px] sm:h-[380px]" />
                <div className="px-5 py-4 border-t border-white/10 text-center">
                  <p className="text-sm text-gray-500">Currently showing</p>
                  <p className="text-2xl font-bold text-[#1dda63] mt-1">
                    &ldquo;{demoLabel}&rdquo;
                  </p>
                  <div className="flex justify-center gap-1.5 mt-3">
                    {cycleSigns.map((s, i) => (
                      <button
                        key={s}
                        onClick={() => {
                          setCycleIndex(i);
                          const signs = getSignsByLanguage('asl');
                          const sign = signs.find(sg => sg.gloss === s);
                          if (sign) { setDemoSign(sign); setDemoLabel(s); }
                        }}
                        className={`w-2 h-2 rounded-full transition-all ${
                          i === cycleIndex
                            ? 'bg-[#1dda63] w-6'
                            : 'bg-gray-600'
                        }`}
                        aria-label={`Show sign: ${s}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="absolute -z-10 inset-0 bg-[#1dda63]/10 blur-3xl rounded-full scale-110" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="text-3xl font-bold text-[#1dda63]">{value}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">Everything You Need to Learn Sign Language</h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            A complete learning platform built with modern technology, designed for accessibility, and free for everyone.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {features.map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex gap-5 p-6 rounded-2xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/10 hover:border-[#1dda63]/30 transition-colors">
              <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-xl bg-[#1dda63]/10 text-[#1dda63]">
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">{title}</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Languages */}
      <section className="bg-gray-50 dark:bg-white/[0.02] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">Supported Sign Languages</h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
              Start with one, explore many. Each language has unique beauty.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {signLanguages.map((lang) => (
              <Link
                key={lang.id}
                href={`/learn?lang=${lang.id}`}
                className="group p-6 rounded-2xl bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/10 hover:border-[#1dda63]/40 hover:shadow-lg dark:hover:shadow-[#1dda63]/5 transition-all"
              >
                <div className="text-4xl mb-3">{lang.flag}</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-[#1dda63] transition-colors">{lang.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">{lang.nativeName}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 leading-relaxed">{lang.description}</p>
                <div className="mt-4 inline-flex items-center gap-1 text-sm text-[#1dda63] font-medium">
                  Start learning <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="relative rounded-2xl overflow-hidden shadow-xl">
            <Image
              src="/images/community.jpg"
              alt="Person signing during a video call at a library"
              width={800}
              height={533}
              className="w-full h-auto object-cover"
            />
          </div>
          <div>
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-pink-100 dark:bg-pink-600/10 mb-6">
              <Heart className="w-8 h-8 text-pink-600 dark:text-pink-400" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-gray-900 dark:text-white">Built for the Community</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed mb-8">
              SignBridge is free, open-source, and built with love. We believe everyone deserves
              access to communication tools regardless of their abilities or financial situation.
              Sign language is a bridge between worlds — and that bridge should be free to cross.
            </p>
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <Link
                href="/learn"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#1dda63] hover:bg-[#15b850] text-[#0a0a0a] rounded-xl font-semibold transition-colors"
              >
                <Users className="w-5 h-5" />
                Start Learning Today
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
