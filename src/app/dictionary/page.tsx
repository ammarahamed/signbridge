'use client';

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Search, Heart, ChevronDown, X } from 'lucide-react';
import { signLanguages } from '@/lib/signs/languages';
import { allSigns, getSignsByLanguage } from '@/lib/signs/sign-data';
import { ReferenceImage } from '@/components/signs/ReferenceImage';
import { useProgressStore } from '@/lib/storage/progress-store';
import { SignSequence } from '@/lib/signs/types';

const SignPlayer = dynamic(
  () => import('@/components/avatar/SignPlayer').then(m => ({ default: m.SignPlayer })),
  { ssr: false, loading: () => <div className="w-full h-[250px] bg-gray-100 dark:bg-white/[0.06] rounded-xl animate-pulse" /> }
);

export default function DictionaryPage() {
  const preferredLanguage = useProgressStore(s => s.preferredLanguage);
  const favorites = useProgressStore(s => s.favorites);
  const toggleFavorite = useProgressStore(s => s.toggleFavorite);

  const [language, setLanguage] = useState(preferredLanguage || 'asl');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSign, setSelectedSign] = useState<SignSequence | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const signs = useMemo(() => {
    let result = getSignsByLanguage(language);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(s =>
        s.gloss.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q)
      );
    }
    if (selectedCategory) {
      result = result.filter(s => s.category === selectedCategory);
    }
    if (showFavoritesOnly) {
      result = result.filter(s => favorites.includes(s.id));
    }
    return result;
  }, [language, searchQuery, selectedCategory, showFavoritesOnly, favorites]);

  const categories = useMemo(() => {
    const allLangSigns = getSignsByLanguage(language);
    return [...new Set(allLangSigns.map(s => s.category))];
  }, [language]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Sign Dictionary</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1">
          Browse and search all available signs. Click any sign to see the 3D demonstration.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search signs..."
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-white/[0.06] border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1dda63] focus:border-transparent"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>

        <div className="relative">
          <select
            value={language}
            onChange={e => { setLanguage(e.target.value); setSelectedSign(null); }}
            className="appearance-none pl-4 pr-10 py-2.5 bg-white dark:bg-white/[0.06] border border-gray-200 dark:border-white/10 rounded-xl text-sm font-medium cursor-pointer"
          >
            {signLanguages.map(lang => (
              <option key={lang.id} value={lang.id}>{lang.flag} {lang.nativeName}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>

        <button
          onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
            showFavoritesOnly
              ? 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300'
              : 'bg-gray-100 dark:bg-white/[0.06] text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/[0.1]'
          }`}
        >
          <Heart className={`w-4 h-4 ${showFavoritesOnly ? 'fill-current' : ''}`} />
          Favorites
        </button>
      </div>

      {/* Category chips */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            !selectedCategory
              ? 'bg-[#1dda63] text-white'
              : 'bg-gray-100 dark:bg-white/[0.06] text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/[0.1]'
          }`}
        >
          All
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${
              selectedCategory === cat
                ? 'bg-[#1dda63] text-white'
                : 'bg-gray-100 dark:bg-white/[0.06] text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/[0.1]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <span>{signs.length} signs found</span>
      </div>

      {/* Grid + Detail split */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Sign grid */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {signs.map(sign => (
              <button
                key={sign.id}
                onClick={() => setSelectedSign(sign)}
                className={`relative flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all hover:scale-105 ${
                  selectedSign?.id === sign.id
                    ? 'bg-[#1dda63]/5 dark:bg-[#1dda63]/10 border-[#1dda63]/30 dark:border-[#1dda63]/30 ring-2 ring-[#1dda63]'
                    : 'bg-white dark:bg-white/[0.06] border-gray-200 dark:border-white/10 hover:border-[#1dda63]/30 dark:hover:border-[#1dda63]/30'
                }`}
              >
                <span className="text-lg font-bold">{sign.gloss}</span>
                <span className="text-xs text-gray-500 capitalize mt-1">{sign.category}</span>
                {favorites.includes(sign.id) && (
                  <Heart className="absolute top-1.5 right-1.5 w-3 h-3 text-pink-500 fill-pink-500" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Detail panel */}
        <div className="lg:col-span-1">
          {selectedSign ? (
            <div className="sticky top-24 bg-white dark:bg-white/[0.06] rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden">
              <SignPlayer sign={selectedSign} className="h-[250px]" />
              <ReferenceImage sign={selectedSign} className="px-4 pt-4" />
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-bold">{selectedSign.gloss}</h3>
                  <button
                    onClick={() => toggleFavorite(selectedSign.id)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/[0.1] transition-colors"
                    aria-label={favorites.includes(selectedSign.id) ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <Heart className={`w-5 h-5 ${favorites.includes(selectedSign.id) ? 'text-pink-500 fill-pink-500' : 'text-gray-400'}`} />
                  </button>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-600 dark:text-gray-300">{selectedSign.description}</p>
                  {selectedSign.mnemonic && (
                    <p className="text-yellow-700 dark:text-yellow-400">Tip: {selectedSign.mnemonic}</p>
                  )}
                  <div className="flex flex-wrap gap-2 pt-2">
                    <span className="px-2 py-0.5 bg-gray-100 dark:bg-white/10 rounded text-xs uppercase">{selectedSign.language}</span>
                    <span className="px-2 py-0.5 bg-gray-100 dark:bg-white/10 rounded text-xs capitalize">{selectedSign.category}</span>
                    <span className="px-2 py-0.5 bg-gray-100 dark:bg-white/10 rounded text-xs capitalize">{selectedSign.difficulty}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="sticky top-24 flex flex-col items-center justify-center p-8 bg-gray-50 dark:bg-white/[0.04] rounded-2xl border border-dashed border-gray-300 dark:border-white/10 text-center">
              <Search className="w-8 h-8 text-gray-400 mb-3" />
              <p className="text-gray-500">Select a sign to see the 3D demonstration</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
