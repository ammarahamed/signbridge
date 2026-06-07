'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
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
  return (
    <div className={`w-full h-full min-h-[300px] ${className}`} role="img" aria-label="3D hand demonstrating a sign">
      <Canvas
        camera={{ position: [0, 0.5, 2.5], fov: 45 }}
        gl={{ antialias: true }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <directionalLight position={[-3, 3, -3]} intensity={0.3} />
        <Suspense fallback={<LoadingFallback />}>
          <HandModel landmarks={landmarks} />
          <Environment preset="studio" />
        </Suspense>
        <OrbitControls
          autoRotate={autoRotate}
          autoRotateSpeed={2}
          enablePan={false}
          minDistance={1.5}
          maxDistance={5}
          target={[0, 0.5, 0]}
        />
      </Canvas>
    </div>
  );
}
