'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Suspense } from 'react';
import { HandModel } from './HandModel';
import { Landmark } from '@/lib/signs/types';

interface HandSceneProps {
  landmarks: Landmark[];
  autoRotate?: boolean;
  className?: string;
}

function LoadingFallback() {
  return (
    <mesh>
      <sphereGeometry args={[0.5, 16, 16]} />
      <meshStandardMaterial color="#6366f1" wireframe />
    </mesh>
  );
}

export function HandScene({ landmarks, autoRotate = false, className = '' }: HandSceneProps) {
  // On touch devices, don't let OrbitControls grab single-finger drags —
  // otherwise it preventDefaults the gesture and the page can't scroll.
  const isTouch =
    typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches;

  return (
    <div className={`w-full h-full min-h-0 ${className}`} role="img" aria-label="3D hand demonstrating a sign">
      <Canvas
        camera={{ position: [0, 0.5, 2.5], fov: 45 }}
        gl={{ antialias: true }}
        dpr={[1, 1.75]}
        // Let vertical swipes scroll the page on mobile (R3F defaults to
        // touch-action:none, which traps scrolling over the canvas).
        style={{ touchAction: 'pan-y' }}
      >
        {/* Self-contained lighting — no remote HDR (drei <Environment>) which
            can fail to load and crash the WebGL context. Slightly boosted to
            compensate for the removed image-based lighting. */}
        <ambientLight intensity={0.9} />
        <hemisphereLight args={['#ffffff', '#444466', 0.6]} />
        <directionalLight position={[5, 5, 5]} intensity={0.9} />
        <directionalLight position={[-3, 3, -3]} intensity={0.4} />
        <Suspense fallback={<LoadingFallback />}>
          <HandModel landmarks={landmarks} />
        </Suspense>
        <OrbitControls
          autoRotate={autoRotate}
          autoRotateSpeed={2}
          enablePan={false}
          enableRotate={!isTouch}
          enableZoom={!isTouch}
          minDistance={1.5}
          maxDistance={5}
          target={[0, 0.5, 0]}
        />
      </Canvas>
    </div>
  );
}
