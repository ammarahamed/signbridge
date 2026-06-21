'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, CameraOff, Loader2, Hand } from 'lucide-react';
import { Landmark, PoseComparisonResult } from '@/lib/signs/types';
import { comparePoses } from '@/lib/signs/pose-comparator';

function scoreHex(s: number): string {
  return s >= 70 ? '#1dda63' : s >= 50 ? '#a3e635' : s >= 35 ? '#f97316' : '#ef4444';
}
function statusLabel(s: number): string {
  return s >= 85 ? 'Excellent!' : s >= 65 ? 'Great form!' : s >= 50 ? 'Got it! ✓' : s >= 35 ? 'Almost there' : 'Keep adjusting';
}

function ScoreRing({ score }: { score: number }) {
  const size = 66, stroke = 7, r = (size - stroke) / 2, c = 2 * Math.PI * r;
  const off = c - (Math.max(0, Math.min(100, score)) / 100) * c;
  const col = scoreHex(score);
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={col} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={off}
          style={{ transition: 'stroke-dashoffset 0.25s ease, stroke 0.25s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-bold text-white tabular-nums">{score}%</span>
      </div>
    </div>
  );
}

interface WebcamPracticeProps {
  targetLandmarks: Landmark[];
  onScore?: (result: PoseComparisonResult) => void;
  // Fires once when the score first reaches passThreshold. The camera keeps
  // running — we never freeze it.
  onPass?: (score: number) => void;
  passThreshold?: number;
  // Hide the built-in hints + finger-score panel (the parent renders them).
  hideScores?: boolean;
  className?: string;
}

// Exported so callers can render the finger scores themselves and match colours.
export function scoreColor(s: number): string {
  return s >= 70 ? '#1dda63' : s >= 50 ? '#a3e635' : s >= 35 ? '#f97316' : '#ef4444';
}

type HandLandmarkerType = {
  detectForVideo: (video: HTMLVideoElement, timestamp: number) => {
    landmarks: Array<Array<{ x: number; y: number; z: number }>>;
  };
};

type TasksVision = {
  FilesetResolver: {
    forVisionTasks: (wasmPath: string) => Promise<unknown>;
  };
  HandLandmarker: {
    createFromOptions: (vision: unknown, options: Record<string, unknown>) => Promise<HandLandmarkerType>;
  };
};

export function WebcamPractice({ targetLandmarks, onScore, onPass, passThreshold = 60, hideScores = false, className = '' }: WebcamPracticeProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const passedRef = useRef(false);
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PoseComparisonResult | null>(null);
  const handLandmarkerRef = useRef<HandLandmarkerType | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const initMediaPipe = useCallback(async () => {
    try {
      const vision = await import('@mediapipe/tasks-vision') as unknown as TasksVision;
      const filesetResolver = await vision.FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );
      handLandmarkerRef.current = await vision.HandLandmarker.createFromOptions(filesetResolver, {
        baseOptions: {
          modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/latest/hand_landmarker.task',
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numHands: 2,
        minHandDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });
      return true;
    } catch (err) {
      console.error('Failed to initialize MediaPipe:', err);
      setError('Failed to load hand tracking model. Please try again.');
      return false;
    }
  }, []);

  const startCamera = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      const mpReady = await initMediaPipe();
      if (!mpReady) {
        stopCamera();
        return;
      }

      setIsActive(true);
      setIsLoading(false);
      detect();
    } catch (err) {
      setIsLoading(false);
      if ((err as Error).name === 'NotAllowedError') {
        setError('Camera access denied. Please allow camera access to practice.');
      } else {
        setError('Failed to access camera. Please check your device.');
      }
    }
  }, [initMediaPipe]);

  const stopCamera = useCallback(() => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setIsActive(false);
    setResult(null);
  }, []);

  const detect = useCallback(() => {
    if (!handLandmarkerRef.current || !videoRef.current || !videoRef.current.videoWidth) {
      animFrameRef.current = requestAnimationFrame(detect);
      return;
    }

    const results = handLandmarkerRef.current.detectForVideo(videoRef.current, performance.now());

    if (results.landmarks && results.landmarks.length > 0) {
      const detected: Landmark[] = results.landmarks[0].map(
        (lm: { x: number; y: number; z: number }) => [lm.x, lm.y, lm.z] as Landmark
      );

      let scores: Record<string, number> | undefined;
      let passScore: number | null = null;
      if (targetLandmarks.length >= 21) {
        const comparison = comparePoses(targetLandmarks, detected);
        setResult(comparison);
        onScore?.(comparison);
        scores = comparison.fingerScores;
        if (comparison.score >= passThreshold && !passedRef.current) passScore = comparison.score;
      }
      drawLandmarks(detected, scores);

      // Fire once on the first pass — but keep the camera running (no freeze).
      if (passScore != null && onPass) {
        passedRef.current = true;
        onPass(passScore);
      }
    } else {
      setResult(null);
      drawLandmarks(null);
    }

    animFrameRef.current = requestAnimationFrame(detect);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetLandmarks, onScore, onPass, passThreshold]);

  // Draws the tracked hand, colouring each finger by its accuracy score so the
  // learner can see which finger is right (green) or off (red) in real time.
  const drawLandmarks = useCallback(
    (landmarks: Landmark[] | null, fingerScores?: Record<string, number>) => {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      if (!canvas || !video || !video.videoWidth) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (!landmarks) return; // no hand → cleared

      const fingerOf = (i: number): string | null =>
        i >= 1 && i <= 4 ? 'thumb'
        : i >= 5 && i <= 8 ? 'index'
        : i >= 9 && i <= 12 ? 'middle'
        : i >= 13 && i <= 16 ? 'ring'
        : i >= 17 && i <= 20 ? 'pinky'
        : null;

      const colorFor = (i: number): string => {
        const f = fingerOf(i);
        if (f && fingerScores && fingerScores[f] != null) return scoreHex(fingerScores[f]);
        return '#1dda63'; // neutral brand green before a sign is being scored
      };

      const connections: [number, number][] = [
        [0,1],[1,2],[2,3],[3,4],[0,5],[5,6],[6,7],[7,8],
        [0,9],[9,10],[10,11],[11,12],[0,13],[13,14],[14,15],[15,16],
        [0,17],[17,18],[18,19],[19,20],[5,9],[9,13],[13,17],
      ];

      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      for (const [a, b] of connections) {
        if (a >= landmarks.length || b >= landmarks.length) continue;
        ctx.strokeStyle = colorFor(b || a); // colour by the further joint's finger
        ctx.beginPath();
        ctx.moveTo(landmarks[a][0] * canvas.width, landmarks[a][1] * canvas.height);
        ctx.lineTo(landmarks[b][0] * canvas.width, landmarks[b][1] * canvas.height);
        ctx.stroke();
      }

      for (let i = 0; i < landmarks.length; i++) {
        const [x, y] = landmarks[i];
        const isTip = i === 4 || i === 8 || i === 12 || i === 16 || i === 20;
        ctx.fillStyle = i === 0 ? '#ffffff' : colorFor(i);
        ctx.beginPath();
        ctx.arc(x * canvas.width, y * canvas.height, isTip ? 7 : 5, 0, Math.PI * 2);
        ctx.fill();
      }
    },
    []
  );

  // Re-arm passing whenever the target sign changes.
  useEffect(() => {
    passedRef.current = false;
  }, [targetLandmarks]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return (
    <div className={`flex flex-col ${className}`}>
      <div className="relative bg-[#0a0a0a] rounded-xl overflow-hidden aspect-[4/3] border border-white/10">
        <video
          ref={videoRef}
          className="w-full h-full object-cover mirror"
          style={{ transform: 'scaleX(-1)' }}
          playsInline
          muted
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ transform: 'scaleX(-1)' }}
        />

        {!isActive && !isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/80 text-white">
            <Camera className="w-12 h-12 mb-4 opacity-60" />
            <p className="text-lg mb-4">Practice with your camera</p>
            <button
              onClick={startCamera}
              className="px-6 py-3 bg-[#1dda63] hover:bg-[#15b850] rounded-xl font-medium transition-colors"
            >
              Start Camera
            </button>
          </div>
        )}

        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/80 text-white">
            <Loader2 className="w-10 h-10 animate-spin mb-3" />
            <p>Loading hand tracking model...</p>
            <p className="text-sm text-gray-400 mt-1">This may take a moment on first load</p>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/80 text-white p-4">
            <CameraOff className="w-10 h-10 mb-3 text-red-400" />
            <p className="text-center text-red-300">{error}</p>
            <button
              onClick={startCamera}
              className="mt-4 px-4 py-2 bg-[#1dda63] hover:bg-[#15b850] rounded-lg text-sm transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Always-visible live score overlay while the camera is on */}
        {isActive && (
          <div className="absolute inset-x-0 bottom-0 px-4 py-3 bg-gradient-to-t from-black/85 via-black/45 to-transparent">
            {result ? (
              <div className="flex items-center gap-3">
                <ScoreRing score={result.score} />
                <div className="leading-tight">
                  <div className="text-white font-semibold">{statusLabel(result.score)}</div>
                  <div className="text-xs text-gray-300">match accuracy</div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-white">
                <Hand className="w-5 h-5 text-[#1dda63] animate-pulse" />
                <span className="text-sm font-medium">Show your hand to the camera…</span>
              </div>
            )}
          </div>
        )}
      </div>

      {isActive && (
        <div className="mt-3 space-y-3">
          {!hideScores && result && result.hints.length > 0 && (
            <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3 space-y-1">
              {result.hints.map((hint, i) => (
                <p key={i} className="text-sm text-gray-200 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: scoreHex(result.score) }} />
                  {hint}
                </p>
              ))}
            </div>
          )}

          {!hideScores && result && (
            <div className="grid grid-cols-5 gap-2">
              {Object.entries(result.fingerScores).map(([finger, score]) => (
                <div key={finger} className="rounded-xl bg-white/[0.04] border border-white/10 p-2 text-center">
                  <div className="text-[11px] text-gray-400 capitalize mb-0.5">{finger}</div>
                  <div className="text-sm font-bold tabular-nums" style={{ color: scoreHex(score) }}>{score}%</div>
                  <div className="mt-1.5 h-1 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${score}%`, backgroundColor: scoreHex(score) }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={stopCamera}
            className="w-full py-2.5 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/[0.06] rounded-xl transition-colors"
          >
            Stop camera
          </button>
        </div>
      )}
    </div>
  );
}
