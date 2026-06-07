'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { HandScene } from './HandScene';
import { SignSequence, Landmark } from '@/lib/signs/types';
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';

interface SignPlayerProps {
  sign: SignSequence;
  showControls?: boolean;
  autoPlay?: boolean;
  className?: string;
}

function interpolateLandmarks(a: Landmark[], b: Landmark[], t: number): Landmark[] {
  return a.map((lm, i) => [
    lm[0] + (b[i][0] - lm[0]) * t,
    lm[1] + (b[i][1] - lm[1]) * t,
    lm[2] + (b[i][2] - lm[2]) * t,
  ] as Landmark);
}

export function SignPlayer({ sign, showControls = true, autoPlay = true, className = '' }: SignPlayerProps) {
  const [currentPoseIndex, setCurrentPoseIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay && sign.poses.length > 1);
  const [speed, setSpeed] = useState(1);
  const [interpolatedLandmarks, setInterpolatedLandmarks] = useState<Landmark[]>(sign.poses[0]?.landmarks || []);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  const isAnimated = sign.poses.length > 1 && sign.duration > 0;

  const animate = useCallback(() => {
    if (!isAnimated) return;
    const elapsed = (performance.now() - startTimeRef.current) * speed;
    const loopedTime = elapsed % sign.duration;

    let poseIdx = 0;
    for (let i = 0; i < sign.poses.length - 1; i++) {
      if (loopedTime >= sign.poses[i].timestamp && loopedTime < sign.poses[i + 1].timestamp) {
        poseIdx = i;
        break;
      }
      if (i === sign.poses.length - 2) poseIdx = i;
    }

    const currentPose = sign.poses[poseIdx];
    const nextPose = sign.poses[Math.min(poseIdx + 1, sign.poses.length - 1)];
    const segmentDuration = nextPose.timestamp - currentPose.timestamp;
    const t = segmentDuration > 0
      ? Math.min(1, (loopedTime - currentPose.timestamp) / segmentDuration)
      : 0;

    setInterpolatedLandmarks(interpolateLandmarks(currentPose.landmarks, nextPose.landmarks, t));
    setCurrentPoseIndex(poseIdx);

    if (isPlaying) {
      animationRef.current = requestAnimationFrame(animate);
    }
  }, [isAnimated, isPlaying, sign, speed]);

  useEffect(() => {
    if (isPlaying && isAnimated) {
      startTimeRef.current = performance.now();
      animationRef.current = requestAnimationFrame(animate);
    }
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying, animate, isAnimated]);

  useEffect(() => {
    if (!isAnimated) {
      setInterpolatedLandmarks(sign.poses[currentPoseIndex]?.landmarks || []);
    }
  }, [currentPoseIndex, isAnimated, sign.poses]);

  const handlePrev = () => {
    setIsPlaying(false);
    setCurrentPoseIndex(i => Math.max(0, i - 1));
  };

  const handleNext = () => {
    setIsPlaying(false);
    setCurrentPoseIndex(i => Math.min(sign.poses.length - 1, i + 1));
  };

  const handleRestart = () => {
    setCurrentPoseIndex(0);
    setInterpolatedLandmarks(sign.poses[0]?.landmarks || []);
    startTimeRef.current = performance.now();
    if (isAnimated) setIsPlaying(true);
  };

  return (
    <div className={`flex flex-col ${className}`}>
      <HandScene landmarks={interpolatedLandmarks} className="flex-1" />

      {showControls && (
        <div className="flex items-center justify-center gap-2 p-3 bg-gray-50 dark:bg-white/[0.06] rounded-b-xl">
          {isAnimated && (
            <>
              <button
                onClick={handlePrev}
                className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                aria-label="Previous pose"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-2.5 rounded-full bg-[#1dda63] text-white hover:bg-[#15b850] transition-colors"
                aria-label={isPlaying ? 'Pause animation' : 'Play animation'}
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </button>

              <button
                onClick={handleNext}
                className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                aria-label="Next pose"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          <button
            onClick={handleRestart}
            className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label="Restart"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          {isAnimated && (
            <select
              value={speed}
              onChange={e => setSpeed(Number(e.target.value))}
              className="ml-2 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1"
              aria-label="Playback speed"
            >
              <option value={0.25}>0.25x</option>
              <option value={0.5}>0.5x</option>
              <option value={1}>1x</option>
              <option value={1.5}>1.5x</option>
              <option value={2}>2x</option>
            </select>
          )}
        </div>
      )}
    </div>
  );
}
