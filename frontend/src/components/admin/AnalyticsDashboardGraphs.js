'use client';

import React, { useState } from 'react';
import {
  TrendingUp,
  PieChart,
  Eye,
  Newspaper,
  Users,
  AlertTriangle,
  CheckCircle,
  ShieldCheck,
  Activity
} from 'lucide-react';

export default function AnalyticsDashboardGraphs({
  stats = {},
  newsList = [],
  categories = [],
}) {
  const [activeView, setActiveView] = useState('overview'); // 'overview', 'editorial', 'readership', 'personnel'
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Compute metrics with safe fallbacks
  const totalNews = stats.totalNewsPublished || newsList.filter((n) => n.status === 'published').length || 1;
  const pendingNews = stats.pendingNewsReview ?? newsList.filter((n) => n.status === 'pending').length ?? 0;
  const rejectedNews = stats.rejectedNews ?? newsList.filter((n) => n.status === 'rejected').length ?? 0;
  const totalViews = stats.totalViews || newsList.reduce((acc, curr) => acc + (curr.views || 0), 0) || 0;
  const avgViewsPerNews = totalNews > 0 ? Math.round(totalViews / totalNews) : 0;

  const totalReporters = stats.totalReporters || 0;
  const activeReporters = stats.activeReporters ?? totalReporters;
  const suspendedReporters = stats.suspendedReporters || 0;
  const pendingReporters = stats.pendingReporters || 0;

  const totalMembers = stats.totalMembers || 0;
  const activeMembers = stats.activeMembers ?? totalMembers;
  const expiredMembers = stats.expiredMemberships || 0;
  const pendingMembers = stats.pendingMembers || 0;

  const totalComplaints = stats.totalComplaints || 0;
  const resolvedComplaints = stats.resolvedComplaints || 0;
  const underReviewComplaints = stats.complaintsUnderReview || 0;
  const pendingComplaints = stats.pendingComplaints || 0;
  const resolutionRate =
    totalComplaints > 0 ? Math.round((resolvedComplaints / totalComplaints) * 100) : 100;

  // 1. Process Publication & Views Trend Points for SVG Curve
  const rawTrends = (stats.publicationTrends && stats.publicationTrends.length > 0
    ? stats.publicationTrends
    : [
      { _id: 'Day 1', stories: 2, views: 120 },
      { _id: 'Day 2', stories: 4, views: 340 },
      { _id: 'Day 3', stories: 3, views: 280 },
      { _id: 'Day 4', stories: 6, views: 560 },
      { _id: 'Day 5', stories: 5, views: 490 },
      { _id: 'Day 6', stories: 8, views: 820 },
      { _id: 'Day 7', stories: 7, views: 950 },
    ]).map((t, idx) => ({
      ...t,
      _id: typeof t._id === 'string'
        ? t._id
        : (t._id && typeof t._id === 'object' && t._id.$dateToString)
        ? String(t._id.$dateToString)
        : t._id != null
        ? String(t._id)
        : `Day ${idx + 1}`
    }));

  const maxViewsInTrend = Math.max(...rawTrends.map((t) => t.views || 0), 100);
  const maxStoriesInTrend = Math.max(...rawTrends.map((t) => t.stories || 0), 5);

  // 2. Category Distribution computation
  let categoryDistribution = stats.categoryStats && stats.categoryStats.length > 0
    ? stats.categoryStats.map((c) => ({
      name: typeof c._id === 'object' && c._id !== null ? (c._id.name || JSON.stringify(c._id)) : (c._id || 'Unassigned'),
      count: c.count,
      views: c.views || 0,
    }))
    : categories.map((c) => {
      const count = newsList.filter(
        (n) =>
          n.categoryName === c.name ||
          n.category?._id === c._id ||
          n.category === c._id ||
          (Array.isArray(n.categories) && n.categories.some((cat) => (cat._id || cat) === c._id))
      ).length;
      const views = newsList
        .filter(
          (n) =>
            n.categoryName === c.name ||
            n.category?._id === c._id ||
            n.category === c._id ||
            (Array.isArray(n.categories) && n.categories.some((cat) => (cat._id || cat) === c._id))
        )
        .reduce((acc, curr) => acc + (curr.views || 0), 0);
      return { name: c.name, count, views };
    });

  // Sort by count descending
  categoryDistribution = categoryDistribution
    .filter((c) => c.count > 0 || categories.length <= 6)
    .sort((a, b) => b.count - a.count);

  const highestCatCount = Math.max(...categoryDistribution.map((c) => c.count), 1);

  // SVG Area Chart points calculation
  const svgWidth = 600;
  const svgHeight = 220;
  const paddingX = 40;
  const paddingY = 30;
  const chartW = svgWidth - paddingX * 2;
  const chartH = svgHeight - paddingY * 2;

  const points = rawTrends.map((item, idx) => {
    const x = paddingX + (idx / Math.max(rawTrends.length - 1, 1)) * chartW;
    const yViews = paddingY + chartH - ((item.views || 0) / maxViewsInTrend) * chartH;
    const yStories = paddingY + chartH - ((item.stories || 0) / maxStoriesInTrend) * chartH;
    return { x, yViews, yStories, ...item };
  });

  // Build SVG path strings
  const viewsPath = points.length > 0
    ? `M ${points[0].x} ${points[0].yViews} ` +
    points
      .slice(1)
      .map((p) => `L ${p.x} ${p.yViews}`)
      .join(' ')
    : '';

  const viewsAreaPath = points.length > 0
    ? `${viewsPath} L ${points[points.length - 1].x} ${svgHeight - paddingY} L ${points[0].x} ${svgHeight - paddingY
    } Z`
    : '';

  const storiesPath = points.length > 0
    ? `M ${points[0].x} ${points[0].yStories} ` +
    points
      .slice(1)
      .map((p) => `L ${p.x} ${p.yStories}`)
      .join(' ')
    : '';

  // Grievance categories
  const grievanceBreakdown = stats.complaintCategories && stats.complaintCategories.length > 0
    ? stats.complaintCategories
    : [
      { _id: 'Incorrect News / Fact Dispute', count: 4 },
      { _id: 'Reporter Misconduct', count: 2 },
      { _id: 'Copyright / Attribution', count: 1 },
      { _id: 'Content Removal / Privacy', count: 1 },
    ];

  return (
    <div className="space-y-2">
      {/* 2. Top Metric KPI Sparkline Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {/* Card 1: Readership */}
        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-sky-500/50 transition-all shadow-sm relative overflow-hidden group">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Total Readership
              </span>
              <strong className="text-xl sm:text-2xl font-black text-white mt-0.5 block">
                {totalViews.toLocaleString()}
              </strong>
            </div>
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/30 flex items-center justify-center shrink-0">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 pt-1.5 border-t border-slate-800/60">
            <span className="flex items-center gap-1 text-sky-400 font-semibold">
              <Activity className="w-3 h-3" /> ~{avgViewsPerNews} views/story
            </span>
            <span className="font-mono text-slate-500">{totalNews} Stories</span>
          </div>
        </div>

        {/* Card 2: Editorial Pipeline */}
        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 transition-all shadow-sm relative overflow-hidden group">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Editorial Pipeline
              </span>
              <strong className="text-xl sm:text-2xl font-black text-amber-400 mt-0.5 block">
                {totalNews} Live
              </strong>
            </div>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
              <Newspaper className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 pt-1.5 border-t border-slate-800/60">
            <span className="text-amber-300 font-semibold">
              {pendingNews} In Review
            </span>
            <span className="text-rose-400 font-semibold">
              {rejectedNews} Corrections
            </span>
          </div>
        </div>

        {/* Card 3: Active Bureau */}
        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 transition-all shadow-sm relative overflow-hidden group">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Accredited Bureau
              </span>
              <strong className="text-xl sm:text-2xl font-black text-emerald-400 mt-0.5 block">
                {activeReporters} Active
              </strong>
            </div>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 pt-1.5 border-t border-slate-800/60">
            <span className="text-slate-400">
              {totalReporters} Journalists
            </span>
            <span className="text-amber-400 font-semibold font-mono">
              {pendingReporters} Pending
            </span>
          </div>
        </div>

        {/* Card 4: Grievance Redressal SLA */}
        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-purple-500/50 transition-all shadow-sm relative overflow-hidden group">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Grievance SLA Rate
              </span>
              <strong className="text-xl sm:text-2xl font-black text-purple-400 mt-0.5 block">
                {resolutionRate}% Resolved
              </strong>
            </div>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/30 flex items-center justify-center shrink-0">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 pt-1.5 border-t border-slate-800/60">
            <span className="text-emerald-400 font-semibold">
              {resolvedComplaints} Closed
            </span>
            <span className="text-red-400 font-semibold font-mono">
              {pendingComplaints} Open
            </span>
          </div>
        </div>
      </div>

      {/* 3. Main Dual Graphs Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* GRAPH 1: Interactive Readership & Publication Velocity Curve (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-sky-400" />
                <span>Editorial Velocity & Readership Curve</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                हाल के दिनों में प्रकाशित खबरों (Orange Line) एवं पाठक व्यूज़ (Cyan Area) का ग्राफ़
              </p>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-semibold">
              <span className="flex items-center gap-1.5 text-sky-400">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400"></span>
                <span>Page Views</span>
              </span>
              <span className="flex items-center gap-1.5 text-amber-400">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                <span>Stories Published</span>
              </span>
            </div>
          </div>

          {/* SVG Vector Area & Line Graph */}
          <div className="relative w-full bg-slate-950/70 rounded-xl p-3 border border-slate-800/80 overflow-x-auto">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-56 min-w-[500px]"
            >
              <defs>
                <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="storiesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
                const y = paddingY + chartH * pct;
                return (
                  <g key={idx}>
                    <line
                      x1={paddingX}
                      y1={y}
                      x2={svgWidth - paddingX}
                      y2={y}
                      stroke="#334155"
                      strokeDasharray="3 3"
                      strokeWidth="0.8"
                    />
                    <text
                      x={paddingX - 6}
                      y={y + 3}
                      fill="#64748b"
                      fontSize="9"
                      textAnchor="end"
                      fontFamily="monospace"
                    >
                      {Math.round(maxViewsInTrend * (1 - pct))}
                    </text>
                  </g>
                );
              })}

              {/* Views Area & Line */}
              {viewsAreaPath && (
                <path d={viewsAreaPath} fill="url(#viewsGradient)" />
              )}
              {viewsPath && (
                <path
                  d={viewsPath}
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Stories Published Line */}
              {storiesPath && (
                <path
                  d={storiesPath}
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Data Point Dots & Interactivity */}
              {points.map((pt, i) => (
                <g key={i}>
                  {/* Views Dot */}
                  <circle
                    cx={pt.x}
                    cy={pt.yViews}
                    r={hoveredPoint?.idx === i && hoveredPoint?.type === 'views' ? 6 : 4}
                    fill="#38bdf8"
                    stroke="#0f172a"
                    strokeWidth="2"
                    className="cursor-pointer transition-all duration-200"
                    onMouseEnter={() => setHoveredPoint({ idx: i, type: 'views', data: pt })}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                  {/* Stories Dot */}
                  <circle
                    cx={pt.x}
                    cy={pt.yStories}
                    r={hoveredPoint?.idx === i && hoveredPoint?.type === 'stories' ? 6 : 3.5}
                    fill="#f59e0b"
                    stroke="#0f172a"
                    strokeWidth="1.5"
                    className="cursor-pointer transition-all duration-200"
                    onMouseEnter={() => setHoveredPoint({ idx: i, type: 'stories', data: pt })}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                  {/* X Axis Labels */}
                  <text
                    x={pt.x}
                    y={svgHeight - 10}
                    fill="#94a3b8"
                    fontSize="9.5"
                    fontWeight="600"
                    textAnchor="middle"
                  >
                    {typeof pt._id === 'string'
                      ? (pt._id.length >= 5 ? pt._id.slice(-5) : pt._id)
                      : pt._id != null
                      ? String(pt._id)
                      : `D${i + 1}`}
                  </text>
                </g>
              ))}
            </svg>

            {/* Hover Tooltip Overlay */}
            {hoveredPoint && (
              <div className="absolute top-4 right-4 bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-lg text-xs shadow-xl animate-fade-in pointer-events-none">
                <span className="font-bold text-white block">
                  Date: {typeof hoveredPoint.data._id === 'object' && hoveredPoint.data._id !== null
                    ? JSON.stringify(hoveredPoint.data._id)
                    : String(hoveredPoint.data._id || `Day ${hoveredPoint.idx + 1}`)}
                </span>
                <span className="text-sky-400 font-semibold block">
                  Reads: {hoveredPoint.data.views || 0} views
                </span>
                <span className="text-amber-400 font-semibold block">
                  Stories: {hoveredPoint.data.stories || 0} published
                </span>
              </div>
            )}
          </div>
        </div>

        {/* GRAPH 2: Category Distribution Breakdown (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <PieChart className="w-4 h-4 text-amber-400" />
                <span>Category Coverage & Market Share</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                विभिन्न समाचार श्रेणियों (Beats) में रिपोर्टों का सटीक प्रतिशत
              </p>
            </div>
            <span className="text-[11px] font-mono text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              {categoryDistribution.length} Beats
            </span>
          </div>

          {/* Progress Bars for Categories */}
          <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
            {categoryDistribution.map((cat, idx) => {
              const pct = Math.round((cat.count / Math.max(totalNews, 1)) * 100);
              const barWidth = Math.round((cat.count / highestCatCount) * 100);

              const colorPalettes = [
                'from-red-500 to-rose-600',
                'from-amber-500 to-yellow-600',
                'from-sky-500 to-blue-600',
                'from-emerald-500 to-teal-600',
                'from-purple-500 to-indigo-600',
                'from-pink-500 to-rose-500',
              ];
              const gradient = colorPalettes[idx % colorPalettes.length];

              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-200 flex items-center gap-1.5 truncate max-w-[160px]">
                      <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${gradient}`}></span>
                      <span>{cat.name}</span>
                    </span>
                    <div className="flex items-center gap-2 text-[11px]">
                      <span className="text-slate-400 font-mono">
                        {cat.count} {cat.count === 1 ? 'story' : 'stories'}
                      </span>
                      <span className="font-bold text-white bg-slate-800 px-1.5 py-0.5 rounded font-mono">
                        {pct}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800/80">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${gradient} transition-all duration-700`}
                      style={{ width: `${Math.max(barWidth, 4)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. Secondary Analytical Row: Editorial Pipeline & Personnel SLA */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* Panel 1: Editorial Moderation Pipeline */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm space-y-3">
          <div className="border-b border-slate-800 pb-2.5 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Editorial Moderation Pipeline</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Moderation Queue</span>
          </div>

          <div className="grid grid-cols-2 gap-2.5 text-xs">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <span className="text-[11px] text-slate-400 block">Published Live</span>
              <strong className="text-xl font-bold text-emerald-400 block mt-0.5">
                {totalNews}
              </strong>
              <span className="text-[10px] text-slate-500">Live on Portal</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <span className="text-[11px] text-slate-400 block">Under Review</span>
              <strong className="text-xl font-bold text-amber-400 block mt-0.5">
                {pendingNews}
              </strong>
              <span className="text-[10px] text-slate-500">Awaiting Approval</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <span className="text-[11px] text-slate-400 block">Rejected / Corrections</span>
              <strong className="text-xl font-bold text-rose-400 block mt-0.5">
                {rejectedNews}
              </strong>
              <span className="text-[10px] text-slate-500">Returned to Author</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <span className="text-[11px] text-slate-400 block">Breaking / Top Hits</span>
              <strong className="text-xl font-bold text-sky-400 block mt-0.5">
                {(stats.breakingNewsCount || 0) + (stats.featuredNewsCount || 0)}
              </strong>
              <span className="text-[10px] text-slate-500">Hero Highlights</span>
            </div>
          </div>
        </div>

        {/* Panel 2: Personnel & Organizational Retention */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm space-y-3">
          <div className="border-b border-slate-800 pb-2.5 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-400" />
              <span>Personnel & Cadre Retention</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Accreditation</span>
          </div>

          <div className="space-y-3.5 text-xs">
            {/* Reporters Bar */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-slate-300">Journalist Bureau Active Ratio</span>
                <span className="font-mono text-emerald-400 font-bold">
                  {totalReporters > 0 ? Math.round((activeReporters / totalReporters) * 100) : 100}%
                </span>
              </div>
              <div className="w-full h-3 bg-slate-950 rounded-full flex overflow-hidden border border-slate-800">
                <div
                  style={{ width: `${totalReporters > 0 ? (activeReporters / totalReporters) * 100 : 100}%` }}
                  className="bg-emerald-500 h-full"
                  title="Active Reporters"
                ></div>
                <div
                  style={{ width: `${totalReporters > 0 ? (suspendedReporters / totalReporters) * 100 : 0}%` }}
                  className="bg-rose-500 h-full"
                  title="Suspended"
                ></div>
                <div
                  style={{ width: `${totalReporters > 0 ? (pendingReporters / totalReporters) * 100 : 0}%` }}
                  className="bg-amber-500 h-full"
                  title="Pending Applicants"
                ></div>
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                <span className="text-emerald-400">{activeReporters} Active</span>
                <span className="text-rose-400">{suspendedReporters} Suspended</span>
                <span className="text-amber-400">{pendingReporters} Pending</span>
              </div>
            </div>

            {/* Members Bar */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-slate-300">Membership Active Ratio</span>
                <span className="font-mono text-blue-400 font-bold">
                  {totalMembers > 0 ? Math.round((activeMembers / totalMembers) * 100) : 100}%
                </span>
              </div>
              <div className="w-full h-3 bg-slate-950 rounded-full flex overflow-hidden border border-slate-800">
                <div
                  style={{ width: `${totalMembers > 0 ? (activeMembers / totalMembers) * 100 : 100}%` }}
                  className="bg-blue-500 h-full"
                  title="Active Members"
                ></div>
                <div
                  style={{ width: `${totalMembers > 0 ? (expiredMembers / totalMembers) * 100 : 0}%` }}
                  className="bg-amber-500 h-full"
                  title="Expired"
                ></div>
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                <span className="text-blue-400">{activeMembers} Active</span>
                <span className="text-amber-400">{expiredMembers} Expired</span>
                <span className="text-slate-400">{totalMembers} Total</span>
              </div>
            </div>
          </div>
        </div>

        {/* Panel 3: Grievance Redressal SLA Performance */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm space-y-3">
          <div className="border-b border-slate-800 pb-2.5 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-purple-400" />
              <span>Grievance Redressal SLA Rate</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">IT Rules 2021</span>
          </div>

          <div className="flex items-center gap-5">
            {/* SVG Circular Donut Ring */}
            <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
              <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-purple-500"
                  strokeDasharray={`${resolutionRate}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-lg font-black text-white">{resolutionRate}%</span>
                <span className="text-[9px] uppercase font-bold text-slate-400">Solved</span>
              </div>
            </div>

            <div className="space-y-1.5 flex-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Total Filed:</span>
                <span className="font-bold text-white font-mono">{totalComplaints}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-emerald-400 font-medium">Resolved:</span>
                <span className="font-bold text-emerald-400 font-mono">{resolvedComplaints}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-amber-400 font-medium">Under Review:</span>
                <span className="font-bold text-amber-400 font-mono">{underReviewComplaints}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-red-400 font-medium">Open Pending:</span>
                <span className="font-bold text-red-400 font-mono">{pendingComplaints}</span>
              </div>
            </div>
          </div>

          {/* Grievance Categories List */}
          {grievanceBreakdown.length > 0 && (
            <div className="pt-2 border-t border-slate-800/80 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Top Complaint Categories</span>
              <div className="flex flex-wrap gap-1">
                {grievanceBreakdown.slice(0, 3).map((g, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300 font-mono"
                  >
                    {typeof g._id === 'object' && g._id !== null ? JSON.stringify(g._id) : (g._id || 'General')}: {g.count}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

