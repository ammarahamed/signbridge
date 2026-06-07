'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Landmark } from '@/lib/signs/types';

interface HandModelProps {
  landmarks: Landmark[];
  color?: string;
  opacity?: number;
}

const JOINT_RADIUS = 0.025;
const BONE_RADIUS = 0.018;
const PALM_COLOR = '#f4a261';
const FINGER_COLOR = '#e9c46a';
const TIP_COLOR = '#e76f51';

const CONNECTIONS: [number, number][] = [
  // Thumb
  [0, 1], [1, 2], [2, 3], [3, 4],
  // Index
  [0, 5], [5, 6], [6, 7], [7, 8],
  // Middle
  [0, 9], [9, 10], [10, 11], [11, 12],
  // Ring
  [0, 13], [13, 14], [14, 15], [15, 16],
  // Pinky
  [0, 17], [17, 18], [18, 19], [19, 20],
  // Palm connections
  [5, 9], [9, 13], [13, 17],
];

const FINGERTIP_INDICES = [4, 8, 12, 16, 20];

function Joint({ position, isTip }: { position: THREE.Vector3; isTip: boolean }) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[isTip ? JOINT_RADIUS * 1.3 : JOINT_RADIUS, 12, 12]} />
      <meshStandardMaterial
        color={isTip ? TIP_COLOR : PALM_COLOR}
        roughness={0.4}
        metalness={0.1}
      />
    </mesh>
  );
}

function Bone({ start, end }: { start: THREE.Vector3; end: THREE.Vector3 }) {
  const mid = useMemo(() => new THREE.Vector3().lerpVectors(start, end, 0.5), [start, end]);
  const length = useMemo(() => start.distanceTo(end), [start, end]);
  const quaternion = useMemo(() => {
    const dir = new THREE.Vector3().subVectors(end, start).normalize();
    const q = new THREE.Quaternion();
    q.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    return q;
  }, [start, end]);

  return (
    <mesh position={mid} quaternion={quaternion}>
      <capsuleGeometry args={[BONE_RADIUS, length - BONE_RADIUS * 2, 4, 8]} />
      <meshStandardMaterial
        color={FINGER_COLOR}
        roughness={0.5}
        metalness={0.05}
      />
    </mesh>
  );
}

function PalmMesh({ positions }: { positions: THREE.Vector3[] }) {
  const geometry = useMemo(() => {
    if (positions.length < 21) return null;
    const geo = new THREE.BufferGeometry();
    const wrist = positions[0];
    const palmPoints = [wrist, positions[5], positions[9], positions[13], positions[17]];
    const vertices: number[] = [];
    const normals: number[] = [];

    for (let i = 0; i < palmPoints.length - 1; i++) {
      const a = palmPoints[0];
      const b = palmPoints[i + 1];
      const c = palmPoints[Math.min(i + 2, palmPoints.length - 1)];
      vertices.push(a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z);
      const normal = new THREE.Vector3().crossVectors(
        new THREE.Vector3().subVectors(b, a),
        new THREE.Vector3().subVectors(c, a)
      ).normalize();
      for (let j = 0; j < 3; j++) normals.push(normal.x, normal.y, normal.z);
    }

    // Back face
    for (let i = 0; i < palmPoints.length - 1; i++) {
      const a = palmPoints[0];
      const b = palmPoints[Math.min(i + 2, palmPoints.length - 1)];
      const c = palmPoints[i + 1];
      vertices.push(a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z);
      const normal = new THREE.Vector3().crossVectors(
        new THREE.Vector3().subVectors(b, a),
        new THREE.Vector3().subVectors(c, a)
      ).normalize();
      for (let j = 0; j < 3; j++) normals.push(normal.x, normal.y, normal.z);
    }

    geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    return geo;
  }, [positions]);

  if (!geometry) return null;

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial
        color={PALM_COLOR}
        roughness={0.6}
        metalness={0.05}
        side={THREE.DoubleSide}
        transparent
        opacity={0.6}
      />
    </mesh>
  );
}

export function HandModel({ landmarks, color, opacity }: HandModelProps) {
  const groupRef = useRef<THREE.Group>(null);

  const positions = useMemo(() => {
    return landmarks.map(([x, y, z]) => new THREE.Vector3(x, y, z));
  }, [landmarks]);

  const targetPositions = useRef(positions);
  const currentPositions = useRef(positions.map(p => p.clone()));

  useMemo(() => {
    targetPositions.current = positions;
  }, [positions]);

  useFrame((_, delta) => {
    const speed = 8;
    for (let i = 0; i < currentPositions.current.length && i < targetPositions.current.length; i++) {
      currentPositions.current[i].lerp(targetPositions.current[i], 1 - Math.exp(-speed * delta));
    }
  });

  if (landmarks.length < 21) return null;

  return (
    <group ref={groupRef} scale={1.5} position={[0, -0.3, 0]}>
      <PalmMesh positions={positions} />
      {positions.map((pos, i) => (
        <Joint key={`joint-${i}`} position={pos} isTip={FINGERTIP_INDICES.includes(i)} />
      ))}
      {CONNECTIONS.map(([a, b], i) => (
        <Bone key={`bone-${i}`} start={positions[a]} end={positions[b]} />
      ))}
    </group>
  );
}
