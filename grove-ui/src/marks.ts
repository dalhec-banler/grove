import { IMAGE_MARKS } from './format';

export function category(mark: string): string {
  const m = mark.toLowerCase();
  if (IMAGE_MARKS.has(m)) return 'image';
  if (['mp4', 'mov', 'webm', 'mkv', 'avi'].includes(m)) return 'video';
  if (['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a'].includes(m)) return 'audio';
  if (m === 'pdf') return 'pdf';
  if (['txt', 'md', 'json', 'yaml', 'yml', 'toml', 'csv', 'xml', 'html', 'css', 'js', 'ts', 'hoon'].includes(m)) return 'text';
  if (['zip', 'tar', 'gz', '7z', 'rar', 'bz2'].includes(m)) return 'archive';
  return 'default';
}
