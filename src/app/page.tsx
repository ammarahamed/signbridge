'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import {
  BookOpen, Camera, Languages, MessagesSquare, Search, Trophy,
  Heart, ArrowRight, Sparkles, Check, Hand,
} from 'lucide-react';
import { signLanguages } from '@/lib/signs/languages';
import { getSignsByLanguage } from '@/lib/signs/sign-data';
import { asset } from '@/lib/asset';

const SignPlayer = dynamic(
  () => import('@/components/avatar/SignPlayer').then(m => ({ default: m.SignPlayer })),
  { ssr: false, loading: () => <div className="w-full h-full bg-white/5 rounded-2xl animate-pulse" /> }
);

const tools = [
  { icon: BookOpen, title: 'Learn', href: '/learn', desc: 'Structured courses from the alphabet to full conversations.' },
  { icon: Camera, title: 'Practice', href: '/practice', desc: 'Sign to your webcam and get real-time accuracy scoring.' },
  { icon: Languages, title: 'Translate', href: '/translate', desc: 'Type any text and watch it signed in 3D.' },
  { icon: MessagesSquare, title: 'Talk', href: '/conversation', desc: 'Two-way bridge — speech to text to sign, and back.' },
  { icon: Search, title: 'Dictionary', href: '/dictionary', desc: 'Look up any sign and see it demonstrated.' },
  { icon: Trophy, title: 'Progress', href: '/progress', desc: 'Earn XP, unlock streaks, track what you’ve mastered.' },
];

const stats = [
  { value: '5', label: 'Tools' },
  { value: '100+', label: 'Signs' },
  { value: 'Free', label: 'Forever' },
  { value: 'Open', label: 'Source' },
];

export default function HomePage() {
  const [demoSign, setDemoSign] = useState(() => {
    const signs = getSignsByLanguage('asl');
    return signs.find(s => s.gloss === 'HELLO') || signs[0];
  });
  const [demoLabel, setDemoLabel] = useState('Hello');

  const cycleSigns = ['HELLO', 'THANK YOU', 'PLEASE', 'A', 'B', 'C'];
  const cycleLabels = ['Hello', 'Thank you', 'Please', 'A', 'B', 'C'];
  const [cycleIndex, setCycleIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCycleIndex(prev => {
        const next = (prev + 1) % cycleSigns.length;
        const signs = getSignsByLanguage('asl');
        const sign = signs.find(s => s.gloss === cycleSigns[next]);
        if (sign) { setDemoSign(sign); setDemoLabel(cycleLabels[next]); }
        return next;
      });
    }, 4000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col bg-[#070707] text-white">
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* ambient background */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 left-1/4 w-[42rem] h-[42rem] bg-[#1dda63]/15 rounded-full blur-[140px]" />
          <div className="absolute top-40 -right-20 w-[34rem] h-[34rem] bg-[#1dda63]/10 rounded-full blur-[130px]" />
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.7) 1px, transparent 1px)',
              backgroundSize: '56px 56px',
              maskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, #000 40%, transparent 100%)',
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 sm:pt-24 sm:pb-28">
          <div className="grid lg:grid-cols-[1.05fr_1fr] gap-14 lg:gap-10 items-center">
            {/* Left */}
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.06] border border-white/10 text-[#1dda63] text-sm font-medium mb-7 backdrop-blur">
                <Sparkles className="w-4 h-4" />
                Free &amp; open-source · runs in your browser
              </div>

              <h1 className="text-[2.6rem] leading-[1.05] sm:text-6xl lg:text-[4.5rem] font-bold tracking-tight">
                Learn{' '}
                <span className="bg-gradient-to-r from-[#1dda63] to-[#5ef0a0] bg-clip-text text-transparent">
                  sign language
                </span>
                ,<br className="hidden sm:block" /> beautifully.
              </h1>

              <p className="mt-6 text-lg sm:text-xl text-gray-400 max-w-xl leading-relaxed">
                Interactive 3D hand demonstrations, real-time webcam practice, text-to-sign
                translation and a live conversation bridge — for ASL, BSL, ISL and more.
              </p>

              <div className="mt-9 flex flex-col sm:flex-row items-start gap-3.5">
                <Link
                  href="/learn"
                  className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#1dda63] hover:bg-[#15b850] text-[#072012] rounded-2xl text-base font-semibold shadow-lg shadow-[#1dda63]/25 transition-all hover:scale-[1.02]"
                >
                  Start learning <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/translate"
                  className="inline-flex items-center gap-2 px-7 py-3.5 bg-white/[0.06] hover:bg-white/[0.1] text-white rounded-2xl text-base font-semibold border border-white/10 transition-all"
                >
                  Try the translator
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500">
                {['No signup', 'No download', 'Free forever'].map((t) => (
                  <span key={t} className="inline-flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-[#1dda63]" /> {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Right — 3D demo with floating cards */}
            <div className="relative mx-auto w-full max-w-md lg:max-w-none">
              <div className="absolute -z-10 inset-6 bg-[#1dda63]/20 blur-[90px] rounded-full" />

              <div className="relative rounded-[1.75rem] bg-white/[0.04] backdrop-blur-xl border border-white/10 overflow-hidden shadow-2xl shadow-black/40">
                <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                    <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#1dda63]" />
                  </div>
                  <span className="text-xs text-gray-500 font-mono">live 3D demo</span>
                  <div className="w-12" />
                </div>
                <SignPlayer sign={demoSign} showControls={false} className="h-[300px] sm:h-[360px]" />
                <div className="px-5 py-4 border-t border-white/10 text-center">
                  <p className="text-xs uppercase tracking-widest text-gray-500">now showing</p>
                  <p className="text-2xl font-bold text-[#1dda63] mt-1">&ldquo;{demoLabel}&rdquo;</p>
                  <div className="flex justify-center gap-1.5 mt-3">
                    {cycleSigns.map((s, i) => (
                      <button
                        key={s}
                        onClick={() => {
                          setCycleIndex(i);
                          const signs = getSignsByLanguage('asl');
                          const sign = signs.find(sg => sg.gloss === s);
                          if (sign) { setDemoSign(sign); setDemoLabel(cycleLabels[i]); }
                        }}
                        className={`h-2 rounded-full transition-all ${i === cycleIndex ? 'bg-[#1dda63] w-6' : 'bg-gray-600 w-2'}`}
                        aria-label={`Show ${cycleLabels[i]}`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* floating accent cards */}
              <div className="hidden lg:flex absolute -left-10 top-16 items-center gap-2.5 px-3.5 py-2.5 rounded-2xl bg-white/[0.07] backdrop-blur-xl border border-white/10 shadow-xl rotate-[-6deg]">
                <div className="w-8 h-8 rounded-lg bg-[#1dda63]/15 flex items-center justify-center text-[#1dda63]"><Camera className="w-4 h-4" /></div>
                <div className="leading-tight">
                  <div className="text-[11px] text-gray-400">Live feedback</div>
                  <div className="text-sm font-semibold text-[#1dda63]">98% match</div>
                </div>
              </div>

              <div className="hidden lg:flex absolute -right-8 bottom-24 items-center gap-2.5 px-3.5 py-2.5 rounded-2xl bg-white/[0.07] backdrop-blur-xl border border-white/10 shadow-xl rotate-[5deg]">
                <div className="w-8 h-8 rounded-lg bg-[#1dda63]/15 flex items-center justify-center text-[#1dda63]"><Languages className="w-4 h-4" /></div>
                <div className="leading-tight">
                  <div className="text-[11px] text-gray-400">Text → Sign</div>
                  <div className="text-sm font-semibold text-white">“hello”</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats strip ──────────────────────────────────── */}
      <section className="border-y border-white/10 bg-white/[0.015]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="text-3xl font-bold text-[#1dda63]">{value}</div>
                <div className="text-sm text-gray-500 mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tools ────────────────────────────────────────── */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 text-sm text-[#1dda63] font-medium mb-3">
            <Hand className="w-4 h-4" /> One toolkit
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight">Everything you need, in one place</h2>
          <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
            Five tools that take you from your first letter to a real conversation.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {tools.map(({ icon: Icon, title, href, desc }) => (
            <Link
              key={title}
              href={href}
              className="group relative p-6 rounded-3xl bg-white/[0.03] border border-white/10 hover:border-[#1dda63]/40 hover:bg-white/[0.05] transition-all overflow-hidden"
            >
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-[#1dda63]/0 group-hover:bg-[#1dda63]/10 blur-2xl rounded-full transition-colors" />
              <div className="relative">
                <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-[#1dda63]/12 text-[#1dda63] mb-4">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold mb-1.5 group-hover:text-[#1dda63] transition-colors">{title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
                <div className="mt-4 inline-flex items-center gap-1 text-sm text-gray-500 group-hover:text-[#1dda63] transition-colors">
                  Open <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Languages ────────────────────────────────────── */}
      <section className="relative overflow-hidden border-y border-white/10 bg-white/[0.015] py-24">
        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-[#1dda63]/8 blur-[130px] rounded-full" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight">Supported sign languages</h2>
            <p className="mt-4 text-lg text-gray-400">Start with one, explore many.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {signLanguages.map((lang) => (
              <Link
                key={lang.id}
                href={`/learn?lang=${lang.id}`}
                className="group p-6 rounded-3xl bg-white/[0.03] border border-white/10 hover:border-[#1dda63]/40 hover:bg-white/[0.05] transition-all"
              >
                <div className="text-4xl mb-3">{lang.flag}</div>
                <h3 className="text-lg font-semibold group-hover:text-[#1dda63] transition-colors">{lang.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{lang.nativeName}</p>
                <p className="text-sm text-gray-400 mt-3 leading-relaxed">{lang.description}</p>
                <div className="mt-4 inline-flex items-center gap-1 text-sm text-[#1dda63] font-medium">
                  Start learning <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Mission ──────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-black/40">
            <Image
              src={asset('/images/community.jpg')}
              alt="Person signing during a video call"
              width={800}
              height={533}
              className="w-full h-auto object-cover"
            />
          </div>
          <div>
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#1dda63]/12 text-[#1dda63] mb-6">
              <Heart className="w-7 h-7" />
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight mb-6">Built for the community</h2>
            <p className="text-lg text-gray-400 leading-relaxed mb-8">
              SignBridge is free, open-source, and made with care. Everyone deserves access to
              communication tools — regardless of ability or budget. Sign language is a bridge
              between worlds, and that bridge should be free to cross.
            </p>
            <Link
              href="/learn"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#1dda63] hover:bg-[#15b850] text-[#072012] rounded-2xl font-semibold transition-colors"
            >
              Start learning today <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
