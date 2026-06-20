'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BookOpen, Hand, Languages, MessagesSquare, Search, Trophy, HandMetal,
} from 'lucide-react';

const items = [
  { href: '/learn', label: 'Learn', icon: BookOpen },
  { href: '/practice', label: 'Practice', icon: Hand },
  { href: '/translate', label: 'Translate', icon: Languages },
  { href: '/conversation', label: 'Talk', icon: MessagesSquare },
  { href: '/dictionary', label: 'Dictionary', icon: Search },
  { href: '/progress', label: 'Progress', icon: Trophy },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <div className="flex flex-1">
      {/* Desktop sidebar rail */}
      <aside className="hidden md:flex flex-col items-center gap-1.5 w-[84px] shrink-0 border-r border-white/10 bg-black/30 py-5 sticky top-[44px] self-start h-[calc(100vh-44px)]">
        <Link
          href="/"
          title="SignBridge home"
          className="w-11 h-11 rounded-2xl bg-[#1dda63] flex items-center justify-center text-[#072012] mb-4 shadow-lg shadow-[#1dda63]/25"
        >
          <HandMetal className="w-6 h-6" />
        </Link>
        {items.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            title={label}
            className={`group relative w-11 h-11 rounded-2xl flex items-center justify-center transition-colors ${
              isActive(href)
                ? 'bg-[#1dda63]/15 text-[#1dda63]'
                : 'text-gray-500 hover:text-white hover:bg-white/[0.06]'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="pointer-events-none absolute left-full ml-3 px-2.5 py-1 rounded-lg bg-black/90 border border-white/10 text-white text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50">
              {label}
            </span>
          </Link>
        ))}
      </aside>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Mobile tab bar */}
        <div className="md:hidden sticky top-[44px] z-30 bg-[#070707]/90 backdrop-blur border-b border-white/10 overflow-x-auto">
          <div className="flex gap-1 px-3 py-2 min-w-max">
            {items.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                  isActive(href) ? 'bg-[#1dda63]/15 text-[#1dda63]' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" /> {label}
              </Link>
            ))}
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
