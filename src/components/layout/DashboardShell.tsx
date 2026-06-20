'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home, BookOpen, Hand, Languages, MessagesSquare, Search, HandMetal, Mail,
} from 'lucide-react';

const items = [
  { href: '/progress', label: 'Dashboard', icon: Home },
  { href: '/learn', label: 'Learn', icon: BookOpen },
  { href: '/practice', label: 'Practice', icon: Hand },
  { href: '/translate', label: 'Translate', icon: Languages },
  { href: '/conversation', label: 'Talk', icon: MessagesSquare },
  { href: '/dictionary', label: 'Dictionary', icon: Search },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <div className="flex flex-1">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-60 shrink-0 border-r border-white/10 bg-black/30 sticky top-[44px] self-start h-[calc(100vh-44px)] p-4">
        <Link href="/progress" className="flex items-center gap-2.5 px-2 py-2 mb-5">
          <div className="w-9 h-9 rounded-xl bg-[#1dda63] flex items-center justify-center text-[#072012] shadow-lg shadow-[#1dda63]/25">
            <HandMetal className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg text-white">SignBridge</span>
        </Link>

        <nav className="flex flex-col gap-1">
          {items.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive(href)
                  ? 'bg-[#1dda63]/15 text-[#1dda63]'
                  : 'text-gray-400 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto pt-4 border-t border-white/10">
          <a
            href="mailto:ammar@mycocoon.life?subject=SignBridge%20%E2%80%94%20let%27s%20collaborate"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-[#1dda63] hover:bg-white/[0.06] transition-colors"
          >
            <Mail className="w-5 h-5 shrink-0" />
            Get in touch
          </a>
          <p className="px-3 mt-2 text-[11px] leading-relaxed text-gray-600">
            An experiment by Cocoon. Free &amp; open-source.
          </p>
        </div>
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
