import { SignSequence, Landmark } from './types';
import { getSign } from './sign-data';

export interface SignStep {
  kind: 'word' | 'letter';
  label: string; // what to show on the hand overlay, e.g. "HELLO" or "A"
  char?: string; // original character for letter steps
  wordIndex: number; // index of the source word, for highlighting
  sign: SignSequence;
}

export interface TranslatedWord {
  raw: string; // the original word as typed
  matched: boolean; // true if a dedicated word-sign exists (vs fingerspelled)
  gloss?: string;
  steps: SignStep[];
}

export interface Translation {
  words: TranslatedWord[];
  steps: SignStep[]; // flat playback timeline
  unsupported: string[]; // characters that have no sign (skipped)
}

// Aliases mapped to the dedicated word-signs that exist in the dataset.
const WORD_SIGNS: Record<string, string> = {
  HELLO: 'asl-hello',
  HI: 'asl-hello',
  HEY: 'asl-hello',
  GOODBYE: 'asl-goodbye',
  BYE: 'asl-goodbye',
  PLEASE: 'asl-please',
  THANKS: 'asl-thankyou',
  THANKYOU: 'asl-thankyou',
  SORRY: 'asl-sorry',
};

function letterSign(ch: string): SignSequence | undefined {
  if (/[a-z]/i.test(ch)) return getSign(`asl-${ch.toLowerCase()}`);
  if (/[0-9]/.test(ch)) return getSign(`asl-${ch}`);
  return undefined;
}

/**
 * Convert free text into a playable sequence of signs. Known words map to their
 * dedicated sign; everything else is fingerspelled letter-by-letter. Currently
 * ASL only — the only language with a full alphabet in the dataset.
 */
export function translateToSigns(text: string): Translation {
  // Collapse the multi-word "thank you" into a single token first.
  const normalized = text.replace(/\bthank\s+you\b/gi, 'thankyou');
  const rawWords = normalized.split(/\s+/).filter(Boolean);

  const words: TranslatedWord[] = [];
  const steps: SignStep[] = [];
  const unsupported = new Set<string>();

  rawWords.forEach((raw, wordIndex) => {
    const key = raw.replace(/[^a-z0-9]/gi, '').toUpperCase();
    const wordSignId = key ? WORD_SIGNS[key] : undefined;
    const wordSign = wordSignId ? getSign(wordSignId) : undefined;

    if (wordSign) {
      const step: SignStep = { kind: 'word', label: wordSign.gloss, wordIndex, sign: wordSign };
      words.push({ raw, matched: true, gloss: wordSign.gloss, steps: [step] });
      steps.push(step);
      return;
    }

    const letterSteps: SignStep[] = [];
    for (const ch of raw) {
      const sign = letterSign(ch);
      if (sign) {
        const step: SignStep = { kind: 'letter', label: ch.toUpperCase(), char: ch, wordIndex, sign };
        letterSteps.push(step);
        steps.push(step);
      } else if (/\S/.test(ch)) {
        unsupported.add(ch);
      }
    }
    words.push({ raw, matched: false, steps: letterSteps });
  });

  return { words, steps, unsupported: [...unsupported] };
}

/** Linear interpolation between two landmark frames. */
export function lerpLandmarks(a: Landmark[], b: Landmark[], t: number): Landmark[] {
  return a.map((p, i) => [
    p[0] + (b[i][0] - p[0]) * t,
    p[1] + (b[i][1] - p[1]) * t,
    p[2] + (b[i][2] - p[2]) * t,
  ] as Landmark);
}
