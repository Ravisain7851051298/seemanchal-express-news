'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Calendar,
  MapPin,
  Eye,
  Heart,
  ChevronRight,
  ArrowLeft,
  ChevronDown,
  UserCheck,
  ShieldCheck,
} from 'lucide-react';
import api from '../../../lib/api';
import getMediaUrl from '../../../lib/imageHelper';
import MarkdownView from '../../../components/common/MarkdownView';
import NewsShareButton from '../../../components/common/NewsShareButton';
import NewsLikeButton from '../../../components/common/NewsLikeButton';
import { VideoWatermarkBadge } from '../../../lib/watermarkHelper';

export default function SingleNewsPage() {
  const params = useParams();
  const slug = params.slug;
  const [news, setNews] = useState(null);
  const [relatedNews, setRelatedNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthorOpen, setIsAuthorOpen] = useState(false);
  const [watermarkLogo, setWatermarkLogo] = useState('');

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const [newsRes, settingsRes] = await Promise.allSettled([
          api.get(`/news/${slug}`),
          api.get('/settings'),
        ]);

        if (newsRes.status === 'fulfilled' && newsRes.value.data?.success) {
          setNews(newsRes.value.data.news);
          setRelatedNews(newsRes.value.data.relatedNews || []);
        }
        if (settingsRes.status === 'fulfilled' && settingsRes.value.data?.settings) {
          setWatermarkLogo(settingsRes.value.data.settings.credentials?.watermarkLogo || '');
        }
      } catch (err) {
        console.error('Failed to load article:', err);
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchArticle();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-sm text-slate-500">Loading article...</p>
      </div>
    );
  }

  if (!news) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Article Not Found</h2>
        <p className="text-sm text-slate-500 mb-6">The requested news story could not be found or has been moved.</p>
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-xs font-bold px-4 py-2 bg-red-600 text-white rounded shadow hover:bg-red-700"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Breadcrumb */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mb-4">
          <Link href="/" className="hover:text-red-600">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          {Array.isArray(news.categories) && news.categories.filter((c) => c && (c.name || c.nameHindi || typeof c === 'object')).length > 0 ? (
            news.categories
              .filter((c) => c && (c.name || c.nameHindi || typeof c === 'object'))
              .map((c, idx) => {
                const label = c.name || c.nameHindi || news.categoryName || 'News';
                const slugUrl = c.slug || 'all';
                return (
                  <span key={c._id || idx} className="flex items-center gap-2">
                    <Link href={`/category/${slugUrl}`} className="hover:text-red-600 font-semibold">
                      {label}
                    </Link>
                    {idx < news.categories.length - 1 && <span className="text-slate-400">/</span>}
                  </span>
                );
              })
          ) : (
            <Link href={`/category/${news.category?.slug || 'all'}`} className="hover:text-red-600 font-semibold">
              {news.category?.name || news.categoryName || 'News'}
            </Link>
          )}
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-800 truncate max-w-xs">{news.title}</span>
        </div>

        {/* Main Article Container */}
        <article className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden p-3 sm:p-4 mb-3">
          {/* Category & Location Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {Array.isArray(news.categories) && news.categories.filter((c) => c && (c.name || c.nameHindi || typeof c === 'object')).length > 0 ? (
              news.categories
                .filter((c) => c && (c.name || c.nameHindi || typeof c === 'object'))
                .map((c, idx) => {
                  const label = c.name || c.nameHindi || news.categoryName || 'News';
                  const slugUrl = c.slug || 'all';
                  return (
                    <Link
                      key={c._id || idx}
                      href={`/category/${slugUrl}`}
                      className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-1 rounded uppercase tracking-wider transition-colors shadow-sm"
                    >
                      {label}
                    </Link>
                  );
                })
            ) : (
              <Link
                href={`/category/${news.category?.slug || 'all'}`}
                className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-1 rounded uppercase tracking-wider transition-colors shadow-sm"
              >
                {news.category?.name || news.categoryName || 'Special'}
              </Link>
            )}
            <span className="bg-slate-100 text-slate-700 text-xs font-semibold px-2.5 py-1 rounded flex items-center gap-1 border border-slate-200">
              <MapPin className="w-3.5 h-3.5 text-red-500" />
              {news.location || 'Seemanchal'}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 leading-tight mb-4">
            {news.title}
          </h1>

          {/* Subtitle if present */}
          {news.subtitle && (
            <p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed mb-6 border-l-4 border-red-600 pl-4 py-0.5">
              {news.subtitle}
            </p>
          )}

          {/* Author & Meta bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 py-3.5 border-y border-slate-200 text-xs text-slate-500 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-200 border border-slate-300">
                <img
                  src={getMediaUrl(news.author?.photo)}
                  alt={news.authorName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <span className="font-bold text-slate-800 text-sm block">
                  {news.authorName || 'Seemanchal Express Bureau'}
                </span>
                <span className="text-[11px] text-red-600">
                  {news.author?.assignedDesignation || 'Accredited Journalist'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {new Date(news.publishedAt || news.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-sky-500" />
                {news.views || 0} views
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-rose-600 font-semibold">
                <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                {news.likes || 0} likes
              </span>
            </div>
          </div>

          {/* Main Media: Video Player or Featured Cover Image */}
          {news.videoUrl ? (
            <div className="rounded-xl overflow-hidden mb-8 border border-slate-200 bg-black aspect-video relative shadow-lg">
              {news.videoUrl.includes('youtube.com') || news.videoUrl.includes('youtu.be') ? (
                <iframe
                  src={
                    news.videoUrl.includes('watch?v=')
                      ? news.videoUrl.replace('watch?v=', 'embed/').split('&')[0]
                      : news.videoUrl.includes('youtu.be/')
                        ? news.videoUrl.replace('youtu.be/', 'www.youtube.com/embed/')
                        : news.videoUrl
                  }
                  title={news.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                ></iframe>
              ) : (
                <video
                  src={getMediaUrl(news.videoUrl)}
                  controls
                  poster={getMediaUrl(news.thumbnail)}
                  className="w-full h-full object-contain"
                >
                  Your browser does not support HTML5 video.
                </video>
              )}
              {/* Official News Watermark Badge on Video on TOP RIGHT (if enabled) */}
              {(news.watermarkVideo || news.hasWatermark) && (
                <VideoWatermarkBadge className="top-3 right-3" watermarkLogo={watermarkLogo} />
              )}
            </div>
          ) : news.thumbnail ? (
            <div className="rounded-xl overflow-hidden mb-8 border border-slate-200 bg-slate-100 relative shadow-sm max-h-[500px]">
              <img
                src={getMediaUrl(news.thumbnail)}
                alt={news.title}
                className="w-full h-full object-cover max-h-[500px]"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/logo.jpeg';
                }}
              />
            </div>
          ) : null}

          {/* Article Body Content (Markdown Supported) */}
          <div className="mb-8">
            <MarkdownView content={news.content} />
          </div>

          {/* Tags */}
          {news.tags && news.tags.length > 0 && (
            <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center gap-2 mb-6">
              <span className="text-xs font-bold text-slate-400">Tags:</span>
              {news.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full border border-slate-200"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* News Engagement Section: Like, Unlike & Direct Native Share */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <NewsLikeButton newsId={news._id} initialLikes={news.likes || 0} />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700 hidden sm:inline">Share this story:</span>
              <NewsShareButton
                title={news.title}
                text={news.subtitle && news.subtitle.trim() !== news.title.trim() ? news.subtitle : ''}
                imageUrl={news.thumbnail ? getMediaUrl(news.thumbnail) : ''}
              />
            </div>
          </div>

          {/* Collapsible Published Author Profile & Bio (Initially Closed) */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsAuthorOpen(!isAuthorOpen)}
              className="w-full flex items-center justify-between p-3.5 sm:p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/80 transition-all text-left shadow-sm group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-red-500 bg-white shrink-0 shadow-sm">
                  <img
                    src={getMediaUrl(news.author?.photo)}
                    alt={news.authorName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-red-600 transition-colors">
                      {news.authorName || 'Seemanchal Express Bureau'}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 uppercase">
                      {news.author?.assignedDesignation || 'Accredited Journalist'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                    <UserCheck className="w-3 h-3 text-emerald-600" />
                    <span>Filed & Published By • Click to {isAuthorOpen ? 'collapse' : 'view author credentials & bio'}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 text-xs font-semibold text-red-600 shrink-0">
                <span className="hidden sm:inline">{isAuthorOpen ? 'Hide Dossier' : 'View Dossier'}</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-300 ${isAuthorOpen ? 'rotate-180' : ''}`}
                />
              </div>
            </button>

            {/* Collapsible Content */}
            {isAuthorOpen && (
              <div className="mt-3 p-5 bg-white rounded-xl border border-slate-200 shadow-sm animate-fadeIn">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                  <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-red-500 shrink-0 bg-slate-50 shadow">
                    <img
                      src={getMediaUrl(news.author?.photo)}
                      alt={news.authorName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1.5">
                      <h5 className="font-extrabold text-slate-900 text-base">{news.authorName}</h5>
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-red-600 text-white uppercase shadow-sm">
                        {news.author?.assignedDesignation || 'Field Journalist'}
                      </span>
                      {news.author?.idCardNumber && (
                        <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                          ID: {news.author.idCardNumber}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-slate-500 mb-3">
                      <span className="flex items-center gap-1 text-emerald-600 font-medium">
                        <ShieldCheck className="w-3.5 h-3.5" /> Verified Editorial Contributor
                      </span>
                      <span>•</span>
                      <span>Jurisdiction: {news.location || 'Seemanchal Region'}</span>
                    </div>

                    {news.author?.bio ? (
                      <div className="text-xs text-slate-700 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                        <MarkdownView content={news.author.bio} />
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 italic bg-slate-50 p-3 rounded-lg border border-slate-200">
                        Accredited correspondent covering regional developments, politics, and social issues for Seemanchal Express.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </article>

        {/* Related News Section */}
        {relatedNews.length > 0 && (
          <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-black text-slate-900 border-l-4 border-red-600 pl-3 mb-5">
              Related Stories
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {relatedNews.map((rel, idx) => (
                <Link
                  key={idx}
                  href={`/news/${rel.slug}`}
                  className="group block bg-slate-50 rounded-lg border border-slate-200 overflow-hidden hover:border-red-400 transition-all"
                >
                  <div className="h-32 bg-slate-200 overflow-hidden">
                    <img
                      src={getMediaUrl(rel.thumbnail, '/logo.jpeg')}
                      alt={rel.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="p-3">
                    <h4 className="text-xs font-bold text-slate-800 group-hover:text-red-600 line-clamp-2">
                      {rel.title}
                    </h4>
                    <span className="text-[10px] text-slate-400 mt-2 block">
                      {new Date(rel.publishedAt).toLocaleDateString('en-US')}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
