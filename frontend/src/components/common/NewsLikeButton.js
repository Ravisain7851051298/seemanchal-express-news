'use client';

import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import api from '../../lib/api';

/**
 * NewsLikeButton Component
 *
 * Interactive Like / Unlike button for news stories.
 * Features:
 * - Optimistic UI updates with instant heart animation
 * - LocalStorage state preservation so visitors don't re-like the same story on page refresh
 * - Backend database sync with live like counts
 */
export default function NewsLikeButton({
  newsId = '',
  initialLikes = 0,
  className = '',
}) {
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [animate, setAnimate] = useState(false);

  // Initialize client identifier and liked state on mount
  useEffect(() => {
    if (typeof window === 'undefined' || !newsId) return;

    try {
      const storedLiked = localStorage.getItem(`liked_news_${newsId}`);
      if (storedLiked === 'true') {
        setIsLiked(true);
      }
    } catch (e) { }
  }, [newsId]);

  // Synchronize initialLikes when news data is loaded
  useEffect(() => {
    if (typeof initialLikes === 'number') {
      setLikes(initialLikes);
    }
  }, [initialLikes]);

  const handleToggleLike = async () => {
    if (!newsId || loading) return;

    // Trigger pop animation
    setAnimate(true);
    setTimeout(() => setAnimate(false), 300);

    // Optimistic toggle
    const nextLiked = !isLiked;
    const nextCount = nextLiked ? likes + 1 : Math.max(0, likes - 1);
    setIsLiked(nextLiked);
    setLikes(nextCount);

    try {
      if (typeof window !== 'undefined') {
        if (nextLiked) {
          localStorage.setItem(`liked_news_${newsId}`, 'true');
        } else {
          localStorage.removeItem(`liked_news_${newsId}`);
        }
      }
    } catch (e) { }

    // Get or generate anonymous client ID
    let clientId = 'anon';
    try {
      clientId = localStorage.getItem('seemanchal_client_id');
      if (!clientId) {
        clientId = 'client_' + Math.random().toString(36).substring(2, 12);
        localStorage.setItem('seemanchal_client_id', clientId);
      }
    } catch (e) { }

    try {
      setLoading(true);
      const res = await api.post(`/news/${newsId}/like`, { clientId });
      if (res.data?.success) {
        setLikes(res.data.likes ?? nextCount);
        setIsLiked(res.data.isLiked ?? nextLiked);
      }
    } catch (err) {
      console.warn('Like failed to sync with server:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggleLike}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs font-bold transition-all active:scale-95 ${isLiked
        ? 'text-red-600'
        : 'text-slate-700'
        } ${className}`}
      title={isLiked ? 'Unlike this news' : 'Like this news'}
      aria-label={isLiked ? 'Unlike this news' : 'Like this news'}
    >
      <Heart
        className={`w-4 h-4 transition-all duration-200 ${isLiked
          ? 'fill-red-600 text-red-600'
          : 'text-slate-500 hover:text-red-500'
          } ${animate ? 'scale-125' : 'scale-100'}`}
      />
      <span>{likes}</span>
      <span className="hidden sm:inline font-medium text-[11px] text-slate-500">
        {likes === 1 ? 'Like' : 'Likes'}
      </span>
    </button>
  );
}

