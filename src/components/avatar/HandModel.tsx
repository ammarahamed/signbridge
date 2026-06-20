'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import { Landmark } from '@/lib/signs/types';

interface HandModelProps {
  landmarks: Landmark[];
}

// One warm, friendly skin tone everywhere — chunky and rounded, like a
// cartoon mascot hand rather than an anatomical/skeletal model.
const SKIN = '#eaad7e';

const FINGER_RADIUS = 0.046; // smooth, fat finger tubes
const PALM_RADIUS = 0.06; // thick palm structure
const TIP_RADIUS = 0.05; // rounded, bulbous fingertips
const KNUCKLE_RADIUS = 0.054; // base knuckles + wrist

// Bones within each finger (rendered as smooth fat tubes).
const FINGER_BONES: [number, number][] = [
  [1, 2], [2, 3], [3, 4],
  [5, 6], [6, 7], [7, 8],
  [9, 10], [10, 11], [11, 12],
  [13, 14], [14, 15], [15, 16],
  [17, 18], [18, 19], [19, 20],
];

// Thick bones that build the rounded palm.
const PALM_BONES: [number, number][] = [
  [0, 1], [0, 5], [0, 9], [0, 13], [0, 17],
  [5, 9], [9, 13], [13, 17],
];

const TIP_INDICES = new Set([4, 8, 12, 16, 20]);
const PALM_JOINTS = new Set([0, 5, 9, 13, 17]); // wrist + knuckles

function Ball({ position, radius }: { position: THREE.Vector3; radius: number }) {
  return (
    <mesh position={position} castShadow>
      <sphereGeometry args={[radius, 20, 20]} />
      <meshStandardMaterial color={SKIN} roughness={0.72} metalness={0} />
    </mesh>
  );
}

function Bone({ start, end, radius }: { start: THREE.Vector3; end: THREE.Vector3; radius: number }) {
  const mid = useMemo(() => new THREE.Vector3().lerpVectors(start, end, 0.5), [start, end]);
  const length = useMemo(() => start.distanceTo(end), [start, end]);
  const quaternion = useMemo(() => {
    const dir = new THREE.Vector3().subVectors(end, start).normalize();
    return new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
  }, [start, end]);

  return (
    <mesh position={mid} quaternion={quaternion} castShadow>
      <capsuleGeometry args={[radius, Math.max(0.001, length), 8, 16]} />
      <meshStandardMaterial color={SKIN} roughness={0.7} metalness={0} />
    </mesh>
  );
}

export function HandModel({ landmarks }: HandModelProps) {
  const positions = useMemo(
    () => landmarks.map(([x, y, z]) => new THREE.Vector3(x, y, z)),
    [landmarks]
  );

  // Centre of the palm — a chunky fill so it reads as solid, not webbed.
  const palmCenter = useMemo(() => {
    if (positions.length < 21) return new THREE.Vector3();
    return new THREE.Vector3()
      .add(positions[0]).add(positions[5]).add(positions[9]).add(positions[13]).add(positions[17])
      .multiplyScalar(1 / 5);
  }, [positions]);

  if (landmarks.length < 21) return null;

  return (
    <group scale={1.5} position={[0, -0.3, 0]}>
      {/* palm fill */}
      <Ball position={palmCenter} radius={0.075} />
      {PALM_BONES.map(([a, b], i) => (
        <Bone key={`palm-${i}`} start={positions[a]} end={positions[b]} radius={PALM_RADIUS} />
      ))}

      {/* fingers */}
      {FINGER_BONES.map(([a, b], i) => (
        <Bone key={`finger-${i}`} start={positions[a]} end={positions[b]} radius={FINGER_RADIUS} />
      ))}

      {/* joints */}
      {positions.map((pos, i) => {
        const radius = TIP_INDICES.has(i)
          ? TIP_RADIUS
          : PALM_JOINTS.has(i)
          ? KNUCKLE_RADIUS
          : FINGER_RADIUS;
        return <Ball key={`joint-${i}`} position={pos} radius={radius} />;
      })}
    </group>
  );
}
