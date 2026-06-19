'use client';

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Languages, Sparkles, ArrowRight } from 'lucide-react';
import { translateToSigns } from '@/lib/signs/translate';

const SequencePlayer = dynamic(
  () => import('@/components/avatar/SequencePlayer').then((m) => ({ default: m.SequencePlayer })),
  { ssr: false, loading: () => <div className="w-full aspect-square max-h-[360px] bg-gray-100 dark:bg-white/[0.06] rounded-2xl animate-pulse" /> }
);

const EXAMPLES = ['Hello', 'Thank you', 'Please', 'Sorry', 'ASL'];

export default function TranslatePage() {
  const [input, setInput] = useState('');
  const [submitted, setSubmitted] = useState('');
  const [speed, setSpeed] = useState(1);

  const translation = useMemo(() => (submitted ? translateToSigns(submitted) : null), [submitted]);

  const handleTranslate = () => setSubmitted(input.trim());
  const runExample = (text: string) => {
    setInput(text);
    setSubmitted(text);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-xl bg-[#1dda63]/10 text-[#1dda63]">
          <Languages className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-bold">Text → Sign</h1>
      </div>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Type anything and watch it signed in ASL. Known words use their own sign; the rest is fingerspelled letter by letter.
      </p>

      <div className="grid lg:grid-cols-2 gap-8 items-start">
        {/* Input */}
        <div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleTranslate();
            }}
            placeholder="Type a word or sentence…"
            rows={4}
            className="w-full p-4 rounded-xl border border-gray-300 dark:border-white/15 bg-white dark:bg-white/[0.04] text-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#1dda63]"
          />
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <button
              onClick={handleTranslate}
              disabled={!input.trim()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1dda63] text-white font-medium hover:bg-[#15b850] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Translate <ArrowRight className="w-4 h-4" />
            </button>
            <span className="text-xs text-gray-400 ml-1 hidden sm:inline">or ⌘/Ctrl + Enter</span>
          </div>

          <div className="mt-5">
            <div className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-gray-400 mb-2">
              <Sparkles className="w-3.5 h-3.5" /> Try
            </div>
            <div className="flex flex-wrap gap-2">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  onClick={() => runExample(ex)}
                  className="px-3 py-1.5 rounded-lg text-sm bg-gray-100 dark:bg-white/[0.06] hover:bg-gray-200 dark:hover:bg-white/[0.1] transition-colors"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>

          {translation && (
            <div className="mt-6">
              <div className="text-xs uppercase tracking-wide text-gray-400 mb-2">Breakdown</div>
              <div className="flex flex-wrap gap-2">
                {translation.words.map((w, i) => (
                  <span
                    key={i}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                      w.matched
                        ? 'bg-[#1dda63]/15 text-[#15b850] dark:text-[#1dda63]'
                        : 'bg-gray-100 dark:bg-white/[0.06] text-gray-700 dark:text-gray-300'
                    }`}
                    title={w.matched ? 'Has a dedicated sign' : 'Fingerspelled'}
                  >
                    {w.matched && w.gloss ? w.gloss : w.raw}
                    {!w.matched && w.steps.length > 0 && (
                      <span className="ml-1.5 text-xs text-gray-400">{w.steps.map((s) => s.label).join('·')}</span>
                    )}
                  </span>
                ))}
              </div>
              {translation.unsupported.length > 0 && (
                <p className="text-xs text-gray-400 mt-2">
                  Skipped (no sign): {translation.unsupported.map((c) => `"${c}"`).join(' ')}
                </p>
              )}
              <div className="flex items-center gap-2 mt-4">
                <span className="text-sm text-gray-500">Speed</span>
                {[0.5, 1, 1.5].map((s) => (
                  <button
                    key={s}
                    onClick={() => setSpeed(s)}
                    className={`px-2.5 py-1 rounded-lg text-sm ${
                      speed === s ? 'bg-[#1dda63] text-white' : 'bg-gray-100 dark:bg-white/[0.06]'
                    }`}
                  >
                    {s}×
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Output */}
        <div className="lg:sticky lg:top-24">
          {translation && translation.steps.length > 0 ? (
            <SequencePlayer key={submitted + speed} steps={translation.steps} speed={speed} />
          ) : (
            <div className="w-full aspect-square max-h-[360px] rounded-2xl border-2 border-dashed border-gray-200 dark:border-white/10 flex flex-col items-center justify-center text-center text-gray-400 p-6">
              <Languages className="w-10 h-10 mb-3 opacity-50" />
              <p>Your signed translation will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
