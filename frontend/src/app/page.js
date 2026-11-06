'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  MapPin,
  Eye,
  TrendingUp,
  Share2,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  ShieldCheck,
  UserCheck,
  Newspaper,
  Flame,
  Award,
  Sparkles,
  ExternalLink,
  Video,
} from 'lucide-react';
import api from '../lib/api';
import getMediaUrl from '../lib/imageHelper';

export default function HomePage() {
  const [featuredNews, setFeaturedNews] = useState([]);
  const [trendingNews, setTrendingNews] = useState([]);
  // const [breakingNews, setBreakingNews] = useState([]);
  const [latestNews, setLatestNews] = useState([]);
  const [seemanchalNews, setSeemanchalNews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Auto-Changing Hero Banners (Top Highlights)
  const [heroIndex, setHeroIndex] = useState(0);
  const [isHeroHovered, setIsHeroHovered] = useState(false);

  // Auto-Changing Breaking News Banners
  // const [breakingIndex, setBreakingIndex] = useState(0);
  // const [isBreakingHovered, setIsBreakingHovered] = useState(false);

  // Top Trending Stories: Auto Move from top to bottom if > 3
  const [trendingOffset, setTrendingOffset] = useState(0);
  const [isTrendingHovered, setIsTrendingHovered] = useState(false);

  useEffect(() => {
    const fetchHomeNews = async () => {
      try {
        const [featRes, trendingRes, latestRes, seemanchalRes] = await Promise.allSettled([
          api.get('/news/featured'),
          api.get('/news/trending'),
          api.get('/news?limit=8'),
          api.get('/news?category=seemanchal-special&limit=4'),
        ]);

        if (featRes.status === 'fulfilled' && featRes.value.data.success) {
          setFeaturedNews(featRes.value.data.news || []);
        }
        if (trendingRes.status === 'fulfilled' && trendingRes.value.data.success) {
          setTrendingNews(trendingRes.value.data.news || []);
        }
        // if (breakingRes.status === 'fulfilled' && breakingRes.value.data.success) {
        //   setBreakingNews(breakingRes.value.data.news || []);
        // }
        if (latestRes.status === 'fulfilled' && latestRes.value.data.success) {
          setLatestNews(latestRes.value.data.news || []);
        }
        if (seemanchalRes.status === 'fulfilled' && seemanchalRes.value.data.success) {
          setSeemanchalNews(seemanchalRes.value.data.news || []);
        }
      } catch (err) {
        console.error('Home news load error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeNews();
  }, []);

  // Top Highlight Hero List (Uses featuredNews, fallback to latestNews)
  const heroList = featuredNews.length > 0 ? featuredNews : latestNews;
  const heroNews = heroList.length > 0 ? heroList[heroIndex % heroList.length] : null;

  // Hero auto-advance timer if multiple highlights exist
  useEffect(() => {
    if (heroList.length <= 1 || isHeroHovered) return;
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroList.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroList.length, isHeroHovered]);

  // Breaking banner auto-change if multiple breaking news exist
  // useEffect(() => {
  //   if (breakingNews.length <= 1 || isBreakingHovered) return;
  //   const interval = setInterval(() => {
  //     setBreakingIndex((prev) => (prev + 1) % breakingNews.length);
  //   }, 4500);
  //   return () => clearInterval(interval);
  // }, [breakingNews.length, isBreakingHovered]);

  // Top Trending: Auto move from top to bottom if > 3 stories
  useEffect(() => {
    if (trendingNews.length <= 3 || isTrendingHovered) return;
    const interval = setInterval(() => {
      setTrendingOffset((prev) => (prev + 1) % trendingNews.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [trendingNews.length, isTrendingHovered]);

  // const currentBreaking = breakingNews.length > 0 ? breakingNews[breakingIndex % breakingNews.length] : null;

  // Window of visible trending items (rotates smoothly from top to bottom)
  const totalTrending = trendingNews.length;
  const visibleTrending = [];
  if (totalTrending > 0) {
    const count = Math.min(totalTrending, 3);
    for (let i = 0; i < count; i++) {
      visibleTrending.push(trendingNews[(trendingOffset + i) % totalTrending]);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-8 py-2 sm:py-6">
      {/* 0. Breaking News Banner (Auto Changes if Multiple) */}
      {/* {currentBreaking && (
        <div
          onMouseEnter={() => setIsBreakingHovered(true)}
          onMouseLeave={() => setIsBreakingHovered(false)}
          className="mb-6 bg-gradient-to-r from-red-600 via-red-700 to-amber-600 rounded-xl p-3 sm:p-4 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border border-red-500/40 transition-all duration-300"
        >
          <div className="flex items-center gap-3 overflow-hidden flex-1">
            <div className="bg-white text-red-700 px-3 py-1 rounded-lg text-xs font-black uppercase flex items-center gap-1.5 shadow shrink-0">
              <Flame className="w-4 h-4 text-red-600 animate-pulse" />
              <span>Breaking Alert</span>
            </div>
            <Link
              href={`/news/${currentBreaking.slug}`}
              className="font-bold text-sm sm:text-base text-white hover:text-amber-200 transition-colors line-clamp-1"
            >
              {currentBreaking.title}
            </Link>
          </div>

          {breakingNews.length > 1 && (
            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              <span className="text-[11px] font-mono text-red-100 bg-red-900/60 px-2 py-0.5 rounded">
                {breakingIndex + 1}/{breakingNews.length}
              </span>
              <button
                type="button"
                onClick={() =>
                  setBreakingIndex((prev) => (prev - 1 + breakingNews.length) % breakingNews.length)
                }
                className="p-1 rounded bg-red-800/80 hover:bg-red-900 text-white transition-colors"
                title="Previous Breaking Banner"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() =>
                  setBreakingIndex((prev) => (prev + 1) % breakingNews.length)
                }
                className="p-1 rounded bg-red-800/80 hover:bg-red-900 text-white transition-colors"
                title="Next Breaking Banner"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )} */}

      {/* Google Source Preference Strip */}
      <div className="mb-6 rounded-xl border border-blue-200/80 bg-gradient-to-r from-blue-50/70 via-white to-red-50/40 p-3.5 sm:p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-all hover:shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white shadow-sm border border-slate-200 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
              <span>Google पर सीमांचल एक्सप्रेस को प्राथमिकता दें</span>
              <span className="text-[10px] font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full hidden sm:inline">
                Google News Preferred Source
              </span>
            </h3>
            <p className="text-[11px] text-slate-600 mt-0.5">
              सटीक, निष्पक्ष और विश्वसनीय ग्राउंड रिपोर्ट्स सबसे पहले अपने Google फ़ीड में पाने के लिए हमें प्राथमिकता दें।
            </p>
          </div>
        </div>

        <a
          href={`https://www.google.com/preferences/source?q=${process.env.NEXT_PUBLIC_WEB_DOMAIN || 'seemanchalexpress.in'}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold rounded-lg shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 shrink-0"
        >
          <span>प्राथमिकता दें</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* 1. Hero / Top Headline Grid */}
      <section className="mb-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Hero Card (8 Cols) - Auto Changes if multiple highlights */}
          <div className="lg:col-span-8">
            {heroNews ? (
              <div
                onMouseEnter={() => setIsHeroHovered(true)}
                onMouseLeave={() => setIsHeroHovered(false)}
                className="group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md border border-slate-200 transition-all flex flex-col h-full"
              >
                <div className="relative h-72 sm:h-96 w-full overflow-hidden bg-slate-900">
                  <img
                    key={heroNews._id || heroNews.slug}
                    src={getMediaUrl(heroNews.thumbnail, 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200&auto=format&fit=crop&q=80')}
                    alt={heroNews.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = '/logo.jpeg';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>

                  {/* Badges on Hero Image (Top Left) */}
                  <div className="absolute top-1 md:top-4 left-1 md:left-4 flex flex-wrap gap-1.5 md:gap-2 z-10 max-w-[70%]">
                    {Array.isArray(heroNews.categories) && heroNews.categories.length > 0 ? (
                      heroNews.categories.map((c, idx) => (
                        <span
                          key={c._id || idx}
                          className="bg-red-600 text-white text-[8px] md:text-xs font-bold px-2 md:px-3 py-[1px] md:py-1 rounded-full shadow uppercase tracking-wider flex items-center gap-1"
                        >
                          <Sparkles className="w-2.5 h-2.5 md:w-3.5 md:h-3.5 text-yellow-300" />
                          {c.name || c.nameHindi}
                        </span>
                      ))
                    ) : (
                      <span className="bg-red-600 text-white text-[8px] md:text-xs font-bold px-2 md:px-3 py-[1px] md:py-1 rounded-full shadow uppercase tracking-wider flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5 md:w-3.5 md:h-3.5 text-yellow-300" />
                        {heroNews.categoryName}
                      </span>
                    )}
                    {heroNews.isBreaking && (
                      <span className="bg-amber-400 text-slate-900 text-[8px] md:text-xs font-bold px-[3px] md:px-2.5 py-[1px] md:py-1 rounded-full shadow flex items-center gap-1">
                        <Flame className="w-2.5 h-2.5 md:w-3.5 md:h-3.5 text-red-600 animate-pulse" />
                        Breaking
                      </span>
                    )}
                  </div>

                  {/* Top Right: Slide Counter Badge */}
                  {heroList.length > 1 && (
                    <div className="absolute top-1 md:top-4 right-1 md:right-4 z-10">
                      <span className="bg-slate-950/80 backdrop-blur-sm text-amber-300 text-[8px] md:text-xs font-bold px-2 md:px-2.5 py-[1px] md:py-1 rounded-full shadow border border-slate-700/80 font-mono flex items-center gap-1">
                        {heroIndex + 1}/{heroList.length}
                      </span>
                    </div>
                  )}

                  {/* Prev / Next Navigation Buttons if Multiple Highlights */}
                  {heroList.length > 1 && (
                    <div className="absolute inset-y-0 inset-x-0 md:inset-x-2 flex items-center justify-between pointer-events-none z-10">
                      <button
                        type="button"
                        onClick={() =>
                          setHeroIndex((prev) => (prev - 1 + heroList.length) % heroList.length)
                        }
                        className="p-2 rounded-full bg-slate-950/60 hover:bg-slate-900 text-white pointer-events-auto transition-colors border border-white/10"
                        title="Previous Highlight"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setHeroIndex((prev) => (prev + 1) % heroList.length)}
                        className="p-2 rounded-full bg-slate-950/60 hover:bg-slate-900 text-white pointer-events-auto transition-colors border border-white/10"
                        title="Next Highlight"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Text Overlay on Hero */}
                  <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-7 text-white">
                    <div className="flex items-center gap-4 text-xs text-slate-300 mb-2">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5 text-sky-400" />
                        {heroNews.views || 0} views
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        {new Date(heroNews.publishedAt || heroNews.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-red-400" />
                        {heroNews.location}
                      </span>
                    </div>

                    <Link href={`/news/${heroNews.slug}`}>
                      <h1 className="text-xl sm:text-3xl font-extrabold text-white leading-tight group-hover:text-red-400 transition-colors line-clamp-2 md:line-clamp-2">
                        {heroNews.title}
                      </h1>
                    </Link>

                    {heroNews.subtitle && (
                      <p className="mt-2 text-xs sm:text-sm text-slate-200 line-clamp-2 md:line-clamp-3">
                        {heroNews.subtitle}
                      </p>
                    )}
                  </div>
                </div>

                {/* Slide Indicators / Dots below slide on white background */}
                {heroList.length > 1 && (
                  <div className="bg-white py-2.5 px-4 flex items-center justify-center gap-1.5 border-t border-slate-100">
                    {heroList.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setHeroIndex(i)}
                        className={`h-2 rounded-full transition-all duration-300 ${i === heroIndex % heroList.length
                          ? 'w-6 bg-red-600'
                          : 'w-2 bg-slate-300 hover:bg-slate-400'
                          }`}
                        title={`Go to highlight ${i + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="h-96 rounded-xl bg-slate-200 animate-pulse flex items-center justify-center">
                <span className="text-slate-400 font-medium">Loading headline stories...</span>
              </div>
            )}
          </div>

          {/* Top Stories Sidebar (4 Cols) - Auto-move from top to bottom if > 3 */}
          <div
            onMouseEnter={() => setIsTrendingHovered(true)}
            onMouseLeave={() => setIsTrendingHovered(false)}
            className="lg:col-span-4 flex flex-col justify-between space-y-0"
          >
            <div className="bg-red-700 text-white px-4 py-2.5 rounded-t-lg flex items-center justify-between font-bold text-sm">
              <span className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-300" />
                <span>Top Trending Stories</span>
              </span>

              {totalTrending > 3 && (
                <div className="flex items-center gap-1 text-[11px] text-amber-200">
                  <span className="hidden sm:inline font-mono">
                    {trendingOffset + 1}/{totalTrending}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setTrendingOffset((prev) => (prev - 1 + totalTrending) % totalTrending)
                    }
                    className="p-1 hover:bg-red-800 rounded transition-colors"
                    title="Move Up"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setTrendingOffset((prev) => (prev + 1) % totalTrending)}
                    className="p-1 hover:bg-red-800 rounded transition-colors"
                    title="Move Down (Next)"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            <div className="bg-white rounded-b-lg border border-slate-200 divide-y divide-slate-100 p-2 shadow-sm flex-grow min-h-[350px] relative overflow-hidden">
              {visibleTrending.length > 0 ? (
                visibleTrending.map((item, idx) => (
                  <article
                    key={item._id ? `${item._id}-${trendingOffset}` : idx}
                    className="p-3 group hover:bg-slate-50 transition-all duration-500 animate-fadeIn"
                  >
                    <div className="flex items-center justify-between mb-1 gap-2">
                      <div className="flex flex-wrap gap-1">
                        {Array.isArray(item.categories) && item.categories.length > 0 ? (
                          item.categories.map((c, cIdx) => (
                            <span key={c._id || cIdx} className="text-[10px] font-semibold text-red-600 uppercase tracking-wide">
                              {c.name || c.nameHindi}
                            </span>
                          ))
                        ) : (
                          <span className="text-[11px] font-semibold text-red-600 uppercase tracking-wide">
                            {item.categoryName || item.category?.name || 'Trending'}
                          </span>
                        )}
                      </div>
                      {totalTrending > 3 && (
                        <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded shrink-0">
                          #{(trendingOffset + idx) % totalTrending + 1}
                        </span>
                      )}
                    </div>
                    <Link href={`/news/${item.slug}`}>
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-red-600 transition-colors line-clamp-2 mt-0.5">
                        {item.title}
                      </h3>
                    </Link>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-2">
                      <span>{item.location || 'Bihar'}</span>
                      <span>•</span>
                      <span>
                        {new Date(item.publishedAt || item.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </article>
                ))
              ) : (
                <p className="p-4 text-xs text-slate-400">No stories available.</p>
              )}
            </div>

            {/* Quick Action Banner */}
            <div className="bg-gradient-to-r from-red-600 to-red-800 rounded-lg p-4 text-white shadow-sm flex lg:hidden items-center justify-between mt-4">
              <div>
                <h4 className="font-extrabold text-sm text-white">Join the Organization</h4>
                <p className="text-xs text-red-100">Become an official member or accredited reporter</p>
              </div>
              <Link
                href="/apply-member"
                className="text-xs font-bold bg-white text-red-700 px-3 py-1.5 rounded shadow hover:bg-red-50 transition-colors shrink-0"
              >
                Apply Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Seemanchal Regional News Section */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-4 border-b-2 border-red-600 pb-2">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-red-600 rounded-full"></span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Seemanchal Special (Kishanganj • Purnea • Katihar • Araria)
            </h2>
          </div>
          <Link
            href="/category/seemanchal-special"
            className="text-xs font-bold text-red-600 hover:text-red-800 flex items-center gap-1"
          >
            View All <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {seemanchalNews.length > 0 ? (
            seemanchalNews.map((item, idx) => (
              <div
                key={idx}
                className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col"
              >
                <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                  <img
                    src={getMediaUrl(item.thumbnail, 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&auto=format&fit=crop&q=80')}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = '/logo.jpeg';
                    }}
                  />
                  <span className="absolute bottom-2 left-2 bg-slate-900/80 text-white text-[10px] font-semibold px-2 py-0.5 rounded">
                    {item.location || 'Seemanchal'}
                  </span>
                </div>
                <div className="p-4 flex flex-col flex-grow">
                  <div className="flex flex-wrap gap-1 mb-1">
                    {Array.isArray(item.categories) && item.categories.length > 0 ? (
                      item.categories.map((c, idx) => (
                        <span key={c._id || idx} className="text-[10px] font-bold text-red-600 uppercase bg-red-50 px-1.5 py-0.5 rounded">
                          {c.name || c.nameHindi}
                        </span>
                      ))
                    ) : (
                      <span className="text-[11px] font-bold text-red-600 uppercase">
                        {item.categoryName || 'Seemanchal'}
                      </span>
                    )}
                  </div>
                  <Link href={`/news/${item.slug}`} className="mt-1 flex-grow">
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-red-600 transition-colors line-clamp-2">
                      {item.title}
                    </h3>
                  </Link>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-3 pt-3 border-t border-slate-100">
                    <span>
                      {new Date(item.publishedAt || item.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    <span className="flex items-center gap-1 text-slate-500">
                      <Eye className="w-3 h-3" /> {item.views || 0}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500 col-span-4">No stories found under Seemanchal Special.</p>
          )}
        </div>
      </section>

      {/* 2.5 Video News & Ground Reports Section */}
      <section className="mb-12 bg-slate-950 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded bg-red-600 text-white font-black text-xs animate-pulse">
                EXCLUSIVE
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                Ground Reports & Video Broadcasts
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Field video coverage, citizen testimonies, and live on-the-scene reportage from Seemanchal and Bihar.
            </p>
          </div>

          <Link
            href="/category/seemanchal-special"
            className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
          >
            All Video Coverage <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {latestNews.slice(0, 3).map((item, idx) => (
            <Link
              key={idx}
              href={`/news/${item.slug}`}
              className="group block bg-slate-900 rounded-xl overflow-hidden border border-slate-800 hover:border-slate-700 transition-all shadow-md"
            >
              <div className="relative h-48 w-full bg-slate-800 overflow-hidden">
                <img
                  src={getMediaUrl(item.thumbnail, 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=600&auto=format&fit=crop&q=80')}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/logo.jpeg';
                  }}
                />
                <div className="absolute inset-0 bg-slate-950/40 group-hover:bg-slate-950/20 transition-colors flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                    <div className="w-0 h-0 border-y-[7px] border-y-transparent border-l-[12px] border-l-white ml-1"></div>
                  </div>
                </div>
                <span className="absolute bottom-2 left-2 bg-slate-950/80 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded border border-slate-800">
                  {item.location || 'Field Report'}
                </span>
              </div>
              <div className="p-4">
                <span className="text-[10px] font-bold text-red-500 uppercase tracking-wide">
                  {item.categoryName || 'Broadcast'}
                </span>
                <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-2 mt-1">
                  {item.title}
                </h3>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-3 pt-3 border-t border-slate-800">
                  <span>By {item.authorName || 'Field Reporter'}</span>
                  <span className="flex items-center gap-1 text-slate-400">
                    <Eye className="w-3 h-3 text-sky-400" /> {item.views || 0}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. National & State News + Committee Showcase Grid */}
      <section className="mb-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Latest News Stream (8 cols) */}
        <div className="lg:col-span-8">
          <div className="flex items-center justify-between mb-4 border-b-2 border-slate-900 pb-2">
            <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Newspaper className="w-5 h-5 text-red-600" />
              Latest News & Stories
            </h2>
          </div>

          <div className="space-y-4">
            {latestNews.map((news, idx) => (
              <article
                key={idx}
                className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row gap-4 group"
              >
                <div className="sm:w-48 h-36 rounded-md overflow-hidden bg-slate-100 shrink-0">
                  <img
                    src={getMediaUrl(news.thumbnail, 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=500&auto=format&fit=crop&q=80')}
                    alt={news.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = '/logo.jpeg';
                    }}
                  />
                </div>
                <div className="flex flex-col justify-between flex-grow">
                  <div>
                    <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                      {Array.isArray(news.categories) && news.categories.length > 0 ? (
                        news.categories.map((c, idx) => (
                          <span key={c._id || idx} className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-50 text-red-700">
                            {c.name || c.nameHindi}
                          </span>
                        ))
                      ) : (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-red-50 text-red-700">
                          {news.categoryName || 'News'}
                        </span>
                      )}
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {news.location || 'India'}
                      </span>
                    </div>

                    <Link href={`/news/${news.slug}`}>
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-red-600 transition-colors line-clamp-2">
                        {news.title}
                      </h3>
                    </Link>

                    {news.subtitle && (
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                        {news.subtitle}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 mt-3 pt-2 border-t border-slate-100">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(news.publishedAt || news.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5 text-slate-400" />
                      {news.views || 0}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Right Column: Committee & Portals Info Widget (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Executive Committee Card */}
          <div className="bg-slate-900 text-white rounded-xl p-5 shadow-md border border-slate-800">
            <div className="flex items-center gap-2.5 mb-3 border-b border-slate-800 pb-3">
              <Award className="w-5 h-5 text-amber-400" />
              <h3 className="font-extrabold text-base text-white">Organizational Committees</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Seemanchal Express maintains a democratic six-tier leadership hierarchy spanning National, State, District, Block, Panchayat, and Ward levels.
            </p>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center bg-slate-800/80 px-3 py-2 rounded">
                <span className="font-medium text-slate-200">A. National Executive</span>
                <span className="text-[11px] text-amber-400 font-bold">Apex Leadership</span>
              </div>
              <div className="flex justify-between items-center bg-slate-800/80 px-3 py-2 rounded">
                <span className="font-medium text-slate-200">B. State Executive (Bihar)</span>
                <span className="text-[11px] text-amber-400 font-bold">State Leaders</span>
              </div>
              <div className="flex justify-between items-center bg-slate-800/80 px-3 py-2 rounded">
                <span className="font-medium text-slate-200">C. District Executive (4 Districts)</span>
                <span className="text-[11px] text-amber-400 font-bold">District Chiefs</span>
              </div>
              <div className="flex justify-between items-center bg-slate-800/80 px-3 py-2 rounded">
                <span className="font-medium text-slate-200">D. Block & Panchayat Teams</span>
                <span className="text-[11px] text-amber-400 font-bold">Grassroots</span>
              </div>
            </div>

            <Link
              href="/team"
              className="mt-5 block text-center text-xs font-bold py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-900 transition-colors"
            >
              View Official Team Directory
            </Link>
          </div>

          {/* Digital ID Verification Box */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="font-extrabold text-slate-900 text-sm">Verify Digital Credentials</h4>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Instantly authenticate member and correspondent identity cards issued by the central office.
            </p>
            <Link
              href="/verify"
              className="inline-block w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold transition-colors shadow-sm"
            >
              Online Verification Portal
            </Link>
          </div>

          {/* Official Contact Office Widget */}
          <div className="bg-slate-100 rounded-xl p-5 border border-slate-200 text-xs text-slate-600 space-y-2">
            <h4 className="font-bold text-slate-900 uppercase text-xs">Central Office</h4>
            <p><strong>Address:</strong> F 65, Shaheen Bagh, Okhla, New Delhi-110025</p>
            <p><strong>Phone:</strong> +91 9871023184</p>
            <p><strong>Email:</strong> mail@seemanchalexpress.in</p>
          </div>
        </div>
      </section>
    </div>
  );
}
