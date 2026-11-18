const DEFAULT_CDN = 'https://phimimg.com';

export function getImageUrl(path: string | null | undefined, customCdn?: string): string {
  if (!path) {
    return 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=60';
  }

  // Already full URL
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  const cdn = customCdn || DEFAULT_CDN;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${cdn}${cleanPath}`;
}

export function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '00:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}
