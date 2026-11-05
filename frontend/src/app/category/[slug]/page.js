'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Calendar,
  Clock,
  MapPin,
  Eye,
  ChevronRight,
} from 'lucide-react';
import api from '../../../lib/api';

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug;
  const [newsList, setNewsList] = useState([]);
  const [categoryName, setCategoryName] = useState(slug);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategoryNews = async () => {
      try {
        const [newsRes, catRes] = await Promise.allSettled([
          api.get(`/news?category=${slug}&limit=20`),
          api.get('/categories'),
        ]);

        if (catRes.status === 'fulfilled' && catRes.value.data?.success) {
          const matched = catRes.value.data.categories.find((c) => c.slug === slug);
          if (matched) setCategoryName(matched.name);
        }

        if (newsRes.status === 'fulfilled' && newsRes.value.data?.success) {
          setNewsList(newsRes.value.data.news || []);
        }
      } catch (err) {
        console.error('Failed to load category news:', err);
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchCategoryNews();
  }, [slug]);

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
          <Link href="/" className="hover:text-red-600">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-800 font-bold uppercase">{slug}</span>
        </div>

        {/* Header */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-red-600 uppercase tracking-widest">
              Category
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 capitalize">
              {categoryName}
            </h1>
          </div>
          <div className="text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
            Articles Count: <strong>{newsList.length}</strong>
          </div>
        </div>

        {/* News Grid */}
        {loading ? (
          <div className="text-center py-16">
            <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm text-slate-500">Loading category stories...</p>
          </div>
        ) : newsList.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {newsList.map((item, idx) => (
              <article
                key={idx}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col"
              >
                <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                  <img
                    src={item.thumbnail || '/uploads/default-news.jpg'}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute bottom-2 left-2 bg-slate-900/80 text-white text-[10px] font-semibold px-2 py-0.5 rounded">
                    {item.location || 'Seemanchal'}
                  </span>
                </div>
                <div className="p-5 flex flex-col flex-grow">
                  <div className="flex flex-wrap gap-1 mb-1.5">
                    {Array.isArray(item.categories) && item.categories.length > 0 ? (
                      item.categories.map((c, idx) => (
                        <span key={c._id || idx} className="text-[10px] font-bold text-red-600 uppercase bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">
                          {c.name || c.nameHindi}
                        </span>
                      ))
                    ) : (
                      <span className="text-[11px] font-bold text-red-600 uppercase">
                        {item.categoryName || categoryName}
                      </span>
                    )}
                  </div>
                  <Link href={`/news/${item.slug}`} className="flex-grow">
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-red-600 transition-colors line-clamp-2">
                      {item.title}
                    </h3>
                  </Link>
                  {item.subtitle && (
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                      {item.subtitle}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-xs text-slate-400 mt-4 pt-3 border-t border-slate-100">
                    <span>
                      {new Date(item.publishedAt || item.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" /> {item.views || 0}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl p-12 text-center border border-slate-200">
            <p className="text-base font-medium text-slate-700">No stories available in this category currently.</p>
            <Link
              href="/"
              className="mt-4 inline-block text-xs font-bold px-4 py-2 bg-red-600 text-white rounded shadow hover:bg-red-700"
            >
              Browse Homepage
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
