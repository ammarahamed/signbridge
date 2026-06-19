'use client';

import Image from 'next/image';
import { asset } from '@/lib/asset';

const ASL_ALPHABET = new Set('abcdefghijklmnopqrstuvwxyz'.split(''));

export function getSignImagePath(sign: { gloss: string; language: string }): string | null {
  if (sign.language !== 'asl') return null;
  const letter = sign.gloss.toLowerCase();
  if (letter.length === 1 && ASL_ALPHABET.has(letter)) {
    return asset(`/images/signs/asl/${letter}.svg`);
  }
  return null;
}

export function ReferenceImage({ sign, className = '' }: {
  sign: { gloss: string; language: string };
  className?: string;
}) {
  const src = getSignImagePath(sign);
  if (!src) return null;

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <div className="relative w-full aspect-[3/4] bg-white dark:bg-white/10 rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden p-4">
        <Image
          src={src}
          alt={`ASL sign for "${sign.gloss}"`}
          fill
          className="object-contain p-3 dark:invert dark:brightness-90"
        />
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Reference: &ldquo;{sign.gloss}&rdquo;</p>
    </div>
  );
}
