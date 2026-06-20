'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Hand, Search, Trophy, Menu, X, Languages, MessagesSquare } from 'lucide-react';
import { useState } from 'react';

const navLinks = [
  { href: '/learn', label: 'Learn', icon: BookOpen },
  { href: '/practice', label: 'Practice', icon: Hand },
  { href: '/translate', label: 'Translate', icon: Languages },
  { href: '/conversation', label: 'Talk', icon: MessagesSquare },
  { href: '/dictionary', label: 'Dictionary', icon: Search },
  { href: '/progress', label: 'Progress', icon: Trophy },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-[44px] z-30 bg-white/80 dark:bg-[#0a0a0a]/90 backdrop-blur-lg border-b border-gray-200 dark:border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5 font-bold text-xl">
            <span className="text-2xl" role="img" aria-label="Sign language">🤟</span>
            <span className="text-[#1dda63]">
              SignBridge
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, label, icon: Icon }) => {
              const isActive = pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[#1dda63]/10 text-[#1dda63]'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/[0.06]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              );
            })}
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/[0.06]"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-white/10 bg-white dark:bg-[#0a0a0a] pb-4">
          {navLinks.map(({ href, label, icon: Icon }) => {
            const isActive = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 mx-4 mt-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#1dda63]/10 text-[#1dda63]'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/[0.06]'
                }`}
              >
                <Icon className="w-5 h-5" />
                {label}
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}
