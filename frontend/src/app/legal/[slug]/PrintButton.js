'use client';

import React from 'react';
import { Printer } from 'lucide-react';

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 text-xs font-semibold transition-all shadow-sm"
      title="Print or export document as PDF"
    >
      <Printer className="w-3.5 h-3.5 text-slate-400" />
      <span>Print / PDF</span>
    </button>
  );
}

