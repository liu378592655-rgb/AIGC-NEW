
export const isVideo = (url: string) => {
  if (!url) return false;
  return url.toLowerCase().endsWith('.mp4') || url.toLowerCase().endsWith('.webm');
};

export const getOptimizedUrl = (url: string, width: number = 800) => {
  if (!url) return '';
  if (isVideo(url)) return url;
  
  // Skip optimization for already optimized URLs, local paths, data URLs, or github URLs
  if (url.includes('images.weserv.nl') || !url.startsWith('http') || url.startsWith('data:') || url.includes('github.com') || url.includes('githubusercontent.com')) {
    return url;
  }
  
  // Add errorredirect=ssl to fallback to original image if optimization fails
  return `https://images.weserv.nl/?url=${encodeURIComponent(url)}&w=${width}&q=80&output=webp&errorredirect=ssl`;
};
