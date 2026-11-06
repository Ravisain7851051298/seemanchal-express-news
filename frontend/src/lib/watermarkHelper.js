/**
 * watermarkHelper.js
 * Utility to stamp official watermark onto images using HTML5 Canvas (positioned on LEFT, pure image only - no text/box),
 * and provide video watermark (positioned on RIGHT, pure image only - no text/box).
 */

import React, { useState, useEffect } from 'react';
import api from './api';
import getMediaUrl from './imageHelper';

let cachedWatermarkUrl = null;

export async function getWatermarkUrl() {
  if (cachedWatermarkUrl) return cachedWatermarkUrl;
  try {
    const res = await api.get('/settings');
    if (res.data?.success && res.data?.settings?.credentials?.watermarkLogo) {
      cachedWatermarkUrl = res.data.settings.credentials.watermarkLogo;
      return cachedWatermarkUrl;
    }
  } catch (_) {}
  return '';
}

async function loadImage(src) {
  if (!src) return null;
  try {
    const res = await fetch(src, { mode: 'cors' });
    if (res.ok) {
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = blobUrl;
      });
    }
  } catch (_) {}

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

export async function applyWatermarkToImage(file, watermarkLogoUrl = '') {
  if (!file || !file.type.startsWith('image/')) {
    return file;
  }

  // Retrieve official watermark from settings if not explicitly passed
  const logoSource = watermarkLogoUrl || (await getWatermarkUrl()) || '';
  let logoImg = null;
  if (logoSource) {
    try {
      logoImg = await loadImage(getMediaUrl(logoSource));
    } catch (_) {
      logoImg = null;
    }
  }

  // If no watermark image could be loaded, return original file without fake box/text
  if (!logoImg || !logoImg.width || !logoImg.height) {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          const width = img.naturalWidth || img.width;
          const height = img.naturalHeight || img.height;

          canvas.width = width;
          canvas.height = height;

          // 1. Draw base original image
          ctx.drawImage(img, 0, 0, width, height);

          // 2. Compute responsive sizing for the watermark logo image on the TOP-LEFT
          const targetWidth = Math.round(Math.min(Math.max(width * 0.24, 120), 450));
          const logoAspect = logoImg.width / logoImg.height;
          const targetHeight = Math.round(targetWidth / logoAspect);

          const margin = Math.round(Math.max(width * 0.025, 16));
          const x = margin;
          const y = margin;

          // 3. Draw ONLY the watermark image (NO background box, NO border, NO text)
          ctx.save();
          ctx.shadowColor = 'rgba(0, 0, 0, 0.75)';
          ctx.shadowBlur = Math.round(targetWidth * 0.04);
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = Math.round(targetWidth * 0.02);

          ctx.drawImage(logoImg, x, y, targetWidth, targetHeight);
          ctx.restore();

          // 4. Export watermarked canvas to File
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                resolve(file);
                return;
              }
              const watermarkedFile = new File([blob], file.name, {
                type: file.type || 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(watermarkedFile);
            },
            file.type === 'image/png' ? 'image/png' : 'image/jpeg',
            0.92
          );
        } catch (err) {
          console.error('Failed to apply watermark to canvas:', err);
          resolve(file);
        }
      };

      img.onerror = () => resolve(file);
      img.src = e.target.result;
    };

    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}

/**
 * Watermark Badge Component for Video Overlay (Positioned at TOP RIGHT, Pure Image Only - NO background, NO text)
 */
export function VideoWatermarkBadge({ className = '', watermarkLogo = '' }) {
  const [logoUrl, setLogoUrl] = useState(watermarkLogo ? getMediaUrl(watermarkLogo) : '');

  useEffect(() => {
    if (watermarkLogo) {
      setLogoUrl(getMediaUrl(watermarkLogo));
      return;
    }
    getWatermarkUrl().then((url) => {
      if (url) setLogoUrl(getMediaUrl(url));
    });
  }, [watermarkLogo]);

  if (!logoUrl) return null;

  return (
    <div
      className={`absolute top-3 right-3 z-20 pointer-events-none select-none ${className}`}
    >
      <img
        src={logoUrl}
        alt="Watermark"
        className="h-8 sm:h-10 md:h-12 w-auto object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)] filter"
        onError={(e) => {
          e.currentTarget.style.display = 'none';
        }}
      />
    </div>
  );
}

export default applyWatermarkToImage;

