'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { CocoonBar } from '@/components/layout/CocoonBar';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { useProgressStore } from '@/lib/storage/progress-store';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const hydrate = useProgressStore(s => s.hydrate);
  const pathname = usePathname();
  // Homepage is the public landing; every tool page runs inside the dashboard shell.
  const isLanding = pathname === '/';

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <>
      {/* App-wide ambient green glow (subtle; pages can layer their own on top) */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 left-1/4 w-[40rem] h-[40rem] bg-[#1dda63]/[0.06] rounded-full blur-[140px]" />
        <div className="absolute top-1/3 -right-24 w-[30rem] h-[30rem] bg-[#1dda63]/[0.045] rounded-full blur-[130px]" />
      </div>
      <CocoonBar />
      {isLanding ? (
        <>
          <Navbar />
          <main className="relative flex-1">{children}</main>
          <Footer />
        </>
      ) : (
        <DashboardShell>{children}</DashboardShell>
      )}
    </>
  );
}
