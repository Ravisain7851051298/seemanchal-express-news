'use client';

import React from 'react';

/**
 * AdminDashboardSkeleton Component
 * 100% Pixel-Perfect Shimmering Skeleton of Seemanchal Express Admin Dashboard
 * Replicates the exact geometry, containers, curves, progress bars, and layout
 * without any text or real data.
 */
export default function AdminDashboardSkeleton() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row font-sans select-none overflow-hidden animate-fade-in">
      {/* 1. Mobile Header Skeleton */}
      <div className="md:hidden bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between sticky top-0 z-40">
        <div className="h-10 w-28 bg-white/90 rounded-md p-1 shadow-sm flex items-center justify-center">
          <div className="h-6 w-20 bg-slate-200 rounded animate-pulse" />
        </div>
        <div className="h-9 w-9 bg-slate-800 rounded-lg animate-pulse" />
      </div>

      {/* 2. Left Admin Sidebar Skeleton */}
      <aside className="hidden md:flex flex-col justify-between w-72 bg-slate-900 border-r border-slate-800 p-5 shrink-0 min-h-screen">
        <div className="space-y-5">
          {/* Brand Logo Box Skeleton */}
          <div className="pb-4 border-b border-slate-800">
            <div className="w-full h-20 bg-white/95 rounded-lg p-2 shadow-sm flex items-center justify-center">
              <div className="h-8 w-36 bg-slate-200/90 rounded animate-pulse" />
            </div>
          </div>

          {/* Admin Identity Badge Skeleton */}
          <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700/60 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-600/20 border border-red-500/40 flex items-center justify-center shrink-0 animate-pulse">
              <div className="w-5 h-5 rounded-sm bg-red-500/50" />
            </div>
            <div className="flex-1 space-y-1.5 overflow-hidden">
              <div className="h-3 w-28 bg-slate-700 rounded animate-pulse" />
              <div className="h-2 w-20 bg-red-400/60 rounded animate-pulse" />
              <div className="h-2 w-36 bg-slate-700/60 rounded animate-pulse" />
            </div>
          </div>

          {/* Sidebar Navigation Items Skeleton (14 Exact Items) */}
          <nav className="space-y-1">
            {/* 1. Dashboard Analytics (Active Item) */}
            <div className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-red-600 text-white shadow-md">
              <div className="flex items-center gap-2.5">
                <div className="w-4 h-4 rounded bg-white/60 animate-pulse" />
                <div className="h-3 w-32 bg-white/80 rounded animate-pulse" />
              </div>
              <div className="h-4 w-12 rounded bg-red-800/80 animate-pulse" />
            </div>

            {/* 2. Application Reviews */}
            <div className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-300">
              <div className="w-4 h-4 rounded bg-slate-700 animate-pulse" />
              <div className="h-3 w-32 bg-slate-700/70 rounded animate-pulse" />
            </div>

            {/* 3. Reporter Management */}
            <div className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-300">
              <div className="w-4 h-4 rounded bg-slate-700 animate-pulse" />
              <div className="h-3 w-36 bg-slate-700/70 rounded animate-pulse" />
            </div>

            {/* 4. Membership Control */}
            <div className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-300">
              <div className="w-4 h-4 rounded bg-slate-700 animate-pulse" />
              <div className="h-3 w-32 bg-slate-700/70 rounded animate-pulse" />
            </div>

            {/* 5. Grievances & Complaints */}
            <div className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-300">
              <div className="w-4 h-4 rounded bg-slate-700 animate-pulse" />
              <div className="h-3 w-36 bg-slate-700/70 rounded animate-pulse" />
            </div>

            {/* 6. Legal Documents (with badge) */}
            <div className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-slate-300">
              <div className="flex items-center gap-2.5">
                <div className="w-4 h-4 rounded bg-slate-700 animate-pulse" />
                <div className="h-3 w-28 bg-slate-700/70 rounded animate-pulse" />
              </div>
              <div className="h-4 w-6 rounded-full bg-slate-800 animate-pulse" />
            </div>

            {/* 7. Editorial & Submissions (with badge) */}
            <div className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-slate-300">
              <div className="flex items-center gap-2.5">
                <div className="w-4 h-4 rounded bg-slate-700 animate-pulse" />
                <div className="h-3 w-36 bg-slate-700/70 rounded animate-pulse" />
              </div>
              <div className="h-4 w-6 rounded-full bg-slate-800 animate-pulse" />
            </div>

            {/* 8. Team & Public Directory (with badge) */}
            <div className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-slate-300">
              <div className="flex items-center gap-2.5">
                <div className="w-4 h-4 rounded bg-slate-700 animate-pulse" />
                <div className="h-3 w-36 bg-slate-700/70 rounded animate-pulse" />
              </div>
              <div className="h-4 w-5 rounded-full bg-slate-800 animate-pulse" />
            </div>

            {/* 9. News Categories */}
            <div className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-300">
              <div className="w-4 h-4 rounded bg-slate-700 animate-pulse" />
              <div className="h-3 w-28 bg-slate-700/70 rounded animate-pulse" />
            </div>

            {/* 10. Committee Positions */}
            <div className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-300">
              <div className="w-4 h-4 rounded bg-slate-700 animate-pulse" />
              <div className="h-3 w-32 bg-slate-700/70 rounded animate-pulse" />
            </div>

            {/* 11. Public Inquiries (with badge) */}
            <div className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-slate-300">
              <div className="flex items-center gap-2.5">
                <div className="w-4 h-4 rounded bg-slate-700 animate-pulse" />
                <div className="h-3 w-24 bg-slate-700/70 rounded animate-pulse" />
              </div>
              <div className="h-4 w-5 rounded-full bg-slate-800 animate-pulse" />
            </div>

            {/* 12. Activity Audit Logs */}
            <div className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-300">
              <div className="w-4 h-4 rounded bg-sky-500/50 animate-pulse" />
              <div className="h-3 w-32 bg-slate-700/70 rounded animate-pulse" />
            </div>

            {/* 13. Seal, Signature & Settings */}
            <div className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-300">
              <div className="w-4 h-4 rounded bg-amber-500/50 animate-pulse" />
              <div className="h-3 w-36 bg-slate-700/70 rounded animate-pulse" />
            </div>

            {/* 14. Admin Security */}
            <div className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-300">
              <div className="w-4 h-4 rounded bg-slate-700 animate-pulse" />
              <div className="h-3 w-24 bg-slate-700/70 rounded animate-pulse" />
            </div>
          </nav>
        </div>

        {/* Sidebar Bottom Actions */}
        <div className="pt-4 border-t border-slate-800 space-y-2">
          <div className="flex items-center gap-2 px-3 py-1.5 text-slate-400">
            <div className="w-3.5 h-3.5 rounded bg-slate-700 animate-pulse" />
            <div className="h-3 w-28 bg-slate-700/60 rounded animate-pulse" />
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 text-slate-400">
            <div className="w-3.5 h-3.5 rounded bg-red-500/50 animate-pulse" />
            <div className="h-3 w-16 bg-red-400/50 rounded animate-pulse" />
          </div>
        </div>
      </aside>

      {/* 3. Main Dashboard Body Skeleton */}
      <main className="flex-1 p-1 sm:p-2 lg:p-3 space-y-3 overflow-y-auto min-w-0">
        {/* Top Eyebrow & Title + Action Buttons */}
        <div className="flex flex-col justify-between gap-3 pb-2 border-b border-slate-800">
          <div className="space-y-1">
            <div className="h-2.5 w-36 bg-red-900/60 rounded animate-pulse" />
            <div className="h-6 sm:h-7 w-80 sm:w-96 lg:w-3/5 max-w-full bg-slate-800 rounded-lg animate-pulse" />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Analytics Graphs Pill */}
            <div className="h-8 px-3 rounded-lg bg-sky-950/80 border border-sky-800/80 flex items-center gap-1.5 shadow-sm">
              <div className="w-3.5 h-3.5 rounded bg-sky-400/70 animate-pulse" />
              <div className="h-3 w-24 bg-sky-300/60 rounded animate-pulse" />
            </div>

            {/* Publish News Article Pill */}
            <div className="h-8 px-3 rounded-lg bg-red-600/90 shadow-md flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 rounded-full bg-white/70 animate-pulse" />
              <div className="h-3 w-28 bg-white/80 rounded animate-pulse" />
            </div>

            {/* Add Category Pill */}
            <div className="h-8 px-3 rounded-lg bg-slate-800 border border-slate-700 flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 rounded bg-slate-400/60 animate-pulse" />
              <div className="h-3 w-20 bg-slate-300/60 rounded animate-pulse" />
            </div>

            {/* Refresh Pill */}
            <div className="h-8 w-8 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center">
              <div className="w-3.5 h-3.5 rounded-full border border-slate-500 animate-spin" />
            </div>
          </div>
        </div>

        {/* 6 Top Metric Cards Row (Row 1) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-2">
          {/* 1. Reporters */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-center shadow-sm flex flex-col items-center justify-center space-y-1">
            <div className="h-2 w-14 bg-slate-700/60 rounded animate-pulse" />
            <div className="h-6 w-6 bg-amber-400/60 rounded animate-pulse" />
            <div className="h-2 w-16 bg-slate-700/50 rounded animate-pulse" />
          </div>

          {/* 2. Members */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-center shadow-sm flex flex-col items-center justify-center space-y-1">
            <div className="h-2 w-14 bg-slate-700/60 rounded animate-pulse" />
            <div className="h-6 w-6 bg-slate-200/60 rounded animate-pulse" />
            <div className="h-2 w-16 bg-slate-700/50 rounded animate-pulse" />
          </div>

          {/* 3. Grievances */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-center shadow-sm flex flex-col items-center justify-center space-y-1">
            <div className="h-2 w-14 bg-red-400/60 rounded animate-pulse" />
            <div className="h-6 w-6 bg-red-400/60 rounded animate-pulse" />
            <div className="h-2 w-16 bg-slate-700/50 rounded animate-pulse" />
          </div>

          {/* 4. Legal Policies */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-center shadow-sm flex flex-col items-center justify-center space-y-1">
            <div className="h-2 w-16 bg-purple-400/60 rounded animate-pulse" />
            <div className="h-6 w-8 bg-purple-300/60 rounded animate-pulse" />
            <div className="h-2 w-14 bg-slate-700/50 rounded animate-pulse" />
          </div>

          {/* 5. Published News */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-center shadow-sm flex flex-col items-center justify-center space-y-1">
            <div className="h-2 w-18 bg-slate-700/60 rounded animate-pulse" />
            <div className="h-6 w-8 bg-red-500/60 rounded animate-pulse" />
            <div className="h-2 w-16 bg-slate-700/50 rounded animate-pulse" />
          </div>

          {/* 6. Readership */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-center shadow-sm flex flex-col items-center justify-center space-y-1">
            <div className="h-2 w-14 bg-slate-700/60 rounded animate-pulse" />
            <div className="h-6 w-12 bg-sky-400/60 rounded animate-pulse" />
            <div className="h-2 w-12 bg-sky-400/50 rounded animate-pulse" />
          </div>
        </div>

        {/* 4 KPI Metric Cards (Row 2) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          {/* Card 1: TOTAL READERSHIP */}
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden space-y-2">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="h-2.5 w-24 bg-slate-700/60 rounded animate-pulse" />
                <div className="h-7 w-20 bg-slate-200/70 rounded animate-pulse" />
              </div>
              <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center">
                <div className="w-4 h-4 rounded-full bg-sky-400/60 animate-pulse" />
              </div>
            </div>
            <div className="pt-1.5 border-t border-slate-800/60 flex items-center justify-between">
              <div className="h-2 w-20 bg-sky-400/50 rounded animate-pulse" />
              <div className="h-2 w-14 bg-slate-700/60 rounded animate-pulse" />
            </div>
          </div>

          {/* Card 2: EDITORIAL PIPELINE */}
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden space-y-2">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="h-2.5 w-24 bg-slate-700/60 rounded animate-pulse" />
                <div className="h-7 w-18 bg-amber-400/70 rounded animate-pulse" />
              </div>
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                <div className="w-4 h-4 rounded bg-amber-400/60 animate-pulse" />
              </div>
            </div>
            <div className="pt-1.5 border-t border-slate-800/60 flex items-center justify-between">
              <div className="h-2 w-14 bg-amber-300/50 rounded animate-pulse" />
              <div className="h-2 w-16 bg-rose-400/50 rounded animate-pulse" />
            </div>
          </div>

          {/* Card 3: ACCREDITED BUREAU */}
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden space-y-2">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="h-2.5 w-24 bg-slate-700/60 rounded animate-pulse" />
                <div className="h-7 w-18 bg-emerald-400/70 rounded animate-pulse" />
              </div>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                <div className="w-4 h-4 rounded bg-emerald-400/60 animate-pulse" />
              </div>
            </div>
            <div className="pt-1.5 border-t border-slate-800/60 flex items-center justify-between">
              <div className="h-2 w-16 bg-slate-700/60 rounded animate-pulse" />
              <div className="h-2 w-14 bg-amber-400/50 rounded animate-pulse" />
            </div>
          </div>

          {/* Card 4: GRIEVANCE SLA RATE */}
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden space-y-2">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="h-2.5 w-24 bg-slate-700/60 rounded animate-pulse" />
                <div className="h-7 w-24 bg-purple-400/70 rounded animate-pulse" />
              </div>
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
                <div className="w-4 h-4 rounded-full bg-purple-400/60 animate-pulse" />
              </div>
            </div>
            <div className="pt-1.5 border-t border-slate-800/60 flex items-center justify-between">
              <div className="h-2 w-14 bg-emerald-400/50 rounded animate-pulse" />
              <div className="h-2 w-12 bg-red-400/50 rounded animate-pulse" />
            </div>
          </div>
        </div>

        {/* Middle Dual Graphs Row (Row 3) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
          {/* Left Chart (7 Columns): Editorial Velocity & Readership Curve */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="space-y-1">
                <div className="h-3.5 w-56 bg-slate-700/70 rounded animate-pulse" />
                <div className="h-2.5 w-72 max-w-full bg-slate-800 rounded animate-pulse" />
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-pulse" />
                  <div className="h-2.5 w-16 bg-slate-700/60 rounded animate-pulse" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                  <div className="h-2.5 w-20 bg-slate-700/60 rounded animate-pulse" />
                </div>
              </div>
            </div>

            {/* Shimmering Vector Graph Simulation */}
            <div className="relative w-full bg-slate-950/70 rounded-xl p-3 border border-slate-800/80 overflow-hidden">
              <svg viewBox="0 0 600 220" className="w-full h-56 min-w-[500px]">
                <defs>
                  <linearGradient id="skelViewsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {/* Horizontal Grid lines */}
                {[30, 75, 120, 165, 190].map((y, idx) => (
                  <line
                    key={idx}
                    x1={40}
                    y1={y}
                    x2={560}
                    y2={y}
                    stroke="#1e293b"
                    strokeDasharray="3 3"
                    strokeWidth="1"
                  />
                ))}

                {/* Shimmering Cyan Area & Line */}
                <path
                  d="M 60 110 Q 150 160 260 170 T 540 120 L 540 190 L 60 190 Z"
                  fill="url(#skelViewsGradient)"
                  className="animate-pulse"
                />
                <path
                  d="M 60 110 Q 150 160 260 170 T 540 120"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  className="opacity-80"
                />

                {/* Shimmering Orange Stories Line */}
                <path
                  d="M 60 135 L 260 145 L 540 110"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className="opacity-80"
                />

                {/* Glowing Data Point Dots */}
                {[
                  { cx: 60, cy: 110, color: '#38bdf8' },
                  { cx: 60, cy: 135, color: '#f59e0b' },
                  { cx: 260, cy: 170, color: '#38bdf8' },
                  { cx: 260, cy: 145, color: '#f59e0b' },
                  { cx: 540, cy: 120, color: '#38bdf8' },
                  { cx: 540, cy: 110, color: '#f59e0b' },
                ].map((dot, i) => (
                  <circle
                    key={i}
                    cx={dot.cx}
                    cy={dot.cy}
                    r={4}
                    fill={dot.color}
                    stroke="#0f172a"
                    strokeWidth="1.5"
                    className="animate-pulse"
                  />
                ))}
              </svg>

              {/* X Axis Date labels placeholder */}
              <div className="flex justify-between px-10 pt-1 border-t border-slate-800/60">
                <div className="h-2 w-10 bg-slate-800 rounded animate-pulse" />
                <div className="h-2 w-10 bg-slate-800 rounded animate-pulse" />
                <div className="h-2 w-10 bg-slate-800 rounded animate-pulse" />
              </div>
            </div>
          </div>

          {/* Right Card (5 Columns): Category Coverage & Market Share */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="space-y-1">
                <div className="h-3.5 w-44 bg-slate-700/70 rounded animate-pulse" />
                <div className="h-2.5 w-52 max-w-full bg-slate-800 rounded animate-pulse" />
              </div>
              <div className="h-5 w-16 bg-amber-500/20 border border-amber-500/30 rounded animate-pulse" />
            </div>

            {/* 5 Shimmering Category Progress Rows */}
            <div className="space-y-3.5 pt-1">
              {[
                { width: 'w-[68%]', color: 'from-red-500 to-rose-600', dot: 'bg-red-500' },
                { width: 'w-[52%]', color: 'from-amber-500 to-yellow-600', dot: 'bg-amber-500' },
                { width: 'w-[42%]', color: 'from-sky-500 to-blue-600', dot: 'bg-sky-500' },
                { width: 'w-[30%]', color: 'from-emerald-500 to-teal-600', dot: 'bg-emerald-500' },
                { width: 'w-[18%]', color: 'from-purple-500 to-indigo-600', dot: 'bg-purple-500' },
              ].map((row, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${row.dot} animate-pulse`} />
                      <div className="h-3 w-24 bg-slate-700/60 rounded animate-pulse" />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-12 bg-slate-800 rounded animate-pulse" />
                      <div className="h-3.5 w-8 bg-slate-800 rounded animate-pulse" />
                    </div>
                  </div>
                  {/* Progress Bar Container */}
                  <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800/80">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${row.color} ${row.width} animate-pulse`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Row (Row 4): 3 Equal Analytic Panels */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* Panel 1: Editorial Moderation Pipeline */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm space-y-3">
            <div className="border-b border-slate-800 pb-2.5 flex items-center justify-between">
              <div className="h-3.5 w-48 bg-slate-700/70 rounded animate-pulse" />
              <div className="h-3 w-20 bg-slate-800 rounded animate-pulse" />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-1">
                <div className="h-2 w-16 bg-slate-700/60 rounded mx-auto animate-pulse" />
                <div className="h-6 w-8 bg-emerald-400/60 rounded mx-auto animate-pulse" />
                <div className="h-2 w-14 bg-slate-800 rounded mx-auto animate-pulse" />
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-1">
                <div className="h-2 w-16 bg-slate-700/60 rounded mx-auto animate-pulse" />
                <div className="h-6 w-8 bg-amber-400/60 rounded mx-auto animate-pulse" />
                <div className="h-2 w-14 bg-slate-800 rounded mx-auto animate-pulse" />
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-1">
                <div className="h-2 w-20 bg-slate-700/60 rounded mx-auto animate-pulse" />
                <div className="h-6 w-8 bg-rose-400/60 rounded mx-auto animate-pulse" />
                <div className="h-2 w-16 bg-slate-800 rounded mx-auto animate-pulse" />
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-1">
                <div className="h-2 w-20 bg-slate-700/60 rounded mx-auto animate-pulse" />
                <div className="h-6 w-8 bg-sky-400/60 rounded mx-auto animate-pulse" />
                <div className="h-2 w-16 bg-slate-800 rounded mx-auto animate-pulse" />
              </div>
            </div>
          </div>

          {/* Panel 2: Personnel & Cadre Retention */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm space-y-3">
            <div className="border-b border-slate-800 pb-2.5 flex items-center justify-between">
              <div className="h-3.5 w-44 bg-slate-700/70 rounded animate-pulse" />
              <div className="h-3 w-16 bg-slate-800 rounded animate-pulse" />
            </div>

            <div className="space-y-3.5">
              {/* Ratio Bar 1 */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="h-3 w-36 bg-slate-700/60 rounded animate-pulse" />
                  <div className="h-3 w-8 bg-emerald-400/60 rounded animate-pulse" />
                </div>
                <div className="w-full h-3 bg-slate-950 rounded-full flex overflow-hidden border border-slate-800">
                  <div className="w-[35%] bg-emerald-500/80 h-full animate-pulse" />
                  <div className="w-[10%] bg-rose-500/80 h-full animate-pulse" />
                  <div className="w-[15%] bg-amber-500/80 h-full animate-pulse" />
                </div>
                <div className="flex items-center justify-between pt-0.5">
                  <div className="h-2 w-12 bg-emerald-400/50 rounded animate-pulse" />
                  <div className="h-2 w-14 bg-rose-400/50 rounded animate-pulse" />
                  <div className="h-2 w-12 bg-amber-400/50 rounded animate-pulse" />
                </div>
              </div>

              {/* Ratio Bar 2 */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="h-3 w-36 bg-slate-700/60 rounded animate-pulse" />
                  <div className="h-3 w-8 bg-blue-400/60 rounded animate-pulse" />
                </div>
                <div className="w-full h-3 bg-slate-950 rounded-full flex overflow-hidden border border-slate-800">
                  <div className="w-[85%] bg-blue-500/80 h-full animate-pulse" />
                  <div className="w-[15%] bg-amber-500/80 h-full animate-pulse" />
                </div>
                <div className="flex items-center justify-between pt-0.5">
                  <div className="h-2 w-12 bg-blue-400/50 rounded animate-pulse" />
                  <div className="h-2 w-12 bg-amber-400/50 rounded animate-pulse" />
                  <div className="h-2 w-10 bg-slate-700/50 rounded animate-pulse" />
                </div>
              </div>
            </div>
          </div>

          {/* Panel 3: Grievance Redressal SLA Rate */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm space-y-3">
            <div className="border-b border-slate-800 pb-2.5 flex items-center justify-between">
              <div className="h-3.5 w-40 bg-slate-700/70 rounded animate-pulse" />
              <div className="h-3 w-16 bg-slate-800 rounded animate-pulse" />
            </div>

            <div className="flex items-center gap-4 pt-1">
              {/* Donut Ring Skeleton */}
              <div className="relative w-24 h-24 rounded-full border-4 border-slate-800 border-t-purple-500/80 border-r-purple-500/40 flex items-center justify-center shrink-0 animate-pulse">
                <div className="text-center space-y-1">
                  <div className="h-4 w-8 bg-purple-400/70 rounded mx-auto animate-pulse" />
                  <div className="h-2 w-10 bg-slate-700/60 rounded mx-auto animate-pulse" />
                </div>
              </div>

              {/* 4 Summary Rows */}
              <div className="flex-1 space-y-2">
                {[
                  { w: 'w-16', color: 'bg-slate-700/70' },
                  { w: 'w-14', color: 'bg-emerald-400/60' },
                  { w: 'w-20', color: 'bg-amber-400/60' },
                  { w: 'w-18', color: 'bg-red-400/60' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className={`h-2.5 ${item.w} ${item.color} rounded animate-pulse`} />
                    <div className="h-2.5 w-4 bg-slate-800 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
