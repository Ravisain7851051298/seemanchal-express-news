'use client';

import React, { useState } from 'react';
import { Share2, Check, Loader2 } from 'lucide-react';
import {
  fetchImageFile,
  prepareSharePayload,
  copyToClipboard,
} from '../../lib/share-utils';

/**
 * NewsShareButton Component
 *
 * Single, modern, production-ready share button for news articles.
 * Directly opens native device share (navigator.share) with:
 * - title?: string
 * - text?: string (clean subtitle, never duplicates title)
 * - url?: string (decoded clean URL, no %E0%A4%... percent encoding)
 * - files?: File[] (optional image file)
 *
 * Falls back to 1-click clipboard copy with a smooth tooltip on unsupported desktop browsers.
 */
export default function NewsShareButton({
  title = '',
  text = '',
  url = '',
  imageUrl = '',
  className = '',
}) {
  const [isSharing, setIsSharing] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    if (isSharing) return;

    try {
      setIsSharing(true);

      // 1. Convert image to File if provided
      let imageFile = null;
      if (imageUrl) {
        imageFile = await fetchImageFile(imageUrl, 'seemanchal-news.jpg');
      }

      // 2. Prepare clean share payload
      const payload = prepareSharePayload({
        title,
        subtitle: text,
        url,
        file: imageFile,
      });

      // 3. Trigger native Web Share API
      if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
        try {
          await navigator.share(payload);
          return;
        } catch (shareErr) {
          if (shareErr.name === 'AbortError') {
            // User cancelled native share sheet
            return;
          }
          // If native share fails with files, retry without files
          if (payload.files) {
            delete payload.files;
            try {
              await navigator.share(payload);
              return;
            } catch (retryErr) {
              if (retryErr.name === 'AbortError') return;
            }
          }
        }
      }

      // 4. Fallback for desktop/unsupported browsers: copy clean URL to clipboard
      const shareUrl = payload.url || (typeof window !== 'undefined' ? decodeURI(window.location.href) : '');
      const success = await copyToClipboard(shareUrl);
      if (success) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2200);
      }
    } catch (err) {
      console.warn('Share error:', err);
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onClick={handleShare}
        disabled={isSharing}
        className={`inline-flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 bg-red-600 hover:bg-red-700 active:scale-95 text-white text-xs font-bold rounded-lg shadow-sm transition-all duration-150 disabled:opacity-75 ${className}`}
        title="Share News"
        aria-label="Share News"
      >
        {isSharing ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : copied ? (
          <Check className="w-3.5 h-3.5 text-white" />
        ) : (
          <Share2 className="w-3.5 h-3.5" />
        )}
        <span>{isSharing ? 'Sharing...' : copied ? 'Link Copied!' : 'Share'}</span>
      </button>

      {/* Floating feedback tooltip for desktop copy */}
      {copied && (
        <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-md whitespace-nowrap animate-fade-in border border-slate-700">
          Link copied!
        </span>
      )}
    </div>
  );
}
