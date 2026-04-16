export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / 1024 / 1024).toFixed(1)} MB`;
  return `${(n / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

// Urbit @da format: ~2026.4.15..19.16.25..9c77
export function formatDate(da: string): string {
  const m = da.match(/^~(\d+)\.(\d+)\.(\d+)\.\.(\d+)\.(\d+)/);
  if (!m) return da;
  const [, y, mo, d, h, mi] = m;
  const now = new Date();
  const dt = new Date(Number(y), Number(mo) - 1, Number(d), Number(h), Number(mi));
  const sameDay = dt.toDateString() === now.toDateString();
  if (sameDay) return dt.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  const sameYear = dt.getFullYear() === now.getFullYear();
  return dt.toLocaleDateString([], sameYear
    ? { month: 'short', day: 'numeric' }
    : { month: 'short', day: 'numeric', year: 'numeric' });
}

export function fileIcon(mark: string): string {
  const m = mark.toLowerCase();
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(m)) return '🖼';
  if (['mp4', 'mov', 'webm', 'mkv'].includes(m)) return '🎬';
  if (['mp3', 'wav', 'ogg', 'flac'].includes(m)) return '🎵';
  if (['pdf'].includes(m)) return '📕';
  if (['txt', 'md', 'json', 'yaml', 'yml', 'toml', 'csv'].includes(m)) return '📄';
  if (['zip', 'tar', 'gz', '7z'].includes(m)) return '🗜';
  return '📦';
}
