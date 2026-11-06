/**
 * Resolves media/image URLs whether they are relative uploads, public assets, or remote URLs.
 */
export function getMediaUrl(url, fallback = '/logo.jpeg') {
  if (!url || typeof url !== 'string') {
    return fallback;
  }

  const cleanUrl = url.trim();
  if (!cleanUrl) return fallback;

  if (cleanUrl.includes('default-avatar')) {
    return '/default-avatar.svg';
  }

  if (cleanUrl.includes('default-news')) {
    return '/logo.jpeg';
  }
  
  // If it's already an absolute URL or a Base64 data URL
  if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://') || cleanUrl.startsWith('data:') || cleanUrl.startsWith('blob:')) {
    return cleanUrl;
  }

  // Next.js public static files (like /logo.jpeg or /default-avatar.svg)
  if (cleanUrl.startsWith('/logo') || cleanUrl.startsWith('/favicon') || cleanUrl.startsWith('/default-avatar')) {
    return cleanUrl;
  }

  // Backend uploads (e.g. /uploads/filename.png)
  const rawApiUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5005/api').trim();
  const backendBase = rawApiUrl.replace(/\/api\/?$/, '');

  if (cleanUrl.startsWith('/uploads')) {
    return `${backendBase}${cleanUrl}`;
  }

  if (cleanUrl.startsWith('/')) {
    return `${backendBase}${cleanUrl}`;
  }

  return `${backendBase}/${cleanUrl}`;
}

export default getMediaUrl;
