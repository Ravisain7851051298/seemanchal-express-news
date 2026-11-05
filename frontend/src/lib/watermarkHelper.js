/**
 * watermarkHelper.js
 * Utility to stamp official 'सीमांचल एक्सप्रेस / Seemanchal Express' watermark
 * onto images using HTML5 Canvas before uploading, and provide watermark overlay for videos.
 */

export async function applyWatermarkToImage(file) {
  if (!file || !file.type.startsWith('image/')) {
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

          // 2. Compute responsive watermark badge sizing
          const baseScale = Math.max(width, height) / 1000;
          const scale = Math.min(Math.max(baseScale, 0.7), 2.5);

          const badgeWidth = Math.round(280 * scale);
          const badgeHeight = Math.round(62 * scale);
          const margin = Math.round(24 * scale);

          const x = width - badgeWidth - margin;
          const y = height - badgeHeight - margin;
          const radius = Math.round(10 * scale);

          // 3. Draw Watermark Badge Background (Dark Glassmorphism)
          ctx.save();
          ctx.fillStyle = 'rgba(15, 23, 42, 0.88)'; // slate-900 with high opacity
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.7)'; // red-500 border
          ctx.lineWidth = Math.max(2, Math.round(2 * scale));

          ctx.beginPath();
          ctx.roundRect(x, y, badgeWidth, badgeHeight, radius);
          ctx.fill();
          ctx.stroke();

          // 4. Draw Red Glowing Dot / Emblem
          const dotRadius = Math.round(7 * scale);
          const dotX = x + Math.round(20 * scale);
          const dotY = y + badgeHeight / 2;

          ctx.beginPath();
          ctx.arc(dotX, dotY, dotRadius, 0, Math.PI * 2);
          ctx.fillStyle = '#dc2626'; // Red-600
          ctx.fill();

          ctx.beginPath();
          ctx.arc(dotX, dotY, dotRadius + Math.round(3 * scale), 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
          ctx.lineWidth = Math.max(1, Math.round(1.5 * scale));
          ctx.stroke();

          // 5. Draw Primary Brand Name (Hindi: सीमांचल एक्सप्रेस)
          const textStartX = dotX + Math.round(16 * scale);
          const fontSizeHindi = Math.round(17 * scale);
          ctx.font = `bold ${fontSizeHindi}px "Noto Sans Devanagari", "Segoe UI", Arial, sans-serif`;
          ctx.fillStyle = '#ffffff';
          ctx.textBaseline = 'middle';
          ctx.fillText('सीमांचल एक्सप्रेस', textStartX, y + Math.round(23 * scale));

          // 6. Draw Subtitle (English: SEEMANCHAL EXPRESS • VERIFIED)
          const fontSizeEn = Math.round(9 * scale);
          ctx.font = `bold ${fontSizeEn}px "Segoe UI", Roboto, sans-serif`;
          ctx.fillStyle = '#f87171'; // red-400
          ctx.letterSpacing = '1px';
          ctx.fillText('SEEMANCHAL EXPRESS • NEWS', textStartX, y + Math.round(44 * scale));

          ctx.restore();

          // 7. Export watermarked canvas to File
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
          resolve(file); // fallback safely to original file
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
 * Watermark Badge Component for Video Overlay
 */
export function VideoWatermarkBadge({ className = '' }) {
  return (
    <div
      className={`absolute bottom-3 right-3 z-20 pointer-events-none select-none flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950/85 backdrop-blur-md border border-red-500/60 shadow-2xl text-white ${className}`}
    >
      <div className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse shrink-0 ring-2 ring-red-500/40" />
      <div className="flex flex-col text-left leading-tight">
        <span className="font-black text-xs text-white tracking-wide">
          सीमांचल एक्सप्रेस
        </span>
        <span className="text-[9px] font-bold tracking-wider text-red-400 uppercase">
          SEEMANCHAL EXPRESS
        </span>
      </div>
    </div>
  );
}

export default applyWatermarkToImage;

