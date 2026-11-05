/**
 * share-utils.js
 * Clean, lightweight utilities for Web Share API (title, text, url, files)
 * and URL decoding to avoid duplicate titles and percent-encoded Hindi characters.
 */

/**
 * Safely fetches an image and converts it into a File object for navigator.share({ files: [...] })
 *
 * @param {string} imageUrl
 * @param {string} [fileName='news-thumbnail.jpg']
 * @returns {Promise<File|null>}
 */
export async function fetchImageFile(imageUrl, fileName = 'news-thumbnail.jpg') {
  if (!imageUrl || typeof window === 'undefined') return null;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(imageUrl, {
      mode: 'cors',
      cache: 'default',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) return null;

    const blob = await res.blob();
    if (!blob || !blob.type.startsWith('image/')) return null;

    const ext = blob.type === 'image/png' ? '.png' : blob.type === 'image/webp' ? '.webp' : '.jpg';
    const finalName = fileName.includes('.') ? fileName : `${fileName}${ext}`;

    return new File([blob], finalName, {
      type: blob.type,
      lastModified: Date.now(),
    });
  } catch (err) {
    return null;
  }
}

/**
 * Checks if the browser supports sharing files via navigator.canShare
 *
 * @param {File} file
 * @returns {boolean}
 */
export function canShareFiles(file) {
  if (
    typeof navigator === 'undefined' ||
    typeof navigator.canShare !== 'function' ||
    !file
  ) {
    return false;
  }

  try {
    return navigator.canShare({ files: [file] });
  } catch (err) {
    return false;
  }
}

/**
 * Prepares a clean Web Share payload:
 * - title: Clean headline
 * - text: Subtitle ONLY if present and different from title (never duplicates title)
 * - url: Clean decoded URL (so Hindi characters are readable, not %E0%A4%...)
 * - files: Optional File array if supported
 *
 * @param {Object} params
 * @param {string} params.title
 * @param {string} [params.subtitle]
 * @param {string} [params.url]
 * @param {File} [params.file]
 * @returns {Object} Clean payload for navigator.share
 */
export function prepareSharePayload({ title = '', subtitle = '', url = '', file = null }) {
  const cleanTitle = (title || '').trim();
  const rawSubtitle = (subtitle || '').trim();

  // If subtitle is absent or same as title, do NOT pass text to prevent double title in WhatsApp
  const cleanText = rawSubtitle && rawSubtitle !== cleanTitle ? rawSubtitle : '';

  // Decode URI so Hindi/Devanagari characters show cleanly instead of %E0%A4%...
  let cleanUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  try {
    cleanUrl = decodeURI(cleanUrl);
  } catch (e) {
    // ignore
  }

  const payload = {
    title: cleanTitle,
    url: cleanUrl,
  };

  if (cleanText) {
    payload.text = cleanText;
  }

  if (file && canShareFiles(file)) {
    payload.files = [file];
  }

  return payload;
}

/**
 * Copies plain text to clipboard
 *
 * @param {string} text
 * @returns {Promise<boolean>}
 */
export async function copyToClipboard(text) {
  if (typeof window === 'undefined' || !text) return false;

  let cleanText = text;
  try {
    cleanText = decodeURI(text);
  } catch (e) {
    // fallback
  }

  if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    try {
      await navigator.clipboard.writeText(cleanText);
      return true;
    } catch (err) {}
  }

  try {
    const textArea = document.createElement('textarea');
    textArea.value = cleanText;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    return false;
  }
}
