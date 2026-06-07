import { SignSequence, Landmark } from './types';

// Finger joint indices in MediaPipe hand landmark format:
// 0: WRIST
// 1-4: THUMB (CMC, MCP, IP, TIP)
// 5-8: INDEX (MCP, PIP, DIP, TIP)
// 9-12: MIDDLE (MCP, PIP, DIP, TIP)
// 13-16: RING (MCP, PIP, DIP, TIP)
// 17-20: PINKY (MCP, PIP, DIP, TIP)

// Helper: generate landmarks for common hand configurations
function fist(): Landmark[] {
  return [
    [0, 0, 0],         // WRIST
    [0.3, 0.1, 0.1],   // THUMB_CMC
    [0.35, 0.25, 0.15],// THUMB_MCP
    [0.3, 0.35, 0.2],  // THUMB_IP
    [0.25, 0.4, 0.2],  // THUMB_TIP
    [0.2, 0.6, 0.05],  // INDEX_MCP
    [0.2, 0.65, 0.2],  // INDEX_PIP
    [0.2, 0.55, 0.25], // INDEX_DIP
    [0.2, 0.45, 0.2],  // INDEX_TIP
    [0.05, 0.62, 0.05],// MIDDLE_MCP
    [0.05, 0.67, 0.2], // MIDDLE_PIP
    [0.05, 0.57, 0.25],// MIDDLE_DIP
    [0.05, 0.47, 0.2], // MIDDLE_TIP
    [-0.08, 0.6, 0.05],// RING_MCP
    [-0.08, 0.65, 0.2],// RING_PIP
    [-0.08, 0.55, 0.25],//RING_DIP
    [-0.08, 0.45, 0.2],// RING_TIP
    [-0.2, 0.55, 0.05],// PINKY_MCP
    [-0.2, 0.6, 0.2],  // PINKY_PIP
    [-0.2, 0.5, 0.22], // PINKY_DIP
    [-0.2, 0.42, 0.18],// PINKY_TIP
  ];
}

function openHand(): Landmark[] {
  return [
    [0, 0, 0],
    [0.3, 0.1, 0.0],
    [0.4, 0.25, 0.0],
    [0.45, 0.4, 0.0],
    [0.48, 0.5, 0.0],
    [0.2, 0.7, 0.0],
    [0.2, 0.85, 0.0],
    [0.2, 0.95, 0.0],
    [0.2, 1.0, 0.0],
    [0.05, 0.72, 0.0],
    [0.05, 0.88, 0.0],
    [0.05, 0.98, 0.0],
    [0.05, 1.03, 0.0],
    [-0.08, 0.7, 0.0],
    [-0.08, 0.84, 0.0],
    [-0.08, 0.93, 0.0],
    [-0.08, 0.98, 0.0],
    [-0.2, 0.62, 0.0],
    [-0.2, 0.74, 0.0],
    [-0.2, 0.82, 0.0],
    [-0.2, 0.87, 0.0],
  ];
}

function indexUp(): Landmark[] {
  const base = fist();
  // Extend index finger
  base[5] = [0.2, 0.65, 0.0];
  base[6] = [0.2, 0.8, 0.0];
  base[7] = [0.2, 0.9, 0.0];
  base[8] = [0.2, 1.0, 0.0];
  return base;
}

function indexMiddleUp(): Landmark[] {
  const base = indexUp();
  // Extend middle finger
  base[9] = [0.05, 0.67, 0.0];
  base[10] = [0.05, 0.82, 0.0];
  base[11] = [0.05, 0.92, 0.0];
  base[12] = [0.05, 1.02, 0.0];
  return base;
}

function indexMiddleRingUp(): Landmark[] {
  const base = indexMiddleUp();
  // Extend ring finger
  base[13] = [-0.08, 0.65, 0.0];
  base[14] = [-0.08, 0.79, 0.0];
  base[15] = [-0.08, 0.89, 0.0];
  base[16] = [-0.08, 0.96, 0.0];
  return base;
}

function allFingersUp(): Landmark[] {
  const base = indexMiddleRingUp();
  // Extend pinky
  base[17] = [-0.2, 0.58, 0.0];
  base[18] = [-0.2, 0.7, 0.0];
  base[19] = [-0.2, 0.8, 0.0];
  base[20] = [-0.2, 0.87, 0.0];
  return base;
}

function thumbOut(): Landmark[] {
  const base = fist();
  // Extend thumb outward
  base[1] = [0.3, 0.1, -0.05];
  base[2] = [0.45, 0.2, -0.05];
  base[3] = [0.55, 0.3, -0.05];
  base[4] = [0.6, 0.38, -0.05];
  return base;
}

// ASL Alphabet signs - static fingerspelling poses
const aslAlphabet: SignSequence[] = [
  {
    id: 'asl-a', gloss: 'A', language: 'asl', category: 'alphabet',
    description: 'Make a fist with thumb resting on the side of the index finger',
    mnemonic: 'A tight fist with thumb beside',
    difficulty: 'beginner', twoHanded: false, duration: 0,
    poses: [{ landmarks: (() => { const l = fist(); l[1]=[0.3,0.1,0.0]; l[2]=[0.35,0.3,0.0]; l[3]=[0.3,0.45,0.0]; l[4]=[0.25,0.5,0.0]; return l; })(), timestamp: 0, handedness: 'right' }],
  },
  {
    id: 'asl-b', gloss: 'B', language: 'asl', category: 'alphabet',
    description: 'Hold all four fingers straight up together, thumb tucked across palm',
    mnemonic: 'Four fingers tall like a wall',
    difficulty: 'beginner', twoHanded: false, duration: 0,
    poses: [{ landmarks: (() => { const l = allFingersUp(); l[1]=[0.15,0.1,0.1]; l[2]=[0.15,0.25,0.15]; l[3]=[0.1,0.35,0.18]; l[4]=[0.05,0.4,0.15]; return l; })(), timestamp: 0, handedness: 'right' }],
  },
  {
    id: 'asl-c', gloss: 'C', language: 'asl', category: 'alphabet',
    description: 'Curve your hand into a C shape, fingers together and curved',
    mnemonic: 'Shape your hand like the letter C',
    difficulty: 'beginner', twoHanded: false, duration: 0,
    poses: [{ landmarks: [
      [0,0,0],[0.3,0.1,0.0],[0.4,0.25,0.05],[0.42,0.38,0.1],[0.4,0.45,0.12],
      [0.18,0.65,0.0],[0.2,0.75,0.1],[0.22,0.72,0.18],[0.2,0.65,0.2],
      [0.05,0.67,0.0],[0.07,0.77,0.1],[0.08,0.74,0.18],[0.06,0.67,0.2],
      [-0.06,0.64,0.0],[-0.05,0.74,0.1],[-0.04,0.71,0.18],[-0.06,0.64,0.2],
      [-0.18,0.58,0.0],[-0.17,0.67,0.1],[-0.17,0.64,0.18],[-0.18,0.58,0.2],
    ], timestamp: 0, handedness: 'right' }],
  },
  {
    id: 'asl-d', gloss: 'D', language: 'asl', category: 'alphabet',
    description: 'Point index finger up, other fingers curl to touch thumb tip forming a circle',
    mnemonic: 'Index points up, others make an O with thumb',
    difficulty: 'beginner', twoHanded: false, duration: 0,
    poses: [{ landmarks: (() => { const l = indexUp(); l[1]=[0.25,0.1,0.1]; l[2]=[0.25,0.3,0.15]; l[3]=[0.2,0.45,0.18]; l[4]=[0.15,0.5,0.15]; l[9]=[0.05,0.62,0.1]; l[10]=[0.1,0.6,0.2]; l[11]=[0.12,0.52,0.2]; l[12]=[0.15,0.48,0.15]; return l; })(), timestamp: 0, handedness: 'right' }],
  },
  {
    id: 'asl-e', gloss: 'E', language: 'asl', category: 'alphabet',
    description: 'Curl all fingers down to touch thumb, creating a rounded fist',
    mnemonic: 'Fingers curl down like a claw to meet thumb',
    difficulty: 'beginner', twoHanded: false, duration: 0,
    poses: [{ landmarks: (() => { const l = fist(); l[1]=[0.2,0.1,0.0]; l[2]=[0.2,0.3,0.0]; l[3]=[0.15,0.42,0.0]; l[4]=[0.1,0.48,0.0]; l[8]=[0.18,0.5,0.12]; l[12]=[0.05,0.5,0.12]; l[16]=[-0.05,0.48,0.12]; l[20]=[-0.15,0.44,0.12]; return l; })(), timestamp: 0, handedness: 'right' }],
  },
  {
    id: 'asl-f', gloss: 'F', language: 'asl', category: 'alphabet',
    description: 'Touch index finger to thumb, other three fingers spread up',
    mnemonic: 'OK sign but with three fingers up',
    difficulty: 'beginner', twoHanded: false, duration: 0,
    poses: [{ landmarks: (() => { const l = indexMiddleRingUp(); l[17]=[-0.2,0.58,0.0]; l[18]=[-0.2,0.7,0.0]; l[19]=[-0.2,0.8,0.0]; l[20]=[-0.2,0.87,0.0]; l[5]=[0.2,0.55,0.05]; l[6]=[0.22,0.5,0.15]; l[7]=[0.25,0.45,0.18]; l[8]=[0.3,0.42,0.15]; l[4]=[0.3,0.43,0.14]; return l; })(), timestamp: 0, handedness: 'right' }],
  },
  {
    id: 'asl-g', gloss: 'G', language: 'asl', category: 'alphabet',
    description: 'Point index finger sideways, thumb parallel, other fingers curled',
    mnemonic: 'Point sideways like a gun',
    difficulty: 'beginner', twoHanded: false, duration: 0,
    poses: [{ landmarks: (() => { const l = fist(); l[5]=[0.2,0.6,0.0]; l[6]=[0.2,0.6,-0.15]; l[7]=[0.2,0.6,-0.28]; l[8]=[0.2,0.6,-0.38]; l[1]=[0.3,0.1,0.0]; l[2]=[0.35,0.3,0.0]; l[3]=[0.35,0.45,0.0]; l[4]=[0.35,0.55,-0.1]; return l; })(), timestamp: 0, handedness: 'right' }],
  },
  {
    id: 'asl-h', gloss: 'H', language: 'asl', category: 'alphabet',
    description: 'Extend index and middle fingers sideways together, other fingers curled',
    mnemonic: 'Two fingers pointing sideways',
    difficulty: 'beginner', twoHanded: false, duration: 0,
    poses: [{ landmarks: (() => { const l = fist(); l[5]=[0.2,0.6,0.0]; l[6]=[0.2,0.6,-0.15]; l[7]=[0.2,0.6,-0.28]; l[8]=[0.2,0.6,-0.38]; l[9]=[0.05,0.62,0.0]; l[10]=[0.05,0.62,-0.15]; l[11]=[0.05,0.62,-0.28]; l[12]=[0.05,0.62,-0.38]; return l; })(), timestamp: 0, handedness: 'right' }],
  },
  {
    id: 'asl-i', gloss: 'I', language: 'asl', category: 'alphabet',
    description: 'Make a fist with pinky finger extended straight up',
    mnemonic: 'Little finger stands tall',
    difficulty: 'beginner', twoHanded: false, duration: 0,
    poses: [{ landmarks: (() => { const l = fist(); l[17]=[-0.2,0.58,0.0]; l[18]=[-0.2,0.7,0.0]; l[19]=[-0.2,0.8,0.0]; l[20]=[-0.2,0.87,0.0]; return l; })(), timestamp: 0, handedness: 'right' }],
  },
  {
    id: 'asl-j', gloss: 'J', language: 'asl', category: 'alphabet',
    description: 'Start with I handshape (pinky up), trace a J in the air',
    mnemonic: 'Draw a J with your pinky',
    difficulty: 'beginner', twoHanded: false, duration: 800,
    poses: [
      { landmarks: (() => { const l = fist(); l[17]=[-0.2,0.58,0.0]; l[18]=[-0.2,0.7,0.0]; l[19]=[-0.2,0.8,0.0]; l[20]=[-0.2,0.87,0.0]; return l; })(), timestamp: 0, handedness: 'right' },
      { landmarks: (() => { const l = fist(); l[17]=[-0.2,0.58,0.0]; l[18]=[-0.2,0.7,0.0]; l[19]=[-0.2,0.8,0.0]; l[20]=[-0.2,0.87,0.0]; return l; })(), timestamp: 400, handedness: 'right' },
      { landmarks: (() => { const l = fist(); l[17]=[-0.15,0.55,0.05]; l[18]=[-0.1,0.65,0.05]; l[19]=[-0.05,0.72,0.05]; l[20]=[0.0,0.75,0.05]; return l; })(), timestamp: 800, handedness: 'right' },
    ],
  },
  {
    id: 'asl-k', gloss: 'K', language: 'asl', category: 'alphabet',
    description: 'Index and middle fingers up in a V, thumb between them',
    mnemonic: 'Peace sign with thumb wedged between',
    difficulty: 'beginner', twoHanded: false, duration: 0,
    poses: [{ landmarks: (() => { const l = indexMiddleUp(); l[1]=[0.25,0.1,0.0]; l[2]=[0.25,0.3,0.0]; l[3]=[0.2,0.5,0.0]; l[4]=[0.15,0.6,0.0]; l[8]=[0.25,1.0,0.0]; l[12]=[-0.02,1.0,0.0]; return l; })(), timestamp: 0, handedness: 'right' }],
  },
  {
    id: 'asl-l', gloss: 'L', language: 'asl', category: 'alphabet',
    description: 'Make an L shape with thumb and index finger at right angles',
    mnemonic: 'An actual L shape with your hand',
    difficulty: 'beginner', twoHanded: false, duration: 0,
    poses: [{ landmarks: (() => { const l = fist(); l[5]=[0.2,0.65,0.0]; l[6]=[0.2,0.8,0.0]; l[7]=[0.2,0.9,0.0]; l[8]=[0.2,1.0,0.0]; l[1]=[0.3,0.1,0.0]; l[2]=[0.45,0.15,0.0]; l[3]=[0.55,0.2,0.0]; l[4]=[0.65,0.25,0.0]; return l; })(), timestamp: 0, handedness: 'right' }],
  },
  {
    id: 'asl-m', gloss: 'M', language: 'asl', category: 'alphabet',
    description: 'Place thumb under first three fingers (index, middle, ring curled over)',
    mnemonic: 'Three fingers drape over thumb',
    difficulty: 'beginner', twoHanded: false, duration: 0,
    poses: [{ landmarks: (() => { const l = fist(); l[1]=[0.15,0.1,0.1]; l[2]=[0.1,0.25,0.18]; l[3]=[0.0,0.32,0.18]; l[4]=[-0.1,0.35,0.12]; l[8]=[0.15,0.42,0.18]; l[12]=[0.0,0.42,0.18]; l[16]=[-0.1,0.4,0.18]; return l; })(), timestamp: 0, handedness: 'right' }],
  },
  {
    id: 'asl-n', gloss: 'N', language: 'asl', category: 'alphabet',
    description: 'Place thumb under first two fingers (index and middle curled over)',
    mnemonic: 'Two fingers drape over thumb',
    difficulty: 'beginner', twoHanded: false, duration: 0,
    poses: [{ landmarks: (() => { const l = fist(); l[1]=[0.15,0.1,0.1]; l[2]=[0.1,0.25,0.18]; l[3]=[0.05,0.35,0.18]; l[4]=[-0.02,0.38,0.12]; l[8]=[0.15,0.42,0.18]; l[12]=[0.0,0.42,0.18]; return l; })(), timestamp: 0, handedness: 'right' }],
  },
  {
    id: 'asl-o', gloss: 'O', language: 'asl', category: 'alphabet',
    description: 'All fingertips touch thumb tip forming an O shape',
    mnemonic: 'Fingertips and thumb form a circle',
    difficulty: 'beginner', twoHanded: false, duration: 0,
    poses: [{ landmarks: [
      [0,0,0],[0.2,0.1,0.0],[0.25,0.28,0.0],[0.22,0.42,0.05],[0.18,0.5,0.1],
      [0.2,0.6,0.0],[0.22,0.65,0.1],[0.22,0.58,0.15],[0.2,0.5,0.12],
      [0.07,0.62,0.0],[0.09,0.67,0.1],[0.09,0.6,0.15],[0.07,0.52,0.12],
      [-0.05,0.6,0.0],[-0.03,0.64,0.1],[-0.03,0.58,0.15],[-0.05,0.5,0.12],
      [-0.16,0.55,0.0],[-0.14,0.58,0.1],[-0.14,0.53,0.15],[-0.16,0.47,0.1],
    ], timestamp: 0, handedness: 'right' }],
  },
  {
    id: 'asl-p', gloss: 'P', language: 'asl', category: 'alphabet',
    description: 'Like K but pointing downward - index and middle down with thumb between',
    mnemonic: 'K rotated downward',
    difficulty: 'beginner', twoHanded: false, duration: 0,
    poses: [{ landmarks: (() => { const l = indexMiddleUp(); l[5]=[0.2,0.55,0.0]; l[6]=[0.2,0.5,-0.15]; l[7]=[0.2,0.4,-0.25]; l[8]=[0.2,0.3,-0.32]; l[9]=[0.05,0.57,0.0]; l[10]=[0.05,0.52,-0.15]; l[11]=[0.05,0.42,-0.25]; l[12]=[0.05,0.32,-0.32]; l[1]=[0.25,0.1,0.0]; l[2]=[0.25,0.3,0.0]; l[3]=[0.2,0.45,-0.05]; l[4]=[0.15,0.48,-0.12]; return l; })(), timestamp: 0, handedness: 'right' }],
  },
  {
    id: 'asl-q', gloss: 'Q', language: 'asl', category: 'alphabet',
    description: 'Like G but pointing downward - index and thumb point down',
    mnemonic: 'G rotated downward',
    difficulty: 'beginner', twoHanded: false, duration: 0,
    poses: [{ landmarks: (() => { const l = fist(); l[5]=[0.2,0.55,0.0]; l[6]=[0.2,0.45,-0.1]; l[7]=[0.2,0.35,-0.2]; l[8]=[0.2,0.25,-0.28]; l[1]=[0.3,0.1,0.0]; l[2]=[0.35,0.25,0.0]; l[3]=[0.35,0.35,-0.1]; l[4]=[0.35,0.3,-0.2]; return l; })(), timestamp: 0, handedness: 'right' }],
  },
  {
    id: 'asl-r', gloss: 'R', language: 'asl', category: 'alphabet',
    description: 'Cross index over middle finger, both pointing up',
    mnemonic: 'Cross your fingers for good luck',
    difficulty: 'beginner', twoHanded: false, duration: 0,
    poses: [{ landmarks: (() => { const l = fist(); l[5]=[0.15,0.65,0.0]; l[6]=[0.12,0.8,0.0]; l[7]=[0.08,0.92,0.0]; l[8]=[0.05,1.0,0.0]; l[9]=[0.05,0.62,0.0]; l[10]=[0.08,0.78,0.0]; l[11]=[0.12,0.9,0.0]; l[12]=[0.15,0.98,0.0]; return l; })(), timestamp: 0, handedness: 'right' }],
  },
  {
    id: 'asl-s', gloss: 'S', language: 'asl', category: 'alphabet',
    description: 'Make a fist with thumb wrapped over the front of fingers',
    mnemonic: 'Tight fist, thumb in front',
    difficulty: 'beginner', twoHanded: false, duration: 0,
    poses: [{ landmarks: (() => { const l = fist(); l[1]=[0.2,0.1,0.1]; l[2]=[0.2,0.3,0.2]; l[3]=[0.15,0.42,0.22]; l[4]=[0.08,0.45,0.2]; return l; })(), timestamp: 0, handedness: 'right' }],
  },
  {
    id: 'asl-t', gloss: 'T', language: 'asl', category: 'alphabet',
    description: 'Make a fist with thumb tucked between index and middle fingers',
    mnemonic: 'Thumb peeks out between first two fingers',
    difficulty: 'beginner', twoHanded: false, duration: 0,
    poses: [{ landmarks: (() => { const l = fist(); l[1]=[0.2,0.1,0.1]; l[2]=[0.18,0.3,0.15]; l[3]=[0.15,0.45,0.2]; l[4]=[0.12,0.52,0.22]; return l; })(), timestamp: 0, handedness: 'right' }],
  },
  {
    id: 'asl-u', gloss: 'U', language: 'asl', category: 'alphabet',
    description: 'Hold index and middle fingers straight up together, thumb over ring and pinky',
    mnemonic: 'Two fingers together pointing up',
    difficulty: 'beginner', twoHanded: false, duration: 0,
    poses: [{ landmarks: (() => { const l = indexMiddleUp(); l[8]=[0.15,1.0,0.0]; l[12]=[0.1,1.02,0.0]; return l; })(), timestamp: 0, handedness: 'right' }],
  },
  {
    id: 'asl-v', gloss: 'V', language: 'asl', category: 'alphabet',
    description: 'Hold index and middle fingers in a V shape (peace sign)',
    mnemonic: 'Victory/peace sign',
    difficulty: 'beginner', twoHanded: false, duration: 0,
    poses: [{ landmarks: (() => { const l = indexMiddleUp(); l[8]=[0.3,1.0,0.0]; l[12]=[-0.1,1.0,0.0]; return l; })(), timestamp: 0, handedness: 'right' }],
  },
  {
    id: 'asl-w', gloss: 'W', language: 'asl', category: 'alphabet',
    description: 'Hold index, middle, and ring fingers spread apart',
    mnemonic: 'Three fingers spread wide',
    difficulty: 'beginner', twoHanded: false, duration: 0,
    poses: [{ landmarks: (() => { const l = indexMiddleRingUp(); l[8]=[0.3,1.0,0.0]; l[12]=[0.05,1.02,0.0]; l[16]=[-0.18,0.96,0.0]; return l; })(), timestamp: 0, handedness: 'right' }],
  },
  {
    id: 'asl-x', gloss: 'X', language: 'asl', category: 'alphabet',
    description: 'Make a fist, hook index finger (bend at middle joint)',
    mnemonic: 'Hook your index finger like a claw',
    difficulty: 'beginner', twoHanded: false, duration: 0,
    poses: [{ landmarks: (() => { const l = fist(); l[5]=[0.2,0.65,0.0]; l[6]=[0.2,0.8,0.0]; l[7]=[0.2,0.75,0.12]; l[8]=[0.2,0.68,0.15]; return l; })(), timestamp: 0, handedness: 'right' }],
  },
  {
    id: 'asl-y', gloss: 'Y', language: 'asl', category: 'alphabet',
    description: 'Extend thumb and pinky, curl other three fingers',
    mnemonic: 'Hang loose / shaka sign',
    difficulty: 'beginner', twoHanded: false, duration: 0,
    poses: [{ landmarks: (() => { const l = fist(); l[1]=[0.3,0.1,0.0]; l[2]=[0.45,0.2,0.0]; l[3]=[0.55,0.3,0.0]; l[4]=[0.65,0.38,0.0]; l[17]=[-0.2,0.58,0.0]; l[18]=[-0.2,0.7,0.0]; l[19]=[-0.2,0.8,0.0]; l[20]=[-0.2,0.87,0.0]; return l; })(), timestamp: 0, handedness: 'right' }],
  },
  {
    id: 'asl-z', gloss: 'Z', language: 'asl', category: 'alphabet',
    description: 'Point index finger and draw a Z in the air',
    mnemonic: 'Trace a Z with your index finger',
    difficulty: 'beginner', twoHanded: false, duration: 1000,
    poses: [
      { landmarks: indexUp(), timestamp: 0, handedness: 'right' },
      { landmarks: (() => { const l = indexUp(); l[8]=[0.0,1.0,0.0]; return l; })(), timestamp: 300, handedness: 'right' },
      { landmarks: (() => { const l = indexUp(); l[8]=[0.2,0.85,0.0]; return l; })(), timestamp: 600, handedness: 'right' },
      { landmarks: (() => { const l = indexUp(); l[8]=[0.0,0.7,0.0]; return l; })(), timestamp: 1000, handedness: 'right' },
    ],
  },
];

// ASL Numbers
const aslNumbers: SignSequence[] = [
  { id: 'asl-0', gloss: '0', language: 'asl', category: 'numbers', description: 'Form an O shape with all fingers touching thumb', mnemonic: 'Like the letter O', difficulty: 'beginner', twoHanded: false, duration: 0, poses: [{ landmarks: [
    [0,0,0],[0.2,0.1,0.0],[0.25,0.28,0.0],[0.22,0.42,0.05],[0.18,0.5,0.1],
    [0.2,0.6,0.0],[0.22,0.65,0.1],[0.22,0.58,0.15],[0.2,0.5,0.12],
    [0.07,0.62,0.0],[0.09,0.67,0.1],[0.09,0.6,0.15],[0.07,0.52,0.12],
    [-0.05,0.6,0.0],[-0.03,0.64,0.1],[-0.03,0.58,0.15],[-0.05,0.5,0.12],
    [-0.16,0.55,0.0],[-0.14,0.58,0.1],[-0.14,0.53,0.15],[-0.16,0.47,0.1],
  ], timestamp: 0, handedness: 'right' }] },
  { id: 'asl-1', gloss: '1', language: 'asl', category: 'numbers', description: 'Hold up index finger', mnemonic: 'One finger up', difficulty: 'beginner', twoHanded: false, duration: 0, poses: [{ landmarks: indexUp(), timestamp: 0, handedness: 'right' }] },
  { id: 'asl-2', gloss: '2', language: 'asl', category: 'numbers', description: 'Hold up index and middle in V shape', mnemonic: 'Peace sign = 2', difficulty: 'beginner', twoHanded: false, duration: 0, poses: [{ landmarks: (() => { const l = indexMiddleUp(); l[8]=[0.3,1.0,0.0]; l[12]=[-0.1,1.0,0.0]; return l; })(), timestamp: 0, handedness: 'right' }] },
  { id: 'asl-3', gloss: '3', language: 'asl', category: 'numbers', description: 'Thumb, index, and middle finger extended', mnemonic: 'Three fingers including thumb', difficulty: 'beginner', twoHanded: false, duration: 0, poses: [{ landmarks: (() => { const l = indexMiddleUp(); l[1]=[0.3,0.1,0.0]; l[2]=[0.45,0.2,0.0]; l[3]=[0.55,0.3,0.0]; l[4]=[0.65,0.38,0.0]; return l; })(), timestamp: 0, handedness: 'right' }] },
  { id: 'asl-4', gloss: '4', language: 'asl', category: 'numbers', description: 'Four fingers up, thumb tucked in', mnemonic: 'All fingers except thumb', difficulty: 'beginner', twoHanded: false, duration: 0, poses: [{ landmarks: allFingersUp(), timestamp: 0, handedness: 'right' }] },
  { id: 'asl-5', gloss: '5', language: 'asl', category: 'numbers', description: 'All five fingers spread open', mnemonic: 'Full open hand', difficulty: 'beginner', twoHanded: false, duration: 0, poses: [{ landmarks: (() => { const l = openHand(); l[4]=[0.55,0.5,0.0]; return l; })(), timestamp: 0, handedness: 'right' }] },
  { id: 'asl-6', gloss: '6', language: 'asl', category: 'numbers', description: 'Thumb touches pinky, other three fingers up', mnemonic: 'Three up, thumb touches pinky', difficulty: 'beginner', twoHanded: false, duration: 0, poses: [{ landmarks: (() => { const l = indexMiddleRingUp(); l[1]=[0.2,0.1,0.05]; l[2]=[0.15,0.25,0.1]; l[3]=[0.0,0.35,0.12]; l[4]=[-0.12,0.42,0.1]; l[17]=[-0.2,0.55,0.05]; l[18]=[-0.18,0.52,0.1]; l[19]=[-0.15,0.45,0.12]; l[20]=[-0.13,0.42,0.1]; return l; })(), timestamp: 0, handedness: 'right' }] },
  { id: 'asl-7', gloss: '7', language: 'asl', category: 'numbers', description: 'Thumb touches ring finger, other three up', mnemonic: 'Three up, thumb touches ring', difficulty: 'beginner', twoHanded: false, duration: 0, poses: [{ landmarks: (() => { const l = indexMiddleUp(); l[17]=[-0.2,0.58,0.0]; l[18]=[-0.2,0.7,0.0]; l[19]=[-0.2,0.8,0.0]; l[20]=[-0.2,0.87,0.0]; l[1]=[0.15,0.1,0.05]; l[2]=[0.05,0.25,0.1]; l[3]=[-0.05,0.38,0.12]; l[4]=[-0.08,0.45,0.1]; l[13]=[-0.08,0.6,0.05]; l[14]=[-0.08,0.58,0.1]; l[15]=[-0.08,0.5,0.12]; l[16]=[-0.08,0.45,0.1]; return l; })(), timestamp: 0, handedness: 'right' }] },
  { id: 'asl-8', gloss: '8', language: 'asl', category: 'numbers', description: 'Thumb touches middle finger, other three up', mnemonic: 'Three up, thumb touches middle', difficulty: 'beginner', twoHanded: false, duration: 0, poses: [{ landmarks: (() => { const l = indexUp(); l[13]=[-0.08,0.65,0.0]; l[14]=[-0.08,0.79,0.0]; l[15]=[-0.08,0.89,0.0]; l[16]=[-0.08,0.96,0.0]; l[17]=[-0.2,0.58,0.0]; l[18]=[-0.2,0.7,0.0]; l[19]=[-0.2,0.8,0.0]; l[20]=[-0.2,0.87,0.0]; l[1]=[0.15,0.1,0.05]; l[2]=[0.1,0.3,0.1]; l[3]=[0.08,0.45,0.12]; l[4]=[0.06,0.52,0.1]; l[9]=[0.05,0.62,0.05]; l[10]=[0.06,0.58,0.1]; l[11]=[0.06,0.52,0.12]; l[12]=[0.06,0.5,0.1]; return l; })(), timestamp: 0, handedness: 'right' }] },
  { id: 'asl-9', gloss: '9', language: 'asl', category: 'numbers', description: 'Thumb touches index finger, other three up', mnemonic: 'Three up, thumb touches index like OK', difficulty: 'beginner', twoHanded: false, duration: 0, poses: [{ landmarks: (() => { const l = indexMiddleRingUp(); l[17]=[-0.2,0.58,0.0]; l[18]=[-0.2,0.7,0.0]; l[19]=[-0.2,0.8,0.0]; l[20]=[-0.2,0.87,0.0]; l[5]=[0.2,0.55,0.05]; l[6]=[0.22,0.5,0.15]; l[7]=[0.25,0.45,0.18]; l[8]=[0.3,0.42,0.15]; l[4]=[0.3,0.43,0.14]; return l; })(), timestamp: 0, handedness: 'right' }] },
];

// Common ASL words
const aslCommon: SignSequence[] = [
  {
    id: 'asl-hello', gloss: 'HELLO', language: 'asl', category: 'greetings',
    description: 'Open hand starts at forehead and moves outward like a salute',
    mnemonic: 'Like a casual salute wave',
    difficulty: 'beginner', twoHanded: false, duration: 600,
    poses: [
      { landmarks: openHand(), timestamp: 0, handedness: 'right' },
      { landmarks: (() => { const l = openHand(); l.forEach((_, i) => { l[i] = [l[i][0]+0.1, l[i][1]+0.05, l[i][2]-0.15]; }); return l; })(), timestamp: 600, handedness: 'right' },
    ],
  },
  {
    id: 'asl-goodbye', gloss: 'GOODBYE', language: 'asl', category: 'greetings',
    description: 'Open and close fingers repeatedly like waving goodbye',
    mnemonic: 'Wave bye-bye',
    difficulty: 'beginner', twoHanded: false, duration: 800,
    poses: [
      { landmarks: openHand(), timestamp: 0, handedness: 'right' },
      { landmarks: (() => { const l = fist(); l[1]=[0.3,0.1,0.0]; l[2]=[0.4,0.25,0.0]; l[3]=[0.45,0.38,0.0]; l[4]=[0.48,0.45,0.0]; return l; })(), timestamp: 400, handedness: 'right' },
      { landmarks: openHand(), timestamp: 800, handedness: 'right' },
    ],
  },
  {
    id: 'asl-please', gloss: 'PLEASE', language: 'asl', category: 'greetings',
    description: 'Flat open hand circles on your chest',
    mnemonic: 'Rubbing your heart area',
    difficulty: 'beginner', twoHanded: false, duration: 800,
    poses: [
      { landmarks: openHand(), timestamp: 0, handedness: 'right' },
      { landmarks: (() => { const l = openHand(); l.forEach((_, i) => { l[i] = [l[i][0]+0.05, l[i][1]+0.02, l[i][2]]; }); return l; })(), timestamp: 400, handedness: 'right' },
      { landmarks: openHand(), timestamp: 800, handedness: 'right' },
    ],
  },
  {
    id: 'asl-thankyou', gloss: 'THANK YOU', language: 'asl', category: 'greetings',
    description: 'Touch fingertips to chin then move hand forward and down',
    mnemonic: 'Blow a kiss of thanks',
    difficulty: 'beginner', twoHanded: false, duration: 600,
    poses: [
      { landmarks: openHand(), timestamp: 0, handedness: 'right' },
      { landmarks: (() => { const l = openHand(); l.forEach((_, i) => { l[i] = [l[i][0]+0.1, l[i][1]-0.1, l[i][2]-0.2]; }); return l; })(), timestamp: 600, handedness: 'right' },
    ],
  },
  {
    id: 'asl-sorry', gloss: 'SORRY', language: 'asl', category: 'greetings',
    description: 'Make a fist (A handshape) and circle it on your chest',
    mnemonic: 'Rubbing your heart with a fist',
    difficulty: 'beginner', twoHanded: false, duration: 800,
    poses: [
      { landmarks: (() => { const l = fist(); l[1]=[0.3,0.1,0.0]; l[2]=[0.35,0.3,0.0]; l[3]=[0.3,0.45,0.0]; l[4]=[0.25,0.5,0.0]; return l; })(), timestamp: 0, handedness: 'right' },
      { landmarks: (() => { const l = fist(); l[1]=[0.3,0.1,0.0]; l[2]=[0.35,0.3,0.0]; l[3]=[0.3,0.45,0.0]; l[4]=[0.25,0.5,0.0]; l.forEach((_, i) => { l[i] = [l[i][0]+0.05, l[i][1]+0.03, l[i][2]]; }); return l; })(), timestamp: 400, handedness: 'right' },
      { landmarks: (() => { const l = fist(); l[1]=[0.3,0.1,0.0]; l[2]=[0.35,0.3,0.0]; l[3]=[0.3,0.45,0.0]; l[4]=[0.25,0.5,0.0]; return l; })(), timestamp: 800, handedness: 'right' },
    ],
  },
];

// BSL Alphabet (simplified - BSL uses two hands)
const bslAlphabet: SignSequence[] = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((letter) => ({
  id: `bsl-${letter.toLowerCase()}`,
  gloss: letter,
  language: 'bsl',
  category: 'alphabet',
  description: `BSL fingerspelling for the letter ${letter}`,
  mnemonic: `Two-handed BSL letter ${letter}`,
  difficulty: 'beginner' as const,
  twoHanded: true,
  duration: 0,
  poses: [{ landmarks: openHand(), timestamp: 0, handedness: 'both' as const, secondHandLandmarks: openHand() }],
}));

// BSL Numbers
const bslNumbers: SignSequence[] = '0123456789'.split('').map((num) => ({
  id: `bsl-${num}`,
  gloss: num,
  language: 'bsl',
  category: 'numbers',
  description: `BSL number ${num}`,
  difficulty: 'beginner' as const,
  twoHanded: false,
  duration: 0,
  poses: [{ landmarks: num === '0' ? fist() : num === '1' ? indexUp() : num === '2' ? indexMiddleUp() : num === '3' ? indexMiddleRingUp() : num === '4' ? allFingersUp() : openHand(), timestamp: 0, handedness: 'right' as const }],
}));

// ISL Alphabet
const islAlphabet: SignSequence[] = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((letter) => ({
  id: `isl-${letter.toLowerCase()}`,
  gloss: letter,
  language: 'isl',
  category: 'alphabet',
  description: `ISL fingerspelling for the letter ${letter}`,
  mnemonic: `Indian Sign Language letter ${letter}`,
  difficulty: 'beginner' as const,
  twoHanded: false,
  duration: 0,
  poses: [{ landmarks: openHand(), timestamp: 0, handedness: 'right' as const }],
}));

// ISL Numbers
const islNumbers: SignSequence[] = '0123456789'.split('').map((num) => ({
  id: `isl-${num}`,
  gloss: num,
  language: 'isl',
  category: 'numbers',
  description: `ISL number ${num}`,
  difficulty: 'beginner' as const,
  twoHanded: false,
  duration: 0,
  poses: [{ landmarks: num === '0' ? fist() : num === '1' ? indexUp() : num === '2' ? indexMiddleUp() : num === '3' ? indexMiddleRingUp() : num === '4' ? allFingersUp() : openHand(), timestamp: 0, handedness: 'right' as const }],
}));

export const allSigns: SignSequence[] = [
  ...aslAlphabet,
  ...aslNumbers,
  ...aslCommon,
  ...bslAlphabet,
  ...bslNumbers,
  ...islAlphabet,
  ...islNumbers,
];

export function getSign(id: string): SignSequence | undefined {
  return allSigns.find(s => s.id === id);
}

export function getSignsByLanguage(language: string): SignSequence[] {
  return allSigns.filter(s => s.language === language);
}

export function getSignsByCategory(language: string, category: string): SignSequence[] {
  return allSigns.filter(s => s.language === language && s.category === category);
}
