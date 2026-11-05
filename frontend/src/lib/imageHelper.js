/**
 * Resolves media/image URLs whether they are relative uploads, public assets, or remote URLs.
 */
export function getMediaUrl(url, fallback = '/default-avatar.svg') {
  if (!url || url === '/uploads/default-avatar.png' || url === 'default-avatar.png' || url === '/default-avatar.png') {
    return fallback;
  }
  
  // If it's already an absolute URL or a Base64 data URL
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }

  // Next.js public static files (like /logo.jpeg)
  if (url.startsWith('/logo') || url.startsWith('/favicon')) {
    return url;
  }

  // Backend uploads (e.g. /uploads/filename.png)
  const backendBase = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5005';
  if (url.startsWith('/uploads')) {
    return `${backendBase}${url}`;
  }

  if (url.startsWith('/')) {
    return `${backendBase}${url}`;
  }

  return `${backendBase}/${url}`;
}

export default getMediaUrl;
