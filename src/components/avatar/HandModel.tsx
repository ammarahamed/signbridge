'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import { Landmark } from '@/lib/signs/types';

interface HandModelProps {
  landmarks: Landmark[];
}

// One unified skin tone so the hand reads as a single continuous form
// (the old model used three clashing colors → "matchsticks").
const SKIN = '#e3a578';
const SKIN_PALM = '#d9966a';

const BONE_RADIUS = 0.034;
const JOINT_RADIUS = 0.037;

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
  // Knuckle row (palm)
  [5, 9], [9, 13], [13, 17],
];

const TIP_INDICES = new Set([4, 8, 12, 16, 20]);
const KNUCKLE_INDICES = new Set([0, 5, 9, 13, 17]);

function Joint({ position, radius }: { position: THREE.Vector3; radius: number }) {
  return (
    <mesh position={position} castShadow>
      <sphereGeometry args={[radius, 18, 18]} />
      <meshStandardMaterial color={SKIN} roughness={0.62} metalness={0} />
    </mesh>
  );
}

function Bone({ start, end }: { start: THREE.Vector3; end: THREE.Vector3 }) {
  const mid = useMemo(() => new THREE.Vector3().lerpVectors(start, end, 0.5), [start, end]);
  const length = useMemo(() => start.distanceTo(end), [start, end]);
  const quaternion = useMemo(() => {
    const dir = new THREE.Vector3().subVectors(end, start).normalize();
    return new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
  }, [start, end]);

  return (
    <mesh position={mid} quaternion={quaternion} castShadow>
      <capsuleGeometry args={[BONE_RADIUS, Math.max(0.001, length - BONE_RADIUS), 6, 14]} />
      <meshStandardMaterial color={SKIN} roughness={0.6} metalness={0} />
    </mesh>
  );
}

// Solid, opaque palm filling the wrist → knuckle web.
function PalmMesh({ positions }: { positions: THREE.Vector3[] }) {
  const geometry = useMemo(() => {
    if (positions.length < 21) return null;
    const geo = new THREE.BufferGeometry();
    // Wrist + the two thumb-side joints + knuckle row → a fuller palm outline.
    const palm = [positions[0], positions[1], positions[5], positions[9], positions[13], positions[17]];
    const verts: number[] = [];
    const addTri = (a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3) => {
      verts.push(a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z);
    };
    for (let i = 1; i < palm.length - 1; i++) {
      addTri(palm[0], palm[i], palm[i + 1]); // front
      addTri(palm[0], palm[i + 1], palm[i]); // back
    }
    geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
    geo.computeVertexNormals();
    return geo;
  }, [positions]);

  if (!geometry) return null;

  return (
    <mesh geometry={geometry} receiveShadow>
      <meshStandardMaterial color={SKIN_PALM} roughness={0.7} metalness={0} side={THREE.DoubleSide} />
    </mesh>
  );
}

export function HandModel({ landmarks }: HandModelProps) {
  const positions = useMemo(
    () => landmarks.map(([x, y, z]) => new THREE.Vector3(x, y, z)),
    [landmarks]
  );

  if (landmarks.length < 21) return null;

  return (
    <group scale={1.5} position={[0, -0.3, 0]}>
      <PalmMesh positions={positions} />
      {CONNECTIONS.map(([a, b], i) => (
        <Bone key={`bone-${i}`} start={positions[a]} end={positions[b]} />
      ))}
      {positions.map((pos, i) => {
        const radius = TIP_INDICES.has(i)
          ? BONE_RADIUS * 0.9 // taper the fingertips
          : KNUCKLE_INDICES.has(i)
          ? JOINT_RADIUS * 1.15 // fuller knuckles
          : JOINT_RADIUS;
        return <Joint key={`joint-${i}`} position={pos} radius={radius} />;
      })}
    </group>
  );
}
