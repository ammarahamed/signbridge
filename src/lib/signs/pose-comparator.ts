import { Landmark, PoseComparisonResult } from './types';

const FINGER_NAMES = ['thumb', 'index', 'middle', 'ring', 'pinky'];
const FINGER_JOINTS: Record<string, number[]> = {
  thumb: [1, 2, 3, 4],
  index: [5, 6, 7, 8],
  middle: [9, 10, 11, 12],
  ring: [13, 14, 15, 16],
  pinky: [17, 18, 19, 20],
};

const FINGER_TIP_WEIGHT = 2.0;
const FINGER_JOINT_WEIGHT = 1.0;

// Mild leniency to offset webcam noise on honest attempts — but gentle enough
// that wrong handshapes (which now score low) don't get rescued into a pass:
//   raw 30 -> 39, 40 -> 50, 60 -> 68, 80 -> 84, 100 -> 100.
const LENIENCY_EXPONENT = 0.85;
function applyLeniency(score: number): number {
  return 100 * Math.pow(Math.max(0, score) / 100, LENIENCY_EXPONENT);
}

function normalize(landmarks: Landmark[], flipY = false): Landmark[] {
  if (landmarks.length < 21) return landmarks;

  const wrist = landmarks[0];
  const ySign = flipY ? -1 : 1;
  const translated: Landmark[] = landmarks.map(([x, y, z]) => [
    x - wrist[0],
    (y - wrist[1]) * ySign,
    z - wrist[2],
  ]);

  const middleMCP = translated[9];
  const scale = Math.sqrt(
    middleMCP[0] ** 2 + middleMCP[1] ** 2 + middleMCP[2] ** 2
  ) || 1;

  return translated.map(([x, y, z]) => [x / scale, y / scale, z / scale]);
}

function vectorBetween(a: Landmark, b: Landmark): [number, number, number] {
  return [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
}

function dot(a: [number, number, number], b: [number, number, number]): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function magnitude(v: [number, number, number]): number {
  return Math.sqrt(v[0] ** 2 + v[1] ** 2 + v[2] ** 2);
}

function cosineSimilarity(a: [number, number, number], b: [number, number, number]): number {
  const magA = magnitude(a);
  const magB = magnitude(b);
  if (magA === 0 || magB === 0) return 1;
  return dot(a, b) / (magA * magB);
}

function euclideanDistance(a: Landmark, b: Landmark): number {
  return Math.sqrt(
    (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2
  );
}

function fingerCurlSimilarity(
  refLandmarks: Landmark[],
  userLandmarks: Landmark[],
  joints: number[]
): number {
  let totalSim = 0;
  let count = 0;

  for (let i = 0; i < joints.length - 1; i++) {
    const refDir = vectorBetween(refLandmarks[joints[i]], refLandmarks[joints[i + 1]]);
    const userDir = vectorBetween(userLandmarks[joints[i]], userLandmarks[joints[i + 1]]);
    const sim = cosineSimilarity(refDir, userDir);
    // A well-aligned finger has cosine ~1; a perpendicular/opposite one should
    // score near 0 (the old (sim+1)/2 gave a perpendicular finger 0.5, so wrong
    // handshapes still passed). Clamp negatives to 0 and use the raw cosine.
    totalSim += Math.max(0, sim);
    count++;
  }

  return count > 0 ? totalSim / count : 1;
}

function generateHints(
  fingerScores: Record<string, number>,
  refLandmarks: Landmark[],
  userLandmarks: Landmark[]
): string[] {
  const hints: string[] = [];
  const sortedFingers = Object.entries(fingerScores)
    .sort(([, a], [, b]) => a - b);

  for (const [finger, score] of sortedFingers) {
    if (score >= 80) continue;
    if (hints.length >= 2) break;

    const joints = FINGER_JOINTS[finger];
    const tipIdx = joints[joints.length - 1];
    const mcpIdx = joints[0];

    const refTipDist = euclideanDistance(refLandmarks[tipIdx], refLandmarks[0]);
    const userTipDist = euclideanDistance(userLandmarks[tipIdx], userLandmarks[0]);

    const refCurl = euclideanDistance(refLandmarks[tipIdx], refLandmarks[mcpIdx]);
    const userCurl = euclideanDistance(userLandmarks[tipIdx], userLandmarks[mcpIdx]);

    if (userCurl > refCurl * 1.3) {
      hints.push(`Try curling your ${finger} finger more`);
    } else if (userCurl < refCurl * 0.7) {
      hints.push(`Try extending your ${finger} finger more`);
    } else if (userTipDist > refTipDist * 1.2) {
      hints.push(`Move your ${finger} finger closer to your palm`);
    } else if (userTipDist < refTipDist * 0.8) {
      hints.push(`Spread your ${finger} finger further from your palm`);
    } else {
      hints.push(`Adjust the angle of your ${finger} finger`);
    }
  }

  return hints;
}

export function comparePoses(
  reference: Landmark[],
  user: Landmark[]
): PoseComparisonResult {
  if (reference.length < 21 || user.length < 21) {
    return { score: 0, fingerScores: {}, hints: ['Hand not fully detected'] };
  }

  const refNorm = normalize(reference);
  // MediaPipe y-axis is top-to-bottom (0=top), reference data has y increasing upward — flip user y
  const isMediaPipe = user[0][0] >= 0 && user[0][0] <= 1 && user[0][1] >= 0 && user[0][1] <= 1;
  const userNorm = normalize(user, isMediaPipe);

  const fingerScores: Record<string, number> = {};
  let totalWeightedScore = 0;
  let totalWeight = 0;

  for (const finger of FINGER_NAMES) {
    const joints = FINGER_JOINTS[finger];
    const curlSim = fingerCurlSimilarity(refNorm, userNorm, joints);

    const tipIdx = joints[joints.length - 1];
    const tipDist = euclideanDistance(refNorm[tipIdx], userNorm[tipIdx]);
    const tipScore = Math.max(0, 1 - tipDist * 0.8);

    const rawFingerScore = (curlSim * 0.7 + tipScore * 0.3) * 100;
    const fingerScore = applyLeniency(rawFingerScore);
    fingerScores[finger] = Math.round(fingerScore);

    const weight = finger === 'thumb' ? FINGER_TIP_WEIGHT : FINGER_JOINT_WEIGHT;
    totalWeightedScore += fingerScore * weight;
    totalWeight += weight;
  }

  const overallScore = Math.round(totalWeightedScore / totalWeight);
  const hints = generateHints(fingerScores, refNorm, userNorm);

  return {
    score: Math.min(100, Math.max(0, overallScore)),
    fingerScores,
    hints: overallScore >= 90 ? ['Excellent! Great form!'] : hints,
  };
}
