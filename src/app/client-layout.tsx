'use client';

import { useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useProgressStore } from '@/lib/storage/progress-store';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const hydrate = useProgressStore(s => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
