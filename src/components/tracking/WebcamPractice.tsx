'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, CameraOff, Loader2 } from 'lucide-react';
import { Landmark, PoseComparisonResult } from '@/lib/signs/types';
import { comparePoses } from '@/lib/signs/pose-comparator';

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

  const scoreColor = result
    ? result.score >= 90 ? 'text-green-500' : result.score >= 70 ? 'text-yellow-500' : result.score >= 50 ? 'text-orange-500' : 'text-red-500'
    : '';

  const scoreBg = result
    ? result.score >= 90 ? 'bg-green-50 border-green-200' : result.score >= 70 ? 'bg-yellow-50 border-yellow-200' : result.score >= 50 ? 'bg-orange-50 border-orange-200' : 'bg-red-50 border-red-200'
    : '';

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

        {isActive && result && (
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur rounded-xl px-4 py-2 shadow-lg">
            <div className={`text-3xl font-bold ${scoreColor}`}>{result.score}%</div>
          </div>
        )}
      </div>

      {isActive && (
        <div className="mt-3 space-y-2">
          {result && (
            <div className={`p-3 rounded-lg border ${scoreBg}`}>
              {/* scoreBg is always a light *-50 background (no dark variant),
                  so force dark text — otherwise it inherits the page's
                  near-white text in dark mode and becomes invisible. */}
              {result.hints.map((hint, i) => (
                <p key={i} className="text-sm text-gray-800">{hint}</p>
              ))}
            </div>
          )}

          {result && (
            <div className="grid grid-cols-5 gap-1">
              {Object.entries(result.fingerScores).map(([finger, score]) => (
                <div key={finger} className="text-center p-1.5 bg-gray-50 dark:bg-white/[0.06] rounded-lg">
                  <div className="text-xs text-gray-500 capitalize">{finger}</div>
                  <div className={`text-sm font-bold ${
                    score >= 80 ? 'text-green-600' : score >= 60 ? 'text-yellow-600' : 'text-red-600'
                  }`}>{score}%</div>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={stopCamera}
            className="w-full py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Stop Camera
          </button>
        </div>
      )}
    </div>
  );
}
