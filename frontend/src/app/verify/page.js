'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Search } from 'lucide-react';

export default function VerifySearchPage() {
  const router = useRouter();
  const [cardId, setCardId] = useState('');

  const handleVerify = (e) => {
    e.preventDefault();
    if (cardId.trim()) {
      router.push(`/verify/${encodeURIComponent(cardId.trim())}`);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-16">
      <div className="max-w-xl mx-auto px-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <h1 className="text-2xl font-black text-slate-900 mb-2">
            Digital Identity Card Online Verification
          </h1>
          <p className="text-xs text-slate-500 mb-6">
            Enter the unique ID Card Number or credential identifier to authenticate official officers and reporters of Seemanchal Express.
          </p>

          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <input
                type="text"
                name="cardId"
                id="cardId"
                autoComplete="off"
                required
                placeholder="e.g. SE-MEM-2026-0001 or SE-REP-2026-0001"
                value={cardId}
                onChange={(e) => setCardId(e.target.value)}
                className="w-full px-4 py-3 text-center text-sm font-semibold tracking-wider uppercase bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow transition-colors"
            >
              <Search className="w-4 h-4" />
              Verify Credentials
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-left text-xs text-slate-500 space-y-2">
            <p className="font-semibold text-slate-700">Verification Advisory:</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>Scanning the QR code printed on physical or digital cards routes directly to this authenticated registry.</li>
              <li>Only credentials officially vetted and authorized by the central secretariat are verified.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
