'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';

export default function PublicShell({ children }) {
  const pathname = usePathname();
  const isDashboardRoute =
    pathname.startsWith('/admin') ||
    pathname.startsWith('/reporter') ||
    pathname.startsWith('/member');

  if (isDashboardRoute) {
    return <main className="min-h-screen bg-slate-900">{children}</main>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased selection:bg-red-600 selection:text-white">
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
}

