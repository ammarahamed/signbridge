'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Mic, MicOff, Volume2, Ear, Keyboard, MessagesSquare } from 'lucide-react';
import { translateToSigns } from '@/lib/signs/translate';

const SequencePlayer = dynamic(
  () => import('@/components/avatar/SequencePlayer').then((m) => ({ default: m.SequencePlayer })),
  { ssr: false, loading: () => <div className="w-full aspect-square max-h-[300px] bg-gray-100 dark:bg-white/[0.06] rounded-2xl animate-pulse" /> }
);

// Minimal typings for the Web Speech API (not in the standard DOM lib).
interface SpeechRecognitionAlternative { transcript: string }
interface SpeechRecognitionResult { 0: SpeechRecognitionAlternative; isFinal: boolean }
interface SpeechRecognitionEventLike { resultIndex: number; results: ArrayLike<SpeechRecognitionResult> }
interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onend: (() => void) | null;
  onerror: ((e: { error: string }) => void) | null;
}
type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

function getRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

// Hide macOS novelty/joke voices from the picker.
const NOVELTY = new Set([
  'Albert', 'Bad News', 'Bahh', 'Bells', 'Boing', 'Bubbles', 'Cellos', 'Good News',
  'Jester', 'Organ', 'Superstar', 'Trinoids', 'Whisper', 'Wobble', 'Zarvox', 'Junior',
  'Kathy', 'Princess', 'Deranged', 'Hysterical', 'Pipe Organ', 'Ralph', 'Fred',
]);

function rankVoice(v: SpeechSynthesisVoice): number {
  const n = v.name;
  if (n === 'Google US English') return 0;
  if (/google/i.test(n)) return 1;
  if (/natural|premium|enhanced|neural/i.test(n)) return 2;
  if (n === 'Samantha') return 3;
  if (!v.localService) return 4;
  return 5;
}

function englishVoices(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice[] {
  return voices
    .filter(v => v.lang?.toLowerCase().startsWith('en') && !NOVELTY.has(v.name))
    .sort((a, b) => rankVoice(a) - rankVoice(b) || a.name.localeCompare(b.name));
}

export default function ConversationPage() {
  const [supported, setSupported] = useState(true);
  const [listening, setListening] = useState(false);
  const [finalText, setFinalText] = useState('');
  const [interim, setInterim] = useState('');
  const [signPhrase, setSignPhrase] = useState('');

  const [typed, setTyped] = useState('');
  const [speaking, setSpeaking] = useState(false);
  const [voiceList, setVoiceList] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceName, setVoiceName] = useState('');

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    setSupported(getRecognitionCtor() !== null);
    const synth = typeof window !== 'undefined' ? window.speechSynthesis : undefined;
    // Voices load asynchronously — grab them now and on the change event.
    const loadVoices = () => {
      if (!synth) return;
      voicesRef.current = synth.getVoices();
      const list = englishVoices(voicesRef.current);
      setVoiceList(list);
      setVoiceName(prev => {
        if (prev) return prev;
        const saved = typeof localStorage !== 'undefined' ? localStorage.getItem('sb-voice') : null;
        if (saved && list.some(v => v.name === saved)) return saved;
        return list[0]?.name ?? '';
      });
    };
    loadVoices();
    synth?.addEventListener?.('voiceschanged', loadVoices);
    return () => {
      recognitionRef.current?.stop();
      synth?.removeEventListener?.('voiceschanged', loadVoices);
      synth?.cancel();
    };
  }, []);

  const startListening = () => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) return;
    const rec = new Ctor();
    rec.lang = 'en-US';
    rec.continuous = true;
    rec.interimResults = true;

    rec.onresult = (e) => {
      let interimChunk = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i];
        const text = res[0].transcript;
        if (res.isFinal) {
          const clean = text.trim();
          if (clean) {
            setFinalText((prev) => (prev ? `${prev} ${clean}` : clean));
            setSignPhrase(clean);
          }
        } else {
          interimChunk += text;
        }
      }
      setInterim(interimChunk);
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => {
      setListening(false);
      setInterim('');
    };

    recognitionRef.current = rec;
    rec.start();
    setListening(true);
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  const speak = () => {
    const text = typed.trim();
    if (!text || typeof window === 'undefined') return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = 'en-US';
    // Prefer a natural-sounding voice over the robotic browser default.
    const voices = voicesRef.current.length ? voicesRef.current : window.speechSynthesis.getVoices();
    const voice =
      (voiceName && voices.find(v => v.name === voiceName)) ||
      voices.find(v => v.name === 'Google US English') ||
      voices.find(v => v.lang === 'en-US' && /google|natural|premium|enhanced|neural|aria|jenny|samantha/i.test(v.name)) ||
      voices.find(v => v.name === 'Samantha') ||
      voices.find(v => v.lang === 'en-US' && !v.localService) ||
      voices.find(v => v.lang?.startsWith('en')) ||
      null;
    if (voice) utt.voice = voice;
    utt.rate = 1;
    utt.pitch = 1;
    utt.onstart = () => setSpeaking(true);
    utt.onend = () => setSpeaking(false);
    window.speechSynthesis.speak(utt);
  };

  const clearVoice = () => {
    setFinalText('');
    setInterim('');
    setSignPhrase('');
  };

  const signSteps = useMemo(
    () => (signPhrase ? translateToSigns(signPhrase).steps : []),
    [signPhrase]
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-xl bg-[#1dda63]/10 text-[#1dda63]">
          <MessagesSquare className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-bold">Conversation</h1>
      </div>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        A bridge for talking face-to-face. The hearing person speaks → it becomes text and sign. The Deaf person types → it&apos;s spoken aloud.
      </p>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Hearing → Deaf : speech to text + sign */}
        <section className="rounded-2xl border border-gray-200 dark:border-white/10 p-5 bg-white dark:bg-white/[0.02]">
          <div className="flex items-center gap-2 mb-4">
            <Ear className="w-5 h-5 text-[#1dda63]" />
            <h2 className="font-semibold">Hearing person speaks</h2>
          </div>

          {!supported ? (
            <p className="text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 rounded-lg p-3">
              Live speech recognition isn&apos;t supported in this browser. Try Chrome or Edge on desktop/Android.
            </p>
          ) : (
            <>
              <button
                onClick={listening ? stopListening : startListening}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-colors ${
                  listening
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-[#1dda63] text-white hover:bg-[#15b850]'
                }`}
              >
                {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                {listening ? 'Stop' : 'Start speaking'}
              </button>

              <div className="mt-4 min-h-[96px] rounded-xl bg-gray-50 dark:bg-white/[0.04] p-4 text-xl leading-relaxed">
                {finalText || interim ? (
                  <p className="text-gray-900 dark:text-gray-100">
                    {finalText} <span className="text-gray-400">{interim}</span>
                  </p>
                ) : (
                  <p className="text-gray-400 text-base">
                    {listening ? 'Listening…' : 'Press start and speak — your words appear here.'}
                  </p>
                )}
              </div>

              {finalText && (
                <button onClick={clearVoice} className="mt-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                  Clear
                </button>
              )}

              {signSteps.length > 0 && (
                <div className="mt-5">
                  <div className="text-xs uppercase tracking-wide text-gray-400 mb-2">Latest phrase in sign</div>
                  <SequencePlayer key={signPhrase} steps={signSteps} />
                </div>
              )}
            </>
          )}
        </section>

        {/* Deaf → Hearing : text to speech */}
        <section className="rounded-2xl border border-gray-200 dark:border-white/10 p-5 bg-white dark:bg-white/[0.02]">
          <div className="flex items-center gap-2 mb-4">
            <Keyboard className="w-5 h-5 text-[#1dda63]" />
            <h2 className="font-semibold">Deaf / HoH person types</h2>
          </div>

          <textarea
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder="Type your reply — it will be read aloud…"
            rows={4}
            className="w-full p-4 rounded-xl border border-gray-300 dark:border-white/15 bg-white dark:bg-white/[0.04] text-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#1dda63]"
          />

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button
              onClick={speak}
              disabled={!typed.trim()}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                speaking ? 'bg-[#15b850] text-white' : 'bg-[#1dda63] text-white hover:bg-[#15b850]'
              }`}
            >
              <Volume2 className="w-4 h-4" />
              {speaking ? 'Speaking…' : 'Speak aloud'}
            </button>

            {voiceList.length > 1 && (
              <select
                value={voiceName}
                onChange={(e) => {
                  setVoiceName(e.target.value);
                  try { localStorage.setItem('sb-voice', e.target.value); } catch {}
                }}
                aria-label="Choose voice"
                className="bg-white/[0.04] border border-white/15 rounded-xl px-3 py-2.5 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1dda63] max-w-[220px]"
              >
                {voiceList.map((v) => (
                  <option key={v.name} value={v.name} className="bg-[#0a0a0a]">
                    {v.name} ({v.lang})
                  </option>
                ))}
              </select>
            )}
          </div>

          {typed.trim() && (
            <div className="mt-5 rounded-xl bg-gray-50 dark:bg-white/[0.04] p-4">
              <div className="text-xs uppercase tracking-wide text-gray-400 mb-1">They&apos;ll hear / read</div>
              <p className="text-2xl font-medium text-gray-900 dark:text-gray-100">{typed}</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
