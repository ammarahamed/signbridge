'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, CameraOff, Loader2, Hand } from 'lucide-react';
import { Landmark, PoseComparisonResult } from '@/lib/signs/types';
import { comparePoses } from '@/lib/signs/pose-comparator';

function scoreHex(s: number): string {
  return s >= 80 ? '#1dda63' : s >= 60 ? '#eab308' : s >= 40 ? '#f97316' : '#ef4444';
}
function statusLabel(s: number): string {
  return s >= 90 ? 'Excellent!' : s >= 70 ? 'Great form' : s >= 50 ? 'Almost there' : 'Keep adjusting';
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
  className?: string;
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

export function WebcamPractice({ targetLandmarks, onScore, className = '' }: WebcamPracticeProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PoseComparisonResult | null>(null);
  const [userLandmarks, setUserLandmarks] = useState<Landmark[] | null>(null);
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
    setUserLandmarks(null);
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
      setUserLandmarks(detected);

      if (targetLandmarks.length >= 21) {
        const comparison = comparePoses(targetLandmarks, detected);
        setResult(comparison);
        onScore?.(comparison);
      }
    } else {
      setUserLandmarks(null);
      setResult(null);
    }

    drawLandmarks();
    animFrameRef.current = requestAnimationFrame(detect);
  }, [targetLandmarks, onScore]);

  const drawLandmarks = useCallback(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video || !userLandmarks) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const connections: [number, number][] = [
      [0,1],[1,2],[2,3],[3,4],[0,5],[5,6],[6,7],[7,8],
      [0,9],[9,10],[10,11],[11,12],[0,13],[13,14],[14,15],[15,16],
      [0,17],[17,18],[18,19],[19,20],[5,9],[9,13],[13,17],
    ];

    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 3;
    for (const [a, b] of connections) {
      if (a >= userLandmarks.length || b >= userLandmarks.length) continue;
      ctx.beginPath();
      ctx.moveTo(userLandmarks[a][0] * canvas.width, userLandmarks[a][1] * canvas.height);
      ctx.lineTo(userLandmarks[b][0] * canvas.width, userLandmarks[b][1] * canvas.height);
      ctx.stroke();
    }

    for (let i = 0; i < userLandmarks.length; i++) {
      const [x, y] = userLandmarks[i];
      ctx.fillStyle = [4, 8, 12, 16, 20].includes(i) ? '#e76f51' : '#f4a261';
      ctx.beginPath();
      ctx.arc(x * canvas.width, y * canvas.height, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [userLandmarks]);

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
          {result && result.hints.length > 0 && (
            <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3 space-y-1">
              {result.hints.map((hint, i) => (
                <p key={i} className="text-sm text-gray-200 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: scoreHex(result.score) }} />
                  {hint}
                </p>
              ))}
            </div>
          )}

          {result && (
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
