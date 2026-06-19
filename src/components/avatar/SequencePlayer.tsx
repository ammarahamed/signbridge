'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { SignStep, lerpLandmarks } from '@/lib/signs/translate';
import { Landmark } from '@/lib/signs/types';

// One persistent HandScene (a single WebGL canvas) — we only swap the landmarks,
// never remount, so we don't churn WebGL contexts.
const HandScene = dynamic(
  () => import('./HandScene').then(m => ({ default: m.HandScene })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-gray-100 dark:bg-white/[0.06] rounded-xl animate-pulse" />
    ),
  }
);

const HOLD_MS = 950; // static hold per fingerspelled letter
const GAP_MS = 220; // brief gap between steps

interface SequencePlayerProps {
  steps: SignStep[];
  speed?: number;
  className?: string;
}

export function SequencePlayer({ steps, speed = 1, className = '' }: SequencePlayerProps) {
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [landmarks, setLandmarks] = useState<Landmark[]>(
    steps[0]?.sign.poses[0]?.landmarks ?? []
  );
  const raf = useRef<number | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Restart whenever the source steps change.
  useEffect(() => {
    setIndex(0);
    setLandmarks(steps[0]?.sign.poses[0]?.landmarks ?? []);
    setIsPlaying(steps.length > 0);
  }, [steps]);

  useEffect(() => {
    if (!isPlaying || steps.length === 0) return;
    const step = steps[index];
    const poses = step.sign.poses;
    let cancelled = false;

    const scheduleNext = () => {
      timer.current = setTimeout(() => {
        if (cancelled) return;
        setIndex((i) => {
          if (i >= steps.length - 1) {
            setIsPlaying(false);
            return i;
          }
          return i + 1;
        });
      }, GAP_MS / speed);
    };

    if (poses.length <= 1) {
      // Static handshape — show it and hold.
      setLandmarks(poses[0]?.landmarks ?? []);
      timer.current = setTimeout(() => !cancelled && scheduleNext(), HOLD_MS / speed);
    } else {
      // Animated word sign — interpolate across its poses over its duration.
      const duration = (step.sign.duration || poses.length * 380) / speed;
      const start = performance.now();
      const loop = () => {
        if (cancelled) return;
        const t = Math.min(1, (performance.now() - start) / duration);
        const pos = t * (poses.length - 1);
        const seg = Math.min(poses.length - 2, Math.floor(pos));
        setLandmarks(lerpLandmarks(poses[seg].landmarks, poses[seg + 1].landmarks, pos - seg));
        if (t < 1) raf.current = requestAnimationFrame(loop);
        else scheduleNext();
      };
      raf.current = requestAnimationFrame(loop);
    }

    return () => {
      cancelled = true;
      if (raf.current) cancelAnimationFrame(raf.current);
      if (timer.current) clearTimeout(timer.current);
    };
  }, [index, isPlaying, steps, speed]);

  if (steps.length === 0) return null;
  const current = steps[index];
  const atEnd = index >= steps.length - 1 && !isPlaying;

  const restart = () => {
    setIndex(0);
    setLandmarks(steps[0].sign.poses[0]?.landmarks ?? []);
    setIsPlaying(true);
  };

  return (
    <div className={`flex flex-col ${className}`}>
      <div className="relative w-full aspect-square max-h-[360px] bg-gray-50 dark:bg-white/[0.04] rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10">
        <HandScene landmarks={landmarks} />
        <div className="absolute top-3 left-3 bg-black/65 backdrop-blur text-white rounded-xl px-4 py-2 shadow-lg">
          <div className="text-3xl font-bold leading-none">{current.label}</div>
          <div className="text-[10px] uppercase tracking-widest opacity-70 mt-1">
            {current.kind === 'word' ? 'word sign' : 'fingerspell'}
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-center gap-3">
        <button
          onClick={() => (atEnd ? restart() : setIsPlaying((p) => !p))}
          className="p-3 rounded-full bg-[#1dda63] text-white hover:bg-[#15b850] transition-colors"
          aria-label={atEnd ? 'Replay' : isPlaying ? 'Pause' : 'Play'}
        >
          {atEnd ? <RotateCcw className="w-5 h-5" /> : isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </button>
        <button
          onClick={restart}
          className="p-2.5 rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/[0.06] transition-colors"
          aria-label="Restart"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
        <span className="text-sm text-gray-500 dark:text-gray-400 tabular-nums">
          {index + 1} / {steps.length}
        </span>
      </div>
    </div>
  );
}
